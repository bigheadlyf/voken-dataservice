from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase

from fastapi.testclient import TestClient

from app.assistant import available_operations
from app.config import Settings
from app.db import Base
from app.main import create_app
import test_service


class ScriptedModel:
    def complete(self, prompt, payload, max_tokens, scenario):
        return {'output': next(self.script)(payload)}


def call(operation, **arguments):
    return lambda _: {'tool_call': {'operation': operation, **arguments}}


class AssistantTest(TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.model = ScriptedModel()
        settings = Settings(environment='test', database_url='sqlite:///' + Path(directory.name, 'test.db').as_posix())
        self.app = create_app(settings=settings, deepseek=self.model, run_worker=False)
        engine = self.app.state.sessions.kw['bind']
        Base.metadata.create_all(engine)
        self.addCleanup(engine.dispose)
        self.client = TestClient(self.app)
        self.addCleanup(self.client.close)
        workspace, self.auth = test_service.ServiceTest.register_and_login(self, '13900000661')
        self.root = f'/api/v1/workspaces/{workspace}'

    def send(self, key='test-message', **body):
        return self.client.post(self.root + '/assistant/messages', json={'content': '请查询或执行指定操作', **body},
                                headers={**self.auth, 'Idempotency-Key': key})

    def decide(self, turn, approve=True, **kwargs):
        return self.client.post(self.root + f"/assistant/messages/{turn['id']}/decision",
                                data={'approve': str(approve)}, headers=self.auth, **kwargs)

    def test_reads_real_workbench_data_and_isolates_history(self):
        self.client.post(self.root + '/crm/prospects/import', headers=self.auth, json={'items': [
            {'name': 'Fixture Company', 'location': 'DE', 'source_note': 'Assistant acceptance'}]}).raise_for_status()

        def answer(payload):
            self.assertEqual(payload['observations'][-1]['result']['items'][0]['name'], 'Fixture Company')
            return {'reply': '有 1 家企业，Fixture Company。'}

        self.model.script = iter([call('GET /crm/workbench', query={'q': 'Fixture'}), answer])
        turn = self.send().json()
        self.assertEqual(turn['status'], 'succeeded', turn)
        self.assertIn('Fixture Company', turn['response'])
        history = '/assistant/conversations/' + turn['conversation_id'] + '/messages'
        self.assertEqual(self.client.get(self.root + history, headers=self.auth).json()['turns'], [turn])
        other, other_auth = test_service.ServiceTest.register_and_login(self, '13900000662')
        self.assertEqual(self.client.get(self.root + history, headers=other_auth).status_code, 404)
        self.assertEqual(self.client.get(f'/api/v1/workspaces/{other}' + history, headers=other_auth).status_code, 404)
        self.assertEqual(self.send().json(), turn)
        self.assertEqual(self.send(content='另一个问题').status_code, 409)

    def test_create_task_requires_confirmation_and_replay_submits_once(self):
        employee = self.client.post(self.root + '/agents', headers=self.auth, json={
            'name': 'LED fixture', 'instructions': 'Find LED buyers in Germany'}).json()['id']
        self.model.script = iter([call('POST /agents/{agent_id}/runs', path={'agent_id': employee})])
        turn = self.send().json()
        self.assertEqual(turn['status'], 'pending', turn)
        self.assertGreater(turn['proposal']['point_quote']['total_points'], 0)
        self.assertEqual(self.client.get(self.root + '/jobs', headers=self.auth).json(), [])
        result = self.decide(turn).json()
        self.assertEqual(result['status'], 'succeeded', result)
        self.assertEqual(result['calls'][-1]['job']['status'], 'queued')
        self.assertEqual(self.decide(turn).json(), result)
        jobs = self.client.get(self.root + '/jobs', headers=self.auth).json()
        self.assertEqual([job['id'] for job in jobs], [result['calls'][-1]['job']['id']])

    def test_paid_flag_is_only_applied_after_approval_and_cancellation_is_final(self):
        self.model.script = iter([call('POST /directory/searches', body={
            'company_name': 'Fixture Company', 'confirm_paid': True})])
        turn = self.send().json()
        self.assertEqual(turn['status'], 'pending', turn)
        self.assertNotIn('confirm_paid', turn['proposal']['body'])
        self.assertEqual(turn['proposal']['authorizations'], ['confirm_paid'])
        self.assertEqual(self.decide(turn, False).json()['status'], 'cancelled')
        self.assertEqual(self.decide(turn).json()['status'], 'cancelled')
        self.assertEqual(self.client.get(self.root + '/jobs', headers=self.auth).json(), [])

    def test_file_operation_requires_the_reviewed_attachment(self):
        contents = b'name,location\nFixture Company,DE\n'
        self.model.script = iter([call('POST /crm/workbench/imports/preview')])
        turn = self.send(attachment={'name': 'example.csv', 'size': len(contents)}).json()
        self.assertEqual(turn['status'], 'pending', turn)
        self.assertEqual(self.decide(turn).status_code, 422)
        result = self.decide(turn, files={'file': ('example.csv', contents, 'text/csv')}).json()
        self.assertEqual(result['status'], 'succeeded', result)
        self.assertEqual(result['calls'][-1]['http_status'], 201)

    def test_catalog_excludes_nonworkspace_and_recursive_calls(self):
        catalog = available_operations(self.app)
        self.assertIn('POST /crm/workbench/imports/preview', catalog)
        self.assertFalse(any('/assistant/' in name or '/auth/' in name for name in catalog))

        def answer(payload):
            self.assertEqual(len(payload['observations']), 2)
            self.assertTrue(all('error' in item for item in payload['observations']))
            return {'reply': '请求的操作不可用。'}

        self.model.script = iter([
            call('POST /assistant/messages'),
            call('GET /jobs/{job_id}', path={'job_id': '../points'}),
            answer,
        ])
        self.assertEqual(self.send().json()['calls'], [])
