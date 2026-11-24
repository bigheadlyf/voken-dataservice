import { useState } from "react";
import { Alert, Button, Form, Input, Modal, Select, Typography } from "antd";
import type { Bridge, RecordData } from "./bridge";

const fieldLabels = {
  stage: "销售阶段",
  contact: "商务联系方式",
  tags: "标签",
  next_followup_at: "下次跟进时间",
  do_not_contact: "联系状态",
};

export type CustomerAction = keyof typeof fieldLabels | "activity" | "draft";

const activityTypes = {
  note: "备注",
  email_sent: "已通过自有邮箱发送",
  reply: "收到回复",
  call: "通话",
  meeting: "会议",
  feedback: "线索质量反馈",
  opt_out: "收到拒绝联系请求",
};
const languages = {
  English: "英语",
  Chinese: "中文",
  Spanish: "西班牙语",
  German: "德语",
  French: "法语",
  Portuguese: "葡萄牙语",
};
const defaultObjective = "简洁介绍产品，询问对方是否有相关需求。";
const choices = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
const parseTags = (value: string) =>
  [...new Set(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))];

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function CustomerActionModal({
  action, row, bridge, stages, draftPrice, onClose, onSaved,
}: {
  action: CustomerAction;
  row: RecordData;
  bridge: Bridge;
  stages: Record<string, string>;
  draftPrice?: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customDraft, setCustomDraft] = useState(false);
  const title = action === "activity" ? "记录跟进"
    : action === "draft" ? "写开发信"
    : action === "do_not_contact" ? (row.do_not_contact ? "恢复联系" : "停止联系")
    : `修改${fieldLabels[action]}`;
  const activityKind = Form.useWatch("kind", form);
  const initialField = action === "tags" ? row.tags.join(", ")
    : action === "next_followup_at" ? localDateTime(row.next_followup_at)
    : row[action] ?? "";

  async function submit(values: RecordData) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (action === "draft") {
        await bridge.createDraft(row.id, {
          language: values.language || "English",
          objective: values.objective?.trim() || defaultObjective,
        });
        onClose();
        return;
      }
      if (action === "activity") {
        await bridge.recordActivity(row.id, { kind: values.kind, content: values.content.trim() });
      } else {
        const input = values.field ?? "";
        let value = input;
        if (action === "tags") value = parseTags(input);
        if (action === "contact") value = input.trim();
        if (action === "next_followup_at") {
          value = input ? new Date(input).toISOString() : null;
        }
        if (action === "do_not_contact") value = !row.do_not_contact;
        if (action === "do_not_contact" || input !== initialField) {
          await bridge.updateCustomer(row.id, row.version, { [action]: value });
        }
      }
      onSaved(action === "activity" ? "跟进已记录" : "客户详情已保存");
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} open width={440} footer={null}
      onCancel={busy ? undefined : onClose} closable={!busy} keyboard={!busy} maskClosable={!busy}>
      {error && <Alert className="modal-error" type="error" showIcon title={error} />}
      <Form form={form} layout="vertical" disabled={busy} data-extension="react"
        initialValues={{ field: initialField, kind: "note", language: "English", objective: defaultObjective }}
        onFinish={(values) => void submit(values)}>
        {action === "stage" && (
          <Form.Item name="field" label={fieldLabels.stage}>
            <Select virtual={false} options={choices(stages)} />
          </Form.Item>
        )}
        {action === "contact" && (
          <Form.Item name="field" label={fieldLabels.contact}>
            <Input maxLength={500} allowClear />
          </Form.Item>
        )}
        {action === "tags" && (
          <Form.Item name="field" label={fieldLabels.tags}
            rules={[{ validator: async (_, input: string) => {
              const tags = parseTags(input || "");
              if (tags.length > 20 || tags.some((tag) => tag.length > 40)) {
                throw new Error("最多 20 个标签，每个标签最多 40 字");
              }
            } }]}>
            <Input allowClear placeholder="多个标签用逗号分隔" />
          </Form.Item>
        )}
        {action === "next_followup_at" && (
          <Form.Item name="field" label="下次跟进时间（本地时间）">
            <Input type="datetime-local" />
          </Form.Item>
        )}
        {action === "do_not_contact" && (
          <Typography.Paragraph>
            {row.do_not_contact ? "恢复联系后可重新安排跟进。"
              : "停止联系会清除已设定的下次跟进时间。"}
          </Typography.Paragraph>
        )}
        {action === "activity" && (
          <>
            <Form.Item name="kind" label="记录类型">
              <Select options={choices(activityTypes)} />
            </Form.Item>
            <Form.Item name="content" label="跟进内容"
              rules={[{ required: true, whitespace: true, message: "请填写跟进内容" }]}>
              <Input.TextArea rows={3} maxLength={4000} placeholder="记录沟通结果或下一步" />
            </Form.Item>
            {activityKind === "opt_out" && (
              <Alert type="warning" title="保存后将停止联系该客户并清除下次跟进时间。" />
            )}
          </>
        )}
        {action === "draft" && (
          <>
            {!customDraft && <Typography.Text type="secondary">默认英文</Typography.Text>}
            <Button type="link" className="draft-options" aria-expanded={customDraft}
              onClick={() => setCustomDraft(!customDraft)}>
              {customDraft ? "收起草稿选项" : "修改语言和目标"}
            </Button>
            {customDraft && (
              <>
                <Form.Item name="language" label="语言"><Select options={choices(languages)} /></Form.Item>
                <Form.Item name="objective" label="这封信的目标"
                  rules={[{ required: true, whitespace: true, message: "请填写开发信目标" }]}>
                  <Input.TextArea rows={2} maxLength={1000} />
                </Form.Item>
              </>
            )}
          </>
        )}
        <div className="modal-form-footer">
          <Button autoInsertSpace={false} onClick={onClose}>取消</Button>
          <Button autoInsertSpace={false} type="primary" htmlType="submit" loading={busy}>
            {action === "draft"
              ? `生成草稿${draftPrice === undefined ? "" : ` · ${draftPrice} 点`}`
              : action === "do_not_contact" ? title : "保存"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
