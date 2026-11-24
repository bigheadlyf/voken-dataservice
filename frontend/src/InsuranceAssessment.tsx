import { useEffect, useRef, useState } from "react";
import {
  Alert, App, Button, DatePicker, Descriptions, Form, Input, InputNumber,
  Modal, Radio, Select, Tag, Typography, type DatePickerProps,
} from "antd";
import type { Bridge, CustomerChoice } from "./bridge";

const { Text, Title, Paragraph } = Typography;
const paymentLabels = {
  credit: "发货后收款 / 分期收款",
  prepaid: "发货前全额收款",
  overdue: "已超过约定付款日",
  unknown: "付款安排待确认",
};
const creditReasons = {
  first: "新买家首单",
  extension: "延长账期",
  newPayer: "付款主体变化",
  regular: "常规账期",
  unknown: "待确认",
};
const termStarts = { shipment: "发货", delivery: "签收", acceptance: "验收", invoice: "开票", other: "其他约定" };
const policyLabels = { insured: "已有出口信用险", none: "尚无出口信用险", unknown: "保障情况待确认" };
const limitLabels = { approved: "买方限额已获批", pending: "买方限额未获批", unknown: "买方限额待确认" };
const currencies = ["USD", "EUR", "CNY", "GBP", "HKD", "JPY", "SGD", "MYR", "AUD", "CAD"];
const officialGuide = "https://sx.sinosure.com.cn/mobile/dqckxybxjj/index.shtml";
const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

type Assessment = {
  payment?: keyof typeof paymentLabels;
  reason?: keyof typeof creditReasons;
  payer: string;
  orderAmount: number | null;
  paidAmount: number | null;
  advancePercent: number | null;
  currency: string;
  termDays: number | null;
  termStart?: keyof typeof termStarts;
  policy?: keyof typeof policyLabels;
  limit?: keyof typeof limitLabels;
};

type DemoContext = {
  id: string;
  buyer: string;
  amount: number;
  received: number;
  overdue?: boolean;
  onSave: (reminder: { dueAt: string; objective: string }) => void;
};

const initialAnswers: Assessment = {
  payer: "", orderAmount: null, paidAmount: null, advancePercent: null, currency: "USD", termDays: null,
};

const questions = {
  payment: "这笔交易约定怎么收款？",
  payer: "合同约定由谁付款？",
  amount: "订单金额和已收款是多少？",
  term: "账期有多少天，从哪一天起算？",
  policy: "这笔交易涉及的买方已有信用保障吗？",
};

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function assess(answers: Assessment) {
  const { payment, reason, payer, orderAmount, paidAmount, advancePercent, currency, termDays, termStart, policy, limit } = answers;
  const prepaid = payment === "prepaid";
  const overdue = payment === "overdue";
  const settled = orderAmount !== null && paidAmount === orderAmount;
  const paymentText = paymentLabels[payment ?? "unknown"];
  const facts = [paymentText];
  const pending: string[] = [];
  const fixedAmount = (amount: number) => Math.round(amount * 100) / 100;
  let balance = "";
  let projectedBalance = "";
  if (orderAmount !== null && paidAmount !== null) {
    balance = formatAmount(fixedAmount(orderAmount - paidAmount), currency);
  }
  if (payment === "credit" && orderAmount !== null && advancePercent !== null && advancePercent > 0 && paidAmount === null) {
    const deposit = fixedAmount(orderAmount * advancePercent / 100);
    projectedBalance = formatAmount(fixedAmount(orderAmount - deposit), currency);
  }
  if (reason && (payment === "credit" || payment === "unknown") && reason !== "unknown") facts.push(creditReasons[reason]);
  if (payer.trim()) facts.push(`付款方 ${payer.trim()}`);
  else pending.push("合同付款主体");
  if (orderAmount !== null) facts.push(`订单 ${formatAmount(orderAmount, currency)}`);
  else pending.push("订单金额");
  if (paidAmount !== null) facts.push(`已收 ${formatAmount(paidAmount, currency)}`);
  else pending.push("实际到账金额");
  if (balance) facts.push(`当前待收 ${balance}`);
  if (projectedBalance) facts.push(`预付款按约到账后预计待收 ${projectedBalance}`);

  if (!prepaid && !settled) {
    if (termDays !== null) facts.push(`${termDays} 天账期`);
    else pending.push("账期天数或约定到期日");
    if (termStart) facts.push(`自${termStarts[termStart]}起算`);
    if (!termStart || termStart === "other") pending.push("账期起算点及凭证");
    facts.push(policyLabels[policy ?? "unknown"]);
    if (!policy || policy === "unknown") pending.push("现有出口信用险及适用范围");
    if (policy === "insured") {
      facts.push(limitLabels[limit ?? "unknown"]);
      pending.push(overdue ? "保单通知期限及履约凭证" : "核对买方限额额度、有效期与本笔交易的适用范围");
    }
  }

  let actions: string[];
  if (settled) {
    actions = ["当前订单已结清。保留回款与履约凭证，后续订单如涉及赊销可重新排查。"];
  } else if (prepaid) {
    actions = ["核对合同付款方与实际汇款方，按合同确认全额到账后再发货。"];
  } else if (overdue) {
    actions = ["核对到期日和逾期余额，整理合同、发票、交付凭证及催收记录。",
      "如已有保单，及时联系原承保机构核对通知期限、材料和后续流程。"];
  } else if (payment === "unknown") {
    actions = ["先向买方确认付款安排及账期起算点，再决定是否评估赊销风险。"];
  } else {
    actions = ["签约前比较缩短账期、提高预付款或分批发货的条件。",
      policy === "insured" ? "向现有承保机构核实买方限额及本笔交易是否适用。"
        : "若拟保留账期，可向承保机构了解出口信用保障的办理条件。"];
  }
  const objective = ["【账期风险排查】", facts.join("、"), pending.length ? `待核对 ${pending.join("、")}。` : "", ...actions].filter(Boolean).join("\n");
  return { facts, pending, actions, objective, showGuide: payment === "credit" && !settled };
}

export function InsuranceAssessment({ bridge, customer, demo, onClose, onSaved, onDemoStart }: {
  bridge: Bridge;
  customer?: CustomerChoice;
  demo?: DemoContext;
  onClose: () => void;
  onSaved?: () => void;
  onDemoStart?: () => void;
}) {
  const { message } = App.useApp();
  const [answers, setAnswers] = useState<Assessment>(() => demo ? {
    ...initialAnswers, payer: demo.buyer, orderAmount: demo.amount, paidAmount: demo.received,
    payment: demo.overdue && demo.received < demo.amount ? "overdue" : "credit",
  } : initialAnswers);
  const [position, setPosition] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [choices, setChoices] = useState<CustomerChoice[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [selected, setSelected] = useState<CustomerChoice>();
  const [dueAt, setDueAt] = useState<Exclude<DatePickerProps["value"], unknown[] | undefined>>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const target = customer ?? selected;
  const steps: (keyof typeof questions)[] = ["payment", "payer", "amount"];
  if (answers.payment !== "prepaid" && (answers.orderAmount === null || answers.paidAmount !== answers.orderAmount)) {
    steps.push("term", "policy");
  }
  const step = steps[position];
  const result = step ? undefined : assess(answers);
  const customerChoices = selected && !choices.some((item) => item.id === selected.id) ? [selected, ...choices] : choices;
  const amountError = step === "amount" && answers.orderAmount !== null && answers.paidAmount !== null
    && answers.paidAmount > answers.orderAmount;

  useEffect(() => { titleRef.current?.focus(); }, [position, saving]);
  useEffect(() => {
    if (!saving || customer || demo) return;
    let current = true;
    setLookupError("");
    setLookingUp(true);
    setChoices([]);
    const timer = window.setTimeout(() => {
      void bridge.searchCustomers(query.trim()).then((items) => {
        if (current) setChoices(items);
      }).catch(() => {
        if (current) setLookupError("客户加载失败，请修改搜索词后重试。");
      }).finally(() => {
        if (current) setLookingUp(false);
      });
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [bridge, customer, demo, query, saving]);

  function update<K extends keyof Assessment>(field: K, value: Assessment[K]) {
    setAnswers((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (busy || !result || !dueAt) return;
    if (demo) {
      demo.onSave({ dueAt: dueAt.toISOString(), objective: result.objective });
      void message.success("演示待办已保存");
      onClose();
      return;
    }
    if (!target || target.do_not_contact) return;
    setBusy(true);
    setError("");
    try {
      await bridge.post("/followups", {
        prospect_ids: [target.id], due_at: dueAt.toISOString(), objective: result.objective,
      }, "insurance-assessment-followup");
    } catch (failure) {
      setError((failure as Error).message);
      setBusy(false);
      return;
    }
    void message.success("排查清单已保存为跟进待办");
    onClose();
    if (onSaved) onSaved();
    else void bridge.openCustomer(target.id, "history").catch(() => {});
  }

  return (
    <Modal title="保险分析师 · 账期风险排查" open width={600} footer={null}
      onCancel={busy ? undefined : onClose} closable={!busy} keyboard={!busy} maskClosable={false}>
      <div className="insurance-assessment">
        {demo && <div><Tag color="gold">演示</Tag><Text type="secondary">{demo.id} · {demo.buyer}</Text></div>}
        {target && <Text type="secondary">{target.name}{target.location ? ` · ${target.location}` : ""}</Text>}
        {!target && !demo && position === 0 && <Text type="secondary">适用于一般贸易 B2B 出口。</Text>}
        <Title level={4} tabIndex={-1} ref={titleRef}>
          {saving ? (demo ? "安排演示跟进" : "安排客户跟进") : step ? questions[step] : "账期排查清单"}
        </Title>
        {step && <Form layout="vertical" requiredMark={false}>
          {step === "payment" && <Form.Item>
            <Radio.Group className="insurance-choices" aria-label={questions.payment}
              value={answers.payment} onChange={(event) => update("payment", event.target.value)}
              options={options(paymentLabels)} />
          </Form.Item>}
          {step === "payer" && <>
            <Form.Item label="合同付款主体" htmlFor="assessment-payer">
              <Input id="assessment-payer" maxLength={100} value={answers.payer}
                placeholder="填写企业名称，可跳过"
                onChange={(event) => update("payer", event.target.value)} />
            </Form.Item>
            {customer && customer.name.length <= 100 && <Button onClick={() => update("payer", customer.name)}>与客户名称一致</Button>}
          </>}
          {step === "amount" && <>
            <Form.Item label="币种" htmlFor="assessment-currency">
              <Select id="assessment-currency" virtual={false} value={answers.currency} onChange={(value) => update("currency", value)}
                options={currencies.map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item label="订单金额" htmlFor="assessment-order">
              <InputNumber id="assessment-order" min={0.01} max={999999999999} precision={2} className="full-width"
                value={answers.orderAmount} onChange={(value) => update("orderAmount", value)} placeholder="可跳过" />
            </Form.Item>
            <Form.Item label="已到账金额" htmlFor="assessment-paid" validateStatus={amountError ? "error" : undefined}
              help={amountError ? "已到账金额应小于或等于订单金额。" : undefined}>
              <InputNumber id="assessment-paid" min={0} max={999999999999} precision={2} className="full-width"
                value={answers.paidAmount} onChange={(value) => update("paidAmount", value)} placeholder="未知可留空，确认未收款填 0" />
            </Form.Item>
            {answers.payment === "credit" && answers.paidAmount === null && <Form.Item label="约定预付款比例（%）" htmlFor="assessment-advance">
              <InputNumber id="assessment-advance" min={0} max={99.99} precision={2} className="full-width"
                value={answers.advancePercent} onChange={(value) => update("advancePercent", value)} placeholder="用于估算到账后尾款，可跳过" />
            </Form.Item>}
          </>}
          {step === "term" && <>
            {answers.payment !== "overdue" && <Form.Item label="本次情况" htmlFor="assessment-reason">
              <Select id="assessment-reason" virtual={false} allowClear value={answers.reason}
                onChange={(value) => update("reason", value)} options={options(creditReasons)} placeholder="可跳过" />
            </Form.Item>}
            <Form.Item label="账期天数" htmlFor="assessment-term-days">
              <InputNumber id="assessment-term-days" min={1} max={3650} precision={0} className="full-width"
                value={answers.termDays} onChange={(value) => update("termDays", value)} placeholder="可跳过" />
            </Form.Item>
            <Form.Item label="账期起算点" htmlFor="assessment-term-start">
              <Select id="assessment-term-start" virtual={false} allowClear value={answers.termStart}
                onChange={(value) => update("termStart", value)} options={options(termStarts)} placeholder="可跳过" />
            </Form.Item>
          </>}
          {step === "policy" && <>
            <Form.Item>
              <Radio.Group className="insurance-choices" aria-label={questions.policy} value={answers.policy}
                onChange={(event) => update("policy", event.target.value)} options={options(policyLabels)} />
            </Form.Item>
            {answers.policy === "insured" && <Form.Item label="买方信用限额" htmlFor="assessment-limit">
              <Select id="assessment-limit" virtual={false} allowClear value={answers.limit} onChange={(value) => update("limit", value)}
                options={options(limitLabels)} placeholder="可跳过" />
            </Form.Item>}
          </>}
        </Form>}

        {result && !saving && <>
          <Descriptions size="small" column={1} items={[{ key: "facts", label: "当前信息", children: result.facts.join(" · ") }]} />
          {result.pending.length > 0 && <section aria-label="待核对事项"><Text strong>待核对事项</Text>
            <ul>{result.pending.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>}
          <section aria-label="建议动作"><Text strong>建议动作</Text>
            <ul>{result.actions.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          {result.showGuide && <a href={officialGuide} target="_blank" rel="noreferrer">查看中国信保官方产品目录</a>}
          {customer?.do_not_contact && <Paragraph type="secondary">该客户已停止联系，当前可查看排查结果。</Paragraph>}
        </>}

        {saving && <Form layout="vertical" disabled={busy} requiredMark={false}>
          {!customer && !demo && <Form.Item label="关联客户" htmlFor="assessment-customer"
            validateStatus={lookupError ? "error" : undefined} help={lookupError || undefined}>
            <Select id="assessment-customer" showSearch={{ filterOption: false, onSearch: (value) => setQuery(value.slice(0, 200)) }}
              value={selected?.id} onChange={(value) => setSelected(customerChoices.find((item) => item.id === value))}
              options={customerChoices.map((item) => ({ value: item.id, label: item.location ? `${item.name} · ${item.location}` : item.name,
                disabled: item.do_not_contact }))} loading={lookingUp} virtual={false}
              placeholder="搜索或选择已保存的客户" notFoundContent={lookingUp ? "正在加载" : "没有匹配的客户"} />
          </Form.Item>}
          <Form.Item label="提醒时间（本地时间）" htmlFor="assessment-due">
            <DatePicker id="assessment-due" className="full-width" showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm"
              value={dueAt} onChange={setDueAt} />
          </Form.Item>
          {error && <Alert type="error" showIcon title={error} />}
        </Form>}

        <div className="modal-form-footer insurance-actions">
          {saving ? <>
            <Button onClick={() => setSaving(false)} disabled={busy}>返回清单</Button>
            <Button type="primary" onClick={() => void save()} loading={busy} disabled={(!target && !demo) || !dueAt}>
              {demo ? "确认保存演示待办" : "确认保存待办"}
            </Button>
          </> : <>
            {position > 0 && <Button onClick={() => setPosition(position - 1)}>上一步</Button>}
            {step === "payment" && onDemoStart && <Button onClick={onDemoStart}>使用演示订单</Button>}
            {step && <Button type="primary" disabled={(step === "payment" && !answers.payment) || amountError}
              onClick={() => setPosition(position + 1)}>{position === steps.length - 1 ? "查看核对清单" : "下一步"}</Button>}
            {result && !customer?.do_not_contact && <Button type="primary" onClick={() => setSaving(true)}>
              {demo ? "保存为演示待办" : "保存为跟进待办"}
            </Button>}
          </>}
        </div>
      </div>
    </Modal>
  );
}
