import{r as h,j as e,c as An}from"./react-vendor-ovhI6CXq.js";import{P as Tn,R as Dn,A as Se,F as _,M as W,a as z,T as me,S as V,I as L,D as Ln,B as r,C as ae,b as R,c as fe,d as le,e as un,f as A,g as pn,h as we,i as Ie,j as Ee,k as Fn,l as qe,m as Le,n as Me,o as mn,p as Rn,q as X,r as Be,s as ke,t as he,u as zn,z as Pn,L as $e,v as Je,w as F,x as Mn,y as Bn,E as On,G as hn,H as bn,J as xn,K as vn,N as Un,O as Vn,Q as Oe,U as yn,V as Fe,W as Hn,X as _e,Y as Xe,Z as Kn,_ as Qe,$ as Re,a0 as jn,a1 as fn,a2 as ie,a3 as Yn,a4 as Gn,a5 as Wn,a6 as Zn}from"./antd-vendor-DnRrfxI0.js";const Jn=`        <section id="overview" class="tab-panel">
          <div class="welcome">
            <div>
              <div class="actions"><button data-tab="discover" class="light">创建找客户任务 ↗</button><button data-tab="workbench" class="hero-secondary">查看客户工作台 →</button></div>
            </div>
          </div>
          <div class="workflow-guide" aria-label="客户开发四步流程">
            <button data-tab="discover"><b>搜索客户</b></button>
            <button data-tab="jobs"><b>筛选客户</b></button>
            <button data-tab="workbench"><b>保存客户</b></button>
            <button data-tab="mail"><b>邮件触达</b></button>
          </div>
          <div id="stats" class="stats"></div>
          <div class="panel">
            <h3>待跟进</h3>
            <div id="next-actions"></div>
          </div>
        </section>
        <section id="discover" class="tab-panel" hidden>
          <div class="discovery-mode-bar">

            <div class="mode-switch" role="tablist" aria-label="任务创建方式">
              <button id="discovery-chat-tab" type="button" role="tab" aria-selected="true" aria-controls="discovery-chat-pane" data-discovery-mode="chat">AI 引导</button>
              <button id="discovery-form-tab" type="button" role="tab" aria-selected="false" aria-controls="discovery-form-pane" tabindex="-1" data-discovery-mode="form">手动填写</button>
            </div>
          </div>
          <div class="grid-two discovery-layout">
            <div id="discovery-form-pane" role="tabpanel" aria-labelledby="discovery-form-tab" hidden>
            <form id="discovery-form" class="panel">
              <div class="form-row">
                <label
                  >目标市场<input
                    name="market"
                    maxlength="100"
                    required
                    placeholder="德国" /></label
                ><label
                  >产品<input
                    name="product"
                    maxlength="150"
                    required
                    placeholder="商用 LED 筒灯"
                /></label>
              </div>
              <label
                >客户角色<select name="buyer_role">
                  <option value="any">不限，按描述筛选</option>
                  <option value="distributor">分销商 / 进口商</option>
                  <option value="manufacturer">制造商</option>
                  <option value="brand">终端客户 / 品牌</option>
                  <option value="service_provider">服务商 / 工程商</option>
                  <option value="public_buyer">政府 / 公共机构采购方</option>
                </select></label
              >
              <details id="discovery-form-options" class="advanced-options">
              <summary>更多条件与任务设置（选填）</summary>
              <label>任务名称<input name="name" maxlength="80" placeholder="默认使用市场与产品命名" /></label>
              <label
                >客户特征与筛选要求（选填）<textarea
                  name="instructions"
                  maxlength="1600"
                  rows="3"
                  placeholder="寻找有实体门店的照明经销商，排除制造商和货代。优先有供应商招募信息的企业。"
                ></textarea>
              </label>


              <div class="form-row">
                <label
                  >目标数量<input
                    name="target_count"
                    type="number"
                    min="1"
                    max="30"
                    value="10"
                    required /></label
                ><label
                  >HS 编码（选填）<input
                    name="hs_code"
                    pattern="[0-9]{6,10}"
                    placeholder="6–10 位数字"
                /></label>
              </div>
              <label
                >理想客户官网（选填）<input
                  name="seed_website"
                  type="url"
                  maxlength="500"
                  placeholder="https://example-buyer.com" /></label
              ><label
                >排除条件（逗号分隔）<input
                  name="exclude_keywords"
                  placeholder="货代、无关产品、只做零售" /></label
              ><label>更多参考客户官网（选填，最多5个，每行一个）<textarea name="reference_websites" rows="2" placeholder="https://buyer-one.com&#10;https://buyer-two.com"></textarea></label><label>排除客户域名（逗号分隔，含子域名）<input name="exclude_domains" placeholder="competitor.com, existing-customer.com" /></label>
              <label class="check"><input name="ted" type="checkbox" />同时查近 90 天 TED 官方招标（仍须核对时效及投标资格）</label>
              </details>
              <label
                >数据方案<select name="tier">
                  <option value="basic">基础发现 · 公开搜索</option>
                  <option value="enhanced">
                    高级档 · 公开搜索 + 跨境魔方
                  </option>
                  <option value="ai_enhanced">AI 增强 · 含岗位联系人</option><option value="enhanced_contacts">联系信息增强 · 优先前 2 家</option>
                </select></label
              ><label id="discovery-contact-target" hidden>AI增强目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label
              ><label class="check" id="paid-label" hidden
                ><input name="paid" type="checkbox" />同意预占所示点数</label
              ><div class="actions"><button id="discovery-preview" type="button">先看最多5家真实样本</button><button class="primary" type="submit">开始找客户 →</button></div>
              <div class="copy-heading"><span id="discovery-price" class="hint"></span><details class="copy-help"><summary aria-label="预占点数说明"></summary><div class="copy-help-content">按明确回传的费用结算并释放差额，异常回传不追加扣点。</div></details></div>
            </form>
            </div>
            <div id="discovery-chat-pane" class="panel discovery-chat" role="tabpanel" aria-labelledby="discovery-chat-tab">
              <div class="chat-heading"><div><div class="copy-heading"><h2>找客条件</h2><details class="copy-help"><summary aria-label="找客说明"></summary><div class="copy-help-content">填写产品，选择目标市场或请 AI 推荐。默认找 10 家。确认方案前不会创建任务，刷新或退出后清空对话。</div></details></div></div><button id="discovery-chat-reset" type="button">重新开始</button></div>
              <div class="builder-steps" aria-label="任务构建流程"><span id="builder-step-brief" aria-current="step">1 条件</span><span id="builder-step-plan">2 方案</span><span>3 创建</span></div>
              <details id="discovery-transcript" hidden><summary>对话记录</summary><div id="discovery-chat-messages" class="chat-messages" role="log" aria-label="任务规划对话" aria-live="polite"></div></details>
              <div id="discovery-chat-brief"></div>
              <div id="discovery-chat-questions" aria-live="polite"></div>
              <div id="discovery-chat-examples" class="chat-examples">
                <button type="button" data-discovery-example="我们做商用 LED 灯具，想找德国的分销商，先找 10 家，排除只做零售的公司。">试填：德国照明分销商</button>
              </div>
              <details id="discovery-free-text"><summary>描述需求</summary>
                <form id="discovery-chat-form" data-extension="discovery">
                  <label for="discovery-chat-input">找客需求</label>
                  <textarea id="discovery-chat-input" name="content" rows="3" maxlength="2400" placeholder="例如：我们生产商用 LED 灯具，想找德国分销商，排除零售商……" required></textarea>
                  <div class="chat-composer-footer"><button type="submit" class="primary">整理需求 ↑</button></div>
                </form>
              </details>
              <div id="discovery-chat-error" class="chat-error" role="alert" hidden></div>
              <button id="discovery-chat-retry" type="button" hidden>重试整理（保留刚才的选择）</button>
              <div id="discovery-chat-plan"></div>
            </div>
            <div class="panel discovery-guide">
              <div class="copy-heading"><h3>最近任务</h3><details class="copy-help"><summary aria-label="找客数据说明"></summary><div class="copy-help-content">基础档查询公开资料，增强档按预算补充数据。公开记录和历史交易可作为线索，采购需求及联系方式需另行核实。</div></details></div>
              <div id="recent-discoveries" class="stack"></div>
              <hr />
              <details><summary>定期更新客户线索（可选）</summary>
              <form id="schedule-form">
                <label
                  >选择已建任务<select
                    name="agent_id"
                    id="schedule-agent"
                    required
                  ></select
                ></label>
                <div class="form-row">
                  <label
                    >每隔多少天<input
                      name="interval_days"
                      type="number"
                      min="1"
                      max="90"
                      value="14"
                      required /></label
                  ><label
                    >后续运行次数<input
                      name="remaining_runs"
                      type="number"
                      min="1"
                      max="365"
                      value="4"
                      required
                  /></label>
                </div>
<details class="copy-help"><summary aria-label="定期更新说明"></summary><div class="copy-help-content">首次在一个周期后执行，之后按设定频率运行。仅使用基础档，每次按报价扣点。</div></details>
                <button type="submit">启用定期更新</button>
              </form>
              <div id="schedule-list" class="stack"></div></details>
            </div>
          </div>
        </section>
        <section id="directory" class="tab-panel" hidden>
          <form id="targeted-contact-form" data-extension="directory" class="panel"><div class="copy-heading"><h3>精准联系人检索</h3><details class="copy-help"><summary aria-label="精准联系人检索说明"></summary><div class="copy-help-content">按企业官网和岗位检索，最多查询两次。邮箱是候选，仍需核对企业归属和有效性。</div></details></div><input type="hidden" name="prospect_id"><label>企业名称<input name="company_name" required maxlength="240"></label><label>已核对的企业官网<input name="website" type="url" required maxlength="500" placeholder="https://buyer.com"></label><label>AI增强目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label><label>具体职位（选填，逗号分隔，最多6个）<input name="contact_titles" maxlength="480" placeholder="Purchasing Manager, Sourcing Director"></label><p class="notice" id="targeted-contact-price">报价未加载</p><label class="check"><input type="checkbox" name="reviewed" required>我已核对企业与官网归属</label><label class="check"><input type="checkbox" name="paid" required>同意按所示报价预占平台点数与数据预算</label><button type="submit" class="primary">开始精准联系人检索</button></form>

          <details class="panel"><summary>按产品查询历史贸易记录</summary><form id="trade-form" data-extension="directory">
            <div class="form-row"><label>英文产品词<input name="product" maxlength="150" placeholder="food pan" /></label><label>HS 编码（可代替产品词）<input name="hs_code" pattern="[0-9]{6,10}" /></label></div>
            <div class="form-row"><label>买方国家（选填）<input name="buyer_country" pattern="[A-Z]{2}" placeholder="US" /></label><label>买方名称（选填）<input name="buyer" maxlength="200" /></label></div>
            <div class="form-row"><label>原产国（选填）<input name="origin_country" pattern="[A-Z]{2}" placeholder="CN" /></label><label>抵运国（选填）<input name="arrival_country" pattern="[A-Z]{2}" placeholder="US" /></label></div>
            <div class="form-row"><label>开始日期<input name="date_start" type="date" required /></label><label>结束日期<input name="date_end" type="date" required /></label></div>
            <label class="check"><input type="checkbox" name="paid" required />同意本页最多预占150数据点（¥1.50预算），另加平台点数</label><button type="submit">查询一页历史贸易</button><details class="copy-help"><summary aria-label="历史贸易说明"></summary><div class="copy-help-content">每页最多 20 条。记录可能涉及混装货物和物流公司，只作历史参考。</div></details>
          </form></details>
          <div class="grid-two">
            <form id="directory-form" class="panel" data-extension="directory">
              <div class="copy-heading"><h2>企业与岗位查询</h2><details class="copy-help"><summary aria-label="企业与岗位查询说明"></summary><div class="copy-help-content">通过地区和地址核对同名企业，再查岗位或按主体解锁。邮箱库存仅供参考，解锁后才能查看具体联系方式。</div></details></div>
              <div id="directory-selected" class="notice" hidden></div>
              <label>查询对象<select name="kind"><option value="company">企业</option><option value="people">人物与岗位</option></select></label>
              <label>公司名称<input name="company_name" maxlength="180" placeholder="Marmetal Industries" /></label>
              <label>公司官网（选填）<input name="website" type="url" maxlength="500" placeholder="https://www.marmetal.com" /></label>
              <div class="form-row"><label>国家代码（选填）<input name="country" pattern="[A-Z]{2}" maxlength="2" placeholder="US" /></label><label>产品词（选填）<input name="product" maxlength="150" placeholder="nickel alloy" /></label></div>
              <label>职位词（找人时使用，逗号分隔）<input name="titles" placeholder="purchasing, procurement, president" /></label>
              <label class="check"><input name="require_email" type="checkbox" />只查上游标记有邮箱库存的记录（仍需解锁与核对）</label>
              <label class="check"><input name="paid" type="checkbox" required />同意本页最多预占150数据点（¥1.50预算），另加平台点数；套餐扣量单独展示</label>
              <div class="actions"><button class="primary" type="submit">查询这一页</button><button id="directory-reset" type="button">清除已选企业</button></div>
              <p id="directory-price" class="hint"></p>
            </form>
          </div>
        </section>
        <section id="sources" class="tab-panel" hidden>

          <div class="intent-grid" role="group" aria-label="查询目的">
            <button type="button" data-intent="identity" aria-pressed="true"><b>查企业背景</b></button>
            <button type="button" data-intent="procurement" aria-pressed="false"><b>找采购机会</b></button>
            <button type="button" data-intent="market" aria-pressed="false"><b>了解市场</b></button>
            <button type="button" data-intent="risk" aria-pressed="false"><b>查产品风险</b></button>
            <button type="button" data-intent="research" aria-pressed="false"><b>查企业动态与目录</b></button>
          </div>
          <div class="grid-two intelligence-layout">
            <form id="source-form" class="panel">
              <h3 id="intent-title" class="copy-visually-hidden">查企业背景</h3>
              <label><span id="source-query-label">企业名称</span><input name="query" required maxlength="120" placeholder="例如：Siemens（建议使用英文全称）" /></label>

              <label>查询范围<select id="source-select" name="source_id" required></select></label>
              <details class="copy-help"><summary aria-label="查询范围说明"></summary><div class="copy-help-content"><div id="source-guidance" aria-live="polite"></div><div id="source-query-help"></div></div></details>
              <p id="source-status" class="notice" aria-live="polite" hidden>暂无可用来源，可切换查询目的。</p>
              <details class="advanced-options"><summary>更多查询条件（选填）</summary>
                <label>企业或公告所属国家<select name="country"><option value="">不限国家</option><option value="CN">中国</option><option value="US">美国</option><option value="GB">英国</option><option value="DE">德国</option><option value="FR">法国</option><option value="CA">加拿大</option><option value="AU">澳大利亚</option><option value="JP">日本</option><option value="IN">印度</option><option value="SG">新加坡</option><option value="AE">阿联酋</option><option value="SA">沙特阿拉伯</option><option value="ZA">南非</option><option value="BR">巴西</option><option value="MX">墨西哥</option><option value="IT">意大利</option><option value="NL">荷兰</option><option value="ES">西班牙</option><option value="VN">越南</option><option value="KR">韩国</option><option value="ID">印度尼西亚</option><option value="TH">泰国</option><option value="MY">马来西亚</option></select></label>
                <label>最多显示多少条<input name="limit" type="number" min="1" max="20" value="10" required /></label>
                <label id="source-time-field">公告时间范围<select name="since_days"><option value="30">最近30天</option><option value="90" selected>最近90天</option><option value="365">最近一年</option></select></label>
                <label id="source-entity-field">企业类型<select name="entity_category"><option value="GENERAL">一般企业</option><option value="BRANCH">分支机构</option><option value="FUND">基金</option><option value="ALL">全部</option></select></label>
                <label id="source-stage-field">公告类型<select name="procurement_stage"><option value="tender">招标机会</option><option value="award">历史中标 / 合同</option><option value="all">全部阶段</option></select></label>
                <details><summary>数据来源与覆盖说明</summary><p id="source-info" class="hint"></p></details>
              </details>
              <p id="source-price" class="hint"></p><button id="source-submit" type="submit" class="primary">开始查询 →</button>
            </form>
            <details class="panel"><summary>全部数据来源</summary><div id="source-catalog" class="stack"></div></details>
          </div>
        </section>
        <section id="workbench" class="tab-panel" hidden>
          <form id="wb-filter" data-extension="workbench" class="wb-filters">
            <label>查看方式<select name="mode"><option value="companies">企业</option><option value="contacts">联系人</option></select></label>
            <label>搜索<input name="q" placeholder="企业、姓名或邮箱" maxlength="200"></label>
            <label>国家／地区<input name="country_filter" maxlength="100" placeholder="US / 美国"></label>
            <label>销售阶段<select name="stage"><option value="">全部阶段</option><option value="new">新发现</option><option value="qualified">已筛选</option><option value="contacted">已联系</option><option value="replied">已回复</option><option value="negotiating">洽谈中</option><option value="won">已成交</option><option value="lost">不匹配</option></select></label>
            <label>标签<input name="tag" maxlength="40"></label>
            <label>目标岗位<select name="target"><option value="procurement">采购／供应链</option><option value="leadership">企业负责人</option><option value="sales">销售／业务开发</option></select></label>
            <label>独立邮箱验证<select name="verification"><option value="">全部状态</option><option value="valid">有效</option><option value="invalid">无效／不应联系</option><option value="unknown">未知</option><option value="catch_all">全收域</option><option value="unverified">尚未验证</option></select></label>
            <label class="check"><input type="checkbox" name="has_email">有完整邮箱</label><label class="check"><input type="checkbox" name="due">到期跟进</label>
            <label>岗位判断<select name="role_filter"><option value="">全部岗位</option><option value="keyword_match">命中目标关键词</option><option value="needs_review">未命中，待核实</option><option value="unknown">岗位未知</option></select></label>
            <label class="check"><input type="checkbox" name="ready_only">企业已评审且岗位匹配、邮箱近期有效</label>
            <button type="submit" class="primary">应用筛选</button>
          </form>
          <div class="toolbar"><label>已保存视图<select id="wb-views"><option value="">选择视图</option></select></label><label>视图名称<input id="wb-view-name" maxlength="80" placeholder="例如：美国采购岗位待核查"></label><button id="wb-save-view">保存当前视图</button></div>
          <div id="wb-summary" class="notice" aria-live="polite"></div><div id="wb-list" class="stack" aria-live="polite"></div>
          <div class="pagination"><button id="wb-prev">上一页</button><span id="wb-page"></span><button id="wb-next">下一页</button></div>
          <div id="wb-history" class="panel" hidden></div>
          <details class="panel"><summary>批量跟进</summary><form id="wb-followup" data-extension="workbench"><label>首次提醒<input name="due_at" type="datetime-local" required></label><label>后续提醒（相对首次的天数）<input name="intervals" placeholder="3,7,14"></label><label>跟进目标<input name="objective" maxlength="500" required placeholder="审阅开发信，核对采购职责"></label><details class="copy-help"><summary aria-label="批量跟进说明"></summary><div class="copy-help-content">先选择要跟进的企业。收到回复、退信或停止联系时暂停后续提醒。邮件需另行审阅发送。</div></details><button type="submit">为选中企业安排</button></form></details>
          <h3>跟进待办</h3><div id="wb-tasks" class="stack"></div>
          <details class="panel"><summary>产品与客群</summary>
            <form id="wb-product" data-extension="workbench"><label>产品名称<input name="name" maxlength="150" required></label><label>产品与用途<textarea name="description" maxlength="2000" required></textarea></label><label>核心优势<textarea name="value" maxlength="1000"></textarea></label><button type="submit">新增产品档案</button></form>
            <form id="wb-cohorts" data-extension="workbench"><label>产品<select name="product_id" id="wb-products" required></select></label><label>目标市场<input name="market" maxlength="100" required></label><button type="submit">推荐买家客群</button></form><div id="wb-cohort-results"></div>
          </details>
          <details class="panel"><summary>导入客户名单</summary><div class="copy-heading"><span>CSV、XLSX、文字型 PDF，最多 200 行</span><details class="copy-help"><summary aria-label="名单导入说明"></summary><div class="copy-help-content">PDF 需有表头，可用制表符或竖线分列。扫描件无法导入。同名且同地区的客户会复用现有档案。</div></details></div>
            <form id="wb-upload" data-extension="workbench"><label>客户名单<input type="file" name="file" accept=".csv,.xlsx,.pdf" required></label><button type="submit">解析并预览</button></form><div id="wb-import-preview"></div>
          </details>
          <details class="panel"><summary>收件归档</summary><p id="wb-inbox-capability" class="hint"></p><button id="wb-sync-inbox">同步收件箱</button>
            <form id="wb-eml" data-extension="workbench"><label>邮件文件<input type="file" name="file" accept=".eml" required></label><button type="submit">预览邮件</button></form><div id="wb-inbox"></div>
          </details>
        </section>
        <section id="customers" class="tab-panel" hidden>
          <div class="toolbar">
            <input
              id="customer-query"
              aria-label="搜索公司名"
              placeholder="搜索公司名"
            /><select id="stage-filter" aria-label="销售阶段">
              <option value="">全部阶段</option></select
            ><label class="check"
              ><input id="due-filter" type="checkbox" />只看待跟进</label
            ><button id="filter-customers">筛选</button
            ><button id="export">导出 CSV</button
            ><button id="show-import">导入客户</button>
          </div>
          <div id="customer-count" class="hint"></div>
          <div class="customer-layout">
            <div id="customer-list" class="stack"></div>
            <div id="customer-detail" class="panel detail">
              <div class="empty"><span class="empty-symbol" aria-hidden="true">◎</span><h3>选择客户查看详情</h3></div>
            </div>
          </div>
          <div class="pagination">
            <button id="prev">上一页</button><span id="page-number"></span
            ><button id="next">下一页</button>
          </div>
          <details id="import-panel" class="panel">
            <summary>导入你的客户名单</summary>
            <p class="hint">
              粘贴带表头的 CSV，支持 name, location, website, contact,
              source_url, source_note。每批最多 200 条。来源说明 source_note
              必填，可用下方默认说明补齐。不会验证邮箱可投递性。
            </p>
            <form id="import-form">
              <label
                >默认来源说明<input
                  name="source_note"
                  required
                  maxlength="1000"
                  placeholder="例如：本公司在 2026 年展会收集的商务名片" /></label
              ><label
                >CSV 内容<textarea
                  name="csv"
                  rows="8"
                  required
                  placeholder="name,location,website,contact&#10;Example Buyer,US,https://example.com,sales@example.com"
                ></textarea></label
              ><button type="submit" class="primary">导入名单</button>
            </form>
          </details>
        </section>
        <section id="jobs" class="tab-panel" hidden>
          <div class="toolbar"><button class="primary" data-tab="discover">＋ 创建找客户任务</button></div>
          <div class="toolbar"><label>任务类型<select id="job-type-filter"><option value="">全部类型</option><option value="prospecting">找客户</option><option value="intelligence">商业情报</option><option value="outreach_draft">邮件草稿</option></select></label><label>任务状态<select id="job-status-filter"><option value="">全部状态</option><option value="active">进行中</option><option value="done">已完成</option><option value="failed">失败 / 已取消</option></select></label></div>
          <p id="job-count" class="hint"></p><div id="job-list" class="task-grid"></div>
        </section>
        <section id="job-view" class="tab-panel" hidden>
          <div class="toolbar"><button data-tab="jobs">← 返回任务列表</button></div>
          <div id="job-detail" class="panel"></div>
        </section>
        <section id="mail" class="tab-panel" hidden>
          <div class="toolbar"><button data-tab="workbench">选择客户写邮件</button></div>
          <div class="panel"><h3>邮件草稿</h3><div id="mail-drafts" class="task-grid"></div></div>
          <details class="panel" open><summary>自有邮箱发送记录</summary><div id="mail-deliveries"></div></details>
        </section>
        <section id="company" class="tab-panel" hidden>
          <div class="panel">
            <div class="copy-heading"><h2>生成资料草案</h2><details class="copy-help"><summary aria-label="企业资料草案说明"></summary><div class="copy-help-content">可通过企业名称、官网或介绍文件生成草案。核对来源和内容后再采用。</div></details></div>
            <div class="intake-grid">
              <form id="company-name-form" data-extension="true">

                <label
                  >企业名称<input
                    name="name"
                    required
                    minlength="2"
                    maxlength="200" /></label
                ><button type="submit">按名称查找官网</button>
                <div id="company-candidates"></div>
              </form>
              <form id="company-website-form" data-extension="true">

                <label
                  >企业官网<input
                    name="website"
                    type="url"
                    required
                    maxlength="500"
                    placeholder="https://" /></label
                ><button type="submit">分析官网</button>
              </form>
            <form id="company-upload-form" data-extension="true">

              <label
                >企业介绍文件<input
                  name="file"
                  type="file"
                  accept=".txt,.md,.docx,.pdf"
                  required /></label
              ><button type="submit">分析文件</button>
              <details class="copy-help"><summary aria-label="文件分析说明"></summary><div class="copy-help-content">支持 TXT、MD、DOCX、文字型 PDF，最多 50 MiB。模型只分析提取的文本，原文件不保存。本功能目前不扣平台点数。</div></details>
            </form>
            </div>
            <div id="company-proposal"></div>
          </div>
          <div id="company-certification" class="panel"></div>
          <div class="grid-two">
            <form id="company-form" class="panel">
              <div class="copy-heading"><h2>企业信息</h2><details class="copy-help"><summary aria-label="企业信息用途"></summary><div class="copy-help-content">企业名称和主营产品是写开发信的必填项。价格、认证和交期只使用已填写的信息。发送前请核对收件人、联系理由和产品承诺。</div></details></div>
              <label
                >企业名称<input name="name" required maxlength="200" /></label
              ><label
                >官网<input name="website" type="url" maxlength="500" /></label
              ><label
                >主营产品<textarea
                  name="products"
                  rows="4"
                  required
                  maxlength="4000"
                ></textarea></label
              ><label
                >企业优势<textarea
                  name="advantages"
                  rows="3"
                  maxlength="4000"
                ></textarea></label
              ><label
                >对外联系信息<textarea
                  name="contact_details"
                  rows="3"
                  maxlength="2000"
                  placeholder="发件人、职位、商务邮箱、公司地址"
                ></textarea></label
              ><label
                >销售边界<textarea
                  name="sales_boundaries"
                  rows="3"
                  maxlength="4000"
                  placeholder="最低订单量、不能承诺的认证或交期"
                ></textarea></label
              ><button type="submit" class="primary">保存企业资料</button>
            </form>
            <div class="panel">
              <h3>账号设置</h3>
              <details>
                <summary>修改登录密码</summary>
                <form id="password-change-form" data-extension="true">
                  <label
                    >当前密码<input
                      name="current_password"
                      type="password"
                      required
                      minlength="8"
                      maxlength="128"
                      autocomplete="current-password" /></label
                  ><label
                    >新登录密码<input
                      name="new_password"
                      type="password"
                      required
                      minlength="8"
                      maxlength="128"
                      autocomplete="new-password" /></label
                  ><button type="submit">更新密码并退出所有设备</button>
                </form>
              </details>
            </div>
          </div>
        </section>
        <section id="costs" class="tab-panel" hidden>
          <div class="panel">
            <div class="copy-heading"><h2>会员与点数</h2><details class="copy-help"><summary aria-label="付款与会员说明"></summary><div id="billing-note" class="copy-help-content"></div></details></div>
            <p id="billing-status" class="notice" hidden>收款未配置，订单无法付款。</p>
            <div id="billing-plans" class="plan-grid"></div>
            <div id="billing-checkout"></div>
          </div>
          <div class="grid-two">
            <div class="panel">
              <h3>会员点数领取</h3>
              <div id="memberships"></div>
            </div>
            <div class="panel">
              <h3>充值与会员订单</h3>
              <div id="billing-orders"></div>
            </div>
          </div>
          <div id="usage" class="stats"></div>
          <div class="grid-two">
            <div class="panel">
              <div class="copy-heading"><h3>任务报价</h3><details class="copy-help"><summary aria-label="任务计费说明"></summary><div class="copy-help-content">任务提交时预占点数，再按实际结算。平台点数与上游费用分别记录。基础档不调用跨境魔方，同一空间的公开查询默认缓存 6 小时。</div></details></div>
              <div id="prices"></div>
            </div>
          </div>
          <div class="panel">
            <div class="copy-heading"><h3>上游用量 · 近 30 天</h3><details class="copy-help"><summary aria-label="上游用量口径"></summary><div class="copy-help-content">金额为已记录的供应商估算或预留费用，不含模型、服务器与邮箱费用。未报价的请求仍可能有费用。模型用量仅统计上游已回传的 tokens。</div></details></div>
            <div id="provider-usage"></div>
          </div>
          <div class="panel">
            <h3>最近点数流水</h3>
            <div id="ledger"></div>
          </div>
        </section>
`,Xn=`        <details id="register-panel">\r
          <summary>创建账号</summary>\r
          <form id="register-form">\r
            <label>手机号<input name="phone" type="tel" required /></label\r
            ><label\r
              >密码<input\r
                name="password"\r
                type="password"\r
                minlength="8"\r
                autocomplete="new-password"\r
                required /></label\r
            ><button type="button" id="request-code">获取验证码</button\r
            ><label\r
              >验证码<input\r
                name="code"\r
                required\r
                autocomplete="one-time-code" /></label\r
            ><input name="challenge_id" type="hidden" /><button\r
              class="primary"\r
              type="submit"\r
            >\r
              注册账号\r
            </button>\r
          </form>\r
          <p id="verification-hint" class="hint">请输入手机收到的验证码。</p>\r
        </details>\r
        <details id="reset-panel">\r
          <summary>忘记密码</summary>\r
          <form id="reset-form" data-extension="true">\r
            <label\r
              >重置密码的手机号<input name="phone" type="tel" required /></label\r
            ><button type="button" id="reset-code">发送重置验证码</button\r
            ><label\r
              >短信验证码<input\r
                name="code"\r
                required\r
                autocomplete="one-time-code" /></label\r
            ><input name="challenge_id" type="hidden" /><label\r
              >新密码<input\r
                name="new_password"\r
                type="password"\r
                minlength="8"\r
                maxlength="128"\r
                required\r
                autocomplete="new-password" /></label\r
            ><button type="submit">重置密码并退出旧设备</button>\r
          </form>\r
        </details>\r
        <p id="private-beta-note" class="hint" hidden>\r
          当前为私测，账号由运营人员开通。已有账号可直接登录。\r
        </p>\r
`,en="voken:updated";function gn(){const n=window.location.pathname;return n.endsWith("/app")||n.endsWith("/app/")?n.replace(/\/app\/?$/,"/app-assets/"):"/app-assets/"}let ve;function Qn(){return ve||(window.__VOKEN_REACT__=!0,ve=(async()=>{for(const n of["auth","workspace","login-form","logout","balance","refresh","wb-filter","company-form","discovery-form"])if(!document.getElementById(n))throw new Error("界面初始化未完成，请刷新重试。");for(const n of["app.js","account.js","discovery.js","directory.js","workbench.js","react-bridge.js"])await new Promise((t,a)=>{const s=document.createElement("script");s.src=gn()+n+"?v="+(new URL(import.meta.url).searchParams.get("v")||"development");const d=()=>window.removeEventListener("error",o),o=c=>{c.filename&&c.filename.split("?")[0]===s.src.split("?")[0]&&(d(),a(new Error("界面资源初始化失败，请刷新重试。")))};window.addEventListener("error",o),s.onload=()=>{d(),t()},s.onerror=()=>{d(),a(new Error("界面资源加载失败，请刷新重试。"))},document.head.appendChild(s)});return window.voken})(),ve)}const nn="(hover: hover) and (pointer: fine)";function Q({label:n,children:t}){const[a,s]=h.useState(!1),[d,o]=h.useState(()=>window.matchMedia(nn).matches);return h.useEffect(()=>{const c=window.matchMedia(nn),v=()=>{o(c.matches),s(!1)};return c.addEventListener("change",v),()=>c.removeEventListener("change",v)},[]),e.jsx(Tn,{trigger:d?["hover","focus"]:"click",placement:"bottomLeft",open:a,onOpenChange:s,content:e.jsx("div",{className:"help-hint-content",children:t}),children:e.jsx("button",{type:"button",className:"help-hint-button","aria-label":n,"aria-expanded":a,onKeyDown:c=>{c.key==="Escape"&&a&&(c.stopPropagation(),s(!1))},children:e.jsx(Dn,{"aria-hidden":"true"})})})}function et({action:n,bridge:t,onClose:a,onSaved:s}){var j,E;const{message:d}=Se.useApp(),[o]=_.useForm(),[c,v]=h.useState(!1),[u,l]=h.useState(""),[x,I]=h.useState(!1),g=_.useWatch("type",o),y=n.kind==="review"?"记录企业匹配评审":n.kind==="event"?"记录联系进展":`为 ${((j=n.ids)==null?void 0:j.length)||0} 家企业安排跟进`;async function T(f){var w;if(!c){v(!0),l("");try{n.kind==="review"?await t.post("/assessments",{prospect_id:n.row.id,status:f.status,reason:f.reason.trim()}):n.kind==="event"?await t.post("/events",{prospect_id:n.row.prospect_id,email:((w=f.email)==null?void 0:w.trim())||"",type:f.type,content:f.content.trim(),source:"user_recorded"},"event"):(await t.post("/followups",{prospect_ids:n.ids,due_at:f.due_at.toISOString(),intervals_days:(f.intervals||"").split(/[,，]/).filter(N=>N.trim()).map(Number),objective:f.objective.trim()},"followup"),t.select([])),a(),d.success(n.kind==="review"?"企业评审已保存":n.kind==="event"?"联系进展已记录":"跟进提醒已安排"),s()}catch(N){l(N.message)}finally{v(!1)}}}return e.jsxs(W,{title:y,open:!0,onCancel:()=>{c||a()},maskClosable:!c,keyboard:!c,closable:!c,footer:null,children:[u&&e.jsx(z,{type:"error",title:u,showIcon:!0,className:"modal-error"}),e.jsxs(_,{form:o,layout:"vertical",disabled:c,scrollToFirstError:{focus:!0},"data-extension":"react",onFinish:f=>void T(f),initialValues:{status:"unknown",type:"reply",email:((E=n.row)==null?void 0:E.email)||""},children:[n.kind==="review"&&e.jsxs(e.Fragment,{children:[e.jsxs(me.Paragraph,{type:"secondary",children:[n.row.name," ",e.jsx(Q,{label:"评审记录说明",children:"每次评审单独记录，原始证据会保留。"})]}),e.jsx(_.Item,{name:"status",label:"企业匹配判断",rules:[{required:!0}],children:e.jsx(V,{options:[{value:"fit",label:"符合目标客户画像"},{value:"not_fit",label:"不符合"},{value:"unknown",label:"依据不足，待核实"}]})}),e.jsx(_.Item,{name:"reason",label:"理由与来源证据",rules:[{required:!0,whitespace:!0,message:"请填写判断理由与证据"}],children:e.jsx(L.TextArea,{maxLength:1e3,rows:4,showCount:!0,placeholder:"说明企业角色、产品匹配与判断依据"})})]}),n.kind==="event"&&e.jsxs(e.Fragment,{children:[e.jsxs(me.Paragraph,{type:"secondary",children:[n.row.company," · ",n.row.name||"已记录的联系入口"]}),e.jsx(_.Item,{name:"type",label:"事件类型",rules:[{required:!0}],children:e.jsx(V,{options:[{value:"reply",label:"收到回复"},{value:"bounce",label:"退信"},{value:"opt_out",label:"拒绝联系"},{value:"meeting",label:"会议"},{value:"note",label:"备注"}]})}),e.jsx(_.Item,{name:"email",label:"事件关联邮箱",rules:[{required:["bounce","opt_out"].includes(g),message:"退信或拒绝联系时请填写事件邮箱"},{type:"email",message:"请输入有效邮箱"}],children:e.jsx(L,{type:"email",maxLength:254})}),e.jsx(_.Item,{name:"content",label:"联系进展",rules:[{required:!0,whitespace:!0,message:"请填写联系进展"}],children:e.jsx(L.TextArea,{maxLength:4e3,rows:4,showCount:!0})}),["reply","bounce","opt_out"].includes(g)&&e.jsx(z,{type:"info",title:g==="reply"?"收到回复后会暂停提醒。":"退信或拒绝联系后会拦截发送。"})]}),n.kind==="followup"&&e.jsxs(e.Fragment,{children:[e.jsx(_.Item,{name:"due_at",label:"首次提醒时间（本地时间）",rules:[{required:!0,message:"请选择首次提醒时间"}],children:e.jsx(Ln,{showTime:{format:"HH:mm"},format:"YYYY-MM-DD HH:mm",placeholder:"选择提醒时间",className:"full-width"})}),e.jsx(r,{type:"link",className:"draft-options","aria-expanded":x,onClick:()=>I(!x),children:x?"收起多轮提醒":"设置多轮提醒"}),x&&e.jsx(_.Item,{name:"intervals",preserve:!1,label:"后续提醒（相对首次的天数）",rules:[{validator:(f,w)=>{const N=String(w||"").split(/[,，]/).filter(C=>C.trim()).map(Number);return N.length<=5&&N.every(C=>Number.isInteger(C)&&C>=1&&C<=90)&&new Set(N).size===N.length&&N.every((C,S)=>S===0||C>N[S-1])?Promise.resolve():Promise.reject(new Error("最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔"))}}],children:e.jsx(L,{placeholder:"例如：3,7,14"})}),e.jsx(_.Item,{name:"objective",label:"跟进目标",rules:[{required:!0,whitespace:!0,message:"请填写跟进目标"}],children:e.jsx(L.TextArea,{rows:3,maxLength:500,showCount:!0,placeholder:"例如：核对采购职责，审阅并准备第一封开发信"})}),e.jsx(Q,{label:"跟进提醒说明",children:"提醒不会发送邮件。收到回复、退信或停止联系时，后续提醒会暂停。"})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(r,{onClick:a,disabled:c,children:"取消"}),e.jsx(r,{type:"primary",htmlType:"submit",loading:c,children:n.kind==="review"?"保存评审":n.kind==="event"?"记录进展":"安排提醒"})]})]})]})}const ye={stage:"销售阶段",contact:"商务联系方式",tags:"标签",next_followup_at:"下次跟进时间",do_not_contact:"联系状态"},nt={note:"备注",email_sent:"已通过自有邮箱发送",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索质量反馈",opt_out:"收到拒绝联系请求"},tt={English:"英语",Chinese:"中文",Spanish:"西班牙语",German:"德语",French:"法语",Portuguese:"葡萄牙语"},tn="简洁介绍产品，询问对方是否有相关需求。",Ae=n=>Object.entries(n).map(([t,a])=>({value:t,label:a})),sn=n=>[...new Set(n.split(/[,，]/).map(t=>t.trim()).filter(Boolean))];function st(n){if(!n)return"";const t=new Date(n);return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function at({action:n,row:t,bridge:a,stages:s,draftPrice:d,onClose:o,onSaved:c}){const[v]=_.useForm(),[u,l]=h.useState(!1),[x,I]=h.useState(""),[g,y]=h.useState(!1),T=n==="activity"?"记录跟进":n==="draft"?"写开发信":n==="do_not_contact"?t.do_not_contact?"恢复联系":"停止联系":`修改${ye[n]}`,j=_.useWatch("kind",v),E=n==="tags"?t.tags.join(", "):n==="next_followup_at"?st(t.next_followup_at):t[n]??"";async function f(w){var N;if(!u){l(!0),I("");try{if(n==="draft"){await a.createDraft(t.id,{language:w.language||"English",objective:((N=w.objective)==null?void 0:N.trim())||tn}),o();return}if(n==="activity")await a.recordActivity(t.id,{kind:w.kind,content:w.content.trim()});else{const C=w.field??"";let S=C;n==="tags"&&(S=sn(C)),n==="contact"&&(S=C.trim()),n==="next_followup_at"&&(S=C?new Date(C).toISOString():null),n==="do_not_contact"&&(S=!t.do_not_contact),(n==="do_not_contact"||C!==E)&&await a.updateCustomer(t.id,t.version,{[n]:S})}c(n==="activity"?"跟进已记录":"客户详情已保存")}catch(C){I(C.message)}finally{l(!1)}}}return e.jsxs(W,{title:T,open:!0,width:440,footer:null,onCancel:u?void 0:o,closable:!u,keyboard:!u,maskClosable:!u,children:[x&&e.jsx(z,{className:"modal-error",type:"error",showIcon:!0,title:x}),e.jsxs(_,{form:v,layout:"vertical",disabled:u,"data-extension":"react",initialValues:{field:E,kind:"note",language:"English",objective:tn},onFinish:w=>void f(w),children:[n==="stage"&&e.jsx(_.Item,{name:"field",label:ye.stage,children:e.jsx(V,{virtual:!1,options:Ae(s)})}),n==="contact"&&e.jsx(_.Item,{name:"field",label:ye.contact,children:e.jsx(L,{maxLength:500,allowClear:!0})}),n==="tags"&&e.jsx(_.Item,{name:"field",label:ye.tags,rules:[{validator:async(w,N)=>{const C=sn(N||"");if(C.length>20||C.some(S=>S.length>40))throw new Error("最多 20 个标签，每个标签最多 40 字")}}],children:e.jsx(L,{allowClear:!0,placeholder:"多个标签用逗号分隔"})}),n==="next_followup_at"&&e.jsx(_.Item,{name:"field",label:"下次跟进时间（本地时间）",children:e.jsx(L,{type:"datetime-local"})}),n==="do_not_contact"&&e.jsx(me.Paragraph,{children:t.do_not_contact?"恢复联系后可重新安排跟进。":"停止联系会清除已设定的下次跟进时间。"}),n==="activity"&&e.jsxs(e.Fragment,{children:[e.jsx(_.Item,{name:"kind",label:"记录类型",children:e.jsx(V,{options:Ae(nt)})}),e.jsx(_.Item,{name:"content",label:"跟进内容",rules:[{required:!0,whitespace:!0,message:"请填写跟进内容"}],children:e.jsx(L.TextArea,{rows:3,maxLength:4e3,placeholder:"记录沟通结果或下一步"})}),j==="opt_out"&&e.jsx(z,{type:"warning",title:"保存后将停止联系该客户并清除下次跟进时间。"})]}),n==="draft"&&e.jsxs(e.Fragment,{children:[!g&&e.jsx(me.Text,{type:"secondary",children:"默认英文"}),e.jsx(r,{type:"link",className:"draft-options","aria-expanded":g,onClick:()=>y(!g),children:g?"收起草稿选项":"修改语言和目标"}),g&&e.jsxs(e.Fragment,{children:[e.jsx(_.Item,{name:"language",label:"语言",children:e.jsx(V,{options:Ae(tt)})}),e.jsx(_.Item,{name:"objective",label:"这封信的目标",rules:[{required:!0,whitespace:!0,message:"请填写开发信目标"}],children:e.jsx(L.TextArea,{rows:2,maxLength:1e3})})]})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(r,{autoInsertSpace:!1,onClick:o,children:"取消"}),e.jsx(r,{autoInsertSpace:!1,type:"primary",htmlType:"submit",loading:u,children:n==="draft"?`生成草稿${d===void 0?"":` · ${d} 点`}`:n==="do_not_contact"?T:"保存"})]})]})]})}function it({kind:n,row:t,bridge:a,pointQuotes:s,onClose:d}){const[o,c]=h.useState(!1),[v,u]=h.useState(""),[l,x]=h.useState(!1),I=n==="targeted",g=s[I?"targeted_contacts":"directory_companies"],y=I?"精准联系人检索":"查企业与岗位";async function T(j){if(o)return;c(!0),u("");const E={company_name:j.company_name.trim()};try{await a.searchCustomerContacts(t.id,n,I?{...E,website:j.website.trim(),contact_target:j.contact_target,contact_titles:(j.contact_titles||"").split(/[,，]/).map(f=>f.trim()).filter(Boolean),confirm_company_match:j.reviewed,confirm_paid:j.paid}:{...E,kind:"company",confirm_paid:j.paid,.../^[A-Z]{2}$/.test(t.location)?{country:t.location}:{}}),d()}catch(f){u(f.message)}finally{c(!1)}}return e.jsxs(W,{open:!0,title:y,width:480,footer:null,onCancel:o?void 0:d,closable:!o,keyboard:!o,maskClosable:!o,children:[v&&e.jsx(z,{className:"modal-error",type:"error",title:v,showIcon:!0}),e.jsxs(_,{layout:"vertical",disabled:o,"data-extension":"react",initialValues:{company_name:t.name,website:t.website,contact_target:"procurement"},onFinish:j=>void T(j),children:[e.jsx(_.Item,{name:"company_name",label:"企业名称",rules:[{required:!0,whitespace:!0,max:I?240:180}],children:e.jsx(L,{maxLength:I?240:180})}),I&&e.jsxs(e.Fragment,{children:[e.jsx(_.Item,{name:"website",label:"已核对的企业官网",rules:[{required:!0,type:"url",message:"请输入有效的企业官网地址"}],children:e.jsx(L,{maxLength:500,placeholder:"https://buyer.com"})}),e.jsx(_.Item,{name:"contact_target",label:"目标岗位",children:e.jsx(V,{options:[{value:"procurement",label:"采购 / 寻源 / 供应链"},{value:"leadership",label:"企业负责人"},{value:"sales",label:"销售 / 业务开发"},{value:"engineering",label:"技术 / 工程"}]})}),e.jsx(r,{type:"link",className:"draft-options","aria-expanded":l,onClick:()=>x(!l),children:l?"收起具体职位":"指定具体职位"}),l&&e.jsx(_.Item,{name:"contact_titles",label:"具体职位",children:e.jsx(L,{maxLength:480,placeholder:"最多 6 个职位，用逗号分隔"})}),e.jsx(_.Item,{name:"reviewed",valuePropName:"checked",rules:[{validator:async(j,E)=>{if(!E)throw new Error("请核对企业与官网归属")}}],children:e.jsx(ae,{children:"我已核对企业与官网归属"})})]}),e.jsx(_.Item,{name:"paid",valuePropName:"checked",rules:[{validator:async(j,E)=>{if(!E)throw new Error("请确认本次查询的点数预占")}}],children:e.jsx(ae,{disabled:!g,children:g?`同意预占 ${g.total_points} 点（平台 ${g.platform_points} 点，数据 ${g.data_points} 点）`:"当前报价暂不可用"})}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(r,{autoInsertSpace:!1,onClick:d,children:"取消"}),e.jsx(r,{type:"primary",htmlType:"submit",loading:o,disabled:!g,children:"开始查询"})]})]})]})}const wn=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:2}),G=n=>`USD ${wn.format(n)}`,an=[{id:"DEMO-MY-001",product:"连锁门店包装耗材",buyer:"吉隆坡连锁商户 A",amount:48e3,received:14400,due:"演示第 30 天",overdue:!0,receipt:{reference:"DEMO-PSP-8616",orderId:"DEMO-MY-001",currency:"USD",amount:33600},shipment:{label:"海运 · 待发运",route:"深圳 → 巴生港",risks:"受潮、包装破损与中转装卸风险",missing:"装箱单、运输节点和货物交接责任"},acceptance:!1,receivableConfirmed:!1},{id:"DEMO-MY-002",product:"门店标准化设备",buyer:"槟城零售商户 B",amount:26400,received:0,due:"演示第 45 天",shipment:{label:"海运 · 已签收",route:"广州 → 槟城",risks:"设备运输碰撞、装卸损坏；后续经营阶段可梳理设备财产和责任保障",missing:"签收时的设备状态、设备清单和门店运营地址"},acceptance:!0,receivableConfirmed:!0},{id:"DEMO-MY-003",product:"门店标识补货",buyer:"新山零售商户 C",amount:18e3,received:18e3,due:"演示第 20 天",shipment:{label:"空运 · 已交付",route:"广州 → 新山",risks:"可复盘分批运输及交接记录，供下次补货时核对保障需求",missing:"本批已交付，汇总交接记录供后续订单参考"},acceptance:!0,receivableConfirmed:!0}];function J(n){return n.amount-n.received}function kn(n){return n.reduce((t,a)=>({received:t.received+a.received,outstanding:t.outstanding+J(a),unpaid:t.unpaid+(J(a)>0?1:0)}),{received:0,outstanding:0,unpaid:0})}function _n({mode:n}){const t=n==="payment";return e.jsxs("div",{className:"business-demo-banner",children:[e.jsx("span",{className:"business-demo-icon","aria-hidden":"true",children:t?e.jsx(Ie,{}):e.jsx(Ee,{})}),e.jsx("div",{children:e.jsxs("div",{className:"business-banner-heading",children:[e.jsx("h2",{children:t?"马来西亚跨境采购试点":"马来西亚出海服务试点"}),e.jsx(A,{color:"gold",children:"演示"}),e.jsx(Q,{label:"演示说明",children:t?"订单与流水均为样例。演示对账不会发起真实收款，刷新后恢复样例。":"订单和资料均为样例。预览不会提交投保或融资申请。"})]})})]})}function Ce(n){return J(n)?n.receipt?{text:"待对账",color:"orange"}:{text:"待回款",color:"blue"}:{text:"已结清",color:"green"}}function Cn({orders:n,order:t,select:a}){return e.jsx(R,{title:"演示订单",className:"demo-order-list",children:e.jsx("div",{className:"demo-order-options",role:"group","aria-label":"演示订单",children:n.map(s=>e.jsxs("button",{type:"button","aria-pressed":s.id===t.id,onClick:()=>a(s),children:[e.jsxs("span",{className:"demo-order-title",children:[e.jsx("strong",{children:s.product}),e.jsx(A,{color:Ce(s).color,children:Ce(s).text})]}),e.jsx("span",{children:s.buyer}),e.jsxs("small",{children:[s.id," · ",G(s.amount)]})]},s.id))})})}function lt({orders:n,order:t,select:a,reconcile:s,openProtection:d}){const[o,c]=h.useState(null),v=kn(n),u=J(t),l=t.receipt,x=(l==null?void 0:l.orderId)===t.id&&l.currency==="USD"&&l.amount===u;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(_n,{mode:"payment"}),e.jsxs("div",{className:"business-grid demo-statistics","aria-label":"演示收款汇总",children:[e.jsx(R,{children:e.jsx(fe,{title:"订单总数",value:n.length,suffix:"笔"})}),e.jsx(R,{children:e.jsx(fe,{title:"累计回款",value:v.received,prefix:"USD"})}),e.jsx(R,{children:e.jsx(fe,{title:"待回款",value:v.outstanding,prefix:"USD"})})]}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(Cn,{orders:n,order:t,select:a}),e.jsxs(R,{title:t.product,extra:e.jsx(A,{color:Ce(t).color,children:Ce(t).text}),children:[e.jsx(le,{size:"small",column:{xs:1,sm:2},items:[{key:"buyer",label:"买方",children:t.buyer},{key:"amount",label:"合同金额",children:G(t.amount)},{key:"received",label:"累计回款",children:G(t.received)},{key:"remaining",label:"待回款",children:G(u)},{key:"due",label:"付款节点",children:`${t.due}${t.overdue&&u?" · 已逾期":""}`},{key:"shipment",label:"履约状态",children:t.shipment.label}]}),e.jsxs("div",{className:"demo-actions",children:[u>0&&e.jsx(r,{onClick:()=>c("reminder"),children:"预览收款提醒"}),l&&e.jsx(r,{type:"primary",onClick:()=>c("reconcile"),children:"核对回款流水"}),e.jsx(r,{onClick:d,children:"查看订单保障"})]}),e.jsx("h3",{className:"demo-subheading",children:"订单与收款进度"}),e.jsx(un,{items:[{color:"green",content:"已确认合同与付款条款"},{color:t.received?"green":"gray",content:t.received?`已入账 ${G(t.received)}`:"等待回款"},{color:l?"orange":u?"gray":"green",content:l?`渠道流水 ${l.reference} 待人工核对`:u?"待对账":"应收余额为零，已结清"}]})]})]}),e.jsxs(W,{open:o==="reminder",title:"收款跟进员 · 提醒草稿",onCancel:()=>c(null),footer:e.jsx(r,{onClick:()=>c(null),children:"关闭预览"}),children:[e.jsx(z,{type:"info",showIcon:!0,title:"演示草稿"}),e.jsxs("p",{children:[t.buyer,"，您好！想与您核对订单 ",t.id,"「",t.product,"」的付款进度。"]}),e.jsxs("p",{children:["根据样例账面记录，当前待回款 ",G(u),"，约定付款节点为",t.due,"。如已安排付款，请回复交易参考号，便于核对。谢谢！"]})]}),e.jsxs(W,{open:o==="reconcile"&&!!l,title:"人工确认回款对账",onCancel:()=>c(null),okText:"确认演示对账",okButtonProps:{disabled:!x},onOk:()=>{s(),c(null)},children:[e.jsx(le,{size:"small",column:1,items:[{key:"id",label:"流水关联订单",children:l==null?void 0:l.orderId},{key:"reference",label:"渠道流水",children:l==null?void 0:l.reference},{key:"amount",label:"流水金额",children:l&&`${l.currency} ${wn.format(l.amount)}`},{key:"expected",label:"待回款",children:G(u)}]}),x?e.jsx(z,{type:"success",showIcon:!0,title:"流水与应收匹配"}):e.jsx(z,{type:"warning",showIcon:!0,title:"流水与应收信息有差异，请人工复核。"})]})]})}function ot(n){return[{label:"企业主体及买方资料",present:!0},{label:"真实订单与合同",present:!0},{label:"应收账款确权凭证",present:n.receivableConfirmed},{label:"履约及验收凭证",present:n.acceptance},{label:"还款来源与安排",present:!1}]}function rt({orders:n,order:t,select:a,openPayments:s}){const[d,o]=h.useState(null),c=ot(t),v=c.filter(({present:u})=>u).length;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(_n,{mode:"protection"}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(Cn,{orders:n,order:t,select:a}),e.jsx(R,{title:t.product,extra:e.jsx(r,{size:"small",onClick:s,children:"查看订单收款"}),children:e.jsx(pn,{items:[{key:"insurance",label:"货运与经营保障",children:e.jsxs(e.Fragment,{children:[e.jsx(le,{size:"small",column:1,items:[{key:"route",label:"运输路线",children:`${t.shipment.route} · ${t.shipment.label}`},{key:"value",label:"订单金额",children:G(t.amount)},{key:"risks",label:"风险关注",children:t.shipment.risks},{key:"missing",label:"资料待核对",children:t.shipment.missing}]}),e.jsx("div",{className:"demo-actions",children:e.jsx(r,{type:"primary",onClick:()=>o("insurance"),children:"预览保障需求清单"})})]})},{key:"funding",label:"应收融资对接",children:e.jsx(e.Fragment,{children:J(t)?e.jsxs(e.Fragment,{children:[e.jsx(le,{size:"small",column:1,items:[{key:"remaining",label:"待回款",children:G(J(t))},{key:"materials",label:"材料准备",children:`已备 ${v} / ${c.length} 项`}]}),e.jsx("ul",{className:"demo-materials",children:c.map(({label:u,present:l})=>e.jsxs("li",{children:[e.jsx("span",{children:u}),e.jsx(A,{color:l?"green":"gold",children:l?"已备":"待补充"})]},u))}),e.jsx(r,{type:"primary",onClick:()=>o("funding"),children:"预览机构对接摘要"})]}):e.jsx(z,{type:"info",showIcon:!0,title:"这笔订单已结清，无待融资应收"})})}]})})]}),e.jsxs(W,{open:d!==null,title:d==="insurance"?"保险分析师 · 保障需求清单":"应收融资 · 机构对接摘要",onCancel:()=>o(null),footer:e.jsx(r,{onClick:()=>o(null),children:"关闭预览"}),children:[e.jsx("p",{children:e.jsxs("strong",{children:[t.id," · ",t.product]})}),d==="insurance"?e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["运输与经营风险：",t.shipment.risks,"。"]}),e.jsxs("p",{children:["资料待核对：",t.shipment.missing,"。"]}),e.jsx(z,{type:"info",showIcon:!0,title:"下一步由保险机构确认保障范围、条件和所需材料。"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["样例应收余额 ",G(J(t)),"，约定付款节点为",t.due,"。"]}),e.jsxs("p",{children:["材料缺口：",c.filter(({present:u})=>!u).map(({label:u})=>u).join("、"),"。"]}),e.jsx(z,{type:"info",showIcon:!0,icon:e.jsx(we,{}),title:"材料补齐后，由资金方独立评估。"})]})]})]})}const ct=[{label:"发现客户",icon:e.jsx(Be,{}),target:"discover"},{label:"客户工作台",icon:e.jsx(ke,{}),target:"workbench"},{label:"邮件管理",icon:e.jsx(he,{}),target:"mail"},{label:"订单对账",icon:e.jsx(Ie,{}),target:"orders-payments",demo:!0},{label:"保障与融资",icon:e.jsx(Ee,{}),target:"protection-funding",demo:!0},{label:"用量与费用",icon:e.jsx(Me,{}),target:"costs"}];function je({label:n,value:t,icon:a,note:s,demo:d,onClick:o}){return e.jsxs("button",{className:"business-metric",type:"button",onClick:o,children:[e.jsxs("span",{className:"business-metric-top",children:[e.jsx("span",{className:`business-tile-icon${d?" is-demo":""}`,"aria-hidden":"true",children:a}),d?e.jsx(A,{color:"gold",children:"演示"}):e.jsx(X,{className:"business-link-icon","aria-hidden":"true"})]}),e.jsx("span",{className:"business-metric-label",children:n}),e.jsxs("span",{className:"business-metric-value",children:[d&&e.jsx("small",{children:"USD"}),(t==null?void 0:t.toLocaleString("zh-CN"))??"—"]}),s&&e.jsx("span",{className:"business-tile-note",children:s})]})}function Te({name:n,detail:t,icon:a,demo:s,onClick:d}){return e.jsxs("button",{type:"button",className:"employee-tile",onClick:d,children:[e.jsx("span",{className:`business-tile-icon${s?" is-demo":""}`,"aria-hidden":"true",children:a}),e.jsxs("span",{className:"employee-copy",children:[e.jsx("strong",{children:n}),e.jsx("small",{children:t})]}),s&&e.jsx(A,{color:"gold",children:"演示"}),e.jsx(X,{className:"business-link-icon","aria-hidden":"true"})]})}function dt({data:n,totals:t,navigate:a}){var c,v,u,l;const[s,d]=h.useState(null),o=(c=n.dashboardAgents)==null?void 0:c.find(({id:x})=>x===s);return e.jsxs("div",{className:"native-page business-page",children:[e.jsxs("section",{"aria-labelledby":"workbench-data",children:[e.jsx("h2",{className:"business-heading",id:"workbench-data",children:"业务数据"}),e.jsxs("div",{className:"business-grid business-metrics",children:[e.jsx(je,{label:"洽谈中商机",value:n.summary?((v=n.summary.stages)==null?void 0:v.negotiating)??0:void 0,icon:e.jsx(Fn,{}),onClick:()=>a("overview")}),e.jsx(je,{label:"已保存客户",value:(u=n.summary)==null?void 0:u.total,icon:e.jsx(qe,{}),onClick:()=>a("customers")}),e.jsx(je,{label:"到期待跟进",value:(l=n.summary)==null?void 0:l.due_followups,icon:e.jsx(Le,{}),onClick:()=>a("overview")}),e.jsx(je,{label:"累计回款",value:t.received,note:`${t.unpaid} 笔样例订单待回款`,icon:e.jsx(Me,{}),demo:!0,onClick:()=>a("orders-payments")})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-employees",children:[e.jsx("h2",{className:"business-heading",id:"workbench-employees",children:"数字员工"}),e.jsxs(R,{className:"business-employees",variant:"outlined",children:[n.dashboardAgentsError?e.jsx(z,{type:"warning",showIcon:!0,title:"加载失败，请刷新"}):n.dashboardAgents===null?e.jsx(mn,{active:!0,title:!1,paragraph:{rows:1}}):n.dashboardAgents.length?e.jsx("div",{className:"business-grid employee-grid",children:n.dashboardAgents.map(x=>e.jsx(Te,{name:x.config.name,icon:e.jsx(Rn,{}),detail:x.config.market?`拓客 · ${x.config.market}`:"拓客",onClick:()=>d(x.id)},x.id))}):e.jsxs("div",{className:"employee-empty",children:[e.jsx("span",{children:"暂无拓客员工"}),e.jsx(r,{type:"link",onClick:()=>a("discover"),children:"发现客户"})]}),e.jsx("h3",{children:"演示员工"}),e.jsxs("div",{className:"business-grid employee-grid",children:[e.jsx(Te,{name:"收款跟进员",detail:"提醒与对账",icon:e.jsx(Ie,{}),demo:!0,onClick:()=>a("orders-payments")}),e.jsx(Te,{name:"保险分析师",detail:"保障需求",icon:e.jsx(Ee,{}),demo:!0,onClick:()=>a("protection-funding")})]})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-shortcuts",children:[e.jsx("h2",{className:"business-heading",id:"workbench-shortcuts",children:"常用功能"}),e.jsx("div",{className:"business-grid shortcut-grid",children:ct.map(({label:x,icon:I,target:g,demo:y})=>e.jsxs(r,{className:"business-shortcut",onClick:()=>a(g),children:[e.jsx("span",{className:"business-tile-icon","aria-hidden":"true",children:I}),e.jsx("span",{children:x}),y&&e.jsx(A,{color:"gold",children:"演示"})]},g))})]}),e.jsx(W,{open:!!o,title:o==null?void 0:o.config.name,onCancel:()=>d(null),footer:e.jsx(r,{type:"primary",onClick:()=>{d(null),a("discover")},children:"发现客户"}),children:o&&e.jsx(ut,{employee:o})})]})}function ut({employee:{status:n,config:t}}){return e.jsx(le,{size:"small",column:1,items:[{key:"type",label:"类型",children:"拓客数字员工"},{key:"status",label:"状态",children:{enabled:"已启用",paused:"已暂停"}[n]??"已创建"},{key:"market",label:"目标市场",children:t.market||"未指定"},{key:"product",label:"主打产品",children:t.product||"未指定"},{key:"instructions",label:"任务指令",children:e.jsx("span",{className:"employee-instructions",children:t.instructions})}]})}function pt({data:n,bridge:t}){const[a,s]=h.useState(an),[d,o]=h.useState(an[0].id),c=a.find(({id:l})=>l===d)??a[0],v=l=>{t.navigate(l).catch(()=>{})},u={orders:a,order:c,select:({id:l})=>o(l)};return n.tab==="my-overview"?e.jsx(dt,{data:n,totals:kn(a),navigate:v}):n.tab==="orders-payments"?e.jsx(lt,{...u,openProtection:()=>v("protection-funding"),reconcile:()=>s(l=>l.map(x=>x.id===d&&x.receipt?{...x,received:x.received+x.receipt.amount,receipt:void 0}:x))}):n.tab==="protection-funding"?e.jsx(rt,{...u,openPayments:()=>v("orders-payments")}):null}const Ue={mode:"companies",q:"",country_filter:"",stage:"",tag:"",target:"procurement",verification:"",role_filter:"",has_email:!1,due:!1,ready_only:!1},ln=["company","location","stage","contacts","assessment","action"],Nn="voken-workbench-display-v1";function Ne(n){return Object.fromEntries(Object.entries(Ue).map(([t,a])=>[t,typeof a=="boolean"?n[t]===!0:String(n[t]??a).trim()]))}function on(n,t){return JSON.stringify(Ne(n))===JSON.stringify(Ne(t))}function mt(n,t,a){const s=Ne(n),d={q:`搜索：${s.q}`,country_filter:`地区：${s.country_filter}`,stage:`阶段：${t[String(s.stage)]||s.stage}`,tag:`标签：${s.tag}`,target:{leadership:"目标：企业负责人",sales:"目标：销售 / 业务开发"}[String(s.target)],verification:`邮箱：${a[String(s.verification)]||s.verification}`,role_filter:{keyword_match:"命中岗位关键词",needs_review:"岗位待核实",unknown:"岗位未知"}[String(s.role_filter)],has_email:"有完整邮箱",due:"到期跟进",ready_only:"已评审、岗位匹配且邮箱近期有效"};return Object.entries(s).filter(([o,c])=>o!=="mode"&&c!==Ue[o]).map(([o])=>({key:o,label:d[o]||o}))}function ze(n){const t=n&&typeof n=="object"?n:{},a=Array.isArray(t.columns)?t.columns:null,s=a?ln.filter(d=>["company","action"].includes(d)||a.includes(d)):[...ln];return{density:t.density==="compact"?"compact":"comfortable",columns:s}}function ht(){try{return ze(JSON.parse(localStorage.getItem(Nn)||"null"))}catch{return ze(null)}}function bt(n){try{localStorage.setItem(Nn,JSON.stringify(ze(n)))}catch{}}function xt(n){if(!n)return"未提供";const t=new Date(String(n));return Number.isNaN(t.getTime())?"日期待核实":t.toLocaleString("zh-CN",{hour12:!1})}const rn={created:"保存客户",updated:"调整跟进",note:"备注",email_sent:"已发送邮件",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索反馈",opt_out:"拒绝联系",draft_requested:"生成开发信",research_requested:"公域查证",contact_selected:"采用联系信息",assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒",bounce:"退信"},{Text:$,Title:Ve,Paragraph:te}=me,ue={new:"新发现",qualified:"已筛选",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",won:"已成交",lost:"不匹配"},Sn={new:"blue",qualified:"cyan",contacted:"geekblue",replied:"purple",negotiating:"orange",won:"green",lost:"default"},pe={valid:"独立验证有效",invalid:"无效 / 不应联系",catch_all:"全收域，待确认",unknown:"未知",unverified:"尚未独立验证"},ge={"my-overview":"我的工作台","orders-payments":"订单与收款","protection-funding":"保障与资金","ai-capabilities":"AI能力",overview:"业务概况",discover:"发现客户",workbench:"客户工作台",jobs:"任务管理","job-view":"任务详情",directory:"企业与联系人",sources:"商业情报",mail:"邮件管理",company:"企业资料",costs:"用量与费用"},se=n=>Object.entries(n).map(([t,a])=>({value:t,label:a})),Z=xt,q=n=>{n.catch(()=>{})};function Pe({href:n,children:t}){let a=!1;try{a=["http:","https:"].includes(new URL(n||"").protocol)}catch{}return a?e.jsx("a",{href:n,target:"_blank",rel:"noopener noreferrer",children:t}):e.jsx($,{type:"secondary",children:t})}function In({html:n,className:t=""}){const a=h.useRef(null);return h.useEffect(()=>{a.current&&(a.current.innerHTML=n)},[n]),e.jsx("div",{className:`legacy ${t}`,ref:a})}function En({compact:n=!1}){return e.jsxs("a",{className:"voken-brand",href:"#my-overview","aria-label":"微元 Voken 首页",children:[e.jsx("img",{className:"brand-symbol",src:`${gn()}favicon.svg`,alt:"",width:40,height:40}),!n&&e.jsxs("span",{children:["微元",e.jsx("span",{className:"brand-en",children:"Voken"})]})]})}function vt({ready:n}){return e.jsxs("section",{id:"auth",className:"react-auth",onSubmitCapture:t=>{n||t.preventDefault()},children:[e.jsxs("div",{className:"auth-intro",children:[e.jsx(En,{}),e.jsxs("div",{className:"auth-intro-copy",children:[e.jsx("p",{className:"auth-kicker",children:"跨境业务工作台"}),e.jsxs("h1",{children:[e.jsx("span",{className:"brand-highlight",children:"AI"})," 助力出海经营",e.jsx("br",{}),"从找到客户到",e.jsx("span",{className:"brand-accent",children:"跟进订单"})]}),e.jsx("p",{className:"auth-lead",children:"按产品和市场找客户，核对线索来源，在一个工作台里管理客户资料、开发信与跟进记录。"}),e.jsxs("ul",{className:"auth-capabilities",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"客户开发"}),e.jsx("span",{children:"发现客户与采购机会"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"订单与收款"}),e.jsx("span",{children:"查看应收与对账流程"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"保障与融资"}),e.jsx("span",{children:"梳理保障需求与融资资料"})]})]}),e.jsx("p",{className:"auth-demo-note",children:"收款、保障与融资提供演示流程。"})]})]}),e.jsx("div",{className:"auth-form-wrap",children:e.jsxs("div",{className:"auth-form-card",children:[e.jsx(Ve,{level:2,children:"登录"}),e.jsxs("form",{id:"login-form",className:"login-form",method:"post",children:[e.jsx("label",{htmlFor:"login-phone",children:"手机号"}),e.jsx(L,{id:"login-phone",name:"phone",type:"tel",autoComplete:"username",size:"large",required:!0}),e.jsx("label",{htmlFor:"login-password",children:"密码"}),e.jsx(L.Password,{id:"login-password",name:"password",autoComplete:"current-password",size:"large",minLength:8,required:!0}),e.jsx(r,{type:"primary",size:"large",htmlType:"submit",block:!0,disabled:!n,loading:!n,children:"进入工作台"})]}),e.jsx(In,{html:Xn})]})})]})}function qn({items:n}){return e.jsx(yn,{gutter:[16,16],className:"metric-row",children:n.map(t=>e.jsx(Fe,{xs:24,sm:12,xl:6,children:e.jsxs(R,{className:"metric-card",children:[e.jsxs("div",{className:"metric-top",children:[e.jsx($,{type:"secondary",children:t.label}),e.jsx("span",{className:"metric-icon",children:t.icon})]}),e.jsx(fe,{value:t.value,formatter:a=>t.value===void 0?"—":Number(a).toLocaleString()})]})},t.label))})}function yt({data:n,bridge:t}){var d,o;const a=n.summary,s=[{title:"完善企业资料",tab:"company",icon:e.jsx(_e,{})},{title:"发现潜在客户",tab:"discover",icon:e.jsx(Re,{})},{title:"筛选并核对",tab:"workbench",icon:e.jsx(jn,{})},{title:"开始商务对话",tab:"mail",icon:e.jsx(he,{})}];return e.jsxs("div",{className:"native-page",children:[e.jsx("div",{className:"overview-hero",children:e.jsx("div",{children:e.jsxs(F,{wrap:!0,children:[e.jsx(r,{type:"primary",icon:e.jsx(Oe,{}),onClick:()=>q(t.navigate("discover")),children:"创建找客任务"}),e.jsx(r,{onClick:()=>q(t.navigate("workbench")),children:"进入客户工作台"})]})})}),e.jsx(qn,{items:[{label:"已保存客户",value:a==null?void 0:a.total,icon:e.jsx(qe,{})},{label:"到期待跟进",value:a==null?void 0:a.due_followups,icon:e.jsx(Le,{})},{label:"正在洽谈",value:((d=a==null?void 0:a.stages)==null?void 0:d.negotiating)||(a?0:void 0),icon:e.jsx(ke,{})},{label:"已成交",value:((o=a==null?void 0:a.stages)==null?void 0:o.won)||(a?0:void 0),icon:e.jsx(we,{})}]}),e.jsxs(yn,{gutter:[20,20],children:[e.jsx(Fe,{xs:24,lg:15,children:e.jsxs(R,{title:"待跟进",children:[e.jsxs("div",{className:"next-action",children:[e.jsx("span",{className:"action-icon",children:e.jsx(Le,{})}),e.jsxs("div",{children:[e.jsx(Ve,{level:4,children:a?a.due_followups?`${a.due_followups} 位客户待跟进`:"暂无到期客户":"正在加载业务概况"}),e.jsx(r,{type:"primary",onClick:()=>q(t.navigate(a!=null&&a.due_followups?"workbench":"discover")),children:a!=null&&a.due_followups?"查看待跟进客户":"发现新客户"})]})]}),a&&e.jsxs("div",{className:"overview-note",children:[e.jsx(we,{})," 已停止联系 ",a.do_not_contact||0," 位客户"]})]})}),e.jsx(Fe,{xs:24,lg:9,children:e.jsx(R,{title:"常用操作",children:e.jsx("div",{className:"workflow-list",children:s.map(c=>e.jsxs("button",{onClick:()=>q(t.navigate(c.tab)),children:[e.jsx("span",{className:"workflow-icon",children:c.icon}),e.jsx("span",{children:e.jsx("b",{children:c.title})}),e.jsx(X,{})]},c.tab))})})})]})]})}function jt({contact:n,capabilities:t,bridge:a,onChange:s}){var x,I,g,y,T,j,E,f;const[d,o]=h.useState(!1),[c,v]=h.useState(!1),u=async()=>{v(!0);try{await a.post("/verifications",{prospect_id:n.prospect_id,email:n.email,confirm_external_check:!0},"verify"),o(!1),s()}catch{}finally{v(!1)}},l=((x=n.verification)==null?void 0:x.status)||"unverified";return e.jsxs(R,{size:"small",className:"contact-card",children:[e.jsxs(F,{wrap:!0,children:[e.jsx($,{strong:!0,children:n.name||"公共 / 岗位未知入口"}),e.jsx(A,{children:((I=n.titles)==null?void 0:I.join(" / "))||"岗位未知"}),n.blocked&&e.jsx(A,{color:"red",children:"停止联系"})]}),e.jsx(te,{copyable:n.email?{text:n.email}:!1,children:n.email||"暂无完整邮箱"}),e.jsxs(F,{wrap:!0,children:[e.jsx(A,{color:l==="valid"?"green":l==="invalid"?"red":"default",children:pe[l]}),((g=n.verification)==null?void 0:g.stale)&&e.jsx(A,{color:"orange",children:"验证超过 30 天"}),e.jsx($,{type:"secondary",children:(y=n.role_match)==null?void 0:y.reason})]}),e.jsxs(te,{type:"secondary",className:"contact-meta",children:["验证时间：",Z((T=n.verification)==null?void 0:T.checked_at)," ·"," ",((j=n.verification)==null?void 0:j.history_count)||0," 次历史记录"]}),e.jsx(Q,{label:"邮箱验证说明",children:"供应商标记与独立验证分别记录。独立验证有效也无法保证送达。"}),((E=n.warnings)==null?void 0:E.length)>0&&e.jsx(z,{type:"warning",title:n.warnings.map(w=>({email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务 / 质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"})[w]||w).join("；"),showIcon:!0}),((f=n.sources)==null?void 0:f.length)>0&&e.jsx("div",{className:"contact-sources",children:n.sources.map((w,N)=>e.jsxs("div",{children:[e.jsx(Pe,{href:w.source_url,children:w.source||"原始来源"}),e.jsxs($,{type:"secondary",children:[" · ",Z(w.observed_at)]}),w.source_job_id&&e.jsx(r,{type:"link",size:"small","data-job":w.source_job_id,children:"来源任务"})]},N))}),e.jsxs("div",{className:"verification-action",children:[e.jsx(ae,{checked:d,disabled:!t.email_verification||!n.email,onChange:w=>o(w.target.checked),children:"同意将邮箱交给 ZeroBounce 验证，消耗供应商额度"}),e.jsx(r,{loading:c,disabled:!d||!t.email_verification||!n.email,onClick:()=>void u(),children:l==="unverified"?"验证邮箱":"重新验证并保留历史"})]})]})}function ft({id:n,initialTab:t,active:a,bridge:s,capabilities:d,prices:o,pointQuotes:c}){var K,oe,be,re,i,m,D,Y,ce,de,He,Ke,Ye,Ge,We,Ze;const{message:v}=Se.useApp(),[u,l]=h.useState(null),[x,I]=h.useState(""),[g,y]=h.useState(0),[T,j]=h.useState(t),[E,f]=h.useState(null),[w,N]=h.useState(null),[C,S]=h.useState(!1);h.useEffect(()=>{if(!a)return;let p=!1;return l(null),I(""),s.detail(n).then(U=>{p||l(U)}).catch(U=>{p||I(U.message)}),()=>{p=!0}},[n,s,g,a]);const b=u==null?void 0:u.prospect,M=(K=b==null?void 0:b.evidence)==null?void 0:K.source_record,k=(oe=M==null?void 0:M.details)==null?void 0:oe.published_procurement_email,B=()=>y(p=>p+1),O=()=>{B(),q(s.refreshCustomers())};async function ee(){S(!0);try{await s.applySourceContact(n,{expected_version:b.version,job_id:b.evidence.origin_job_id,value:k}),O(),v.success("已采用公告邮箱并保留来源")}catch(p){v.error(p.message)}finally{S(!1)}}const P=(p,U,xe,ne=!1)=>e.jsxs(F,{wrap:!0,children:[p,e.jsx(r,{size:"small",type:"link",disabled:ne,onClick:()=>f(xe),children:U})]});return e.jsxs(e.Fragment,{children:[e.jsx(xn,{title:(b==null?void 0:b.name)||"客户详情",open:a,onClose:()=>s.closeCustomer(),size:720,className:"customer-drawer",footer:e.jsxs("div",{className:"drawer-footer-actions",children:[e.jsx(r,{onClick:()=>s.closeCustomer(),children:"关闭详情"}),e.jsx(r,{disabled:!b||b.do_not_contact,onClick:()=>f("draft"),children:"写开发信"}),e.jsx(r,{type:"primary",disabled:!b,onClick:()=>f("activity"),children:"记录跟进"})]}),extra:e.jsx(r,{icon:e.jsx(bn,{}),"aria-label":"刷新客户详情",disabled:!b,onClick:B,children:"刷新"}),children:x?e.jsx(z,{type:"error",title:"客户详情加载失败",description:x,action:e.jsx(r,{onClick:()=>y(p=>p+1),children:"重试"})}):u?e.jsx(e.Fragment,{children:e.jsx(pn,{activeKey:T,onChange:j,items:[{key:"profile",label:"客户资料",children:e.jsxs(e.Fragment,{children:[e.jsx(le,{column:1,bordered:!0,size:"small",items:[{key:"stage",label:"销售阶段",children:P(e.jsx(A,{color:Sn[b.stage],children:ue[b.stage]}),"改阶段","stage")},{key:"location",label:"国家 / 地区",children:b.location||"待核实"},{key:"website",label:"官网",children:e.jsx(Pe,{href:b.website,children:b.website||"未提供"})},{key:"contact",label:"商务联系方式",children:P(b.contact||"未提供","改联系方式","contact")},{key:"followup",label:"下次跟进",children:P(Z(b.next_followup_at),"改跟进时间","next_followup_at",b.do_not_contact)},{key:"tags",label:"标签",children:P(b.tags.length?b.tags.map(p=>e.jsx(A,{children:p},p)):"未添加","改标签","tags")},{key:"contact-status",label:"联系状态",children:P(b.do_not_contact?e.jsx(A,{color:"red",children:"停止联系"}):"可跟进",b.do_not_contact?"恢复联系":"停止联系","do_not_contact")},{key:"source",label:"来源",children:e.jsx(Pe,{href:(re=(be=b.evidence)==null?void 0:be.source)==null?void 0:re.url,children:((m=(i=b.evidence)==null?void 0:i.source)==null?void 0:m.title)||((Y=(D=b.evidence)==null?void 0:D.source)==null?void 0:Y.url)||"查看原始证据"})}]}),e.jsxs(R,{size:"small",title:e.jsxs("div",{className:"help-heading",children:["判断依据",e.jsx(Q,{label:"来源与证据说明",children:"企业匹配、岗位匹配和邮箱有效性分别核对。历史记录仅作参考。"})]}),className:"drawer-evidence",children:[e.jsx(te,{children:((ce=b.evidence)==null?void 0:ce.reason)||((de=b.evidence)==null?void 0:de.source_note)||"暂无补充依据，请核对原始来源。"}),((He=b.evidence)==null?void 0:He.quote)&&e.jsx("blockquote",{children:b.evidence.quote}),M&&e.jsxs(te,{children:[e.jsx($,{strong:!0,children:M.title}),e.jsx("br",{}),"发布时间 ",((Ke=M.details)==null?void 0:Ke.published_at)||"未提供",e.jsx("br",{}),"截止日期 ",((Ge=(Ye=M.details)==null?void 0:Ye.deadline_dates)==null?void 0:Ge.join("、"))||"待核实",M.procurement_status==="expired"&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),"公告已截止，仅作历史参考。"]}),((We=M.details)==null?void 0:We.attribution)&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),M.details.attribution]})]}),k&&e.jsx(z,{type:"info",title:`公告公开邮箱 ${k}`,description:"采用前请核对采购主体、公告期限和联系用途。",action:e.jsx(r,{loading:C,onClick:()=>void ee(),children:"已核对，采用公告邮箱"})})]}),((Ze=u.duplicates)==null?void 0:Ze.length)>0&&e.jsx(R,{size:"small",title:"疑似重复客户",className:"drawer-evidence",children:u.duplicates.map(p=>e.jsxs(te,{children:[e.jsx($,{strong:!0,children:p.name}),e.jsx("br",{}),e.jsx($,{type:"secondary",children:p.reason}),e.jsx(r,{type:"link",onClick:()=>q(s.openCustomer(p.id)),children:"查看客户"})]},p.id))})]})},{key:"contacts",label:`联系人 (${u.contacts.length})`,children:e.jsxs(e.Fragment,{children:[e.jsxs(F,{wrap:!0,className:"customer-contact-tools",children:[e.jsx(r,{onClick:()=>N("company"),children:"查企业与岗位"}),e.jsx(r,{onClick:()=>N("targeted"),children:"精准联系人检索"}),e.jsxs(r,{"data-research":n,children:["公域查证与找邮箱",o.report===void 0?"":` · ${o.report} 点`]})]}),u.contacts.length?e.jsx(F,{orientation:"vertical",className:"full-width",children:u.contacts.map((p,U)=>e.jsx(jt,{contact:p,capabilities:d,bridge:s,onChange:O},p.email+":"+U))}):e.jsx(ie,{description:"暂无联系人候选"}),u.savedContacts.map(p=>{var xe;const U=p.channels.filter(ne=>ne.channel!=="emails");return U.length>0&&e.jsxs(R,{size:"small",title:p.name,className:"drawer-evidence",children:[U.map((ne,$n)=>e.jsxs(te,{copyable:!0,children:[{phones:"电话",websites:"网站",socials:"社媒"}[ne.channel]||"联系方式"," · ",ne.value]},$n)),e.jsxs($,{type:"secondary",children:[(xe=p.titles)==null?void 0:xe.join(" / ")," · ",Z(p.observed_at)]}),e.jsx(r,{type:"link","data-job":p.source_job_id,children:"来源任务"})]},p.id)})]})},{key:"history",label:"跟进与验证历史",children:!u.activities.length&&!u.records.length?e.jsx(ie,{image:ie.PRESENTED_IMAGE_SIMPLE,description:"暂无跟进或验证记录"}):e.jsx(un,{items:[...u.activities.map(p=>({time:p.created_at,title:rn[p.kind]||"其他记录",content:["draft_requested","research_requested"].includes(p.kind)&&/^[a-f0-9]{32}$/.test(p.content)?e.jsx(r,{type:"link","data-job":p.content,children:"查看任务"}):p.content})),...u.records.map(p=>({time:p.created_at,title:{assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"}[p.kind]||p.kind,content:(p.kind==="followup"?`提醒时间：${Z(p.data.due_at)} · ${p.data.objective||""}`:"")||(p.kind==="contact_event"?`${rn[p.data.type]||"联系事件"} · ${p.data.email||""}：${p.data.content||""}`:"")||p.data.reason||p.data.content||p.data.objective||pe[p.data.status]||p.data.status}))].sort((p,U)=>String(U.time).localeCompare(String(p.time))).map((p,U)=>({key:U,title:e.jsxs(e.Fragment,{children:[e.jsx($,{strong:!0,children:p.title}),e.jsx("div",{children:e.jsx($,{type:"secondary",children:Z(p.time)})})]}),content:p.content}))})}]})}):e.jsx(mn,{active:!0,paragraph:{rows:10}})}),a&&b&&E&&e.jsx(at,{action:E,row:b,bridge:s,stages:ue,draftPrice:o.outreach_draft,onClose:()=>f(null),onSaved:p=>{f(null),E==="activity"&&j("history"),O(),v.success(p)}},E),a&&b&&w&&e.jsx(it,{kind:w,row:b,bridge:s,pointQuotes:c,onClose:()=>N(null)})]})}const H=Ue;function gt({data:n,bridge:t}){var re;const a=Hn.useBreakpoint(),s=n.workbench,d=s.summary,[o,c]=h.useState(s.filters||H),[v,u]=h.useState(!1),[l,x]=h.useState(!1),[I,g]=h.useState(""),[y,T]=h.useState(!1),[j,E]=h.useState(ht),f=j.columns,w=i=>E(m=>({...m,columns:i}));h.useEffect(()=>bt(j),[j]);const[N,C]=h.useState(null),S=s.filters||H,b=S.mode==="contacts",M=JSON.stringify(S),k=!on(o,S),B=mt(S,ue,pe),O=(s.views||[]).findIndex(i=>on(i.data,S)),ee=i=>{const m={...Ne(S),[i]:H[i]};c(m),K(m)};h.useEffect(()=>{c({...H,...S})},[M]);const P=(i,m)=>c(D=>({...D,[i]:m})),K=(i=o)=>q(t.filter(i)),oe=[{key:"company",title:"企业名称",dataIndex:"name",width:250,fixed:a.md?"left":void 0,render:(i,m)=>{var D;return e.jsxs("div",{className:"company-cell",children:[e.jsx(hn,{shape:"square",className:"company-avatar",children:String(i).slice(0,1).toUpperCase()}),e.jsxs("div",{children:[e.jsx(r,{type:"link",onClick:()=>q(t.openCustomer(m.id)),children:i}),e.jsx($,{type:"secondary",children:m.blocked?"存在停止联系记录":m.next_action}),((D=m.duplicates)==null?void 0:D.length)>0&&e.jsxs(A,{color:"orange",children:["疑似关联 ",m.duplicates.length," 份"]})]})]})}},{key:"location",title:"国家 / 地区",dataIndex:"country",width:135,render:i=>i||"待核实"},{key:"stage",title:"销售阶段",dataIndex:"stage",width:115,render:i=>e.jsx(A,{color:Sn[i],children:ue[i]||i})},{key:"contacts",title:"联系信息",width:170,render:(i,m)=>e.jsxs("div",{children:[e.jsxs("span",{children:[m.email_count," 个完整邮箱"]}),e.jsx("br",{}),e.jsxs($,{type:"secondary",children:[m.contact_count," 条入口 · ",m.verified_count," 个验证有效"]})]})},{key:"assessment",title:"企业匹配",width:140,render:(i,m)=>{var D,Y;return e.jsx(A,{color:((D=m.assessment)==null?void 0:D.status)==="fit"?"green":"default",children:{fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"}[(Y=m.assessment)==null?void 0:Y.status]||"待核实"})}},{key:"action",title:"操作",width:210,fixed:a.md?"right":void 0,render:(i,m)=>e.jsxs(F,{size:0,children:[e.jsx(r,{type:"link",onClick:()=>q(t.openCustomer(m.id)),children:"详情"}),e.jsx(r,{type:"link",onClick:()=>q(t.openCustomer(m.id,"contacts")),children:"查联系人"}),e.jsx(r,{type:"link",onClick:()=>C({kind:"review",row:m}),children:"评审"})]})}],be=[{key:"company",title:"联系人 / 企业",width:240,fixed:a.md?"left":void 0,render:(i,m)=>e.jsxs("div",{children:[e.jsx(r,{type:"link",onClick:()=>q(t.openCustomer(m.prospect_id,"contacts")),children:m.name||"公共 / 岗位未知入口"}),e.jsx("br",{}),e.jsx($,{type:"secondary",children:m.company})]})},{key:"email",title:"邮箱",dataIndex:"email",width:240,render:(i,m)=>e.jsxs(e.Fragment,{children:[e.jsx($,{copyable:i?{text:i}:!1,children:i||"暂无完整邮箱"}),m.blocked&&e.jsx(A,{color:"red",children:"停止联系"})]})},{key:"role",title:"岗位判断",width:240,render:(i,m)=>{var D,Y;return e.jsxs(e.Fragment,{children:[e.jsx("div",{children:((D=m.titles)==null?void 0:D.join(" / "))||"岗位未知"}),e.jsx($,{type:"secondary",children:(Y=m.role_match)==null?void 0:Y.reason})]})}},{key:"verification",title:"独立邮箱验证",width:180,render:(i,m)=>{var D,Y,ce,de;return e.jsxs(e.Fragment,{children:[e.jsx(A,{color:((D=m.verification)==null?void 0:D.status)==="valid"?"green":((Y=m.verification)==null?void 0:Y.status)==="invalid"?"red":"default",children:pe[(ce=m.verification)==null?void 0:ce.status]||"未知"}),((de=m.verification)==null?void 0:de.stale)&&e.jsx("div",{children:e.jsx($,{type:"warning",children:"验证超过 30 天"})})]})}},{key:"action",title:"操作",width:150,fixed:a.md?"right":void 0,render:(i,m)=>e.jsxs(F,{size:0,children:[e.jsx(r,{type:"link",onClick:()=>q(t.openCustomer(m.prospect_id,"contacts")),children:"详情 / 验证"}),e.jsx(r,{type:"link",onClick:()=>C({kind:"event",row:m}),children:"记录"})]})}];return e.jsxs("div",{className:"native-page workbench-page",children:[e.jsx(qn,{items:[{label:"企业档案",value:d==null?void 0:d.companies,icon:e.jsx(_e,{})},{label:"有完整邮箱的企业",value:d==null?void 0:d.companies_with_email,icon:e.jsx(he,{})},{label:"去重邮箱",value:d==null?void 0:d.unique_mailboxes,icon:e.jsx(ke,{})},{label:"近期验证有效",value:d==null?void 0:d.verified_mailboxes,icon:e.jsx(we,{})}]}),e.jsxs(R,{className:"workbench-card",children:[e.jsxs("div",{className:"table-heading",children:[e.jsxs("div",{className:"help-heading",children:[e.jsx(Ve,{level:4,children:"客户资源"}),e.jsx(Q,{label:"客户数据口径",children:"企业、岗位和邮箱分别核对。邮箱按地址去重，近期验证有效的邮箱仍需核对。疑似重复客户会保留为独立档案。"})]}),e.jsxs(F,{wrap:!0,children:[e.jsx(Xe,{title:"按公司名、销售阶段和到期跟进条件导出",children:e.jsx(r,{onClick:()=>q(t.exportCustomers()),children:"导出客户 CSV"})}),e.jsx(r,{icon:e.jsx(Kn,{"aria-hidden":"true"}),onClick:()=>{var m;const i=(m=document.querySelector("#wb-upload"))==null?void 0:m.closest("details");i&&(i.open=!0,i.scrollIntoView({behavior:"smooth",block:"center"}))},children:"导入名单"}),e.jsx(r,{type:"primary",icon:e.jsx(Oe,{}),onClick:()=>q(t.navigate("discover")),children:"发现客户"})]})]}),e.jsxs("div",{className:"workbench-tabs",children:[e.jsx(Qe,{value:o.mode,options:[{value:"companies",label:"企业视图",icon:e.jsx(_e,{})},{value:"contacts",label:"联系人视图",icon:e.jsx(ke,{})}],onChange:i=>{const m={...o,mode:i};c(m),K(m)}}),e.jsx(V,{"aria-label":"应用已保存视图",placeholder:"已保存的筛选视图",allowClear:!0,className:"saved-view-select",value:O>=0?O:void 0,options:(s.views||[]).map((i,m)=>({label:i.data.name,value:m})),onChange:i=>{i!==void 0?q(t.applyView(i)):(c({...H}),K({...H}))}})]}),e.jsxs("form",{"data-extension":"react",className:"react-filter",onSubmit:i=>{i.preventDefault(),K()},children:[e.jsxs("div",{className:"filter-main",children:[e.jsx(L,{prefix:e.jsx(Re,{}),"aria-label":"搜索企业、姓名或邮箱",placeholder:"搜索企业、姓名或邮箱",maxLength:200,allowClear:!0,value:o.q,onClear:()=>{const i={...o,q:""};c(i),K(i)},onChange:i=>P("q",i.target.value)}),e.jsx(L,{"aria-label":"国家或地区",placeholder:"国家 / 地区",maxLength:100,value:o.country_filter,onChange:i=>P("country_filter",i.target.value)}),e.jsx(V,{"aria-label":"销售阶段",value:o.stage,options:[{value:"",label:"全部销售阶段"},...se(ue)],onChange:i=>P("stage",i)}),e.jsx(r,{htmlType:"submit",type:"primary",icon:e.jsx(Re,{"aria-hidden":"true"}),loading:n.loading,children:"查询"}),e.jsx(r,{icon:e.jsx(jn,{}),"aria-expanded":v,"aria-controls":"advanced-customer-filters",onClick:()=>u(i=>!i),children:v?"收起筛选":"更多筛选"})]}),v&&e.jsxs("div",{className:"advanced-filters",id:"advanced-customer-filters",children:[e.jsxs("label",{children:["标签",e.jsx(L,{maxLength:40,value:o.tag,onChange:i=>P("tag",i.target.value)})]}),e.jsxs("label",{children:["目标岗位",e.jsx(V,{"aria-label":"目标岗位",value:o.target,options:se({procurement:"采购 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发"}),onChange:i=>P("target",i)})]}),e.jsxs("label",{children:["邮箱验证",e.jsx(V,{"aria-label":"独立邮箱验证",value:o.verification,options:[{value:"",label:"全部状态"},...se(pe)],onChange:i=>P("verification",i)})]}),e.jsxs("label",{children:["岗位判断",e.jsx(V,{"aria-label":"岗位判断",value:o.role_filter,options:se({"":"全部岗位",keyword_match:"命中目标关键词",needs_review:"未命中，待核实",unknown:"岗位未知"}),onChange:i=>P("role_filter",i)})]})]}),e.jsxs("div",{className:"filter-bottom",children:[e.jsxs(F,{wrap:!0,children:[e.jsx(ae,{checked:o.has_email,onChange:i=>P("has_email",i.target.checked),children:"有完整邮箱"}),e.jsx(ae,{checked:o.due,onChange:i=>P("due",i.target.checked),children:"到期跟进"}),v&&e.jsx(ae,{checked:o.ready_only,onChange:i=>P("ready_only",i.target.checked),children:"已评审、岗位匹配且邮箱近期有效"})]}),e.jsxs(F,{children:[e.jsx(r,{type:"text",onClick:()=>{c({...H}),K({...H})},children:"重置"}),e.jsx(r,{type:"link",disabled:k||n.loading,title:k?"请先应用筛选条件，再保存视图":void 0,onClick:()=>x(!0),children:"保存当前筛选"})]})]})]}),k&&e.jsxs("div",{className:"filter-draft-notice",role:"status",children:[e.jsx($,{children:"筛选条件已修改，列表仍显示上次查询结果。"}),e.jsx(r,{size:"small",type:"primary",onClick:()=>K(),disabled:n.loading,children:"应用修改"}),e.jsx(r,{size:"small",type:"text",onClick:()=>c({...H,...S}),children:"撤销修改"})]}),B.length>0&&e.jsxs("div",{className:"applied-filters","aria-label":"已应用筛选",children:[e.jsx($,{type:"secondary",children:"已应用"}),B.map(i=>e.jsx(A,{closable:!n.loading,onClose:()=>ee(i.key),title:i.label,children:i.label},i.key)),e.jsx(r,{type:"link",size:"small",onClick:()=>{c({...H}),K({...H})},children:"清空筛选"})]}),n.workbenchError&&e.jsx(z,{type:"error",title:"客户工作台加载失败",description:n.workbenchError,showIcon:!0,action:e.jsxs(F,{wrap:!0,children:[e.jsx(r,{onClick:()=>q(t.refresh()),children:"重试"}),n.workbenchError.includes("暂不可用")&&e.jsx(r,{href:"?legacy=true#customers",children:"打开兼容版客户列表"})]})}),e.jsxs("div",{className:"table-status",children:[e.jsxs(F,{wrap:!0,children:[e.jsxs($,{type:"secondary","aria-live":"polite",children:["共 ",s.total||0," 条记录"]}),s.lastLoadedAt&&e.jsxs($,{type:"secondary",className:"last-updated",children:["更新"," ",new Date(s.lastLoadedAt).toLocaleTimeString("zh-CN",{hour12:!1})]}),((re=s.selected)==null?void 0:re.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(A,{color:"blue",children:["已选 ",s.selected.length," 家企业"]}),e.jsx(r,{type:"link",size:"small",onClick:()=>C({kind:"followup",ids:s.selected}),children:"安排跟进"}),e.jsx(r,{type:"text",size:"small",onClick:()=>t.select([]),children:"取消选择"})]})]}),e.jsxs(F,{wrap:!0,className:"display-controls",children:[e.jsx(Xe,{title:"调整表格行间距",children:e.jsx(Qe,{"aria-label":"表格密度",size:"small",value:j.density,options:[{value:"comfortable",label:"舒适"},{value:"compact",label:"紧凑"}],onChange:i=>E(m=>({...m,density:i}))})}),!b&&e.jsx(V,{mode:"multiple","aria-label":"显示的表格列",value:f,onChange:w,maxTagCount:0,maxTagPlaceholder:()=>"列设置",className:"column-select",options:oe.map(i=>({value:String(i.key),label:i.title,disabled:["company","action"].includes(String(i.key))}))})]})]}),!a.md&&e.jsx("div",{className:"table-scroll-hint",children:"左右滑动查看更多"}),e.jsx(fn,{size:j.density==="compact"?"small":"middle",columns:b?be:oe.filter(i=>f.includes(String(i.key))),dataSource:n.workbenchError||s.loadedMode!==S.mode?[]:s.items||[],rowKey:i=>b?`${i.prospect_id}:${i.email}:${i.name}`:i.id,loading:n.loading,scroll:{x:b?1100:1050,y:"min(58vh, 640px)"},rowSelection:{selectedRowKeys:(s.items||[]).filter(i=>{var m;return(m=s.selected)==null?void 0:m.includes(b?i.prospect_id:i.id)}).map(i=>b?`${i.prospect_id}:${i.email}:${i.name}`:i.id),onChange:(i,m)=>t.select([...new Set(m.map(D=>b?D.prospect_id:D.id))])},locale:{emptyText:e.jsx(ie,{image:ie.PRESENTED_IMAGE_SIMPLE,description:n.workbenchError?"数据暂时无法加载":B.length?"没有符合当前条件的客户":"还没有客户档案",children:e.jsx(r,{onClick:()=>{n.workbenchError?q(t.refresh()):B.length?(c({...H}),K({...H})):q(t.navigate("discover"))},children:n.workbenchError?"重新加载":B.length?"清空筛选":"发现第一批客户"})})},pagination:{current:Math.floor((s.offset||0)/30)+1,pageSize:30,total:s.total||0,showSizeChanger:!1,onChange:i=>q(t.filter(S,(i-1)*30))}})]}),N&&e.jsx(et,{action:N,bridge:t,onClose:()=>C(null),onSaved:()=>q(t.refresh())}),e.jsx(W,{title:"保存当前筛选视图",open:l,onCancel:()=>{y||x(!1)},keyboard:!y,maskClosable:!y,confirmLoading:y,onOk:()=>{I.trim()&&(T(!0),t.saveView(I.trim()).then(()=>{x(!1),g("")}).catch(()=>{}).finally(()=>T(!1)))},okButtonProps:{disabled:!I.trim()||k},okText:"保存视图",children:e.jsx(L,{"aria-label":"筛选视图名称",autoFocus:!0,value:I,maxLength:80,placeholder:"例如：美国采购岗位待核查",onChange:i=>g(i.target.value)})})]})}function wt({data:n,bridge:t}){const[a,s]=h.useState(""),[d,o]=h.useState(""),c={prospecting:"发现客户",outreach_draft:"开发信草稿",report:"客户报告",source_lookup:"官方情报查询",public_search:"公开检索",directory_companies:"企业查询",directory_people:"人物与岗位",directory_contacts:"联系方式解锁",targeted_contacts:"精准联系人检索",buyer_search:"采购商匹配",buyer_profile:"企业资料",buyer_contacts:"联系方式",customs_verification:"贸易核验",trade_search:"历史贸易"},v={queued:"排队中",running:"执行中",cancelling:"取消中",succeeded:"已完成",partial:"部分完成",failed:"失败",cancelled:"已取消"},u=n.jobs.filter(l=>(!a||l.operation===a)&&(!d||l.status===d));return e.jsx("div",{className:"native-page",children:e.jsxs(R,{title:e.jsxs("div",{className:"help-heading",children:["任务记录",e.jsx(Q,{label:"任务状态说明",children:"执行中的任务每 5 秒更新。部分完成表示已有结果，详情页会列出缺失内容。"})]}),extra:e.jsx(r,{type:"primary",icon:e.jsx(Oe,{}),onClick:()=>q(t.navigate("discover")),children:"创建任务"}),children:[e.jsxs("div",{className:"task-filter",children:[e.jsx(V,{"aria-label":"任务类型",value:a,options:[{value:"",label:"全部任务类型"},...se(c)],onChange:s}),e.jsx(V,{"aria-label":"任务状态",value:d,options:[{value:"",label:"全部状态"},...se(v)],onChange:o}),e.jsxs($,{type:"secondary",children:[u.length," 个任务"]})]}),e.jsx(fn,{rowKey:"id",dataSource:u,loading:n.loading,scroll:{x:750},pagination:{pageSize:15,showSizeChanger:!1},columns:[{title:"任务类型",dataIndex:"operation",render:(l,x)=>e.jsx(r,{type:"link","data-job":x.id,children:c[l]||l})},{title:"状态",dataIndex:"status",render:l=>e.jsx(Yn,{status:l==="succeeded"?"success":l==="running"?"processing":l==="failed"?"error":l==="partial"?"warning":"default",text:v[l]||l})},{title:"创建时间",dataIndex:"created_at",render:Z},{title:"已结算点数",dataIndex:"points_charged",render:l=>Number(l||0).toLocaleString()},{title:"操作",render:(l,x)=>e.jsx(r,{type:"link","data-job":x.id,children:"查看详情"})}],locale:{emptyText:e.jsx(ie,{description:"暂无符合条件的任务"})}})]})})}const De=[{key:"my-overview",label:ge["my-overview"],icon:e.jsx(vn,{})},{key:"customers-opportunities",label:"客户与商机",icon:e.jsx(qe,{})},{key:"orders-payments",label:"订单与收款",icon:e.jsx(Ie,{})},{key:"protection-funding",label:"保障与资金",icon:e.jsx(Ee,{})},{key:"ai-capabilities",label:"AI能力",icon:e.jsx(Un,{})}];function kt({bridge:n}){return e.jsx(R,{className:"section-home-card",children:e.jsxs("div",{className:"workflow-list",children:[e.jsxs("button",{type:"button",onClick:()=>q(n.navigate("discover")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(Be,{})}),e.jsx("span",{children:e.jsx("b",{children:"AI 发现客户"})}),e.jsx(X,{})]}),e.jsxs("button",{type:"button",onClick:()=>q(n.navigate("mail")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(he,{})}),e.jsx("span",{children:e.jsx("b",{children:"AI 开发信"})}),e.jsx(X,{})]})]})})}function _t(){var M;const{message:n}=Se.useApp(),[t,a]=h.useState(null),[s,d]=h.useState(null),[o,c]=h.useState(""),[v,u]=h.useState(!1),[l,x]=h.useState(!1),[I,g]=h.useState(!1);h.useEffect(()=>{const k=()=>{window.voken&&d(window.voken.snapshot())},B=O=>{const ee=O.detail;n.open({type:ee.error?"error":"success",content:ee.message,duration:6})};return window.addEventListener(en,k),window.addEventListener("voken:message",B),Qn().then(O=>{a(O),d(O.snapshot())}).catch(O=>c(O.message)),()=>{window.removeEventListener(en,k),window.removeEventListener("voken:message",B)}},[n]);const y=(s==null?void 0:s.tab)||"my-overview",T=De.find(({key:k})=>k===y||y==="costs"&&k==="my-overview")??De[1],j=T.key==="customers-opportunities",E=["my-overview","orders-payments","protection-funding","ai-capabilities"].includes(y),f=(k,B=!0)=>{t&&y!==k&&q(t.navigate(k)),B&&g(!1)},w=()=>{var k;(k=document.getElementById("logout"))==null||k.click(),g(!1)},N=e.jsx("nav",{className:"workspace-sections","aria-label":"一级导航",children:De.map(({key:k,label:B,icon:O})=>e.jsx(r,{type:"text",icon:e.jsx("span",{"aria-hidden":"true",className:"workspace-section-icon",children:O}),"aria-current":k===T.key?"true":void 0,onClick:()=>{k==="customers-opportunities"?j?l||u(!1):f("workbench",!l):f(k)},children:B},k))}),C=[{key:"overview",icon:e.jsx(vn,{}),label:"业务概况"},{type:"group",label:"客户开发",children:[{key:"discover",icon:e.jsx(Be,{}),label:"发现客户"},{key:"workbench",icon:e.jsx(qe,{}),label:"客户工作台"},{key:"jobs",icon:e.jsx(Gn,{}),label:"任务管理"}]},{type:"group",label:"业务工具",children:[{key:"directory",icon:e.jsx(Wn,{}),label:"企业与联系人"},{key:"sources",icon:e.jsx(Zn,{}),label:"商业情报"},{key:"mail",icon:e.jsx(he,{}),label:"邮件管理"},{key:"company",icon:e.jsx(_e,{}),label:"企业资料"}]}],S=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"workspace-label",children:"客户与商机"}),e.jsx(Vn,{"aria-label":"客户与商机导航",theme:"light",mode:"inline",selectedKeys:[y==="job-view"?"jobs":y],items:C,onClick:({key:k})=>f(k)})]}),b=e.jsx("div",{className:"sidebar-bottom",children:e.jsxs("button",{className:"points-entry","aria-label":`${(s==null?void 0:s.balance)||"— 点数"}，用量与费用`,onClick:()=>f("costs"),children:[e.jsx(Me,{}),e.jsxs("span",{children:[e.jsx("b",{children:(s==null?void 0:s.balance)||"— 点数"}),e.jsx("small",{children:"用量与费用"})]}),e.jsx(X,{})]})});return e.jsxs(e.Fragment,{children:[e.jsx("div",{id:"toast",role:"status","aria-live":"polite",hidden:!0}),e.jsx(vt,{ready:!!t}),o&&e.jsx("div",{className:"startup-error",children:e.jsx(z,{type:"error",title:o,action:e.jsx(r,{onClick:()=>location.reload(),children:"重新加载"})})}),e.jsx("div",{id:"workspace",className:`react-workspace${j?" has-customer-menu":""}`,hidden:!0,children:e.jsxs($e,{children:[e.jsxs("aside",{className:"primary-sidebar",children:[e.jsx("div",{className:"primary-brand",children:e.jsx(En,{compact:!0})}),N,e.jsx(r,{className:"primary-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Je,{}),onClick:w})]}),e.jsx($e.Sider,{className:"voken-sidebar",width:216,collapsedWidth:68,collapsed:v,breakpoint:"lg",onBreakpoint:x,trigger:null,children:j&&!l&&e.jsxs(e.Fragment,{children:[S,b]})}),e.jsxs($e,{className:`main-layout ${v?"is-collapsed":""}`,children:[e.jsxs("header",{className:"workspace-topbar",children:[e.jsxs(F,{children:[(l||j)&&e.jsx(r,{type:"text","aria-label":l?"打开导航":v?"展开导航":"收起导航",icon:v||l?e.jsx(Mn,{}):e.jsx(Bn,{}),onClick:()=>l?g(!0):u(k=>!k)}),e.jsx(On,{items:[{title:"工作空间"},{title:T.label},...T.label===ge[y]?[]:[{title:ge[y]}]]})]}),e.jsx(F,{children:e.jsx(hn,{size:32,className:"user-avatar",children:"微"})})]}),e.jsxs("main",{className:"workspace-content",children:[e.jsxs("div",{className:"react-page-header",children:[e.jsx("div",{children:e.jsx("h1",{id:"page-title",tabIndex:-1,children:ge[y]||"业务概况"})}),e.jsxs(F,{wrap:!0,className:"page-header-actions",children:[t&&(s==null?void 0:s.customerId)&&["directory","job-view","jobs"].includes(y)&&e.jsx(r,{icon:e.jsx(X,{"aria-hidden":"true",rotate:180}),onClick:()=>q(t.navigate("workbench")),children:"返回客户详情"}),e.jsx(r,{id:"refresh",hidden:E&&y!=="my-overview","aria-label":"刷新当前页面数据",icon:e.jsx(bn,{spin:s==null?void 0:s.loading}),disabled:!t||(s==null?void 0:s.loading),children:"刷新数据"})]})]}),t&&(s==null?void 0:s.session)&&e.jsxs("div",{children:[e.jsx(pt,{data:s,bridge:t}),y==="ai-capabilities"&&e.jsx(kt,{bridge:t}),y==="overview"&&e.jsx(yt,{data:s,bridge:t})," ",y==="workbench"&&e.jsx(gt,{data:s,bridge:t})," ",y==="jobs"&&e.jsx(wt,{data:s,bridge:t}),s.customerId&&e.jsx(ft,{id:s.customerId,initialTab:s.customerTab,active:y==="workbench",bridge:t,capabilities:s.workbench.capabilities||{},prices:s.prices||{},pointQuotes:s.pointQuotes||{}},s.customerId)]},((M=s.session)==null?void 0:M.workspace_id)||"signed-out"),e.jsx(In,{html:Jn,className:"business-pages"}),e.jsxs("div",{className:"compat-controls","aria-hidden":"true",hidden:!0,children:[e.jsx("details",{id:"tools-nav"}),e.jsx("button",{id:"balance"}),e.jsx("button",{id:"logout"})]})]})]})]})}),e.jsxs(xn,{title:"工作空间导航",placement:"left",open:I&&l&&!!(s!=null&&s.session),onClose:()=>g(!1),className:"mobile-navigation",size:300,children:[N,j&&S,b,e.jsx(r,{className:"mobile-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Je,{}),onClick:w,children:"退出登录"})]})]})}var dn;const cn=(dn=document.querySelector('meta[name="csp-nonce"]'))==null?void 0:dn.content;An.createRoot(document.getElementById("root")).render(e.jsx(zn,{locale:Pn,csp:cn?{nonce:cn}:void 0,theme:{token:{colorPrimary:"#2457e7",colorText:"#10224b",colorTextSecondary:"#5a6884",colorBgLayout:"#f7f9fd",colorBorderSecondary:"#e9edf6",borderRadius:8,fontFamily:'Inter, "Microsoft YaHei", "PingFang SC", sans-serif',fontSize:14,controlHeight:38},components:{Layout:{siderBg:"#ffffff",headerBg:"#ffffff"},Menu:{itemHeight:44,itemMarginBlock:5,itemBorderRadius:8,itemSelectedBg:"#eef3ff"},Table:{headerBg:"#f8faff",cellPaddingBlock:16},Card:{paddingLG:24}}},children:e.jsx(Se,{children:e.jsx(_t,{})})}));
