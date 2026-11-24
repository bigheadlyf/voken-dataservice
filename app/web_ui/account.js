"use strict";
// Account, intake, billing and reviewed-mail panels share the existing tenant-aware API client.
let accountWorkspace = null;
let companyProposal = null;
let billingCatalog = null;
const profileLabels = {
  name: "企业名称",
  website: "网站",
  industry: "行业",
  description: "企业介绍",
  products: "主营产品",
  advantages: "优势",
  target_markets: "目标市场",
  sales_boundaries: "销售边界",
  contact_details: "联系信息",
};
Object.assign(errors, {
  invalid_current_password: "当前密码不正确，请重新输入；现有登录仍有效",
  billing_quote_changed: "报价或优惠已变化，请刷新套餐后重新选择",
  wechat_not_configured: "微信商户参数尚未配置，当前不能发起真实支付",
  payment_checkout_requires_query:
    "该订单下单状态待核对，请先查询支付结果；未支付时可关闭后重新建单",
  payment_checkout_in_progress: "微信下单仍在处理，请等待结果后再关单",
  wechat_checkout_unknown: "下单状态待核对，请先查询支付结果，不要重复付款",
  wechat_order_not_exist: "微信暂未查到订单；到期前保留待核对状态，请稍后查询",
  wechat_signature_invalid: "支付响应验签失败，未确认到账，请联系运营人员核对",
  billing_order_checkout_locked: "已有微信支付订单，请使用关闭微信订单",
  billing_terms_required: "请先核对套餐权益并勾选确认",
  billing_pending_order_limit: "待付款订单较多，请先取消不需要的订单",
  billing_order_not_pending: "订单已结算或取消，请刷新查看",
  company_profile_incomplete: "请先保存企业名称，以及官网或主营产品",
  company_confirmation_required: "请先勾选企业资料真实性声明",
  company_memory_key_conflict:
    "已有同名共享记忆。可在资料表单中手动保存所需字段，避免覆盖旧记忆。",
  company_website_has_no_readable_text: "该页面没有可读取正文，可改用介绍文件",
  invalid_company_website_analysis: "已读取网页，但未能生成带原文引文的企业资料。可重试或上传介绍文件",
  smtp_not_configured: "自有邮箱通道未启用，仍可下载 .eml 后自行发送",
  smtp_daily_limit: "已达到今日发送限额",
  delivery_recipient_changed: "客户联系方式已改变，请重新审阅收件人",
  draft_already_submitted_for_delivery:
    "此草稿已有发送记录，请先核对状态，系统不会自动重复发送",
  delivery_confirmation_required: "请先核对收件人、正文和页脚，再确认发送",
});

function resetAccountPanels() {
  accountWorkspace = state.session?.workspace_id || null;
  companyProposal = null;
  billingCatalog = null;
  if ($("#billing-status")) $("#billing-status").hidden = true;
  for (const id of [
    "company-proposal",
    "company-candidates",
    "company-certification",
    "billing-plans",
    "billing-note",
    "billing-checkout",
    "billing-orders",
    "memberships",
    "mail-deliveries",
  ])
    $("#" + id)?.replaceChildren();
  for (const id of [
    "company-name-form",
    "company-website-form",
    "company-upload-form",
    "password-change-form",
    "login-form",
    "register-form",
    "reset-form",
  ])
    $("#" + id)?.reset();
}
async function extensionRefresh() {
  if (accountWorkspace !== state.session?.workspace_id) resetAccountPanels();
  if (state.tab === "company") await loadCertification();
  if (state.tab === "costs") await loadBilling();
  if (state.tab === "mail") await loadDeliveries();
}
function proposalHTML(row) {
  companyProposal = row;
  $("#company-proposal").innerHTML =
    `<hr><h3>待审阅草案</h3><p class="hint">${escape(row.filename)} · ${row.source?.type === "website" ? "网站公开内容，未验证域名所有权" : "来自上传文件的陈述，未独立核实"}</p>${Object.entries(
      row.proposal.profile,
    )
      .filter(([, v]) => v)
      .map(
        ([key, value]) =>
          `<article class="lead"><b>${escape(profileLabels[key] || key)}</b><p>${escape(value)}</p><blockquote>${escape(row.proposal.profile_evidence[key] || "")}</blockquote></article>`,
      )
      .join(
        "",
      )}<p class="hint">另有 ${row.proposal.memories.length} 项待核实的业务记忆</p><button data-apply-company="${row.id}" type="button" class="primary">采用资料和记忆</button>`;
}
async function loadCertification() {
  const row = await api(root() + "/company/certification");
  const labels = {
    incomplete: "待完善资料",
    needs_confirmation: "资料待确认",
    confirmed: "本版本资料已由用户确认",
  };
  $("#company-certification").innerHTML =
    `<h3>${labels[row.status]}</h3><p>资质与域名所有权未核验</p>${row.confirmed_at ? `<p class="hint">确认于 ${escape(date(row.confirmed_at))}</p>` : ""}${row.status !== "confirmed" ? `<form id="company-confirm-form" data-extension="true"><input name="expected_version" type="hidden" value="${row.profile_version}"><label class="check"><input name="confirm_accuracy" type="checkbox" required>我确认这些资料准确，并有权代表企业提供。</label><button type="submit" ${row.status === "incomplete" ? "disabled" : ""}>确认当前版本企业资料</button></form>` : ""}`;
}
const money = (fen) => `¥${(fen / 100).toFixed(2)}`;
async function loadBilling() {
  const [catalog, orders, members] = await Promise.all([
    api(root() + "/billing/plans"),
    api(root() + "/billing/orders"),
    api(root() + "/billing/memberships"),
  ]);
  billingCatalog = catalog;
  $("#billing-note").textContent = catalog.note;
  $("#billing-status").hidden = catalog.checkout_available;
  $("#billing-plans").innerHTML = catalog.plans
    .map(
      (plan) =>
        `<article class="plan-card ${plan.plan_id === "svip_annual" ? "featured" : ""}"><h3>${escape(plan.name)}</h3><strong>${money(plan.total_fen)}</strong>${plan.discount_fen ? `<p class="hint"><s>${money(plan.list_fen)}</s> · 已减 ${money(plan.discount_fen)}</p>` : ""}<p>立即到账 ${plan.points_now.toLocaleString()} 点${plan.periods ? `<br>每会员月手动领取 ${plan.monthly_points.toLocaleString()} 点 × ${plan.periods}<br>合计 ${plan.total_points.toLocaleString()} 点` : ""}</p>${plan.periods ? copyHelp("会员领取规则", "会员不自动续费。每月点数需手动领取，逾期不补。") : ""}<button data-buy-plan="${escape(plan.plan_id)}" type="button">选择套餐</button></article>`,
    )
    .join("");
  $("#billing-orders").innerHTML =
    orders
      .map(
        (row) =>
          `<article class="lead"><b>${escape(row.quote.name)} · ${money(row.total_fen)}</b><p>${escape({ awaiting_payment: "待付款", paid: "已到账", expired: "已过期", cancelled: "已取消" }[row.status] || row.status)} · ${escape(date(row.created_at))}</p><p class="hint">订单号 ${escape(row.id)}</p>${["awaiting_payment", "expired"].includes(row.status) && row.payment_state && row.payment_state !== "closed" ? `<button data-payment-refresh="${row.id}" type="button">查询支付结果</button> <button data-payment-close="${row.id}" type="button">关闭微信订单</button>` : row.status === "awaiting_payment" ? `${catalog.checkout_available ? `<button data-native-checkout="${row.id}" type="button">微信扫码付款</button> ` : ""}<button data-cancel-order="${row.id}" type="button">取消订单</button>` : ""}</article>`,
      )
      .join("") || "<p class='hint'>暂无充值或会员订单。</p>";
  $("#memberships").innerHTML =
    members
      .map(
        (row) =>
          `<article class="lead"><b>${escape(row.plan_id === "svip_annual" ? "SVIP 包年" : "SVIP 包月")}</b><p>${escape(date(row.starts_at))} 至 ${escape(date(row.ends_at))}</p><p>${row.current_period === null ? "未生效或已到期" : `当前会员月 ${row.current_period + 1} · ${row.monthly_points.toLocaleString()} 点`}</p>${row.claimable ? `<button data-claim-member="${row.id}" type="button">领取本会员月点数</button>` : `<p class="hint">${row.already_claimed ? "本会员月已领取" : "当前不能领取"}</p>`}</article>`,
      )
      .join("") ||
    "<p class='hint'>暂无会员</p>";
}
async function loadDeliveries() {
  const rows = await api(root() + "/mail/deliveries");
  const names = {
    queued: "待发送",
    sending: "正在提交",
    accepted: "SMTP 已接受，未证明进入收件箱",
    rejected: "提交失败",
    unknown: "接收状态不明，请核对邮箱服务商后再操作",
    cancelled: "已取消",
  };
  $("#mail-deliveries").innerHTML =
    rows
      .map(
        (row) =>
          `<article class="lead"><b>${escape(row.subject)}</b><p>${escape(row.recipient)} · ${escape(names[row.status] || row.status)}</p><p class="hint">${escape(date(row.created_at))}<br>Message-ID：${escape(row.message_id)}</p>${row.status === "queued" ? `<button type="button" data-cancel-delivery="${row.id}">取消待发送邮件</button>` : ""}</article>`,
      )
      .join("") ||
    "<p class='hint'>还没有 SMTP 发送记录。下载草稿后手动发送不会出现在这里，可在客户档案补记。</p>";
  const delivery = rows.find((row) => row.draft_job_id === state.selectedJob);
  if (delivery && $("#draft-delivery-status"))
    $("#draft-delivery-status").textContent =
      `邮件状态：${names[delivery.status] || delivery.status}。详情见下方发送记录。`;
  return rows;
}
async function renderMailReview(job) {
  const deliveries = await loadDeliveries();
  if (deliveries.some((row) => row.draft_job_id === job.id)) {
    $("#job-detail").insertAdjacentHTML("beforeend",
      '<div class="notice">已有发送记录，请查看状态。</div>');
    return;
  }
  const channel = await api(root() + "/mail/channel");
  if (!channel.enabled) {
    $("#job-detail").insertAdjacentHTML(
      "beforeend",
      '<p class="hint">邮箱未配置，可下载 .eml 发送。</p>',
    );
    return;
  }
  if (channel.transport_mode === "local_capture") {
    $("#job-detail").insertAdjacentHTML("beforeend",
      '<div class="notice">测试通道，不会实际发送。</div>');
    return;
  }
  const prospect = await api(
    root() + "/crm/prospects/" + job.result.draft.prospect_id,
  );
  if (prospect.do_not_contact) {
    $("#job-detail").insertAdjacentHTML("beforeend",
      '<div class="notice">客户已拒绝联系，无法发送。</div>');
    return;
  }
  $("#job-detail").insertAdjacentHTML(
    "beforeend",
    `<hr><h3>通过自有邮箱发送</h3><form id="mail-review-form" data-extension="true"><input type="hidden" name="prospect_id" value="${prospect.id}"><input type="hidden" name="draft_job_id" value="${job.id}"><input type="hidden" name="expected_version" value="${prospect.version}"><p>发件人：${escape(channel.sender)} · 每日上限 ${channel.daily_limit} 封</p><label>收件人<input name="recipient" value="${escape(prospect.contact)}" type="email" readonly required></label><label>邮件主题<input name="subject" maxlength="200" value="${escape(job.result.draft.subject)}" required></label><label>审阅后的正文<textarea name="body" rows="10" maxlength="6000" required>${escape(job.result.draft.body)}</textarea></label><p>固定发送页脚：</p><blockquote>${escape(channel.footer)}</blockquote><label class="check"><input name="confirm_send" type="checkbox" required>我已核对收件人、联系理由、正文和页脚，确认提交这封邮件。</label><button type="submit" class="primary" ${prospect.do_not_contact ? "disabled" : ""}>确认并提交发送</button>${copyHelp("发送状态说明", "SMTP 接收只表示服务器接受邮件。发送状态不明时不会自动重发。")}</form>`,
  );
}
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.dataset.extension !== "true") return;
  event.preventDefault();
  void runAction($("button[type=submit]", form), async () => {
    const data = formData(form);
    if (form.id === "reset-form") {
      await api("/api/v1/auth/password-reset", {
        method: "POST",
        body: JSON.stringify(data),
      });
      form.reset();
      toast("密码已重置，请使用新密码登录。");
    } else if (form.id === "password-change-form") {
      await api("/api/v1/auth/password-change", {
        method: "POST",
        body: JSON.stringify(data),
      });
      state.session = null;
      saveSession();
      clearWorkspaceView();
      $("#workspace").hidden = true;
      $("#auth").hidden = false;
      toast("密码已更新，所有设备需重新登录。");
    } else if (form.id === "company-name-form") {
      const rows = await api(root() + "/company/website-candidates", {
        method: "POST",
        body: JSON.stringify(data),
      });
      $("#company-candidates").innerHTML =
        rows
          .map(
            (row) =>
              `<article class="lead"><b>${escape(row.title)}</b><p>${escape(row.summary)}</p>${safeLink(row.url)}<br><button type="button" data-company-site="${escape(row.url)}">这是我的企业官网</button></article>`,
          )
          .join("") ||
        "<p class='hint'>未找到候选，可直接提供官网或上传文件。</p>";
    } else if (form.id === "company-website-form") {
      proposalHTML(
        await api(root() + "/company/web-analyses", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      );
    } else if (form.id === "company-upload-form") {
      const file = form.elements.file.files[0];
      if (file.size > 50 * 1024 * 1024) throw new Error("文件超过 50 MiB");
      const upload = new FormData();
      upload.set("file", file);
      proposalHTML(
        await api(root() + "/company/document-analyses", {
          method: "POST",
          body: upload,
        }),
      );
    } else if (form.id === "company-confirm-form") {
      await api(root() + "/company/certification/confirm", {
        method: "POST",
        body: JSON.stringify({
          expected_version: Number(data.expected_version),
          confirm_accuracy: Boolean(data.confirm_accuracy),
          statement: "我确认这些资料准确，并有权代表企业提供。",
        }),
      });
      await loadCertification();
      toast("本版本企业资料已确认。");
    } else if (form.id === "billing-order-form") {
      const payload = {
        plan_id: data.plan_id,
        expected_total_fen: Number(data.expected_total_fen),
        accept_terms: Boolean(data.accept_terms),
      };
      const slot = "voken-order-" + state.session.workspace_id;
      const row = await api(root() + "/billing/orders", {
        method: "POST",
        headers: { "Idempotency-Key": pendingSubmission(slot, payload) },
        body: JSON.stringify(payload),
      });
      clearSubmission(slot);
      $("#billing-checkout").innerHTML =
        `<div class="notice">已创建待付款订单 ${escape(row.id)}，金额 ${money(row.total_fen)}。${billingCatalog.checkout_available ? `请点击下方微信扫码付款按钮继续。<br><button data-native-checkout="${row.id}" type="button">微信扫码付款</button>` : "支付通道尚未配置，未扣款、未到账。"}</div>`;
      await loadBilling();
    } else if (form.id === "mail-review-form") {
      const payload = {
        draft_job_id: data.draft_job_id,
        expected_version: Number(data.expected_version),
        recipient: data.recipient,
        subject: data.subject,
        body: data.body,
        confirm_send: Boolean(data.confirm_send),
      };
      const slot = "voken-delivery-" + state.session.workspace_id;
      await api(root() + `/crm/prospects/${data.prospect_id}/deliveries`, {
        method: "POST",
        headers: { "Idempotency-Key": pendingSubmission(slot, payload) },
        body: JSON.stringify(payload),
      });
      clearSubmission(slot);
      await switchTab("mail");
      $("#mail-deliveries").closest("details").open = true;
      form.replaceWith(
        Object.assign(document.createElement("p"), {
          textContent: "已提交单封邮件，请在发送记录核对结果。不要重复提交。",
        }),
      );
      toast("已提交发送队列。");
    }
  });
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.id === "reset-code")
    void runAction(button, async () => {
      const form = $("#reset-form");
      const row = await api("/api/v1/auth/verification-codes", {
        method: "POST",
        body: JSON.stringify({ phone: form.elements.phone.value }),
      });
      form.elements.challenge_id.value = row.challenge_id;
      toast("验证码已发送，请查看短信。");
    });
  if (button.dataset.companySite) {
    $("#company-website-form [name=website]").value =
      button.dataset.companySite;
    toast("已选择官网，请点击读取官网生成草案。");
  }
  if (button.dataset.applyCompany)
    void runAction(button, async () => {
      await api(
        root() +
          `/company/document-analyses/${button.dataset.applyCompany}/apply`,
        { method: "POST" },
      );
      await loadCompany();
      await loadCertification();
      $("#company-proposal").replaceChildren();
      toast("已采用草案，请核对后确认企业资料。");
    });
  if (button.dataset.buyPlan) {
    const plan = billingCatalog.plans.find(
      (row) => row.plan_id === button.dataset.buyPlan,
    );
    $("#billing-checkout").innerHTML =
      `<form id="billing-order-form" data-extension="true"><h3>${escape(plan.name)} · ${money(plan.total_fen)}</h3><input name="plan_id" type="hidden" value="${escape(plan.plan_id)}"><input name="expected_total_fen" type="hidden" value="${plan.total_fen}"><label class="check"><input name="accept_terms" type="checkbox" required>我已核对价格、立即到账与每月领取的点数；本套餐不自动续费。</label><button type="submit">创建待付款订单</button></form>`;
  }
  if (button.dataset.nativeCheckout)
    void runAction(button, async () => {
      const row = await api(
        root() + `/billing/orders/${button.dataset.nativeCheckout}/checkout`,
        { method: "POST" },
      );
      $("#billing-checkout").innerHTML =
        `<div class="notice"><h3>微信扫一扫付款 · ${money(row.order.total_fen)}</h3><img src="${escape(row.qr_data_url)}" width="260" height="260" alt="本订单微信 Native 支付二维码"><p>有效至 ${escape(date(row.order.expires_at))}，以服务端确认到账为准。</p><button type="button" data-payment-refresh="${row.order.id}">已付款，查询结果</button></div>`;
      await loadBilling();
    });
  if (button.dataset.paymentRefresh)
    void runAction(button, async () => {
      const row = await api(
        root() + `/billing/orders/${button.dataset.paymentRefresh}/refresh`,
        { method: "POST" },
      );
      if (row.status === "paid")
        $("#billing-checkout").textContent =
          "服务端已确认支付，点数或会员权益已到账。";
      else toast("尚未确认支付成功，请稍后查询。");
      await loadGlobal();
      await loadBilling();
    });
  if (button.dataset.paymentClose)
    void runAction(button, async () => {
      await api(
        root() + `/billing/orders/${button.dataset.paymentClose}/close`,
        { method: "POST" },
      );
      $("#billing-checkout").replaceChildren();
      await loadBilling();
      toast("微信订单已关闭。");
    });
  if (button.dataset.cancelOrder)
    void runAction(button, async () => {
      await api(
        root() + `/billing/orders/${button.dataset.cancelOrder}/cancel`,
        { method: "POST" },
      );
      await loadBilling();
    });
  if (button.dataset.claimMember)
    void runAction(button, async () => {
      await api(
        root() + `/billing/memberships/${button.dataset.claimMember}/claims`,
        { method: "POST" },
      );
      await loadGlobal();
      await loadBilling();
      toast("本会员月点数已到账。");
    });
  if (button.dataset.cancelDelivery)
    void runAction(button, async () => {
      await api(
        root() + `/mail/deliveries/${button.dataset.cancelDelivery}/cancel`,
        { method: "POST" },
      );
      await loadDeliveries();
    });
});
