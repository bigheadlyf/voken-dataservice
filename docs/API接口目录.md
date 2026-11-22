# API 接口目录

从 `app.main.create_app().openapi()` 生成，共 116 个操作。

完整请求、响应、字段约束和错误码见 [OpenAPI 快照](./api/openapi.json)；运行时 `/openapi.json` 为权威版本。
重新生成：`python scripts/export-api-catalog.py`。查询参数后的 `*` 表示必填；路径参数均在 URL 中。

业务路径使用 `/api/v1/workspaces/{workspace_id}`；前台通过 Bearer token 调用，不使用跨域 Cookie。
需幂等键、版本或费用确认的接口仍须遵循 OpenAPI 的说明，目录中的成功状态不代表可省略这些字段。

## agent-chat (3)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/conversations | 查询员工最近会话 | limit | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/conversations/{conversation_id}/messages | 分页读取完整对话轮次 | limit, before | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/messages | 同步处理一轮员工对话 | — | ChatRequest | 200 |

## auth (7)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| POST | /api/v1/auth/verification-codes | 申请注册验证码 | — | CodeRequest | 201 |
| POST | /api/v1/auth/verification-codes/verify | 独立验证并消费验证码 | — | CodeVerification | 200 |
| POST | /api/v1/auth/register | 注册并创建工作空间 | — | Registration | 201 |
| POST | /api/v1/auth/login | 登录并获取 Bearer token | — | Login | 200 |
| POST | /api/v1/auth/logout | 注销当前 token | — | — | 204 |
| POST | /api/v1/auth/password-reset | Reset Password | — | PasswordReset | 200 |
| POST | /api/v1/auth/password-change | Change Password | — | PasswordChange | 200 |

## billing (6)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/billing/plans | Catalog | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/billing/orders | Create Order | — | OrderRequest | 201 |
| GET | /api/v1/workspaces/{workspace_id}/billing/orders | Orders | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/billing/orders/{order_id}/cancel | Cancel Order | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/billing/memberships | Memberships | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/billing/memberships/{membership_id}/claims | Claim Month | — | — | 200 |

## company (16)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/company/profile | Company Profile | — | — | 200 |
| PUT | /api/v1/workspaces/{workspace_id}/company/profile | Replace Company Profile | — | ProfileWrite | 200 |
| PATCH | /api/v1/workspaces/{workspace_id}/company/profile | Patch Company Profile | — | ProfileWrite | 200 |
| DELETE | /api/v1/workspaces/{workspace_id}/company/profile | Delete Company Profile | expected_version * | — | 204 |
| GET | /api/v1/workspaces/{workspace_id}/company/memories | Company Memories | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/company/memories | Create Company Memory | — | MemoryWrite | 201 |
| GET | /api/v1/workspaces/{workspace_id}/company/memories/{memory_id} | Company Memory | — | — | 200 |
| PATCH | /api/v1/workspaces/{workspace_id}/company/memories/{memory_id} | Patch Company Memory | — | MemoryPatch | 200 |
| DELETE | /api/v1/workspaces/{workspace_id}/company/memories/{memory_id} | Delete Company Memory | expected_version * | — | 204 |
| POST | /api/v1/workspaces/{workspace_id}/company/document-analyses | Analyze Company Document | — | Body_analyze_company_document_api_v1_workspaces__workspace_id__company_document_analyses_post | 201 |
| GET | /api/v1/workspaces/{workspace_id}/company/document-analyses/{analysis_id} | Company Document Analysis | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/company/document-analyses/{analysis_id}/apply | Apply Company Analysis | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/company/website-candidates | Lookup Company Name | — | NameLookup | 200 |
| POST | /api/v1/workspaces/{workspace_id}/company/web-analyses | Analyze Website | — | WebsiteAnalysis | 201 |
| GET | /api/v1/workspaces/{workspace_id}/company/certification | Certification | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/company/certification/confirm | Confirm Company | — | ConfirmCompany | 200 |

## crm (14)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/from-leads | Save Discoveries | — | LeadSelection | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/from-source | Save Source Records | — | SourceSelection | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/import | Import Prospects | — | ImportRequest | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/prospects | List Prospects | stage, q, due, offset, limit | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/prospects/export.csv | Export Prospects | stage, q, due | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/summary | Summary | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/usage | Usage | days | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id} | Prospect Detail | — | — | 200 |
| PATCH | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id} | Update Prospect | — | ProspectPatch | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/activities | Activities | limit | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/activities | Add Activity | — | ActivityInput | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/drafts | Create Draft | — | DraftRequest | 202 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/research | Research Prospect | — | ResearchRequest | 202 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/apply-contact | Apply Researched Contact | — | ApplyContact | 200 |

## crm-workbench (25)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench | Workbench | mode, q, country_filter, stage, tag, target, role_filter, ready_only, verification, has_email, due, offset, limit | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/candidates | Save Candidate | — | CandidateInput | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/people-candidates | Save Person Candidate | — | PersonCandidateInput | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/assessments | Assess | — | AssessmentInput | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/views | Saved Views | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/views | Save View | — | ViewInput | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/capabilities | Capabilities | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/verifications | Verify | — | VerifyInput | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/history/{prospect_id} | History | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/events | Event | — | ContactEventInput | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/followups | Followups | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/followups | Followup | — | FollowupInput | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/followups/{task_id}/complete | Complete Task | — | — | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/products | Products | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/products | Product | — | ProductInput | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/cohorts | Cohorts | — | CohortInput | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/imports/preview | Import Preview | — | Body_import_preview_api_v1_workspaces__workspace_id__crm_workbench_imports_preview_post | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/imports/commit | Import Commit | — | ImportCommit | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/inbox/preview | Inbox Preview | — | Body_inbox_preview_api_v1_workspaces__workspace_id__crm_workbench_inbox_preview_post | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/inbox | Inbox | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/inbox/archive | Archive Message | — | ArchiveMessage | 201 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/inbox/sync | Sync Inbox | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/workbench/preview-feedback | Preview Feedback | — | PreviewFeedback | 201 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/preview-feedback/{job_id} | Preview Feedback List | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/crm/workbench/discovery-delta/{job_id} | Discovery Delta | — | — | 200 |

## customers (2)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/customers | Historical Customers | agent_id, limit, cursor | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/customers/{customer_id} | Historical Customer | — | — | 200 |

## directory (6)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| POST | /api/v1/workspaces/{workspace_id}/directory/searches | Search Directory | — | DirectorySearch | 202 |
| POST | /api/v1/workspaces/{workspace_id}/directory/contacts | Unlock Directory Contact | — | ContactSelection | 202 |
| POST | /api/v1/workspaces/{workspace_id}/directory/save-company | Save Directory Company | — | SaveCompany | 200 |
| POST | /api/v1/workspaces/{workspace_id}/directory/saved-contacts | Save Directory Contact | — | SaveContact | 200 |
| GET | /api/v1/workspaces/{workspace_id}/directory/saved-contacts/{prospect_id} | Saved Directory Contacts | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/directory/trades | Search Trade Records | — | TradeSearch | 202 |

## discovery (4)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| POST | /api/v1/workspaces/{workspace_id}/discovery/plan | Plan | — | PlanRequest | 200 |
| POST | /api/v1/workspaces/{workspace_id}/discovery/preview | Discovery Preview | — | Preview | 202 |
| POST | /api/v1/workspaces/{workspace_id}/discovery/feedback | Discovery Feedback | — | Feedback | 200 |
| GET | /api/v1/workspaces/{workspace_id}/discovery/feedback/{job_id} | Discovery Feedback For Job | — | — | 200 |

## mail (4)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/mail/channel | Channel | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/crm/prospects/{prospect_id}/deliveries | Queue Delivery | — | DeliveryRequest | 202 |
| GET | /api/v1/workspaces/{workspace_id}/mail/deliveries | Deliveries | limit | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/mail/deliveries/{delivery_id}/cancel | Cancel Delivery | — | — | 200 |

## other (1)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /health | 检查服务配置状态 | — | — | 200 |

## payments (4)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| POST | /api/v1/workspaces/{workspace_id}/billing/orders/{order_id}/checkout | Checkout | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/billing/orders/{order_id}/refresh | Refresh Payment | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/billing/orders/{order_id}/close | Close Payment | — | — | 200 |
| POST | /api/v1/payments/wechat/notify | Notify | — | — | 200 |

## schedules (2)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| PUT | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/schedule | Save Schedule | — | ScheduleWrite | 200 |
| GET | /api/v1/workspaces/{workspace_id}/schedules | List Schedules | — | — | 200 |

## sources (2)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/sources | List Sources | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/sources/searches | Search Source | — | SourceQuery | 202 |

## workspaces (20)

| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |
| --- | --- | --- | --- | --- | --- |
| GET | /api/v1/workspaces/{workspace_id}/points | 查询点数余额 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/points/ledger | 查询最近点数账本 | limit | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/points/costs | 查询当前操作点数报价 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/points/quotes | Point Quotes | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/agents | 创建数字员工 | — | AgentConfig | 201 |
| GET | /api/v1/workspaces/{workspace_id}/agents | 列出未删除员工 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/agents/{agent_id} | 查询员工配置与状态 | — | — | 200 |
| PATCH | /api/v1/workspaces/{workspace_id}/agents/{agent_id} | 修改员工配置 | — | AgentConfigPatch | 200 |
| DELETE | /api/v1/workspaces/{workspace_id}/agents/{agent_id} | 软删除员工并取消活动任务 | — | — | 204 |
| POST | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/runs | 按当前配置和档位提交一次拓客任务 | — | ProspectingRunRequest | 202 |
| POST | /api/v1/workspaces/{workspace_id}/agents/{agent_id}/pause | 暂停员工并取消活动拓客任务 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/jobs | 查询最近任务 | agent_id, limit | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/jobs/{job_id} | 查询任务状态与结果 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/jobs/{job_id}/leads | 读取任务线索 | — | — | 200 |
| GET | /api/v1/workspaces/{workspace_id}/jobs/{job_id}/provider-logs | 查询跨境魔方接口请求与返回日志 | — | — | 200 |
| POST | /api/v1/workspaces/{workspace_id}/public-searches | 提交公域检索 | — | PublicSearch | 202 |
| POST | /api/v1/workspaces/{workspace_id}/buyer-enrichments | 付费匹配采购商或查询资料/联系方式 | — | BuyerRequest | 202 |
| POST | /api/v1/workspaces/{workspace_id}/customs-verifications | 付费核验海关交易 | — | CustomsVerificationRequest | 202 |
| POST | /api/v1/workspaces/{workspace_id}/reports | 为已有线索生成报告 | — | ReportRequest | 202 |
| GET | /api/v1/workspaces/{workspace_id}/reports/{report_id} | 查询报告与证据详情 | — | — | 200 |
