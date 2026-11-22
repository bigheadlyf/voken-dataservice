"""Tenant-owned sales pipeline. Discovery snapshots remain immutable."""
import csv
import io
import re
import unicodedata
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from typing import Literal
from urllib.parse import urlsplit

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import case, func, select

from app import workspaces as ws
from app.customers import TERMINAL, leads
from app.db import CompanyProfile, Job, Prospect, ProspectActivity, ProviderCall, utcnow, write_transaction
from app.openapi import JobResponse

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}/crm', tags=['crm'])
Stage = Literal['new', 'qualified', 'contacted', 'replied', 'negotiating', 'won', 'lost']


class LeadSelection(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id': '0123456789abcdef0123456789abcdef', 'lead_indices': [0]}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    lead_indices: list[int] = Field(min_length=1, max_length=30)


class SourceSelection(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id':'0123456789abcdef0123456789abcdef','record_indices':[0]}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    record_indices: list[int] = Field(min_length=1, max_length=20)


class ProspectInput(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=240)
    location: str = Field(default='', max_length=350)
    website: str = Field(default='', max_length=500)
    contact: str = Field(default='', max_length=500)
    source_url: str = Field(default='', max_length=2000)
    source_note: str = Field(min_length=1, max_length=1000)

    @field_validator('website', 'source_url')
    @classmethod
    def public_url(cls, value):
        if not value:
            return value
        try:
            parts = urlsplit(value)
            if parts.scheme in ('http', 'https') and parts.hostname and not (parts.username or parts.password):
                return value
        except ValueError:
            pass
        raise ValueError('Use an http(s) URL without embedded credentials')


class ImportRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [{'items': [
        {'name': 'Example Buyer', 'location': 'US', 'source_note': '客户提供的展会商务名片'}]}]})
    items: list[ProspectInput] = Field(min_length=1, max_length=200)


class ProspectPatch(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True,
        json_schema_extra={'examples': [{'expected_version': 1, 'stage': 'qualified'}]})
    expected_version: int = Field(ge=1)
    stage: Stage | None = None
    contact: str | None = Field(default=None, max_length=500)
    tags: list[str] | None = Field(default=None, max_length=20)
    do_not_contact: bool | None = None
    next_followup_at: datetime | None = None

    @field_validator('tags')
    @classmethod
    def tag_lengths(cls, values):
        if values is not None and any(not v.strip() or len(v) > 40 for v in values):
            raise ValueError('Tags must contain 1 to 40 characters')
        return list(dict.fromkeys(v.strip() for v in values)) if values is not None else None

    @field_validator('next_followup_at')
    @classmethod
    def utc_date(cls, value):
        if value is not None:
            if value.tzinfo is None:
                raise ValueError('Follow-up timestamp must include a timezone')
            return value.astimezone(timezone.utc).replace(tzinfo=None)
        return value


class ActivityInput(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True,
        json_schema_extra={'examples': [{'kind': 'feedback', 'content': '产品对口，需要核实联系人'}]})
    kind: Literal['note', 'email_sent', 'reply', 'call', 'meeting', 'feedback', 'opt_out'] = 'note'
    content: str = Field(min_length=1, max_length=4000)


class DraftRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True,
        json_schema_extra={'examples': [{'language': 'English', 'objective': 'Introduce our LED products.'}]})
    language: Literal['English', 'Chinese', 'Spanish', 'German', 'French', 'Portuguese'] = 'English'
    objective: str = Field(default='Introduce our product and ask whether it is relevant.', min_length=1, max_length=1000)


class ResearchRequest(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True,
        json_schema_extra={'examples': [{'objective': '查找企业官网、联系我们和公开商务邮箱，核对公司主体。'}]})
    objective: str = Field(default='查找企业官网、联系我们和公开商务邮箱，核对公司主体。', min_length=1, max_length=1000)


class ApplyContact(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True,
        json_schema_extra={'examples': [{'job_id': '0123456789abcdef0123456789abcdef',
                                       'value': 'sales@example.com', 'expected_version': 1}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    value: str = Field(min_length=1, max_length=254)
    expected_version: int = Field(ge=1)


class ProspectView(BaseModel):
    id: str
    name: str
    location: str
    website: str
    contact: str
    stage: Stage
    tags: list[str]
    evidence: dict
    do_not_contact: bool
    version: int
    created_at: str
    updated_at: str
    next_followup_at: str | None
    score: dict


class ImportResult(BaseModel):
    items: list[ProspectView]
    created: int
    reused: int


class ProspectPage(BaseModel):
    items: list[ProspectView]
    total: int
    offset: int
    limit: int


class SummaryView(BaseModel):
    total: int
    stages: dict[str, int]
    due_followups: int
    do_not_contact: int


class ActivityView(BaseModel):
    id: str
    kind: str
    content: str
    created_at: str


class UsageView(BaseModel):
    days: int
    since: str
    provider_calls: list[dict]
    prompt_tokens: int
    completion_tokens: int
    currency: str = 'CNY'
    monetary_scope: str = 'provider_estimates_excluding_model_cost_and_infrastructure'
    public_tool_estimate_milli_cny: int


def get_prospect(session, workspace, prospect_id):
    prospect = session.get(Prospect, prospect_id)
    if prospect is None or prospect.workspace_id != workspace:
        raise HTTPException(404, 'prospect_not_found')
    return prospect


def iso(value):
    return value.isoformat() + 'Z' if value else None


def evidence_score(prospect):
    """Evidence completeness, never a purchase-probability estimate."""
    evidence = prospect.evidence
    reasons = []
    if evidence.get('source', {}).get('url'):
        reasons.append(('source_link', 20))
    if evidence.get('quote'):
        reasons.append(('supported_quote', 20))
    if evidence.get('evidence_type') == 'public_demand_signal':
        reasons.append(('public_procurement_signal_requires_date_check', 20))
    if evidence.get('company_id'):
        reasons.append(('trade_company_identifier', 15))
    if prospect.contact:
        reasons.append(('contact_recorded_not_deliverability_verified', 15))
    if prospect.location:
        reasons.append(('location_recorded', 10))
    return {'value': sum(points for _, points in reasons), 'kind': 'evidence_completeness',
            'factors': [{'code': code, 'points': points} for code, points in reasons]}


def view(prospect):
    return {key: getattr(prospect, key) for key in (
        'id', 'name', 'location', 'website', 'contact', 'stage', 'tags', 'evidence',
        'do_not_contact', 'version')} | {
        'created_at': iso(prospect.created_at), 'updated_at': iso(prospect.updated_at),
        'next_followup_at': iso(prospect.next_followup_at), 'score': evidence_score(prospect)}


def normalize(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', value).strip()).casefold()


def upsert(session, workspace, data, evidence):
    # Conservative identity: exact normalized name + location. Never merge by a directory URL.
    identity = sha256((normalize(data['name']) + '\n' + normalize(data.get('location', ''))).encode()).hexdigest()
    existing = session.scalar(select(Prospect).where(
        Prospect.workspace_id == workspace, Prospect.identity_key == identity))
    if existing:
        return existing, False
    prospect = Prospect(workspace_id=workspace, identity_key=identity, **data, evidence=evidence)
    session.add(prospect)
    session.flush()
    session.add(ProspectActivity(prospect_id=prospect.id, kind='created', content='Imported with source provenance.'))
    return prospect, True


def best_contact(lead):
    if lead.get('contact'):
        return lead['contact'][:500]
    # Never promote a provider-invalid contact. Unknown validity remains explicitly unverified.
    contacts = (lead.get('business_contacts') or {}).get('records', [])
    allowed = [row for row in contacts if row.get('channel') == 'emails' and row.get('validity') != 2]
    allowed.sort(key=lambda row: row.get('validity') != 1)
    return (allowed[0].get('value') or '')[:500] if allowed else ''


@router.post('/prospects/from-leads', response_model=ImportResult)
def save_discoveries(body: LeadSelection, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """将选中任务线索存入 CRM，同名同地区重复导入复用客户，保留首次证据。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        job = ws.get_job(session, workspace, body.job_id)
        if job.operation != 'prospecting' or job.status not in TERMINAL:
            raise HTTPException(409, 'lead_job_not_ready')
        indices = list(dict.fromkeys(body.lead_indices))
        records = leads(job)
        if any(i < 0 or i >= len(records) or not isinstance(records[i], dict) for i in indices):
            raise HTTPException(422, 'invalid_lead_index')
        items, created = [], 0
        for i in indices:
            lead = records[i]
            evidence = {**lead, 'origin_job_id': job.id, 'origin_lead_index': i}
            prospect, added = upsert(session, workspace, {
                'name': lead['name'][:240], 'location': lead.get('location', '')[:350],
                'contact': best_contact(lead), 'website': ''}, evidence)
            items.append(view(prospect))
            created += int(added)
        return {'items': items, 'created': created, 'reused': len(items) - created}


@router.post('/prospects/from-source', response_model=ImportResult)
def save_source_records(body: SourceSelection, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """人工选择官方记录存入待核实客户；多买方且无法区分的公告不能自动作为单一公司保存。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        job = ws.get_job(session, workspace, body.job_id)
        if job.operation != 'source_lookup' or job.status not in ('succeeded', 'partial'):
            raise HTTPException(409, 'source_job_not_ready')
        lookup = (job.result or {}).get('source_lookup') or {}
        records = lookup.get('records', [])
        indices = list(dict.fromkeys(body.record_indices))
        if any(i < 0 or i >= len(records) for i in indices):
            raise HTTPException(422, 'invalid_source_record_index')
        items, created = [], 0
        for index in indices:
            row = records[index]
            if not row.get('entity_name'):
                raise HTTPException(422, 'source_entity_requires_disambiguation')
            evidence = {'evidence_type':row['evidence_type'], 'source':{'url':row['source_url'],
                'provider':lookup['source_id'], 'record_id':row['id'], 'retrieved_at':lookup['retrieved_at']},
                'source_record':row, 'origin_job_id':job.id, 'reason':row.get('summary', ''),
                'procurement_status':row.get('procurement_status', 'unknown')}
            prospect, added = upsert(session, workspace, {'name':row['entity_name'][:240],
                'location':(row.get('country') or row.get('details', {}).get('project_country') or '')[:350],
                'website':'', 'contact':''}, evidence)
            items.append(view(prospect))
            created += int(added)
        return {'items':items,'created':created,'reused':len(items)-created}


@router.post('/prospects/import', response_model=ImportResult)
def import_prospects(body: ImportRequest, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """导入自有/授权的商务线索，每条必须说明来源，每批最多 200 条；不调用付费供应商。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        items, created = [], 0
        for item in body.items:
            evidence = {'evidence_type': 'user_supplied', 'source': {'url': item.source_url},
                        'source_note': item.source_note, 'contact_status': 'unverified'}
            data = item.model_dump(exclude={'source_url', 'source_note'})
            prospect, added = upsert(session, workspace, data, evidence)
            items.append(view(prospect))
            created += int(added)
        return {'items': items, 'created': created, 'reused': len(items) - created}


def filtered(workspace, stage=None, q=None, due=False):
    statement = select(Prospect).where(Prospect.workspace_id == workspace)
    if stage:
        statement = statement.where(Prospect.stage == stage)
    if q:
        statement = statement.where(Prospect.name.contains(q, autoescape=True))
    if due:
        statement = statement.where(Prospect.next_followup_at <= utcnow(), Prospect.do_not_contact.is_(False),
                                    Prospect.stage.not_in(('won', 'lost')))
    return statement


@router.get('/prospects', response_model=ProspectPage)
def list_prospects(workspace: ws.WorkspaceAccess, sessions: ws.Sessions,
                   stage: Stage | None = None, q: str | None = Query(None, max_length=200), due: bool = False,
                   offset: int = Query(0, ge=0, le=100000), limit: int = Query(50, ge=1, le=200)):
    """分页查询客户，支持销售阶段、公司名子串和到期跟进筛选；不调用供应商。"""
    with sessions() as session:
        statement = filtered(workspace, stage, q, due)
        total = session.scalar(select(func.count()).select_from(statement.subquery()))
        rows = session.scalars(statement.order_by(Prospect.created_at.desc(), Prospect.id.desc()).offset(offset).limit(limit))
        return {'items': [view(row) for row in rows], 'total': total, 'offset': offset, 'limit': limit}


def csv_safe(value):
    value = str(value or '')
    # Protect spreadsheet imports, including formulas hidden behind leading whitespace.
    return "'" + value if value.lstrip().startswith(('=', '+', '-', '@')) else value


@router.get('/prospects/export.csv', response_class=Response,
            responses={200: {'description': '带 BOM 的 UTF-8 CSV，最多 10000 条，公式字符已转义。',
                             'content': {'text/csv': {'schema': {'type': 'string'}}}}})
def export_prospects(workspace: ws.WorkspaceAccess, sessions: ws.Sessions,
                     stage: Stage | None = None, q: str | None = Query(None, max_length=200), due: bool = False):
    """导出筛选后的客户 CSV，包含来源 URL 与停止联系标记，防止单元格公式注入。"""
    with sessions() as session:
        rows = list(session.scalars(filtered(workspace, stage, q, due).order_by(Prospect.id).limit(10001)))
        if len(rows) > 10000:
            raise HTTPException(422, 'export_too_large_use_filters')
        output = io.StringIO(newline='')
        writer = csv.writer(output)
        fields = ('id', 'name', 'location', 'website', 'contact', 'stage', 'do_not_contact', 'next_followup_at')
        writer.writerow((*fields, 'evidence_type', 'demand_validity', 'deadline_date', 'source_url'))
        for row in rows:
            writer.writerow([csv_safe(getattr(row, key)) for key in fields] +
                            [csv_safe(row.evidence.get(key, '')) for key in ('evidence_type', 'demand_validity', 'deadline_date')] +
                            [csv_safe(row.evidence.get('source', {}).get('url', ''))])
        return Response('\ufeff' + output.getvalue(), media_type='text/csv; charset=utf-8',
                        headers={'Content-Disposition': 'attachment; filename="prospects.csv"', 'Cache-Control': 'no-store'})


@router.get('/summary', response_model=SummaryView)
def summary(workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """汇总工作空间销售阶段、到期跟进和停止联系数；成交由用户实际记录。"""
    with sessions() as session:
        stages = dict(session.execute(select(Prospect.stage, func.count()).where(
            Prospect.workspace_id == workspace).group_by(Prospect.stage)).all())
        due_count = session.scalar(select(func.count()).select_from(filtered(workspace, due=True).subquery()))
        suppressed = session.scalar(select(func.count()).select_from(Prospect).where(
            Prospect.workspace_id == workspace, Prospect.do_not_contact.is_(True)))
        return {'total': sum(stages.values()), 'stages': stages, 'due_followups': due_count,
                'do_not_contact': suppressed}


@router.get('/usage', response_model=UsageView)
def usage(request: Request, workspace: ws.WorkspaceAccess, sessions: ws.Sessions, days: int = Query(30, ge=1, le=90)):
    """汇总近 N 天上游调用、缓存命中和模型 tokens。

    金额为千分之一人民币元；仅供应商回传金额是上游报告费用，估算不等于账单。
    不包含模型金额与服务器费；tokens 缺失时不可视作零成本。
    """
    since = utcnow()-timedelta(days=days)
    with sessions() as session:
        filters = (Job.workspace_id == workspace, ProviderCall.started_at >= since)
        statement = select(ProviderCall.endpoint, func.count(),
            func.sum(func.coalesce(ProviderCall.estimated_milli_cny, 0)),
            func.sum(case((ProviderCall.status != 'succeeded', 1), else_=0)),
            func.sum(case((ProviderCall.result['cache_hit'].as_boolean().is_(True), 1), else_=0)),
            func.sum(func.coalesce(ProviderCall.result['reported_milli_cny'].as_integer(), 0)),
            func.sum(case((ProviderCall.estimated_milli_cny.is_(None), 1), else_=0))
        ).join(Job, Job.id == ProviderCall.job_id).where(*filters).group_by(ProviderCall.endpoint)
        records = [{'endpoint': endpoint, 'calls': count, 'estimated_or_reserved_milli_cny': int(cost),
                    'unresolved_calls': int(unresolved), 'cache_hits': int(cached),
                    'reported_milli_cny': int(reported), 'calls_without_monetary_estimate': int(unpriced)}
                   for endpoint, count, cost, unresolved, cached, reported, unpriced in session.execute(statement)]
        tokens = session.execute(select(
            func.coalesce(func.sum(ProviderCall.result['usage']['prompt_tokens'].as_integer()), 0),
            func.coalesce(func.sum(ProviderCall.result['usage']['completion_tokens'].as_integer()), 0)
        ).join(Job, Job.id == ProviderCall.job_id).where(*filters, ProviderCall.endpoint == 'model')).one()
        return {'days': days, 'since': iso(since), 'provider_calls': records,
                'prompt_tokens': int(tokens[0]), 'completion_tokens': int(tokens[1]),
                'public_tool_estimate_milli_cny': request.app.state.settings.public_tool_estimate_milli_cny}


@router.get('/prospects/{prospect_id}', response_model=ProspectView)
def prospect_detail(prospect_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """读取客户详情与原始证据；其他工作空间的客户统一返回 404。"""
    with sessions() as session:
        return view(get_prospect(session, workspace, prospect_id))


@router.patch('/prospects/{prospect_id}', response_model=ProspectView)
def update_prospect(prospect_id: str, body: ProspectPatch, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """以 expected_version 乐观锁修改跟进信息；停止联系自动清除跟进时间。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, prospect_id)
        if prospect.version != body.expected_version:
            raise HTTPException(409, 'prospect_version_conflict')
        changes = body.model_dump(exclude_unset=True, exclude={'expected_version'})
        if any(value is None and key != 'next_followup_at' for key, value in changes.items()):
            raise HTTPException(422, 'null_prospect_field')
        for key, value in changes.items():
            setattr(prospect, key, value)
        if prospect.do_not_contact:
            prospect.next_followup_at = None
        if changes:
            prospect.version += 1
            prospect.updated_at = utcnow()
            session.add(ProspectActivity(prospect_id=prospect.id, kind='updated', content=', '.join(sorted(changes))))
        return view(prospect)


@router.get('/prospects/{prospect_id}/activities', response_model=list[ActivityView])
def activities(prospect_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions,
               limit: int = Query(50, ge=1, le=200)):
    """读取最近的客户活动，包含反馈、草稿任务与拒绝联系记录。"""
    with sessions() as session:
        get_prospect(session, workspace, prospect_id)
        rows = session.scalars(select(ProspectActivity).where(ProspectActivity.prospect_id == prospect_id).order_by(
            ProspectActivity.created_at.desc(), ProspectActivity.id.desc()).limit(limit))
        return [{'id': row.id, 'kind': row.kind, 'content': row.content, 'created_at': iso(row.created_at)} for row in rows]


@router.post('/prospects/{prospect_id}/activities', status_code=201, response_model=ActivityView)
def add_activity(prospect_id: str, body: ActivityInput, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """追加活动；回复更新早期销售阶段，opt_out 立即停止联系并清除跟进。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, prospect_id)
        row = ProspectActivity(prospect_id=prospect.id, **body.model_dump())
        session.add(row)
        if body.kind == 'opt_out':
            prospect.do_not_contact = True
            prospect.next_followup_at = None
        elif body.kind == 'reply' and prospect.stage in ('new', 'qualified', 'contacted'):
            prospect.stage = 'replied'
        elif body.kind == 'email_sent' and prospect.stage in ('new', 'qualified'):
            prospect.stage = 'contacted'
        prospect.version += 1
        prospect.updated_at = utcnow()
        session.flush()
        return {'id': row.id, 'kind': row.kind, 'content': row.content, 'created_at': iso(row.created_at)}


@router.post('/prospects/{prospect_id}/drafts', status_code=202, response_model=JobResponse)
def create_draft(prospect_id: str, body: DraftRequest, request: Request,
                 workspace: ws.WorkspaceAccess, sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey):
    """生成有证据约束的开发信草稿，不发送邮件。重试必须复用 Idempotency-Key。"""
    if not idempotency_key:
        raise HTTPException(422, 'idempotency_key_required')
    identity = {'prospect_id': prospect_id, **body.model_dump()}
    fingerprint = ws.request_fingerprint('outreach_draft', identity)
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, prospect_id)
        if prospect.do_not_contact:
            raise HTTPException(409, 'prospect_do_not_contact')
        from app.crm_workbench import blocked_recipient
        if blocked_recipient(session, workspace, prospect_id, prospect.contact):
            raise HTTPException(409, 'prospect_do_not_contact')
        previous = ws.replay_job(session, workspace, idempotency_key, fingerprint)
        if previous:
            return ws.job_view(previous)
        profile = session.get(CompanyProfile, workspace)
        if not profile or not profile.data.get('name') or not profile.data.get('products'):
            raise HTTPException(409, 'company_profile_required')
        payload = {**identity, 'prospect': view(prospect), 'company': profile.data}
        job = ws.enqueue(session, workspace, request.app.state.settings, 'outreach_draft', payload, idempotency_key, fingerprint)
        session.add(ProspectActivity(prospect_id=prospect.id, kind='draft_requested', content=job.id))
        return ws.job_view(job)


@router.post('/prospects/{prospect_id}/research', status_code=202, response_model=JobResponse)
def research_prospect(prospect_id: str, body: ResearchRequest, request: Request,
                      workspace: ws.WorkspaceAccess, sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey):
    """公域核验已保存企业并寻找公开邮箱；使用 report 点数，不调用跨境魔方。

    邮箱直接提取自供应商返回的正文，不生成猜测地址。结果须由用户核对公司主体后再采用。
    """
    if not idempotency_key:
        raise HTTPException(422, 'idempotency_key_required')
    identity = {'prospect_id': prospect_id, **body.model_dump()}
    fingerprint = ws.request_fingerprint('prospect_research', identity)
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, prospect_id)
        previous = ws.replay_job(session, workspace, idempotency_key, fingerprint)
        if previous:
            return ws.job_view(previous)
        profile = session.get(CompanyProfile, workspace)
        lead = {**prospect.evidence, 'name': prospect.name, 'location': prospect.location, 'website': prospect.website,
                'contact': prospect.contact, 'source': prospect.evidence.get('source') or
                    {'url': prospect.website, 'title': prospect.name}}
        payload = {'prospect_id': prospect.id, 'lead': lead, 'research_objective': body.objective,
                   'target_product': (profile.data if profile else {}).get('products', '')[:150]}
        job = ws.enqueue(session, workspace, request.app.state.settings, 'report', payload, idempotency_key, fingerprint)
        session.add(ProspectActivity(prospect_id=prospect.id, kind='research_requested', content=job.id))
        return ws.job_view(job)


@router.post('/prospects/{prospect_id}/apply-contact', response_model=ProspectView)
def apply_researched_contact(prospect_id: str, body: ApplyContact,
                             workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """人工选用本客户核验结果或保存的官方公告邮箱，保留来源；不代表已验证可投递。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        prospect = get_prospect(session, workspace, prospect_id)
        if prospect.version != body.expected_version:
            raise HTTPException(409, 'prospect_version_conflict')
        job = ws.get_job(session, workspace, body.job_id)
        if job.status not in ('succeeded', 'partial'):
            raise HTTPException(409, 'research_job_not_ready')
        candidate = None
        if job.operation == 'report' and job.payload.get('prospect_id') == prospect_id:
            candidate = next((row for row in (job.result or {}).get('contact_candidates', []) if row.get('value') == body.value), None)
        elif job.operation == 'source_lookup' and prospect.evidence.get('origin_job_id') == job.id:
            saved_source = prospect.evidence.get('source') or {}
            records = (job.result or {}).get('source_lookup', {}).get('records', [])
            record = next((row for row in records if row.get('id') == saved_source.get('record_id')
                and row.get('source_url') == saved_source.get('url')
                and row.get('entity_name') == prospect.name
                and row.get('details', {}).get('published_procurement_email') == body.value), None)
            if record:
                candidate = {'value':body.value, 'source_url':record['source_url'],
                    'verification_status':'official_notice_unverified', 'record_id':record['id']}
        else:
            raise HTTPException(409, 'research_job_not_ready')
        if candidate is None:
            raise HTTPException(422, 'research_contact_not_found')
        prospect.contact = body.value
        prospect.evidence = {**prospect.evidence, 'selected_contact': {**candidate, 'origin_job_id': job.id,
            'selection': 'user_reviewed'}}
        prospect.version += 1
        prospect.updated_at = utcnow()
        session.add(ProspectActivity(prospect_id=prospect.id, kind='contact_selected',
            content=f'{body.value}\n{candidate.get("source_url", "")}'))
        return view(prospect)
