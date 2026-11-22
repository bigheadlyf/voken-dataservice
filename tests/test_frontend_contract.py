"""Check the business contracts used by native React views against runtime OpenAPI."""
from pathlib import Path
import re
from unittest import TestCase
from app.config import Settings
from app.main import create_app


class FrontendContractTest(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec=create_app(settings=Settings(),run_worker=False).openapi()
        cls.root='/api/v1/workspaces/{workspace_id}'

    def test_filter_controls_are_real_query_parameters(self):
        source=(Path(__file__).resolve().parents[1]/'frontend/src/ui-state.ts').read_text(encoding='utf-8')
        block=re.search(r'FILTER_DEFAULTS[^=]*=\s*\{(.*?)\};',source,re.S).group(1)
        fields=set(re.findall(r'^\s*(\w+)\s*:',block,re.M))
        parameters={p['name'] for p in self.spec['paths'][self.root+'/crm/workbench']['get']['parameters'] if p['in']=='query'}
        self.assertGreater(len(fields),10)
        self.assertLessEqual(fields,parameters)
        self.assertLessEqual({'offset','limit'},parameters)

    def test_native_view_endpoints_exist_with_expected_methods(self):
        operations={'get':['/crm/workbench','/crm/workbench/views','/crm/workbench/products','/crm/workbench/capabilities','/crm/workbench/followups','/crm/workbench/inbox','/crm/workbench/history/{prospect_id}','/crm/prospects/{prospect_id}','/crm/prospects/{prospect_id}/activities','/jobs'],
            'post':['/crm/workbench/views','/crm/workbench/assessments','/crm/workbench/events','/crm/workbench/followups','/crm/workbench/verifications']}
        for method,paths in operations.items():
            for path in paths:
                with self.subTest(method=method,path=path):self.assertIn(method,self.spec['paths'][self.root+path])

    def test_modal_payload_fields_and_idempotency_are_declared(self):
        payloads={
            '/assessments':{'prospect_id','status','reason'},
            '/events':{'prospect_id','email','type','content','source'},
            '/followups':{'prospect_ids','due_at','intervals_days','objective'},
            '/verifications':{'prospect_id','email','confirm_external_check'},
        }
        for suffix,fields in payloads.items():
            operation=self.spec['paths'][self.root+'/crm/workbench'+suffix]['post']
            ref=operation['requestBody']['content']['application/json']['schema']['$ref'].rsplit('/',1)[-1]
            self.assertLessEqual(fields,set(self.spec['components']['schemas'][ref]['properties']))
            if suffix in ('/events','/followups','/verifications'):
                self.assertIn('idempotency-key',{p['name'].lower() for p in operation['parameters'] if p['in']=='header'})
