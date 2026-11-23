import{r as x,j as e,c as En}from"./react-vendor-ovhI6CXq.js";import{A as Ne,F as C,M as J,a as R,T as me,S as O,I as L,D as $n,B as o,C as se,b as z,c as fe,d as ie,e as cn,f as A,g as dn,R as re,h as Se,i as Ie,j as An,k as qe,l as De,m as ze,n as pn,o as Tn,p as ee,q as Pe,r as we,s as he,t as Dn,z as Fn,L as Ee,u as Ze,v as M,w as Ln,x as Rn,y as Mn,E as un,G as mn,H as hn,J as bn,K as zn,N as Pn,O as Be,P as xn,Q as Fe,U as Bn,V as ke,W as Je,X as On,Y as Xe,Z as Le,_ as vn,$ as jn,a0 as ae,a1 as Vn,a2 as Un,a3 as Hn,a4 as Kn}from"./antd-vendor-D3_s_gPY.js";const Yn=`        <section id="overview" class="tab-panel">\r
          <div class="welcome">\r
            <div>\r
              <p class="eyebrow">下一段增长，从一次对话开始</p>\r
              <h2>让下一次增长，<br />从<em>对的客户</em>开始。</h2>\r
              <p>从产品与市场出发，建立有来源、可跟进的客户清单。</p>\r
              <div class="actions"><button data-tab="discover" class="light">创建找客户任务 ↗</button><button data-tab="workbench" class="hero-secondary">查看客户工作台 →</button></div>\r
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
            <button data-tab="workbench"><span>03</span><b>保存客户</b><small>建立客户库，安排下一次跟进</small></button>\r
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
              >\r
              <details id="discovery-form-options" class="advanced-options">\r
              <summary>更多条件与任务设置（选填）</summary>\r
              <label>任务名称<input name="name" maxlength="80" placeholder="默认使用市场与产品命名" /></label>\r
              <label\r
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
              <label\r
                >理想客户官网（选填）<input\r
                  name="seed_website"\r
                  type="url"\r
                  maxlength="500"\r
                  placeholder="https://example-buyer.com" /></label\r
              ><label\r
                >排除条件（逗号分隔）<input\r
                  name="exclude_keywords"\r
                  placeholder="货代、无关产品、只做零售" /></label\r
              ><label>更多参考客户官网（选填，最多5个，每行一个）<textarea name="reference_websites" rows="2" placeholder="https://buyer-one.com&#10;https://buyer-two.com"></textarea></label><label>排除客户域名（逗号分隔，含子域名）<input name="exclude_domains" placeholder="competitor.com, existing-customer.com" /></label>\r
              <label class="check"><input name="ted" type="checkbox" />同时查近 90 天 TED 官方招标（仍须核对时效及投标资格）</label>\r
              </details>\r
              <label\r
                >数据方案<select name="tier">\r
                  <option value="basic">基础发现 · 公开搜索</option>\r
                  <option value="enhanced">\r
                    高级档 · 公开搜索 + 跨境魔方\r
                  </option>\r
                  <option value="ai_enhanced">AI增强档 · 高级档 + 目标岗位联系人（¥7预算）</option><option value="enhanced_contacts">增强发现 · 优先补前2家企业的联系方式</option>\r
                </select></label\r
              ><label id="discovery-contact-target" hidden>AI增强目标岗位<select name="contact_target"><option value="procurement">采购 / 寻源 / 供应链</option><option value="leadership">企业负责人</option><option value="sales">销售 / 业务开发</option><option value="engineering">技术 / 工程</option></select></label\r
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
          <div class="section-intro"><h2>从草稿到发送，在这里管理</h2><p class="muted">在客户工作台选择客户写开发信，再打开草稿审阅和发送。</p><button data-tab="workbench">选择客户写邮件 →</button></div>\r
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
`,Gn=`        <details id="register-panel">\r
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
`,Qe="voken:updated";function yn(){const n=window.location.pathname;return n.endsWith("/app")||n.endsWith("/app/")?n.replace(/\/app\/?$/,"/app-assets/"):"/app-assets/"}let ve;function Wn(){return ve||(window.__VOKEN_REACT__=!0,ve=(async()=>{for(const n of["auth","workspace","login-form","logout","balance","refresh","wb-filter","company-form","discovery-form"])if(!document.getElementById(n))throw new Error("界面初始化未完成，请刷新重试。");for(const n of["app.js","account.js","discovery.js","directory.js","workbench.js","react-bridge.js"])await new Promise((t,a)=>{const s=document.createElement("script");s.src=yn()+n+"?v="+(new URL(import.meta.url).searchParams.get("v")||"development");const c=()=>window.removeEventListener("error",l),l=p=>{p.filename&&p.filename.split("?")[0]===s.src.split("?")[0]&&(c(),a(new Error("界面资源初始化失败，请刷新重试。")))};window.addEventListener("error",l),s.onload=()=>{c(),t()},s.onerror=()=>{c(),a(new Error("界面资源加载失败，请刷新重试。"))},document.head.appendChild(s)});return window.voken})(),ve)}function Zn({action:n,bridge:t,onClose:a,onSaved:s}){var y,E;const{message:c}=Ne.useApp(),[l]=C.useForm(),[p,v]=x.useState(!1),[d,r]=x.useState(""),[b,I]=x.useState(!1),w=C.useWatch("type",l),j=n.kind==="review"?"记录企业匹配评审":n.kind==="event"?"记录联系进展":`为 ${((y=n.ids)==null?void 0:y.length)||0} 家企业安排跟进`;async function T(g){var f;if(!p){v(!0),r("");try{n.kind==="review"?await t.post("/assessments",{prospect_id:n.row.id,status:g.status,reason:g.reason.trim()}):n.kind==="event"?await t.post("/events",{prospect_id:n.row.prospect_id,email:((f=g.email)==null?void 0:f.trim())||"",type:g.type,content:g.content.trim(),source:"user_recorded"},"event"):(await t.post("/followups",{prospect_ids:n.ids,due_at:g.due_at.toISOString(),intervals_days:(g.intervals||"").split(/[,，]/).filter(N=>N.trim()).map(Number),objective:g.objective.trim()},"followup"),t.select([])),a(),c.success(n.kind==="review"?"企业评审已保存":n.kind==="event"?"联系进展已记录":"跟进提醒已安排"),s()}catch(N){r(N.message)}finally{v(!1)}}}return e.jsxs(J,{title:j,open:!0,onCancel:()=>{p||a()},maskClosable:!p,keyboard:!p,closable:!p,footer:null,children:[d&&e.jsx(R,{type:"error",title:d,showIcon:!0,className:"modal-error"}),e.jsxs(C,{form:l,layout:"vertical",disabled:p,scrollToFirstError:{focus:!0},"data-extension":"react",onFinish:g=>void T(g),initialValues:{status:"unknown",type:"reply",email:((E=n.row)==null?void 0:E.email)||""},children:[n.kind==="review"&&e.jsxs(e.Fragment,{children:[e.jsxs(me.Paragraph,{type:"secondary",children:[n.row.name," · 新增独立评审记录，并保留原始证据。"]}),e.jsx(C.Item,{name:"status",label:"企业匹配判断",rules:[{required:!0}],children:e.jsx(O,{options:[{value:"fit",label:"符合目标客户画像"},{value:"not_fit",label:"不符合"},{value:"unknown",label:"依据不足，待核实"}]})}),e.jsx(C.Item,{name:"reason",label:"理由与来源证据",rules:[{required:!0,whitespace:!0,message:"请填写判断理由与证据"}],children:e.jsx(L.TextArea,{maxLength:1e3,rows:4,showCount:!0,placeholder:"说明企业角色、产品匹配与判断依据"})})]}),n.kind==="event"&&e.jsxs(e.Fragment,{children:[e.jsxs(me.Paragraph,{type:"secondary",children:[n.row.company," · ",n.row.name||"已记录的联系入口"]}),e.jsx(C.Item,{name:"type",label:"事件类型",rules:[{required:!0}],children:e.jsx(O,{options:[{value:"reply",label:"收到回复"},{value:"bounce",label:"退信"},{value:"opt_out",label:"拒绝联系"},{value:"meeting",label:"会议"},{value:"note",label:"备注"}]})}),e.jsx(C.Item,{name:"email",label:"事件关联邮箱",rules:[{required:["bounce","opt_out"].includes(w),message:"退信或拒绝联系时请填写事件邮箱"},{type:"email",message:"请输入有效邮箱"}],children:e.jsx(L,{type:"email",maxLength:254})}),e.jsx(C.Item,{name:"content",label:"联系进展",rules:[{required:!0,whitespace:!0,message:"请填写联系进展"}],children:e.jsx(L.TextArea,{maxLength:4e3,rows:4,showCount:!0})}),e.jsx(R,{type:"info",title:"退信与拒绝联系会拦截后续发送；收到回复会暂停后续提醒。"})]}),n.kind==="followup"&&e.jsxs(e.Fragment,{children:[e.jsx(C.Item,{name:"due_at",label:"首次提醒时间（本地时间）",rules:[{required:!0,message:"请选择首次提醒时间"}],children:e.jsx($n,{showTime:{format:"HH:mm"},format:"YYYY-MM-DD HH:mm",placeholder:"选择提醒时间",className:"full-width"})}),e.jsx(o,{type:"link",className:"draft-options","aria-expanded":b,onClick:()=>I(!b),children:b?"收起多轮提醒":"设置多轮提醒"}),b&&e.jsx(C.Item,{name:"intervals",preserve:!1,label:"后续提醒（相对首次的天数）",rules:[{validator:(g,f)=>{const N=String(f||"").split(/[,，]/).filter(k=>k.trim()).map(Number);return N.length<=5&&N.every(k=>Number.isInteger(k)&&k>=1&&k<=90)&&new Set(N).size===N.length&&N.every((k,q)=>q===0||k>N[q-1])?Promise.resolve():Promise.reject(new Error("最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔"))}}],children:e.jsx(L,{placeholder:"例如：3,7,14"})}),e.jsx(C.Item,{name:"objective",label:"跟进目标",rules:[{required:!0,whitespace:!0,message:"请填写跟进目标"}],children:e.jsx(L.TextArea,{rows:3,maxLength:500,showCount:!0,placeholder:"例如：核对采购职责，审阅并准备第一封开发信"})}),e.jsx(R,{type:"info",title:"这里只安排提醒。每封邮件仍需单独审阅确认后发送。"})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(o,{onClick:a,disabled:p,children:"取消"}),e.jsx(o,{type:"primary",htmlType:"submit",loading:p,children:n.kind==="review"?"保存评审":n.kind==="event"?"记录进展":"安排提醒"})]})]})]})}const je={stage:"销售阶段",contact:"商务联系方式",tags:"标签",next_followup_at:"下次跟进时间",do_not_contact:"联系状态"},Jn={note:"备注",email_sent:"已通过自有邮箱发送",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索质量反馈",opt_out:"收到拒绝联系请求"},Xn={English:"英语",Chinese:"中文",Spanish:"西班牙语",German:"德语",French:"法语",Portuguese:"葡萄牙语"},en="简洁介绍产品，询问对方是否有相关需求。",$e=n=>Object.entries(n).map(([t,a])=>({value:t,label:a})),nn=n=>[...new Set(n.split(/[,，]/).map(t=>t.trim()).filter(Boolean))];function Qn(n){if(!n)return"";const t=new Date(n);return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16)}function et({action:n,row:t,bridge:a,stages:s,draftPrice:c,onClose:l,onSaved:p}){const[v]=C.useForm(),[d,r]=x.useState(!1),[b,I]=x.useState(""),[w,j]=x.useState(!1),T=n==="activity"?"记录跟进":n==="draft"?"写开发信":n==="do_not_contact"?t.do_not_contact?"恢复联系":"停止联系":`修改${je[n]}`,y=C.useWatch("kind",v),E=n==="tags"?t.tags.join(", "):n==="next_followup_at"?Qn(t.next_followup_at):t[n]??"";async function g(f){var N;if(!d){r(!0),I("");try{if(n==="draft"){await a.createDraft(t.id,{language:f.language||"English",objective:((N=f.objective)==null?void 0:N.trim())||en}),l();return}if(n==="activity")await a.recordActivity(t.id,{kind:f.kind,content:f.content.trim()});else{const k=f.field??"";let q=k;n==="tags"&&(q=nn(k)),n==="contact"&&(q=k.trim()),n==="next_followup_at"&&(q=k?new Date(k).toISOString():null),n==="do_not_contact"&&(q=!t.do_not_contact),(n==="do_not_contact"||k!==E)&&await a.updateCustomer(t.id,t.version,{[n]:q})}p(n==="activity"?"跟进已记录":"客户详情已保存")}catch(k){I(k.message)}finally{r(!1)}}}return e.jsxs(J,{title:T,open:!0,width:440,footer:null,onCancel:d?void 0:l,closable:!d,keyboard:!d,maskClosable:!d,children:[b&&e.jsx(R,{className:"modal-error",type:"error",showIcon:!0,title:b}),e.jsxs(C,{form:v,layout:"vertical",disabled:d,"data-extension":"react",initialValues:{field:E,kind:"note",language:"English",objective:en},onFinish:f=>void g(f),children:[n==="stage"&&e.jsx(C.Item,{name:"field",label:je.stage,children:e.jsx(O,{virtual:!1,options:$e(s)})}),n==="contact"&&e.jsx(C.Item,{name:"field",label:je.contact,children:e.jsx(L,{maxLength:500,allowClear:!0})}),n==="tags"&&e.jsx(C.Item,{name:"field",label:je.tags,rules:[{validator:async(f,N)=>{const k=nn(N||"");if(k.length>20||k.some(q=>q.length>40))throw new Error("最多 20 个标签，每个标签最多 40 字")}}],children:e.jsx(L,{allowClear:!0,placeholder:"多个标签用逗号分隔"})}),n==="next_followup_at"&&e.jsx(C.Item,{name:"field",label:"下次跟进时间（本地时间）",children:e.jsx(L,{type:"datetime-local"})}),n==="do_not_contact"&&e.jsx(me.Paragraph,{children:t.do_not_contact?"恢复联系后可重新安排跟进。":"停止联系会清除已设定的下次跟进时间。"}),n==="activity"&&e.jsxs(e.Fragment,{children:[e.jsx(C.Item,{name:"kind",label:"记录类型",children:e.jsx(O,{options:$e(Jn)})}),e.jsx(C.Item,{name:"content",label:"跟进内容",rules:[{required:!0,whitespace:!0,message:"请填写跟进内容"}],children:e.jsx(L.TextArea,{rows:3,maxLength:4e3,placeholder:"记录沟通结果或下一步"})}),y==="opt_out"&&e.jsx(R,{type:"warning",title:"保存后将停止联系该客户并清除下次跟进时间。"})]}),n==="draft"&&e.jsxs(e.Fragment,{children:[!w&&e.jsx(me.Paragraph,{children:"默认生成英文草稿，简洁介绍产品并询问需求。"}),e.jsx(o,{type:"link",className:"draft-options","aria-expanded":w,onClick:()=>j(!w),children:w?"收起草稿选项":"修改语言和目标"}),w&&e.jsxs(e.Fragment,{children:[e.jsx(C.Item,{name:"language",label:"语言",children:e.jsx(O,{options:$e(Xn)})}),e.jsx(C.Item,{name:"objective",label:"这封信的目标",rules:[{required:!0,whitespace:!0,message:"请填写开发信目标"}],children:e.jsx(L.TextArea,{rows:2,maxLength:1e3})})]})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(o,{autoInsertSpace:!1,onClick:l,children:"取消"}),e.jsx(o,{autoInsertSpace:!1,type:"primary",htmlType:"submit",loading:d,children:n==="draft"?`生成草稿${c===void 0?"":` · ${c} 点`}`:n==="do_not_contact"?T:"保存"})]})]})]})}function nt({kind:n,row:t,bridge:a,pointQuotes:s,onClose:c}){const[l,p]=x.useState(!1),[v,d]=x.useState(""),[r,b]=x.useState(!1),I=n==="targeted",w=s[I?"targeted_contacts":"directory_companies"],j=I?"精准联系人检索":"查企业与岗位";async function T(y){if(l)return;p(!0),d("");const E={company_name:y.company_name.trim()};try{await a.searchCustomerContacts(t.id,n,I?{...E,website:y.website.trim(),contact_target:y.contact_target,contact_titles:(y.contact_titles||"").split(/[,，]/).map(g=>g.trim()).filter(Boolean),confirm_company_match:y.reviewed,confirm_paid:y.paid}:{...E,kind:"company",confirm_paid:y.paid,.../^[A-Z]{2}$/.test(t.location)?{country:t.location}:{}}),c()}catch(g){d(g.message)}finally{p(!1)}}return e.jsxs(J,{open:!0,title:j,width:480,footer:null,onCancel:l?void 0:c,closable:!l,keyboard:!l,maskClosable:!l,children:[v&&e.jsx(R,{className:"modal-error",type:"error",title:v,showIcon:!0}),e.jsxs(C,{layout:"vertical",disabled:l,"data-extension":"react",initialValues:{company_name:t.name,website:t.website,contact_target:"procurement"},onFinish:y=>void T(y),children:[e.jsx(C.Item,{name:"company_name",label:"企业名称",rules:[{required:!0,whitespace:!0,max:I?240:180}],children:e.jsx(L,{maxLength:I?240:180})}),I&&e.jsxs(e.Fragment,{children:[e.jsx(C.Item,{name:"website",label:"已核对的企业官网",rules:[{required:!0,type:"url",message:"请输入有效的企业官网地址"}],children:e.jsx(L,{maxLength:500,placeholder:"https://buyer.com"})}),e.jsx(C.Item,{name:"contact_target",label:"目标岗位",children:e.jsx(O,{options:[{value:"procurement",label:"采购 / 寻源 / 供应链"},{value:"leadership",label:"企业负责人"},{value:"sales",label:"销售 / 业务开发"},{value:"engineering",label:"技术 / 工程"}]})}),e.jsx(o,{type:"link",className:"draft-options","aria-expanded":r,onClick:()=>b(!r),children:r?"收起具体职位":"指定具体职位"}),r&&e.jsx(C.Item,{name:"contact_titles",label:"具体职位",children:e.jsx(L,{maxLength:480,placeholder:"最多 6 个职位，用逗号分隔"})}),e.jsx(C.Item,{name:"reviewed",valuePropName:"checked",rules:[{validator:async(y,E)=>{if(!E)throw new Error("请核对企业与官网归属")}}],children:e.jsx(se,{children:"我已核对企业与官网归属"})})]}),e.jsx(C.Item,{name:"paid",valuePropName:"checked",rules:[{validator:async(y,E)=>{if(!E)throw new Error("请确认本次查询的点数预占")}}],children:e.jsx(se,{disabled:!w,children:w?`同意预占 ${w.total_points} 点（平台 ${w.platform_points} 点，数据 ${w.data_points} 点）`:"当前报价暂不可用"})}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(o,{autoInsertSpace:!1,onClick:c,children:"取消"}),e.jsx(o,{type:"primary",htmlType:"submit",loading:l,disabled:!w,children:"开始查询"})]})]})]})}const fn=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:2}),W=n=>`USD ${fn.format(n)}`,tn=[{id:"DEMO-MY-001",product:"连锁门店包装耗材",buyer:"吉隆坡连锁商户 A",amount:48e3,received:14400,due:"演示第 30 天",overdue:!0,receipt:{reference:"DEMO-PSP-8616",orderId:"DEMO-MY-001",currency:"USD",amount:33600},shipment:{label:"海运 · 待发运",route:"深圳 → 巴生港",risks:"受潮、包装破损与中转装卸风险",missing:"装箱单、运输节点和货物交接责任"},acceptance:!1,receivableConfirmed:!1},{id:"DEMO-MY-002",product:"门店标准化设备",buyer:"槟城零售商户 B",amount:26400,received:0,due:"演示第 45 天",shipment:{label:"海运 · 已签收",route:"广州 → 槟城",risks:"设备运输碰撞、装卸损坏；后续经营阶段可梳理设备财产和责任保障",missing:"签收时的设备状态、设备清单和门店运营地址"},acceptance:!0,receivableConfirmed:!0},{id:"DEMO-MY-003",product:"门店标识补货",buyer:"新山零售商户 C",amount:18e3,received:18e3,due:"演示第 20 天",shipment:{label:"空运 · 已交付",route:"广州 → 新山",risks:"可复盘分批运输及交接记录，供下次补货时核对保障需求",missing:"本批已交付，汇总交接记录供后续订单参考"},acceptance:!0,receivableConfirmed:!0}];function Q(n){return n.amount-n.received}function gn(n){return n.reduce((t,a)=>({received:t.received+a.received,outstanding:t.outstanding+Q(a),unpaid:t.unpaid+(Q(a)>0?1:0)}),{received:0,outstanding:0,unpaid:0})}function wn({mode:n}){const t=n==="payment";return e.jsxs("div",{className:"business-demo-banner",children:[e.jsx("span",{className:"business-demo-icon","aria-hidden":"true",children:t?e.jsx(Se,{}):e.jsx(Ie,{})}),e.jsxs("div",{children:[e.jsxs("div",{className:"business-banner-heading",children:[e.jsx("h2",{children:t?"马来西亚跨境采购试点":"马来西亚出海服务试点"}),e.jsx(A,{color:"gold",children:"演示环境"})]}),e.jsx("p",{children:t?"跟踪订单应收、准备收款提醒，并核对支付渠道回传的流水。所有订单和流水均为样例。":"按订单整理货运与经营保障需求，检查应收融资材料。所有材料和进度均为样例。"})]})]})}function _e(n){return Q(n)?n.receipt?{text:"有流水待核对",color:"orange"}:{text:"待回款",color:"blue"}:{text:"已结清",color:"green"}}function kn({orders:n,order:t,select:a}){return e.jsx(z,{title:"选择演示订单",className:"demo-order-list",children:e.jsx("div",{className:"demo-order-options",role:"group","aria-label":"演示订单",children:n.map(s=>e.jsxs("button",{type:"button","aria-pressed":s.id===t.id,onClick:()=>a(s),children:[e.jsxs("span",{className:"demo-order-title",children:[e.jsx("strong",{children:s.product}),e.jsx(A,{color:_e(s).color,children:_e(s).text})]}),e.jsx("span",{children:s.buyer}),e.jsxs("small",{children:[s.id," · ",W(s.amount)]})]},s.id))})})}function tt({orders:n,order:t,select:a,reconcile:s,openProtection:c}){const[l,p]=x.useState(null),v=gn(n),d=Q(t),r=t.receipt,b=(r==null?void 0:r.orderId)===t.id&&r.currency==="USD"&&r.amount===d;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(wn,{mode:"payment"}),e.jsxs("div",{className:"business-grid demo-statistics","aria-label":"演示收款汇总",children:[e.jsx(z,{children:e.jsx(fe,{title:"订单总数",value:n.length,suffix:"笔"})}),e.jsx(z,{children:e.jsx(fe,{title:"累计回款",value:v.received,prefix:"USD"})}),e.jsx(z,{children:e.jsx(fe,{title:"待回款",value:v.outstanding,prefix:"USD"})})]}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(kn,{orders:n,order:t,select:a}),e.jsxs(z,{title:t.product,extra:e.jsx(A,{color:_e(t).color,children:_e(t).text}),children:[e.jsx(ie,{size:"small",column:{xs:1,sm:2},items:[{key:"buyer",label:"买方",children:t.buyer},{key:"amount",label:"合同金额",children:W(t.amount)},{key:"received",label:"累计回款",children:W(t.received)},{key:"remaining",label:"待回款",children:W(d)},{key:"due",label:"付款节点",children:`${t.due}${t.overdue&&d?" · 已逾期":""}`},{key:"shipment",label:"履约状态",children:t.shipment.label}]}),e.jsxs("div",{className:"demo-actions",children:[d>0&&e.jsx(o,{onClick:()=>p("reminder"),children:"预览收款提醒"}),r&&e.jsx(o,{type:"primary",onClick:()=>p("reconcile"),children:"核对回款流水"}),e.jsx(o,{onClick:c,children:"查看订单保障"})]}),e.jsx("h3",{className:"demo-subheading",children:"订单与收款进度"}),e.jsx(cn,{items:[{color:"green",content:"买卖双方确认报价、合同及付款条款"},{color:t.received?"green":"gray",content:t.received?`已入账 ${W(t.received)}`:"等待支付渠道回传流水"},{color:r?"orange":d?"gray":"green",content:r?`渠道流水 ${r.reference} 待人工核对`:d?"待收到款项并完成对账":"应收余额为零，已结清"}]})]})]}),e.jsxs(J,{open:l==="reminder",title:"收款跟进员 · 提醒草稿",onCancel:()=>p(null),footer:e.jsx(o,{onClick:()=>p(null),children:"关闭预览"}),children:[e.jsx(R,{type:"info",showIcon:!0,title:"演示草稿，仅供人工审阅"}),e.jsxs("p",{children:[t.buyer,"，您好！想与您核对订单 ",t.id,"「",t.product,"」的付款进度。"]}),e.jsxs("p",{children:["根据样例账面记录，当前待回款 ",W(d),"，约定付款节点为",t.due,"。如已安排付款，请回复交易参考号，便于核对。谢谢！"]})]}),e.jsxs(J,{open:l==="reconcile"&&!!r,title:"人工确认回款对账",onCancel:()=>p(null),okText:"确认演示对账",okButtonProps:{disabled:!b},onOk:()=>{s(),p(null)},children:[e.jsx(ie,{size:"small",column:1,items:[{key:"id",label:"流水关联订单",children:r==null?void 0:r.orderId},{key:"reference",label:"渠道流水",children:r==null?void 0:r.reference},{key:"amount",label:"流水金额",children:r&&`${r.currency} ${fn.format(r.amount)}`},{key:"expected",label:"待回款",children:W(d)}]}),b?e.jsx(R,{type:"success",showIcon:!0,title:"样例流水的订单号、币种与应收金额已匹配",description:"确认后更新本次演示金额。重新打开页面后恢复初始样例。"}):e.jsx(R,{type:"warning",showIcon:!0,title:"流水与应收信息有差异，请人工复核。"})]})]})}function st(n){return[{label:"企业主体及买方资料",present:!0},{label:"真实订单与合同",present:!0},{label:"应收账款确权凭证",present:n.receivableConfirmed},{label:"履约及验收凭证",present:n.acceptance},{label:"还款来源与安排",present:!1}]}function at({orders:n,order:t,select:a,openPayments:s}){const[c,l]=x.useState(null),p=st(t),v=p.filter(({present:d})=>d).length;return e.jsxs("div",{className:"native-page business-page",children:[e.jsx(wn,{mode:"protection"}),e.jsxs("div",{className:"demo-order-layout",children:[e.jsx(kn,{orders:n,order:t,select:a}),e.jsx(z,{title:t.product,extra:e.jsx(o,{size:"small",onClick:s,children:"查看订单收款"}),children:e.jsx(dn,{items:[{key:"insurance",label:"货运与经营保障",children:e.jsxs(e.Fragment,{children:[e.jsx(ie,{size:"small",column:1,items:[{key:"route",label:"运输路线",children:`${t.shipment.route} · ${t.shipment.label}`},{key:"value",label:"订单金额",children:W(t.amount)},{key:"risks",label:"风险关注",children:t.shipment.risks},{key:"missing",label:"资料待核对",children:t.shipment.missing}]}),e.jsx("div",{className:"demo-actions",children:e.jsx(o,{type:"primary",onClick:()=>l("insurance"),children:"预览保障需求清单"})})]})},{key:"funding",label:"应收融资对接",children:e.jsx(e.Fragment,{children:Q(t)?e.jsxs(e.Fragment,{children:[e.jsx(ie,{size:"small",column:1,items:[{key:"remaining",label:"待回款",children:W(Q(t))},{key:"materials",label:"材料准备",children:`已备 ${v} / ${p.length} 项`}]}),e.jsx("ul",{className:"demo-materials",children:p.map(({label:d,present:r})=>e.jsxs("li",{children:[e.jsx("span",{children:d}),e.jsx(A,{color:r?"green":"gold",children:r?"已备":"待补充"})]},d))}),e.jsx(o,{type:"primary",onClick:()=>l("funding"),children:"预览机构对接摘要"})]}):e.jsx(R,{type:"info",showIcon:!0,title:"这笔订单已结清，无待融资应收"})})}]})})]}),e.jsxs(J,{open:c!==null,title:c==="insurance"?"保险分析师 · 保障需求清单":"应收融资 · 机构对接摘要",onCancel:()=>l(null),footer:e.jsx(o,{onClick:()=>l(null),children:"关闭预览"}),children:[e.jsx("p",{children:e.jsxs("strong",{children:[t.id," · ",t.product]})}),c==="insurance"?e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["运输与经营风险：",t.shipment.risks,"。"]}),e.jsxs("p",{children:["资料待核对：",t.shipment.missing,"。"]}),e.jsx(R,{type:"info",showIcon:!0,title:"下一步由保险机构确认保障范围、条件和所需材料。"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["样例应收余额 ",W(Q(t)),"，约定付款节点为",t.due,"。"]}),e.jsxs("p",{children:["材料缺口：",p.filter(({present:d})=>!d).map(({label:d})=>d).join("、"),"。"]}),e.jsx(R,{type:"info",showIcon:!0,icon:e.jsx(re,{}),title:"材料补齐后，由资金方独立评估。"})]})]})]})}const it=[{label:"发现客户",icon:e.jsx(Pe,{}),target:"discover"},{label:"客户工作台",icon:e.jsx(we,{}),target:"workbench"},{label:"邮件管理",icon:e.jsx(he,{}),target:"mail"},{label:"订单对账",icon:e.jsx(Se,{}),target:"orders-payments",demo:!0},{label:"保障与融资",icon:e.jsx(Ie,{}),target:"protection-funding",demo:!0},{label:"用量与费用",icon:e.jsx(ze,{}),target:"costs"}];function ye({label:n,value:t,icon:a,note:s,demo:c,onClick:l}){return e.jsxs("button",{className:"business-metric",type:"button",onClick:l,children:[e.jsxs("span",{className:"business-metric-top",children:[e.jsx("span",{className:`business-tile-icon${c?" is-demo":""}`,"aria-hidden":"true",children:a}),c?e.jsx(A,{color:"gold",children:"演示"}):e.jsx(ee,{className:"business-link-icon","aria-hidden":"true"})]}),e.jsx("span",{className:"business-metric-label",children:n}),e.jsxs("span",{className:"business-metric-value",children:[c&&e.jsx("small",{children:"USD"}),(t==null?void 0:t.toLocaleString("zh-CN"))??"—"]}),e.jsx("span",{className:"business-tile-note",children:s})]})}function Ae({name:n,detail:t,icon:a,demo:s,onClick:c}){return e.jsxs("button",{type:"button",className:"employee-tile",onClick:c,children:[e.jsx("span",{className:`business-tile-icon${s?" is-demo":""}`,"aria-hidden":"true",children:a}),e.jsxs("span",{className:"employee-copy",children:[e.jsx("strong",{children:n}),e.jsx("small",{children:t})]}),s&&e.jsx(A,{color:"gold",children:"演示"}),e.jsx(ee,{className:"business-link-icon","aria-hidden":"true"})]})}function rt({data:n,totals:t,navigate:a}){var p,v,d,r;const[s,c]=x.useState(null),l=(p=n.dashboardAgents)==null?void 0:p.find(({id:b})=>b===s);return e.jsxs("div",{className:"native-page business-page",children:[e.jsxs("section",{"aria-labelledby":"workbench-data",children:[e.jsx("h2",{className:"business-heading",id:"workbench-data",children:"业务数据"}),e.jsxs("div",{className:"business-grid business-metrics",children:[e.jsx(ye,{label:"洽谈中商机",value:n.summary?((v=n.summary.stages)==null?void 0:v.negotiating)??0:void 0,note:"客户管线中的洽谈阶段",icon:e.jsx(An,{}),onClick:()=>a("overview")}),e.jsx(ye,{label:"已保存客户",value:(d=n.summary)==null?void 0:d.total,note:"当前工作空间",icon:e.jsx(qe,{}),onClick:()=>a("customers")}),e.jsx(ye,{label:"到期待跟进",value:(r=n.summary)==null?void 0:r.due_followups,note:"到期且允许联系",icon:e.jsx(De,{}),onClick:()=>a("overview")}),e.jsx(ye,{label:"累计回款",value:t.received,note:`${t.unpaid} 笔样例订单待回款`,icon:e.jsx(ze,{}),demo:!0,onClick:()=>a("orders-payments")})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-employees",children:[e.jsx("h2",{className:"business-heading",id:"workbench-employees",children:"数字员工"}),e.jsxs(z,{className:"business-employees",variant:"outlined",children:[e.jsx("h3",{children:"已创建的员工"}),n.dashboardAgentsError?e.jsx(R,{type:"warning",showIcon:!0,title:"数字员工加载失败，请刷新数据重试。"}):n.dashboardAgents===null?e.jsx(pn,{active:!0,title:!1,paragraph:{rows:1}}):n.dashboardAgents.length?e.jsx("div",{className:"business-grid employee-grid",children:n.dashboardAgents.map(b=>e.jsx(Ae,{name:b.config.name,icon:e.jsx(Tn,{}),detail:b.config.market?`拓客 · ${b.config.market}`:"拓客",onClick:()=>c(b.id)},b.id))}):e.jsxs("div",{className:"employee-empty",children:[e.jsx("span",{children:"当前工作空间尚未创建拓客数字员工。"}),e.jsx(o,{type:"link",onClick:()=>a("discover"),children:"前往发现客户"})]}),e.jsx("h3",{children:"演示员工"}),e.jsxs("div",{className:"business-grid employee-grid",children:[e.jsx(Ae,{name:"收款跟进员",detail:"准备收款提醒，协助核对回款流水",icon:e.jsx(Se,{}),demo:!0,onClick:()=>a("orders-payments")}),e.jsx(Ae,{name:"保险分析师",detail:"梳理货运与经营保障需求",icon:e.jsx(Ie,{}),demo:!0,onClick:()=>a("protection-funding")})]})]})]}),e.jsxs("section",{"aria-labelledby":"workbench-shortcuts",children:[e.jsx("h2",{className:"business-heading",id:"workbench-shortcuts",children:"常用功能"}),e.jsx("div",{className:"business-grid shortcut-grid",children:it.map(({label:b,icon:I,target:w,demo:j})=>e.jsxs(o,{className:"business-shortcut",onClick:()=>a(w),children:[e.jsx("span",{className:"business-tile-icon","aria-hidden":"true",children:I}),e.jsx("span",{children:b}),j&&e.jsx(A,{color:"gold",children:"演示"})]},w))})]}),e.jsx(J,{open:!!l,title:l==null?void 0:l.config.name,onCancel:()=>c(null),footer:e.jsx(o,{type:"primary",onClick:()=>{c(null),a("discover")},children:"进入拓客"}),children:l&&e.jsx(lt,{employee:l})})]})}function lt({employee:{status:n,config:t}}){return e.jsx(ie,{size:"small",column:1,items:[{key:"type",label:"类型",children:"拓客数字员工"},{key:"status",label:"状态",children:{enabled:"已启用",paused:"已暂停"}[n]??"已创建"},{key:"market",label:"目标市场",children:t.market||"未指定"},{key:"product",label:"主打产品",children:t.product||"未指定"},{key:"instructions",label:"任务指令",children:e.jsx("span",{className:"employee-instructions",children:t.instructions})}]})}function ot({data:n,bridge:t}){const[a,s]=x.useState(tn),[c,l]=x.useState(tn[0].id),p=a.find(({id:r})=>r===c)??a[0],v=r=>{t.navigate(r).catch(()=>{})},d={orders:a,order:p,select:({id:r})=>l(r)};return n.tab==="my-overview"?e.jsx(rt,{data:n,totals:gn(a),navigate:v}):n.tab==="orders-payments"?e.jsx(tt,{...d,openProtection:()=>v("protection-funding"),reconcile:()=>s(r=>r.map(b=>b.id===c&&b.receipt?{...b,received:b.received+b.receipt.amount,receipt:void 0}:b))}):n.tab==="protection-funding"?e.jsx(at,{...d,openPayments:()=>v("orders-payments")}):null}const Oe={mode:"companies",q:"",country_filter:"",stage:"",tag:"",target:"procurement",verification:"",role_filter:"",has_email:!1,due:!1,ready_only:!1},sn=["company","location","stage","contacts","assessment","action"],_n="voken-workbench-display-v1";function Ce(n){return Object.fromEntries(Object.entries(Oe).map(([t,a])=>[t,typeof a=="boolean"?n[t]===!0:String(n[t]??a).trim()]))}function an(n,t){return JSON.stringify(Ce(n))===JSON.stringify(Ce(t))}function ct(n,t,a){const s=Ce(n),c={q:`搜索：${s.q}`,country_filter:`地区：${s.country_filter}`,stage:`阶段：${t[String(s.stage)]||s.stage}`,tag:`标签：${s.tag}`,target:{leadership:"目标：企业负责人",sales:"目标：销售 / 业务开发"}[String(s.target)],verification:`邮箱：${a[String(s.verification)]||s.verification}`,role_filter:{keyword_match:"命中岗位关键词",needs_review:"岗位待核实",unknown:"岗位未知"}[String(s.role_filter)],has_email:"有完整邮箱",due:"到期跟进",ready_only:"已评审、岗位匹配且邮箱近期有效"};return Object.entries(s).filter(([l,p])=>l!=="mode"&&p!==Oe[l]).map(([l])=>({key:l,label:c[l]||l}))}function Re(n){const t=n&&typeof n=="object"?n:{},a=Array.isArray(t.columns)?t.columns:null,s=a?sn.filter(c=>["company","action"].includes(c)||a.includes(c)):[...sn];return{density:t.density==="compact"?"compact":"comfortable",columns:s}}function dt(){try{return Re(JSON.parse(localStorage.getItem(_n)||"null"))}catch{return Re(null)}}function pt(n){try{localStorage.setItem(_n,JSON.stringify(Re(n)))}catch{}}function ut(n){if(!n)return"未提供";const t=new Date(String(n));return Number.isNaN(t.getTime())?"日期待核实":t.toLocaleString("zh-CN",{hour12:!1})}const rn={created:"保存客户",updated:"调整跟进",note:"备注",email_sent:"已发送邮件",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索反馈",opt_out:"拒绝联系",draft_requested:"生成开发信",research_requested:"公域查证",contact_selected:"采用联系信息",assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒",bounce:"退信"},{Text:S,Title:Ve,Paragraph:Z}=me,pe={new:"新发现",qualified:"已筛选",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",won:"已成交",lost:"不匹配"},Cn={new:"blue",qualified:"cyan",contacted:"geekblue",replied:"purple",negotiating:"orange",won:"green",lost:"default"},ue={valid:"独立验证有效",invalid:"无效 / 不应联系",catch_all:"全收域，待确认",unknown:"未知",unverified:"尚未独立验证"},ge={"my-overview":"我的工作台","orders-payments":"订单与收款","protection-funding":"保障与资金","ai-capabilities":"AI能力",overview:"业务概况",discover:"发现客户",workbench:"客户工作台",jobs:"任务管理","job-view":"任务详情",directory:"企业与联系人",sources:"商业情报",mail:"邮件管理",company:"企业资料",costs:"用量与费用"},mt={"my-overview":"查看业务进展、数字员工和常用功能。",overview:"从发现到跟进，让每一条客户线索都有下一步。",workbench:"筛选企业、核对联系人，集中推进值得跟进的商机。",discover:"从产品与市场出发，找到下一批合适的潜在客户。",jobs:"查看执行进度、核对来源，管理每一次发现。",directory:"查询企业与目标岗位，按需补充商务联系信息。",sources:"核对企业背景，发现公开采购与市场信号。",company:"让 AI 理解你的企业、产品与目标市场。",mail:"审阅开发信，记录回复，安排下一次跟进。",costs:"查看点数、任务结算和数据使用情况。"},te=n=>Object.entries(n).map(([t,a])=>({value:t,label:a})),X=ut,$=n=>{n.catch(()=>{})};function Me({href:n,children:t}){let a=!1;try{a=["http:","https:"].includes(new URL(n||"").protocol)}catch{}return a?e.jsx("a",{href:n,target:"_blank",rel:"noopener noreferrer",children:t}):e.jsx(S,{type:"secondary",children:t})}function Nn({html:n,className:t=""}){const a=x.useRef(null);return x.useEffect(()=>{a.current&&(a.current.innerHTML=n)},[n]),e.jsx("div",{className:`legacy ${t}`,ref:a})}function Sn({compact:n=!1}){return e.jsxs("a",{className:"voken-brand",href:"#my-overview","aria-label":"微元 Voken 首页",children:[e.jsx("img",{className:"brand-symbol",src:`${yn()}favicon.svg`,alt:"",width:40,height:40}),!n&&e.jsxs("span",{children:["微元",e.jsx("span",{className:"brand-en",children:"Voken"})]})]})}function ht({ready:n}){return e.jsxs("section",{id:"auth",className:"react-auth",onSubmitCapture:t=>{n||t.preventDefault()},children:[e.jsxs("div",{className:"auth-intro",children:[e.jsx(Sn,{}),e.jsxs("div",{className:"auth-intro-copy",children:[e.jsx("p",{className:"auth-kicker",children:"微元 Voken 工作台"}),e.jsxs("h1",{children:["用",e.jsx("span",{className:"brand-highlight",children:" AI "}),"发现客户，",e.jsx("br",{}),"推进每一次",e.jsx("span",{className:"brand-accent",children:"商机"}),"。"]}),e.jsx("p",{className:"auth-lead",children:"核对企业和联系信息、审阅开发信，并跟进客户进展。"})]})]}),e.jsx("div",{className:"auth-form-wrap",children:e.jsxs("div",{className:"auth-form-card",children:[e.jsx(Ve,{level:2,children:"登录微元工作台"}),e.jsxs("form",{id:"login-form",className:"login-form",method:"post",children:[e.jsx("label",{htmlFor:"login-phone",children:"手机号"}),e.jsx(L,{id:"login-phone",name:"phone",type:"tel",autoComplete:"username",placeholder:"请输入手机号",size:"large",required:!0}),e.jsx("label",{htmlFor:"login-password",children:"密码"}),e.jsx(L.Password,{id:"login-password",name:"password",autoComplete:"current-password",placeholder:"请输入密码",size:"large",minLength:8,required:!0}),e.jsx(o,{type:"primary",size:"large",htmlType:"submit",block:!0,disabled:!n,loading:!n,children:"进入工作台"})]}),e.jsx(Nn,{html:Gn})]})})]})}function In({items:n}){return e.jsx(xn,{gutter:[16,16],className:"metric-row",children:n.map(t=>e.jsx(Fe,{xs:24,sm:12,xl:6,children:e.jsxs(z,{className:"metric-card",children:[e.jsxs("div",{className:"metric-top",children:[e.jsx(S,{type:"secondary",children:t.label}),e.jsx("span",{className:"metric-icon",children:t.icon})]}),e.jsx(fe,{value:t.value,formatter:a=>t.value===void 0?"—":Number(a).toLocaleString()}),e.jsx(S,{type:"secondary",className:"metric-note",children:t.note})]})},t.label))})}function bt({data:n,bridge:t}){var c,l;const a=n.summary,s=[{title:"完善企业资料",text:"告诉 AI 你的产品、优势与市场",tab:"company",icon:e.jsx(ke,{})},{title:"发现潜在客户",text:"描述目标，创建小批量找客任务",tab:"discover",icon:e.jsx(Le,{})},{title:"筛选并核对",text:"检查企业匹配、岗位和邮箱",tab:"workbench",icon:e.jsx(vn,{})},{title:"开始商务对话",text:"审阅开发信，记录每一次推进",tab:"mail",icon:e.jsx(he,{})}];return e.jsxs("div",{className:"native-page",children:[e.jsx("div",{className:"overview-hero",children:e.jsxs("div",{children:[e.jsxs("h2",{children:["发现客户，",e.jsx("span",{className:"brand-highlight",children:"推进商机"})]}),e.jsx("p",{children:"按目标市场和产品找客户，核对来源后加入客户档案。"}),e.jsxs(M,{wrap:!0,children:[e.jsx(o,{type:"primary",icon:e.jsx(Be,{}),onClick:()=>$(t.navigate("discover")),children:"创建找客任务"}),e.jsx(o,{onClick:()=>$(t.navigate("workbench")),children:"进入客户工作台"})]})]})}),e.jsx(In,{items:[{label:"已保存客户",value:a==null?void 0:a.total,note:"你的独立客户管线",icon:e.jsx(qe,{})},{label:"到期待跟进",value:a==null?void 0:a.due_followups,note:"到期且允许联系的客户",icon:e.jsx(De,{})},{label:"正在洽谈",value:((c=a==null?void 0:a.stages)==null?void 0:c.negotiating)||(a?0:void 0),note:"持续推进中的商机",icon:e.jsx(we,{})},{label:"已成交",value:((l=a==null?void 0:a.stages)==null?void 0:l.won)||(a?0:void 0),note:"以实际记录为准",icon:e.jsx(re,{})}]}),e.jsxs(xn,{gutter:[20,20],children:[e.jsx(Fe,{xs:24,lg:15,children:e.jsxs(z,{title:"今天值得推进的事",children:[e.jsxs("div",{className:"next-action",children:[e.jsx("span",{className:"action-icon",children:e.jsx(De,{})}),e.jsxs("div",{children:[e.jsx(Ve,{level:4,children:a?a.due_followups?`${a.due_followups} 位客户等待下一次跟进`:"开始建立你的下一批商机":"正在加载业务概况"}),e.jsx(Z,{type:"secondary",children:a!=null&&a.due_followups?"先核对客户来源和沟通历史，再决定下一次联系。":"完善企业资料，创建找客任务，筛选值得对话的企业。"}),e.jsx(o,{type:"primary",onClick:()=>$(t.navigate(a!=null&&a.due_followups?"workbench":"discover")),children:a!=null&&a.due_followups?"查看待跟进客户":"发现新客户"})]})]}),e.jsxs("div",{className:"overview-note",children:[e.jsx(re,{})," ",a?`已停止联系 ${a.do_not_contact||0} 位客户；回复和成交数据以实际记录为准。`:"统计仅展示当前工作空间的数据。"]})]})}),e.jsx(Fe,{xs:24,lg:9,children:e.jsx(z,{title:"清晰的客户开发路径",children:e.jsx("div",{className:"workflow-list",children:s.map((p,v)=>e.jsxs("button",{onClick:()=>$(t.navigate(p.tab)),children:[e.jsx("span",{className:"workflow-icon",children:p.icon}),e.jsxs("span",{children:[e.jsx("b",{children:p.title}),e.jsx("small",{children:p.text})]}),e.jsx(ee,{})]},p.tab))})})})]})]})}function xt({contact:n,capabilities:t,bridge:a,onChange:s}){var b,I,w,j,T,y,E,g;const[c,l]=x.useState(!1),[p,v]=x.useState(!1),d=async()=>{v(!0);try{await a.post("/verifications",{prospect_id:n.prospect_id,email:n.email,confirm_external_check:!0},"verify"),l(!1),s()}catch{}finally{v(!1)}},r=((b=n.verification)==null?void 0:b.status)||"unverified";return e.jsxs(z,{size:"small",className:"contact-card",children:[e.jsxs(M,{wrap:!0,children:[e.jsx(S,{strong:!0,children:n.name||"公共 / 岗位未知入口"}),e.jsx(A,{children:((I=n.titles)==null?void 0:I.join(" / "))||"岗位未知"}),n.blocked&&e.jsx(A,{color:"red",children:"停止联系"})]}),e.jsx(Z,{copyable:n.email?{text:n.email}:!1,children:n.email||"暂无完整邮箱"}),e.jsxs(M,{wrap:!0,children:[e.jsx(A,{color:r==="valid"?"green":r==="invalid"?"red":"default",children:ue[r]}),((w=n.verification)==null?void 0:w.stale)&&e.jsx(A,{color:"orange",children:"验证超过 30 天"}),e.jsx(S,{type:"secondary",children:(j=n.role_match)==null?void 0:j.reason})]}),e.jsxs(Z,{type:"secondary",className:"contact-meta",children:["验证时间：",X((T=n.verification)==null?void 0:T.checked_at)," ·"," ",((y=n.verification)==null?void 0:y.history_count)||0," 次历史记录"]}),e.jsx(S,{type:"secondary",children:"供应商标记不替代独立验证，不保证送达。"}),((E=n.warnings)==null?void 0:E.length)>0&&e.jsx(R,{type:"warning",title:n.warnings.map(f=>({email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务 / 质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"})[f]||f).join("；"),showIcon:!0}),((g=n.sources)==null?void 0:g.length)>0&&e.jsx("div",{className:"contact-sources",children:n.sources.map((f,N)=>e.jsxs("div",{children:[e.jsx(Me,{href:f.source_url,children:f.source||"原始来源"}),e.jsxs(S,{type:"secondary",children:[" · ",X(f.observed_at)]}),f.source_job_id&&e.jsx(o,{type:"link",size:"small","data-job":f.source_job_id,children:"来源任务"})]},N))}),e.jsxs("div",{className:"verification-action",children:[e.jsx(se,{checked:c,disabled:!t.email_verification||!n.email,onChange:f=>l(f.target.checked),children:"同意将邮箱交给 ZeroBounce 验证，消耗供应商额度"}),e.jsx(o,{loading:p,disabled:!c||!t.email_verification||!n.email,onClick:()=>void d(),children:r==="unverified"?"验证邮箱":"重新验证并保留历史"})]})]})}function vt({id:n,initialTab:t,active:a,bridge:s,capabilities:c,prices:l,pointQuotes:p}){var K,le,be,oe,i,m,F,G,ce,de,Ue,He,Ke,Ye,Ge,We;const{message:v}=Ne.useApp(),[d,r]=x.useState(null),[b,I]=x.useState(""),[w,j]=x.useState(0),[T,y]=x.useState(t),[E,g]=x.useState(null),[f,N]=x.useState(null),[k,q]=x.useState(!1);x.useEffect(()=>{if(!a)return;let u=!1;return r(null),I(""),s.detail(n).then(B=>{u||r(B)}).catch(B=>{u||I(B.message)}),()=>{u=!0}},[n,s,w,a]);const h=d==null?void 0:d.prospect,P=(K=h==null?void 0:h.evidence)==null?void 0:K.source_record,Y=(le=P==null?void 0:P.details)==null?void 0:le.published_procurement_email,_=()=>j(u=>u+1),V=()=>{_(),$(s.refreshCustomers())};async function H(){q(!0);try{await s.applySourceContact(n,{expected_version:h.version,job_id:h.evidence.origin_job_id,value:Y}),V(),v.success("已采用公告邮箱并保留来源")}catch(u){v.error(u.message)}finally{q(!1)}}const D=(u,B,xe,ne=!1)=>e.jsxs(M,{wrap:!0,children:[u,e.jsx(o,{size:"small",type:"link",disabled:ne,onClick:()=>g(xe),children:B})]});return e.jsxs(e.Fragment,{children:[e.jsx(hn,{title:(h==null?void 0:h.name)||"客户详情",open:a,onClose:()=>s.closeCustomer(),size:720,className:"customer-drawer",footer:e.jsxs("div",{className:"drawer-footer-actions",children:[e.jsx(o,{onClick:()=>s.closeCustomer(),children:"关闭详情"}),e.jsx(o,{disabled:!h||h.do_not_contact,onClick:()=>g("draft"),children:"写开发信"}),e.jsx(o,{type:"primary",disabled:!h,onClick:()=>g("activity"),children:"记录跟进"})]}),extra:e.jsx(o,{icon:e.jsx(mn,{}),"aria-label":"刷新客户详情",disabled:!h,onClick:_,children:"刷新"}),children:b?e.jsx(R,{type:"error",title:"客户详情加载失败",description:b,action:e.jsx(o,{onClick:()=>j(u=>u+1),children:"重试"})}):d?e.jsx(e.Fragment,{children:e.jsx(dn,{activeKey:T,onChange:y,items:[{key:"profile",label:"客户资料",children:e.jsxs(e.Fragment,{children:[e.jsx(ie,{column:1,bordered:!0,size:"small",items:[{key:"stage",label:"销售阶段",children:D(e.jsx(A,{color:Cn[h.stage],children:pe[h.stage]}),"改阶段","stage")},{key:"location",label:"国家 / 地区",children:h.location||"待核实"},{key:"website",label:"官网",children:e.jsx(Me,{href:h.website,children:h.website||"未提供"})},{key:"contact",label:"商务联系方式",children:D(h.contact||"未提供","改联系方式","contact")},{key:"followup",label:"下次跟进",children:D(X(h.next_followup_at),"改跟进时间","next_followup_at",h.do_not_contact)},{key:"tags",label:"标签",children:D(h.tags.length?h.tags.map(u=>e.jsx(A,{children:u},u)):"未添加","改标签","tags")},{key:"contact-status",label:"联系状态",children:D(h.do_not_contact?e.jsx(A,{color:"red",children:"停止联系"}):"可跟进",h.do_not_contact?"恢复联系":"停止联系","do_not_contact")},{key:"source",label:"来源",children:e.jsx(Me,{href:(oe=(be=h.evidence)==null?void 0:be.source)==null?void 0:oe.url,children:((m=(i=h.evidence)==null?void 0:i.source)==null?void 0:m.title)||((G=(F=h.evidence)==null?void 0:F.source)==null?void 0:G.url)||"查看原始证据"})}]}),e.jsxs(z,{size:"small",title:"判断依据",className:"drawer-evidence",children:[e.jsx(Z,{children:((ce=h.evidence)==null?void 0:ce.reason)||((de=h.evidence)==null?void 0:de.source_note)||"暂无补充依据，请核对原始来源。"}),((Ue=h.evidence)==null?void 0:Ue.quote)&&e.jsx("blockquote",{children:h.evidence.quote}),P&&e.jsxs(Z,{children:[e.jsx(S,{strong:!0,children:P.title}),e.jsx("br",{}),"发布时间 ",((He=P.details)==null?void 0:He.published_at)||"未提供",e.jsx("br",{}),"截止日期 ",((Ye=(Ke=P.details)==null?void 0:Ke.deadline_dates)==null?void 0:Ye.join("、"))||"待核实",P.procurement_status==="expired"&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),"公告已截止，仅作历史参考。"]}),((Ge=P.details)==null?void 0:Ge.attribution)&&e.jsxs(e.Fragment,{children:[e.jsx("br",{}),P.details.attribution]})]}),Y&&e.jsx(R,{type:"info",title:`公告公开邮箱 ${Y}`,description:"采用前请核对采购主体、公告期限和联系用途。",action:e.jsx(o,{loading:k,onClick:()=>void H(),children:"已核对，采用公告邮箱"})}),e.jsx(R,{type:"info",title:"企业匹配、岗位匹配与邮箱有效性分别判断；历史信息不代表当前采购需求。"})]}),((We=d.duplicates)==null?void 0:We.length)>0&&e.jsx(z,{size:"small",title:"疑似关联 / 重复档案（尚未合并）",className:"drawer-evidence",children:d.duplicates.map(u=>e.jsxs(Z,{children:[e.jsx(S,{strong:!0,children:u.name}),e.jsx("br",{}),e.jsx(S,{type:"secondary",children:u.reason}),e.jsx(o,{type:"link",onClick:()=>$(s.openCustomer(u.id)),children:"打开档案核对"})]},u.id))})]})},{key:"contacts",label:`联系人 (${d.contacts.length})`,children:e.jsxs(e.Fragment,{children:[e.jsxs(M,{wrap:!0,className:"customer-contact-tools",children:[e.jsx(o,{onClick:()=>N("company"),children:"查企业与岗位"}),e.jsx(o,{onClick:()=>N("targeted"),children:"精准联系人检索"}),e.jsxs(o,{"data-research":n,children:["公域查证与找邮箱",l.report===void 0?"":` · ${l.report} 点`]})]}),d.contacts.length?e.jsx(M,{orientation:"vertical",className:"full-width",children:d.contacts.map((u,B)=>e.jsx(xt,{contact:u,capabilities:c,bridge:s,onChange:V},u.email+":"+B))}):e.jsx(ae,{description:"暂无联系人候选"}),d.savedContacts.map(u=>{var xe;const B=u.channels.filter(ne=>ne.channel!=="emails");return B.length>0&&e.jsxs(z,{size:"small",title:u.name,className:"drawer-evidence",children:[B.map((ne,qn)=>e.jsxs(Z,{copyable:!0,children:[{phones:"电话",websites:"网站",socials:"社媒"}[ne.channel]||"联系方式"," · ",ne.value]},qn)),e.jsxs(S,{type:"secondary",children:[(xe=u.titles)==null?void 0:xe.join(" / ")," · ",X(u.observed_at)]}),e.jsx(o,{type:"link","data-job":u.source_job_id,children:"来源任务"})]},u.id)})]})},{key:"history",label:"跟进与验证历史",children:!d.activities.length&&!d.records.length?e.jsx(ae,{image:ae.PRESENTED_IMAGE_SIMPLE,description:"暂无跟进或验证记录"}):e.jsx(cn,{items:[...d.activities.map(u=>({time:u.created_at,title:rn[u.kind]||"其他记录",content:["draft_requested","research_requested"].includes(u.kind)&&/^[a-f0-9]{32}$/.test(u.content)?e.jsx(o,{type:"link","data-job":u.content,children:"查看任务"}):u.content})),...d.records.map(u=>({time:u.created_at,title:{assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"}[u.kind]||u.kind,content:(u.kind==="followup"?`提醒时间：${X(u.data.due_at)} · ${u.data.objective||""}`:"")||(u.kind==="contact_event"?`${rn[u.data.type]||"联系事件"} · ${u.data.email||""}：${u.data.content||""}`:"")||u.data.reason||u.data.content||u.data.objective||ue[u.data.status]||u.data.status}))].sort((u,B)=>String(B.time).localeCompare(String(u.time))).map((u,B)=>({key:B,title:e.jsxs(e.Fragment,{children:[e.jsx(S,{strong:!0,children:u.title}),e.jsx("div",{children:e.jsx(S,{type:"secondary",children:X(u.time)})})]}),content:u.content}))})}]})}):e.jsx(pn,{active:!0,paragraph:{rows:10}})}),a&&h&&E&&e.jsx(et,{action:E,row:h,bridge:s,stages:pe,draftPrice:l.outreach_draft,onClose:()=>g(null),onSaved:u=>{g(null),E==="activity"&&y("history"),V(),v.success(u)}},E),a&&h&&f&&e.jsx(nt,{kind:f,row:h,bridge:s,pointQuotes:p,onClose:()=>N(null)})]})}const U=Oe;function jt({data:n,bridge:t}){var oe;const a=Bn.useBreakpoint(),s=n.workbench,c=s.summary,[l,p]=x.useState(s.filters||U),[v,d]=x.useState(!1),[r,b]=x.useState(!1),[I,w]=x.useState(""),[j,T]=x.useState(!1),[y,E]=x.useState(dt),g=y.columns,f=i=>E(m=>({...m,columns:i}));x.useEffect(()=>pt(y),[y]);const[N,k]=x.useState(null),q=s.filters||U,h=q.mode==="contacts",P=JSON.stringify(q),Y=!an(l,q),_=ct(q,pe,ue),V=(s.views||[]).findIndex(i=>an(i.data,q)),H=i=>{const m={...Ce(q),[i]:U[i]};p(m),K(m)};x.useEffect(()=>{p({...U,...q})},[P]);const D=(i,m)=>p(F=>({...F,[i]:m})),K=(i=l)=>$(t.filter(i)),le=[{key:"company",title:"企业名称",dataIndex:"name",width:250,fixed:a.md?"left":void 0,render:(i,m)=>{var F;return e.jsxs("div",{className:"company-cell",children:[e.jsx(un,{shape:"square",className:"company-avatar",children:String(i).slice(0,1).toUpperCase()}),e.jsxs("div",{children:[e.jsx(o,{type:"link",onClick:()=>$(t.openCustomer(m.id)),children:i}),e.jsx(S,{type:"secondary",children:m.blocked?"存在停止联系记录":m.next_action}),((F=m.duplicates)==null?void 0:F.length)>0&&e.jsxs(A,{color:"orange",children:["疑似关联 ",m.duplicates.length," 份"]})]})]})}},{key:"location",title:"国家 / 地区",dataIndex:"country",width:135,render:i=>i||"待核实"},{key:"stage",title:"销售阶段",dataIndex:"stage",width:115,render:i=>e.jsx(A,{color:Cn[i],children:pe[i]||i})},{key:"contacts",title:"联系信息",width:170,render:(i,m)=>e.jsxs("div",{children:[e.jsxs("span",{children:[m.email_count," 个完整邮箱"]}),e.jsx("br",{}),e.jsxs(S,{type:"secondary",children:[m.contact_count," 条入口 · ",m.verified_count," 个验证有效"]})]})},{key:"assessment",title:"企业匹配",width:140,render:(i,m)=>{var F,G;return e.jsx(A,{color:((F=m.assessment)==null?void 0:F.status)==="fit"?"green":"default",children:{fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"}[(G=m.assessment)==null?void 0:G.status]||"待核实"})}},{key:"action",title:"操作",width:210,fixed:a.md?"right":void 0,render:(i,m)=>e.jsxs(M,{size:0,children:[e.jsx(o,{type:"link",onClick:()=>$(t.openCustomer(m.id)),children:"详情"}),e.jsx(o,{type:"link",onClick:()=>$(t.openCustomer(m.id,"contacts")),children:"查联系人"}),e.jsx(o,{type:"link",onClick:()=>k({kind:"review",row:m}),children:"评审"})]})}],be=[{key:"company",title:"联系人 / 企业",width:240,fixed:a.md?"left":void 0,render:(i,m)=>e.jsxs("div",{children:[e.jsx(o,{type:"link",onClick:()=>$(t.openCustomer(m.prospect_id,"contacts")),children:m.name||"公共 / 岗位未知入口"}),e.jsx("br",{}),e.jsx(S,{type:"secondary",children:m.company})]})},{key:"email",title:"邮箱",dataIndex:"email",width:240,render:(i,m)=>e.jsxs(e.Fragment,{children:[e.jsx(S,{copyable:i?{text:i}:!1,children:i||"暂无完整邮箱"}),m.blocked&&e.jsx(A,{color:"red",children:"停止联系"})]})},{key:"role",title:"岗位判断",width:240,render:(i,m)=>{var F,G;return e.jsxs(e.Fragment,{children:[e.jsx("div",{children:((F=m.titles)==null?void 0:F.join(" / "))||"岗位未知"}),e.jsx(S,{type:"secondary",children:(G=m.role_match)==null?void 0:G.reason})]})}},{key:"verification",title:"独立邮箱验证",width:180,render:(i,m)=>{var F,G,ce,de;return e.jsxs(e.Fragment,{children:[e.jsx(A,{color:((F=m.verification)==null?void 0:F.status)==="valid"?"green":((G=m.verification)==null?void 0:G.status)==="invalid"?"red":"default",children:ue[(ce=m.verification)==null?void 0:ce.status]||"未知"}),((de=m.verification)==null?void 0:de.stale)&&e.jsx("div",{children:e.jsx(S,{type:"warning",children:"验证超过 30 天"})})]})}},{key:"action",title:"操作",width:150,fixed:a.md?"right":void 0,render:(i,m)=>e.jsxs(M,{size:0,children:[e.jsx(o,{type:"link",onClick:()=>$(t.openCustomer(m.prospect_id,"contacts")),children:"详情 / 验证"}),e.jsx(o,{type:"link",onClick:()=>k({kind:"event",row:m}),children:"记录"})]})}];return e.jsxs("div",{className:"native-page workbench-page",children:[e.jsx(In,{items:[{label:"企业档案",value:c==null?void 0:c.companies,note:"当前工作空间独立档案",icon:e.jsx(ke,{})},{label:"有完整邮箱的企业",value:c==null?void 0:c.companies_with_email,note:"联系信息仍需核实",icon:e.jsx(he,{})},{label:"去重邮箱",value:c==null?void 0:c.unique_mailboxes,note:"按邮箱去重统计",icon:e.jsx(we,{})},{label:"近期验证有效",value:c==null?void 0:c.verified_mailboxes,note:"独立验证，不保证送达",icon:e.jsx(re,{})}]}),e.jsxs(z,{className:"workbench-card",children:[e.jsxs("div",{className:"table-heading",children:[e.jsxs("div",{children:[e.jsx(Ve,{level:4,children:"客户资源"}),e.jsx(S,{type:"secondary",children:"企业、岗位与邮箱，分开核对，集中推进。"})]}),e.jsxs(M,{wrap:!0,children:[e.jsx(Je,{title:"按公司名、销售阶段和到期跟进条件导出",children:e.jsx(o,{onClick:()=>$(t.exportCustomers()),children:"导出客户 CSV"})}),e.jsx(o,{icon:e.jsx(On,{"aria-hidden":"true"}),onClick:()=>{var m;const i=(m=document.querySelector("#wb-upload"))==null?void 0:m.closest("details");i&&(i.open=!0,i.scrollIntoView({behavior:"smooth",block:"center"}))},children:"导入名单"}),e.jsx(o,{type:"primary",icon:e.jsx(Be,{}),onClick:()=>$(t.navigate("discover")),children:"发现客户"})]})]}),e.jsxs("div",{className:"workbench-tabs",children:[e.jsx(Xe,{value:l.mode,options:[{value:"companies",label:"企业视图",icon:e.jsx(ke,{})},{value:"contacts",label:"联系人视图",icon:e.jsx(we,{})}],onChange:i=>{const m={...l,mode:i};p(m),K(m)}}),e.jsx(O,{"aria-label":"应用已保存视图",placeholder:"已保存的筛选视图",allowClear:!0,className:"saved-view-select",value:V>=0?V:void 0,options:(s.views||[]).map((i,m)=>({label:i.data.name,value:m})),onChange:i=>{i!==void 0?$(t.applyView(i)):(p({...U}),K({...U}))}})]}),e.jsxs("form",{"data-extension":"react",className:"react-filter",onSubmit:i=>{i.preventDefault(),K()},children:[e.jsxs("div",{className:"filter-main",children:[e.jsx(L,{prefix:e.jsx(Le,{}),"aria-label":"搜索企业、姓名或邮箱",placeholder:"搜索企业、姓名或邮箱",maxLength:200,allowClear:!0,value:l.q,onClear:()=>{const i={...l,q:""};p(i),K(i)},onChange:i=>D("q",i.target.value)}),e.jsx(L,{"aria-label":"国家或地区",placeholder:"国家 / 地区",maxLength:100,value:l.country_filter,onChange:i=>D("country_filter",i.target.value)}),e.jsx(O,{"aria-label":"销售阶段",value:l.stage,options:[{value:"",label:"全部销售阶段"},...te(pe)],onChange:i=>D("stage",i)}),e.jsx(o,{htmlType:"submit",type:"primary",icon:e.jsx(Le,{"aria-hidden":"true"}),loading:n.loading,children:"查询"}),e.jsx(o,{icon:e.jsx(vn,{}),"aria-expanded":v,"aria-controls":"advanced-customer-filters",onClick:()=>d(i=>!i),children:v?"收起筛选":"更多筛选"})]}),v&&e.jsxs("div",{className:"advanced-filters",id:"advanced-customer-filters",children:[e.jsxs("label",{children:["标签",e.jsx(L,{maxLength:40,value:l.tag,onChange:i=>D("tag",i.target.value)})]}),e.jsxs("label",{children:["目标岗位",e.jsx(O,{"aria-label":"目标岗位",value:l.target,options:te({procurement:"采购 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发"}),onChange:i=>D("target",i)})]}),e.jsxs("label",{children:["邮箱验证",e.jsx(O,{"aria-label":"独立邮箱验证",value:l.verification,options:[{value:"",label:"全部状态"},...te(ue)],onChange:i=>D("verification",i)})]}),e.jsxs("label",{children:["岗位判断",e.jsx(O,{"aria-label":"岗位判断",value:l.role_filter,options:te({"":"全部岗位",keyword_match:"命中目标关键词",needs_review:"未命中，待核实",unknown:"岗位未知"}),onChange:i=>D("role_filter",i)})]})]}),e.jsxs("div",{className:"filter-bottom",children:[e.jsxs(M,{wrap:!0,children:[e.jsx(se,{checked:l.has_email,onChange:i=>D("has_email",i.target.checked),children:"有完整邮箱"}),e.jsx(se,{checked:l.due,onChange:i=>D("due",i.target.checked),children:"到期跟进"}),v&&e.jsx(se,{checked:l.ready_only,onChange:i=>D("ready_only",i.target.checked),children:"已评审、岗位匹配且邮箱近期有效"})]}),e.jsxs(M,{children:[e.jsx(o,{type:"text",onClick:()=>{p({...U}),K({...U})},children:"重置"}),e.jsx(o,{type:"link",disabled:Y||n.loading,title:Y?"请先应用筛选条件，再保存视图":void 0,onClick:()=>b(!0),children:"保存当前筛选"})]})]})]}),Y&&e.jsxs("div",{className:"filter-draft-notice",role:"status",children:[e.jsx(S,{children:"筛选条件已修改，列表仍显示上次查询结果。"}),e.jsx(o,{size:"small",type:"primary",onClick:()=>K(),disabled:n.loading,children:"应用修改"}),e.jsx(o,{size:"small",type:"text",onClick:()=>p({...U,...q}),children:"撤销修改"})]}),_.length>0&&e.jsxs("div",{className:"applied-filters","aria-label":"已应用筛选",children:[e.jsx(S,{type:"secondary",children:"已应用"}),_.map(i=>e.jsx(A,{closable:!n.loading,onClose:()=>H(i.key),title:i.label,children:i.label},i.key)),e.jsx(o,{type:"link",size:"small",onClick:()=>{p({...U}),K({...U})},children:"清空筛选"})]}),n.workbenchError&&e.jsx(R,{type:"error",title:"客户工作台加载失败",description:n.workbenchError,showIcon:!0,action:e.jsxs(M,{wrap:!0,children:[e.jsx(o,{onClick:()=>$(t.refresh()),children:"重试"}),n.workbenchError.includes("暂不可用")&&e.jsx(o,{href:"?legacy=true#customers",children:"打开兼容版客户列表"})]})}),e.jsxs("div",{className:"table-status",children:[e.jsxs(M,{wrap:!0,children:[e.jsxs(S,{type:"secondary","aria-live":"polite",children:["共 ",s.total||0," 条记录"]}),s.lastLoadedAt&&e.jsxs(S,{type:"secondary",className:"last-updated",children:["更新于"," ",new Date(s.lastLoadedAt).toLocaleTimeString("zh-CN",{hour12:!1})]}),((oe=s.selected)==null?void 0:oe.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(A,{color:"blue",children:["已选 ",s.selected.length," 家企业"]}),e.jsx(o,{type:"link",size:"small",onClick:()=>k({kind:"followup",ids:s.selected}),children:"安排跟进"}),e.jsx(o,{type:"text",size:"small",onClick:()=>t.select([]),children:"取消选择"})]})]}),e.jsxs(M,{wrap:!0,className:"display-controls",children:[e.jsx(Je,{title:"调整表格行间距",children:e.jsx(Xe,{"aria-label":"表格密度",size:"small",value:y.density,options:[{value:"comfortable",label:"舒适"},{value:"compact",label:"紧凑"}],onChange:i=>E(m=>({...m,density:i}))})}),!h&&e.jsx(O,{mode:"multiple","aria-label":"显示的表格列",value:g,onChange:f,maxTagCount:0,maxTagPlaceholder:()=>"列设置",className:"column-select",options:le.map(i=>({value:String(i.key),label:i.title,disabled:["company","action"].includes(String(i.key))}))})]})]}),!a.md&&e.jsx("div",{className:"table-scroll-hint",children:"左右滑动表格查看更多字段，点击名称打开详情。"}),e.jsx(jn,{size:y.density==="compact"?"small":"middle",columns:h?be:le.filter(i=>g.includes(String(i.key))),dataSource:n.workbenchError||s.loadedMode!==q.mode?[]:s.items||[],rowKey:i=>h?`${i.prospect_id}:${i.email}:${i.name}`:i.id,loading:n.loading,scroll:{x:h?1100:1050,y:"min(58vh, 640px)"},rowSelection:{selectedRowKeys:(s.items||[]).filter(i=>{var m;return(m=s.selected)==null?void 0:m.includes(h?i.prospect_id:i.id)}).map(i=>h?`${i.prospect_id}:${i.email}:${i.name}`:i.id),onChange:(i,m)=>t.select([...new Set(m.map(F=>h?F.prospect_id:F.id))])},locale:{emptyText:e.jsx(ae,{image:ae.PRESENTED_IMAGE_SIMPLE,description:n.workbenchError?"数据暂时无法加载":_.length?"没有符合当前条件的客户":"还没有客户档案",children:e.jsx(o,{onClick:()=>{n.workbenchError?$(t.refresh()):_.length?(p({...U}),K({...U})):$(t.navigate("discover"))},children:n.workbenchError?"重新加载":_.length?"清空筛选":"发现第一批客户"})})},pagination:{current:Math.floor((s.offset||0)/30)+1,pageSize:30,total:s.total||0,showSizeChanger:!1,showTotal:i=>`共 ${i} 条`,onChange:i=>$(t.filter(q,(i-1)*30))}}),e.jsxs("div",{className:"table-footnote",children:[e.jsx(re,{})," ","企业匹配、岗位匹配与邮箱验证分别判断；疑似重复档案尚未合并。"]})]}),N&&e.jsx(Zn,{action:N,bridge:t,onClose:()=>k(null),onSaved:()=>$(t.refresh())}),e.jsxs(J,{title:"保存当前筛选视图",open:r,onCancel:()=>{j||b(!1)},keyboard:!j,maskClosable:!j,confirmLoading:j,onOk:()=>{I.trim()&&(T(!0),t.saveView(I.trim()).then(()=>{b(!1),w("")}).catch(()=>{}).finally(()=>T(!1)))},okButtonProps:{disabled:!I.trim()||Y},okText:"保存视图",children:[e.jsx(Z,{type:"secondary",children:"保存已应用到列表的筛选条件，便于下次快速打开。"}),e.jsx(L,{"aria-label":"筛选视图名称",autoFocus:!0,value:I,maxLength:80,placeholder:"例如：美国采购岗位待核查",onChange:i=>w(i.target.value)})]})]})}function yt({data:n,bridge:t}){const[a,s]=x.useState(""),[c,l]=x.useState(""),p={prospecting:"发现客户",outreach_draft:"开发信草稿",report:"客户报告",source_lookup:"官方情报查询",public_search:"公开检索",directory_companies:"企业查询",directory_people:"人物与岗位",directory_contacts:"联系方式解锁",targeted_contacts:"精准联系人检索",buyer_search:"采购商匹配",buyer_profile:"企业资料",buyer_contacts:"联系方式",customs_verification:"贸易核验",trade_search:"历史贸易"},v={queued:"排队中",running:"执行中",cancelling:"取消中",succeeded:"已完成",partial:"部分完成",failed:"失败",cancelled:"已取消"},d=n.jobs.filter(r=>(!a||r.operation===a)&&(!c||r.status===c));return e.jsx("div",{className:"native-page",children:e.jsxs(z,{title:"任务记录",extra:e.jsx(o,{type:"primary",icon:e.jsx(Be,{}),onClick:()=>$(t.navigate("discover")),children:"创建任务"}),children:[e.jsxs("div",{className:"task-filter",children:[e.jsx(O,{"aria-label":"任务类型",value:a,options:[{value:"",label:"全部任务类型"},...te(p)],onChange:s}),e.jsx(O,{"aria-label":"任务状态",value:c,options:[{value:"",label:"全部状态"},...te(v)],onChange:l}),e.jsxs(S,{type:"secondary",children:["最近 ",n.jobs.length," 个任务中，显示 ",d.length," 个"]})]}),e.jsx(jn,{rowKey:"id",dataSource:d,loading:n.loading,scroll:{x:750},pagination:{pageSize:15,showSizeChanger:!1},columns:[{title:"任务类型",dataIndex:"operation",render:(r,b)=>e.jsx(o,{type:"link","data-job":b.id,children:p[r]||r})},{title:"状态",dataIndex:"status",render:r=>e.jsx(Vn,{status:r==="succeeded"?"success":r==="running"?"processing":r==="failed"?"error":r==="partial"?"warning":"default",text:v[r]||r})},{title:"创建时间",dataIndex:"created_at",render:X},{title:"已结算点数",dataIndex:"points_charged",render:r=>Number(r||0).toLocaleString()},{title:"操作",render:(r,b)=>e.jsx(o,{type:"link","data-job":b.id,children:"查看详情"})}],locale:{emptyText:e.jsx(ae,{description:"暂无符合条件的任务"})}}),e.jsx(S,{type:"secondary",children:"执行中的任务每 5 秒更新。部分完成的任务请查看已交付结果及缺失说明。"})]})})}const Te=[{key:"my-overview",label:ge["my-overview"],icon:e.jsx(bn,{})},{key:"customers-opportunities",label:"客户与商机",icon:e.jsx(qe,{})},{key:"orders-payments",label:"订单与收款",icon:e.jsx(Se,{})},{key:"protection-funding",label:"保障与资金",icon:e.jsx(Ie,{})},{key:"ai-capabilities",label:"AI能力",icon:e.jsx(zn,{})}];function ft({bridge:n}){return e.jsx(z,{title:"可用能力",className:"section-home-card",children:e.jsxs("div",{className:"workflow-list",children:[e.jsxs("button",{type:"button",onClick:()=>$(n.navigate("discover")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(Pe,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 发现客户"}),e.jsx("small",{children:"根据产品和目标市场建立找客任务"})]}),e.jsx(ee,{})]}),e.jsxs("button",{type:"button",onClick:()=>$(n.navigate("mail")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(he,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 开发信"}),e.jsx("small",{children:"查看和审阅开发信草稿"})]}),e.jsx(ee,{})]})]})})}function gt(){var Y;const{message:n}=Ne.useApp(),[t,a]=x.useState(null),[s,c]=x.useState(null),[l,p]=x.useState(""),[v,d]=x.useState(!1),[r,b]=x.useState(!1),[I,w]=x.useState(!1);x.useEffect(()=>{const _=()=>{window.voken&&c(window.voken.snapshot())},V=H=>{const D=H.detail;n.open({type:D.error?"error":"success",content:D.message,duration:6})};return window.addEventListener(Qe,_),window.addEventListener("voken:message",V),Wn().then(H=>{a(H),c(H.snapshot())}).catch(H=>p(H.message)),()=>{window.removeEventListener(Qe,_),window.removeEventListener("voken:message",V)}},[n]);const j=(s==null?void 0:s.tab)||"my-overview",T=Te.find(({key:_})=>_===j||j==="costs"&&_==="my-overview")??Te[1],y=T.key==="customers-opportunities",E=["my-overview","orders-payments","protection-funding","ai-capabilities"].includes(j),g=mt[j]||(j==="job-view"?"核对任务结果与来源，准备下一步业务行动。":void 0),f=(_,V=!0)=>{t&&j!==_&&$(t.navigate(_)),V&&w(!1)},N=()=>{var _;(_=document.getElementById("logout"))==null||_.click(),w(!1)},k=e.jsx("nav",{className:"workspace-sections","aria-label":"一级导航",children:Te.map(({key:_,label:V,icon:H})=>e.jsx(o,{type:"text",icon:e.jsx("span",{"aria-hidden":"true",className:"workspace-section-icon",children:H}),"aria-current":_===T.key?"true":void 0,onClick:()=>{_==="customers-opportunities"?y?r||d(!1):f("workbench",!r):f(_)},children:V},_))}),q=[{key:"overview",icon:e.jsx(bn,{}),label:"业务概况"},{type:"group",label:"客户开发",children:[{key:"discover",icon:e.jsx(Pe,{}),label:"发现客户"},{key:"workbench",icon:e.jsx(qe,{}),label:"客户工作台"},{key:"jobs",icon:e.jsx(Un,{}),label:"任务管理"}]},{type:"group",label:"业务工具",children:[{key:"directory",icon:e.jsx(Hn,{}),label:"企业与联系人"},{key:"sources",icon:e.jsx(Kn,{}),label:"商业情报"},{key:"mail",icon:e.jsx(he,{}),label:"邮件管理"},{key:"company",icon:e.jsx(ke,{}),label:"企业资料"}]}],h=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"workspace-label",children:"客户与商机"}),e.jsx(Pn,{"aria-label":"客户与商机导航",theme:"light",mode:"inline",selectedKeys:[j==="job-view"?"jobs":j],items:q,onClick:({key:_})=>f(_)})]}),P=e.jsx("div",{className:"sidebar-bottom",children:e.jsxs("button",{className:"points-entry","aria-label":`${(s==null?void 0:s.balance)||"— 点数"}，用量与费用`,onClick:()=>f("costs"),children:[e.jsx(ze,{}),e.jsxs("span",{children:[e.jsx("b",{children:(s==null?void 0:s.balance)||"— 点数"}),e.jsx("small",{children:"用量与费用"})]}),e.jsx(ee,{})]})});return e.jsxs(e.Fragment,{children:[e.jsx("div",{id:"toast",role:"status","aria-live":"polite",hidden:!0}),e.jsx(ht,{ready:!!t}),l&&e.jsx("div",{className:"startup-error",children:e.jsx(R,{type:"error",title:l,action:e.jsx(o,{onClick:()=>location.reload(),children:"重新加载"})})}),e.jsx("div",{id:"workspace",className:`react-workspace${y?" has-customer-menu":""}`,hidden:!0,children:e.jsxs(Ee,{children:[e.jsxs("aside",{className:"primary-sidebar",children:[e.jsx("div",{className:"primary-brand",children:e.jsx(Sn,{compact:!0})}),k,e.jsx(o,{className:"primary-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Ze,{}),onClick:N})]}),e.jsx(Ee.Sider,{className:"voken-sidebar",width:216,collapsedWidth:68,collapsed:v,breakpoint:"lg",onBreakpoint:b,trigger:null,children:y&&!r&&e.jsxs(e.Fragment,{children:[h,P]})}),e.jsxs(Ee,{className:`main-layout ${v?"is-collapsed":""}`,children:[e.jsxs("header",{className:"workspace-topbar",children:[e.jsxs(M,{children:[(r||y)&&e.jsx(o,{type:"text","aria-label":r?"打开导航":v?"展开导航":"收起导航",icon:v||r?e.jsx(Ln,{}):e.jsx(Rn,{}),onClick:()=>r?w(!0):d(_=>!_)}),e.jsx(Mn,{items:[{title:"工作空间"},{title:T.label},...T.label===ge[j]?[]:[{title:ge[j]}]]})]}),e.jsxs(M,{children:[e.jsx(A,{className:"workspace-tag",icon:e.jsx(re,{}),children:"独立业务空间"}),e.jsx(un,{size:32,className:"user-avatar",children:"微"})]})]}),e.jsxs("main",{className:"workspace-content",children:[e.jsxs("div",{className:"react-page-header",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"page-title",tabIndex:-1,children:ge[j]||"业务概况"}),g&&e.jsx(S,{type:"secondary",children:g})]}),e.jsxs(M,{wrap:!0,className:"page-header-actions",children:[t&&(s==null?void 0:s.customerId)&&["directory","job-view","jobs"].includes(j)&&e.jsx(o,{icon:e.jsx(ee,{"aria-hidden":"true",rotate:180}),onClick:()=>$(t.navigate("workbench")),children:"返回客户详情"}),e.jsx(o,{id:"refresh",hidden:E&&j!=="my-overview","aria-label":"刷新当前页面数据",icon:e.jsx(mn,{spin:s==null?void 0:s.loading}),disabled:!t||(s==null?void 0:s.loading),children:"刷新数据"})]})]}),t&&(s==null?void 0:s.session)&&e.jsxs("div",{children:[e.jsx(ot,{data:s,bridge:t}),j==="ai-capabilities"&&e.jsx(ft,{bridge:t}),j==="overview"&&e.jsx(bt,{data:s,bridge:t})," ",j==="workbench"&&e.jsx(jt,{data:s,bridge:t})," ",j==="jobs"&&e.jsx(yt,{data:s,bridge:t}),s.customerId&&e.jsx(vt,{id:s.customerId,initialTab:s.customerTab,active:j==="workbench",bridge:t,capabilities:s.workbench.capabilities||{},prices:s.prices||{},pointQuotes:s.pointQuotes||{}},s.customerId)]},((Y=s.session)==null?void 0:Y.workspace_id)||"signed-out"),e.jsx(Nn,{html:Yn,className:"business-pages"}),e.jsxs("div",{className:"compat-controls","aria-hidden":"true",hidden:!0,children:[e.jsx("details",{id:"tools-nav"}),e.jsx("button",{id:"balance"}),e.jsx("button",{id:"logout"})]}),e.jsxs("footer",{className:"workspace-footer",children:[e.jsx("span",{children:"微元 Voken · 让客户开发更进一步"}),e.jsx("span",{children:"公开信息优先，增强由你选择"})]})]})]})]})}),e.jsxs(hn,{title:"工作空间导航",placement:"left",open:I&&r&&!!(s!=null&&s.session),onClose:()=>w(!1),className:"mobile-navigation",size:300,children:[k,y&&h,P,e.jsx(o,{className:"mobile-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Ze,{}),onClick:N,children:"退出登录"})]})]})}var on;const ln=(on=document.querySelector('meta[name="csp-nonce"]'))==null?void 0:on.content;En.createRoot(document.getElementById("root")).render(e.jsx(Dn,{locale:Fn,csp:ln?{nonce:ln}:void 0,theme:{token:{colorPrimary:"#2457e7",colorText:"#10224b",colorTextSecondary:"#5a6884",colorBgLayout:"#f7f9fd",colorBorderSecondary:"#e9edf6",borderRadius:8,fontFamily:'Inter, "Microsoft YaHei", "PingFang SC", sans-serif',fontSize:14,controlHeight:38},components:{Layout:{siderBg:"#ffffff",headerBg:"#ffffff"},Menu:{itemHeight:44,itemMarginBlock:5,itemBorderRadius:8,itemSelectedBg:"#eef3ff"},Table:{headerBg:"#f8faff",cellPaddingBlock:16},Card:{paddingLG:24}}},children:e.jsx(Ne,{children:e.jsx(gt,{})})}));
