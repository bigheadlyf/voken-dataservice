from datetime import timedelta
from unittest import TestCase
from unittest.mock import patch
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from sqlalchemy import select
from app.db import RequestAttempt, utcnow, write_transaction
from app.request_limits import consume
from app.config import Settings
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
