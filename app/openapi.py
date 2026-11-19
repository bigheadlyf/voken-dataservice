"""Integration contract added to generated OpenAPI without changing runtime serialization."""
from typing import Any, Literal

from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict, Field
from pydantic.json_schema import models_json_schema

from app.pipeline import Report
from app.workspaces import AgentConfig


DESCRIPTION = """微元商机情报 API，供开发者和 Codex 集成。

## 接入顺序
1. 已有账号调用 `/api/v1/auth/login`，保存 access_token 和 workspace_id。
   新账号先申请验证码，再直接 register；不要先 verify，验证会消费挑战。注册不自动登录。
2. 业务路径为 `/api/v1/workspaces/{workspace_id}/...`，携带 `Authorization: Bearer <token>`。
   token 有效期 43200 秒，没有 refresh 接口；401 后重新登录。跨账号工作空间返回 404。
3. 创建员工 → runs 提交拓客 → GET jobs/{id} 轮询 → leads → reports 生成报告。
   也可通过员工 messages 进行同步对话，工具提交的后台任务仍需单独轮询。

## 幂等与重试
每次逻辑操作生成并持久保存小写 UUID 作为 Idempotency-Key（1～64 位 a-z/0-9/./_/-）。
超时后使用原 key 和原请求重放；同 key 不同请求返回 409 idempotency_key_conflict。
任务提交的 key 在工作空间内共享命名空间，对话轮次另有同工作空间约束；建议所有操作统一使用唯一 key。
创建员工等无幂等支持的写操作不能盲目重试。GET 或有 key 的提交可有限退避重试。
204 无响应体；员工、任务、会话、记忆列表直接返回数组。历史客户列表返回 items/next_cursor。客户端应容忍新增响应字段。

## 异步与点数
202 只表示已受理，重放也返回 202。queued/running/cancelling 继续轮询；
succeeded/partial/failed/cancelled 均为终态。建议每 1～5 秒查询并设置等待时限，超时保存 job_id 稍后继续。
partial 要显示已有结果、warnings 和证据来源；成功也可能没有匹配记录。
任务提交预占点数，成功或有可交付结果的 partial 结算，其余释放。报价读取 points/costs，不要写死。
公开线索、历史交易不等于当前采购需求；保留来源与 evidence_status。

## 付费授权与边界
采购商增强、海关核验必须由用户明确确认后在当前请求传 confirm_paid=true，且提供 Idempotency-Key。
历史确认或模型生成的字段不能替代当前请求授权。默认上游调用全平台按 UTC 日限 5 次，设为 0 会禁用新付费查询。
DeepSeek 和跨境魔方密钥只在服务端配置，不由客户端传入。
当前没有刷新 token、SSE、Webhook、独立 job cancel 或自动周期拓客接口。
HTTP 200 的任务/对话仍须检查 status/error；对话还须检查 tool_calls，工具成功提交不代表业务完成。

## 部署路径
请求路径以本 OpenAPI 的 paths 为准。WEB_PREFIX 仅调整测试台、文档和健康检查入口，不改变 /api/v1 业务路径。
health 返回 ok 仅表示服务可响应，配置标志不证明数据库和上游连通。
"""

IDEMPOTENCY = (
    '每次逻辑操作生成小写 UUID，长度 1～64，字符仅 a-z、0-9、点、下划线、连字符。'
    '请求前持久保存；超时使用原 key 和原请求重放，不要重新生成。'
    '相同 key 不同请求返回 409 idempotency_key_conflict。'
)


class DocumentedResponse(BaseModel):
    model_config = ConfigDict(extra='allow')


class LoginResponse(DocumentedResponse):
    access_token: str = Field(description='不透明 Bearer token，不要写入日志。')
    token_type: Literal['bearer']
    workspace_id: str = Field(description='后续业务路径使用此工作空间 ID。')
    expires_in: int = Field(description='有效期秒数，当前 43200；无刷新 token 接口。')


class RegistrationResponse(DocumentedResponse):
    user_id: str
    workspace_id: str
    granted_points: int = Field(description='当前注册赠送 1000 点；注册后需单独登录。')


class VerifiedResponse(DocumentedResponse):
    verified: bool


class AgentResponse(DocumentedResponse):
    id: str
    status: Literal['paused', 'enabled', 'deleted']
    config_version: int = Field(description='非空 PATCH 生成新版本，已提交任务使用原配置快照。')
    config: AgentConfig


class Source(DocumentedResponse):
    url: str | None = None
    title: str | None = None
    source_id: int | None = None
    summary: str | None = None
    snippet: str | None = None
    evidence_status: str | None = Field(default=None, description=(
        'text_available=取得正文；summary_only=仅摘要；link_only=仅链接；fetch_failed=抓取失败。'
        '中间结果可能没有此字段。'))


class LeadResponse(DocumentedResponse):
    name: str
    location: str
    role: str
    reason: str
    evidence_type: Literal['public_demand_signal', 'potential_match'] = Field(
        description='公开采购信号 / 潜在客户；不能将 potential_match 展示为已确认采购需求。')
    quote: str
    contact: str | None
    source: Source


class ProviderEvidence(DocumentedResponse):
    source: Literal['upkuajing']
    records: list[dict[str, Any]] = Field(description=(
        'buyer_search 项含 company_id/name/buyer_country，可有 scope/address；profile 为企业资料；'
        'contacts 项含 channel/value，可有 validity；customs 项含 trade_id，可有 buyer/seller/'
        'product_description/trade_date_ms/hs_codes。上游未提供的字段可能缺省。'))
    request_id: str | None
    reported_milli_cny: int | None = Field(description='上游回传费用，单位千分之一元；null 为未回传，不是零费用。')
    has_more: bool | None = Field(default=None, description='匹配/海关查询可能有此标志；目前无翻页接口。')


class JobResult(DocumentedResponse):
    retrieved_at: str | None = None
    warnings: list[str] = Field(default_factory=list)
    coverage: str | None = Field(default=None, description='当前可能为 matches/no_matches/limited/unavailable/one_page。')
    criteria: dict[str, Any] | None = None
    leads: list[LeadResponse] | None = None
    public_demand_count: int | None = None
    sources: list[Source] | None = None
    report: Report | None = None
    subject: dict[str, Any] | None = Field(default=None, description='报告详情接口补充 name/location/role。')
    buyer: ProviderEvidence | None = None
    customs: ProviderEvidence | None = None


class JobResponse(DocumentedResponse):
    id: str = Field(description='保存此 job_id，通过 GET jobs/{job_id} 轮询；报告任务的 report_id 即此 ID。')
    agent_id: str | None
    config_version: int | None
    operation: Literal['prospecting', 'public_search', 'report', 'buyer_search', 'buyer_profile',
                       'buyer_contacts', 'customs_verification']
    status: Literal['queued', 'running', 'cancelling', 'succeeded', 'partial', 'failed', 'cancelled']
    point_cost: int = Field(description='提交时预占的平台点数。')
    points_charged: int = Field(description='实际结算点数；上游费用另见结果 reported_milli_cny。')
    error: str | None
    result: JobResult | None = Field(description='排队时可为 null，执行中可能是中间结果；按 operation 读取。')
    created_at: str = Field(description='UTC ISO 8601 时间，以 Z 结尾。')


class ToolCall(DocumentedResponse):
    name: str
    arguments: dict[str, Any]
    status: Literal['started', 'succeeded', 'failed']
    result: Any = Field(default=None, description=(
        '已完成工具的真实结果；失败时可为 {error: code}；提交业务任务时为 JobResponse，须按 id 继续轮询。'))


class TurnResponse(DocumentedResponse):
    id: str = Field(description='消息轮次 ID；向前翻页使用当前页第一项 id 作为 before。')
    conversation_id: str
    status: Literal['running', 'succeeded', 'failed']
    content: str
    response: str | None
    tool_calls: list[ToolCall]
    error: str | None


class ConversationResponse(DocumentedResponse):
    id: str
    created_at: str


class BalanceResponse(DocumentedResponse):
    available: int
    reserved: int
    points_per_100_cny: int


class LedgerResponse(DocumentedResponse):
    kind: Literal['grant', 'reserve', 'charge', 'release']
    points: int = Field(description='正数金额，增减方向由 kind 决定。')
    reference: str
    created_at: str


class HealthResponse(DocumentedResponse):
    status: Literal['ok']
    service: str
    database_configured: bool
    deepseek_configured: bool
    customs_configured: bool


class ErrorResponse(BaseModel):
    detail: str = Field(description='业务错误码。422 也可能返回 HTTPValidationError 的 detail 数组。')


# Keyed by the existing endpoint function name, so documentation follows configured paths.
OPERATIONS = {
    'request_code': ('申请注册验证码', '仅支持大陆手机号（可带 +86）。test 环境固定 123456，有效期 300 秒、最多 5 次尝试；同手机号新挑战替换旧挑战，重启失效。正式环境需配置真实供应商。', None),
    'verify_code_endpoint': ('独立验证并消费验证码', '此接口成功会消费挑战。注册应直接调用 register，不要先 verify 后复用同一挑战。', VerifiedResponse),
    'register': ('注册并创建工作空间', '直接验证并消费挑战。当前赠送 1000 点；不自动登录，下一步调用 login。', RegistrationResponse),
    'login': ('登录并获取 Bearer token', '保存 access_token 与 workspace_id；有效期 12 小时，无刷新接口。401 后重新登录。', LoginResponse),
    'logout': ('注销当前 token', '仅注销当前 Bearer token，204 无响应体，不要解析 JSON。', None),
    'points_balance': ('查询点数余额', 'available 为可用，reserved 为任务预占；平台点数与上游实际费用是不同口径。', BalanceResponse),
    'point_ledger': ('查询最近点数账本', '按新到旧返回数组；points 为数额，方向由 kind 决定。仅 limit，无游标或 offset 分页。', LedgerResponse),
    'point_costs': ('查询当前操作点数报价', '返回 operation 到点数的映射，客户端不得写死报价。', None),
    'create_agent': ('创建数字员工', '默认 paused，不自动执行。此接口不支持幂等 key，超时后先查员工列表核对，避免重复创建。', AgentResponse),
    'list_agents': ('列出未删除员工', '直接返回员工数组。', AgentResponse),
    'agent_details': ('查询员工配置与状态', 'enabled 表示曾启用，不代表有任务运行或周期调度；任务状态以 Job 为准。', AgentResponse),
    'update_agent': ('修改员工配置', '只传待修改字段；可选字段 null 表示清空，name/instructions 不可清空。非空 PATCH 生成新版本，已提交任务不受影响。此写操作无幂等支持。', AgentResponse),
    'start_agent': ('按当前配置提交一次拓客任务', '无请求体。返回 Job，202 不表示完成。同员工只能有一个活动拓客任务。幂等请求身份仅含 agent_id，原 key 重放不会按新配置再跑。', JobResponse),
    'pause_agent': ('暂停员工并取消活动拓客任务', '无请求体。排队任务直接取消，运行任务进入 cancelling；上游调用不保证立即停止。', AgentResponse),
    'delete_agent': ('软删除员工并取消活动任务', '204 无响应体；员工后续不可查询/使用。', None),
    'list_jobs': ('查询最近任务', '直接返回数组，按新到旧。可按 agent_id 筛选；仅 limit，无游标或 offset 分页。', JobResponse),
    'job_details': ('查询任务状态与结果', 'queued/running/cancelling 继续轮询；succeeded/partial/failed/cancelled 停止。HTTP 200 也须检查 status/error。partial 保留可用结果与 warnings。', JobResponse),
    'job_leads': ('读取任务线索', '直接返回线索数组。空数组可能是尚未完成或无匹配，必须结合 Job.status 判断。', LeadResponse),
    'public_search': ('提交公域检索', '返回后台 Job，轮询 GET jobs/{id} 后读取 result.sources；会预占点数。', JobResponse),
    'create_report': ('为已有线索生成报告', 'job_id 是含线索源任务的 ID，lead_index 从 0 开始且须在实际 leads 内。返回报告 Job，其 id 即 report_id。', JobResponse),
    'report_details': ('查询报告与证据详情', '返回报告 Job；完成后 result.report 为正文，subject 为对象摘要。引用 source_ids 对应本报告自己的 sources。保留 evidence_status，摘要不等于已核实正文。', JobResponse),
    'enrich_buyer': ('付费匹配采购商或查询资料/联系方式', 'search 只传 buyer/buyer_country；profile/contacts 只传 match_job_id/company_id，必须选自本工作空间成功 buyer_search 结果。当前请求须明确确认付费。24 小时内相同请求可能复用活动或成功任务。上游日限 0 禁用新查询。', JobResponse),
    'customs_verification': ('付费核验海关交易', 'hs_code/product 至少一个；开始日期不晚于结束日期，结束不可为 9999-12-31。match_job_id/company_id 必须成对出现，使用已成功匹配结果覆盖 buyer/国家（buyer/国家仍必填）。当前请求须明确确认付费。只查一页，has_more 表示更多数据，暂无翻页接口。', JobResponse),
    'chat': ('同步处理一轮员工对话', '非流式 JSON。首次省略 conversation_id 创建会话，后续携带返回 ID。同员工同时只处理一轮。200 也须检查 status/error/tool_calls；工具失败不一定导致整轮失败。超时使用原 key/原请求重放，可能返回 running。已成功工具不会回滚；重启中断标记 agent_chat_interrupted，不自动重做。付费授权仅当前请求有效。支持通过对话记住/读取/忘记业务偏好，每员工最多 50 项，每项最多 2000 字符。', TurnResponse),
    'list_conversations': ('查询员工最近会话', '按新到旧返回数组，limit 限制条数。', ConversationResponse),
    'messages': ('分页读取完整对话轮次', '每页按时间升序；向前翻页以当前页第一项 id 作为 before。每项包含一次请求、回复和工具调用，不按 user/assistant 拆分。最近 20 轮进入模型上下文，完整历史可分页查询。', TurnResponse),
    'health': ('检查服务配置状态', '无需登录。ok 只表示服务能响应；configured 标志不证明数据库或上游连通。', HealthResponse),
}

ARRAY_RESPONSES = {'list_agents', 'list_jobs', 'job_leads', 'point_ledger', 'list_conversations', 'messages'}
KEY_REQUIRED = {'enrich_buyer', 'customs_verification', 'chat'}
JOB_SUBMISSIONS = {'start_agent', 'public_search', 'create_report', 'enrich_buyer', 'customs_verification'}

ERRORS = {
    'request_code': {503: ['verification_provider_unavailable']},
    'verify_code_endpoint': {400: ['invalid_or_expired_verification_code'], 503: ['verification_provider_unavailable']},
    'register': {400: ['invalid_or_expired_verification_code'], 409: ['account_already_exists'], 503: ['verification_provider_unavailable']},
    'login': {401: ['invalid_credentials']},
    'create_agent': {409: ['agent_limit_reached']},
    'update_agent': {422: ['invalid_agent_configuration']},
    'start_agent': {409: ['agent_run_in_progress']},
    'create_report': {404: ['lead_not_found']},
    'report_details': {404: ['report_not_found']},
    'enrich_buyer': {404: ['buyer_match_not_found'], 503: ['customs_provider_unavailable']},
    'customs_verification': {404: ['buyer_match_not_found'], 503: ['customs_provider_unavailable']},
    'chat': {409: ['agent_message_in_progress'], 404: ['conversation_not_found']},
    'messages': {404: ['conversation_not_found', 'message_not_found']},
}

REQUEST_EXAMPLES = {
    'request_code': {'phone': '13800138000'},
    'verify_code_endpoint': {'phone': '13800138000', 'challenge_id': 'replace-with-issued-challenge', 'code': '123456'},
    'register': {'phone': '13800138000', 'password': 'replace-with-password', 'challenge_id': 'replace-with-issued-challenge', 'code': '123456'},
    'login': {'phone': '13800138000', 'password': 'replace-with-password'},
    'create_agent': {'name': '美国LED拓客助手', 'instructions': '寻找美国LED采购商，保留公开证据', 'market': '美国', 'product': 'LED', 'target_count': 10},
    'update_agent': {'market': '美国', 'target_count': 5},
    'public_search': {'instructions': '查询美国LED公开采购机会'},
    'create_report': {'job_id': '0123456789abcdef0123456789abcdef', 'lead_index': 0},
    'enrich_buyer': {'action': 'search', 'buyer': 'Example Trading', 'buyer_country': 'US', 'confirm_paid': True},
    'customs_verification': {'buyer': 'Example Trading', 'buyer_country': 'US', 'product': 'LED', 'date_start': '2025-01-01', 'date_end': '2025-12-31', 'confirm_paid': True},
    'chat': {'content': '将目标市场改成美国，产品设为LED，帮我找10个采购商'},
}

JOB_EXAMPLE = {
    'id': '0123456789abcdef0123456789abcdef', 'agent_id': None, 'config_version': None,
    'operation': 'public_search', 'status': 'queued', 'point_cost': 1,
    'points_charged': 0, 'error': None, 'result': None, 'created_at': '2026-11-18T02:00:00Z',
}

TURN_EXAMPLE = {
    'id': '0123456789abcdef0123456789abcdef',
    'conversation_id': 'abcdef0123456789abcdef0123456789', 'status': 'succeeded',
    'content': '查询任务进度', 'response': '任务仍在排队，稍后可继续查询。', 'error': None,
    'tool_calls': [{'name': 'get_job', 'arguments': {'job_id': JOB_EXAMPLE['id']},
                    'status': 'succeeded', 'result': JOB_EXAMPLE}],
}

FIELD_DESCRIPTIONS = {
    'phone': '大陆手机号，可带 +86；服务端统一保存为 +86 格式。',
    'password': '密码长度 8～128，不得硬编码或写入日志。',
    'challenge_id': '申请验证码时返回的挑战 ID，注册或独立验证成功后消费。',
    'code': '用户收到的验证码；仅 test 环境固定 123456。',
    'name': '员工显示名称，1～80 字符。',
    'instructions': '用户业务要求；员工为 1～1600 字符，公域检索为 1～1000 字符。',
    'market': '目标市场，可为 null；PATCH 省略不修改，null 清空。',
    'product': '目标产品；海关请求中与 hs_code 至少提供一个。',
    'hs_code': '数字字符串；员工配置为 6～10 位，海关核验恰好 6 位，不要转为整数。',
    'target_count': '目标线索数 1～30，不保证可取得足量结果。',
    'job_id': '含线索的源任务 ID，32 字符。',
    'lead_index': '从 0 开始，须小于源任务实际 leads 长度。',
    'action': 'search=匹配企业；profile=企业资料；contacts=商务联系方式。',
    'buyer': '企业名称，1～200 字符。',
    'buyer_country': '两位大写国家代码，例如 US。',
    'arrival_country': '可选到达国，两位大写国家代码。',
    'match_job_id': '本工作空间已成功 buyer_search 任务的 ID，须与 company_id 成对提交。',
    'company_id': '选中匹配结果中的整数 company_id，范围 1～9007199254740991，不可自行猜测。',
    'confirm_paid': '必须由用户明确确认本次付费后设为 true；历史授权不适用于当前请求。',
    'date_start': '交易开始日 YYYY-MM-DD，含当天，不能晚于 date_end。',
    'date_end': '交易结束日 YYYY-MM-DD，含当天，不能为 9999-12-31。',
    'content': '当前用户消息，去空白后 1～8000 字符。',
    'conversation_id': '32 字符会话 ID；首次省略创建，后续传返回值以续聊。',
}


def install_openapi(application, *, routers=()):
    """Enrich only the documentation; keep endpoint validation and payloads unchanged."""
    def openapi():
        if application.openapi_schema is not None:
            return application.openapi_schema
        schema = get_openapi(title=application.title, version=application.version,
                             description=DESCRIPTION, routes=application.routes,
                             tags=[{'name': 'auth', 'description': '手机号注册、登录与当前 token 注销。'},
                                   {'name': 'workspaces', 'description': '工作空间隔离的员工、任务、报告和点数。'},
                                   {'name': 'agent-chat', 'description': '同步对话与工具调用，后台业务任务仍异步处理。'},
                                   {'name': 'company', 'description': '企业资料、共享记忆及企业介绍文档分析草案。'},
                                   {'name': 'customers', 'description': '历史客户发现记录，支持按员工筛选。'}])
        models = {item[2] for item in OPERATIONS.values() if item[2]} | {ErrorResponse}
        _, definitions = models_json_schema([(model, 'serialization') for model in sorted(models, key=lambda m: m.__name__)],
                                             ref_template='#/components/schemas/{model}')
        components = schema.setdefault('components', {}).setdefault('schemas', {})
        components.update(definitions['$defs'])
        # Native response models document the newer company/customer routes directly.
        for path, methods in schema['paths'].items():
            if '/company/' not in path:
                continue
            for operation in methods.values():
                for media, content in operation.get('requestBody', {}).get('content', {}).items():
                    if media == 'multipart/form-data':
                        content['examples'] = {'upload': {'value': {'file': '(企业介绍.pdf 的二进制内容)'}}}
                    else:
                        reference = content.get('schema', {}).get('$ref', '').rsplit('/', 1)[-1]
                        examples = components.get(reference, {}).get('examples', [])
                        if examples:
                            content['examples'] = {'default': {'value': examples[0]}}
        # Recent FastAPI versions retain included routers as lazy wrappers in app.routes.
        # Inspect the original public routers as well, without relying on private wrappers.
        routes = {route.unique_id: route for group in [application, *routers] for route in group.routes
                  if isinstance(route, APIRoute) and route.include_in_schema}
        for route in routes.values():
            if not isinstance(route, APIRoute) or route.name not in OPERATIONS:
                continue
            name = route.name
            summary, description, response_model = OPERATIONS[name]
            for method in route.methods:
                operation = schema['paths'][route.path_format][method.lower()]
                operation.update(summary=summary, description=description)
                code = str(route.status_code or 200)
                if response_model:
                    response_schema = {'$ref': f'#/components/schemas/{response_model.__name__}'}
                    if name in ARRAY_RESPONSES:
                        response_schema = {'type': 'array', 'items': response_schema}
                    operation['responses'][code] = {'description': description, 'content': {'application/json': {'schema': response_schema}}}
                    if response_model in {JobResponse, TurnResponse}:
                        example = JOB_EXAMPLE if response_model is JobResponse else TURN_EXAMPLE
                        if name in JOB_SUBMISSIONS:
                            operation_name = {'start_agent': 'prospecting', 'public_search': 'public_search',
                                              'create_report': 'report', 'enrich_buyer': 'buyer_search',
                                              'customs_verification': 'customs_verification'}[name]
                            example = {**example, 'operation': operation_name}
                            if name == 'start_agent':
                                example.update(agent_id='abcdef0123456789abcdef0123456789', config_version=1)
                        operation['responses'][code]['content']['application/json']['example'] = (
                            [example] if name in ARRAY_RESPONSES else example)
                elif name == 'point_costs':
                    operation['responses'][code]['content'] = {'application/json': {'schema': {
                        'type': 'object', 'additionalProperties': {'type': 'integer', 'minimum': 0}},
                        'example': {'prospecting': 1, 'public_search': 1, 'report': 3,
                                    'buyer_search': 1, 'buyer_profile': 1, 'buyer_contacts': 1, 'customs_verification': 1}}}
                if name in REQUEST_EXAMPLES:
                    operation['requestBody']['content']['application/json']['examples'] = {
                        'default': {'summary': '示例值；实际调用须替换账号及业务 ID', 'value': REQUEST_EXAMPLES[name]}}
                if name == 'enrich_buyer':
                    for action in ('profile', 'contacts'):
                        operation['requestBody']['content']['application/json']['examples'][action] = {'value': {
                            'action': action, 'match_job_id': '0123456789abcdef0123456789abcdef',
                            'company_id': 123, 'confirm_paid': True}}
                for parameter in operation.get('parameters', []):
                    if parameter['name'].lower() == 'idempotency-key':
                        parameter.update(description=IDEMPOTENCY, required=name in KEY_REQUIRED,
                                         example='e70aa7bff27d43bca1f082a64b768dc2')
                        parameter['schema'] = {'type': 'string', 'minLength': 1, 'maxLength': 64, 'pattern': '^[a-z0-9._-]+$'}
                    elif parameter['name'] == 'workspace_id':
                        parameter['description'] = '使用登录响应的 workspace_id；无权访问时返回 404。'
                    elif parameter['name'] == 'before':
                        parameter['description'] = '当前页第一项消息轮次 id，向前读取更早消息，返回页按时间升序。'
                    elif parameter['name'] == 'limit':
                        parameter['description'] = '最多返回条数，默认 50，范围 1～100。'
                errors = {}
                def add_errors(status, values):
                    errors.setdefault(str(status), []).extend(values)
                if operation.get('security'):
                    add_errors(401, ['authentication_required'])
                if 'workspace_id' in route.path_format:
                    add_errors(404, ['workspace_not_found'])
                if 'agent_id' in route.path_format and name != 'list_jobs':
                    add_errors(404, ['agent_not_found'])
                if 'job_id' in route.path_format or name in {'create_report', 'report_details', 'enrich_buyer', 'customs_verification'}:
                    add_errors(404, ['job_not_found'])
                if name != 'health':
                    add_errors(503, ['database_not_configured'] if name not in {'request_code', 'verify_code_endpoint'} else [])
                if name in JOB_SUBMISSIONS:
                    add_errors(409, ['insufficient_points', 'idempotency_key_conflict'])
                    add_errors(429, ['job_queue_limit'])
                if name == 'chat':
                    add_errors(409, ['idempotency_key_conflict'])
                if name in KEY_REQUIRED:
                    add_errors(422, ['idempotency_key_required'])
                if name in {'request_code', 'verify_code_endpoint', 'register', 'login'}:
                    add_errors(422, ['invalid_mainland_china_mobile'])
                for status, values in ERRORS.get(name, {}).items():
                    add_errors(status, values)
                for status, values in errors.items():
                    if not values:
                        continue
                    content_schema = {'$ref': '#/components/schemas/ErrorResponse'}
                    if status == '422':
                        content_schema = {'anyOf': [content_schema, {'$ref': '#/components/schemas/HTTPValidationError'}]}
                    operation['responses'][status] = {
                        'description': '可能的错误码：' + ', '.join(dict.fromkeys(values)) + ('；也可能是字段校验 detail 数组。' if status == '422' else ''),
                        'content': {'application/json': {'schema': content_schema,
                                    'examples': {value: {'value': {'detail': value}} for value in dict.fromkeys(values)}}}}
        # Add field semantics to generated request schemas, preserving automatic constraints.
        request_models = {'CodeRequest', 'CodeVerification', 'Registration', 'Login', 'AgentConfig',
                          'AgentConfigPatch', 'PublicSearch', 'ReportRequest', 'BuyerRequest',
                          'CustomsVerificationRequest', 'ChatRequest'}
        for model in request_models:
            for field, value in components.get(model, {}).get('properties', {}).items():
                if field in FIELD_DESCRIPTIONS:
                    value['description'] = FIELD_DESCRIPTIONS[field]
        application.openapi_schema = schema
        return schema

    application.openapi = openapi
