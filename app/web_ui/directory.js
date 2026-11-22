"use strict";
let directorySelection = null;
let directoryTarget = null;
let directoryPreferredTitles = "";

function resetDirectoryView() {
  directorySelection = null;
  directoryTarget = null;
  directoryPreferredTitles = "";
  $("#directory-form").reset();
  $("#targeted-contact-form")?.reset();
  $("#directory-selected").hidden = true;
  $("#directory-selected").textContent = "";
}

function directoryConfiguration() {
  const form = $("#discovery-form");
  if (!form.reportValidity()) return null;
  const data = formData(form);
  return {name:data.name, instructions:data.instructions?.trim() || `寻找${data.market}的${data.product}潜在采购客户，按客户角色筛选并保留公开依据。`, market:data.market, product:data.product,
    target_count:Number(data.target_count), buyer_role:data.buyer_role, seed_website:data.seed_website || null,
    public_sources:form.elements.ted.checked ? ["ted"] : [],
    exclude_keywords:data.exclude_keywords.split(/[,，]/).map(x=>x.trim()).filter(Boolean),
    exclude_domains:(data.exclude_domains || "").split(/[,，]/).map(x=>x.trim()).filter(Boolean),
    reference_websites:(data.reference_websites || "").split(/\s+/).filter(Boolean),
    ...(data.hs_code ? {hs_code:data.hs_code} : {})};
}

async function directorySubmit(path, payload, slot) {
  const keySlot = `voken-directory-${state.session.workspace_id}-${slot}`;
  const job = await api(root()+path,{method:"POST",headers:{"Idempotency-Key":pendingSubmission(keySlot,payload)},body:JSON.stringify(payload)});
  clearSubmission(keySlot);
  state.selectedJob = job.id;
  await loadGlobal();
  await switchTab("jobs");
  toast("已提交；结果可在任务中查看");
}

function directoryResultHTML(data) {
  const records = data.records || [];
  const quota = data.quota_usage || {};
  let html = data.source === "hunter" ? `<div class="notice">来源：Hunter · ${records.length} 个邮箱候选 · 目标岗位命中 ${data.matched_contact_count || 0} 条。岗位与有效性仍须分别核对。</div>` : `<div class="notice">本页 ${records.length} 条${data.has_more ? " · 还有下一页" : ""}<br>来源：${data.source === "hunter" ? "Hunter 精准岗位检索" : data.source === "upkuajing+hunter" ? "跨境魔方 + Hunter" : "跨境魔方"} · ${escape(quota.billing_mode || "未回传计费模式")} · 请求扣量 ${quota.request_units || 0} · 记录扣量 ${quota.record_units || 0} · 解锁扣量 ${quota.unlock_units || 0}<br>现金费用为零时，套餐配额仍可能被消耗。</div>`;
  if (data.hunter_fallback) html += `<p class="hint">已补查 Hunter：${escape(({matches:"取得邮箱，仍须核对归属",no_matches:"未找到邮箱",failed:"本次补查未完成"})[data.hunter_fallback.status] || "状态未知")}；积分消耗 ${escape(data.hunter_fallback.credits_used ?? "未回传")}，不等于人民币账单。</p>`;
  if (data.search_target) html += `<p class="notice">目标岗位：${escape(({procurement:"采购 / 寻源 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发",engineering:"技术 / 工程"})[data.search_target] || data.search_target)} · Hunter 积分 ${escape(data.credits_used ?? "未回传")}；岗位匹配不等于已确认采购权限。</p>`;
  if (data.kind === "contacts") {
    html += `<h3>${escape(data.subject?.name || "所选主体")}</h3><p>${escape((data.subject?.titles || []).join(" / "))}</p><p class="hint">有效性为上游标记，取得时间不等于验证时间；任职、企业归属与当前采购需求仍须核实。</p>`;
    html += providerEvidenceHTML(data,"buyer");
    html += records.length ? `<form id="directory-save-contact" data-extension="directory"><label>保存到客户<select name="prospect_id" id="directory-prospect-select"><option value="">选择已保存客户</option></select></label><label class="check"><input type="checkbox" name="reviewed" required />已核对企业归属与联系用途；仅保存独立候选，不替换客户主联系方式</label><button type="submit">保存候选联系人</button></form>` : '<p class="notice">本次没有返回具体联系方式。不会把邮箱库存数当作补全成功。</p>';
  } else {
    const people = data.kind === "people";
    html += `<p class="hint">${people ? "人物国家与雇主国家可能不同；职位按上游原文展示。" : "企业库记录不是当前采购需求。请先看地址与公司身份，再解锁。"}</p>`;
    for (const record of records) {
      const count = record.contact_inventory || {};
      html += `<article class="lead"><b>${escape(record.name)}</b><p>${escape(record.company_name || "")} · ${escape(record.country || "国家未知")}</p><p>${escape((record.titles || []).join(" / "))}</p>${record.title_match === false ? '<p class="hint">返回岗位与职位词未直接匹配，需复核</p>' : ""}<p>${escape((record.addresses || []).join("；"))}</p><p class="hint">规模 ${escape(record.employee_range || "未知")} · 邮箱库存 ${count.email_num ?? "未知"} · 电话库存 ${count.phone_num ?? "未知"} · 社媒库存 ${count.social_num ?? "未知"}</p><div class="actions">${people ? `<button data-directory-save-person="${escape(record.record_id)}">已核对归属，保存岗位候选</button>` : `<button data-directory-people="${escape(record.record_id)}">查这家公司的人员</button><button data-directory-save-company="${escape(record.record_id)}">保存为待核实客户</button>`}</div><label class="check"><input type="checkbox" data-directory-unlock-confirm="${escape(record.record_id)}" />同意单个主体最多预占50数据点（¥0.50预算），另加平台点数</label><button data-directory-unlock="${escape(record.record_id)}">解锁所选主体联系方式</button></article>`;
    }
    if (!records.length) html += '<p class="notice">本页未查到记录。可以调整名称或筛选；不会自动放宽条件产生额外费用。</p>';
    if (data.has_more) html += '<label class="check"><input id="directory-next-confirm" type="checkbox" />同意下一页的150数据点预占及平台点数</label><button id="directory-next">查询下一页</button>';
  }
  return html;
}

function leadEnrichmentHTML(lead) {
  const status = {ambiguous_company:"存在同名主体，未自动解锁，请单独核对",no_exact_company:"未找到唯一同名同国家主体，可单独查询核对",contacts_empty:"已查询，但上游未返回具体联系方式",contacts_returned:"已补充企业联系入口，保存前请核对主体"}[lead.enrichment_status];
  const assessment = lead.assessment;
  const reviewed = assessment ? `<details><summary>查看 AI 证据复核（仍须核实）</summary><p>${escape(assessment.explanation || "")}</p>${[["role","客户角色"],["product","产品"],["country","市场"]].map(([axis,label]) => `<p>${label}：${escape(({fit:"符合",not_fit:"不符合",unknown:"依据不足"})[assessment[axis+"_fit"]] || "依据不足")}</p>${assessment[axis+"_quote"] ? `<blockquote>${escape(assessment[axis+"_quote"])}</blockquote>` : ""}`).join("")}</details>` : "";
  const targeted = lead.targeted_contact_status ? `<p class="hint">AI增强目标岗位：${escape(lead.targeted_contacts?.search_target || "采购")} · ${escape(({matches:"已找到岗位候选，任职与权限仍须核实",no_target_matches:"未找到目标岗位"})[lead.targeted_contact_status] || lead.targeted_contact_status)}</p>` : "";
  return reviewed + targeted + (status ? `<p class="hint">${escape(status)}</p>` : "") + (lead.business_contacts?.records?.length ? `<details><summary>查看已补充的 ${lead.business_contacts.records.length} 项联系信息</summary>${providerEvidenceHTML(lead.business_contacts,"buyer")}</details>` : "");
}

async function openDirectory(name, country="", selection=null, target=null, preferredTitles="") {
  directorySelection = selection;
  directoryTarget = target;
  directoryPreferredTitles = preferredTitles;
  const form = $("#directory-form");
  form.reset();
  form.elements.company_name.value = name;
  form.elements.country.value = /^[A-Z]{2}$/.test(country) ? country : "";
  form.elements.kind.value = selection ? "people" : "company";
  form.elements.titles.value = preferredTitles;
  const selected = $("#directory-selected");
  selected.hidden = !selection;
  selected.textContent = selection ? `已选企业：${name}；人员查询将限定这条企业记录。` : "";
  const quote = state.pointQuotes?.[selection ? "directory_people" : "directory_companies"];
  $("#directory-price").textContent = quote ? `本页共预占 ${quote.total_points} 点：平台 ${quote.platform_points}，数据 ${quote.data_points}。` : "";
  await switchTab("directory");
}

async function renderDiscoveryFeedback(jobId) {
  const legacy = await api(root()+`/discovery/feedback/${jobId}`);
  let current=[];
  try { current=await api(root()+`/crm/workbench/preview-feedback/${jobId}`); }
  catch(error) { if(error.status!==404 && error.status!==503) throw error; }
  const rows = [...new Map([...legacy,...current].map(row=>[row.lead_index,row])).values()];
  if (state.selectedJob !== jobId) return;
  for (const row of rows) {
    const target = $(`#lead-feedback-${row.lead_index}`);
    if (target) target.textContent = ({fit:"已标记符合画像",not_fit:"已标记不匹配，后续相同画像将排除",unreviewed:"反馈已撤销"})[row.verdict];
  }
}

async function renderSavedDirectoryContacts(prospectId) {
  const rows = await api(root()+`/directory/saved-contacts/${prospectId}`);
  if (state.selectedProspect?.id !== prospectId) return;
  const target = $("#saved-directory-contacts");
  if (!target) return;
  target.innerHTML = `<h3>企业与人物联系方式（${rows.length} 组）</h3>`+rows.map(row=>`<article class="lead"><b>${escape(row.name)}</b><p>${escape(row.titles.join(" / ") || "企业通用入口")}</p>${providerEvidenceHTML({records:row.channels},"buyer")}<button data-job="${escape(row.source_job_id)}">查看来源任务</button><p class="hint">取得于 ${escape(date(row.observed_at))}；上游有效性标记不等于本系统独立验证。</p></article>`).join("");
}

async function loadDirectoryProspects(jobId) {
  const select = $("#directory-prospect-select");
  if (!select) return;
  const page = await api(root()+"/crm/prospects?limit=200");
  if (state.selectedJob !== jobId) return;
  select.innerHTML = '<option value="">选择已保存客户</option>'+page.items.map(row=>`<option value="${escape(row.id)}" ${row.id===directoryTarget ? "selected" : ""}>${escape(row.name)} · ${escape(row.location)}</option>`).join("");
}

document.addEventListener("submit", event=> {
  const form = event.target;
  if (form.dataset.extension !== "directory") return;
  event.preventDefault();
  void runAction($("button[type=submit]",form),async()=> {
    const data = formData(form);
    if (form.id === "targeted-contact-form") {
      if (!form.elements.paid.checked || !form.elements.reviewed.checked) throw new Error(errors.paid_confirmation_required);
      const payload = {company_name:data.company_name.trim(),website:data.website.trim(),contact_target:data.contact_target,
        contact_titles:data.contact_titles.split(/[,，]/).map(x=>x.trim()).filter(Boolean),confirm_paid:true,confirm_company_match:true};
      await directorySubmit("/directory/targeted-contacts",payload,"targeted");
    } else if (form.id === "directory-form") {
      if (!form.elements.paid.checked) throw new Error(errors.paid_confirmation_required);
      const payload = {kind:data.kind,require_email:form.elements.require_email.checked,confirm_paid:true};
      for (const key of ["company_name","website","country","product"]) if (data[key]) payload[key] = data[key].trim();
      if (data.kind === "people") {
        payload.titles = data.titles.split(/[,，]/).map(x=>x.trim()).filter(Boolean);
        if (directorySelection) Object.assign(payload,{company_match_job_id:directorySelection.jobId,company_record_id:directorySelection.recordId});
      }
      await directorySubmit("/directory/searches",payload,"search");
    } else if (form.id === "trade-form") {
      if (!form.elements.paid.checked) throw new Error(errors.paid_confirmation_required);
      const payload = {confirm_paid:true};
      for (const key of ["product","hs_code","buyer","buyer_country","origin_country","arrival_country","date_start","date_end"]) if (data[key]) payload[key] = data[key];
      await directorySubmit("/directory/trades",payload,"trade");
    } else if (form.id === "directory-save-contact") {
      if (!data.prospect_id || !form.elements.reviewed.checked) throw new Error("请选择客户并核对企业归属");
      await api(root()+"/crm/workbench/candidates",{method:"POST",body:JSON.stringify({job_id:state.selectedJob,prospect_id:data.prospect_id,confirm_company_match:true})});
      await switchTab("customers");
      await selectProspect(data.prospect_id);
      toast("已保存独立候选，客户主邮箱保持原样");
    }
  });
});

document.addEventListener("click",event=> {
  const button = event.target.closest("button");
  if (!button) return;
  const dataset = button.dataset;
  if (button.id === "directory-reset") {
    directorySelection = null; $("#directory-selected").hidden = true;
  }
  if (button.id === "discovery-preview") void runAction(button,async()=> {
    const configuration = directoryConfiguration();
    if (configuration) await directorySubmit("/discovery/preview",configuration,"preview");
  });
  if (dataset.targetedProspect) void runAction(button,async()=> {
    const id = dataset.targetedProspect === "selected" ? state.selectedProspect?.id : dataset.targetedProspect;
    const row = await api(root()+"/crm/prospects/"+encodeURIComponent(id));
    directoryTarget = row.id;
    await switchTab("directory");
    const form = $("#targeted-contact-form"); form.reset();
    form.elements.company_name.value = row.name; form.elements.website.value = row.website || "";
    form.scrollIntoView({block:"center"}); form.elements.website.focus();
  });
  if (dataset.directoryProspect !== undefined) void runAction(button,async()=> {
    const row = state.selectedProspect;
    await openDirectory(row.name,row.location,null,row.id);
  });
  if (dataset.directoryLead !== undefined) void runAction(button,async()=> {
    const row = JSON.parse($("#job-detail").dataset.job).result.leads[Number(dataset.directoryLead)];
    await openDirectory(row.name,row.location);
  });
  if (dataset.leadFeedback) void runAction(button,async()=> {
    const code = $("#feedback-reason-code")?.value || "other";
    const reason = $("#feedback-reason")?.value || "";
    await api(root()+"/crm/workbench/preview-feedback",{method:"POST",body:JSON.stringify({job_id:state.selectedJob,lead_index:Number(dataset.leadIndex),verdict:dataset.leadFeedback,reason_code:code,reason})});
    await renderDiscoveryFeedback(state.selectedJob);
  });
  const recordId = dataset.directoryPeople || dataset.directoryUnlock || dataset.directorySaveCompany || dataset.directorySavePerson;
  if (recordId) void runAction(button,async()=> {
    const job = JSON.parse($("#job-detail").dataset.job);
    const record = job.result.directory.records.find(x=>x.record_id===recordId);
    if (!record) throw new Error("请刷新任务后选择记录");
    if (dataset.directoryPeople) await openDirectory(record.name,"",{jobId:job.id,recordId},directoryTarget,directoryPreferredTitles);
    if (dataset.directorySavePerson) {
      if (!directoryTarget) throw new Error("请先从客户工作台选择企业，再查询和保存岗位候选");
      await api(root()+"/crm/workbench/people-candidates",{method:"POST",body:JSON.stringify({job_id:job.id,record_id:recordId,prospect_id:directoryTarget,confirm_company_match:true})});
      toast("已保存岗位候选，尚未取得邮箱；现有客户档案保持原样");
    }
    if (dataset.directorySaveCompany) {
      const saved = await api(root()+"/directory/save-company",{method:"POST",body:JSON.stringify({job_id:job.id,record_id:recordId})});
      directoryTarget = saved.prospect_id;
      toast("已存入客户管线；解锁后可选择此客户保存联系人");
    }
    if (dataset.directoryUnlock) {
      const checked = Array.from(document.querySelectorAll("[data-directory-unlock-confirm]")).find(x=>x.dataset.directoryUnlockConfirm===recordId)?.checked;
      if (!checked) throw new Error(errors.paid_confirmation_required);
      await directorySubmit("/directory/contacts",{job_id:job.id,record_id:recordId,confirm_paid:true},"unlock");
    }
  });
  if (button.id === "directory-next") void runAction(button,async()=> {
    if (!$("#directory-next-confirm").checked) throw new Error(errors.paid_confirmation_required);
    await directorySubmit("/directory/searches",{continuation_job_id:state.selectedJob,confirm_paid:true},"next");
  });
  if (button.id === "trade-next") void runAction(button,async()=> {
    if (!$("#trade-next-confirm").checked) throw new Error(errors.paid_confirmation_required);
    await directorySubmit("/directory/trades",{continuation_job_id:state.selectedJob,confirm_paid:true},"trade-next");
  });
});
