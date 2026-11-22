import json
from dataclasses import replace
from unittest import TestCase

import httpx

from app.hunter import Hunter
from app.worker import Worker
import test_directory
import test_service
import test_acquisition


class TargetedContactsTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login
    account = test_directory.DirectoryTest.account
    submit = test_directory.DirectoryTest.submit
    finish = test_directory.DirectoryTest.finish

    def setup_search(self, empty_first=False):
        self.account()
        self.settings = replace(self.settings, hunter_api_key='configured')
        self.app.state.settings = self.settings
        self.hunter_calls = []
        def respond(request):
            self.hunter_calls.append(dict(request.url.params))
            emails = [] if empty_first and len(self.hunter_calls) == 1 else [
                {'value':'jane@buyer.example','first_name':'Jane','last_name':'Buyer',
                 'position':'Purchasing Manager','department':'procurement',
                 'verification':{'status':'accept_all'}}]
            return httpx.Response(200,headers={'X-Credits-Used':str(bool(emails)*1),'X-Credits-Unit':'credit'},
                json={'data':{'domain':'buyer.example','emails':emails}})
        self.hunter=Hunter('secret',httpx.MockTransport(respond))
        self.addCleanup(self.hunter.close)
        self.worker=Worker(self.sessions,self.settings,test_service.FixtureDeepSeek(),None,hunter=self.hunter)
        self.payload={'company_name':'Buyer Ltd','website':'https://buyer.example',
                      'confirm_paid':True,'confirm_company_match':True}

    def test_department_search_bypasses_primary_and_reuses_job(self):
        self.setup_search()
        result=self.finish(self.submit('/directory/targeted-contacts',self.payload,'targeted'))
        self.assertEqual(result['operation'],'targeted_contacts')
        self.assertEqual(self.calls,[])
        self.assertEqual(self.hunter_calls[0]['department'],'procurement')
        self.assertEqual(self.hunter_calls[0]['required_field'],'full_name,position')
        contact=result['result']['directory']['records'][0]
        self.assertEqual(contact['role_match'],'keyword_or_department_match')
        self.assertEqual(contact['validity'],3)
        cached=self.submit('/directory/targeted-contacts',self.payload,'new-key').json()
        self.assertEqual(cached['id'],result['id'])
        self.assertEqual(len(self.hunter_calls),1)
        changed=self.submit('/directory/targeted-contacts',{**self.payload,'contact_target':'sales'},'targeted')
        self.assertEqual(changed.status_code,409)

    def test_empty_department_tries_job_titles_once(self):
        self.setup_search(empty_first=True)
        result=self.finish(self.submit('/directory/targeted-contacts',self.payload,'targeted'))
        self.assertEqual(len(self.hunter_calls),2)
        self.assertIn('Purchasing',self.hunter_calls[1]['job_titles'])
        self.assertEqual(result['result']['directory']['credits_used'],1)

    def test_confirmation_domain_and_tenant_boundaries(self):
        self.setup_search()
        for changes in [{'confirm_paid':False},{'confirm_company_match':False},
                        {'website':'http://user:pass@buyer.example'}, {'contact_titles':['a,b']}]:
            self.assertEqual(self.submit('/directory/targeted-contacts',{**self.payload,**changes},'bad').status_code,422)
        self.assertEqual(self.client.post(self.root+'/directory/targeted-contacts',headers=self.token,
            json=self.payload).status_code,422)
        self.assertEqual(self.submit('/directory/targeted-contacts',{'prospect_id':'0'*32,
            'confirm_paid':True,'confirm_company_match':True},'missing').status_code,404)
        self.assertFalse(self.hunter_calls)

    def test_custom_titles_and_saved_candidate(self):
        self.setup_search()
        payload={**self.payload,'contact_titles':['Purchasing Manager']}
        result=self.finish(self.submit('/directory/targeted-contacts',payload,'custom'))
        self.assertEqual(self.hunter_calls[0]['job_titles'],'Purchasing Manager')
        self.assertNotIn('department',self.hunter_calls[0])
        quotes=self.client.get(self.root+'/points/quotes',headers=self.token).json()
        self.assertEqual(quotes['targeted_contacts']['data_budget_milli_cny'],340)
        self.assertEqual(quotes['prospecting_ai_enhanced']['data_budget_milli_cny'],7000)

    def test_non_target_roles_are_never_counted_as_procurement(self):
        self.setup_search()
        self.hunter.targeted_contacts=lambda selected: {'records':[{'channel':'emails',
            'value':'sales@buyer.example','position':'Sales Manager','department':'sales','validity':1}],
            'credits_used':None,'reported_milli_cny':None}
        result=self.finish(self.submit('/directory/targeted-contacts',self.payload,'non-target'))
        self.assertEqual(result['result']['coverage'],'no_target_matches')
        data=result['result']['directory']
        self.assertEqual(data['matched_contact_count'],0)
        self.assertEqual(data['records'][0]['role_match'],'needs_review')
        self.assertIsNone(data['credits_used'])
        self.assertEqual(len(data['queries']),2)

    def test_saved_company_search_and_candidate_adoption(self):
        self.setup_search()
        imported=self.client.post(self.root+'/crm/prospects/import',headers=self.token,
            json={'items':[{'name':'Buyer Ltd','location':'US','website':'https://buyer.example','contact':'',
                            'source_note':'Synthetic test company'}]})
        self.assertEqual(imported.status_code,200,imported.text)
        prospect=self.client.get(self.root+'/crm/prospects',headers=self.token).json()['items'][0]
        payload={'prospect_id':prospect['id'],'confirm_paid':True,'confirm_company_match':True}
        result=self.finish(self.submit('/directory/targeted-contacts',payload,'saved'))
        adopted=self.client.post(self.root+'/crm/workbench/candidates',headers=self.token,
            json={'job_id':result['id'],'prospect_id':prospect['id'],'confirm_company_match':True})
        self.assertEqual(adopted.status_code,201,adopted.text)
        self.assertEqual(adopted.json()['data']['channels'][0]['source'],'hunter')
        unchanged=self.client.get(self.root+'/crm/prospects/'+prospect['id'],headers=self.token).json()
        self.assertEqual(unchanged['contact'],'')


class AITierTest(TestCase):
    setUp=test_acquisition.AcquisitionTest.setUp
    register_and_login=test_service.ServiceTest.register_and_login
    configure=test_acquisition.AcquisitionTest.configure
    start=test_acquisition.AcquisitionTest.start
    result=test_acquisition.AcquisitionTest.result

    def test_ai_tier_keeps_primary_and_enhances_two_companies(self):
        worker=self.configure()
        self.settings=replace(self.settings,hunter_api_key='configured')
        self.app.state.settings=self.settings
        worker.settings=self.settings
        class TargetHunter:
            def resolve_company(self, selected):
                return {'records':[{'company_name':selected['name'],'domain':'buyer.example'}],
                        'credits_used':0,'reported_milli_cny':None}
            def targeted_contacts(self, selected):
                return {'records':[{'channel':'emails','value':'purchasing@buyer.example',
                    'department':'procurement','position':'Purchasing Manager','validity':1}],
                    'credits_used':1,'reported_milli_cny':None}
        worker.hunter=TargetHunter()
        response=self.start(tier='ai_enhanced',key='ai-role')
        self.assertEqual(response.status_code,202,response.text)
        worker.run_next()
        result=self.result(response.json()['id'])
        self.assertEqual(result['acquisition_tier'],'ai_enhanced')
        self.assertEqual(result['result']['paid_usage']['budget_milli_cny'],7000)
        self.assertEqual(sum('targeted_contacts' in lead for lead in result['result']['leads']),2)
        self.assertEqual(result['result']['paid_usage']['hunter_credits'],2)
        self.assertTrue(all(any(r['value']=='buyer@example.com' for r in lead['business_contacts']['records'])
            for lead in result['result']['leads']))

    def test_ai_tier_requires_hunter_and_confirmation(self):
        self.configure()
        self.assertEqual(self.start(tier='ai_enhanced',confirm=False).status_code,409)
        self.assertEqual(self.start(tier='ai_enhanced',key='no-hunter').status_code,503)
