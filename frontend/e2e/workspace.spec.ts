import { test, expect, type Page } from "@playwright/test";
import { resolve } from "node:path";

const evidence = resolve(process.cwd(), "../.local/react-e2e");
async function login(page: Page, phone = "13900000991") {
  await page.goto("/app#workbench");
  await page.locator("#login-phone").fill(phone);
  await page.locator("#login-password").fill("ui-test-password");
  await page.getByRole("button", { name: "进入工作台", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "客户资源", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#refresh")).toBeEnabled();
}
async function query(page: Page, value: string) {
  await expect(page.locator("#refresh")).toBeEnabled();
  await page
    .getByRole("textbox", { name: "搜索企业、姓名或邮箱", exact: true })
    .fill(value);
  await page.getByRole("button", { name: "查询", exact: true }).click();
  await expect(page.locator("#refresh")).toBeEnabled();
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico"))
      errors.push(message.text());
  });
  await login(page);
  (page as any).__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect(
    (page as any).__errors || [],
    "No browser runtime or CSP errors",
  ).toEqual([]);
});

test("top-level navigation keeps customer tools in their section on desktop and mobile", async ({
  page,
}) => {
  const primary = page.getByRole("navigation", {
    name: "一级导航",
    exact: true,
  });
  const customers = page.getByRole("menu", {
    name: "客户与商机导航",
    exact: true,
  });
  await expect(primary.getByRole("button")).toHaveText([
    "我的工作台",
    "客户与商机",
    "订单与收款",
    "保障与资金",
    "AI能力",
  ]);
  await expect(
    primary.getByRole("button", { name: "客户与商机", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(customers).toBeVisible();
  await expect(customers.getByRole("menuitem", { name: /客户档案/ })).toHaveCount(0);
  await primary
    .getByRole("button", { name: "订单与收款", exact: true })
    .click();
  await expect(page.locator("#page-title")).toHaveText("订单与收款");
  await expect(customers).toHaveCount(0);
  await page.reload();
  await expect(
    primary.getByRole("button", { name: "订单与收款", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await primary.getByRole("button", { name: "保障与资金", exact: true }).click();
  await expect(page.getByRole("heading", { name: "马来西亚出海服务试点" })).toBeVisible();
  await primary.getByRole("button", { name: "AI能力", exact: true }).click();
  await expect(page.getByRole("button", { name: /AI 发现客户/ })).toBeVisible();
  await page.goto("/app");
  await expect(page).toHaveURL(/#my-overview$/);
  await expect(page.locator("#page-title")).toHaveText("我的工作台");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  const drawer = page.getByRole("dialog", {
    name: "工作空间导航",
    exact: true,
  });
  await drawer.getByRole("button", { name: "客户与商机", exact: true }).click();
  await expect(page).toHaveURL(/#workbench$/);
  await expect(
    drawer.getByRole("menu", { name: "客户与商机导航" }),
  ).toBeVisible();
  await drawer
    .getByRole("menuitem", { name: "thunderbolt 发现客户", exact: true })
    .click();
  await expect(page).toHaveURL(/#discover$/);
  await expect(page.locator("#page-title")).toHaveText("发现客户");
});

test("page help stays out of the way and opens on desktop and mobile", async ({ page }) => {
  const metricsHelp = page.getByRole("button", { name: "客户数据口径", exact: true });
  await expect(metricsHelp).toHaveAttribute("aria-expanded", "false");
  await metricsHelp.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/邮箱按地址去重/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(metricsHelp).toHaveAttribute("aria-expanded", "false");

  await page.getByRole("menuitem", { name: "thunderbolt 发现客户", exact: true }).click();
  const guidance = page.locator("#discover .copy-help").filter({
    has: page.getByLabel("找客说明", { exact: true }),
  });
  const trigger = guidance.locator("summary");
  const explanation = guidance.locator(".copy-help-content");
  await expect(page.getByRole("heading", { name: "找客条件", exact: true })).toBeVisible();
  await expect(page.getByText("任务创建小贴士", { exact: true })).toHaveCount(0);
  await expect(explanation).toBeHidden();
  await trigger.click();
  await expect(explanation).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(explanation).toBeHidden();
  await page.screenshot({ path: resolve(evidence, "discovery-copy-desktop.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(explanation).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: resolve(evidence, "discovery-help-mobile.png") });
  await page.getByRole("heading", { name: "发现客户", exact: true }).click();
  await expect(explanation).toBeHidden();

  await page.route("**/discovery/plan", (route) => route.fulfill({
    json: {
      reply: "已整理美国 LED 客户方案。",
      configuration: {
        name: "美国 LED", market: "美国", product: "LED",
        instructions: "查找 LED 买家", target_count: 10, buyer_role: "any",
      },
    },
  }));
  const guidedForm = page.locator("#discovery-guided-form");
  await guidedForm.getByLabel("产品", { exact: true }).fill("LED");
  await guidedForm.getByLabel("目标市场", { exact: true }).fill("美国");
  await guidedForm.getByRole("button", { name: "生成方案", exact: true }).click();
  await expect(page.getByRole("heading", { name: "任务方案", exact: true })).toBeVisible();
  const transcript = page.locator("#discovery-transcript");
  await expect(transcript.getByText("已整理美国 LED 客户方案。")).toBeHidden();
  await transcript.getByText("对话记录", { exact: true }).click();
  await expect(transcript.getByText("已整理美国 LED 客户方案。")).toBeVisible();

  await page.goto("/app?legacy=true#discover");
  await expect(page.getByRole("heading", { name: "找客条件", exact: true })).toBeVisible();
  await page.locator('#discover summary[aria-label="找客说明"]').click();
  await expect(page.getByText(/确认方案前不会创建任务/)).toBeVisible();
});

test("personal workbench connects live CRM and employees to the shared transaction demo", async ({ page }) => {
  await page.goto("/app");
  const data = page.getByRole("region", { name: "业务数据" });
  const employees = page.getByRole("region", { name: "数字员工" });
  await expect(data.getByRole("button", { name: /已保存客户.*65/ })).toBeVisible();
  await expect(data.getByRole("button", { name: /累计回款.*32,400/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "常用功能" }).getByRole("button", { name: "客户工作台" })).toBeVisible();
  await employees.getByRole("button", { name: /验收用马来西亚拓客员/ }).click();
  await expect(page.getByRole("dialog")).toContainText("包装耗材");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.screenshot({ path: resolve(evidence, "personal-workbench-desktop.png"), fullPage: true });

  const mutations: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/") && request.method() !== "GET") mutations.push(request.url());
  });
  await employees.getByRole("button", { name: /保险分析师/ }).click();
  await page.getByRole("button", { name: "预览保障需求清单" }).click();
  await expect(page.getByRole("dialog")).toContainText("装箱单");
  await page.getByRole("button", { name: "关闭预览" }).click();
  await page.getByRole("tab", { name: "应收融资对接" }).click();
  await expect(page.getByText("已备 2 / 5 项", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "预览机构对接摘要" }).click();
  await expect(page.getByRole("dialog")).toContainText("应收账款确权凭证");
  await page.getByRole("button", { name: "关闭预览" }).click();
  await page.getByRole("button", { name: "查看订单收款" }).click();
  await page.getByRole("button", { name: "预览收款提醒" }).click();
  await expect(page.getByRole("dialog")).toContainText("USD 33,600");
  await page.getByRole("button", { name: "关闭预览" }).click();
  await page.getByRole("button", { name: "核对回款流水" }).click();
  await expect(page.getByRole("dialog")).toContainText("DEMO-PSP-8616");
  await page.getByRole("button", { name: "确认演示对账" }).click();
  await expect(page.getByText("应收余额为零，已结清", { exact: true })).toBeVisible();
  await page.screenshot({ path: resolve(evidence, "orders-payments-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "查看订单保障" }).click();
  await page.getByRole("tab", { name: "应收融资对接" }).click();
  await expect(page.getByText("这笔订单已结清，无待融资应收", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /门店标准化设备/ }).click();
  await expect(page.getByText("已备 4 / 5 项", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "查看订单收款" }).click();
  await expect(page.getByRole("button", { name: /门店标准化设备/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("navigation", { name: "一级导航" }).getByRole("button", { name: "我的工作台" }).click();
  await expect(data.getByRole("button", { name: /累计回款.*66,000.*1 笔样例订单待回款/ })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: resolve(evidence, "personal-workbench-mobile.png"), fullPage: true });
  await employees.getByRole("button", { name: /收款跟进员/ }).click();
  await expect(page.locator("#page-title")).toHaveText("订单与收款");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(mutations).toEqual([]);
});

test("applied filters, saved view, removable chips and remembered density", async ({
  page,
}) => {
  await expect(page.getByText("共 65 条记录", { exact: true })).toBeVisible();
  await page.screenshot({
    path: resolve(evidence, "workbench-desktop.png"),
    fullPage: false,
  });
  await page
    .getByRole("textbox", { name: "搜索企业、姓名或邮箱", exact: true })
    .fill("Acceptance Buyer 01");
  await expect(
    page.getByText("筛选条件已修改，列表仍显示上次查询结果。"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "保存当前筛选", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "应用修改", exact: true }).click();
  await expect(page.getByText("共 1 条记录", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "保存当前筛选", exact: true }).click();
  await page
    .getByRole("textbox", { name: "筛选视图名称", exact: true })
    .fill("Acceptance saved view");
  await page.getByRole("button", { name: "保存视图", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator(".saved-view-select")).toContainText(
    "Acceptance saved view",
  );
  await page.getByText("紧凑", { exact: true }).click();
  await page.reload();
  await expect(page.locator(".ant-table-small")).toBeVisible();
  await query(page, "Acceptance Buyer 01");
  await page.locator(".applied-filters .ant-tag-close-icon").click();
  await expect(page.getByText("共 65 条记录", { exact: true })).toBeVisible();
});

test("server pagination, review persistence and customer evidence drawer", async ({
  page,
}) => {
  await page.getByRole("button", { name: "页 3", exact: true }).click();
  await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(
    5,
  );
  await page.getByRole("button", { name: "页 1", exact: true }).click();
  await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(
    30,
  );
  await query(page, "Acceptance Buyer 64");
  await page.getByRole("button", { name: "评审", exact: true }).click();
  await page.getByRole("button", { name: "保存评审", exact: true }).click();
  await expect(
    page.getByText("请填写判断理由与证据", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel("理由与来源证据")
    .fill("Acceptance evidence reviewed; actual demand remains unverified.");
  await page.getByRole("button", { name: "保存评审", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText("依据不足", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "详情", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Acceptance Buyer 64");
  await page.getByRole("tab", { name: "跟进与验证历史", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Acceptance evidence reviewed",
  );
  await page.getByRole("button", { name: "关闭详情", exact: true }).click();
});

test("contact events retain mailbox binding and disabled external verification", async ({
  page,
}) => {
  await page.getByText("联系人视图", { exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "独立邮箱验证", exact: true }),
  ).toBeVisible();
  await query(page, "buyer64@example.test");
  await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(
    1,
  );
  await page.getByRole("button", { name: "记录", exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("事件关联邮箱")).toHaveValue(
    "buyer64@example.test",
  );
  await page
    .getByRole("textbox", { name: "联系进展", exact: false })
    .fill("Acceptance reply archived to the correct mailbox.");
  await page.getByRole("button", { name: "记录进展", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "详情 / 验证", exact: true }).click();
  await page.getByRole("tab", { name: "联系人 (1)", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "验证邮箱", exact: true }),
  ).toBeDisabled();
  await page.getByRole("tab", { name: "跟进与验证历史", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("buyer64@example.test");
  await expect(page.getByRole("dialog")).toContainText(
    "Acceptance reply archived",
  );
});

test("batch reminder validates intervals and clears selection after saving", async ({
  page,
}) => {
  await page
    .locator(".ant-table-tbody tr.ant-table-row input[type=checkbox]")
    .nth(0)
    .check();
  await page
    .locator(".ant-table-tbody tr.ant-table-row input[type=checkbox]")
    .nth(1)
    .check();
  await page.getByRole("button", { name: "安排跟进", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName(
    "为 2 家企业安排跟进",
  );
  await expect(page.getByRole("dialog").getByLabel("后续提醒（相对首次的天数）", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "设置多轮提醒", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("后续提醒（相对首次的天数）", { exact: true })
    .fill("7,3");
  await page
    .getByRole("dialog")
    .getByLabel("跟进目标", { exact: false })
    .fill("Acceptance reminder; no automatic sending.");
  await page
    .getByRole("dialog")
    .getByLabel("首次提醒时间（本地时间）", { exact: false })
    .fill("2030-01-15 10:00");
  await page
    .getByRole("dialog")
    .getByLabel("首次提醒时间（本地时间）", { exact: false })
    .press("Enter");
  await expect(page.getByText(/最多填写 5 个不同/)).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel("后续提醒（相对首次的天数）", { exact: true })
    .fill("3,7");
  await page.getByRole("button", { name: "安排提醒", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "取消选择", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#wb-tasks")).toContainText("Acceptance reminder");
});

test("CSV preview and confirmed import use multipart then refresh the native table", async ({
  page,
}) => {
  await page.getByRole("button", { name: "导入名单", exact: true }).click();
  await page
    .locator("#wb-upload input[type=file]")
    .setInputFiles({
      name: "acceptance.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        "name,location,contact\nImported Acceptance Buyer,US,imported@example.test\n",
      ),
    });
  await page.locator("#wb-upload button").click();
  const commit = page.locator("#wb-import-commit");
  await expect(commit).toBeVisible();
  await commit
    .locator("[name=source_note]")
    .fill("Synthetic browser acceptance import");
  await commit.locator("[name=confirmed]").check();
  await commit.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.locator("#wb-import-preview")).toContainText("新增1");
  await query(page, "Imported Acceptance Buyer");
  await expect(page.getByText("共 1 条记录", { exact: true })).toBeVisible();
});

test("customer edits, follow-up and search stay on the workbench and draft tasks return to the same customer", async ({
  page,
}) => {
  await page.goto("/app#customers");
  await expect(page).toHaveURL(/#workbench$/);
  await query(page, "Acceptance Buyer 63");
  await page.getByRole("button", { name: "详情", exact: true }).click();
  const customer = page.getByRole("dialog", { name: "Acceptance Buyer 63", exact: true });
  await customer.getByRole("button", { name: "改阶段", exact: true }).click();
  const stage = page.getByRole("dialog", { name: "修改销售阶段", exact: true });
  await stage.getByRole("combobox", { name: "销售阶段", exact: true }).click();
  await page.getByRole("option", { name: "已筛选", exact: true }).click();
  const patch = page.waitForRequest((request) =>
    request.method() === "PATCH" && /\/crm\/prospects\/[a-f0-9]+$/.test(request.url()),
  );
  await stage.getByRole("button", { name: "保存", exact: true }).click();
  expect((await patch).postDataJSON()).toEqual({ expected_version: expect.any(Number), stage: "qualified" });
  await expect(customer.getByText("已筛选", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#workbench$/);

  await customer.getByRole("button", { name: "改标签", exact: true }).click();
  const tags = page.getByRole("dialog", { name: "修改标签", exact: true });
  await tags.getByRole("textbox", { name: "标签", exact: true }).fill("acceptance-reviewed");
  await tags.getByRole("button", { name: "保存", exact: true }).click();
  await expect(customer.getByText("acceptance-reviewed", { exact: true })).toBeVisible();

  await customer.getByRole("tab", { name: /联系人/ }).click();
  await customer.getByRole("button", { name: "精准联系人检索", exact: true }).click();
  const search = page.getByRole("dialog", { name: "精准联系人检索", exact: true });
  await expect(search.getByLabel("企业名称", { exact: true })).toHaveValue("Acceptance Buyer 63");
  await expect(search.getByLabel("已核对的企业官网", { exact: true })).toHaveValue("https://example.test");
  await expect(search.getByRole("checkbox", { name: /同意预占/ })).not.toBeChecked();
  await expect(page).toHaveURL(/#workbench$/);
  await search.getByRole("button", { name: "取消", exact: true }).click();

  await customer.getByRole("button", { name: "记录跟进", exact: true }).click();
  const followup = page.getByRole("dialog", { name: "记录跟进", exact: true });
  await followup.getByRole("textbox", { name: "跟进内容" }).fill("Acceptance customer note");
  await followup.getByRole("button", { name: "保存", exact: true }).click();
  await expect(customer).toContainText("Acceptance customer note");
  await customer.getByRole("button", { name: "写开发信", exact: true }).click();
  await page.getByRole("dialog", { name: "写开发信", exact: true })
    .getByRole("button", { name: /^生成草稿/ }).click();
  await expect(page.locator("#job-detail")).toContainText("LED introduction", {
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "返回客户详情", exact: true }).click();
  await expect(customer).toContainText("Acceptance customer note");
  await customer.getByRole("button", { name: "关闭详情", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "搜索企业、姓名或邮箱", exact: true })).toHaveValue("Acceptance Buyer 63");
});

test("basic discovery runs through the real queue and renders results", async ({
  page,
}) => {
  await page
    .getByRole("menuitem", { name: "thunderbolt 发现客户", exact: true })
    .click();
  await page.getByRole("tab", { name: "手动填写", exact: true }).click();
  const form = page.locator("#discovery-form");
  await expect(form.locator("[name=name]")).toBeHidden();
  await expect(form.locator("[name=contact_target]")).toBeHidden();
  await form.locator("[name=market]").fill("US");
  await form.locator("[name=product]").fill("LED");
  await form.locator("[name=tier]").selectOption("enhanced");
  await form.locator("button[type=submit]").click();
  await expect(
    page.locator(".ant-message").getByText("请选择并确认本次数据费用", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#discover$/);
  await form.locator("[name=tier]").selectOption("basic");
  const agent = page.waitForRequest((request) =>
    request.method() === "POST" && request.url().endsWith("/agents"),
  );
  await form.locator("button[type=submit]").click();
  expect((await agent).postDataJSON()).toMatchObject({ name: "US · LED", target_count: 10 });
  await expect(page).toHaveURL(/#jobs\//);
  await expect(page.locator("#job-detail")).toContainText("Fixture Buyer", {
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "保存客户", exact: true }).first().click();
  await page.getByRole("button", { name: "查看已保存客户", exact: true }).click();
  await expect(page).toHaveURL(/#workbench$/);
  await expect(page.getByRole("dialog", { name: /Fixture Buyer/ })).toBeVisible();
});

test("all navigation panels load without unexpected API errors", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/v1/") && response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  for (const [menu, title] of [
    ["apartment 企业与联系人", "企业与联系人"],
    ["global 商业情报", "商业情报"],
    ["bank 企业资料", "企业资料"],
    ["mail 邮件管理", "邮件管理"],
    ["unordered-list 任务管理", "任务管理"],
  ] as const) {
    await page.getByRole("menuitem", { name: menu, exact: true }).click();
    await expect(page.locator("#page-title")).toHaveText(title);
    await expect(page.locator("#refresh")).toBeEnabled();
  }
  await page.locator(".points-entry").click();
  await expect(page.locator("#page-title")).toHaveText("用量与费用");
  await expect(page.locator("#refresh")).toBeEnabled();
  expect(failures).toEqual([]);
});

test("mobile navigation, drawer and logout keep data isolated between accounts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "打开导航", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: resolve(evidence, "workbench-mobile.png"),
    fullPage: false,
  });
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "dashboard 业务概况", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "业务概况", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await page.getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page.locator("#auth")).toBeVisible();
  await page.locator("#login-phone").fill("13900000992");
  await page.locator("#login-password").fill("ui-test-password");
  await page.getByRole("button", { name: "进入工作台", exact: true }).click();
  await expect(page.locator("#auth")).toBeHidden();
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await page.getByRole("button", { name: "我的工作台", exact: true }).click();
  await expect(page.getByText("暂无拓客员工", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /验收用马来西亚拓客员/ })).toHaveCount(0);
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await page.getByRole("button", { name: "客户与商机", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "team 客户工作台", exact: true })
    .click();
  await expect(page.getByText("共 0 条记录", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Acceptance Buyer/ }),
  ).toHaveCount(0);
});

test("registration challenge and login create a separate empty workspace", async ({
  page,
}) => {
  await page.getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page.locator("#auth")).toBeVisible();
  await page.locator("#register-panel > summary").click();
  const form = page.locator("#register-form");
  await form.locator("[name=phone]").fill("13900000993");
  await form.locator("[name=password]").fill("ui-test-password");
  await page.locator("#request-code").click();
  await expect(form.locator("[name=challenge_id]")).not.toHaveValue("");
  await form.locator("[name=code]").fill("123456");
  await form.locator("button[type=submit]").click();
  await expect(
    page.locator(".ant-message").getByText("注册成功，请登录", { exact: true }),
  ).toBeVisible();
  await login(page, "13900000993");
  await expect(page.getByText("共 0 条记录", { exact: true })).toBeVisible();
});
