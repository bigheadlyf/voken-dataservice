"""Check the consumer-facing integration contract, including generated request schemas."""
import asyncio
from unittest import TestCase

import httpx

from app import auth, chat, workspaces
from app.config import Settings
from app.main import create_app
from app.openapi import JOB_EXAMPLE, TURN_EXAMPLE, JobResponse, TurnResponse


class OpenAPIContractTest(TestCase):
    def setUp(self):
        self.app = create_app(settings=Settings(environment='test'), run_worker=False)
        self.addCleanup(self.app.state.chat_provider.close)
        self.schema = self.app.openapi()

    def test_all_operations_have_descriptions_and_typed_success_responses(self):
        for path, methods in self.schema['paths'].items():
            for method, operation in methods.items():
                with self.subTest(path=path, method=method):
                    self.assertTrue(operation['description'])
                    success = next(value for code, value in operation['responses'].items() if code.startswith('2'))
                    if '204' in operation['responses']:
                        self.assertNotIn('content', success)
                    else:
                        media = 'text/csv' if path.endswith('/export.csv') else 'application/json'
                        self.assertTrue(success['content'][media]['schema'])
                    if 'requestBody' in operation:
                        for content in operation['requestBody']['content'].values():
                            self.assertTrue(content['examples'])
        self.assertIs(self.app.openapi(), self.schema)

    def test_all_schema_references_resolve(self):
        def walk(value):
            if isinstance(value, dict):
                if '$ref' in value:
                    reference = value['$ref']
                    self.assertTrue(reference.startswith('#/'))
                    node = self.schema
                    for part in reference[2:].split('/'):
                        node = node[part.replace('~1', '/').replace('~0', '~')]
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)
        walk(self.schema)

    def test_idempotency_and_error_schemas_match_runtime_rules(self):
        root = '/api/v1/workspaces/{workspace_id}'
        for suffix, required in [('/agents/{agent_id}/messages', True),
                                 ('/buyer-enrichments', True), ('/customs-verifications', True),
                                 ('/agents/{agent_id}/runs', False),
                                 ('/public-searches', False), ('/reports', False)]:
            operation = self.schema['paths'][root + suffix]['post']
            header = next(p for p in operation['parameters'] if p['name'] == 'idempotency-key')
            self.assertEqual(header['required'], required)
            self.assertEqual(header['schema']['pattern'], '^[a-z0-9._-]+$')
            self.assertIn('409', operation['responses'])
            self.assertTrue(operation['security'])
            if required:
                error = operation['responses']['422']['content']['application/json']
                self.assertEqual(len(error['schema']['anyOf']), 2)
                self.assertIn('idempotency_key_required', error['examples'])

    def test_examples_validate_with_actual_request_models(self):
        for route in [*auth.router.routes, *workspaces.router.routes, *chat.router.routes]:
            if not getattr(route, 'body_field', None):
                continue
            operation = self.schema['paths'][route.path_format]['post' if 'POST' in route.methods else 'patch']
            for example in operation['requestBody']['content']['application/json']['examples'].values():
                route.body_field.field_info.annotation.model_validate(example['value'])
        JobResponse.model_validate(JOB_EXAMPLE)
        TurnResponse.model_validate(TURN_EXAMPLE)

    def test_documentation_prefix_does_not_change_business_paths(self):
        app = create_app(settings=Settings(environment='test', web_prefix='/api'), run_worker=False)
        self.addCleanup(app.state.chat_provider.close)

        async def fetch():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
                return await client.get('/api/openapi.json')

        response = asyncio.run(fetch())
        self.assertEqual(response.status_code, 200)
        schema = response.json()
        self.assertIn('/api/v1/auth/login', schema['paths'])
        self.assertIn('/api/health', schema['paths'])
        self.assertNotIn('/api/api/v1/auth/login', schema['paths'])
        self.assertIn('幂等', schema['info']['description'])
