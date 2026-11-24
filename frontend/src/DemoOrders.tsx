import { useState } from "react";
import { HelpHint } from "./HelpHint";
import {
  Alert, Button, Card, Descriptions, Modal, Statistic, Tabs, Tag, Timeline,
} from "antd";
import { CheckCircleOutlined, CreditCardOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { formatDate } from "./ui-state";

const usd = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
export const formatUsd = (amount: number) => `USD ${usd.format(amount)}`;

type Shipment = {
  label: string;
  route: string;
  risks: string;
  missing: string;
};

type Receipt = { reference: string; orderId: string; currency: string; amount: number };
type DemoOrder = {
  id: string;
  product: string;
  buyer: string;
  amount: number;
  received: number;
  due: string;
  overdue?: boolean;
  shipment: Shipment;
  acceptance: boolean;
  receivableConfirmed: boolean;
  receipt?: Receipt;
};

export const demoOrders: DemoOrder[] = [
  {
    id: "DEMO-MY-001", product: "连锁门店包装耗材", buyer: "吉隆坡连锁商户 A",
    amount: 48000, received: 14400, due: "演示第 30 天", overdue: true,
    receipt: { reference: "DEMO-PSP-8616", orderId: "DEMO-MY-001", currency: "USD", amount: 33600 },
    shipment: {
      label: "海运 · 待发运", route: "深圳 → 巴生港",
      risks: "受潮、包装破损与中转装卸风险", missing: "装箱单、运输节点和货物交接责任",
    },
    acceptance: false, receivableConfirmed: false,
  },
  {
    id: "DEMO-MY-002", product: "门店标准化设备", buyer: "槟城零售商户 B",
    amount: 26400, received: 0, due: "演示第 45 天",
    shipment: {
      label: "海运 · 已签收", route: "广州 → 槟城",
      risks: "设备运输碰撞、装卸损坏；后续经营阶段可梳理设备财产和责任保障",
      missing: "签收时的设备状态、设备清单和门店运营地址",
    },
    acceptance: true, receivableConfirmed: true,
  },
  {
    id: "DEMO-MY-003", product: "门店标识补货", buyer: "新山零售商户 C",
    amount: 18000, received: 18000, due: "演示第 20 天",
    shipment: {
      label: "空运 · 已交付", route: "广州 → 新山",
      risks: "可复盘分批运输及交接记录，供下次补货时核对保障需求",
      missing: "本批已交付，汇总交接记录供后续订单参考",
    },
    acceptance: true, receivableConfirmed: true,
  },
];

function remaining(order: DemoOrder) {
  return order.amount - order.received;
}

export function getDemoTotals(orders: DemoOrder[]) {
  return orders.reduce((totals, order) => ({
    received: totals.received + order.received,
    outstanding: totals.outstanding + remaining(order),
    unpaid: totals.unpaid + (remaining(order) > 0 ? 1 : 0),
  }), { received: 0, outstanding: 0, unpaid: 0 });
}

type DemoPageProps = {
  orders: DemoOrder[];
  order: DemoOrder;
  select: (order: DemoOrder) => void;
};

export type DemoReminder = { dueAt: string; objective: string };
type DemoAssessmentProps = {
  openDemoAssessment: () => void;
  assessmentReminder?: DemoReminder;
};

function DemoAssessmentReminder({ reminder }: { reminder?: DemoReminder }) {
  if (!reminder) return null;
  return <Alert type="success" showIcon title="演示跟进待办" description={<>
    <div>提醒时间 {formatDate(reminder.dueAt)}</div>
    <div className="followup-objective">{reminder.objective}</div>
  </>} />;
}

function DemoBanner({ mode }: { mode: "payment" | "protection" }) {
  const payment = mode === "payment";
  return (
    <div className="business-demo-banner">
      <span className="business-demo-icon" aria-hidden="true">
        {payment ? <CreditCardOutlined /> : <SafetyCertificateOutlined />}
      </span>
      <div>
        <div className="business-banner-heading">
          <h2>{payment ? "马来西亚跨境采购试点" : "马来西亚出海服务试点"}</h2>
          <Tag color="gold">演示</Tag>
          <HelpHint label="演示说明">
            {payment ? "订单与流水均为样例。演示对账不会发起真实收款，刷新后恢复样例。"
              : "订单和资料均为样例。演示待办随页面刷新重置。"}
          </HelpHint>
        </div>
      </div>
    </div>
  );
}

function status(order: DemoOrder) {
  if (!remaining(order)) return { text: "已结清", color: "green" };
  if (order.receipt) return { text: "待对账", color: "orange" };
  return { text: "待回款", color: "blue" };
}

function OrderList({ orders, order, select }: DemoPageProps) {
  return (
    <Card title="演示订单" className="demo-order-list">
      <div className="demo-order-options" role="group" aria-label="演示订单">
        {orders.map((item) => (
          <button type="button" key={item.id} aria-pressed={item.id === order.id} onClick={() => select(item)}>
            <span className="demo-order-title">
              <strong>{item.product}</strong>
              <Tag color={status(item).color}>{status(item).text}</Tag>
            </span>
            <span>{item.buyer}</span>
            <small>{item.id} · {formatUsd(item.amount)}</small>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function PaymentsDemo({ orders, order, select, reconcile, openProtection, openDemoAssessment, assessmentReminder }: DemoPageProps & DemoAssessmentProps & {
  reconcile: () => void;
  openProtection: () => void;
}) {
  const [dialog, setDialog] = useState<"reminder" | "reconcile" | null>(null);
  const totals = getDemoTotals(orders);
  const balance = remaining(order);
  const receipt = order.receipt;
  const matches = receipt?.orderId === order.id && receipt.currency === "USD" && receipt.amount === balance;
  return (
    <div className="native-page business-page">
      <DemoBanner mode="payment" />
      <div className="business-grid demo-statistics" aria-label="演示收款汇总">
        <Card><Statistic title="订单总数" value={orders.length} suffix="笔" /></Card>
        <Card><Statistic title="累计回款" value={totals.received} prefix="USD" /></Card>
        <Card><Statistic title="待回款" value={totals.outstanding} prefix="USD" /></Card>
      </div>
      <div className="demo-order-layout">
        <OrderList {...{ orders, order, select }} />
        <Card title={order.product} extra={<Tag color={status(order).color}>{status(order).text}</Tag>}>
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} items={[
            { key: "buyer", label: "买方", children: order.buyer },
            { key: "amount", label: "合同金额", children: formatUsd(order.amount) },
            { key: "received", label: "累计回款", children: formatUsd(order.received) },
            { key: "remaining", label: "待回款", children: formatUsd(balance) },
            { key: "due", label: "付款节点", children: `${order.due}${order.overdue && balance ? " · 已逾期" : ""}` },
            { key: "shipment", label: "履约状态", children: order.shipment.label },
          ]} />
          <div className="demo-actions">
            {balance > 0 && <Button onClick={() => setDialog("reminder")}>预览收款提醒</Button>}
            {receipt && <Button type="primary" onClick={() => setDialog("reconcile")}>核对回款流水</Button>}
            <Button onClick={openDemoAssessment}>排查账期风险</Button>
            <Button onClick={openProtection}>查看订单保障</Button>
          </div>
          <DemoAssessmentReminder reminder={assessmentReminder} />
          <h3 className="demo-subheading">订单与收款进度</h3>
          <Timeline items={[
            { color: "green", content: "已确认合同与付款条款" },
            { color: order.received ? "green" : "gray", content: order.received ? `已入账 ${formatUsd(order.received)}` : "等待回款" },
            { color: receipt ? "orange" : balance ? "gray" : "green", content: receipt
              ? `渠道流水 ${receipt.reference} 待人工核对`
              : balance ? "待对账" : "应收余额为零，已结清" },
          ]} />
        </Card>
      </div>
      <Modal open={dialog === "reminder"} title="收款跟进员 · 提醒草稿" onCancel={() => setDialog(null)}
        footer={<Button onClick={() => setDialog(null)}>关闭预览</Button>}>
        <Alert type="info" showIcon title="演示草稿" />
        <p>{order.buyer}，您好！想与您核对订单 {order.id}「{order.product}」的付款进度。</p>
        <p>根据样例账面记录，当前待回款 {formatUsd(balance)}，约定付款节点为{order.due}。如已安排付款，请回复交易参考号，便于核对。谢谢！</p>
      </Modal>
      <Modal open={dialog === "reconcile" && !!receipt} title="人工确认回款对账" onCancel={() => setDialog(null)}
        okText="确认演示对账" okButtonProps={{ disabled: !matches }} onOk={() => { reconcile(); setDialog(null); }}>
        <Descriptions size="small" column={1} items={[
          { key: "id", label: "流水关联订单", children: receipt?.orderId },
          { key: "reference", label: "渠道流水", children: receipt?.reference },
          { key: "amount", label: "流水金额", children: receipt && `${receipt.currency} ${usd.format(receipt.amount)}` },
          { key: "expected", label: "待回款", children: formatUsd(balance) },
        ]} />
        {matches ? (
          <Alert type="success" showIcon title="流水与应收匹配" />
        ) : (
          <Alert type="warning" showIcon title="流水与应收信息有差异，请人工复核。" />
        )}
      </Modal>
    </div>
  );
}

function materialRows(order: DemoOrder) {
  return [
    { label: "企业主体及买方资料", present: true },
    { label: "真实订单与合同", present: true },
    { label: "应收账款确权凭证", present: order.receivableConfirmed },
    { label: "履约及验收凭证", present: order.acceptance },
    { label: "还款来源与安排", present: false },
  ];
}

export function ProtectionDemo({ orders, order, select, openPayments, openAssessment, openDemoAssessment, assessmentReminder }: DemoPageProps & DemoAssessmentProps & {
  openPayments: () => void;
  openAssessment: () => void;
}) {
  const [preview, setPreview] = useState<"insurance" | "funding" | null>(null);
  const materials = materialRows(order);
  const available = materials.filter(({ present }) => present).length;
  return (
    <div className="native-page business-page">
      <Card title="外贸账期风险排查" size="small"
        extra={<Button type="primary" onClick={openAssessment}>开始排查</Button>}>
        根据买方付款条件和现有保障生成签约前核对清单。
      </Card>
      <DemoBanner mode="protection" />
      <div className="demo-order-layout">
        <OrderList {...{ orders, order, select }} />
        <Card title={order.product} extra={<Button size="small" onClick={openPayments}>查看订单收款</Button>}>
          <DemoAssessmentReminder reminder={assessmentReminder} />
          <Tabs items={[
            { key: "insurance", label: "货运与经营保障", children: <>
              <Descriptions size="small" column={1} items={[
                { key: "route", label: "运输路线", children: `${order.shipment.route} · ${order.shipment.label}` },
                { key: "value", label: "订单金额", children: formatUsd(order.amount) },
                { key: "risks", label: "风险关注", children: order.shipment.risks },
                { key: "missing", label: "资料待核对", children: order.shipment.missing },
              ]} />
              <div className="demo-actions">
                <Button onClick={openDemoAssessment}>排查账期风险</Button>
                <Button type="primary" onClick={() => setPreview("insurance")}>预览保障需求清单</Button>
              </div>
            </> },
            { key: "funding", label: "应收融资对接", children: <>
              {!remaining(order) ? <Alert type="info" showIcon title="这笔订单已结清，无待融资应收" /> : <>
                <Descriptions size="small" column={1} items={[
                  { key: "remaining", label: "待回款", children: formatUsd(remaining(order)) },
                  { key: "materials", label: "材料准备", children: `已备 ${available} / ${materials.length} 项` },
                ]} />
                <ul className="demo-materials">
                  {materials.map(({ label, present }) => (
                    <li key={label}><span>{label}</span><Tag color={present ? "green" : "gold"}>{present ? "已备" : "待补充"}</Tag></li>
                  ))}
                </ul>
                <Button type="primary" onClick={() => setPreview("funding")}>预览机构对接摘要</Button>
              </>}
            </> },
          ]} />
        </Card>
      </div>
      <Modal open={preview !== null} title={preview === "insurance" ? "保险分析师 · 保障需求清单" : "应收融资 · 机构对接摘要"}
        onCancel={() => setPreview(null)} footer={<Button onClick={() => setPreview(null)}>关闭预览</Button>}>
        <p><strong>{order.id} · {order.product}</strong></p>
        {preview === "insurance" ? <>
          <p>运输与经营风险：{order.shipment.risks}。</p>
          <p>资料待核对：{order.shipment.missing}。</p>
          <Alert type="info" showIcon title="下一步由保险机构确认保障范围、条件和所需材料。" />
        </> : <>
          <p>样例应收余额 {formatUsd(remaining(order))}，约定付款节点为{order.due}。</p>
          <p>材料缺口：{materials.filter(({ present }) => !present).map(({ label }) => label).join("、")}。</p>
          <Alert type="info" showIcon icon={<CheckCircleOutlined />} title="材料补齐后，由资金方独立评估。" />
        </>}
      </Modal>
    </div>
  );
}
