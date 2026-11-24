"""Workspace-authenticated access to the official source catalog and bounded searches."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

from app import workspaces as ws
from app.db import write_transaction
from app.openapi import JobResponse
from app.public_sources import TED_COUNTRIES
from app.source_catalog import DIRECT_SOURCES, SITE_SOURCES, catalog
from app.source_models import SourceDescriptor

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}/sources', tags=['sources'])


class SourceQuery(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True, json_schema_extra={'examples': [
        {'source_id':'gleif','query':'Siemens','country':'DE','limit':10},
        {'source_id':'ted','query':'lighting','since_days':90,'limit':10}]})
    source_id: str = Field(min_length=1, max_length=40)
    query: str = Field(min_length=1, max_length=120, pattern=r'^[^\r\n\x00]+$')
    country: str | None = Field(default=None, pattern=r'^[A-Z]{2}$')
    limit: int = Field(default=10, ge=1, le=20)
    since_days: int = Field(default=90, ge=1, le=365)
    entity_category: Literal['GENERAL', 'BRANCH', 'FUND', 'ALL'] = 'GENERAL'
    procurement_stage: Literal['tender', 'award', 'all'] = 'tender'


@router.get('', response_model=list[SourceDescriptor])
def list_sources(request: Request, workspace: ws.WorkspaceAccess):
    """列出正式数据源及真实接入模式：原生 API 或限定官方网站的公域搜索。

    configured 仅表示配置齐备，不代表此刻上游连通；不返回密钥。
    """
    return catalog(request.app.state.settings)


def search_operation(settings, source_id):
    web_fallback = (source_id == 'companies_house' and not settings.companies_house_api_key
                    and settings.llm_api_key and settings.tools_api_key)
    return 'source_lookup' if source_id in DIRECT_SOURCES and not web_fallback else 'public_search'


@router.post('/searches', status_code=202, response_model=JobResponse)
def search_source(body: SourceQuery, request: Request, workspace: ws.WorkspaceAccess,
                  sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey):
    """提交单来源、单页搜索，必须携带 Idempotency-Key。

    原生来源不调用模型；其他来源使用现有 AI 限站搜索。
    英国 OCDS 仅扫描一页最多100条后本地匹配关键词，返回扫描数及窗口，不是全库关键词搜索。
    供应商数据费与平台点数分开；Companies House 需服务端密钥。不自动翻页或合并不同实体。
    """
    source_id = body.source_id
    if source_id not in DIRECT_SOURCES and source_id not in SITE_SOURCES:
        raise HTTPException(422, 'open_source_not_supported')
    if source_id == 'ted' and body.country and body.country not in TED_COUNTRIES:
        raise HTTPException(422, 'open_source_country_not_supported')
    if source_id == 'companies_house' and body.country not in (None, 'GB'):
        raise HTTPException(422, 'open_source_country_not_supported')
    if source_id in ('find_tender', 'contracts_finder') and body.country not in (None, 'GB'):
        raise HTTPException(422, 'open_source_country_not_supported')
    if source_id == 'worldbank_notices' and body.country:
        raise HTTPException(422, 'open_source_country_not_supported')
    settings = request.app.state.settings
    identity = body.model_dump()
    operation = search_operation(settings, source_id)
    fingerprint = ws.request_fingerprint(operation, identity)
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        previous = ws.replay_job(session, workspace, idempotency_key, fingerprint)
        if previous:
            return ws.job_view(previous)
        if source_id in DIRECT_SOURCES and settings.public_source_daily_call_limit == 0:
            raise HTTPException(503, 'open_sources_disabled')
        if source_id == 'companies_house' and not settings.companies_house_api_key and operation == 'source_lookup':
            raise HTTPException(503, 'open_source_not_configured')
        if operation == 'public_search':
            domains = ['find-and-update.company-information.service.gov.uk'] if source_id == 'companies_house' else SITE_SOURCES[source_id][2]
            identity = {**identity, 'source_domains': domains,
                'instructions': f'在指定官方站点查找与 {body.query} 相关的公开情报。'
                    f'目标国家：{body.country or "不限"}。区分采购公告、历史结果和一般资料，不能把登记信息认作采购意向。'}
        return ws.job_view(ws.enqueue(session, workspace, settings, operation, identity, idempotency_key, fingerprint))
