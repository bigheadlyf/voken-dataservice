const $ = (id) => document.getElementById(id);
const authForm = $("auth-form");
const agentForm = $("agent-form");
const customsForm = $("customs-form");
const buyerForm = $("buyer-form");
const sessionKey = "voken-test-console-session";
const state = {token: null, workspace: null, challenge: null, editing: null, jobs: [], selected: null, reports: new Map(), buyerMatch: null};
const scenarios = {
  us: {name: "美国 LED 拓客", market: "美国", product: "LED", target_count: 10,
    instructions: "我是一家中国生产LED的工厂，需要找10家美国地区有LED采购需求的客户。"},
  fr: {name: "法国运动水杯渠道", market: "法国", product: "运动水杯",
    instructions: "我是中国运动水杯的生产商，需要找一批法国地区线下门店，如健身房、户外运动用品店、商超、便利店。"},
  ru: {name: "俄罗斯轮胎拓客", market: "俄罗斯", product: "汽车轮胎", hs_code: "401110", target_count: 5,
    instructions: "我是生产汽车零部件的厂商，主营产品是汽车轮胎，海关编码是401110，需要找俄罗斯的采购商，数量5家。"},
};
const jobLabels = {queued: "排队中", running: "运行中", cancelling: "取消中", cancelled: "已取消",
  succeeded: "已完成", partial: "部分完成", failed: "失败"};
const operationLabels = {prospecting: "拓客", public_search: "公域搜索", report: "情报报告", customs_verification: "海关核验",
  buyer_search: "匹配采购商", buyer_profile: "企业资料", buyer_contacts: "联系方式"};
const pointLabels = {grant: "注册赠送", reserve: "任务预占", charge: "任务扣点", release: "释放预占", refund: "退回扣点"};
const errorLabels = {deepseek_read_timeout: "DeepSeek 响应超时，请稍后再试。",
  deepseek_connection_unavailable: "暂时无法连接 DeepSeek。",
  deepseek_response_unknown: "未收到完整的 DeepSeek 响应。"};

function newIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value != null) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function button(label, callback, className = "secondary") {
  const node = element("button", label, className);
  node.type = "button";
  node.addEventListener("click", () => perform(node, callback));
  return node;
}

function announce(message, error = false) {
  const panel = $("notice");
  panel.hidden = false;
  panel.textContent = message;
  panel.classList.toggle("error", error);
}

async function perform(control, callback) {
  if (control) control.disabled = true;
  try {
    await callback();
  } catch (error) {
    announce(error.message, true);
  } finally {
    if (control) control.disabled = control.hasAttribute("data-auth") && !state.token;
  }
}

async function api(path, {method = "GET", body, key} = {}) {
  const token = state.token;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (key) headers["Idempotency-Key"] = key;
  const response = await fetch(path, {method, headers, body: body === undefined ? undefined : JSON.stringify(body)});
  if (response.status === 401 && token && token === state.token) {
    clearSession();
    const message = "登录已失效，请重新登录。";
    announce(message, true);
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) {
    const detail = typeof result.detail === "string" ? result.detail : "请检查输入";
    throw new Error(`${response.status} · ${detail}`);
  }
  return result;
}

function workspace(path) {
  return `/api/v1/workspaces/${state.workspace}${path}`;
}

function saveSession(login) {
  const {access_token, workspace_id, expires_in} = login;
  try {
    localStorage.setItem(sessionKey, JSON.stringify({
      access_token, workspace_id, expires_at: Date.now() + expires_in * 1000,
    }));
  } catch {
    // The current page can still use the session if browser storage is unavailable.
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey));
  } catch {
    return null;
  }
}

function removeSession() {
  try {
    localStorage.removeItem(sessionKey);
  } catch {
    // The current page still clears its in-memory session.
  }
}

function clearSession() {
  if (readSession()?.access_token === state.token) removeSession();
  setUser(null);
}

async function restoreSession() {
  const login = readSession();
  if (!login) return;
  if (typeof login.access_token !== "string" || !login.access_token ||
      typeof login.workspace_id !== "string" || !login.workspace_id ||
      !Number.isFinite(login.expires_at) || login.expires_at <= Date.now()) {
    removeSession();
    return;
  }
  setUser(login);
  await Promise.all([refreshPoints(), refreshAgents(), refreshJobs()]);
}

function setUser(login) {
  state.token = login?.access_token ?? null;
  state.workspace = login?.workspace_id ?? null;
  state.selected = null;
  state.jobs = [];
  state.reports.clear();
  state.challenge = null;
  authForm.hidden = Boolean(login);
  $("logout").hidden = !login;
  $("signed-in").hidden = !login;
  $("signed-in").textContent = login ? `工作空间 ${login.workspace_id}` : "";
  document.querySelectorAll("[data-auth]").forEach((node) => { node.disabled = !login; });
  authForm.reset();
  customsForm.reset();
  buyerForm.reset();
  selectCustomsBuyer(null);
  resetAgentForm();
  $("available").textContent = "—";
  $("reserved").textContent = "—";
  $("point-price").textContent = "";
  $("point-ledger").replaceChildren();
  $("agent-list").replaceChildren(element("p", "登录后查看数字员工。", "empty"));
  renderJobs();
}

$("phone").addEventListener("input", () => { state.challenge = null; });
$("request-code").addEventListener("click", (event) => perform(event.currentTarget, async () => {
  const phone = authForm.elements.phone;
  if (!phone.reportValidity()) return;
  const issued = await api("/api/v1/auth/verification-codes", {method: "POST", body: {phone: phone.value.trim()}});
  state.challenge = issued.challenge_id;
  announce(`验证码挑战已创建，${issued.expires_in_seconds} 秒内有效。测试码为 123456。`);
  authForm.elements.code.focus();
}));

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const control = event.submitter;
  perform(control, async () => {
    const form = new FormData(authForm);
    const credentials = {phone: form.get("phone").trim(), password: form.get("password")};
    if (control?.value === "register") {
      if (!state.challenge || !form.get("code")) throw new Error("请申请并填写测试验证码。");
      await api("/api/v1/auth/register", {method: "POST", body: {
        ...credentials, challenge_id: state.challenge, code: form.get("code"),
      }});
      state.challenge = null;
    }
    const login = await api("/api/v1/auth/login", {method: "POST", body: credentials});
    saveSession(login);
    setUser(login);
    announce(control?.value === "register" ? "注册成功，已赠送 1,000 点。" : "已登录。");
    await Promise.all([refreshPoints(), refreshAgents(), refreshJobs()]);
  });
});

$("logout").addEventListener("click", (event) => perform(event.currentTarget, async () => {
  const token = state.token;
  await api("/api/v1/auth/logout", {method: "POST"});
  if (token !== state.token) return;
  clearSession();
  announce("已退出登录。");
}));

async function refreshPoints() {
  const currentToken = state.token;
  const [balance, entries, costs] = await Promise.all([
    api(workspace("/points")), api(workspace("/points/ledger?limit=5")), api(workspace("/points/costs")),
  ]);
  if (state.token !== currentToken) return;
  $("available").textContent = balance.available.toLocaleString("zh-CN");
  $("reserved").textContent = balance.reserved;
  $("point-price").textContent = ` · 拓客 ${costs.prospecting} 点 · 报告 ${costs.report} 点`;
  $("point-ledger").replaceChildren(...entries.map((entry) => {
    const row = element("li");
    row.append(element("span", pointLabels[entry.kind] || entry.kind), element("span", `${entry.points} 点`));
    return row;
  }));
}

function fillAgentForm(config) {
  for (const name of ["name", "market", "product", "hs_code", "target_count", "instructions"]) {
    agentForm.elements[name].value = config[name] ?? "";
  }
}

function resetAgentForm() {
  state.editing = null;
  agentForm.reset();
  $("save-agent").textContent = "创建数字员工";
  $("clear-edit").hidden = true;
}

$("scenario").addEventListener("change", (event) => {
  const config = scenarios[event.currentTarget.value];
  if (config) fillAgentForm(config);
});
$("clear-edit").addEventListener("click", resetAgentForm);

agentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(agentForm);
  const config = Object.fromEntries(form);
  for (const name of ["market", "product", "hs_code"]) config[name] = config[name].trim() || null;
  config.target_count = config.target_count ? Number(config.target_count) : null;
  perform(event.submitter, async () => {
    if (state.editing) {
      await api(workspace(`/agents/${state.editing}`), {method: "PATCH", body: config});
      announce("运行配置已保存为新版本。");
    } else {
      await api(workspace("/agents"), {method: "POST", body: config});
      announce("数字员工已创建。");
    }
    resetAgentForm();
    await refreshAgents();
  });
});

async function refreshAgents() {
  const currentToken = state.token;
  const agents = await api(workspace("/agents"));
  if (state.token !== currentToken) return;
  const list = $("agent-list");
  if (!agents.length) {
    list.replaceChildren(element("p", "暂无数字员工，可从左侧选择验收场景。", "empty"));
    return;
  }
  list.replaceChildren(...agents.map((agent) => {
    const entry = element("article", null, "entry");
    entry.append(element("h3", agent.config.name), element("p", `${agent.status === "paused" ? "暂停" : "启用"} · 配置 v${agent.config_version} · ${agent.config.market || "未指定市场"}`, "muted"));
    const actions = element("div", null, "buttons");
    const path = `/agents/${agent.id}`;
    actions.append(
      button("启动", async () => {
        const job = await api(workspace(`${path}/runs`), {method: "POST", key: newIdempotencyKey()});
        state.selected = job.id;
        announce("任务已提交。");
        await Promise.all([refreshAgents(), refreshJobs(), refreshPoints()]);
      }),
      button("暂停", async () => {
        await api(workspace(`${path}/pause`), {method: "POST"});
        announce("已暂停数字员工。");
        await Promise.all([refreshAgents(), refreshJobs(), refreshPoints()]);
      }),
      button("编辑", () => {
        resetAgentForm();
        state.editing = agent.id;
        fillAgentForm(agent.config);
        $("save-agent").textContent = "保存配置";
        $("clear-edit").hidden = false;
        agentForm.elements.name.focus();
      }),
      button("删除", async () => {
        if (!confirm(`删除「${agent.config.name}」？历史任务仍可查看。`)) return;
        await api(workspace(path), {method: "DELETE"});
        if (state.editing === agent.id) resetAgentForm();
        announce("已删除数字员工。");
        await Promise.all([refreshAgents(), refreshJobs(), refreshPoints()]);
      }),
    );
    entry.append(actions);
    return entry;
  }));
}

async function refreshJobs() {
  const currentToken = state.token;
  const jobs = await api(workspace("/jobs?limit=25"));
  if (state.token !== currentToken) return;
  state.jobs = jobs;
  renderJobs();
}

customsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(customsForm));
  body.buyer_country = body.buyer_country.toUpperCase();
  body.arrival_country = body.arrival_country.toUpperCase() || null;
  body.hs_code ||= null;
  body.product = body.product.trim() || null;
  body.confirm_paid = body.confirm_paid === "on";
  if (state.buyerMatch) {
    body.match_job_id = state.buyerMatch.jobId;
    body.company_id = state.buyerMatch.record.company_id;
  }
  perform(event.submitter, async () => {
    if (!body.hs_code && !body.product) throw new Error("请填写 HS 编码或产品词。");
    const job = await api(workspace("/customs-verifications"), {method: "POST", key: newIdempotencyKey(), body});
    state.selected = job.id;
    customsForm.elements.confirm_paid.checked = false;
    announce("海关核验已提交，查询范围为一页。");
    await Promise.all([refreshJobs(), refreshPoints()]);
  });
});

async function submitBuyerAction(body) {
  const job = await api(workspace("/buyer-enrichments"), {method: "POST", key: newIdempotencyKey(), body: {...body, confirm_paid: true}});
  state.selected = job.id;
  announce("已打开查询任务，可在任务区查看进度与结果。");
  await Promise.all([refreshJobs(), refreshPoints()]);
  $("runs").scrollIntoView({block: "start"});
}

buyerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(buyerForm);
  perform(event.submitter, async () => {
    if (!fields.get("confirm_paid")) return;
    buyerForm.elements.confirm_paid.checked = false;
    await submitBuyerAction({action: "search", buyer: fields.get("buyer").trim(),
      buyer_country: fields.get("buyer_country").trim().toUpperCase()});
  });
});

function selectCustomsBuyer(match) {
  state.buyerMatch = match;
  const notice = $("customs-company-selection");
  notice.hidden = !match;
  notice.textContent = match ? `已选择企业 #${match.record.company_id} · ${match.record.name}` : "";
  if (match) {
    customsForm.elements.buyer.value = match.record.name;
    customsForm.elements.buyer_country.value = match.record.buyer_country;
    $("customs").scrollIntoView({block: "start"});
  }
}

for (const field of ["buyer", "buyer_country"]) {
  customsForm.elements[field].addEventListener("input", () => selectCustomsBuyer(null));
}

function renderJobs() {
  const list = $("job-list");
  if (!state.jobs.length) {
    list.replaceChildren(element("p", "启动数字员工后，任务会出现在这里。", "empty"));
  } else {
    list.replaceChildren(...state.jobs.map((job) => {
      const label = `${operationLabels[job.operation] || job.operation} · ${jobLabels[job.status] || job.status} · ${job.id.slice(0, 8)}`;
      const node = element("button", label, "job");
      node.type = "button";
      node.setAttribute("aria-current", String(job.id === state.selected));
      node.addEventListener("click", () => {
        const selected = list.querySelector('[aria-current="true"]');
        selected?.setAttribute("aria-current", "false");
        state.selected = job.id;
        node.setAttribute("aria-current", "true");
        showJob(job);
      });
      return node;
    }));
  }
  showJob(state.jobs.find((job) => job.id === state.selected));
}

async function showJob(job) {
  const cached = job && state.reports.get(job.id);
  renderResult(cached || job);
  if (cached || !job?.result?.report) return;

  const token = state.token;
  try {
    const detail = await api(workspace(`/reports/${job.id}`));
    if (state.token !== token) return;
    state.reports.set(job.id, detail);
    if (state.selected === job.id) renderResult(detail);
  } catch (error) {
    if (state.token === token && state.selected === job.id) announce(error.message, true);
  }
}

function sourceLink(source) {
  if (!source?.url) return element("span", "无公开链接");
  try {
    const url = new URL(source.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return element("span", "不可用链接");
    const link = element("a", source.title || url.hostname);
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  } catch {
    return element("span", "不可用链接");
  }
}

const evidenceLabels = {text_available: "已获取正文", fetch_failed: "原文抓取失败",
  summary_only: "仅搜索摘要", link_only: "仅链接"};

function reportText(node, value, citations) {
  const references = /[（(]来源\s*(\d+(?:\s*[、,，]\s*\d+)*)[）)]|来源\s*(\d+(?:\s*[、,，]\s*\d+)*)/gu;
  let end = 0;
  for (const match of value.matchAll(references)) {
    node.append(value.slice(end, match.index));
    const links = (match[1] || match[2]).split(/[、,，]/u).map((id) => citations.get(Number(id.trim())));
    if (links.every(Boolean)) {
      for (const item of links) node.append(citationLink(item));
    } else {
      node.append(match[0]);
    }
    end = match.index + match[0].length;
  }
  node.append(value.slice(end));
}

function citationLink(item) {
  const link = element("a", `[${item.number}]`, "report-citation");
  link.href = `#report-source-${item.source.source_id}`;
  link.setAttribute("aria-label", `查看来源 ${item.number}`);
  link.addEventListener("click", () => { $("report-references").open = true; });
  return link;
}

function reportSection(title) {
  const section = element("section", null, "report-section");
  section.append(element("h4", title));
  return section;
}

function reportList(section, items, citations, ordered = false) {
  const list = element(ordered ? "ol" : "ul");
  for (const item of items) {
    const line = element("li");
    reportText(line, typeof item === "string" ? item : item.text, citations);
    for (const id of item.source_ids ?? []) {
      const source = citations.get(id);
      if (source) line.append(citationLink(source));
    }
    list.append(line);
  }
  section.append(list);
}

function reportParagraphs(section, text, citations) {
  const paragraphs = text.length > 220 ? text.split(/\n+|(?<=。)\s*(?=[^。]{25,})/u) : text.split(/\n+/u);
  for (const value of paragraphs.filter((line) => line.trim())) {
    const paragraph = element("p");
    reportText(paragraph, value.trim(), citations);
    section.append(paragraph);
  }
}

function renderReport(container, data) {
  const report = data.report;
  const article = element("article", null, "report-document");
  const subject = data.subject ?? {};
  if (subject.name) {
    article.append(element("h3", subject.name, "report-subject"));
    const metadata = [subject.location, subject.role].filter(Boolean).join(" · ");
    if (metadata) article.append(element("p", metadata, "muted report-subject-meta"));
  }

  const sources = new Map((data.sources ?? []).map((source) => [source.source_id, source]));
  const referencedIds = [...new Set(report.source_ids ?? [])].filter((id) => sources.has(id));
  const citations = new Map(referencedIds.map((id, index) => [id, {number: index + 1, source: sources.get(id)}]));
  const opportunity = reportSection("拓客机会");
  const points = (report.opportunity ?? "").split(/(?:\n|(?<=[。；]))\s*(?=\d{1,2}[）.)、])/u)
    .map((point) => point.trim().replace(/^\d{1,2}[）.)、]\s*/u, "")).filter(Boolean);
  if (points.length > 1) reportList(opportunity, points, citations, true);
  else if (points.length) reportParagraphs(opportunity, points[0], citations);
  article.append(opportunity);

  if (report.highlights?.length) {
    const highlights = reportSection("采购信号");
    reportList(highlights, report.highlights, citations);
    article.append(highlights);
  }
  if (report.overview) {
    const overview = reportSection("企业概况");
    reportParagraphs(overview, report.overview, citations);
    article.append(overview);
  }
  if (report.risks?.length) {
    const risks = reportSection("风险与待核实");
    reportList(risks, report.risks, citations);
    article.append(risks);
  }
  if (report.next_steps?.length) {
    const nextSteps = reportSection("下一步");
    reportList(nextSteps, report.next_steps, citations, true);
    article.append(nextSteps);
  }

  if (citations.size) {
    const evidence = reportSection("证据覆盖");
    const counts = new Map();
    for (const {source} of citations.values()) {
      const label = evidenceLabels[source.evidence_status] || "核验状态待加载";
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    evidence.append(element("p", [...counts].map(([label, count]) => `${label} ${count} 条`).join(" · "), "muted"));
    const details = element("details");
    details.id = "report-references";
    const list = element("ol", null, "report-sources");
    for (const {source} of citations.values()) {
      const row = element("li");
      row.id = `report-source-${source.source_id}`;
      row.append(sourceLink(source));
      const label = evidenceLabels[source.evidence_status];
      if (label) row.append(element("span", label, "report-source-status"));
      list.append(row);
    }
    details.append(element("summary", `查看 ${citations.size} 条引用`), list);
    evidence.append(details);
    article.append(evidence);
  }
  container.append(article);
}

function renderBuyerResult(container, job, evidence) {
  if (evidence.reported_milli_cny != null) {
    container.append(element("p", `供应商返回费用 ¥${(evidence.reported_milli_cny / 1000).toFixed(2)}`, "muted"));
  }
  if (!evidence.records.length) container.append(element("p", "本次查询无匹配数据。", "muted"));
  if (evidence.has_more) container.append(element("p", "当前仅显示第一批候选。", "muted"));
  const profileLabels = {industry: "行业", scope: "经营范围", address: "地址", postcode: "邮编",
    registerNumber: "注册编号", registerType: "注册类型", registerState: "注册状态", introduce: "企业介绍"};
  const channels = {emails: "邮箱", phones: "电话", websites: "网站", socials: "社媒"};
  for (const record of evidence.records) {
    const row = element("article", null, "lead");
    if (job.operation === "buyer_contacts") {
      row.append(element("h3", `${channels[record.channel] || record.channel} · ${record.value}`),
        element("p", ["未检测", "供应商标记有效", "供应商标记无效", "状态不确定"][record.validity] || "未提供验证状态", "muted"));
    } else {
      row.append(element("h3", record.name || `企业 #${record.company_id}`));
      if (job.operation === "buyer_search") {
        row.append(element("p", `${record.buyer_country} · 企业 #${record.company_id}`, "muted"));
      }
      for (const [field, label] of Object.entries(profileLabels)) {
        if (record[field]) row.append(element("p", `${label}：${record[field]}`));
      }
      if (job.operation === "buyer_search") {
        const controls = element("div", null, "buttons");
        for (const [action, label] of [["profile", "查企业资料"], ["contacts", "查联系方式"]]) {
          controls.append(button(label, async () => {
            if (confirm(`确认查询「${record.name}」的${label.slice(1)}？可能产生跨境魔方费用。`)) {
              await submitBuyerAction({action, match_job_id: job.id, company_id: record.company_id});
            }
          }));
        }
        controls.append(button("用此企业核验海关", () => selectCustomsBuyer({record, jobId: job.id})));
        row.append(controls);
      }
    }
    container.append(row);
  }
}

function renderResult(job) {
  const result = $("job-result");
  if (!job) {
    result.replaceChildren(element("p", "选择一条任务以查看详情和来源。", "empty"));
    return;
  }
  const data = job.result || {};
  result.replaceChildren(element("h3", `${operationLabels[job.operation]} · ${jobLabels[job.status]}`),
    element("p", `预估 ${job.point_cost} 点 · 已扣 ${job.points_charged} 点`, "muted"));
  if (job.error) result.append(element("p", `错误：${errorLabels[job.error] || job.error}`));
  if (data.coverage === "limited") result.append(element("p", "当前证据覆盖有限。", "muted"));
  if (data.report) renderReport(result, data);
  if (data.buyer) renderBuyerResult(result, job, data.buyer);
  if (data.customs) {
    const verification = data.customs;
    result.append(element("p", `跨境魔方 · 本页 ${verification.records.length} 条${verification.has_more ? " · 供应商仍有后续页" : ""}`, "muted"));
    if (verification.reported_milli_cny != null) {
      result.append(element("p", `供应商返回费用 ¥${(verification.reported_milli_cny / 1000).toFixed(2)}`, "muted"));
    }
    for (const trade of verification.records) {
      const row = element("article", null, "lead");
      const date = Number.isFinite(trade.trade_date_ms) ? new Date(trade.trade_date_ms) : null;
      row.append(element("h3", trade.buyer || "采购商名称缺失"), element("p", trade.product_description || "商品描述缺失"),
        element("p", `${date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "日期未提供"} · ${trade.trade_id}`, "muted"));
      result.append(row);
    }
  }
  for (const [index, lead] of (data.leads ?? []).entries()) {
    const row = element("article", null, "lead");
    row.append(element("h3", lead.name), element("p", `${lead.location || "地区待核验"} · ${lead.evidence_type === "public_demand_signal" ? "公开采购信号" : "潜在线索"}`, "muted"),
      element("p", lead.reason), sourceLink(lead.source), button("查询采购商", () => {
        buyerForm.elements.buyer.value = lead.name;
        buyerForm.elements.buyer_country.value = /^[A-Z]{2}$/.test(lead.location) ? lead.location : "";
        buyerForm.elements.confirm_paid.checked = false;
        $("buyer").scrollIntoView({block: "start"});
      }), button("生成报告", async () => {
        const report = await api(workspace("/reports"), {method: "POST", key: newIdempotencyKey(), body: {job_id: job.id, lead_index: index}});
        state.selected = report.id;
        announce("报告任务已提交。");
        await Promise.all([refreshJobs(), refreshPoints()]);
      }));
    result.append(row);
  }
  if (data.sources?.length && !data.report) {
    const details = element("details");
    const links = element("ul");
    for (const source of data.sources) {
      const item = element("li");
      item.append(sourceLink(source));
      links.append(item);
    }
    details.append(element("summary", `查看 ${data.sources.length} 条来源`), links);
    result.append(details);
  }
  const details = element("details");
  details.append(element("summary", "原始任务响应"), element("pre", JSON.stringify(job, null, 2)));
  result.append(details);
}

for (const [id, refresh] of [["refresh-points", refreshPoints], ["refresh-agents", refreshAgents], ["refresh-jobs", refreshJobs]]) {
  $(id).addEventListener("click", (event) => perform(event.currentTarget, refresh));
}

let polling = false;
setInterval(async () => {
  if (polling || !state.token || !state.jobs.some((job) => ["queued", "running", "cancelling"].includes(job.status))) return;
  polling = true;
  try {
    await Promise.all([refreshJobs(), refreshPoints()]);
  } catch {
    // Manual refresh exposes errors without interrupting another form action.
  } finally {
    polling = false;
  }
}, 2500);

api("/health").then((health) => {
  $("api-status").textContent = health.database_configured ? "API 与数据库已配置" : "API 在线 · 数据库未配置";
  $("provider-status").textContent = health.deepseek_configured ? "DeepSeek 已配置" : "DeepSeek 未配置";
  $("provider-status").classList.toggle("unavailable", !health.deepseek_configured);
  $("customs-status").textContent = health.customs_configured ? "海关接口已配置" : "海关接口未配置";
  $("customs-status").classList.toggle("unavailable", !health.customs_configured);
  $("submit-customs").disabled = !health.customs_configured;
  $("submit-buyer").disabled = !health.customs_configured;
}).catch(() => {
  $("api-status").textContent = "API 无响应";
  $("provider-status").textContent = "连接状态未知";
  $("customs-status").textContent = "连接状态未知";
});

perform(null, restoreSession);
