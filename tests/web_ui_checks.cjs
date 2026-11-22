// Run with node tests/web_ui_checks.cjs. Pure JS tests; no browser or network required.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");

const elements = new Map();
function element(selector) {
  if (!elements.has(selector))
    elements.set(selector, {
      value: "",
      hidden: false,
      dataset: {},
      disabled: false,
      setAttribute(name, value) { this[name] = value; },
      removeAttribute(name) { delete this[name]; },
      reset() {
        this.value = "";
      },
      replaceChildren() {
        this.innerHTML = "";
      },
      insertAdjacentHTML(_position, html) { this.innerHTML = (this.innerHTML || "") + html; },
    });
  return elements.get(selector);
}
const values = new Map();
const storage = {
  getItem(key) {
    return values.get(key) ?? null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  },
};
let finishRequest;
let lastRequest;
const context = vm.createContext({
  document: { querySelector: element, querySelectorAll() { return []; }, addEventListener() {}, hidden: false },
  window: { addEventListener() {}, scrollTo() {} },
  sessionStorage: storage,
  crypto,
  URL,
  URLSearchParams,
  setTimeout() {},
  clearTimeout() {},
  setInterval() {},
  fetch: (path, options) =>
    new Promise((resolve) => {
      lastRequest = { path, options };
      finishRequest = resolve;
    }),
});
vm.runInContext(fs.readFileSync("app/web_ui/app.js", "utf8"), context);
vm.runInContext(fs.readFileSync("app/web_ui/account.js", "utf8"), context);
vm.runInContext(fs.readFileSync("app/web_ui/discovery.js", "utf8"), context);
vm.runInContext(fs.readFileSync("app/web_ui/directory.js", "utf8"), context);

async function main() {
  vm.runInContext('state.jobs=[{id:"1",operation:"prospecting",status:"running"},{id:"2",operation:"source_lookup",status:"succeeded"},{id:"3",operation:"outreach_draft",status:"failed"}]', context);
  element("#job-type-filter").value = "intelligence";
  assert.equal(vm.runInContext('filteredJobs().map(row=>row.id).join(",")', context), "2");
  element("#job-status-filter").value = "active";
  assert.equal(vm.runInContext('filteredJobs().length', context), 0);
  element("#job-type-filter").value = "";
  assert.equal(vm.runInContext('filteredJobs()[0].id', context), "1");
  element("#job-status-filter").value = "";
  vm.runInContext('state.sources=[{id:"gleif",category:"entity_identity",status:"configured",name:"身份"},{id:"ted",category:"procurement",status:"configured",name:"采购"},{id:"cpsc",category:"product_risk",status:"not_configured",name:"风险"}];selectIntelligenceIntent("procurement")', context);
  assert.equal(element("#source-select").value, "ted");
  assert.equal(element("#source-time-field").hidden, false);
  assert.equal(element("#source-entity-field").hidden, true);
  assert.ok(!element("#source-select").innerHTML.includes('value="gleif"'));
  vm.runInContext('selectIntelligenceIntent("risk")', context);
  assert.equal(element("#source-submit").disabled, true);
  vm.runInContext('selectIntelligenceIntent("identity")', context);
  assert.equal(element("#source-submit").disabled, false);
  assert.equal(element("#source-entity-field").hidden, false);
  assert.equal(element("#source-time-field").hidden, true);

  const directoryHTML = vm.runInContext(`directoryResultHTML({kind:"people",records:[{record_id:"person-1",name:'<img onerror=alert(1)>',company_name:"Buyer",titles:["Sales"],title_match:false,addresses:[],contact_inventory:{email_num:0}}],quota_usage:{billing_mode:"PLAN",request_units:1,record_units:1,unlock_units:0}})`, context);
  assert.ok(directoryHTML.includes("&lt;img"));
  assert.ok(!directoryHTML.includes("<img onerror"));
  assert.ok(directoryHTML.includes("未直接匹配"));
  assert.ok(directoryHTML.includes("邮箱库存 0"));
  assert.ok(directoryHTML.includes("data-directory-unlock-confirm"));
  context.FormData = class TestFormData {};
  const multipart = vm.runInContext(
    'api("/api/v1/auth/test-only", {method:"POST",body:new FormData()})',
    context,
  );
  assert.equal(
    lastRequest.options.headers["Content-Type"],
    undefined,
    "Multipart uploads must let the browser attach the boundary",
  );
  finishRequest({
    status: 200,
    ok: true,
    json: async () => ({ accepted: true }),
  });
  await multipart;
  vm.runInContext(
    `proposalHTML({id:"a".repeat(32),filename:"fixture.txt",proposal:{profile:{name:'<img src=x onerror=alert(1)>'},profile_evidence:{name:'<script>bad</script>'},memories:[]}})`,
    context,
  );
  assert.ok(element("#company-proposal").innerHTML.includes("&lt;img"));
  assert.ok(!element("#company-proposal").innerHTML.includes("<script>"));
  vm.runInContext("resetAccountPanels()", context);
  assert.equal(element("#company-proposal").innerHTML, "");
  assert.equal(vm.runInContext("companyProposal", context), null);
  const rows = vm.runInContext(
    'parseCSV(\'name,source_note\\r\\n"Buyer, Ltd","Line one\\nLine two and ""quote"""\')',
    context,
  );
  assert.equal(rows[1][0], "Buyer, Ltd");
  assert.equal(rows[1][1], 'Line one\nLine two and "quote"');
  assert.throws(() =>
    vm.runInContext("parseCSV('name\\n\"unclosed')", context),
  );
  assert.equal(vm.runInContext('safeLink("javascript:alert(1)")', context), "");
  assert.equal(
    vm.runInContext('safeLink("https://user:password@example.com/")', context),
    "",
  );

  const key1 = vm.runInContext(
    'pendingSubmission("retry", {id: "buyer", language: "English"})',
    context,
  );
  const key2 = vm.runInContext(
    'pendingSubmission("retry", {id: "buyer", language: "English"})',
    context,
  );
  const key3 = vm.runInContext(
    'pendingSubmission("retry", {id: "buyer", language: "German"})',
    context,
  );
  assert.equal(key1, key2);
  assert.notEqual(key1, key3);
  const fullCrypto = context.crypto;
  context.crypto = {
    getRandomValues: crypto.webcrypto.getRandomValues.bind(crypto.webcrypto),
  };
  context.Uint8Array = Uint8Array;
  const fallbackKey = vm.runInContext(
    'pendingSubmission("http-retry", {id: "buyer"})',
    context,
  );
  assert.match(fallbackKey, /^[0-9a-f]{32}$/);
  context.crypto = fullCrypto;

  vm.runInContext(
    'state.session={access_token:"old-account",workspace_id:"old"}',
    context,
  );
  const oldRequest = vm.runInContext(
    'api("/api/v1/workspaces/old/crm/prospects")',
    context,
  );
  vm.runInContext(
    'state.session={access_token:"new-account",workspace_id:"new"}',
    context,
  );
  finishRequest({
    status: 200,
    ok: true,
    json: async () => ({ private: "old-account-data" }),
  });
  await assert.rejects(oldRequest, /会话已变化/);
  let finishBody;
  let markBodyStarted;
  const bodyStarted = new Promise((resolve) => {
    markBodyStarted = resolve;
  });
  const slowBody = vm.runInContext(
    'api("/api/v1/workspaces/new/crm/prospects")',
    context,
  );
  finishRequest({
    status: 200,
    ok: true,
    json: () =>
      new Promise((resolve) => {
        finishBody = resolve;
        markBodyStarted();
      }),
  });
  // Allow the API client to receive headers and enter response.json(), then switch accounts.
  await bodyStarted;
  vm.runInContext(
    'state.session={access_token:"body-switched-account",workspace_id:"body-switched"}',
    context,
  );
  finishBody({ private: "old-account-slow-body" });
  await assert.rejects(slowBody, /会话已变化/);
  assert.equal(
    vm.runInContext("state.session.access_token", context),
    "body-switched-account",
  );

  const denied = vm.runInContext(
    'api("/api/v1/workspaces/new/crm/prospects")',
    context,
  );
  vm.runInContext(
    'state.session={access_token:"third-account",workspace_id:"third"}',
    context,
  );
  finishRequest({
    status: 401,
    ok: false,
    json: async () => ({ detail: "authentication_required" }),
  });
  await assert.rejects(denied);
  assert.equal(
    vm.runInContext("state.session.access_token", context),
    "third-account",
  );
  const validationDetail = [{type:"extra_forbidden",loc:["body","current_configuration"],msg:"Extra inputs are not permitted"}];
  const validationFailure = vm.runInContext('api("/api/v1/workspaces/third/discovery/plan", {method:"POST",body:"{}"})', context);
  finishRequest({status:422,ok:false,json:async () => ({detail:validationDetail})});
  await assert.rejects(validationFailure, error => error.status === 422 && error.detail === validationDetail);
  // New UI works against the old strict request schema without losing edit context.
  vm.runInContext(`
    const originalPlannerApi = api;
    let plannerCalls = [];
    api = async (_path, options) => {
      const payload = JSON.parse(options.body);
      plannerCalls.push(payload);
      if ("current_configuration" in payload) throw Object.assign(new Error("old schema"), {
        status:422, detail:[{type:"extra_forbidden",loc:["body","current_configuration"]}]
      });
      return {reply:"请核对",configuration:null};
    };
  `, context);
  await vm.runInContext('requestDiscoveryPlan("initial", [], null, () => true)', context);
  assert.equal(vm.runInContext('"current_configuration" in plannerCalls[0]', context), false);
  vm.runInContext('plannerCalls = []', context);
  await vm.runInContext('requestDiscoveryPlan("edit", [], {exclude_domains:["existing.example"]}, () => true)', context);
  assert.equal(vm.runInContext('plannerCalls.length', context), 2);
  assert.equal(vm.runInContext('"current_configuration" in plannerCalls[1]', context), false);
  assert.ok(vm.runInContext('plannerCalls[1].history[0].content.includes("existing.example")', context));
  await vm.runInContext('requestDiscoveryPlan("edit again", [], {product:"LED"}, () => true)', context);
  assert.equal(vm.runInContext('plannerCalls.length', context), 3);
  const legacy = vm.runInContext('legacyDiscoveryHistory(Array.from({length:14},()=>({role:"user",content:"old"})),{instructions:"x".repeat(5000)})', context);
  assert.ok(legacy.length <= 16);
  assert.ok(legacy.every(row => row.content.length <= 2400));
  const restored = legacy.slice(-3).map(row => row.content.slice(row.content.indexOf("：") + 1)).join("");
  assert.equal(JSON.parse(restored).instructions.length, 5000);
  vm.runInContext(`
    discoveryConfigurationSupported = true;
    plannerCalls = [];
    api = async (_path, options) => {
      plannerCalls.push(JSON.parse(options.body));
      throw Object.assign(new Error("invalid count"), {status:422,detail:[{type:"less_than_equal",loc:["body","current_configuration","target_count"]}]});
    };
  `, context);
  await assert.rejects(vm.runInContext('requestDiscoveryPlan("invalid", [], {target_count:99}, () => true)', context), /invalid count/);
  assert.equal(vm.runInContext('plannerCalls.length', context), 1);
  vm.runInContext('api = originalPlannerApi; discoveryConfigurationSupported = true;', context);
  // Reloading a submitted draft must show its real status without offering another send.
  vm.runInContext(`
    api = async (path) => {
      if (path.endsWith("/mail/deliveries")) return [{draft_job_id:"sent-draft",status:"accepted",subject:"QA",recipient:"qa@example.com",created_at:"2026-11-21T00:00:00Z",message_id:"qa"}];
      throw new Error("Submitted draft must not load another send form");
    };
    state.selectedJob = "sent-draft";
  `, context);
  element("#job-detail").innerHTML = "";
  await vm.runInContext('renderMailReview({id:"sent-draft"})', context);
  assert.match(element("#draft-delivery-status").textContent, /SMTP 已接受/);
  assert.match(element("#job-detail").innerHTML, /已有发送记录/);
  assert.ok(!element("#job-detail").innerHTML.includes('id="mail-review-form"'));

  // An opted-out customer must get an explicit explanation instead of a send form.
  vm.runInContext(`
    api = async (path) => {
      if (path.endsWith("/mail/deliveries")) return [];
      if (path.endsWith("/mail/channel")) return {enabled:true};
      return {do_not_contact:true};
    };
    state.selectedJob = "new-draft";
  `, context);
  element("#job-detail").innerHTML = "";
  await vm.runInContext('renderMailReview({id:"new-draft",result:{draft:{prospect_id:"opted-out"}}})', context);
  assert.match(element("#job-detail").innerHTML, /拒绝联系/);
  assert.ok(!element("#job-detail").innerHTML.includes('id="mail-review-form"'));
  const planMarkup = vm.runInContext(`discoveryPlanHTML({name:'<img src=x onerror=alert(1)>',market:'DE',product:'LED',instructions:'<script>unsafe</script>',target_count:5,buyer_role:'distributor',exclude_keywords:['retail']})`, context);
  assert.ok(planMarkup.includes("&lt;img"));
  assert.ok(!planMarkup.includes("<script>"));
  assert.ok(planMarkup.includes('id="discovery-edit-form"'));
  const questionsMarkup = vm.runInContext(`discoveryQuestionsHTML([{field:"market",title:'<script>unsafe</script>',options:['<img onerror=alert(1)>','德国']}])`, context);
  assert.ok(questionsMarkup.includes("&lt;script&gt;"));
  assert.ok(questionsMarkup.includes("&lt;img"));
  assert.ok(!questionsMarkup.includes("<script>"));
  assert.ok(questionsMarkup.includes('type="radio"'));
  assert.ok(questionsMarkup.includes('value="custom"'));
  const briefMarkup = vm.runInContext(`discoveryBriefHTML({product:'" onfocus="bad',market:'DE',target_count:7,buyer_role:'distributor'})`, context);
  assert.ok(briefMarkup.includes('value="7" selected'));
  assert.ok(!briefMarkup.includes('value="" onfocus='));
  // A delayed answer from a previous conversation must not repopulate a reset/logout view.
  vm.runInContext('let finishPlanning; api = () => new Promise(resolve => { finishPlanning = resolve; });', context);
  const latePlan = vm.runInContext('sendDiscoveryMessage("德国 LED 分销商")', context);
  assert.equal(vm.runInContext('discoveryChat.pending', context), true);
  vm.runInContext('resetDiscoveryChat(); finishPlanning({reply:"old reply",configuration:{name:"old"}})', context);
  await latePlan;
  assert.equal(vm.runInContext('discoveryChat.history.length', context), 0);
  assert.equal(vm.runInContext('discoveryChat.plan', context), null);
  assert.equal(vm.runInContext('discoveryChat.contextConfiguration', context), null);
  assert.equal(element("#discovery-chat-tab")["aria-selected"], "true");
  assert.ok(!element("#discovery-chat-messages").innerHTML.includes("old reply"));
  // Provider failure preserves the user's editable request and exposes a retry explanation.
  element("#discovery-chat-input").value = "keep my request";
  vm.runInContext('api = async () => { throw new Error("provider unavailable"); };', context);
  await vm.runInContext('sendDiscoveryMessage("keep my request")', context);
  assert.equal(element("#discovery-chat-input").value, "keep my request");
  assert.equal(element("#discovery-chat-error").hidden, false);
  assert.equal(vm.runInContext('discoveryChat.history.length', context), 0);
  console.log(
    "Passed multipart boundaries, proposal escaping, account clearing, CSV, URL safety, idempotency, cross-account responses, submitted-draft status and opt-out review, discovery escaping, reset race and retry-input checks.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
