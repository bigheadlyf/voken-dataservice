import json
from dataclasses import replace
from unittest import TestCase

import httpx

from app.db import Job
from app.upkuajing import Upkuajing
from app.worker import Worker
import test_chat
import test_service
from test_chat import call


class AcquisitionModel(test_service.FixtureDeepSeek):
    def complete(self, prompt, payload, max_tokens, scenario=None):
        if 'sources' not in payload:
            response = super().complete(prompt, payload, max_tokens, scenario)
            response['output'].update(buyer_country='US', trade_product='LED lamps', target_count=3)
            return response
        self.calls.append('model')
        sources = [source for source in payload['sources'] if source.get('candidate')]
        if not sources:
            return super().complete(prompt, payload, max_tokens, scenario)
        return {'output': {'leads': [
            {'name': source['candidate']['name'], 'location': 'US', 'source_id': source['source_id'],
             'reason': 'Matched LED lamp buyer', 'demand': True, 'quote': 'Buying LED products'}
            for source in sources]}}


class AcquisitionTest(TestCase):
    setUp = test_chat.ChatTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def configure(self, *, discovery_fee=150, timeout=False, daily_limit=20):
        self.calls = []
        self.settings = replace(self.settings, upkuajing_daily_call_limit=daily_limit)
        self.app.state.settings = self.settings
        self.app.state.customs_configured = True

        def respond(request):
            body = json.loads(request.content)
            self.calls.append((request.url.path, body))
            if request.url.path.endswith('/company/list'):
                data = {'list': [{'companyId': index, 'name': f'Buyer {index}',
                                  'countryInfo': {'code_iso2': 'US'}, 'productDesc': 'LED lamps'}
                                 for index in range(1, 4)]}
                fee = discovery_fee
            elif request.url.path.endswith('/trade/list'):
                if timeout:
                    raise httpx.ReadTimeout('fixture timeout')
                data = {'list': [{'uuid': f'trade-{body["buyerId"]}', 'buyer': f'Buyer {body["buyerId"]}',
                                  'productDesc': 'LED lamps'}]}
                fee = 150
            else:
                data = [{'companyId': body['companyIds'][0],
                         'emails': [{'val': 'buyer@example.com', 'is_valid': 1}]}]
                fee = 50
            return httpx.Response(200, json={'code': 0, 'data': data, 'fee': {'apiCost': fee}})

        adapter = Upkuajing('fixture-key', transport=httpx.MockTransport(respond))
        self.addCleanup(adapter.close)
        return Worker(self.sessions, self.settings, AcquisitionModel(), adapter)

    def start(self, tier='enhanced', key='run', confirm=True):
        return self.client.post(self.path + '/runs', headers={**self.token, 'Idempotency-Key': key},
                                json={'acquisition_tier': tier, 'confirm_paid': confirm})

    def result(self, job_id):
        return self.client.get(self.root + '/jobs/' + job_id, headers=self.token).json()

    def test_basic_and_legacy_runs_never_call_paid_provider(self):
        worker = self.configure()
        response = self.client.post(self.path + '/runs', headers=self.token)
        self.assertEqual(response.status_code, 202, response.text)
        self.assertEqual(response.json()['acquisition_tier'], 'basic')
        worker.run_next()
        self.assertEqual(self.calls, [])
        self.assertNotIn('paid_usage', self.result(response.json()['id'])['result'])

    def test_contact_priority_uses_unified_directory_and_keeps_plan_budget(self):
        worker = self.configure()
        subject = {'namespace':'directory_company','record_id':'pid-1','name':'Fixture, Buyer','country':'US'}
        worker.customs.directory_search = lambda filters: {'source':'upkuajing','records':[subject],
            'reported_milli_cny':0,'quota_usage':{'request_units':1,'record_units':1,'unlock_units':0}}
        worker.customs.directory_contacts = lambda selected: {'source':'upkuajing','subject':selected,
            'records':[{'channel':'emails','value':'sales@example.com','validity':1}], 'reported_milli_cny':0,
            'quota_usage':{'request_units':1,'record_units':1,'unlock_units':1}}
        response = self.client.post(self.path+'/runs', headers={**self.token,'Idempotency-Key':'contacts-first'},
            json={'acquisition_tier':'enhanced','enhancement_goal':'contacts','confirm_paid':True})
        self.assertEqual(response.status_code,202,response.text)
        self.assertEqual(self.start(key='contacts-first').status_code,409)
        worker.run_next()
        result = self.result(response.json()['id'])['result']
        self.assertEqual(self.calls,[])
        self.assertEqual(result['acquisition_summary']['companies_with_email'],1)
        self.assertEqual(result['paid_usage']['reported_milli_cny'],0)
        self.assertEqual(result['paid_usage']['budget_consumed_milli_cny'],2000)
        self.assertEqual(result['paid_usage']['quota_usage']['unlock_units'],1)
        self.assertEqual(result['leads'][0]['enrichment_status'],'contacts_returned')

    def test_contact_priority_does_not_unlock_ambiguous_company(self):
        worker = self.configure()
        worker.customs.directory_search = lambda filters: {'source':'upkuajing','reported_milli_cny':0,'records':[
            {'namespace':'directory_company','record_id':identifier,'name':'Fixture Buyer','country':'US'} for identifier in ('a','b')]}
        def unexpected(selected):
            self.fail('Ambiguous company must not be unlocked')
        worker.customs.directory_contacts = unexpected
        response = self.client.post(self.path+'/runs', headers={**self.token,'Idempotency-Key':'ambiguous'},
            json={'acquisition_tier':'enhanced','enhancement_goal':'contacts','confirm_paid':True})
        worker.run_next()
        result=self.result(response.json()['id'])['result']
        self.assertEqual(result['leads'][0]['enrichment_status'],'ambiguous_company')
        self.assertEqual(result['paid_usage']['calls'],1)

    def test_enhanced_authorization_availability_and_tier_idempotency(self):
        self.assertEqual(self.start(confirm=False).status_code, 409)
        self.assertEqual(self.start().status_code, 503)
        self.configure()
        submitted = self.start()
        self.assertEqual(submitted.status_code, 202, submitted.text)
        self.assertEqual(self.start().json()['id'], submitted.json()['id'])
        self.assertEqual(self.start(tier='basic').status_code, 409)
        with self.sessions() as session:
            payload = session.get(Job, submitted.json()['id']).payload
            self.assertEqual(payload['paid_budget_milli_cny'], 6000)
            self.assertEqual(payload['acquisition_tier'], 'enhanced')

    def test_enhanced_discovery_trade_contacts_and_demand_separation(self):
        worker = self.configure()
        get_contacts = worker.customs.get_buyer_contacts
        interrupted = False

        def interrupt_once(selected):
            nonlocal interrupted
            result = get_contacts(selected)
            if not interrupted:
                interrupted = True
                worker.shutdown.set()
            return result

        worker.customs.get_buyer_contacts = interrupt_once
        job = self.start().json()
        worker.run_next()
        self.assertEqual(self.result(job['id'])['status'], 'running')
        self.assertEqual(len(self.calls), 3)
        worker.shutdown.clear()
        worker.recover()
        worker.run_next()
        result = self.result(job['id'])['result']
        self.assertEqual(result['paid_usage']['committed_milli_cny'], 6000)
        self.assertEqual(result['paid_usage']['calls'], 6)
        self.assertFalse(result['paid_usage']['has_unconfirmed_cost'])
        self.assertEqual(result['public_demand_count'], 0)
        self.assertEqual(len(result['leads']), 3)
        self.assertEqual(sum(bool(lead.get('trade_evidence')) for lead in result['leads']), 2)
        self.assertTrue(all(lead['evidence_type'] == 'potential_match' for lead in result['leads']))
        self.assertTrue(all(lead.get('business_contacts') for lead in result['leads']))
        query = self.calls[0][1]
        self.assertNotIn('buyer', query)
        self.assertEqual(query['buyerCountryCodes'], ['US'])
        self.assertEqual(query['products'], ['LED lamps'])
        self.assertIn('dateStart', query)
        self.assertEqual(len(self.calls), 6)

    def test_actual_cost_and_global_limit_preserve_results(self):
        worker = self.configure(discovery_fee=450)
        job = self.start().json()
        worker.run_next()
        result = self.result(job['id'])['result']
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(result['paid_usage']['committed_milli_cny'], 6000)
        self.assertIn('enhancement_budget_exhausted', result['warnings'])
        self.assertEqual(len(result['leads']), 3)

    def test_daily_limit_keeps_public_and_discovered_candidates(self):
        worker = self.configure(daily_limit=1)
        job = self.start().json()
        worker.run_next()
        result = self.result(job['id'])['result']
        self.assertEqual(len(self.calls), 1)
        self.assertIn('upkuajing_daily_limit', result['warnings'])
        self.assertEqual(len(result['leads']), 3)

    def test_discovery_failure_falls_back_to_public_search(self):
        worker = self.configure()
        from app.deepseek import ProviderError

        def unavailable(_filters):
            raise ProviderError('upkuajing_balance_low')

        worker.customs.search_buyers = unavailable
        job = self.start().json()
        worker.run_next()
        result = self.result(job['id'])['result']
        self.assertIn('upkuajing_balance_low', result['warnings'])
        self.assertTrue(result['leads'])
        self.assertTrue(result['sources'][0]['url'])
        self.assertEqual(result['paid_usage']['calls'], 1)

    def test_timeout_reserves_unknown_cost_and_stops_enrichment(self):
        worker = self.configure(timeout=True)
        job = self.start().json()
        worker.run_next()
        result = self.result(job['id'])['result']
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(result['paid_usage']['committed_milli_cny'], 3000)
        self.assertTrue(result['paid_usage']['has_unconfirmed_cost'])
        self.assertEqual(len(result['leads']), 3)
        self.assertIn('upkuajing_response_unknown', result['warnings'])


class AcquisitionChatTest(TestCase):
    setUp = test_chat.ChatTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login
    model = test_chat.ChatTest.model
    send = test_chat.ChatTest.send
    def test_chat_choice_controls_real_task_and_cannot_be_overridden_by_model(self):
        self.app.state.customs_configured = True
        self.model(call('start_task'), {'reply': '已提交。'})
        turn = self.send('enhanced-chat', acquisition_tier='enhanced', confirm_paid=True).json()
        job = turn['tool_calls'][0]['result']
        self.assertEqual(job['acquisition_tier'], 'enhanced')
        self.assertEqual(self.app.state.chat_provider.payloads[0]['acquisition_tier'], 'enhanced')
        self.assertEqual(self.send('enhanced-chat', acquisition_tier='enhanced', confirm_paid=True).json(), turn)
        self.model(call('buyer_enrichment', action='search', buyer='Buyer', buyer_country='US', confirm_paid=True),
                   {'reply': '基础档未授权付费。'})
        denied = self.send('explicit-basic', acquisition_tier='basic', confirm_paid=True).json()
        self.assertEqual(denied['tool_calls'][0]['result']['error'], 'paid_confirmation_required')

    def test_enhanced_chat_reserves_budget_for_queued_task(self):
        self.app.state.customs_configured = True
        self.model(call('start_task'),
                   call('buyer_enrichment', action='search', buyer='Buyer', buyer_country='US', confirm_paid=True),
                   {'reply': '已提交增强任务，其他查询超出本条预算。'})
        turn = self.send('chat-budget', acquisition_tier='enhanced', confirm_paid=True).json()
        self.assertEqual(turn['tool_calls'][1]['result']['error'], 'enhancement_budget_exhausted')
