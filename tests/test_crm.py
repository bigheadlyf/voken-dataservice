from datetime import timedelta
from unittest import TestCase

from sqlalchemy import select

from app.db import Job, Prospect, PublicSourceCache, utcnow, write_transaction
from app.worker import Worker
import test_service


class DraftProvider(test_service.FixtureDeepSeek):
    def complete(self, prompt, payload, tokens, scenario=None):
        if 'prospect' in payload:
            self.calls.append('draft')
            return {'output': {'subject': 'LED product introduction', 'body': 'Hello, may I send a product overview? Please let us know if you prefer no further contact.',
                    'evidence_used': ['Invented quote'], 'review_notes': ['Check the recipient.']}, 'usage': {'total_tokens': 30}}
        return super().complete(prompt, payload, tokens, scenario)


class CRMTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def account(self, phone='13800000000'):
        workspace, token = self.register_and_login(phone)
        return workspace, '/api/v1/workspaces/' + workspace, token

    def test_draft_context_preserves_notice_scope_without_raw_trade_tables(self):
        from app.outreach import draft_context
        payload={'language':'English','objective':'Introduce products','company':{'name':'Maker'},
            'prospect':{'name':'Agency','evidence':{'evidence_type':'procurement_notice',
                'trade_records':[{'unnecessary_raw_payload':'do-not-send'}],
                'source_record':{'title':'Construction works rather than solar goods',
                    'summary':'Solar project','procurement_status':'expired',
                    'details':{'deadline_dates':['2020-01-01'],'project_country':'Kenya',
                        'notice_text':'large unneeded full notice'}}}}}
        context=draft_context(payload)
        evidence=context['prospect']['evidence']
        self.assertEqual(evidence['official_record']['title'],'Construction works rather than solar goods')
        self.assertEqual(evidence['official_record']['procurement_status'],'expired')
        self.assertEqual(evidence['official_details']['deadline_dates'],['2020-01-01'])
        self.assertNotIn('do-not-send',str(context))
        self.assertNotIn('large unneeded full notice',str(context))

    def import_one(self, root, token, **overrides):
        data = {'name': 'Buyer Ltd', 'location': 'US', 'contact': 'buyer@example.com',
                'source_note': 'Business card provided by the customer', **overrides}
        result = self.client.post(root + '/crm/prospects/import', headers=token, json={'items': [data]})
        self.assertEqual(result.status_code, 200, result.text)
        return result.json()

    def test_import_dedup_source_and_workspace_boundaries(self):
        _, root, token = self.account()
        _, other_root, other_token = self.account('13800000001')
        first = self.import_one(root, token)
        self.assertEqual(first['created'], 1)
        prospect = first['items'][0]
        duplicate = self.import_one(root, token, name='  BUYER   Ltd  ')
        self.assertEqual(duplicate['reused'], 1)
        self.assertEqual(duplicate['items'][0]['id'], prospect['id'])
        self.assertEqual(self.import_one(other_root, other_token)['created'], 1)
        url = root + '/crm/prospects/' + prospect['id']
        self.assertEqual(self.client.get(url, headers=other_token).status_code, 404)
        self.assertEqual(self.client.get(other_root + '/crm/prospects/' + prospect['id'], headers=other_token).status_code, 404)
        self.assertEqual(self.client.post(url+'/activities', headers=other_token,
            json={'kind': 'note', 'content': 'no'}).status_code, 404)
        self.assertEqual(self.client.get(root+'/crm/prospects', headers=token).json()['total'], 1)
        self.assertEqual(prospect['score']['kind'], 'evidence_completeness')
        self.assertEqual(prospect['evidence']['contact_status'], 'unverified')

    def test_followup_version_optout_and_activity(self):
        _, root, token = self.account()
        row = self.import_one(root, token)['items'][0]
        url = root + '/crm/prospects/' + row['id']
        update = self.client.patch(url, headers=token, json={'expected_version': 1, 'stage': 'qualified',
            'tags': ['LED','LED'], 'next_followup_at': '2025-01-01T10:00:00+08:00'})
        self.assertEqual(update.status_code, 200, update.text)
        self.assertEqual(update.json()['next_followup_at'], '2025-01-01T02:00:00Z')
        self.assertEqual(update.json()['tags'], ['LED'])
        self.assertEqual(self.client.patch(url, headers=token, json={'expected_version': 1,'stage':'won'}).status_code, 409)
        self.assertEqual(self.client.get(root+'/crm/summary', headers=token).json()['due_followups'], 1)
        self.assertEqual(self.client.get(root+'/crm/prospects?due=true', headers=token).json()['total'], 1)
        self.assertEqual(self.client.post(url+'/activities', headers=token,
            json={'kind': 'reply','content': 'Requested specs'}).status_code, 201)
        self.assertEqual(self.client.get(url, headers=token).json()['stage'], 'replied')
        self.client.post(url+'/activities', headers=token, json={'kind':'opt_out','content':'Do not contact us again'})
        row = self.client.get(url, headers=token).json()
        self.assertTrue(row['do_not_contact'])
        self.assertIsNone(row['next_followup_at'])
        self.assertEqual(self.client.get(root+'/crm/summary', headers=token).json()['due_followups'], 0)
        response = self.client.post(url+'/drafts', headers={**token,'Idempotency-Key':'optout'}, json={})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()['detail'], 'prospect_do_not_contact')
        self.assertEqual(self.client.patch(url, headers=token,
            json={'expected_version':row['version'],'next_followup_at':'2026-01-01T00:00:00'}).status_code, 422)

    def test_draft_queue_idempotency_profile_and_point_settlement(self):
        workspace, root, token = self.account()
        row = self.import_one(root, token)['items'][0]
        url = root + '/crm/prospects/' + row['id'] + '/drafts'
        self.assertEqual(self.client.post(url, headers=token,json={}).status_code,422)
        headers = {**token, 'Idempotency-Key': 'draft-1'}
        self.assertEqual(self.client.post(url, headers=headers,json={}).json()['detail'],'company_profile_required')
        self.client.put(root+'/company/profile', headers=token,
            json={'expected_version':0,'name':'LED Maker','products':'LED fixtures'})
        first = self.client.post(url, headers=headers, json={})
        self.assertEqual(first.status_code,202,first.text)
        self.assertEqual(self.client.post(url,headers=headers,json={}).json()['id'],first.json()['id'])
        self.assertEqual(self.client.post(url,headers=headers,json={'language':'German'}).status_code,409)
        provider = DraftProvider()
        self.assertTrue(Worker(self.sessions,self.settings,provider).run_next())
        job = self.client.get(root+'/jobs/'+first.json()['id'],headers=token).json()
        self.assertEqual(job['status'],'succeeded',job)
        self.assertEqual(job['points_charged'],1)
        self.assertFalse(job['result']['draft']['sent'])
        self.assertEqual(job['result']['draft']['evidence_used'],[])
        self.assertEqual(provider.calls,['draft'])
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],999)

    def test_optout_between_draft_enqueue_and_execution_refunds(self):
        _, root, token = self.account()
        row = self.import_one(root,token)['items'][0]
        url = root+'/crm/prospects/'+row['id']
        self.client.put(root+'/company/profile',headers=token,
            json={'expected_version':0,'name':'Seller','products':'LED'})
        job = self.client.post(url+'/drafts',headers={**token,'Idempotency-Key':'queued-draft'},json={}).json()
        self.client.post(url+'/activities',headers=token,json={'kind':'opt_out','content':'Stop'})
        provider=DraftProvider()
        Worker(self.sessions,self.settings,provider).run_next()
        result=self.client.get(root+'/jobs/'+job['id'],headers=token).json()
        self.assertEqual(result['error'],'prospect_do_not_contact')
        self.assertEqual(result['points_charged'],0)
        self.assertEqual(provider.calls,[])
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],1000)

    def test_csv_formula_escaping_and_filters(self):
        _, root, token = self.account()
        self.import_one(root, token, name='=HYPERLINK("https://bad.example")', contact='+1 234 567 890')
        response = self.client.get(root+'/crm/prospects/export.csv',headers=token)
        self.assertEqual(response.status_code,200)
        self.assertTrue(response.text.startswith('\ufeff'))
        self.assertIn("'=HYPERLINK",response.text)
        self.assertIn("'+1 234",response.text)
        self.assertIn('text/csv',response.headers['content-type'])
        self.assertEqual(self.client.get(root+'/crm/prospects?q=HYPERLINK',headers=token).json()['total'],1)
        self.assertEqual(self.client.get(root+'/crm/prospects?q=%25',headers=token).json()['total'],0)
        self.assertEqual(self.client.get(root+'/crm/prospects?stage=won',headers=token).json()['total'],0)

    def test_save_real_job_leads_and_repeat(self):
        _, root, token = self.account()
        agent=self.client.post(root+'/agents',headers=token,json={'name':'LED','instructions':'Find LED buyers'}).json()
        job=self.client.post(root+'/agents/'+agent['id']+'/runs',headers=token).json()
        Worker(self.sessions,self.settings,self.upstream).run_next()
        body={'job_id':job['id'],'lead_indices':[0,0]}
        first=self.client.post(root+'/crm/prospects/from-leads',headers=token,json=body)
        self.assertEqual(first.status_code,200,first.text)
        self.assertEqual(first.json()['created'],1)
        self.assertEqual(first.json()['items'][0]['evidence']['origin_job_id'],job['id'])
        self.assertEqual(self.client.post(root+'/crm/prospects/from-leads',headers=token,json=body).json()['reused'],1)
        self.assertEqual(self.client.post(root+'/crm/prospects/from-leads',headers=token,
            json={**body,'lead_indices':[-1]}).status_code,422)

    def test_public_cache_reuses_sources_within_workspace_only(self):
        workspace, root, token = self.account()
        provider = test_service.FixtureDeepSeek()
        worker = Worker(self.sessions,self.settings,provider)
        for index in range(2):
            result=self.client.post(root+'/public-searches',headers={**token,'Idempotency-Key':f'search-{index}'},
                json={'instructions':'LED buyer'}).json()
            self.assertTrue(worker.run_next())
        self.assertEqual(provider.calls.count('LED procurement'),1)
        self.assertEqual(provider.calls.count('https://example.com/tender'),1)
        usage = self.client.get(root+'/crm/usage', headers=token)
        self.assertEqual(usage.status_code, 200, usage.text)
        search_usage = next(row for row in usage.json()['provider_calls'] if row['endpoint'] == 'search')
        self.assertEqual(search_usage['calls'], 2)
        self.assertEqual(search_usage['cache_hits'], 1)
        self.assertEqual(search_usage['estimated_or_reserved_milli_cny'], self.settings.public_tool_estimate_milli_cny)
        self.assertEqual(usage.json()['monetary_scope'], 'provider_estimates_excluding_model_cost_and_infrastructure')
        with self.sessions() as session:
            cached=list(session.scalars(select(PublicSourceCache).where(PublicSourceCache.workspace_id==workspace)))
            self.assertEqual(len(cached),2)
        _, other_root, other_token=self.account('13800000001')
        self.client.post(other_root+'/public-searches',headers=other_token,json={'instructions':'LED buyer'})
        worker.run_next()
        self.assertEqual(provider.calls.count('LED procurement'),2)
        with write_transaction(self.sessions) as session:
            for entry in session.scalars(select(PublicSourceCache).where(PublicSourceCache.workspace_id==workspace)):
                entry.expires_at=utcnow()-timedelta(seconds=1)
        self.client.post(root+'/public-searches',headers=token,json={'instructions':'LED buyer'})
        worker.run_next()
        self.assertEqual(provider.calls.count('LED procurement'),3)

    def test_product_console_in_production_and_prefix(self):
        response=self.client.get('/app')
        self.assertEqual(response.status_code,200)
        self.assertIn('/app-assets/react/app.js?v=',response.text)
        self.assertIn("script-src 'self'",response.headers['content-security-policy'])
        self.assertEqual(self.client.get('/app-assets/app.js').status_code,200)

    def test_search_returned_content_avoids_redundant_fetch(self):
        _, root, token = self.account()

        class ContentProvider(test_service.FixtureDeepSeek):
            def search(self, query):
                result = super().search(query)
                result['hits'][0]['content'] = 'Buying LED products'
                return result

        provider = ContentProvider()
        agent = self.client.post(root+'/agents', headers=token, json={'name':'LED','instructions':'Find LED buyers'}).json()
        job = self.client.post(root+'/agents/'+agent['id']+'/runs',headers=token).json()
        Worker(self.sessions,self.settings,provider).run_next()
        self.assertNotIn('https://example.com/tender',provider.calls)
        result=self.client.get(root+'/jobs/'+job['id'],headers=token).json()
        self.assertEqual(result['result']['leads'][0]['quote'],'Buying LED products')
        self.assertEqual(result['result']['sources'][0]['evidence_status'],'text_available')
        self.assertNotIn('content',result['result']['sources'][0])

    def test_research_contact_provenance_and_explicit_selection(self):
        _, root, token = self.account()
        prospect = self.import_one(root, token)['items'][0]
        url=root+'/crm/prospects/'+prospect['id']
        response=self.client.post(url+'/research',headers={**token,'Idempotency-Key':'contact-research'},json={})
        self.assertEqual(response.status_code,202,response.text)

        class ContactProvider(test_service.FixtureDeepSeek):
            def fetch(self, url):
                return {'content':'Buying LED products. Contact procurement@example.com for business.' , 'billable':True}

        Worker(self.sessions,self.settings,ContactProvider()).run_next()
        job=self.client.get(root+'/jobs/'+response.json()['id'],headers=token).json()
        self.assertEqual(job['result']['contact_candidates'][0]['value'],'procurement@example.com')
        self.assertEqual(self.client.get(url,headers=token).json()['contact'],'buyer@example.com')
        wrong=self.import_one(root,token,name='Other Buyer')['items'][0]
        selected={'job_id':job['id'],'value':'procurement@example.com','expected_version':1}
        self.assertEqual(self.client.post(root+'/crm/prospects/'+wrong['id']+'/apply-contact',headers=token,json=selected).status_code,409)
        selected_response=self.client.post(url+'/apply-contact',headers=token,json=selected)
        self.assertEqual(selected_response.status_code,200,selected_response.text)
        self.assertEqual(selected_response.json()['contact'],'procurement@example.com')
        self.assertEqual(selected_response.json()['evidence']['selected_contact']['verification_status'],'public_page_unverified')
        self.assertEqual(selected_response.json()['evidence']['selected_contact']['source_url'],'https://example.com/tender')

    def test_literal_email_extraction_after_body_truncation(self):
        from app.public_contacts import observed_emails
        body='a '*4000+'Business contact: real.sales+uk@example.co.uk. Do not guess other addresses.'
        self.assertEqual(observed_emails(body),['real.sales+uk@example.co.uk'])
        self.assertEqual(observed_emails('contact us on our website'),[])
        self.assertEqual(observed_emails('n**@company.com or info@company.com'),['info@company.com'])
        from app.public_contacts import candidates
        self.assertEqual(candidates([{'source_id':0,'observed_emails':['n**@company.com']}]),[])
