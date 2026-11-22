from dataclasses import replace
import json
from unittest import TestCase
import httpx
from fastapi import HTTPException
from sqlalchemy import select
from app.db import SmsChallenge
from app.sms_verification import AliyunVerificationProvider
import test_service


class SmsVerificationTest(TestCase):
    setUp=test_service.ServiceTest.setUp

    def configured(self):
        return replace(self.settings,sms_access_key_id='private-key-id',sms_access_key_secret='private-key-secret',
            sms_sign_name='测试企业',sms_template_code='SMS_123456',sms_code_secret='server-side-otp-secret-value-32chars')

    def test_signed_request_persistent_code_and_single_use_without_returning_otp(self):
        requests=[];codes=[]
        def respond(request):
            requests.append(request)
            codes.append(json.loads(request.url.params['TemplateParam'])['code'])
            return httpx.Response(200,json={'Code':'OK','BizId':'fixture-provider-reference'})
        settings=self.configured()
        provider=AliyunVerificationProvider(settings,self.sessions,transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        challenge=provider.request('+8613800000000')
        self.assertEqual(requests[0].url.host,'dysmsapi.aliyuncs.com')
        self.assertEqual(requests[0].url.scheme,'https')
        self.assertEqual(requests[0].url.params['PhoneNumbers'],'13800000000')
        self.assertEqual(requests[0].url.params['SignatureMethod'],'HMAC-SHA1')
        self.assertEqual(requests[0].url.params['Version'],'2017-05-25')
        self.assertTrue(requests[0].url.params['Signature'])
        self.assertEqual(challenge.expires_in_seconds,300)
        with self.sessions() as session:
            row=session.get(SmsChallenge,challenge.challenge_id)
            self.assertNotEqual(row.code_hash,codes[0])
            self.assertNotEqual(row.phone_hash,'+8613800000000')
        # A newly constructed adapter can validate the durable challenge after a process restart.
        reloaded=AliyunVerificationProvider(settings,self.sessions);self.addCleanup(reloaded.close)
        self.assertFalse(reloaded.verify('+8613900000000',challenge.challenge_id,codes[0]))
        self.assertTrue(reloaded.verify('+8613800000000',challenge.challenge_id,codes[0]))
        self.assertFalse(reloaded.verify('+8613800000000',challenge.challenge_id,codes[0]))
        self.assertNotIn(settings.sms_access_key_secret,repr(settings))

    def test_attempt_limit_and_provider_errors_are_sanitized(self):
        provider=AliyunVerificationProvider(self.configured(),self.sessions,
            transport=httpx.MockTransport(lambda request:httpx.Response(200,json={'Code':'OK'})))
        self.addCleanup(provider.close)
        challenge=provider.request('+8613800000000')
        for _ in range(5):self.assertFalse(provider.verify('+8613800000000',challenge.challenge_id,'invalid'))
        with self.sessions() as session:self.assertIsNone(session.get(SmsChallenge,challenge.challenge_id))
        failed=AliyunVerificationProvider(self.configured(),self.sessions,
            transport=httpx.MockTransport(lambda request:httpx.Response(403,json={'message':'private-key-secret'})))
        self.addCleanup(failed.close)
        with self.assertRaises(HTTPException) as raised:failed.request('+8613800000000')
        self.assertEqual(raised.exception.status_code,503)
        self.assertEqual(raised.exception.detail,'verification_delivery_unavailable')
