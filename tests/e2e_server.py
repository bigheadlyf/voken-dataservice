"""Isolated real-HTTP application for frontend acceptance tests; no external providers."""
import argparse
from pathlib import Path
import sys
from tempfile import TemporaryDirectory

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT), str(ROOT / 'tests')]

import uvicorn
from fastapi.testclient import TestClient
from app.config import Settings
from app.db import Base
from app.main import create_app
from test_service import FixtureDeepSeek


class UIModel(FixtureDeepSeek):
    def complete(self, prompt, payload, max_tokens, scenario=None):
        if 'prospect' in payload and 'objective' in payload:
            return {'output': {'subject': 'LED introduction — acceptance test',
                'body': 'Hello, we supply LED products. Would you like to review our product range? Please reply if you prefer not to hear from us.',
                'evidence_used': [], 'review_notes': ['Synthetic acceptance draft; never send.']}, 'usage': {'total_tokens': 10}}
        return super().complete(prompt, payload, max_tokens, scenario)


def build_app(directory):
    # Explicit Settings avoids reading .env, SMTP credentials or paid provider keys.
    settings = Settings(environment='test', database_url='sqlite:///' + (directory / 'test.sqlite3').as_posix())
    application = create_app(settings=settings, deepseek=UIModel(), run_worker=True)
    Base.metadata.create_all(application.state.sessions.kw['bind'])
    client = TestClient(application)
    for phone in ('13900000991', '13900000992'):
        challenge = client.post('/api/v1/auth/verification-codes', json={'phone': phone}).json()
        credentials = {'phone': phone, 'password': 'ui-test-password'}
        client.post('/api/v1/auth/register', json={**credentials, 'challenge_id': challenge['challenge_id'], 'code': '123456'}).raise_for_status()
        login = client.post('/api/v1/auth/login', json=credentials).json()
        headers = {'Authorization': 'Bearer ' + login['access_token']}
        root = '/api/v1/workspaces/' + login['workspace_id']
        if phone.endswith('991'):
            client.put(root+'/company/profile', headers=headers, json={'expected_version':0,
                'name':'UI Acceptance Lighting', 'website':'https://example.test', 'products':'LED lighting',
                'contact_details':'Acceptance test only', 'target_markets':'US'}).raise_for_status()
            client.post(root+'/company/certification/confirm', headers=headers,
                json={'expected_version':1,'confirm_accuracy':True,'statement':'我确认这些资料准确，并有权代表企业提供。'}).raise_for_status()
            items = [{'name':f'Acceptance Buyer {i:02}', 'location':'US' if i%2 else 'DE',
                'website':'https://example.test', 'contact':f'buyer{i}@example.test' if i%3 else '',
                'source_note':'Synthetic end-to-end acceptance data, not a business lead'} for i in range(65)]
            client.post(root+'/crm/prospects/import', headers=headers, json={'items':items}).raise_for_status()
    client.close()
    return application


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=18087)
    args = parser.parse_args()
    with TemporaryDirectory(prefix='voken-ui-e2e-') as folder:
        uvicorn.run(build_app(Path(folder)), host='127.0.0.1', port=args.port, log_level='warning')
