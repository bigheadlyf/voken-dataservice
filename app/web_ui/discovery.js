"use strict";
const discoveryChat = { history: [], plan: null, contextConfiguration: null, questions: [], retryContent: "", retryLabel: "", pending: false, generation: 0, contextWorkspace: null, company: null };
const discoveryRoles = {any:"不限", distributor:"分销商 / 进口商", manufacturer:"制造商", brand:"终端客户 / 品牌", service_provider:"服务商 / 工程商", public_buyer:"政府 / 公共机构"};

function discoveryBriefHTML(plan = null) {
  const editing = !!plan;
  return `<form id="${editing ? "discovery-edit-form" : "discovery-guided-form"}" data-extension="discovery" class="discovery-brief"><fieldset><legend class="copy-visually-hidden">${editing ? "修改找客条件" : "找客条件"}</legend>
    <div class="brief-basics"><div><label>产品<input name="product" maxlength="150" value="${escape(plan?.product || "")}" placeholder="例如：商用 LED 灯具" required></label>
    ${editing ? "" : '<div id="discovery-company-products" class="choice-suggestions"></div>'}
    </div><div><label>目标市场<input name="market" maxlength="100" value="${escape(plan?.market || "")}" placeholder="输入国家或地区"></label>
    <div class="choice-suggestions" role="group" aria-label="目标市场快捷选择">${["美国","德国","英国","东南亚","中东"].map(value => `<button type="button" data-brief-field="market" data-brief-value="${value}" aria-pressed="${plan?.market === value}">${value}</button>`).join("")}<button type="button" data-brief-field="market" data-brief-value="请帮我推荐市场" aria-pressed="false">推荐市场</button></div>
    ${editing ? "" : '<div id="discovery-company-markets" class="choice-suggestions"></div>'}
    </div></div><details class="brief-preferences"><summary>客户类型与数量 · ${escape(discoveryRoles[plan?.buyer_role || "any"])} / ${plan?.target_count || 10}家</summary><fieldset class="role-choices"><legend>客户类型</legend><div class="choice-options">${Object.entries(discoveryRoles).map(([value,label]) => `<label class="choice-option"><input name="buyer_role" type="radio" value="${value}" ${(plan?.buyer_role || "any") === value ? "checked" : ""}><span>${label}</span></label>`).join("")}</div></fieldset>
    <div class="brief-footer"><label>目标数量<select name="target_count">${[...new Set([10,20,30,...(plan ? [plan.target_count] : [])])].map(count => `<option value="${count}" ${count === (plan?.target_count || 10) ? "selected" : ""}>${count} 家</option>`).join("")}</select></label></div>
    </details><details><summary>筛选要求</summary><label>补充条件<textarea name="requirements" rows="2" maxlength="1600" placeholder="例如：排除零售商，优先有实体门店的企业">${escape(plan?.instructions || "")}</textarea></label></details>
    <button type="submit" class="primary">${editing ? "更新方案" : "生成方案"}</button>
  </fieldset></form>`;
}
function discoveryBriefMessage(form) {
  const data = formData(form);
  const product = data.product.trim(), market = data.market.trim();
  if (!product) throw new Error("请先填写你想推广的产品。");
  const recommend = !market || market === "请帮我推荐市场";
  return `${discoveryChat.contextConfiguration ? "请修改当前方案，以下目标以本次为准，保留未修改的排除条件、参考网站与补充来源。" : ""}已确认产品：${product}；${recommend ? "市场尚未确定，请结合产品推荐2-4个具体市场，用可点击的market问题卡让我选择。" : "已确认目标市场：" + market + "；"}客户类型：${discoveryRoles[data.buyer_role] || discoveryRoles.any}；目标数量：${data.target_count}家；筛选要求：${data.requirements?.trim() || "未额外限定，按产品相关性筛选"}。${recommend ? "只需要我选择市场，不要重复询问已确认的条件。" : "信息已确认，请直接生成可核对的任务方案，无需追问选填条件。"}`;
}
async function loadDiscoveryContext() {
  if (!state.session || discoveryChat.contextWorkspace === state.session.workspace_id) return;
  const workspace = state.session.workspace_id, generation = discoveryChat.generation;
  discoveryChat.contextWorkspace = workspace;
  try {
    const profile = await api(root() + "/company/profile");
    if (generation !== discoveryChat.generation || state.session?.workspace_id !== workspace) return;
    discoveryChat.company = profile.data || {};
    renderDiscoveryCompanySuggestions();
  } catch {
    if (generation === discoveryChat.generation) discoveryChat.contextWorkspace = null;
  }
}
function renderDiscoveryCompanySuggestions() {
  const company = discoveryChat.company;
  for (const [selector, key, field, label, max] of [["#discovery-company-products","products","product","使用企业产品",150], ["#discovery-company-markets","target_markets","market","使用企业目标市场",100]]) {
    const element = $(selector);
    if (!element) continue;
    const value = company?.[key];
    // Long company descriptions are reference material, not selectable product names.
    element.innerHTML = typeof value === "string" && value.trim() && value.length <= max
      ? `<button type="button" data-brief-field="${field}" data-brief-value="${escape(value)}" aria-pressed="false">${label}：${escape(value)}</button>` : "";
  }
}
function discoveryQuestionsHTML(questions) {
  if (!questions.length) return "";
  return `<form id="discovery-answers-form" data-extension="discovery" class="discovery-brief"><fieldset><legend>补充条件</legend>${questions.map((question, index) => `<fieldset class="question-card"><legend>${escape(question.title)}</legend>${question.options.length ? `<div class="choice-options">${question.options.map((option, number) => `<label class="choice-option"><input type="radio" name="answer${index}" value="${number}" required><span>${escape(option)}</span></label>`).join("")}<label class="choice-option"><input type="radio" name="answer${index}" value="custom" required><span>自行填写</span></label></div><label>其他答案<input name="custom${index}" data-question-custom="${index}" maxlength="150" placeholder="填写自己的答案"></label>` : `<label>你的答案<input name="custom${index}" maxlength="150" required></label>`}</fieldset>`).join("")}<button type="submit" class="primary">继续</button></fieldset></form>`;
}
function discoveryAnswersSummary(form) {
  const data = formData(form);
  return discoveryChat.questions.map((question, index) => {
    const selected = data["answer" + index];
    const answer = !question.options.length || selected === "custom" ? data["custom" + index]?.trim() : question.options[Number(selected)];
    if (!answer) throw new Error("请完成「" + question.title + "」的选择或填写。");
    return `${question.title}：${answer}`;
  }).join("；");
}
function discoveryAnswersMessage(form) {
  return "补充已确认的任务条件：" + discoveryAnswersSummary(form) + "。请保留此前已确认的产品、数量和筛选要求，信息足够时直接生成方案，不再追问选填条件。";
}
function discoveryBriefSummary(form) {
  const data = formData(form);
  return `产品：${data.product.trim()}；市场：${!data.market.trim() || data.market === "请帮我推荐市场" ? "请 Agent 推荐" : data.market.trim()}；客户：${discoveryRoles[data.buyer_role] || discoveryRoles.any}；数量：${data.target_count}家${data.requirements?.trim() ? "；补充：" + data.requirements.trim() : ""}`;
}
function syncDiscoveryBuilder() {
  const hasPlan = !!discoveryChat.plan, hasHistory = discoveryChat.history.length > 0;
  $("#discovery-chat-brief").hidden = hasHistory;
  $("#discovery-chat-examples").hidden = hasHistory || discoveryChat.pending;
  for (const element of document.querySelectorAll("#discovery-chat-pane fieldset, #discovery-chat-form button[type=submit], #discovery-chat-examples button")) element.disabled = discoveryChat.pending;
  $("#builder-step-brief").setAttribute("aria-current", hasPlan ? "false" : "step");
  $("#builder-step-plan").setAttribute("aria-current", hasPlan ? "step" : "false");
  $("#discovery-chat-retry").hidden = !discoveryChat.retryContent || discoveryChat.pending || $("#discovery-chat-error").hidden;
}


function setDiscoveryMode(mode) {
  const chat = mode === "chat";
  $("#discovery-form-pane").hidden = chat;
  $("#discovery-chat-pane").hidden = !chat;
  for (const name of ["form", "chat"]) {
    const tab = $("#discovery-" + name + "-tab");
    const selected = name === mode;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
}

function resetDiscoveryChat() {
  discoveryChat.history = [];
  discoveryChat.plan = null;
  discoveryChat.questions = [];
  discoveryChat.contextConfiguration = null;
  discoveryChat.retryContent = "";
  discoveryChat.retryLabel = "";
  discoveryChat.contextWorkspace = null;
  discoveryChat.company = null;
  discoveryChat.pending = false;
  discoveryChat.generation++;
  $("#discovery-chat-form").reset();
  $("#discovery-chat-form button[type=submit]").disabled = false;
  $("#discovery-chat-form button[type=submit]").removeAttribute("aria-busy");
  $("#discovery-chat-error").hidden = true;
  $("#discovery-chat-plan").replaceChildren();
  $("#discovery-chat-questions").replaceChildren();
  $("#discovery-chat-brief").innerHTML = discoveryBriefHTML();
  $("#discovery-free-text").open = false;
  setDiscoveryMode("chat");
  renderDiscoveryMessages();
}

function renderDiscoveryMessages(pendingContent = "") {
  const rows = discoveryChat.history;
  $("#discovery-chat-messages").innerHTML = rows.map((row) =>
    `<article class="chat-message ${row.role === "user" ? "from-user" : "from-agent"}"><span class="chat-speaker">${row.role === "user" ? "你" : "AI"}</span><p>${escape(row.displayContent || row.content)}</p></article>`,
  ).join("") + (pendingContent ? `<article class="chat-message from-user"><span class="chat-speaker">你</span><p>${escape(pendingContent)}</p></article><p class="chat-thinking">正在整理方案…</p>` : "");
  $("#discovery-chat-examples").hidden = discoveryChat.history.length > 0 || discoveryChat.pending;
  syncDiscoveryBuilder();
  const log = $("#discovery-chat-messages");
  log.hidden = !rows.length && !pendingContent;
  const transcript = $("#discovery-transcript");
  if (transcript) {
    transcript.hidden = log.hidden;
    transcript.open = !log.hidden && !discoveryChat.plan;
  }
  log.scrollTop = log.scrollHeight;
}

function discoveryPlanHTML(plan) {
  const fields = [
    ["任务名称", plan.name], ["目标市场", plan.market], ["产品", plan.product],
    ["目标数量", `${plan.target_count} 家`],
    ["客户角色", ({any:"不限，按描述筛选",distributor:"分销商 / 进口商",manufacturer:"制造商",brand:"终端客户 / 品牌",service_provider:"服务商 / 工程商",public_buyer:"政府 / 公共机构采购方"})[plan.buyer_role] || "不限"],
    ...(plan.exclude_keywords?.length ? [["排除条件", plan.exclude_keywords.join("、")]] : []),
    ...(plan.exclude_domains?.length ? [["排除域名", plan.exclude_domains.join("、")]] : []),
    ...(plan.reference_websites?.length ? [["更多参考客户", plan.reference_websites.join("、")]] : []),
    ["筛选要求", plan.instructions],
    ...(plan.seed_website ? [["参考官网", plan.seed_website]] : []),
    ...(plan.hs_code ? [["HS 编码", plan.hs_code]] : []),
    ...(plan.public_sources?.length ? [["补充来源", "近 90 天 TED 官方招标"]] : []),
  ];
  return `<form id="discovery-chat-create" data-extension="discovery" class="chat-plan"><h3>任务方案</h3><dl>${fields.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl><label>数据方案<select name="tier" id="discovery-chat-tier"><option value="basic">基础发现 · 公开搜索</option><option value="enhanced">高级档 · 公开搜索 + 跨境魔方</option><option value="ai_enhanced">AI增强档 · 高级档 + 目标岗位联系人</option></select></label><label id="discovery-chat-contact-target" hidden>目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label><p id="discovery-chat-price" class="notice"></p><label class="check" id="discovery-chat-paid" hidden><input name="paid" type="checkbox">同意预占所示点数</label><label class="check"><input name="reviewed" type="checkbox" required>已核对任务条件和报价</label><div class="actions"><button type="submit" class="primary">创建任务</button><button type="button" id="discovery-plan-to-form">转为手动填写</button></div></form><details class="discovery-edit"><summary>修改找客条件</summary>${discoveryBriefHTML(plan)}</details>`;
}

function updateDiscoveryChatQuote() {
  const select = $("#discovery-chat-tier");
  if (!select) return;
  const enhanced = select.value !== "basic";
  $("#discovery-chat-contact-target").hidden = select.value !== "ai_enhanced";
  const quote = state.pointQuotes?.[select.value === "ai_enhanced" ? "prospecting_ai_enhanced" : enhanced ? "prospecting_enhanced" : "prospecting"];
  $("#discovery-chat-paid").hidden = !enhanced;
  $("#discovery-chat-paid input").required = enhanced;
  $("#discovery-chat-paid input").checked = false;
  $("#discovery-chat-create [name=reviewed]").checked = false;
  $("#discovery-chat-price").textContent = quote
    ? `预占 ${quote.total_points} 点（平台 ${quote.platform_points}，数据 ${quote.data_points}）`
    : "报价未加载，请刷新";
  $("#discovery-chat-create button[type=submit]").disabled = !quote;
}

let discoveryConfigurationSupported = true;
function legacyDiscoveryHistory(history, configuration) {
  if (!configuration) return history;
  const encoded = JSON.stringify(configuration);
  const parts = [];
  for (let start = 0; start < encoded.length; start += 2000) parts.push(encoded.slice(start, start + 2000));
  if (parts.length > 16) throw new Error("方案资料过长，请转到表单编辑后创建任务。");
  const keep = 16 - parts.length;
  return [
    ...(keep ? history.slice(-keep) : []),
    ...parts.map((part, index) => ({role:"assistant", content:`上次待确认方案（仅供修改，尚未创建任务），JSON片段 ${index + 1}/${parts.length}：${part}`})),
  ];
}
async function requestDiscoveryPlan(content, history, configuration, isCurrent) {
  const payload = {content, history};
  // Initial requests need no optional context, so they also work with older servers.
  if (configuration) {
    if (discoveryConfigurationSupported) payload.current_configuration = configuration;
    else payload.history = legacyDiscoveryHistory(history, configuration);
  }
  try {
    return await api(root() + "/discovery/plan", {method:"POST", body:JSON.stringify(payload)});
  } catch (error) {
    const unsupported = error.status === 422 && Array.isArray(error.detail) && error.detail.length === 1 &&
      error.detail[0].type === "extra_forbidden" &&
      JSON.stringify(error.detail[0].loc) === JSON.stringify(["body", "current_configuration"]);
    if (!configuration || !unsupported || !isCurrent()) throw error;
    // Validation rejected the request before planning; retry only this version mismatch once.
    discoveryConfigurationSupported = false;
    return api(root() + "/discovery/plan", {
      method:"POST", body:JSON.stringify({content, history:legacyDiscoveryHistory(history, configuration)}),
    });
  }
}
async function sendDiscoveryMessage(content, displayContent = content) {
  if (discoveryChat.pending) return;
  if (discoveryChat.history.length >= 16)
    throw new Error("本次对话已满 8 轮。请采用方案、转到表单编辑，或重新开始。");
  if (!content || content.length > 2400) throw new Error("需求内容请控制在1–2400字，可精简筛选要求后重试。");
  const generation = discoveryChat.generation;
  discoveryChat.retryContent = content;
  discoveryChat.retryLabel = displayContent;
  discoveryChat.pending = true;
  discoveryChat.plan = null;
  $("#discovery-chat-plan").replaceChildren();
  $("#discovery-chat-error").hidden = true;
  renderDiscoveryMessages(displayContent);
  try {
    const result = await requestDiscoveryPlan(content,
      discoveryChat.history.map(({role, content}) => ({role, content})), discoveryChat.contextConfiguration,
      () => generation === discoveryChat.generation);
    if (generation !== discoveryChat.generation) return;
    discoveryChat.history.push({role:"user",content,displayContent}, {role:"assistant",content:result.reply});
    discoveryChat.plan = result.configuration;
    if (result.configuration) discoveryChat.contextConfiguration = result.configuration;
    discoveryChat.retryContent = "";
    discoveryChat.retryLabel = "";
    discoveryChat.questions = result.configuration ? [] : (result.questions || []);
    $("#discovery-chat-questions").innerHTML = discoveryQuestionsHTML(discoveryChat.questions);
    if (!result.configuration && !discoveryChat.questions.length) $("#discovery-free-text").open = true;
    if ($("#discovery-chat-input").value.trim() === content) $("#discovery-chat-input").value = "";
    if (result.configuration) {
      $("#discovery-chat-plan").innerHTML = discoveryPlanHTML(result.configuration);
      updateDiscoveryChatQuote();
    }
  } catch (error) {
    if (generation !== discoveryChat.generation) return;
    $("#discovery-chat-error").textContent = error.message + "。可重试或修改条件。";
    $("#discovery-chat-error").hidden = false;
  } finally {
    if (generation === discoveryChat.generation) {
      discoveryChat.pending = false;
      renderDiscoveryMessages();
      if (state.tab === "discover" && !$("#discovery-chat-pane").hidden && $("#discovery-chat-error").hidden) {
        const target = discoveryChat.plan ? $("#discovery-chat-plan") : discoveryChat.questions.length ? $("#discovery-chat-questions") : $("#discovery-free-text");
        target.scrollIntoView?.({block:"start", behavior:"smooth"});
      }
    }
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.discoveryMode) setDiscoveryMode(button.dataset.discoveryMode);
  if (button.id === "discovery-chat-reset") { resetDiscoveryChat(); void loadDiscoveryContext(); }
  if (button.dataset.briefField) {
    const form = button.closest("form");
    form.elements[button.dataset.briefField].value = button.dataset.briefValue;
    for (const choice of form.querySelectorAll(`[data-brief-field="${button.dataset.briefField}"]`)) choice.setAttribute("aria-pressed", String(choice === button));
  }
  if (button.id === "discovery-chat-retry") void runAction(button, () => sendDiscoveryMessage(discoveryChat.retryContent, discoveryChat.retryLabel));
  if (button.dataset.discoveryExample) {
    const form = $("#discovery-guided-form");
    form.elements.product.value = "商用 LED 灯具";
    form.elements.market.value = "德国";
    form.elements.buyer_role.value = "distributor";
    form.elements.requirements.value = "排除只做零售的公司";
    form.elements.product.focus();
  }
  if (button.id === "discovery-plan-to-form" && discoveryChat.plan) {
    const form = $("#discovery-form"), plan = discoveryChat.plan;
    for (const key of ["name", "market", "product", "instructions", "target_count", "buyer_role", "seed_website", "hs_code"])
      form.elements[key].value = plan[key] ?? "";
    form.elements.exclude_keywords.value = (plan.exclude_keywords || []).join("，");
    form.elements.exclude_domains.value = (plan.exclude_domains || []).join("，");
    form.elements.reference_websites.value = (plan.reference_websites || []).join("\n");
    form.elements.ted.checked = (plan.public_sources || []).includes("ted");
    form.elements.tier.value = $("#discovery-chat-tier").value;
    form.elements.contact_target.value = $("#discovery-chat-create [name=contact_target]").value;
    form.elements.paid.checked = false;
    $("#paid-label").hidden = form.elements.tier.value === "basic";
    updateDiscoveryPrice();
    setDiscoveryMode("form");
    const options = $("#discovery-form-options");
    if (options) options.open = true;
    form.elements.name.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-discovery-mode]")) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const mode = event.key === "Home" ? "chat" : event.key === "End" ? "form" : event.target.dataset.discoveryMode === "form" ? "chat" : "form";
  setDiscoveryMode(mode);
  $("#discovery-" + mode + "-tab").focus();
});
document.addEventListener("input", event => {
  const input = event.target;
  const form = input.closest("form");
  if (input.dataset.questionCustom !== undefined && input.value.trim()) form.elements["answer" + input.dataset.questionCustom].value = "custom";
  if (form?.id === "discovery-guided-form" || form?.id === "discovery-edit-form") {
    for (const button of form.querySelectorAll(`[data-brief-field="${input.name}"]`)) button.setAttribute("aria-pressed", String(button.dataset.briefValue === input.value));
  }
});
document.addEventListener("change", (event) => {
  if (event.target.id === "discovery-chat-tier") updateDiscoveryChatQuote();
  const form = event.target.closest("form");
  if (["discovery-guided-form", "discovery-edit-form"].includes(form?.id) && ["buyer_role", "target_count"].includes(event.target.name)) {
    form.querySelector(".brief-preferences > summary").textContent = `客户类型与数量 · ${discoveryRoles[form.elements.buyer_role.value]} / ${form.elements.target_count.value}家`;
  }
});
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.dataset.extension !== "discovery") return;
  event.preventDefault();
  void runAction($("button[type=submit]", form), async () => {
    if (["discovery-guided-form", "discovery-edit-form"].includes(form.id))
      await sendDiscoveryMessage(discoveryBriefMessage(form), discoveryBriefSummary(form));
    if (form.id === "discovery-answers-form")
      await sendDiscoveryMessage(discoveryAnswersMessage(form), discoveryAnswersSummary(form));
    if (form.id === "discovery-chat-form")
      await sendDiscoveryMessage(form.elements.content.value.trim());
    if (form.id === "discovery-chat-create") {
      if (!discoveryChat.plan || discoveryChat.pending || !form.elements.reviewed.checked) return;
      const enhanced = form.elements.tier.value !== "basic";
      if (enhanced && !form.elements.paid.checked) throw new Error(errors.paid_confirmation_required);
      await createDiscoveryTask(discoveryChat.plan, form.elements.tier.value, enhanced, form.elements.contact_target.value);
      resetDiscoveryChat();
    }
  });
});
resetDiscoveryChat();
