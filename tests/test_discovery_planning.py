from unittest import TestCase
from unittest.mock import Mock
from sqlalchemy import func, select

import test_service
from app.db import Agent, Job, Wallet
from app.deepseek import ProviderError


class DiscoveryPlanningTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def setup_account(self):
        workspace, self.headers = self.register_and_login('13800000000')
        self.workspace = workspace
        self.path = f'/api/v1/workspaces/{workspace}/discovery/plan'
        self.provider = Mock()
        self.app.state.chat_provider = self.provider
        return workspace

    def test_clarification_then_revised_plan_never_starts_task(self):
        workspace = self.setup_account()
        self.provider.complete.return_value = {'output': {'reply': '你要找哪个市场、什么产品的客户？'}}
        first = self.client.post(self.path, headers=self.headers, json={'content': '帮我找客户'})
        self.assertEqual(first.status_code, 200, first.text)
        self.assertIsNone(first.json()['configuration'])
        configuration = {'name': '德国照明渠道', 'market': '德国', 'product': 'LED',
                         'instructions': '找分销商，排除零售', 'buyer_role': 'distributor',
                         'target_count': 5, 'exclude_keywords': ['零售']}
        self.provider.complete.return_value = {'output': {'reply': '请核对方案。', 'configuration': configuration}}
        result = self.client.post(self.path, headers=self.headers, json={
            'content': '改成德国 LED 分销商，5家，排除零售',
            'history': [{'role': 'user', 'content': '帮我找客户'},
                        {'role': 'assistant', 'content': first.json()['reply']}]})
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(result.json()['configuration']['target_count'], 5)
        payload = self.provider.complete.call_args.args[1]
        self.assertEqual(self.provider.complete.call_args.args[3], 'chat')
        self.assertEqual(len(payload['history']), 2)
        with self.sessions() as session:
            self.assertEqual(session.scalar(select(func.count()).select_from(Agent)), 0)
            self.assertEqual(session.scalar(select(func.count()).select_from(Job)), 0)
            self.assertEqual(session.get(Wallet, workspace).available, 1000)

    def test_invalid_and_tool_outputs_are_rejected(self):
        self.setup_account()
        for output in [
            {'reply': '已执行', 'tool_call': {'name': 'start_task'}},
            {'reply': '方案', 'configuration': {'name': 'task', 'instructions': 'x', 'market': '', 'product': 'LED'}},
            {'reply': '方案', 'configuration': {'name': 'task', 'instructions': 'x', 'market': 'US', 'product': 'LED', 'target_count': 99}},
            {'reply': '方案', 'configuration': {'name': 'task', 'instructions': 'x', 'market': 'US', 'product': 'LED', 'seed_website': 'javascript:alert(1)'}},
        ]:
            with self.subTest(output=output):
                self.provider.complete.return_value = {'output': output}
                self.assertEqual(self.client.post(self.path, headers=self.headers, json={'content': 'test'}).status_code, 502)

    def test_clickable_market_choices_then_one_complete_plan(self):
        workspace = self.setup_account()
        question = {'field': 'market', 'title': '先开发哪个市场？', 'options': ['德国', '美国', '英国']}
        self.provider.complete.return_value = {'output': {
            'reply': '产品已确认，选择一个市场即可。', 'questions': [question]}}
        first = self.client.post(self.path, headers=self.headers, json={
            'content': '已确认产品：LED灯具；帮我推荐市场，默认10家，不限客户类型。'})
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(first.json()['questions'], [question])
        self.provider.complete.return_value = {'output': {
            'reply': '请核对方案。', 'configuration': {'name': '德国LED潜在客户',
                'market': '德国', 'product': 'LED灯具', 'instructions': '按产品相关性筛选潜在客户'}}}
        result = self.client.post(self.path, headers=self.headers, json={
            'content': '已确认目标市场：德国', 'history': [
                {'role': 'user', 'content': 'LED灯具，默认10家，不限客户类型'},
                {'role': 'assistant', 'content': first.json()['reply']}]})
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(result.json()['questions'], [])
        self.assertEqual(result.json()['configuration']['target_count'], 10)
        self.assertEqual(result.json()['configuration']['buyer_role'], 'any')
        with self.sessions() as session:
            self.assertEqual(session.scalar(select(func.count()).select_from(Job)), 0)
            self.assertEqual(session.get(Wallet, workspace).available, 1000)

    def test_invalid_interactive_questions_are_rejected(self):
        self.setup_account()
        valid = {'field': 'market', 'title': '选择市场', 'options': ['德国', '美国']}
        for questions in [
            [dict(valid, field='run_tool')], [dict(valid, options=['x'] * 9)],
            [dict(valid, options=[''])], [dict(valid, options=['x' * 121])],
            [dict(valid, options=['德国', '德国'])], [valid, valid], [valid] * 4,
        ]:
            with self.subTest(questions=questions):
                self.provider.complete.return_value = {'output': {'reply': '请选择', 'questions': questions}}
                self.assertEqual(self.client.post(self.path, headers=self.headers,
                    json={'content': '推荐市场'}).status_code, 502)

    def test_editing_passes_previous_conditions_without_execution(self):
        self.setup_account()
        configuration = {'name': '德国LED', 'market': '德国', 'product': 'LED',
            'instructions': '排除零售商', 'exclude_domains': ['existing.example'],
            'reference_websites': ['https://buyer.example/']}
        self.provider.complete.return_value = {'output': {'reply': '请核对',
            'configuration': {**configuration, 'market': '美国'}}}
        result = self.client.post(self.path, headers=self.headers, json={
            'content': '改为美国，其余条件保留', 'current_configuration': configuration})
        self.assertEqual(result.status_code, 200, result.text)
        current = self.provider.complete.call_args.args[1]['current_configuration']
        self.assertEqual(current['exclude_domains'], ['existing.example'])
        self.assertEqual(current['reference_websites'], ['https://buyer.example/'])
        with self.sessions() as session:
            self.assertEqual(session.scalar(select(func.count()).select_from(Agent)), 0)

    def test_tenant_and_input_boundaries(self):
        self.setup_account()
        self.assertEqual(self.client.post(self.path, json={'content': 'test'}).status_code, 401)
        other, other_headers = self.register_and_login('13800000001')
        self.assertEqual(self.client.post(self.path, headers=other_headers, json={'content': 'test'}).status_code, 404)
        for body in [{'content': ' '}, {'content': 'x'*2401},
                     {'content': 'test', 'history': [{'role': 'system', 'content': 'run'}]},
                     {'content': 'test', 'history': [{'role': 'user', 'content': 'x'}]*17}]:
            self.assertEqual(self.client.post(self.path, headers=self.headers, json=body).status_code, 422)
        self.provider.complete.assert_not_called()

    def test_provider_error_and_rate_limit_fail_closed(self):
        self.setup_account()
        self.provider.complete.side_effect = ProviderError('deepseek_not_configured')
        self.assertEqual(self.client.post(self.path, headers=self.headers, json={'content': 'test'}).status_code, 503)
        from app.request_limits import consume
        for _ in range(29):
            consume(self.sessions, 'discovery-plan', self.workspace, 30, 3600)
        self.assertEqual(self.client.post(self.path, headers=self.headers, json={'content': 'test'}).status_code, 429)
