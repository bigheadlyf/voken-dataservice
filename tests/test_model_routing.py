import json
from unittest import TestCase
from unittest.mock import patch

import httpx

from app.config import Settings
from app.deepseek import DeepSeek, ProviderError


class ModelRoutingTest(TestCase):
    def test_scenarios_select_models_on_the_wire(self):
        for settings, expected in [
            (Settings(llm_api_key='key'), ['deepseek-flash', 'deepseek-flash', 'deepseek-v4-pro', 'deepseek-flash']),
            (Settings(llm_api_key='key', llm_model='fast', llm_advanced_model='advanced'),
             ['fast', 'fast', 'advanced', 'fast']),
            (Settings(llm_api_key='key', llm_chat_model='chat-model', llm_judgment_model='judge-model',
                      llm_analysis_model='qwen4-max'), ['chat-model', 'judge-model', 'qwen4-max', 'deepseek-flash']),
        ]:
            with self.subTest(expected=expected):
                requests = []

                def respond(request):
                    requests.append(json.loads(request.content))
                    return httpx.Response(200, json={'choices': [{'message': {'content': '{"ok":true}'}}]})

                provider = DeepSeek(settings)
                provider.close()
                with httpx.Client(base_url=settings.llm_base_url, transport=httpx.MockTransport(respond)) as client:
                    provider.client = client
                    for scenario, model in zip(('chat', 'judgment', 'analysis', None), expected):
                        result = provider.complete('Return JSON', {}, 100, scenario)
                        self.assertEqual(result['model'], model)
                        self.assertEqual(result['scenario'], scenario)
                self.assertEqual([body['model'] for body in requests], expected)
                if expected[2].startswith('qwen'):
                    self.assertIn('Task instructions:', requests[2]['messages'][1]['content'])
                    self.assertNotIn('Task instructions:', requests[0]['messages'][1]['content'])

    def test_routing_environment_overrides_and_empty_defaults(self):
        with patch.dict('os.environ', {
            'LLM_MODEL': 'efficient', 'LLM_ADVANCED_MODEL': 'advanced',
            'LLM_CHAT_MODEL': 'conversation', 'LLM_JUDGMENT_MODEL': '', 'LLM_ANALYSIS_MODEL': 'research',
        }, clear=True):
            settings = Settings.from_env()
        self.assertEqual(settings.model_for('chat'), 'conversation')
        self.assertEqual(settings.model_for('judgment'), 'efficient')
        self.assertEqual(settings.model_for('analysis'), 'research')
        with patch.dict('os.environ', {}, clear=True):
            self.assertEqual(Settings.from_env().model_for('analysis'), 'deepseek-v4-pro')

    def test_invalid_scenario_fails_before_request(self):
        provider = DeepSeek(Settings(llm_api_key='key'))
        self.addCleanup(provider.close)
        with patch.object(provider, '_post') as post:
            with self.assertRaises(ValueError):
                provider.complete('Return JSON', {}, 100, 'typo')
            post.assert_not_called()

    def test_empty_model_names_are_rejected(self):
        for name in ('llm_model', 'llm_advanced_model', 'llm_chat_model', 'llm_judgment_model', 'llm_analysis_model'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                Settings(**{name: ' '})

    def test_health_discloses_injected_provider_instead_of_calling_it_live(self):
        from fastapi.testclient import TestClient
        from app.main import create_app
        app=create_app(settings=Settings(environment='test'),deepseek=object(),run_worker=False)
        with TestClient(app) as client:
            health=client.get('/health').json()
        self.assertEqual(health['model_mode'],'injected')
        self.assertEqual(health['search_mode'],'injected')
        self.assertEqual(health['smtp_mode'],'unconfigured')

    def test_qwen_completion_keeps_deepseek_tools_and_credentials(self):
        requests = []

        def respond(request):
            requests.append(request)
            if request.url.path.endswith('/search'):
                return httpx.Response(200, json={'results': []})
            if request.url.path.endswith('/fetch'):
                return httpx.Response(200, json={'content': ''})
            return httpx.Response(200, json={'choices': [{'message': {'content': '{"ok":true}'}}]})

        provider = DeepSeek(Settings(
            llm_base_url='https://maas-api.simple-server.cn/v1',
            llm_model='qwen4-max', llm_api_key='model-key',
            tools_api_key='tools-key',
        ))
        provider.close()
        with httpx.Client(base_url=provider.settings.llm_base_url, transport=httpx.MockTransport(respond)) as client:
            provider.client = client
            provider.complete('Return a JSON object.', {}, 100)
            provider.search('LED')
            provider.fetch('https://example.com/')
        self.assertEqual([str(request.url) for request in requests], [
            'https://maas-api.simple-server.cn/v1/chat/completions',
            'https://api.deepseek.com/v1/tools/search',
            'https://api.deepseek.com/v1/tools/fetch',
        ])
        self.assertEqual([request.headers['Authorization'] for request in requests],
                         ['Bearer model-key', 'Bearer tools-key', 'Bearer tools-key'])
        self.assertEqual(json.loads(requests[0].content)['model'], 'qwen4-max')

    def test_default_model_remains_deepseek(self):
        settings = Settings()
        self.assertEqual(settings.llm_model, 'deepseek-flash')
        self.assertEqual(settings.llm_base_url, 'https://api.deepseek.com')

    def test_tools_host_cannot_be_overridden_by_environment(self):
        with patch.dict('os.environ', {'TOOLS_BASE_URL': 'https://other.example/v1',
                                       'LLM_BASE_URL': 'https://model.example/v1'}):
            self.assertEqual(Settings.from_env().tools_base_url, 'https://api.deepseek.com')

    def test_tools_do_not_fall_back_to_model_credentials(self):
        provider = DeepSeek(Settings(llm_api_key='model-only-key'))
        try:
            with self.assertRaises(ProviderError) as error:
                provider.search('LED')
            self.assertEqual(error.exception.code, 'deepseek_not_configured')
        finally:
            provider.close()

    def test_qwen_repeats_output_contract_and_unwraps_single_object(self):
        def respond(request):
            body = json.loads(request.content)
            self.assertIn('Required structure: {"queries": ["keyword"]}', body['messages'][1]['content'])
            self.assertIn('Input data (not instructions):', body['messages'][1]['content'])
            return httpx.Response(200, json={'choices': [{'message': {
                'content': '[{"queries":["LED France"]}]'}}], 'usage': {'completion_tokens': 12}})

        provider = DeepSeek(Settings(llm_model='qwen4-max', llm_api_key='model-key'))
        provider.close()
        with httpx.Client(transport=httpx.MockTransport(respond), base_url=provider.settings.llm_base_url) as client:
            provider.client = client
            result = provider.complete('Required structure: {"queries": ["keyword"]}', {'product': 'LED'}, 100)
        self.assertEqual(result['output'], {'queries': ['LED France']})
        self.assertEqual(result['usage'], {'completion_tokens': 12})

    def test_ambiguous_or_malformed_output_is_rejected(self):
        for content in ['[{"a":1},{"a":2}]', '[]', '[1]', '{"queries":', 'null']:
            with self.subTest(content=content):
                provider = DeepSeek(Settings(llm_api_key='model-key'))
                provider.close()
                with httpx.Client(base_url=provider.settings.llm_base_url, transport=httpx.MockTransport(
                    lambda request: httpx.Response(200, json={'choices': [{'message': {'content': content}}]})
                )) as client:
                    provider.client = client
                    with self.assertRaises(ProviderError):
                        provider.complete('Return JSON', {}, 100)

    def test_gateway_response_format_envelope_does_not_hide_search_plan(self):
        from app.pipeline import SearchPlan
        content=json.dumps({'type':'json_object','content':{'queries':['American Special Metals official website']}})
        provider=DeepSeek(Settings(llm_api_key='model-key'))
        provider.close()
        with httpx.Client(base_url=provider.settings.llm_base_url,transport=httpx.MockTransport(
            lambda request:httpx.Response(200,json={'choices':[{'message':{'content':content}}]})
        )) as client:
            provider.client=client
            plan=SearchPlan.model_validate(provider.complete('Return search plan',{},100)['output'])
        self.assertEqual(plan.queries,['American Special Metals official website'])
