"""Authenticated checkout, signed server reconciliation and independently authenticated callbacks."""
import base64
import re
from io import BytesIO
import qrcode
from qrcode.image.svg import SvgPathImage
from fastapi import APIRouter,HTTPException,Request
from pydantic import BaseModel
from app import workspaces as ws
from app.billing import OrderView,fulfill_order,order_view
from app.db import BillingOrder,utcnow,write_transaction
from app.wechat_pay import NativePay,PaymentError
from sqlalchemy import select

router=APIRouter(tags=['payments'])
ROOT='/api/v1/workspaces/{workspace_id}/billing/orders'


def gateway(request):
    if not request.app.state.settings.wechat_enabled:raise HTTPException(503,'wechat_not_configured')
    try:return NativePay(request.app.state.settings)
    except PaymentError as error:raise HTTPException(503,error.code) from None


def find_order(session,workspace,identifier):
    row=session.get(BillingOrder,identifier)
    if row is None or row.workspace_id!=workspace:raise HTTPException(404,'billing_order_not_found')
    return row


def recover_checkouts(sessions):
    """Only on process startup: no surviving HTTP request can still create these orders."""
    with write_transaction(sessions) as session:
        for row in session.scalars(select(BillingOrder).where(BillingOrder.status=='awaiting_payment')):
            if row.payment and row.payment.get('state')=='creating':
                row.payment={**row.payment,'state':'unknown'}


class CheckoutView(BaseModel):
    order: OrderView
    qr_data_url: str


def checkout_view(row):
    code=row.payment['code_url']
    image=qrcode.make(code,image_factory=SvgPathImage,box_size=6,border=4)
    output=BytesIO();image.save(output)
    return {'order':order_view(row),'qr_data_url':'data:image/svg+xml;base64,'+base64.b64encode(output.getvalue()).decode()}


@router.post(ROOT+'/{order_id}/checkout',response_model=CheckoutView)
def checkout(order_id: str,request: Request,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """向已配置的微信商户请求 Native 二维码；二维码由本地生成，浏览器不能提交金额或到账标记。"""
    provider=gateway(request)
    try:
        with write_transaction(sessions) as session:
            ws.lock_workspace(session,workspace)
            row=find_order(session,workspace,order_id)
            if row.status!='awaiting_payment' or row.expires_at<=utcnow():raise HTTPException(409,'billing_order_not_pending')
            if row.payment and row.payment.get('state')=='ready':return checkout_view(row)
            if row.payment:raise HTTPException(409,'payment_checkout_requires_query')
            row.payment={'provider':'wechat','state':'creating'}
        try:code=provider.create(row)
        except Exception as error:
            with write_transaction(sessions) as session:
                ws.lock_workspace(session,workspace)
                saved=find_order(session,workspace,order_id)
                saved.payment={'provider':'wechat','state':'unknown'}
            raise HTTPException(502,error.code if isinstance(error,PaymentError) else 'wechat_checkout_unknown') from None
        with write_transaction(sessions) as session:
            ws.lock_workspace(session,workspace)
            row=find_order(session,workspace,order_id)
            if row.status!='awaiting_payment':raise HTTPException(409,'billing_order_not_pending')
            row.payment={'provider':'wechat','state':'ready','code_url':code}
            return checkout_view(row)
    finally:provider.close()


def settle(sessions,provider,result):
    if not isinstance(result,dict) or not isinstance(result.get('out_trade_no'),str) or not re.fullmatch('[0-9a-f]{32}',result['out_trade_no']):
        raise HTTPException(400,'wechat_payment_mismatch')
    with sessions() as session:
        row=session.get(BillingOrder,result.get('out_trade_no'))
        if row is None:raise HTTPException(404,'billing_order_not_found')
        if not row.payment or row.payment.get('provider')!='wechat':raise HTTPException(409,'payment_order_not_wechat')
        transaction,paid=provider.validate_payment(result,row)
        workspace,identifier,amount=row.workspace_id,row.id,row.total_fen
    try:return fulfill_order(sessions,workspace,identifier,amount,'wechat:'+transaction,paid_at=paid)
    except ValueError:raise HTTPException(409,'payment_requires_reconciliation') from None


@router.post(ROOT+'/{order_id}/refresh',response_model=OrderView)
def refresh_payment(order_id: str,request: Request,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """主动查询微信订单；只有签名验证后的 SUCCESS 且商户、应用、金额及币种一致才到账。"""
    with sessions() as session:
        row=find_order(session,workspace,order_id)
        if row.status=='paid':return order_view(row)
        if not row.payment:raise HTTPException(409,'payment_checkout_not_started')
    provider=gateway(request)
    try:
        result=provider.query(order_id)
        if result.get('out_trade_no')!=order_id:
            raise PaymentError('wechat_payment_mismatch')
        if result.get('trade_state')=='SUCCESS':return settle(sessions,provider,result)
        with sessions() as session:return order_view(find_order(session,workspace,order_id))
    except PaymentError as error:raise HTTPException(502,error.code) from None
    finally:provider.close()


@router.post(ROOT+'/{order_id}/close',response_model=OrderView)
def close_payment(order_id: str,request: Request,workspace: ws.WorkspaceAccess,sessions: ws.Sessions):
    """商户确认关单，或到期后明确不存在，才取消本地记录；创建中不可关单，不处理退款。"""
    with sessions() as session:
        row=find_order(session,workspace,order_id)
        if row.status=='cancelled' and row.payment and row.payment.get('state') in ('closed','not_created_expired'):
            return order_view(row)
        if row.status!='awaiting_payment' or not row.payment:raise HTTPException(409,'billing_order_not_pending')
        if row.payment.get('state')=='creating':raise HTTPException(409,'payment_checkout_in_progress')
    provider=gateway(request)
    not_created=False
    try:provider.close_order(order_id)
    except PaymentError as error:
        # A timed-out create can still be processing at the merchant. A current NOT_EXIST
        # is insufficient to cancel locally while payment can still become possible.
        if error.code!='wechat_order_not_exist' or row.expires_at>utcnow():
            raise HTTPException(502,error.code) from None
        not_created=True
    finally:provider.close()
    with write_transaction(sessions) as session:
        ws.lock_workspace(session,workspace)
        row=find_order(session,workspace,order_id)
        if row.status!='awaiting_payment':raise HTTPException(409,'billing_order_not_pending')
        row.status='cancelled';row.payment={'provider':'wechat',
            'state':'not_created_expired' if not_created else 'closed'}
        return order_view(row)


class NotifyResult(BaseModel):
    code: str='SUCCESS'
    message: str='成功'


@router.post('/api/v1/payments/wechat/notify',response_model=NotifyResult)
async def notify(request: Request):
    """验签并解密微信交易成功通知，核对订单后幂等入账；不接受浏览器声称支付成功。"""
    if request.app.state.sessions is None:raise HTTPException(503,'database_not_configured')
    raw=bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw)>65536:raise HTTPException(413,'payment_notification_too_large')
    provider=gateway(request)
    try:
        result=provider.notification(request.headers,bytes(raw))
        settle(request.app.state.sessions,provider,result)
        return {'code':'SUCCESS','message':'成功'}
    except PaymentError as error:raise HTTPException(400,error.code) from None
    finally:provider.close()
