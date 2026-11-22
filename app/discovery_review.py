"""Small public previews and feedback scoped to the same discovery profile."""
from hashlib import sha256
import json
import unicodedata
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from app import workspaces as ws
from app.db import DiscoveryFeedback, write_transaction
from app.openapi import JobResponse

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}/discovery', tags=['discovery'])


def normalized(value):
    return ' '.join(unicodedata.normalize('NFKC', value or '').casefold().split())


def profile_key(payload):
    keys = ('market', 'product', 'buyer_role', 'instructions')
    return sha256(json.dumps({key: normalized(payload.get(key)) for key in keys}, sort_keys=True).encode()).hexdigest()


def entity_key(lead):
    return sha256((normalized(lead['name'])+'\n'+normalized(lead.get('location'))).encode()).hexdigest()


class Preview(ws.AgentConfig):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'name': '美国镍合金经销商预览', 'market': 'US', 'product': 'nickel alloy', 'instructions': 'Find nickel alloy distributors', 'buyer_role': 'distributor'}]})


@router.post('/preview', status_code=202, response_model=JobResponse)
def discovery_preview(body: Preview, request: Request,
                      workspace: ws.WorkspaceAccess, sessions: ws.Sessions, idempotency_key: ws.IdempotencyKey = None):
    """按现有画像提交最多5家真实公域样本；不创建员工、不启用周期或外联、不调用付费数据源。

    使用基础发现平台点数；样本不足时如实返回。预览反馈只作用于相同市场、产品、角色与筛选要求。
    """
    if not idempotency_key:
        raise HTTPException(422, 'idempotency_key_required')
    payload = {**body.model_dump(), 'target_count': min(body.target_count or 5, 5), 'acquisition_tier': 'basic', 'preview': True}
    fingerprint = ws.request_fingerprint('prospecting', payload)
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        job = ws.replay_job(session, workspace, idempotency_key, fingerprint)
        if not job:
            job = ws.enqueue(session, workspace, request.app.state.settings, 'prospecting', payload, idempotency_key, fingerprint)
        return ws.job_view(job)


class Feedback(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'job_id': '0123456789abcdef0123456789abcdef', 'lead_index': 0, 'verdict': 'not_fit', 'reason': '物流主体'}]})
    job_id: str = Field(pattern=r'^[0-9a-f]{32}$')
    lead_index: int = Field(ge=0, lt=30)
    verdict: Literal['fit', 'not_fit', 'unreviewed']
    reason: str = Field(default='', max_length=500)


class FeedbackView(BaseModel):
    job_id: str
    lead_index: int
    verdict: str
    reason: str


@router.post('/feedback', response_model=FeedbackView)
def discovery_feedback(body: Feedback, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """保存人工筛选反馈；不匹配的同名同地区主体从后续相同画像发现中排除，原结果快照不改写。"""
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        job = ws.get_job(session, workspace, body.job_id)
        leads = (job.result or {}).get('leads', [])
        if job.operation != 'prospecting' or job.status not in ('succeeded', 'partial') or body.lead_index >= len(leads):
            raise HTTPException(409, 'discovery_feedback_not_available')
        profile, entity = profile_key(job.payload), entity_key(leads[body.lead_index])
        row = session.scalar(select(DiscoveryFeedback).where(DiscoveryFeedback.workspace_id == workspace,
            DiscoveryFeedback.profile_key == profile, DiscoveryFeedback.entity_key == entity))
        if not row:
            row = DiscoveryFeedback(workspace_id=workspace, profile_key=profile, entity_key=entity)
            session.add(row)
        row.job_id, row.lead_index, row.verdict, row.reason = body.job_id, body.lead_index, body.verdict, body.reason
        return body.model_dump()


@router.get('/feedback/{job_id}', response_model=list[FeedbackView])
def discovery_feedback_for_job(job_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """读取本工作空间该任务的人工反馈，不调用模型或数据供应商。"""
    with sessions() as session:
        ws.get_job(session, workspace, job_id)
        return [{'job_id': row.job_id, 'lead_index': row.lead_index, 'verdict': row.verdict, 'reason': row.reason}
                for row in session.scalars(select(DiscoveryFeedback).where(DiscoveryFeedback.workspace_id == workspace,
                    DiscoveryFeedback.job_id == job_id))]
