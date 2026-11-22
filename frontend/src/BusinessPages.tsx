import { useState, type ReactNode } from "react";
import { Alert, Button, Card, Descriptions, Modal, Skeleton, Tag } from "antd";
import {
  AimOutlined, ArrowRightOutlined, ClockCircleOutlined, ContactsOutlined, CreditCardOutlined,
  MailOutlined, RobotOutlined, SafetyCertificateOutlined, TeamOutlined, ThunderboltOutlined, WalletOutlined,
} from "@ant-design/icons";
import type { Bridge, ProspectingAgent, Snapshot } from "./bridge";
import { demoOrders, getDemoTotals, PaymentsDemo, ProtectionDemo } from "./DemoOrders";
import "./business-pages.css";

const shortcuts = [
  { label: "发现客户", icon: <ThunderboltOutlined />, target: "discover" },
  { label: "客户工作台", icon: <ContactsOutlined />, target: "workbench" },
  { label: "邮件管理", icon: <MailOutlined />, target: "mail" },
  { label: "订单对账", icon: <CreditCardOutlined />, target: "orders-payments", demo: true },
  { label: "保障与融资", icon: <SafetyCertificateOutlined />, target: "protection-funding", demo: true },
  { label: "用量与费用", icon: <WalletOutlined />, target: "costs" },
];

function DashboardMetric({ label, value, icon, note, demo, onClick }: {
  label: string;
  value?: number;
  icon: ReactNode;
  note: string;
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
      <span className="business-tile-note">{note}</span>
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

function Dashboard({ data, totals, navigate }: {
  data: Snapshot;
  totals: ReturnType<typeof getDemoTotals>;
  navigate: (route: string) => void;
}) {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const employee = data.dashboardAgents?.find(({ id }) => id === employeeId);
  return (
    <div className="native-page business-page">
      <section aria-labelledby="workbench-data">
        <h2 className="business-heading" id="workbench-data">业务数据</h2>
        <div className="business-grid business-metrics">
          <DashboardMetric label="洽谈中商机" value={data.summary ? data.summary.stages?.negotiating ?? 0 : undefined}
            note="客户管线中的洽谈阶段" icon={<AimOutlined />} onClick={() => navigate("overview")} />
          <DashboardMetric label="已保存客户" value={data.summary?.total}
            note="当前工作空间" icon={<TeamOutlined />} onClick={() => navigate("customers")} />
          <DashboardMetric label="到期待跟进" value={data.summary?.due_followups}
            note="到期且允许联系" icon={<ClockCircleOutlined />} onClick={() => navigate("overview")} />
          <DashboardMetric label="累计回款" value={totals.received} note={`${totals.unpaid} 笔样例订单待回款`}
            icon={<WalletOutlined />} demo onClick={() => navigate("orders-payments")} />
        </div>
      </section>
      <section aria-labelledby="workbench-employees">
        <h2 className="business-heading" id="workbench-employees">数字员工</h2>
        <Card className="business-employees" variant="outlined">
          <h3>已创建的员工</h3>
          {data.dashboardAgentsError ? (
            <Alert type="warning" showIcon title="数字员工加载失败，请刷新数据重试。" />
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
              <span>当前工作空间尚未创建拓客数字员工。</span>
              <Button type="link" onClick={() => navigate("discover")}>前往发现客户</Button>
            </div>
          )}
          <h3>演示员工</h3>
          <div className="business-grid employee-grid">
            <Employee name="收款跟进员" detail="准备收款提醒，协助核对回款流水" icon={<CreditCardOutlined />}
              demo onClick={() => navigate("orders-payments")} />
            <Employee name="保险分析师" detail="梳理货运与经营保障需求" icon={<SafetyCertificateOutlined />}
              demo onClick={() => navigate("protection-funding")} />
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
        footer={<Button type="primary" onClick={() => { setEmployeeId(null); navigate("discover"); }}>进入拓客</Button>}>
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
  const order = orders.find(({ id }) => id === orderId) ?? orders[0];
  const navigate = (route: string) => { void bridge.navigate(route).catch(() => {}); };
  const demoProps = { orders, order, select: ({ id }: (typeof orders)[number]) => setOrderId(id) };
  if (data.tab === "my-overview") return <Dashboard data={data} totals={getDemoTotals(orders)} navigate={navigate} />;
  if (data.tab === "orders-payments") return (
    <PaymentsDemo {...demoProps} openProtection={() => navigate("protection-funding")}
      reconcile={() => setOrders((current) => current.map((item) => (
        item.id === orderId && item.receipt
          ? { ...item, received: item.received + item.receipt.amount, receipt: undefined }
          : item
      )))} />
  );
  if (data.tab === "protection-funding") return <ProtectionDemo {...demoProps} openPayments={() => navigate("orders-payments")} />;
  return null;
}
