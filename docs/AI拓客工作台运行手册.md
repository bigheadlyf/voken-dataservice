# AI 拓客工作台运行手册

## 启动

使用现有常驻单进程部署。先注入 `.env.example` 对应环境变量，再执行：

```powershell
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --workers 1 --host 127.0.0.1 --port 8000
```

打开 `/app` 使用工作台，打开 `/docs` 查看接口。`WEB_PREFIX=/api` 时工作台是 `/api/app`，静态资源是 `/api/app-assets/...`；业务路径依然是 `/api/v1/...`。原有测试台和文档入口保持各自用途。

本地已安装环境可运行 `./scripts/start-dev.ps1 -RestartApi`，然后访问 `http://127.0.0.1:18000/app`。脚本会先读取项目 `.env`，再读取 `.local/app.env`。不要将这些文件、密钥或数据库内容提交到 Git。

需要的配置：

| 配置 | 作用 |
| --- | --- |
| `DATABASE_URL` | 当前正式实现使用 MySQL；SQLite 仅用于隔离测试 |
| `LLM_BASE_URL / LLM_MODEL / LLM_API_KEY` | 规划、抽取和写草稿；支持当前已有的兼容模型路由 |
| `TOOLS_API_KEY` | DeepSeek 原始 Search/Fetch；不回退使用其他模型的密钥 |
| `SEARCH_INCLUDE_CONTENT=true` | 优先在搜索结果中带正文；已有正文时跳过冗余 Fetch |
| `SEARCH_CALLS_PER_JOB=8 / FETCH_CALLS_PER_JOB=5` | 查询上限与正文上下文上限；缺省使用这组值 |
| `PUBLIC_CACHE_TTL_SECONDS=21600` | 同工作空间公域缓存；0 关闭，最大 86400；每空间最多 1000 条 |
| `UPKUAJING_API_KEY` | 可选；不配置仍可使用基础发现、CRM 和草稿 |
| `UPKUAJING_DAILY_CALL_LIMIT=5` | 现有跨境魔方全平台 UTC 日调用上限；0 禁止新增付费调用 |
| `COMPANIES_HOUSE_API_KEY` | 可选；英国官方企业登记接口的服务端密钥 |
| `PUBLIC_SOURCE_DAILY_CALL_LIMIT=100` | 官方原生接口全平台 UTC 日调用上限；0 禁用新增任务 |
| `PUBLIC_TOOL_ESTIMATE_MILLI_CNY=6` | 公域成功请求的人民币近似估算，非实时汇率或供应商账单，可按实际结算校准 |
| `POINTS_OPERATION_COSTS` | 覆盖各操作点数，例如 `{"outreach_draft":1,"report":3}` |

不要将网页工作台部署到只提供静态文件而没有本服务的域名。当前前端按同域路径调用 API；反向代理需同时转发工作台资源和业务路径。生产入口使用 HTTPS，应用进程保留在回环地址或受控内网。

## 无短信私测开通与点数

这些命令只能由能访问服务器及其数据库环境的运营人员执行，不新增公开管理接口。与服务使用同一组环境变量，数据库先迁移。

```powershell
python -m app.operator provision --phone 13800000000 --initial-points 1000
```

命令通过隐藏输入读取并二次确认初始密码，已有账号不会改密码或增加余额。之后用户可在 `/app` 用手机号和密码登录。不要为正式服务启用测试环境的固定验证码。

为已确认的线下订单或明确赠送操作增加点数：

```powershell
python -m app.operator topup --workspace <workspace_id> --points 1000 --receipt offline-order-20261120-001
```

相同工作空间、相同 receipt 和相同点数重试只入账一次；同 receipt 改变点数会失败。该命令不会扣款或创建真实支付订单；实际收款与业务凭证由运营另行核对。

## 用户路径

1. 在“我的企业”填写企业名称、主营产品、真实优势与联系信息。工作台局部更新资料，保留未展示的企业字段。
2. 在“发现客户”选择市场、产品和客户角色，补充理想客户官网与排除条件。默认基础档；增强档必须勾选本任务费用确认。
3. 到“任务与草稿”查看结果和警告。来源取不到正文、没有足量客户或上游额度不足都应保留真实状态。
4. 保存选中线索到“客户管线”。同名、同地区的记录按规范化文本去重；不会仅凭一个目录域名合并不同公司。同一企业换名或地区写法不同可能保留多条，需人工核对。
5. 检查证据和联系信息，设置阶段、标签与下次跟进。拒绝联系会清除跟进时间，拦截后续草稿生成，并在同名的后续发现结果中排除该客户。
6. 生成开发信草稿，审阅后复制或下载 `.eml`，使用自己的邮箱填写收件人并发送。系统不自动发送、不自动添加跟踪像素。
7. 记录已发送、回复、会议与质量反馈。明确回复可以推进早期销售阶段；拒绝联系记录立即生效。
8. 需要定期搜客时，在“发现客户”下方选已有任务、间隔天数和未来运行次数并启用。周期计划只运行基础档，按平台报价扣点，不持续购买海关数据。

CSV 导入表头支持 `name,location,website,contact,source_url,source_note`，每批最多 200 条。`name` 必填；每条应有来源说明，可由表单默认说明补齐。支持引号、逗号和多行字段。导出包含停止联系标记，并转义容易被电子表格执行的公式首字符。

导出还带证据类型、时效状态和已取得的截止日期。`public_demand_count` 保留公开采购信号计数以兼容旧客户端，不能解释为仍开放机会数。新字段 `dated_demand_signal_count` 仅统计正文原句支持未来 ISO 截止日期的信号；`demand_validity` 区分过期、今日截止时间不明和日期未核实。日期未核实的候选不会丢弃，但不计入有时效依据的需求覆盖。带未来日期也不等于资格、标段、最新更正或采购状态都已经核实。

## 新接口速查

以下路径使用 `/api/v1/workspaces/{workspace_id}` 前缀，并带 Bearer token。

| 方法 / 后缀 | 作用 |
| --- | --- |
| `POST /crm/prospects/from-leads` | `{job_id,lead_indices:[0,1]}` 保存已终结拓客任务线索 |
| `POST /crm/prospects/import` | `{items:[{name,location,contact,source_note,...}]}` 导入自有名单 |
| `GET /crm/prospects` | 按 `stage,q,due` 筛选，`offset,limit` 分页 |
| `GET /crm/prospects/export.csv` | 导出相同筛选条件下的 CSV，超过 10000 条需收窄筛选 |
| `GET /crm/prospects/{id}` | 客户详情、来源和证据完整度 |
| `PATCH /crm/prospects/{id}` | 用 `expected_version` 修改阶段、联系信息、标签、跟进与停止联系 |
| `GET/POST /crm/prospects/{id}/activities` | 查看/追加备注、发送记录、回复与拒绝联系等 |
| `POST /crm/prospects/{id}/drafts` | `{language,objective}`，必须带 `Idempotency-Key`，返回异步任务 |
| `GET /crm/summary` | 客户数、销售阶段、到期跟进和停止联系数 |
| `GET /crm/usage?days=30` | 上游调用、缓存、已回传 tokens；金额不是完整账单 |
| `POST /crm/prospects/{id}/research` | 生成客户公域核验报告并提取正文中出现的邮箱，按 report 点数计费 |
| `POST /crm/prospects/{id}/apply-contact` | `{job_id,value,expected_version}`，人工采用该客户核验任务或已保存官方公告的邮箱 |
| `GET /sources` | 原生接口与限站搜索目录、配置状态与边界，不回传密钥 |
| `POST /sources/searches` | 单来源、单页查询，必须携带幂等键 |
| `POST /crm/prospects/from-source` | `{job_id,record_indices:[0]}` 人工保存官方记录为待核实客户 |
| `PUT /agents/{id}/schedule` | `{expected_version:0,interval_days:14,remaining_runs:4,enabled:true}` |
| `GET /schedules` | 周期计划、版本、剩余次数和最近执行错误 |

Agent 配置额外支持 `buyer_role`（any/distributor/manufacturer/brand/service_provider/public_buyer）、`seed_website`、`exclude_keywords` 和 `public_sources:["ted"]`。默认 `public_sources=[]`；勾选后把官方招标作为独立证据类别纳入找客，不直接认作已验证采购需求。其他条件进入规划和抽取上下文，角色分类仍依赖证据与模型判断，不能取代人工验收。

客户修改必须带当前版本；冲突返回 `prospect_version_conflict`。跟进时间为含时区 ISO 时间，存储并返回 UTC。显式 `next_followup_at:null` 清空日期；其他非空字段不可传 null。

草稿任务沿用任务队列、点数预占和幂等规则，通过 `GET /jobs/{job_id}` 轮询。`result.draft.sent=false`，`status=needs_review`。在排队后、模型调用前收到拒绝联系时，任务失败并释放点数；已生成的历史草稿仍是历史记录，实际发送前应再次查看当前客户状态。

周期任务会固定使用提交时的员工配置版本。每次到期使用该员工当时的最新配置创建新任务；已经提交的历史任务不被后来修改覆盖。暂停/删除员工会停用计划；重启后处理到期计划但不追补所有错过的周期。余额不足保留剩余次数并延后一天再检查；已有任务进行中则延后 15 分钟，不重复提交。

## 验证与限制

```powershell
python -m unittest discover -s tests -v
node --check app/web_ui/app.js
node tests/web_ui_checks.cjs
```

迁移测试覆盖全新升级、回退重升、模型结构对比及 MySQL 离线 DDL。CRM 测试覆盖隔离、来源保存、去重、版本、拒绝联系、草稿幂等和点数释放；缓存测试覆盖复用、过期、空间隔离与搜索正文减少 Fetch；周期测试覆盖次数、基础档、暂停和余额不足。

当前架构仍只允许一个常驻 Worker 进程。后台任务不应直接依赖 Vercel 等临时函数生命周期。现已增加可选的人工审阅后 SMTP 单封发送，以及微信 Native 网关适配；默认均关闭。尚无收件箱同步、自动营销序列或多人席位。当前先作为私测 SaaS 使用，真实短信、SMTP 和微信商户均需服务端配置。任务成功不保证足量线索、数据准确或邮件能送达，必须按返回证据与业务反馈核验。

## 注册、企业资料与充值补充（2026-11-21）

- 注册与登录：短信验证码一次性消费；新增 `POST /api/v1/auth/password-reset` 与 `password-change`，成功后撤销所有旧会话。登录、短信申请、改密和企业资料分析有持久化限流。测试环境固定验证码 123456；生产环境不回退到固定码。
- 生产短信：配置 `SMS_ACCESS_KEY_ID`、`SMS_ACCESS_KEY_SECRET`、`SMS_SIGN_NAME`、`SMS_TEMPLATE_CODE`、`SMS_CODE_SECRET`（至少 32 字符）。短信模板使用 `code` 变量。适配器按阿里云 SendSms RPC 签名，验证码只保存带服务端密钥的摘要。未配置时注册与重置入口不开放。[阿里云官方接口说明](https://help.aliyun.com/zh/sms/getting-started/use-sms-api/)
- 企业名称：`POST /company/website-candidates` 返回最多五个未核实官网候选，用户选择后再分析。官网：`POST /company/web-analyses` 返回与文件上传相同的草案格式。既有 `/company/document-analyses/{id}/apply` 用于审阅后采用，保留来源并校验资料版本。
- 认证按用户选择实现为资料真实性确认：`GET /company/certification`，`POST /company/certification/confirm`。名称及官网或主营产品齐备后，用户确认当前版本；修改资料后恢复待确认。独立营业资质核验及域名所有权始终另列，未做核验不会显示已通过。
- `GET /points/quotes` 返回完整预占点数；`points/costs` 仅为平台基础部分。标准点包以 100 点/人民币元计算；数据预算按同一比例预占，明确回传费用结算，差额释放。增强档默认基础 1＋数据 600＝601 点。失败或取消按任务规则释放，异常数据费不突破已预占点数；未确认费用不会偷偷追加扣点。
- 套餐、订单、会员月领取接口为 `/billing/plans`、`/billing/orders`、`/billing/memberships`、`/billing/memberships/{id}/claims`。当前示例标准点包分别为 ¥10/1000 点、¥50/5000 点、¥100/10000 点。包月 ¥249，每会员月手动领取 3000 点；包年标价 ¥999，首次年费优惠 ¥600 后 ¥399，即时 10000＋每月 3000×12＝46000 点。套餐与权益由服务端快照，客户端不能自行指定到账数。会员不自动续费，提前续期从现有权益结束后开始；错过的会员月不补领。

### 微信 Native 配置与支付边界

配置 `WECHAT_ENABLED=true` 及 `.env.example` 中商户号、绑定 AppID、商户证书序列号、商户私钥文件、微信支付公钥 ID、公钥 PEM 文件、32 字节 APIv3 密钥和公网 HTTPS 通知地址。私钥与 APIv3 密钥只在服务端保存。使用微信支付推荐的公钥模式；公钥更新后需同步配置，不回退到不验签。[官方签名验签说明](https://pay.wechatpay.cn/doc/v3/merchant/4012365342)

- `POST /billing/orders/{id}/checkout`：创建 Native 订单并返回本地生成的 SVG 二维码；不允许前端提供收款金额。
- `POST /billing/orders/{id}/refresh`：服务端签名查单，只有验签后的成功结果才能入账。
- `POST /billing/orders/{id}/close`：先完成微信关单，再取消本地记录。已开始商户下单的记录不能仅在本地取消。
- `POST /api/v1/payments/wechat/notify`：校验平台公钥 ID、时间戳与 RSA 签名，AES-GCM 解密，核对商户、应用、订单、币种、金额和交易号，再幂等到账。同一交易重复通知不重复加点。支付发生于有效期内但通知延迟到达时，按签名结果中的支付时间核对。

未配置时不展示假收款二维码，未支付订单不会产生点数。未发起真实资金交易。原型套餐是可修改的服务端配置，经营方应在启用真实收款前确认自己的报价与供应商成本。退款目前由商户人工处理，未开放浏览器自行标记已退款或已支付的接口。

### SMTP 发送

设置 `SMTP_ENABLED=true` 与唯一 `SMTP_WORKSPACE_ID`，配置服务器、端口、starttls/ssl、账号密码、发件邮箱、身份地址页脚和每日上限（默认 20）。只在该空间开放发送。纯明文仅允许测试环境连接 loopback 接收器，生产不能使用。系统固定追加回复 STOP 的停止联系说明，并在审阅页显示完整页脚。

`POST /crm/prospects/{id}/deliveries` 必须提供本客户的成功草稿任务、当前版本、与档案一致的邮箱、审阅后主题正文、确认标记和幂等键。同一草稿只能提交一次；队列发送前再次核对拒绝联系与邮箱，其他同邮箱档案的拒绝联系也会拦截。`GET /mail/deliveries` 查看状态；queued 可取消，sending 不可撤回。SMTP accepted 只代表服务器接受，不是到达收件箱或被阅读。DATA 阶段断线或进程中断为 unknown，永不自动重发，应先核对邮箱服务商记录。支持中英及欧洲语言文本，通过标准 MIME 编码，不依赖远端支持 8BITMIME。

微信异常路径补充：查单结果必须绑定当前订单号，避免错用其他订单数据；下单进行中不能关单。重启时中断创建转为待核对，商户暂时查不到但尚未到期的订单保留状态；到期后明确不存在或商户确认关单才取消。关单可安全重试。


## 找客户：默认 Agent 引导与点选任务构建（2026-11-21）

“找客户”默认打开“Agent 引导”，也可切换“自行填写表单”。目标卡一次收集产品、市场与可选客户类型，默认先找10家；可点击采用企业资料中的产品和市场，或选择“帮我推荐市场”。产品与市场齐备时直接整理方案，不为数量、角色、HS编码等选填条件继续追问；确需澄清时，同一批展示最多3张问题卡，支持点选和自行填写。方案可通过条件卡修改，也可转到完整表单。两种方式复用同一员工配置及 runs 提交链路与幂等保护。

对话整理使用 `POST /api/v1/workspaces/{workspace_id}/discovery/plan`，请求为 `content`、最多16条 user/assistant 历史消息，以及修改方案时的可选 `current_configuration`；返回 `reply`、可确认的 `configuration` 或结构化 `questions`（field/title/options）。问题字段限 product/market/buyer_role/requirements，最多3题，每题最多8个选项。旧请求不带当前配置仍兼容。由已有模型配置处理，不提供任务执行工具。接口做租户验证、输入/输出结构校验和每工作空间每小时 30 次限制。对话不会创建员工、后台任务或预占任务点数；只有页面上核对方案、报价并点击创建才会提交。增强档还须单独同意数据预占。对话不支持发短信、付款或外发邮件。

当前对话保存在页面内存，刷新和退出会清空，最多 8 轮。模型异常时保留用户输入，可重试或使用表单。重置/切换账号后，旧请求返回不会写回新对话。模型服务未配置时明确报错，不使用本地关键词规则冒充 AI。

本轮验证：4 项 discovery planning 后端测试、5 项 OpenAPI 合同检查和前端检查通过。浏览器使用 `.local/account_qa_server.py` 的模拟模型，观察到缺失信息追问、10→5家修改、表单预填、基础/增强报价，以及两个入口各自提交测试任务；发现结果因虚构市场/来源条件为部分完成，不代表真实客户发现质量。手机端 390px 视口检查无页面横向溢出。本轮没有真实付款、短信或外发邮件，也未做线上发布。
