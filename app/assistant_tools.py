"""Run authenticated workspace API operations through their normal HTTP contracts."""
from dataclasses import dataclass
import json
import re

import httpx
from fastapi import Request, UploadFile
from pydantic import BaseModel, ConfigDict, Field, JsonValue

from app.config import BUYER_OPERATIONS
from app.mail_delivery import channel as mail_channel
from app.point_pricing import quote
from app.sources import search_operation

WORKSPACE_ROOT = '/api/v1/workspaces/{workspace_id}'
EXPORT = 'GET /crm/prospects/export.csv'
DELIVERY = 'POST /crm/prospects/{prospect_id}/deliveries'
CHECKOUT = 'POST /billing/orders/{order_id}/checkout'
IDENTIFIER = re.compile(r'[A-Za-z0-9_-]{1,160}')

LABELS = {
    'GET /crm/workbench': '查询工作台企业与联系人',
    'GET /crm/prospects': '查询已保存客户',
    'GET /crm/prospects/{prospect_id}': '读取客户详情',
    'GET /customers': '查询历史发现的客户',
    'GET /customers/{customer_id}': '读取历史客户详情',
    EXPORT: '导出客户 CSV',
    'GET /company/profile': '读取本企业资料',
    'PUT /company/profile': '保存本企业资料',
    'POST /company/document-analyses': '上传并分析企业资料',
    'POST /company/certification/confirm': '确认企业资料真实性',
    'POST /directory/searches': '查询外部企业库或人物库',
    'POST /directory/contacts': '解锁企业或人物联系方式',
    'POST /directory/targeted-contacts': '定向查询企业联系人',
    'POST /directory/trades': '查询外部海关交易数据',
    'POST /discovery/plan': '生成找客方案',
    'POST /discovery/preview': '提交找客预览任务',
    'POST /crm/prospects/{prospect_id}/drafts': '生成客户开发信草稿',
    'POST /crm/prospects/{prospect_id}/research': '提交客户公域查证任务',
    DELIVERY: '提交邮件发送',
    'POST /crm/workbench/verifications': '提交外部邮箱验证',
    'POST /crm/workbench/followups': '创建客户跟进提醒',
    'POST /crm/workbench/imports/preview': '预览客户名单导入',
    'POST /crm/workbench/imports/commit': '确认并导入客户名单',
    'POST /crm/workbench/inbox/preview': '解析邮件文件',
    'POST /sources/searches': '提交官方数据源检索任务',
    'PUT /agents/{agent_id}/schedule': '设置员工周期拓客计划',
    'POST /billing/orders': '创建待付款订单',
    CHECKOUT: '生成微信支付二维码',
}
POINT_OPERATIONS = {
    'POST /agents/{agent_id}/runs': 'prospecting',
    'POST /public-searches': 'public_search',
    'POST /customs-verifications': 'customs_verification',
    'POST /reports': 'report',
    'POST /directory/contacts': 'directory_contacts',
    'POST /directory/targeted-contacts': 'targeted_contacts',
    'POST /directory/trades': 'trade_search',
    'POST /discovery/preview': 'prospecting',
    'POST /crm/prospects/{prospect_id}/drafts': 'outreach_draft',
    'POST /crm/prospects/{prospect_id}/research': 'report',
}


class ToolCall(BaseModel):
    model_config = ConfigDict(extra='forbid')
    operation: str
    path: dict[str, str] = Field(default_factory=dict)
    query: dict[str, str | int | float | bool] = Field(default_factory=dict)
    body: dict[str, JsonValue] | None = None


@dataclass(frozen=True)
class Operation:
    name: str
    method: str
    path: str
    label: str
    description: str
    parameters: list
    body: dict | None
    required_body: bool
    multipart: bool

    @property
    def needs_confirmation(self):
        return self.method != 'GET' and self.name != 'POST /discovery/plan'


def expand_schema(node, definitions, seen=frozenset()):
    if isinstance(node, list):
        return [expand_schema(value, definitions, seen) for value in node]
    if not isinstance(node, dict):
        return node
    if '$ref' in node:
        ref = node['$ref'].rsplit('/', 1)[-1]
        return {} if ref in seen else expand_schema(definitions.get(ref, {}), definitions, seen | {ref})
    return {key: expand_schema(value, definitions, seen)
            for key, value in node.items() if key not in {'examples', 'example'}}


def operations(application):
    schema = application.openapi()
    definitions = schema.get('components', {}).get('schemas', {})
    available = {}
    for path, methods in schema['paths'].items():
        if not path.startswith(WORKSPACE_ROOT + '/') or path.startswith(WORKSPACE_ROOT + '/assistant/'):
            continue
        relative = path.removeprefix(WORKSPACE_ROOT)
        for method, spec in methods.items():
            if method not in {'get', 'post', 'put', 'patch', 'delete'} or not spec.get('security'):
                continue
            request_body = spec.get('requestBody', {})
            content = request_body.get('content', {})
            multipart = 'multipart/form-data' in content
            if content and not (multipart or 'application/json' in content):
                continue
            name = f'{method.upper()} {relative}'
            body = content.get('multipart/form-data' if multipart else 'application/json')
            available[name] = Operation(
                name, method.upper(), relative, LABELS.get(name, spec['summary']), spec.get('description', ''),
                [p for p in spec.get('parameters', []) if p['in'] in {'path', 'query'} and p['name'] != 'workspace_id'],
                expand_schema(body['schema'], definitions) if body else None,
                request_body.get('required', False), multipart,
            )
    return available


def describe(operation):
    return {'operation': operation.name, 'description': operation.description,
            'parameters': operation.parameters, 'body': operation.body,
            'body_required': operation.required_body, 'requires_attachment': operation.multipart,
            'requires_confirmation': operation.needs_confirmation}


def prepare(call, operation, attachment, request, workspace):
    path_keys = {p['name'] for p in operation.parameters if p['in'] == 'path'}
    query_params = {p['name']: p for p in operation.parameters if p['in'] == 'query'}
    if call.path.keys() != path_keys or not all(IDENTIFIER.fullmatch(value) for value in call.path.values()):
        raise ValueError('请提供该操作的有效路径参数。')
    if call.query.keys() - query_params.keys() or any(
        p.get('required') and key not in call.query for key, p in query_params.items()
    ):
        raise ValueError('请检查该操作的查询参数。')
    if operation.multipart and attachment is None:
        raise ValueError('此操作需要用户上传文件。')
    if call.body is not None and (operation.body is None or operation.multipart):
        raise ValueError('此操作不接收 JSON 请求体。')
    body = call.body
    authorizations = []
    if operation.body is not None and not operation.multipart:
        properties = operation.body.get('properties', {})
        required = set(operation.body.get('required', []))
        if body is not None or operation.required_body:
            body = dict(body or {})
            if body.keys() - properties.keys():
                raise ValueError('请求体包含未定义的字段。')
            for key in properties:
                if not key.startswith('confirm_'):
                    continue
                requested = body.pop(key, None)
                if key in required or requested is True or (
                    key == 'confirm_paid' and body.get('acquisition_tier') in ('enhanced', 'ai_enhanced')
                ):
                    if not operation.needs_confirmation:
                        raise ValueError('该授权不能在查询中使用。')
                    authorizations.append(key)
            if required - body.keys() - set(authorizations):
                raise ValueError('请求体缺少必填字段。')
    action = {'operation': operation.name, 'label': operation.label, 'path': call.path,
              'query': call.query, 'body': body, 'authorizations': authorizations}
    if operation.multipart:
        action['attachment'] = attachment
    settings = request.app.state.settings
    point_operation = POINT_OPERATIONS.get(operation.name)
    if operation.name == 'POST /directory/searches' and not (body or {}).get('continuation_job_id'):
        point_operation = 'directory_people' if (body or {}).get('kind') == 'people' else 'directory_companies'
    if operation.name == 'POST /buyer-enrichments':
        point_operation = BUYER_OPERATIONS.get(str((body or {}).get('action', 'search')))
    if operation.name == 'POST /sources/searches':
        point_operation = search_operation(settings, str((body or {}).get('source_id', '')))
    if point_operation:
        action['point_quote'] = quote(settings, point_operation, body)
    if operation.name == DELIVERY:
        channel = mail_channel(request, workspace)
        action['mail'] = {'sender': channel['sender'], 'footer': channel['footer']}
    return action


def preview(value, budget):
    encoded = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    if len(encoded) <= budget:
        return value
    metadata = {}
    if isinstance(value, dict):
        metadata = {key: value[key] for key in ('total', 'offset', 'limit', 'next_cursor', 'summary', 'id', 'status')
                    if key in value and len(json.dumps(value[key], ensure_ascii=False)) <= 600}
    return {**metadata, 'truncated': True, 'preview': encoded[:budget]}


async def execute(request: Request, workspace: str, operation: Operation, action: dict,
                  turn_id: str, file: UploadFile | None = None):
    result = {'operation': operation.name, 'label': operation.label, 'path': action['path']}
    if operation.name == EXPORT:
        return {**result, 'status': 'ready', 'download_query': action['query']}
    query = dict(action['query'])
    if operation.method == 'GET' and any(p['name'] == 'limit' for p in operation.parameters):
        query.setdefault('limit', 12)
    path = WORKSPACE_ROOT.format(workspace_id=workspace) + operation.path.format(**action['path'])
    headers = {'Authorization': request.headers['authorization'], 'Idempotency-Key': f'assistant-{turn_id}'}
    options = {}
    if operation.multipart:
        options['files'] = {'file': (file.filename, file.file, file.content_type or 'application/octet-stream')}
    elif action['body'] is not None:
        options['json'] = {**action['body'], **dict.fromkeys(action['authorizations'], True)}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=request.app),
                                 base_url='http://workspace.internal') as client:
        response = await client.request(operation.method, path, params=query, headers=headers, **options)
    result['http_status'] = response.status_code
    data = response.json() if response.content and 'application/json' in response.headers.get('content-type', '') else None
    if not response.is_success:
        return {**result, 'status': 'failed', 'error': preview(data.get('detail') if isinstance(data, dict) else None, 1200)}
    if isinstance(data, dict):
        if operation.name == CHECKOUT:
            result['qr_data_url'] = data.pop('qr_data_url', None)
        if isinstance(data.get('status'), str):
            result['business_status'] = data['status']
        if data.get('operation') and isinstance(data.get('id'), str) and IDENTIFIER.fullmatch(data['id']):
            result['job'] = {'id': data['id'], 'status': data.get('status'), 'operation': data['operation']}
    return {**result, 'status': 'succeeded', 'result': preview(data, 12000)}
