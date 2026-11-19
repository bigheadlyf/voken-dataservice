import os
from unittest import TestCase
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


class CorsTest(TestCase):
    def client(self, **kwargs):
        client = TestClient(create_app(settings=Settings(environment='test', **kwargs)))
        self.addCleanup(client.close)
        self.addCleanup(client.app.state.chat_provider.close)
        return client

    def test_default_allows_cross_origin_requests_and_preflight(self):
        client = self.client()
        origin = 'http://localhost:5173'
        response = client.options('/api/v1/auth/login', headers={
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization,content-type,idempotency-key',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['access-control-allow-origin'], '*')
        self.assertIn('POST', response.headers['access-control-allow-methods'])
        self.assertEqual(response.headers['access-control-allow-headers'],
                         'authorization,content-type,idempotency-key')
        self.assertNotIn('access-control-allow-credentials', response.headers)
        response = client.get('/health', headers={'Origin': origin})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['access-control-allow-origin'], '*')

    def test_allowlist_accepts_only_configured_origins(self):
        client = self.client(cors_allow_origins=('https://app.example.com',))
        response = client.get('/health', headers={'Origin': 'https://app.example.com'})
        self.assertEqual(response.headers['access-control-allow-origin'], 'https://app.example.com')
        self.assertIn('Origin', response.headers['vary'])
        headers = {'Origin': 'https://other.example.com', 'Access-Control-Request-Method': 'POST'}
        self.assertEqual(client.options('/api/v1/auth/login', headers=headers).status_code, 400)
        response = client.get('/health', headers={'Origin': headers['Origin']})
        self.assertNotIn('access-control-allow-origin', response.headers)

    def test_error_responses_have_cors_headers(self):
        response = self.client().post('/api/v1/auth/login', json={},
                                      headers={'Origin': 'http://localhost:5173'})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.headers['access-control-allow-origin'], '*')

    def test_empty_allowlist_disables_cross_origin_access(self):
        response = self.client(cors_allow_origins=()).get(
            '/health', headers={'Origin': 'http://localhost:5173'})
        self.assertNotIn('access-control-allow-origin', response.headers)

    def test_origins_environment_parsing(self):
        with patch.dict(os.environ, {'CORS_ALLOW_ORIGINS': ' https://app.example.com, http://localhost:5173, '}):
            self.assertEqual(Settings.from_env().cors_allow_origins,
                             ('https://app.example.com', 'http://localhost:5173'))
        with patch.dict(os.environ, {'CORS_ALLOW_ORIGINS': ''}):
            self.assertEqual(Settings.from_env().cors_allow_origins, ())
