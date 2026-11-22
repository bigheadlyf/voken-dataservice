from dataclasses import replace
from datetime import timedelta
import json
from unittest import TestCase

import httpx

from app.config import Settings
from app.db import utcnow
from app.deepseek import ProviderError
from app.public_sources import PublicSources
from app.worker import Worker
import test_service


LEI = '529900T8BM49AURSDO55'


def gleif_body():
    return {'data':[{'id':LEI,'attributes':{'lei':LEI,
        'entity':{'legalName':{'name':'Fixture Export Buyer AG'},'legalAddress':{'country':'DE','city':'Berlin'},
                  'status':'ACTIVE','registeredAs':'HRB 123'},
        'registration':{'status':'ISSUED','lastUpdateDate':'2026-10-01T00:00:00Z'}}}],
        'meta':{'pagination':{'total':42}}}


class OfficialAdapterTest(TestCase):
    def test_worldbank_filters_awards_stale_dates_and_never_invents_buyer(self):
        requests=[]
        today=utcnow().date()
        def notice(identifier, **values):
            return {'id':identifier, 'notice_type':'Invitation for Bids', 'notice_status':'Published',
                'noticedate':today.strftime('%d-%b-%Y'), 'project_name':'Solar project',
                'project_ctry_name':'Kenya', 'bid_description':'Network upgrade goods', **values}
        def respond(request):
            requests.append(request)
            return httpx.Response(200,json={'total':'120','procnotices':[
                notice('OP00481692',contact_organization='Energy Agency',contact_email='bids@example.org',
                       submission_deadline_date=(today-timedelta(days=1)).isoformat()+'T00:00:00Z'),
                notice('OP00481693'),
                notice('OP00481694',notice_type='Contract Award'),
                notice('OP00481695',notice_status='Cancelled'),
                notice('OP00481696',noticedate='01-Jan-2017'),
                notice('OP00481697',noticedate='invalid')
            ]})
        provider=PublicSources(Settings(),transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        result=provider.search({'source_id':'worldbank_notices','query':'solar','since_days':90,'limit':10})
        self.assertEqual(requests[0].url.params['rows'],'10')
        self.assertEqual(requests[0].url.params['notice_type_exact'],'Invitation for Bids')
        self.assertEqual(len(result['records']),2)
        first=result['records'][0]
        self.assertEqual(first['entity_name'],'Energy Agency')
        self.assertEqual(first['procurement_status'],'expired')
        self.assertEqual(first['details']['published_procurement_email'],'bids@example.org')
        self.assertEqual(first['details']['project_country'],'Kenya')
        self.assertIsNone(result['records'][1]['entity_name'])
        self.assertEqual(result['total_reported'],120)
        self.assertIn('notice_not_published_invitation_for_bids',result['warnings'])
        self.assertIn('notice_outside_requested_date_range',result['warnings'])

    def test_gleif_request_and_identity_only_provenance(self):
        requests=[]
        def respond(request):
            requests.append(request)
            return httpx.Response(200,json=gleif_body())
        provider=PublicSources(Settings(),transport=httpx.MockTransport(respond))
        self.addCleanup(provider.close)
        result=provider.search({'source_id':'gleif','query':'Fixture','country':'DE','limit':2,'since_days':90})
        self.assertEqual(requests[0].url.params['filter[entity.legalName]'],'Fixture')
        self.assertEqual(requests[0].url.params['filter[entity.legalAddress.country]'],'DE')
        self.assertEqual(requests[0].url.params['filter[entity.category]'],'GENERAL')
        self.assertNotIn('authorization',requests[0].headers)
        self.assertEqual(result['records'][0]['details']['lei'],LEI)
        self.assertEqual(result['records'][0]['procurement_status'],'not_applicable')
        self.assertEqual(result['data_fee_milli_cny'],0)
        self.assertTrue(result['has_more'])

    def test_ted_date_filter_multi_buyer_and_deadline_review(self):
        requests=[]
        published=utcnow().date().isoformat()
        def respond(request):
            requests.append(json.loads(request.content))
            return httpx.Response(200,json={'totalNoticeCount':3,'timedOut':False,'notices':[
                {'publication-number':'12345-2026','publication-date':published,'notice-title':{'eng':['Lighting systems']},
                 'buyer-name':{'eng':['City Council']},'buyer-country':['DEU'],'notice-type':'cn-standard',
                 'deadline-receipt-tender-date-lot':['2020-01-01']},
                {'publication-number':'12346-2026','publication-date':published,'notice-title':{'eng':['Joint lighting tender']},
                 'buyer-name':{'eng':['Buyer A','Buyer B']}},
                {'publication-number':'325144-2017','publication-date':'2017-08-18+02:00','buyer-name':{'eng':['Old Buyer']}}
            ]})
        provider=PublicSources(Settings(),transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        result=provider.search({'source_id':'ted','query':'lighting','country':'DE','limit':10,'since_days':90})
        self.assertIn('publication-date >= ',requests[0]['query'])
        self.assertIn('buyer-country = DEU',requests[0]['query'])
        self.assertEqual(requests[0]['page'],1)
        self.assertEqual(len(result['records']),2)
        self.assertEqual(result['records'][0]['procurement_status'],'requires_deadline_and_eligibility_review')
        self.assertIsNone(result['records'][1]['entity_name'])
        self.assertIn('notice_outside_requested_date_range',result['warnings'])

    def test_companies_house_uses_basic_auth_and_keeps_key_out_of_result(self):
        def respond(request):
            self.assertTrue(request.headers['authorization'].startswith('Basic '))
            self.assertEqual(request.url.path,'/search/companies')
            return httpx.Response(200,json={'items':[{'company_number':'01234567','title':'Buyer Ltd',
                'company_status':'active','address':{'locality':'London'},'date_of_creation':'2020-01-01'}],
                'total_results':1})
        provider=PublicSources(Settings(companies_house_api_key='private-ch-key'),transport=httpx.MockTransport(respond))
        self.addCleanup(provider.close)
        result=provider.search({'source_id':'companies_house','query':'Buyer','limit':10})
        self.assertEqual(result['records'][0]['source_url'],
            'https://find-and-update.company-information.service.gov.uk/company/01234567')
        self.assertNotIn('private-ch-key',str(result))

    def test_errors_do_not_echo_provider_response_or_credentials(self):
        for status in (401,403,429,500):
            provider=PublicSources(Settings(),transport=httpx.MockTransport(
                lambda request:httpx.Response(status,json={'error':'private-key-value'})))
            self.addCleanup(provider.close)
            with self.assertRaises(ProviderError) as raised:
                provider.search({'source_id':'gleif','query':'Buyer','limit':10})
            self.assertNotIn('private-key-value',str(raised.exception))


class SourceAPITest(TestCase):
    setUp=test_service.ServiceTest.setUp
    register_and_login=test_service.ServiceTest.register_and_login

    def account(self):
        workspace,token=self.register_and_login('13800000000')
        return workspace,'/api/v1/workspaces/'+workspace,token

    def test_official_lookup_save_and_cache_without_model(self):
        workspace,root,token=self.account();requests=[]
        def respond(request):
            requests.append(request)
            return httpx.Response(200,json=gleif_body())
        provider=PublicSources(self.settings,transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        worker=Worker(self.sessions,self.settings,self.upstream,public_sources=provider)
        for index in range(2):
            job=self.client.post(root+'/sources/searches',headers={**token,'Idempotency-Key':f'source-{index}'},
                json={'source_id':'gleif','query':'Fixture','country':'DE','limit':2})
            self.assertEqual(job.status_code,202,job.text)
            worker.run_next()
        self.assertEqual(len(requests),1)
        self.assertEqual(self.upstream.calls,[])
        body={'job_id':job.json()['id'],'record_indices':[0]}
        saved=self.client.post(root+'/crm/prospects/from-source',headers=token,json=body)
        self.assertEqual(saved.status_code,200,saved.text)
        self.assertEqual(saved.json()['items'][0]['evidence']['evidence_type'],'entity_registration')
        self.assertEqual(saved.json()['items'][0]['contact'],'')
        self.assertEqual(self.client.post(root+'/crm/prospects/from-source',headers=token,json=body).json()['reused'],1)
        _,other_token=self.register_and_login('13800000001')
        self.assertEqual(self.client.post(root+'/crm/prospects/from-source',headers=other_token,json=body).status_code,404)

    def test_catalog_auth_configuration_and_validation(self):
        workspace,root,token=self.account()
        catalog=self.client.get(root+'/sources',headers=token).json()
        self.assertGreaterEqual(len(catalog),10)
        self.assertEqual(next(row for row in catalog if row['id']=='sam')['access'],'site_scoped_web_search')
        self.assertFalse(next(row for row in catalog if row['id']=='companies_house')['configured'])
        headers={**token,'Idempotency-Key':'source-1'}
        self.assertEqual(self.client.post(root+'/sources/searches',headers=headers,
            json={'source_id':'companies_house','query':'Buyer'}).status_code,503)
        self.assertEqual(self.client.post(root+'/sources/searches',headers=headers,
            json={'source_id':'unknown','query':'Buyer'}).status_code,422)
        self.assertEqual(self.client.post(root+'/sources/searches',headers=headers,
            json={'source_id':'ted','query':'lighting','country':'XX'}).status_code,422)
        self.assertEqual(self.client.post(root+'/sources/searches',headers=headers,
            json={'source_id':'worldbank_notices','query':'solar','country':'KE'}).status_code,422)
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],1000)

    def test_companies_house_fallback_is_real_official_site_search_and_disclosed(self):
        _,root,token=self.account()
        self.app.state.settings=replace(self.settings,llm_api_key='configured-model',tools_api_key='configured-search')
        catalog=self.client.get(root+'/sources',headers=token).json()
        source=next(row for row in catalog if row['id']=='companies_house')
        self.assertTrue(source['configured'])
        self.assertEqual(source['access'],'site_scoped_web_search')
        response=self.client.post(root+'/sources/searches',headers={**token,'Idempotency-Key':'company-web'},
            json={'source_id':'companies_house','query':'Siemens'})
        self.assertEqual(response.status_code,202,response.text)
        self.assertEqual(response.json()['operation'],'public_search')
        from app.db import Job
        with self.sessions() as session:
            job=session.get(Job,response.json()['id'])
            self.assertEqual(job.payload['source_domains'],['find-and-update.company-information.service.gov.uk'])

    def test_official_contact_selection_requires_saved_record_and_current_version(self):
        workspace,root,token=self.account()
        def respond(request):
            return httpx.Response(200,json={'total':'2','procnotices':[
                {'id':f'OP0048169{index}', 'notice_type':'Invitation for Bids', 'notice_status':'Published',
                 'noticedate':utcnow().date().strftime('%d-%b-%Y'), 'contact_organization':f'Agency {index}',
                 'contact_email':f'bids{index}@example.org', 'project_ctry_name':'Kenya',
                 'bid_description':'LED procurement'} for index in range(2)]})
        provider=PublicSources(self.settings,transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        job=self.client.post(root+'/sources/searches',headers={**token,'Idempotency-Key':'official-contact'},
            json={'source_id':'worldbank_notices','query':'LED'}).json()
        Worker(self.sessions,self.settings,self.upstream,public_sources=provider).run_next()
        saved=self.client.post(root+'/crm/prospects/from-source',headers=token,
            json={'job_id':job['id'],'record_indices':[0]}).json()['items'][0]
        self.assertEqual(saved['location'],'Kenya')
        self.assertEqual(saved['contact'],'')
        url=root+'/crm/prospects/'+saved['id']+'/apply-contact'
        body={'job_id':job['id'],'value':'bids1@example.org','expected_version':saved['version']}
        self.assertEqual(self.client.post(url,headers=token,json=body).status_code,422)
        body['value']='bids0@example.org'
        selected=self.client.post(url,headers=token,json=body)
        self.assertEqual(selected.status_code,200,selected.text)
        self.assertEqual(selected.json()['contact'],'bids0@example.org')
        self.assertEqual(selected.json()['evidence']['selected_contact']['verification_status'],'official_notice_unverified')
        self.assertEqual(self.client.post(url,headers=token,json=body).status_code,409)

    def test_global_official_daily_limit_refunds_unexecuted_lookup(self):
        workspace,root,token=self.account()
        settings=replace(self.settings,public_source_daily_call_limit=1)
        provider=PublicSources(settings,transport=httpx.MockTransport(lambda request:httpx.Response(200,json=gleif_body())))
        self.addCleanup(provider.close)
        worker=Worker(self.sessions,settings,self.upstream,public_sources=provider)
        for index in range(2):
            response=self.client.post(root+'/sources/searches',headers={**token,'Idempotency-Key':f'limit-{index}'},
                json={'source_id':'gleif','query':f'Buyer {index}'})
            worker.run_next()
        job=self.client.get(root+'/jobs/'+response.json()['id'],headers=token).json()
        self.assertEqual(job['error'],'open_source_daily_limit')
        self.assertEqual(job['points_charged'],0)
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],999)

    def test_site_search_filters_external_results(self):
        _,root,token=self.account()
        response=self.client.post(root+'/sources/searches',headers={**token,'Idempotency-Key':'sec-search'},
            json={'source_id':'sec','query':'LED investment'})
        self.assertEqual(response.status_code,202,response.text)
        Worker(self.sessions,self.settings,self.upstream).run_next()
        job=self.client.get(root+'/jobs/'+response.json()['id'],headers=token).json()
        self.assertEqual(job['result']['sources'],[])
        self.assertTrue(any(query.startswith('site:sec.gov ') for query in self.upstream.calls))

    def test_optional_ted_discovery_preserves_notice_type_without_claiming_demand(self):
        _,root,token=self.account()
        class ProcurementModel(test_service.FixtureDeepSeek):
            def complete(self,prompt,payload,max_tokens,scenario=None):
                if 'sources' in payload and 'lead' not in payload:
                    official=next(source for source in payload['sources'] if source.get('provider')=='ted')
                    return {'output':{'leads':[{'name':'City Council','location':'US','role':'public buyer',
                        'source_id':official['source_id'],'quote':'LED lighting procurement','demand':True}]}}
                response=super().complete(prompt,payload,max_tokens,scenario)
                if 'sources' not in payload:
                    response['output'].update(buyer_country='US',trade_product='LED lighting')
                return response
        def respond(request):
            return httpx.Response(200,json={'totalNoticeCount':1,'notices':[{'publication-number':'12345-2026',
                'publication-date':utcnow().date().isoformat(),'notice-title':{'eng':['LED lighting procurement']},
                'buyer-name':{'eng':['City Council']},'buyer-country':['USA'],'notice-type':'cn-standard'}]})
        provider=PublicSources(self.settings,transport=httpx.MockTransport(respond));self.addCleanup(provider.close)
        agent=self.client.post(root+'/agents',headers=token,json={'name':'Public buyers','instructions':'Find LED tenders',
            'public_sources':['ted'],'buyer_role':'public_buyer'}).json()
        job=self.client.post(root+'/agents/'+agent['id']+'/runs',headers=token).json()
        Worker(self.sessions,self.settings,ProcurementModel(),public_sources=provider).run_next()
        result=self.client.get(root+'/jobs/'+job['id'],headers=token).json()
        self.assertEqual(result['result']['leads'][0]['evidence_type'],'procurement_notice')
        self.assertEqual(result['result']['public_demand_count'],0)
        self.assertNotIn('paid_usage',result['result'])
