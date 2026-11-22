import json
from datetime import date, datetime, timedelta
from hashlib import sha256
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator
from urllib.parse import urlsplit
from sqlalchemy import func, select, or_

from app.auth import session_factory, workspace_access
from app.config import BILLABLE_OPERATIONS, BUYER_OPERATIONS
from app.db import Agent, AgentSchedule, AgentVersion, Job, PointEntry, ProviderCall, Wallet, Workspace, utcnow, write_transaction
from app.point_pricing import POINTS_PER_CNY,quote as point_quote


router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}', tags=['workspaces'])
WorkspaceAccess = Annotated[str, Depends(workspace_access)]
Sessions = Annotated[object, Depends(session_factory)]
IdempotencyKey = Annotated[str | None, Header(min_length=1, max_length=64, pattern=r'^[a-z0-9._-]+$')]
ACTIVE_STATES = ('queued', 'running', 'cancelling')


class AgentConfig(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    instructions: str = Field(min_length=1, max_length=1600)
    market: str | None = Field(default=None, max_length=100)
    product: str | None = Field(default=None, max_length=150)
    hs_code: str | None = Field(default=None, pattern=r'^[0-9]{6,10}$')
    target_count: int | None = Field(default=None, ge=1, le=30)
    buyer_role: Literal['any', 'distributor', 'manufacturer', 'brand', 'service_provider', 'public_buyer'] = 'any'
    seed_website: str | None = Field(default=None, max_length=500)
    exclude_keywords: list[str] = Field(default_factory=list, max_length=20)
    exclude_domains: list[str] = Field(default_factory=list, max_length=20)
    reference_websites: list[str] = Field(default_factory=list, max_length=5)
    public_sources: list[Literal['ted']] = Field(default_factory=list, max_length=1)

    @field_validator('seed_website')
    @classmethod
    def seed_url(cls, value):
        if value is None:
            return value
        try:
            url = urlsplit(value)
            if url.scheme in ('http', 'https') and url.hostname and not (url.username or url.password):
                return value
        except ValueError:
            pass
        raise ValueError('Seed website must be an HTTP(S) URL without embedded credentials')

    @field_validator('exclude_keywords')
    @classmethod
    def exclusions(cls, values):
        if any(not value.strip() or len(value) > 80 for value in values):
            raise ValueError('Each exclusion must have 1–80 characters')
        return list(dict.fromkeys(value.strip() for value in values))

    @field_validator('reference_websites')
    @classmethod
    def references(cls, values):
        return list(dict.fromkeys(cls.seed_url(value) for value in values))

    @field_validator('exclude_domains')
    @classmethod
    def excluded_domains(cls, values):
        result = []
        for value in values:
            value = value.strip().lower().removeprefix('www.').rstrip('.')
            if len(value) > 253 or '.' not in value or any(char not in 'abcdefghijklmnopqrstuvwxyz0123456789-.' for char in value):
                raise ValueError('Excluded domains must be bare hostnames')
            if value not in result:
                result.append(value)
        return result


class AgentConfigPatch(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: str | None = None
    instructions: str | None = None
    market: str | None = None
    product: str | None = None
    hs_code: str | None = None
    target_count: int | None = None
    buyer_role: Literal['any', 'distributor', 'manufacturer', 'brand', 'service_provider', 'public_buyer'] | None = None
    seed_website: str | None = None
    exclude_keywords: list[str] | None = None
    exclude_domains: list[str] | None = None
    reference_websites: list[str] | None = None
    public_sources: list[Literal['ted']] | None = None


class PublicSearch(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    instructions: str = Field(min_length=1, max_length=1000)


class ProspectingRunRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    acquisition_tier: Literal['basic', 'enhanced', 'ai_enhanced'] = 'basic'
    confirm_paid: bool = False
    enhancement_goal: Literal['trade', 'contacts'] = 'trade'
    contact_target: Literal['procurement', 'leadership', 'sales', 'engineering'] = 'procurement'
    contact_titles: list[str] = Field(default_factory=list, max_length=6)

    @model_validator(mode='after')
    def contact_criteria(self):
        from app.targeted_contacts import TargetCriteria
        TargetCriteria(contact_target=self.contact_target, contact_titles=self.contact_titles)
        return self


class ReportRequest(BaseModel):
    job_id: str = Field(min_length=32, max_length=32)
    lead_index: int = Field(ge=0, lt=30)


class CustomsVerificationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra='forbid')

    buyer: str = Field(min_length=1, max_length=200)
    buyer_country: str = Field(pattern=r'^[A-Z]{2}$')
    arrival_country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    hs_code: str | None = Field(default=None, pattern=r'^[0-9]{6}$')
    product: str | None = Field(default=None, min_length=1, max_length=150)
    date_start: date
    date_end: date
    confirm_paid: Literal[True]
    match_job_id: str | None = Field(default=None, min_length=32, max_length=32)
    company_id: int | None = Field(default=None, ge=1, le=2**53 - 1)

    @model_validator(mode='after')
    def check_filters(self):
        if not (self.hs_code or self.product):
            raise ValueError('hs_code or product is required')
        if self.date_start > self.date_end or self.date_end >= date.max:
            raise ValueError('invalid trade date range')
        if bool(self.match_job_id) != bool(self.company_id):
            raise ValueError('match_job_id and company_id must be submitted together')
        return self


class BuyerRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra='forbid')

    action: Literal['search', 'profile', 'contacts']
    buyer: str | None = Field(default=None, min_length=1, max_length=200)
    buyer_country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    match_job_id: str | None = Field(default=None, min_length=32, max_length=32)
    company_id: int | None = Field(default=None, ge=1, le=2**53 - 1)
    confirm_paid: Literal[True]

    @model_validator(mode='after')
    def check_target(self):
        if self.action == 'search':
            valid = self.buyer and self.buyer_country and not (self.match_job_id or self.company_id)
        else:
            valid = self.match_job_id and self.company_id and not (self.buyer or self.buyer_country)
        if not valid:
            raise ValueError('Search requires buyer and country. Other actions require a selected search result.')
        return self


def lock_workspace(session, workspace: str) -> None:
    session.execute(select(Workspace.id).where(Workspace.id == workspace).with_for_update()).scalar_one()


def get_agent(session, workspace: str, agent_id: str) -> Agent:
    agent = session.get(Agent, agent_id)
    if agent is None or agent.workspace_id != workspace or agent.deleted_at is not None:
        raise HTTPException(status_code=404, detail='agent_not_found')
    return agent


def current_config(session, agent: Agent) -> dict:
    return session.get(AgentVersion, (agent.workspace_id, agent.id, agent.config_version)).config


def agent_view(session, agent: Agent) -> dict:
    return {
        'id': agent.id,
        'status': agent.status,
        'config_version': agent.config_version,
        'config': current_config(session, agent),
    }


def job_view(job: Job) -> dict:
    return {
        'id': job.id,
        'agent_id': job.agent_id,
        'config_version': job.config_version,
        'operation': job.operation,
        'acquisition_tier': job.payload.get('acquisition_tier', 'basic') if job.operation == 'prospecting' else None,
        'status': job.status,
        'point_cost': job.point_cost,
        'points_charged': job.points_charged,
        'error': job.error,
        'result': job.result,
        'created_at': job.created_at.isoformat() + 'Z',
    }


def get_job(session, workspace: str, job_id: str) -> Job:
    job = session.get(Job, job_id)
    if job is None or job.workspace_id != workspace:
        raise HTTPException(status_code=404, detail='job_not_found')
    return job


def request_fingerprint(operation: str, identity: dict) -> str:
    return sha256(json.dumps([operation, identity], sort_keys=True, ensure_ascii=True).encode()).hexdigest()


def replay_job(session, workspace: str, key: str | None, fingerprint: str) -> Job | None:
    if key is None:
        return None
    job = session.scalar(select(Job).where(Job.workspace_id == workspace, Job.idempotency_key == key))
    if job is not None and job.request_hash != fingerprint:
        raise HTTPException(status_code=409, detail='idempotency_key_conflict')
    return job


def enqueue(session, workspace, settings, operation, payload, key, fingerprint, agent=None) -> Job:
    pending = session.scalar(select(func.count()).select_from(Job).where(
        Job.workspace_id == workspace, Job.status.in_(ACTIVE_STATES),
    ))
    if pending >= settings.max_pending_jobs:
        raise HTTPException(status_code=429, detail='job_queue_limit')

    pricing=point_quote(settings,operation,payload)
    points = pricing['total_points']
    wallet = session.get(Wallet, workspace)
    if wallet.available < points:
        raise HTTPException(status_code=409, detail='insufficient_points')

    job = Job(
        workspace_id=workspace, operation=operation, payload={**payload,'point_pricing':pricing}, point_cost=points,
        agent_id=agent.id if agent else None, config_version=agent.config_version if agent else None,
        idempotency_key=key, request_hash=fingerprint,
    )
    session.add(job)
    session.flush()
    if points:
        wallet.available -= points
        wallet.reserved += points
        session.add(PointEntry(workspace_id=workspace, reference=job.id, kind='reserve', points=points))
    return job


def has_deliverable(operation: str, result: dict | None) -> bool:
    if operation in ('directory_companies', 'directory_people', 'directory_contacts', 'targeted_contacts'):
        return bool((result or {}).get('directory', {}).get('records'))
    if operation == 'source_lookup':
        return bool((result or {}).get('source_lookup', {}).get('records'))
    if operation == 'report' and (result or {}).get('contact_candidates'):
        return True
    field = {'prospecting': 'leads', 'report': 'report', 'public_search': 'sources', 'outreach_draft': 'draft',
             'customs_verification': 'customs', 'trade_search': 'customs', **dict.fromkeys(BUYER_OPERATIONS.values(), 'buyer')}.get(operation)
    return bool(field and (result or {}).get(field))


def finish_job(session, job: Job, status: str, result: dict | None = None, error: str | None = None) -> None:
    if job.status not in ACTIVE_STATES:
        return
    if job.cancel_requested:
        status = 'cancelled'
    charged = job.point_cost if status == 'succeeded' or (
        status == 'partial' and has_deliverable(job.operation, result)
    ) else 0
    pricing=job.payload.get('point_pricing')
    if charged and pricing:
        supplier_calls=session.scalars(select(ProviderCall).where(ProviderCall.job_id==job.id,
            ProviderCall.endpoint.startswith('upkuajing_',autoescape=True),ProviderCall.status=='succeeded'))
        values=[(call.result or {}).get('reported_milli_cny') for call in supplier_calls]
        reported=sum(value for value in values if type(value) is int and value>=0)
        data=min(pricing['data_points'],(reported*pricing['points_per_cny']+999)//1000)
        charged=pricing['platform_points']+data
        if result is not None:result={**result,'point_settlement':{
            'platform_points':pricing['platform_points'],'data_points':data,'released_points':job.point_cost-charged,
            'data_costs_without_report_not_charged':True}}
    if job.point_cost:
        wallet = session.get(Wallet, job.workspace_id)
        wallet.reserved -= job.point_cost
        wallet.available += job.point_cost - charged
        if charged:session.add(PointEntry(workspace_id=job.workspace_id,reference=job.id,kind='charge',points=charged))
        if job.point_cost>charged:session.add(PointEntry(workspace_id=job.workspace_id,reference=job.id,
            kind='release',points=job.point_cost-charged))
    job.status = status
    job.result = result
    job.error = error
    job.points_charged = charged
    job.finished_at = utcnow()
    fetched = session.scalars(select(ProviderCall).where(ProviderCall.job_id == job.id, ProviderCall.endpoint == 'fetch'))
    for call in fetched:
        if call.result is not None:
            call.result = {'evidence_status': 'text_available' if call.result.get('content') else 'empty',
                           'cache_hit': bool(call.result.get('cache_hit'))}


@router.get('/points')
def points_balance(workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        wallet = session.get(Wallet, workspace)
        return {'available': wallet.available, 'reserved': wallet.reserved, 'points_per_100_cny': 100*POINTS_PER_CNY}


@router.get('/points/ledger')
def point_ledger(workspace: WorkspaceAccess, sessions: Sessions, limit: int = Query(50, ge=1, le=100)):
    with sessions() as session:
        entries = session.scalars(select(PointEntry).where(PointEntry.workspace_id == workspace).order_by(
            PointEntry.created_at.desc(), PointEntry.id.desc(),
        ).limit(limit))
        return [{'kind': item.kind, 'points': item.points, 'reference': item.reference,
                 'created_at': item.created_at.isoformat() + 'Z'} for item in entries]


@router.get('/points/costs')
def point_costs(request: Request, workspace: WorkspaceAccess):
    settings = request.app.state.settings
    return {operation: settings.point_cost(operation) for operation in sorted(BILLABLE_OPERATIONS)}


class PointQuote(BaseModel):
    platform_points: int
    data_points: int
    total_points: int
    data_budget_milli_cny: int
    points_per_cny: int
    data_settlement: str


@router.get('/points/quotes',response_model=dict[str,PointQuote])
def point_quotes(request: Request,workspace: WorkspaceAccess):
    """完整点数预占报价，包含付费数据预算；增强档最多 600 数据点，已明确回传费用结算后释放差额。"""
    settings=request.app.state.settings
    return {**{operation:point_quote(settings,operation) for operation in sorted(BILLABLE_OPERATIONS)},
        'prospecting_enhanced':point_quote(settings,'prospecting',{'acquisition_tier':'enhanced'}),
        'prospecting_ai_enhanced':point_quote(settings,'prospecting',{'acquisition_tier':'ai_enhanced'})}


@router.post('/agents', status_code=201)
def create_agent(body: AgentConfig, request: Request, workspace: WorkspaceAccess, sessions: Sessions):
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        limit = request.app.state.settings.max_agent_instances
        if limit is not None and session.scalar(select(func.count()).select_from(Agent).where(
            Agent.workspace_id == workspace, Agent.deleted_at.is_(None),
        )) >= limit:
            raise HTTPException(status_code=409, detail='agent_limit_reached')

        agent = Agent(workspace_id=workspace)
        session.add(agent)
        session.flush()
        session.add(AgentVersion(workspace_id=workspace, agent_id=agent.id, version=1, config=body.model_dump()))
        session.flush()
        return agent_view(session, agent)


@router.get('/agents')
def list_agents(workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        agents = session.scalars(select(Agent).where(Agent.workspace_id == workspace, Agent.deleted_at.is_(None)))
        return [agent_view(session, agent) for agent in agents]


@router.get('/agents/{agent_id}')
def agent_details(agent_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        return agent_view(session, get_agent(session, workspace, agent_id))


@router.patch('/agents/{agent_id}')
def update_agent(agent_id: str, body: AgentConfigPatch, workspace: WorkspaceAccess, sessions: Sessions):
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        agent = get_agent(session, workspace, agent_id)
        changes = body.model_dump(exclude_unset=True)
        if not changes:
            return agent_view(session, agent)
        try:
            config = AgentConfig.model_validate({**current_config(session, agent), **changes})
        except ValidationError:
            raise HTTPException(status_code=422, detail='invalid_agent_configuration') from None
        agent.config_version += 1
        session.add(AgentVersion(workspace_id=workspace, agent_id=agent.id,
                                 version=agent.config_version, config=config.model_dump()))
        session.flush()
        return agent_view(session, agent)


@router.post('/agents/{agent_id}/runs', status_code=202)
def start_agent(agent_id: str, request: Request, workspace: WorkspaceAccess, sessions: Sessions,
                idempotency_key: IdempotencyKey = None, body: ProspectingRunRequest = ProspectingRunRequest()):
    identity = {'agent_id': agent_id}
    if body.acquisition_tier in ('enhanced', 'ai_enhanced'):
        if not body.confirm_paid:
            raise HTTPException(409, 'paid_confirmation_required')
        identity['acquisition_tier'] = body.acquisition_tier
        if body.acquisition_tier == 'ai_enhanced':
            identity.update(contact_target=body.contact_target, contact_titles=body.contact_titles)
        if body.enhancement_goal == 'contacts':
            identity['enhancement_goal'] = 'contacts'
    fingerprint = request_fingerprint('prospecting', identity)
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        replay = replay_job(session, workspace, idempotency_key, fingerprint)
        if replay is not None:
            return job_view(replay)
        if body.acquisition_tier in ('enhanced', 'ai_enhanced') and not customs_available(request):
            raise HTTPException(503, 'customs_provider_unavailable')
        if body.acquisition_tier == 'ai_enhanced' and (not request.app.state.settings.hunter_api_key or request.app.state.settings.hunter_daily_call_limit <= 0):
            raise HTTPException(503, 'hunter_not_configured')
        agent = get_agent(session, workspace, agent_id)
        active = session.scalar(select(Job.id).where(
            Job.workspace_id == workspace, Job.agent_id == agent.id, Job.status.in_(ACTIVE_STATES),
        ).limit(1))
        if active:
            raise HTTPException(status_code=409, detail='agent_run_in_progress')
        agent.status = 'enabled'
        payload = {**current_config(session, agent), 'acquisition_tier': body.acquisition_tier}
        if body.acquisition_tier in ('enhanced', 'ai_enhanced'):
            payload['enhancement_goal'] = body.enhancement_goal
            payload['paid_budget_milli_cny'] = 7000 if body.acquisition_tier == 'ai_enhanced' else 6000
            if body.acquisition_tier == 'ai_enhanced':
                payload.update(contact_target=body.contact_target, contact_titles=body.contact_titles)
            payload['trade_date_end'] = utcnow().date().isoformat()
            payload['trade_date_start'] = (utcnow().date() - timedelta(days=365)).isoformat()
        return job_view(enqueue(session, workspace, request.app.state.settings, 'prospecting',
                                payload, idempotency_key, fingerprint, agent))


def stop_agent(session, agent: Agent, delete: bool) -> None:
    agent.status = 'deleted' if delete else 'paused'
    schedule = session.get(AgentSchedule, agent.id)
    if schedule and schedule.enabled:
        schedule.enabled = False
        schedule.version += 1
    if delete:
        agent.deleted_at = utcnow()
    active = session.scalars(select(Job).where(
        Job.workspace_id == agent.workspace_id, Job.agent_id == agent.id, Job.status.in_(ACTIVE_STATES),
    ))
    for job in active:
        job.cancel_requested = True
        if job.status == 'queued':
            finish_job(session, job, 'cancelled')
        else:
            job.status = 'cancelling'


@router.post('/agents/{agent_id}/pause')
def pause_agent(agent_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        agent = get_agent(session, workspace, agent_id)
        stop_agent(session, agent, delete=False)
        return agent_view(session, agent)


@router.delete('/agents/{agent_id}', status_code=204)
def delete_agent(agent_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        agent = session.get(Agent, agent_id)
        if agent is None or agent.workspace_id != workspace:
            raise HTTPException(status_code=404, detail='agent_not_found')
        if agent.deleted_at is None:
            stop_agent(session, agent, delete=True)


@router.get('/jobs')
def list_jobs(workspace: WorkspaceAccess, sessions: Sessions, agent_id: str | None = None,
              limit: int = Query(50, ge=1, le=100)):
    with sessions() as session:
        query = select(Job).where(Job.workspace_id == workspace)
        if agent_id is not None:
            query = query.where(Job.agent_id == agent_id)
        return [job_view(job) for job in session.scalars(query.order_by(Job.created_at.desc(), Job.id.desc()).limit(limit))]


@router.get('/jobs/{job_id}')
def job_details(job_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        return job_view(get_job(session, workspace, job_id))


@router.get('/jobs/{job_id}/leads')
def job_leads(job_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        job = get_job(session, workspace, job_id)
        return (job.result or {}).get('leads', [])


class ProviderHttpLog(BaseModel):
    id: str
    step: str
    endpoint: str
    status: str
    error: str | None
    started_at: datetime | None
    request: dict | None
    response: dict | None


@router.get('/jobs/{job_id}/provider-logs', summary='查询跨境魔方接口请求与返回日志',
            response_model=list[ProviderHttpLog])
def job_provider_logs(job_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    """读取本工作空间任务的上游调用日志，含脱敏请求、返回、HTTP 状态和耗时。

    包含跨境魔方与 Hunter 的实际调用；旧任务可能没有请求或返回正文。
    JSON 正文最多保留 100000 字符预览，非 JSON 返回只记录类型与字节数。
    """
    with sessions() as session:
        get_job(session, workspace, job_id)
        calls = session.scalars(select(ProviderCall).where(
            ProviderCall.job_id == job_id,
            or_(ProviderCall.endpoint.startswith('upkuajing_', autoescape=True),
                ProviderCall.endpoint.startswith('hunter_', autoescape=True)),
        ).order_by(ProviderCall.started_at, ProviderCall.id))
        return [{'id': call.id, 'step': call.step, 'endpoint': call.endpoint, 'status': call.status,
                 'error': call.error, 'started_at': call.started_at,
                 'request': call.http_request, 'response': call.http_response} for call in calls]


@router.post('/public-searches', status_code=202)
def public_search(body: PublicSearch, request: Request, workspace: WorkspaceAccess, sessions: Sessions,
                  idempotency_key: IdempotencyKey = None):
    payload = body.model_dump()
    fingerprint = request_fingerprint('public_search', payload)
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        job = replay_job(session, workspace, idempotency_key, fingerprint)
        if job is None:
            job = enqueue(session, workspace, request.app.state.settings, 'public_search',
                          payload, idempotency_key, fingerprint)
        return job_view(job)


def selected_buyer(session, workspace: str, job_id: str, company_id: int) -> dict:
    job = get_job(session, workspace, job_id)
    matches = (job.result or {}).get('buyer', {}).get('records', [])
    if job.operation == 'buyer_search' and job.status == 'succeeded':
        for match in matches:
            if match.get('company_id') == company_id:
                return match
    raise HTTPException(status_code=404, detail='buyer_match_not_found')


def customs_available(request: Request) -> bool:
    return request.app.state.customs_configured and request.app.state.settings.upkuajing_daily_call_limit > 0


@router.post('/buyer-enrichments', status_code=202)
def enrich_buyer(body: BuyerRequest, request: Request, workspace: WorkspaceAccess,
                 sessions: Sessions, idempotency_key: IdempotencyKey = None):
    if idempotency_key is None:
        raise HTTPException(status_code=422, detail='idempotency_key_required')
    operation = BUYER_OPERATIONS[body.action]
    submitted = body.model_dump(mode='json', exclude={'confirm_paid'}, exclude_none=True)
    fingerprint = request_fingerprint(operation, submitted)
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        job = replay_job(session, workspace, idempotency_key, fingerprint)
        if job is not None:
            return job_view(job)

        payload = submitted if body.action == 'search' else selected_buyer(session, workspace, body.match_job_id, body.company_id)
        job = session.scalar(select(Job).where(
            Job.workspace_id == workspace, Job.request_hash == fingerprint,
            Job.created_at >= utcnow() - timedelta(hours=24), Job.status.in_((*ACTIVE_STATES, 'succeeded')),
        ).order_by(Job.created_at.desc()).limit(1))
        if job is None:
            if not customs_available(request):
                raise HTTPException(status_code=503, detail='customs_provider_unavailable')
            job = enqueue(session, workspace, request.app.state.settings, operation, payload, idempotency_key, fingerprint)
        return job_view(job)


@router.post('/customs-verifications', status_code=202)
def customs_verification(body: CustomsVerificationRequest, request: Request, workspace: WorkspaceAccess,
                         sessions: Sessions, idempotency_key: IdempotencyKey = None):
    if idempotency_key is None:
        raise HTTPException(status_code=422, detail='idempotency_key_required')
    settings = request.app.state.settings
    payload = body.model_dump(mode='json', exclude={'confirm_paid'})
    fingerprint = request_fingerprint('customs_verification', payload)
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        job = replay_job(session, workspace, idempotency_key, fingerprint)
        if job is None:
            if not customs_available(request):
                raise HTTPException(status_code=503, detail='customs_provider_unavailable')
            if body.company_id is not None:
                selected = selected_buyer(session, workspace, body.match_job_id, body.company_id)
                payload.update(buyer=selected['name'], buyer_country=selected.get('buyer_country') or body.buyer_country)
            job = enqueue(session, workspace, settings, 'customs_verification', payload, idempotency_key, fingerprint)
        return job_view(job)


@router.post('/reports', status_code=202)
def create_report(body: ReportRequest, request: Request, workspace: WorkspaceAccess, sessions: Sessions,
                  idempotency_key: IdempotencyKey = None):
    fingerprint = request_fingerprint('report', body.model_dump())
    with write_transaction(sessions) as session:
        lock_workspace(session, workspace)
        replay = replay_job(session, workspace, idempotency_key, fingerprint)
        if replay is not None:
            return job_view(replay)
        source = get_job(session, workspace, body.job_id)
        leads = (source.result or {}).get('leads', [])
        if body.lead_index >= len(leads):
            raise HTTPException(status_code=404, detail='lead_not_found')
        criteria = (source.result or {}).get('criteria', {})
        payload = {'source_job_id': source.id, 'lead': leads[body.lead_index],
                   'target_product': criteria.get('product') or source.payload.get('product')}
        return job_view(enqueue(session, workspace, request.app.state.settings, 'report',
                                payload, idempotency_key, fingerprint))


@router.get('/reports/{report_id}')
def report_details(report_id: str, workspace: WorkspaceAccess, sessions: Sessions):
    with sessions() as session:
        job = get_job(session, workspace, report_id)
        if job.operation != 'report':
            raise HTTPException(status_code=404, detail='report_not_found')
        view = job_view(job)
        result = job.result or {}
        if not result.get('report'):
            return view

        sources = result.get('sources', [])
        fetch_by_step = {}
        if any('evidence_status' not in source for source in sources):
            fetches = session.scalars(select(ProviderCall).where(
                ProviderCall.job_id == job.id, ProviderCall.endpoint == 'fetch',
            ))
            fetch_by_step = {call.step: call for call in fetches}

        enriched = []
        for source in sources:
            status = source.get('evidence_status')
            if status is None:
                digest = sha256((source.get('url') or '').encode()).hexdigest()[:24]
                fetch = fetch_by_step.get(f'fetch-{digest}')
                if fetch is not None and fetch.status != 'succeeded':
                    status = 'fetch_failed'
                elif fetch is not None and (fetch.estimated_milli_cny == 5 or
                        (fetch.result or {}).get('evidence_status') == 'text_available'):
                    status = 'text_available'
                else:
                    status = 'summary_only' if source.get('summary') or source.get('snippet') else 'link_only'
            enriched.append({**source, 'evidence_status': status})

        lead = job.payload.get('lead', {})
        subject = {field: lead.get(field) for field in ('name', 'location', 'role')}
        view['result'] = {**result, 'sources': enriched, 'subject': subject}
        return view
