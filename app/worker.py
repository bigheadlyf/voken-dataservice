import asyncio
import logging
from datetime import timezone
from threading import Event

from sqlalchemy import func, select, or_

from app.db import Job, ProviderCall, utcnow, write_transaction
from app.deepseek import ProviderError
from app.pipeline import execute_pipeline
from app.provider_logging import observe_http
from app.source_cache import cached_public_call
from app.schedules import enqueue_due
from app.public_sources import PublicSources
from app.mail_delivery import recover_deliveries, run_next_delivery
from app.workspaces import finish_job, has_deliverable, lock_workspace


logger = logging.getLogger(__name__)
UPKUAJING_JOBS = {
    'trade_search': ('trade', 'verify_trades', 'customs'),
    'directory_companies': ('directory', 'directory_search', 'directory'),
    'directory_people': ('directory', 'directory_search', 'directory'),
    'directory_contacts': ('directory_contacts', 'directory_contacts', 'directory'),
    'customs_verification': ('trade', 'verify_trades', 'customs'),
    'buyer_search': ('buyers', 'search_buyers', 'buyer'),
    'buyer_profile': ('profile', 'get_buyer_profile', 'buyer'),
    'buyer_contacts': ('contacts', 'get_buyer_contacts', 'buyer'),
}
UPKUAJING_PRICES = {'upkuajing_buyers': 1500, 'upkuajing_trade': 1500,
                    'upkuajing_profile': 1000, 'upkuajing_contacts': 500,
                    'upkuajing_directory': 1500, 'upkuajing_directory_contacts': 500}


class CancelledRun(Exception):
    pass


class InterruptedRun(Exception):
    pass


class JobRun:
    def __init__(self, worker, job: Job):
        self.sessions = worker.sessions
        self.settings = worker.settings
        self.provider = worker.provider
        self.customs = worker.customs
        self.hunter = getattr(worker, 'hunter', None)
        self.public_sources = worker.public_sources
        self.shutdown = worker.shutdown
        self.job_id = job.id
        self.workspace = job.workspace_id
        self.paid_budget = job.payload.get('paid_budget_milli_cny') if job.operation in ('prospecting', 'targeted_contacts') else None
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
            if endpoint.startswith(('upkuajing_', 'hunter_')):
                price = (0 if endpoint == 'hunter_domain' else self.settings.hunter_contact_estimate_milli_cny if endpoint.startswith('hunter_')
                         else UPKUAJING_PRICES[endpoint])
                if self.paid_budget is not None:
                    budget_calls = session.scalars(select(ProviderCall).where(
                        ProviderCall.job_id == self.job_id,
                        or_(ProviderCall.endpoint.startswith('upkuajing_', autoescape=True),
                            ProviderCall.endpoint.startswith('hunter_', autoescape=True))))
                    committed = sum(max(UPKUAJING_PRICES.get(item.endpoint, 0), item.estimated_milli_cny or 0) for item in budget_calls)
                    if committed + price > self.paid_budget:
                        raise ProviderError('enhancement_budget_exhausted')
                today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
                count = session.scalar(select(func.count()).select_from(ProviderCall).where(
                    ProviderCall.endpoint.startswith('upkuajing_', autoescape=True), ProviderCall.started_at >= today,
                ))
                if endpoint.startswith('upkuajing_') and count >= self.settings.upkuajing_daily_call_limit:
                    raise ProviderError('upkuajing_daily_limit')
                if endpoint.startswith('hunter_'):
                    hunter_count = session.scalar(select(func.count()).select_from(ProviderCall).where(
                        ProviderCall.endpoint.startswith('hunter_', autoescape=True), ProviderCall.started_at >= today))
                    if hunter_count >= self.settings.hunter_daily_call_limit:
                        raise ProviderError('hunter_daily_limit')
            if endpoint.startswith('open_'):
                today = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
                count = session.scalar(select(func.count()).select_from(ProviderCall).where(
                    ProviderCall.endpoint.startswith('open_', autoescape=True), ProviderCall.started_at >= today))
                if count >= self.settings.public_source_daily_call_limit:
                    raise ProviderError('open_source_daily_limit')
            call = ProviderCall(job_id=self.job_id, step=step, endpoint=endpoint, status='started')
            if endpoint.startswith(('upkuajing_', 'hunter_')):
                call.estimated_milli_cny = price
            elif endpoint.startswith('open_'):
                call.estimated_milli_cny = 0
            session.add(call)
            session.flush()

        def save_http(event, data):
            with write_transaction(self.sessions) as session:
                recorded = session.get(ProviderCall, call.id)
                setattr(recorded, f'http_{event}', data)

        try:
            with observe_http(save_http):
                result = cached_public_call(self.sessions, self.workspace,
                    self.settings.public_cache_ttl_seconds, endpoint, invoke, args)
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
                recorded.estimated_milli_cny = self.settings.public_tool_estimate_milli_cny if result['billable'] else 0
            elif endpoint.startswith('upkuajing_'):
                recorded.estimated_milli_cny = result['reported_milli_cny'] if result['reported_milli_cny'] is not None else price
            elif endpoint.startswith('hunter_') and result.get('credits_used') is not None:
                recorded.estimated_milli_cny = round(price * result['credits_used'])
        return result

    def contact_call(self, step, endpoint, invoke, selected):
        """Primary first; a separately journalled, at-most-once Hunter fallback."""
        from copy import deepcopy
        from app.hunter import domain_name, has_direct_contact
        try:
            primary = self.call(step, endpoint, invoke, selected)
        except ProviderError as error:
            # Never bypass budget limits or replay an unresolved in-flight call.
            if self.hunter is None or error.code in ('enhancement_budget_exhausted',
                    'upkuajing_daily_limit', 'provider_call_requires_reconciliation'):
                raise
            self.add_warning(error.code)
            primary = {'source': 'upkuajing', 'records': [], 'reported_milli_cny': None,
                       'primary_error': error.code}
            if selected.get('namespace'):
                primary.update(kind='contacts', subject=selected)
        result = deepcopy(primary)
        if self.hunter is None or has_direct_contact(result.get('records', [])):
            return result
        anchor = dict(selected)
        for row in result.get('records', []):
            if row.get('channel') == 'websites' and row.get('validity') != 2 and domain_name(row.get('value')):
                anchor.setdefault('website', row['value'])
                break
        try:
            fallback = self.call(step+'-hunter', 'hunter_contacts', self.hunter.contacts, anchor)
        except ProviderError as error:
            self.add_warning(error.code)
            result['hunter_fallback'] = {'status': 'failed', 'error': error.code}
            return result
        result['hunter_fallback'] = {**fallback, 'status': 'matches' if fallback['records'] else 'no_matches'}
        seen = {(r.get('channel'), str(r.get('value', '')).casefold()) for r in result.get('records', [])}
        result['records'] = result.get('records', []) + [r for r in fallback['records']
            if (r.get('channel'), r['value'].casefold()) not in seen]
        if fallback['records']:
            result['source'] = 'upkuajing+hunter'
        return result

    def paid_usage(self) -> dict:
        with self.sessions() as session:
            calls = list(session.scalars(select(ProviderCall).where(
                ProviderCall.job_id == self.job_id,
                or_(ProviderCall.endpoint.startswith('upkuajing_', autoescape=True),
                    ProviderCall.endpoint.startswith('hunter_', autoescape=True)))))
            return {
                'budget_milli_cny': self.paid_budget,
                'committed_milli_cny': sum(call.estimated_milli_cny or 0 for call in calls),
                'reported_milli_cny': sum((call.result or {}).get('reported_milli_cny') or 0 for call in calls),
                'has_unconfirmed_cost': any(call.status != 'succeeded' or
                    (call.result or {}).get('reported_milli_cny') is None for call in calls),
                'calls': len(calls),
                'hunter_credits': sum((call.result or {}).get('credits_used') or 0
                                     for call in calls if call.endpoint.startswith('hunter_')),
                'budget_consumed_milli_cny': sum(max(UPKUAJING_PRICES.get(call.endpoint, 0), call.estimated_milli_cny or 0) for call in calls),
                'quota_usage': {key: sum(((call.result or {}).get('quota_usage') or {}).get(key, 0) for call in calls)
                                for key in ('request_units', 'record_units', 'unlock_units')},
            }


class Worker:
    def __init__(self, sessions, settings, provider, customs=None, public_sources=None, hunter=None):
        self.sessions = sessions
        self.settings = settings
        self.provider = provider
        self.customs = customs
        self.hunter = hunter
        self.public_sources = public_sources
        self.shutdown = Event()

    def recover(self) -> None:
        recover_deliveries(self.sessions)
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
            if job.operation == 'source_lookup':
                source_provider = self.public_sources or PublicSources(self.settings)
                try:
                    evidence = run.call('official-source-lookup', 'open_'+job.payload['source_id'],
                                        source_provider.search, job.payload)
                finally:
                    if self.public_sources is None:
                        source_provider.close()
                run.result['source_lookup'] = evidence
                for warning in evidence.get('warnings', []):
                    run.add_warning(warning)
                run.result['coverage'] = 'matches' if evidence['records'] else 'no_matches'
                status = 'partial' if run.warnings else 'succeeded'
            elif job.operation == 'targeted_contacts':
                from app.targeted_contacts import search
                run.result['directory'] = search(run, 'targeted', job.payload,
                    job.payload.get('contact_target', 'procurement'), job.payload.get('contact_titles'))
                run.result['coverage'] = 'matches' if run.result['directory']['matched_contact_count'] else 'no_target_matches'
                status = 'succeeded'
            elif job.operation in UPKUAJING_JOBS:
                if self.customs is None:
                    raise ProviderError('customs_provider_unavailable')
                action, method, result_key = UPKUAJING_JOBS[job.operation]
                step = 'customs-first-page' if action == 'trade' else f'customs-{action}'
                invoke = run.contact_call if action in ('contacts', 'directory_contacts') else run.call
                evidence = invoke(step, f'upkuajing_{action}', getattr(self.customs, method), job.payload)
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

        if run.paid_budget is not None:
            run.result['paid_usage'] = run.paid_usage()
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
                await asyncio.to_thread(enqueue_due, self.sessions, self.settings)
                if not self.shutdown.is_set() and await asyncio.to_thread(run_next_delivery, self.sessions, self.settings):
                    continue
                if await asyncio.to_thread(self.run_next):
                    continue
            except Exception:
                logger.error('Background job loop could not access or update the queue')
                needs_recovery = True
            try:
                await asyncio.wait_for(stop.wait(), timeout=1)
            except asyncio.TimeoutError:
                continue
