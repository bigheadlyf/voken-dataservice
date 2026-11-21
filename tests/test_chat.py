from concurrent.futures import ThreadPoolExecutor
from threading import Event

from unittest import TestCase

from app.chat import AgentTool, Empty
from app.db import AgentTurn
from app.agent_memory import SQLAlchemySaver
from app.main import create_app
from app.deepseek import ProviderError
from app.worker import Worker
import test_service


class ScriptedModel:
    def __init__(self, outputs):
        self.outputs = iter(outputs)
        self.payloads = []
        self.scenarios = []

    def complete(self, prompt, payload, max_tokens, scenario=None):
        self.payloads.append(payload.copy())
        self.scenarios.append(scenario)
        value = next(self.outputs)
        if isinstance(value, Exception):
            raise value
        return {'output': value}


def call(name, **arguments):
    return {'tool_call': {'name': name, 'arguments': arguments}}


class ChatTest(TestCase):
    register_and_login = test_service.ServiceTest.register_and_login

    def setUp(self):
        test_service.ServiceTest.setUp(self)
        self.workspace, self.token = self.register_and_login('13800000000')
        self.root = f'/api/v1/workspaces/{self.workspace}'
        created = self.client.post(self.root + '/agents', headers=self.token,
                                   json={'name': '销售助手', 'instructions': '寻找采购商'})
        self.agent = created.json()['id']
        self.path = self.root + '/agents/' + self.agent

    def send(self, key, content='寻找美国LED采购商', **kwargs):
        return self.client.post(self.path + '/messages',
            headers={**self.token, 'Idempotency-Key': key}, json={'content': content, **kwargs})

    def model(self, *outputs):
        model = ScriptedModel(outputs)
        self.app.state.chat_provider = model
        return model

    def test_chat_updates_runs_replays_and_reads_results(self):
        model = self.model(call('update_agent', market='US', product='LED', target_count=1),
                           call('start_task'), {'reply': '已提交拓客任务，可继续查询结果。'})
        reply = self.send('chat-1')
        self.assertEqual(reply.status_code, 200, reply.text)
        turn = reply.json()
        self.assertEqual(turn['status'], 'succeeded')
        job = turn['tool_calls'][1]['result']
        self.assertEqual(job['config_version'], 2)
        self.assertEqual(job['status'], 'queued')
        self.assertEqual(self.send('chat-1').json(), turn)
        self.assertEqual(len(model.payloads), 3)
        self.assertEqual(model.scenarios, ['chat', 'chat', 'chat'])
        self.assertEqual(self.send('chat-1', content='不同内容').status_code, 409)
        self.assertEqual(self.client.get(self.root + '/points', headers=self.token).json()['reserved'], 1)
        Worker(self.sessions, self.settings, self.upstream).run_next()
        model = self.model(call('get_job', job_id=job['id']), {'reply': '任务已完成。'})
        result = self.send('chat-2', content='任务结果如何？', conversation_id=turn['conversation_id']).json()
        self.assertEqual(result['tool_calls'][0]['result']['status'], 'succeeded')
        self.assertEqual(len(model.payloads[0]['history']), 1)
        messages = self.client.get(self.path + '/conversations/' + turn['conversation_id'] + '/messages', headers=self.token)
        self.assertEqual(len(messages.json()), 2)
        page = self.client.get(self.path + '/conversations/' + turn['conversation_id'] + '/messages',
                               headers=self.token, params={'before': result['id']}).json()
        self.assertEqual([row['id'] for row in page], [turn['id']])

    def test_paid_tools_require_current_request_confirmation(self):
        arguments = {'action': 'search', 'buyer': 'Buyer', 'buyer_country': 'US', 'confirm_paid': True}
        self.model(call('buyer_enrichment', **arguments), {'reply': '请先确认付费查询。'})
        denied = self.send('paid-denied').json()
        self.assertEqual(denied['tool_calls'][0]['result']['error'], 'paid_confirmation_required')
        self.assertEqual(self.client.get(self.root + '/jobs', headers=self.token).json(), [])
        self.app.state.customs_configured = True
        self.model(call('buyer_enrichment', **arguments), {'reply': '已提交采购商匹配。'})
        allowed = self.send('paid-allowed', confirm_paid=True).json()
        self.assertEqual(allowed['tool_calls'][0]['result']['operation'], 'buyer_search')

    def test_scope_validation_and_unknown_tools(self):
        other_workspace, other_token = self.register_and_login('13800000001')
        self.assertEqual(self.client.post(self.path + '/messages', headers=other_token,
                                         json={'content': '你好'}).status_code, 404)
        self.assertEqual(self.client.post(self.path + '/messages', headers=self.token,
                                         json={'content': '你好'}).status_code, 422)
        self.model(call('execute_python', code='anything'), call('update_agent', target_count=99), {'reply': '参数无效。'})
        turn = self.send('invalid').json()
        self.assertEqual([c['status'] for c in turn['tool_calls']], ['failed', 'failed'])
        other_agent = self.client.post(self.root + '/agents', headers=self.token,
                                      json={'name': '另一个助手', 'instructions': '查询'}).json()['id']
        foreign_path = self.root + '/agents/' + other_agent + '/conversations/' + turn['conversation_id'] + '/messages'
        self.assertEqual(self.client.get(foreign_path, headers=self.token).status_code, 404)
        self.model(call('get_job', job_id='a' * 32), {'reply': '任务不存在。'})
        result = self.send('missing-job').json()
        self.assertEqual(result['tool_calls'][0]['result']['error'], 'job_not_found')

    def test_failure_preserves_side_effects_and_releases_conversation(self):
        self.model(call('start_task'), ProviderError('deepseek_read_timeout'))
        failed = self.send('timeout').json()
        self.assertEqual(failed['status'], 'failed')
        self.assertEqual(failed['tool_calls'][0]['status'], 'succeeded')
        self.assertEqual(self.send('timeout').json(), failed)
        self.model({'reply': '可以继续对话。'})
        self.assertEqual(self.send('continue', conversation_id=failed['conversation_id']).json()['status'], 'succeeded')
        self.assertEqual(len(self.client.get(self.root + '/jobs', headers=self.token).json()), 1)

    def test_registry_extension_and_limit(self):
        self.app.state.agent_tools['intelligence_summary'] = AgentTool('新情报能力', Empty,
            lambda context, args: {'workspace_id': context.workspace, 'summary': '测试情报'})
        self.model(call('intelligence_summary'), {'reply': '完成。'})
        turn = self.send('extension').json()
        self.assertEqual(turn['tool_calls'][0]['result']['workspace_id'], self.workspace)
        self.model(*[call('get_agent') for _ in range(9)])
        self.assertEqual(self.send('limit').json()['error'], 'agent_tool_limit')

    def test_memory_survives_new_app_and_is_scoped_to_agent(self):
        self.model(call('remember', key='sales.market', value='优先寻找美国LED采购商'), {'reply': '已记住。'})
        first = self.send('remember').json()
        self.assertEqual(first['status'], 'succeeded')
        thread_id = f"{self.workspace}:{self.agent}:{first['conversation_id']}"
        saver = SQLAlchemySaver(self.sessions)
        checkpoint = saver.get_tuple({'configurable': {'thread_id': thread_id}})
        self.assertEqual(checkpoint.checkpoint['channel_values']['response'], '已记住。')
        self.assertGreater(len(list(saver.list({'configurable': {'thread_id': thread_id}}))), 2)
        other_app = create_app(settings=self.settings, run_worker=False)
        self.addCleanup(other_app.state.sessions.kw['bind'].dispose)
        from fastapi.testclient import TestClient
        other_client = TestClient(other_app)
        self.addCleanup(other_client.close)
        model = ScriptedModel([{'reply': '您的目标是美国LED采购商。'}])
        other_app.state.chat_provider.close()
        other_app.state.chat_provider = model
        second = other_client.post(self.path + '/messages', headers={**self.token, 'Idempotency-Key': 'new-session'},
            json={'content': '我的目标客户是什么？'}).json()
        self.assertEqual(second['status'], 'succeeded')
        self.assertNotEqual(second['conversation_id'], first['conversation_id'])
        self.assertEqual(model.payloads[0]['memory']['sales.market'], '优先寻找美国LED采购商')
        self.model(call('forget', key='sales.market'), {'reply': '已忘记。'})
        self.assertEqual(self.send('forget').json()['status'], 'succeeded')
        self.model(call('recall'), {'reply': '没有已保存偏好。'})
        self.assertEqual(self.send('recall').json()['tool_calls'][0]['result'], {})
        # Another employee in the same workspace does not inherit the memory.
        self.model(call('remember', key='private', value='业务背景'), {'reply': '已记住。'})
        self.send('remember-again')
        self.agent = self.client.post(self.root + '/agents', headers=self.token,
            json={'name': '其他员工', 'instructions': '查询情报'}).json()['id']
        self.path = self.root + '/agents/' + self.agent
        self.model(call('recall'), {'reply': '没有记忆。'})
        self.assertEqual(self.send('other-agent').json()['tool_calls'][0]['result'], {})

    def test_restart_marks_running_turn_interrupted(self):
        self.model({'reply': '你好。'})
        turn = self.send('restart').json()
        from app.db import write_transaction
        with write_transaction(self.sessions) as session:
            session.get(AgentTurn, turn['id']).status = 'running'
        from fastapi.testclient import TestClient
        restarted = create_app(settings=self.settings, deepseek=self.upstream, run_worker=False)
        with TestClient(restarted):
            replay = self.send('restart').json()
            self.assertEqual(replay['status'], 'failed')
            self.assertEqual(replay['error'], 'agent_chat_interrupted')

    def test_concurrent_messages_are_serialized(self):
        entered, release = Event(), Event()
        class BlockingModel:
            def complete(self, *args):
                entered.set()
                if not release.wait(5):
                    raise RuntimeError('timeout')
                return {'output': {'reply': '完成'}}
        self.app.state.chat_provider = BlockingModel()
        with ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(self.send, 'concurrent-1')
            try:
                self.assertTrue(entered.wait(5))
                self.assertEqual(self.send('concurrent-2').status_code, 409)
                self.assertEqual(self.send('concurrent-1').json()['status'], 'running')
            finally:
                release.set()
            self.assertEqual(future.result(timeout=5).json()['status'], 'succeeded')
