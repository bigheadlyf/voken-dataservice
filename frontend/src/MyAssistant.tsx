import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Button, Input, Select, Spin, Tag } from "antd";
import { CommentOutlined, PaperClipOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import type {
  AssistantConversation, AssistantInput, AssistantProposal, AssistantResult, AssistantTurn, Bridge,
} from "./bridge";
import "./assistant.css";

const suggestions = [
  "查看最近 5 条任务及状态",
  "查询已保存的企业和客户",
  "查看到期待跟进的客户",
  "用已有拓客员工创建一条任务",
];
const fieldLabels: Record<string, string> = {
  acquisition_tier: "获客档位", agent_id: "员工编号", analysis_id: "分析编号",
  body: "正文", expected_version: "资料版本", job_id: "任务编号", limit: "条数",
  instructions: "工作要求", lead_index: "线索序号", market: "市场", name: "名称",
  product: "产品", prospect_id: "客户编号", q: "搜索词", query: "查询内容",
  recipient: "收件人", stage: "阶段", statement: "确认声明", subject: "主题",
  target_count: "目标数量", order_id: "订单编号",
};
const valueLabels: Record<string, string> = {
  basic: "基础档", enhanced: "增强档", ai_enhanced: "AI 增强档",
};
const permissions: Record<string, string> = {
  confirm_accuracy: "我确认企业资料准确，并有权代表企业提供。",
  confirm_company_match: "我已核对企业归属。",
  confirm_external_check: "我同意提交外部邮箱验证。",
  confirm_import: "我已核对字段映射和来源，同意导入。",
  confirm_paid: "我同意本次付费数据查询或增强服务。",
  confirm_relationship: "我已核对邮件与客户的关系。",
  confirm_send: "我已核对收件人、联系理由、正文和页脚，确认提交邮件。",
};
const statusLabels: Record<string, string> = {
  queued: "已排队", running: "执行中", cancelling: "取消中", succeeded: "已完成",
  partial: "部分完成", failed: "失败", cancelled: "已取消",
};
const errors: Record<string, string> = {
  assistant_in_progress: "工作空间中已有一条助手消息在处理中，请稍后重试。",
  assistant_model_unavailable: "对话模型暂不可用，请稍后再试。",
  assistant_step_limit: "本次未能完成查询。可以补充筛选条件后再试。",
  assistant_execution_interrupted: "操作结果暂未确认，请先到对应业务页面查看状态。",
  assistant_interrupted: "本次对话已中断，请重新发送问题。",
  assistant_attachment_required: "请重新选择与操作中所列名称和大小一致的附件。",
  assistant_operation_unavailable: "这项站内操作暂不可用，请重新发起请求。",
  assistant_unavailable: "助手暂不可用，请稍后再试。",
};
const showValue = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? "";
const recordId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
function errorText(error: unknown) {
  const detail = (error as { detail?: string })?.detail;
  return (detail && errors[detail]) || (error instanceof Error ? error.message : "请求失败，请稍后重试。");
}

function OperationResult({ call, bridge }: { call: AssistantResult; bridge: Bridge }) {
  const jobId = call.job?.id || call.path.job_id || call.path.report_id;
  const customerId = call.path.prospect_id;
  const businessStatus = call.business_status;
  const qr = call.qr_data_url?.startsWith("data:image/svg+xml;base64,") ? call.qr_data_url : undefined;
  return (
    <div className="assistant-result">
      <div className="assistant-result-heading">
        <span>{call.label}</span>
        <Tag color={call.status === "failed" || businessStatus === "failed" ? "error" : "blue"}>
          {call.status === "failed" ? "接口调用失败" : businessStatus ? statusLabels[businessStatus] || businessStatus : "已返回"}
        </Tag>
      </div>
      {call.status === "failed" && <p className="assistant-result-error">{showValue(call.error) || `HTTP ${call.http_status}`}</p>}
      {qr && <img className="assistant-payment-qr" src={qr} alt="微信支付二维码" />}
      <div className="assistant-result-actions">
        {recordId(jobId) && call.status !== "failed" && (
          <Button size="small" onClick={() => { void bridge.navigate("jobs/" + jobId).catch(() => {}); }}>打开任务</Button>
        )}
        {recordId(customerId) && call.status !== "failed" && (
          <Button size="small" onClick={() => { void bridge.openCustomer(customerId).catch(() => {}); }}>打开客户</Button>
        )}
        {call.download_query && (
          <Button size="small" onClick={() => { void bridge.assistant.download(call.download_query!).catch(() => {}); }}>下载客户 CSV</Button>
        )}
      </div>
      {call.result != null && (
        <details>
          <summary>查看接口结果</summary>
          <pre>{showValue(call.result)}</pre>
        </details>
      )}
    </div>
  );
}

function Approval({ proposal, busy, fileSelected, onDecision }: {
  proposal: AssistantProposal; busy: boolean; fileSelected: boolean; onDecision: (approve: boolean) => void;
}) {
  const fields = [...Object.entries(proposal.path), ...Object.entries(proposal.query), ...Object.entries(proposal.body || {})];
  return (
    <section className="assistant-approval" aria-label="待确认操作">
      <strong>{proposal.label}</strong>
      <code>{proposal.operation}</code>
      {fields.length > 0 && (
        <dl>
          {fields.map(([key, value], index) => (
            <div key={`${key}-${index}`}>
              <dt>{fieldLabels[key] || key}</dt>
              <dd>{(key === "acquisition_tier" && valueLabels[value]) || showValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
      {proposal.attachment && <p>附件 {proposal.attachment.name}（{proposal.attachment.size.toLocaleString()} 字节）</p>}
      {proposal.attachment && !fileSelected && <p>请用下方附件按钮重新选择上述文件。</p>}
      {proposal.mail?.sender && <p>发件人 {proposal.mail.sender}</p>}
      {proposal.mail?.footer && <p className="assistant-message-text">发送页脚{"\n"}{proposal.mail.footer}</p>}
      {proposal.point_quote && (
        <p>预计预占 {proposal.point_quote.total_points} 点{proposal.point_quote.data_points > 0 && `，含数据额度 ${proposal.point_quote.data_points} 点`}</p>
      )}
      {proposal.authorizations.map((name) => <p key={name}>{permissions[name] || name}</p>)}
      <div className="assistant-result-actions">
        <Button disabled={busy} onClick={() => onDecision(false)}>取消</Button>
        <Button type="primary" disabled={busy || (!!proposal.attachment && !fileSelected)} onClick={() => onDecision(true)}>
          确认执行
        </Button>
      </div>
    </section>
  );
}

export function MyAssistant({ workspace, bridge }: { workspace: string; bridge: Bridge }) {
  const storageKey = "voken-assistant:" + workspace;
  const { assistant } = bridge;
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [conversation, setConversation] = useState<string>();
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState<{ input: AssistantInput; key: string; file?: File }>();
  const files = useRef(new Map<string, File>());
  const fileInput = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const active = turns.find((turn) => ["running", "executing"].includes(turn.status));
  const latest = turns.at(-1);
  const locked = busy || !!active;

  const saveConversation = (id?: string) => {
    setConversation(id);
    sessionStorage.setItem(storageKey, id || "new");
  };
  const selectConversation = async (id?: string) => {
    if (!id) {
      setTurns([]);
      setHasMore(false);
    } else {
      const history = await assistant.history(id);
      setTurns(history.turns);
      setHasMore(history.has_more);
    }
    saveConversation(id);
  };
  useEffect(() => {
    let current = true;
    void (async () => {
      try {
        const list = await assistant.list();
        if (!current) return;
        setConversations(list);
        const saved = sessionStorage.getItem(storageKey);
        const selected = saved === "new" ? undefined : saved || list[0]?.id;
        if (selected) {
          const history = await assistant.history(selected);
          if (!current) return;
          setTurns(history.turns);
          setHasMore(history.has_more);
          setConversation(selected);
        }
      } catch (e) {
        if (current) setError(errorText(e));
      } finally {
        if (current) setBusy(false);
      }
    })();
    return () => { current = false; };
  }, [assistant, storageKey]);

  const updateTurn = (turn: AssistantTurn) => setTurns((old) => old.some((item) => item.id === turn.id)
    ? old.map((item) => item.id === turn.id ? turn : item)
    : [...old, turn]);

  useEffect(() => {
    if (!active) return;
    let current = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const turn = await assistant.get(active.id);
        if (!current) return;
        if (["running", "executing"].includes(turn.status)) timer = setTimeout(poll, 2000);
        else updateTurn(turn);
      } catch (e) {
        if (!current) return;
        setError(errorText(e));
        timer = setTimeout(poll, 5000);
      }
    };
    timer = setTimeout(poll, 1500);
    return () => { current = false; clearTimeout(timer); };
  }, [active, assistant]);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [latest?.id, latest?.status, sending]);

  const changeConversation = async (id?: string) => {
    setBusy(true);
    setError("");
    try {
      await selectConversation(id);
      setContent("");
      setFile(undefined);
      setRetry(undefined);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };
  const loadOlder = async () => {
    if (!conversation || !turns[0]) return;
    setBusy(true);
    setError("");
    try {
      const history = await assistant.history(conversation, turns[0].id);
      setTurns((old) => [...history.turns, ...old]);
      setHasMore(history.has_more);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };
  const send = async (previous?: typeof retry) => {
    if (locked || (!previous && !content.trim())) return;
    const input: AssistantInput = {
      content: content.trim(), conversation_id: conversation,
      attachment: file && { name: file.name, size: file.size },
    };
    const submission = previous || {
      input, file, key: Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join(""),
    };
    setBusy(true);
    setError("");
    setSending(submission.input.content);
    try {
      const turn = await assistant.send(submission.input, submission.key);
      if (submission.file && (turn.status === "running" || turn.proposal?.attachment)) {
        files.current.set(turn.id, submission.file);
      }
      if (!conversation) {
        saveConversation(turn.conversation_id);
        setConversations((old) => [
          { id: turn.conversation_id, title: turn.content.slice(0, 70) },
          ...old.filter(({ id }) => id !== turn.conversation_id),
        ].slice(0, 20));
      }
      updateTurn(turn);
      setRetry(undefined);
      setContent("");
      setFile(undefined);
    } catch (e) {
      setRetry(submission);
      setError(errorText(e));
    } finally {
      setSending("");
      setBusy(false);
    }
  };
  const approvalFile = (turn: AssistantTurn) => {
    const expected = turn.proposal?.attachment;
    if (!expected) return undefined;
    return files.current.get(turn.id) || (file?.name === expected.name && file.size === expected.size ? file : undefined);
  };
  const decide = async (turn: AssistantTurn, approve: boolean) => {
    if (locked) return;
    setBusy(true);
    setError("");
    try {
      const attachment = approvalFile(turn);
      updateTurn(await assistant.decide(turn.id, approve, approve ? attachment : undefined));
      files.current.delete(turn.id);
      if (attachment && attachment === file) setFile(undefined);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };
  const edit = (value: string) => { setContent(value); setRetry(undefined); };

  return (
    <section className="assistant-shell" aria-label="助手对话">
      <div className="assistant-toolbar">
        <Select
          aria-label="最近对话"
          placeholder="最近对话"
          value={conversation}
          options={conversations.map(({ id, title }) => ({ value: id, label: title }))}
          disabled={locked || !conversations.length}
          onChange={(id) => { void changeConversation(id); }}
        />
        <Button icon={<PlusOutlined aria-hidden="true" />} disabled={locked} onClick={() => { void changeConversation(); }}>新对话</Button>
      </div>
      <div className="assistant-log" ref={log} role="log" aria-label="对话记录" aria-busy={locked}>
        {hasMore && <Button className="assistant-older" type="link" disabled={locked} onClick={() => { void loadOlder(); }}>加载更早的对话</Button>}
        {!turns.length && !sending && (
          <div className="assistant-welcome">
            <Avatar size={52} icon={<CommentOutlined />} />
            <h2>今天想处理什么？</h2>
            <p>用对话查询工作空间数据，或安排任务和客户跟进。</p>
            <div className="assistant-suggestions">
              {suggestions.map((label) => (
                <Button key={label} disabled={locked} onClick={() => edit(label)}>{label}</Button>
              ))}
            </div>
          </div>
        )}
        {turns.map((turn) => (
          <div className="assistant-turn" key={turn.id}>
            <div className="assistant-user-message">
              <span className="assistant-message-text">{turn.content}</span>
              {turn.attachment && <Tag icon={<PaperClipOutlined />}>{turn.attachment.name}</Tag>}
            </div>
            <div className="assistant-answer">
              <Avatar size={30} icon={<CommentOutlined />} />
              <div className="assistant-answer-content">
                {turn.response && <div className="assistant-message-text">{turn.response}</div>}
                {turn.error && <Alert type="error" showIcon title={errors[turn.error] || turn.error} />}
                {turn.calls.map((call, index) => <OperationResult key={index} call={call} bridge={bridge} />)}
                {turn.status === "pending" && turn.proposal && (
                  <Approval proposal={turn.proposal} busy={locked} fileSelected={!!approvalFile(turn)}
                    onDecision={(approve) => { void decide(turn, approve); }} />
                )}
                {["running", "executing"].includes(turn.status) && (
                  <div className="assistant-loading"><Spin size="small" />{turn.status === "running" ? "正在处理…" : "正在提交操作…"}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="assistant-turn">
            <div className="assistant-user-message assistant-message-text">{sending}</div>
            <div className="assistant-loading"><Spin size="small" />正在处理…</div>
          </div>
        )}
      </div>
      <div className="assistant-composer">
        {error && (
          <Alert type="error" showIcon title={error} closable onClose={() => setError("")}
            action={retry && <Button size="small" disabled={locked} onClick={() => { void send(retry); }}>重试原消息</Button>} />
        )}
        <form onSubmit={(event) => { event.preventDefault(); void send(retry); }}>
          {file && <Tag closable onClose={() => { setFile(undefined); setRetry(undefined); }} icon={<PaperClipOutlined />}>{file.name}</Tag>}
          <Input.TextArea
            aria-label="给助手发消息"
            placeholder="例如：查询最近的拓客任务"
            autoSize={{ minRows: 2, maxRows: 5 }}
            variant="borderless"
            maxLength={8000}
            value={content}
            disabled={locked}
            onChange={(event) => edit(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send(retry);
              }
            }}
          />
          <div className="assistant-composer-actions">
            <input type="file" ref={fileInput} hidden onChange={(event) => {
              const selected = event.target.files?.[0];
              event.target.value = "";
              if (!selected) return;
              if (!selected.size || selected.size > 50 * 1024 * 1024) {
                setError("请选择非空且不超过 50 MiB 的文件。");
                return;
              }
              setFile(selected);
              setRetry(undefined);
              setError("");
            }} />
            <Button type="text" htmlType="button" aria-label="添加附件" icon={<PaperClipOutlined />} disabled={locked}
              onClick={() => fileInput.current?.click()} />
            <Button type="primary" htmlType="submit" icon={<SendOutlined aria-hidden="true" />} disabled={locked || !content.trim()}>发送</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
