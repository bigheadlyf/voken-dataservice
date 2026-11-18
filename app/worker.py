import asyncio
import logging
from datetime import timezone
from threading import Event

from sqlalchemy import func, select

from app.db import Job, ProviderCall, utcnow, write_transaction
from app.deepseek import ProviderError
from app.pipeline import execute_pipeline
from app.workspaces import finish_job, has_deliverable, lock_workspace


logger = logging.getLogger(__name__)
UPKUAJING_JOBS = {
    'customs_verification': ('trade', 'verify_trades', 'customs'),
    'buyer_search': ('buyers', 'search_buyers', 'buyer'),
    'buyer_profile': ('profile', 'get_buyer_profile', 'buyer'),
    'buyer_contacts': ('contacts', 'get_buyer_contacts', 'buyer'),
}


class CancelledRun(Exception):
    pass


class InterruptedRun(Exception):
    pass


class JobRun:
    def __init__(self, worker, job: Job):
        self.sessions = worker.sessions
        self.settings = worker.settings
        self.provider = worker.provider
        self.shutdown = worker.shutdown
        self.job_id = job.id
        self.workspace = job.workspace_id
        self.warnings = []
        self.result = {'retrieved_at': utcnow().replace(tzinfo=timezone.utc).isoformat(), 'warnings': self.warnings}

    def add_warning(self, code: str) -> None:
        if code not in self.warnings:
            self.warnings.append(code)

    def check_cancelled(self) -> None:
        if self.shutdown.is_set():
            raise InterruptedRun()
        with self.sessions() as session:
            job = session.get(Job, self.job_id)
            if job.cancel_requested:
                raise CancelledRun()

    def checkpoint(self) -> None:
        with write_transaction(self.sessions) as session:
            job = session.get(Job, self.job_id)
            job.result = self.result

    def call(self, step: str, endpoint: str, invoke, *args) -> dict:
        if self.shutdown.is_set():
            raise InterruptedRun()
        with write_transaction(self.sessions) as session:
            lock_workspace(session, self.workspace)
            if session.get(Job, self.job_id).cancel_requested:
                raise CancelledRun()
            previous = session.scalar(select(ProviderCall).where(
                ProviderCall.job_id == self.job_id, ProviderCall.step == step,
            ))
            if previous is not None:
                if previous.status == 'succeeded':
                    return previous.result
                raise ProviderError(previous.error or 'provider_call_requires_reconciliation')
            if endpoint.startswith('upkuajing_'):
                today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
                count = session.scalar(select(func.count()).select_from(ProviderCall).where(
                    ProviderCall.endpoint.startswith('upkuajing_', autoescape=True), ProviderCall.started_at >= today,
                ))
                if count >= self.settings.upkuajing_daily_call_limit:
                    raise ProviderError('upkuajing_daily_limit')
            call = ProviderCall(job_id=self.job_id, step=step, endpoint=endpoint, status='started')
            session.add(call)
            session.flush()

        try:
            result = invoke(*args)
        except ProviderError as error:
            with write_transaction(self.sessions) as session:
                recorded = session.get(ProviderCall, call.id)
                recorded.status = 'unknown' if error.unknown_charge else 'failed'
                recorded.error = error.code
            raise

        with write_transaction(self.sessions) as session:
            recorded = session.get(ProviderCall, call.id)
            recorded.status = 'succeeded'
            recorded.result = result
            if endpoint in ('search', 'fetch'):
                recorded.estimated_milli_cny = 5 if result['billable'] else 0
            elif endpoint.startswith('upkuajing_'):
                recorded.estimated_milli_cny = result['reported_milli_cny']
        return result


class Worker:
    def __init__(self, sessions, settings, provider, customs=None):
        self.sessions = sessions
        self.settings = settings
        self.provider = provider
        self.customs = customs
        self.shutdown = Event()

    def recover(self) -> None:
        with self.sessions() as session:
            pending = session.execute(select(Job.id, Job.workspace_id).where(Job.status.in_(('running', 'cancelling')))).all()
        for job_id, workspace in pending:
            with write_transaction(self.sessions) as session:
                lock_workspace(session, workspace)
                job = session.get(Job, job_id)
                calls = session.scalars(select(ProviderCall).where(
                    ProviderCall.job_id == job_id, ProviderCall.status == 'started',
                ))
                for call in calls:
                    call.status = 'unknown'
                    call.error = 'provider_call_requires_reconciliation'
                if job.cancel_requested:
                    finish_job(session, job, 'cancelled', result=job.result)
                else:
                    job.status = 'queued'

    def run_next(self) -> bool:
        with self.sessions() as session:
            row = session.execute(select(Job.id, Job.workspace_id).where(Job.status == 'queued').order_by(
                Job.created_at, Job.id,
            ).limit(1)).first()
        if row is None:
            return False
        if self.shutdown.is_set():
            return False
        job_id, workspace = row
        with write_transaction(self.sessions) as session:
            lock_workspace(session, workspace)
            job = session.get(Job, job_id)
            if job.status != 'queued':
                return True
            job.status = 'running'

        run = JobRun(self, job)
        error = None
        try:
            if job.operation in UPKUAJING_JOBS:
                if self.customs is None:
                    raise ProviderError('customs_provider_unavailable')
                action, method, result_key = UPKUAJING_JOBS[job.operation]
                step = 'customs-first-page' if action == 'trade' else f'customs-{action}'
                evidence = run.call(step, f'upkuajing_{action}', getattr(self.customs, method), job.payload)
                run.result[result_key] = evidence
                run.result['coverage'] = 'matches' if evidence['records'] else 'no_matches'
                if 'has_more' in evidence and evidence['records']:
                    run.result['coverage'] = 'one_page'
                status = 'succeeded'
            else:
                status = execute_pipeline(run, job.operation, job.payload)
            if status == 'failed' and run.warnings:
                error = run.warnings[0]
        except CancelledRun:
            status = 'cancelled'
        except InterruptedRun:
            return True
        except ProviderError as exc:
            error = exc.code
            run.add_warning(error)
            status = 'partial' if has_deliverable(job.operation, run.result) else 'failed'
        except Exception as exc:
            logger.error('Job execution failed: id=%s operation=%s exception=%s', job_id, job.operation, type(exc).__name__)
            status, error = 'failed', 'internal_job_error'

        with write_transaction(self.sessions) as session:
            lock_workspace(session, workspace)
            finish_job(session, session.get(Job, job_id), status, result=run.result, error=error)
        return True

    async def run(self, stop: asyncio.Event) -> None:
        needs_recovery = False
        while not stop.is_set():
            try:
                if needs_recovery:
                    await asyncio.to_thread(self.recover)
                    needs_recovery = False
                if await asyncio.to_thread(self.run_next):
                    continue
            except Exception:
                logger.error('Background job loop could not access or update the queue')
                needs_recovery = True
            try:
                await asyncio.wait_for(stop.wait(), timeout=1)
            except asyncio.TimeoutError:
                continue
