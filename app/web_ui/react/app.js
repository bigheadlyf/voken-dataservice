import{r as b,j as e,c as We}from"./react-vendor-ovhI6CXq.js";import{A as ue,F as R,M as Ae,a as B,T as le,S as F,I as $,D as Ye,B as p,C as Je,z as Ze,b as Xe,R as Qe,c as Te,d as en,L as ie,e as I,f as nn,g as tn,h as an,i as w,j as U,k as Le,l as Re,m as $e,n as rn,o as ze,p as oe,q as te,r as sn,s as ln,t as me,u as Z,v as ae,w as re,x as he,y as we,E as Fe,G as ce,H as P,J as on,K as cn,N as ke,O as Me,P as ee,Q as dn,U as De,V as K,W as pn,X as un,Y as mn,Z as hn,_ as bn,$ as vn}from"./antd-vendor-DUugD1BP.js";const xn=`        <section id="overview" class="tab-panel">\r
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
                    增强发现 · 公开搜索 + 跨境魔方\r
                  </option>\r
                  <option value="enhanced_contacts">增强发现 · 优先补前2家企业的联系方式</option>\r
                </select></label\r
              ><label class="check"\r
                ><input name="ted" type="checkbox" />同时查近 90 天 TED\r
                官方招标（原生接口无单次数据费；仍须核对时效及投标资格）</label\r
              ><label class="check" id="paid-label" hidden\r
                ><input name="paid" type="checkbox" />同意预占最多 600\r
                数据点（对应 ¥6\r
                数据预算），另加下方平台点数。按明确回传费用结算并释放差额，异常回传不向钱包追加扣点。</label\r
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
`,yn=`        <details id="register-panel">\r
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
`,_e="voken:updated";function fn(){const n=window.location.pathname;return n.endsWith("/app")||n.endsWith("/app/")?n.replace(/\/app\/?$/,"/app-assets/"):"/app-assets/"}let Q;function jn(){return Q||(window.__VOKEN_REACT__=!0,Q=(async()=>{for(const n of["auth","workspace","login-form","logout","balance","refresh","wb-filter","company-form","discovery-form"])if(!document.getElementById(n))throw new Error("界面初始化未完成，请刷新重试。");for(const n of["app.js","account.js","discovery.js","directory.js","workbench.js","react-bridge.js"])await new Promise((a,r)=>{const s=document.createElement("script");s.src=fn()+n+"?v="+(new URL(import.meta.url).searchParams.get("v")||"development");const l=()=>window.removeEventListener("error",c),c=d=>{d.filename&&d.filename.split("?")[0]===s.src.split("?")[0]&&(l(),r(new Error("界面资源初始化失败，请刷新重试。")))};window.addEventListener("error",c),s.onload=()=>{l(),a()},s.onerror=()=>{l(),r(new Error("界面资源加载失败，请刷新重试。"))},document.head.appendChild(s)});return window.voken})(),Q)}function gn({action:n,bridge:a,onClose:r,onSaved:s}){var j,E;const{message:l}=ue.useApp(),[c]=R.useForm(),[d,f]=b.useState(!1),[q,u]=b.useState(""),m=R.useWatch("type",c),L=n.kind==="review"?"记录企业匹配评审":n.kind==="event"?"记录联系进展":`为 ${((j=n.ids)==null?void 0:j.length)||0} 家企业安排跟进`;async function k(y){var N;if(!d){f(!0),u("");try{n.kind==="review"?await a.post("/assessments",{prospect_id:n.row.id,status:y.status,reason:y.reason.trim()}):n.kind==="event"?await a.post("/events",{prospect_id:n.row.prospect_id,email:((N=y.email)==null?void 0:N.trim())||"",type:y.type,content:y.content.trim(),source:"user_recorded"},"event"):(await a.post("/followups",{prospect_ids:n.ids,due_at:y.due_at.toISOString(),intervals_days:(y.intervals||"").split(/[,，]/).filter(h=>h.trim()).map(Number),objective:y.objective.trim()},"followup"),a.select([])),r(),l.success(n.kind==="review"?"企业评审已保存":n.kind==="event"?"联系进展已记录":"跟进提醒已安排"),s()}catch(h){u(h.message)}finally{f(!1)}}}return e.jsxs(Ae,{title:L,open:!0,onCancel:()=>{d||r()},maskClosable:!d,keyboard:!d,closable:!d,footer:null,children:[q&&e.jsx(B,{type:"error",title:q,showIcon:!0,className:"modal-error"}),e.jsxs(R,{form:c,layout:"vertical",disabled:d,scrollToFirstError:{focus:!0},"data-extension":"react",onFinish:y=>void k(y),initialValues:{status:"unknown",type:"reply",email:((E=n.row)==null?void 0:E.email)||""},children:[n.kind==="review"&&e.jsxs(e.Fragment,{children:[e.jsxs(le.Paragraph,{type:"secondary",children:[n.row.name," · 新增独立评审记录，并保留原始证据。"]}),e.jsx(R.Item,{name:"status",label:"企业匹配判断",rules:[{required:!0}],children:e.jsx(F,{options:[{value:"fit",label:"符合目标客户画像"},{value:"not_fit",label:"不符合"},{value:"unknown",label:"依据不足，待核实"}]})}),e.jsx(R.Item,{name:"reason",label:"理由与来源证据",rules:[{required:!0,whitespace:!0,message:"请填写判断理由与证据"}],children:e.jsx($.TextArea,{maxLength:1e3,rows:4,showCount:!0,placeholder:"说明企业角色、产品匹配与判断依据"})})]}),n.kind==="event"&&e.jsxs(e.Fragment,{children:[e.jsxs(le.Paragraph,{type:"secondary",children:[n.row.company," · ",n.row.name||"已记录的联系入口"]}),e.jsx(R.Item,{name:"type",label:"事件类型",rules:[{required:!0}],children:e.jsx(F,{options:[{value:"reply",label:"收到回复"},{value:"bounce",label:"退信"},{value:"opt_out",label:"拒绝联系"},{value:"meeting",label:"会议"},{value:"note",label:"备注"}]})}),e.jsx(R.Item,{name:"email",label:"事件关联邮箱",rules:[{required:["bounce","opt_out"].includes(m),message:"退信或拒绝联系时请填写事件邮箱"},{type:"email",message:"请输入有效邮箱"}],children:e.jsx($,{type:"email",maxLength:254})}),e.jsx(R.Item,{name:"content",label:"联系进展",rules:[{required:!0,whitespace:!0,message:"请填写联系进展"}],children:e.jsx($.TextArea,{maxLength:4e3,rows:4,showCount:!0})}),e.jsx(B,{type:"info",title:"退信与拒绝联系会拦截后续发送；收到回复会暂停后续提醒。"})]}),n.kind==="followup"&&e.jsxs(e.Fragment,{children:[e.jsx(R.Item,{name:"due_at",label:"首次提醒时间（本地时间）",rules:[{required:!0,message:"请选择首次提醒时间"}],children:e.jsx(Ye,{showTime:{format:"HH:mm"},format:"YYYY-MM-DD HH:mm",placeholder:"选择提醒时间",className:"full-width"})}),e.jsx(R.Item,{name:"intervals",label:"后续提醒（相对首次的天数）",rules:[{validator:(y,N)=>{const h=String(N||"").split(/[,，]/).filter(v=>v.trim()).map(Number);return h.length<=5&&h.every(v=>Number.isInteger(v)&&v>=1&&v<=90)&&new Set(h).size===h.length&&h.every((v,_)=>_===0||v>h[_-1])?Promise.resolve():Promise.reject(new Error("最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔"))}}],children:e.jsx($,{placeholder:"例如：3,7,14"})}),e.jsx(R.Item,{name:"objective",label:"跟进目标",rules:[{required:!0,whitespace:!0,message:"请填写跟进目标"}],children:e.jsx($.TextArea,{rows:3,maxLength:500,showCount:!0,placeholder:"例如：核对采购职责，审阅并准备第一封开发信"})}),e.jsx(B,{type:"info",title:"这里只安排提醒。每封邮件仍需单独审阅确认后发送。"})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(p,{onClick:r,disabled:d,children:"取消"}),e.jsx(p,{type:"primary",htmlType:"submit",loading:d,children:n.kind==="review"?"保存评审":n.kind==="event"?"记录进展":"安排提醒"})]})]})]})}const be={mode:"companies",q:"",country_filter:"",stage:"",tag:"",target:"procurement",verification:"",role_filter:"",has_email:!1,due:!1,ready_only:!1},Ne=["company","location","stage","contacts","assessment","action"],Be="voken-workbench-display-v1";function se(n){return Object.fromEntries(Object.entries(be).map(([a,r])=>[a,typeof r=="boolean"?n[a]===!0:String(n[a]??r).trim()]))}function Ce(n,a){return JSON.stringify(se(n))===JSON.stringify(se(a))}function wn(n,a,r){const s=se(n),l={q:`搜索：${s.q}`,country_filter:`地区：${s.country_filter}`,stage:`阶段：${a[String(s.stage)]||s.stage}`,tag:`标签：${s.tag}`,target:{leadership:"目标：企业负责人",sales:"目标：销售 / 业务开发"}[String(s.target)],verification:`邮箱：${r[String(s.verification)]||s.verification}`,role_filter:{keyword_match:"命中岗位关键词",needs_review:"岗位待核实",unknown:"岗位未知"}[String(s.role_filter)],has_email:"有完整邮箱",due:"到期跟进",ready_only:"已评审、岗位匹配且邮箱近期有效"};return Object.entries(s).filter(([c,d])=>c!=="mode"&&d!==be[c]).map(([c])=>({key:c,label:l[c]||c}))}function de(n){const a=n&&typeof n=="object"?n:{},r=Array.isArray(a.columns)?a.columns:null,s=r?Ne.filter(l=>["company","action"].includes(l)||r.includes(l)):[...Ne];return{density:a.density==="compact"?"compact":"comfortable",columns:s}}function kn(){try{return de(JSON.parse(localStorage.getItem(Be)||"null"))}catch{return de(null)}}function _n(n){try{localStorage.setItem(Be,JSON.stringify(de(n)))}catch{}}function Nn(n){if(!n)return"未提供";const a=new Date(String(n));return Number.isNaN(a.getTime())?"日期待核实":a.toLocaleString("zh-CN",{hour12:!1})}const Se={created:"保存客户",updated:"调整跟进",note:"备注",email_sent:"已发送邮件",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索反馈",opt_out:"拒绝联系",draft_requested:"生成开发信",research_requested:"公域查证",contact_selected:"采用联系信息",assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒",bounce:"退信"},{Text:x,Title:ve,Paragraph:H}=le,ne={new:"新发现",qualified:"已筛选",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",won:"已成交",lost:"不匹配"},Pe={new:"blue",qualified:"cyan",contacted:"geekblue",replied:"purple",negotiating:"orange",won:"green",lost:"default"},J={valid:"独立验证有效",invalid:"无效 / 不应联系",catch_all:"全收域，待确认",unknown:"未知",unverified:"尚未独立验证"},Ie={overview:"业务概况",discover:"发现客户",workbench:"客户工作台",customers:"客户档案",jobs:"任务管理","job-view":"任务详情",directory:"企业与联系人",sources:"商业情报",mail:"邮件管理",company:"企业资料",costs:"用量与费用"},Cn={overview:"从发现到跟进，让每一条客户线索都有下一步。",workbench:"筛选企业、核对联系人，集中推进值得跟进的商机。",discover:"从产品与市场出发，找到下一批合适的潜在客户。",jobs:"查看执行进度、核对来源，管理每一次发现。",customers:"保留客户证据与沟通记录，持续推进每一次对话。",directory:"查询企业与目标岗位，按需补充商务联系信息。",sources:"核对企业背景，发现公开采购与市场信号。",company:"让 AI 理解你的企业、产品与目标市场。",mail:"审阅开发信，记录回复，安排下一次跟进。",costs:"查看点数、任务结算和数据使用情况。"},G=n=>Object.entries(n).map(([a,r])=>({value:a,label:r})),W=Nn,g=n=>{n.catch(()=>{})};function pe({href:n,children:a}){let r=!1;try{r=["http:","https:"].includes(new URL(n||"").protocol)}catch{}return r?e.jsx("a",{href:n,target:"_blank",rel:"noopener noreferrer",children:a}):e.jsx(x,{type:"secondary",children:a})}function Oe({html:n,className:a=""}){const r=b.useRef(null);return b.useEffect(()=>{r.current&&(r.current.innerHTML=n)},[n]),e.jsx("div",{className:`legacy ${a}`,ref:r})}function Ve({compact:n=!1}){return e.jsxs("a",{className:"voken-brand",href:"#overview","aria-label":"微元 Voken 首页",children:[e.jsx("span",{className:"brand-symbol",children:"v"}),!n&&e.jsxs("span",{children:["微元",e.jsx("span",{className:"brand-en",children:"Voken"})]})]})}function Sn({ready:n}){return e.jsxs("section",{id:"auth",className:"react-auth",onSubmitCapture:a=>{n||a.preventDefault()},children:[e.jsxs("div",{className:"auth-intro",children:[e.jsx(Ve,{}),e.jsxs("div",{className:"auth-intro-copy",children:[e.jsx(w,{color:"blue",icon:e.jsx(me,{}),children:"为小团队，打开大市场"}),e.jsxs("h1",{children:["每一次增长，",e.jsx("br",{}),"始于对的客户。"]}),e.jsxs("p",{children:["发现有依据的线索，找到合适的联系人。",e.jsx("br",{}),"让 AI 处理信息，把时间留给对话。"]}),e.jsx("div",{className:"auth-benefits",children:[[e.jsx(re,{}),"发现客户","产品与市场驱动"],[e.jsx(U,{}),"核对来源","证据与判断分明"],[e.jsx(Z,{}),"推进对话","审阅后再触达"]].map(([a,r,s],l)=>e.jsxs("div",{children:[e.jsx("span",{children:a}),e.jsx("b",{children:r}),e.jsx("small",{children:s})]},l))})]}),e.jsx(x,{type:"secondary",children:"公开信息优先 · 数据按需增强 · 每一步有据可查"})]}),e.jsxs("div",{className:"auth-form-wrap",children:[e.jsxs("div",{className:"auth-form-card",children:[e.jsx("span",{className:"overline",children:"YOUR GROWTH WORKSPACE"}),e.jsx(ve,{level:2,children:"欢迎回到微元"}),e.jsx(H,{type:"secondary",children:"登录你的海外业务工作台，继续推进商机。"}),e.jsxs("form",{id:"login-form",className:"login-form",method:"post",children:[e.jsx("label",{htmlFor:"login-phone",children:"手机号"}),e.jsx($,{id:"login-phone",name:"phone",type:"tel",autoComplete:"username",placeholder:"请输入手机号",size:"large",required:!0}),e.jsx("label",{htmlFor:"login-password",children:"密码"}),e.jsx($.Password,{id:"login-password",name:"password",autoComplete:"current-password",placeholder:"请输入密码",size:"large",minLength:8,required:!0}),e.jsx(p,{type:"primary",size:"large",htmlType:"submit",block:!0,disabled:!n,loading:!n,children:"进入工作台"})]}),e.jsx(Oe,{html:yn})]}),e.jsx(x,{type:"secondary",className:"auth-footer",children:"微元 Voken · 你的海外业务助手"})]})]})}function Ue({items:n}){return e.jsx(Fe,{gutter:[16,16],className:"metric-row",children:n.map(a=>e.jsx(ce,{xs:24,sm:12,xl:6,children:e.jsxs(P,{className:"metric-card",children:[e.jsxs("div",{className:"metric-top",children:[e.jsx(x,{type:"secondary",children:a.label}),e.jsx("span",{className:"metric-icon",children:a.icon})]}),e.jsx(un,{value:a.value,formatter:r=>a.value===void 0?"—":Number(r).toLocaleString()}),e.jsx(x,{type:"secondary",className:"metric-note",children:a.note})]})},a.label))})}function In({data:n,bridge:a}){var l,c;const r=n.summary,s=[{title:"完善企业资料",text:"告诉 AI 你的产品、优势与市场",tab:"company",icon:e.jsx(ae,{})},{title:"发现潜在客户",text:"描述目标，创建小批量找客任务",tab:"discover",icon:e.jsx(re,{})},{title:"筛选并核对",text:"检查企业匹配、岗位和邮箱",tab:"workbench",icon:e.jsx(Me,{})},{title:"开始商务对话",text:"审阅开发信，记录每一次推进",tab:"mail",icon:e.jsx(Z,{})}];return e.jsxs("div",{className:"native-page",children:[e.jsxs("div",{className:"overview-hero",children:[e.jsxs("div",{children:[e.jsx(w,{icon:e.jsx(ze,{}),children:"AI 驱动的客户开发"}),e.jsxs("h2",{children:["把下一次增长，",e.jsx("br",{}),"变成今天的下一步。"]}),e.jsx("p",{children:"从产品和市场出发，建立有来源、可跟进的客户清单。"}),e.jsxs(I,{wrap:!0,children:[e.jsx(p,{size:"large",icon:e.jsx(he,{}),onClick:()=>g(a.navigate("discover")),children:"创建找客任务"}),e.jsx(p,{size:"large",ghost:!0,onClick:()=>g(a.navigate("workbench")),children:"进入客户工作台"})]})]}),e.jsxs("div",{className:"hero-orbit","aria-hidden":"true",children:[e.jsx("div",{className:"orbit-ring"}),e.jsx("div",{className:"orbit-core",children:e.jsx(me,{})}),e.jsxs("div",{className:"orbit-label label-one",children:[e.jsx(U,{})," 有据可查"]}),e.jsxs("div",{className:"orbit-label label-two",children:[e.jsx(oe,{})," 找到对的人"]}),e.jsxs("div",{className:"orbit-label label-three",children:[e.jsx(Z,{})," 连接新商机"]})]})]}),e.jsx(Ue,{items:[{label:"已保存客户",value:r==null?void 0:r.total,note:"你的独立客户管线",icon:e.jsx(oe,{})},{label:"到期待跟进",value:r==null?void 0:r.due_followups,note:"到期且允许联系的客户",icon:e.jsx(we,{})},{label:"正在洽谈",value:((l=r==null?void 0:r.stages)==null?void 0:l.negotiating)||(r?0:void 0),note:"持续推进中的商机",icon:e.jsx(te,{})},{label:"已成交",value:((c=r==null?void 0:r.stages)==null?void 0:c.won)||(r?0:void 0),note:"以实际记录为准",icon:e.jsx(U,{})}]}),e.jsxs(Fe,{gutter:[20,20],children:[e.jsx(ce,{xs:24,lg:15,children:e.jsxs(P,{title:"今天值得推进的事",extra:e.jsx(w,{color:"blue",children:"工作空间"}),children:[e.jsxs("div",{className:"next-action",children:[e.jsx("span",{className:"action-icon",children:e.jsx(we,{})}),e.jsxs("div",{children:[e.jsx(ve,{level:4,children:r?r.due_followups?`${r.due_followups} 位客户等待下一次跟进`:"开始建立你的下一批商机":"正在加载业务概况"}),e.jsx(H,{type:"secondary",children:r!=null&&r.due_followups?"先核对客户来源和沟通历史，再决定下一次联系。":"完善企业资料，创建找客任务，筛选值得对话的企业。"}),e.jsx(p,{type:"primary",onClick:()=>g(a.navigate(r!=null&&r.due_followups?"workbench":"discover")),children:r!=null&&r.due_followups?"查看待跟进客户":"发现新客户"})]})]}),e.jsxs("div",{className:"overview-note",children:[e.jsx(U,{})," ",r?`已停止联系 ${r.do_not_contact||0} 位客户；回复和成交数据以实际记录为准。`:"统计仅展示当前工作空间的数据。"]})]})}),e.jsx(ce,{xs:24,lg:9,children:e.jsx(P,{title:"清晰的客户开发路径",children:e.jsx("div",{className:"workflow-list",children:s.map((d,f)=>e.jsxs("button",{onClick:()=>g(a.navigate(d.tab)),children:[e.jsx("span",{className:"workflow-icon",children:d.icon}),e.jsxs("span",{children:[e.jsx("b",{children:d.title}),e.jsx("small",{children:d.text})]}),e.jsx(Te,{})]},d.tab))})})})]})]})}function qn({contact:n,capabilities:a,bridge:r,onChange:s}){var m,L,k,j,E,y,N,h;const[l,c]=b.useState(!1),[d,f]=b.useState(!1),q=async()=>{f(!0);try{await r.post("/verifications",{prospect_id:n.prospect_id,email:n.email,confirm_external_check:!0},"verify"),c(!1),s()}catch{}finally{f(!1)}},u=((m=n.verification)==null?void 0:m.status)||"unverified";return e.jsxs(P,{size:"small",className:"contact-card",children:[e.jsxs(I,{wrap:!0,children:[e.jsx(x,{strong:!0,children:n.name||"公共 / 岗位未知入口"}),e.jsx(w,{children:((L=n.titles)==null?void 0:L.join(" / "))||"岗位未知"}),n.blocked&&e.jsx(w,{color:"red",children:"停止联系"})]}),e.jsx(H,{copyable:n.email?{text:n.email}:!1,children:n.email||"暂无完整邮箱"}),e.jsxs(I,{wrap:!0,children:[e.jsx(w,{color:u==="valid"?"green":u==="invalid"?"red":"default",children:J[u]}),((k=n.verification)==null?void 0:k.stale)&&e.jsx(w,{color:"orange",children:"验证超过 30 天"}),e.jsx(x,{type:"secondary",children:(j=n.role_match)==null?void 0:j.reason})]}),e.jsxs(H,{type:"secondary",className:"contact-meta",children:["验证时间：",W((E=n.verification)==null?void 0:E.checked_at)," ·"," ",((y=n.verification)==null?void 0:y.history_count)||0," 次历史记录"]}),e.jsx(x,{type:"secondary",children:"供应商标记不替代独立验证，不保证送达。"}),((N=n.warnings)==null?void 0:N.length)>0&&e.jsx(B,{type:"warning",title:n.warnings.map(v=>({email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务 / 质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"})[v]||v).join("；"),showIcon:!0}),((h=n.sources)==null?void 0:h.length)>0&&e.jsx("div",{className:"contact-sources",children:n.sources.map((v,_)=>e.jsxs("div",{children:[e.jsx(pe,{href:v.source_url,children:v.source||"原始来源"}),e.jsxs(x,{type:"secondary",children:[" · ",W(v.observed_at)]}),v.source_job_id&&e.jsx(p,{type:"link",size:"small","data-job":v.source_job_id,children:"来源任务"})]},_))}),e.jsxs("div",{className:"verification-action",children:[e.jsx(ee,{checked:l,disabled:!a.email_verification||!n.email,onChange:v=>c(v.target.checked),children:"同意将邮箱交给 ZeroBounce 验证，消耗供应商额度"}),e.jsx(p,{loading:d,disabled:!l||!a.email_verification||!n.email,onClick:()=>void q(),children:u==="unverified"?"验证邮箱":"重新验证并保留历史"})]})]})}function En({id:n,bridge:a,capabilities:r,onClose:s}){var L,k,j,E,y,N,h,v,_,O;const[l,c]=b.useState(null),[d,f]=b.useState(""),[q,u]=b.useState(0);b.useEffect(()=>{let o=!1;return c(null),f(""),n&&a.detail(n).then(S=>{o||c(S)}).catch(S=>{o||f(S.message)}),()=>{o=!0}},[n,a,q]);const m=l==null?void 0:l.prospect;return e.jsx($e,{title:(m==null?void 0:m.name)||"客户详情",open:!!n,onClose:s,size:720,className:"customer-drawer",footer:e.jsxs("div",{className:"drawer-footer-actions",children:[e.jsx(p,{onClick:s,children:"关闭详情"}),e.jsx(p,{type:"primary",disabled:!m,onClick:()=>{n&&g(a.edit(n).then(s))},children:"编辑档案与跟进"})]}),extra:e.jsx(p,{icon:e.jsx(Re,{}),"aria-label":"刷新客户详情",disabled:!m,type:"primary",onClick:()=>{u(o=>o+1)},children:"刷新"}),children:d?e.jsx(B,{type:"error",title:"客户详情加载失败",description:d,action:e.jsx(p,{onClick:()=>u(o=>o+1),children:"重试"})}):l?e.jsxs(e.Fragment,{children:[e.jsxs(I,{wrap:!0,children:[e.jsx(w,{color:Pe[m.stage],children:ne[m.stage]}),m.do_not_contact&&e.jsx(w,{color:"red",children:"拒绝联系"}),(L=m.tags)==null?void 0:L.map(o=>e.jsx(w,{children:o},o))]}),e.jsx(hn,{items:[{key:"profile",label:"企业与证据",children:e.jsxs(e.Fragment,{children:[e.jsx(bn,{column:1,bordered:!0,size:"small",items:[{key:"location",label:"国家 / 地区",children:m.location||"待核实"},{key:"website",label:"官网",children:e.jsx(pe,{href:m.website,children:m.website||"未提供"})},{key:"contact",label:"已记录联系信息",children:m.contact||"未提供"},{key:"followup",label:"下次跟进",children:W(m.next_followup_at)},{key:"source",label:"来源",children:e.jsx(pe,{href:(j=(k=m.evidence)==null?void 0:k.source)==null?void 0:j.url,children:((y=(E=m.evidence)==null?void 0:E.source)==null?void 0:y.title)||((h=(N=m.evidence)==null?void 0:N.source)==null?void 0:h.url)||"查看原始证据"})}]}),e.jsxs(P,{size:"small",title:"判断依据",className:"drawer-evidence",children:[e.jsx(H,{children:((v=m.evidence)==null?void 0:v.reason)||((_=m.evidence)==null?void 0:_.source_note)||"暂无补充依据，请核对原始来源。"}),e.jsx(B,{type:"info",title:"企业匹配、岗位匹配与邮箱有效性分别判断；历史信息不代表当前采购需求。"})]}),((O=l.duplicates)==null?void 0:O.length)>0&&e.jsx(P,{size:"small",title:"疑似关联 / 重复档案（尚未合并）",className:"drawer-evidence",children:l.duplicates.map(o=>e.jsxs(H,{children:[e.jsx(x,{strong:!0,children:o.name}),e.jsx("br",{}),e.jsx(x,{type:"secondary",children:o.reason}),e.jsx(p,{type:"link",onClick:()=>g(a.edit(o.id).then(s)),children:"打开档案核对"})]},o.id))})]})},{key:"contacts",label:`联系人 (${l.contacts.length})`,children:l.contacts.length?e.jsx(I,{orientation:"vertical",className:"full-width",children:l.contacts.map((o,S)=>e.jsx(qn,{contact:o,capabilities:r,bridge:a,onChange:()=>{u(T=>T+1),g(a.refresh())}},o.email+":"+S))}):e.jsx(K,{description:"暂无完整邮箱候选，可在客户档案中查询企业与岗位"})},{key:"history",label:"跟进与验证历史",children:!l.activities.length&&!l.records.length?e.jsx(K,{image:K.PRESENTED_IMAGE_SIMPLE,description:"暂无跟进或验证记录，可在客户档案中记录下一步"}):e.jsx(vn,{items:[...l.activities.map(o=>({time:o.created_at,title:Se[o.kind]||"其他记录",content:o.content})),...l.records.map(o=>({time:o.created_at,title:{assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"}[o.kind]||o.kind,content:(o.kind==="followup"?`提醒时间：${W(o.data.due_at)} · ${o.data.objective||""}`:"")||(o.kind==="contact_event"?`${Se[o.data.type]||"联系事件"} · ${o.data.email||""}：${o.data.content||""}`:"")||o.data.reason||o.data.content||o.data.objective||J[o.data.status]||o.data.status}))].sort((o,S)=>String(S.time).localeCompare(String(o.time))).map((o,S)=>({key:S,title:e.jsxs(e.Fragment,{children:[e.jsx(x,{strong:!0,children:o.title}),e.jsx("div",{children:e.jsx(x,{type:"secondary",children:W(o.time)})})]}),content:o.content}))})}]},n)]}):e.jsx(mn,{active:!0,paragraph:{rows:10}})})}const A=be;function An({data:n,bridge:a}){var fe;const r=on.useBreakpoint(),s=n.workbench,l=s.summary,[c,d]=b.useState(s.filters||A),[f,q]=b.useState(!1),[u,m]=b.useState(null),[L,k]=b.useState(!1),[j,E]=b.useState(""),[y,N]=b.useState(!1),[h,v]=b.useState(kn),_=h.columns,O=t=>v(i=>({...i,columns:t}));b.useEffect(()=>_n(h),[h]);const[o,S]=b.useState(null),T=s.filters||A,V=T.mode==="contacts",He=JSON.stringify(T),X=!Ce(c,T),Y=wn(T,ne,J),xe=(s.views||[]).findIndex(t=>Ce(t.data,T)),Ge=t=>{const i={...se(T),[t]:A[t]};d(i),M(i)};b.useEffect(()=>{d({...A,...T})},[He]);const z=(t,i)=>d(C=>({...C,[t]:i})),M=(t=c)=>g(a.filter(t)),ye=[{key:"company",title:"企业名称",dataIndex:"name",width:250,fixed:r.md?"left":void 0,render:(t,i)=>{var C;return e.jsxs("div",{className:"company-cell",children:[e.jsx(Le,{shape:"square",className:"company-avatar",children:String(t).slice(0,1).toUpperCase()}),e.jsxs("div",{children:[e.jsx(p,{type:"link",onClick:()=>m(i.id),children:t}),e.jsx(x,{type:"secondary",children:i.blocked?"存在停止联系记录":i.next_action}),((C=i.duplicates)==null?void 0:C.length)>0&&e.jsxs(w,{color:"orange",children:["疑似关联 ",i.duplicates.length," 份"]})]})]})}},{key:"location",title:"国家 / 地区",dataIndex:"country",width:135,render:t=>t||"待核实"},{key:"stage",title:"销售阶段",dataIndex:"stage",width:115,render:t=>e.jsx(w,{color:Pe[t],children:ne[t]||t})},{key:"contacts",title:"联系信息",width:170,render:(t,i)=>e.jsxs("div",{children:[e.jsxs("span",{children:[i.email_count," 个完整邮箱"]}),e.jsx("br",{}),e.jsxs(x,{type:"secondary",children:[i.contact_count," 条入口 · ",i.verified_count," 个验证有效"]})]})},{key:"assessment",title:"企业匹配",width:140,render:(t,i)=>{var C,D;return e.jsx(w,{color:((C=i.assessment)==null?void 0:C.status)==="fit"?"green":"default",children:{fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"}[(D=i.assessment)==null?void 0:D.status]||"待核实"})}},{key:"action",title:"操作",width:210,fixed:r.md?"right":void 0,render:(t,i)=>e.jsxs(I,{size:0,children:[e.jsx(p,{type:"link",onClick:()=>m(i.id),children:"详情"}),e.jsx(p,{type:"link","data-wb-enrich":i.id,children:"查联系人"}),e.jsx(p,{type:"link",onClick:()=>S({kind:"review",row:i}),children:"评审"})]})}],Ke=[{key:"company",title:"联系人 / 企业",width:240,fixed:r.md?"left":void 0,render:(t,i)=>e.jsxs("div",{children:[e.jsx(p,{type:"link",onClick:()=>m(i.prospect_id),children:i.name||"公共 / 岗位未知入口"}),e.jsx("br",{}),e.jsx(x,{type:"secondary",children:i.company})]})},{key:"email",title:"邮箱",dataIndex:"email",width:240,render:(t,i)=>e.jsxs(e.Fragment,{children:[e.jsx(x,{copyable:t?{text:t}:!1,children:t||"暂无完整邮箱"}),i.blocked&&e.jsx(w,{color:"red",children:"停止联系"})]})},{key:"role",title:"岗位判断",width:240,render:(t,i)=>{var C,D;return e.jsxs(e.Fragment,{children:[e.jsx("div",{children:((C=i.titles)==null?void 0:C.join(" / "))||"岗位未知"}),e.jsx(x,{type:"secondary",children:(D=i.role_match)==null?void 0:D.reason})]})}},{key:"verification",title:"独立邮箱验证",width:180,render:(t,i)=>{var C,D,je,ge;return e.jsxs(e.Fragment,{children:[e.jsx(w,{color:((C=i.verification)==null?void 0:C.status)==="valid"?"green":((D=i.verification)==null?void 0:D.status)==="invalid"?"red":"default",children:J[(je=i.verification)==null?void 0:je.status]||"未知"}),((ge=i.verification)==null?void 0:ge.stale)&&e.jsx("div",{children:e.jsx(x,{type:"warning",children:"验证超过 30 天"})})]})}},{key:"action",title:"操作",width:150,fixed:r.md?"right":void 0,render:(t,i)=>e.jsxs(I,{size:0,children:[e.jsx(p,{type:"link",onClick:()=>m(i.prospect_id),children:"详情 / 验证"}),e.jsx(p,{type:"link",onClick:()=>S({kind:"event",row:i}),children:"记录"})]})}];return e.jsxs("div",{className:"native-page workbench-page",children:[e.jsx(Ue,{items:[{label:"企业档案",value:l==null?void 0:l.companies,note:"当前工作空间独立档案",icon:e.jsx(ae,{})},{label:"有完整邮箱的企业",value:l==null?void 0:l.companies_with_email,note:"联系信息仍需核实",icon:e.jsx(Z,{})},{label:"去重邮箱",value:l==null?void 0:l.unique_mailboxes,note:"按邮箱去重统计",icon:e.jsx(te,{})},{label:"近期验证有效",value:l==null?void 0:l.verified_mailboxes,note:"独立验证，不保证送达",icon:e.jsx(U,{})}]}),e.jsxs(P,{className:"workbench-card",children:[e.jsxs("div",{className:"table-heading",children:[e.jsxs("div",{children:[e.jsx(ve,{level:4,children:"客户资源"}),e.jsx(x,{type:"secondary",children:"企业、岗位与邮箱，分开核对，集中推进。"})]}),e.jsxs(I,{wrap:!0,children:[e.jsx(p,{icon:e.jsx(cn,{"aria-hidden":"true"}),onClick:()=>{var i;const t=(i=document.querySelector("#wb-upload"))==null?void 0:i.closest("details");t&&(t.open=!0,t.scrollIntoView({behavior:"smooth",block:"center"}))},children:"导入名单"}),e.jsx(p,{type:"primary",icon:e.jsx(he,{}),onClick:()=>g(a.navigate("discover")),children:"发现客户"})]})]}),e.jsxs("div",{className:"workbench-tabs",children:[e.jsx(ke,{value:c.mode,options:[{value:"companies",label:"企业视图",icon:e.jsx(ae,{})},{value:"contacts",label:"联系人视图",icon:e.jsx(te,{})}],onChange:t=>{const i={...c,mode:t};d(i),M(i)}}),e.jsx(F,{"aria-label":"应用已保存视图",placeholder:"已保存的筛选视图",allowClear:!0,className:"saved-view-select",value:xe>=0?xe:void 0,options:(s.views||[]).map((t,i)=>({label:t.data.name,value:i})),onChange:t=>{t!==void 0?g(a.applyView(t)):(d({...A}),M({...A}))}})]}),e.jsxs("form",{"data-extension":"react",className:"react-filter",onSubmit:t=>{t.preventDefault(),M()},children:[e.jsxs("div",{className:"filter-main",children:[e.jsx($,{prefix:e.jsx(re,{}),"aria-label":"搜索企业、姓名或邮箱",placeholder:"搜索企业、姓名或邮箱",maxLength:200,allowClear:!0,value:c.q,onClear:()=>{const t={...c,q:""};d(t),M(t)},onChange:t=>z("q",t.target.value)}),e.jsx($,{"aria-label":"国家或地区",placeholder:"国家 / 地区",maxLength:100,value:c.country_filter,onChange:t=>z("country_filter",t.target.value)}),e.jsx(F,{"aria-label":"销售阶段",value:c.stage,options:[{value:"",label:"全部销售阶段"},...G(ne)],onChange:t=>z("stage",t)}),e.jsx(p,{htmlType:"submit",type:"primary",icon:e.jsx(re,{"aria-hidden":"true"}),loading:n.loading,children:"查询"}),e.jsx(p,{icon:e.jsx(Me,{}),"aria-expanded":f,"aria-controls":"advanced-customer-filters",onClick:()=>q(t=>!t),children:f?"收起筛选":"更多筛选"})]}),f&&e.jsxs("div",{className:"advanced-filters",id:"advanced-customer-filters",children:[e.jsxs("label",{children:["标签",e.jsx($,{maxLength:40,value:c.tag,onChange:t=>z("tag",t.target.value)})]}),e.jsxs("label",{children:["目标岗位",e.jsx(F,{"aria-label":"目标岗位",value:c.target,options:G({procurement:"采购 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发"}),onChange:t=>z("target",t)})]}),e.jsxs("label",{children:["邮箱验证",e.jsx(F,{"aria-label":"独立邮箱验证",value:c.verification,options:[{value:"",label:"全部状态"},...G(J)],onChange:t=>z("verification",t)})]}),e.jsxs("label",{children:["岗位判断",e.jsx(F,{"aria-label":"岗位判断",value:c.role_filter,options:G({"":"全部岗位",keyword_match:"命中目标关键词",needs_review:"未命中，待核实",unknown:"岗位未知"}),onChange:t=>z("role_filter",t)})]})]}),e.jsxs("div",{className:"filter-bottom",children:[e.jsxs(I,{wrap:!0,children:[e.jsx(ee,{checked:c.has_email,onChange:t=>z("has_email",t.target.checked),children:"有完整邮箱"}),e.jsx(ee,{checked:c.due,onChange:t=>z("due",t.target.checked),children:"到期跟进"}),f&&e.jsx(ee,{checked:c.ready_only,onChange:t=>z("ready_only",t.target.checked),children:"已评审、岗位匹配且邮箱近期有效"})]}),e.jsxs(I,{children:[e.jsx(p,{type:"text",onClick:()=>{d({...A}),M({...A})},children:"重置"}),e.jsx(p,{type:"link",disabled:X||n.loading,title:X?"请先应用筛选条件，再保存视图":void 0,onClick:()=>k(!0),children:"保存当前筛选"})]})]})]}),X&&e.jsxs("div",{className:"filter-draft-notice",role:"status",children:[e.jsx(x,{children:"筛选条件已修改，列表仍显示上次查询结果。"}),e.jsx(p,{size:"small",type:"primary",onClick:()=>M(),disabled:n.loading,children:"应用修改"}),e.jsx(p,{size:"small",type:"text",onClick:()=>d({...A,...T}),children:"撤销修改"})]}),Y.length>0&&e.jsxs("div",{className:"applied-filters","aria-label":"已应用筛选",children:[e.jsx(x,{type:"secondary",children:"已应用"}),Y.map(t=>e.jsx(w,{closable:!n.loading,onClose:()=>Ge(t.key),title:t.label,children:t.label},t.key)),e.jsx(p,{type:"link",size:"small",onClick:()=>{d({...A}),M({...A})},children:"清空筛选"})]}),n.workbenchError&&e.jsx(B,{type:"error",title:"客户工作台加载失败",description:n.workbenchError,showIcon:!0,action:e.jsx(p,{onClick:()=>g(a.refresh()),children:"重试"})}),e.jsxs("div",{className:"table-status",children:[e.jsxs(I,{wrap:!0,children:[e.jsxs(x,{type:"secondary","aria-live":"polite",children:["共 ",s.total||0," 条记录"]}),s.lastLoadedAt&&e.jsxs(x,{type:"secondary",className:"last-updated",children:["更新于"," ",new Date(s.lastLoadedAt).toLocaleTimeString("zh-CN",{hour12:!1})]}),((fe=s.selected)==null?void 0:fe.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(w,{color:"blue",children:["已选 ",s.selected.length," 家企业"]}),e.jsx(p,{type:"link",size:"small",onClick:()=>S({kind:"followup",ids:s.selected}),children:"安排跟进"}),e.jsx(p,{type:"text",size:"small",onClick:()=>a.select([]),children:"取消选择"})]})]}),e.jsxs(I,{wrap:!0,className:"display-controls",children:[e.jsx(dn,{title:"调整表格行间距",children:e.jsx(ke,{"aria-label":"表格密度",size:"small",value:h.density,options:[{value:"comfortable",label:"舒适"},{value:"compact",label:"紧凑"}],onChange:t=>v(i=>({...i,density:t}))})}),!V&&e.jsx(F,{mode:"multiple","aria-label":"显示的表格列",value:_,onChange:O,maxTagCount:0,maxTagPlaceholder:()=>"列设置",className:"column-select",options:ye.map(t=>({value:String(t.key),label:t.title,disabled:["company","action"].includes(String(t.key))}))})]})]}),!r.md&&e.jsx("div",{className:"table-scroll-hint",children:"左右滑动表格查看更多字段，点击名称打开详情。"}),e.jsx(De,{size:h.density==="compact"?"small":"middle",columns:V?Ke:ye.filter(t=>_.includes(String(t.key))),dataSource:n.workbenchError||s.loadedMode!==T.mode?[]:s.items||[],rowKey:t=>V?`${t.prospect_id}:${t.email}:${t.name}`:t.id,loading:n.loading,scroll:{x:V?1100:1050,y:"min(58vh, 640px)"},rowSelection:{selectedRowKeys:(s.items||[]).filter(t=>{var i;return(i=s.selected)==null?void 0:i.includes(V?t.prospect_id:t.id)}).map(t=>V?`${t.prospect_id}:${t.email}:${t.name}`:t.id),onChange:(t,i)=>a.select([...new Set(i.map(C=>V?C.prospect_id:C.id))])},locale:{emptyText:e.jsx(K,{image:K.PRESENTED_IMAGE_SIMPLE,description:n.workbenchError?"数据暂时无法加载":Y.length?"没有符合当前条件的客户":"还没有客户档案",children:e.jsx(p,{onClick:()=>{n.workbenchError?g(a.refresh()):Y.length?(d({...A}),M({...A})):g(a.navigate("discover"))},children:n.workbenchError?"重新加载":Y.length?"清空筛选":"发现第一批客户"})})},pagination:{current:Math.floor((s.offset||0)/30)+1,pageSize:30,total:s.total||0,showSizeChanger:!1,showTotal:t=>`共 ${t} 条`,onChange:t=>g(a.filter(T,(t-1)*30))}}),e.jsxs("div",{className:"table-footnote",children:[e.jsx(U,{})," ","企业匹配、岗位匹配与邮箱验证分别判断；疑似重复档案尚未合并。"]})]}),o&&e.jsx(gn,{action:o,bridge:a,onClose:()=>S(null),onSaved:()=>g(a.refresh())}),e.jsx(En,{id:u,bridge:a,capabilities:s.capabilities||{},onClose:()=>m(null)}),e.jsxs(Ae,{title:"保存当前筛选视图",open:L,onCancel:()=>{y||k(!1)},keyboard:!y,maskClosable:!y,confirmLoading:y,onOk:()=>{j.trim()&&(N(!0),a.saveView(j.trim()).then(()=>{k(!1),E("")}).catch(()=>{}).finally(()=>N(!1)))},okButtonProps:{disabled:!j.trim()||X},okText:"保存视图",children:[e.jsx(H,{type:"secondary",children:"保存已应用到列表的筛选条件，便于下次快速打开。"}),e.jsx($,{"aria-label":"筛选视图名称",autoFocus:!0,value:j,maxLength:80,placeholder:"例如：美国采购岗位待核查",onChange:t=>E(t.target.value)})]})]})}function Tn({data:n,bridge:a}){const[r,s]=b.useState(""),[l,c]=b.useState(""),d={prospecting:"发现客户",outreach_draft:"开发信草稿",report:"客户报告",source_lookup:"官方情报查询",public_search:"公开检索",directory_companies:"企业查询",directory_people:"人物与岗位",directory_contacts:"联系方式解锁",buyer_search:"采购商匹配",buyer_profile:"企业资料",buyer_contacts:"联系方式",customs_verification:"贸易核验",trade_search:"历史贸易"},f={queued:"排队中",running:"执行中",cancelling:"取消中",succeeded:"已完成",partial:"部分完成",failed:"失败",cancelled:"已取消"},q=n.jobs.filter(u=>(!r||u.operation===r)&&(!l||u.status===l));return e.jsx("div",{className:"native-page",children:e.jsxs(P,{title:"任务记录",extra:e.jsx(p,{type:"primary",icon:e.jsx(he,{}),onClick:()=>g(a.navigate("discover")),children:"创建任务"}),children:[e.jsxs("div",{className:"task-filter",children:[e.jsx(F,{"aria-label":"任务类型",value:r,options:[{value:"",label:"全部任务类型"},...G(d)],onChange:s}),e.jsx(F,{"aria-label":"任务状态",value:l,options:[{value:"",label:"全部状态"},...G(f)],onChange:c}),e.jsxs(x,{type:"secondary",children:["最近 ",n.jobs.length," 个任务中，显示 ",q.length," 个"]})]}),e.jsx(De,{rowKey:"id",dataSource:q,loading:n.loading,scroll:{x:750},pagination:{pageSize:15,showSizeChanger:!1},columns:[{title:"任务类型",dataIndex:"operation",render:(u,m)=>e.jsx(p,{type:"link","data-job":m.id,children:d[u]||u})},{title:"状态",dataIndex:"status",render:u=>e.jsx(pn,{status:u==="succeeded"?"success":u==="running"?"processing":u==="failed"?"error":u==="partial"?"warning":"default",text:f[u]||u})},{title:"创建时间",dataIndex:"created_at",render:W},{title:"已结算点数",dataIndex:"points_charged",render:u=>Number(u||0).toLocaleString()},{title:"操作",render:(u,m)=>e.jsx(p,{type:"link","data-job":m.id,children:"查看详情"})}],locale:{emptyText:e.jsx(K,{description:"暂无符合条件的任务"})}}),e.jsx(x,{type:"secondary",children:"执行中的任务每 5 秒更新。部分完成的任务请查看已交付结果及缺失说明。"})]})})}function Ln(){var N;const{message:n}=ue.useApp(),[a,r]=b.useState(null),[s,l]=b.useState(null),[c,d]=b.useState(""),[f,q]=b.useState(!1),[u,m]=b.useState(!1),[L,k]=b.useState(!1);b.useEffect(()=>{const h=()=>{window.voken&&l(window.voken.snapshot())},v=_=>{const O=_.detail;n.open({type:O.error?"error":"success",content:O.message,duration:6})};return window.addEventListener(_e,h),window.addEventListener("voken:message",v),jn().then(_=>{r(_),l(_.snapshot())}).catch(_=>d(_.message)),()=>{window.removeEventListener(_e,h),window.removeEventListener("voken:message",v)}},[n]);const j=(s==null?void 0:s.tab)||"overview",E=[{key:"overview",icon:e.jsx(rn,{}),label:"业务概况"},{type:"group",label:"客户开发",children:[{key:"discover",icon:e.jsx(ze,{}),label:"发现客户"},{key:"workbench",icon:e.jsx(oe,{}),label:"客户工作台"},{key:"customers",icon:e.jsx(te,{}),label:"客户档案"},{key:"jobs",icon:e.jsx(sn,{}),label:"任务管理"}]},{type:"group",label:"业务工具",children:[{key:"directory",icon:e.jsx(ln,{}),label:"企业与联系人"},{key:"sources",icon:e.jsx(me,{}),label:"商业情报"},{key:"mail",icon:e.jsx(Z,{}),label:"邮件管理"},{key:"company",icon:e.jsx(ae,{}),label:"企业资料"}]}],y=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"sidebar-brand",children:e.jsx(Ve,{compact:!u&&f})}),e.jsx("div",{className:"workspace-label",children:"业务工作空间"}),e.jsx(Xe,{theme:"light",mode:"inline",selectedKeys:[j==="job-view"?"jobs":j],items:E,onClick:({key:h})=>{a&&g(a.navigate(h)),k(!1)}}),e.jsxs("div",{className:"sidebar-bottom",children:[e.jsxs("button",{className:"points-entry",onClick:()=>{a&&g(a.navigate("costs")),k(!1)},children:[e.jsx(Qe,{}),e.jsxs("span",{children:[e.jsx("b",{children:(s==null?void 0:s.balance)||"— 点数"}),e.jsx("small",{children:"用量与费用"})]}),e.jsx(Te,{})]}),e.jsx(p,{"aria-label":"退出登录",type:"text",icon:e.jsx(en,{}),onClick:()=>{var h;(h=document.getElementById("logout"))==null||h.click(),k(!1)},children:!f||u?"退出登录":null})]})]});return e.jsxs(e.Fragment,{children:[e.jsx("div",{id:"toast",role:"status","aria-live":"polite",hidden:!0}),e.jsx(Sn,{ready:!!a}),c&&e.jsx("div",{className:"startup-error",children:e.jsx(B,{type:"error",title:c,action:e.jsx(p,{onClick:()=>location.reload(),children:"重新加载"})})}),e.jsx("div",{id:"workspace",className:"react-workspace",hidden:!0,children:e.jsxs(ie,{children:[e.jsx(ie.Sider,{className:"voken-sidebar",width:232,collapsedWidth:80,collapsed:f,breakpoint:"lg",onBreakpoint:m,trigger:null,children:!u&&y}),e.jsxs(ie,{className:`main-layout ${f?"is-collapsed":""}`,children:[e.jsxs("header",{className:"workspace-topbar",children:[e.jsxs(I,{children:[e.jsx(p,{type:"text","aria-label":u?"打开导航":f?"展开导航":"收起导航",icon:f||u?e.jsx(nn,{}):e.jsx(tn,{}),onClick:()=>u?k(!0):q(h=>!h)}),e.jsx(an,{items:[{title:"工作空间"},{title:Ie[j]||"业务概况"}]})]}),e.jsxs(I,{children:[e.jsx(w,{className:"workspace-tag",icon:e.jsx(U,{}),children:"独立业务空间"}),e.jsx(Le,{size:32,className:"user-avatar",children:"微"})]})]}),e.jsxs("main",{className:"workspace-content",children:[e.jsxs("div",{className:"react-page-header",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"page-title",tabIndex:-1,children:Ie[j]||"业务概况"}),e.jsx(x,{type:"secondary",children:Cn[j]||"核对任务结果与来源，准备下一步业务行动。"})]}),e.jsx(p,{id:"refresh","aria-label":"刷新当前页面数据",icon:e.jsx(Re,{spin:s==null?void 0:s.loading}),disabled:!a||(s==null?void 0:s.loading),children:"刷新数据"})]}),a&&s&&e.jsxs("div",{children:[j==="overview"&&e.jsx(In,{data:s,bridge:a})," ",j==="workbench"&&e.jsx(An,{data:s,bridge:a})," ",j==="jobs"&&e.jsx(Tn,{data:s,bridge:a})]},((N=s.session)==null?void 0:N.workspace_id)||"signed-out"),e.jsx(Oe,{html:xn,className:"business-pages"}),e.jsxs("div",{className:"compat-controls","aria-hidden":"true",hidden:!0,children:[e.jsx("details",{id:"tools-nav"}),e.jsx("button",{id:"balance"}),e.jsx("button",{id:"logout"})]}),e.jsxs("footer",{className:"workspace-footer",children:[e.jsx("span",{children:"微元 Voken · 让客户开发更进一步"}),e.jsx("span",{children:"公开信息优先，增强由你选择"})]})]})]})]})}),e.jsx($e,{title:"工作空间导航",placement:"left",open:L,onClose:()=>k(!1),className:"mobile-navigation",size:260,children:y})]})}var Ee;const qe=(Ee=document.querySelector('meta[name="csp-nonce"]'))==null?void 0:Ee.content;We.createRoot(document.getElementById("root")).render(e.jsx(Je,{locale:Ze,csp:qe?{nonce:qe}:void 0,theme:{token:{colorPrimary:"#2456ee",colorText:"#22324d",colorTextSecondary:"#64748b",colorBgLayout:"#f5f7fb",colorBorderSecondary:"#e9edf4",borderRadius:10,fontFamily:'Inter, "Segoe UI", "Microsoft YaHei", sans-serif',fontSize:14,controlHeight:38},components:{Layout:{siderBg:"#ffffff",headerBg:"#ffffff"},Menu:{itemHeight:44,itemMarginBlock:5,itemBorderRadius:8},Table:{headerBg:"#f8faff",cellPaddingBlock:16},Card:{paddingLG:24}}},children:e.jsx(ue,{children:e.jsx(Ln,{})})}));
