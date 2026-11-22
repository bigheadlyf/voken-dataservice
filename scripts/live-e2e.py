"""Opt-in end-to-end checks against a running service and real upstreams.

Never sends mail or starts checkout. State includes a private test-account password;
keep the state file under .local. Reports contain results, never bearer tokens.
"""
import argparse
from datetime import datetime, timedelta, timezone
import importlib.util
import json
from pathlib import Path
import secrets
import sys
import time

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
STATE = ROOT / '.local/live-e2e-state.json'
REPORT = ROOT / '.local/live-e2e-report.json'


def read_json(path, default):
    return json.loads(path.read_text(encoding='utf-8')) if path.exists() else default


def save_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


class LiveChecks:
    def __init__(self, base):
        self.client = httpx.Client(base_url=base, timeout=120)
        self.state = read_json(STATE, {})
        self.report = read_json(REPORT, {'base_url': base, 'checks': [], 'jobs': {}})
        self.report['updated_at'] = datetime.now(timezone.utc).isoformat()
        self.headers = {}
        self.root = ''

    def record(self, name, status, **detail):
        row = {'name': name, 'status': status, **detail}
        self.report['checks'].append(row)
        self.report['updated_at'] = datetime.now(timezone.utc).isoformat()
        save_json(REPORT, self.report)
        save_json(STATE, self.state)
        print(json.dumps(row, ensure_ascii=False), flush=True)

    def request(self, method, path, *, expect=(200,), **kwargs):
        headers = {**self.headers, **kwargs.pop('headers', {})}
        response = self.client.request(method, path, headers=headers, **kwargs)
        if response.status_code not in expect:
            raise AssertionError(f'{method} {path}: HTTP {response.status_code}: {response.text[:600]}')
        return response.json() if response.content and 'application/json' in response.headers.get('content-type', '') else response.text

    def setup(self):
        health = self.request('GET', '/health')
        assert health['model_mode'] == health['search_mode'] == 'live', health
        assert health['smtp_mode'] != 'local_capture', health
        self.record('runtime_uses_real_providers', 'passed', health=health)
        if 'phone' not in self.state:
            spec = importlib.util.spec_from_file_location('live_launcher', ROOT / 'scripts/run-live-dev.py')
            launcher = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(launcher)
            launcher.load_environment()
            from app.db import create_session_factory
            from app.operator import provision
            self.state['phone'] = '139' + ''.join(str(secrets.randbelow(10)) for _ in range(8))
            self.state['password'] = secrets.token_urlsafe(24)
            sessions = create_session_factory('sqlite:///' + (ROOT / '.local/account-qa.sqlite3').as_posix())
            try:
                account = provision(sessions, self.state['phone'], self.state['password'], initial_points=10000)
                self.state['workspace_id'] = account['workspace_id']
            finally:
                sessions.kw['bind'].dispose()
            save_json(STATE, self.state)
        login = self.request('POST', '/api/v1/auth/login', json={
            'phone': self.state['phone'], 'password': self.state['password']})
        self.headers = {'Authorization': 'Bearer ' + login['access_token']}
        self.root = '/api/v1/workspaces/' + login['workspace_id']
        self.record('login_and_database_session', 'passed')

    def job(self, label, path, body, *, timeout=480):
        identifier = self.report['jobs'].get(label)
        if not identifier:
            row = self.request('POST', self.root + path, expect=(202,), json=body,
                               headers={'Idempotency-Key': 'live-e2e-' + label + '-' +
                                        str(self.report.get('attempts', {}).get(label, 1))})
            identifier = row['id']
            self.report['jobs'][label] = identifier
            save_json(REPORT, self.report)
        deadline = time.monotonic() + timeout
        last = None
        while time.monotonic() < deadline:
            row = self.request('GET', self.root + '/jobs/' + identifier)
            if row['status'] != last:
                print(json.dumps({'job': label, 'state': row['status']}, ensure_ascii=False), flush=True)
                last = row['status']
            if row['status'] not in ('queued', 'running', 'cancelling'):
                self.report.setdefault('job_results', {})[label] = row
                self.record(label, 'passed' if row['status'] == 'succeeded' else 'partial' if row['status'] == 'partial' else 'failed',
                            job_id=identifier, job_status=row['status'], error=row.get('error'),
                            warnings=(row.get('result') or {}).get('warnings', []))
                return row
            time.sleep(1)
        self.record(label, 'failed', reason='timeout', job_id=identifier)
        raise AssertionError('Job timed out: ' + label)

    def core(self):
        candidates = self.request('POST', self.root + '/company/website-candidates',
                                  json={'name': '安若泰镍基合金'})
        assert isinstance(candidates, list)
        assert not any('qa-lighting.example' in r['url'] for r in candidates)
        self.record('company_name_search', 'passed', candidates=candidates)
        if self.state.get('analysis_id'):
            analysis = self.request('GET', self.root + '/company/document-analyses/' + self.state['analysis_id'])
        else:
            analysis = self.request('POST', self.root + '/company/web-analyses', expect=(201,),
                                    json={'website': 'https://anruotai-nickel.com/'})
        assert '安若泰' in analysis['proposal']['profile']['name']
        assert 'QA Lighting' not in json.dumps(analysis)
        self.state['analysis_id'] = analysis['id']
        self.report['company_analysis'] = analysis
        applied = self.request('POST', self.root + '/company/document-analyses/' + analysis['id'] + '/apply')
        assert applied['applied_at']
        replay = self.request('POST', self.root + '/company/document-analyses/' + analysis['id'] + '/apply')
        assert replay == applied
        profile = self.request('GET', self.root + '/company/profile')
        assert '安若泰' in profile['data']['name']
        version = profile['version']
        changed = self.request('PATCH', self.root + '/company/profile', json={
            'expected_version': version, 'contact_details': profile['data'].get('contact_details')})
        assert changed['version'] == version + 1
        self.request('PATCH', self.root + '/company/profile', expect=(409,),
                     json={'expected_version': version, 'name': 'stale-write-must-not-apply'})
        self.record('website_analysis_apply_persistence_replay_and_version_conflict', 'passed',
                    company=changed['data']['name'], products=changed['data']['products'])
        confirmed = self.request('POST', self.root + '/company/certification/confirm', json={
            'expected_version': changed['version'], 'confirm_accuracy': True,
            'statement': '端到端验收：仅确认以上内容来自公开官网，不代表独立工商核验或域名所有权核验。'})
        assert confirmed['status'] == 'confirmed'
        assert not confirmed['domain_ownership_verified']
        self.record('company_statement_persisted_without_false_legal_verification', 'passed')
        memory = self.request('POST', self.root + '/company/memories', expect=(201,), json={
            'key': 'live-e2e-source', 'title': '企业公开官网',
            'content': 'https://anruotai-nickel.com/'})
        edited = self.request('PATCH', self.root + '/company/memories/' + memory['id'],
                              json={'expected_version': 1, 'verification_status': 'confirmed'})
        assert edited['version'] == 2
        self.request('DELETE', self.root + '/company/memories/' + memory['id'] + '?expected_version=2', expect=(204,))
        self.request('GET', self.root + '/company/memories/' + memory['id'], expect=(404,))
        self.record('company_memory_create_update_read_delete', 'passed')
        # Only genuine source quotes from the just-completed website analysis are uploaded.
        excerpt = '来源：https://anruotai-nickel.com/\n' + '\n'.join(analysis['proposal']['profile_evidence'].values())
        uploaded = self.request('POST', self.root + '/company/document-analyses', expect=(201,),
                                files={'file': ('official-website-excerpt.txt', excerpt.encode('utf-8'), 'text/plain')})
        assert '安若泰' in uploaded['proposal']['profile']['name']
        saved = self.request('GET', self.root + '/company/document-analyses/' + uploaded['id'])
        assert saved['proposal'] == uploaded['proposal']
        self.record('real_document_upload_analysis_and_readback', 'passed', analysis_id=uploaded['id'])
        plan = self.request('POST', self.root + '/discovery/plan', json={
            'content': '请制定拓客方案：美国的镍基合金和不锈钢经销商，先找1家。只需有真实官网和产品业务证据，不要求当前采购意向。'})
        if not plan.get('configuration'):
            plan = self.request('POST', self.root + '/discovery/plan', json={
                'content': '补充筛选：必须销售镍基合金，可以同时销售不锈钢；排除废料回收商和只做加工不分销材料的商家。其他条件不变，不需要再澄清，请给出完整任务配置。',
                'history': [
                    {'role': 'user', 'content': '美国的镍基合金和不锈钢经销商，先找1家；真实官网及产品证据，不要求当前采购意向。'},
                    {'role': 'assistant', 'content': plan['reply']}]})
        assert plan.get('configuration'), plan
        assert plan['configuration']['target_count'] == 1
        self.report['discovery_plan'] = plan
        if self.state.get('agent_id'):
            agent = self.request('GET', self.root + '/agents/' + self.state['agent_id'])
        else:
            agent = self.request('POST', self.root + '/agents', expect=(201,), json=plan['configuration'])
        self.state['agent_id'] = agent['id']
        changed_agent = self.request('PATCH', self.root + '/agents/' + agent['id'],
                                     json={'name': '真实链路验收：美国合金经销商'})
        assert changed_agent['config_version'] == agent['config_version'] + 1
        old_schedule = next((s for s in self.request('GET', self.root + '/schedules')
                             if s['agent_id'] == agent['id']), None)
        schedule = self.request('PUT', self.root + '/agents/' + agent['id'] + '/schedule', json={
            'expected_version': old_schedule['version'] if old_schedule else 0,
            'interval_days': 90, 'remaining_runs': 1, 'enabled': False})
        assert not schedule['enabled']
        assert any(s['agent_id'] == agent['id'] for s in self.request('GET', self.root + '/schedules'))
        self.record('real_ai_planning_agent_versions_and_schedule_persistence', 'passed', agent_id=agent['id'])
        chat = self.request('POST', self.root + '/agents/' + agent['id'] + '/messages', json={
            'content': '只根据已保存的企业资料回答企业名称与主营产品，不要调用工具或创建任务。'},
            headers={'Idempotency-Key': 'live-e2e-chat'})
        assert chat['status'] == 'succeeded', chat
        assert '安若泰' in json.dumps(chat, ensure_ascii=False), chat
        self.record('real_agent_chat_reads_company_knowledge', 'passed')
        for path in ('/points', '/points/ledger', '/points/costs', '/points/quotes',
                     '/crm/summary', '/crm/usage', '/customers'):
            self.request('GET', self.root + path)
        self.record('points_history_usage_and_dashboard_readback', 'passed')
        self.record('smtp', 'skipped', reason='User explicitly deferred email; local capture has been removed.')
        save_json(STATE, self.state)

    def discovery(self):
        # Reset only this harness's previously tested opt-out, without sending anything.
        if self.state.get('prospect_id'):
            previous = self.request('GET', self.root + '/crm/prospects/' + self.state['prospect_id'])
            if previous['do_not_contact'] and 'live-e2e' in previous['tags']:
                self.request('PATCH', self.root + '/crm/prospects/' + previous['id'],
                             json={'expected_version': previous['version'], 'do_not_contact': False})
        row = self.job('prospecting', '/agents/' + self.state['agent_id'] + '/runs', {'acquisition_tier': 'basic'})
        leads = (row.get('result') or {}).get('leads', [])
        assert leads, row
        assert not any('QA Buyer' in str(lead) for lead in leads)
        selected = self.request('POST', self.root + '/crm/prospects/from-leads', json={
            'job_id': row['id'], 'lead_indices': [0]})
        prospect = selected['items'][0]
        self.state['prospect_id'] = prospect['id']
        self.record('real_discovery_to_crm', 'passed', company_name=prospect['name'], source=prospect['evidence'].get('source'))
        duplicate = self.request('POST', self.root + '/crm/prospects/from-leads', json={
            'job_id': row['id'], 'lead_indices': [0]})
        assert duplicate['reused'] == 1
        imported = self.request('POST', self.root + '/crm/prospects/import', json={'items': [{
            'name': prospect['name'], 'location': prospect['location'], 'website': prospect['website'],
            'contact': prospect['contact'], 'source_note': '从本次真实搜索结果回导，验证去重。'}]})
        assert imported['reused'] == 1
        updated = self.request('PATCH', self.root + '/crm/prospects/' + prospect['id'], json={
            'expected_version': prospect['version'], 'stage': 'qualified', 'tags': ['live-e2e'],
            'next_followup_at': (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()})
        assert updated['stage'] == 'qualified'
        assert self.request('GET', self.root + '/crm/summary')['due_followups'] >= 1
        csv = self.request('GET', self.root + '/crm/prospects/export.csv')
        assert prospect['name'] in csv
        self.record('crm_dedup_import_followup_filters_and_csv_export', 'passed')
        report = self.job('customer-report-' + row['id'][:8], '/reports', {'job_id': row['id'], 'lead_index': 0})
        assert report.get('result', {}).get('report'), report
        self.request('GET', self.root + '/reports/' + report['id'])
        draft = self.job('outreach-draft-' + row['id'][:8], '/crm/prospects/' + prospect['id'] + '/drafts', {
            'language': 'English', 'objective': '根据已保存的真实企业产品与客户证据，写一封简短介绍邮件草稿，不要发送。'})
        assert draft.get('result', {}).get('draft', {}).get('body'), draft
        assert not draft['result']['draft']['sent']
        self.record('real_report_and_draft_generation', 'passed')
        self.request('POST', self.root + '/crm/prospects/' + prospect['id'] + '/activities',
                     expect=(201,), json={'kind': 'opt_out', 'content': '端到端验证停止联系阻断；此次验收从未对外发送邮件。'})
        stopped = self.request('GET', self.root + '/crm/prospects/' + prospect['id'])
        assert stopped['do_not_contact'] and stopped['next_followup_at'] is None
        self.request('POST', self.root + '/crm/prospects/' + prospect['id'] + '/drafts', expect=(409,),
                     json={}, headers={'Idempotency-Key': 'live-e2e-stopped-draft'})
        self.record('crm_optout_stops_further_outreach', 'passed')

    def sources(self):
        sources = self.request('GET', self.root + '/sources')
        for source in sources:
            name = 'source-' + source['id']
            if not source['configured']:
                self.record(name, 'blocked', reason='Missing upstream credentials', access=source['access'])
                continue
            query = {'gleif': 'Siemens', 'companies_house': 'Siemens', 'worldbank_notices': 'water',
                     'ted': 'steel'}.get(source['id'], 'steel')
            row = self.job(name, '/sources/searches', {'source_id': source['id'], 'query': query, 'limit': 1}, timeout=480)
            result = row.get('result') or {}
            records = result.get('source_lookup', {}).get('records', result.get('sources', []))
            self.record(name + '-evidence', 'passed' if row['status'] in ('succeeded', 'partial') else 'failed',
                        access=source['access'], records=len(records),
                        urls=[r.get('source_url') or r.get('url') for r in records[:2]])

    def customs(self):
        matched = self.job('buyer-search', '/buyer-enrichments', {
            'action': 'search', 'buyer': 'SIEMENS', 'buyer_country': 'DE', 'confirm_paid': True})
        records = (matched.get('result') or {}).get('buyer', {}).get('records', [])
        assert records, matched
        selected = records[0]
        for action in ('profile', 'contacts'):
            self.job('buyer-' + action, '/buyer-enrichments', {
                'action': action, 'match_job_id': matched['id'],
                'company_id': selected['company_id'], 'confirm_paid': True})
        end = datetime.now(timezone.utc).date()
        self.job('customs-verification', '/customs-verifications', {
            'buyer': selected['name'], 'buyer_country': selected['buyer_country'],
            'product': 'medical equipment',
            'match_job_id': matched['id'], 'company_id': selected['company_id'],
            'date_start': (end - timedelta(days=365)).isoformat(), 'date_end': end.isoformat(),
            'confirm_paid': True})
        logs = self.request('GET', self.root + '/jobs/' + matched['id'] + '/provider-logs')
        assert logs, logs
        self.record('real_paid_provider_http_logs', 'passed')

    def enhanced(self):
        row = self.job('enhanced-prospecting', '/agents/' + self.state['agent_id'] + '/runs',
                       {'acquisition_tier': 'enhanced', 'confirm_paid': True})
        result = row.get('result') or {}
        assert 'buyer_discovery' in result, row
        assert result.get('leads'), row
        self.record('real_enhanced_discovery_and_data_budget', 'passed' if row['status'] == 'succeeded' else 'partial',
                    candidates=len(result['buyer_discovery'].get('records', [])),
                    leads=len(result['leads']), paid_usage=result.get('paid_usage'))

    def contacts(self):
        prospect = self.request('GET', self.root + '/crm/prospects/' + self.state['prospect_id'])
        row = self.job('contact-research-filtered', '/crm/prospects/' + prospect['id'] + '/research', {
            'objective': '核对该企业公开官网和公开商务联系方式，只列原文实际出现的完整邮箱，排除脱敏邮箱；不推测邮箱。'})
        assert row['status'] == 'succeeded', row
        candidates = row['result'].get('contact_candidates', [])
        assert candidates and all('*' not in r['value'] for r in candidates)
        result = self.request('POST', self.root + '/crm/prospects/' + prospect['id'] + '/apply-contact', json={
            'expected_version': prospect['version'], 'job_id': row['id'], 'value': candidates[0]['value']})
        assert result['contact'] == candidates[0]['value']
        assert result['evidence']['selected_contact']['source_url']
        assert result['do_not_contact'] == prospect['do_not_contact']
        self.record('real_observed_contact_selection_with_source_and_mask_filter', 'passed',
                    candidate_count=len(candidates), source_url=candidates[0]['source_url'],
                    verification_status=result['evidence']['selected_contact']['verification_status'])

    def advanced(self):
        from io import BytesIO
        from zipfile import ZipFile
        from xml.sax.saxutils import escape
        import sqlite3
        from pypdf import PdfWriter
        from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

        analysis = self.request('GET', self.root + '/company/document-analyses/' + self.state['analysis_id'])
        excerpt = '来源：https://anruotai-nickel.com/\n' + '\n'.join(analysis['proposal']['profile_evidence'].values())
        files = [('official-source.md', excerpt.encode('utf-8'))]
        output = BytesIO()
        with ZipFile(output, 'w') as archive:
            archive.writestr('word/document.xml',
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
                ''.join('<w:p><w:r><w:t>' + escape(line) + '</w:t></w:r></w:p>' for line in excerpt.splitlines()) +
                '</w:body></w:document>')
        files.append(('official-source.docx', output.getvalue()))
        writer = PdfWriter()
        page = writer.add_blank_page(width=600, height=300)
        font = DictionaryObject({NameObject('/Type'): NameObject('/Font'),
            NameObject('/Subtype'): NameObject('/Type1'), NameObject('/BaseFont'): NameObject('/Helvetica')})
        page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/F1'): font})})
        stream = DecodedStreamObject()
        stream.set_data(b'BT /F1 12 Tf 10 200 Td (ANRUOTAI) Tj 0 -20 Td (Source: https://anruotai-nickel.com/) Tj ET')
        page[NameObject('/Contents')] = stream
        output = BytesIO()
        writer.write(output)
        files.append(('official-source.pdf', output.getvalue()))
        for filename, content in files:
            result = self.request('POST', self.root + '/company/document-analyses', expect=(201,),
                                  files={'file': (filename, content, 'application/octet-stream')})
            assert result['proposal']['profile'] and 'QA Lighting' not in json.dumps(result)
            self.record('real-upload-' + filename.rsplit('.', 1)[-1], 'passed', analysis_id=result['id'])
        # Prove current authenticated sessions cannot read other workspaces.
        other = self.request('POST', '/api/v1/auth/login', json={'phone': '13900009999', 'password': 'qa-password-2026'})
        self.request('GET', self.root + '/company/profile', expect=(404,),
                     headers={'Authorization': 'Bearer ' + other['access_token']})
        anonymous = self.client.get(self.root + '/company/profile')
        assert anonymous.status_code == 401
        self.record('live_tenant_isolation_and_unauthenticated_rejection', 'passed')
        research = self.job('contact-research', '/crm/prospects/' + self.state['prospect_id'] + '/research', {
            'objective': '核对这家企业的官网与公开商务邮箱，只记录实际观察到的联系方式，不猜测。'})
        assert research.get('result', {}).get('report')
        self.record('real_customer_contact_research', 'passed',
                    candidates=research['result'].get('contact_candidates', []))
        source_job = self.report['jobs']['source-gleif']
        saved = self.request('POST', self.root + '/crm/prospects/from-source',
                             json={'job_id': source_job, 'record_indices': [0]})
        assert saved['items'][0]['evidence']['evidence_type'] == 'entity_registration'
        self.record('official_record_to_crm_preserves_source', 'passed')
        # Bring only this test account's schedule due; production scheduler/worker executes it.
        schedules = self.request('GET', self.root + '/schedules')
        old = next(s for s in schedules if s['agent_id'] == self.state['agent_id'])
        self.request('PUT', self.root + '/agents/' + self.state['agent_id'] + '/schedule', json={
            'expected_version': old['version'], 'interval_days': 90, 'remaining_runs': 1, 'enabled': True})
        with sqlite3.connect(ROOT / '.local/account-qa.sqlite3') as db:
            db.execute("UPDATE agent_schedules SET next_run_at=datetime('now','-1 minute') WHERE agent_id=? AND workspace_id=?",
                       (self.state['agent_id'], self.state['workspace_id']))
        deadline = time.monotonic() + 30
        scheduled = None
        while time.monotonic() < deadline:
            schedules = self.request('GET', self.root + '/schedules')
            current = next(s for s in schedules if s['agent_id'] == self.state['agent_id'])
            if current['last_job_id']:
                scheduled = current
                break
            time.sleep(1)
        assert scheduled and scheduled['remaining_runs'] == 0 and not scheduled['enabled'], current
        self.report['jobs']['scheduled-live-discovery'] = scheduled['last_job_id']
        result = self.job('scheduled-live-discovery', '', {})
        assert result.get('result', {}).get('leads'), result
        self.record('scheduler_to_real_worker_and_finite_run_stop', 'passed',
                    triggered_by='Only the test schedule timestamp was brought forward; normal scheduler and real upstreams executed.',
                    job_status=result['status'])
        paused = self.request('POST', self.root + '/agents/' + self.state['agent_id'] + '/pause')
        assert paused['status'] == 'paused', paused
        self.record('agent_pause', 'passed')


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://127.0.0.1:18084')
    parser.add_argument('--phase', required=True, choices=('core', 'discovery', 'sources', 'customs', 'advanced', 'enhanced', 'contacts'))
    parser.add_argument('--retry-failed', action='store_true', help='Create new jobs only for previously failed/partial checks.')
    args = parser.parse_args()
    checks = LiveChecks(args.base_url)
    if args.retry_failed:
        for label, row in checks.report.get('job_results', {}).items():
            if row['status'] in ('failed', 'partial'):
                checks.report['jobs'].pop(label, None)
                checks.report.setdefault('attempts', {})[label] = checks.report.get('attempts', {}).get(label, 1) + 1
        save_json(REPORT, checks.report)
    try:
        checks.setup()
        getattr(checks, args.phase)()
        checks.record(args.phase, 'passed')
    except Exception as exc:
        checks.record(args.phase, 'failed', reason=str(exc)[:2000])
        raise
    finally:
        checks.client.close()


if __name__ == '__main__':
    main()
