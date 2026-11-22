"""Explicit, budgeted directory lookup and one selected subject's contact unlock."""
from datetime import timedelta
from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import select

from app import workspaces as ws
from app.db import DirectoryRequest, Job, ProspectContact, utcnow, write_transaction
from app.openapi import JobResponse

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}/directory', tags=['directory'])


class DirectorySearch(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, json_schema_extra={'examples': [
        {'kind': 'company', 'company_name': 'Marmetal', 'country': 'US', 'require_email': True, 'confirm_paid': True}]})
    kind: Literal['company', 'people'] = 'company'
    company_name: str | None = Field(default=None, min_length=1, max_length=180)
    website: str | None = Field(default=None, min_length=4, max_length=500)
    product: str | None = Field(default=None, min_length=1, max_length=150)
    country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    titles: list[str] = Field(default_factory=list, max_length=8)
    require_email: bool = False
    company_match_job_id: str | None = Field(default=None, pattern=r'^[0-9a-f]{32}$')
    company_record_id: str | None = Field(default=None, pattern=r'^[A-Za-z0-9_-]{1,160}$')
    continuation_job_id: str | None = Field(default=None, pattern=r'^[0-9a-f]{32}$')
    confirm_paid: Literal[True]

    @model_validator(mode='after')
    def criteria(self):
        if self.continuation_job_id:
            if self.model_fields_set - {'continuation_job_id', 'confirm_paid'}:
                raise ValueError('Continuation only accepts the previous job and fee confirmation')
            return self
        if not (self.company_name or self.website or self.product or self.company_record_id):
            raise ValueError('A positive company, website or product anchor is required')
        if bool(self.company_record_id) != bool(self.company_match_job_id):
            raise ValueError('Select a company from an owned directory result')
        if self.kind != 'people' and (self.company_record_id or self.titles):
            raise ValueError('Company selection and titles apply to people search')
        if any(not value.strip() or len(value) > 80 for value in self.titles):
            raise ValueError('Title terms must have 1 to 80 characters')
        if self.website:
            from urllib.parse import urlsplit
            parsed = urlsplit(self.website)
            if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
                raise ValueError('Website must be an HTTP(S) URL without credentials')
        return self


class ContactSelection(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id': '0123456789abcdef0123456789abcdef', 'record_id': 'provider-subject-id', 'confirm_paid': True}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    record_id: str = Field(pattern=r'^[A-Za-z0-9_-]{1,160}$')
    confirm_paid: Literal[True]


def selected(session, workspace, job_id, record_id, kind=None):
    job = ws.get_job(session, workspace, job_id)
    if job.operation not in ('directory_companies', 'directory_people') or job.status not in ('succeeded', 'partial'):
        raise HTTPException(409, 'directory_job_not_ready')
    data = (job.result or {}).get('directory', {})
    if kind and data.get('kind') != kind:
        raise HTTPException(422, 'directory_kind_mismatch')
    for record in data.get('records', []):
        if record.get('record_id') == record_id:
            return record
    raise HTTPException(404, 'directory_record_not_found')


def enqueue(session, workspace, request, operation, payload, key):
    if not key:
        raise HTTPException(422, 'idempotency_key_required')
    identity = {key: payload[key] for key in ('namespace', 'record_id')} if operation == 'directory_contacts' else payload
    fingerprint = ws.request_fingerprint(operation, identity)
    binding = session.get(DirectoryRequest, (workspace, key))
    if binding:
        if binding.request_hash != fingerprint:
            raise HTTPException(409, 'idempotency_key_conflict')
        return ws.job_view(ws.get_job(session, workspace, binding.job_id))
    previous = ws.replay_job(session, workspace, key, fingerprint)
    if previous:
        return ws.job_view(previous)
    cached = session.scalar(select(Job).where(Job.workspace_id == workspace,
        Job.operation == operation, Job.request_hash == fingerprint,
        Job.created_at >= utcnow()-timedelta(hours=24),
        Job.status.in_((*ws.ACTIVE_STATES, 'succeeded'))).order_by(Job.created_at.desc()).limit(1))
    if cached:
        session.add(DirectoryRequest(workspace_id=workspace, idempotency_key=key, request_hash=fingerprint, job_id=cached.id))
        return ws.job_view(cached)
    if not ws.customs_available(request):
        raise HTTPException(503, 'customs_provider_unavailable')
    job = ws.enqueue(session, workspace, request.app.state.settings, operation, payload, key, fingerprint)
    session.add(DirectoryRequest(workspace_id=workspace, idempotency_key=key, request_hash=fingerprint, job_id=job.id))
    return ws.job_view(job)


@router.post('/searches', status_code=202, response_model=JobResponse)
def search_directory(body: DirectorySearch, request: Request, workspace: ws.WorkspaceAccess,
                     sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey = None):
    """查询一页统一企业/人物库，保留岗位、公司关系和联系方式库存，库存不等于已解锁的值。

    每页最多20条、单页预算1.5元。分页必须引用本工作空间前一页任务，沿用其筛选，不接收任意游标。
    联系方式需另选具体记录解锁；请求须确认付费，相同请求24小时内优先复用结果。
    """
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        payload = body.model_dump(exclude={'confirm_paid', 'continuation_job_id', 'company_match_job_id', 'company_record_id'}, exclude_none=True)
        if body.continuation_job_id:
            prior = ws.get_job(session, workspace, body.continuation_job_id)
            if prior.operation not in ('directory_companies', 'directory_people') or prior.status not in ('succeeded', 'partial'):
                raise HTTPException(409, 'directory_job_not_ready')
            cursor = (prior.result or {}).get('directory', {}).get('next_cursor')
            if not cursor:
                raise HTTPException(409, 'directory_no_more_pages')
            payload = {key: value for key, value in prior.payload.items() if key != 'point_pricing'}
            payload.update(cursor=cursor, parent_job_id=prior.id)
        elif body.company_record_id:
            company = selected(session, workspace, body.company_match_job_id, body.company_record_id, 'company')
            payload.update(company_pid=company['record_id'], selected_company=company)
        return enqueue(session, workspace, request, 'directory_companies' if payload['kind'] == 'company' else 'directory_people', payload, idempotency_key)


@router.post('/contacts', status_code=202, response_model=JobResponse)
def unlock_directory_contact(body: ContactSelection, request: Request, workspace: ws.WorkspaceAccess,
                             sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey = None):
    """仅解锁当前工作空间已查询的一家企业或一位人物；单个主体预算0.5元，避免整页自动购买。

    保留魔方的有效性/WhatsApp标记与来源，不把供应商标记称为本系统独立投递验证。空结果按空结果交付。
    """
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        record = selected(session, workspace, body.job_id, body.record_id)
        return enqueue(session, workspace, request, 'directory_contacts', record, idempotency_key)


class SaveCompany(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id': '0123456789abcdef0123456789abcdef', 'record_id': 'provider-company-id'}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    record_id: str = Field(pattern=r'^[A-Za-z0-9_-]{1,160}$')


class SavedCompany(BaseModel):
    prospect_id: str
    created: bool


@router.post('/save-company', response_model=SavedCompany)
def save_directory_company(body: SaveCompany, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """将选中的统一企业记录保存为待核实客户；不把联系方式库存计入可联系客户数。"""
    from app.crm import upsert
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        company = selected(session, workspace, body.job_id, body.record_id, 'company')
        prospect, added = upsert(session, workspace, {'name': company['name'], 'location': company.get('country') or '',
            'contact': '', 'website': ''}, {'evidence_type': 'potential_match', 'directory_record': company,
            'origin_job_id': body.job_id, 'source': {'url': None, 'title': '跨境魔方统一企业库'},
            'source_note': '统一企业库主体，企业身份、具体采购需求和联系方式待核实。'})
        return {'prospect_id': prospect.id, 'created': added}


class SaveContact(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id': '0123456789abcdef0123456789abcdef', 'prospect_id': '0123456789abcdef0123456789abcdef', 'confirm_company_match': True}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    prospect_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    confirm_company_match: Literal[True]


class SavedContact(BaseModel):
    id: str
    prospect_id: str
    name: str
    company_name: str
    namespace: str
    titles: list[str]
    channels: list[dict]
    source_job_id: str
    observed_at: str


def contact_view(row):
    return {key: getattr(row, key) for key in ('id', 'prospect_id', 'name', 'company_name', 'namespace', 'titles', 'channels', 'source_job_id')} | {
        'observed_at': row.observed_at.isoformat()+'Z'}


@router.post('/saved-contacts', response_model=SavedContact)
def save_directory_contact(body: SaveContact, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """人工核对公司归属后保存联系人及完整渠道；同一主体重复采用更新渠道，不重复创建人物。"""
    from app.crm import get_prospect
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, body.prospect_id)
        job = ws.get_job(session, workspace, body.job_id)
        if job.operation != 'directory_contacts' or job.status != 'succeeded':
            raise HTTPException(409, 'directory_job_not_ready')
        evidence = (job.result or {}).get('directory', {})
        subject = evidence.get('subject', {})
        if not evidence.get('records'):
            raise HTTPException(409, 'directory_contacts_empty')
        row = session.scalar(select(ProspectContact).where(ProspectContact.workspace_id == workspace,
            ProspectContact.prospect_id == prospect.id, ProspectContact.namespace == subject['namespace'],
            ProspectContact.subject_id == subject['record_id']))
        if row is None:
            row = ProspectContact(workspace_id=workspace, prospect_id=prospect.id,
                namespace=subject['namespace'], subject_id=subject['record_id'], name=subject['name'],
                company_name=subject.get('company_name') or subject['name'], titles=subject.get('titles', []))
            session.add(row)
        row.channels = evidence['records']
        usable = [item for item in row.channels if item.get('channel') == 'emails' and item.get('validity') != 2]
        usable.sort(key=lambda item: item.get('validity') != 1)
        if not prospect.contact and usable:
            prospect.contact = usable[0]['value']
            prospect.version += 1
            prospect.updated_at = utcnow()
        row.source_job_id = job.id
        row.observed_at = utcnow()
        session.flush()
        return contact_view(row)


@router.get('/saved-contacts/{prospect_id}', response_model=list[SavedContact])
def saved_directory_contacts(prospect_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """查看客户的一对多企业/人物联系方式及来源；不调用供应商，不发送邮件。"""
    from app.crm import get_prospect
    with sessions() as session:
        get_prospect(session, workspace, prospect_id)
        return [contact_view(row) for row in session.scalars(select(ProspectContact).where(
            ProspectContact.workspace_id == workspace, ProspectContact.prospect_id == prospect_id).order_by(ProspectContact.name))]


class TradeSearch(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, json_schema_extra={'examples': [
        {'product': 'food pan', 'buyer_country': 'US', 'date_start': '2025-11-21', 'date_end': '2026-11-20', 'confirm_paid': True}]})
    product: str | None = Field(default=None, min_length=1, max_length=150)
    hs_code: str | None = Field(default=None, pattern=r'^[0-9]{6,10}$')
    buyer: str | None = Field(default=None, min_length=1, max_length=200)
    buyer_country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    origin_country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    arrival_country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    date_start: date | None = None
    date_end: date | None = None
    continuation_job_id: str | None = Field(default=None, pattern=r'^[0-9a-f]{32}$')
    confirm_paid: Literal[True]

    @model_validator(mode='after')
    def criteria(self):
        if self.continuation_job_id:
            if self.model_fields_set - {'continuation_job_id', 'confirm_paid'}:
                raise ValueError('Continuation must keep prior criteria')
        elif not (self.product or self.hs_code) or not self.date_start or not self.date_end or self.date_start > self.date_end or self.date_end >= date.max:
            raise ValueError('A product/HS and valid date range are required')
        return self


@router.post('/trades', status_code=202, response_model=JobResponse)
def search_trade_records(body: TradeSearch, request: Request, workspace: ws.WorkspaceAccess,
                         sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey = None):
    """按产品/HS、日期、买方国家和运输路线查询一页20条历史贸易，不必先知道采购商名称。

    每页1.5元预算；下一页引用本空间上一页任务并保留筛选。数量原始单位及空币种不做换算。
    原始交易可能含物流主体、混装和无关产品，不能直接计为有效买家或当前需求。
    """
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        payload = {**body.model_dump(mode='json', exclude={'confirm_paid', 'continuation_job_id'}, exclude_none=True), 'sort_latest': True}
        if body.continuation_job_id:
            prior = ws.get_job(session, workspace, body.continuation_job_id)
            if prior.operation != 'trade_search' or prior.status != 'succeeded':
                raise HTTPException(409, 'directory_job_not_ready')
            cursor = (prior.result or {}).get('customs', {}).get('next_cursor')
            if not cursor:
                raise HTTPException(409, 'directory_no_more_pages')
            payload = {key: value for key, value in prior.payload.items() if key != 'point_pricing'}
            payload.update(cursor=cursor, parent_job_id=prior.id)
        return enqueue(session, workspace, request, 'trade_search', payload, idempotency_key)
