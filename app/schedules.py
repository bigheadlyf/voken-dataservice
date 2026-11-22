"""Explicit, finite recurring discovery; public data tier only."""
from datetime import timedelta
from hashlib import sha256

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from app import workspaces as ws
from app.db import Agent, AgentSchedule, Job, utcnow, write_transaction

router = APIRouter(prefix='/api/v1/workspaces/{workspace_id}', tags=['schedules'])


class ScheduleWrite(BaseModel):
    model_config = ConfigDict(extra='forbid', json_schema_extra={'examples': [
        {'expected_version': 0, 'interval_days': 14, 'remaining_runs': 4, 'enabled': True}]})
    expected_version: int = Field(ge=0)
    interval_days: int = Field(default=14, ge=1, le=90)
    remaining_runs: int = Field(default=4, ge=1, le=365)
    enabled: bool = True


class ScheduleView(BaseModel):
    agent_id: str
    interval_days: int
    remaining_runs: int
    enabled: bool
    next_run_at: str
    last_job_id: str | None
    last_error: str | None
    version: int
    acquisition_tier: str = 'basic'


def view(row):
    return {key: getattr(row, key) for key in ('agent_id', 'interval_days', 'remaining_runs', 'enabled',
        'last_job_id', 'last_error', 'version')} | {'next_run_at': row.next_run_at.isoformat()+'Z',
                                                'acquisition_tier': 'basic'}


@router.put('/agents/{agent_id}/schedule', response_model=ScheduleView)
def save_schedule(agent_id: str, body: ScheduleWrite, workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """配置有限次的周期公域拓客；初次 expected_version=0，之后使用读取版本。

    周期任务只用基础档，消耗平台点数，不自动调用跨境魔方。首次在一个周期后执行。
    更改周期或重新启用时从当前时刻重新计算；暂停员工会同时停用周期计划。
    """
    with write_transaction(sessions) as session:
        ws.lock_workspace(session, workspace)
        agent = ws.get_agent(session, workspace, agent_id)
        row = session.get(AgentSchedule, agent_id)
        if (row.version if row else 0) != body.expected_version:
            raise HTTPException(409, 'schedule_version_conflict')
        if body.enabled:
            agent.status = 'enabled'
        if row is None:
            row = AgentSchedule(agent_id=agent_id, workspace_id=workspace,
                interval_days=body.interval_days, remaining_runs=body.remaining_runs,
                enabled=body.enabled, next_run_at=utcnow()+timedelta(days=body.interval_days))
            session.add(row)
        else:
            if row.interval_days != body.interval_days or (body.enabled and not row.enabled):
                row.next_run_at = utcnow()+timedelta(days=body.interval_days)
            row.interval_days = body.interval_days
            row.remaining_runs = body.remaining_runs
            row.enabled = body.enabled
            row.last_error = None
            row.version += 1
        session.flush()
        return view(row)


@router.get('/schedules', response_model=list[ScheduleView])
def list_schedules(workspace: ws.WorkspaceAccess, sessions: ws.Sessions):
    """列出工作空间全部周期计划，包含下次执行时间、剩余次数、版本和最近错误。"""
    with sessions() as session:
        return [view(row) for row in session.scalars(select(AgentSchedule).where(
            AgentSchedule.workspace_id == workspace).order_by(AgentSchedule.next_run_at))]


def enqueue_due(sessions, settings):
    """At most 20 due schedules per tick. No missed-run backfill after downtime."""
    now = utcnow()
    with sessions() as session:
        due = session.execute(select(AgentSchedule.agent_id, AgentSchedule.workspace_id).where(
            AgentSchedule.enabled.is_(True), AgentSchedule.next_run_at <= now).order_by(
            AgentSchedule.next_run_at).limit(20)).all()
    submitted = 0
    for agent_id, workspace in due:
        with write_transaction(sessions) as session:
            ws.lock_workspace(session, workspace)
            row = session.get(AgentSchedule, agent_id)
            if not row.enabled or row.next_run_at > now:
                continue
            agent = session.get(Agent, agent_id)
            if agent.deleted_at is not None or agent.status != 'enabled' or row.remaining_runs <= 0:
                row.enabled = False
                row.version += 1
                continue
            active = session.scalar(select(Job.id).where(Job.workspace_id == workspace,
                Job.agent_id == agent_id, Job.status.in_(ws.ACTIVE_STATES)).limit(1))
            if active:
                row.next_run_at = now + timedelta(minutes=15)
                row.last_error = 'agent_run_in_progress'
                row.version += 1
                continue
            scheduled_at = row.next_run_at.isoformat()
            key = 'schedule-' + sha256(f'{agent_id}:{scheduled_at}'.encode()).hexdigest()[:40]
            payload = {**ws.current_config(session, agent), 'acquisition_tier': 'basic',
                       'scheduled_for': scheduled_at+'Z'}
            fingerprint = ws.request_fingerprint('prospecting', {'agent_id':agent_id,'scheduled_for':scheduled_at})
            try:
                job = ws.enqueue(session, workspace, settings, 'prospecting', payload, key, fingerprint, agent)
            except HTTPException as error:
                row.last_error = error.detail
                row.next_run_at = now + timedelta(hours=24 if error.detail == 'insufficient_points' else 1)
            else:
                row.last_job_id = job.id
                row.last_error = None
                row.remaining_runs -= 1
                row.next_run_at = now + timedelta(days=row.interval_days)
                row.enabled = row.remaining_runs > 0
                submitted += 1
            row.version += 1
    return submitted
