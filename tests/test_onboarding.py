from datetime import timedelta
from unittest import TestCase
from unittest.mock import Mock, patch
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from sqlalchemy import select
from app.db import RequestAttempt, utcnow, write_transaction
from app.request_limits import consume
from app.config import Settings
from app.deepseek import ProviderError
from fastapi import HTTPException
import test_service


class OnboardingTest(TestCase):
    setUp=test_service.ServiceTest.setUp
    register_and_login=test_service.ServiceTest.register_and_login

    def test_company_intake_test_allowance_and_production_limit(self):
        self.assertEqual(Settings(environment='test').company_intake_daily_limit,2_147_483_647)
        self.assertEqual(Settings(environment='production').company_intake_daily_limit,20)
        workspace,token=self.register_and_login('13800000000')
        with patch('app.company_intake.consume') as gate, patch.object(self.app.state.chat_provider,'search',return_value={'hits':[]}):
            response=self.client.post(f'/api/v1/workspaces/{workspace}/company/website-candidates',
                headers=token,json={'name':'Fixture Lighting'})
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(gate.call_args.args[3],2_147_483_647)

    def test_rate_limit_reports_remaining_window_without_extending_it(self):
        now=utcnow()
        consume(self.sessions,'company-intake','workspace',1,86400)
        with write_transaction(self.sessions) as session:
            for row in session.scalars(select(RequestAttempt)):
                row.created_at=now-timedelta(hours=23)
        with patch('app.request_limits.utcnow', return_value=now):
            for _ in range(2):
                with self.assertRaises(HTTPException) as caught:
                    consume(self.sessions,'company-intake','workspace',1,86400)
                self.assertEqual(caught.exception.status_code,429)
                self.assertEqual(caught.exception.headers['Retry-After'],'3600')
        with patch('app.request_limits.utcnow', return_value=now+timedelta(hours=1,seconds=1)):
            consume(self.sessions,'company-intake','workspace',1,86400)

    def test_password_change_revokes_concurrent_old_password_login(self):
        import app.auth as auth
        workspace,token=self.register_and_login('13800000000')
        entered,release,changed=Event(),Event(),Event()
        original=auth.verify_password
        # FastAPI executes sync handlers on its own worker threads, so identify the call by password.
        first=True
        def controlled(password,stored):
            nonlocal first
            if first:
                first=False;entered.set()
                if not release.wait(5):raise RuntimeError('Timed out releasing verifier')
            return original(password,stored)
        def change():
            result=self.client.post('/api/v1/auth/password-change',headers=token,json={
                'current_password':'valid-password','new_password':'race-safe-password'})
            changed.set();return result
        with patch('app.auth.verify_password',controlled),ThreadPoolExecutor(max_workers=2) as pool:
            login=pool.submit(self.client.post,'/api/v1/auth/login',json={
                'phone':'13800000000','password':'valid-password'})
            self.assertTrue(entered.wait(5))
            update=pool.submit(change)
            # Before the fix the change could finish while old credentials were still being verified.
            changed.wait(.2)
            release.set()
            logged_in=login.result(timeout=8);updated=update.result(timeout=8)
        self.assertEqual(logged_in.status_code,200,logged_in.text)
        self.assertEqual(updated.status_code,200,updated.text)
        stale={'Authorization':'Bearer '+logged_in.json()['access_token']}
        self.assertEqual(self.client.get('/api/v1/workspaces/'+workspace+'/points',headers=stale).status_code,401)

    def test_reset_change_password_revoke_sessions_and_code_replay(self):
        workspace,token=self.register_and_login('13800000000')
        # Advance only rate-limit history rather than sleeping for the request cooldown.
        with write_transaction(self.sessions) as session:
            for row in session.scalars(select(RequestAttempt)):row.created_at-=timedelta(seconds=61)
        issued=self.client.post('/api/v1/auth/verification-codes',json={'phone':'13800000000'})
        self.assertEqual(issued.status_code,201,issued.text)
        payload={'phone':'13800000000','challenge_id':issued.json()['challenge_id'],
            'code':'123456','new_password':'reset-password-2026'}
        reset=self.client.post('/api/v1/auth/password-reset',json=payload)
        self.assertEqual(reset.status_code,200,reset.text)
        root='/api/v1/workspaces/'+workspace
        self.assertEqual(self.client.get(root+'/points',headers=token).status_code,401)
        self.assertEqual(self.client.post('/api/v1/auth/password-reset',json=payload).status_code,400)
        self.assertEqual(self.client.post('/api/v1/auth/login',json={
            'phone':'13800000000','password':'valid-password'}).status_code,401)
        login=self.client.post('/api/v1/auth/login',json={
            'phone':'13800000000','password':'reset-password-2026'})
        self.assertEqual(login.status_code,200,login.text)
        token={'Authorization':'Bearer '+login.json()['access_token']}
        wrong=self.client.post('/api/v1/auth/password-change',headers=token,json={
            'current_password':'incorrect-password','new_password':'new-password-not-applied'})
        self.assertEqual(wrong.status_code,400,wrong.text)
        self.assertEqual(self.client.get(root+'/points',headers=token).status_code,200)
        changed=self.client.post('/api/v1/auth/password-change',headers=token,json={
            'current_password':'reset-password-2026','new_password':'final-password-2026'})
        self.assertEqual(changed.status_code,200,changed.text)
        self.assertEqual(self.client.get(root+'/points',headers=token).status_code,401)
        self.assertEqual(self.client.post('/api/v1/auth/login',json={
            'phone':'13800000000','password':'final-password-2026'}).status_code,200)

    def test_sms_and_login_limits_are_persisted(self):
        self.assertEqual(self.client.get('/health').json()['verification_mode'],'test_fixed')
        _,token=self.register_and_login('13800000000')
        self.assertEqual(self.client.post('/api/v1/auth/verification-codes',json={'phone':'13800000000'}).status_code,429)
        for _ in range(19):
            self.assertEqual(self.client.post('/api/v1/auth/login',json={
                'phone':'13800000000','password':'wrong-password'}).status_code,401)
        self.assertEqual(self.client.post('/api/v1/auth/login',json={
            'phone':'13800000000','password':'valid-password'}).status_code,429)

    def test_name_website_analysis_confirmation_and_invalidation(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace+'/company'
        class IntakeProvider:
            def search(self,query):
                return {'hits':[{'url':'http://127.0.0.1/private','title':'unsafe'},
                    {'url':'https://fixture.example.org','title':'Fixture Lighting official website'}]}
            def fetch(self,url):return {'content':'Fixture Lighting manufactures LED fixtures.'}
            def complete(self,prompt,payload,max_tokens,scenario=None):
                return {'output':{'profile':{'name':'Fixture Lighting','products':'LED fixtures'},
                    'profile_evidence':{'name':'Fixture Lighting','products':'LED fixtures'},'memories':[]}}
        self.app.state.chat_provider=IntakeProvider()
        candidates=self.client.post(root+'/website-candidates',headers=token,json={'name':'Fixture Lighting'})
        self.assertEqual(candidates.status_code,200,candidates.text)
        self.assertEqual(len(candidates.json()),1)
        self.assertEqual(candidates.json()[0]['verification_status'],'unverified')
        invalid=self.client.post(root+'/web-analyses',headers=token,json={'website':'http://127.0.0.1/private'})
        self.assertEqual(invalid.status_code,422)
        result=self.client.post(root+'/web-analyses',headers=token,json={'website':'https://fixture.example.org'})
        self.assertEqual(result.status_code,201,result.text)
        self.assertEqual(self.client.get(root+'/profile',headers=token).json()['version'],0)
        applied=self.client.post(root+'/document-analyses/'+result.json()['id']+'/apply',headers=token)
        self.assertEqual(applied.status_code,200,applied.text)
        self.assertEqual(self.client.get(root+'/certification',headers=token).json()['status'],'needs_confirmation')
        confirmed=self.client.post(root+'/certification/confirm',headers=token,json={
            'expected_version':1,'confirm_accuracy':True,'statement':'我确认这些资料准确，并有权代表企业提供。'})
        self.assertEqual(confirmed.status_code,200,confirmed.text)
        self.assertEqual(confirmed.json()['status'],'confirmed')
        self.assertFalse(confirmed.json()['domain_ownership_verified'])
        self.assertEqual(confirmed.json()['legal_verification'],'not_performed')
        self.client.patch(root+'/profile',headers=token,json={'expected_version':1,'products':'Updated LED products'})
        self.assertEqual(self.client.get(root+'/certification',headers=token).json()['status'],'needs_confirmation')
        _,other=self.register_and_login('13800000001')
        self.assertEqual(self.client.get(root+'/certification',headers=other).status_code,404)

    def test_website_analysis_keeps_only_entries_with_exact_quotes(self):
        workspace, token = self.register_and_login('13800000000')
        website = 'http://fixture.example.org/'
        output = {
            'profile': {'name': 'Fixture Lighting', 'products': 'LED fixtures', 'advantages': ['Too bright'],
                        'website': 'https://another.example.org/'},
            'profile_evidence': {'name': 'User supplied name', 'products': 'LED fixtures',
                                 'advantages': 'Fixture Lighting'},
            'memories': [
                {'key': 'products', 'title': 'Products', 'content': 'LED fixtures', 'evidence': 'LED fixtures'},
                {'key': 'products', 'title': 'Duplicate', 'content': 'LED fixtures', 'evidence': 'LED fixtures'},
                {'key': 'certified', 'title': 'Certification', 'content': 'Certified', 'evidence': 'certified'},
                {'key': 'verified', 'title': 'Verified', 'content': 'LED fixtures', 'evidence': 'LED fixtures',
                 'verification_status': 'confirmed'},
            ],
        }
        provider = Mock()
        provider.fetch.return_value = {'content': 'Fixture Lighting manufactures LED fixtures.'}
        provider.complete.return_value = {'output': output}
        self.app.state.chat_provider = provider

        result = self.client.post(f'/api/v1/workspaces/{workspace}/company/web-analyses',
                                  headers=token, json={'website': website, 'name': 'User supplied name'})
        self.assertEqual(result.status_code, 201, result.text)
        proposal = result.json()['proposal']
        self.assertEqual(proposal['profile']['products'], 'LED fixtures')
        self.assertIsNone(proposal['profile']['name'])
        self.assertIsNone(proposal['profile']['advantages'])
        self.assertEqual(proposal['profile']['website'], website)
        self.assertEqual(proposal['profile_evidence'], {'products': 'LED fixtures', 'website': website})
        self.assertEqual([memory['title'] for memory in proposal['memories']], ['Products'])
        provider.complete.assert_called_once()

    def test_website_analysis_retries_once_with_the_same_page_text(self):
        workspace, token = self.register_and_login('13800000000')
        endpoint = f'/api/v1/workspaces/{workspace}/company/web-analyses'
        website = 'http://fixture.example.org/'
        provider = Mock()
        provider.fetch.return_value = {'content': 'Fixture Lighting manufactures LED fixtures.'}
        provider.complete.side_effect = [
            ProviderError('deepseek_invalid_model_output'),
            {'output': [
                {'field': 'name', 'value': 'Fixture Lighting', 'evidence': 'Fixture Lighting'},
                {'text': '{"products":"LED fixtures","products_evidence":"LED fixtures"}'},
                {'text': 'not JSON'},
            ]},
        ]
        self.app.state.chat_provider = provider

        result = self.client.post(endpoint, headers=token, json={'website': website})
        self.assertEqual(result.status_code, 201, result.text)
        self.assertEqual(result.json()['proposal']['profile']['name'], 'Fixture Lighting')
        self.assertEqual(result.json()['proposal']['profile']['products'], 'LED fixtures')
        provider.fetch.assert_called_once_with(website)
        self.assertEqual([call.args[3] for call in provider.complete.call_args_list], ['analysis', 'judgment'])
        self.assertEqual(provider.complete.call_args_list[0].args[1], provider.complete.call_args_list[1].args[1])
        self.assertTrue(provider.complete.call_args_list[1].kwargs['allow_object_list'])

        provider.reset_mock()
        provider.complete.side_effect = [
            {'output': {'profile': {'name': 'Other Company'},
                        'profile_evidence': {'name': 'Other Company'}, 'memories': []}},
            ProviderError('deepseek_invalid_model_output'),
        ]
        failed = self.client.post(endpoint, headers=token, json={'website': website})
        self.assertEqual(failed.status_code, 502, failed.text)
        self.assertEqual(failed.json()['detail'], 'invalid_company_website_analysis')
        self.assertEqual(provider.complete.call_count, 2)

    def test_website_analysis_fills_missing_products_without_losing_evidenced_entries(self):
        workspace, token = self.register_and_login('13800000000')
        endpoint = f'/api/v1/workspaces/{workspace}/company/web-analyses'
        provider = Mock()
        provider.fetch.return_value = {'content': 'Fixture Lighting manufactures LED fixtures.'}
        provider.complete.side_effect = [
            {'output': {'profile': {'name': 'Fixture Lighting'},
                        'profile_evidence': {'name': 'Fixture Lighting'},
                        'memories': [{'key': 'manufacturing', 'title': 'Manufacturing',
                                      'content': 'Manufactures LED fixtures', 'evidence': 'manufactures LED fixtures'}]}},
            {'output': {'products': 'LED fixtures', 'products_evidence': 'LED fixtures'}},
        ]
        self.app.state.chat_provider = provider

        result = self.client.post(endpoint, headers=token, json={'website': 'https://fixture.example.org/'})
        self.assertEqual(result.status_code, 201, result.text)
        proposal = result.json()['proposal']
        self.assertEqual(proposal['profile']['name'], 'Fixture Lighting')
        self.assertEqual(proposal['profile']['products'], 'LED fixtures')
        self.assertEqual(proposal['memories'][0]['key'], 'manufacturing')
        provider.fetch.assert_called_once()
