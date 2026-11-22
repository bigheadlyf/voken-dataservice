import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  App as AntApp,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Descriptions,
  Drawer,
  Empty,
  Grid,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import zhCN from "antd/locale/zh_CN";
import {
  ApartmentOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  ContactsOutlined,
  DashboardOutlined,
  UploadOutlined,
  FilterOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import pages from "./legacy-pages.html?raw";
import account from "./legacy-account.html?raw";
import {
  assetBase,
  initialize,
  UI_EVENT,
  type Bridge,
  type RecordData,
  type Snapshot,
} from "./bridge";
import { WorkbenchActionModal, type WorkbenchAction } from "./WorkbenchAction";
import {
  FILTER_DEFAULTS,
  filterChips,
  formatDate,
  historyLabels,
  normalizedFilters,
  readTablePreferences,
  sameFilters,
  writeTablePreferences,
} from "./ui-state";
import "./styles.css";

const { Text, Title, Paragraph } = Typography;
const stages: Record<string, string> = {
  new: "新发现",
  qualified: "已筛选",
  contacted: "已联系",
  replied: "已回复",
  negotiating: "洽谈中",
  won: "已成交",
  lost: "不匹配",
};
const stageColors: Record<string, string> = {
  new: "blue",
  qualified: "cyan",
  contacted: "geekblue",
  replied: "purple",
  negotiating: "orange",
  won: "green",
  lost: "default",
};
const verification: Record<string, string> = {
  valid: "独立验证有效",
  invalid: "无效 / 不应联系",
  catch_all: "全收域，待确认",
  unknown: "未知",
  unverified: "尚未独立验证",
};
const titles: Record<string, string> = {
  "my-overview": "我的概况",
  "orders-payments": "订单与收款",
  "protection-funding": "保障与资金",
  "ai-capabilities": "AI能力",
  overview: "业务概况",
  discover: "发现客户",
  workbench: "客户工作台",
  customers: "客户档案",
  jobs: "任务管理",
  "job-view": "任务详情",
  directory: "企业与联系人",
  sources: "商业情报",
  mail: "邮件管理",
  company: "企业资料",
  costs: "用量与费用",
};
const descriptions: Record<string, string> = {
  "my-overview": "查看业务进展与工作空间用量。",
  overview: "从发现到跟进，让每一条客户线索都有下一步。",
  workbench: "筛选企业、核对联系人，集中推进值得跟进的商机。",
  discover: "从产品与市场出发，找到下一批合适的潜在客户。",
  jobs: "查看执行进度、核对来源，管理每一次发现。",
  customers: "保留客户证据与沟通记录，持续推进每一次对话。",
  directory: "查询企业与目标岗位，按需补充商务联系信息。",
  sources: "核对企业背景，发现公开采购与市场信号。",
  company: "让 AI 理解你的企业、产品与目标市场。",
  mail: "审阅开发信，记录回复，安排下一次跟进。",
  costs: "查看点数、任务结算和数据使用情况。",
};
const options = (mapping: Record<string, string>) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }));
const date = formatDate;
const ignore = (promise: Promise<unknown>) => {
  void promise.catch(() => {});
};
function SafeLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  let valid = false;
  try {
    valid = ["http:", "https:"].includes(new URL(href || "").protocol);
  } catch {}
  return valid ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Text type="secondary">{children}</Text>
  );
}
function Legacy({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <div className={`legacy ${className}`} ref={ref} />;
}
function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className="voken-brand" href="#my-overview" aria-label="微元 Voken 首页">
      <img
        className="brand-symbol"
        src={`${assetBase()}favicon.svg`}
        alt=""
        width={40}
        height={40}
      />
      {!compact && (
        <span>
          微元<span className="brand-en">Voken</span>
        </span>
      )}
    </a>
  );
}
function Auth({ ready }: { ready: boolean }) {
  return (
    <section
      id="auth"
      className="react-auth"
      onSubmitCapture={(event) => {
        if (!ready) event.preventDefault();
      }}
    >
      <div className="auth-intro">
        <Brand />
        <div className="auth-intro-copy">
          <p className="auth-kicker">微元 Voken 工作台</p>
          <h1>
            用<span className="brand-highlight"> AI </span>发现客户，
            <br />
            推进每一次<span className="brand-accent">商机</span>。
          </h1>
          <p className="auth-lead">
            核对企业和联系信息、审阅开发信，并跟进客户进展。
          </p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form-card">
          <Title level={2}>登录微元工作台</Title>
          <form id="login-form" className="login-form" method="post">
            <label htmlFor="login-phone">手机号</label>
            <Input
              id="login-phone"
              name="phone"
              type="tel"
              autoComplete="username"
              placeholder="请输入手机号"
              size="large"
              required
            />
            <label htmlFor="login-password">密码</label>
            <Input.Password
              id="login-password"
              name="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              size="large"
              minLength={8}
              required
            />
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              block
              disabled={!ready}
              loading={!ready}
            >
              进入工作台
            </Button>
          </form>
          <Legacy html={account} />
        </div>
      </div>
    </section>
  );
}
function Metrics({
  items,
}: {
  items: {
    label: string;
    value?: number;
    note: string;
    icon: React.ReactNode;
  }[];
}) {
  return (
    <Row gutter={[16, 16]} className="metric-row">
      {items.map((item) => (
        <Col xs={24} sm={12} xl={6} key={item.label}>
          <Card className="metric-card">
            <div className="metric-top">
              <Text type="secondary">{item.label}</Text>
              <span className="metric-icon">{item.icon}</span>
            </div>
            <Statistic
              value={item.value}
              formatter={(value) =>
                item.value === undefined ? "—" : Number(value).toLocaleString()
              }
            />
            <Text type="secondary" className="metric-note">
              {item.note}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
function Overview({ data, bridge }: { data: Snapshot; bridge: Bridge }) {
  const summary = data.summary;
  const steps = [
    {
      title: "完善企业资料",
      text: "告诉 AI 你的产品、优势与市场",
      tab: "company",
      icon: <BankOutlined />,
    },
    {
      title: "发现潜在客户",
      text: "描述目标，创建小批量找客任务",
      tab: "discover",
      icon: <SearchOutlined />,
    },
    {
      title: "筛选并核对",
      text: "检查企业匹配、岗位和邮箱",
      tab: "workbench",
      icon: <FilterOutlined />,
    },
    {
      title: "开始商务对话",
      text: "审阅开发信，记录每一次推进",
      tab: "mail",
      icon: <MailOutlined />,
    },
  ];
  return (
    <div className="native-page">
      <div className="overview-hero">
        <div>
          <h2>
            发现客户，<span className="brand-highlight">推进商机</span>
          </h2>
          <p>按目标市场和产品找客户，核对来源后加入客户档案。</p>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => ignore(bridge.navigate("discover"))}
            >
              创建找客任务
            </Button>
            <Button onClick={() => ignore(bridge.navigate("workbench"))}>
              进入客户工作台
            </Button>
          </Space>
        </div>
      </div>
      <Metrics
        items={[
          {
            label: "已保存客户",
            value: summary?.total,
            note: "你的独立客户管线",
            icon: <TeamOutlined />,
          },
          {
            label: "到期待跟进",
            value: summary?.due_followups,
            note: "到期且允许联系的客户",
            icon: <ClockCircleOutlined />,
          },
          {
            label: "正在洽谈",
            value: summary?.stages?.negotiating || (summary ? 0 : undefined),
            note: "持续推进中的商机",
            icon: <ContactsOutlined />,
          },
          {
            label: "已成交",
            value: summary?.stages?.won || (summary ? 0 : undefined),
            note: "以实际记录为准",
            icon: <CheckCircleOutlined />,
          },
        ]}
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={15}>
          <Card title="今天值得推进的事">
            <div className="next-action">
              <span className="action-icon">
                <ClockCircleOutlined />
              </span>
              <div>
                <Title level={4}>
                  {summary
                    ? summary.due_followups
                      ? `${summary.due_followups} 位客户等待下一次跟进`
                      : "开始建立你的下一批商机"
                    : "正在加载业务概况"}
                </Title>
                <Paragraph type="secondary">
                  {summary?.due_followups
                    ? "先核对客户来源和沟通历史，再决定下一次联系。"
                    : "完善企业资料，创建找客任务，筛选值得对话的企业。"}
                </Paragraph>
                <Button
                  type="primary"
                  onClick={() =>
                    ignore(
                      bridge.navigate(
                        summary?.due_followups ? "workbench" : "discover",
                      ),
                    )
                  }
                >
                  {summary?.due_followups ? "查看待跟进客户" : "发现新客户"}
                </Button>
              </div>
            </div>
            <div className="overview-note">
              <CheckCircleOutlined />{" "}
              {summary
                ? `已停止联系 ${summary.do_not_contact || 0} 位客户；回复和成交数据以实际记录为准。`
                : "统计仅展示当前工作空间的数据。"}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card title="清晰的客户开发路径">
            <div className="workflow-list">
              {steps.map((step, i) => (
                <button
                  key={step.tab}
                  onClick={() => ignore(bridge.navigate(step.tab))}
                >
                  <span className="workflow-icon">{step.icon}</span>
                  <span>
                    <b>{step.title}</b>
                    <small>{step.text}</small>
                  </span>
                  <ArrowRightOutlined />
                </button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
function ContactCard({
  contact,
  capabilities,
  bridge,
  onChange,
}: {
  contact: RecordData;
  capabilities: RecordData;
  bridge: Bridge;
  onChange: () => void;
}) {
  const [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false);
  const verify = async () => {
    setBusy(true);
    try {
      await bridge.post(
        "/verifications",
        {
          prospect_id: contact.prospect_id,
          email: contact.email,
          confirm_external_check: true,
        },
        "verify",
      );
      setConsent(false);
      onChange();
    } catch {
    } finally {
      setBusy(false);
    }
  };
  const status = contact.verification?.status || "unverified";
  return (
    <Card size="small" className="contact-card">
      <Space wrap>
        <Text strong>{contact.name || "公共 / 岗位未知入口"}</Text>
        <Tag>{contact.titles?.join(" / ") || "岗位未知"}</Tag>
        {contact.blocked && <Tag color="red">停止联系</Tag>}
      </Space>
      <Paragraph copyable={contact.email ? { text: contact.email } : false}>
        {contact.email || "暂无完整邮箱"}
      </Paragraph>
      <Space wrap>
        <Tag
          color={
            status === "valid"
              ? "green"
              : status === "invalid"
                ? "red"
                : "default"
          }
        >
          {verification[status]}
        </Tag>
        {contact.verification?.stale && (
          <Tag color="orange">验证超过 30 天</Tag>
        )}
        <Text type="secondary">{contact.role_match?.reason}</Text>
      </Space>
      <Paragraph type="secondary" className="contact-meta">
        验证时间：{date(contact.verification?.checked_at)} ·{" "}
        {contact.verification?.history_count || 0} 次历史记录
      </Paragraph>
      <Text type="secondary">供应商标记不替代独立验证，不保证送达。</Text>
      {contact.warnings?.length > 0 && (
        <Alert
          type="warning"
          title={contact.warnings
            .map(
              (warning: string) =>
                (
                  ({
                    email_missing: "尚未取得完整邮箱",
                    domain_relationship_unconfirmed: "邮箱域名与官网关系待核实",
                    recruitment_mailbox: "招聘入口",
                    service_or_quality_mailbox: "服务 / 质量入口",
                    email_pattern_placeholder: "疑似邮箱格式示例",
                    role_unconfirmed: "岗位未知",
                    supplier_marked_invalid: "供应商曾标记无效",
                  }) as Record<string, string>
                )[warning] || warning,
            )
            .join("；")}
          showIcon
        />
      )}
      {contact.sources?.length > 0 && (
        <div className="contact-sources">
          {contact.sources.map((s: RecordData, i: number) => (
            <div key={i}>
              <SafeLink href={s.source_url}>{s.source || "原始来源"}</SafeLink>
              <Text type="secondary"> · {date(s.observed_at)}</Text>
              {s.source_job_id && (
                <Button type="link" size="small" data-job={s.source_job_id}>
                  来源任务
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="verification-action">
        <Checkbox
          checked={consent}
          disabled={!capabilities.email_verification || !contact.email}
          onChange={(e) => setConsent(e.target.checked)}
        >
          同意将邮箱交给 ZeroBounce 验证，消耗供应商额度
        </Checkbox>
        <Button
          loading={busy}
          disabled={
            !consent || !capabilities.email_verification || !contact.email
          }
          onClick={() => void verify()}
        >
          {status === "unverified" ? "验证邮箱" : "重新验证并保留历史"}
        </Button>
      </div>
    </Card>
  );
}
function CustomerDrawer({
  id,
  bridge,
  capabilities,
  onClose,
}: {
  id: string | null;
  bridge: Bridge;
  capabilities: RecordData;
  onClose: () => void;
}) {
  const [data, setData] = useState<RecordData | null>(null),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    if (id)
      void bridge
        .detail(id)
        .then((value) => {
          if (!cancelled) setData(value);
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        });
    return () => {
      cancelled = true;
    };
  }, [id, bridge, version]);
  const row = data?.prospect;
  return (
    <Drawer
      title={row?.name || "客户详情"}
      open={!!id}
      onClose={onClose}
      size={720}
      className="customer-drawer"
      footer={
        <div className="drawer-footer-actions">
          <Button onClick={onClose}>关闭详情</Button>
          <Button
            type="primary"
            disabled={!row}
            onClick={() => {
              if (id) ignore(bridge.edit(id).then(onClose));
            }}
          >
            编辑档案与跟进
          </Button>
        </div>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          aria-label="刷新客户详情"
          disabled={!row}
          type="primary"
          onClick={() => {
            setVersion((v) => v + 1);
          }}
        >
          刷新
        </Button>
      }
    >
      {error ? (
        <Alert
          type="error"
          title="客户详情加载失败"
          description={error}
          action={
            <Button onClick={() => setVersion((v) => v + 1)}>重试</Button>
          }
        />
      ) : !data ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <>
          <Space wrap>
            <Tag color={stageColors[row.stage]}>{stages[row.stage]}</Tag>
            {row.do_not_contact && <Tag color="red">拒绝联系</Tag>}
            {row.tags?.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
          <Tabs
            key={id}
            items={[
              {
                key: "profile",
                label: "企业与证据",
                children: (
                  <>
                    <Descriptions
                      column={1}
                      bordered
                      size="small"
                      items={[
                        {
                          key: "location",
                          label: "国家 / 地区",
                          children: row.location || "待核实",
                        },
                        {
                          key: "website",
                          label: "官网",
                          children: (
                            <SafeLink href={row.website}>
                              {row.website || "未提供"}
                            </SafeLink>
                          ),
                        },
                        {
                          key: "contact",
                          label: "已记录联系信息",
                          children: row.contact || "未提供",
                        },
                        {
                          key: "followup",
                          label: "下次跟进",
                          children: date(row.next_followup_at),
                        },
                        {
                          key: "source",
                          label: "来源",
                          children: (
                            <SafeLink href={row.evidence?.source?.url}>
                              {row.evidence?.source?.title ||
                                row.evidence?.source?.url ||
                                "查看原始证据"}
                            </SafeLink>
                          ),
                        },
                      ]}
                    />
                    <Card
                      size="small"
                      title="判断依据"
                      className="drawer-evidence"
                    >
                      <Paragraph>
                        {row.evidence?.reason ||
                          row.evidence?.source_note ||
                          "暂无补充依据，请核对原始来源。"}
                      </Paragraph>
                      <Alert
                        type="info"
                        title="企业匹配、岗位匹配与邮箱有效性分别判断；历史信息不代表当前采购需求。"
                      />
                    </Card>
                    {data.duplicates?.length > 0 && (
                      <Card
                        size="small"
                        title="疑似关联 / 重复档案（尚未合并）"
                        className="drawer-evidence"
                      >
                        {data.duplicates.map((duplicate: RecordData) => (
                          <Paragraph key={duplicate.id}>
                            <Text strong>{duplicate.name}</Text>
                            <br />
                            <Text type="secondary">{duplicate.reason}</Text>
                            <Button
                              type="link"
                              onClick={() =>
                                ignore(bridge.edit(duplicate.id).then(onClose))
                              }
                            >
                              打开档案核对
                            </Button>
                          </Paragraph>
                        ))}
                      </Card>
                    )}
                  </>
                ),
              },
              {
                key: "contacts",
                label: `联系人 (${data.contacts.length})`,
                children: data.contacts.length ? (
                  <Space orientation="vertical" className="full-width">
                    {data.contacts.map((c: RecordData, i: number) => (
                      <ContactCard
                        key={c.email + ":" + i}
                        contact={c}
                        capabilities={capabilities}
                        bridge={bridge}
                        onChange={() => {
                          setVersion((v) => v + 1);
                          ignore(bridge.refresh());
                        }}
                      />
                    ))}
                  </Space>
                ) : (
                  <Empty description="暂无完整邮箱候选，可在客户档案中查询企业与岗位" />
                ),
              },
              {
                key: "history",
                label: "跟进与验证历史",
                children:
                  !data.activities.length && !data.records.length ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无跟进或验证记录，可在客户档案中记录下一步"
                    />
                  ) : (
                    <Timeline
                      items={[
                        ...data.activities.map((a: RecordData) => ({
                          time: a.created_at,
                          title: historyLabels[a.kind] || "其他记录",
                          content: a.content,
                        })),
                        ...data.records.map((r: RecordData) => ({
                          time: r.created_at,
                          title:
                            (
                              {
                                assessment: "企业匹配评审",
                                verification: "独立邮箱验证",
                                contact_event: "联系事件",
                                followup: "跟进提醒",
                                followup_done: "完成提醒",
                              } as Record<string, string>
                            )[r.kind] || r.kind,
                          content:
                            (r.kind === "followup"
                              ? `提醒时间：${date(r.data.due_at)} · ${r.data.objective || ""}`
                              : "") ||
                            (r.kind === "contact_event"
                              ? `${historyLabels[r.data.type] || "联系事件"} · ${r.data.email || ""}：${r.data.content || ""}`
                              : "") ||
                            r.data.reason ||
                            r.data.content ||
                            r.data.objective ||
                            verification[r.data.status] ||
                            r.data.status,
                        })),
                      ]
                        .sort((a, b) =>
                          String(b.time).localeCompare(String(a.time)),
                        )
                        .map((item, i) => ({
                          key: i,
                          title: (
                            <>
                              <Text strong>{item.title}</Text>
                              <div>
                                <Text type="secondary">{date(item.time)}</Text>
                              </div>
                            </>
                          ),
                          content: item.content,
                        }))}
                    />
                  ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
}
const initialFilters: RecordData = FILTER_DEFAULTS;
function Workbench({ data, bridge }: { data: Snapshot; bridge: Bridge }) {
  const screens = Grid.useBreakpoint();
  const wb = data.workbench,
    summary = wb.summary;
  const [filters, setFilters] = useState<RecordData>(
      wb.filters || initialFilters,
    ),
    [advanced, setAdvanced] = useState(false),
    [drawer, setDrawer] = useState<string | null>(null),
    [viewModal, setViewModal] = useState(false),
    [viewName, setViewName] = useState(""),
    [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(readTablePreferences);
  const visibleColumns = preferences.columns;
  const setVisibleColumns = (columns: string[]) =>
    setPreferences((current) => ({ ...current, columns }));
  useEffect(() => writeTablePreferences(preferences), [preferences]);
  const [action, setAction] = useState<WorkbenchAction | null>(null);
  const applied = wb.filters || initialFilters,
    contactMode = applied.mode === "contacts";
  const filterKey = JSON.stringify(applied);
  const dirty = !sameFilters(filters, applied);
  const chips = filterChips(applied, stages, verification);
  const matchingView = (wb.views || []).findIndex((view: RecordData) =>
    sameFilters(view.data, applied),
  );
  const resetFilter = (key: string) => {
    const next = { ...normalizedFilters(applied), [key]: initialFilters[key] };
    setFilters(next);
    apply(next);
  };
  useEffect(() => {
    setFilters({ ...initialFilters, ...applied });
  }, [filterKey]);
  const field = (key: string, value: unknown) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const apply = (next = filters) => ignore(bridge.filter(next));
  const companyColumns: ColumnsType<RecordData> = [
    {
      key: "company",
      title: "企业名称",
      dataIndex: "name",
      width: 250,
      fixed: screens.md ? "left" : undefined,
      render: (value, row) => (
        <div className="company-cell">
          <Avatar shape="square" className="company-avatar">
            {String(value).slice(0, 1).toUpperCase()}
          </Avatar>
          <div>
            <Button type="link" onClick={() => setDrawer(row.id)}>
              {value}
            </Button>
            <Text type="secondary">
              {row.blocked ? "存在停止联系记录" : row.next_action}
            </Text>
            {row.duplicates?.length > 0 && (
              <Tag color="orange">疑似关联 {row.duplicates.length} 份</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      title: "国家 / 地区",
      dataIndex: "country",
      width: 135,
      render: (v) => v || "待核实",
    },
    {
      key: "stage",
      title: "销售阶段",
      dataIndex: "stage",
      width: 115,
      render: (v) => <Tag color={stageColors[v]}>{stages[v] || v}</Tag>,
    },
    {
      key: "contacts",
      title: "联系信息",
      width: 170,
      render: (_, r) => (
        <div>
          <span>{r.email_count} 个完整邮箱</span>
          <br />
          <Text type="secondary">
            {r.contact_count} 条入口 · {r.verified_count} 个验证有效
          </Text>
        </div>
      ),
    },
    {
      key: "assessment",
      title: "企业匹配",
      width: 140,
      render: (_, r) => (
        <Tag color={r.assessment?.status === "fit" ? "green" : "default"}>
          {(
            {
              fit: "人工评审符合",
              not_fit: "人工评审不符合",
              unknown: "依据不足",
              unreviewed: "尚未评审",
            } as Record<string, string>
          )[r.assessment?.status] || "待核实"}
        </Tag>
      ),
    },
    {
      key: "action",
      title: "操作",
      width: 210,
      fixed: screens.md ? "right" : undefined,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => setDrawer(r.id)}>
            详情
          </Button>
          <Button type="link" data-wb-enrich={r.id}>
            查联系人
          </Button>
          <Button
            type="link"
            onClick={() => setAction({ kind: "review", row: r })}
          >
            评审
          </Button>
        </Space>
      ),
    },
  ];
  const contactColumns: ColumnsType<RecordData> = [
    {
      key: "company",
      title: "联系人 / 企业",
      width: 240,
      fixed: screens.md ? "left" : undefined,
      render: (_, r) => (
        <div>
          <Button type="link" onClick={() => setDrawer(r.prospect_id)}>
            {r.name || "公共 / 岗位未知入口"}
          </Button>
          <br />
          <Text type="secondary">{r.company}</Text>
        </div>
      ),
    },
    {
      key: "email",
      title: "邮箱",
      dataIndex: "email",
      width: 240,
      render: (v, r) => (
        <>
          <Text copyable={v ? { text: v } : false}>{v || "暂无完整邮箱"}</Text>
          {r.blocked && <Tag color="red">停止联系</Tag>}
        </>
      ),
    },
    {
      key: "role",
      title: "岗位判断",
      width: 240,
      render: (_, r) => (
        <>
          <div>{r.titles?.join(" / ") || "岗位未知"}</div>
          <Text type="secondary">{r.role_match?.reason}</Text>
        </>
      ),
    },
    {
      key: "verification",
      title: "独立邮箱验证",
      width: 180,
      render: (_, r) => (
        <>
          <Tag
            color={
              r.verification?.status === "valid"
                ? "green"
                : r.verification?.status === "invalid"
                  ? "red"
                  : "default"
            }
          >
            {verification[r.verification?.status] || "未知"}
          </Tag>
          {r.verification?.stale && (
            <div>
              <Text type="warning">验证超过 30 天</Text>
            </div>
          )}
        </>
      ),
    },
    {
      key: "action",
      title: "操作",
      width: 150,
      fixed: screens.md ? "right" : undefined,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => setDrawer(r.prospect_id)}>
            详情 / 验证
          </Button>
          <Button
            type="link"
            onClick={() => setAction({ kind: "event", row: r })}
          >
            记录
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div className="native-page workbench-page">
      <Metrics
        items={[
          {
            label: "企业档案",
            value: summary?.companies,
            note: "当前工作空间独立档案",
            icon: <BankOutlined />,
          },
          {
            label: "有完整邮箱的企业",
            value: summary?.companies_with_email,
            note: "联系信息仍需核实",
            icon: <MailOutlined />,
          },
          {
            label: "去重邮箱",
            value: summary?.unique_mailboxes,
            note: "按邮箱去重统计",
            icon: <ContactsOutlined />,
          },
          {
            label: "近期验证有效",
            value: summary?.verified_mailboxes,
            note: "独立验证，不保证送达",
            icon: <CheckCircleOutlined />,
          },
        ]}
      />
      <Card className="workbench-card">
        <div className="table-heading">
          <div>
            <Title level={4}>客户资源</Title>
            <Text type="secondary">企业、岗位与邮箱，分开核对，集中推进。</Text>
          </div>
          <Space wrap>
            <Button
              icon={<UploadOutlined aria-hidden="true" />}
              onClick={() => {
                const el = document
                  .querySelector("#wb-upload")
                  ?.closest("details");
                if (el) {
                  el.open = true;
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            >
              导入名单
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => ignore(bridge.navigate("discover"))}
            >
              发现客户
            </Button>
          </Space>
        </div>
        <div className="workbench-tabs">
          <Segmented
            value={filters.mode}
            options={[
              { value: "companies", label: "企业视图", icon: <BankOutlined /> },
              {
                value: "contacts",
                label: "联系人视图",
                icon: <ContactsOutlined />,
              },
            ]}
            onChange={(value) => {
              const next = { ...filters, mode: value };
              setFilters(next);
              apply(next);
            }}
          />
          <Select
            aria-label="应用已保存视图"
            placeholder="已保存的筛选视图"
            allowClear
            className="saved-view-select"
            value={matchingView >= 0 ? matchingView : undefined}
            options={(wb.views || []).map((v: RecordData, i: number) => ({
              label: v.data.name,
              value: i,
            }))}
            onChange={(index) => {
              if (index !== undefined) ignore(bridge.applyView(index));
              else {
                setFilters({ ...initialFilters });
                apply({ ...initialFilters });
              }
            }}
          />
        </div>
        <form
          data-extension="react"
          className="react-filter"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <div className="filter-main">
            <Input
              prefix={<SearchOutlined />}
              aria-label="搜索企业、姓名或邮箱"
              placeholder="搜索企业、姓名或邮箱"
              maxLength={200}
              allowClear
              value={filters.q}
              onClear={() => {
                const next = { ...filters, q: "" };
                setFilters(next);
                apply(next);
              }}
              onChange={(e) => field("q", e.target.value)}
            />
            <Input
              aria-label="国家或地区"
              placeholder="国家 / 地区"
              maxLength={100}
              value={filters.country_filter}
              onChange={(e) => field("country_filter", e.target.value)}
            />
            <Select
              aria-label="销售阶段"
              value={filters.stage}
              options={[
                { value: "", label: "全部销售阶段" },
                ...options(stages),
              ]}
              onChange={(v) => field("stage", v)}
            />
            <Button
              htmlType="submit"
              type="primary"
              icon={<SearchOutlined aria-hidden="true" />}
              loading={data.loading}
            >
              查询
            </Button>
            <Button
              icon={<FilterOutlined />}
              aria-expanded={advanced}
              aria-controls="advanced-customer-filters"
              onClick={() => setAdvanced((v) => !v)}
            >
              {advanced ? "收起筛选" : "更多筛选"}
            </Button>
          </div>
          {advanced && (
            <div className="advanced-filters" id="advanced-customer-filters">
              <label>
                标签
                <Input
                  maxLength={40}
                  value={filters.tag}
                  onChange={(e) => field("tag", e.target.value)}
                />
              </label>
              <label>
                目标岗位
                <Select
                  aria-label="目标岗位"
                  value={filters.target}
                  options={options({
                    procurement: "采购 / 供应链",
                    leadership: "企业负责人",
                    sales: "销售 / 业务开发",
                  })}
                  onChange={(v) => field("target", v)}
                />
              </label>
              <label>
                邮箱验证
                <Select
                  aria-label="独立邮箱验证"
                  value={filters.verification}
                  options={[
                    { value: "", label: "全部状态" },
                    ...options(verification),
                  ]}
                  onChange={(v) => field("verification", v)}
                />
              </label>
              <label>
                岗位判断
                <Select
                  aria-label="岗位判断"
                  value={filters.role_filter}
                  options={options({
                    "": "全部岗位",
                    keyword_match: "命中目标关键词",
                    needs_review: "未命中，待核实",
                    unknown: "岗位未知",
                  })}
                  onChange={(v) => field("role_filter", v)}
                />
              </label>
            </div>
          )}
          <div className="filter-bottom">
            <Space wrap>
              <Checkbox
                checked={filters.has_email}
                onChange={(e) => field("has_email", e.target.checked)}
              >
                有完整邮箱
              </Checkbox>
              <Checkbox
                checked={filters.due}
                onChange={(e) => field("due", e.target.checked)}
              >
                到期跟进
              </Checkbox>
              {advanced && (
                <Checkbox
                  checked={filters.ready_only}
                  onChange={(e) => field("ready_only", e.target.checked)}
                >
                  已评审、岗位匹配且邮箱近期有效
                </Checkbox>
              )}
            </Space>
            <Space>
              <Button
                type="text"
                onClick={() => {
                  setFilters({ ...initialFilters });
                  apply({ ...initialFilters });
                }}
              >
                重置
              </Button>
              <Button
                type="link"
                disabled={dirty || data.loading}
                title={dirty ? "请先应用筛选条件，再保存视图" : undefined}
                onClick={() => setViewModal(true)}
              >
                保存当前筛选
              </Button>
            </Space>
          </div>
        </form>
        {dirty && (
          <div className="filter-draft-notice" role="status">
            <Text>筛选条件已修改，列表仍显示上次查询结果。</Text>
            <Button
              size="small"
              type="primary"
              onClick={() => apply()}
              disabled={data.loading}
            >
              应用修改
            </Button>
            <Button
              size="small"
              type="text"
              onClick={() => setFilters({ ...initialFilters, ...applied })}
            >
              撤销修改
            </Button>
          </div>
        )}
        {chips.length > 0 && (
          <div className="applied-filters" aria-label="已应用筛选">
            <Text type="secondary">已应用</Text>
            {chips.map((chip) => (
              <Tag
                key={chip.key}
                closable={!data.loading}
                onClose={() => resetFilter(chip.key)}
                title={chip.label}
              >
                {chip.label}
              </Tag>
            ))}
            <Button
              type="link"
              size="small"
              onClick={() => {
                setFilters({ ...initialFilters });
                apply({ ...initialFilters });
              }}
            >
              清空筛选
            </Button>
          </div>
        )}
        {data.workbenchError && (
          <Alert
            type="error"
            title="客户工作台加载失败"
            description={data.workbenchError}
            showIcon
            action={
              <Button onClick={() => ignore(bridge.refresh())}>重试</Button>
            }
          />
        )}
        <div className="table-status">
          <Space wrap>
            <Text type="secondary" aria-live="polite">
              共 {wb.total || 0} 条记录
            </Text>
            {wb.lastLoadedAt && (
              <Text type="secondary" className="last-updated">
                更新于{" "}
                {new Date(wb.lastLoadedAt).toLocaleTimeString("zh-CN", {
                  hour12: false,
                })}
              </Text>
            )}
            {wb.selected?.length > 0 && (
              <>
                <Tag color="blue">已选 {wb.selected.length} 家企业</Tag>
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    setAction({ kind: "followup", ids: wb.selected })
                  }
                >
                  安排跟进
                </Button>
                <Button
                  type="text"
                  size="small"
                  onClick={() => bridge.select([])}
                >
                  取消选择
                </Button>
              </>
            )}
          </Space>
          <Space wrap className="display-controls">
            <Tooltip title="调整表格行间距">
              <Segmented
                aria-label="表格密度"
                size="small"
                value={preferences.density}
                options={[
                  { value: "comfortable", label: "舒适" },
                  { value: "compact", label: "紧凑" },
                ]}
                onChange={(density) =>
                  setPreferences((current) => ({
                    ...current,
                    density: density as "comfortable" | "compact",
                  }))
                }
              />
            </Tooltip>
            {!contactMode && (
              <Select
                mode="multiple"
                aria-label="显示的表格列"
                value={visibleColumns}
                onChange={setVisibleColumns}
                maxTagCount={0}
                maxTagPlaceholder={() => "列设置"}
                className="column-select"
                options={companyColumns.map((c) => ({
                  value: String(c.key),
                  label: c.title as string,
                  disabled: ["company", "action"].includes(String(c.key)),
                }))}
              />
            )}
          </Space>
        </div>
        {!screens.md && (
          <div className="table-scroll-hint">
            左右滑动表格查看更多字段，点击名称打开详情。
          </div>
        )}
        <Table<RecordData>
          size={preferences.density === "compact" ? "small" : "middle"}
          columns={
            contactMode
              ? contactColumns
              : companyColumns.filter((c) =>
                  visibleColumns.includes(String(c.key)),
                )
          }
          dataSource={
            data.workbenchError || wb.loadedMode !== applied.mode
              ? []
              : wb.items || []
          }
          rowKey={(r) =>
            contactMode ? `${r.prospect_id}:${r.email}:${r.name}` : r.id
          }
          loading={data.loading}
          scroll={{ x: contactMode ? 1100 : 1050, y: "min(58vh, 640px)" }}
          rowSelection={{
            selectedRowKeys: (wb.items || [])
              .filter((r: RecordData) =>
                wb.selected?.includes(contactMode ? r.prospect_id : r.id),
              )
              .map((r: RecordData) =>
                contactMode ? `${r.prospect_id}:${r.email}:${r.name}` : r.id,
              ),
            onChange: (_, rows) =>
              bridge.select([
                ...new Set(
                  rows.map((r) => (contactMode ? r.prospect_id : r.id)),
                ),
              ]),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  data.workbenchError
                    ? "数据暂时无法加载"
                    : chips.length
                      ? "没有符合当前条件的客户"
                      : "还没有客户档案"
                }
              >
                <Button
                  onClick={() => {
                    if (data.workbenchError) {
                      ignore(bridge.refresh());
                    } else if (chips.length) {
                      setFilters({ ...initialFilters });
                      apply({ ...initialFilters });
                    } else ignore(bridge.navigate("discover"));
                  }}
                >
                  {data.workbenchError
                    ? "重新加载"
                    : chips.length
                      ? "清空筛选"
                      : "发现第一批客户"}
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            current: Math.floor((wb.offset || 0) / 30) + 1,
            pageSize: 30,
            total: wb.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page) => ignore(bridge.filter(applied, (page - 1) * 30)),
          }}
        />
        <div className="table-footnote">
          <CheckCircleOutlined />{" "}
          企业匹配、岗位匹配与邮箱验证分别判断；疑似重复档案尚未合并。
        </div>
      </Card>
      {action && (
        <WorkbenchActionModal
          action={action}
          bridge={bridge}
          onClose={() => setAction(null)}
          onSaved={() => ignore(bridge.refresh())}
        />
      )}
      <CustomerDrawer
        id={drawer}
        bridge={bridge}
        capabilities={wb.capabilities || {}}
        onClose={() => setDrawer(null)}
      />
      <Modal
        title="保存当前筛选视图"
        open={viewModal}
        onCancel={() => {
          if (!saving) setViewModal(false);
        }}
        keyboard={!saving}
        maskClosable={!saving}
        confirmLoading={saving}
        onOk={() => {
          if (!viewName.trim()) return;
          setSaving(true);
          void bridge
            .saveView(viewName.trim())
            .then(() => {
              setViewModal(false);
              setViewName("");
            })
            .catch(() => {})
            .finally(() => setSaving(false));
        }}
        okButtonProps={{ disabled: !viewName.trim() || dirty }}
        okText="保存视图"
      >
        <Paragraph type="secondary">
          保存已应用到列表的筛选条件，便于下次快速打开。
        </Paragraph>
        <Input
          aria-label="筛选视图名称"
          autoFocus
          value={viewName}
          maxLength={80}
          placeholder="例如：美国采购岗位待核查"
          onChange={(e) => setViewName(e.target.value)}
        />
      </Modal>
    </div>
  );
}
function Tasks({ data, bridge }: { data: Snapshot; bridge: Bridge }) {
  const [type, setType] = useState(""),
    [status, setStatus] = useState("");
  const names: Record<string, string> = {
    prospecting: "发现客户",
    outreach_draft: "开发信草稿",
    report: "客户报告",
    source_lookup: "官方情报查询",
    public_search: "公开检索",
    directory_companies: "企业查询",
    directory_people: "人物与岗位",
    directory_contacts: "联系方式解锁",
    buyer_search: "采购商匹配",
    buyer_profile: "企业资料",
    buyer_contacts: "联系方式",
    customs_verification: "贸易核验",
    trade_search: "历史贸易",
  };
  const statusNames: Record<string, string> = {
    queued: "排队中",
    running: "执行中",
    cancelling: "取消中",
    succeeded: "已完成",
    partial: "部分完成",
    failed: "失败",
    cancelled: "已取消",
  };
  const rows = data.jobs.filter(
    (row) =>
      (!type || row.operation === type) && (!status || row.status === status),
  );
  return (
    <div className="native-page">
      <Card
        title="任务记录"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => ignore(bridge.navigate("discover"))}
          >
            创建任务
          </Button>
        }
      >
        <div className="task-filter">
          <Select
            aria-label="任务类型"
            value={type}
            options={[{ value: "", label: "全部任务类型" }, ...options(names)]}
            onChange={setType}
          />
          <Select
            aria-label="任务状态"
            value={status}
            options={[
              { value: "", label: "全部状态" },
              ...options(statusNames),
            ]}
            onChange={setStatus}
          />
          <Text type="secondary">
            最近 {data.jobs.length} 个任务中，显示 {rows.length} 个
          </Text>
        </div>
        <Table
          rowKey="id"
          dataSource={rows}
          loading={data.loading}
          scroll={{ x: 750 }}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          columns={[
            {
              title: "任务类型",
              dataIndex: "operation",
              render: (v, r) => (
                <Button type="link" data-job={r.id}>
                  {names[v] || v}
                </Button>
              ),
            },
            {
              title: "状态",
              dataIndex: "status",
              render: (v) => (
                <Badge
                  status={
                    v === "succeeded"
                      ? "success"
                      : v === "running"
                        ? "processing"
                        : v === "failed"
                          ? "error"
                          : v === "partial"
                            ? "warning"
                            : "default"
                  }
                  text={statusNames[v] || v}
                />
              ),
            },
            { title: "创建时间", dataIndex: "created_at", render: date },
            {
              title: "已结算点数",
              dataIndex: "points_charged",
              render: (v) => Number(v || 0).toLocaleString(),
            },
            {
              title: "操作",
              render: (_, r) => (
                <Button type="link" data-job={r.id}>
                  查看详情
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: <Empty description="暂无符合条件的任务" /> }}
        />
        <Text type="secondary">
          执行中的任务每 5 秒更新。部分完成的任务请查看已交付结果及缺失说明。
        </Text>
      </Card>
    </div>
  );
}
const workspaceSections = [
  { key: "my-overview", label: "我的概况", icon: <DashboardOutlined /> },
  {
    key: "customers-opportunities",
    label: "客户与商机",
    icon: <TeamOutlined />,
  },
  { key: "orders-payments", label: "订单与收款", icon: <CreditCardOutlined /> },
  {
    key: "protection-funding",
    label: "保障与资金",
    icon: <SafetyCertificateOutlined />,
  },
  { key: "ai-capabilities", label: "AI能力", icon: <AppstoreOutlined /> },
];

function SectionHome({
  tab,
  data,
  bridge,
}: {
  tab: string;
  data: Snapshot;
  bridge: Bridge;
}) {
  if (tab === "my-overview") {
    return (
      <div className="native-page">
        <Metrics
          items={[
            {
              label: "已保存客户",
              value: data.summary?.total,
              note: "当前工作空间",
              icon: <TeamOutlined />,
            },
            {
              label: "到期待跟进",
              value: data.summary?.due_followups,
              note: "到期且允许联系的客户",
              icon: <ClockCircleOutlined />,
            },
          ]}
        />
        <Card title="常用入口" className="section-home-card">
          <Space wrap>
            <Button
              type="primary"
              onClick={() => ignore(bridge.navigate("workbench"))}
            >
              进入客户工作台
            </Button>
            <Button
              icon={<WalletOutlined />}
              onClick={() => ignore(bridge.navigate("costs"))}
            >
              {data.balance} · 用量与费用
            </Button>
          </Space>
        </Card>
      </div>
    );
  }
  if (tab === "ai-capabilities") {
    return (
      <Card title="可用能力" className="section-home-card">
        <div className="workflow-list">
          <button
            type="button"
            onClick={() => ignore(bridge.navigate("discover"))}
          >
            <span className="workflow-icon">
              <ThunderboltOutlined />
            </span>
            <span>
              <b>AI 发现客户</b>
              <small>根据产品和目标市场建立找客任务</small>
            </span>
            <ArrowRightOutlined />
          </button>
          <button type="button" onClick={() => ignore(bridge.navigate("mail"))}>
            <span className="workflow-icon">
              <MailOutlined />
            </span>
            <span>
              <b>AI 开发信</b>
              <small>查看和审阅开发信草稿</small>
            </span>
            <ArrowRightOutlined />
          </button>
        </div>
      </Card>
    );
  }
  return (
    <Card className="section-home-card">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          tab === "orders-payments"
            ? "订单与收款功能暂未开放"
            : "保障与资金功能暂未开放"
        }
      />
    </Card>
  );
}

function Workspace() {
  const { message } = AntApp.useApp();
  const [bridge, setBridge] = useState<Bridge | null>(null),
    [data, setData] = useState<Snapshot | null>(null),
    [error, setError] = useState(""),
    [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    const update = () => {
      if (window.voken) setData(window.voken.snapshot());
    };
    const notify = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      void message.open({
        type: detail.error ? "error" : "success",
        content: detail.message,
        duration: 6,
      });
    };
    window.addEventListener(UI_EVENT, update);
    window.addEventListener("voken:message", notify);
    void initialize()
      .then((value) => {
        setBridge(value);
        setData(value.snapshot());
      })
      .catch((e) => setError(e.message));
    return () => {
      window.removeEventListener(UI_EVENT, update);
      window.removeEventListener("voken:message", notify);
    };
  }, [message]);
  const tab = data?.tab || "my-overview";
  const section =
    workspaceSections.find(
      ({ key }) => key === tab || (tab === "costs" && key === "my-overview"),
    ) ?? workspaceSections[1];
  const showCustomerMenu = section.key === "customers-opportunities";
  const showSectionHome = [
    "my-overview",
    "orders-payments",
    "protection-funding",
    "ai-capabilities",
  ].includes(tab);
  const description =
    descriptions[tab] ||
    (tab === "job-view"
      ? "核对任务结果与来源，准备下一步业务行动。"
      : undefined);
  const navigate = (key: string, closeDrawer = true) => {
    if (bridge && tab !== key) ignore(bridge.navigate(key));
    if (closeDrawer) setNavOpen(false);
  };
  const signOut = () => {
    document.getElementById("logout")?.click();
    setNavOpen(false);
  };
  const primaryNavigation = (
    <nav className="workspace-sections" aria-label="一级导航">
      {workspaceSections.map(({ key, label, icon }) => (
        <Button
          key={key}
          type="text"
          icon={
            <span aria-hidden="true" className="workspace-section-icon">
              {icon}
            </span>
          }
          aria-current={key === section.key ? "true" : undefined}
          onClick={() => {
            if (key === "customers-opportunities") {
              if (!showCustomerMenu) navigate("workbench", !mobile);
              else if (!mobile) setCollapsed(false);
            } else {
              navigate(key);
            }
          }}
        >
          {label}
        </Button>
      ))}
    </nav>
  );
  const menu = [
    { key: "overview", icon: <DashboardOutlined />, label: "业务概况" },
    {
      type: "group" as const,
      label: "客户开发",
      children: [
        { key: "discover", icon: <ThunderboltOutlined />, label: "发现客户" },
        { key: "workbench", icon: <TeamOutlined />, label: "客户工作台" },
        { key: "customers", icon: <ContactsOutlined />, label: "客户档案" },
        { key: "jobs", icon: <UnorderedListOutlined />, label: "任务管理" },
      ],
    },
    {
      type: "group" as const,
      label: "业务工具",
      children: [
        {
          key: "directory",
          icon: <ApartmentOutlined />,
          label: "企业与联系人",
        },
        { key: "sources", icon: <GlobalOutlined />, label: "商业情报" },
        { key: "mail", icon: <MailOutlined />, label: "邮件管理" },
        { key: "company", icon: <BankOutlined />, label: "企业资料" },
      ],
    },
  ];
  const customerNavigation = (
    <>
      <div className="workspace-label">客户与商机</div>
      <Menu
        aria-label="客户与商机导航"
        theme="light"
        mode="inline"
        selectedKeys={[tab === "job-view" ? "jobs" : tab]}
        items={menu}
        onClick={({ key }) => navigate(key)}
      />
    </>
  );
  const pointsNavigation = (
    <div className="sidebar-bottom">
      <button
        className="points-entry"
        aria-label={`${data?.balance || "— 点数"}，用量与费用`}
        onClick={() => navigate("costs")}
      >
        <WalletOutlined />
        <span>
          <b>{data?.balance || "— 点数"}</b>
          <small>用量与费用</small>
        </span>
        <ArrowRightOutlined />
      </button>
    </div>
  );
  return (
    <>
      <div id="toast" role="status" aria-live="polite" hidden />
      <Auth ready={!!bridge} />
      {error && (
        <div className="startup-error">
          <Alert
            type="error"
            title={error}
            action={<Button onClick={() => location.reload()}>重新加载</Button>}
          />
        </div>
      )}
      <div
        id="workspace"
        className={`react-workspace${showCustomerMenu ? " has-customer-menu" : ""}`}
        hidden
      >
        <Layout>
          <aside className="primary-sidebar">
            <div className="primary-brand">
              <Brand compact />
            </div>
            {primaryNavigation}
            <Button
              className="primary-logout"
              aria-label="退出登录"
              type="text"
              icon={<LogoutOutlined />}
              onClick={signOut}
            />
          </aside>
          <Layout.Sider
            className="voken-sidebar"
            width={216}
            collapsedWidth={68}
            collapsed={collapsed}
            breakpoint="lg"
            onBreakpoint={setMobile}
            trigger={null}
          >
            {showCustomerMenu && !mobile && (
              <>
                {customerNavigation}
                {pointsNavigation}
              </>
            )}
          </Layout.Sider>
          <Layout className={`main-layout ${collapsed ? "is-collapsed" : ""}`}>
            <header className="workspace-topbar">
              <Space>
                {(mobile || showCustomerMenu) && (
                  <Button
                    type="text"
                    aria-label={
                      mobile ? "打开导航" : collapsed ? "展开导航" : "收起导航"
                    }
                    icon={
                      collapsed || mobile ? (
                        <MenuUnfoldOutlined />
                      ) : (
                        <MenuFoldOutlined />
                      )
                    }
                    onClick={() =>
                      mobile ? setNavOpen(true) : setCollapsed((v) => !v)
                    }
                  />
                )}
                <Breadcrumb
                  items={[
                    { title: "工作空间" },
                    { title: section.label },
                    ...(section.label === titles[tab]
                      ? []
                      : [{ title: titles[tab] }]),
                  ]}
                />
              </Space>
              <Space>
                <Tag className="workspace-tag" icon={<CheckCircleOutlined />}>
                  独立业务空间
                </Tag>
                <Avatar size={32} className="user-avatar">
                  微
                </Avatar>
              </Space>
            </header>
            <main className="workspace-content">
              <div className="react-page-header">
                <div>
                  <h1 id="page-title" tabIndex={-1}>
                    {titles[tab] || "业务概况"}
                  </h1>
                  {description && <Text type="secondary">{description}</Text>}
                </div>
                <Button
                  id="refresh"
                  hidden={showSectionHome && tab !== "my-overview"}
                  aria-label="刷新当前页面数据"
                  icon={<ReloadOutlined spin={data?.loading} />}
                  disabled={!bridge || data?.loading}
                >
                  刷新数据
                </Button>
              </div>
              {bridge && data?.session && (
                <div key={data.session?.workspace_id || "signed-out"}>
                  {showSectionHome && (
                    <SectionHome tab={tab} data={data} bridge={bridge} />
                  )}
                  {tab === "overview" && (
                    <Overview data={data} bridge={bridge} />
                  )}{" "}
                  {tab === "workbench" && (
                    <Workbench data={data} bridge={bridge} />
                  )}{" "}
                  {tab === "jobs" && <Tasks data={data} bridge={bridge} />}
                </div>
              )}
              <Legacy html={pages} className="business-pages" />
              <div className="compat-controls" aria-hidden="true" hidden>
                <details id="tools-nav" />
                <button id="balance" />
                <button id="logout" />
              </div>
              <footer className="workspace-footer">
                <span>微元 Voken · 让客户开发更进一步</span>
                <span>公开信息优先，增强由你选择</span>
              </footer>
            </main>
          </Layout>
        </Layout>
      </div>
      <Drawer
        title="工作空间导航"
        placement="left"
        open={navOpen && mobile && !!data?.session}
        onClose={() => setNavOpen(false)}
        className="mobile-navigation"
        size={300}
      >
        {primaryNavigation}
        {showCustomerMenu && customerNavigation}
        {pointsNavigation}
        <Button
          className="mobile-logout"
          aria-label="退出登录"
          type="text"
          icon={<LogoutOutlined />}
          onClick={signOut}
        >
          退出登录
        </Button>
      </Drawer>
    </>
  );
}
const nonce = document.querySelector<HTMLMetaElement>(
  'meta[name="csp-nonce"]',
)?.content;
createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    locale={zhCN}
    csp={nonce ? { nonce } : undefined}
    theme={{
      token: {
        colorPrimary: "#2457e7",
        colorText: "#10224b",
        colorTextSecondary: "#5a6884",
        colorBgLayout: "#f7f9fd",
        colorBorderSecondary: "#e9edf6",
        borderRadius: 8,
        fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", sans-serif',
        fontSize: 14,
        controlHeight: 38,
      },
      components: {
        Layout: { siderBg: "#ffffff", headerBg: "#ffffff" },
        Menu: {
          itemHeight: 44,
          itemMarginBlock: 5,
          itemBorderRadius: 8,
          itemSelectedBg: "#eef3ff",
        },
        Table: { headerBg: "#f8faff", cellPaddingBlock: 16 },
        Card: { paddingLG: 24 },
      },
    }}
  >
    <AntApp>
      <Workspace />
    </AntApp>
  </ConfigProvider>,
);
