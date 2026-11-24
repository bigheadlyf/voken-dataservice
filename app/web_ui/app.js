"use strict";
const $ = (selector, parent = document) => parent.querySelector(selector);
const stages = {
  new: "新发现",
  qualified: "已筛选",
  contacted: "已联系",
  replied: "已回复",
  negotiating: "洽谈中",
  won: "已成交",
  lost: "不匹配",
};
const operations = {
  prospecting: "发现客户",
  public_search: "公开检索",
  report: "客户报告",
  outreach_draft: "开发信草稿",
  source_lookup: "官方情报查询",
  buyer_search: "采购商匹配",
  buyer_profile: "企业资料",
  buyer_contacts: "联系方式",
  customs_verification: "贸易核验",
  directory_companies: "统一企业库",
  directory_people: "人物与岗位",
  directory_contacts: "联系方式解锁",
  targeted_contacts: "精准联系人检索",
  trade_search: "按产品查历史贸易",
};
const statuses = {
  queued: "排队中",
  running: "执行中",
  cancelling: "取消中",
  succeeded: "已完成",
  partial: "部分完成",
  failed: "失败",
  cancelled: "已取消",
};
const titles = {
  workbench: "客户工作台",
  overview: "概况",
  discover: "找客户 · 创建任务",
  sources: "商业情报查询",
  customers: "客户管理",
  jobs: "任务管理",
  "job-view": "任务详情",
  mail: "邮件管理",
  company: "我的企业信息",
  costs: "用量与费用",
  directory: "找联系人 / 企业",
};
const sourceNames = {
  gleif: "GLEIF 企业身份",
  ted: "TED 欧洲招标",
  companies_house: "英国企业登记",
  worldbank_notices: "世界银行采购公告",
  find_tender: "Find a Tender 英国采购",
  contracts_finder: "Contracts Finder 英国合同",
  thomasnet: "Thomasnet 工业目录",
  kompass: "Kompass 企业目录",
  europages: "Europages 企业目录",
  opencorporates: "OpenCorporates 企业身份参考",
  industry_members: "MSCI / NAW 行业协会",
};
const categoryNames = {
  entity_identity: "企业身份",
  procurement: "采购公告",
  company_filings: "企业披露",
  business_directory: "企业目录",
  industry_associations: "行业协会",
  development_projects: "项目与采购",
  product_risk: "产品风险",
  market_statistics: "市场统计",
  exhibitions: "展会与目录",
};
const errors = {
  invalid_credentials: "手机号或密码不正确",
  authentication_required: "登录已过期，请重新登录",
  company_profile_required: "请先在「我的企业」填写企业名称和主营产品",
  prospect_do_not_contact: "该客户已标记为拒绝联系",
  prospect_version_conflict: "客户记录已更新，请刷新后再保存",
  company_version_conflict: "企业资料已更新，请刷新后再保存",
  insufficient_points: "点数不足，请前往「用量与费用」查看点数套餐",
  request_rate_limit: "操作过于频繁，请稍后再试",
  verification_provider_unavailable:
    "当前未接入短信服务，请联系运营人员开通账号",
  paid_confirmation_required: "请选择并确认本次数据费用",
  customs_provider_unavailable: "跨境魔方尚未配置或每日上限为零",
  agent_run_in_progress: "该任务正在执行",
  job_queue_limit: "待处理任务过多，请稍后再试",
  deepseek_not_configured: "AI 服务尚未配置",
  deepseek_balance_low: "AI 上游余额不足",
  prospect_not_found: "客户不存在",
  invalid_lead_index: "选中的线索不存在",
  deepseek_invalid_model_output: "AI 返回格式异常，本次未能完成",
  deepseek_rate_limited: "AI 服务暂时限流，请稍后再试",
  provider_call_requires_reconciliation:
    "此前上游调用结果未确认，请先查看任务日志，避免重复费用",
  upkuajing_daily_limit: "今日付费数据调用已达到平台上限",
  enhancement_budget_exhausted: "本次数据增强预算已用完，保留已取得结果",
  enhancement_criteria_incomplete: "尚不能确定国家与产品条件，已跳过数据增强",
  directory_job_not_ready: "请等待列表任务完成后选择记录",
  directory_record_not_found: "该记录不属于所选查询结果",
  directory_no_more_pages: "已没有下一页",
  directory_contacts_empty: "上游未返回具体联系方式，请换一个已核对的主体",
  official_source_country_unresolved: "无法可靠确认目标国家，已跳过官方招标源",
  open_source_invalid_response: "官方来源返回格式异常，暂不能使用本次数据",
  open_source_request_failed: "官方来源暂时无法完成请求",
  open_sources_disabled: "官方原生接口查询已在服务端停用",
  open_source_partial_timeout: "官方来源返回不完整，已保留可用记录",
  notice_outside_requested_date_range: "已排除超出请求时间范围的公告",
  notice_publication_date_unavailable: "已排除无法核实发布时间的公告",
  open_source_not_configured: "该来源需要在服务端配置密钥",
  open_source_country_not_supported: "该来源暂不支持此国家代码，请调整筛选",
  open_source_rate_limited: "官方来源暂时限流，请稍后再试",
  open_source_daily_limit: "今日官方接口调用已达到平台上限",
  open_source_connection_unavailable: "暂时无法连接官方数据源",
  open_source_access_denied: "官方数据源拒绝了本次访问",
  open_source_invalid_query: "官方来源不接受当前查询，请简化关键词",
  source_entity_requires_disambiguation: "该记录包含多个主体，请先核对具体买方",
  schedule_version_conflict: "周期计划已更新，请刷新后再修改",
  deepseek_connection_unavailable: "暂时无法连接 AI 服务",
  deepseek_read_timeout: "AI 服务响应超时，请查看已有结果或稍后重试",
};
const state = {
  session: null,
  tab: "overview",
  jobs: [],
  selectedJob: null,
  selectedProspect: null,
  offset: 0,
  total: 0,
  profileVersion: 0,
  prices: {},
  discoveryAgent: null,
  schedules: [],
  sources: [],
};
let toastTimer;
function copyHelp(label, content) {
  return `<details class="copy-help"><summary aria-label="${escape(label)}">?</summary><div class="copy-help-content">${escape(content)}</div></details>`;
}
document.addEventListener("click", (event) => {
  const clicked = event.target.closest?.(".copy-help");
  for (const help of document.querySelectorAll(".copy-help[open]")) {
    if (help !== clicked) help.open = false;
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const help = document.querySelector(".copy-help[open]");
  if (!help) return;
  help.open = false;
  help.querySelector("summary")?.focus();
});
function escape(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function toast(message, error = false) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").className = error ? "error" : "";
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("#toast").hidden = true;
  }, 8000);
}
function readable(error) {
  return errors[error] || String(error || "请求失败，请稍后重试");
}
function evidenceLabel(lead) {
  const validity = {
    expired: "历史采购信号 · 已过期",
    deadline_today_time_unknown: "今日截止 · 具体时间待核实",
    dated_future_deadline: "有未来截止日期 · 资格待核实",
  };
  if (validity[lead.demand_validity]) return validity[lead.demand_validity];
  return (
    {
      public_demand_signal: "公开采购信号 · 时效未核实",
      procurement_notice: "公开招标 · 截止日期与资格待核实",
      entity_registration: "企业登记参考 · 不代表采购意向",
      potential_match: "潜在匹配 · 需求未确认",
      user_supplied: "自有名单 · 待核实",
    }[lead.evidence_type] || "线索证据待核实"
  );
}
function activityHTML(item) {
  const names = {
    created: "保存客户",
    updated: "调整跟进",
    note: "备注",
    email_sent: "已发送邮件",
    reply: "收到回复",
    call: "通话",
    meeting: "会议",
    feedback: "线索反馈",
    opt_out: "拒绝联系",
    draft_requested: "生成开发信",
    research_requested: "公域查证",
    contact_selected: "采用联系信息",
  };
  let content = escape(item.content);
  if (item.kind === "created") content = "已保存客户并保留首次来源证据。";
  if (
    ["draft_requested", "research_requested"].includes(item.kind) &&
    /^[a-f0-9]{32}$/.test(item.content)
  )
    content = `<button data-job="${item.content}">查看${item.kind === "draft_requested" ? "开发信" : "查证"}任务 →</button>`;
  return `<div class="activity"><small>${escape(date(item.created_at))} · ${escape(names[item.kind] || item.kind)}</small>${content}</div>`;
}
function reportHTML(report, sources) {
  let html = `<h3>企业概况</h3><p>${escape(report.overview)}</p><h3>跟进判断</h3><p>${escape(report.opportunity)}</p>`;
  if (report.highlights?.length)
    html +=
      "<h3>相关事实与来源</h3>" +
      report.highlights
        .map(
          (item) =>
            `<article class="lead"><p>${escape(item.text)}</p>${(
              item.source_ids || []
            )
              .map((id) => {
                const source = sources.find((s) => s.source_id === id);
                return source
                  ? safeLink(source.url, source.title || "查看来源")
                  : "";
              })
              .join(" · ")}</article>`,
        )
        .join("");
  if (report.risks?.length)
    html +=
      "<h3>信息缺口与风险</h3><ul>" +
      report.risks.map((text) => `<li>${escape(text)}</li>`).join("") +
      "</ul>";
  if (report.next_steps?.length)
    html +=
      "<h3>建议下一步</h3><ol>" +
      report.next_steps.map((text) => `<li>${escape(text)}</li>`).join("") +
      "</ol>";
  return '<div class="report-copy">' + html + "</div>";
}
function officialAddress(record) {
  const address =
    record.details?.address || record.details?.registered_address || {};
  return [
    ...(Array.isArray(address.addressLines) ? address.addressLines : []),
    address.address_line_1,
    address.address_line_2,
    address.city || address.locality,
    address.region,
    address.postalCode || address.postal_code,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(", ");
}
function providerEvidenceHTML(evidence, kind) {
  let html = `<div class="notice">${kind === "customs" ? "历史贸易记录，不等于当前采购需求。" : "上游商务数据，仍需核对企业主体与联系方式。"}</div>`;
  html += (evidence.records || [])
    .map((row) => {
      if (row.channel)
        return `<article class="lead"><b>${escape({ emails: "邮箱", phones: "电话", websites: "网站", socials: "社媒" }[row.channel] || "联系信息")}</b><p>${escape(row.value)}</p>${row.verification_source === "hunter" ? `<p class="hint">来源：Hunter · ${escape(row.name || "企业联系入口")} ${escape(row.position || "")} · ${escape(row.verification_status || "未检测")} ${row.role_match ? escape(row.role_match === "keyword_or_department_match" ? "· 岗位关键词/部门命中，待核实" : "· 岗位待核实") : ""}</p>` : ""}<p class="hint">${escape({ 0: "上游未检测", 1: "上游标记有效，投递前仍需核对", 2: "上游标记无效", 3: "上游状态不确定" }[row.validity] || "有效性未检测")}</p></article>`;
      const trade = kind === "customs";
      const measures = trade ? `<p>数量：${escape(row.quantity ?? "未提供")} ${escape(row.quantity_unit || "单位未知")}<br>重量：${escape(row.weight ?? "未提供")} ${escape(row.weight_unit || "单位未知")}<br>金额：${escape(row.amount ?? "未提供")} ${escape(row.amount_unit || "币种未知")}</p><p class="hint">原产国：${escape(row.origin_country || "未知")} → 抵运国：${escape(row.arrival_country || "未知")}<br>HS：${escape((row.hs_codes || []).join("、") || "未提供")}<br>数量为原始明细，不代表单型号采购量；币种未知时不能推算价格。</p>` : "";
      return `<article class="lead"><b>${escape(row.name || row.buyer || "企业记录")}</b><p>${escape(row.product_description || row.scope || row.introduce || "")}</p><p>${escape(row.address || row.buyer_country || row.industry || "")}</p>${!trade && row.country_verification === "unknown" ? '<p class="hint">企业国家未由上游返回，查询国家不代表企业归属。</p>' : ""}${row.seller ? `<p>历史供应方：${escape(row.seller)}</p>` : ""}${row.trade_date_ms ? `<p class="hint">交易时间：${escape(date(row.trade_date_ms))}</p>` : ""}${measures}</article>`;
    })
    .join("");
  return html;
}
function date(value) {
  return value
    ? new Date(value).toLocaleString("zh-CN", { hour12: false })
    : "未设置";
}
function safeLink(value, label = "查看来源 ↗") {
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password)
      return "";
    return `<a href="${escape(u.href)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
  } catch {
    return "";
  }
}
function root() {
  return `/api/v1/workspaces/${state.session.workspace_id}`;
}
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (typeof FormData !== "undefined" && options.body instanceof FormData)
    delete headers["Content-Type"];
  const requestToken = state.session?.access_token;
  if (state.session)
    headers.Authorization = `Bearer ${state.session.access_token}`;
  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error(
      "网络连接失败。已提交的任务可能仍在执行；任务提交可使用原请求重试。",
    );
  }
  if (response.status === 401 && state.session?.access_token === requestToken) {
    state.session = null;
    sessionStorage.removeItem("voken-session");
    $("#workspace").hidden = true;
    $("#auth").hidden = false;
  }
  if (
    path.startsWith("/api/v1/workspaces/") &&
    state.session?.access_token !== requestToken
  ) {
    throw new Error("会话已变化，请在当前账号下重新操作。");
  }
  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {}
    const detail = data?.detail;
    if (response.status === 429 && detail === "request_rate_limit") {
      const seconds = Number(response.headers.get("Retry-After"));
      const wait = Number.isFinite(seconds) && seconds > 0
        ? `请约 ${Math.ceil(seconds / 60)} 分钟后重试。`
        : "请稍后再试。";
      const reason = path.includes("/company/")
        ? "企业资料搜索与分析的共享额度已用完（每个工作空间 24 小时内共 20 次，失败请求也计入）。手动填写并保存企业资料仍可使用。"
        : "操作次数已达到限制。";
      throw new Error(reason + wait);
    }
    throw Object.assign(new Error(
      Array.isArray(detail)
        ? detail.map((x) => `${x.loc?.at(-1)}: ${x.msg}`).join("\n")
        : readable(detail || `HTTP ${response.status}`),
    ), { status: response.status, detail });
  }
  if (response.status === 204) return null;
  const result = await response.json();
  // The account may change while a slow response body is still downloading/parsing.
  if (
    path.startsWith("/api/v1/workspaces/") &&
    state.session?.access_token !== requestToken
  )
    throw new Error("会话已变化，请在当前账号下重新操作。");
  return result;
}
function formData(form) {
  return Object.fromEntries(new FormData(form));
}
async function runAction(button, fn) {
  if (button?.disabled) return;
  if (button) {
    button.disabled = true;
    button.setAttribute?.("aria-busy", "true");
  }
  try {
    await fn();
  } catch (error) {
    toast(error.message, true);
  } finally {
    if (button) {
      button.disabled = false;
      button.removeAttribute?.("aria-busy");
    }
  }
}
function saveSession() {
  sessionStorage.setItem("voken-session", JSON.stringify(state.session));
}
function clearWorkspaceView() {
  if (typeof resetDirectoryView === "function") resetDirectoryView();
  if (typeof resetAccountPanels === "function") resetAccountPanels();
  if (typeof resetDiscoveryChat === "function") resetDiscoveryChat();
  state.jobs = [];
  state.selectedJob = null;
  state.selectedProspect = null;
  state.discoveryAgent = null;
  state.schedules = [];
  state.sources = [];
  state.offset = 0;
  state.total = 0;
  state.profileVersion = 0;
  if (typeof resetWorkbench === "function") resetWorkbench();
  state.prices = {};
  state.pointQuotes = {};
  for (const id of [
    "customer-list",
    "customer-detail",
    "job-list",
    "mail-drafts",
    "job-detail",
    "source-catalog",
    "schedule-list",
    "ledger",
    "stats",
  ]) {
    $("#" + id).replaceChildren();
    delete $("#" + id).dataset.job;
  }
  $("#company-form").reset();
  $("#discovery-form").reset();
  if ($("#discovery-form-options")) $("#discovery-form-options").open = false;
  if ($("#discovery-contact-target")) $("#discovery-contact-target").hidden = true;
  $("#paid-label").hidden = true;
}
function pendingSubmission(slot, payload) {
  const encoded = JSON.stringify(payload);
  const existing = JSON.parse(sessionStorage.getItem(slot) || "null");
  if (existing?.encoded === encoded) return existing.key;
  const key =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replaceAll("-", "")
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
  sessionStorage.setItem(slot, JSON.stringify({ encoded, key }));
  return key;
}
function clearSubmission(slot) {
  sessionStorage.removeItem(slot);
}
async function enter() {
  clearWorkspaceView();
  $("#auth").hidden = true;
  $("#workspace").hidden = false;
  state.tab = "overview";
  await loadGlobal();
  await switchTab(location.hash.slice(1) || (window.__VOKEN_REACT__ ? "my-overview" : "overview"));
}
async function loadGlobal() {
  const [balance, prices, quotes] = await Promise.all([
    api(root() + "/points"),
    api(root() + "/points/costs"),
    api(root() + "/points/quotes"),
  ]);
  state.prices = prices;
  state.pointQuotes = quotes;
  $("#balance").textContent = `${balance.available.toLocaleString()} 点数`;
  updateDiscoveryPrice();
}
function updateDiscoveryPrice() {
  const targetedQuote = state.pointQuotes?.targeted_contacts;
  if (targetedQuote && $("#targeted-contact-price")) $("#targeted-contact-price").textContent = `预占 ${targetedQuote.total_points} 点（平台 ${targetedQuote.platform_points}，数据 ${targetedQuote.data_points}）`;
  const tier = $('#discovery-form [name="tier"]').value;
  const contactTarget = $("#discovery-contact-target");
  if (contactTarget) contactTarget.hidden = tier !== "ai_enhanced";
  const quote =
    state.pointQuotes?.[
      tier === "ai_enhanced" ? "prospecting_ai_enhanced" : tier !== "basic" ? "prospecting_enhanced" : "prospecting"
    ];
  if (quote)
    $("#discovery-price").textContent =
      `预占 ${quote.total_points} 点（平台 ${quote.platform_points}，数据 ${quote.data_points}）`;
}
async function switchTab(tab) {
  if (tab.startsWith("jobs/")) {
    state.selectedJob = tab.slice(5);
    tab = "job-view";
  }
  if (tab === "jobs" && state.selectedJob) tab = "job-view";
  if (tab === "job-view" && !state.selectedJob) tab = "jobs";
  if (!titles[tab]) tab = "overview";
  state.tab = tab;
  history.replaceState(null, "", "#" + (tab === "job-view" ? "jobs/" + state.selectedJob : tab));
  for (const panel of document.querySelectorAll(".tab-panel"))
    panel.hidden = panel.id !== tab;
  for (const b of document.querySelectorAll("nav [data-tab]")) {
    b.classList.toggle("active", b.dataset.tab === (tab === "job-view" ? "jobs" : tab));
    if (b.dataset.tab === (tab === "job-view" ? "jobs" : tab)) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  }
  $("#tools-nav").open = ["directory", "company", "mail"].includes(tab);
  $("#page-title").textContent = titles[tab];
  window.scrollTo(0, 0);
  await refreshTab();
}
async function refreshTab() {
  if (["overview", "my-overview"].includes(state.tab)) await loadOverview();
  if (state.tab === "customers") await loadCustomers();
  if (state.tab === "workbench" && typeof loadWorkbench === "function") await loadWorkbench();
  if (state.tab === "company") await loadCompany();
  if (["jobs", "job-view", "discover", "mail"].includes(state.tab)) await loadJobs();
  if (state.tab === "costs") await loadCosts();
  if (state.tab === "discover") {
    await Promise.all([
      loadSchedules(),
      typeof loadDiscoveryContext === "function" ? loadDiscoveryContext() : Promise.resolve(),
    ]);
  }
  if (state.tab === "sources") await loadSources();
  if (typeof extensionRefresh === "function") await extensionRefresh();
}
function stat(label, value, note = "") {
  return `<div class="stat"><span>${escape(label)}</span><strong>${escape(value)}</strong><span>${escape(note)}</span></div>`;
}
async function loadOverview() {
  const data = await api(root() + "/crm/summary");
  $("#stats").innerHTML =
    stat("已保存客户", data.total) +
    stat("到期待跟进", data.due_followups) +
    stat("正在洽谈", data.stages.negotiating || 0) +
    stat("已成交", data.stages.won || 0);
  $("#next-actions").innerHTML =
    `<div class="notice">${data.due_followups ? `${data.due_followups} 位客户待跟进` : "暂无到期客户"}</div><div class="actions"><button data-tab="customers">查看客户</button><button data-tab="company">完善企业资料</button></div><p class="hint">已停止联系 ${data.do_not_contact} 位客户</p>`;
}
function filters() {
  const params = new URLSearchParams({ offset: state.offset, limit: 30 });
  if ($("#customer-query").value.trim())
    params.set("q", $("#customer-query").value.trim());
  if ($("#stage-filter").value) params.set("stage", $("#stage-filter").value);
  if ($("#due-filter").checked) params.set("due", "true");
  return params;
}
async function loadCustomers() {
  const data = await api(root() + "/crm/prospects?" + filters());
  state.total = data.total;
  $("#customer-count").textContent =
    `共 ${data.total} 位客户 · 分数表示证据完整度，不代表成交概率`;
  $("#customer-list").innerHTML =
    data.items
      .map(
        (row) =>
          `<button class="customer-card ${state.selectedProspect?.id === row.id ? "selected" : ""}" data-prospect="${row.id}"><div class="card-top"><b>${escape(row.name)}</b><span class="badge ${row.do_not_contact ? "warn" : ""}">${row.do_not_contact ? "停止联系" : stages[row.stage]}</span></div><div class="card-meta">${escape(row.location || "地区待核实")} · 证据 ${row.score.value}/100</div><div class="card-meta">${escape(row.contact || "暂无联系方式")}${row.next_followup_at ? `<br>跟进 ${escape(date(row.next_followup_at))}` : ""}</div></button>`,
      )
      .join("") ||
    '<div class="panel empty">还没有符合条件的客户。先发现客户，或导入已有名单。</div>';
  $("#page-number").textContent =
    `${Math.floor(state.offset / 30) + 1} / ${Math.max(1, Math.ceil(data.total / 30))}`;
  $("#prev").disabled = state.offset === 0;
  $("#next").disabled = state.offset + 30 >= data.total;
  if (state.selectedProspect) await selectProspect(state.selectedProspect.id);
}
async function selectProspect(id) {
  const [row, activities] = await Promise.all([
    api(root() + "/crm/prospects/" + id),
    api(root() + "/crm/prospects/" + id + "/activities"),
  ]);
  state.selectedProspect = row;
  const source = row.evidence.source || {};
  const localFollowup = row.next_followup_at
    ? new Date(
        new Date(row.next_followup_at).getTime() -
          new Date(row.next_followup_at).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
  $("#customer-detail").innerHTML =
    `<p class="eyebrow">客户档案</p><h2>${escape(row.name)}</h2><p class="muted">${escape(row.location)}</p><div class="notice">${escape(evidenceLabel(row.evidence))}<br>证据完整度 ${row.score.value}/100${row.evidence.company_id ? "<br>有跨境魔方企业标识；不等于当前采购意向。" : ""}</div>${row.evidence.quote ? `<blockquote>${escape(row.evidence.quote)}</blockquote>` : ""}${row.evidence.source_record ? `<div class="notice"><b>原始记录范围</b><p>${escape(row.evidence.source_record.title)}</p><p>发布时间：${escape(row.evidence.source_record.details?.published_at || "未提供")}<br>截止日期：${escape((row.evidence.source_record.details?.deadline_dates || []).join("、") || "待核实")}</p>${row.evidence.source_record.procurement_status === "expired" ? "<p>此公告截止日期已过，仅作历史参考。</p>" : ""}<p class="hint">${escape(row.evidence.source_record.details?.attribution || "请核对原始记录。")}</p></div>` : ""}<p>${safeLink(source.url)} ${safeLink(row.website, "企业网站 ↗")}</p><p class="hint">${escape(row.evidence.source_note || row.evidence.reason || "")}<br>联系方式仅为已记录信息，未验证可投递性。</p>${row.evidence.source_record?.details?.published_procurement_email ? `<div class="notice">公告公开邮箱：${escape(row.evidence.source_record.details.published_procurement_email)}<br>核对采购主体、公告期限和联系用途后再采用；未验证可投递性。<br><button data-source-contact="${escape(row.evidence.source_record.details.published_procurement_email)}" data-prospect-id="${row.id}" data-source-job="${escape(row.evidence.origin_job_id)}" data-version="${row.version}">已核对，采用公告邮箱</button></div>` : ""}<form id="prospect-form"><label>销售阶段<select name="stage">${Object.entries(
      stages,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${row.stage === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select></label><label>商务联系方式<input name="contact" value="${escape(row.contact)}" maxlength="500"></label><label>标签（逗号分隔）<input name="tags" value="${escape(row.tags.join(", "))}"></label><label>下次跟进时间<input name="next_followup_at" type="datetime-local" value="${localFollowup}"></label><label class="check"><input type="checkbox" name="do_not_contact" ${row.do_not_contact ? "checked" : ""}>拒绝联系 / 停止跟进</label><button type="submit" class="primary">保存跟进设置</button></form><div class="actions"><button data-research="${row.id}">公域查证与找邮箱 · ${state.prices.report} 点</button></div><hr><h3>写好第一封开发信</h3><form id="draft-form"><label>语言<select name="language">${["English", "Chinese", "Spanish", "German", "French", "Portuguese"].map((v) => `<option>${v}</option>`).join("")}</select></label><label>这封信的目标<textarea name="objective" rows="2" maxlength="1000" required>简洁介绍产品，询问对方是否有相关需求。</textarea></label><button type="submit" ${row.do_not_contact ? "disabled" : ""}>生成待审阅草稿 · ${state.prices.outreach_draft} 点</button></form><hr><h3>记录一次推进</h3><form id="activity-form"><label>记录类型<select name="kind"><option value="note">备注</option><option value="email_sent">已通过自有邮箱发送</option><option value="reply">收到回复</option><option value="call">通话</option><option value="meeting">会议</option><option value="feedback">线索质量反馈</option><option value="opt_out">收到拒绝联系请求</option></select></label><label>内容<textarea name="content" rows="3" required maxlength="4000"></textarea></label><button type="submit">保存记录</button></form><hr><h3>最近跟进记录</h3>${activities.map(activityHTML).join("") || '<p class="hint">暂无跟进记录</p>'}`;
  $("#customer-detail").insertAdjacentHTML("beforeend", '<hr><button data-directory-prospect="true">查企业与岗位联系人</button><button data-targeted-prospect="selected">精准联系人检索 · AI增强</button><div id="saved-directory-contacts"></div>');
  if (typeof renderSavedDirectoryContacts === "function") await renderSavedDirectoryContacts(id);
  if (typeof renderWorkbenchContactDetails === "function") await renderWorkbenchContactDetails(id);
}
async function loadJobs() {
  const rows = await api(root() + "/jobs?limit=100");
  state.jobs = rows;
  renderTaskList();
  $("#mail-drafts").innerHTML = rows.filter(row => row.operation === "outreach_draft").map(jobCardHTML).join("") || '<p class="hint">暂无草稿。到客户管理选择客户，生成第一封开发信。</p>';
  $("#recent-discoveries").innerHTML =
    rows
      .filter((j) => j.operation === "prospecting")
      .slice(0, 6)
      .map(
        (row) =>
          `<button class="job-card" data-job="${row.id}">${escape(date(row.created_at))}<span class="badge">${escape(statuses[row.status])}</span></button>`,
      )
      .join("") || '<p class="hint">提交后在这里查看结果。</p>';
  if (state.selectedJob && state.tab === "job-view")
    await selectJob(state.selectedJob);
}
async function selectJob(id) {
  state.selectedJob = id;
  const row = await api(root() + "/jobs/" + id);
  const result = row.result || {};
  let body = `<p class="eyebrow">${escape(operations[row.operation] || row.operation)}</p><h2>${escape(statuses[row.status] || row.status)}</h2><p class="hint">${escape(date(row.created_at))} · 预占 ${row.point_cost} 点 · 已结算 ${row.points_charged} 点</p>`;
  if (["queued", "running", "cancelling"].includes(row.status))
    body +=
      '<div class="notice">处理中，每 5 秒刷新</div>';
  if (row.error)
    body += `<div class="notice">${escape(readable(row.error))}</div>`;
  if (result.warnings?.length)
    body += `<p class="hint">来源缺口：${result.warnings.map((code) => escape(readable(code))).join("、")}</p>`;
  if (result.paid_usage)
    body += `<div class="notice">数据费用 ¥${(result.paid_usage.committed_milli_cny / 1000).toFixed(3)}${result.paid_usage.has_unconfirmed_cost ? "（含未确认金额）" : ""} ${copyHelp("数据费用说明", "已回传的费用按任务报价折算为点数，未另收人民币费用。")}</div>`;
  if (result.point_settlement)
    body += `<p class="hint">点数结算：平台 ${result.point_settlement.platform_points} 点，数据 ${result.point_settlement.data_points} 点；释放 ${result.point_settlement.released_points} 点。</p>`;
  if (result.leads) {
    body += '<details><summary>反馈原因</summary><label>原因类别<select id="feedback-reason-code"><option value="other">其他／未填写</option><option value="role">客户角色不符</option><option value="product">产品不符</option><option value="country">市场不符</option><option value="size">规模不符</option><option value="competitor">同行／竞争关系</option><option value="logistics">物流货代主体</option></select></label><label>补充说明<input id="feedback-reason" maxlength="500"></label></details>';
    if (result.lead_review) {
      const r = result.lead_review;
      body += r.status === "completed" ? `<p class="hint">AI 二次复核 ${Number(r.assessed || 0)} 家 · 调整来源 ${Number(r.source_reassignments || 0)} 家 · 有原句依据的不匹配 ${r.excluded?.length || 0} 家；仍须人工核对。</p>${r.excluded?.length ? `<details><summary>查看未推荐候选及依据</summary>${r.excluded.map(x => `<article class="lead"><b>${escape(x.name)}</b><p>${escape(x.assessment?.explanation || "")}</p>${["role","product","country"].filter(k => x.assessment?.[k+"_fit"] === "not_fit").map(k => `<blockquote>${escape(x.assessment[k+"_quote"] || "")}</blockquote>`).join("")}${safeLink(x.source_url)}</article>`).join("")}</details>` : ""}` : r.status === "unavailable" ? '<p class="hint">AI 二次复核本次不可用，以下结果仍经过原有来源与原句校验。</p>' : "";
    }
    if (result.acquisition_summary) {
      const s = result.acquisition_summary;
      body += `<div class="notice">独立企业 ${s.companies} 家 · 有邮箱企业 ${s.companies_with_email} 家 · 有正文短句 ${s.companies_with_quote} 家 · 有未来截止依据的需求 ${s.dated_future_demand} 条</div>`;
    }
    body += result.leads.length
      ? `<div class="actions"><button id="save-all-leads" class="primary">保存全部（${result.leads.length}）</button>${copyHelp("线索与反馈说明", "保存前核对来源、产品和企业角色。反馈用于后续相同画像的任务。")}</div>`
      : '<div class="empty">暂无线索，可调整市场或产品后重试。</div>';
    body += result.leads
      .map(
        (lead, index) =>
          `<article class="lead"><div class="card-top"><b>${escape(lead.name)}</b><span class="badge">${escape(evidenceLabel(lead))}</span></div><p>${escape(lead.location)} · ${escape(lead.role)}</p><p>${escape(lead.reason)}</p>${lead.quote ? `<blockquote>${escape(lead.quote)}</blockquote>` : ""}<p>${escape(lead.contact || "联系方式待核实")}</p>${safeLink(lead.source?.url)}${typeof leadEnrichmentHTML === "function" ? leadEnrichmentHTML(lead) : ""}<div class="actions"><button data-save-lead="${index}">保存客户</button><button data-directory-lead="${index}">查企业与联系人</button><button data-lead-feedback="fit" data-lead-index="${index}">符合画像</button><button data-lead-feedback="not_fit" data-lead-index="${index}">不匹配</button><button data-lead-feedback="unreviewed" data-lead-index="${index}">撤销反馈</button></div><p class="hint" id="lead-feedback-${index}"></p></article>`,
      )
      .join("");
  }
  if (result.draft) {
    const draft = result.draft;
    body += `<div class="notice" id="draft-delivery-status">发送前请核对收件人、产品承诺和联系理由。</div><h3>${escape(draft.subject)}</h3><div class="draft-text">${escape(draft.body)}</div><div class="actions"><button id="copy-draft">复制邮件</button><button id="download-draft">下载 .eml 邮件</button><button data-prospect-jump="${escape(draft.prospect_id)}">查看客户 →</button></div>${draft.review_notes?.length ? copyHelp("草稿审阅提示", draft.review_notes.join("；")) : ""}`;
  }
  if (result.source_lookup) {
    const lookup = result.source_lookup;
    body += `<div class="notice">${escape(sourceNames[lookup.source_id] || lookup.source_id)} · 本页 ${lookup.records.length} 条${lookup.total_reported != null ? ` / 上游报告 ${lookup.total_reported} 条` : ""}${lookup.has_more ? " · 还有更多" : ""} ${copyHelp("公开记录说明", "请在原文中核对采购主体、公告时效和投标资格。历史中标仅作参考。")}</div>`;
    if (lookup.search_scope === "one_upstream_page_not_global_keyword_search")
      body += `<p class="notice">仅扫描上游一页 ${Number(lookup.scanned_count || 0)} 条，本页关键词匹配 ${Number(lookup.matched_in_page || 0)} 条，展示 ${lookup.records.length} 条；不是全库关键词搜索。${lookup.date_filter?.field === "updated" ? "时间窗口按记录更新。" : "时间窗口按发布时间。"}中标与合同记录不表示仍开放采购。</p>`;
    body += '<div class="actions"><button data-tab="sources">调整条件重新查询</button><button data-tab="customers">查看已保存客户</button></div>';
    if (!lookup.records.length) body += '<div class="empty"><h3>暂无匹配记录</h3><p>可缩短关键词或更换查询范围。</p></div>';
    body += lookup.records
      .map(
        (record, index) =>
          `<article class="lead"><b>${escape(record.title)}</b><p>${escape(record.entity_name || "多主体记录，需核对买方")} · ${escape(record.country || record.details?.project_country || "地区待核实")}</p><p>${escape(record.summary)}</p>${officialAddress(record) ? `<p>登记地址：${escape(officialAddress(record))}</p>` : ""}<p class="hint">${record.details?.published_at ? "发布时间：" + escape(record.details.published_at) : ""}${record.details?.deadline_dates?.length ? "<br>截止日期：" + record.details.deadline_dates.map(escape).join("、") : ""}${record.details?.published_procurement_email ? "<br>公告公开邮箱（未验证投递）：" + escape(record.details.published_procurement_email) : ""}${record.details?.attribution ? "<br>来源归属：" + escape(record.details.attribution) : ""}${record.procurement_status === "expired" ? "<br>该公告截止日期已过。" : ""}${record.evidence_type === "entity_registration" ? "企业登记参考；不是采购或信用保证。" : "公告时效、采购主体与投标资格须查看原文。"}</p>${safeLink(record.source_url, "查看官方原始记录 ↗")}${record.entity_name ? `<br><button data-save-source="${index}">保存为待核实客户</button>` : ""}</article>`,
      )
      .join("");
  }
  if (row.operation === "public_search" && result.sources && !result.sources.length)
    body += '<div class="empty">本次未找到相关公开页面。可使用更短的英文关键词，或调整查询范围。</div><button data-tab="sources">调整情报查询条件 →</button>';
  if (result.sources && row.operation === "public_search")
    body += result.sources
      .map(
        (source) =>
          `<article class="lead"><b>${escape(source.title || "官方页面")}</b><p>${escape(source.snippet || source.summary || "")}</p>${safeLink(source.url)}</article>`,
      )
      .join("");
  if (result.contact_candidates?.length) {
    body +=
      '<h3>邮箱候选</h3>';
    body += result.contact_candidates
      .map(
        (contact) =>
          `<article class="lead"><b>${escape(contact.value)}</b><p class="hint">${escape(({general_business: "企业通用商务入口", procurement_role_unverified: "采购类邮箱，岗位待核实", quality_support: "质量或客服入口", unknown: "联系角色待核实"})[contact.contact_role] || "联系角色待核实")} · 未检测可投递性</p>${safeLink(contact.source_url)}${result.prospect_id ? `<br><button data-apply-contact="${escape(contact.value)}" data-target-prospect="${escape(result.prospect_id)}">已核对主体，采用此邮箱</button>` : ""}</article>`,
      )
      .join("");
  }
  if (result.report) body += reportHTML(result.report, result.sources || []);
  if (result.directory && typeof directoryResultHTML === "function") body += directoryResultHTML(result.directory);
  if (result.buyer || result.customs)
    body += providerEvidenceHTML(
      result.buyer || result.customs,
      result.customs ? "customs" : "buyer",
    );
  if (result.customs?.has_more && row.operation === "trade_search") body += '<label class="check"><input id="trade-next-confirm" type="checkbox" />同意下一页的150数据点预占及平台点数</label><button id="trade-next">查询下一页交易</button>';
  $("#job-detail").innerHTML = body;
  $("#job-detail").dataset.job = JSON.stringify(row);
  if (result.directory?.kind === "contacts" && typeof loadDirectoryProspects === "function") await loadDirectoryProspects(id);
  if (row.operation === "prospecting" && typeof renderDiscoveryFeedback === "function") await renderDiscoveryFeedback(id);
  if (row.operation === "prospecting" && ["succeeded","partial"].includes(row.status) && typeof renderDiscoveryDelta === "function") await renderDiscoveryDelta(id);
  if (
    typeof renderMailReview === "function" &&
    result.draft &&
    row.status === "succeeded"
  )
    await renderMailReview(row);
}
async function loadCompany() {
  const profile = await api(root() + "/company/profile");
  state.profileVersion = profile.version;
  const form = $("#company-form");
  for (const input of form.querySelectorAll("input,textarea"))
    input.value = profile.data[input.name] || "";
}
async function loadCosts() {
  const [balance, ledger, usage] = await Promise.all([
    api(root() + "/points"),
    api(root() + "/points/ledger?limit=50"),
    api(root() + "/crm/usage"),
  ]);
  $("#provider-usage").innerHTML =
    usage.provider_calls
      .map(
        (row) =>
          `<div class="price-row"><span>${escape(row.endpoint)} · ${row.calls} 次 / ${row.cache_hits} 次缓存命中</span><b>¥${(row.estimated_or_reserved_milli_cny / 1000).toFixed(3)}${row.calls_without_monetary_estimate ? " + 未计价" : ""}</b></div>`,
      )
      .join("") +
    `<p class="hint">公域每次按 ¥${(usage.public_tool_estimate_milli_cny / 1000).toFixed(3)} 估算，非上游账单。模型输入 ${usage.prompt_tokens} / 输出 ${usage.completion_tokens} tokens（仅统计已回传值）</p>`;
  $("#usage").innerHTML =
    stat("可用点数", balance.available) +
    stat("任务预占", balance.reserved) +
    stat("基础档数据增强", "¥0", "不调用跨境魔方") +
    stat("增强档预算", "¥6 / 任务", "数据点数包含在预占中");
  $("#prices").innerHTML = Object.entries(state.pointQuotes || {})
    .map(
      ([k, v]) =>
        `<div class="price-row"><span>${escape(k === "prospecting_enhanced" ? "增强发现" : operations[k] || k)}</span><b>最多 ${v.total_points} 点 / 次（平台 ${v.platform_points}＋数据 ${v.data_points}）</b></div>`,
    )
    .join("");
  $("#ledger").innerHTML =
    ledger
      .map(
        (row) =>
          `<div class="price-row"><span>${escape(date(row.created_at))} · ${escape({ grant: "赠送", reserve: "预占", charge: "结算", release: "释放", topup: "充值 / 会员即时点数", monthly_grant: "会员月点数领取" }[row.kind] || row.kind)}</span><b>${row.points} 点</b></div>`,
      )
      .join("") || '<p class="hint">暂无流水</p>';
}
// A small RFC 4180 parser: handles quoted commas, double quotes and multiline cells.
function parseCSV(input) {
  const text = input.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell) {
        throw new Error("CSV 引号格式不正确");
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\r" || c === "\n") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("CSV 引号未闭合");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function currentDraft() {
  return JSON.parse($("#job-detail").dataset.job || "{}").result?.draft;
}
async function submitDraft(id, data) {
  const slot = "voken-draft-" + state.session.workspace_id;
  const key = pendingSubmission(slot, { prospect: id, ...data });
  const job = await api(root() + `/crm/prospects/${id}/drafts`, {
    method: "POST",
    headers: { "Idempotency-Key": key },
    body: JSON.stringify(data),
  });
  clearSubmission(slot);
  state.selectedJob = job.id;
  await switchTab("jobs");
  await loadGlobal();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.tab)
    return void runAction(button, () => {
      if (button.dataset.tab === "jobs") state.selectedJob = null;
      return switchTab(button.dataset.tab);
    });
  if (button.dataset.prospect)
    return void runAction(button, () =>
      selectProspect(button.dataset.prospect),
    );
  if (button.dataset.job)
    return void runAction(button, async () => {
      state.selectedJob = button.dataset.job;
      await switchTab("jobs");
    });
  if (button.dataset.prospectJump)
    return void runAction(button, async () => {
      if (window.voken) return window.voken.openCustomer(button.dataset.prospectJump);
      await switchTab("customers");
      await selectProspect(button.dataset.prospectJump);
    });
  if (button.dataset.saveLead !== undefined || button.id === "save-all-leads")
    return void runAction(button, async () => {
      const job = JSON.parse($("#job-detail").dataset.job);
      const indices =
        button.id === "save-all-leads"
          ? job.result.leads.map((_, i) => i)
          : [Number(button.dataset.saveLead)];
      const result = await api(root() + "/crm/prospects/from-leads", {
        method: "POST",
        body: JSON.stringify({ job_id: job.id, lead_indices: indices }),
      });
      toast(
        `已保存 ${result.created} 位客户，复用 ${result.reused} 位已有客户`,
      );
      if (window.voken && button.dataset.saveLead !== undefined && result.items?.length === 1) {
        delete button.dataset.saveLead;
        button.dataset.prospectJump = result.items[0].id;
        button.textContent = "查看已保存客户";
      }
    });
});
function discoveryTaskName(data) {
  return data.name?.trim() || Array.from(`${data.market.trim()} · ${data.product.trim()}`).slice(0, 80).join("");
}
async function createDiscoveryTask(configuration, tier, enhanced, contactTarget = "procurement") {
  if (state.discoverySubmitting) throw new Error("任务正在提交，请稍候，避免重复创建。");
  state.discoverySubmitting = true;
  try {
    const encoded = JSON.stringify(configuration);
    const agentSlot = "voken-agent-draft-" + state.session.workspace_id;
    if (!state.discoveryAgent) {
      try {
        state.discoveryAgent = JSON.parse(
          sessionStorage.getItem(agentSlot) || "null",
        );
      } catch {}
    }
    if (!state.discoveryAgent || state.discoveryAgent.encoded !== encoded) {
      const agent = await api(root() + "/agents", {
        method: "POST",
        body: encoded,
      });
      state.discoveryAgent = { encoded, id: agent.id };
      sessionStorage.setItem(agentSlot, JSON.stringify(state.discoveryAgent));
    }
    const payload = { acquisition_tier: tier === "enhanced_contacts" ? "enhanced" : tier, confirm_paid: enhanced,
      ...(tier === "enhanced_contacts" ? {enhancement_goal:"contacts"} : {}),
      ...(tier === "ai_enhanced" ? {contact_target:contactTarget} : {}) };
    const slot = "voken-run-" + state.session.workspace_id;
    const key = pendingSubmission(slot, {
      agent: state.discoveryAgent.id,
      ...payload,
    });
    const job = await api(
      root() + `/agents/${state.discoveryAgent.id}/runs`,
      {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: JSON.stringify(payload),
      },
    );
    clearSubmission(slot);
    sessionStorage.removeItem(agentSlot);
    state.selectedJob = job.id;
    state.discoveryAgent = null;
    await loadGlobal();
    await switchTab("jobs");
    toast("任务已提交，结果会自动更新");
  } finally {
    state.discoverySubmitting = false;
  }
}

document.addEventListener("submit", (event) => {
  if (event.target.dataset.extension) return;
  event.preventDefault();
  const form = event.target;
  const button = $("button[type=submit]", form);
  runAction(button, async () => {
    const data = formData(form);
    if (form.id === "login-form") {
      state.session = await api("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      saveSession();
      await enter();
    } else if (form.id === "register-form") {
      await api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast("注册成功，请登录");
    } else if (form.id === "discovery-form") {
      const configuration = {
        name: discoveryTaskName(data),
        instructions: data.instructions?.trim() || `寻找${data.market}的${data.product}潜在采购客户，按客户角色筛选并保留公开依据。`,
        market: data.market,
        product: data.product,
        target_count: Number(data.target_count),
        buyer_role: data.buyer_role,
        public_sources: form.elements.ted.checked ? ["ted"] : [],
        seed_website: data.seed_website || null,
        exclude_keywords: data.exclude_keywords
          .split(/[,，]/)
          .map((x) => x.trim())
          .filter(Boolean),
        exclude_domains: (data.exclude_domains || "").split(/[,，]/).map(x=>x.trim()).filter(Boolean),
        reference_websites: (data.reference_websites || "").split(/\s+/).filter(Boolean),
        ...(data.hs_code ? { hs_code: data.hs_code } : {}),
      };
      const enhanced = data.tier !== "basic";
      if (enhanced && !$("#discovery-form [name=paid]").checked)
        throw new Error(errors.paid_confirmation_required);
      await createDiscoveryTask(configuration, data.tier, enhanced, data.contact_target);
    } else if (form.id === "company-form") {
      const fields = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v.trim() || null]),
      );
      const result = await api(root() + "/company/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...fields,
          expected_version: state.profileVersion,
        }),
      });
      state.profileVersion = result.version;
      if (typeof loadCertification === "function") await loadCertification();
      toast("企业资料已保存");
    } else if (form.id === "prospect-form") {
      const row = state.selectedProspect;
      const payload = {
        expected_version: row.version,
        stage: data.stage,
        contact: data.contact,
        tags: data.tags
          .split(/[,，]/)
          .map((x) => x.trim())
          .filter(Boolean),
        do_not_contact: form.elements.do_not_contact.checked,
        next_followup_at: data.next_followup_at
          ? new Date(data.next_followup_at).toISOString()
          : null,
      };
      await api(root() + "/crm/prospects/" + row.id, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await selectProspect(row.id);
      toast("跟进设置已保存");
    } else if (form.id === "activity-form") {
      const id = state.selectedProspect.id;
      await api(root() + `/crm/prospects/${id}/activities`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      await selectProspect(id);
      toast("记录已保存");
    } else if (form.id === "draft-form") {
      await submitDraft(state.selectedProspect.id, data);
    } else if (form.id === "source-form") {
      const payload = {
        source_id: data.source_id,
        query: data.query,
        limit: Number(data.limit),
        since_days: Number(data.since_days),
        entity_category: data.entity_category || "GENERAL",
        procurement_stage: data.procurement_stage || "tender",
        ...(data.country ? { country: data.country } : {}),
      };
      const slot = "voken-source-" + state.session.workspace_id;
      const key = pendingSubmission(slot, payload);
      const job = await api(root() + "/sources/searches", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: JSON.stringify(payload),
      });
      clearSubmission(slot);
      state.selectedJob = job.id;
      await loadGlobal();
      await switchTab("jobs");
    } else if (form.id === "schedule-form") {
      const existing = state.schedules.find(
        (row) => row.agent_id === data.agent_id,
      );
      await api(root() + `/agents/${data.agent_id}/schedule`, {
        method: "PUT",
        body: JSON.stringify({
          expected_version: existing?.version || 0,
          interval_days: Number(data.interval_days),
          remaining_runs: Number(data.remaining_runs),
          enabled: true,
        }),
      });
      await loadSchedules();
      toast("定期更新已启用，首次将在一个周期后执行");
    } else if (form.id === "import-form") {
      const rows = parseCSV(data.csv);
      if (rows.length < 2) throw new Error("CSV 需要表头和至少一条记录");
      const headers = rows.shift().map((h) => h.trim());
      if (!headers.includes("name") || new Set(headers).size !== headers.length)
        throw new Error("CSV 必须包含 name 表头且表头不能重复");
      if (rows.length > 200) throw new Error("每批最多导入 200 条");
      const allowed = new Set([
        "name",
        "location",
        "website",
        "contact",
        "source_url",
        "source_note",
      ]);
      if (headers.some((h) => !allowed.has(h)))
        throw new Error("CSV 包含不支持的表头，请按说明调整");
      const items = rows.map((row, index) => {
        if (row.length !== headers.length)
          throw new Error(`第 ${index + 2} 行列数不一致`);
        const item = Object.fromEntries(
          headers.map((h, i) => [h, row[i].trim()]),
        );
        item.source_note = item.source_note || data.source_note;
        return item;
      });
      const result = await api(root() + "/crm/prospects/import", {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      await loadCustomers();
      toast(`新增 ${result.created} 位客户，复用 ${result.reused} 位`);
    }
  });
});
$("#request-code").onclick = () =>
  runAction($("#request-code"), async () => {
    const form = $("#register-form");
    const issued = await api("/api/v1/auth/verification-codes", {
      method: "POST",
      body: JSON.stringify({ phone: form.elements.phone.value }),
    });
    form.elements.challenge_id.value = issued.challenge_id;
    toast("验证码已申请，请查看手机");
  });
$("#logout").onclick = () =>
  runAction($("#logout"), async () => {
    await api("/api/v1/auth/logout", { method: "POST" });
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith("voken-")) sessionStorage.removeItem(key);
    clearWorkspaceView();
    state.session = null;
    state.selectedProspect = null;
    state.selectedJob = null;
    $("#workspace").hidden = true;
    $("#auth").hidden = false;
    $("#login-form").reset();
  });
$("#refresh").onclick = () =>
  runAction($("#refresh"), async () => {
    await loadGlobal();
    await refreshTab();
  });
$("#discovery-form [name=tier]").onchange = (event) => {
  $("#paid-label").hidden = event.target.value === "basic";
  updateDiscoveryPrice();
};
document.addEventListener("invalid", (event) => {
  const options = event.target.closest?.("#discovery-form-options");
  if (options) options.open = true;
}, true);
$("#stage-filter").insertAdjacentHTML(
  "beforeend",
  Object.entries(stages)
    .map(([k, v]) => `<option value="${k}">${v}</option>`)
    .join(""),
);
$("#filter-customers").onclick = () =>
  runAction($("#filter-customers"), async () => {
    state.offset = 0;
    await loadCustomers();
  });
$("#prev").onclick = () =>
  runAction($("#prev"), async () => {
    state.offset = Math.max(0, state.offset - 30);
    await loadCustomers();
  });
$("#next").onclick = () =>
  runAction($("#next"), async () => {
    state.offset += 30;
    await loadCustomers();
  });
$("#show-import").onclick = () => {
  $("#import-panel").open = true;
  $("#import-panel").scrollIntoView({ behavior: "smooth" });
};
$("#export").onclick = () =>
  runAction($("#export"), async () => {
    const params = filters();
    params.delete("offset");
    params.delete("limit");
    await exportProspects(params);
  });
async function exportProspects(params) {
  const session = state.session;
  const response = await fetch(
    root() + "/crm/prospects/export.csv?" + params,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );
  if (!response.ok) throw new Error("导出失败，请缩小筛选范围后重试");
  const content = await response.text();
  if (session === state.session) download("prospects.csv", content, "text/csv;charset=utf-8");
}
document.addEventListener("click", (event) => {
  if (event.target.id === "copy-draft")
    void runAction(event.target, async () => {
      const draft = currentDraft();
      await navigator.clipboard.writeText(draft.subject + "\n\n" + draft.body);
      toast("草稿已复制，发送前请审阅");
    });
  if (event.target.id === "download-draft")
    void runAction(event.target, async () => {
      const draft = currentDraft();
      const bytes = new TextEncoder().encode(
        draft.subject.replace(/[\r\n]/g, " "),
      );
      const subject = btoa(String.fromCharCode(...bytes));
      download(
        "outreach-draft.eml",
        `X-Unsent: 1\r\nSubject: =?UTF-8?B?${subject}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${draft.body.replace(/\r?\n/g, "\r\n")}`,
        "message/rfc822",
      );
      toast("已发起邮件草稿下载，请在浏览器下载列表确认；发送前请填写收件人并审阅");
    });
});
setInterval(async () => {
  if (
    !state.session ||
    document.hidden ||
    !["jobs", "job-view", "discover", "mail"].includes(state.tab) ||
    !state.jobs.some((j) =>
      ["queued", "running", "cancelling"].includes(j.status),
    )
  )
    return;
  try {
    await loadJobs();
    await loadGlobal();
  } catch (error) {
    toast(error.message, true);
  }
}, 5000);
try {
  state.session = JSON.parse(sessionStorage.getItem("voken-session") || "null");
  if (state.session && !/^[0-9a-f]{32}$/.test(state.session.workspace_id))
    state.session = null;
} catch {
  state.session = null;
}
if (state.session && !window.__VOKEN_REACT__) enter().catch((error) => toast(error.message, true));
async function loadRegistrationAvailability() {
  try {
    const response = await fetch(
      location.pathname === "/" ? "/health" : location.pathname.replace(/\/app\/?$/, "/health"),
    );
    if (!response.ok) return;
    const health = await response.json();
    if (typeof health.self_registration_available === "boolean") {
      $("#register-panel").hidden = !health.self_registration_available;
      $("#reset-panel").hidden = !health.self_registration_available;
      $("#verification-hint").textContent =
        health.verification_mode === "test_fixed"
          ? "当前为测试环境：验证码固定 123456，不会发送真实短信。"
          : "请输入手机收到的验证码。";
      $("#private-beta-note").hidden = health.self_registration_available;
    }
  } catch {}
}
void loadRegistrationAvailability();

async function loadSchedules() {
  const [agents, rows] = await Promise.all([
    api(root() + "/agents"),
    api(root() + "/schedules"),
  ]);
  state.schedules = rows;
  const selected = $("#schedule-agent").value;
  $("#schedule-agent").innerHTML = agents
    .map((a) => `<option value="${a.id}">${escape(a.config.name)}</option>`)
    .join("");
  if (agents.some((a) => a.id === selected))
    $("#schedule-agent").value = selected;
  const names = Object.fromEntries(agents.map((a) => [a.id, a.config.name]));
  $("#schedule-list").innerHTML = rows
    .map(
      (row) =>
        `<div class="notice"><b>${escape(names[row.agent_id] || "历史任务")}</b><br>${row.enabled ? "已启用" : "已停用"} · 每 ${row.interval_days} 天 · 剩余 ${row.remaining_runs} 次<br>下次：${escape(date(row.next_run_at))}${row.last_error ? `<br>${escape(readable(row.last_error))}` : ""}${row.enabled ? `<div class="actions"><button data-stop-schedule="${row.agent_id}">停用定期更新</button></div>` : ""}</div>`,
    )
    .join("");
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stop-schedule]");
  if (!button) return;
  void runAction(button, async () => {
    const row = state.schedules.find(
      (r) => r.agent_id === button.dataset.stopSchedule,
    );
    await api(root() + `/agents/${row.agent_id}/schedule`, {
      method: "PUT",
      body: JSON.stringify({
        expected_version: row.version,
        interval_days: row.interval_days,
        remaining_runs: Math.max(1, row.remaining_runs),
        enabled: false,
      }),
    });
    await loadSchedules();
    toast("定期更新已停用");
  });
});

const intelligenceIntents = {
  identity: {title: "查企业背景", categories: ["entity_identity"], label: "企业名称", example: "Siemens", help: "建议输入英文企业全称。结果用于核对登记身份，不代表信用或采购意愿。"},
  procurement: {title: "找采购机会", categories: ["procurement", "development_projects"], label: "你提供的产品或服务", example: "lighting", help: "建议使用简短英文产品词，例如 lighting（照明）。查看公告后需核对截止时间及资格。"},
  market: {title: "了解市场", categories: ["market_statistics"], label: "产品、行业或市场关键词", example: "solar panels Germany", help: "例如 solar panels Germany（德国太阳能板）。返回公开统计与规则页面，不是企业采购名单。"},
  risk: {title: "查产品风险", categories: ["product_risk"], label: "产品、品牌或型号", example: "LED lamp", help: "例如 LED lamp（LED灯具）。核对具体型号、地区与公告日期后再判断。"},
  research: {title: "查企业动态与目录", categories: ["company_filings", "business_directory", "industry_associations", "exhibitions"], label: "企业、产品或行业关键词", example: "industrial lighting", help: "查询企业披露、行业目录与展会资料。目录和参展信息不代表当前采购需求。"},
};
let intelligenceIntent = "identity";
function intentSources() {
  return state.sources.filter(row => intelligenceIntents[intelligenceIntent].categories.includes(row.category));
}
function selectIntelligenceIntent(intent) {
  if (!intelligenceIntents[intent]) return;
  intelligenceIntent = intent;
  const config = intelligenceIntents[intent];
  for (const button of document.querySelectorAll("[data-intent]")) button.setAttribute("aria-pressed", String(button.dataset.intent === intent));
  $("#intent-title").textContent = config.title;
  $("#source-query-label").textContent = config.label;
  $('#source-form [name="query"]').placeholder = "例如：" + config.example;
  $("#source-query-help").textContent = config.help;
  const previous = $("#source-select").value;
  const sources = intentSources();
  $("#source-select").innerHTML = sources.map(row => `<option value="${escape(row.id)}" ${row.status !== "configured" ? "disabled" : ""}>${escape(row.name)}${row.status !== "configured" ? "（暂不可用）" : ""}</option>`).join("");
  $("#source-select").value = sources.find(row => row.id === previous && row.status === "configured")?.id || sources.find(row => row.status === "configured")?.id || "";
  showSourceInfo();
}
async function loadSources() {
  state.sources = await api(root() + "/sources");
  $("#source-catalog").innerHTML = state.sources.map(row => `<div class="notice"><b>${escape(row.name)}</b><p>${escape(categoryNames[row.category] || row.category)} · ${row.status === "configured" ? "可查询" : "暂不可用"}</p>${safeLink(row.documentation, "查看来源说明 ↗")}</div>`).join("");
  selectIntelligenceIntent(intelligenceIntent);
}
function showSourceInfo() {
  const row = state.sources.find(r => r.id === $("#source-select").value);
  const procurement = intelligenceIntent === "procurement";
  const country = $('#source-form [name="country"]');
  country.disabled = row?.id === "worldbank_notices" || !row;
  if (country.disabled) country.value = "";
  $('#source-form [name="entity_category"]').disabled = row?.id !== "gleif";
  $('#source-form [name="procurement_stage"]').disabled = !["find_tender", "contracts_finder"].includes(row?.id);
  $("#source-entity-field").hidden = row?.id !== "gleif";
  $("#source-time-field").hidden = !procurement;
  $("#source-stage-field").hidden = !["find_tender", "contracts_finder"].includes(row?.id);
  $("#source-info").textContent = row ? `${row.coverage}。${row.limitations} ${row.license_note}` : "当前目的暂无可用来源，请选择其他查询目的或稍后再试。";
  $("#source-guidance").textContent = row ? (row.id === "worldbank_notices" ? "当前查询世界银行采购公告，不支持国家筛选。" : row.id === "gleif" ? "覆盖拥有全球企业身份编码的主体，并非所有企业。查不到不代表企业不存在。" : row.id === "companies_house" ? "查询英国企业登记信息；其他国家请换一个查询范围。" : `本次使用「${row.name}」查找${row.access === "direct_api" ? "公开记录" : "可公开检索的网页"}。`) : "当前目的暂无可用来源。可切换查询目的，或使用「找客户」。";
  $("#source-status").hidden = row?.status === "configured";
  const operation = row?.access === "direct_api" ? "source_lookup" : "public_search";
  const price = state.prices[operation];
  $("#source-price").textContent = price === undefined ? "报价未加载" : `预占 ${price} 点 · 查询一页`;
  $("#source-submit").disabled = !row || row.status !== "configured";
}
$("#source-select").onchange = showSourceInfo;
function jobCardHTML(row) {
  return `<button class="job-card" data-job="${escape(row.id)}"><div class="card-top"><b>${escape(operations[row.operation] || row.operation)}</b><span class="badge">${escape(statuses[row.status] || row.status)}</span></div><p class="card-meta">${escape(date(row.created_at))} · ${Number(row.points_charged || 0)} 点已结算</p><span class="hint">查看详情 →</span></button>`;
}
function filteredJobs() {
  const type = $("#job-type-filter").value;
  const status = $("#job-status-filter").value;
  const groups = {active: ["queued", "running", "cancelling"], done: ["succeeded", "partial"], failed: ["failed", "cancelled"]};
  return state.jobs.filter(row => (!type || (type === "intelligence" ? ["source_lookup", "public_search"].includes(row.operation) : row.operation === type)) && (!status || groups[status]?.includes(row.status)));
}
function renderTaskList() {
  const rows = filteredJobs();
  $("#job-list").innerHTML = rows.map(jobCardHTML).join("") || '<div class="panel empty">暂无符合条件的任务。可调整筛选，或创建找客户任务。</div>';
  $("#job-count").textContent = `最近 ${state.jobs.length} 个任务中，显示 ${rows.length} 个`;
}
$("#job-type-filter").onchange = renderTaskList;
$("#job-status-filter").onchange = renderTaskList;
document.addEventListener("click", event => {
  const button = event.target.closest("[data-intent]");
  if (button) selectIntelligenceIntent(button.dataset.intent);
});
window.addEventListener("hashchange", () => {
  if (!state.session) return;
  const route = location.hash.slice(1);
  if (route === "jobs") state.selectedJob = null;
  void switchTab(route).catch(error => toast(error.message, true));
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.research)
    void runAction(button, async () => {
      const id = button.dataset.research;
      const slot = "voken-research-" + state.session.workspace_id;
      const key = pendingSubmission(slot, { id });
      const job = await api(root() + `/crm/prospects/${id}/research`, {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: "{}",
      });
      clearSubmission(slot);
      state.selectedJob = job.id;
      await loadGlobal();
      await switchTab("jobs");
    });
  if (button.dataset.saveSource !== undefined)
    void runAction(button, async () => {
      const job = JSON.parse($("#job-detail").dataset.job);
      const result = await api(root() + "/crm/prospects/from-source", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          record_indices: [Number(button.dataset.saveSource)],
        }),
      });
      toast(
        `已保存 ${result.created} 位，复用 ${result.reused} 位；仍需核实业务匹配。`,
      );
    });
  if (button.dataset.sourceContact)
    void runAction(button, async () => {
      const id = button.dataset.prospectId;
      await api(root() + `/crm/prospects/${id}/apply-contact`, {
        method: "POST",
        body: JSON.stringify({
          expected_version: Number(button.dataset.version),
          job_id: button.dataset.sourceJob,
          value: button.dataset.sourceContact,
        }),
      });
      await selectProspect(id);
      toast("已采用公告邮箱并保留来源；尚未验证可投递性。");
    });
  if (button.dataset.applyContact)
    void runAction(button, async () => {
      const id = button.dataset.targetProspect;
      const prospect = await api(root() + "/crm/prospects/" + id);
      const job = JSON.parse($("#job-detail").dataset.job);
      await api(root() + `/crm/prospects/${id}/apply-contact`, {
        method: "POST",
        body: JSON.stringify({
          expected_version: prospect.version,
          job_id: job.id,
          value: button.dataset.applyContact,
        }),
      });
      toast("已采用邮箱并保留来源；尚未验证可投递性。");
    });
});
