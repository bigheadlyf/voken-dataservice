from datetime import timedelta
from unittest import TestCase

from app.db import utcnow
from app.pipeline import collect_leads


class EvidenceDateTest(TestCase):
    def test_expired_undated_and_future_signals_are_distinct(self):
        for delta,expected in [(-1,'expired'),(0,'deadline_today_time_unknown'),(7,'dated_future_deadline')]:
            deadline=(utcnow().date()+timedelta(days=delta)).isoformat()
            quote='Submission deadline: '+deadline
            source={'url':'https://buyer.example/tender','title':'Buyer','source_id':0,'content':'Buying LED products. '+quote}
            item={'name':'Buyer','source_id':0,'quote':'Buying LED products','demand':True,
                  'deadline_date':deadline,'deadline_quote':quote}
            lead=collect_leads({'leads':[item]},[source],1)[0]
            self.assertEqual(lead['demand_validity'],expected)
            self.assertEqual(lead['deadline_date'],deadline)
        item.pop('deadline_date');item.pop('deadline_quote')
        self.assertEqual(collect_leads({'leads':[item]},[source],1)[0]['demand_validity'],'date_unverified')

    def test_invented_deadline_or_publication_date_cannot_prove_future_deadline(self):
        deadline=(utcnow().date()+timedelta(days=7)).isoformat()
        for content,quote in [('Buying LED products','Submission deadline: '+deadline),
                              ('Buying LED products. Published: '+deadline,'Published: '+deadline)]:
            source={'url':'https://buyer.example/tender','title':'Buyer','source_id':0,'content':content}
            item={'name':'Buyer','source_id':0,'quote':'Buying LED products','demand':True,
                  'deadline_date':deadline,'deadline_quote':quote}
            lead=collect_leads({'leads':[item]},[source],1)[0]
            self.assertEqual(lead['demand_validity'],'date_unverified')
            self.assertIsNone(lead['deadline_date'])

    def test_malformed_optional_deadline_does_not_discard_a_real_candidate(self):
        source={'url':'https://buyer.example/','title':'Buyer','source_id':0,'content':'Buying LED products'}
        for value in ('','unknown','2026-99-99',42):
            item={'name':'Buyer','source_id':0,'quote':'Buying LED products','demand':True,
                  'deadline_date':value,'deadline_quote':None}
            result=collect_leads({'leads':[item]},[source],1)
            self.assertEqual(len(result),1)
            self.assertEqual(result[0]['demand_validity'],'date_unverified')

    def test_supported_quote_cannot_justify_a_company_name_absent_from_the_source(self):
        source={'url':'https://buyer.example/','title':'Buyer Ltd','source_id':0,'content':'Buying LED products'}
        invented={'name':'Invented Acme Ventures','source_id':0,'quote':'Buying LED products','demand':True}
        self.assertEqual(collect_leads({'leads':[invented]},[source],1),[])
        observed={**invented,'name':'Buyer Ltd'}
        self.assertTrue(collect_leads({'leads':[observed]},[source],1)[0]['name_observed_in_source'])
