from io import BytesIO
from zipfile import ZipFile
from unittest import TestCase
from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

from app.company import extract_document, MAX_FILE_BYTES
from app.db import Job, write_transaction
from app.deepseek import ProviderError
import test_service
from test_chat import ScriptedModel


class CompanyTest(TestCase):
    register_and_login = test_service.ServiceTest.register_and_login

    def setUp(self):
        test_service.ServiceTest.setUp(self)
        self.workspace, self.token = self.register_and_login('13800000000')
        self.root = f'/api/v1/workspaces/{self.workspace}'
        self.company = self.root + '/company'

    def request(self, method, path, **kwargs):
        return self.client.request(method, self.company + path, headers=self.token, **kwargs)

    def memory(self, **kwargs):
        return self.request('POST', '/memories', json={
            'key': 'products', 'title': '主推产品', 'content': '20W 筒灯', **kwargs})

    def proposal(self):
        return {'profile': {'name': '星途照明', 'products': '20W 筒灯'},
                'profile_evidence': {'name': '星途照明', 'products': '20W 筒灯'},
                'memories': [{'key': 'products', 'title': '主推产品', 'content': '20W 筒灯',
                              'evidence': '20W 筒灯'}]}

    def upload(self, proposal=None, filename='介绍.txt', content=None):
        self.app.state.chat_provider = ScriptedModel([proposal if proposal is not None else self.proposal()])
        return self.request('POST', '/document-analyses', files={
            'file': (filename, content if content is not None else '星途照明生产20W 筒灯。'.encode(), 'application/octet-stream')})

    def test_profile_versions_merge_replace_clear_and_delete(self):
        self.assertEqual(self.request('GET', '/profile').json()['version'], 0)
        saved = self.request('PUT', '/profile', json={'expected_version': 0, 'name': '星途', 'products': 'LED'})
        self.assertEqual(saved.status_code, 200, saved.text)
        self.assertEqual(saved.json()['version'], 1)
        stale = self.request('PATCH', '/profile', json={'expected_version': 0, 'name': 'old'})
        self.assertEqual(stale.status_code, 409)
        patch = self.request('PATCH', '/profile', json={'expected_version': 1, 'products': None}).json()
        self.assertEqual(patch['data']['name'], '星途')
        self.assertIsNone(patch['data']['products'])
        replaced = self.request('PUT', '/profile', json={'expected_version': 2, 'name': '新企业'}).json()
        self.assertIsNone(replaced['data']['products'])
        self.assertEqual(self.request('DELETE', '/profile', params={'expected_version': 3}).status_code, 204)
        self.assertEqual(self.request('GET', '/profile').json()['version'], 4)
        self.assertEqual(self.request('PATCH', '/profile', json={'expected_version': 0, 'name': '旧'}).status_code, 409)

    def test_memory_crud_conflicts_scope_and_shared_chat_context(self):
        result = self.memory(verification_status='confirmed')
        self.assertEqual(result.status_code, 201, result.text)
        row = result.json()
        path = '/memories/' + row['id']
        self.assertEqual(self.memory().status_code, 409)
        self.assertEqual(self.request('PATCH', path, json={'expected_version': 99, 'content': 'new'}).status_code, 409)
        corrected = self.request('PATCH', path, json={'expected_version': 1, 'content': '30W 筒灯'}).json()
        self.assertEqual(corrected['verification_status'], 'unverified')
        self.assertEqual(corrected['version'], 2)
        self.assertEqual(self.request('PATCH', path, json={'expected_version': 2, 'content': None}).status_code, 422)
        other_workspace, other_token = self.register_and_login('13800000001')
        self.assertEqual(self.client.get(self.company + path, headers=other_token).status_code, 404)
        self.assertEqual(self.client.get(f'/api/v1/workspaces/{other_workspace}/company' + path,
                                         headers=other_token).status_code, 404)
        self.request('PUT', '/profile', json={'expected_version': 0, 'name': '共享企业'})
        for index in range(2):
            agent = self.client.post(self.root + '/agents', headers=self.token,
                json={'name': '员工', 'instructions': '了解企业'}).json()['id']
            model = ScriptedModel([{'reply': '已读取企业资料'}])
            self.app.state.chat_provider = model
            sent = self.client.post(self.root + f'/agents/{agent}/messages', headers={
                **self.token, 'Idempotency-Key': f'company-chat-{index}'}, json={'content': '公司产品是什么'})
            self.assertEqual(sent.json()['status'], 'succeeded', sent.text)
            self.assertEqual(model.payloads[0]['company']['profile']['data']['name'], '共享企业')
            self.assertEqual(model.payloads[0]['company']['memories'][0]['content'], '30W 筒灯')
            self.client.delete(self.root + '/agents/' + agent, headers=self.token)
        self.assertEqual(len(self.request('GET', '/memories').json()), 1)
        self.assertEqual(self.request('DELETE', path, params={'expected_version': 2}).status_code, 204)
        self.assertEqual(self.request('GET', '/memories').json(), [])

    def test_document_preview_apply_replay_and_original_source(self):
        result = self.upload()
        self.assertEqual(result.status_code, 201, result.text)
        analysis = result.json()
        self.assertEqual(self.request('GET', '/profile').json()['version'], 0)
        self.assertEqual(self.request('GET', '/memories').json(), [])
        path = '/document-analyses/' + analysis['id']
        self.assertEqual(self.request('GET', path).json()['proposal'], analysis['proposal'])
        applied = self.request('POST', path + '/apply')
        self.assertEqual(applied.status_code, 200, applied.text)
        self.assertIsNotNone(applied.json()['applied_at'])
        self.assertEqual(self.request('POST', path + '/apply').json(), applied.json())
        self.assertEqual(self.request('GET', '/profile').json()['version'], 1)
        memories = self.request('GET', '/memories').json()
        self.assertEqual(len(memories), 1)
        self.assertEqual(memories[0]['source']['evidence'], '20W 筒灯')
        self.assertEqual(memories[0]['verification_status'], 'unverified')

    def test_document_conflicts_are_atomic_and_tenant_scoped(self):
        analysis = self.upload().json()
        self.memory()
        path = '/document-analyses/' + analysis['id']
        self.assertEqual(self.request('POST', path + '/apply').status_code, 409)
        self.assertEqual(self.request('GET', '/profile').json()['version'], 0)
        self.assertIsNone(self.request('GET', path).json()['applied_at'])
        self.request('PUT', '/profile', json={'expected_version': 0, 'name': '手动更新'})
        self.assertEqual(self.request('POST', path + '/apply').json()['detail'], 'company_version_conflict')
        other_workspace, other_token = self.register_and_login('13800000001')
        other = f'/api/v1/workspaces/{other_workspace}/company' + path
        self.assertEqual(self.client.get(other, headers=other_token).status_code, 404)
        self.assertEqual(self.client.post(other + '/apply', headers=other_token).status_code, 404)

    def test_bad_documents_provider_failure_and_unfounded_claims(self):
        for filename, content, status in [('bad.exe', b'test', 415), ('bad.docx', b'broken', 422),
                                          ('bad.pdf', b'broken', 422), ('empty.txt', b' ', 422),
                                          ('large.txt', b'x' * (MAX_FILE_BYTES + 1), 413)]:
            with self.subTest(filename=filename):
                result = self.upload(filename=filename, content=content)
                self.assertEqual(result.status_code, status, result.text)
                self.assertEqual(self.app.state.chat_provider.payloads, [])
        bad = self.proposal()
        bad['memories'][0]['evidence'] = '已经取得认证'
        self.assertEqual(self.upload(bad).status_code, 502)
        bad = self.proposal()
        bad['memories'][0]['verification_status'] = 'confirmed'
        self.assertEqual(self.upload(bad).status_code, 502)
        self.assertEqual(self.upload(ProviderError('deepseek_not_configured')).status_code, 503)
        self.assertEqual(self.request('GET', '/memories').json(), [])

    def test_docx_text_extraction(self):
        output = BytesIO()
        with ZipFile(output, 'w') as archive:
            archive.writestr('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                '<w:body><w:p><w:r><w:t>星途照明</w:t></w:r></w:p>'
                '<w:p><w:r><w:t>20W 筒灯</w:t></w:r></w:p></w:body></w:document>')
        self.assertEqual(extract_document('介绍.docx', output.getvalue()), '星途照明\n20W 筒灯')
        self.assertEqual(self.upload(filename='介绍.docx', content=output.getvalue()).status_code, 201)

    def test_pdf_upload_and_scanned_page_rejection(self):
        writer = PdfWriter()
        page = writer.add_blank_page(width=300, height=300)
        output = BytesIO()
        writer.write(output)
        self.assertEqual(self.upload(filename='scan.pdf', content=output.getvalue()).status_code, 422)
        font = DictionaryObject({NameObject('/Type'): NameObject('/Font'),
            NameObject('/Subtype'): NameObject('/Type1'), NameObject('/BaseFont'): NameObject('/Helvetica')})
        page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/F1'): font})})
        stream = DecodedStreamObject()
        stream.set_data(b'BT /F1 12 Tf 10 200 Td (Starlume makes LED lights.) Tj ET')
        page[NameObject('/Contents')] = stream
        output = BytesIO()
        writer.write(output)
        proposal = {'profile': {'name': 'Starlume'}, 'profile_evidence': {'name': 'Starlume'}, 'memories': []}
        result = self.upload(proposal, filename='company.pdf', content=output.getvalue())
        self.assertEqual(result.status_code, 201, result.text)
        self.assertEqual(result.json()['proposal']['profile']['name'], 'Starlume')

    def test_customer_history_pagination_filter_and_deleted_agents(self):
        agents = [self.client.post(self.root + '/agents', headers=self.token,
                  json={'name': f'员工{i}', 'instructions': '寻找采购商'}).json()['id'] for i in range(2)]
        jobs = []
        for agent in agents:
            job = self.client.post(self.root + f'/agents/{agent}/runs', headers=self.token).json()
            with write_transaction(self.sessions) as session:
                saved = session.get(Job, job['id'])
                saved.status = 'succeeded'
                saved.result = {'leads': [{'name': f'客户{i}', 'source': {'url': 'https://example.com'}} for i in range(3)]}
            jobs.append(job['id'])
        self.client.delete(self.root + '/agents/' + agents[0], headers=self.token)
        path = self.root + '/customers'
        page = self.client.get(path, headers=self.token, params={'agent_id': agents[0], 'limit': 2}).json()
        self.assertEqual(len(page['items']), 2)
        self.assertTrue(all(row['agent_id'] == agents[0] for row in page['items']))
        next_page = self.client.get(path, headers=self.token,
            params={'agent_id': agents[0], 'limit': 2, 'cursor': page['next_cursor']}).json()
        self.assertEqual([row['lead_index'] for row in next_page['items']], [2])
        self.assertIsNone(next_page['next_cursor'])
        self.assertEqual(len(self.client.get(path, headers=self.token).json()['items']), 6)
        detail = self.client.get(path + '/' + page['items'][0]['id'], headers=self.token)
        self.assertEqual(detail.json()['job_id'], jobs[0])
        _, other_token = self.register_and_login('13800000001')
        self.assertEqual(self.client.get(path, headers=other_token).status_code, 404)
        self.assertEqual(self.client.get(path, headers=self.token, params={'cursor': 'bad'}).status_code, 422)
        self.assertEqual(self.client.get(path, headers=self.token,
            params={'agent_id': agents[1], 'cursor': page['next_cursor']}).status_code, 422)
        other_workspace = self.client.post('/api/v1/auth/login', json={
            'phone': '13800000001', 'password': 'valid-password'}).json()['workspace_id']
        self.assertEqual(self.client.get(f'/api/v1/workspaces/{other_workspace}/customers/' + page['items'][0]['id'],
                                         headers=other_token).status_code, 404)
