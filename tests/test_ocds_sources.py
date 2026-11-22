import json
from unittest import TestCase

import httpx

from app.config import Settings
from app.public_sources import PublicSources


def release(identifier='000123-2026', **changes):
    return {'id': identifier, 'ocid': 'ocds-test-'+identifier, 'tag': ['tender'],
        'date': '2026-11-20T12:00:00Z', 'buyer': {'id': 'buyer-1', 'name': 'City Council'},
        'parties': [{'id': 'buyer-1', 'name': 'City Council', 'roles': ['buyer'],
            'contactPoint': {'email': 'bids@example.org'}},
            {'id': 'supplier', 'name': 'Winning Supplier', 'roles': ['supplier'],
             'contactPoint': {'email': 'supplier@example.com'}}],
        'tender': {'title': 'LED lighting', 'description': 'Supply of LED lighting', 'status': 'active',
            'tenderPeriod': {'endDate': '2020-01-01T12:00:00Z'},
            'contractPeriod': {'endDate': '2099-01-01T12:00:00Z'}, 'value': {'amount': 0, 'currency': 'GBP'}}, **changes}


class OCDSTest(TestCase):
    def lookup(self, releases, **values):
        self.requests = []
        def respond(request):
            self.requests.append(request)
            return httpx.Response(200, json={'releases': releases, 'links': {'next': 'https://untrusted.example/next'}})
        provider = PublicSources(Settings(), transport=httpx.MockTransport(respond))
        self.addCleanup(provider.close)
        return provider.search({'source_id': 'find_tender', 'query': 'LED lighting', 'limit': 2, 'since_days': 3, **values})

    def test_buyer_email_only_expired_tender_deadline_and_bounded_scope(self):
        result = self.lookup([release(), release('000124-2026', tender={'title': 'Unrelated furniture'})])
        row = result['records'][0]
        self.assertEqual(row['entity_name'], 'City Council')
        self.assertEqual(row['details']['published_procurement_email'], 'bids@example.org')
        self.assertEqual(row['procurement_status'], 'expired')
        self.assertEqual(row['details']['value']['amount'], 0)
        self.assertEqual(row['details']['deadline_dates'], ['2020-01-01'])
        self.assertEqual(result['scanned_count'], 2)
        self.assertEqual(result['matched_in_page'], 1)
        self.assertIsNone(result['total_reported'])
        self.assertTrue(result['has_more'])
        self.assertEqual(len(self.requests), 1)
        self.assertEqual(self.requests[0].url.params['limit'], '100')
        self.assertIn('updatedFrom', self.requests[0].url.params)
        self.assertNotIn('query', self.requests[0].url.params)

    def test_awards_are_historical_and_ambiguous_buyers_never_adopt_supplier_email(self):
        award = release(tag=['award'], parties=[{'name': 'Supplier', 'roles': ['supplier'],
            'contactPoint': {'email': 'supplier@example.com'}}])
        self.assertEqual(self.lookup([award])['records'], [])
        row = self.lookup([award], procurement_stage='award')['records'][0]
        self.assertEqual(row['procurement_status'], 'historical_award')
        self.assertIsNone(row['details']['published_procurement_email'])
        ambiguous = release(buyer={}, parties=[{'name': 'A', 'roles': ['buyer']}, {'name': 'B', 'roles': ['buyer']}])
        self.assertIsNone(self.lookup([ambiguous])['records'][0]['entity_name'])

    def test_contracts_finder_uses_publication_window_and_deduplicates_releases(self):
        result = self.lookup([release(), release()], source_id='contracts_finder')
        self.assertEqual(len(result['records']), 1)
        self.assertIn('publishedFrom', self.requests[0].url.params)
        self.assertNotIn('updatedFrom', self.requests[0].url.params)
        self.assertEqual(self.requests[0].url.host, 'www.contractsfinder.service.gov.uk')
        self.assertIn('/Published/Notice/releases/', result['records'][0]['source_url'])
