from unittest import TestCase
from sqlalchemy import select
from app.db import Job,PointEntry,ProviderCall,write_transaction
from app.workspaces import enqueue,finish_job,request_fingerprint
import test_service


class PointPricingTest(TestCase):
    setUp=test_service.ServiceTest.setUp
    register_and_login=test_service.ServiceTest.register_and_login

    def test_data_escrow_settlement_and_release_reconcile_with_wallet(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        quote=self.client.get(root+'/points/quotes',headers=token).json()['prospecting_enhanced']
        self.assertEqual(quote['total_points'],601)
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['points_per_100_cny'],10000)
        payload={'acquisition_tier':'enhanced','paid_budget_milli_cny':6000}
        with write_transaction(self.sessions) as session:
            job=enqueue(session,workspace,self.settings,'prospecting',payload,'escrow',request_fingerprint('prospecting',payload))
            identifier=job.id
            session.add(ProviderCall(job_id=identifier,step='discovery',endpoint='upkuajing_buyers',
                status='succeeded',result={'reported_milli_cny':1500}))
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['reserved'],601)
        with write_transaction(self.sessions) as session:
            finish_job(session,session.get(Job,identifier),'partial',result={'leads':[{'name':'Buyer'}]})
        balance=self.client.get(root+'/points',headers=token).json()
        self.assertEqual((balance['available'],balance['reserved']),(849,0))
        rows=self.client.get(root+'/points/ledger',headers=token).json()
        accounting={row['kind']:row['points'] for row in rows if row['reference']==identifier}
        self.assertEqual(accounting,{'reserve':601,'charge':151,'release':450})

    def test_unknown_costs_do_not_charge_and_anomalous_fees_are_capped(self):
        workspace,token=self.register_and_login('13800000000');root='/api/v1/workspaces/'+workspace
        for index,(call_status,fee,expected) in enumerate((('unknown',None,1),('succeeded',9000,601))):
            payload={'acquisition_tier':'enhanced','paid_budget_milli_cny':6000}
            with write_transaction(self.sessions) as session:
                job=enqueue(session,workspace,self.settings,'prospecting',payload,f'fee-{index}',request_fingerprint('prospecting',payload))
                identifier=job.id
                session.add(ProviderCall(job_id=identifier,step='paid',endpoint='upkuajing_buyers',
                    status=call_status,estimated_milli_cny=6000,result={'reported_milli_cny':fee}))
            with write_transaction(self.sessions) as session:
                finish_job(session,session.get(Job,identifier),'succeeded',result={'leads':[{'name':'Buyer'}]})
            with self.sessions() as session:self.assertEqual(session.get(Job,identifier).points_charged,expected)
        balance=self.client.get(root+'/points',headers=token).json()
        self.assertEqual((balance['available'],balance['reserved']),(398,0))
