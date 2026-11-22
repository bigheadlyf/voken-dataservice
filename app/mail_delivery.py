"""Explicitly reviewed SMTP delivery, isolated by sender workspace and fail-closed on uncertainty."""
from email.message import EmailMessage
from email.policy import SMTP
from email.utils import format_datetime
import re
import smtplib
import ssl

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select

from app import workspaces as ws
from app.crm import get_prospect, iso
from app.db import MailDelivery, Prospect, ProspectActivity, new_id, utcnow, write_transaction

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}', tags=['mail'])
MAILBOX = re.compile(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}")


def mailbox(value):
    return isinstance(value, str) and len(value) <= 254 and MAILBOX.fullmatch(value) is not None


def enabled(settings, workspace):
    return bool(settings.smtp_enabled and settings.smtp_daily_limit and settings.smtp_workspace_id == workspace)


def delivery_footer(settings):
    return settings.smtp_footer.strip()+'\nIf you prefer not to hear from us, reply STOP.'


class DeliveryRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, json_schema_extra={'examples':[{
        'draft_job_id':'0123456789abcdef0123456789abcdef', 'expected_version':1,
        'recipient':'buyer@example.com', 'subject':'Product introduction',
        'body':'May I send a relevant product overview?', 'confirm_send':True}]})
    draft_job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    expected_version: int = Field(ge=1)
    recipient: str = Field(min_length=3, max_length=254)
    subject: str = Field(min_length=1, max_length=200, pattern=r'^[^\r\n\x00]+$')
    body: str = Field(min_length=1, max_length=6000)
    confirm_send: bool


class DeliveryView(BaseModel):
    id: str
    prospect_id: str
    draft_job_id: str
    recipient: str
    sender: str
    subject: str
    body: str
    message_id: str
    status: str
    error: str | None
    created_at: str
    started_at: str | None
    finished_at: str | None


def view(row):
    return {**{key:getattr(row,key) for key in ('id','prospect_id','draft_job_id','recipient','sender',
        'subject','body','message_id','status','error')},
        **{key:iso(getattr(row,key)) for key in ('created_at','started_at','finished_at')}}


def get_delivery(session, workspace, delivery_id):
    row = session.get(MailDelivery, delivery_id)
    if row is None or row.workspace_id != workspace:
        raise HTTPException(404, 'delivery_not_found')
    return row


class ChannelView(BaseModel):
    enabled: bool
    transport_mode: str
    sender: str | None
    footer: str | None
    daily_limit: int
    platform_points: int
    acceptance_is_delivery: bool
    automatic_retry: bool


@router.get('/mail/channel', response_model=ChannelView)
def channel(request: Request, workspace: ws.WorkspaceAccess):
    """读取当前空间获准使用的发件身份和审阅页脚；不回传 SMTP 主机、账号或密钥。"""
    settings = request.app.state.settings
    available = enabled(settings, workspace)
    return {'enabled':available,
        'transport_mode':('local_capture' if settings.smtp_mode == 'test_plain' else 'live') if available else 'unconfigured',
        'sender':settings.smtp_from if available else None,
        'footer':delivery_footer(settings) if available else None,
        'daily_limit':settings.smtp_daily_limit if available else 0, 'platform_points':0,
        'acceptance_is_delivery':False, 'automatic_retry':False}


@router.post('/crm/prospects/{prospect_id}/deliveries', status_code=202, response_model=DeliveryView)
def queue_delivery(prospect_id: str, body: DeliveryRequest, request: Request,
                   workspace: ws.WorkspaceAccess, sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey):
    """人工确认收件人及审阅正文后提交单封邮件；本接口的调用会授权后端 SMTP 发送。"""
    if not idempotency_key:
        raise HTTPException(422, 'idempotency_key_required')
    if not body.confirm_send:
        raise HTTPException(422, 'delivery_confirmation_required')
    if not mailbox(body.recipient) or '\x00' in body.body:
        raise HTTPException(422, 'invalid_delivery_content')
    settings = request.app.state.settings
    identity = {'prospect_id':prospect_id, **body.model_dump()}
    fingerprint = ws.request_fingerprint('smtp_delivery', identity)
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        previous = session.scalar(select(MailDelivery).where(MailDelivery.workspace_id == workspace,
            MailDelivery.idempotency_key == idempotency_key))
        if previous:
            if previous.request_hash != fingerprint:
                raise HTTPException(409, 'idempotency_key_conflict')
            return view(previous)
        if not enabled(settings, workspace):
            raise HTTPException(503, 'smtp_not_configured')
        prospect = get_prospect(session, workspace, prospect_id)
        if prospect.do_not_contact:
            raise HTTPException(409, 'prospect_do_not_contact')
        from app.crm_workbench import blocked_recipient
        if blocked_recipient(session, workspace, prospect_id, body.recipient):
            raise HTTPException(409, 'prospect_do_not_contact')
        if prospect.version != body.expected_version:
            raise HTTPException(409, 'prospect_version_conflict')
        if prospect.contact != body.recipient:
            raise HTTPException(409, 'delivery_recipient_changed')
        job = ws.get_job(session, workspace, body.draft_job_id)
        if job.operation != 'outreach_draft' or job.status != 'succeeded' or job.payload.get('prospect_id') != prospect_id:
            raise HTTPException(409, 'delivery_draft_not_ready')
        previous = session.scalar(select(MailDelivery).where(MailDelivery.workspace_id == workspace,
            MailDelivery.draft_job_id == job.id))
        if previous:
            raise HTTPException(409, 'draft_already_submitted_for_delivery')
        today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        count = session.scalar(select(func.count()).select_from(MailDelivery).where(
            MailDelivery.workspace_id == workspace, MailDelivery.created_at >= today))
        if count >= settings.smtp_daily_limit:
            raise HTTPException(429, 'smtp_daily_limit')
        identifier = new_id()
        row = MailDelivery(id=identifier, workspace_id=workspace, prospect_id=prospect_id, draft_job_id=job.id,
            idempotency_key=idempotency_key, request_hash=fingerprint, recipient=body.recipient,
            sender=settings.smtp_from, subject=body.subject,
            body=body.body+'\n\n'+delivery_footer(settings),
            message_id=f'<{identifier}@{settings.smtp_from.split("@",1)[1]}>')
        session.add(row)
        session.add(ProspectActivity(prospect_id=prospect_id,kind='delivery_queued',content=identifier))
        session.flush()
        return view(row)


@router.get('/mail/deliveries', response_model=list[DeliveryView])
def deliveries(workspace: ws.WorkspaceAccess, sessions: ws.Sessions, limit: int = Query(50, ge=1, le=100)):
    """查看本空间审阅提交的邮件及接收状态；accepted 仅表示 SMTP 服务器接受。"""
    with sessions() as session:
        return [view(row) for row in session.scalars(select(MailDelivery).where(
            MailDelivery.workspace_id == workspace).order_by(MailDelivery.created_at.desc()).limit(limit))]


@router.post('/mail/deliveries/{delivery_id}/cancel', response_model=DeliveryView)
def cancel_delivery(delivery_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """取消尚未开始的邮件；sending、accepted 与 unknown 不能撤回或自动重发。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        row = get_delivery(session, workspace, delivery_id)
        if row.status != 'queued':
            raise HTTPException(409, 'delivery_cannot_cancel')
        row.status, row.finished_at = 'cancelled', utcnow()
        session.add(ProspectActivity(prospect_id=row.prospect_id,kind='delivery_cancelled',content=row.id))
        return view(row)


class SMTPResult:
    def __init__(self, status, error=None):
        self.status, self.error = status, error


def submit_smtp(settings, row):
    """A 250 after DATA means server acceptance, never inbox delivery. No network retry."""
    message = EmailMessage(policy=SMTP)
    message['From'], message['To'], message['Subject'] = row.sender, row.recipient, row.subject
    message['Message-ID'] = row.message_id
    message['Date'] = format_datetime(row.created_at)
    message['Reply-To'] = row.sender
    message['List-Unsubscribe'] = f'<mailto:{row.sender}?subject=unsubscribe>'
    # Quoted-printable keeps international text compatible with servers without 8BITMIME.
    message.set_content(row.body,cte='quoted-printable')
    client, transmitting = None, False
    try:
        options = {'host':settings.smtp_host, 'port':settings.smtp_port, 'timeout':15,
                   'local_hostname':'voken-mail.local'}
        if settings.smtp_mode == 'ssl':
            client = smtplib.SMTP_SSL(**options, context=ssl.create_default_context())
        else:
            client = smtplib.SMTP(**options)
            if settings.smtp_mode == 'starttls':
                client.starttls(context=ssl.create_default_context())
        client.ehlo()
        if settings.smtp_username:
            client.login(settings.smtp_username, settings.smtp_password)
        code, _ = client.mail(row.sender)
        if code != 250:
            return SMTPResult('rejected', 'smtp_sender_rejected')
        code, _ = client.rcpt(row.recipient)
        if code not in (250,251):
            return SMTPResult('rejected', 'smtp_recipient_rejected')
        transmitting = True
        code, _ = client.data(message.as_bytes())
        return SMTPResult('accepted') if code == 250 else SMTPResult('rejected', 'smtp_message_rejected')
    except smtplib.SMTPDataError:
        return SMTPResult('rejected', 'smtp_message_rejected')
    except (smtplib.SMTPException, OSError, ValueError):
        return SMTPResult('unknown' if transmitting else 'rejected',
                          'smtp_acceptance_unknown' if transmitting else 'smtp_connection_or_auth_failed')
    finally:
        if client is not None:
            # QUIT failure cannot undo a known successful DATA response.
            try:
                client.close()
            except OSError:
                pass


def recover_deliveries(sessions):
    with write_transaction(sessions) as session:
        for row in session.scalars(select(MailDelivery).where(MailDelivery.status == 'sending')):
            row.status, row.error, row.finished_at = 'unknown', 'smtp_acceptance_unknown', utcnow()


def run_next_delivery(sessions, settings, transport=submit_smtp):
    with sessions() as session:
        item = session.execute(select(MailDelivery.id,MailDelivery.workspace_id).where(
            MailDelivery.status == 'queued').order_by(MailDelivery.created_at,MailDelivery.id).limit(1)).first()
    if item is None:
        return False
    identifier, workspace = item
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        row = session.get(MailDelivery, identifier)
        if row.status != 'queued':
            return True
        prospect = session.get(Prospect, row.prospect_id)
        error = ('smtp_not_configured' if not enabled(settings, workspace) or row.sender != settings.smtp_from else
                 'prospect_do_not_contact' if prospect.do_not_contact else
                 'delivery_recipient_changed' if prospect.contact != row.recipient else None)
        suppressed=session.scalar(select(Prospect.id).where(Prospect.workspace_id==workspace,
            Prospect.do_not_contact.is_(True),func.lower(Prospect.contact)==row.recipient.lower()).limit(1))
        if suppressed:error='prospect_do_not_contact'
        from app.crm_workbench import blocked_recipient
        if blocked_recipient(session, workspace, row.prospect_id, row.recipient):
            error = 'prospect_do_not_contact'
        today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        attempted = session.scalar(select(func.count()).select_from(MailDelivery).where(
            MailDelivery.workspace_id == workspace, MailDelivery.started_at >= today))
        if attempted >= settings.smtp_daily_limit:
            error = error or 'smtp_daily_limit'
        if error:
            row.status, row.error, row.finished_at = 'cancelled', error, utcnow()
            return True
        row.status, row.started_at = 'sending', utcnow()
    try:
        outcome = transport(settings, row)
    except Exception:
        outcome = SMTPResult('unknown', 'smtp_acceptance_unknown')
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        row = session.get(MailDelivery, identifier)
        row.status, row.error, row.finished_at = outcome.status, outcome.error, utcnow()
        prospect = session.get(Prospect,row.prospect_id)
        if outcome.status == 'accepted' and prospect.stage in ('new','qualified'):
            prospect.stage = 'contacted'
            prospect.version += 1
            prospect.updated_at = utcnow()
        session.add(ProspectActivity(prospect_id=row.prospect_id,kind='delivery_'+outcome.status,
            content=f'{row.id}\n{row.recipient}\n{outcome.error or "SMTP accepted; inbox delivery unverified"}'))
    return True
