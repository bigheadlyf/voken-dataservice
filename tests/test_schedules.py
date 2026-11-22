from datetime import timedelta
from unittest import TestCase

from sqlalchemy import select

from app.db import AgentSchedule, Job, Wallet, utcnow, write_transaction
from app.operator import provision, topup
from app.schedules import enqueue_due
from app.worker import Worker
import test_service


class ScheduleTest(TestCase):
    setUp = test_service.ServiceTest.setUp
    register_and_login = test_service.ServiceTest.register_and_login

    def setup_schedule(self):
        workspace, token = self.register_and_login('13800000000')
        root = '/api/v1/workspaces/'+workspace
        agent = self.client.post(root+'/agents',headers=token,json={'name':'LED','instructions':'Find LED buyers',
            'buyer_role':'distributor','seed_website':'https://example.com','exclude_keywords':['freight forwarder']}).json()
        url=root+'/agents/'+agent['id']+'/schedule'
        created=self.client.put(url,headers=token,json={'expected_version':0,'interval_days':14,'remaining_runs':2})
        self.assertEqual(created.status_code,200,created.text)
        return workspace, root, token, agent, url, created.json()

    def due(self, agent):
        with write_transaction(self.sessions) as session:
            session.get(AgentSchedule,agent['id']).next_run_at=utcnow()-timedelta(days=1)

    def test_schedule_finite_runs_public_tier_and_single_submission(self):
        workspace,root,token,agent,url,row=self.setup_schedule()
        self.assertEqual(enqueue_due(self.sessions,self.settings),0)
        self.due(agent)
        self.assertEqual(enqueue_due(self.sessions,self.settings),1)
        self.assertEqual(enqueue_due(self.sessions,self.settings),0)
        jobs=self.client.get(root+'/jobs',headers=token).json()
        self.assertEqual(len(jobs),1)
        with self.sessions() as session:
            job=session.get(Job,jobs[0]['id'])
            self.assertEqual(job.payload['acquisition_tier'],'basic')
            self.assertNotIn('paid_budget_milli_cny',job.payload)
            self.assertEqual(job.payload['buyer_role'],'distributor')
        Worker(self.sessions,self.settings,self.upstream).run_next()
        self.due(agent)
        self.assertEqual(enqueue_due(self.sessions,self.settings),1)
        row=self.client.get(root+'/schedules',headers=token).json()[0]
        self.assertEqual(row['remaining_runs'],0)
        self.assertFalse(row['enabled'])

    def test_schedule_tenant_version_pause_and_failed_budget(self):
        workspace,root,token,agent,url,row=self.setup_schedule()
        _,other_token=self.register_and_login('13800000001')
        self.assertEqual(self.client.put(url,headers=other_token,json={'expected_version':1}).status_code,404)
        self.assertEqual(self.client.put(url,headers=token,json={'expected_version':0}).status_code,409)
        self.due(agent)
        with write_transaction(self.sessions) as session:
            session.get(Wallet,workspace).available=0
        self.assertEqual(enqueue_due(self.sessions,self.settings),0)
        row=self.client.get(root+'/schedules',headers=token).json()[0]
        self.assertEqual(row['last_error'],'insufficient_points')
        self.assertEqual(row['remaining_runs'],2)
        self.client.post(root+'/agents/'+agent['id']+'/pause',headers=token)
        self.due(agent)
        self.assertEqual(enqueue_due(self.sessions,self.settings),0)
        self.assertFalse(self.client.get(root+'/schedules',headers=token).json()[0]['enabled'])

    def test_operator_provision_and_idempotent_topup(self):
        account=provision(self.sessions,'13900000000','operator-test-password',initial_points=10)
        with self.assertRaises(ValueError):
            provision(self.sessions,'13900000000','different-password')
        result=topup(self.sessions,account['workspace_id'],100,'offline-receipt-001')
        self.assertFalse(result['replayed'])
        self.assertTrue(topup(self.sessions,account['workspace_id'],100,'offline-receipt-001')['replayed'])
        with self.assertRaises(ValueError):
            topup(self.sessions,account['workspace_id'],101,'offline-receipt-001')
        with self.sessions() as session:
            self.assertEqual(session.get(Wallet,account['workspace_id']).available,110)
