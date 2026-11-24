import { useEffect, useState, type ReactNode } from "react";
import { Alert, Button, Card, Descriptions, Modal, Skeleton, Tag } from "antd";
import {
  AimOutlined, ArrowRightOutlined, ClockCircleOutlined, ContactsOutlined, CreditCardOutlined,
  MailOutlined, RobotOutlined, SafetyCertificateOutlined, TeamOutlined, ThunderboltOutlined, WalletOutlined,
} from "@ant-design/icons";
import type { Bridge, ProspectingAgent, Snapshot } from "./bridge";
import { demoOrders, getDemoTotals, PaymentsDemo, ProtectionDemo, type DemoReminder } from "./DemoOrders";
import { InsuranceAssessment } from "./InsuranceAssessment";
import "./business-pages.css";

const shortcuts = [
  { label: "发现客户", icon: <ThunderboltOutlined />, target: "discover" },
  { label: "客户工作台", icon: <ContactsOutlined />, target: "workbench" },
  { label: "邮件管理", icon: <MailOutlined />, target: "mail" },
  { label: "订单对账", icon: <CreditCardOutlined />, target: "orders-payments", demo: true },
  { label: "保障与融资", icon: <SafetyCertificateOutlined />, target: "protection-funding" },
  { label: "用量与费用", icon: <WalletOutlined />, target: "costs" },
];

function DashboardMetric({ label, value, icon, note, demo, onClick }: {
  label: string;
  value?: number;
  icon: ReactNode;
  note?: string;
  demo?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="business-metric" type="button" onClick={onClick}>
      <span className="business-metric-top">
        <span className={`business-tile-icon${demo ? " is-demo" : ""}`} aria-hidden="true">{icon}</span>
        {demo ? <Tag color="gold">演示</Tag> : <ArrowRightOutlined className="business-link-icon" aria-hidden="true" />}
      </span>
      <span className="business-metric-label">{label}</span>
      <span className="business-metric-value">
        {demo && <small>USD</small>}
        {value?.toLocaleString("zh-CN") ?? "—"}
      </span>
      {note && <span className="business-tile-note">{note}</span>}
    </button>
  );
}

function Employee({ name, detail, icon, demo, onClick }: {
  name: string;
  detail: string;
  icon: ReactNode;
  demo?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="employee-tile" onClick={onClick}>
      <span className={`business-tile-icon${demo ? " is-demo" : ""}`} aria-hidden="true">{icon}</span>
      <span className="employee-copy">
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
      {demo && <Tag color="gold">演示</Tag>}
      <ArrowRightOutlined className="business-link-icon" aria-hidden="true" />
    </button>
  );
}

function Dashboard({ data, totals, navigate, openAssessment }: {
  data: Snapshot;
  totals: ReturnType<typeof getDemoTotals>;
  navigate: (route: string) => void;
  openAssessment: () => void;
}) {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const employee = data.dashboardAgents?.find(({ id }) => id === employeeId);
  return (
    <div className="native-page business-page">
      <section aria-labelledby="workbench-data">
        <h2 className="business-heading" id="workbench-data">业务数据</h2>
        <div className="business-grid business-metrics">
          <DashboardMetric label="洽谈中商机" value={data.summary ? data.summary.stages?.negotiating ?? 0 : undefined}
            icon={<AimOutlined />} onClick={() => navigate("overview")} />
          <DashboardMetric label="已保存客户" value={data.summary?.total}
            icon={<TeamOutlined />} onClick={() => navigate("customers")} />
          <DashboardMetric label="到期待跟进" value={data.summary?.due_followups}
            icon={<ClockCircleOutlined />} onClick={() => navigate("overview")} />
          <DashboardMetric label="累计回款" value={totals.received} note={`${totals.unpaid} 笔样例订单待回款`}
            icon={<WalletOutlined />} demo onClick={() => navigate("orders-payments")} />
        </div>
      </section>
      <section aria-labelledby="workbench-employees">
        <h2 className="business-heading" id="workbench-employees">数字员工</h2>
        <Card className="business-employees" variant="outlined">
          {data.dashboardAgentsError ? (
            <Alert type="warning" showIcon title="加载失败，请刷新" />
          ) : data.dashboardAgents === null ? (
            <Skeleton active title={false} paragraph={{ rows: 1 }} />
          ) : data.dashboardAgents.length ? (
            <div className="business-grid employee-grid">
              {data.dashboardAgents.map((agent) => (
                <Employee key={agent.id} name={agent.config.name} icon={<RobotOutlined />}
                  detail={agent.config.market ? `拓客 · ${agent.config.market}` : "拓客"} onClick={() => setEmployeeId(agent.id)} />
              ))}
            </div>
          ) : (
            <div className="employee-empty">
              <span>暂无拓客员工</span>
              <Button type="link" onClick={() => navigate("discover")}>发现客户</Button>
            </div>
          )}
          <div className="business-grid employee-grid">
            <Employee name="保险分析师" detail="外贸账期风险排查" icon={<SafetyCertificateOutlined />}
              onClick={openAssessment} />
            <Employee name="收款跟进员" detail="提醒与对账" icon={<CreditCardOutlined />}
              demo onClick={() => navigate("orders-payments")} />
          </div>
        </Card>
      </section>
      <section aria-labelledby="workbench-shortcuts">
        <h2 className="business-heading" id="workbench-shortcuts">常用功能</h2>
        <div className="business-grid shortcut-grid">
          {shortcuts.map(({ label, icon, target, demo }) => (
            <Button className="business-shortcut" key={target} onClick={() => navigate(target)}>
              <span className="business-tile-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
              {demo && <Tag color="gold">演示</Tag>}
            </Button>
          ))}
        </div>
      </section>
      <Modal open={!!employee} title={employee?.config.name} onCancel={() => setEmployeeId(null)}
        footer={<Button type="primary" onClick={() => { setEmployeeId(null); navigate("discover"); }}>发现客户</Button>}>
        {employee && <EmployeeDetails employee={employee} />}
      </Modal>
    </div>
  );
}

function EmployeeDetails({ employee: { status, config } }: { employee: ProspectingAgent }) {
  return (
    <Descriptions size="small" column={1} items={[
      { key: "type", label: "类型", children: "拓客数字员工" },
      { key: "status", label: "状态", children: { enabled: "已启用", paused: "已暂停" }[status] ?? "已创建" },
      { key: "market", label: "目标市场", children: config.market || "未指定" },
      { key: "product", label: "主打产品", children: config.product || "未指定" },
      { key: "instructions", label: "任务指令", children: <span className="employee-instructions">{config.instructions}</span> },
    ]} />
  );
}

export function BusinessPages({ data, bridge }: { data: Snapshot; bridge: Bridge }) {
  const [orders, setOrders] = useState(demoOrders);
  const [orderId, setOrderId] = useState(demoOrders[0].id);
  const [assessmentMode, setAssessmentMode] = useState<{ page: string; demo: boolean } | null>(null);
  const [demoReminders, setDemoReminders] = useState<Record<string, DemoReminder>>({});
  useEffect(() => setAssessmentMode(null), [data.tab]);
  const order = orders.find(({ id }) => id === orderId) ?? orders[0];
  const navigate = (route: string) => { void bridge.navigate(route).catch(() => {}); };
  const openAssessment = () => setAssessmentMode({ page: data.tab, demo: false });
  const openDemoAssessment = () => setAssessmentMode({ page: data.tab, demo: true });
  const assessment = assessmentMode?.page === data.tab && <InsuranceAssessment bridge={bridge}
    key={assessmentMode.demo ? order.id : "manual"}
    onClose={() => setAssessmentMode(null)}
    onDemoStart={assessmentMode.demo ? undefined : openDemoAssessment}
    demo={assessmentMode.demo ? { ...order, onSave: (reminder) => {
      setDemoReminders((current) => ({ ...current, [order.id]: reminder }));
      if (data.tab === "my-overview") navigate("protection-funding");
    } } : undefined} />;
  const demoProps = {
    orders, order, select: ({ id }: (typeof orders)[number]) => setOrderId(id),
    openDemoAssessment, assessmentReminder: demoReminders[order.id],
  };
  if (data.tab === "my-overview") return <>
    <Dashboard data={data} totals={getDemoTotals(orders)} navigate={navigate} openAssessment={openAssessment} />
    {assessment}
  </>;
  if (data.tab === "orders-payments") return <>
    <PaymentsDemo {...demoProps} openProtection={() => navigate("protection-funding")}
      reconcile={() => setOrders((current) => current.map((item) => (
        item.id === orderId && item.receipt
          ? { ...item, received: item.received + item.receipt.amount, receipt: undefined }
          : item
      )))} />
    {assessment}
  </>;
  if (data.tab === "protection-funding") return <>
    <ProtectionDemo {...demoProps} openPayments={() => navigate("orders-payments")} openAssessment={openAssessment} />
    {assessment}
  </>;
  return null;
}
