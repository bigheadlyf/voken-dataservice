from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Event
from time import monotonic, sleep
from unittest import TestCase

import httpx
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import Settings
from app.db import Base, Job, ProviderCall, Wallet, utcnow, write_transaction
from app.deepseek import DeepSeek, ProviderError
from app.main import create_app
from app.upkuajing import Upkuajing
from app.worker import Worker


class FixtureDeepSeek:
    def __init__(self):
        self.calls = []
        self.scenarios = []

    def complete(self, _prompt, payload, _max_tokens, scenario=None):
        self.calls.append('model')
        self.scenarios.append(scenario)
        if 'lead' in payload:
            result = {'overview': 'Public buyer page', 'opportunity': 'Review the tender',
                      'highlights': [{'text': 'Public tender', 'source_ids': [0, 999, 0]}],
                      'risks': ['No credit report'], 'next_steps': ['Verify the bid deadline'],
                      'source_ids': [0, 999]}
        elif 'sources' in payload:
            deadline = (utcnow().date() + timedelta(days=7)).isoformat()
            result = {'leads': [{'name': 'Fixture Buyer', 'role': 'buyer', 'location': 'US',
                                 'source_id': 0, 'quote': 'Buying LED products', 'demand': True,
                                 'deadline_date': deadline, 'deadline_quote': f'Submission deadline: {deadline}'}]}
        else:
            result = {'market': 'US', 'product': 'LED', 'target_count': 1,
                      'queries': ['LED procurement'], 'require_procurement_evidence': True}
        return {'output': result, 'usage': {'total_tokens': 10}}

    def search(self, query):
        self.calls.append(query)
        return {'hits': [{'url': 'https://example.com/tender', 'title': 'Fixture Buyer — Tender'}], 'billable': True}

    def fetch(self, url):
        self.calls.append(url)
        deadline = (utcnow().date() + timedelta(days=7)).isoformat()
        return {'content': f'Buying LED products. Submission deadline: {deadline}', 'billable': True}


class ServiceTest(TestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        database = Path(temporary.name, 'test.sqlite3').as_posix()
        self.settings = Settings(environment='test', database_url=f'sqlite:///{database}',
                                 point_cost_overrides={'report': 3})
        self.upstream = FixtureDeepSeek()
        self.app = create_app(settings=self.settings, run_worker=False)
        self.sessions = self.app.state.sessions
        Base.metadata.create_all(self.sessions.kw['bind'])
        self.client = TestClient(self.app)
        self.addCleanup(self.sessions.kw['bind'].dispose)
        self.addCleanup(self.client.close)

    def register_and_login(self, phone):
        auth = '/api/v1/auth'
        issued = self.client.post(auth + '/verification-codes', json={'phone': phone})
        self.assertEqual(issued.status_code, 201, issued.text)
        body = {'phone': phone, 'password': 'valid-password'}
        registration = dict(body, challenge_id=issued.json()['challenge_id'], code='123456')
        response = self.client.post(auth + '/register', json=registration)
        self.assertEqual(response.status_code, 201, response.text)
        duplicate = self.client.post(auth + '/register', json=dict(registration, phone=f'+86{phone}'))
        self.assertEqual(duplicate.status_code, 409)
        login = self.client.post(auth + '/login', json=body)
        self.assertEqual(login.status_code, 200, login.text)
        return login.json()['workspace_id'], {'Authorization': f'Bearer {login.json()["access_token"]}'}

    def test_prospect_report_and_tenant_isolation(self):
        workspace, token = self.register_and_login('13800000000')
        _, other_token = self.register_and_login('13800000001')
        root = f'/api/v1/workspaces/{workspace}'
        self.assertEqual(self.client.get(root + '/points', headers=token).json()['available'], 1000)
        self.assertEqual(self.client.get(root + '/points', headers=other_token).status_code, 404)
        self.assertEqual(self.client.get(root + '/points/costs', headers=token).json()['report'], 3)
        configuration = {'name': 'LED', 'instructions': 'Find USA LED buyers', 'target_count': 1}
        created = self.client.post(root + '/agents', headers=token, json=configuration)
        self.assertEqual(created.status_code, 201, created.text)
        self.assertEqual(created.json()['status'], 'paused')
        employee = root + '/agents/' + created.json()['id']
        start_headers = dict(token, **{'Idempotency-Key': 'led-run'})
        submitted = self.client.post(employee + '/runs', headers=start_headers)
        self.assertEqual(submitted.status_code, 202, submitted.text)
        job = submitted.json()
        duplicate = self.client.post(employee + '/runs', headers=start_headers).json()
        self.assertEqual(duplicate['id'], job['id'])
        self.assertEqual(self.client.post(employee + '/runs', headers=token).status_code, 409)
        saved = self.client.patch(employee, headers=token, json={'instructions': 'Find newer leads'})
        self.assertEqual(saved.json()['config_version'], 2)
        with self.sessions() as session:
            self.assertEqual(session.get(Job, job['id']).payload['instructions'], configuration['instructions'])

        worker = Worker(self.sessions, self.settings, self.upstream)
        self.assertTrue(worker.run_next())
        result = self.client.get(root + '/jobs/' + job['id'], headers=token).json()
        self.assertEqual(result['status'], 'succeeded')
        self.assertEqual(result['config_version'], 1)
        self.assertEqual(result['points_charged'], 1)
        self.assertEqual(result['result']['leads'][0]['evidence_type'], 'public_demand_signal')
        self.assertEqual(self.client.get(root + '/jobs/' + job['id'], headers=other_token).status_code, 404)

        report = self.client.post(root + '/reports', headers=token, json={'job_id': job['id'], 'lead_index': 0})
        self.assertEqual(report.status_code, 202, report.text)
        self.assertTrue(worker.run_next())
        report = self.client.get(root + '/reports/' + report.json()['id'], headers=token).json()
        self.assertEqual(report['result']['report']['source_ids'], [0])
        self.assertEqual(report['result']['report']['highlights'][0]['source_ids'], [0])
        self.assertEqual(report['result']['report']['next_steps'], ['Verify the bid deadline'])
        self.assertEqual(report['result']['sources'][0]['evidence_status'], 'text_available')
        self.assertEqual(report['result']['subject']['name'], 'Fixture Buyer')
        self.assertEqual(report['points_charged'], 3)
        # The fixture has no full name in its body; review safely skips the model.
        self.assertEqual(self.upstream.scenarios, ['judgment'] * 3 + ['analysis'])
        self.assertEqual(self.client.get(root + '/points', headers=token).json()['available'], 996)

        with write_transaction(self.sessions) as session:
            saved_report = session.get(Job, report['id'])
            legacy_sections = {key: saved_report.result['report'][key] for key in ('overview', 'opportunity', 'risks', 'source_ids')}
            legacy_sources = [{key: value for key, value in source.items() if key != 'evidence_status'}
                              for source in saved_report.result['sources']]
            saved_report.result = {**saved_report.result, 'report': legacy_sections, 'sources': legacy_sources}
        legacy = self.client.get(root + '/reports/' + report['id'], headers=token).json()['result']
        self.assertEqual(legacy['sources'][0]['evidence_status'], 'text_available')
        self.assertEqual(legacy['report'], legacy_sections)
        self.assertEqual(self.client.get(root + '/points', headers=token).json()['available'], 996)

        next_run = self.client.post(employee + '/runs', headers=token).json()
        self.assertEqual(next_run['config_version'], 2)
        self.assertEqual(self.client.post(employee + '/pause', headers=token).json()['status'], 'paused')
        cancelled = self.client.get(root + '/jobs/' + next_run['id'], headers=token).json()
        self.assertEqual(cancelled['status'], 'cancelled')
        self.assertEqual(self.client.get(root + '/points', headers=token).json()['available'], 996)
        self.assertEqual(self.client.delete(employee, headers=token).status_code, 204)
        self.assertEqual(self.client.get(root + '/agents', headers=token).json(), [])
        self.assertEqual(self.client.get(root + '/jobs/' + job['id'], headers=token).status_code, 200)

    def test_atomic_reservation_and_restart(self):
        workspace, token = self.register_and_login('13800000000')
        root = f'/api/v1/workspaces/{workspace}'
        with write_transaction(self.sessions) as session:
            session.get(Wallet, workspace).available = 1

        def submit(key):
            return self.client.post(root + '/public-searches', headers=dict(token, **{'Idempotency-Key': key}),
                                    json={'instructions': 'Find public updates'})

        with ThreadPoolExecutor(max_workers=2) as pool:
            replies = list(pool.map(submit, ('search-a', 'search-b')))
        self.assertEqual(sorted(reply.status_code for reply in replies), [202, 409])
        job_id = next(reply.json()['id'] for reply in replies if reply.status_code == 202)
        with write_transaction(self.sessions) as session:
            session.get(Job, job_id).status = 'running'
            session.add(ProviderCall(job_id=job_id, step='plan', endpoint='model', status='started'))

        worker = Worker(self.sessions, self.settings, self.upstream)
        worker.recover()
        self.assertTrue(worker.run_next())
        self.assertEqual(self.upstream.calls, [])
        with self.sessions() as session:
            self.assertEqual(session.get(Job, job_id).status, 'failed')
            self.assertEqual(session.scalar(select(ProviderCall.status).where(ProviderCall.job_id == job_id)), 'unknown')
        balance = self.client.get(root + '/points', headers=token).json()
        self.assertEqual((balance['available'], balance['reserved']), (1, 0))

    def test_pause_running_job_stops_before_next_provider_call(self):
        workspace, token = self.register_and_login('13800000000')
        root = f'/api/v1/workspaces/{workspace}'
        entered, release = Event(), Event()

        class BlockingSearch(FixtureDeepSeek):
            def search(self, query):
                entered.set()
                if not release.wait(5):
                    raise RuntimeError('Test timed out waiting for pause')
                return super().search(query)

        provider = BlockingSearch()
        worker = Worker(self.sessions, self.settings, provider)
        created = self.client.post(root + '/agents', headers=token, json={'name': 'Test', 'instructions': 'LED buyers'})
        employee = root + '/agents/' + created.json()['id']
        job_id = self.client.post(employee + '/runs', headers=token).json()['id']
        with ThreadPoolExecutor(max_workers=1) as pool:
            running = pool.submit(worker.run_next)
            try:
                self.assertTrue(entered.wait(5))
                self.assertEqual(self.client.post(employee + '/pause', headers=token).status_code, 200)
                self.assertEqual(self.client.get(root + '/jobs/' + job_id, headers=token).json()['status'], 'cancelling')
            finally:
                release.set()
            self.assertTrue(running.result(timeout=5))
        result = self.client.get(root + '/jobs/' + job_id, headers=token).json()
        self.assertEqual(result['status'], 'cancelled')
        self.assertEqual(result['points_charged'], 0)
        self.assertEqual(result['result']['sources'][0]['url'], 'https://example.com/tender')
        self.assertEqual(provider.calls, ['model', 'LED procurement'])

    def test_lifespan_processes_queued_jobs(self):
        running_app = create_app(settings=self.settings, deepseek=self.upstream)
        with TestClient(running_app) as client:
            workspace, token = self.register_and_login('13800000000')
            root = f'/api/v1/workspaces/{workspace}'
            submitted = client.post(root + '/public-searches', headers=token, json={'instructions': 'LED updates'})
            self.assertEqual(submitted.status_code, 202, submitted.text)
            job_path = root + '/jobs/' + submitted.json()['id']
            deadline = monotonic() + 5
            while monotonic() < deadline:
                job = client.get(job_path, headers=token).json()
                if job['status'] == 'succeeded':
                    break
                sleep(0.05)
            self.assertEqual(job['status'], 'succeeded')

    def test_prospecting_timeout_without_leads_releases_points(self):
        workspace, token = self.register_and_login('13800000000')
        root = f'/api/v1/workspaces/{workspace}'

        class ExtractionTimeout(FixtureDeepSeek):
            def complete(self, prompt, payload, max_tokens, scenario=None):
                if 'sources' in payload:
                    raise ProviderError('deepseek_read_timeout', unknown_charge=True)
                return super().complete(prompt, payload, max_tokens, scenario)

        agent = self.client.post(root + '/agents', headers=token,
                                 json={'name': 'LED', 'instructions': 'Find USA LED buyers'}).json()
        response = self.client.post(root + '/agents/' + agent['id'] + '/runs', headers=token)
        self.assertEqual(response.status_code, 202, response.text)
        job_id = response.json()['id']
        worker = Worker(self.sessions, self.settings, ExtractionTimeout())
        self.assertTrue(worker.run_next())

        result = self.client.get(root + '/jobs/' + job_id, headers=token).json()
        self.assertEqual((result['status'], result['error'], result['points_charged']),
                         ('failed', 'deepseek_read_timeout', 0))
        self.assertEqual(len(result['result']['sources']), 1)
        balance = self.client.get(root + '/points', headers=token).json()
        self.assertEqual((balance['available'], balance['reserved']), (1000, 0))
        with self.sessions() as session:
            checkpoint = session.scalar(select(ProviderCall).where(
                ProviderCall.job_id == job_id, ProviderCall.step == 'leads',
            ))
            self.assertEqual(checkpoint.status, 'unknown')

    def test_customs_requires_confirmation_and_obeys_daily_limit(self):
        workspace, token = self.register_and_login('13800000000')
        self.app.state.customs_configured = True
        settings = replace(self.settings, upkuajing_daily_call_limit=1)
        self.app.state.settings = settings
        calls = []

        def respond(request):
            calls.append(request)
            return httpx.Response(200, json={
                'code': 0, 'requestId': 'fixture-request', 'fee': {'apiCost': 150},
                'data': {'list': [{'uuid': 'fixture-trade', 'buyer': 'Fixture Buyer', 'tradeDate': 1735689600000}]},
            })

        root = f'/api/v1/workspaces/{workspace}'
        path = root + '/customs-verifications'
        body = {'buyer': 'Fixture Buyer', 'buyer_country': 'RU', 'hs_code': '401110',
                'date_start': '2025-01-01', 'date_end': '2025-03-31'}
        headers = dict(token, **{'Idempotency-Key': 'fixture-trade'})
        self.assertEqual(self.client.post(path, headers=headers, json=body).status_code, 422)
        self.assertEqual(self.client.post(path, headers=token, json=dict(body, confirm_paid=True)).status_code, 422)
        adapter = Upkuajing('fixture-secret', transport=httpx.MockTransport(respond))
        self.addCleanup(adapter.close)
        worker = Worker(self.sessions, settings, self.upstream, adapter)
        response = self.client.post(path, headers=headers, json=dict(body, confirm_paid=True))
        self.assertEqual(response.status_code, 202, response.text)
        job = response.json()
        self.assertTrue(worker.run_next())
        replay = self.client.post(path, headers=headers, json=dict(body, confirm_paid=True)).json()
        self.assertEqual(replay['id'], job['id'])
        result = self.client.get(root + '/jobs/' + job['id'], headers=token).json()
        self.assertEqual(result['result']['customs']['records'][0]['trade_id'], 'fixture-trade')
        self.assertEqual(result['result']['customs']['reported_milli_cny'], 1500)
        self.assertEqual(result['points_charged'], 151)

        logs_path = root + '/jobs/' + job['id'] + '/provider-logs'
        logs = self.client.get(logs_path, headers=token).json()
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0]['request']['body']['buyerCountryCodes'], ['RU'])
        self.assertEqual(logs[0]['response']['body']['requestId'], 'fixture-request')
        self.assertEqual(logs[0]['response']['status_code'], 200)
        self.assertGreaterEqual(logs[0]['response']['duration_ms'], 0)
        self.assertNotIn('fixture-secret', str(logs))
        self.assertEqual(self.client.get(logs_path).status_code, 401)
        _, other_token = self.register_and_login('13800000009')
        self.assertEqual(self.client.get(logs_path, headers=other_token).status_code, 404)

        second_headers = dict(token, **{'Idempotency-Key': 'another-trade'})
        next_job = self.client.post(path, headers=second_headers, json=dict(body, confirm_paid=True)).json()
        self.assertTrue(worker.run_next())
        result = self.client.get(root + '/jobs/' + next_job['id'], headers=token).json()
        self.assertEqual((result['error'], result['points_charged']), ('upkuajing_daily_limit', 0))
        self.assertEqual(len(calls), 1)
        self.assertTrue(str(calls[0].url).endswith('/agent/customs/trade/list'))
        self.assertIn(b'"buyerCountryCodes":["RU"]', calls[0].content)

    def test_buyer_match_reuses_identity_for_profile_contacts_and_trade(self):
        import json

        workspace, token = self.register_and_login('13800000000')
        _, other = self.register_and_login('13800000001')
        self.app.state.customs_configured = True
        calls = []

        def respond(request):
            path = request.url.path
            body = json.loads(request.content)
            calls.append((path, body))
            if path.endswith('/company/list'):
                data = {'list': [{'companyId': '42', 'name': 'Fixture Buyer', 'countryInfo': {'code_iso2': 'US'}},
                                 {'companyId': 43, 'name': 'Same Name', 'countryInfo': {'code_iso2': 'CA'}}]}
            elif path.endswith('/detail/batch'):
                data = [{'companyId': 42, 'name': 'Fixture Buyer', 'registerNumber': 'US-42'}]
            elif path.endswith('/contact/batch'):
                data = {'list': [{'companyId': 42, 'emails': [{'val': 'sales@example.com', 'is_valid': 1}]}]}
            else:
                data = {'list': [{'uuid': 'fixture-trade', 'buyer': 'Fixture Buyer'}]}
            return httpx.Response(200, json={'code': 0, 'data': data})

        adapter = Upkuajing('fixture-secret', transport=httpx.MockTransport(respond))
        self.addCleanup(adapter.close)
        worker = Worker(self.sessions, self.settings, self.upstream, adapter)
        root = f'/api/v1/workspaces/{workspace}'

        def submit(path, key, **body):
            response = self.client.post(root + path, headers=dict(token, **{'Idempotency-Key': key}),
                                        json=dict(body, confirm_paid=True))
            self.assertEqual(response.status_code, 202, response.text)
            return response.json()['id']

        search_body = {'action': 'search', 'buyer': 'Fixture Buyer', 'buyer_country': 'US'}
        match_job = submit('/buyer-enrichments', 'match', **search_body)
        self.assertTrue(worker.run_next())
        self.assertEqual(submit('/buyer-enrichments', 'match-repeated', **search_body), match_job)
        matches = self.client.get(root + '/jobs/' + match_job, headers=token).json()['result']['buyer']['records']
        self.assertEqual([match['company_id'] for match in matches], [42])

        target = {'match_job_id': match_job, 'company_id': 42}
        denied = self.client.post(root + '/buyer-enrichments', headers=dict(other, **{'Idempotency-Key': 'denied'}),
                                  json=dict(target, action='profile', confirm_paid=True))
        self.assertEqual(denied.status_code, 404)
        profile = submit('/buyer-enrichments', 'profile', action='profile', **target)
        contacts = submit('/buyer-enrichments', 'contacts', action='contacts', **target)
        trade = submit('/customs-verifications', 'trade', buyer='Fixture Buyer', buyer_country='US', hs_code='401110',
                       date_start='2025-01-01', date_end='2025-03-31', **target)
        for _ in range(3):
            self.assertTrue(worker.run_next())
        for job_id, field, key, value in (
            (profile, 'buyer', 'registerNumber', 'US-42'), (contacts, 'buyer', 'validity', 1),
            (trade, 'customs', 'trade_id', 'fixture-trade'),
        ):
            record = self.client.get(root + '/jobs/' + job_id, headers=token).json()['result'][field]['records'][0]
            self.assertEqual(record[key], value)
        by_path = dict(calls)
        self.assertEqual(len(calls), 4)
        self.assertEqual(by_path['/agent/customs/company/detail/batch']['companyIds'], [42])
        self.assertEqual(by_path['/agent/customs/company/contact/batch']['companyIds'], [42])
        self.assertEqual(by_path['/agent/customs/trade/list']['buyerId'], 42)
        self.assertNotIn('buyer', by_path['/agent/customs/trade/list'])


class DeepSeekTest(TestCase):
    def test_tools_and_model_use_separate_endpoints(self):
        import json

        bodies = []

        def respond(request):
            self.assertEqual(request.headers['Authorization'], 'Bearer synthetic-key')
            path = request.url.path
            bodies.append((path, json.loads(request.content)))
            if path.endswith('/search'):
                return httpx.Response(200, json={'results': [{'url': 'https://example.com/', 'title': 'Example'}]})
            if path.endswith('/fetch'):
                return httpx.Response(200, json={'content': ''})
            return httpx.Response(200, json={'choices': [{'message': {'content': '{"ok":true}'}}]})

        adapter = DeepSeek(Settings(llm_api_key='synthetic-key', tools_api_key='synthetic-key'))
        adapter.close()
        with httpx.Client(base_url='https://api.deepseek.com', transport=httpx.MockTransport(respond)) as client:
            adapter.client = client
            self.assertTrue(adapter.search('LED site:example.com')['billable'])
            self.assertFalse(adapter.fetch('https://example.com/')['billable'])
            self.assertTrue(adapter.complete('Return JSON', {}, 100)['output']['ok'])
        self.assertEqual([path for path, _ in bodies], ['/v1/tools/search', '/v1/tools/fetch', '/chat/completions'])
        self.assertEqual(bodies[2][1]['model'], 'deepseek-flash')
        self.assertEqual(bodies[2][1]['thinking'], {'type': 'disabled'})

    def test_model_timeout_keeps_provider_charge_unknown(self):
        def timeout(request):
            self.assertEqual(request.extensions['timeout']['read'], 90)
            raise httpx.ReadTimeout('fixture timeout', request=request)

        adapter = DeepSeek(Settings(llm_api_key='synthetic-key', tools_api_key='synthetic-key'))
        adapter.close()
        with httpx.Client(base_url='https://api.deepseek.com', transport=httpx.MockTransport(timeout)) as client:
            adapter.client = client
            with self.assertRaises(ProviderError) as context:
                adapter.complete('Return JSON', {}, 100)
        self.assertEqual(context.exception.code, 'deepseek_read_timeout')
        self.assertTrue(context.exception.unknown_charge)


class TestConsoleTest(TestCase):
    def test_asset_versions_match_served_file_contents(self):
        import re
        from hashlib import sha256

        for prefix in ('', '/api'):
            with self.subTest(prefix=prefix), TestClient(create_app(settings=Settings(environment='test', web_prefix=prefix))) as client:
                page = client.get(prefix + '/')
                self.assertEqual(page.headers['cache-control'], 'no-store')
                for filename in ('console.js', 'styles.css'):
                    version = re.search(re.escape(filename) + r'\?v=([a-f0-9]{16})', page.text)
                    self.assertIsNotNone(version, page.text)
                    asset = client.get(prefix + '/test-assets/' + filename + '?v=' + version[1])
                    self.assertEqual(asset.status_code, 200)
                    self.assertEqual(version[1], sha256(asset.content).hexdigest()[:16])

    def test_prefixed_console_docs_and_health_keep_business_routes(self):
        with TestClient(create_app(settings=Settings(environment='test', web_prefix='/api'))) as client:
            self.assertEqual(client.get('/api/').status_code, 200)
            self.assertEqual(client.get('/api/test-assets/console.js').status_code, 200)
            self.assertEqual(client.get('/api/health').json()['status'], 'ok')
            docs = client.get('/api/docs')
            self.assertEqual(docs.status_code, 200)
            self.assertIn('/api/openapi.json', docs.text)
            schema = client.get('/api/openapi.json').json()
            self.assertIn('/api/v1/auth/login', schema['paths'])
            self.assertNotIn('/api/api/v1/auth/login', schema['paths'])
            self.assertEqual(client.get('/health').status_code, 404)

    def test_console_is_served_only_in_test_mode(self):
        with TestClient(create_app(settings=Settings(environment='test'))) as client:
            response = client.get('/')
            self.assertEqual(response.status_code, 200)
            self.assertIn('test-assets/console.js', response.text)
            self.assertEqual(client.get('/test-assets/console.js').status_code, 200)
            self.assertEqual(client.get('/test-assets/styles.css').status_code, 200)
            self.assertFalse(client.get('/health').json()['deepseek_configured'])

        with TestClient(create_app(settings=Settings(environment='production'))) as client:
            response = client.get('/', follow_redirects=False)
            self.assertEqual(response.status_code, 307)
            self.assertEqual(response.headers['location'], '/app')
            self.assertEqual(client.get('/').status_code, 200)
            product = client.get('/app')
            self.assertIn('/app-assets/react/app.js?v=', product.text)
            self.assertIn('/app-assets/react/main.css?v=', product.text)
            self.assertNotIn('__STYLE_NONCE__', product.text)
            self.assertNotIn('__UI_VERSION__', product.text)
            self.assertIn("script-src 'self'", product.headers['content-security-policy'])
            self.assertIn("style-src 'self' 'nonce-", product.headers['content-security-policy'])
            self.assertEqual(client.get('/app-assets/react/app.js').status_code, 200)
            self.assertEqual(client.get('/app-assets/react/main.css').status_code, 200)
            self.assertIn('/app-assets/app.js', client.get('/app?legacy=true').text)
            self.assertFalse(client.get('/health').json()['self_registration_available'])
            self.assertEqual(client.get('/test-assets/console.js').status_code, 404)

        with TestClient(create_app(settings=Settings(environment='production', web_prefix='/api'))) as client:
            response = client.get('/api/', follow_redirects=False)
            self.assertEqual(response.status_code, 307)
            self.assertEqual(response.headers['location'], '/api/app')
            self.assertEqual(client.get('/api/').status_code, 200)
            self.assertIn('/api/app-assets/react/app.js?v=', client.get('/api/app').text)
            self.assertEqual(client.get('/api/app-assets/react/app.js').status_code, 200)
