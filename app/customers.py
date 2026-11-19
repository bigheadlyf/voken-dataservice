"""Read-only historical lead records backed by durable job snapshots."""
import base64
import json
import re

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import and_, or_, select

from app import workspaces as ws
from app.db import Job

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}/customers', tags=['customers'], responses={
    401: {'description': 'authentication_required：缺少或过期的 Bearer token。'},
    404: {'description': 'workspace_not_found / customer_record_not_found。'},
    422: {'description': 'invalid_customer_cursor 或参数校验失败。'},
    503: {'description': 'database_not_configured。'},
})
TERMINAL = ('succeeded', 'partial', 'failed', 'cancelled')


class CustomerRecord(BaseModel):
    id: str
    job_id: str
    agent_id: str | None
    config_version: int | None
    lead_index: int
    lead: dict
    created_at: str
    finished_at: str | None


class CustomerPage(BaseModel):
    items: list[CustomerRecord]
    next_cursor: str | None


def record_id(value):
    match = re.fullmatch(r'([0-9a-f]{32}):([0-9]{1,6})', value)
    if match is None:
        raise ValueError('invalid record id')
    return match[1], int(match[2])


def job_query(workspace, agent_id=None):
    statement = select(Job).where(Job.workspace_id == workspace, Job.operation == 'prospecting',
                                 Job.status.in_(TERMINAL), Job.result.is_not(None))
    if agent_id is not None:
        statement = statement.where(Job.agent_id == agent_id)
    return statement


def leads(job):
    value = (job.result or {}).get('leads', [])
    return value if isinstance(value, list) else []


def view(job, index, lead):
    return {'id': f'{job.id}:{index}', 'job_id': job.id, 'agent_id': job.agent_id,
            'config_version': job.config_version, 'lead_index': index, 'lead': lead,
            'created_at': job.created_at.isoformat() + 'Z',
            'finished_at': job.finished_at.isoformat() + 'Z' if job.finished_at else None}


@router.get('', response_model=CustomerPage)
def historical_customers(workspace: ws.WorkspaceAccess, sessions: ws.Sessions,
                         agent_id: str | None = Query(default=None, min_length=32, max_length=32),
                         limit: int = Query(default=50, ge=1, le=100),
                         cursor: str | None = Query(default=None, max_length=256)):
    """查询历史客户线索，按任务创建时间倒序、任务内线索序号升序，支持 agent_id 和游标分页。

    直接读取已终结拓客任务的持久结果，覆盖上线前历史；员工软删除后仍能按原 agent_id 查询。
    id 为 job_id:lead_index，表示一次发现记录，同一企业跨任务可能有多条记录，不代表独立 CRM 客户。
    running 中结果不计入历史；没有线索的任务跳过。筛选其他工作空间的 agent_id 只返回空列表。
    """
    with sessions() as session:
        query = job_query(workspace, agent_id)
        resume_job, resume_index = None, -1
        if cursor:
            try:
                decoded = json.loads(base64.b64decode(cursor, altchars=b'-_', validate=True))
                job_id, resume_index = record_id(decoded['record'])
                if decoded['agent_id'] != agent_id:
                    raise ValueError('filter changed')
                resume_job = session.scalar(query.where(Job.id == job_id))
                if resume_job is None or resume_index >= len(leads(resume_job)):
                    raise ValueError('missing record')
            except (ValueError, KeyError, TypeError, UnicodeError):
                raise HTTPException(422, 'invalid_customer_cursor') from None
        items = []
        if resume_job is not None:
            items.extend(view(resume_job, i, lead) for i, lead in enumerate(leads(resume_job))
                         if i > resume_index and isinstance(lead, dict))
            last = resume_job
        else:
            last = None
        # Fetch jobs in bounded batches rather than loading every historical result.
        while len(items) <= limit:
            batch_query = query
            if last is not None:
                batch_query = batch_query.where(or_(Job.created_at < last.created_at,
                    and_(Job.created_at == last.created_at, Job.id < last.id)))
            batch = list(session.scalars(batch_query.order_by(Job.created_at.desc(), Job.id.desc()).limit(100)))
            if not batch:
                break
            for job in batch:
                items.extend(view(job, i, lead) for i, lead in enumerate(leads(job)) if isinstance(lead, dict))
                last = job
                if len(items) > limit:
                    break
            if len(batch) < 100:
                break
        next_cursor = None
        if len(items) > limit:
            next_cursor = base64.urlsafe_b64encode(json.dumps(
                {'record': items[limit - 1]['id'], 'agent_id': agent_id}).encode()).decode()
        return {'items': items[:limit], 'next_cursor': next_cursor}


@router.get('/{customer_id}', response_model=CustomerRecord)
def historical_customer(customer_id: str, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """读取一条历史发现记录，包含员工、原始任务、配置版本、线索来源与证据。"""
    try:
        job_id, index = record_id(customer_id)
    except ValueError:
        raise HTTPException(404, 'customer_record_not_found') from None
    with sessions() as session:
        job = session.scalar(job_query(workspace).where(Job.id == job_id))
        if job is None or index >= len(leads(job)) or not isinstance(leads(job)[index], dict):
            raise HTTPException(404, 'customer_record_not_found')
        return view(job, index, leads(job)[index])
