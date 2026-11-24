"use strict";
const wb = {workspace:null, offset:0, total:0, items:[], views:[], products:[], cohorts:null, preview:null, capabilities:{}, selected:new Set(), generation:0};
const wbVerification = {valid:"独立验证有效",invalid:"无效／不应联系",catch_all:"全收域，不能确认",unknown:"未知",unverified:"尚未独立验证"};
const wbWarnings = {email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务／质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"};
Object.assign(errors, {email_verification_not_configured:"尚未配置独立邮箱验证服务，现有供应商标记保持原样", email_verification_result_unknown:"验证服务未返回可确认结果，请先核对供应商记录，勿直接重复消费", verification_requires_reconciliation:"该次验证结果未确认，请核对供应商记录后再操作", email_verification_daily_limit:"已达到独立邮箱验证日上限", imap_not_configured:"尚未配置收件箱，可先导入 EML 邮件归档", imap_sync_failed:"收件箱同步失败，请核对服务配置", roster_pdf_requires_tabular_text_use_csv:"未识别到分列的 PDF 表格文本，请改用 CSV 或 XLSX", roster_limit_200_rows:"每批最多200行，请拆分名单", roster_formula_not_supported:"名单含公式，请先转成普通值", cohort_planning_failed:"本次未能生成客群方案，请稍后重试"});
function wbRoot() { return root()+"/crm/workbench"; }
function wbPreferredTitles() {
  return ({procurement:"procurement,purchasing,sourcing",leadership:"president,owner,founder",sales:"sales,business development"})[wbFilters().target] || "";
}
function wbFilters() {
  const f = $("#wb-filter"), values = formData(f);
  return {...values, has_email:f.elements.has_email.checked, due:f.elements.due.checked, ready_only:f.elements.ready_only.checked};
}
async function wbPost(path, data, slot=null) {
  const payload = JSON.stringify(data), keySlot = "wb-"+state.session.workspace_id+"-"+slot;
  const options = {method:"POST",body:payload};
  if (slot) options.headers = {"Idempotency-Key":pendingSubmission(keySlot,data)};
  const result = await api(wbRoot()+path,options);
  if (slot) clearSubmission(keySlot);
  return result;
}
function resetWorkbench() {
  wb.workspace=state.session?.workspace_id; wb.offset=0; wb.items=[]; wb.views=[]; wb.products=[];
  wb.cohorts=null; wb.preview=null; wb.selected.clear(); wb.generation++;
  wb.capabilities={};
  wb.loadedMode=null; wb.lastLoadedAt=null;
  for (const id of ["wb-list","wb-summary","wb-history","wb-tasks","wb-import-preview","wb-cohort-results","wb-inbox"])
    $("#"+id)?.replaceChildren();
  $("#wb-filter")?.reset(); $("#wb-view-name").value="";
  $("#wb-history").hidden=true;
  $("#wb-views").innerHTML='<option value="">选择视图</option>';
  $("#wb-products").replaceChildren();
  for(const id of ["wb-product","wb-cohorts","wb-followup","wb-upload","wb-eml"]) $("#"+id)?.reset();
  $("#wb-inbox-capability").textContent="";
}
function wbEmailHTML(c, index="") {
  const v=c.verification, attrs=`data-wb-pid="${escape(c.prospect_id)}" data-wb-email="${escape(c.email)}"`;
  return `<article class="wb-row"><div class="card-top"><b>${escape(c.name || "公共／岗位未知入口")}</b><span class="badge">${c.blocked?"停止联系":escape(c.next_action)}</span></div>
    <p>${escape(c.company)} · ${escape(c.titles.join(" / ") || "岗位未知")}</p><p>${escape(c.email || "暂无完整邮箱")}</p>
    <div class="wb-axes"><div><b>企业匹配</b><p>${escape(c.company_assessment?.status === "fit"?"人工评审符合":c.company_assessment?.status === "not_fit"?"人工评审不符合":"查看原始证据后核实")}</p></div>
    <div><b>岗位匹配</b><p>${escape(c.role_match.reason)}</p></div><div><b>邮箱验证</b><p>${escape(wbVerification[v.status] || "未知")}${v.stale?" · 已超过30天":""}</p><p class="hint">${v.checked_at?escape(date(v.checked_at)):"未取得独立验证时间"} · ${v.history_count} 次历史记录</p></div></div>
    ${c.warnings.length?`<p class="hint">${c.warnings.map(x=>escape(wbWarnings[x] || x)).join("；")}</p>`:""}
    <details><summary>查看 ${c.sources.length} 项来源与供应商原始标记</summary>${c.sources.map(s=>`<p>${escape(s.source)} · ${escape(date(s.observed_at))} ${safeLink(s.source_url)}${s.source_job_id?` <button data-job="${escape(s.source_job_id)}">来源任务</button>`:""}</p>`).join("")}<p class="hint">供应商标记：${c.supplier_observations.map(x=>escape(({1:"有效",2:"无效",3:"未知"})[x.validity] || "未提供")).join("、")}。不替代独立验证，不保证送达。</p></details>
    <div class="actions"><button data-wb-open="${escape(c.prospect_id)}">打开客户档案</button><button data-wb-history="${escape(c.prospect_id)}">评审／验证历史</button><button data-wb-record="${index}" ${attrs}>记录回复或退信</button></div>
    <label class="check"><input type="checkbox" data-wb-check="${escape(c.prospect_id+":"+c.email)}" ${(wb.capabilities.email_verification && c.email)?"":"disabled"}>同意将此邮箱交给 ZeroBounce 验证，消耗配置的供应商额度</label>
    <button data-wb-verify="true" ${attrs} ${(wb.capabilities.email_verification && c.email)?"":"disabled"}>${v.status==="unverified"?"验证邮箱":"重新验证并保留历史"}</button>
    ${(wb.capabilities.email_verification && c.email)?"":'<p class="hint">独立验证暂未配置，保留现有信息供人工核对。</p>'}</article>`;
}
async function loadWorkbench() {
  if (wb.workspace!==state.session?.workspace_id) resetWorkbench();
  const generation=++wb.generation;
  const params=new URLSearchParams({...wbFilters(),offset:wb.offset,limit:30});
  let page,views,products,caps,tasks,inbox;
  try {
    [page,views,products,caps,tasks,inbox]=await Promise.all([
      api(wbRoot()+"?"+params),api(wbRoot()+"/views"),api(wbRoot()+"/products"),api(wbRoot()+"/capabilities"),api(wbRoot()+"/followups"),api(wbRoot()+"/inbox")]);
  } catch(error) {
    if(error.status!==404 && error.status!==503) throw error;
    if(generation!==wb.generation) return;
    $("#wb-summary").innerHTML='客户工作台暂不可用，可继续使用客户档案。<button data-tab="customers">打开客户档案</button>';
    return;
  }
  if (generation!==wb.generation || state.tab!=="workbench") return;
  wb.items=page.items; wb.total=page.total; wb.views=views; wb.products=products; wb.capabilities=caps;
  const summary=page.summary, mode=$("#wb-filter").elements.mode.value;
  wb.loadedMode = mode;
  wb.lastLoadedAt = new Date().toISOString();
  if (window.__VOKEN_REACT__) window.__vokenWorkbenchSummary = summary;
  $("#wb-summary").textContent=`当前空间：${summary.companies}份企业档案 · ${summary.companies_with_email}份有完整邮箱 · ${summary.unique_mailboxes}个去重邮箱 · ${summary.target_role_contacts}条目标岗位关键词匹配 · ${summary.verified_mailboxes}个近期独立验证有效邮箱。疑似重复档案尚未合并。`;
  $("#wb-list").innerHTML=page.items.map((r,i)=>mode==="contacts"?`<label class="check"><input type="checkbox" data-wb-select="${escape(r.prospect_id)}" ${wb.selected.has(r.prospect_id)?"checked":""}>选择 ${escape(r.company)}</label>`+wbEmailHTML(r,String(i)):
    `<article class="wb-row"><div class="card-top"><label class="check"><input type="checkbox" data-wb-select="${escape(r.id)}" ${wb.selected.has(r.id)?"checked":""}><b>${escape(r.name)}</b></label><span class="badge">${r.blocked?"存在停止联系记录":escape(stages[r.stage])}</span></div>
    <p>${escape(r.country || "地区未知")} · ${r.contact_count}条联系入口 · ${r.email_count}个完整邮箱 · ${r.verified_count}个近期验证有效</p><p>企业匹配：${escape(({fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"})[r.assessment.status] || "依据不足")} · 下一步：${escape(r.next_action)}</p>
    ${r.duplicates.length?`<details><summary>疑似关联／重复档案 ${r.duplicates.length}份 · 尚未合并</summary>${r.duplicates.map(h=>`<p>${escape(h.name)}：${escape(h.reason)} <button data-wb-open="${escape(h.id)}">查看档案</button></p>`).join("")}</details>`:""}
    <div class="actions"><button data-wb-open="${r.id}">打开档案</button><button data-wb-enrich="${r.id}">查企业与目标岗位联系人</button><button data-wb-assess="${r.id}">记录企业匹配评审</button><button data-wb-history="${r.id}">查看历史</button></div>
    <details><summary>查看联系人与验证</summary>${r.contacts.map(c=>wbEmailHTML(c)).join("") || '<p class="hint">暂无完整邮箱。可先进行官网研究或按需查询联系人。</p>'}</details></article>`).join("") || '<p class="notice">没有符合条件的记录。可以放宽筛选，或先到客户档案保存企业。</p>';
  $("#wb-page").textContent=`${Math.floor(wb.offset/30)+1} / ${Math.max(1,Math.ceil(page.total/30))} · 共${page.total}条`;
  $("#wb-prev").disabled=wb.offset===0; $("#wb-next").disabled=wb.offset+30>=page.total;
  $("#wb-views").innerHTML='<option value="">选择视图</option>'+views.map((v,i)=>`<option value="${i}">${escape(v.data.name)}</option>`).join("");
  $("#wb-products").innerHTML='<option value="">选择产品</option>'+products.map(p=>`<option value="${p.id}">${escape(p.data.name)}</option>`).join("");
  $("#wb-tasks").innerHTML=tasks.filter(t=>!['done','stopped'].includes(t.status)).slice(0,50).map(t=>`<article class="wb-row"><b>${escape(t.company)}</b><p>${escape(date(t.data.due_at))} · ${t.status==="due"?"已到期":"待执行"}</p><p>${escape(t.data.objective)}</p><button data-wb-open="${t.prospect_id}">打开客户准备跟进</button><button data-wb-done="${t.id}">标记已完成</button></article>`).join("") || '<p class="hint">暂无待办</p>';
  $("#wb-inbox-capability").textContent=caps.imap?"同步最近 20 封邮件，不标记已读。":"收件箱未配置，可导入 .eml。";
  $("#wb-sync-inbox").disabled=!caps.imap;
  renderWbInbox(inbox);
}
function renderWbInbox(inbox) {
  $("#wb-inbox").innerHTML=inbox.map(r=>`<article class="wb-row"><b>${escape(r.data.subject || "无主题")}</b><p>${escape(r.data.senders.join("、"))}</p><pre>${escape(r.data.content)}</pre><form data-extension="workbench" data-wb-archive="${r.id}"><label>归档到客户ID<input name="prospect_id" required pattern="[0-9a-f]{32}" value="${escape(r.data.suggested_prospect_ids?.length===1?r.data.suggested_prospect_ids[0]:"")}"></label><label>事件关联邮箱（退信／拒绝联系时必填）<input name="email" type="email" maxlength="254"></label><label>事件<select name="type"><option value="reply">收到回复</option><option value="bounce">退信</option><option value="opt_out">拒绝联系</option><option value="note">普通备注</option></select></label><label class="check"><input name="confirmed" type="checkbox" required>已核对客户归属与事件类型</label><button type="submit">归档并记录</button></form></article>`).join("") || '<p class="hint">暂无待归档邮件。</p>';
}
async function renderWorkbenchContactDetails(prospectId) {
  const row=state.selectedProspect;
  let data;
  try { data=await api(wbRoot()+"?mode=contacts&q="+encodeURIComponent(row.name)+"&limit=100"); }
  catch(error) { if(error.status===404 || error.status===503) return; throw error; }
  if(state.selectedProspect?.id!==prospectId) return;
  const entries=data.items.filter(c=>c.prospect_id===prospectId);
  const target=$("#customer-detail");
  target.insertAdjacentHTML("beforeend",`<hr><h3>候选联系人与独立验证</h3><p class="hint">新增候选不替换主邮箱。完整筛选、验证和跟进请到客户工作台。</p>${entries.map(c=>`<p>${escape(c.name || "公共入口")} · ${escape(c.titles.join(" / "))}<br>${escape(c.email)} · ${escape(wbVerification[c.verification.status])}</p>`).join("") || '<p class="hint">暂无完整邮箱候选。</p>'}<button data-tab="workbench">进入客户工作台</button>`);
}
function wbRecordForm(pid,email) {
  const target=$("#wb-history"); target.hidden=false;
  target.innerHTML=`<h3>记录联系进展</h3><form id="wb-event" data-extension="workbench"><input name="prospect_id" type="hidden" value="${escape(pid)}"><p>${escape(email)}</p><label>事件关联邮箱（退信／拒绝联系时必填）<input name="email" type="email" maxlength="254" value="${escape(email)}"></label><label>事件<select name="type"><option value="reply">收到回复</option><option value="bounce">退信</option><option value="opt_out">拒绝联系</option><option value="meeting">会议</option><option value="note">备注</option></select></label><label>内容<textarea name="content" maxlength="4000" required></textarea></label><p class="hint">退信与拒绝联系会拦截该邮箱后续发送；记录保存在独立历史中。</p><button type="submit">保存事件</button></form>`;
  target.scrollIntoView?.({block:"start"});
}
async function renderDiscoveryDelta(jobId) {
  let data;
  try { data=await api(wbRoot()+"/discovery-delta/"+jobId); }
  catch(error) { if(error.status===404 || error.status===503) return; throw error; }
  if(state.selectedJob!==jobId) return;
  $("#job-detail").insertAdjacentHTML("beforeend",`<hr><h3>本轮新增</h3><p>对比${data.baseline_jobs}个相同画像历史任务：新企业${data.new_companies}家，新增邮箱涉及${data.companies_with_new_email}家。</p>${copyHelp("新增记录口径", "按企业名和地区比对，别名可能分开统计。记录新增不代表有采购需求。")}${data.items.map(r=>`<p>${escape(r.name)}：${escape(({new_company:"首次出现",new_email:"新增邮箱",seen_before:"历史已出现"})[r.status])}</p>`).join("")}`);
}
document.addEventListener("change",event=>{
  const el=event.target;
  if(el.dataset.wbSelect) { if(el.checked) wb.selected.add(el.dataset.wbSelect); else wb.selected.delete(el.dataset.wbSelect); }
  if(el.id==="wb-views" && el.value!=="") {
    const view=wb.views[Number(el.value)]?.data, form=$("#wb-filter"); if(!view) return;
    for(const [key,value] of Object.entries(view)) if(form.elements[key]) { if(typeof value==="boolean") form.elements[key].checked=value; else form.elements[key].value=value; }
    wb.offset=0; wb.selected.clear(); void runAction(el,loadWorkbench);
  }
});
document.addEventListener("click",event=>{
  const b=event.target.closest("button"); if(!b) return; const d=b.dataset;
  const relevant=b.id.startsWith("wb-") || Object.keys(d).some(k=>k.startsWith("wb")); if(!relevant || (b.form && b.type==="submit")) return;
  void runAction(b,async()=>{
    if(d.wbOpen) {
      if(window.voken) await window.voken.openCustomer(d.wbOpen);
      else { await switchTab("customers"); await selectProspect(d.wbOpen); }
    }
    if(d.wbEnrich) {
      const p=await api(root()+"/crm/prospects/"+d.wbEnrich);
      await openDirectory(p.name,p.location,null,p.id,wbPreferredTitles());
      toast("先核对企业，再查询目标岗位；付费查询需单独确认");
    }
    if(d.wbHistory) {
      const records=await api(wbRoot()+"/history/"+d.wbHistory), target=$("#wb-history"); target.hidden=false;
      target.innerHTML='<h3>评审、验证与跟进历史</h3>'+records.slice().reverse().map(r=>`<article class="lead"><b>${escape(({assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"})[r.kind] || r.kind)}</b><p>${escape(date(r.created_at))}</p><p>${escape(r.data.email || "")} ${escape(wbVerification[r.data.status] || r.data.status || r.data.type || "")}</p><p>${escape(r.data.reason || r.data.content || r.data.objective || "")}</p></article>`).join("");
    }
    if(d.wbAssess) {
      $("#wb-history").hidden=false; $("#wb-history").innerHTML=`<h3>记录企业匹配评审</h3><form id="wb-assess" data-extension="workbench"><input type="hidden" name="prospect_id" value="${d.wbAssess}"><label>判断<select name="status"><option value="fit">符合</option><option value="not_fit">不符合</option><option value="unknown">依据不足</option></select></label><label>理由与证据<textarea name="reason" maxlength="1000" required></textarea></label><button type="submit">新增评审记录</button></form>`;
    }
    if(d.wbRecord!==undefined) wbRecordForm(d.wbPid,d.wbEmail);
    if(d.wbVerify) {
      const check=Array.from(document.querySelectorAll("[data-wb-check]")).find(x=>x.dataset.wbCheck===d.wbPid+":"+d.wbEmail);
      if(!check?.checked) throw new Error("请先确认本次外部验证及供应商额度消耗");
      await wbPost("/verifications",{prospect_id:d.wbPid,email:d.wbEmail,confirm_external_check:true},"verify");
      await loadWorkbench(); toast("验证结果已作为新记录保存");
    }
    if(d.wbDone) { await wbPost("/followups/"+d.wbDone+"/complete",{}); await loadWorkbench(); }
    if(b.id==="wb-save-view") {
      const name=$("#wb-view-name").value.trim(); if(!name) throw new Error("请填写视图名称");
      await wbPost("/views",{...wbFilters(),name}); await loadWorkbench(); toast("筛选视图已保存");
    }
    if(b.id==="wb-prev" || b.id==="wb-next") { wb.offset=Math.max(0,wb.offset+(b.id==="wb-prev"?-30:30)); wb.selected.clear(); await loadWorkbench(); }
    if(b.id==="wb-sync-inbox") { const result=await wbPost("/inbox/sync",{}); await loadWorkbench(); toast(`同步新增${result.added}封待归档邮件`); }
    if(d.wbCohort!==undefined) {
      const result=wb.cohorts, c=result.cohorts[Number(d.wbCohort)], form=$("#discovery-form");
      form.reset(); form.elements.name.value=c.name.slice(0,80); form.elements.product.value=result.product;
      form.elements.market.value=result.market; form.elements.buyer_role.value=c.buyer_role; form.elements.target_count.value=5;
      form.elements.instructions.value=`${c.use_case}。筛选方向：${c.reason}。以上为客群假设，需来源核实。`;
      form.elements.exclude_keywords.value=c.exclusions.join("，"); form.elements.tier.value="basic"; form.elements.paid.checked=false;
      await switchTab("discover"); setDiscoveryMode("form"); updateDiscoveryPrice();
      $("#discovery-preview").scrollIntoView?.({block:"center"}); toast("已填入小批量画像，核对后点击预览；尚未创建任务");
    }
  });
});
document.addEventListener("submit",event=>{
  const form=event.target; if(form.dataset.extension!=="workbench") return;
  event.preventDefault(); void runAction($("button[type=submit]",form),async()=>{
    const data=formData(form);
    if(form.id==="wb-filter") { wb.offset=0; wb.selected.clear(); await loadWorkbench(); }
    if(form.id==="wb-assess") { await wbPost("/assessments",data); await loadWorkbench(); toast("已新增评审，原始证据保持原样"); }
    if(form.id==="wb-event") { await wbPost("/events",{...data,source:"user_recorded"},"event"); form.reset(); $("#wb-history").hidden=true; await loadWorkbench(); toast("事件已记录"); }
    if(form.id==="wb-followup") {
      if(!wb.selected.size) throw new Error("请先选择企业或联系人");
      await wbPost("/followups",{prospect_ids:[...wb.selected],due_at:new Date(data.due_at).toISOString(),intervals_days:data.intervals.split(/[,，]/).filter(x=>x.trim()).map(Number),objective:data.objective},"followup");
      wb.selected.clear(); await loadWorkbench(); toast("提醒已安排，未启用自动发送");
    }
    if(form.id==="wb-product") { await wbPost("/products",data); form.reset(); await loadWorkbench(); }
    if(form.id==="wb-cohorts") {
      wb.cohorts=await wbPost("/cohorts",data);
      $("#wb-cohort-results").innerHTML='<p class="hint">以下为客群假设；选定后先进行小批量预览。</p>'+wb.cohorts.cohorts.map((c,i)=>`<article class="wb-row"><b>${escape(c.name)}</b><p>${escape(c.use_case)}</p><p>${escape(c.reason)}</p><p>排除：${escape(c.exclusions.join("、") || "未设置")}</p><button data-wb-cohort="${i}" type="button">采用方向并准备预览</button></article>`).join("");
    }
    if(form.id==="wb-upload") {
      wb.preview=await api(wbRoot()+"/imports/preview",{method:"POST",body:new FormData(form)});
      const p=wb.preview.data;
      $("#wb-import-preview").innerHTML=`<h3>${escape(p.filename)} · ${p.items.length}行待确认</h3><form id="wb-import-commit" data-extension="workbench">${[["name","公司名称（必选）"],["location","国家／地区"],["website","官网"],["contact","邮箱"]].map(([k,label])=>`<label>${label}<select name="${k}" ${k==="name"?"required":""}><option value="">不映射</option>${p.columns.map(c=>`<option ${p.mapping[k]===c?"selected":""}>${escape(c)}</option>`).join("")}</select></label>`).join("")}<label>来源说明<input name="source_note" maxlength="1000" required></label><label>名单年份（选填）<input name="source_year" type="number" min="1900" max="2100"></label><label class="check"><input name="confirmed" type="checkbox" required>已核对字段及样本，同意仅新增客户，重复档案保持原样</label><button type="submit">确认导入</button></form><div class="wb-table-scroll"><table><thead><tr>${p.columns.map(c=>`<th>${escape(c)}</th>`).join("")}</tr></thead><tbody>${p.items.slice(0,10).map(row=>`<tr>${p.columns.map(c=>`<td>${escape(row[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    if(form.id==="wb-import-commit") {
      if(!form.elements.confirmed.checked) throw new Error("请先确认字段和来源");
      const result=await wbPost("/imports/commit",{preview_id:wb.preview.id,mapping:Object.fromEntries(["name","location","website","contact"].map(k=>[k,data[k]])),source_note:data.source_note,source_year:data.source_year?Number(data.source_year):null,confirm_import:true});
      $("#wb-import-preview").innerHTML=`<p>新增${result.created}，复用且未修改${result.reused}，不合格${result.invalid}。</p>${result.rows.filter(r=>r.status==="invalid").map(r=>`<p>第${r.line}行：${escape(r.reason)}</p>`).join("")}`;
      await loadWorkbench();
    }
    if(form.id==="wb-eml") { await api(wbRoot()+"/inbox/preview",{method:"POST",body:new FormData(form)}); renderWbInbox(await api(wbRoot()+"/inbox")); }
    if(form.dataset.wbArchive) {
      if(!form.elements.confirmed.checked) throw new Error("请先核对客户归属");
      await wbPost("/inbox/archive",{preview_id:form.dataset.wbArchive,prospect_id:data.prospect_id,type:data.type,email:data.email || "",confirm_relationship:true}); await loadWorkbench();
    }
  });
});
