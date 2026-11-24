"use strict";
// Explicit adapter for the React views. Legacy scripts stay usable by their original tests.
(() => {
  Object.assign(titles,{
    "my-assistant":"我的助手",
    "my-overview":"我的工作台", "orders-payments":"订单与收款", "protection-funding":"保障与资金", "ai-capabilities":"AI能力",
    overview:"业务概况",discover:"发现客户",directory:"企业与联系人",sources:"商业情报",company:"企业资料",
  });
  let summary = null, loading = 0, workbenchError = "";
  let customerId = null;
  let customerTab = "profile";
  let dashboardAgents = null, dashboardAgentsError = false;
  const publish = () => window.dispatchEvent(new Event("voken:updated"));
  const originalApi = api;
  api = async function(path, options) {
    try {
      const result = await originalApi(path, options);
      if (path.endsWith("/crm/summary")) summary = result;
      if (path.includes("/crm/workbench?") && result?.summary) workbenchError = "";
      return result;
    } catch (error) {
      if (path.includes("/crm/workbench?")) workbenchError = error.message;
      throw error;
    } finally { publish(); }
  };
  const originalClear = clearWorkspaceView;
  clearWorkspaceView = function() {
    summary = null;
    customerId = null;
    dashboardAgents = null;
    dashboardAgentsError = false;
    window.__vokenWorkbenchSummary = null;
    workbenchError = "";
    $("#balance").textContent = "— 点数";
    originalClear();
    publish();
  };
  async function loadDashboardAgents() {
    const session = state.session;
    if (!session) return;
    try {
      const agents = await api(root() + "/agents");
      if (state.session !== session) return;
      dashboardAgents = agents;
      dashboardAgentsError = false;
    } catch {
      if (state.session === session) dashboardAgentsError = true;
    } finally { publish(); }
  }
  const originalRefreshTab = refreshTab;
  refreshTab = async function() {
    if (state.tab === "my-overview") {
      await Promise.all([originalRefreshTab(), loadDashboardAgents()]);
    } else {
      await originalRefreshTab();
    }
  };
  const originalToast = toast;
  toast = function(message, error = false) {
    originalToast(message, error);
    window.dispatchEvent(new CustomEvent("voken:message", {detail:{message,error}}));
  };
  const originalAction = runAction;
  runAction = async function(button, fn) {
    loading++; publish();
    try { return await originalAction(button, fn); }
    finally { loading--; publish(); }
  };
  const originalSwitch = switchTab;
  switchTab = async function(tab) {
    loading++;
    // originalSwitch updates the route synchronously before its first await.
    if (!["customers", "workbench", "directory", "jobs", "job-view"].includes(tab) && !tab.startsWith("jobs/")) customerId = null;
    try { const result = originalSwitch(tab === "customers" ? "workbench" : tab); publish(); return await result; }
    finally { loading--; publish(); }
  };
  const originalWorkbench = loadWorkbench;
  loadWorkbench = async function() {
    loading++; publish();
    try {
      const result = await originalWorkbench();
      if ($("#wb-summary").textContent.startsWith("客户工作台暂不可用")) workbenchError = "客户工作台暂不可用，请稍后重试。";
      return result;
    } catch(error) { workbenchError = error.message; throw error; }
    finally { loading--; publish(); }
  };
  const originalJobs = loadJobs;
  loadJobs = async function() { try { return await originalJobs(); } finally { publish(); } };
  const originalGlobal = loadGlobal;
  loadGlobal = async function() { try { return await originalGlobal(); } finally { publish(); } };
  async function perform(fn) {
    loading++; publish();
    try { return await fn(); }
    catch(error) { toast(error.message, true); throw error; }
    finally { loading--; publish(); }
  }
  window.voken = {
    snapshot() {
      return {session: state.session ? {workspace_id: state.session.workspace_id} : null,
        tab:state.tab, customerId, customerTab, prices:state.prices, pointQuotes:state.pointQuotes,
        balance:$("#balance").textContent, summary, jobs:[...state.jobs],
        dashboardAgents, dashboardAgentsError,
        workbench:{...wb, items:[...wb.items], selected:[...wb.selected], filters:wbFilters(),
          summary:window.__vokenWorkbenchSummary || null}, workbenchError, loading:loading>0};
    },
    navigate(tab) { return perform(async()=> { if(tab==="jobs") state.selectedJob=null; await switchTab(tab); }); },
    assistant: {
      list() { return api(root()+"/assistant/conversations"); },
      history(id, before) {
        const query = before ? "?" + new URLSearchParams({before}) : "";
        return api(root()+"/assistant/conversations/"+encodeURIComponent(id)+"/messages"+query);
      },
      get(id) { return api(root()+"/assistant/messages/"+encodeURIComponent(id)); },
      send(body, key) {
        return api(root()+"/assistant/messages", {
          method:"POST", headers:{"Idempotency-Key":key}, body:JSON.stringify(body),
        });
      },
      async decide(id, approve, file) {
        const form = new FormData();
        form.append("approve", String(approve));
        if (file) form.append("file", file);
        const result = await api(root()+"/assistant/messages/"+encodeURIComponent(id)+"/decision", {method:"POST", body:form});
        if (approve && result.status === "succeeded") await loadGlobal().catch(() => {});
        return result;
      },
      download(query) { return perform(() => exportProspects(new URLSearchParams(query))); },
    },
    refresh() { return perform(async()=> { await loadGlobal(); await refreshTab(); }); },
    filter(values, offset=0) {
      const form=$("#wb-filter");
      for(const [key,value] of Object.entries(values)) {
        const field=form.elements.namedItem(key); if(!field) continue;
        if(field.type==="checkbox") field.checked=!!value; else field.value=value ?? "";
      }
      wb.offset=offset; wb.selected.clear(); return perform(loadWorkbench);
    },
    select(ids) { wb.selected=new Set(ids); publish(); },
    async detail(id) {
      const prospect = await api(root()+"/crm/prospects/"+id);
      const [activities,companies,records,savedContacts] = await Promise.all([
        api(root()+"/crm/prospects/"+id+"/activities"),
        api(wbRoot()+"?mode=companies&limit=100&target="+encodeURIComponent(wbFilters().target)+"&q="+encodeURIComponent(prospect.name)),
        api(wbRoot()+"/history/"+id),
        api(root()+"/directory/saved-contacts/"+id),
      ]);
      const company=companies.items.find(c=>c.id===id);
      return {prospect,activities,contacts:company?.contacts || [],duplicates:company?.duplicates || [],records,savedContacts};
    },
    async searchCustomers(query) {
      const params = new URLSearchParams({q: query, limit: "20"});
      const result = await api(root()+"/crm/prospects?"+params);
      return result.items;
    },
    post(path, body, slot) { return perform(()=>wbPost(path,body,slot)); },
    async openCustomer(id, tab = "profile") {
      customerId = id;
      customerTab = tab;
      if (state.tab !== "workbench") await this.navigate("workbench");
      else publish();
    },
    closeCustomer() { customerId = null; publish(); },
    updateCustomer(id, version, changes) {
      return api(root()+"/crm/prospects/"+id, {
        method:"PATCH", body:JSON.stringify({...changes, expected_version:version}),
      });
    },
    recordActivity(id, values) {
      return api(root()+"/crm/prospects/"+id+"/activities", {method:"POST", body:JSON.stringify(values)});
    },
    createDraft(id, values) { return submitDraft(id, values); },
    searchCustomerContacts(id, kind, values) {
      const targeted = kind === "targeted";
      const preferredTitles = targeted ? "" : wbPreferredTitles();
      return directorySubmit(targeted ? "/directory/targeted-contacts" : "/directory/searches",
        values, targeted ? "targeted" : "search", () => {
          directorySelection = null;
          directoryTarget = id;
          directoryPreferredTitles = preferredTitles;
        });
    },
    applySourceContact(id, values) {
      return api(root()+"/crm/prospects/"+id+"/apply-contact", {method:"POST", body:JSON.stringify(values)});
    },
    refreshCustomers() { return perform(loadWorkbench); },
    exportCustomers() {
      const {q,stage,due}=wbFilters();
      const params=new URLSearchParams();
      if(q) params.set("q",q);
      if(stage) params.set("stage",stage);
      if(due) params.set("due","true");
      return perform(()=>exportProspects(params));
    },
    action:perform,
    saveView(name) { return perform(async()=> { await wbPost("/views",{...wbFilters(),name}); await loadWorkbench(); toast("筛选视图已保存"); }); },
    applyView(index) {
      const data=wb.views[index]?.data;
      if(!data) return Promise.resolve();
      $("#wb-filter").reset(); return this.filter(data);
    },
  };
  // Covers session expiration and logout mutations performed by the original client.
  new MutationObserver(publish).observe($("#workspace"), {attributes:true,attributeFilter:["hidden"]});
  new MutationObserver(publish).observe($("#auth"), {attributes:true,attributeFilter:["hidden"]});
  publish();
  if(state.session) enter().catch(error=>toast(error.message,true)).finally(publish);
})();
