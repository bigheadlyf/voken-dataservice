from unittest import TestCase
from types import SimpleNamespace

from app.deepseek import ProviderError
from app.lead_review import apply_review, review_leads
from app.pipeline import collect_leads, verify_selected_sources


class LeadReviewTest(TestCase):
    def setUp(self):
        self.sources = [
            {'source_id': 0, 'url': 'https://directory.example/', 'title': 'Directory', 'content': 'A directory of firms.'},
            {'source_id': 1, 'url': 'https://buyer.example/', 'content':
             'Example Buyer LLC is a nickel alloy distributor based in the United States.'},
            {'source_id': 2, 'url': 'https://carrier.example/', 'content':
             'Example Carrier is a freight forwarder and does not buy nickel alloys.'}]
        self.output = {'leads': [{'name': 'Example Buyer LLC', 'location': 'US', 'source_id': 0,
                                'contact': 'invented@example.com', 'demand': True, 'quote': 'Invented'}]}

    def decision(self, **changes):
        return {'candidate_index': 0, 'source_id': 1,
            'quote': self.sources[1]['content'], 'role_fit': 'fit', 'role_quote': 'nickel alloy distributor',
            'product_fit': 'fit', 'product_quote': 'nickel alloy', 'country_fit': 'fit',
            'country_quote': 'United States', 'explanation': '有正文支持的美国渠道企业', **changes}

    def test_source_reassignment_recovers_observed_company_without_transferring_demand_or_email(self):
        self.assertEqual(collect_leads(self.output, self.sources, 5), [])
        reviewed, audit = apply_review(self.output, self.sources, [self.decision()])
        leads = collect_leads(reviewed, self.sources, 5)
        self.assertEqual(len(leads), 1)
        self.assertEqual(audit['source_reassignments'], 1)
        self.assertIsNone(leads[0]['contact'])
        self.assertEqual(leads[0]['evidence_type'], 'potential_match')
        self.assertEqual(leads[0]['assessment']['country_fit'], 'fit')
        self.assertEqual(self.output['leads'][0]['source_id'], 0)

    def test_fabricated_quotes_unknown_country_and_invalid_ids_cannot_authorize_changes(self):
        for decision in [self.decision(quote='invented quote'), self.decision(source_id=99),
                         self.decision(source_id=True), self.decision(source_id=0), self.decision(candidate_index=9)]:
            reviewed, audit = apply_review(self.output, self.sources, [decision])
            self.assertEqual(audit['assessed'], 0)
            self.assertEqual(reviewed['leads'][0]['source_id'], 0)
        reviewed, _ = apply_review(self.output, self.sources, [self.decision(country_quote='Not in source')])
        self.assertEqual(reviewed['leads'][0]['assessment']['country_fit'], 'unknown')

    def test_quote_backed_logistics_rejection_and_auditable_exclusion(self):
        output = {'leads': [{'name': 'Example Carrier', 'source_id': 2}]}
        reviewed, audit = apply_review(output, self.sources, [self.decision(source_id=2,
            quote=self.sources[2]['content'], role_fit='not_fit', role_quote='freight forwarder',
            product_fit='unknown', product_quote='', country_fit='unknown', country_quote='')])
        self.assertEqual(reviewed['leads'], [])
        self.assertEqual(audit['excluded'][0]['axes'], ['role'])
        self.assertEqual(audit['excluded'][0]['source_url'], 'https://carrier.example/')

    def test_missing_or_unrelated_name_cannot_be_reassigned_even_with_exact_quote(self):
        self.output['leads'][0]['name'] = 'A Different Company'
        reviewed, audit = apply_review(self.output, self.sources, [self.decision()])
        self.assertEqual(audit['assessed'], 0)
        self.assertEqual(reviewed['leads'][0]['source_id'], 0)

    def test_duplicate_decision_cannot_reverse_a_prior_exclusion(self):
        reviewed, audit = apply_review(self.output, self.sources,
            [self.decision(role_fit='not_fit'), self.decision()])
        self.assertEqual(audit['assessed'], 1)
        self.assertEqual(reviewed['leads'], [])

    def test_model_failure_keeps_extraction_and_drops_untrusted_assessment(self):
        def failure(*args):
            raise ProviderError('deepseek_read_timeout')
        run = SimpleNamespace(result={}, call=failure, provider=SimpleNamespace(complete=None))
        self.output['leads'][0]['assessment'] = {'country_fit': 'fit', 'fabricated': True}
        result = review_leads(run, {'input': {}, 'sources': self.sources}, self.output)
        self.assertEqual(result['leads'][0]['source_id'], 0)
        self.assertNotIn('assessment', result['leads'][0])
        self.assertEqual(run.result['lead_review']['status'], 'unavailable')

    def test_review_limits_context_to_named_sources_and_uses_analysis_model(self):
        calls = []
        def call(step, endpoint, func, prompt, payload, tokens, scenario):
            calls.append((payload, scenario))
            return {'output': {'decisions': [self.decision()]}}
        run = SimpleNamespace(result={}, call=call, provider=SimpleNamespace(complete=None))
        reviewed = review_leads(run, {'input': {}, 'sources': self.sources}, self.output)
        self.assertEqual(calls[0][1], 'analysis')
        self.assertEqual([s['source_id'] for s in calls[0][0]['sources']], [1])
        self.assertEqual(reviewed['leads'][0]['source_id'], 1)

    def test_candidate_body_reuses_returned_text_within_cap_without_fetch(self):
        sources = [
            {'source_id': 0, 'url': 'https://example.org/', 'title': 'Example Buyer',
             'content': 'Example Buyer sells nickel alloys.'},
            {'source_id': 1, 'url': 'https://unrelated.org/', 'content': 'Unrelated article'},
            {'source_id': 2, 'url': 'https://directory.org/company', 'title': 'Example Buyer LLC'}]
        output = {'leads': [{'name': 'Example Buyer LLC', 'source_id': 0, 'quote': 'sells nickel alloys.'}]}
        run = SimpleNamespace(settings=SimpleNamespace(fetch_calls_per_job=2),
            retrieved_body_pool={'https://directory.org/company': 'Example Buyer LLC is a nickel alloy distributor.'})
        self.assertTrue(verify_selected_sources(run, sources, output, 1))
        self.assertEqual(sum(bool(s.get('content')) for s in sources), 2)
        self.assertNotIn('content', sources[1])
        self.assertIn('Example Buyer LLC', sources[2]['content'])
