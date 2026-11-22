import json
from dataclasses import replace
from unittest import TestCase

import httpx

from app.deepseek import ProviderError
from app.hunter import Hunter
from app.provider_logging import observe_http
from app.worker import Worker
from app.db import ProviderCall
from sqlalchemy import select
import test_directory
import test_service


class HunterAdapterTest(TestCase):
    def adapter(self, responder):
        adapter = Hunter('hunter-secret', httpx.MockTransport(responder))
        self.addCleanup(adapter.close)
        return adapter

    def test_company_query_header_redaction_and_statuses(self):
        events = []
        def respond(request):
            self.assertEqual(request.headers['X-API-KEY'], 'hunter-secret')
            self.assertNotIn('api_key', request.url.params)
            self.assertEqual(request.url.params['limit'], '10')
            self.assertEqual(request.url.params['domain'], 'buyer.example')
            return httpx.Response(200, headers={'X-Credits-Used':'1','X-Credits-Unit':'credit'},
                json={'data':{'domain':'buyer.example','emails':[
                    {'value':'sales@buyer.example','verification':{'status':'accept_all','date':'2026-11-21'}},
                    {'value':'john@buyer.example','verification':{'status':'valid'}},
                    {'value':'FLast@buyer.example'}, {'value':'wrong@other.example'}]}})
        with observe_http(lambda event, data: events.append(data)):
            result = self.adapter(respond).contacts({'website':'https://www.buyer.example','name':'Buyer'})
        self.assertEqual([r['validity'] for r in result['records']], [3, 1])
        self.assertEqual(result['credits_used'], 1)
        self.assertIsNone(result['reported_milli_cny'])
        self.assertNotIn('hunter-secret', str(events))

    def test_person_uses_named_finder_not_company_directory(self):
        def respond(request):
            self.assertEqual(request.url.path, '/v2/email-finder')
            self.assertEqual(request.url.params['full_name'], 'Jane Buyer')
            self.assertEqual(request.url.params['company'], 'Buyer Ltd')
            return httpx.Response(200, json={'data':{'email':'jane@buyer.example',
                'verification':{'status':'valid'}}})
        result = self.adapter(respond).contacts({'namespace':'directory_person','record_id':'p1',
            'name':'Jane Buyer','company_name':'Buyer Ltd'})
        self.assertEqual(result['records'][0]['subject_id'], 'p1')
        self.assertEqual(result['records'][0]['company_match'], 'provider_name_match_requires_review')

    def test_errors_and_missing_anchor(self):
        for status, expected in [(401,'hunter_invalid_credentials'), (429,'hunter_quota_exhausted'),
                                 (503,'hunter_request_failed')]:
            adapter = self.adapter(lambda r: httpx.Response(status,json={'errors':[]}))
            with self.assertRaises(ProviderError) as caught:
                adapter.contacts({'name':'Buyer'})
            self.assertEqual(caught.exception.code, expected)
            self.assertEqual(caught.exception.unknown_charge, status >= 500)
        with self.assertRaises(ProviderError) as caught:
            self.adapter(lambda r: self.fail('must not call')).contacts({})
        self.assertEqual(caught.exception.code, 'hunter_identity_missing')


class HunterFallbackTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login
    account = test_directory.DirectoryTest.account
    submit = test_directory.DirectoryTest.submit
    finish = test_directory.DirectoryTest.finish
    search = test_directory.DirectoryTest.search

    def setup_fallback(self, primary_records=None):
        self.account()
        self.hunter_calls = []
        def respond(request):
            self.hunter_calls.append(request)
            return httpx.Response(200, headers={'X-Credits-Used':'1','X-Credits-Unit':'credit'},
                json={'data':{'domain':'buyer.example','emails':[
                    {'value':'sales@buyer.example','verification':{'status':'valid'}}]}})
        self.hunter = Hunter('secret', httpx.MockTransport(respond))
        self.addCleanup(self.hunter.close)
        self.worker = Worker(self.sessions, self.settings, test_service.FixtureDeepSeek(), self.adapter, hunter=self.hunter)
        if primary_records is not None:
            self.adapter.directory_contacts = lambda selected: {'source':'upkuajing',
                'records':primary_records,'kind':'contacts','subject':selected,'reported_milli_cny':0}
        company = self.search()
        self.selection = {'job_id': company['id'], 'record_id':'company-1','confirm_paid':True}

    def test_primary_hit_never_queries_hunter(self):
        self.setup_fallback()
        result = self.finish(self.submit('/directory/contacts', self.selection,'unlock'))
        self.assertFalse(self.hunter_calls)
        self.assertNotIn('hunter_fallback',result['result']['directory'])

    def test_empty_primary_fallback_and_cached_job(self):
        self.setup_fallback([])
        result = self.finish(self.submit('/directory/contacts', self.selection,'unlock'))
        evidence = result['result']['directory']
        self.assertEqual(evidence['source'], 'upkuajing+hunter')
        self.assertEqual(evidence['records'][0]['verification_source'],'hunter')
        self.assertEqual(evidence['hunter_fallback']['credits_used'],1)
        self.assertEqual(len(self.hunter_calls),1)
        cached = self.submit('/directory/contacts', self.selection,'again').json()
        self.assertEqual(cached['id'],result['id'])
        self.assertEqual(len(self.hunter_calls),1)
        logs = self.client.get(self.root+'/jobs/'+result['id']+'/provider-logs',headers=self.token).json()
        self.assertIn('hunter_contacts',[row['endpoint'] for row in logs])
        self.assertNotIn('secret',str(logs))

    def test_website_only_triggers_fallback_and_provides_domain(self):
        self.setup_fallback([{'channel':'websites','value':'https://buyer.example'}])
        result=self.finish(self.submit('/directory/contacts',self.selection,'unlock'))
        self.assertEqual(self.hunter_calls[0].url.params['domain'],'buyer.example')
        self.assertEqual(len(result['result']['directory']['records']),2)

    def test_phone_is_contact_and_invalid_email_is_not(self):
        for records, expected in [([{'channel':'phones','value':'+123456789','validity':0}],0),
                                  ([{'channel':'emails','value':'bad@buyer.example','validity':2}],1)]:
            from app.hunter import has_direct_contact
            self.assertEqual(has_direct_contact(records),not expected)

    def test_hunter_daily_limit_preserves_primary_result(self):
        self.setup_fallback([])
        self.worker.settings = replace(self.settings,hunter_daily_call_limit=0)
        result=self.finish(self.submit('/directory/contacts',self.selection,'unlock'))
        self.assertFalse(self.hunter_calls)
        self.assertEqual(result['result']['directory']['hunter_fallback']['error'],'hunter_daily_limit')

    def test_primary_failure_can_fall_back_without_losing_subject(self):
        self.setup_fallback([])
        def failed(selected):
            raise ProviderError('upkuajing_request_failed')
        self.adapter.directory_contacts = failed
        result=self.finish(self.submit('/directory/contacts',self.selection,'unlock'))
        evidence=result['result']['directory']
        self.assertEqual(evidence['subject']['record_id'],'company-1')
        self.assertEqual(evidence['kind'],'contacts')
        self.assertEqual(evidence['records'][0]['source'],'hunter')
        self.assertIn('upkuajing_request_failed',result['result']['warnings'])

    def test_budget_and_unknown_call_do_not_bypass_to_hunter(self):
        from app.worker import JobRun
        self.setup_fallback([])
        from types import SimpleNamespace
        job=SimpleNamespace(id='fake',workspace_id='workspace',operation='prospecting',
                            payload={'paid_budget_milli_cny':0})
        run=JobRun(self.worker,job)
        for code in ('enhancement_budget_exhausted','provider_call_requires_reconciliation'):
            def blocked(*args):
                raise ProviderError(code)
            run.call=blocked
            with self.assertRaises(ProviderError):
                run.contact_call('test','upkuajing_contacts',lambda _:None,{'name':'Buyer'})
        self.assertFalse(self.hunter_calls)
