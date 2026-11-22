import base64
from dataclasses import replace
from datetime import timedelta,timezone
import json
from pathlib import Path
import re
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch
import time
import httpx
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import padding,rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.db import BillingOrder,utcnow,write_transaction
from app.wechat_pay import NativePay,PaymentError
from app.payments import recover_checkouts
import test_service


class WeChatPayTest(TestCase):
    register_and_login=test_service.ServiceTest.register_and_login

    def setUp(self):
        test_service.ServiceTest.setUp(self)
        temporary=TemporaryDirectory();self.addCleanup(temporary.cleanup)
        self.merchant=rsa.generate_private_key(public_exponent=65537,key_size=2048)
        self.platform=rsa.generate_private_key(public_exponent=65537,key_size=2048)
        private=Path(temporary.name,'merchant.pem');public=Path(temporary.name,'platform.pem')
        private.write_bytes(self.merchant.private_bytes(serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
        public.write_bytes(self.platform.public_key().public_bytes(serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo))
        self.settings=replace(self.settings,wechat_enabled=True,wechat_mch_id='1234567890',
            wechat_app_id='wx1234567890abcdef',wechat_merchant_serial='MERCHANTSERIAL',
            wechat_private_key_path=str(private),wechat_platform_key_id='PUB_KEY_ID_TEST',
            wechat_platform_public_key_path=str(public),wechat_api_v3_key='a'*32,
            wechat_notify_url='https://billing.example.org/api/v1/payments/wechat/notify')
        self.app.state.settings=self.settings

    def headers(self,raw):
        timestamp=str(int(time.time()));nonce='test-platform-nonce'
        signed=timestamp.encode()+b'\n'+nonce.encode()+b'\n'+raw+b'\n'
        return {'Wechatpay-Timestamp':timestamp,'Wechatpay-Nonce':nonce,'Wechatpay-Serial':'PUB_KEY_ID_TEST',
            'Wechatpay-Signature':base64.b64encode(self.platform.sign(signed,padding.PKCS1v15(),hashes.SHA256())).decode()}

    def response(self,request):
        authorization=request.headers['Authorization']
        fields=dict(re.findall(r'(\w+)="([^"]+)"',authorization))
        canonical=(request.method+'\n'+request.url.raw_path.decode()+'\n'+fields['timestamp']+'\n'+fields['nonce_str']+'\n').encode()+request.content+b'\n'
        self.merchant.public_key().verify(base64.b64decode(fields['signature']),canonical,padding.PKCS1v15(),hashes.SHA256())
        self.assertEqual(request.url.host,'api.mch.weixin.qq.com')
        payload=json.loads(request.content)
        self.assertEqual(payload['amount'],{'total':1000,'currency':'CNY'})
        raw=b'{"code_url":"weixin://wxpay/bizpayurl?pr=isolated-test-only"}'
        return httpx.Response(200,content=raw,headers=self.headers(raw))

    def payment(self,order_id,**overrides):
        return {'mchid':self.settings.wechat_mch_id,'appid':self.settings.wechat_app_id,
            'out_trade_no':order_id,'transaction_id':'12345678901234567890','trade_state':'SUCCESS',
            'amount':{'total':1000,'currency':'CNY'},
            'success_time':(utcnow()-timedelta(seconds=1)).replace(tzinfo=timezone.utc).isoformat(),**overrides}

    def notification(self,payment):
        nonce='nonce-12byte';aad='transaction'
        encrypted=AESGCM(b'a'*32).encrypt(nonce.encode(),json.dumps(payment).encode(),aad.encode())
        raw=json.dumps({'event_type':'TRANSACTION.SUCCESS','resource':{
            'algorithm':'AEAD_AES_256_GCM','original_type':'transaction','nonce':nonce,
            'associated_data':aad,'ciphertext':base64.b64encode(encrypted).decode()}}).encode()
        return raw,self.headers(raw)

    def test_local_crypto_checkout_and_notification_credit_exactly_once(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        order=self.client.post(root+'/billing/orders',headers={**token,'Idempotency-Key':'native-order'},
            json={'plan_id':'points_1000','expected_total_fen':1000,'accept_terms':True}).json()
        factory=lambda settings:NativePay(settings,transport=httpx.MockTransport(self.response))
        with patch('app.payments.NativePay',factory):
            checkout=self.client.post(root+'/billing/orders/'+order['id']+'/checkout',headers=token)
            self.assertEqual(checkout.status_code,200,checkout.text)
            self.assertTrue(checkout.json()['qr_data_url'].startswith('data:image/svg+xml;base64,'))
            self.assertEqual(self.client.post(root+'/billing/orders/'+order['id']+'/cancel',headers=token).status_code,409)
            # Invalid amounts are rejected even with a correctly signed and encrypted provider envelope.
            raw,headers=self.notification(self.payment(order['id'],amount={'total':1,'currency':'CNY'}))
            self.assertEqual(self.client.post('/api/v1/payments/wechat/notify',headers=headers,content=raw).status_code,400)
            self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],1000)
            raw,headers=self.notification(self.payment(order['id']))
            for _ in range(2):
                accepted=self.client.post('/api/v1/payments/wechat/notify',headers=headers,content=raw)
                self.assertEqual(accepted.status_code,200,accepted.text)
            self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],2000)

    def test_tampered_signatures_and_wrong_merchant_currency_never_validate(self):
        provider=NativePay(self.settings);self.addCleanup(provider.close)
        raw,headers=self.notification(self.payment('a'*32))
        with self.assertRaises(PaymentError):provider.notification(headers,raw+b' ')
        wrong=dict(headers);wrong['Wechatpay-Serial']='UNTRUSTED_KEY'
        with self.assertRaises(PaymentError):provider.notification(wrong,raw)
        order=type('Order',(),{'id':'a'*32,'total_fen':1000})()
        for change in ({'mchid':'other'},{'appid':'other'},{'amount':{'total':1000,'currency':'USD'}},
                       {'amount':{'total':True,'currency':'CNY'}}):
            with self.assertRaises(PaymentError):provider.validate_payment(self.payment(order.id,**change),order)

    def test_delayed_signed_notification_uses_payment_time_not_callback_time(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        order=self.client.post(root+'/billing/orders',headers={**token,'Idempotency-Key':'delayed'},
            json={'plan_id':'points_1000','expected_total_fen':1000,'accept_terms':True}).json()
        with write_transaction(self.sessions) as session:
            row=session.get(BillingOrder,order['id']);row.created_at=utcnow()-timedelta(hours=1)
            row.expires_at=utcnow()-timedelta(minutes=30);row.payment={'provider':'wechat','state':'ready'}
        payment=self.payment(order['id'],success_time=(utcnow()-timedelta(minutes=40)).replace(tzinfo=timezone.utc).isoformat())
        raw,headers=self.notification(payment)
        with patch('app.payments.NativePay',lambda settings:NativePay(settings)):
            response=self.client.post('/api/v1/payments/wechat/notify',headers=headers,content=raw)
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],2000)

    def test_refresh_binds_provider_result_to_requested_order(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        other_workspace,other_token=self.register_and_login('13800000001');other_root='/api/v1/workspaces/'+other_workspace
        def order(path,headers,key):
            return self.client.post(path+'/billing/orders',headers={**headers,'Idempotency-Key':key},
                json={'plan_id':'points_1000','expected_total_fen':1000,'accept_terms':True}).json()
        requested=order(root,token,'query-target');other=order(other_root,other_token,'other-target')
        with write_transaction(self.sessions) as session:
            for identifier in (requested['id'],other['id']):
                session.get(BillingOrder,identifier).payment={'provider':'wechat','state':'ready'}
        provider=NativePay(self.settings)
        provider.query=lambda identifier:self.payment(other['id'])
        with patch('app.payments.NativePay',lambda settings:provider):
            response=self.client.post(root+'/billing/orders/'+requested['id']+'/refresh',headers=token)
        self.assertEqual(response.status_code,502,response.text)
        self.assertEqual(response.json()['detail'],'wechat_payment_mismatch')
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],1000)
        self.assertEqual(self.client.get(other_root+'/points',headers=other_token).json()['available'],1000)

    def test_inflight_create_cannot_close_and_unknown_not_found_waits_until_expiry(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        order=self.client.post(root+'/billing/orders',headers={**token,'Idempotency-Key':'inflight'},
            json={'plan_id':'points_1000','expected_total_fen':1000,'accept_terms':True}).json()
        with write_transaction(self.sessions) as session:
            session.get(BillingOrder,order['id']).payment={'provider':'wechat','state':'creating'}
        path=root+'/billing/orders/'+order['id']+'/close'
        with patch('app.payments.NativePay',side_effect=AssertionError('Must not close an active create')):
            response=self.client.post(path,headers=token)
        self.assertEqual(response.status_code,409,response.text)
        recover_checkouts(self.sessions)
        class NotCreated:
            def close(self):pass
            def close_order(self,identifier):raise PaymentError('wechat_order_not_exist')
        with patch('app.payments.NativePay',lambda settings:NotCreated()):
            self.assertEqual(self.client.post(path,headers=token).status_code,502)
            with self.sessions() as session:
                self.assertEqual(session.get(BillingOrder,order['id']).status,'awaiting_payment')
            with write_transaction(self.sessions) as session:
                session.get(BillingOrder,order['id']).expires_at=utcnow()-timedelta(seconds=1)
            closed=self.client.post(path,headers=token)
            replay=self.client.post(path,headers=token)
        self.assertEqual(closed.status_code,200,closed.text)
        self.assertEqual(closed.json()['payment_state'],'not_created_expired')
        self.assertEqual(replay.status_code,200,replay.text)
