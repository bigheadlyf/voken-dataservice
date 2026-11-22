# 微元 1.0 服务端

最新界面细化与 API 验收：177 项后端回归、10 条浏览器端到端用例和 4 组前端检查通过；接口目录整理为 116 个操作、123 个模型。复现命令、前台调用对应关系和第三方验收边界见 [前台 API 集成与端到端验收](./docs/前台API集成与端到端验收.md)。

前端 `/app` 已接入 React、TypeScript 与 Ant Design：新增响应式导航、业务概况、企业／联系人表格、筛选视图、客户详情抽屉、评审与批量跟进弹窗、任务列表。复杂业务表单通过兼容层继续使用现有接口与确认逻辑。前端源码位于 `frontend/`，修改后运行 `npm ci`、`npm run build`；构建产物继续由 FastAPI 提供。启动、迁移边界和验证命令见 [前端说明](./frontend/README.md)。本轮为本地改造，未发布生产。

新增客户工作台 `/app#workbench`：企业／联系人双视图、岗位候选、独立邮箱验证历史、保存筛选、重复提示、产品客群推荐、名单预览导入、回复归档与多轮跟进提醒。采用新增记录表，既有客户和历史任务不回填、不合并；启用需迁移至 `0015` 并重启服务，外部邮箱验证与 IMAP 默认未配置。功能、配置与限制见[工作台优化验收](./docs/竞品驱动客户工作台优化验收-20261121.md)。本轮未迁移现有业务库或部署生产。

TradeWind 已登录产品的功能与真实获客样本对标、数据质量修复及接入优先级见 [TradeWind 实测对标](./docs/TradeWind实测对标与获客能力差距-20261121.md)。本轮比较区分独立企业、联系人和可用邮箱；尚未接入 TradeWind API。

AI 拓客工作台入口为 `/app`（测试与生产环境均提供）。在已有搜索与跨境魔方任务基础上，新增客户管线、名单导入/导出、跟进与拒绝联系、开发信草稿、有限次周期发现，以及公域缓存与用量核对。先执行 `python -m alembic upgrade head`。详见 [工作台运行手册](./docs/AI拓客工作台运行手册.md) 和 [竞品与低成本实施方案](./docs/AI外贸拓客竞品与低成本实施方案-20261120.md)。邮件由用户审阅后通过自有邮箱发送；正式私测账号可使用 `python -m app.operator provision` 开通。

全球情报源已提供 GLEIF、TED、世界银行采购、Companies House 原生接口（英国登记需密钥），以及 13 个官方站点限定搜索入口；接入模式、费用与核验边界见[全球公开情报源目录](./docs/全球公开情报源目录与接入策略-20261120.md)。找客任务可选 `public_sources:["ted"]` 加入官方招标候选，默认不启用。保存客户后可公域查证并直接提取正文中出现的邮箱，须人工核对主体后采用。

新增企业共享知识接口：`/company/profile` 支持资料读写/清空，`/company/memories` 支持共享记忆增删改查，`/company/document-analyses` 支持上传 TXT/MD/DOCX/文字型 PDF 自动提取草案并确认采用。所有路径使用工作空间业务前缀。`GET /customers` 查询历史客户发现记录，支持 `agent_id` 和游标分页，覆盖已有任务结果且员工删除后保留。执行 `python -m pip install -r requirements.txt` 和 `python -m alembic upgrade head` 后重启服务；新接口详情及限制见 [API 集成指南](./docs/API集成指南.md)。

使用 Python 3.10+、FastAPI 和 MySQL 8.4。当前开发版本支持手机号注册登录、注册赠点、工作空间隔离、数字员工管理、公域检索、拓客任务和基础情报报告。

## API 集成文档

其他项目使用 Codex 接入本服务时，可直接读取运行中服务的 `/openapi.json`：其中包含集成顺序、接口说明、请求示例、响应结构、错误码，以及幂等重试和付费确认约定；`/docs` 提供交互式调试。完整调用链和 Python 示例见 [API 集成指南](./docs/API集成指南.md)。设置 `WEB_PREFIX` 时文档入口增加该前缀，业务路径仍为 `/api/v1/...`。

## 本地运行

真实联调入口使用 `python scripts/run-live-dev.py --port 18084 --database-file .local/account-qa.sqlite3`，保留既有开发账号与资料；省略数据库文件参数则使用环境中的 MySQL。启动器依次读取 `.env` 与 `.local/app.env`，要求真实模型、搜索密钥及数据库，不注入 QAProvider、不新增样例账号，并停用旧验收抓取缓存。邮件只使用已配置的加密 SMTP；未配置时不可发送，启动器拒绝本地 `test_plain` 模拟收件通道。

健康检查的 `model_mode` / `search_mode` 区分 `live`、`injected` 和 `unconfigured`，`smtp_mode` 区分真实通道、本地捕获及未配置。Companies House 缺少原生密钥但已有模型和搜索密钥时，真实检索其官方公开档案网页，并明确标注接入方式和索引覆盖限制。

LLM 按场景分流：对话（员工聊天、找客方案对话、开发信草稿）与判断（检索规划、线索提取）默认使用效率模型 `LLM_MODEL=deepseek-flash`；分析（企业资料解析、情报报告、线索二次证据复核）默认使用高级模型 `LLM_ADVANCED_MODEL=deepseek-v4-pro`。可分别通过 `LLM_CHAT_MODEL`、`LLM_JUDGMENT_MODEL`、`LLM_ANALYSIS_MODEL` 覆盖，留空则沿用对应档位。所有模型共用 `LLM_BASE_URL` / `LLM_API_KEY`，模型名须为该服务支持的名称；使用其他兼容服务时也需配置其高级模型名。后台模型调用结果记录实际 `model` 和 `scenario`。修改配置后重启服务生效；搜索、抓取仍使用独立工具配置。

真实端到端验证：执行 `python scripts/live-e2e.py --phase core`，再依次运行 `discovery`、`sources`、`customs`、`advanced`、`enhanced`。脚本创建独立验收账号，调用真实模型、搜索和数据接口；付费数据测试沿用点数预占和每任务预算。不外发邮件、不发起支付，短信沿用测试配置。私有账号状态在 `.local/live-e2e-state.json`，测试证据在 `.local/live-e2e-report.json`，均不提交 Git。当前脚本的账号准备和调度到期验证使用上述 SQLite 开发库，不可直接指向生产环境。调度测试仅提前该账号计划的到期时间，再由正常调度器和真实后台任务执行。

本项目的 Windows 本地开发服务可运行 `./scripts/start-dev.ps1` 启动。脚本使用已安装的 `.local/` MySQL 和项目 `.venv/`，测试台监听 `http://127.0.0.1:18000/`，MySQL 监听 `127.0.0.1:13306`。启动时先读项目根目录的 `.env`，再读 `.local/app.env`，后者覆盖同名项。修改 `LLM_API_KEY` 等配置后用 `./scripts/start-dev.ps1 -RestartApi` 使修改生效。测试台仅在 `APP_ENV=test` 时提供。

1. 创建 MySQL 数据库和应用账号，数据库使用 `utf8mb4`。将 `.env.example` 中的配置注入当前终端或部署环境，并填写 `DATABASE_URL` 和 `LLM_API_KEY`。示例文件用于说明配置字段。
2. 安装依赖和迁移数据库。

   ```powershell
   python -m pip install -r requirements.txt
   python -m alembic upgrade head
   ```

3. 用单进程启动服务。接口文档位于 `http://127.0.0.1:8000/docs`。

   ```powershell
   python -m uvicorn app.main:app --workers 1
   ```

## Vercel 部署

仓库通过 `vercel.json` 指定 FastAPI 框架，并通过 `pyproject.toml` 指定 `app.main:app` 入口。在 Vercel 项目中将 Root Directory 设为仓库根目录，Production Branch 设为 `master`；清除原有静态站点的 Build Command 和 Output Directory 覆盖设置，再重新部署。

默认 `APP_ENV=production`，首页跳转到 `/app` 工作台，接口文档仍在 `/docs`；通过 `/health` 检查服务，通过 `/openapi.json` 获取接口定义。设置 `WEB_PREFIX` 时这些入口增加对应前缀。测试台仅在 `APP_ENV=test` 时提供。

在 Vercel 环境变量中配置可从部署环境访问的 MySQL `DATABASE_URL`、`LLM_API_KEY` 等必要参数；本地 `.env` 不会随 Git 上传。数据库需先从可访问数据库的环境执行 `python -m alembic upgrade head`。未配置数据库时，健康检查和文档仍可访问，业务接口会返回不可用。

当前实现使用应用生命周期中的常驻 Worker 消费任务，并在启动时恢复任务状态，要求单进程运行。Vercel Functions 会自动伸缩，不能直接满足这一运行假设；完整拓客、报告及海关查询服务应部署到常驻单进程服务器，或先改造为独立 Worker / 持久队列架构。Vercel 上 HTTP 入口可用不代表后台业务任务可可靠完成。

## 首条业务链路

API 默认允许所有来源跨域访问，支持 OPTIONS 预检以及 `Authorization`、`Content-Type`、`Idempotency-Key` 等请求头。通过 `CORS_ALLOW_ORIGINS` 设置允许的来源，多个来源以英文逗号分隔，例如 `https://app.example.com,http://localhost:5173`；来源须包含协议和端口（如有），不含路径或末尾斜杠。设为空值时不允许跨域来源。修改后需重启服务。前端使用 Bearer token 鉴权，不要设置 `credentials: 'include'`；服务不启用跨域 Cookie 凭据。

1. 使用 `POST /api/v1/auth/verification-codes` 申请挑战。`APP_ENV=test` 时验证码为 `123456`。将手机号、密码、验证码及挑战 ID 一起提交给 `POST /api/v1/auth/register`。注册接口直接校验并消费挑战。独立验证码校验接口用于验证验证码实现，也会消费其收到的挑战。
2. 使用 `POST /api/v1/auth/login` 获取 Bearer token 和工作空间 ID。后续业务路径使用 `/api/v1/workspaces/{workspace_id}` 前缀。
3. 调用 `POST /agents`，填写 `name` 和 `instructions`，可补充 `market`、`product`、`hs_code` 及 `target_count`。创建时默认暂停。调用 `POST /agents/{agent_id}/runs` 提交任务，使用 `Idempotency-Key` 重放同一次提交。
4. 通过 `GET /jobs/{job_id}` 查询任务，使用 `GET /jobs/{job_id}/leads` 查看线索。用 `POST /reports` 提交 `job_id` 和从 0 开始的 `lead_index` 生成报告。
5. 使用 `GET /points`、`GET /points/ledger` 及 `GET /points/costs` 核对余额和报价。`POINTS_DEFAULT_COST` 默认为 `1`，可通过 `POINTS_OPERATION_COSTS` 配置覆盖，例如 `{"report":3}`。开发默认规则对成功或已有可交付结果的部分成功结算。拓客只取得检索来源而无线索时，释放预占点数。

测试环境的固定验证码使用内存状态。正式环境需注入真实的验证码供应商。真实支付和信用报告接入待后续联调。DeepSeek 公域搜索、抓取与模型密钥通过服务端环境变量管理。

## 跨境魔方海关核验

将 `UPKUAJING_API_KEY` 放在 `.local/app.env` 后运行 `./scripts/start-dev.ps1 -RestartApi`。登录测试台后，在“海关核验”填写采购商全称、所属国、产品条件及交易日期，并明确确认费用。对应接口为 `POST /customs-verifications`，需传 `Idempotency-Key` 和 `confirm_paid: true`。

已知潜在采购商时，可在线索卡点“查询采购商”，或在测试台输入企业名和所属国。匹配后选中具体企业，按需单独查询企业资料、联系方式或按公司 ID 核验海关记录。匹配、资料和联系方式统一走 `POST /buyer-enrichments`。同一工作空间内相同请求在 24 小时内优先复用排队、运行中或已完成的结果。[采购商列表](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/company-list-api.md) · [企业详情](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/company-detail-api.md) · [联系方式](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/contact-fetch-api.md)

每个海关核验任务只请求一页交易记录。已有更多记录时在结果标明。跨境魔方付费调用默认以 UTC 自然日合计限制全平台 5 次，可通过 `UPKUAJING_DAILY_CALL_LIMIT` 调整，设为 `0` 时禁用新的付费查询任务。查询结果记录来源、交易 ID、上游请求 ID 和可取得的回传费用。平台点数仍按业务配置结算。公域拓客需由用户选择增强查询才会调用跨境魔方。[跨境魔方贸易明细接口](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/trade-list-api.md)

## 验证

`python -m unittest discover -s tests -v` 运行本地接口和账本测试。测试使用 SQLite 临时库和模拟 DeepSeek 结果。真实拓客输入及证据口径见[首批验收用例](./docs/微元1.0首批验收用例.md)。

## 数字员工对话

Agent 使用 LangGraph `StateGraph` 编排“规划 → 工具 → 再规划”流程，通过 SQLAlchemy checkpointer 将每一步状态和 pending writes 保存到现有 MySQL；测试使用 SQLite。

先执行 `python -m pip install -r requirements.txt` 和 `python -m alembic upgrade head`，再重启单进程服务。创建员工后可调用：

```http
POST /api/v1/workspaces/{workspace_id}/agents/{agent_id}/messages
Authorization: Bearer <token>
Idempotency-Key: chat-request-001
Content-Type: application/json

{"content":"将目标市场改成美国，产品设为LED，帮我找10个采购商"}
```

接口同步返回一轮对话，包含 `id`、`conversation_id`、`status`、`response`、`tool_calls` 和 `error`。商机情报任务仍由后台队列异步处理；对话成功不代表任务已经完成。后续消息带上 `conversation_id`，例如 `{"content":"查看刚才任务的进度","conversation_id":"..."}`。模型可在一轮中连续调用工具，最多 8 次，下一步会取得此前工具的真实返回值。

- `GET /agents/{agent_id}/conversations`：查询最近会话，支持 `limit`。
- `GET /agents/{agent_id}/conversations/{conversation_id}/messages`：查询消息和调用记录，支持 `limit` 和 `before=<消息id>` 向前翻页；返回页按时间升序。
- 消息必须携带 `Idempotency-Key`。相同内容和 key 返回已有轮次，不重复修改配置或提交任务；不同内容使用同一 key 返回 409。同一员工同时只处理一轮对话，其他消息返回 `agent_message_in_progress`。
- 采购商增强和海关核验须在**当前消息请求**显式传 `confirm_paid: true`；模型自行填入确认字段不能代替请求确认。已有点数规则、队列限制和供应商调用上限继续生效。
- LLM 失败时返回 `status: failed` 和错误码，已完成的配置修改或任务提交仍保存在 `tool_calls` 中。重启后未完成的轮次标记为 `agent_chat_interrupted`，不会自动重做可能已生效的操作。使用新 key 继续查询或安排工作。

内置工具覆盖配置读取/修改、拓客任务、暂停、公域检索、报告、任务查询、采购商增强、海关核验及长期记忆读写。`remember` / `recall` / `forget` 支持按员工隔离的跨会话业务偏好，每名员工最多 50 项，每项最多 2000 字符；可直接说“记住：以后优先找美国LED采购商”或“忘记刚才的市场偏好”。可在服务启动前向 `app.state.agent_tools` 注册额外的业务服务函数，无需先添加 HTTP API：

```python
from app.chat import AgentTool, Empty

app.state.agent_tools['opportunity_summary'] = AgentTool(
    description='查询工作空间的商机摘要',
    arguments=Empty,
    invoke=lambda context, args: intelligence_service.summary(context.workspace),
)
```

扩展工具接收 Pydantic 参数和 `ToolContext`（工作空间、员工、会话内操作 key 等），负责在该工作空间内校验数据访问；有副作用的扩展须使用 `context.key` 实现幂等，需要付费授权的扩展设置 `paid=True`。模型只能调用已注册工具。对话规划本身暂不扣平台点数；工具提交的业务任务按原有规则预占和结算。最近 20 轮会话进入模型上下文；完整记录可通过消息接口分页读取。

框架参考：[LangGraph 持久化与记忆](https://docs.langchain.com/oss/python/langgraph/persistence)。当前版本采用同步图执行及数据库持久化记忆；后台任务通过现有 Worker 执行。中断的对话不自动重放副作用，也不自动恢复执行，使用新消息继续处理。

测试 HTML 页面已提供“员工对话”区域：登录后选择员工，可新建/切换会话，测试配置修改、任务安排与长期记忆，查看工具调用和原始 API 响应；网络错误时使用“按原 key 重试”查询同一次提交。线上测试入口：[员工对话](http://8.163.73.136/#agent-chat)。

测试台的“本次启动档位”和对话的“本条消息获客档位”提供基础档与增强档。基础档只用公域来源。增强档先查询一页近 365 天的目标产品采购商，公域筛选后最多核验 2 家交易、补 3 家联系方式，按公开单价预占每任务 6 元跨境魔方预算，回传费用替换估算，供应商费用未知时保留费用估算，但不追加用户数据点数；钱包按完整报价预占，明确回传费用换算后结算、释放差额，全平台日调用上限仍有效。历史交易与当前公开采购信号分别展示。`POST /agents/{agent_id}/runs` 可省略请求体以兼容基础档调用，也可传 `{"acquisition_tier":"enhanced","confirm_paid":true}`。对话请求传同样的档位和确认字段，服务端将其传入 `start_task`，模型不能修改档位或预算。显式基础档会拦截付费工具；旧客户端只传 `confirm_paid=true` 时映射为增强档授权。每条新消息默认恢复基础档，重试保留原请求。结果 `paid_usage` 的金额单位为千分之一元，供应商费用异常上涨可能使回传金额超过预算，后续付费步骤会停止。

跨境魔方接口日志：执行 `python -m alembic upgrade head` 后重启服务，测试台选择采购商匹配、企业资料、联系方式或海关核验任务，在「跨境魔方接口日志」查看实际请求、返回、HTTP 状态和耗时，可点击刷新。日志持久化在 `provider_calls`，通过 `GET /api/v1/workspaces/{workspace_id}/jobs/{job_id}/provider-logs` 读取，沿用任务所属工作空间的鉴权。旧任务不会补录；缓存复用不会产生新的上游访问。请求发送前保存请求，HTTP 错误和网络异常同样记录；非 JSON 返回只保留类型和字节数，JSON 正文超过 100000 字符会标记截断。认证头不记录，密钥及敏感字段脱敏。服务端 `app.provider_logging` 在 INFO 级别同时输出结构化日志事件；业务返回中仍可能包含企业联系方式，请按业务数据管理数据库及日志访问权限。

注册、官网/文件企业资料草案与用户确认、会员/点包订单、每月领取及微信 Native 适配现已接入工作台。SMTP 人工审阅后单封发送为可选通道；默认不发送真实邮件。短信、SMTP、微信参数与完整点数报价规则见[运行手册补充](./docs/AI拓客工作台运行手册.md)。真实微信资金支付未执行。

跨境魔方统一企业/人员库、单主体联系方式解锁、产品海关分页、CRM 联系方式分组、画像预览与反馈、联系方式优先增强已接入。真实结果、费用/配额区别、接口用法和剩余 TradeWind 差距见[接入与优化验收](./docs/跨境魔方统一获客接入与优化验收-20261121.md)。上线需执行迁移至 `0014` 并重启；当前验收为本地服务，未部署生产。

两种联系人接口的同主体实测、LLM 二次证据复核、英国采购 OCDS 原生接口与新增 OSINT 检索入口见[联系人接口与 LLM / OSINT 验收](./docs/联系人接口对照与LLM-OSINT优化验收-20261121.md)。英国接口仅扫描一页后本地匹配关键词，不是全库搜索；复核原句仍需人工核实。


### Hunter 联系方式补查

配置 `HUNTER_API_KEY` 后，独立企业/人物联系方式查询、采购商联系方式查询，以及增强获客的联系方式步骤，统一先调用跨境魔方。没有可用邮箱或电话（只有官网/社媒、掩码、无效邮箱或空结果）时再调用一次 Hunter。已有电话或邮箱不追加 Hunter；基础档公开搜索不因此触发付费查询。

企业使用 Domain Search（最多 10 个邮箱、不自动分页），人物使用姓名与所属企业的 Email Finder，不用企业邮箱冒充人物邮箱。优先采用已知官网域名；只能按公司名查询时，返回信息标为需要核对企业归属。`valid` 为上游有效标记，`accept_all`/`unknown` 为不确定，不代表本系统独立验证。

`HUNTER_DAILY_CALL_LIMIT` 默认全平台每日 20 次，设为 0 停用。`HUNTER_CONTACT_ESTIMATE_MILLI_CNY` 默认 170（约 ¥0.17），仅用于经营成本估算与增强档预算控制。实际 `credits_used`/`credits_unit` 保留在 `hunter_fallback` 中，不换算成已确认人民币账单，也不额外向用户收取估算数据点数。跨境魔方原费用、配额和结果保持独立。供应商日志包含两家实际请求与返回，不记录密钥。

Hunter 失败、额度耗尽时保留跨境魔方结果并显示警告。上游网络/服务错误可以尝试 Hunter；任务预算耗尽、跨境魔方日限额及待核对的中断调用不会通过备用源绕过。每个补查步骤沿用任务级调用记录，重新执行不会重复请求；相同企业/人物独立查询沿用原有 24 小时任务复用规则。修改配置与代码后需重启服务；历史缓存任务不会自动重跑。
