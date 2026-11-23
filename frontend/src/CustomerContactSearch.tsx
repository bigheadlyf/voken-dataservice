import { useState } from "react";
import { Alert, Button, Checkbox, Form, Input, Modal, Select } from "antd";
import type { Bridge, RecordData } from "./bridge";

export type ContactSearch = "company" | "targeted";

export function CustomerContactSearch({
  kind, row, bridge, pointQuotes, onClose,
}: {
  kind: ContactSearch;
  row: RecordData;
  bridge: Bridge;
  pointQuotes: RecordData;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const targeted = kind === "targeted";
  const quote = pointQuotes[targeted ? "targeted_contacts" : "directory_companies"];
  const title = targeted ? "精准联系人检索" : "查企业与岗位";

  async function submit(values: RecordData) {
    if (busy) return;
    setBusy(true);
    setError("");
    const company = { company_name: values.company_name.trim() };
    try {
      await bridge.searchCustomerContacts(row.id, kind, targeted
        ? {
          ...company, website: values.website.trim(), contact_target: values.contact_target,
          contact_titles: (values.contact_titles || "").split(/[,，]/).map((title: string) => title.trim()).filter(Boolean),
          confirm_company_match: values.reviewed, confirm_paid: values.paid,
        }
        : {
          ...company, kind: "company", confirm_paid: values.paid,
          ...(/^[A-Z]{2}$/.test(row.location) ? { country: row.location } : {}),
        });
      onClose();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open title={title} width={480} footer={null}
      onCancel={busy ? undefined : onClose} closable={!busy} keyboard={!busy} maskClosable={!busy}>
      {error && <Alert className="modal-error" type="error" title={error} showIcon />}
      <Form layout="vertical" disabled={busy} data-extension="react"
        initialValues={{ company_name: row.name, website: row.website, contact_target: "procurement" }}
        onFinish={(values) => void submit(values)}>
        <Form.Item name="company_name" label="企业名称"
          rules={[{ required: true, whitespace: true, max: targeted ? 240 : 180 }]}>
          <Input maxLength={targeted ? 240 : 180} />
        </Form.Item>
        {targeted && (
          <>
            <Form.Item name="website" label="已核对的企业官网"
              rules={[{ required: true, type: "url", message: "请输入有效的企业官网地址" }]}>
              <Input maxLength={500} placeholder="https://buyer.com" />
            </Form.Item>
            <Form.Item name="contact_target" label="目标岗位">
              <Select options={[
                { value: "procurement", label: "采购 / 寻源 / 供应链" },
                { value: "leadership", label: "企业负责人" },
                { value: "sales", label: "销售 / 业务开发" },
                { value: "engineering", label: "技术 / 工程" },
              ]} />
            </Form.Item>
            <Button type="link" className="draft-options" aria-expanded={advanced}
              onClick={() => setAdvanced(!advanced)}>
              {advanced ? "收起具体职位" : "指定具体职位"}
            </Button>
            {advanced && (
              <Form.Item name="contact_titles" label="具体职位">
                <Input maxLength={480} placeholder="最多 6 个职位，用逗号分隔" />
              </Form.Item>
            )}
            <Form.Item name="reviewed" valuePropName="checked"
              rules={[{ validator: async (_, checked) => {
                if (!checked) throw new Error("请核对企业与官网归属");
              } }]}>
              <Checkbox>我已核对企业与官网归属</Checkbox>
            </Form.Item>
          </>
        )}
        <Form.Item name="paid" valuePropName="checked"
          rules={[{ validator: async (_, checked) => {
            if (!checked) throw new Error("请确认本次查询的点数预占");
          } }]}>
          <Checkbox disabled={!quote}>
            {quote ? `同意预占 ${quote.total_points} 点（平台 ${quote.platform_points} 点，数据 ${quote.data_points} 点）`
              : "当前报价暂不可用"}
          </Checkbox>
        </Form.Item>
        <div className="modal-form-footer">
          <Button autoInsertSpace={false} onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={busy} disabled={!quote}>开始查询</Button>
        </div>
      </Form>
    </Modal>
  );
}
