from dataclasses import replace
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch
import smtplib
import ssl
import socketserver
from threading import Thread

from sqlalchemy import select
from app.db import MailDelivery, utcnow, write_transaction
from app.mail_delivery import SMTPResult, delivery_footer, recover_deliveries, run_next_delivery, submit_smtp
from app.worker import Worker
import test_crm as crm_test


class MailDeliveryTest(TestCase):
    setUp=crm_test.CRMTest.setUp
    register_and_login=crm_test.CRMTest.register_and_login
    account=crm_test.CRMTest.account
    import_one=crm_test.CRMTest.import_one

    def ready(self):
        workspace,root,token=self.account()
        settings=replace(self.settings,smtp_enabled=True,smtp_workspace_id=workspace,
            smtp_host='127.0.0.1',smtp_mode='test_plain',smtp_from='sender@example.org',
            smtp_footer='QA Sender, test address. Reply STOP to stop receiving messages.')
        self.app.state.settings=settings
        prospect=self.import_one(root,token)['items'][0]
        self.client.put(root+'/company/profile',headers=token,json={
            'expected_version':0,'name':'QA Sender','products':'LED products'})
        job=self.client.post(root+'/crm/prospects/'+prospect['id']+'/drafts',
            headers={**token,'Idempotency-Key':'mail-draft'},json={}).json()
        Worker(self.sessions,settings,crm_test.DraftProvider()).run_next()
        payload={'draft_job_id':job['id'],'expected_version':prospect['version'],
            'recipient':prospect['contact'],'subject':'Reviewed introduction',
            'body':'May I send a product overview?','confirm_send':True}
        return settings,root,token,prospect,payload

    def queue(self,root,token,prospect,payload,key='delivery-1'):
        return self.client.post(root+'/crm/prospects/'+prospect['id']+'/deliveries',
            headers={**token,'Idempotency-Key':key},json=payload)

    def test_review_idempotency_sender_scope_and_acceptance(self):
        settings,root,token,prospect,payload=self.ready()
        self.assertTrue(self.client.get(root+'/mail/channel',headers=token).json()['enabled'])
        response=self.queue(root,token,prospect,{**payload,'confirm_send':False})
        self.assertEqual(response.status_code,422)
        first=self.queue(root,token,prospect,payload)
        self.assertEqual(first.status_code,202,first.text)
        self.assertEqual(first.json()['id'],self.queue(root,token,prospect,payload).json()['id'])
        self.assertEqual(self.queue(root,token,prospect,{**payload,'body':'Changed'}).status_code,409)
        self.assertEqual(self.queue(root,token,prospect,payload,key='new-key').status_code,409)
        _,other_root,other_token=self.account('13800000001')
        self.assertFalse(self.client.get(other_root+'/mail/channel',headers=other_token).json()['enabled'])
        self.assertEqual(self.client.get(root+'/mail/deliveries',headers=other_token).status_code,404)
        self.assertEqual(self.client.get(other_root+'/mail/deliveries',headers=other_token).json(),[])
        calls=[]
        def transport(settings,row):
            calls.append(row)
            self.assertEqual(row.sender,'sender@example.org')
            self.assertTrue(row.body.endswith(delivery_footer(settings)))
            return SMTPResult('accepted')
        self.assertTrue(run_next_delivery(self.sessions,settings,transport))
        self.assertFalse(run_next_delivery(self.sessions,settings,transport))
        self.assertEqual(len(calls),1)
        row=self.client.get(root+'/mail/deliveries',headers=token).json()[0]
        self.assertEqual(row['status'],'accepted')
        self.assertEqual(self.client.get(root+'/crm/prospects/'+prospect['id'],headers=token).json()['stage'],'contacted')

    def test_optout_before_send_and_recovery_never_retries_uncertain_mail(self):
        settings,root,token,prospect,payload=self.ready()
        queued=self.queue(root,token,prospect,payload).json()
        self.client.post(root+'/crm/prospects/'+prospect['id']+'/activities',headers=token,
            json={'kind':'opt_out','content':'Stop contacting me'})
        def forbidden(*args):
            self.fail('Opted-out mail must not touch SMTP')
        self.assertTrue(run_next_delivery(self.sessions,settings,forbidden))
        row=self.client.get(root+'/mail/deliveries',headers=token).json()[0]
        self.assertEqual(row['status'],'cancelled')
        self.assertEqual(row['error'],'prospect_do_not_contact')
        with write_transaction(self.sessions) as session:
            row=session.get(MailDelivery,queued['id']);row.status='sending';row.started_at=utcnow()
        recover_deliveries(self.sessions)
        self.assertFalse(run_next_delivery(self.sessions,settings,forbidden))
        self.assertEqual(self.client.get(root+'/mail/deliveries',headers=token).json()[0]['status'],'unknown')

    def test_local_smtp_wire_acceptance_and_disconnect_uncertainty(self):
        settings,root,token,prospect,payload=self.ready()
        payload.update(subject='灯具介绍 · Présentation',body='您好，是否需要灯具资料？\nGuten Tag. Bonjour.')
        queued=self.queue(root,token,prospect,payload).json()
        messages=[]
        class Receiver(socketserver.StreamRequestHandler):
            def handle(self):
                self.wfile.write(b'220 local QA SMTP\r\n')
                while True:
                    line=self.rfile.readline(10000)
                    if not line:return
                    command=line.split(b' ',1)[0].strip().upper()
                    if command==b'DATA':
                        self.wfile.write(b'354 send body\r\n')
                        message=bytearray()
                        while True:
                            part=self.rfile.readline(10000)
                            if part==b'.\r\n':break
                            if not part or len(message)>20000:return
                            message.extend(part)
                        messages.append(bytes(message))
                        self.wfile.write(b'250 accepted for local test\r\n')
                    elif command==b'EHLO':self.wfile.write(b'250 localhost\r\n')
                    else:self.wfile.write(b'250 OK\r\n')
        with socketserver.TCPServer(('127.0.0.1',0),Receiver) as server:
            thread=Thread(target=server.serve_forever,daemon=True);thread.start()
            try:
                local_settings=replace(settings,smtp_port=server.server_address[1])
                self.assertTrue(run_next_delivery(self.sessions,local_settings))
            finally:server.shutdown();thread.join(timeout=2)
        self.assertEqual(len(messages),1)
        self.assertIn(b'To: buyer@example.com',messages[0])
        self.assertIn(b'List-Unsubscribe:',messages[0])
        self.assertIn(queued['message_id'].encode(),messages[0])
        from email.parser import BytesParser
        from email.policy import default
        parsed=BytesParser(policy=default).parsebytes(messages[0])
        self.assertEqual(str(parsed['Subject']),payload['subject'])
        self.assertIn(payload['body'],parsed.get_content().replace('\r\n','\n'))
        self.assertIn('reply STOP',parsed.get_content())
        class Disconnect:
            def __init__(self,**kwargs):pass
            def ehlo(self):pass
            def mail(self,*args):return 250,b'OK'
            def rcpt(self,*args):return 250,b'OK'
            def data(self,*args):raise smtplib.SMTPServerDisconnected('private diagnostic')
            def close(self):pass
        with patch('app.mail_delivery.smtplib.SMTP',Disconnect):
            outcome=submit_smtp(settings,SimpleNamespace(**{**queued,'created_at':utcnow()}))
        self.assertEqual(outcome.status,'unknown')
        self.assertEqual(outcome.error,'smtp_acceptance_unknown')

    def test_plain_smtp_cannot_be_enabled_for_remote_or_production(self):
        for change in ({'environment':'production'},{'smtp_host':'smtp.example.com'}):
            with self.assertRaises(ValueError):
                replace(self.settings,**{'smtp_mode':'test_plain','smtp_host':'127.0.0.1',**change})

    def test_starttls_requires_verified_tls_before_credentials_or_message(self):
        settings,root,token,prospect,payload=self.ready()
        queued=self.queue(root,token,prospect,payload).json()
        secure=replace(settings,smtp_mode='starttls',smtp_username='qa-user',smtp_password='private-smtp-password')
        calls=[]
        class VerifiedTLS:
            def __init__(self,**kwargs):calls.append('connect')
            def starttls(inner,context):
                self.assertTrue(context.check_hostname)
                self.assertEqual(context.verify_mode,ssl.CERT_REQUIRED)
                calls.append('verified_tls')
            def ehlo(self):calls.append('ehlo')
            def login(self,*args):calls.append('login')
            def mail(self,*args):return 250,b'OK'
            def rcpt(self,*args):return 250,b'OK'
            def data(self,*args):calls.append('data');return 250,b'OK'
            def close(self):pass
        row=SimpleNamespace(**{**queued,'created_at':utcnow()})
        with patch('app.mail_delivery.smtplib.SMTP',VerifiedTLS):
            self.assertEqual(submit_smtp(secure,row).status,'accepted')
        self.assertLess(calls.index('verified_tls'),calls.index('login'))
        self.assertLess(calls.index('login'),calls.index('data'))
        class BrokenTLS(VerifiedTLS):
            def starttls(self,context):raise ssl.SSLCertVerificationError('untrusted server')
        calls.clear()
        with patch('app.mail_delivery.smtplib.SMTP',BrokenTLS):
            self.assertEqual(submit_smtp(secure,row).status,'rejected')
        self.assertNotIn('login',calls)
        self.assertNotIn('data',calls)
