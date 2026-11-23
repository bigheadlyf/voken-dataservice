import { useState } from "react";
import {
  Alert,
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";
import type { Bridge, RecordData } from "./bridge";

export type WorkbenchAction = {
  kind: "review" | "event" | "followup";
  row?: RecordData;
  ids?: string[];
};
export function WorkbenchActionModal({
  action,
  bridge,
  onClose,
  onSaved,
}: {
  action: WorkbenchAction;
  bridge: Bridge;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [multiRound, setMultiRound] = useState(false);
  const eventType = Form.useWatch("type", form);
  const title =
    action.kind === "review"
      ? "记录企业匹配评审"
      : action.kind === "event"
        ? "记录联系进展"
        : `为 ${action.ids?.length || 0} 家企业安排跟进`;
  async function submit(values: RecordData) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (action.kind === "review")
        await bridge.post("/assessments", {
          prospect_id: action.row!.id,
          status: values.status,
          reason: values.reason.trim(),
        });
      else if (action.kind === "event")
        await bridge.post(
          "/events",
          {
            prospect_id: action.row!.prospect_id,
            email: values.email?.trim() || "",
            type: values.type,
            content: values.content.trim(),
            source: "user_recorded",
          },
          "event",
        );
      else {
        await bridge.post(
          "/followups",
          {
            prospect_ids: action.ids,
            due_at: values.due_at.toISOString(),
            intervals_days: (values.intervals || "")
              .split(/[,，]/)
              .filter((v: string) => v.trim())
              .map(Number),
            objective: values.objective.trim(),
          },
          "followup",
        );
        bridge.select([]);
      }
      onClose();
      void message.success(
        action.kind === "review"
          ? "企业评审已保存"
          : action.kind === "event"
            ? "联系进展已记录"
            : "跟进提醒已安排",
      );
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={title}
      open
      onCancel={() => {
        if (!busy) onClose();
      }}
      maskClosable={!busy}
      keyboard={!busy}
      closable={!busy}
      footer={null}
    >
      {error && (
        <Alert type="error" title={error} showIcon className="modal-error" />
      )}
      <Form
        form={form}
        layout="vertical"
        disabled={busy}
        scrollToFirstError={{ focus: true }}
        data-extension="react"
        onFinish={(values) => void submit(values)}
        initialValues={{
          status: "unknown",
          type: "reply",
          email: action.row?.email || "",
        }}
      >
        {action.kind === "review" && (
          <>
            <Typography.Paragraph type="secondary">
              {action.row!.name} · 新增独立评审记录，并保留原始证据。
            </Typography.Paragraph>
            <Form.Item
              name="status"
              label="企业匹配判断"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "fit", label: "符合目标客户画像" },
                  { value: "not_fit", label: "不符合" },
                  { value: "unknown", label: "依据不足，待核实" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="理由与来源证据"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "请填写判断理由与证据",
                },
              ]}
            >
              <Input.TextArea
                maxLength={1000}
                rows={4}
                showCount
                placeholder="说明企业角色、产品匹配与判断依据"
              />
            </Form.Item>
          </>
        )}
        {action.kind === "event" && (
          <>
            <Typography.Paragraph type="secondary">
              {action.row!.company} · {action.row!.name || "已记录的联系入口"}
            </Typography.Paragraph>
            <Form.Item
              name="type"
              label="事件类型"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "reply", label: "收到回复" },
                  { value: "bounce", label: "退信" },
                  { value: "opt_out", label: "拒绝联系" },
                  { value: "meeting", label: "会议" },
                  { value: "note", label: "备注" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="事件关联邮箱"
              rules={[
                {
                  required: ["bounce", "opt_out"].includes(eventType),
                  message: "退信或拒绝联系时请填写事件邮箱",
                },
                { type: "email", message: "请输入有效邮箱" },
              ]}
            >
              <Input type="email" maxLength={254} />
            </Form.Item>
            <Form.Item
              name="content"
              label="联系进展"
              rules={[
                { required: true, whitespace: true, message: "请填写联系进展" },
              ]}
            >
              <Input.TextArea maxLength={4000} rows={4} showCount />
            </Form.Item>
            <Alert
              type="info"
              title="退信与拒绝联系会拦截后续发送；收到回复会暂停后续提醒。"
            />
          </>
        )}
        {action.kind === "followup" && (
          <>
            <Form.Item
              name="due_at"
              label="首次提醒时间（本地时间）"
              rules={[{ required: true, message: "请选择首次提醒时间" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                placeholder="选择提醒时间"
                className="full-width"
              />
            </Form.Item>
            <Button type="link" className="draft-options" aria-expanded={multiRound}
              onClick={() => setMultiRound(!multiRound)}>
              {multiRound ? "收起多轮提醒" : "设置多轮提醒"}
            </Button>
            {multiRound && <Form.Item
              name="intervals"
              preserve={false}
              label="后续提醒（相对首次的天数）"
              rules={[
                {
                  validator: (_, value) => {
                    const days = String(value || "")
                      .split(/[,，]/)
                      .filter((v) => v.trim())
                      .map(Number);
                    return days.length <= 5 &&
                      days.every(
                        (v) => Number.isInteger(v) && v >= 1 && v <= 90,
                      ) &&
                      new Set(days).size === days.length &&
                      days.every((v, i) => i === 0 || v > days[i - 1])
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔",
                          ),
                        );
                  },
                },
              ]}
            >
              <Input placeholder="例如：3,7,14" />
            </Form.Item>}
            <Form.Item
              name="objective"
              label="跟进目标"
              rules={[
                { required: true, whitespace: true, message: "请填写跟进目标" },
              ]}
            >
              <Input.TextArea
                rows={3}
                maxLength={500}
                showCount
                placeholder="例如：核对采购职责，审阅并准备第一封开发信"
              />
            </Form.Item>
            <Alert
              type="info"
              title="这里只安排提醒。每封邮件仍需单独审阅确认后发送。"
            />
          </>
        )}
        <div className="modal-form-footer">
          <Button onClick={onClose} disabled={busy}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={busy}>
            {action.kind === "review"
              ? "保存评审"
              : action.kind === "event"
                ? "记录进展"
                : "安排提醒"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
