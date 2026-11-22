import io
import json
from copy import deepcopy
from dataclasses import replace
from datetime import timedelta
from unittest import TestCase
from unittest.mock import patch

import httpx
from sqlalchemy import select
from openpyxl import Workbook

import test_service
from app.db import CRMWorkspaceRecord as Record, Job, Prospect, ProspectActivity, ProspectContact, utcnow, write_transaction
from app.crm_workbench import blocked_recipient, zerobounce_verify, parse_roster
from fastapi import HTTPException


class WorkbenchTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def account(self):
        self.workspace, self.token = self.register_and_login('13800000000')
        self.root = '/api/v1/workspaces/' + self.workspace
        self.base = self.root + '/crm/workbench'
        return self.workspace

    def prospect(self, name='Marmetal Industries LLC', location='US', email='sales@example.com', website='https://example.com'):
        result = self.client.post(self.root+'/crm/prospects/import', headers=self.token, json={'items':[
            {'name':name,'location':location,'contact':email,'website':website,'source_note':'Original source'}]})
        self.assertEqual(result.status_code, 200, result.text)
        return result.json()['items'][0]

    def post(self, suffix, data, key='test'):
        return self.client.post(self.base+suffix, headers={**self.token,'Idempotency-Key':key}, json=data)

    def snapshot(self, pid):
        return self.client.get(self.root+'/crm/prospects/'+pid,headers=self.token).json()

    def seed_contact_job(self, pid, email='buyer@example.com'):
        with write_transaction(self.sessions) as session:
            job = Job(workspace_id=self.workspace, operation='directory_contacts', status='succeeded',
                idempotency_key='fixture-'+email, request_hash='x'*64, payload={}, point_cost=0,
                result={'directory':{'subject':{'namespace':'directory_person','record_id':'person-1',
                    'name':'Jane Buyer','titles':['Purchasing Manager'],'company_name':'Marmetal'},
                    'records':[{'channel':'emails','value':email,'validity':1,'source_url':'https://example.com/team'}]}})
            session.add(job);session.flush(); jid=job.id
        response=self.post('/candidates',{'job_id':jid,'prospect_id':pid,'confirm_company_match':True})
        self.assertEqual(response.status_code,201,response.text)
        return jid,response.json()

    def test_read_projection_and_candidates_never_overwrite_legacy(self):
        self.account(); p=self.prospect(); before=self.snapshot(p['id'])
        jid, candidate=self.seed_contact_job(p['id'])
        repeated=self.post('/candidates',{'job_id':jid,'prospect_id':p['id'],'confirm_company_match':True})
        self.assertEqual(repeated.json()['id'],candidate['id'])
        page=self.client.get(self.base+'?mode=contacts',headers=self.token).json()
        buyer=next(c for c in page['items'] if c['email']=='buyer@example.com')
        self.assertEqual(buyer['verification']['status'],'unverified')
        self.assertEqual(buyer['role_match']['status'],'keyword_match')
        self.assertFalse(buyer['ready'])
        self.assertEqual(page['summary']['verified_mailboxes'],0)
        self.assertEqual(page['summary']['companies_with_email'],1)
        self.assertEqual(self.snapshot(p['id']),before)
        with self.sessions() as s:
            self.assertEqual(list(s.scalars(select(ProspectContact))),[])
            self.assertEqual(s.get(Job,jid).result['directory']['records'][0]['value'],'buyer@example.com')

    def test_duplicate_hints_filters_views_and_history_are_tenant_scoped(self):
        self.account(); p=self.prospect(); other=self.prospect('Marmetal Industries','USA')
        page=self.client.get(self.base+'?country_filter=美国',headers=self.token).json()
        self.assertEqual(page['total'],2)
        self.assertEqual({r['id'] for r in page['items'][0]['duplicates']},{p['id'] if page['items'][0]['id']==other['id'] else other['id']})
        before=self.snapshot(p['id'])
        self.assertEqual(self.post('/assessments',{'prospect_id':p['id'],'status':'fit','reason':'Matched source'}).status_code,201)
        self.assertEqual(self.post('/views',{'name':'US purchasers','mode':'contacts','country_filter':'US','target':'procurement'}).status_code,201)
        self.assertEqual(len(self.client.get(self.base+'/views',headers=self.token).json()),1)
        self.assertEqual(self.snapshot(p['id']),before)
        _, foreign=self.register_and_login('13800000001')
        self.assertEqual(self.client.get(self.base,headers=foreign).status_code,404)
        foreign_root='/api/v1/workspaces/'+self.client.post('/api/v1/auth/login',json={'phone':'13800000001','password':'valid-password'}).json()['workspace_id']+'/crm/workbench'
        self.assertEqual(self.client.get(foreign_root+'/history/'+p['id'],headers=foreign).status_code,404)
        self.assertEqual(self.client.get(foreign_root+'/views',headers=foreign).json(),[])

    def test_independent_verification_idempotency_history_and_unknown(self):
        self.account();p=self.prospect();self.seed_contact_job(p['id']);before=self.snapshot(p['id'])
        self.app.state.settings=replace(self.settings,email_validation_api_key='test-key',email_validation_workspace_id=self.workspace)
        calls=[]
        self.app.state.email_validator=lambda address:(calls.append(address) or {'status':'unknown','reason':'timeout_exceeded'})
        body={'prospect_id':p['id'],'email':'buyer@example.com','confirm_external_check':True}
        first=self.post('/verifications',body,'verify-1')
        self.assertEqual(first.status_code,201,first.text)
        self.assertEqual(self.post('/verifications',body,'verify-1').json()['id'],first.json()['id'])
        self.assertEqual(len(calls),1)
        page=self.client.get(self.base+'?mode=contacts&verification=unknown',headers=self.token).json()
        self.assertEqual(page['total'],1);self.assertFalse(page['items'][0]['ready'])
        self.app.state.email_validator=lambda email:{'status':'valid','reason':'mailbox_check'}
        self.assertEqual(self.post('/verifications',body,'verify-2').status_code,201)
        history=self.client.get(self.base+'/history/'+p['id'],headers=self.token).json()
        self.assertEqual([r['data']['status'] for r in history],['unknown','valid'])
        self.assertEqual(self.snapshot(p['id']),before)
        self.assertEqual(self.post('/verifications',{**body,'email':'sales@example.com'},'verify-1').status_code,409)
        self.assertEqual(self.post('/verifications',{**body,'email':'unknown@example.com'},'verify-3').status_code,422)

    def test_verification_unconfigured_scope_and_daily_limit(self):
        self.account();p=self.prospect()
        body={'prospect_id':p['id'],'email':p['contact'],'confirm_external_check':True}
        self.assertEqual(self.post('/verifications',body).status_code,503)
        self.app.state.settings=replace(self.settings,email_validation_api_key='test',email_validation_workspace_id=self.workspace,email_validation_daily_limit=1)
        self.app.state.email_validator=lambda email:{'status':'catch_all'}
        self.assertEqual(self.post('/verifications',body,'one').status_code,201)
        self.assertEqual(self.post('/verifications',body,'two').status_code,429)
        self.assertEqual(self.post('/verifications',body,'one').status_code,201)

    def test_ready_filter_requires_company_role_and_recent_independent_validation(self):
        self.account();p=self.prospect();self.seed_contact_job(p['id'])
        self.app.state.settings=replace(self.settings,email_validation_api_key='test',email_validation_workspace_id=self.workspace)
        self.app.state.email_validator=lambda address:{'status':'valid'}
        self.post('/verifications',{'prospect_id':p['id'],'email':'buyer@example.com','confirm_external_check':True})
        query=self.base+'?mode=contacts&ready_only=true&role_filter=keyword_match'
        self.assertEqual(self.client.get(query,headers=self.token).json()['total'],0)
        self.post('/assessments',{'prospect_id':p['id'],'status':'fit','reason':'Reviewed source'})
        self.assertEqual(self.client.get(query,headers=self.token).json()['total'],1)
        # Company filters must refer to the same contact, not mix one person's role with another's validation.
        self.assertEqual(self.client.get(self.base+'?mode=companies&verification=valid&role_filter=unknown',headers=self.token).json()['total'],0)
        with write_transaction(self.sessions) as session:
            record=session.scalar(select(Record).where(Record.kind=='verification'))
            record.data={**record.data,'checked_at':(utcnow()-timedelta(days=31)).isoformat()+'Z'}
        self.assertEqual(self.client.get(query,headers=self.token).json()['total'],0)
    def test_provider_mismatch_or_failure_is_not_valid_and_secret_not_exposed(self):
        with self.assertRaises(HTTPException) as error:
            zerobounce_verify('secret','buyer@example.com',httpx.MockTransport(lambda r:httpx.Response(200,json={'address':'other@example.com','status':'valid'})))
        self.assertNotIn('secret',str(error.exception.detail))
        with self.assertRaises(HTTPException):
            zerobounce_verify('secret','buyer@example.com',httpx.MockTransport(lambda r:httpx.Response(401,json={})))
        result=zerobounce_verify('secret','buyer@example.com',httpx.MockTransport(lambda r:httpx.Response(200,json={'address':'buyer@example.com','status':'catch-all'})))
        self.assertEqual(result['status'],'catch_all')

    def test_optout_stops_reminders_and_does_not_rewrite_old_stage(self):
        self.account();p=self.prospect();other=self.prospect('Other',email='other@example.com');before=self.snapshot(p['id'])
        task={'prospect_ids':[p['id']],'due_at':(utcnow()-timedelta(hours=1)).isoformat()+'Z','intervals_days':[3,7],'objective':'Review draft'}
        created=self.post('/followups',task,'plan');self.assertEqual(created.status_code,201,created.text)
        self.assertEqual(self.post('/followups',task,'plan').json(),created.json())
        self.assertEqual(self.client.get(self.base+'/followups',headers=self.token).json()[0]['status'],'due')
        event={'prospect_id':p['id'],'email':'','type':'opt_out','content':'Stop'}
        result=self.post('/events',event,'event');self.assertEqual(result.status_code,201,result.text)
        self.assertEqual(self.post('/events',event,'event').json()['id'],result.json()['id'])
        tasks=self.client.get(self.base+'/followups',headers=self.token).json()
        self.assertTrue(all(t['status']=='stopped' for t in tasks))
        with self.sessions() as session:
            self.assertTrue(blocked_recipient(session,self.workspace,p['id'],p['contact']))
            self.assertFalse(blocked_recipient(session,self.workspace,other['id'],''))
        self.assertEqual(self.snapshot(p['id']),before)
        self.assertEqual(self.post('/followups',task,'new-plan').status_code,409)

    def test_reply_stops_only_subsequent_sequence_and_completion_is_idempotent(self):
        self.account();p=self.prospect()
        body={'prospect_ids':[p['id']],'due_at':utcnow().isoformat()+'Z','intervals_days':[3],'objective':'Follow up'}
        ids=self.post('/followups',body).json()
        self.post('/events',{'prospect_id':p['id'],'email':p['contact'],'type':'reply','content':'Reply'},'reply')
        self.assertTrue(all(t['status']=='stopped' for t in self.client.get(self.base+'/followups',headers=self.token).json()))
        self.assertEqual(self.post('/followups/'+ids[0]+'/complete',{}).status_code,201)
        self.assertEqual(self.post('/followups/'+ids[0]+'/complete',{}).status_code,201)

    def test_roster_preview_mapping_commit_reuses_without_overwrite(self):
        self.account();p=self.prospect();before=self.snapshot(p['id'])
        csv='公司名称,国家,邮箱\nMarmetal Industries LLC,US,new@example.com\nNew Buyer,US,new@example.com\nInvalid Buyer,US,not-an-email\n'
        preview=self.client.post(self.base+'/imports/preview',headers=self.token,files={'file':('roster.csv',csv.encode(),'text/csv')})
        self.assertEqual(preview.status_code,201,preview.text)
        self.assertEqual(len(self.client.get(self.root+'/crm/prospects',headers=self.token).json()['items']),1)
        body={'preview_id':preview.json()['id'],'mapping':preview.json()['data']['mapping'],'source_note':'Authorized fair roster','source_year':2026,'confirm_import':True}
        result=self.post('/imports/commit',body)
        self.assertEqual(result.status_code,201,result.text)
        self.assertEqual((result.json()['created'],result.json()['reused'],result.json()['invalid']),(1,1,1))
        self.assertEqual(self.post('/imports/commit',body).json(),result.json())
        self.assertEqual(self.snapshot(p['id']),before)
        self.assertEqual(self.post('/imports/commit',{**body,'source_note':'Different'}).status_code,409)

    def test_xlsx_formulas_limits_and_invalid_headers(self):
        book=Workbook();sheet=book.active;sheet.append(['公司名称','邮箱']);sheet.append(['Buyer','buyer@example.com'])
        buf=io.BytesIO();book.save(buf)
        columns,items=parse_roster('roster.xlsx',buf.getvalue());self.assertEqual(items[0]['邮箱'],'buyer@example.com')
        sheet['A2']='=1+1';buf=io.BytesIO();book.save(buf)
        with self.assertRaises(HTTPException):parse_roster('roster.xlsx',buf.getvalue())
        with self.assertRaises(HTTPException):parse_roster('roster.csv',b'Company,Company\na,b')
        with self.assertRaises(HTTPException):parse_roster('roster.csv',('Company\n'+'Buyer\n'*201).encode())
        with self.assertRaises(HTTPException):parse_roster('roster.csv',b'Company\n'+b'a'*150000)

    def test_eml_preview_confirm_and_optout_no_legacy_mutation(self):
        self.account();p=self.prospect();before=self.snapshot(p['id'])
        msg=b'From: buyer@example.com\r\nTo: sender@example.org\r\nMessage-ID: <one@example.com>\r\nSubject: Please stop\r\n\r\nStop contacting me.'
        preview=self.client.post(self.base+'/inbox/preview',headers=self.token,files={'file':('reply.eml',msg,'message/rfc822')})
        self.assertEqual(preview.status_code,201,preview.text)
        body={'preview_id':preview.json()['id'],'prospect_id':p['id'],'type':'opt_out','confirm_relationship':True}
        self.assertEqual(self.post('/inbox/archive',body).status_code,422)
        body['email']=p['contact']
        result=self.post('/inbox/archive',body)
        self.assertEqual(result.status_code,201,result.text)
        self.assertEqual(self.post('/inbox/archive',body).json()['id'],result.json()['id'])
        self.assertEqual(self.client.get(self.base+'/inbox',headers=self.token).json(),[])
        self.assertEqual(self.snapshot(p['id']),before)
        self.assertTrue(self.client.get(self.base+'?mode=contacts',headers=self.token).json()['items'][0]['blocked'])

    def test_imap_is_readonly_bounded_and_deduplicates(self):
        self.account()
        self.app.state.settings=replace(self.settings,imap_host='imap.example.com',imap_username='user',imap_password='secret',imap_workspace_id=self.workspace)
        calls=[]
        class IMAP:
            def __init__(self,*args,**kwargs):pass
            def __enter__(self):return self
            def __exit__(self,*args):pass
            def login(self,*args):pass
            def select(self,mailbox,readonly=False):
                calls.append(('select',readonly));return 'OK',[]
            def uid(self,command,*args):
                calls.append((command,args))
                if command=='search':return 'OK',[b'1']
                if args[-1]=='(RFC822.SIZE)':return 'OK',[b'1 (RFC822.SIZE 100)']
                return 'OK',[(b'1',b'From: buyer@example.com\r\nSubject: Hi\r\n\r\nReply')]
        with patch('imaplib.IMAP4_SSL',IMAP):
            self.assertEqual(self.post('/inbox/sync',{}).json()['added'],1)
            self.assertEqual(self.post('/inbox/sync',{}).json()['added'],0)
        self.assertIn(('select',True),calls)
        self.assertTrue(any(c[0]=='fetch' and c[1][-1]=='(BODY.PEEK[])' for c in calls))

    def test_cohorts_are_hypotheses_and_do_not_create_tasks(self):
        self.account()
        saved=self.post('/products',{'name':'LED','description':'Commercial lighting','value':'Specifications'}).json()
        class Planner:
            def complete(self,*args,**kwargs):
                return {'output':{'cohorts':[{'name':'Distributors','buyer_role':'distributor','use_case':'Stock lighting','reason':'Resale channel','exclusions':['retail-only']}]}}
        self.app.state.chat_provider=Planner()
        result=self.post('/cohorts',{'product_id':saved['id'],'market':'US'})
        self.assertEqual(result.status_code,200,result.text)
        self.assertEqual(result.json()['status'],'hypotheses_require_preview')
        with self.sessions() as s:self.assertEqual(list(s.scalars(select(Job))),[])

    def test_preview_feedback_is_append_only_and_changes_only_future_filter(self):
        self.account()
        with write_transaction(self.sessions) as s:
            job=Job(workspace_id=self.workspace,operation='prospecting',status='partial',idempotency_key='preview',request_hash='x'*64,
                payload={'market':'US','product':'LED','instructions':'Find buyers'},point_cost=0,
                result={'leads':[{'name':'Fixture Buyer','location':'US'}]})
            s.add(job);s.flush();jid=job.id;old=deepcopy(job.result)
        body={'job_id':jid,'lead_index':0,'verdict':'not_fit','reason_code':'logistics','reason':'Logistics only'}
        self.assertEqual(self.post('/preview-feedback',body).status_code,201)
        self.assertEqual(self.post('/preview-feedback',{**body,'verdict':'unreviewed'}).status_code,201)
        from app.crm_workbench import rejected_entities
        from app.discovery_review import profile_key,entity_key
        with self.sessions() as s:
            self.assertEqual(s.get(Job,jid).result,old)
            self.assertEqual(rejected_entities(s,self.workspace,profile_key(s.get(Job,jid).payload),set()),set())
            self.assertEqual(len([r for r in s.scalars(select(Record)) if r.kind=='preview_feedback']),2)

    def test_people_without_email_remain_visible_without_inflating_mailbox_counts(self):
        self.account();p=self.prospect()
        with write_transaction(self.sessions) as s:
            job=Job(workspace_id=self.workspace,operation='directory_people',status='succeeded',idempotency_key='people',request_hash='x'*64,payload={},point_cost=0,
                result={'directory':{'kind':'people','records':[{'record_id':'person-1','name':'Jane Buyer','titles':['Purchasing Manager']}]}})
            s.add(job);s.flush();jid=job.id
        result=self.post('/people-candidates',{'job_id':jid,'record_id':'person-1','prospect_id':p['id'],'confirm_company_match':True})
        self.assertEqual(result.status_code,201,result.text)
        page=self.client.get(self.base+'?mode=contacts',headers=self.token).json()
        self.assertEqual(page['total'],2)
        person=next(c for c in page['items'] if c['name']=='Jane Buyer')
        self.assertEqual(person['email'],'');self.assertEqual(person['next_action'],'补全联系方式')
        self.assertFalse(person['blocked']);self.assertEqual(page['summary']['unique_mailboxes'],1)
        self.assertEqual(self.client.get(self.base+'?mode=contacts&has_email=true',headers=self.token).json()['total'],1)
        self.seed_contact_job(p['id'])
        page=self.client.get(self.base+'?mode=contacts',headers=self.token).json()
        self.assertEqual(sum(c['name']=='Jane Buyer' for c in page['items']),1)

    def test_discovery_delta_same_profile_only_and_snapshots_unchanged(self):
        self.account()
        payload={'market':'US','product':'LED','instructions':'Find buyers'}
        with write_transaction(self.sessions) as s:
            first=Job(workspace_id=self.workspace,operation='prospecting',status='succeeded',idempotency_key='first',request_hash='1'*64,
                payload=payload,point_cost=0,created_at=utcnow()-timedelta(days=2),result={'leads':[{'name':'Old Buyer','location':'US','contact':''}]})
            second=Job(workspace_id=self.workspace,operation='prospecting',status='partial',idempotency_key='second',request_hash='2'*64,
                payload=payload,point_cost=0,result={'leads':[{'name':'Old Buyer','location':'USA','contact':'sales@example.com'},{'name':'New Buyer','location':'US','contact':''}]})
            s.add_all([first,second]);s.flush();jid=second.id;expected=deepcopy(second.result)
        result=self.client.get(self.base+'/discovery-delta/'+jid,headers=self.token)
        self.assertEqual(result.status_code,200,result.text)
        self.assertEqual(result.json()['baseline_jobs'],1)
        self.assertEqual(result.json()['new_companies'],1)
        self.assertEqual(result.json()['companies_with_new_email'],1)
        with self.sessions() as s:self.assertEqual(s.get(Job,jid).result,expected)


class WorkbenchMailTest(TestCase):
    def test_append_only_bounce_cancels_queued_send_and_blocks_drafts(self):
        from test_mail_delivery import MailDeliveryTest
        from app.mail_delivery import run_next_delivery
        case=MailDeliveryTest();case.setUp()
        self.addCleanup(case.doCleanups)
        settings,root,token,p,payload=case.ready()
        queued=case.queue(root,token,p,payload)
        self.assertEqual(queued.status_code,202,queued.text)
        before=case.client.get(root+'/crm/prospects/'+p['id'],headers=token).json()
        response=case.client.post(root+'/crm/workbench/events',headers={**token,'Idempotency-Key':'bounce'},
            json={'prospect_id':p['id'],'email':p['contact'],'type':'bounce','content':'Mailbox not found'})
        self.assertEqual(response.status_code,201,response.text)
        def forbidden(*args):self.fail('Suppressed mailbox must never reach SMTP')
        run_next_delivery(case.sessions,settings,forbidden)
        self.assertEqual(case.client.get(root+'/mail/deliveries',headers=token).json()[0]['status'],'cancelled')
        self.assertEqual(case.client.get(root+'/crm/prospects/'+p['id'],headers=token).json(),before)
        self.assertEqual(case.client.post(root+'/crm/prospects/'+p['id']+'/drafts',headers={**token,'Idempotency-Key':'new-draft'},json={}).status_code,409)
