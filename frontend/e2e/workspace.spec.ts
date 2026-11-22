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

test("legacy customer edit and draft generation integrate with native navigation", async ({
  page,
}) => {
  await query(page, "Acceptance Buyer 63");
  await page.getByRole("button", { name: "详情", exact: true }).click();
  await page
    .getByRole("button", { name: "编辑档案与跟进", exact: true })
    .click();
  await expect(page.locator("#prospect-form")).toBeVisible();
  await page.locator("#prospect-form [name=stage]").selectOption("qualified");
  await page.locator("#prospect-form [name=tags]").fill("acceptance-reviewed");
  await page.getByRole("button", { name: "保存跟进设置", exact: true }).click();
  await expect(page.locator("#refresh")).toBeEnabled();
  await page
    .locator("#activity-form [name=content]")
    .fill("Acceptance customer note");
  await page.locator("#activity-form button[type=submit]").click();
  await expect(page.locator("#customer-detail")).toContainText(
    "Acceptance customer note",
  );
  await page.locator("#draft-form button[type=submit]").click();
  await expect(page.locator("#job-detail")).toContainText("LED introduction", {
    timeout: 30_000,
  });
});

test("basic discovery runs through the real queue and renders results", async ({
  page,
}) => {
  await page
    .getByRole("menuitem", { name: "thunderbolt 发现客户", exact: true })
    .click();
  await page.getByRole("tab", { name: "自行填写表单", exact: true }).click();
  const form = page.locator("#discovery-form");
  await form.locator("[name=name]").fill("Acceptance discovery");
  await form.locator("[name=market]").fill("US");
  await form.locator("[name=product]").fill("LED");
  await form.locator("[name=target_count]").fill("1");
  await form
    .locator("[name=instructions]")
    .fill("Find US LED buyers with dated procurement evidence.");
  await form.locator("[name=tier]").selectOption("enhanced");
  await form.locator("button[type=submit]").click();
  await expect(
    page.locator(".ant-message").getByText("请选择并确认本次数据费用", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#discover$/);
  await form.locator("[name=tier]").selectOption("basic");
  await form.locator("button[type=submit]").click();
  await expect(page).toHaveURL(/#jobs\//);
  await expect(page.locator("#job-detail")).toContainText("Fixture Buyer", {
    timeout: 30_000,
  });
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
