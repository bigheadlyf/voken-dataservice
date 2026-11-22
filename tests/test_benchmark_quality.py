"""Regressions for country attribution, raw trade fields and contact pollution."""
import unittest

import httpx

from app.public_contacts import candidates, observed_emails
from app.upkuajing import Upkuajing


class BenchmarkQualityTest(unittest.TestCase):
    def test_directory_email_formats_and_search_snippets_are_not_contacts(self):
        self.assertEqual(observed_emails('Format FLast@example.com; first.last@example.com; sales@example.com'),
                         ['sales@example.com'])
        self.assertEqual(candidates([
            {'source_id': 0, 'evidence_status': 'summary_only', 'observed_emails': ['person@example.com']},
            {'source_id': 1, 'observed_emails': ['FLast@example.com']},
        ]), [])

    def adapter(self, rows):
        adapter = Upkuajing('test', transport=httpx.MockTransport(lambda request:
            httpx.Response(200, json={'code': 0, 'data': {'list': rows}})))
        self.addCleanup(adapter.close)
        return adapter

    def test_requested_country_never_becomes_observed_country(self):
        adapter = self.adapter([
            {'companyId': 1, 'name': 'US firm', 'countryCode': 'US'},
            {'companyId': 2, 'name': 'Foreign firm', 'countryCode': 'JP'},
            {'companyId': 3, 'name': 'Unknown firm'},
            {'companyId': 4, 'name': 'Legacy firm', 'countryInfo': {'code_iso2': 'US'}},
        ])
        result = adapter.search_buyers({'buyer': 'firm', 'buyer_country': 'US'})['records']
        self.assertEqual([row['company_id'] for row in result], [1, 3, 4])
        self.assertEqual(result[0]['buyer_country'], 'US')
        self.assertIsNone(result[1]['buyer_country'])
        self.assertEqual(result[1]['country_verification'], 'unknown')
        self.assertEqual(result[1]['requested_buyer_country'], 'US')

    def test_trade_units_route_nulls_and_zero_are_preserved(self):
        adapter = self.adapter([
            {'uuid': 'a', 'productHscode': '732393', 'buyerCountryCode': 'MX',
             'originCountryCode': 'CO', 'arrivalCountryCode': 'US',
             'quantity': 300, 'quantityUnit': 'CARTONS', 'amount': 0, 'amountUnit': '',
             'weight': 0, 'price': True},
            {'uuid': 'a', 'quantity': 999},
            {'uuid': 'b', 'productHscode': None, 'quantity': 47, 'quantityUnit': None},
        ])
        records = adapter.verify_trades({'buyer': 'Buyer', 'buyer_country': 'MX',
            'date_start': '2026-01-01', 'date_end': '2026-11-20', 'product': 'food pan'})['records']
        self.assertEqual(len(records), 2)
        first, second = records
        self.assertEqual(first['quantity'], 300)
        self.assertEqual(first['quantity_unit'], 'CARTONS')
        self.assertEqual(first['amount'], 0)
        self.assertIsNone(first['amount_unit'])
        self.assertIsNone(first['price'])
        self.assertEqual((first['origin_country'], first['arrival_country']), ('CO', 'US'))
        self.assertEqual(first['hs_codes'], ['732393'])
        self.assertEqual(second['hs_codes'], [])
        self.assertIsNone(second['quantity_unit'])

    def test_contact_search_excludes_legal_and_recruitment_noise(self):
        def source(identifier, url, *emails):
            return {'source_id': identifier, 'url': url, 'observed_emails': list(emails)}
        result = candidates([
            source(0, 'https://www.courtlistener.com/docket/123/feed/', 'clerk@court.gov'),
            source(1, 'https://example.com/Career', 'person@example.com'),
            source(2, 'https://example.com/contact', 'employment@example.com', 'sales@example.com',
                   'quality@example.com', 'purchasing@example.com', 'jane@example.com'),
            source(3, 'https://example.com/about', 'SALES@example.com'),
        ])
        self.assertEqual([row['value'] for row in result], ['sales@example.com', 'quality@example.com',
            'purchasing@example.com', 'jane@example.com'])
        self.assertEqual([row['contact_role'] for row in result], ['general_business', 'quality_support',
            'procurement_role_unverified', 'unknown'])
        self.assertTrue(all(row['deliverability'] == 'not_checked' for row in result))
        self.assertTrue(all(row['company_match'] == 'requires_review' for row in result))
