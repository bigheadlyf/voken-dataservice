// The remaining business forms share the original, tenant-aware API and submission logic.
// React owns the shell and data views; the compatibility DOM is never reconciled by React.
export type RecordData = Record<string, any>;
export interface ProspectingAgent {
  id: string;
  status: string;
  config: { name: string; instructions: string; market?: string | null; product?: string | null };
}
export interface Snapshot {
  session: RecordData | null;
  tab: string;
  customerId: string | null;
  customerTab: string;
  prices: RecordData;
  pointQuotes: RecordData;
  balance: string;
  summary: RecordData | null;
  dashboardAgents: ProspectingAgent[] | null;
  dashboardAgentsError: boolean;
  jobs: RecordData[];
  workbench: RecordData;
  workbenchError: string;
  loading: boolean;
}
export interface Bridge {
  snapshot(): Snapshot;
  navigate(tab: string): Promise<void>;
  refresh(): Promise<void>;
  filter(values: RecordData, offset?: number): Promise<void>;
  select(ids: string[]): void;
  detail(id: string): Promise<RecordData>;
  post(path: string, body: RecordData, slot?: string): Promise<RecordData>;
  openCustomer(id: string, tab?: "profile" | "contacts"): Promise<void>;
  closeCustomer(): void;
  updateCustomer(id: string, version: number, changes: RecordData): Promise<RecordData>;
  recordActivity(id: string, values: RecordData): Promise<RecordData>;
  createDraft(id: string, values: RecordData): Promise<void>;
  searchCustomerContacts(id: string, kind: "company" | "targeted", values: RecordData): Promise<void>;
  applySourceContact(id: string, values: RecordData): Promise<RecordData>;
  refreshCustomers(): Promise<void>;
  exportCustomers(): Promise<void>;
  action(fn: () => Promise<unknown>): Promise<void>;
  saveView(name: string): Promise<void>;
  applyView(index: number): Promise<void>;
}
declare global {
  interface Window {
    voken: Bridge;
    __VOKEN_REACT__: boolean;
  }
}
export const UI_EVENT = "voken:updated";
export function assetBase() {
  const path = window.location.pathname;
  return path.endsWith("/app") || path.endsWith("/app/")
    ? path.replace(/\/app\/?$/, "/app-assets/")
    : "/app-assets/";
}
let initialization: Promise<Bridge> | undefined;
export function initialize(): Promise<Bridge> {
  if (initialization) return initialization;
  window.__VOKEN_REACT__ = true;
  initialization = (async () => {
    for (const id of ["auth", "workspace", "login-form", "logout", "balance", "refresh", "wb-filter", "company-form", "discovery-form"]) {
      if (!document.getElementById(id)) {
        throw new Error("界面初始化未完成，请刷新重试。");
      }
    }
    for (const file of [
      "app.js",
      "account.js",
      "discovery.js",
      "directory.js",
      "workbench.js",
      "react-bridge.js",
    ]) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          assetBase() +
          file +
          "?v=" +
          (new URL(import.meta.url).searchParams.get("v") || "development");
        const cleanup = () => window.removeEventListener("error", onRuntimeError);
        const onRuntimeError = (event: ErrorEvent) => {
          if (event.filename && event.filename.split("?")[0] === script.src.split("?")[0]) {
            cleanup();
            reject(new Error("界面资源初始化失败，请刷新重试。"));
          }
        };
        window.addEventListener("error", onRuntimeError);
        script.onload = () => { cleanup(); resolve(); };
        script.onerror = () => {
          cleanup();
          reject(new Error("界面资源加载失败，请刷新重试。"));
        };
        document.head.appendChild(script);
      });
    }
    return window.voken;
  })();
  return initialization;
}
