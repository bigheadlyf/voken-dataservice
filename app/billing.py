"""Quotes, immutable unpaid orders, ledger fulfillment and finite membership grants.

No browser endpoint can mark an order paid. Actual merchant checkout remains disabled until configured.
"""
import calendar
from datetime import timedelta
from hashlib import sha256
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, or_, select
from app import workspaces as ws
from app.crm import iso
from app.db import BillingOrder, Membership, PointEntry, Wallet, Workspace, utcnow, write_transaction

router=APIRouter(prefix='/api/v1/workspaces/{workspace_id}/billing',tags=['billing'])
PLANS={
    'points_1000':{'name':'1,000 点','list_fen':1000,'points_now':1000,'periods':0,'monthly_points':0},
    'points_5000':{'name':'5,000 点','list_fen':5000,'points_now':5000,'periods':0,'monthly_points':0},
    'points_10000':{'name':'10,000 点','list_fen':10000,'points_now':10000,'periods':0,'monthly_points':0},
    'svip_monthly':{'name':'SVIP 包月','list_fen':29900,'points_now':0,'periods':1,'monthly_points':3000},
    'svip_annual':{'name':'SVIP 包年','list_fen':99900,'points_now':10000,'periods':12,'monthly_points':3000},
}


def add_months(value,months):
    year,month=divmod(value.year*12+value.month-1+months,12)
    return value.replace(year=year,month=month+1,day=min(value.day,calendar.monthrange(year,month+1)[1]))


def price(session,workspace,plan_id):
    if plan_id not in PLANS:raise HTTPException(422,'billing_plan_not_found')
    item=PLANS[plan_id]
    paid=session.scalar(select(func.count()).select_from(BillingOrder).where(
        BillingOrder.workspace_id==workspace,BillingOrder.status=='paid'))
    pending=session.scalar(select(func.count()).select_from(BillingOrder).where(
        BillingOrder.workspace_id==workspace,BillingOrder.status=='awaiting_payment',
        or_(BillingOrder.expires_at>utcnow(),BillingOrder.payment.is_not(None)),BillingOrder.plan_id=='svip_annual'))
    discount=5000 if plan_id=='svip_monthly' else 60000 if plan_id=='svip_annual' and not paid and not pending else 0
    return {'plan_id':plan_id,**item,'discount_fen':discount,'total_fen':item['list_fen']-discount,
        'coupon':'首次充值年费优惠' if plan_id=='svip_annual' and discount else None,
        'total_points':item['points_now']+item['periods']*item['monthly_points'],
        'auto_renew':False,'currency':'CNY'}


class PlanView(BaseModel):
    plan_id: str
    name: str
    list_fen: int
    discount_fen: int
    total_fen: int
    points_now: int
    periods: int
    monthly_points: int
    total_points: int
    coupon: str|None
    auto_renew: bool
    currency: str


class CatalogView(BaseModel):
    plans: list[PlanView]
    checkout_available: bool=False
    payment_mode: str='unconfigured'
    note: str='尚未配置商户收款。创建订单不会扣款或到账；没有客户端模拟支付入口。'


@router.get('/plans',response_model=CatalogView)
def catalog(request: Request,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """服务端计算套餐与首次年费优惠；立即到账与每月手动领取分开显示，不自动续费。"""
    with sessions() as session:
        result={'plans':[price(session,workspace,key) for key in PLANS]}
    if request.app.state.settings.wechat_enabled:
        result.update(checkout_available=True,payment_mode='wechat_native',
            note='微信 Native 扫码付款；权益以服务端验签到账为准。会员不自动续费，月点数须手动领取。')
    return result


class OrderRequest(BaseModel):
    model_config=ConfigDict(extra='forbid',json_schema_extra={'examples':[{
        'plan_id':'points_1000','expected_total_fen':1000,'accept_terms':True}]})
    plan_id: str=Field(min_length=1,max_length=40)
    expected_total_fen: int=Field(ge=1)
    accept_terms: bool


class OrderView(BaseModel):
    id: str
    plan_id: str
    quote: PlanView
    total_fen: int
    status: str
    created_at: str
    expires_at: str
    paid_at: str|None
    checkout_available: bool=False
    payment_state: str|None=None


def order_view(row):
    status='expired' if row.status=='awaiting_payment' and row.expires_at<=utcnow() else row.status
    return {**{key:getattr(row,key) for key in ('id','plan_id','quote','total_fen')},'status':status,
        **{key:iso(getattr(row,key)) for key in ('created_at','expires_at','paid_at')},
        'checkout_available':False,'payment_state':row.payment.get('state') if row.payment else None}


@router.post('/orders',status_code=201,response_model=OrderView)
def create_order(body: OrderRequest,workspace: ws.WorkspaceAccess,sessions: ws.Sessions,idempotency_key: ws.IdempotencyKey):
    """创建 30 分钟有效的未支付订单，金额与权益由服务端快照；重试必须复用幂等键。"""
    if not idempotency_key:raise HTTPException(422,'idempotency_key_required')
    if not body.accept_terms:raise HTTPException(422,'billing_terms_required')
    fingerprint=ws.request_fingerprint('billing_order',body.model_dump())
    with write_transaction(sessions) as session:
        ws.lock_workspace(session,workspace)
        previous=session.scalar(select(BillingOrder).where(BillingOrder.workspace_id==workspace,
            BillingOrder.idempotency_key==idempotency_key))
        if previous:
            if previous.request_hash!=fingerprint:raise HTTPException(409,'idempotency_key_conflict')
            return order_view(previous)
        pending=session.scalar(select(func.count()).select_from(BillingOrder).where(
            BillingOrder.workspace_id==workspace,BillingOrder.status=='awaiting_payment',BillingOrder.expires_at>utcnow()))
        if pending>=5:raise HTTPException(429,'billing_pending_order_limit')
        quote=price(session,workspace,body.plan_id)
        if body.expected_total_fen!=quote['total_fen']:raise HTTPException(409,'billing_quote_changed')
        row=BillingOrder(workspace_id=workspace,idempotency_key=idempotency_key,request_hash=fingerprint,
            plan_id=body.plan_id,quote=quote,total_fen=quote['total_fen'],expires_at=utcnow()+timedelta(minutes=30))
        session.add(row);session.flush()
        return order_view(row)


@router.get('/orders',response_model=list[OrderView])
def orders(workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """读取本空间最近 100 个订单；支付状态只来自服务端对账，前端不能提交已支付标记。"""
    with sessions() as session:
        return [order_view(row) for row in session.scalars(select(BillingOrder).where(
            BillingOrder.workspace_id==workspace).order_by(BillingOrder.created_at.desc()).limit(100))]


@router.post('/orders/{order_id}/cancel',response_model=OrderView)
def cancel_order(order_id: str,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """取消本空间未支付订单，不扣点；支付完成后不能通过此接口退款。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session,workspace)
        row=session.get(BillingOrder,order_id)
        if row is None or row.workspace_id!=workspace:raise HTTPException(404,'billing_order_not_found')
        if row.status!='awaiting_payment':raise HTTPException(409,'billing_order_not_pending')
        if row.payment:raise HTTPException(409,'billing_order_checkout_locked')
        row.status='cancelled'
        return order_view(row)


def fulfill_order(sessions,workspace,order_id,amount_fen,receipt,*,paid_at=None):
    """Server-local settlement after independent receipt verification. Never exposed as a public route."""
    if type(amount_fen) is not int or not receipt or len(receipt)>200:raise ValueError('Invalid settlement')
    digest=sha256(('payment-receipt:'+receipt).encode()).hexdigest()
    with write_transaction(sessions) as session:
        if session.get(Workspace,workspace) is None:raise ValueError('Workspace not found')
        ws.lock_workspace(session,workspace)
        row=session.get(BillingOrder,order_id)
        if row is None or row.workspace_id!=workspace:raise ValueError('Order not found')
        if row.total_fen!=amount_fen:raise ValueError('Payment amount mismatch')
        if row.status=='paid':
            if row.receipt_hash!=digest:raise ValueError('Order already settled using another receipt')
            return order_view(row)
        effective_paid=paid_at or utcnow()
        if row.status!='awaiting_payment' or not row.created_at-timedelta(minutes=5)<=effective_paid<=row.expires_at:
            raise ValueError('Order no longer payable')
        duplicate=session.scalar(select(BillingOrder.id).where(BillingOrder.receipt_hash==digest))
        if duplicate:raise ValueError('Receipt already used')
        now=utcnow();quote=row.quote
        wallet=session.get(Wallet,workspace)
        if quote['points_now']:
            wallet.available+=quote['points_now']
            session.add(PointEntry(workspace_id=workspace,reference=row.id,kind='topup',points=quote['points_now']))
        if quote['periods']:
            latest=session.scalar(select(func.max(Membership.ends_at)).where(Membership.workspace_id==workspace))
            starts=max(now,latest) if latest else now
            session.add(Membership(workspace_id=workspace,order_id=row.id,plan_id=row.plan_id,
                starts_at=starts,ends_at=add_months(starts,quote['periods']),
                monthly_points=quote['monthly_points'],periods=quote['periods']))
        row.status,row.receipt_hash,row.paid_at='paid',digest,effective_paid
        return order_view(row)


def period_index(row,now):
    return next((index for index in range(row.periods) if add_months(row.starts_at,index)<=now<add_months(row.starts_at,index+1)),None)


def claim_reference(row,index):return sha256(f'membership:{row.id}:{index}'.encode()).hexdigest()[:32]


class MembershipView(BaseModel):
    id: str
    plan_id: str
    starts_at: str
    ends_at: str
    monthly_points: int
    current_period: int|None
    claimable: bool
    already_claimed: bool


def member_view(session,row):
    index=period_index(row,utcnow())
    claimed=bool(index is not None and session.scalar(select(PointEntry.id).where(
        PointEntry.workspace_id==row.workspace_id,PointEntry.reference==claim_reference(row,index),PointEntry.kind=='monthly_grant')))
    return {'id':row.id,'plan_id':row.plan_id,'starts_at':iso(row.starts_at),'ends_at':iso(row.ends_at),
        'monthly_points':row.monthly_points,'current_period':index,'claimable':index is not None and not claimed,
        'already_claimed':claimed}


@router.get('/memberships',response_model=list[MembershipView])
def memberships(workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """查询当前、待生效与到期会员；每个会员周期单独领取，不补发错过的月份。"""
    with sessions() as session:return [member_view(session,row) for row in session.scalars(
        select(Membership).where(Membership.workspace_id==workspace).order_by(Membership.starts_at.desc()).limit(50))]


@router.post('/memberships/{membership_id}/claims',response_model=MembershipView)
def claim_month(membership_id: str,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """领取当前会员月点数；同周期重复调用幂等，不自动续费、不预领未来或补领已过周期。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session,workspace)
        row=session.get(Membership,membership_id)
        if row is None or row.workspace_id!=workspace:raise HTTPException(404,'membership_not_found')
        index=period_index(row,utcnow())
        if index is None:raise HTTPException(409,'membership_not_active')
        state=member_view(session,row)
        if not state['already_claimed']:
            session.get(Wallet,workspace).available+=row.monthly_points
            session.add(PointEntry(workspace_id=workspace,reference=claim_reference(row,index),kind='monthly_grant',points=row.monthly_points))
            session.flush()
        return member_view(session,row)
