# 微元 React 前端

使用 React 19、TypeScript、Ant Design 6 和 Vite 6。构建后继续由 FastAPI 的 `/app` 提供服务，无需额外的 Node 生产进程。

## 开发与构建

在本目录运行：

```powershell
npm ci
npm run dev
```

先按项目根目录说明启动后端到 `127.0.0.1:18084`，然后打开 `http://127.0.0.1:5173/app`。Vite 将 API、现有业务脚本和健康检查代理到该后端。这里的前端开发服务与真实后端连接，任务、验证、支付和邮件操作仍遵守其正常确认流程。

```powershell
npm run build
```

构建包含 TypeScript 检查、旧表单样式隔离和生产打包，输出到 `app/web_ui/react/`。这些静态产物随服务发布；Python 部署端不必安装 Node。修改前端源码后须重新构建。修改 FastAPI 入口或 CSP 后须重启服务。

## 当前迁移范围

| 区域 | 实现 |
| --- | --- |
| 登录、导航、响应式布局与提示 | React / Ant Design |
| 业务概况与指标卡 | React / Ant Design |
| 企业 / 联系人双视图 | Ant Design Table，服务端筛选与分页，当前页批量选择 |
| 筛选、保存视图、列显示 | React 控件；复用已有视图接口 |
| 客户详情、联系人、证据、历史 | Ant Design Drawer / Tabs |
| 企业评审、联系事件、批量提醒 | Ant Design Modal / Form |
| 任务列表及类型、状态筛选 | Ant Design Table，执行中沿用原轮询 |
| 找客引导、企业资料、客户编辑、名单导入、收件归档、邮件、费用与任务结果 | 已有业务表单，经隔离兼容层接入并统一样式 |

这是一套可持续迁移的前端，不宣称所有旧业务表单均已改写为 React。

## 代码边界

- `src/main.tsx`：React 应用、概况、工作台、客户详情和任务视图。
- `src/WorkbenchAction.tsx`：有表单校验的业务弹窗。
- `src/bridge.ts`：桥接类型及按顺序加载业务脚本。
- `app/web_ui/react-bridge.js`：复用现有鉴权、工作空间隔离、幂等提交与费用确认；只向 React 发布去除 token 的快照。
- `src/legacy-pages.html` / `src/legacy-account.html`：尚未迁移的页面片段。仅供固定模板使用，动态业务内容仍由现有脚本转义。
- `scope-legacy.mjs`：将原表单 CSS 限制在 `.legacy` 内，防止通用选择器覆盖 Ant Design。

兼容层 DOM 只初始化一次，React 不再协调其子树。继续迁移时，应同步删除对应旧 ID 的读取和事件处理，再移除模板，避免两个框架共同管理同一节点。

`/app?legacy=true` 保留完整旧入口用于回退。正常入口为 `/app`。`WEB_PREFIX` 由 FastAPI 注入静态资源路径；API 仍使用 `/api/v1/...`。

生产 CSP 的脚本来源仍限于同源；动态样式使用每次响应生成的 nonce，组件定位所需的样式属性单独允许。不依赖外部 CDN。

## 检查

从项目根目录运行：

```powershell
node tests/web_ui_checks.cjs
node tests/workbench_ui_checks.cjs
node tests/react_bridge_checks.cjs
node tests/react_ui_state_checks.cjs
.venv/Scripts/python.exe -m unittest discover -s tests -p test_service.py -v
.venv/Scripts/python.exe -m unittest discover -s tests -p test_workbench.py -v
```

浏览器验收使用独立临时 SQLite 数据库与明确标记的合成数据，不向既有开发账号写入样例，不调用外部验证或发送邮件。

浏览器验收已固化为 `npm run test:e2e`：使用本机 Edge 的独立无头上下文，自动启动 18087 端口的临时服务，测试结果、截图与失败 trace 写入 `.local/react-e2e/`。测试配置采用 `.cts` 以兼容当前 Node 18.16 的模块加载；测试账号仅存在于临时数据库。先运行 `npm run build`，再运行端到端测试。

接口目录与本轮流程说明见 [前台 API 集成与端到端验收](../docs/前台API集成与端到端验收.md)。
