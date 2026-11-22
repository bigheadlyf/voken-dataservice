import{r as v,j as e,c as vn}from"./react-vendor-ovhI6CXq.js";import{A as Ie,F as z,M as X,a as D,T as we,S as U,I as P,D as xn,B as u,C as q,b as ce,c as Q,d as Ge,e as k,f as Ke,R as ee,g as ve,h as xe,i as jn,j as je,k as ke,l as qe,m as We,n as yn,o as ne,p as Ee,q as ie,r as re,s as fn,z as gn,L as ye,t as Fe,u as A,v as wn,w as kn,x as _n,y as Je,E as Ze,G as Xe,H as Qe,J as Nn,K as Cn,N as $e,O as en,P as _e,Q as Sn,U as me,V as In,W as ze,X as Ne,Y as nn,Z as de,_ as qn,$ as sn,a0 as J,a1 as En,a2 as $n,a3 as An,a4 as Dn}from"./antd-vendor-CeD7QULP.js";const Tn=`        <section id="overview" class="tab-panel">\r
          <div class="welcome">\r
            <div>\r
              <p class="eyebrow">下一段增长，从一次对话开始</p>\r
              <h2>让下一次增长，<br />从<em>对的客户</em>开始。</h2>\r
              <p>从产品与市场出发，建立有来源、可跟进的客户清单。</p>\r
              <div class="actions"><button data-tab="discover" class="light">创建找客户任务 ↗</button><button data-tab="customers" class="hero-secondary">查看客户管理 →</button></div>\r
            </div>\r
            <div class="assistant-preview" aria-label="客户开发流程">\r
              <div class="assistant-heading"><svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="14" rx="4"/><path d="M12 2v4M8 12h.01M16 12h.01M8 16c2 2 6 2 8 0M1 11v5M23 11v5"/></svg><b>你的 AI 拓客助手</b></div>\r
              <div class="assistant-step"><span>01</span><div><b>理解产品与市场</b><small>从企业资料明确客户目标</small></div></div>\r
              <div class="assistant-step"><span>02</span><div><b>核对线索与来源</b><small>保留证据，按需补充信息</small></div></div>\r
              <div class="assistant-step"><span>03</span><div><b>准备下一次对话</b><small>由你审阅，再决定联系</small></div></div>\r
            </div>\r
          </div>\r
          <div class="workflow-guide" aria-label="客户开发四步流程">\r
            <button data-tab="discover"><span>01</span><b>搜索客户</b><small>描述产品与市场，创建任务</small></button>\r
            <button data-tab="jobs"><span>02</span><b>筛选客户</b><small>查看结果，核对匹配与来源</small></button>\r
            <button data-tab="customers"><span>03</span><b>保存客户</b><small>建立客户库，安排下一次跟进</small></button>\r
            <button data-tab="mail"><span>04</span><b>邮件触达</b><small>审阅开发信，确认后发送</small></button>\r
          </div>\r
          <div id="stats" class="stats"></div>\r
          <div class="grid-two">\r
            <div class="panel">\r
              <h3>今天值得推进的事</h3>\r
              <div id="next-actions"></div>\r
            </div>\r
            <div class="panel">\r
              <h3>一条清晰的开发路径</h3>\r
              <ol class="path">\r
                <li>\r
                  <b>完善企业资料</b><span>告诉 AI 你卖什么、优势是什么。</span>\r
                </li>\r
                <li>\r
                  <b>发现并筛选客户</b\r
                  ><span>检查证据；需要时再购买补充数据。</span>\r
                </li>\r
                <li>\r
                  <b>保存、写信、记录反馈</b\r
                  ><span>开发信经你审阅，通过自有邮箱发送。</span>\r
                </li>\r
              </ol>\r
            </div>\r
          </div>\r
        </section>\r
        <section id="discover" class="tab-panel" hidden>\r
          <div class="discovery-mode-bar">\r
            <div><h2>创建一个找客户任务</h2><p class="hint">点选产品、市场和客户类型，Agent 帮你一次整理成任务，确认后开始找客户。</p></div>\r
            <div class="mode-switch" role="tablist" aria-label="任务创建方式">\r
              <button id="discovery-chat-tab" type="button" role="tab" aria-selected="true" aria-controls="discovery-chat-pane" data-discovery-mode="chat">Agent 引导（推荐）</button>\r
              <button id="discovery-form-tab" type="button" role="tab" aria-selected="false" aria-controls="discovery-form-pane" tabindex="-1" data-discovery-mode="form">自行填写表单</button>\r
            </div>\r
          </div>\r
          <div class="grid-two discovery-layout">\r
            <div id="discovery-form-pane" role="tabpanel" aria-labelledby="discovery-form-tab" hidden>\r
            <form id="discovery-form" class="panel">\r
              <p class="eyebrow">告诉 AI 你的目标</p>\r
              <h2>下一批客户在哪里？</h2>\r
              <label\r
                >任务名称<input\r
                  name="name"\r
                  required\r
                  maxlength="80"\r
                  placeholder="例如：德国商用照明渠道"\r
              /></label>\r
              <div class="form-row">\r
                <label\r
                  >目标市场<input\r
                    name="market"\r
                    maxlength="100"\r
                    required\r
                    placeholder="德国" /></label\r
                ><label\r
                  >产品<input\r
                    name="product"\r
                    maxlength="150"\r
                    required\r
                    placeholder="商用 LED 筒灯"\r
                /></label>\r
              </div>\r
              <label\r
                >客户角色<select name="buyer_role">\r
                  <option value="any">不限，按描述筛选</option>\r
                  <option value="distributor">分销商 / 进口商</option>\r
                  <option value="manufacturer">制造商</option>\r
                  <option value="brand">终端客户 / 品牌</option>\r
                  <option value="service_provider">服务商 / 工程商</option>\r
                  <option value="public_buyer">政府 / 公共机构采购方</option>\r
                </select></label\r
              ><label\r
                >客户特征与筛选要求（选填）<textarea\r
                  name="instructions"\r
                  maxlength="1600"\r
                  rows="3"\r
                  placeholder="寻找有实体门店的照明经销商，排除制造商和货代。优先有供应商招募信息的企业。"\r
                ></textarea>\r
              </label>\r
\r
\r
              <div class="form-row">\r
                <label\r
                  >目标数量<input\r
                    name="target_count"\r
                    type="number"\r
                    min="1"\r
                    max="30"\r
                    value="10"\r
                    required /></label\r
                ><label\r
                  >HS 编码（选填）<input\r
                    name="hs_code"\r
                    pattern="[0-9]{6,10}"\r
                    placeholder="6–10 位数字"\r
                /></label>\r
              </div>\r
              <details class="advanced-options"><summary>更多筛选条件（选填）</summary><label\r
                >理想客户官网（选填）<input\r
                  name="seed_website"\r
                  type="url"\r
                  maxlength="500"\r
                  placeholder="https://example-buyer.com" /></label\r
              ><label\r
                >排除条件（逗号分隔）<input\r
                  name="exclude_keywords"\r
                  placeholder="货代、无关产品、只做零售" /></label\r
              ><label>更多参考客户官网（选填，最多5个，每行一个）<textarea name="reference_websites" rows="2" placeholder="https://buyer-one.com&#10;https://buyer-two.com"></textarea></label><label>排除客户域名（逗号分隔，含子域名）<input name="exclude_domains" placeholder="competitor.com, existing-customer.com" /></label></details>\r
              <label\r
                >数据方案<select name="tier">\r
                  <option value="basic">基础发现 · 公开搜索</option>\r
                  <option value="enhanced">\r
                    高级档 · 公开搜索 + 跨境魔方\r
                  </option>\r
                  <option value="ai_enhanced">AI增强档 · 高级档 + 目标岗位联系人（¥7预算）</option><option value="enhanced_contacts">增强发现 · 优先补前2家企业的联系方式</option>\r
                </select></label\r
              ><label>AI增强目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label><label class="check"\r
                ><input name="ted" type="checkbox" />同时查近 90 天 TED\r
                官方招标（原生接口无单次数据费；仍须核对时效及投标资格）</label\r
              ><label class="check" id="paid-label" hidden\r
                ><input name="paid" type="checkbox" />同意按下方当前档位报价预占平台点数与数据预算。按明确回传费用结算并释放差额，异常回传不向钱包追加扣点。</label\r
              ><div class="actions"><button id="discovery-preview" type="button">先看最多5家真实样本</button><button class="primary" type="submit">开始找客户 →</button></div>\r
              <p id="discovery-price" class="hint"></p>\r
            </form>\r
            </div>\r
            <div id="discovery-chat-pane" class="panel discovery-chat" role="tabpanel" aria-labelledby="discovery-chat-tab">\r
              <div class="chat-heading"><div><p class="eyebrow">VOKEN AGENT</p><h2>先聊聊，你想找谁？</h2></div><button id="discovery-chat-reset" type="button">重新开始</button></div>\r
              <p class="hint">先确认产品和市场，其他条件可用默认值。需要补充时，点选卡片即可，不必反复打字。</p>\r
              <div class="builder-steps" aria-label="任务构建流程"><span id="builder-step-brief" aria-current="step">1 确认目标</span><span id="builder-step-plan">2 核对方案</span><span>3 创建任务</span></div>\r
              <div id="discovery-chat-messages" class="chat-messages" role="log" aria-label="任务规划对话" aria-live="polite"></div>\r
              <div id="discovery-chat-brief"></div>\r
              <div id="discovery-chat-questions" aria-live="polite"></div>\r
              <div id="discovery-chat-examples" class="chat-examples">\r
                <button type="button" data-discovery-example="我们做商用 LED 灯具，想找德国的分销商，先找 10 家，排除只做零售的公司。">试填：德国照明分销商</button>\r
              </div>\r
              <details id="discovery-free-text"><summary>也可以直接描述需求 / 补充要求</summary>\r
                <form id="discovery-chat-form" data-extension="discovery">\r
                  <label for="discovery-chat-input">告诉 Agent 你的想法</label>\r
                  <textarea id="discovery-chat-input" name="content" rows="3" maxlength="2400" placeholder="例如：我们生产商用 LED 灯具，想找德国分销商，排除零售商……" required></textarea>\r
                  <div class="chat-composer-footer"><small>只整理方案，确认创建前不会启动找客户任务。</small><button type="submit" class="primary">整理需求 ↑</button></div>\r
                </form>\r
              </details>\r
              <div id="discovery-chat-error" class="chat-error" role="alert" hidden></div>\r
              <button id="discovery-chat-retry" type="button" hidden>重试整理（保留刚才的选择）</button>\r
              <div id="discovery-chat-plan"></div>\r
              <p class="hint">对话仅保留在当前页面，刷新或退出后清空。可随时修改条件或改用表单。</p>\r
            </div>\r
            <div class="panel discovery-guide">\r
              <p class="eyebrow">每一条线索，都有出处</p>\r
              <h3>任务创建小贴士</h3><p class="hint">只需确认产品与市场，即可整理方案。未指定时先找10家，找客完成后到任务管理筛选结果。</p>\r
              <details><summary>了解找客流程与数据方案</summary><div class="explain">\r
                <b>01 / 公开搜索先行</b>\r
                <p>AI 拆解市场与产品关键词，读取来源，提取可追溯线索。</p>\r
                <b>02 / 证据分开看</b>\r
                <p>\r
                  潜在匹配、公开采购信号、历史进口记录分别展示；历史交易不代表当前需求。\r
                </p>\r
                <b>03 / 小批量补全</b>\r
                <p>\r
                  增强档按预算补充候选、贸易核验和联系方式；无需购买完整数据库。\r
                </p>\r
                <b>04 / 你来决定下一步</b>\r
                <p>保存值得跟进的客户，再生成开发信和设置跟进。</p>\r
              </div>\r
              </details><h3>已有任务</h3>\r
              <div id="recent-discoveries" class="stack"></div>\r
              <hr />\r
              <details><summary>定期更新客户线索（可选）</summary>\r
              <form id="schedule-form">\r
                <label\r
                  >选择已建任务<select\r
                    name="agent_id"\r
                    id="schedule-agent"\r
                    required\r
                  ></select\r
                ></label>\r
                <div class="form-row">\r
                  <label\r
                    >每隔多少天<input\r
                      name="interval_days"\r
                      type="number"\r
                      min="1"\r
                      max="90"\r
                      value="14"\r
                      required /></label\r
                  ><label\r
                    >后续运行次数<input\r
                      name="remaining_runs"\r
                      type="number"\r
                      min="1"\r
                      max="365"\r
                      value="4"\r
                      required\r
                  /></label>\r
                </div>\r
                <p class="hint">\r
                  只运行基础档，每次按拓客报价消耗平台点数。首次在一个周期后执行；不会自动购买海关或联系方式数据。\r
                </p>\r
                <button type="submit">启用定期更新</button>\r
              </form>\r
              <div id="schedule-list" class="stack"></div></details>\r
            </div>\r
          </div>\r
        </section>\r
        <section id="directory" class="tab-panel" hidden>\r
          <form id="targeted-contact-form" data-extension="directory" class="panel"><h3>精准联系人检索 · AI增强</h3><p class="hint">针对已有企业直接检索目标岗位。请核对企业名称和官网，不会因为已有总机或通用邮箱而跳过。最多两次岗位查询，不自动发送邮件。</p><input type="hidden" name="prospect_id"><label>企业名称<input name="company_name" required maxlength="240"></label><label>已核对的企业官网<input name="website" type="url" required maxlength="500" placeholder="https://buyer.com"></label><label>AI增强目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label><label>具体职位（选填，逗号分隔，最多6个）<input name="contact_titles" maxlength="480" placeholder="Purchasing Manager, Sourcing Director"></label><p class="notice" id="targeted-contact-price">按当前精准检索报价预占，未使用部分释放；Hunter 积分单独记录。</p><label class="check"><input type="checkbox" name="reviewed" required>我已核对企业与官网归属</label><label class="check"><input type="checkbox" name="paid" required>同意按所示报价预占平台点数与数据预算</label><button type="submit" class="primary">开始精准联系人检索</button></form>\r
\r
          <details class="panel"><summary>按产品查询历史贸易记录</summary><form id="trade-form" data-extension="directory">\r
            <div class="form-row"><label>英文产品词<input name="product" maxlength="150" placeholder="food pan" /></label><label>HS 编码（可代替产品词）<input name="hs_code" pattern="[0-9]{6,10}" /></label></div>\r
            <div class="form-row"><label>买方国家（选填）<input name="buyer_country" pattern="[A-Z]{2}" placeholder="US" /></label><label>买方名称（选填）<input name="buyer" maxlength="200" /></label></div>\r
            <div class="form-row"><label>原产国（选填）<input name="origin_country" pattern="[A-Z]{2}" placeholder="CN" /></label><label>抵运国（选填）<input name="arrival_country" pattern="[A-Z]{2}" placeholder="US" /></label></div>\r
            <div class="form-row"><label>开始日期<input name="date_start" type="date" required /></label><label>结束日期<input name="date_end" type="date" required /></label></div>\r
            <label class="check"><input type="checkbox" name="paid" required />同意本页最多预占150数据点（¥1.50预算），另加平台点数</label><button type="submit">查询一页历史贸易</button><p class="hint">每页最多20条。可能包含混装货物和物流公司，历史记录不等于当前采购需求。</p>\r
          </form></details>\r
          <div class="grid-two">\r
            <form id="directory-form" class="panel" data-extension="directory">\r
              <p class="eyebrow">从企业走到具体的人</p><h2>补齐客户与联系方式</h2>\r
              <p class="hint">先查公司或岗位，核对主体后单独解锁联系方式。库存数量不等于已取得邮箱。</p>\r
              <div id="directory-selected" class="notice" hidden></div>\r
              <label>查询对象<select name="kind"><option value="company">企业</option><option value="people">人物与岗位</option></select></label>\r
              <label>公司名称<input name="company_name" maxlength="180" placeholder="Marmetal Industries" /></label>\r
              <label>公司官网（选填）<input name="website" type="url" maxlength="500" placeholder="https://www.marmetal.com" /></label>\r
              <div class="form-row"><label>国家代码（选填）<input name="country" pattern="[A-Z]{2}" maxlength="2" placeholder="US" /></label><label>产品词（选填）<input name="product" maxlength="150" placeholder="nickel alloy" /></label></div>\r
              <label>职位词（找人时使用，逗号分隔）<input name="titles" placeholder="purchasing, procurement, president" /></label>\r
              <label class="check"><input name="require_email" type="checkbox" />只查上游标记有邮箱库存的记录（仍需解锁与核对）</label>\r
              <label class="check"><input name="paid" type="checkbox" required />同意本页最多预占150数据点（¥1.50预算），另加平台点数；套餐扣量单独展示</label>\r
              <div class="actions"><button class="primary" type="submit">查询这一页</button><button id="directory-reset" type="button">清除已选企业</button></div>\r
              <p id="directory-price" class="hint"></p>\r
            </form>\r
            <div class="panel"><h2>每一步都能核对</h2><ol class="steps"><li>按名称、产品或官网找到企业，查看地区与地址，区分同名主体。</li><li>选中企业后查岗位；销售、总裁与采购角色分别判断。</li><li>只解锁你选中的一家企业或一个人，保留邮箱、电话、社媒和上游验证标记。</li><li>核对公司归属后存入客户的一对多联系人档案。</li></ol><p class="hint">分页按需发起，不自动翻页或批量解锁。不会自动外发邮件。</p></div>\r
          </div>\r
        </section>\r
        <section id="sources" class="tab-panel" hidden>\r
          <div class="section-intro"><h2>你想了解什么？</h2><p class="muted">查企业背景、找采购机会，或了解市场。选一个目的，再输入你关心的企业或产品。</p></div>\r
          <div class="intent-grid" role="group" aria-label="查询目的">\r
            <button type="button" data-intent="identity" aria-pressed="true"><b>查企业背景</b><span>核对企业登记与身份信息</span></button>\r
            <button type="button" data-intent="procurement" aria-pressed="false"><b>找采购机会</b><span>查公开招标与项目公告</span></button>\r
            <button type="button" data-intent="market" aria-pressed="false"><b>了解市场</b><span>查贸易统计与市场规则</span></button>\r
            <button type="button" data-intent="risk" aria-pressed="false"><b>查产品风险</b><span>查公开召回与安全公告</span></button>\r
            <button type="button" data-intent="research" aria-pressed="false"><b>查企业动态与目录</b><span>了解企业披露、行业与展会信息</span></button>\r
          </div>\r
          <div class="grid-two intelligence-layout">\r
            <form id="source-form" class="panel">\r
              <h3 id="intent-title">查企业背景</h3>\r
              <label><span id="source-query-label">企业名称</span><input name="query" required maxlength="120" placeholder="例如：Siemens（建议使用英文全称）" /></label>\r
              <p id="source-query-help" class="hint"></p>\r
              <label>查询范围<select id="source-select" name="source_id" required></select></label>\r
              <p id="source-guidance" class="notice" aria-live="polite"></p>\r
              <details class="advanced-options"><summary>更多查询条件（选填）</summary>\r
                <label>企业或公告所属国家<select name="country"><option value="">不限国家</option><option value="CN">中国</option><option value="US">美国</option><option value="GB">英国</option><option value="DE">德国</option><option value="FR">法国</option><option value="CA">加拿大</option><option value="AU">澳大利亚</option><option value="JP">日本</option><option value="IN">印度</option><option value="SG">新加坡</option><option value="AE">阿联酋</option><option value="SA">沙特阿拉伯</option><option value="ZA">南非</option><option value="BR">巴西</option><option value="MX">墨西哥</option><option value="IT">意大利</option><option value="NL">荷兰</option><option value="ES">西班牙</option><option value="VN">越南</option><option value="KR">韩国</option><option value="ID">印度尼西亚</option><option value="TH">泰国</option><option value="MY">马来西亚</option></select></label>\r
                <label>最多显示多少条<input name="limit" type="number" min="1" max="20" value="10" required /></label>\r
                <label id="source-time-field">公告时间范围<select name="since_days"><option value="30">最近30天</option><option value="90" selected>最近90天</option><option value="365">最近一年</option></select></label>\r
                <label id="source-entity-field">企业类型<select name="entity_category"><option value="GENERAL">一般企业</option><option value="BRANCH">分支机构</option><option value="FUND">基金</option><option value="ALL">全部</option></select></label>\r
                <label id="source-stage-field">公告类型<select name="procurement_stage"><option value="tender">招标机会</option><option value="award">历史中标 / 合同</option><option value="all">全部阶段</option></select></label>\r
                <details><summary>数据来源与覆盖说明</summary><p id="source-info" class="hint"></p></details>\r
              </details>\r
              <p id="source-price" class="hint"></p><button id="source-submit" type="submit" class="primary">开始查询 →</button>\r
            </form>\r
            <div class="panel"><h3>查完以后，怎么用？</h3><ol class="path"><li><b>查看查询结果</b><span>提交后自动进入任务详情，查询会在后台继续。</span></li><li><b>打开原文核对</b><span>企业背景用于核对身份；采购公告需确认截止时间和参与资格。</span></li><li><b>保存并跟进</b><span>结果中有明确企业时，可保存到客户管理。市场统计和风险公告用于研究判断。</span></li></ol><p class="notice">想直接获得一批潜在客户？用「找客户」创建任务更合适。</p><button data-tab="discover">去找客户 →</button><details><summary>查看全部数据来源</summary><div id="source-catalog" class="stack"></div></details></div>\r
          </div>\r
        </section>\r
        <section id="workbench" class="tab-panel" hidden>\r
          <div class="section-intro"><h2>把合适的企业，推进到合适的人</h2><p class="muted">企业匹配、目标岗位与邮箱验证分开判断，来源和历史记录随时可查。</p></div>\r
          <form id="wb-filter" data-extension="workbench" class="wb-filters">\r
            <label>查看方式<select name="mode"><option value="companies">企业</option><option value="contacts">联系人</option></select></label>\r
            <label>搜索<input name="q" placeholder="企业、姓名或邮箱" maxlength="200"></label>\r
            <label>国家／地区<input name="country_filter" maxlength="100" placeholder="US / 美国"></label>\r
            <label>销售阶段<select name="stage"><option value="">全部阶段</option><option value="new">新发现</option><option value="qualified">已筛选</option><option value="contacted">已联系</option><option value="replied">已回复</option><option value="negotiating">洽谈中</option><option value="won">已成交</option><option value="lost">不匹配</option></select></label>\r
            <label>标签<input name="tag" maxlength="40"></label>\r
            <label>目标岗位<select name="target"><option value="procurement">采购／供应链</option><option value="leadership">企业负责人</option><option value="sales">销售／业务开发</option></select></label>\r
            <label>独立邮箱验证<select name="verification"><option value="">全部状态</option><option value="valid">有效</option><option value="invalid">无效／不应联系</option><option value="unknown">未知</option><option value="catch_all">全收域</option><option value="unverified">尚未验证</option></select></label>\r
            <label class="check"><input type="checkbox" name="has_email">有完整邮箱</label><label class="check"><input type="checkbox" name="due">到期跟进</label>\r
            <label>岗位判断<select name="role_filter"><option value="">全部岗位</option><option value="keyword_match">命中目标关键词</option><option value="needs_review">未命中，待核实</option><option value="unknown">岗位未知</option></select></label>\r
            <label class="check"><input type="checkbox" name="ready_only">企业已评审且岗位匹配、邮箱近期有效</label>\r
            <button type="submit" class="primary">应用筛选</button>\r
          </form>\r
          <div class="toolbar"><label>已保存视图<select id="wb-views"><option value="">选择视图</option></select></label><label>视图名称<input id="wb-view-name" maxlength="80" placeholder="例如：美国采购岗位待核查"></label><button id="wb-save-view">保存当前视图</button></div>\r
          <div id="wb-summary" class="notice" aria-live="polite"></div><div id="wb-list" class="stack" aria-live="polite"></div>\r
          <div class="pagination"><button id="wb-prev">上一页</button><span id="wb-page"></span><button id="wb-next">下一页</button></div>\r
          <div id="wb-history" class="panel" hidden></div>\r
          <details class="panel"><summary>批量安排跟进 · 多轮提醒</summary><form id="wb-followup" data-extension="workbench"><label>首次提醒<input name="due_at" type="datetime-local" required></label><label>后续提醒（相对首次的天数）<input name="intervals" placeholder="3,7,14"></label><label>跟进目标<input name="objective" maxlength="500" required placeholder="审阅开发信，核对采购职责"></label><p class="hint">选择上方企业后安排提醒；收到回复、退信或停止联系时暂停后续提醒。每封邮件仍需单独审阅确认。</p><button type="submit">为选中企业安排</button></form></details>\r
          <h3>跟进待办</h3><div id="wb-tasks" class="stack"></div>\r
          <details class="panel"><summary>产品与客群方向</summary>\r
            <form id="wb-product" data-extension="workbench"><label>产品名称<input name="name" maxlength="150" required></label><label>产品与用途<textarea name="description" maxlength="2000" required></textarea></label><label>核心优势<textarea name="value" maxlength="1000"></textarea></label><button type="submit">新增产品档案</button></form>\r
            <form id="wb-cohorts" data-extension="workbench"><label>产品<select name="product_id" id="wb-products" required></select></label><label>目标市场<input name="market" maxlength="100" required></label><button type="submit">推荐买家客群</button></form><div id="wb-cohort-results"></div>\r
          </details>\r
          <details class="panel"><summary>导入已有客户名单 · 先预览再确认</summary><p class="hint">CSV、XLSX 或可提取表格文本的 PDF；最多 200 行。PDF 需表头及制表符或竖线分列，不支持扫描件。已有同名同地区客户只复用，不覆盖。</p>\r
            <form id="wb-upload" data-extension="workbench"><label>客户名单<input type="file" name="file" accept=".csv,.xlsx,.pdf" required></label><button type="submit">解析并预览</button></form><div id="wb-import-preview"></div>\r
          </details>\r
          <details class="panel"><summary>收件归档 · 回复、退信与停止联系</summary><p id="wb-inbox-capability" class="hint"></p><button id="wb-sync-inbox">同步收件箱</button>\r
            <form id="wb-eml" data-extension="workbench"><label>邮件文件<input type="file" name="file" accept=".eml" required></label><button type="submit">预览邮件</button></form><div id="wb-inbox"></div>\r
          </details>\r
        </section>\r
        <section id="customers" class="tab-panel" hidden>\r
          <div class="toolbar">\r
            <input\r
              id="customer-query"\r
              aria-label="搜索公司名"\r
              placeholder="搜索公司名"\r
            /><select id="stage-filter" aria-label="销售阶段">\r
              <option value="">全部阶段</option></select\r
            ><label class="check"\r
              ><input id="due-filter" type="checkbox" />只看待跟进</label\r
            ><button id="filter-customers">筛选</button\r
            ><button id="export">导出 CSV</button\r
            ><button id="show-import">导入客户</button>\r
          </div>\r
          <div id="customer-count" class="hint"></div>\r
          <div class="customer-layout">\r
            <div id="customer-list" class="stack"></div>\r
            <div id="customer-detail" class="panel detail">\r
              <div class="empty"><span class="empty-symbol" aria-hidden="true">◎</span><h3>把线索变成下一步行动</h3><p>选择一位客户，核对来源、撰写邮件或安排跟进。</p></div>\r
            </div>\r
          </div>\r
          <div class="pagination">\r
            <button id="prev">上一页</button><span id="page-number"></span\r
            ><button id="next">下一页</button>\r
          </div>\r
          <details id="import-panel" class="panel">\r
            <summary>导入你的客户名单</summary>\r
            <p class="hint">\r
              粘贴带表头的 CSV，支持 name, location, website, contact,\r
              source_url, source_note。每批最多 200 条。来源说明 source_note\r
              必填，可用下方默认说明补齐。不会验证邮箱可投递性。\r
            </p>\r
            <form id="import-form">\r
              <label\r
                >默认来源说明<input\r
                  name="source_note"\r
                  required\r
                  maxlength="1000"\r
                  placeholder="例如：本公司在 2026 年展会收集的商务名片" /></label\r
              ><label\r
                >CSV 内容<textarea\r
                  name="csv"\r
                  rows="8"\r
                  required\r
                  placeholder="name,location,website,contact&#10;Example Buyer,US,https://example.com,sales@example.com"\r
                ></textarea></label\r
              ><button type="submit" class="primary">导入名单</button>\r
            </form>\r
          </details>\r
        </section>\r
        <section id="jobs" class="tab-panel" hidden>\r
          <div class="toolbar"><p class="muted">查看任务进度，打开详情筛选客户、核对来源。</p><button class="primary" data-tab="discover">＋ 创建找客户任务</button></div>\r
          <div class="toolbar"><label>任务类型<select id="job-type-filter"><option value="">全部类型</option><option value="prospecting">找客户</option><option value="intelligence">商业情报</option><option value="outreach_draft">邮件草稿</option></select></label><label>任务状态<select id="job-status-filter"><option value="">全部状态</option><option value="active">进行中</option><option value="done">已完成</option><option value="failed">失败 / 已取消</option></select></label></div>\r
          <p id="job-count" class="hint"></p><div id="job-list" class="task-grid"></div>\r
        </section>\r
        <section id="job-view" class="tab-panel" hidden>\r
          <div class="toolbar"><button data-tab="jobs">← 返回任务列表</button><span class="hint">任务管理 / 任务详情</span></div>\r
          <div id="job-detail" class="panel"></div>\r
        </section>\r
        <section id="mail" class="tab-panel" hidden>\r
          <div class="section-intro"><h2>从草稿到发送，在这里管理</h2><p class="muted">先在客户档案生成开发信，再打开草稿审阅和发送。</p><button data-tab="customers">选择客户写邮件 →</button></div>\r
          <div class="panel"><h3>邮件草稿</h3><div id="mail-drafts" class="task-grid"></div></div>\r
          <details class="panel" open><summary>自有邮箱发送记录</summary><div id="mail-deliveries"></div></details>\r
        </section>\r
        <section id="company" class="tab-panel" hidden>\r
          <div class="panel">\r
            <h2>让 AI 先了解你的企业</h2>\r
            <p class="hint">\r
              任选一种方式开始：输入名称、提供官网或上传文件。AI\r
              先生成有原文依据的草案，由你审阅后采用。\r
            </p>\r
            <div class="intake-grid">\r
              <form id="company-name-form" data-extension="true">\r
                <span class="route-number">01 / 企业名称</span>\r
                <label\r
                  >企业名称<input\r
                    name="name"\r
                    required\r
                    minlength="2"\r
                    maxlength="200" /></label\r
                ><button type="submit">按名称查找官网</button>\r
                <div id="company-candidates"></div>\r
              </form>\r
              <form id="company-website-form" data-extension="true">\r
                <span class="route-number">02 / 企业官网</span>\r
                <label\r
                  >待分析的企业官网<input\r
                    name="website"\r
                    type="url"\r
                    required\r
                    maxlength="500"\r
                    placeholder="https://" /></label\r
                ><button type="submit">读取官网并生成草案</button>\r
              </form>\r
            <form id="company-upload-form" data-extension="true">\r
              <span class="route-number">03 / 介绍文件</span>\r
              <label\r
                >企业介绍文件<input\r
                  name="file"\r
                  type="file"\r
                  accept=".txt,.md,.docx,.pdf"\r
                  required /></label\r
              ><button type="submit">上传并分析介绍</button>\r
              <p class="hint">\r
                支持 TXT、MD、DOCX 和文字型 PDF，最多 50\r
                MiB；原文件不保存，提取文本交由模型分析。资料分析目前不扣平台点数。\r
              </p>\r
            </form>\r
            </div>\r
            <div id="company-proposal"></div>\r
          </div>\r
          <div id="company-certification" class="panel"></div>\r
          <div class="grid-two">\r
            <form id="company-form" class="panel">\r
              <p class="eyebrow">让 AI 理解你的生意</p>\r
              <h2>我的企业</h2>\r
              <label\r
                >企业名称<input name="name" required maxlength="200" /></label\r
              ><label\r
                >官网<input name="website" type="url" maxlength="500" /></label\r
              ><label\r
                >主营产品<textarea\r
                  name="products"\r
                  rows="4"\r
                  required\r
                  maxlength="4000"\r
                ></textarea></label\r
              ><label\r
                >真实优势与可验证能力<textarea\r
                  name="advantages"\r
                  rows="3"\r
                  maxlength="4000"\r
                ></textarea></label\r
              ><label\r
                >对外联系信息<textarea\r
                  name="contact_details"\r
                  rows="3"\r
                  maxlength="2000"\r
                  placeholder="发件人、职位、商务邮箱、公司地址"\r
                ></textarea></label\r
              ><label\r
                >销售边界<textarea\r
                  name="sales_boundaries"\r
                  rows="3"\r
                  maxlength="4000"\r
                  placeholder="最低订单量、不能承诺的认证或交期"\r
                ></textarea></label\r
              ><button type="submit" class="primary">保存企业资料</button>\r
            </form>\r
            <div class="panel">\r
              <h3>账号与企业资料</h3>\r
              <details>\r
                <summary>修改登录密码</summary>\r
                <form id="password-change-form" data-extension="true">\r
                  <label\r
                    >当前密码<input\r
                      name="current_password"\r
                      type="password"\r
                      required\r
                      minlength="8"\r
                      maxlength="128"\r
                      autocomplete="current-password" /></label\r
                  ><label\r
                    >新登录密码<input\r
                      name="new_password"\r
                      type="password"\r
                      required\r
                      minlength="8"\r
                      maxlength="128"\r
                      autocomplete="new-password" /></label\r
                  ><button type="submit">更新密码并退出所有设备</button>\r
                </form>\r
              </details>\r
              <h3>越具体，开发信越贴切</h3>\r
              <p class="muted">\r
                填写真实产品、客户价值和业务边界。AI\r
                会结合客户来源写草稿；发送前请核对产品承诺、收件人和联系理由。\r
              </p>\r
              <div class="notice">\r
                企业名称和主营产品是生成开发信的必要条件。未填写的价格、认证和交期不会作为已知事实提供给\r
                AI。\r
              </div>\r
            </div>\r
          </div>\r
        </section>\r
        <section id="costs" class="tab-panel" hidden>\r
          <div class="panel">\r
            <h2>会员与点数</h2>\r
            <div id="billing-note" class="notice"></div>\r
            <div id="billing-plans" class="plan-grid"></div>\r
            <div id="billing-checkout"></div>\r
          </div>\r
          <div class="grid-two">\r
            <div class="panel">\r
              <h3>会员点数领取</h3>\r
              <div id="memberships"></div>\r
            </div>\r
            <div class="panel">\r
              <h3>充值与会员订单</h3>\r
              <div id="billing-orders"></div>\r
            </div>\r
          </div>\r
          <div id="usage" class="stats"></div>\r
          <div class="grid-two">\r
            <div class="panel">\r
              <h3>任务点数报价</h3>\r
              <div id="prices"></div>\r
              <p class="hint">\r
                平台点数与上游供应商费用是两种口径；提交任务先预占，失败后依账本规则释放。\r
              </p>\r
            </div>\r
            <div class="panel">\r
              <h3>低资金成本运行</h3>\r
              <div class="explain">\r
                <b>复用已获得的信息</b>\r
                <p>\r
                  同一工作空间的公开搜索和网页结果默认缓存 6\r
                  小时，命中时不重复请求上游。\r
                </p>\r
                <b>增强由你选择</b>\r
                <p>\r
                  基础档不调用跨境魔方。增强档有单任务预算和平台每日调用上限。\r
                </p>\r
                <b>用自己的邮箱完成触达</b>\r
                <p>\r
                  审阅后复制草稿或下载邮件文件，通过自有邮箱发送，回到客户页记录结果。\r
                </p>\r
              </div>\r
            </div>\r
          </div>\r
          <div class="panel">\r
            <h3>近 30 天上游用量</h3>\r
            <div id="provider-usage"></div>\r
            <p class="hint">\r
              金额是已记录的供应商估算或预留，不含模型金额、服务器与邮箱费用，不是完整账单。上游未知费用不能当作零。模型\r
              tokens 由供应商回传，缺失时无法完整计算。\r
            </p>\r
          </div>\r
          <div class="panel">\r
            <h3>最近点数流水</h3>\r
            <div id="ledger"></div>\r
          </div>\r
        </section>\r
`,Ln=`        <details id="register-panel">\r
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
`,Pe="voken:updated";function tn(){const n=window.location.pathname;return n.endsWith("/app")||n.endsWith("/app/")?n.replace(/\/app\/?$/,"/app-assets/"):"/app-assets/"}let le;function Rn(){return le||(window.__VOKEN_REACT__=!0,le=(async()=>{for(const n of["auth","workspace","login-form","logout","balance","refresh","wb-filter","company-form","discovery-form"])if(!document.getElementById(n))throw new Error("界面初始化未完成，请刷新重试。");for(const n of["app.js","account.js","discovery.js","directory.js","workbench.js","react-bridge.js"])await new Promise((s,i)=>{const t=document.createElement("script");t.src=tn()+n+"?v="+(new URL(import.meta.url).searchParams.get("v")||"development");const l=()=>window.removeEventListener("error",o),o=d=>{d.filename&&d.filename.split("?")[0]===t.src.split("?")[0]&&(l(),i(new Error("界面资源初始化失败，请刷新重试。")))};window.addEventListener("error",o),t.onload=()=>{l(),s()},t.onerror=()=>{l(),i(new Error("界面资源加载失败，请刷新重试。"))},document.head.appendChild(t)});return window.voken})(),le)}function Mn({action:n,bridge:s,onClose:i,onSaved:t}){var x,S;const{message:l}=Ie.useApp(),[o]=z.useForm(),[d,b]=v.useState(!1),[h,r]=v.useState(""),c=z.useWatch("type",o),L=n.kind==="review"?"记录企业匹配评审":n.kind==="event"?"记录联系进展":`为 ${((x=n.ids)==null?void 0:x.length)||0} 家企业安排跟进`;async function _(y){var E;if(!d){b(!0),r("");try{n.kind==="review"?await s.post("/assessments",{prospect_id:n.row.id,status:y.status,reason:y.reason.trim()}):n.kind==="event"?await s.post("/events",{prospect_id:n.row.prospect_id,email:((E=y.email)==null?void 0:E.trim())||"",type:y.type,content:y.content.trim(),source:"user_recorded"},"event"):(await s.post("/followups",{prospect_ids:n.ids,due_at:y.due_at.toISOString(),intervals_days:(y.intervals||"").split(/[,，]/).filter(f=>f.trim()).map(Number),objective:y.objective.trim()},"followup"),s.select([])),i(),l.success(n.kind==="review"?"企业评审已保存":n.kind==="event"?"联系进展已记录":"跟进提醒已安排"),t()}catch(f){r(f.message)}finally{b(!1)}}}return e.jsxs(X,{title:L,open:!0,onCancel:()=>{d||i()},maskClosable:!d,keyboard:!d,closable:!d,footer:null,children:[h&&e.jsx(D,{type:"error",title:h,showIcon:!0,className:"modal-error"}),e.jsxs(z,{form:o,layout:"vertical",disabled:d,scrollToFirstError:{focus:!0},"data-extension":"react",onFinish:y=>void _(y),initialValues:{status:"unknown",type:"reply",email:((S=n.row)==null?void 0:S.email)||""},children:[n.kind==="review"&&e.jsxs(e.Fragment,{children:[e.jsxs(we.Paragraph,{type:"secondary",children:[n.row.name," · 新增独立评审记录，并保留原始证据。"]}),e.jsx(z.Item,{name:"status",label:"企业匹配判断",rules:[{required:!0}],children:e.jsx(U,{options:[{value:"fit",label:"符合目标客户画像"},{value:"not_fit",label:"不符合"},{value:"unknown",label:"依据不足，待核实"}]})}),e.jsx(z.Item,{name:"reason",label:"理由与来源证据",rules:[{required:!0,whitespace:!0,message:"请填写判断理由与证据"}],children:e.jsx(P.TextArea,{maxLength:1e3,rows:4,showCount:!0,placeholder:"说明企业角色、产品匹配与判断依据"})})]}),n.kind==="event"&&e.jsxs(e.Fragment,{children:[e.jsxs(we.Paragraph,{type:"secondary",children:[n.row.company," · ",n.row.name||"已记录的联系入口"]}),e.jsx(z.Item,{name:"type",label:"事件类型",rules:[{required:!0}],children:e.jsx(U,{options:[{value:"reply",label:"收到回复"},{value:"bounce",label:"退信"},{value:"opt_out",label:"拒绝联系"},{value:"meeting",label:"会议"},{value:"note",label:"备注"}]})}),e.jsx(z.Item,{name:"email",label:"事件关联邮箱",rules:[{required:["bounce","opt_out"].includes(c),message:"退信或拒绝联系时请填写事件邮箱"},{type:"email",message:"请输入有效邮箱"}],children:e.jsx(P,{type:"email",maxLength:254})}),e.jsx(z.Item,{name:"content",label:"联系进展",rules:[{required:!0,whitespace:!0,message:"请填写联系进展"}],children:e.jsx(P.TextArea,{maxLength:4e3,rows:4,showCount:!0})}),e.jsx(D,{type:"info",title:"退信与拒绝联系会拦截后续发送；收到回复会暂停后续提醒。"})]}),n.kind==="followup"&&e.jsxs(e.Fragment,{children:[e.jsx(z.Item,{name:"due_at",label:"首次提醒时间（本地时间）",rules:[{required:!0,message:"请选择首次提醒时间"}],children:e.jsx(xn,{showTime:{format:"HH:mm"},format:"YYYY-MM-DD HH:mm",placeholder:"选择提醒时间",className:"full-width"})}),e.jsx(z.Item,{name:"intervals",label:"后续提醒（相对首次的天数）",rules:[{validator:(y,E)=>{const f=String(E||"").split(/[,，]/).filter(j=>j.trim()).map(Number);return f.length<=5&&f.every(j=>Number.isInteger(j)&&j>=1&&j<=90)&&new Set(f).size===f.length&&f.every((j,R)=>R===0||j>f[R-1])?Promise.resolve():Promise.reject(new Error("最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔"))}}],children:e.jsx(P,{placeholder:"例如：3,7,14"})}),e.jsx(z.Item,{name:"objective",label:"跟进目标",rules:[{required:!0,whitespace:!0,message:"请填写跟进目标"}],children:e.jsx(P.TextArea,{rows:3,maxLength:500,showCount:!0,placeholder:"例如：核对采购职责，审阅并准备第一封开发信"})}),e.jsx(D,{type:"info",title:"这里只安排提醒。每封邮件仍需单独审阅确认后发送。"})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(u,{onClick:i,disabled:d,children:"取消"}),e.jsx(u,{type:"primary",htmlType:"submit",loading:d,children:n.kind==="review"?"保存评审":n.kind==="event"?"记录进展":"安排提醒"})]})]})]})}const an=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:2}),V=n=>`USD ${an.format(n)}`,Be=[{id:"DEMO-MY-001",product:"连锁门店包装耗材",buyer:"吉隆坡连锁商户 A",amount:48e3,received:14400,due:"演示第 30 天",overdue:!0,receipt:{reference:"DEMO-PSP-8616",orderId:"DEMO-MY-001",currency:"USD",amount:33600},shipment:{label:"海运 · 待发运",route:"深圳 → 巴生港",risks:"受潮、包装破损与中转装卸风险",missing:"装箱单、运输节点和货物交接责任"},acceptance:!1,receivableConfirmed:!1},{id:"DEMO-MY-002",product:"门店标准化设备",buyer:"槟城零售商户 B",amount:26400,received:0,due:"演示第 45 天",shipment:{label:"海运 · 已签收",route:"广州 → 槟城",risks:"设备运输碰撞、装卸损坏；后续经营阶段可梳理设备财产和责任保障",missing:"签收时的设备状态、设备清单和门店运营地址"},acceptance:!0,receivableConfirmed:!0},{id:"DEMO-MY-003",product:"门店标识补货",buyer:"新山零售商户 C",amount:18e3,received:18e3,due:"演示第 20 天",shipment:{label:"空运 · 已交付",route:"广州 → 新山",risks:"可复盘分批运输及交接记录，供下次补货时核对保障需求",missing:"本批已交付，汇总交接记录供后续订单参考"},acceptance:!0,receivableConfirmed:!0}];function K(n){return n.amount-n.received}function rn(n){return n.reduce((s,i)=>({received:s.received+i.received,outstanding:s.outstanding+K(i),unpaid:s.unpaid+(K(i)>0?1:0)}),{received:0,outstanding:0,unpaid:0})}function ln({mode:n}){const s=n==="payment";return e.jsxs("div",{className:"business-demo-banner",children:[e.jsx("span",{className:"business-demo-icon","aria-hidden":"true",children:s?e.jsx(ve,{}):e.jsx(xe,{})}),e.jsxs("div",{children:[e.jsxs("div",{className:"business-banner-heading",children:[e.jsx("h2",{children:s?"马来西亚跨境采购试点":"马来西亚出海服务试点"}),e.jsx(k,{color:"gold",children:"演示环境"})]}),e.jsx("p",{children:s?"跟踪订单应收、准备收款提醒，并核对支付渠道回传的流水。所有订单和流水均为样例。":"按订单整理货运与经营保障需求，检查应收融资材料。所有材料和进度均为样例。"})]})]})}function he(n){return K(n)?n.receipt?{text:"有流水待核对",color:"orange"}:{text:"待回款",color:"blue"}:{text:"已结清",color:"green"}}function on({orders:n,order:s,select:i}){return e.jsx(q,{title:"选择演示订单",className:"demo-order-list",children:e.jsx("div",{className:"demo-order-options",role:"group","aria-label":"演示订单",children:n.map(t=>e.jsxs("button",{type:"button","aria-pressed":t.id===s.id,onClick:()=>i(t),children:[e.jsxs("span",{className:"demo-order-title",children:[e.jsx("strong",{children:t.product}),e.jsx(k,{color:he(t).color,children:he(t).text})]}),e.jsx("span",{children:t.buyer}),e.jsxs("small",{children:[t.id," · ",V(t.amount)]})]},t.id))})})}function Fn({orders:n,order:s,select:i,reconcile:t,openProtection:l}){const[o,d]=v.useState(null),b=rn(n),h=K(s),r=s.receipt,c=(r==null?void 0:r.orderId)===s.id&&r.currency==="USD"&&r.amount===h;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(ln,{mode:"payment"}),e.jsxs("div",{className:"business-grid demo-statistics","aria-label":"演示收款汇总",children:[e.jsx(q,{children:e.jsx(ce,{title:"订单总数",value:n.length,suffix:"笔"})}),e.jsx(q,{children:e.jsx(ce,{title:"累计回款",value:b.received,prefix:"USD"})}),e.jsx(q,{children:e.jsx(ce,{title:"待回款",value:b.outstanding,prefix:"USD"})})]}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(on,{orders:n,order:s,select:i}),e.jsxs(q,{title:s.product,extra:e.jsx(k,{color:he(s).color,children:he(s).text}),children:[e.jsx(Q,{size:"small",column:{xs:1,sm:2},items:[{key:"buyer",label:"买方",children:s.buyer},{key:"amount",label:"合同金额",children:V(s.amount)},{key:"received",label:"累计回款",children:V(s.received)},{key:"remaining",label:"待回款",children:V(h)},{key:"due",label:"付款节点",children:`${s.due}${s.overdue&&h?" · 已逾期":""}`},{key:"shipment",label:"履约状态",children:s.shipment.label}]}),e.jsxs("div",{className:"demo-actions",children:[h>0&&e.jsx(u,{onClick:()=>d("reminder"),children:"预览收款提醒"}),r&&e.jsx(u,{type:"primary",onClick:()=>d("reconcile"),children:"核对回款流水"}),e.jsx(u,{onClick:l,children:"查看订单保障"})]}),e.jsx("h3",{className:"demo-subheading",children:"订单与收款进度"}),e.jsx(Ge,{items:[{color:"green",content:"买卖双方确认报价、合同及付款条款"},{color:s.received?"green":"gray",content:s.received?`已入账 ${V(s.received)}`:"等待支付渠道回传流水"},{color:r?"orange":h?"gray":"green",content:r?`渠道流水 ${r.reference} 待人工核对`:h?"待收到款项并完成对账":"应收余额为零，已结清"}]})]})]}),e.jsxs(X,{open:o==="reminder",title:"收款跟进员 · 提醒草稿",onCancel:()=>d(null),footer:e.jsx(u,{onClick:()=>d(null),children:"关闭预览"}),children:[e.jsx(D,{type:"info",showIcon:!0,title:"演示草稿，仅供人工审阅"}),e.jsxs("p",{children:[s.buyer,"，您好！想与您核对订单 ",s.id,"「",s.product,"」的付款进度。"]}),e.jsxs("p",{children:["根据样例账面记录，当前待回款 ",V(h),"，约定付款节点为",s.due,"。如已安排付款，请回复交易参考号，便于核对。谢谢！"]})]}),e.jsxs(X,{open:o==="reconcile"&&!!r,title:"人工确认回款对账",onCancel:()=>d(null),okText:"确认演示对账",okButtonProps:{disabled:!c},onOk:()=>{t(),d(null)},children:[e.jsx(Q,{size:"small",column:1,items:[{key:"id",label:"流水关联订单",children:r==null?void 0:r.orderId},{key:"reference",label:"渠道流水",children:r==null?void 0:r.reference},{key:"amount",label:"流水金额",children:r&&`${r.currency} ${an.format(r.amount)}`},{key:"expected",label:"待回款",children:V(h)}]}),c?e.jsx(D,{type:"success",showIcon:!0,title:"样例流水的订单号、币种与应收金额已匹配",description:"确认后更新本次演示金额。重新打开页面后恢复初始样例。"}):e.jsx(D,{type:"warning",showIcon:!0,title:"流水与应收信息有差异，请人工复核。"})]})]})}function zn(n){return[{label:"企业主体及买方资料",present:!0},{label:"真实订单与合同",present:!0},{label:"应收账款确权凭证",present:n.receivableConfirmed},{label:"履约及验收凭证",present:n.acceptance},{label:"还款来源与安排",present:!1}]}function Pn({orders:n,order:s,select:i,openPayments:t}){const[l,o]=v.useState(null),d=zn(s),b=d.filter(({present:h})=>h).length;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(ln,{mode:"protection"}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(on,{orders:n,order:s,select:i}),e.jsx(q,{title:s.product,extra:e.jsx(u,{size:"small",onClick:t,children:"查看订单收款"}),children:e.jsx(Ke,{items:[{key:"insurance",label:"货运与经营保障",children:e.jsxs(e.Fragment,{children:[e.jsx(Q,{size:"small",column:1,items:[{key:"route",label:"运输路线",children:`${s.shipment.route} · ${s.shipment.label}`},{key:"value",label:"订单金额",children:V(s.amount)},{key:"risks",label:"风险关注",children:s.shipment.risks},{key:"missing",label:"资料待核对",children:s.shipment.missing}]}),e.jsx("div",{className:"demo-actions",children:e.jsx(u,{type:"primary",onClick:()=>o("insurance"),children:"预览保障需求清单"})})]})},{key:"funding",label:"应收融资对接",children:e.jsx(e.Fragment,{children:K(s)?e.jsxs(e.Fragment,{children:[e.jsx(Q,{size:"small",column:1,items:[{key:"remaining",label:"待回款",children:V(K(s))},{key:"materials",label:"材料准备",children:`已备 ${b} / ${d.length} 项`}]}),e.jsx("ul",{className:"demo-materials",children:d.map(({label:h,present:r})=>e.jsxs("li",{children:[e.jsx("span",{children:h}),e.jsx(k,{color:r?"green":"gold",children:r?"已备":"待补充"})]},h))}),e.jsx(u,{type:"primary",onClick:()=>o("funding"),children:"预览机构对接摘要"})]}):e.jsx(D,{type:"info",showIcon:!0,title:"这笔订单已结清，无待融资应收"})})}]})})]}),e.jsxs(X,{open:l!==null,title:l==="insurance"?"保险分析师 · 保障需求清单":"应收融资 · 机构对接摘要",onCancel:()=>o(null),footer:e.jsx(u,{onClick:()=>o(null),children:"关闭预览"}),children:[e.jsx("p",{children:e.jsxs("strong",{children:[s.id," · ",s.product]})}),l==="insurance"?e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["运输与经营风险：",s.shipment.risks,"。"]}),e.jsxs("p",{children:["资料待核对：",s.shipment.missing,"。"]}),e.jsx(D,{type:"info",showIcon:!0,title:"下一步由保险机构确认保障范围、条件和所需材料。"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["样例应收余额 ",V(K(s)),"，约定付款节点为",s.due,"。"]}),e.jsxs("p",{children:["材料缺口：",d.filter(({present:h})=>!h).map(({label:h})=>h).join("、"),"。"]}),e.jsx(D,{type:"info",showIcon:!0,icon:e.jsx(ee,{}),title:"材料补齐后，由资金方独立评估。"})]})]})]})}const Bn=[{label:"发现客户",icon:e.jsx(Ee,{}),target:"discover"},{label:"客户工作台",icon:e.jsx(ie,{}),target:"workbench"},{label:"邮件管理",icon:e.jsx(re,{}),target:"mail"},{label:"订单对账",icon:e.jsx(ve,{}),target:"orders-payments",demo:!0},{label:"保障与融资",icon:e.jsx(xe,{}),target:"protection-funding",demo:!0},{label:"用量与费用",icon:e.jsx(qe,{}),target:"costs"}];function oe({label:n,value:s,icon:i,note:t,demo:l,onClick:o}){return e.jsxs("button",{className:"business-metric",type:"button",onClick:o,children:[e.jsxs("span",{className:"business-metric-top",children:[e.jsx("span",{className:`business-tile-icon${l?" is-demo":""}`,"aria-hidden":"true",children:i}),l?e.jsx(k,{color:"gold",children:"演示"}):e.jsx(ne,{className:"business-link-icon","aria-hidden":"true"})]}),e.jsx("span",{className:"business-metric-label",children:n}),e.jsxs("span",{className:"business-metric-value",children:[l&&e.jsx("small",{children:"USD"}),(s==null?void 0:s.toLocaleString("zh-CN"))??"—"]}),e.jsx("span",{className:"business-tile-note",children:t})]})}function fe({name:n,detail:s,icon:i,demo:t,onClick:l}){return e.jsxs("button",{type:"button",className:"employee-tile",onClick:l,children:[e.jsx("span",{className:`business-tile-icon${t?" is-demo":""}`,"aria-hidden":"true",children:i}),e.jsxs("span",{className:"employee-copy",children:[e.jsx("strong",{children:n}),e.jsx("small",{children:s})]}),t&&e.jsx(k,{color:"gold",children:"演示"}),e.jsx(ne,{className:"business-link-icon","aria-hidden":"true"})]})}function On({data:n,totals:s,navigate:i}){var d,b,h,r;const[t,l]=v.useState(null),o=(d=n.dashboardAgents)==null?void 0:d.find(({id:c})=>c===t);return e.jsxs("div",{className:"native-page business-page",children:[e.jsxs("section",{"aria-labelledby":"workbench-data",children:[e.jsx("h2",{className:"business-heading",id:"workbench-data",children:"业务数据"}),e.jsxs("div",{className:"business-grid business-metrics",children:[e.jsx(oe,{label:"洽谈中商机",value:n.summary?((b=n.summary.stages)==null?void 0:b.negotiating)??0:void 0,note:"客户管线中的洽谈阶段",icon:e.jsx(jn,{}),onClick:()=>i("overview")}),e.jsx(oe,{label:"已保存客户",value:(h=n.summary)==null?void 0:h.total,note:"当前工作空间",icon:e.jsx(je,{}),onClick:()=>i("customers")}),e.jsx(oe,{label:"到期待跟进",value:(r=n.summary)==null?void 0:r.due_followups,note:"到期且允许联系",icon:e.jsx(ke,{}),onClick:()=>i("overview")}),e.jsx(oe,{label:"累计回款",value:s.received,note:`${s.unpaid} 笔样例订单待回款`,icon:e.jsx(qe,{}),demo:!0,onClick:()=>i("orders-payments")})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-employees",children:[e.jsx("h2",{className:"business-heading",id:"workbench-employees",children:"数字员工"}),e.jsxs(q,{className:"business-employees",variant:"outlined",children:[e.jsx("h3",{children:"已创建的员工"}),n.dashboardAgentsError?e.jsx(D,{type:"warning",showIcon:!0,title:"数字员工加载失败，请刷新数据重试。"}):n.dashboardAgents===null?e.jsx(We,{active:!0,title:!1,paragraph:{rows:1}}):n.dashboardAgents.length?e.jsx("div",{className:"business-grid employee-grid",children:n.dashboardAgents.map(c=>e.jsx(fe,{name:c.config.name,icon:e.jsx(yn,{}),detail:c.config.market?`拓客 · ${c.config.market}`:"拓客",onClick:()=>l(c.id)},c.id))}):e.jsxs("div",{className:"employee-empty",children:[e.jsx("span",{children:"当前工作空间尚未创建拓客数字员工。"}),e.jsx(u,{type:"link",onClick:()=>i("discover"),children:"前往发现客户"})]}),e.jsx("h3",{children:"演示员工"}),e.jsxs("div",{className:"business-grid employee-grid",children:[e.jsx(fe,{name:"收款跟进员",detail:"准备收款提醒，协助核对回款流水",icon:e.jsx(ve,{}),demo:!0,onClick:()=>i("orders-payments")}),e.jsx(fe,{name:"保险分析师",detail:"梳理货运与经营保障需求",icon:e.jsx(xe,{}),demo:!0,onClick:()=>i("protection-funding")})]})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-shortcuts",children:[e.jsx("h2",{className:"business-heading",id:"workbench-shortcuts",children:"常用功能"}),e.jsx("div",{className:"business-grid shortcut-grid",children:Bn.map(({label:c,icon:L,target:_,demo:x})=>e.jsxs(u,{className:"business-shortcut",onClick:()=>i(_),children:[e.jsx("span",{className:"business-tile-icon","aria-hidden":"true",children:L}),e.jsx("span",{children:c}),x&&e.jsx(k,{color:"gold",children:"演示"})]},_))})]}),e.jsx(X,{open:!!o,title:o==null?void 0:o.config.name,onCancel:()=>l(null),footer:e.jsx(u,{type:"primary",onClick:()=>{l(null),i("discover")},children:"进入拓客"}),children:o&&e.jsx(Un,{employee:o})})]})}function Un({employee:{status:n,config:s}}){return e.jsx(Q,{size:"small",column:1,items:[{key:"type",label:"类型",children:"拓客数字员工"},{key:"status",label:"状态",children:{enabled:"已启用",paused:"已暂停"}[n]??"已创建"},{key:"market",label:"目标市场",children:s.market||"未指定"},{key:"product",label:"主打产品",children:s.product||"未指定"},{key:"instructions",label:"任务指令",children:e.jsx("span",{className:"employee-instructions",children:s.instructions})}]})}function Vn({data:n,bridge:s}){const[i,t]=v.useState(Be),[l,o]=v.useState(Be[0].id),d=i.find(({id:r})=>r===l)??i[0],b=r=>{s.navigate(r).catch(()=>{})},h={orders:i,order:d,select:({id:r})=>o(r)};return n.tab==="my-overview"?e.jsx(On,{data:n,totals:rn(i),navigate:b}):n.tab==="orders-payments"?e.jsx(Fn,{...h,openProtection:()=>b("protection-funding"),reconcile:()=>t(r=>r.map(c=>c.id===l&&c.receipt?{...c,received:c.received+c.receipt.amount,receipt:void 0}:c))}):n.tab==="protection-funding"?e.jsx(Pn,{...h,openPayments:()=>b("orders-payments")}):null}const Ae={mode:"companies",q:"",country_filter:"",stage:"",tag:"",target:"procurement",verification:"",role_filter:"",has_email:!1,due:!1,ready_only:!1},Oe=["company","location","stage","contacts","assessment","action"],cn="voken-workbench-display-v1";function be(n){return Object.fromEntries(Object.entries(Ae).map(([s,i])=>[s,typeof i=="boolean"?n[s]===!0:String(n[s]??i).trim()]))}function Ue(n,s){return JSON.stringify(be(n))===JSON.stringify(be(s))}function Hn(n,s,i){const t=be(n),l={q:`搜索：${t.q}`,country_filter:`地区：${t.country_filter}`,stage:`阶段：${s[String(t.stage)]||t.stage}`,tag:`标签：${t.tag}`,target:{leadership:"目标：企业负责人",sales:"目标：销售 / 业务开发"}[String(t.target)],verification:`邮箱：${i[String(t.verification)]||t.verification}`,role_filter:{keyword_match:"命中岗位关键词",needs_review:"岗位待核实",unknown:"岗位未知"}[String(t.role_filter)],has_email:"有完整邮箱",due:"到期跟进",ready_only:"已评审、岗位匹配且邮箱近期有效"};return Object.entries(t).filter(([o,d])=>o!=="mode"&&d!==Ae[o]).map(([o])=>({key:o,label:l[o]||o}))}function Ce(n){const s=n&&typeof n=="object"?n:{},i=Array.isArray(s.columns)?s.columns:null,t=i?Oe.filter(l=>["company","action"].includes(l)||i.includes(l)):[...Oe];return{density:s.density==="compact"?"compact":"comfortable",columns:t}}function Yn(){try{return Ce(JSON.parse(localStorage.getItem(cn)||"null"))}catch{return Ce(null)}}function Gn(n){try{localStorage.setItem(cn,JSON.stringify(Ce(n)))}catch{}}function Kn(n){if(!n)return"未提供";const s=new Date(String(n));return Number.isNaN(s.getTime())?"日期待核实":s.toLocaleString("zh-CN",{hour12:!1})}const Ve={created:"保存客户",updated:"调整跟进",note:"备注",email_sent:"已发送邮件",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索反馈",opt_out:"拒绝联系",draft_requested:"生成开发信",research_requested:"公域查证",contact_selected:"采用联系信息",assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒",bounce:"退信"},{Text:g,Title:De,Paragraph:se}=we,pe={new:"新发现",qualified:"已筛选",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",won:"已成交",lost:"不匹配"},dn={new:"blue",qualified:"cyan",contacted:"geekblue",replied:"purple",negotiating:"orange",won:"green",lost:"default"},ae={valid:"独立验证有效",invalid:"无效 / 不应联系",catch_all:"全收域，待确认",unknown:"未知",unverified:"尚未独立验证"},ue={"my-overview":"我的工作台","orders-payments":"订单与收款","protection-funding":"保障与资金","ai-capabilities":"AI能力",overview:"业务概况",discover:"发现客户",workbench:"客户工作台",customers:"客户档案",jobs:"任务管理","job-view":"任务详情",directory:"企业与联系人",sources:"商业情报",mail:"邮件管理",company:"企业资料",costs:"用量与费用"},Wn={"my-overview":"查看业务进展、数字员工和常用功能。",overview:"从发现到跟进，让每一条客户线索都有下一步。",workbench:"筛选企业、核对联系人，集中推进值得跟进的商机。",discover:"从产品与市场出发，找到下一批合适的潜在客户。",jobs:"查看执行进度、核对来源，管理每一次发现。",customers:"保留客户证据与沟通记录，持续推进每一次对话。",directory:"查询企业与目标岗位，按需补充商务联系信息。",sources:"核对企业背景，发现公开采购与市场信号。",company:"让 AI 理解你的企业、产品与目标市场。",mail:"审阅开发信，记录回复，安排下一次跟进。",costs:"查看点数、任务结算和数据使用情况。"},W=n=>Object.entries(n).map(([s,i])=>({value:s,label:i})),Z=Kn,N=n=>{n.catch(()=>{})};function Se({href:n,children:s}){let i=!1;try{i=["http:","https:"].includes(new URL(n||"").protocol)}catch{}return i?e.jsx("a",{href:n,target:"_blank",rel:"noopener noreferrer",children:s}):e.jsx(g,{type:"secondary",children:s})}function pn({html:n,className:s=""}){const i=v.useRef(null);return v.useEffect(()=>{i.current&&(i.current.innerHTML=n)},[n]),e.jsx("div",{className:`legacy ${s}`,ref:i})}function un({compact:n=!1}){return e.jsxs("a",{className:"voken-brand",href:"#my-overview","aria-label":"微元 Voken 首页",children:[e.jsx("img",{className:"brand-symbol",src:`${tn()}favicon.svg`,alt:"",width:40,height:40}),!n&&e.jsxs("span",{children:["微元",e.jsx("span",{className:"brand-en",children:"Voken"})]})]})}function Jn({ready:n}){return e.jsxs("section",{id:"auth",className:"react-auth",onSubmitCapture:s=>{n||s.preventDefault()},children:[e.jsxs("div",{className:"auth-intro",children:[e.jsx(un,{}),e.jsxs("div",{className:"auth-intro-copy",children:[e.jsx("p",{className:"auth-kicker",children:"微元 Voken 工作台"}),e.jsxs("h1",{children:["用",e.jsx("span",{className:"brand-highlight",children:" AI "}),"发现客户，",e.jsx("br",{}),"推进每一次",e.jsx("span",{className:"brand-accent",children:"商机"}),"。"]}),e.jsx("p",{className:"auth-lead",children:"核对企业和联系信息、审阅开发信，并跟进客户进展。"})]})]}),e.jsx("div",{className:"auth-form-wrap",children:e.jsxs("div",{className:"auth-form-card",children:[e.jsx(De,{level:2,children:"登录微元工作台"}),e.jsxs("form",{id:"login-form",className:"login-form",method:"post",children:[e.jsx("label",{htmlFor:"login-phone",children:"手机号"}),e.jsx(P,{id:"login-phone",name:"phone",type:"tel",autoComplete:"username",placeholder:"请输入手机号",size:"large",required:!0}),e.jsx("label",{htmlFor:"login-password",children:"密码"}),e.jsx(P.Password,{id:"login-password",name:"password",autoComplete:"current-password",placeholder:"请输入密码",size:"large",minLength:8,required:!0}),e.jsx(u,{type:"primary",size:"large",htmlType:"submit",block:!0,disabled:!n,loading:!n,children:"进入工作台"})]}),e.jsx(pn,{html:Ln})]})})]})}function mn({items:n}){return e.jsx(en,{gutter:[16,16],className:"metric-row",children:n.map(s=>e.jsx(_e,{xs:24,sm:12,xl:6,children:e.jsxs(q,{className:"metric-card",children:[e.jsxs("div",{className:"metric-top",children:[e.jsx(g,{type:"secondary",children:s.label}),e.jsx("span",{className:"metric-icon",children:s.icon})]}),e.jsx(ce,{value:s.value,formatter:i=>s.value===void 0?"—":Number(i).toLocaleString()}),e.jsx(g,{type:"secondary",className:"metric-note",children:s.note})]})},s.label))})}function Zn({data:n,bridge:s}){var l,o;const i=n.summary,t=[{title:"完善企业资料",text:"告诉 AI 你的产品、优势与市场",tab:"company",icon:e.jsx(me,{})},{title:"发现潜在客户",text:"描述目标，创建小批量找客任务",tab:"discover",icon:e.jsx(Ne,{})},{title:"筛选并核对",text:"检查企业匹配、岗位和邮箱",tab:"workbench",icon:e.jsx(nn,{})},{title:"开始商务对话",text:"审阅开发信，记录每一次推进",tab:"mail",icon:e.jsx(re,{})}];return e.jsxs("div",{className:"native-page",children:[e.jsx("div",{className:"overview-hero",children:e.jsxs("div",{children:[e.jsxs("h2",{children:["发现客户，",e.jsx("span",{className:"brand-highlight",children:"推进商机"})]}),e.jsx("p",{children:"按目标市场和产品找客户，核对来源后加入客户档案。"}),e.jsxs(A,{wrap:!0,children:[e.jsx(u,{type:"primary",icon:e.jsx($e,{}),onClick:()=>N(s.navigate("discover")),children:"创建找客任务"}),e.jsx(u,{onClick:()=>N(s.navigate("workbench")),children:"进入客户工作台"})]})]})}),e.jsx(mn,{items:[{label:"已保存客户",value:i==null?void 0:i.total,note:"你的独立客户管线",icon:e.jsx(je,{})},{label:"到期待跟进",value:i==null?void 0:i.due_followups,note:"到期且允许联系的客户",icon:e.jsx(ke,{})},{label:"正在洽谈",value:((l=i==null?void 0:i.stages)==null?void 0:l.negotiating)||(i?0:void 0),note:"持续推进中的商机",icon:e.jsx(ie,{})},{label:"已成交",value:((o=i==null?void 0:i.stages)==null?void 0:o.won)||(i?0:void 0),note:"以实际记录为准",icon:e.jsx(ee,{})}]}),e.jsxs(en,{gutter:[20,20],children:[e.jsx(_e,{xs:24,lg:15,children:e.jsxs(q,{title:"今天值得推进的事",children:[e.jsxs("div",{className:"next-action",children:[e.jsx("span",{className:"action-icon",children:e.jsx(ke,{})}),e.jsxs("div",{children:[e.jsx(De,{level:4,children:i?i.due_followups?`${i.due_followups} 位客户等待下一次跟进`:"开始建立你的下一批商机":"正在加载业务概况"}),e.jsx(se,{type:"secondary",children:i!=null&&i.due_followups?"先核对客户来源和沟通历史，再决定下一次联系。":"完善企业资料，创建找客任务，筛选值得对话的企业。"}),e.jsx(u,{type:"primary",onClick:()=>N(s.navigate(i!=null&&i.due_followups?"workbench":"discover")),children:i!=null&&i.due_followups?"查看待跟进客户":"发现新客户"})]})]}),e.jsxs("div",{className:"overview-note",children:[e.jsx(ee,{})," ",i?`已停止联系 ${i.do_not_contact||0} 位客户；回复和成交数据以实际记录为准。`:"统计仅展示当前工作空间的数据。"]})]})}),e.jsx(_e,{xs:24,lg:9,children:e.jsx(q,{title:"清晰的客户开发路径",children:e.jsx("div",{className:"workflow-list",children:t.map((d,b)=>e.jsxs("button",{onClick:()=>N(s.navigate(d.tab)),children:[e.jsx("span",{className:"workflow-icon",children:d.icon}),e.jsxs("span",{children:[e.jsx("b",{children:d.title}),e.jsx("small",{children:d.text})]}),e.jsx(ne,{})]},d.tab))})})})]})]})}function Xn({contact:n,capabilities:s,bridge:i,onChange:t}){var c,L,_,x,S,y,E,f;const[l,o]=v.useState(!1),[d,b]=v.useState(!1),h=async()=>{b(!0);try{await i.post("/verifications",{prospect_id:n.prospect_id,email:n.email,confirm_external_check:!0},"verify"),o(!1),t()}catch{}finally{b(!1)}},r=((c=n.verification)==null?void 0:c.status)||"unverified";return e.jsxs(q,{size:"small",className:"contact-card",children:[e.jsxs(A,{wrap:!0,children:[e.jsx(g,{strong:!0,children:n.name||"公共 / 岗位未知入口"}),e.jsx(k,{children:((L=n.titles)==null?void 0:L.join(" / "))||"岗位未知"}),n.blocked&&e.jsx(k,{color:"red",children:"停止联系"})]}),e.jsx(se,{copyable:n.email?{text:n.email}:!1,children:n.email||"暂无完整邮箱"}),e.jsxs(A,{wrap:!0,children:[e.jsx(k,{color:r==="valid"?"green":r==="invalid"?"red":"default",children:ae[r]}),((_=n.verification)==null?void 0:_.stale)&&e.jsx(k,{color:"orange",children:"验证超过 30 天"}),e.jsx(g,{type:"secondary",children:(x=n.role_match)==null?void 0:x.reason})]}),e.jsxs(se,{type:"secondary",className:"contact-meta",children:["验证时间：",Z((S=n.verification)==null?void 0:S.checked_at)," ·"," ",((y=n.verification)==null?void 0:y.history_count)||0," 次历史记录"]}),e.jsx(g,{type:"secondary",children:"供应商标记不替代独立验证，不保证送达。"}),((E=n.warnings)==null?void 0:E.length)>0&&e.jsx(D,{type:"warning",title:n.warnings.map(j=>({email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务 / 质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"})[j]||j).join("；"),showIcon:!0}),((f=n.sources)==null?void 0:f.length)>0&&e.jsx("div",{className:"contact-sources",children:n.sources.map((j,R)=>e.jsxs("div",{children:[e.jsx(Se,{href:j.source_url,children:j.source||"原始来源"}),e.jsxs(g,{type:"secondary",children:[" · ",Z(j.observed_at)]}),j.source_job_id&&e.jsx(u,{type:"link",size:"small","data-job":j.source_job_id,children:"来源任务"})]},R))}),e.jsxs("div",{className:"verification-action",children:[e.jsx(de,{checked:l,disabled:!s.email_verification||!n.email,onChange:j=>o(j.target.checked),children:"同意将邮箱交给 ZeroBounce 验证，消耗供应商额度"}),e.jsx(u,{loading:d,disabled:!l||!s.email_verification||!n.email,onClick:()=>void h(),children:r==="unverified"?"验证邮箱":"重新验证并保留历史"})]})]})}function Qn({id:n,bridge:s,capabilities:i,onClose:t}){var L,_,x,S,y,E,f,j,R,G;const[l,o]=v.useState(null),[d,b]=v.useState(""),[h,r]=v.useState(0);v.useEffect(()=>{let m=!1;return o(null),b(""),n&&s.detail(n).then(C=>{m||o(C)}).catch(C=>{m||b(C.message)}),()=>{m=!0}},[n,s,h]);const c=l==null?void 0:l.prospect;return e.jsx(Xe,{title:(c==null?void 0:c.name)||"客户详情",open:!!n,onClose:t,size:720,className:"customer-drawer",footer:e.jsxs("div",{className:"drawer-footer-actions",children:[e.jsx(u,{onClick:t,children:"关闭详情"}),e.jsx(u,{type:"primary",disabled:!c,onClick:()=>{n&&N(s.edit(n).then(t))},children:"编辑档案与跟进"})]}),extra:e.jsxs(A,{children:[c&&e.jsx(u,{"data-targeted-prospect":c.id,onClick:t,children:"精准联系人检索"}),e.jsx(u,{icon:e.jsx(Ze,{}),"aria-label":"刷新客户详情",disabled:!c,type:"primary",onClick:()=>{r(m=>m+1)},children:"刷新"})]}),children:d?e.jsx(D,{type:"error",title:"客户详情加载失败",description:d,action:e.jsx(u,{onClick:()=>r(m=>m+1),children:"重试"})}):l?e.jsxs(e.Fragment,{children:[e.jsxs(A,{wrap:!0,children:[e.jsx(k,{color:dn[c.stage],children:pe[c.stage]}),c.do_not_contact&&e.jsx(k,{color:"red",children:"拒绝联系"}),(L=c.tags)==null?void 0:L.map(m=>e.jsx(k,{children:m},m))]}),e.jsx(Ke,{items:[{key:"profile",label:"企业与证据",children:e.jsxs(e.Fragment,{children:[e.jsx(Q,{column:1,bordered:!0,size:"small",items:[{key:"location",label:"国家 / 地区",children:c.location||"待核实"},{key:"website",label:"官网",children:e.jsx(Se,{href:c.website,children:c.website||"未提供"})},{key:"contact",label:"已记录联系信息",children:c.contact||"未提供"},{key:"followup",label:"下次跟进",children:Z(c.next_followup_at)},{key:"source",label:"来源",children:e.jsx(Se,{href:(x=(_=c.evidence)==null?void 0:_.source)==null?void 0:x.url,children:((y=(S=c.evidence)==null?void 0:S.source)==null?void 0:y.title)||((f=(E=c.evidence)==null?void 0:E.source)==null?void 0:f.url)||"查看原始证据"})}]}),e.jsxs(q,{size:"small",title:"判断依据",className:"drawer-evidence",children:[e.jsx(se,{children:((j=c.evidence)==null?void 0:j.reason)||((R=c.evidence)==null?void 0:R.source_note)||"暂无补充依据，请核对原始来源。"}),e.jsx(D,{type:"info",title:"企业匹配、岗位匹配与邮箱有效性分别判断；历史信息不代表当前采购需求。"})]}),((G=l.duplicates)==null?void 0:G.length)>0&&e.jsx(q,{size:"small",title:"疑似关联 / 重复档案（尚未合并）",className:"drawer-evidence",children:l.duplicates.map(m=>e.jsxs(se,{children:[e.jsx(g,{strong:!0,children:m.name}),e.jsx("br",{}),e.jsx(g,{type:"secondary",children:m.reason}),e.jsx(u,{type:"link",onClick:()=>N(s.edit(m.id).then(t)),children:"打开档案核对"})]},m.id))})]})},{key:"contacts",label:`联系人 (${l.contacts.length})`,children:l.contacts.length?e.jsx(A,{orientation:"vertical",className:"full-width",children:l.contacts.map((m,C)=>e.jsx(Xn,{contact:m,capabilities:i,bridge:s,onChange:()=>{r($=>$+1),N(s.refresh())}},m.email+":"+C))}):e.jsx(J,{description:"暂无完整邮箱候选，可在客户档案中查询企业与岗位"})},{key:"history",label:"跟进与验证历史",children:!l.activities.length&&!l.records.length?e.jsx(J,{image:J.PRESENTED_IMAGE_SIMPLE,description:"暂无跟进或验证记录，可在客户档案中记录下一步"}):e.jsx(Ge,{items:[...l.activities.map(m=>({time:m.created_at,title:Ve[m.kind]||"其他记录",content:m.content})),...l.records.map(m=>({time:m.created_at,title:{assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"}[m.kind]||m.kind,content:(m.kind==="followup"?`提醒时间：${Z(m.data.due_at)} · ${m.data.objective||""}`:"")||(m.kind==="contact_event"?`${Ve[m.data.type]||"联系事件"} · ${m.data.email||""}：${m.data.content||""}`:"")||m.data.reason||m.data.content||m.data.objective||ae[m.data.status]||m.data.status}))].sort((m,C)=>String(C.time).localeCompare(String(m.time))).map((m,C)=>({key:C,title:e.jsxs(e.Fragment,{children:[e.jsx(g,{strong:!0,children:m.title}),e.jsx("div",{children:e.jsx(g,{type:"secondary",children:Z(m.time)})})]}),content:m.content}))})}]},n)]}):e.jsx(We,{active:!0,paragraph:{rows:10}})})}const M=Ae;function es({data:n,bridge:s}){var Le;const i=Sn.useBreakpoint(),t=n.workbench,l=t.summary,[o,d]=v.useState(t.filters||M),[b,h]=v.useState(!1),[r,c]=v.useState(null),[L,_]=v.useState(!1),[x,S]=v.useState(""),[y,E]=v.useState(!1),[f,j]=v.useState(Yn),R=f.columns,G=a=>j(p=>({...p,columns:a}));v.useEffect(()=>Gn(f),[f]);const[m,C]=v.useState(null),$=t.filters||M,B=$.mode==="contacts",w=JSON.stringify($),F=!Ue(o,$),T=Hn($,pe,ae),te=(t.views||[]).findIndex(a=>Ue(a.data,$)),hn=a=>{const p={...be($),[a]:M[a]};d(p),H(p)};v.useEffect(()=>{d({...M,...$})},[w]);const O=(a,p)=>d(I=>({...I,[a]:p})),H=(a=o)=>N(s.filter(a)),Te=[{key:"company",title:"企业名称",dataIndex:"name",width:250,fixed:i.md?"left":void 0,render:(a,p)=>{var I;return e.jsxs("div",{className:"company-cell",children:[e.jsx(Je,{shape:"square",className:"company-avatar",children:String(a).slice(0,1).toUpperCase()}),e.jsxs("div",{children:[e.jsx(u,{type:"link",onClick:()=>c(p.id),children:a}),e.jsx(g,{type:"secondary",children:p.blocked?"存在停止联系记录":p.next_action}),((I=p.duplicates)==null?void 0:I.length)>0&&e.jsxs(k,{color:"orange",children:["疑似关联 ",p.duplicates.length," 份"]})]})]})}},{key:"location",title:"国家 / 地区",dataIndex:"country",width:135,render:a=>a||"待核实"},{key:"stage",title:"销售阶段",dataIndex:"stage",width:115,render:a=>e.jsx(k,{color:dn[a],children:pe[a]||a})},{key:"contacts",title:"联系信息",width:170,render:(a,p)=>e.jsxs("div",{children:[e.jsxs("span",{children:[p.email_count," 个完整邮箱"]}),e.jsx("br",{}),e.jsxs(g,{type:"secondary",children:[p.contact_count," 条入口 · ",p.verified_count," 个验证有效"]})]})},{key:"assessment",title:"企业匹配",width:140,render:(a,p)=>{var I,Y;return e.jsx(k,{color:((I=p.assessment)==null?void 0:I.status)==="fit"?"green":"default",children:{fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"}[(Y=p.assessment)==null?void 0:Y.status]||"待核实"})}},{key:"action",title:"操作",width:210,fixed:i.md?"right":void 0,render:(a,p)=>e.jsxs(A,{size:0,children:[e.jsx(u,{type:"link",onClick:()=>c(p.id),children:"详情"}),e.jsx(u,{type:"link","data-wb-enrich":p.id,children:"查联系人"}),e.jsx(u,{type:"link",onClick:()=>C({kind:"review",row:p}),children:"评审"})]})}],bn=[{key:"company",title:"联系人 / 企业",width:240,fixed:i.md?"left":void 0,render:(a,p)=>e.jsxs("div",{children:[e.jsx(u,{type:"link",onClick:()=>c(p.prospect_id),children:p.name||"公共 / 岗位未知入口"}),e.jsx("br",{}),e.jsx(g,{type:"secondary",children:p.company})]})},{key:"email",title:"邮箱",dataIndex:"email",width:240,render:(a,p)=>e.jsxs(e.Fragment,{children:[e.jsx(g,{copyable:a?{text:a}:!1,children:a||"暂无完整邮箱"}),p.blocked&&e.jsx(k,{color:"red",children:"停止联系"})]})},{key:"role",title:"岗位判断",width:240,render:(a,p)=>{var I,Y;return e.jsxs(e.Fragment,{children:[e.jsx("div",{children:((I=p.titles)==null?void 0:I.join(" / "))||"岗位未知"}),e.jsx(g,{type:"secondary",children:(Y=p.role_match)==null?void 0:Y.reason})]})}},{key:"verification",title:"独立邮箱验证",width:180,render:(a,p)=>{var I,Y,Re,Me;return e.jsxs(e.Fragment,{children:[e.jsx(k,{color:((I=p.verification)==null?void 0:I.status)==="valid"?"green":((Y=p.verification)==null?void 0:Y.status)==="invalid"?"red":"default",children:ae[(Re=p.verification)==null?void 0:Re.status]||"未知"}),((Me=p.verification)==null?void 0:Me.stale)&&e.jsx("div",{children:e.jsx(g,{type:"warning",children:"验证超过 30 天"})})]})}},{key:"action",title:"操作",width:150,fixed:i.md?"right":void 0,render:(a,p)=>e.jsxs(A,{size:0,children:[e.jsx(u,{type:"link",onClick:()=>c(p.prospect_id),children:"详情 / 验证"}),e.jsx(u,{type:"link",onClick:()=>C({kind:"event",row:p}),children:"记录"})]})}];return e.jsxs("div",{className:"native-page workbench-page",children:[e.jsx(mn,{items:[{label:"企业档案",value:l==null?void 0:l.companies,note:"当前工作空间独立档案",icon:e.jsx(me,{})},{label:"有完整邮箱的企业",value:l==null?void 0:l.companies_with_email,note:"联系信息仍需核实",icon:e.jsx(re,{})},{label:"去重邮箱",value:l==null?void 0:l.unique_mailboxes,note:"按邮箱去重统计",icon:e.jsx(ie,{})},{label:"近期验证有效",value:l==null?void 0:l.verified_mailboxes,note:"独立验证，不保证送达",icon:e.jsx(ee,{})}]}),e.jsxs(q,{className:"workbench-card",children:[e.jsxs("div",{className:"table-heading",children:[e.jsxs("div",{children:[e.jsx(De,{level:4,children:"客户资源"}),e.jsx(g,{type:"secondary",children:"企业、岗位与邮箱，分开核对，集中推进。"})]}),e.jsxs(A,{wrap:!0,children:[e.jsx(u,{icon:e.jsx(In,{"aria-hidden":"true"}),onClick:()=>{var p;const a=(p=document.querySelector("#wb-upload"))==null?void 0:p.closest("details");a&&(a.open=!0,a.scrollIntoView({behavior:"smooth",block:"center"}))},children:"导入名单"}),e.jsx(u,{type:"primary",icon:e.jsx($e,{}),onClick:()=>N(s.navigate("discover")),children:"发现客户"})]})]}),e.jsxs("div",{className:"workbench-tabs",children:[e.jsx(ze,{value:o.mode,options:[{value:"companies",label:"企业视图",icon:e.jsx(me,{})},{value:"contacts",label:"联系人视图",icon:e.jsx(ie,{})}],onChange:a=>{const p={...o,mode:a};d(p),H(p)}}),e.jsx(U,{"aria-label":"应用已保存视图",placeholder:"已保存的筛选视图",allowClear:!0,className:"saved-view-select",value:te>=0?te:void 0,options:(t.views||[]).map((a,p)=>({label:a.data.name,value:p})),onChange:a=>{a!==void 0?N(s.applyView(a)):(d({...M}),H({...M}))}})]}),e.jsxs("form",{"data-extension":"react",className:"react-filter",onSubmit:a=>{a.preventDefault(),H()},children:[e.jsxs("div",{className:"filter-main",children:[e.jsx(P,{prefix:e.jsx(Ne,{}),"aria-label":"搜索企业、姓名或邮箱",placeholder:"搜索企业、姓名或邮箱",maxLength:200,allowClear:!0,value:o.q,onClear:()=>{const a={...o,q:""};d(a),H(a)},onChange:a=>O("q",a.target.value)}),e.jsx(P,{"aria-label":"国家或地区",placeholder:"国家 / 地区",maxLength:100,value:o.country_filter,onChange:a=>O("country_filter",a.target.value)}),e.jsx(U,{"aria-label":"销售阶段",value:o.stage,options:[{value:"",label:"全部销售阶段"},...W(pe)],onChange:a=>O("stage",a)}),e.jsx(u,{htmlType:"submit",type:"primary",icon:e.jsx(Ne,{"aria-hidden":"true"}),loading:n.loading,children:"查询"}),e.jsx(u,{icon:e.jsx(nn,{}),"aria-expanded":b,"aria-controls":"advanced-customer-filters",onClick:()=>h(a=>!a),children:b?"收起筛选":"更多筛选"})]}),b&&e.jsxs("div",{className:"advanced-filters",id:"advanced-customer-filters",children:[e.jsxs("label",{children:["标签",e.jsx(P,{maxLength:40,value:o.tag,onChange:a=>O("tag",a.target.value)})]}),e.jsxs("label",{children:["目标岗位",e.jsx(U,{"aria-label":"目标岗位",value:o.target,options:W({procurement:"采购 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发"}),onChange:a=>O("target",a)})]}),e.jsxs("label",{children:["邮箱验证",e.jsx(U,{"aria-label":"独立邮箱验证",value:o.verification,options:[{value:"",label:"全部状态"},...W(ae)],onChange:a=>O("verification",a)})]}),e.jsxs("label",{children:["岗位判断",e.jsx(U,{"aria-label":"岗位判断",value:o.role_filter,options:W({"":"全部岗位",keyword_match:"命中目标关键词",needs_review:"未命中，待核实",unknown:"岗位未知"}),onChange:a=>O("role_filter",a)})]})]}),e.jsxs("div",{className:"filter-bottom",children:[e.jsxs(A,{wrap:!0,children:[e.jsx(de,{checked:o.has_email,onChange:a=>O("has_email",a.target.checked),children:"有完整邮箱"}),e.jsx(de,{checked:o.due,onChange:a=>O("due",a.target.checked),children:"到期跟进"}),b&&e.jsx(de,{checked:o.ready_only,onChange:a=>O("ready_only",a.target.checked),children:"已评审、岗位匹配且邮箱近期有效"})]}),e.jsxs(A,{children:[e.jsx(u,{type:"text",onClick:()=>{d({...M}),H({...M})},children:"重置"}),e.jsx(u,{type:"link",disabled:F||n.loading,title:F?"请先应用筛选条件，再保存视图":void 0,onClick:()=>_(!0),children:"保存当前筛选"})]})]})]}),F&&e.jsxs("div",{className:"filter-draft-notice",role:"status",children:[e.jsx(g,{children:"筛选条件已修改，列表仍显示上次查询结果。"}),e.jsx(u,{size:"small",type:"primary",onClick:()=>H(),disabled:n.loading,children:"应用修改"}),e.jsx(u,{size:"small",type:"text",onClick:()=>d({...M,...$}),children:"撤销修改"})]}),T.length>0&&e.jsxs("div",{className:"applied-filters","aria-label":"已应用筛选",children:[e.jsx(g,{type:"secondary",children:"已应用"}),T.map(a=>e.jsx(k,{closable:!n.loading,onClose:()=>hn(a.key),title:a.label,children:a.label},a.key)),e.jsx(u,{type:"link",size:"small",onClick:()=>{d({...M}),H({...M})},children:"清空筛选"})]}),n.workbenchError&&e.jsx(D,{type:"error",title:"客户工作台加载失败",description:n.workbenchError,showIcon:!0,action:e.jsx(u,{onClick:()=>N(s.refresh()),children:"重试"})}),e.jsxs("div",{className:"table-status",children:[e.jsxs(A,{wrap:!0,children:[e.jsxs(g,{type:"secondary","aria-live":"polite",children:["共 ",t.total||0," 条记录"]}),t.lastLoadedAt&&e.jsxs(g,{type:"secondary",className:"last-updated",children:["更新于"," ",new Date(t.lastLoadedAt).toLocaleTimeString("zh-CN",{hour12:!1})]}),((Le=t.selected)==null?void 0:Le.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(k,{color:"blue",children:["已选 ",t.selected.length," 家企业"]}),e.jsx(u,{type:"link",size:"small",onClick:()=>C({kind:"followup",ids:t.selected}),children:"安排跟进"}),e.jsx(u,{type:"text",size:"small",onClick:()=>s.select([]),children:"取消选择"})]})]}),e.jsxs(A,{wrap:!0,className:"display-controls",children:[e.jsx(qn,{title:"调整表格行间距",children:e.jsx(ze,{"aria-label":"表格密度",size:"small",value:f.density,options:[{value:"comfortable",label:"舒适"},{value:"compact",label:"紧凑"}],onChange:a=>j(p=>({...p,density:a}))})}),!B&&e.jsx(U,{mode:"multiple","aria-label":"显示的表格列",value:R,onChange:G,maxTagCount:0,maxTagPlaceholder:()=>"列设置",className:"column-select",options:Te.map(a=>({value:String(a.key),label:a.title,disabled:["company","action"].includes(String(a.key))}))})]})]}),!i.md&&e.jsx("div",{className:"table-scroll-hint",children:"左右滑动表格查看更多字段，点击名称打开详情。"}),e.jsx(sn,{size:f.density==="compact"?"small":"middle",columns:B?bn:Te.filter(a=>R.includes(String(a.key))),dataSource:n.workbenchError||t.loadedMode!==$.mode?[]:t.items||[],rowKey:a=>B?`${a.prospect_id}:${a.email}:${a.name}`:a.id,loading:n.loading,scroll:{x:B?1100:1050,y:"min(58vh, 640px)"},rowSelection:{selectedRowKeys:(t.items||[]).filter(a=>{var p;return(p=t.selected)==null?void 0:p.includes(B?a.prospect_id:a.id)}).map(a=>B?`${a.prospect_id}:${a.email}:${a.name}`:a.id),onChange:(a,p)=>s.select([...new Set(p.map(I=>B?I.prospect_id:I.id))])},locale:{emptyText:e.jsx(J,{image:J.PRESENTED_IMAGE_SIMPLE,description:n.workbenchError?"数据暂时无法加载":T.length?"没有符合当前条件的客户":"还没有客户档案",children:e.jsx(u,{onClick:()=>{n.workbenchError?N(s.refresh()):T.length?(d({...M}),H({...M})):N(s.navigate("discover"))},children:n.workbenchError?"重新加载":T.length?"清空筛选":"发现第一批客户"})})},pagination:{current:Math.floor((t.offset||0)/30)+1,pageSize:30,total:t.total||0,showSizeChanger:!1,showTotal:a=>`共 ${a} 条`,onChange:a=>N(s.filter($,(a-1)*30))}}),e.jsxs("div",{className:"table-footnote",children:[e.jsx(ee,{})," ","企业匹配、岗位匹配与邮箱验证分别判断；疑似重复档案尚未合并。"]})]}),m&&e.jsx(Mn,{action:m,bridge:s,onClose:()=>C(null),onSaved:()=>N(s.refresh())}),e.jsx(Qn,{id:r,bridge:s,capabilities:t.capabilities||{},onClose:()=>c(null)}),e.jsxs(X,{title:"保存当前筛选视图",open:L,onCancel:()=>{y||_(!1)},keyboard:!y,maskClosable:!y,confirmLoading:y,onOk:()=>{x.trim()&&(E(!0),s.saveView(x.trim()).then(()=>{_(!1),S("")}).catch(()=>{}).finally(()=>E(!1)))},okButtonProps:{disabled:!x.trim()||F},okText:"保存视图",children:[e.jsx(se,{type:"secondary",children:"保存已应用到列表的筛选条件，便于下次快速打开。"}),e.jsx(P,{"aria-label":"筛选视图名称",autoFocus:!0,value:x,maxLength:80,placeholder:"例如：美国采购岗位待核查",onChange:a=>S(a.target.value)})]})]})}function ns({data:n,bridge:s}){const[i,t]=v.useState(""),[l,o]=v.useState(""),d={prospecting:"发现客户",outreach_draft:"开发信草稿",report:"客户报告",source_lookup:"官方情报查询",public_search:"公开检索",directory_companies:"企业查询",directory_people:"人物与岗位",directory_contacts:"联系方式解锁",targeted_contacts:"精准联系人检索",buyer_search:"采购商匹配",buyer_profile:"企业资料",buyer_contacts:"联系方式",customs_verification:"贸易核验",trade_search:"历史贸易"},b={queued:"排队中",running:"执行中",cancelling:"取消中",succeeded:"已完成",partial:"部分完成",failed:"失败",cancelled:"已取消"},h=n.jobs.filter(r=>(!i||r.operation===i)&&(!l||r.status===l));return e.jsx("div",{className:"native-page",children:e.jsxs(q,{title:"任务记录",extra:e.jsx(u,{type:"primary",icon:e.jsx($e,{}),onClick:()=>N(s.navigate("discover")),children:"创建任务"}),children:[e.jsxs("div",{className:"task-filter",children:[e.jsx(U,{"aria-label":"任务类型",value:i,options:[{value:"",label:"全部任务类型"},...W(d)],onChange:t}),e.jsx(U,{"aria-label":"任务状态",value:l,options:[{value:"",label:"全部状态"},...W(b)],onChange:o}),e.jsxs(g,{type:"secondary",children:["最近 ",n.jobs.length," 个任务中，显示 ",h.length," 个"]})]}),e.jsx(sn,{rowKey:"id",dataSource:h,loading:n.loading,scroll:{x:750},pagination:{pageSize:15,showSizeChanger:!1},columns:[{title:"任务类型",dataIndex:"operation",render:(r,c)=>e.jsx(u,{type:"link","data-job":c.id,children:d[r]||r})},{title:"状态",dataIndex:"status",render:r=>e.jsx(En,{status:r==="succeeded"?"success":r==="running"?"processing":r==="failed"?"error":r==="partial"?"warning":"default",text:b[r]||r})},{title:"创建时间",dataIndex:"created_at",render:Z},{title:"已结算点数",dataIndex:"points_charged",render:r=>Number(r||0).toLocaleString()},{title:"操作",render:(r,c)=>e.jsx(u,{type:"link","data-job":c.id,children:"查看详情"})}],locale:{emptyText:e.jsx(J,{description:"暂无符合条件的任务"})}}),e.jsx(g,{type:"secondary",children:"执行中的任务每 5 秒更新。部分完成的任务请查看已交付结果及缺失说明。"})]})})}const ge=[{key:"my-overview",label:ue["my-overview"],icon:e.jsx(Qe,{})},{key:"customers-opportunities",label:"客户与商机",icon:e.jsx(je,{})},{key:"orders-payments",label:"订单与收款",icon:e.jsx(ve,{})},{key:"protection-funding",label:"保障与资金",icon:e.jsx(xe,{})},{key:"ai-capabilities",label:"AI能力",icon:e.jsx(Nn,{})}];function ss({bridge:n}){return e.jsx(q,{title:"可用能力",className:"section-home-card",children:e.jsxs("div",{className:"workflow-list",children:[e.jsxs("button",{type:"button",onClick:()=>N(n.navigate("discover")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(Ee,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 发现客户"}),e.jsx("small",{children:"根据产品和目标市场建立找客任务"})]}),e.jsx(ne,{})]}),e.jsxs("button",{type:"button",onClick:()=>N(n.navigate("mail")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(re,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 开发信"}),e.jsx("small",{children:"查看和审阅开发信草稿"})]}),e.jsx(ne,{})]})]})})}function ts(){var B;const{message:n}=Ie.useApp(),[s,i]=v.useState(null),[t,l]=v.useState(null),[o,d]=v.useState(""),[b,h]=v.useState(!1),[r,c]=v.useState(!1),[L,_]=v.useState(!1);v.useEffect(()=>{const w=()=>{window.voken&&l(window.voken.snapshot())},F=T=>{const te=T.detail;n.open({type:te.error?"error":"success",content:te.message,duration:6})};return window.addEventListener(Pe,w),window.addEventListener("voken:message",F),Rn().then(T=>{i(T),l(T.snapshot())}).catch(T=>d(T.message)),()=>{window.removeEventListener(Pe,w),window.removeEventListener("voken:message",F)}},[n]);const x=(t==null?void 0:t.tab)||"my-overview",S=ge.find(({key:w})=>w===x||x==="costs"&&w==="my-overview")??ge[1],y=S.key==="customers-opportunities",E=["my-overview","orders-payments","protection-funding","ai-capabilities"].includes(x),f=Wn[x]||(x==="job-view"?"核对任务结果与来源，准备下一步业务行动。":void 0),j=(w,F=!0)=>{s&&x!==w&&N(s.navigate(w)),F&&_(!1)},R=()=>{var w;(w=document.getElementById("logout"))==null||w.click(),_(!1)},G=e.jsx("nav",{className:"workspace-sections","aria-label":"一级导航",children:ge.map(({key:w,label:F,icon:T})=>e.jsx(u,{type:"text",icon:e.jsx("span",{"aria-hidden":"true",className:"workspace-section-icon",children:T}),"aria-current":w===S.key?"true":void 0,onClick:()=>{w==="customers-opportunities"?y?r||h(!1):j("workbench",!r):j(w)},children:F},w))}),m=[{key:"overview",icon:e.jsx(Qe,{}),label:"业务概况"},{type:"group",label:"客户开发",children:[{key:"discover",icon:e.jsx(Ee,{}),label:"发现客户"},{key:"workbench",icon:e.jsx(je,{}),label:"客户工作台"},{key:"customers",icon:e.jsx(ie,{}),label:"客户档案"},{key:"jobs",icon:e.jsx($n,{}),label:"任务管理"}]},{type:"group",label:"业务工具",children:[{key:"directory",icon:e.jsx(An,{}),label:"企业与联系人"},{key:"sources",icon:e.jsx(Dn,{}),label:"商业情报"},{key:"mail",icon:e.jsx(re,{}),label:"邮件管理"},{key:"company",icon:e.jsx(me,{}),label:"企业资料"}]}],C=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"workspace-label",children:"客户与商机"}),e.jsx(Cn,{"aria-label":"客户与商机导航",theme:"light",mode:"inline",selectedKeys:[x==="job-view"?"jobs":x],items:m,onClick:({key:w})=>j(w)})]}),$=e.jsx("div",{className:"sidebar-bottom",children:e.jsxs("button",{className:"points-entry","aria-label":`${(t==null?void 0:t.balance)||"— 点数"}，用量与费用`,onClick:()=>j("costs"),children:[e.jsx(qe,{}),e.jsxs("span",{children:[e.jsx("b",{children:(t==null?void 0:t.balance)||"— 点数"}),e.jsx("small",{children:"用量与费用"})]}),e.jsx(ne,{})]})});return e.jsxs(e.Fragment,{children:[e.jsx("div",{id:"toast",role:"status","aria-live":"polite",hidden:!0}),e.jsx(Jn,{ready:!!s}),o&&e.jsx("div",{className:"startup-error",children:e.jsx(D,{type:"error",title:o,action:e.jsx(u,{onClick:()=>location.reload(),children:"重新加载"})})}),e.jsx("div",{id:"workspace",className:`react-workspace${y?" has-customer-menu":""}`,hidden:!0,children:e.jsxs(ye,{children:[e.jsxs("aside",{className:"primary-sidebar",children:[e.jsx("div",{className:"primary-brand",children:e.jsx(un,{compact:!0})}),G,e.jsx(u,{className:"primary-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Fe,{}),onClick:R})]}),e.jsx(ye.Sider,{className:"voken-sidebar",width:216,collapsedWidth:68,collapsed:b,breakpoint:"lg",onBreakpoint:c,trigger:null,children:y&&!r&&e.jsxs(e.Fragment,{children:[C,$]})}),e.jsxs(ye,{className:`main-layout ${b?"is-collapsed":""}`,children:[e.jsxs("header",{className:"workspace-topbar",children:[e.jsxs(A,{children:[(r||y)&&e.jsx(u,{type:"text","aria-label":r?"打开导航":b?"展开导航":"收起导航",icon:b||r?e.jsx(wn,{}):e.jsx(kn,{}),onClick:()=>r?_(!0):h(w=>!w)}),e.jsx(_n,{items:[{title:"工作空间"},{title:S.label},...S.label===ue[x]?[]:[{title:ue[x]}]]})]}),e.jsxs(A,{children:[e.jsx(k,{className:"workspace-tag",icon:e.jsx(ee,{}),children:"独立业务空间"}),e.jsx(Je,{size:32,className:"user-avatar",children:"微"})]})]}),e.jsxs("main",{className:"workspace-content",children:[e.jsxs("div",{className:"react-page-header",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"page-title",tabIndex:-1,children:ue[x]||"业务概况"}),f&&e.jsx(g,{type:"secondary",children:f})]}),e.jsx(u,{id:"refresh",hidden:E&&x!=="my-overview","aria-label":"刷新当前页面数据",icon:e.jsx(Ze,{spin:t==null?void 0:t.loading}),disabled:!s||(t==null?void 0:t.loading),children:"刷新数据"})]}),s&&(t==null?void 0:t.session)&&e.jsxs("div",{children:[e.jsx(Vn,{data:t,bridge:s}),x==="ai-capabilities"&&e.jsx(ss,{bridge:s}),x==="overview"&&e.jsx(Zn,{data:t,bridge:s})," ",x==="workbench"&&e.jsx(es,{data:t,bridge:s})," ",x==="jobs"&&e.jsx(ns,{data:t,bridge:s})]},((B=t.session)==null?void 0:B.workspace_id)||"signed-out"),e.jsx(pn,{html:Tn,className:"business-pages"}),e.jsxs("div",{className:"compat-controls","aria-hidden":"true",hidden:!0,children:[e.jsx("details",{id:"tools-nav"}),e.jsx("button",{id:"balance"}),e.jsx("button",{id:"logout"})]}),e.jsxs("footer",{className:"workspace-footer",children:[e.jsx("span",{children:"微元 Voken · 让客户开发更进一步"}),e.jsx("span",{children:"公开信息优先，增强由你选择"})]})]})]})]})}),e.jsxs(Xe,{title:"工作空间导航",placement:"left",open:L&&r&&!!(t!=null&&t.session),onClose:()=>_(!1),className:"mobile-navigation",size:300,children:[G,y&&C,$,e.jsx(u,{className:"mobile-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Fe,{}),onClick:R,children:"退出登录"})]})]})}var Ye;const He=(Ye=document.querySelector('meta[name="csp-nonce"]'))==null?void 0:Ye.content;vn.createRoot(document.getElementById("root")).render(e.jsx(fn,{locale:gn,csp:He?{nonce:He}:void 0,theme:{token:{colorPrimary:"#2457e7",colorText:"#10224b",colorTextSecondary:"#5a6884",colorBgLayout:"#f7f9fd",colorBorderSecondary:"#e9edf6",borderRadius:8,fontFamily:'Inter, "Microsoft YaHei", "PingFang SC", sans-serif',fontSize:14,controlHeight:38},components:{Layout:{siderBg:"#ffffff",headerBg:"#ffffff"},Menu:{itemHeight:44,itemMarginBlock:5,itemBorderRadius:8,itemSelectedBg:"#eef3ff"},Table:{headerBg:"#f8faff",cellPaddingBlock:16},Card:{paddingLG:24}}},children:e.jsx(Ie,{children:e.jsx(ts,{})})}));
