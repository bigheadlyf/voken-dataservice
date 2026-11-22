export const FILTER_DEFAULTS: Record<string, string | boolean> = {
  mode: "companies",
  q: "",
  country_filter: "",
  stage: "",
  tag: "",
  target: "procurement",
  verification: "",
  role_filter: "",
  has_email: false,
  due: false,
  ready_only: false,
};
export const DEFAULT_COLUMNS = [
  "company",
  "location",
  "stage",
  "contacts",
  "assessment",
  "action",
];
const STORAGE_KEY = "voken-workbench-display-v1";
export type TablePreferences = {
  density: "comfortable" | "compact";
  columns: string[];
};

export function normalizedFilters(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(FILTER_DEFAULTS).map(([key, fallback]) => [
      key,
      typeof fallback === "boolean"
        ? values[key] === true
        : String(values[key] ?? fallback).trim(),
    ]),
  );
}
export function sameFilters(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
) {
  return (
    JSON.stringify(normalizedFilters(a)) ===
    JSON.stringify(normalizedFilters(b))
  );
}
export function filterChips(
  values: Record<string, unknown>,
  stages: Record<string, string>,
  verification: Record<string, string>,
) {
  const filters = normalizedFilters(values);
  const labels: Record<string, string> = {
    q: `搜索：${filters.q}`,
    country_filter: `地区：${filters.country_filter}`,
    stage: `阶段：${stages[String(filters.stage)] || filters.stage}`,
    tag: `标签：${filters.tag}`,
    target: (
      {
        leadership: "目标：企业负责人",
        sales: "目标：销售 / 业务开发",
      } as Record<string, string>
    )[String(filters.target)],
    verification: `邮箱：${verification[String(filters.verification)] || filters.verification}`,
    role_filter: (
      {
        keyword_match: "命中岗位关键词",
        needs_review: "岗位待核实",
        unknown: "岗位未知",
      } as Record<string, string>
    )[String(filters.role_filter)],
    has_email: "有完整邮箱",
    due: "到期跟进",
    ready_only: "已评审、岗位匹配且邮箱近期有效",
  };
  return Object.entries(filters)
    .filter(([key, value]) => key !== "mode" && value !== FILTER_DEFAULTS[key])
    .map(([key]) => ({ key, label: labels[key] || key }));
}
function sanitizePreferences(value: unknown): TablePreferences {
  const saved =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const selected = Array.isArray(saved.columns) ? saved.columns : null;
  const columns = selected
    ? DEFAULT_COLUMNS.filter(
        (key) => ["company", "action"].includes(key) || selected.includes(key),
      )
    : [...DEFAULT_COLUMNS];
  return {
    density: saved.density === "compact" ? "compact" : "comfortable",
    columns,
  };
}
export function readTablePreferences(): TablePreferences {
  try {
    return sanitizePreferences(
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"),
    );
  } catch {
    return sanitizePreferences(null);
  }
}
export function writeTablePreferences(value: TablePreferences) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sanitizePreferences(value)),
    );
  } catch {}
}
export function formatDate(value: unknown) {
  if (!value) return "未提供";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime())
    ? "日期待核实"
    : parsed.toLocaleString("zh-CN", { hour12: false });
}
export const historyLabels: Record<string, string> = {
  created: "保存客户",
  updated: "调整跟进",
  note: "备注",
  email_sent: "已发送邮件",
  reply: "收到回复",
  call: "通话",
  meeting: "会议",
  feedback: "线索反馈",
  opt_out: "拒绝联系",
  draft_requested: "生成开发信",
  research_requested: "公域查证",
  contact_selected: "采用联系信息",
  assessment: "企业匹配评审",
  verification: "独立邮箱验证",
  contact_event: "联系事件",
  followup: "跟进提醒",
  followup_done: "完成提醒",
  bounce: "退信",
};
