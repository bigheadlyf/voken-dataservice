# 微元 API 集成指南（供开发者与 Codex 使用）

本文按当前仓库的 `app/auth.py`、`app/workspaces.py`、`app/chat.py`、`app/company.py`、`app/customers.py` 整理。接入已部署服务时，先读取该环境的 `/openapi.json` 确认版本；本地新增接口不代表服务器已部署。

## 1. 连接信息与集成入口

| 项目 | 约定 |
| --- | --- |
| Base URL | 由服务提供方给出，不包含 `/api/v1`，末尾不带 `/` |
| 本地开发脚本 | `http://127.0.0.1:18000` |
| 默认 uvicorn 启动 | `http://127.0.0.1:8000` |
| 接口定义 | `GET /openapi.json`；交互文档 `/docs`；备用文档 `/redoc` |
| 健康检查 | `GET /health`，无须登录 |
| 业务前缀 W | `/api/v1/workspaces/{workspace_id}`，下文 `W` 须替换成此完整路径 |
| 请求格式 | JSON，带请求体时使用 `Content-Type: application/json` |
| 业务鉴权 | `Authorization: Bearer <access_token>` |

OpenAPI 包含集成顺序、幂等与付费授权约定、各接口说明、请求示例、成功响应 schema 和错误码，可直接交给 Codex 或用于生成客户端类型。响应中的动态上游记录仍可能增减字段，客户端应容忍新增字段；以目标环境实际发布的 OpenAPI 为准。

若设置 `WEB_PREFIX`，文档、测试台及健康检查入口增加此前缀（例如 `/api/openapi.json`），业务路径仍是 `/api/v1/...`，不要重复拼接前缀。

客户端只调用微元 API。DeepSeek、跨境魔方的密钥由服务端管理。开发服务器地址见 [部署说明](./开发服务器部署.md)，其中版本记录为部署时快照。

## 2. 可直接交给 Codex 的集成任务

将本文提供给调用方项目中的 Codex，并填写以下提示词中的连接信息：

```text
请在当前项目集成微元 API，遵循随附的 API集成指南.md。
Base URL：<服务提供方给出的地址>
目标功能：<例如：创建数字员工、提交拓客任务、展示线索与报告>
先读取目标环境的 /openapi.json，核对本文涉及的接口是否已部署。
沿用项目现有语言、网络请求库、配置与测试方式，封装独立的 API 客户端。
通过配置传入 Base URL；手机号、密码与 token 不得硬编码或写入日志。
登录后保存 workspace_id；业务请求统一带 Bearer token。
异步提交持久保存业务操作 ID、Idempotency-Key 和请求内容，重试使用原 key 和原请求。
key 使用小写 UUID；不同业务操作用新 key，不要在每次 HTTP 重试时重新生成。
202 仅代表已受理，轮询 job，处理 partial/failed/cancelled，保留 warnings 和证据来源。
HTTP 200 的对话也要检查 status/error/tool_calls，工具返回 queued 不代表业务完成。
付费采购商和海关查询只有用户明确确认后才传 confirm_paid=true。
不要假设有刷新 token、SSE、Webhook、自动周期拓客或未列出的接口。
补齐适合当前项目的验证，使用 mock 覆盖超时重放、401、409、partial 和对话工具失败。
真实联调先验证健康检查、登录和只读接口；业务调用按目标功能执行。
```

## 3. 注册、登录与会话

以下路径均相对 Base URL，无须业务前缀 W。

| 方法与路径 | 请求体 | 成功响应 |
| --- | --- | --- |
| `POST /api/v1/auth/verification-codes` | `{"phone":"13800138000"}` | 201：`challenge_id`、`expires_in_seconds` |
| `POST /api/v1/auth/register` | `phone`、`password`、`challenge_id`、`code` | 201：`user_id`、`workspace_id`、`granted_points` |
| `POST /api/v1/auth/verification-codes/verify` | `phone`、`challenge_id`、`code` | 200：`{"verified":true}`，会消费挑战 |
| `POST /api/v1/auth/login` | `phone`、`password` | 200：见下例 |
| `POST /api/v1/auth/logout` | 无；必须带 Bearer token | 204，无响应体 |

手机号仅接受大陆手机号，可带 `+86`，服务端统一保存为 `+86` 格式。密码长度 8～128。注册直接验证并消费挑战，**不要先调用 verify 再使用同一挑战注册**。注册不自动登录，当前赠送 1000 点。

`APP_ENV=test` 的内存验证码为 `123456`，有效期 300 秒，最多尝试 5 次；同一手机号申请新挑战会替换旧挑战，重启后挑战失效。正式环境需要真实验证码供应商，未配置时返回 503。

登录响应示意（ID、token 均为占位值）：

```json
{
  "access_token": "<token>",
  "token_type": "bearer",
  "workspace_id": "<workspace_id>",
  "expires_in": 43200
}
```

token 有效期 12 小时；没有刷新 token 接口。401 时重新登录，退出只注销当前 token。跨账号工作空间访问返回 404。不要自行构造工作空间 ID。

## 4. 完整业务接口索引

以下所有路径均以 W 为前缀，均需 Bearer token。员工、任务、会话及记忆列表直接返回 JSON 数组；历史客户列表返回 items/next_cursor。除明确列出的查询参数外，不支持通用 page/offset 分页。

| 方法与路径 | 用途 / 参数 | 成功状态 |
| --- | --- | --- |
| `GET W/points` | 可用、预占点数 | 200 |
| `GET W/points/ledger` | 最近账本；`limit=50`，范围 1～100 | 200 |
| `GET W/points/costs` | 各 operation 当前点数报价 | 200 |
| `POST W/agents` | 创建员工，见配置字段 | 201 |
| `GET W/agents` | 未删除员工列表 | 200 |
| `GET W/agents/{agent_id}` | 员工详情 | 200 |
| `PATCH W/agents/{agent_id}` | 仅提交待修改字段 | 200 |
| `POST W/agents/{agent_id}/runs` | 无请求体，提交一次拓客任务 | 202 |
| `POST W/agents/{agent_id}/pause` | 无请求体，暂停并请求取消该员工活动任务 | 200 |
| `DELETE W/agents/{agent_id}` | 软删除并取消活动任务 | 204 |
| `GET W/jobs` | 最近任务；可选 `agent_id`，`limit=50`（1～100） | 200 |
| `GET W/jobs/{job_id}` | 任务状态和结果 | 200 |
| `GET W/jobs/{job_id}/leads` | 线索数组，未产生线索时为空 | 200 |
| `POST W/public-searches` | `{"instructions":"查询美国LED采购机会"}`，长度 1～1000 | 202 |
| `POST W/reports` | `{"job_id":"<源任务id>","lead_index":0}` | 202 |
| `GET W/reports/{report_id}` | 报告任务详情；report_id 即创建时返回的 job.id | 200 |
| `POST W/buyer-enrichments` | 采购商匹配、资料、联系方式，见第 9 节 | 202 |
| `POST W/customs-verifications` | 海关核验，见第 9 节 | 202 |
| `POST W/agents/{agent_id}/messages` | 同步处理一轮对话，见第 8 节 | 200 |
| `GET W/agents/{agent_id}/conversations` | 最近会话，`limit=50`（1～100） | 200 |
| `GET W/agents/{agent_id}/conversations/{conversation_id}/messages` | 最近消息轮次，`limit=50`（1～100），可选 `before=<消息id>` | 200 |

## 5. 数字员工配置

```json
{
  "name": "美国LED拓客助手",
  "instructions": "寻找美国LED采购商，保留公开证据和商务联系方式",
  "market": "美国",
  "product": "LED",
  "hs_code": "853950",
  "target_count": 10
}
```

| 字段 | 创建必填 | 约束 |
| --- | --- | --- |
| name | 是 | 1～80 字符 |
| instructions | 是 | 1～1600 字符 |
| market | 否 | 最多 100 字符，可为 null |
| product | 否 | 最多 150 字符，可为 null |
| hs_code | 否 | 6～10 位数字字符串，可为 null |
| target_count | 否 | 整数 1～30，可为 null |

创建、查询、更新、暂停均返回 `{"id":"...","status":"paused","config_version":1,"config":{...}}` 结构。创建默认 `paused`，提交 runs 后为 `enabled`。每次非空 PATCH 生成新配置版本，已提交任务保留提交时配置快照。PATCH 中省略表示不修改，可选字段传 null 表示清空；name/instructions 不能清空。

提交 runs 只启动一次任务，`enabled` 不表示周期运行。同一员工只能有一个 queued/running/cancelling 拓客任务。

## 6. 幂等、超时与任务状态

`Idempotency-Key` 长度 1～64，字符限于 `a-z`、`0-9`、`.`、`_`、`-`，推荐 `uuid.uuid4().hex`。

- runs、public-searches、reports 可选，但集成客户端应始终提供。
- buyer-enrichments、customs-verifications、messages 必填，缺少返回 422。
- 同一工作空间的任务提交共享 key 命名空间；对话轮次另有同工作空间的 key 约束。客户端统一为每次逻辑操作生成唯一 key，保存后复用。
- 相同 key、相同操作和参数返回已有记录；相同 key 搭配不同操作或参数返回 409 `idempotency_key_conflict`。runs 的请求身份只含 agent_id，同 key 重放不会按新配置再跑一次。
- 请求超时或连接中断不等于未受理。使用原 key、原请求重放并查询返回记录。无幂等支持的创建员工等操作不要盲目重试，应先查列表核对。

所有 202 接口返回统一 Job 结构，重放也返回 202（已有 job 可能已完成）：

```json
{
  "id": "0123456789abcdef0123456789abcdef",
  "agent_id": null,
  "config_version": null,
  "operation": "public_search",
  "status": "queued",
  "point_cost": 1,
  "points_charged": 0,
  "error": null,
  "result": null,
  "created_at": "2026-11-18T02:00:00Z"
}
```

| 状态 | 客户端行为 |
| --- | --- |
| queued / running / cancelling | 继续轮询；cancelling 尚未取消完成 |
| succeeded | 终态，读取结果；仍可能是没有匹配记录 |
| partial | 终态，显示可用结果、覆盖不足和 warnings |
| failed | 终态，显示 error，停止轮询 |
| cancelled | 终态，停止轮询 |

建议每 1～5 秒 GET job，设置轮询总时限；本地等待超时后保留 job_id 供稍后恢复查询，不自动再提交新任务。暂停/删除通过员工接口进行，没有独立的 job cancel API。暂停返回不保证运行中的上游调用立即停止。

## 7. 结果、报告与点数

`result` 在排队时可为 null，执行中可能是中间结果；完成后按 operation 读取：

| operation | 主要结果字段 |
| --- | --- |
| prospecting | `leads`、`sources`、`criteria`、`public_demand_count`、`coverage` |
| public_search | `sources`、`criteria`、`coverage` |
| report | `report`、`sources`、`criteria`、`coverage` |
| buyer_search / buyer_profile / buyer_contacts | `buyer.records` 及来源元数据 |
| customs_verification | `customs.records` 及来源元数据 |

结果还可有 `retrieved_at`、`warnings`。空数组不代表尚未完成，应结合 job.status。`coverage` 当前可见 matches/no_matches/limited/unavailable/one_page，客户端保留未知值。

线索含 `name`、`location`、`role`、`reason`、`quote`、`contact`、`source`、`evidence_type` 等字段。`evidence_type=public_demand_signal` 表示公开采购信号，其他线索应按潜在客户展示。不得把潜在客户或历史交易描述为已确认的当前采购需求。

创建报告时 `job_id` 为已有含线索任务的 32 字符 ID，`lead_index` 从 0 开始，范围 0～29，且必须落在实际返回的 leads 内。创建成功返回报告 Job。轮询完成后调用 `/reports/{id}` 获取展示详情：`result.subject` 为对象摘要，`result.report` 含 `overview`、`opportunity`、`highlights`、`risks`、`next_steps`、`source_ids`。每条 highlight 含 `text` 和 `source_ids`。

展示证据链接，并区分 source.evidence_status：text_available（取得正文）、summary_only（仅摘要）、link_only（仅链接）、fetch_failed（抓取失败）。报告引用编号对应报告自己的 sources，不能拿源拓客任务的 sources 替代。

`GET /points` 返回 `available`、`reserved`、`points_per_100_cny`（当前 1000）。`GET /points/costs` 返回 operation 到点数的映射，不能将示例中的 1 写死为报价。提交任务预占；成功，或有可交付结果的 partial 按任务 point_cost 结算；失败、取消及无可交付结果的 partial 释放预占。账本为数组，项含 `kind`（grant/reserve/charge/release）、`points`、`reference`、`created_at`；points 为数额，正负方向须由 kind 判断。平台点数与上游供应商实际费用是两种口径。

## 8. 数字员工对话

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/messages
Authorization: Bearer <token>
Idempotency-Key: chat-001
Content-Type: application/json

{"content":"将目标市场改成美国，产品设为LED，帮我找10个采购商"}
```

`content` 去空白后 1～8000 字符。首次省略 conversation_id 创建会话；后续传返回的 32 字符 conversation_id。confirm_paid 默认为 false，只对当前请求有效。

响应结构示意：

```json
{
  "id": "<消息轮次id>",
  "conversation_id": "<会话id>",
  "status": "succeeded",
  "content": "查看刚才任务进度",
  "response": "任务仍在执行中",
  "tool_calls": [],
  "error": null
}
```

这是同步 JSON 接口，没有流式事件。status 为 running/succeeded/failed；同 key 重放可能读到正在处理的 running 轮次，稍后用原 key 重放或查询会话消息。一个员工同时只处理一轮，其他消息返回 409 `agent_message_in_progress`。建议给对话请求配置较长的读取超时，超时后遵守原 key 重放规则。

tool_calls 项含 `name`、`arguments`、`status`，已结束工具还含 `result`。工具执行失败不一定使整轮 status 失败；HTTP 200 也不能代替对 status/error/工具结果的检查。工具提交任务时，其 result 为 Job，提取 id 后独立轮询。

LLM 失败前完成的操作仍生效，检查 tool_calls 后再决定下一步。重启会将未完成轮次标记 failed，error 为 `agent_chat_interrupted`；不会自动重做。不要用新 key 盲目重发整个原始操作，可发新消息查询已有配置和任务。

会话列表返回 `[{"id":"...","created_at":"...Z"}]`，按新到旧。消息列表返回轮次数组，每页按时间升序；向前翻页用当前页第一项 id 作为 before。每项是完整的一轮请求和回复，不是按 user/assistant 拆分的消息。员工个人长期记忆尚无独立 HTTP CRUD，可通过对话要求记住、读取、忘记业务偏好；个人记忆按员工隔离。企业共享资料和记忆另有 HTTP CRUD，见后文。

## 9. 采购商增强和海关核验

这些请求可能触发上游付费调用，必须同时提供有效 Idempotency-Key 与 JSON 字段 `confirm_paid: true`，仅在用户明确确认后提交。

先匹配采购商：

```json
{"action":"search","buyer":"Example Trading","buyer_country":"US","confirm_paid":true}
```

POST 到 `W/buyer-enrichments`，轮询到 succeeded 后，从 `result.buyer.records` 中选取真实 company_id。资料和联系方式请求如下；company_id 示例须替换为选中记录的整数 ID：

```json
{"action":"profile","match_job_id":"0123456789abcdef0123456789abcdef","company_id":123,"confirm_paid":true}
```

联系方式改为 `action: "contacts"`。search 必须传 buyer 和 buyer_country，不能传 match_job_id/company_id；profile/contacts 必须传 match_job_id/company_id，不能传 buyer/buyer_country。match_job_id 必须指向当前工作空间内已成功的 buyer_search 任务，company_id 必须来自该任务结果，范围 1～9007199254740991。相同增强请求在 24 小时内可能复用活动或成功任务，即使提交新 key 也未必生成新 job。

海关核验 POST 到 `W/customs-verifications`：

```json
{
  "buyer": "Example Trading",
  "buyer_country": "US",
  "product": "LED",
  "date_start": "2025-01-01",
  "date_end": "2025-12-31",
  "confirm_paid": true
}
```

buyer 长度 1～200，国家为两位大写代码；可选 arrival_country 同格式。hs_code（恰好 6 位数字字符串）与 product（1～150 字符）至少传一个。日期为 YYYY-MM-DD，开始不晚于结束，结束不能为 9999-12-31。可同时传 match_job_id 和 company_id，服务端以选中的采购商记录覆盖 buyer/国家；这两个字段必须成对出现，buyer/国家本身仍必填。

每个任务仅查一页交易记录，`result.customs.has_more` 标明是否还有数据，目前没有翻页接口。增强结果的 `buyer.has_more` 也可能标记更多匹配。保留 `source`、`request_id`、`reported_milli_cny` 等元数据；缺少费用回传时为 null，不应展示为零费用。

上游付费调用默认全平台按 UTC 自然日限 5 次，可由服务端调整。当前实现 `UPKUAJING_DAILY_CALL_LIMIT=0` 会禁用这些接口的新任务，返回 `customs_provider_unavailable`，不是无限额。超过调用上限也可能在任务执行阶段失败，检查 job.error。对话中付费工具同样要求当前消息 confirm_paid=true，历史消息或模型生成的确认不能替代它。

## 10. 错误处理

HTTP 业务错误通常为 `{"detail":"error_code"}`；FastAPI 字段校验错误为 `{"detail":[{"loc":[...],"msg":"...","type":"..."}]}`。两种格式都须支持。任务业务失败通常通过 GET job 的 HTTP 200 返回 status/error；对话失败也可能为 HTTP 200。

| HTTP | 常见 detail | 建议处理 |
| --- | --- | --- |
| 400 | invalid_or_expired_verification_code | 重新申请验证码 |
| 401 | invalid_credentials / authentication_required | 检查登录信息或重新登录 |
| 404 | workspace_not_found / agent_not_found / job_not_found / lead_not_found / report_not_found / conversation_not_found / message_not_found / buyer_match_not_found | 检查当前账号、工作空间和 ID |
| 409 | account_already_exists | 使用已有账号登录 |
| 409 | insufficient_points / agent_limit_reached | 展示限制，停止自动提交 |
| 409 | idempotency_key_conflict | 修正客户端 key 与请求映射，不能直接换 key 重试 |
| 409 | agent_run_in_progress / agent_message_in_progress | 查询现有任务或等待当前轮次 |
| 422 | idempotency_key_required / invalid_mainland_china_mobile / invalid_agent_configuration，或校验数组 | 修正请求字段 |
| 429 | job_queue_limit | 等活动任务减少后，使用原 key 重试 |
| 503 | database_not_configured / verification_provider_unavailable / customs_provider_unavailable | 联系服务维护者检查配置 |

对话工具内的错误（如 paid_confirmation_required、invalid_tool_arguments、agent_memory_limit）在 tool_calls[].result.error 中读取。网络错误和 5xx 应使用有限次退避重试，仅对 GET 或已有幂等 key 的提交自动重试。不要无限轮询或自动重试可能重复生效的写操作。

## 11. 可运行的 Python 最小示例

示例使用已有账号，创建员工并提交一次拓客，会预占平台点数。依赖 `pip install httpx`。通过调用方环境注入 `VOKEN_BASE_URL`、`VOKEN_PHONE`、`VOKEN_PASSWORD`。此脚本是一次性演示；生产集成须在发请求前持久保存操作 key 与 job_id，以便进程重启后恢复。

```python
import os
import time
import uuid

import httpx

terminal = {"succeeded", "partial", "failed", "cancelled"}
base = os.environ["VOKEN_BASE_URL"].rstrip("/")
with httpx.Client(base_url=base, timeout=30.0) as api:
    def request(method, path, **kwargs):
        response = api.request(method, path, **kwargs)
        response.raise_for_status()
        return response.json() if response.status_code != 204 else None

    auth = request("POST", "/api/v1/auth/login", json={
        "phone": os.environ["VOKEN_PHONE"],
        "password": os.environ["VOKEN_PASSWORD"],
    })
    api.headers["Authorization"] = f"Bearer {auth['access_token']}"
    w = f"/api/v1/workspaces/{auth['workspace_id']}"
    agent = request("POST", f"{w}/agents", json={
        "name": "LED拓客助手", "instructions": "寻找美国LED采购商并保留公开证据",
        "market": "美国", "product": "LED", "target_count": 5,
    })
    key = uuid.uuid4().hex  # 保存此 key；HTTP 超时重放时必须复用
    job = request("POST", f"{w}/agents/{agent['id']}/runs",
                  headers={"Idempotency-Key": key})
    print("job_id:", job["id"], flush=True)
    deadline = time.monotonic() + 300
    while job["status"] not in terminal:
        if time.monotonic() >= deadline:
            raise TimeoutError(f"稍后用已有 job_id 继续查询：{job['id']}")
        time.sleep(2)
        job = request("GET", f"{w}/jobs/{job['id']}")
    print("status:", job["status"], "error:", job.get("error"))
    result = job.get("result") or {}
    print("warnings:", result.get("warnings", []))
    leads = request("GET", f"{w}/jobs/{job['id']}/leads")
    print("lead_count:", len(leads))
```

## 12. 接入验收

- 健康检查成功后，使用目标环境 OpenAPI 核对所需接口；health 的 ok 只表示进程可响应，不证明上游或数据库连通。
- 登录后用返回的 workspace_id 查询点数和员工；401 能回到登录，204 不解析 JSON。
- 相同 key 重放得到原任务；变更参数使用同 key 能识别 409；超时后能恢复已有 job。
- 展示 queued/running/cancelling 以及全部终态；partial 保留结果与 warnings，失败后停止轮询。
- 报告使用真实 lead_index；对话保留 conversation_id，工具提交的 job 能继续查询。
- 付费查询按当前请求确认；敏感信息不出现在源码、日志和界面错误中。

维护接口时同步更新本文；请求字段以目标服务 OpenAPI 为准，响应行为可对照仓库 `tests/test_service.py`、`tests/test_chat.py`。
## 企业资料、共享记忆与历史客户

以下接口统一使用 `/api/v1/workspaces/{workspace_id}` 前缀及 Bearer token。共享资料和记忆由工作空间持有，所有员工在每轮对话中读取；删除员工不会删除这些数据。员工原有的个人长期记忆继续按 agent_id 隔离。

| 方法与路径（省略前缀） | 说明 |
| --- | --- |
| `GET /company/profile` | 企业资料，未创建时 version=0 |
| `PUT /company/profile` | 创建/完整替换；必传 expected_version，未传字段清空 |
| `PATCH /company/profile` | 局部更新；必传 expected_version，null 清空字段 |
| `DELETE /company/profile?expected_version=1` | 清空资料，版本递增，不删除共享记忆 |
| `GET /company/memories` | 所有共享记忆，最多 100 项 |
| `POST /company/memories` | 新增记忆，key 在公司内唯一 |
| `GET /company/memories/{memory_id}` | 读取单项及来源 |
| `PATCH /company/memories/{memory_id}` | 更正，必传 expected_version；不支持修改 key |
| `DELETE /company/memories/{memory_id}?expected_version=1` | 忘记，后续对话不再加载；历史对话不改写 |
| `POST /company/document-analyses` | multipart/form-data 文件字段 file，返回分析草案 |
| `GET /company/document-analyses/{analysis_id}` | 读取草案、原文引文及采用状态 |
| `POST /company/document-analyses/{analysis_id}/apply` | 无请求体，确认采用整份草案；重复调用不重复导入 |
| `GET /customers?agent_id=...&limit=50&cursor=...` | 历史客户发现记录，agent_id 可省略查询全部 |
| `GET /customers/{customer_id}` | 单条历史记录，customer_id 格式为 job_id:lead_index |

企业资料字段均为字符串或 null：`name`、`website`、`industry`、`description`、`products`、`advantages`、`target_markets`、`sales_boundaries`、`contact_details`。示例：

```json
{"expected_version":0,"name":"星途照明","products":"20W 商用筒灯","sales_boundaries":"认证与交期尚待核实，报价和样品由销售负责人确认"}
```

新增共享记忆示例：

```json
{"key":"main_product","title":"主推产品","content":"20W 商用 LED 筒灯，主要用于办公楼","verification_status":"unverified"}
```

记忆状态为 `unverified` 或 `confirmed`，默认未核实。更正正文后默认恢复未核实；只有调用方明确传 confirmed 才标记为已确认。PATCH 允许 title、content、verification_status 和 expected_version；字段不可设为 null。资料和记忆版本不匹配返回 `409 company_version_conflict`，重新读取后再操作。

文档支持 UTF-8/GB18030 的 TXT、MD、DOCX 和文字型 PDF，最多 5 MiB、提取文本 60000 字符，PDF 最多 100 页。扫描 PDF 不支持 OCR，加密 PDF 不支持。原始文件不落库，提取文本发送给服务端配置的 LLM，草案及相关短引文保存在本工作空间。该分析同步返回，暂不扣平台点数，供应商模型可能计费；客户端需要足够长的响应超时，上传失败后不会自动采用任何事实。

分析返回 `id`、`filename`、`proposal.profile`、`proposal.profile_evidence`、`proposal.memories`、`base_profile_version`、`created_at`、`applied_at`。每项记忆带原文 evidence，导入后一律为未核实；引用原文只能证明来自该文档，不能证明外部真实性。前端先展示草案供检查，再调用 apply。若只需部分字段，调用资料/记忆 CRUD 保存选定项，不调用整份 apply。

采用草案会合并其非空资料字段（保留其他字段），新增草案记忆。资料版本已变化返回 `409 company_version_conflict`；已有同 key 记忆返回 `409 company_memory_key_conflict`；超过 100 项返回 `409 company_memory_limit`。任一冲突整次回滚，不部分写入、不覆盖已有同 key 记忆。成功采用的草案再次调用只返回原采用状态；即使之后忘记了记忆，也不会重建。

文档常见错误：`413 document_too_large` / `document_text_too_large`、`415 unsupported_document_type`、`422 invalid_document` / `document_has_no_readable_text` / `encrypted_document_not_supported`、`502 invalid_company_analysis`。未配置模型为 `503 deepseek_not_configured`，其他模型错误为 502。分析不是幂等提交；网络中断后重新上传可能再次调用模型并生成另一份草案，已有 analysis_id 时优先 GET 查询。

历史客户接口返回 `{items: [...], next_cursor: null或字符串}`，每项有 `id`、`agent_id`、`job_id`、`config_version`、`lead_index`、`lead`、`created_at`、`finished_at`。直接读取持久化且已终结的 prospecting 任务结果，无需重新跑任务或迁移旧线索；排除尚在运行的中间结果。按任务创建时间倒序，任务内序号升序。下一页携带原 agent_id 和 next_cursor，limit 为 1～100。更换 agent_id 后需从首页开始；非法游标返回 `422 invalid_customer_cursor`。

这些是历史发现记录，同一企业在不同任务中可以重复出现；目前没有实现 CRM 合并、客户分配或邮件跟进。员工软删除后仍可按原 agent_id 查询，指定不存在或属于其他工作空间的 agent_id 返回空列表。客户详情保留原始 lead 中的来源、采购证据类型和联系方式，不将潜在匹配表述为已确认采购。

