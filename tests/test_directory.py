import json
from dataclasses import replace
from unittest import TestCase

import httpx

from app.db import DirectoryRequest, ProviderCall
from app.upkuajing import Upkuajing, evidence_result
from app.worker import Worker
import test_service


class DirectoryTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def account(self):
        workspace, self.token = self.register_and_login('13800000000')
        self.root = '/api/v1/workspaces/'+workspace
        self.settings = replace(self.settings, upkuajing_daily_call_limit=50)
        self.app.state.settings = self.settings
        self.app.state.customs_configured = True
        self.calls = []

        def respond(request):
            payload = json.loads(request.content)
            self.calls.append((request.url.path, payload))
            if request.url.path.endswith('/search/company/list'):
                data = {'cursor': None if payload.get('cursor') else 'page-2', 'list': [
                    {'pid': 'company-1', 'company_name': 'Buyer Ltd', 'country_code': 'US',
                     'addresses': [{'address': 'One Street'}], 'email_num': 2}]}
            elif request.url.path.endswith('/search/person/list'):
                data = {'list': [{'hid': 'person-1', 'pid': 'company-1', 'human_name': 'Jane Buyer',
                    'company_name': 'Buyer Ltd', 'title_names': ['Purchasing Manager'], 'country_code': 'CA'}]}
            elif request.url.path.endswith('/search/contact/batch'):
                data = {'list': [{'bus_id': payload['bus_ids'][0], 'bus_type': payload['bus_type'],
                    'contact_data': {'emails': [{'val': 'jane@example.com', 'is_valid': 1, 'reason': 'provider check'}],
                                     'phones': [{'val': '+123456789', 'is_ws': 2}]}}]}
            else:
                data = {'cursor': 'next-trade', 'list': [{'uuid': 'trade-1', 'buyer': 'Buyer Ltd',
                    'buyerCompanyId': 42, 'productDesc': 'FOOD PAN', 'quantity': 10, 'quantityUnit': 'CTN'}]}
            return httpx.Response(200, json={'code': 0, 'data': data, 'fee': {'apiCost': 0},
                'usage': {'billingMode': 'PLAN', 'request': {'used': 1}, 'records': [{'used': 2}], 'unlocks': []}})

        self.adapter = Upkuajing('test', transport=httpx.MockTransport(respond))
        self.addCleanup(self.adapter.close)
        self.worker = Worker(self.sessions, self.settings, test_service.FixtureDeepSeek(), self.adapter)

    def submit(self, suffix, payload, key='query'):
        return self.client.post(self.root+suffix, headers={**self.token, 'Idempotency-Key': key}, json=payload)

    def finish(self, response):
        self.assertEqual(response.status_code, 202, response.text)
        self.worker.run_next()
        row = self.client.get(self.root+'/jobs/'+response.json()['id'], headers=self.token).json()
        self.assertEqual(row['status'], 'succeeded', row)
        return row

    def search(self):
        return self.finish(self.submit('/directory/searches', {'company_name': 'Buyer', 'country': 'US', 'confirm_paid': True}))

    def test_selection_namespaces_contacts_persistence_and_cache_binding(self):
        self.account()
        company = self.search()
        self.assertEqual(company['result']['directory']['records'][0]['namespace'], 'directory_company')
        people = self.finish(self.submit('/directory/searches', {'kind': 'people', 'company_match_job_id': company['id'],
            'company_record_id': 'company-1', 'titles': ['purchasing'], 'confirm_paid': True}, 'people'))
        self.assertEqual(self.calls[-1][1]['pids'], ['company-1'])
        person = people['result']['directory']['records'][0]
        self.assertEqual(person['country'], 'CA')  # Never replace a person's country with the employer's.
        self.assertTrue(person['title_match'])
        unlocked = self.finish(self.submit('/directory/contacts', {'job_id': people['id'], 'record_id': 'person-1', 'confirm_paid': True}, 'unlock'))
        self.assertEqual(self.calls[-1][1], {'bus_type': 2, 'bus_ids': ['person-1']})
        self.assertEqual(unlocked['result']['directory']['records'][0]['verification_source'], 'upkuajing')
        again = self.submit('/directory/contacts', {'job_id': people['id'], 'record_id': 'person-1', 'confirm_paid': True}, 'alias')
        self.assertEqual(again.json()['id'], unlocked['id'])
        self.assertEqual(self.submit('/directory/searches', {'company_name': 'Different', 'confirm_paid': True}, 'alias').status_code, 409)
        prospect = self.client.post(self.root+'/directory/save-company', headers=self.token,
            json={'job_id': company['id'], 'record_id': 'company-1'}).json()['prospect_id']
        body = {'job_id': unlocked['id'], 'prospect_id': prospect, 'confirm_company_match': True}
        saved = self.client.post(self.root+'/directory/saved-contacts', headers=self.token, json=body)
        self.assertEqual(saved.status_code, 200, saved.text)
        adopted=self.client.get(self.root+'/crm/prospects/'+prospect,headers=self.token).json()
        self.assertEqual(adopted['contact'],'jane@example.com')
        self.assertEqual(self.client.post(self.root+'/directory/saved-contacts', headers=self.token, json=body).json()['id'], saved.json()['id'])
        self.assertEqual(len(self.client.get(self.root+'/directory/saved-contacts/'+prospect, headers=self.token).json()), 1)

    def test_pagination_preserves_filters_and_requires_owned_finished_parent(self):
        self.account()
        first = self.search()
        second = self.finish(self.submit('/directory/searches', {'continuation_job_id': first['id'], 'confirm_paid': True}, 'next'))
        self.assertEqual(self.calls[-1][1]['cursor'], 'page-2')
        self.assertEqual(self.calls[-1][1]['companyNames'], ['Buyer'])
        self.assertFalse(second['result']['directory']['has_more'])
        self.assertEqual(self.submit('/directory/searches', {'continuation_job_id': second['id'], 'confirm_paid': True}, 'end').status_code, 409)
        self.assertEqual(self.submit('/directory/searches', {'continuation_job_id': first['id'], 'country': 'CA', 'confirm_paid': True}, 'changed').status_code, 422)
        other, token = self.register_and_login('13800000001')
        response = self.client.post('/api/v1/workspaces/'+other+'/directory/contacts', headers={**token, 'Idempotency-Key': 'foreign'},
            json={'job_id': first['id'], 'record_id': 'company-1', 'confirm_paid': True})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.submit('/directory/contacts', {'job_id': first['id'], 'record_id': '42', 'confirm_paid': True}, 'wrong-namespace').status_code, 404)

    def test_trade_product_search_without_buyer_and_pagination(self):
        self.account()
        first = self.finish(self.submit('/directory/trades', {'product': 'food pan', 'origin_country': 'CN',
            'arrival_country': 'US', 'date_start': '2025-11-21', 'date_end': '2026-11-20', 'confirm_paid': True}, 'trade'))
        payload = self.calls[-1][1]
        self.assertNotIn('buyer', payload)
        self.assertEqual(payload['originCountryCodes'], ['CN'])
        self.assertEqual(first['result']['customs']['records'][0]['quantity_unit'], 'CTN')
        self.assertEqual(first['result']['customs']['records'][0]['buyer_company_id'], 42)
        self.finish(self.submit('/directory/trades', {'continuation_job_id': first['id'], 'confirm_paid': True}, 'trade-next'))
        self.assertEqual(self.calls[-1][1]['cursor'], 'next-trade')

    def test_confirmation_anchor_and_idempotency_are_required(self):
        self.account()
        self.assertEqual(self.submit('/directory/searches', {'country': 'US', 'confirm_paid': True}).status_code, 422)
        self.assertEqual(self.submit('/directory/searches', {'company_name': 'Buyer', 'confirm_paid': False}).status_code, 422)
        response = self.client.post(self.root+'/directory/searches', headers=self.token,
            json={'company_name': 'Buyer', 'confirm_paid': True})
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.calls, [])

    def test_quota_and_cash_are_separate(self):
        self.account()
        job = self.search()
        evidence = job['result']['directory']
        self.assertEqual(evidence['reported_milli_cny'], 0)
        self.assertEqual(evidence['quota_usage']['record_units'], 2)
        self.assertEqual(job['points_charged'], 1)
        self.assertEqual(job['point_cost'], 151)


class DiscoveryReviewTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def test_preview_feedback_exclusion_and_profile_isolation(self):
        workspace, token = self.register_and_login('13800000000')
        root = '/api/v1/workspaces/'+workspace
        worker = Worker(self.sessions, self.settings, test_service.FixtureDeepSeek())
        config = {'name': 'LED preview', 'market': 'US', 'product': 'LED', 'instructions': 'Find LED buyers'}
        def preview(key, body=config):
            response = self.client.post(root+'/discovery/preview', headers={**token, 'Idempotency-Key': key}, json=body)
            self.assertEqual(response.status_code, 202, response.text)
            self.assertIsNone(response.json()['agent_id'])
            worker.run_next()
            return self.client.get(root+'/jobs/'+response.json()['id'], headers=token).json()
        first = preview('first')
        self.assertEqual(len(first['result']['leads']), 1)
        feedback = self.client.post(root+'/discovery/feedback', headers=token,
            json={'job_id': first['id'], 'lead_index': 0, 'verdict': 'not_fit'})
        self.assertEqual(feedback.status_code, 200, feedback.text)
        self.assertEqual(len(preview('second')['result']['leads']), 0)
        self.assertEqual(len(preview('different', {**config, 'market': 'CA'})['result']['leads']), 1)
        self.assertEqual(len(self.client.get(root+'/jobs/'+first['id'], headers=token).json()['result']['leads']), 1)
        excluded = preview('excluded-domain', {**config, 'exclude_domains': ['example.com']})
        self.assertEqual(excluded['result']['sources'], [])
