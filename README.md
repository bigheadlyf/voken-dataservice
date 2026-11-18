# 微元 1.0 服务端

使用 Python 3.10+、FastAPI 和 MySQL 8.4。当前开发版本支持手机号注册登录、注册赠点、工作空间隔离、数字员工管理、公域检索、拓客任务和基础情报报告。

## 本地运行

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

## 首条业务链路

1. 使用 `POST /api/v1/auth/verification-codes` 申请挑战。`APP_ENV=test` 时验证码为 `123456`。将手机号、密码、验证码及挑战 ID 一起提交给 `POST /api/v1/auth/register`。注册接口直接校验并消费挑战。独立验证码校验接口用于验证验证码实现，也会消费其收到的挑战。
2. 使用 `POST /api/v1/auth/login` 获取 Bearer token 和工作空间 ID。后续业务路径使用 `/api/v1/workspaces/{workspace_id}` 前缀。
3. 调用 `POST /agents`，填写 `name` 和 `instructions`，可补充 `market`、`product`、`hs_code` 及 `target_count`。创建时默认暂停。调用 `POST /agents/{agent_id}/runs` 提交任务，使用 `Idempotency-Key` 重放同一次提交。
4. 通过 `GET /jobs/{job_id}` 查询任务，使用 `GET /jobs/{job_id}/leads` 查看线索。用 `POST /reports` 提交 `job_id` 和从 0 开始的 `lead_index` 生成报告。
5. 使用 `GET /points`、`GET /points/ledger` 及 `GET /points/costs` 核对余额和报价。`POINTS_DEFAULT_COST` 默认为 `1`，可通过 `POINTS_OPERATION_COSTS` 配置覆盖，例如 `{"report":3}`。开发默认规则对成功或已有可交付结果的部分成功结算。拓客只取得检索来源而无线索时，释放预占点数。

测试环境的固定验证码使用内存状态。正式环境需注入真实的验证码供应商。真实支付和信用报告接入待后续联调。DeepSeek 公域搜索、抓取与模型密钥通过服务端环境变量管理。

## 跨境魔方海关核验

将 `UPKUAJING_API_KEY` 放在 `.local/app.env` 后运行 `./scripts/start-dev.ps1 -RestartApi`。登录测试台后，在“海关核验”填写采购商全称、所属国、产品条件及交易日期，并明确确认费用。对应接口为 `POST /customs-verifications`，需传 `Idempotency-Key` 和 `confirm_paid: true`。

已知潜在采购商时，可在线索卡点“查询采购商”，或在测试台输入企业名和所属国。匹配后选中具体企业，按需单独查询企业资料、联系方式或按公司 ID 核验海关记录。匹配、资料和联系方式统一走 `POST /buyer-enrichments`。同一工作空间内相同请求在 24 小时内优先复用排队、运行中或已完成的结果。[采购商列表](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/company-list-api.md) · [企业详情](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/company-detail-api.md) · [联系方式](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/contact-fetch-api.md)

每个海关核验任务只请求一页交易记录。已有更多记录时在结果标明。跨境魔方付费调用默认以 UTC 自然日合计限制全平台 5 次，可通过 `UPKUAJING_DAILY_CALL_LIMIT` 调整，设为 `0` 关闭。查询结果记录来源、交易 ID、上游请求 ID 和可取得的回传费用。平台点数仍按业务配置结算。公域拓客需由用户选择增强查询才会调用跨境魔方。[跨境魔方贸易明细接口](https://raw.githubusercontent.com/Upkuajing/upkuajing-trade-company-search/main/references/trade-list-api.md)

## 验证

`python -m unittest discover -s tests -v` 运行本地接口和账本测试。测试使用 SQLite 临时库和模拟 DeepSeek 结果。真实拓客输入及证据口径见[首批验收用例](./docs/微元1.0首批验收用例.md)。
