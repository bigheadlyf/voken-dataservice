from datetime import datetime,timedelta
from unittest import TestCase
from sqlalchemy import select
from app.billing import add_months, fulfill_order
from app.db import BillingOrder, Membership, utcnow, write_transaction
import test_service


class BillingTest(TestCase):
    setUp=test_service.ServiceTest.setUp
    register_and_login=test_service.ServiceTest.register_and_login

    def account(self,phone='13800000000'):
        workspace,token=self.register_and_login(phone)
        return workspace,'/api/v1/workspaces/'+workspace,token

    def order(self,root,token,plan='points_1000',amount=1000,key='billing-1'):
        return self.client.post(root+'/billing/orders',headers={**token,'Idempotency-Key':key},json={
            'plan_id':plan,'expected_total_fen':amount,'accept_terms':True})

    def test_server_quotes_order_replay_and_no_client_paid_endpoint(self):
        workspace,root,token=self.account()
        catalog=self.client.get(root+'/billing/plans',headers=token).json()
        annual=next(row for row in catalog['plans'] if row['plan_id']=='svip_annual')
        self.assertEqual(annual['total_fen'],39900)
        self.assertEqual(annual['total_points'],46000)
        self.assertFalse(catalog['checkout_available'])
        bad=self.order(root,token,amount=1)
        self.assertEqual(bad.status_code,409)
        first=self.order(root,token)
        self.assertEqual(first.status_code,201,first.text)
        self.assertEqual(first.json()['id'],self.order(root,token).json()['id'])
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],1000)
        self.assertEqual(self.client.patch(root+'/billing/orders/'+first.json()['id'],headers=token,
            json={'status':'paid'}).status_code,404)
        other_workspace,other_root,other=self.account('13800000001')
        self.assertEqual(self.client.get(root+'/billing/orders',headers=other).status_code,404)
        self.assertEqual(self.client.post(other_root+'/billing/orders/'+first.json()['id']+'/cancel',headers=other).status_code,404)
        with self.assertRaises(ValueError):fulfill_order(self.sessions,workspace,first.json()['id'],1,'wrong-amount')
        paid=fulfill_order(self.sessions,workspace,first.json()['id'],1000,'verified-fixture-receipt')
        self.assertEqual(paid['status'],'paid')
        fulfill_order(self.sessions,workspace,first.json()['id'],1000,'verified-fixture-receipt')
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],2000)

    def test_membership_calendar_month_claims_are_finite_and_idempotent(self):
        workspace,root,token=self.account()
        order=self.order(root,token,'svip_annual',39900).json()
        fulfill_order(self.sessions,workspace,order['id'],39900,'annual-test-receipt')
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],11000)
        member=self.client.get(root+'/billing/memberships',headers=token).json()[0]
        path=root+'/billing/memberships/'+member['id']+'/claims'
        self.assertEqual(self.client.post(path,headers=token).status_code,200)
        self.assertEqual(self.client.post(path,headers=token).status_code,200)
        self.assertEqual(self.client.get(root+'/points',headers=token).json()['available'],14000)
        with write_transaction(self.sessions) as session:
            row=session.get(Membership,member['id']);row.ends_at=utcnow()-timedelta(seconds=1)
            row.starts_at=add_months(row.ends_at,-12)
        self.assertEqual(self.client.post(path,headers=token).status_code,409)
        self.assertEqual(add_months(datetime(2028,1,31),1),datetime(2028,2,29))
        self.assertEqual(add_months(datetime(2028,1,31),2),datetime(2028,3,31))
        self.assertEqual(add_months(datetime(2028,2,29),12),datetime(2029,2,28))

    def test_coupon_reservation_expiry_and_receipt_uniqueness(self):
        workspace,root,token=self.account()
        order=self.order(root,token,'svip_annual',39900).json()
        self.assertEqual(self.order(root,token,'svip_annual',39900,key='second').status_code,409)
        self.assertEqual(self.client.post(root+'/billing/orders/'+order['id']+'/cancel',headers=token).status_code,200)
        with self.assertRaises(ValueError):fulfill_order(self.sessions,workspace,order['id'],39900,'cancelled-receipt')
        new=self.order(root,token,'svip_annual',39900,key='third').json()
        fulfill_order(self.sessions,workspace,new['id'],39900,'unique-receipt')
        other_workspace,other_root,other=self.account('13800000001')
        another=self.order(other_root,other).json()
        with self.assertRaises(ValueError):fulfill_order(self.sessions,other_workspace,another['id'],1000,'unique-receipt')
        topup=self.order(root,token,key='expiring').json()
        with write_transaction(self.sessions) as session:
            session.get(BillingOrder,topup['id']).expires_at=utcnow()-timedelta(seconds=1)
        self.assertEqual(self.client.get(root+'/billing/orders',headers=token).json()[0]['status'],'expired')
        with self.assertRaises(ValueError):fulfill_order(self.sessions,workspace,topup['id'],1000,'late-receipt')
