import{r as v,j as e,c as Xe}from"./react-vendor-ovhI6CXq.js";import{A as ye,F as M,M as Re,a as H,T as ue,S as V,I as z,D as Qe,B as c,C as en,z as nn,R as Fe,b as ae,L as ce,c as Se,d as q,e as tn,f as an,g as rn,h as E,i as Q,j as Me,k as ze,l as De,m as Be,n as le,o as sn,p as ln,q as on,r as cn,s as me,t as D,u as Pe,v as oe,E as G,w as fe,x as re,y as Ve,G as he,H as dn,J as se,K as pn,N as Ie,O as be,P as Oe,Q as ne,U as un,V as Ue,W as mn,X as hn,Y as bn,Z as vn,_ as xn,$ as yn,a0 as fn,a1 as jn,a2 as gn}from"./antd-vendor-A7Q2YyN2.js";const wn=`        <section id="overview" class="tab-panel">\r
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
`,kn=`        <details id="register-panel">\r
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
`,qe="voken:updated";function He(){const n=window.location.pathname;return n.endsWith("/app")||n.endsWith("/app/")?n.replace(/\/app\/?$/,"/app-assets/"):"/app-assets/"}let ee;function _n(){return ee||(window.__VOKEN_REACT__=!0,ee=(async()=>{for(const n of["auth","workspace","login-form","logout","balance","refresh","wb-filter","company-form","discovery-form"])if(!document.getElementById(n))throw new Error("界面初始化未完成，请刷新重试。");for(const n of["app.js","account.js","discovery.js","directory.js","workbench.js","react-bridge.js"])await new Promise((a,s)=>{const r=document.createElement("script");r.src=He()+n+"?v="+(new URL(import.meta.url).searchParams.get("v")||"development");const l=()=>window.removeEventListener("error",d),d=p=>{p.filename&&p.filename.split("?")[0]===r.src.split("?")[0]&&(l(),s(new Error("界面资源初始化失败，请刷新重试。")))};window.addEventListener("error",d),r.onload=()=>{l(),a()},r.onerror=()=>{l(),s(new Error("界面资源加载失败，请刷新重试。"))},document.head.appendChild(r)});return window.voken})(),ee)}function Nn({action:n,bridge:a,onClose:s,onSaved:r}){var h,N;const{message:l}=ye.useApp(),[d]=M.useForm(),[p,j]=v.useState(!1),[A,u]=v.useState(""),m=M.useWatch("type",d),R=n.kind==="review"?"记录企业匹配评审":n.kind==="event"?"记录联系进展":`为 ${((h=n.ids)==null?void 0:h.length)||0} 家企业安排跟进`;async function _(x){var C;if(!p){j(!0),u("");try{n.kind==="review"?await a.post("/assessments",{prospect_id:n.row.id,status:x.status,reason:x.reason.trim()}):n.kind==="event"?await a.post("/events",{prospect_id:n.row.prospect_id,email:((C=x.email)==null?void 0:C.trim())||"",type:x.type,content:x.content.trim(),source:"user_recorded"},"event"):(await a.post("/followups",{prospect_ids:n.ids,due_at:x.due_at.toISOString(),intervals_days:(x.intervals||"").split(/[,，]/).filter(y=>y.trim()).map(Number),objective:x.objective.trim()},"followup"),a.select([])),s(),l.success(n.kind==="review"?"企业评审已保存":n.kind==="event"?"联系进展已记录":"跟进提醒已安排"),r()}catch(y){u(y.message)}finally{j(!1)}}}return e.jsxs(Re,{title:R,open:!0,onCancel:()=>{p||s()},maskClosable:!p,keyboard:!p,closable:!p,footer:null,children:[A&&e.jsx(H,{type:"error",title:A,showIcon:!0,className:"modal-error"}),e.jsxs(M,{form:d,layout:"vertical",disabled:p,scrollToFirstError:{focus:!0},"data-extension":"react",onFinish:x=>void _(x),initialValues:{status:"unknown",type:"reply",email:((N=n.row)==null?void 0:N.email)||""},children:[n.kind==="review"&&e.jsxs(e.Fragment,{children:[e.jsxs(ue.Paragraph,{type:"secondary",children:[n.row.name," · 新增独立评审记录，并保留原始证据。"]}),e.jsx(M.Item,{name:"status",label:"企业匹配判断",rules:[{required:!0}],children:e.jsx(V,{options:[{value:"fit",label:"符合目标客户画像"},{value:"not_fit",label:"不符合"},{value:"unknown",label:"依据不足，待核实"}]})}),e.jsx(M.Item,{name:"reason",label:"理由与来源证据",rules:[{required:!0,whitespace:!0,message:"请填写判断理由与证据"}],children:e.jsx(z.TextArea,{maxLength:1e3,rows:4,showCount:!0,placeholder:"说明企业角色、产品匹配与判断依据"})})]}),n.kind==="event"&&e.jsxs(e.Fragment,{children:[e.jsxs(ue.Paragraph,{type:"secondary",children:[n.row.company," · ",n.row.name||"已记录的联系入口"]}),e.jsx(M.Item,{name:"type",label:"事件类型",rules:[{required:!0}],children:e.jsx(V,{options:[{value:"reply",label:"收到回复"},{value:"bounce",label:"退信"},{value:"opt_out",label:"拒绝联系"},{value:"meeting",label:"会议"},{value:"note",label:"备注"}]})}),e.jsx(M.Item,{name:"email",label:"事件关联邮箱",rules:[{required:["bounce","opt_out"].includes(m),message:"退信或拒绝联系时请填写事件邮箱"},{type:"email",message:"请输入有效邮箱"}],children:e.jsx(z,{type:"email",maxLength:254})}),e.jsx(M.Item,{name:"content",label:"联系进展",rules:[{required:!0,whitespace:!0,message:"请填写联系进展"}],children:e.jsx(z.TextArea,{maxLength:4e3,rows:4,showCount:!0})}),e.jsx(H,{type:"info",title:"退信与拒绝联系会拦截后续发送；收到回复会暂停后续提醒。"})]}),n.kind==="followup"&&e.jsxs(e.Fragment,{children:[e.jsx(M.Item,{name:"due_at",label:"首次提醒时间（本地时间）",rules:[{required:!0,message:"请选择首次提醒时间"}],children:e.jsx(Qe,{showTime:{format:"HH:mm"},format:"YYYY-MM-DD HH:mm",placeholder:"选择提醒时间",className:"full-width"})}),e.jsx(M.Item,{name:"intervals",label:"后续提醒（相对首次的天数）",rules:[{validator:(x,C)=>{const y=String(C||"").split(/[,，]/).filter(b=>b.trim()).map(Number);return y.length<=5&&y.every(b=>Number.isInteger(b)&&b>=1&&b<=90)&&new Set(y).size===y.length&&y.every((b,T)=>T===0||b>y[T-1])?Promise.resolve():Promise.reject(new Error("最多填写 5 个不同的 1–90 整数天数，递增并以逗号分隔"))}}],children:e.jsx(z,{placeholder:"例如：3,7,14"})}),e.jsx(M.Item,{name:"objective",label:"跟进目标",rules:[{required:!0,whitespace:!0,message:"请填写跟进目标"}],children:e.jsx(z.TextArea,{rows:3,maxLength:500,showCount:!0,placeholder:"例如：核对采购职责，审阅并准备第一封开发信"})}),e.jsx(H,{type:"info",title:"这里只安排提醒。每封邮件仍需单独审阅确认后发送。"})]}),e.jsxs("div",{className:"modal-form-footer",children:[e.jsx(c,{onClick:s,disabled:p,children:"取消"}),e.jsx(c,{type:"primary",htmlType:"submit",loading:p,children:n.kind==="review"?"保存评审":n.kind==="event"?"记录进展":"安排提醒"})]})]})]})}const je={mode:"companies",q:"",country_filter:"",stage:"",tag:"",target:"procurement",verification:"",role_filter:"",has_email:!1,due:!1,ready_only:!1},Ee=["company","location","stage","contacts","assessment","action"],Ge="voken-workbench-display-v1";function ie(n){return Object.fromEntries(Object.entries(je).map(([a,s])=>[a,typeof s=="boolean"?n[a]===!0:String(n[a]??s).trim()]))}function Ae(n,a){return JSON.stringify(ie(n))===JSON.stringify(ie(a))}function Cn(n,a,s){const r=ie(n),l={q:`搜索：${r.q}`,country_filter:`地区：${r.country_filter}`,stage:`阶段：${a[String(r.stage)]||r.stage}`,tag:`标签：${r.tag}`,target:{leadership:"目标：企业负责人",sales:"目标：销售 / 业务开发"}[String(r.target)],verification:`邮箱：${s[String(r.verification)]||r.verification}`,role_filter:{keyword_match:"命中岗位关键词",needs_review:"岗位待核实",unknown:"岗位未知"}[String(r.role_filter)],has_email:"有完整邮箱",due:"到期跟进",ready_only:"已评审、岗位匹配且邮箱近期有效"};return Object.entries(r).filter(([d,p])=>d!=="mode"&&p!==je[d]).map(([d])=>({key:d,label:l[d]||d}))}function ve(n){const a=n&&typeof n=="object"?n:{},s=Array.isArray(a.columns)?a.columns:null,r=s?Ee.filter(l=>["company","action"].includes(l)||s.includes(l)):[...Ee];return{density:a.density==="compact"?"compact":"comfortable",columns:r}}function Sn(){try{return ve(JSON.parse(localStorage.getItem(Ge)||"null"))}catch{return ve(null)}}function In(n){try{localStorage.setItem(Ge,JSON.stringify(ve(n)))}catch{}}function qn(n){if(!n)return"未提供";const a=new Date(String(n));return Number.isNaN(a.getTime())?"日期待核实":a.toLocaleString("zh-CN",{hour12:!1})}const $e={created:"保存客户",updated:"调整跟进",note:"备注",email_sent:"已发送邮件",reply:"收到回复",call:"通话",meeting:"会议",feedback:"线索反馈",opt_out:"拒绝联系",draft_requested:"生成开发信",research_requested:"公域查证",contact_selected:"采用联系信息",assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒",bounce:"退信"},{Text:f,Title:ge,Paragraph:J}=ue,te={new:"新发现",qualified:"已筛选",contacted:"已联系",replied:"已回复",negotiating:"洽谈中",won:"已成交",lost:"不匹配"},Ke={new:"blue",qualified:"cyan",contacted:"geekblue",replied:"purple",negotiating:"orange",won:"green",lost:"default"},X={valid:"独立验证有效",invalid:"无效 / 不应联系",catch_all:"全收域，待确认",unknown:"未知",unverified:"尚未独立验证"},de={"my-overview":"我的概况","orders-payments":"订单与收款","protection-funding":"保障与资金","ai-capabilities":"AI能力",overview:"业务概况",discover:"发现客户",workbench:"客户工作台",customers:"客户档案",jobs:"任务管理","job-view":"任务详情",directory:"企业与联系人",sources:"商业情报",mail:"邮件管理",company:"企业资料",costs:"用量与费用"},En={"my-overview":"查看业务进展与工作空间用量。",overview:"从发现到跟进，让每一条客户线索都有下一步。",workbench:"筛选企业、核对联系人，集中推进值得跟进的商机。",discover:"从产品与市场出发，找到下一批合适的潜在客户。",jobs:"查看执行进度、核对来源，管理每一次发现。",customers:"保留客户证据与沟通记录，持续推进每一次对话。",directory:"查询企业与目标岗位，按需补充商务联系信息。",sources:"核对企业背景，发现公开采购与市场信号。",company:"让 AI 理解你的企业、产品与目标市场。",mail:"审阅开发信，记录回复，安排下一次跟进。",costs:"查看点数、任务结算和数据使用情况。"},W=n=>Object.entries(n).map(([a,s])=>({value:a,label:s})),Y=qn,w=n=>{n.catch(()=>{})};function xe({href:n,children:a}){let s=!1;try{s=["http:","https:"].includes(new URL(n||"").protocol)}catch{}return s?e.jsx("a",{href:n,target:"_blank",rel:"noopener noreferrer",children:a}):e.jsx(f,{type:"secondary",children:a})}function We({html:n,className:a=""}){const s=v.useRef(null);return v.useEffect(()=>{s.current&&(s.current.innerHTML=n)},[n]),e.jsx("div",{className:`legacy ${a}`,ref:s})}function Ye({compact:n=!1}){return e.jsxs("a",{className:"voken-brand",href:"#my-overview","aria-label":"微元 Voken 首页",children:[e.jsx("img",{className:"brand-symbol",src:`${He()}favicon.svg`,alt:"",width:40,height:40}),!n&&e.jsxs("span",{children:["微元",e.jsx("span",{className:"brand-en",children:"Voken"})]})]})}function An({ready:n}){return e.jsxs("section",{id:"auth",className:"react-auth",onSubmitCapture:a=>{n||a.preventDefault()},children:[e.jsxs("div",{className:"auth-intro",children:[e.jsx(Ye,{}),e.jsxs("div",{className:"auth-intro-copy",children:[e.jsx("p",{className:"auth-kicker",children:"微元 Voken 工作台"}),e.jsxs("h1",{children:["用",e.jsx("span",{className:"brand-highlight",children:" AI "}),"发现客户，",e.jsx("br",{}),"推进每一次",e.jsx("span",{className:"brand-accent",children:"商机"}),"。"]}),e.jsx("p",{className:"auth-lead",children:"核对企业和联系信息、审阅开发信，并跟进客户进展。"})]})]}),e.jsx("div",{className:"auth-form-wrap",children:e.jsxs("div",{className:"auth-form-card",children:[e.jsx(ge,{level:2,children:"登录微元工作台"}),e.jsxs("form",{id:"login-form",className:"login-form",method:"post",children:[e.jsx("label",{htmlFor:"login-phone",children:"手机号"}),e.jsx(z,{id:"login-phone",name:"phone",type:"tel",autoComplete:"username",placeholder:"请输入手机号",size:"large",required:!0}),e.jsx("label",{htmlFor:"login-password",children:"密码"}),e.jsx(z.Password,{id:"login-password",name:"password",autoComplete:"current-password",placeholder:"请输入密码",size:"large",minLength:8,required:!0}),e.jsx(c,{type:"primary",size:"large",htmlType:"submit",block:!0,disabled:!n,loading:!n,children:"进入工作台"})]}),e.jsx(We,{html:kn})]})})]})}function we({items:n}){return e.jsx(Ve,{gutter:[16,16],className:"metric-row",children:n.map(a=>e.jsx(he,{xs:24,sm:12,xl:6,children:e.jsxs(D,{className:"metric-card",children:[e.jsxs("div",{className:"metric-top",children:[e.jsx(f,{type:"secondary",children:a.label}),e.jsx("span",{className:"metric-icon",children:a.icon})]}),e.jsx(xn,{value:a.value,formatter:s=>a.value===void 0?"—":Number(s).toLocaleString()}),e.jsx(f,{type:"secondary",className:"metric-note",children:a.note})]})},a.label))})}function $n({data:n,bridge:a}){var l,d;const s=n.summary,r=[{title:"完善企业资料",text:"告诉 AI 你的产品、优势与市场",tab:"company",icon:e.jsx(se,{})},{title:"发现潜在客户",text:"描述目标，创建小批量找客任务",tab:"discover",icon:e.jsx(be,{})},{title:"筛选并核对",text:"检查企业匹配、岗位和邮箱",tab:"workbench",icon:e.jsx(Oe,{})},{title:"开始商务对话",text:"审阅开发信，记录每一次推进",tab:"mail",icon:e.jsx(oe,{})}];return e.jsxs("div",{className:"native-page",children:[e.jsx("div",{className:"overview-hero",children:e.jsxs("div",{children:[e.jsxs("h2",{children:["发现客户，",e.jsx("span",{className:"brand-highlight",children:"推进商机"})]}),e.jsx("p",{children:"按目标市场和产品找客户，核对来源后加入客户档案。"}),e.jsxs(q,{wrap:!0,children:[e.jsx(c,{type:"primary",icon:e.jsx(fe,{}),onClick:()=>w(a.navigate("discover")),children:"创建找客任务"}),e.jsx(c,{onClick:()=>w(a.navigate("workbench")),children:"进入客户工作台"})]})]})}),e.jsx(we,{items:[{label:"已保存客户",value:s==null?void 0:s.total,note:"你的独立客户管线",icon:e.jsx(le,{})},{label:"到期待跟进",value:s==null?void 0:s.due_followups,note:"到期且允许联系的客户",icon:e.jsx(me,{})},{label:"正在洽谈",value:((l=s==null?void 0:s.stages)==null?void 0:l.negotiating)||(s?0:void 0),note:"持续推进中的商机",icon:e.jsx(re,{})},{label:"已成交",value:((d=s==null?void 0:s.stages)==null?void 0:d.won)||(s?0:void 0),note:"以实际记录为准",icon:e.jsx(Q,{})}]}),e.jsxs(Ve,{gutter:[20,20],children:[e.jsx(he,{xs:24,lg:15,children:e.jsxs(D,{title:"今天值得推进的事",children:[e.jsxs("div",{className:"next-action",children:[e.jsx("span",{className:"action-icon",children:e.jsx(me,{})}),e.jsxs("div",{children:[e.jsx(ge,{level:4,children:s?s.due_followups?`${s.due_followups} 位客户等待下一次跟进`:"开始建立你的下一批商机":"正在加载业务概况"}),e.jsx(J,{type:"secondary",children:s!=null&&s.due_followups?"先核对客户来源和沟通历史，再决定下一次联系。":"完善企业资料，创建找客任务，筛选值得对话的企业。"}),e.jsx(c,{type:"primary",onClick:()=>w(a.navigate(s!=null&&s.due_followups?"workbench":"discover")),children:s!=null&&s.due_followups?"查看待跟进客户":"发现新客户"})]})]}),e.jsxs("div",{className:"overview-note",children:[e.jsx(Q,{})," ",s?`已停止联系 ${s.do_not_contact||0} 位客户；回复和成交数据以实际记录为准。`:"统计仅展示当前工作空间的数据。"]})]})}),e.jsx(he,{xs:24,lg:9,children:e.jsx(D,{title:"清晰的客户开发路径",children:e.jsx("div",{className:"workflow-list",children:r.map((p,j)=>e.jsxs("button",{onClick:()=>w(a.navigate(p.tab)),children:[e.jsx("span",{className:"workflow-icon",children:p.icon}),e.jsxs("span",{children:[e.jsx("b",{children:p.title}),e.jsx("small",{children:p.text})]}),e.jsx(ae,{})]},p.tab))})})})]})]})}function Tn({contact:n,capabilities:a,bridge:s,onChange:r}){var m,R,_,h,N,x,C,y;const[l,d]=v.useState(!1),[p,j]=v.useState(!1),A=async()=>{j(!0);try{await s.post("/verifications",{prospect_id:n.prospect_id,email:n.email,confirm_external_check:!0},"verify"),d(!1),r()}catch{}finally{j(!1)}},u=((m=n.verification)==null?void 0:m.status)||"unverified";return e.jsxs(D,{size:"small",className:"contact-card",children:[e.jsxs(q,{wrap:!0,children:[e.jsx(f,{strong:!0,children:n.name||"公共 / 岗位未知入口"}),e.jsx(E,{children:((R=n.titles)==null?void 0:R.join(" / "))||"岗位未知"}),n.blocked&&e.jsx(E,{color:"red",children:"停止联系"})]}),e.jsx(J,{copyable:n.email?{text:n.email}:!1,children:n.email||"暂无完整邮箱"}),e.jsxs(q,{wrap:!0,children:[e.jsx(E,{color:u==="valid"?"green":u==="invalid"?"red":"default",children:X[u]}),((_=n.verification)==null?void 0:_.stale)&&e.jsx(E,{color:"orange",children:"验证超过 30 天"}),e.jsx(f,{type:"secondary",children:(h=n.role_match)==null?void 0:h.reason})]}),e.jsxs(J,{type:"secondary",className:"contact-meta",children:["验证时间：",Y((N=n.verification)==null?void 0:N.checked_at)," ·"," ",((x=n.verification)==null?void 0:x.history_count)||0," 次历史记录"]}),e.jsx(f,{type:"secondary",children:"供应商标记不替代独立验证，不保证送达。"}),((C=n.warnings)==null?void 0:C.length)>0&&e.jsx(H,{type:"warning",title:n.warnings.map(b=>({email_missing:"尚未取得完整邮箱",domain_relationship_unconfirmed:"邮箱域名与官网关系待核实",recruitment_mailbox:"招聘入口",service_or_quality_mailbox:"服务 / 质量入口",email_pattern_placeholder:"疑似邮箱格式示例",role_unconfirmed:"岗位未知",supplier_marked_invalid:"供应商曾标记无效"})[b]||b).join("；"),showIcon:!0}),((y=n.sources)==null?void 0:y.length)>0&&e.jsx("div",{className:"contact-sources",children:n.sources.map((b,T)=>e.jsxs("div",{children:[e.jsx(xe,{href:b.source_url,children:b.source||"原始来源"}),e.jsxs(f,{type:"secondary",children:[" · ",Y(b.observed_at)]}),b.source_job_id&&e.jsx(c,{type:"link",size:"small","data-job":b.source_job_id,children:"来源任务"})]},T))}),e.jsxs("div",{className:"verification-action",children:[e.jsx(ne,{checked:l,disabled:!a.email_verification||!n.email,onChange:b=>d(b.target.checked),children:"同意将邮箱交给 ZeroBounce 验证，消耗供应商额度"}),e.jsx(c,{loading:p,disabled:!l||!a.email_verification||!n.email,onClick:()=>void A(),children:u==="unverified"?"验证邮箱":"重新验证并保留历史"})]})]})}function Ln({id:n,bridge:a,capabilities:s,onClose:r}){var R,_,h,N,x,C,y,b,T,K;const[l,d]=v.useState(null),[p,j]=v.useState(""),[A,u]=v.useState(0);v.useEffect(()=>{let o=!1;return d(null),j(""),n&&a.detail(n).then(k=>{o||d(k)}).catch(k=>{o||j(k.message)}),()=>{o=!0}},[n,a,A]);const m=l==null?void 0:l.prospect;return e.jsx(De,{title:(m==null?void 0:m.name)||"客户详情",open:!!n,onClose:r,size:720,className:"customer-drawer",footer:e.jsxs("div",{className:"drawer-footer-actions",children:[e.jsx(c,{onClick:r,children:"关闭详情"}),e.jsx(c,{type:"primary",disabled:!m,onClick:()=>{n&&w(a.edit(n).then(r))},children:"编辑档案与跟进"})]}),extra:e.jsx(c,{icon:e.jsx(ze,{}),"aria-label":"刷新客户详情",disabled:!m,type:"primary",onClick:()=>{u(o=>o+1)},children:"刷新"}),children:p?e.jsx(H,{type:"error",title:"客户详情加载失败",description:p,action:e.jsx(c,{onClick:()=>u(o=>o+1),children:"重试"})}):l?e.jsxs(e.Fragment,{children:[e.jsxs(q,{wrap:!0,children:[e.jsx(E,{color:Ke[m.stage],children:te[m.stage]}),m.do_not_contact&&e.jsx(E,{color:"red",children:"拒绝联系"}),(R=m.tags)==null?void 0:R.map(o=>e.jsx(E,{children:o},o))]}),e.jsx(fn,{items:[{key:"profile",label:"企业与证据",children:e.jsxs(e.Fragment,{children:[e.jsx(jn,{column:1,bordered:!0,size:"small",items:[{key:"location",label:"国家 / 地区",children:m.location||"待核实"},{key:"website",label:"官网",children:e.jsx(xe,{href:m.website,children:m.website||"未提供"})},{key:"contact",label:"已记录联系信息",children:m.contact||"未提供"},{key:"followup",label:"下次跟进",children:Y(m.next_followup_at)},{key:"source",label:"来源",children:e.jsx(xe,{href:(h=(_=m.evidence)==null?void 0:_.source)==null?void 0:h.url,children:((x=(N=m.evidence)==null?void 0:N.source)==null?void 0:x.title)||((y=(C=m.evidence)==null?void 0:C.source)==null?void 0:y.url)||"查看原始证据"})}]}),e.jsxs(D,{size:"small",title:"判断依据",className:"drawer-evidence",children:[e.jsx(J,{children:((b=m.evidence)==null?void 0:b.reason)||((T=m.evidence)==null?void 0:T.source_note)||"暂无补充依据，请核对原始来源。"}),e.jsx(H,{type:"info",title:"企业匹配、岗位匹配与邮箱有效性分别判断；历史信息不代表当前采购需求。"})]}),((K=l.duplicates)==null?void 0:K.length)>0&&e.jsx(D,{size:"small",title:"疑似关联 / 重复档案（尚未合并）",className:"drawer-evidence",children:l.duplicates.map(o=>e.jsxs(J,{children:[e.jsx(f,{strong:!0,children:o.name}),e.jsx("br",{}),e.jsx(f,{type:"secondary",children:o.reason}),e.jsx(c,{type:"link",onClick:()=>w(a.edit(o.id).then(r)),children:"打开档案核对"})]},o.id))})]})},{key:"contacts",label:`联系人 (${l.contacts.length})`,children:l.contacts.length?e.jsx(q,{orientation:"vertical",className:"full-width",children:l.contacts.map((o,k)=>e.jsx(Tn,{contact:o,capabilities:s,bridge:a,onChange:()=>{u(I=>I+1),w(a.refresh())}},o.email+":"+k))}):e.jsx(G,{description:"暂无完整邮箱候选，可在客户档案中查询企业与岗位"})},{key:"history",label:"跟进与验证历史",children:!l.activities.length&&!l.records.length?e.jsx(G,{image:G.PRESENTED_IMAGE_SIMPLE,description:"暂无跟进或验证记录，可在客户档案中记录下一步"}):e.jsx(gn,{items:[...l.activities.map(o=>({time:o.created_at,title:$e[o.kind]||"其他记录",content:o.content})),...l.records.map(o=>({time:o.created_at,title:{assessment:"企业匹配评审",verification:"独立邮箱验证",contact_event:"联系事件",followup:"跟进提醒",followup_done:"完成提醒"}[o.kind]||o.kind,content:(o.kind==="followup"?`提醒时间：${Y(o.data.due_at)} · ${o.data.objective||""}`:"")||(o.kind==="contact_event"?`${$e[o.data.type]||"联系事件"} · ${o.data.email||""}：${o.data.content||""}`:"")||o.data.reason||o.data.content||o.data.objective||X[o.data.status]||o.data.status}))].sort((o,k)=>String(k.time).localeCompare(String(o.time))).map((o,k)=>({key:k,title:e.jsxs(e.Fragment,{children:[e.jsx(f,{strong:!0,children:o.title}),e.jsx("div",{children:e.jsx(f,{type:"secondary",children:Y(o.time)})})]}),content:o.content}))})}]},n)]}):e.jsx(yn,{active:!0,paragraph:{rows:10}})})}const L=je;function Rn({data:n,bridge:a}){var _e;const s=dn.useBreakpoint(),r=n.workbench,l=r.summary,[d,p]=v.useState(r.filters||L),[j,A]=v.useState(!1),[u,m]=v.useState(null),[R,_]=v.useState(!1),[h,N]=v.useState(""),[x,C]=v.useState(!1),[y,b]=v.useState(Sn),T=y.columns,K=t=>b(i=>({...i,columns:t}));v.useEffect(()=>In(y),[y]);const[o,k]=v.useState(null),I=r.filters||L,B=I.mode==="contacts",g=JSON.stringify(I),F=!Ae(d,I),$=Cn(I,te,X),Z=(r.views||[]).findIndex(t=>Ae(t.data,I)),Je=t=>{const i={...ie(I),[t]:L[t]};p(i),O(i)};v.useEffect(()=>{p({...L,...I})},[g]);const P=(t,i)=>p(S=>({...S,[t]:i})),O=(t=d)=>w(a.filter(t)),ke=[{key:"company",title:"企业名称",dataIndex:"name",width:250,fixed:s.md?"left":void 0,render:(t,i)=>{var S;return e.jsxs("div",{className:"company-cell",children:[e.jsx(Me,{shape:"square",className:"company-avatar",children:String(t).slice(0,1).toUpperCase()}),e.jsxs("div",{children:[e.jsx(c,{type:"link",onClick:()=>m(i.id),children:t}),e.jsx(f,{type:"secondary",children:i.blocked?"存在停止联系记录":i.next_action}),((S=i.duplicates)==null?void 0:S.length)>0&&e.jsxs(E,{color:"orange",children:["疑似关联 ",i.duplicates.length," 份"]})]})]})}},{key:"location",title:"国家 / 地区",dataIndex:"country",width:135,render:t=>t||"待核实"},{key:"stage",title:"销售阶段",dataIndex:"stage",width:115,render:t=>e.jsx(E,{color:Ke[t],children:te[t]||t})},{key:"contacts",title:"联系信息",width:170,render:(t,i)=>e.jsxs("div",{children:[e.jsxs("span",{children:[i.email_count," 个完整邮箱"]}),e.jsx("br",{}),e.jsxs(f,{type:"secondary",children:[i.contact_count," 条入口 · ",i.verified_count," 个验证有效"]})]})},{key:"assessment",title:"企业匹配",width:140,render:(t,i)=>{var S,U;return e.jsx(E,{color:((S=i.assessment)==null?void 0:S.status)==="fit"?"green":"default",children:{fit:"人工评审符合",not_fit:"人工评审不符合",unknown:"依据不足",unreviewed:"尚未评审"}[(U=i.assessment)==null?void 0:U.status]||"待核实"})}},{key:"action",title:"操作",width:210,fixed:s.md?"right":void 0,render:(t,i)=>e.jsxs(q,{size:0,children:[e.jsx(c,{type:"link",onClick:()=>m(i.id),children:"详情"}),e.jsx(c,{type:"link","data-wb-enrich":i.id,children:"查联系人"}),e.jsx(c,{type:"link",onClick:()=>k({kind:"review",row:i}),children:"评审"})]})}],Ze=[{key:"company",title:"联系人 / 企业",width:240,fixed:s.md?"left":void 0,render:(t,i)=>e.jsxs("div",{children:[e.jsx(c,{type:"link",onClick:()=>m(i.prospect_id),children:i.name||"公共 / 岗位未知入口"}),e.jsx("br",{}),e.jsx(f,{type:"secondary",children:i.company})]})},{key:"email",title:"邮箱",dataIndex:"email",width:240,render:(t,i)=>e.jsxs(e.Fragment,{children:[e.jsx(f,{copyable:t?{text:t}:!1,children:t||"暂无完整邮箱"}),i.blocked&&e.jsx(E,{color:"red",children:"停止联系"})]})},{key:"role",title:"岗位判断",width:240,render:(t,i)=>{var S,U;return e.jsxs(e.Fragment,{children:[e.jsx("div",{children:((S=i.titles)==null?void 0:S.join(" / "))||"岗位未知"}),e.jsx(f,{type:"secondary",children:(U=i.role_match)==null?void 0:U.reason})]})}},{key:"verification",title:"独立邮箱验证",width:180,render:(t,i)=>{var S,U,Ne,Ce;return e.jsxs(e.Fragment,{children:[e.jsx(E,{color:((S=i.verification)==null?void 0:S.status)==="valid"?"green":((U=i.verification)==null?void 0:U.status)==="invalid"?"red":"default",children:X[(Ne=i.verification)==null?void 0:Ne.status]||"未知"}),((Ce=i.verification)==null?void 0:Ce.stale)&&e.jsx("div",{children:e.jsx(f,{type:"warning",children:"验证超过 30 天"})})]})}},{key:"action",title:"操作",width:150,fixed:s.md?"right":void 0,render:(t,i)=>e.jsxs(q,{size:0,children:[e.jsx(c,{type:"link",onClick:()=>m(i.prospect_id),children:"详情 / 验证"}),e.jsx(c,{type:"link",onClick:()=>k({kind:"event",row:i}),children:"记录"})]})}];return e.jsxs("div",{className:"native-page workbench-page",children:[e.jsx(we,{items:[{label:"企业档案",value:l==null?void 0:l.companies,note:"当前工作空间独立档案",icon:e.jsx(se,{})},{label:"有完整邮箱的企业",value:l==null?void 0:l.companies_with_email,note:"联系信息仍需核实",icon:e.jsx(oe,{})},{label:"去重邮箱",value:l==null?void 0:l.unique_mailboxes,note:"按邮箱去重统计",icon:e.jsx(re,{})},{label:"近期验证有效",value:l==null?void 0:l.verified_mailboxes,note:"独立验证，不保证送达",icon:e.jsx(Q,{})}]}),e.jsxs(D,{className:"workbench-card",children:[e.jsxs("div",{className:"table-heading",children:[e.jsxs("div",{children:[e.jsx(ge,{level:4,children:"客户资源"}),e.jsx(f,{type:"secondary",children:"企业、岗位与邮箱，分开核对，集中推进。"})]}),e.jsxs(q,{wrap:!0,children:[e.jsx(c,{icon:e.jsx(pn,{"aria-hidden":"true"}),onClick:()=>{var i;const t=(i=document.querySelector("#wb-upload"))==null?void 0:i.closest("details");t&&(t.open=!0,t.scrollIntoView({behavior:"smooth",block:"center"}))},children:"导入名单"}),e.jsx(c,{type:"primary",icon:e.jsx(fe,{}),onClick:()=>w(a.navigate("discover")),children:"发现客户"})]})]}),e.jsxs("div",{className:"workbench-tabs",children:[e.jsx(Ie,{value:d.mode,options:[{value:"companies",label:"企业视图",icon:e.jsx(se,{})},{value:"contacts",label:"联系人视图",icon:e.jsx(re,{})}],onChange:t=>{const i={...d,mode:t};p(i),O(i)}}),e.jsx(V,{"aria-label":"应用已保存视图",placeholder:"已保存的筛选视图",allowClear:!0,className:"saved-view-select",value:Z>=0?Z:void 0,options:(r.views||[]).map((t,i)=>({label:t.data.name,value:i})),onChange:t=>{t!==void 0?w(a.applyView(t)):(p({...L}),O({...L}))}})]}),e.jsxs("form",{"data-extension":"react",className:"react-filter",onSubmit:t=>{t.preventDefault(),O()},children:[e.jsxs("div",{className:"filter-main",children:[e.jsx(z,{prefix:e.jsx(be,{}),"aria-label":"搜索企业、姓名或邮箱",placeholder:"搜索企业、姓名或邮箱",maxLength:200,allowClear:!0,value:d.q,onClear:()=>{const t={...d,q:""};p(t),O(t)},onChange:t=>P("q",t.target.value)}),e.jsx(z,{"aria-label":"国家或地区",placeholder:"国家 / 地区",maxLength:100,value:d.country_filter,onChange:t=>P("country_filter",t.target.value)}),e.jsx(V,{"aria-label":"销售阶段",value:d.stage,options:[{value:"",label:"全部销售阶段"},...W(te)],onChange:t=>P("stage",t)}),e.jsx(c,{htmlType:"submit",type:"primary",icon:e.jsx(be,{"aria-hidden":"true"}),loading:n.loading,children:"查询"}),e.jsx(c,{icon:e.jsx(Oe,{}),"aria-expanded":j,"aria-controls":"advanced-customer-filters",onClick:()=>A(t=>!t),children:j?"收起筛选":"更多筛选"})]}),j&&e.jsxs("div",{className:"advanced-filters",id:"advanced-customer-filters",children:[e.jsxs("label",{children:["标签",e.jsx(z,{maxLength:40,value:d.tag,onChange:t=>P("tag",t.target.value)})]}),e.jsxs("label",{children:["目标岗位",e.jsx(V,{"aria-label":"目标岗位",value:d.target,options:W({procurement:"采购 / 供应链",leadership:"企业负责人",sales:"销售 / 业务开发"}),onChange:t=>P("target",t)})]}),e.jsxs("label",{children:["邮箱验证",e.jsx(V,{"aria-label":"独立邮箱验证",value:d.verification,options:[{value:"",label:"全部状态"},...W(X)],onChange:t=>P("verification",t)})]}),e.jsxs("label",{children:["岗位判断",e.jsx(V,{"aria-label":"岗位判断",value:d.role_filter,options:W({"":"全部岗位",keyword_match:"命中目标关键词",needs_review:"未命中，待核实",unknown:"岗位未知"}),onChange:t=>P("role_filter",t)})]})]}),e.jsxs("div",{className:"filter-bottom",children:[e.jsxs(q,{wrap:!0,children:[e.jsx(ne,{checked:d.has_email,onChange:t=>P("has_email",t.target.checked),children:"有完整邮箱"}),e.jsx(ne,{checked:d.due,onChange:t=>P("due",t.target.checked),children:"到期跟进"}),j&&e.jsx(ne,{checked:d.ready_only,onChange:t=>P("ready_only",t.target.checked),children:"已评审、岗位匹配且邮箱近期有效"})]}),e.jsxs(q,{children:[e.jsx(c,{type:"text",onClick:()=>{p({...L}),O({...L})},children:"重置"}),e.jsx(c,{type:"link",disabled:F||n.loading,title:F?"请先应用筛选条件，再保存视图":void 0,onClick:()=>_(!0),children:"保存当前筛选"})]})]})]}),F&&e.jsxs("div",{className:"filter-draft-notice",role:"status",children:[e.jsx(f,{children:"筛选条件已修改，列表仍显示上次查询结果。"}),e.jsx(c,{size:"small",type:"primary",onClick:()=>O(),disabled:n.loading,children:"应用修改"}),e.jsx(c,{size:"small",type:"text",onClick:()=>p({...L,...I}),children:"撤销修改"})]}),$.length>0&&e.jsxs("div",{className:"applied-filters","aria-label":"已应用筛选",children:[e.jsx(f,{type:"secondary",children:"已应用"}),$.map(t=>e.jsx(E,{closable:!n.loading,onClose:()=>Je(t.key),title:t.label,children:t.label},t.key)),e.jsx(c,{type:"link",size:"small",onClick:()=>{p({...L}),O({...L})},children:"清空筛选"})]}),n.workbenchError&&e.jsx(H,{type:"error",title:"客户工作台加载失败",description:n.workbenchError,showIcon:!0,action:e.jsx(c,{onClick:()=>w(a.refresh()),children:"重试"})}),e.jsxs("div",{className:"table-status",children:[e.jsxs(q,{wrap:!0,children:[e.jsxs(f,{type:"secondary","aria-live":"polite",children:["共 ",r.total||0," 条记录"]}),r.lastLoadedAt&&e.jsxs(f,{type:"secondary",className:"last-updated",children:["更新于"," ",new Date(r.lastLoadedAt).toLocaleTimeString("zh-CN",{hour12:!1})]}),((_e=r.selected)==null?void 0:_e.length)>0&&e.jsxs(e.Fragment,{children:[e.jsxs(E,{color:"blue",children:["已选 ",r.selected.length," 家企业"]}),e.jsx(c,{type:"link",size:"small",onClick:()=>k({kind:"followup",ids:r.selected}),children:"安排跟进"}),e.jsx(c,{type:"text",size:"small",onClick:()=>a.select([]),children:"取消选择"})]})]}),e.jsxs(q,{wrap:!0,className:"display-controls",children:[e.jsx(un,{title:"调整表格行间距",children:e.jsx(Ie,{"aria-label":"表格密度",size:"small",value:y.density,options:[{value:"comfortable",label:"舒适"},{value:"compact",label:"紧凑"}],onChange:t=>b(i=>({...i,density:t}))})}),!B&&e.jsx(V,{mode:"multiple","aria-label":"显示的表格列",value:T,onChange:K,maxTagCount:0,maxTagPlaceholder:()=>"列设置",className:"column-select",options:ke.map(t=>({value:String(t.key),label:t.title,disabled:["company","action"].includes(String(t.key))}))})]})]}),!s.md&&e.jsx("div",{className:"table-scroll-hint",children:"左右滑动表格查看更多字段，点击名称打开详情。"}),e.jsx(Ue,{size:y.density==="compact"?"small":"middle",columns:B?Ze:ke.filter(t=>T.includes(String(t.key))),dataSource:n.workbenchError||r.loadedMode!==I.mode?[]:r.items||[],rowKey:t=>B?`${t.prospect_id}:${t.email}:${t.name}`:t.id,loading:n.loading,scroll:{x:B?1100:1050,y:"min(58vh, 640px)"},rowSelection:{selectedRowKeys:(r.items||[]).filter(t=>{var i;return(i=r.selected)==null?void 0:i.includes(B?t.prospect_id:t.id)}).map(t=>B?`${t.prospect_id}:${t.email}:${t.name}`:t.id),onChange:(t,i)=>a.select([...new Set(i.map(S=>B?S.prospect_id:S.id))])},locale:{emptyText:e.jsx(G,{image:G.PRESENTED_IMAGE_SIMPLE,description:n.workbenchError?"数据暂时无法加载":$.length?"没有符合当前条件的客户":"还没有客户档案",children:e.jsx(c,{onClick:()=>{n.workbenchError?w(a.refresh()):$.length?(p({...L}),O({...L})):w(a.navigate("discover"))},children:n.workbenchError?"重新加载":$.length?"清空筛选":"发现第一批客户"})})},pagination:{current:Math.floor((r.offset||0)/30)+1,pageSize:30,total:r.total||0,showSizeChanger:!1,showTotal:t=>`共 ${t} 条`,onChange:t=>w(a.filter(I,(t-1)*30))}}),e.jsxs("div",{className:"table-footnote",children:[e.jsx(Q,{})," ","企业匹配、岗位匹配与邮箱验证分别判断；疑似重复档案尚未合并。"]})]}),o&&e.jsx(Nn,{action:o,bridge:a,onClose:()=>k(null),onSaved:()=>w(a.refresh())}),e.jsx(Ln,{id:u,bridge:a,capabilities:r.capabilities||{},onClose:()=>m(null)}),e.jsxs(Re,{title:"保存当前筛选视图",open:R,onCancel:()=>{x||_(!1)},keyboard:!x,maskClosable:!x,confirmLoading:x,onOk:()=>{h.trim()&&(C(!0),a.saveView(h.trim()).then(()=>{_(!1),N("")}).catch(()=>{}).finally(()=>C(!1)))},okButtonProps:{disabled:!h.trim()||F},okText:"保存视图",children:[e.jsx(J,{type:"secondary",children:"保存已应用到列表的筛选条件，便于下次快速打开。"}),e.jsx(z,{"aria-label":"筛选视图名称",autoFocus:!0,value:h,maxLength:80,placeholder:"例如：美国采购岗位待核查",onChange:t=>N(t.target.value)})]})]})}function Fn({data:n,bridge:a}){const[s,r]=v.useState(""),[l,d]=v.useState(""),p={prospecting:"发现客户",outreach_draft:"开发信草稿",report:"客户报告",source_lookup:"官方情报查询",public_search:"公开检索",directory_companies:"企业查询",directory_people:"人物与岗位",directory_contacts:"联系方式解锁",buyer_search:"采购商匹配",buyer_profile:"企业资料",buyer_contacts:"联系方式",customs_verification:"贸易核验",trade_search:"历史贸易"},j={queued:"排队中",running:"执行中",cancelling:"取消中",succeeded:"已完成",partial:"部分完成",failed:"失败",cancelled:"已取消"},A=n.jobs.filter(u=>(!s||u.operation===s)&&(!l||u.status===l));return e.jsx("div",{className:"native-page",children:e.jsxs(D,{title:"任务记录",extra:e.jsx(c,{type:"primary",icon:e.jsx(fe,{}),onClick:()=>w(a.navigate("discover")),children:"创建任务"}),children:[e.jsxs("div",{className:"task-filter",children:[e.jsx(V,{"aria-label":"任务类型",value:s,options:[{value:"",label:"全部任务类型"},...W(p)],onChange:r}),e.jsx(V,{"aria-label":"任务状态",value:l,options:[{value:"",label:"全部状态"},...W(j)],onChange:d}),e.jsxs(f,{type:"secondary",children:["最近 ",n.jobs.length," 个任务中，显示 ",A.length," 个"]})]}),e.jsx(Ue,{rowKey:"id",dataSource:A,loading:n.loading,scroll:{x:750},pagination:{pageSize:15,showSizeChanger:!1},columns:[{title:"任务类型",dataIndex:"operation",render:(u,m)=>e.jsx(c,{type:"link","data-job":m.id,children:p[u]||u})},{title:"状态",dataIndex:"status",render:u=>e.jsx(mn,{status:u==="succeeded"?"success":u==="running"?"processing":u==="failed"?"error":u==="partial"?"warning":"default",text:j[u]||u})},{title:"创建时间",dataIndex:"created_at",render:Y},{title:"已结算点数",dataIndex:"points_charged",render:u=>Number(u||0).toLocaleString()},{title:"操作",render:(u,m)=>e.jsx(c,{type:"link","data-job":m.id,children:"查看详情"})}],locale:{emptyText:e.jsx(G,{description:"暂无符合条件的任务"})}}),e.jsx(f,{type:"secondary",children:"执行中的任务每 5 秒更新。部分完成的任务请查看已交付结果及缺失说明。"})]})})}const pe=[{key:"my-overview",label:"我的概况",icon:e.jsx(Be,{})},{key:"customers-opportunities",label:"客户与商机",icon:e.jsx(le,{})},{key:"orders-payments",label:"订单与收款",icon:e.jsx(sn,{})},{key:"protection-funding",label:"保障与资金",icon:e.jsx(ln,{})},{key:"ai-capabilities",label:"AI能力",icon:e.jsx(on,{})}];function Mn({tab:n,data:a,bridge:s}){var r,l;return n==="my-overview"?e.jsxs("div",{className:"native-page",children:[e.jsx(we,{items:[{label:"已保存客户",value:(r=a.summary)==null?void 0:r.total,note:"当前工作空间",icon:e.jsx(le,{})},{label:"到期待跟进",value:(l=a.summary)==null?void 0:l.due_followups,note:"到期且允许联系的客户",icon:e.jsx(me,{})}]}),e.jsx(D,{title:"常用入口",className:"section-home-card",children:e.jsxs(q,{wrap:!0,children:[e.jsx(c,{type:"primary",onClick:()=>w(s.navigate("workbench")),children:"进入客户工作台"}),e.jsxs(c,{icon:e.jsx(Fe,{}),onClick:()=>w(s.navigate("costs")),children:[a.balance," · 用量与费用"]})]})})]}):n==="ai-capabilities"?e.jsx(D,{title:"可用能力",className:"section-home-card",children:e.jsxs("div",{className:"workflow-list",children:[e.jsxs("button",{type:"button",onClick:()=>w(s.navigate("discover")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(Pe,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 发现客户"}),e.jsx("small",{children:"根据产品和目标市场建立找客任务"})]}),e.jsx(ae,{})]}),e.jsxs("button",{type:"button",onClick:()=>w(s.navigate("mail")),children:[e.jsx("span",{className:"workflow-icon",children:e.jsx(oe,{})}),e.jsxs("span",{children:[e.jsx("b",{children:"AI 开发信"}),e.jsx("small",{children:"查看和审阅开发信草稿"})]}),e.jsx(ae,{})]})]})}):e.jsx(D,{className:"section-home-card",children:e.jsx(G,{image:G.PRESENTED_IMAGE_SIMPLE,description:n==="orders-payments"?"订单与收款功能暂未开放":"保障与资金功能暂未开放"})})}function zn(){var B;const{message:n}=ye.useApp(),[a,s]=v.useState(null),[r,l]=v.useState(null),[d,p]=v.useState(""),[j,A]=v.useState(!1),[u,m]=v.useState(!1),[R,_]=v.useState(!1);v.useEffect(()=>{const g=()=>{window.voken&&l(window.voken.snapshot())},F=$=>{const Z=$.detail;n.open({type:Z.error?"error":"success",content:Z.message,duration:6})};return window.addEventListener(qe,g),window.addEventListener("voken:message",F),_n().then($=>{s($),l($.snapshot())}).catch($=>p($.message)),()=>{window.removeEventListener(qe,g),window.removeEventListener("voken:message",F)}},[n]);const h=(r==null?void 0:r.tab)||"my-overview",N=pe.find(({key:g})=>g===h||h==="costs"&&g==="my-overview")??pe[1],x=N.key==="customers-opportunities",C=["my-overview","orders-payments","protection-funding","ai-capabilities"].includes(h),y=En[h]||(h==="job-view"?"核对任务结果与来源，准备下一步业务行动。":void 0),b=(g,F=!0)=>{a&&h!==g&&w(a.navigate(g)),F&&_(!1)},T=()=>{var g;(g=document.getElementById("logout"))==null||g.click(),_(!1)},K=e.jsx("nav",{className:"workspace-sections","aria-label":"一级导航",children:pe.map(({key:g,label:F,icon:$})=>e.jsx(c,{type:"text",icon:e.jsx("span",{"aria-hidden":"true",className:"workspace-section-icon",children:$}),"aria-current":g===N.key?"true":void 0,onClick:()=>{g==="customers-opportunities"?x?u||A(!1):b("workbench",!u):b(g)},children:F},g))}),o=[{key:"overview",icon:e.jsx(Be,{}),label:"业务概况"},{type:"group",label:"客户开发",children:[{key:"discover",icon:e.jsx(Pe,{}),label:"发现客户"},{key:"workbench",icon:e.jsx(le,{}),label:"客户工作台"},{key:"customers",icon:e.jsx(re,{}),label:"客户档案"},{key:"jobs",icon:e.jsx(hn,{}),label:"任务管理"}]},{type:"group",label:"业务工具",children:[{key:"directory",icon:e.jsx(bn,{}),label:"企业与联系人"},{key:"sources",icon:e.jsx(vn,{}),label:"商业情报"},{key:"mail",icon:e.jsx(oe,{}),label:"邮件管理"},{key:"company",icon:e.jsx(se,{}),label:"企业资料"}]}],k=e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"workspace-label",children:"客户与商机"}),e.jsx(cn,{"aria-label":"客户与商机导航",theme:"light",mode:"inline",selectedKeys:[h==="job-view"?"jobs":h],items:o,onClick:({key:g})=>b(g)})]}),I=e.jsx("div",{className:"sidebar-bottom",children:e.jsxs("button",{className:"points-entry","aria-label":`${(r==null?void 0:r.balance)||"— 点数"}，用量与费用`,onClick:()=>b("costs"),children:[e.jsx(Fe,{}),e.jsxs("span",{children:[e.jsx("b",{children:(r==null?void 0:r.balance)||"— 点数"}),e.jsx("small",{children:"用量与费用"})]}),e.jsx(ae,{})]})});return e.jsxs(e.Fragment,{children:[e.jsx("div",{id:"toast",role:"status","aria-live":"polite",hidden:!0}),e.jsx(An,{ready:!!a}),d&&e.jsx("div",{className:"startup-error",children:e.jsx(H,{type:"error",title:d,action:e.jsx(c,{onClick:()=>location.reload(),children:"重新加载"})})}),e.jsx("div",{id:"workspace",className:`react-workspace${x?" has-customer-menu":""}`,hidden:!0,children:e.jsxs(ce,{children:[e.jsxs("aside",{className:"primary-sidebar",children:[e.jsx("div",{className:"primary-brand",children:e.jsx(Ye,{compact:!0})}),K,e.jsx(c,{className:"primary-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Se,{}),onClick:T})]}),e.jsx(ce.Sider,{className:"voken-sidebar",width:216,collapsedWidth:68,collapsed:j,breakpoint:"lg",onBreakpoint:m,trigger:null,children:x&&!u&&e.jsxs(e.Fragment,{children:[k,I]})}),e.jsxs(ce,{className:`main-layout ${j?"is-collapsed":""}`,children:[e.jsxs("header",{className:"workspace-topbar",children:[e.jsxs(q,{children:[(u||x)&&e.jsx(c,{type:"text","aria-label":u?"打开导航":j?"展开导航":"收起导航",icon:j||u?e.jsx(tn,{}):e.jsx(an,{}),onClick:()=>u?_(!0):A(g=>!g)}),e.jsx(rn,{items:[{title:"工作空间"},{title:N.label},...N.label===de[h]?[]:[{title:de[h]}]]})]}),e.jsxs(q,{children:[e.jsx(E,{className:"workspace-tag",icon:e.jsx(Q,{}),children:"独立业务空间"}),e.jsx(Me,{size:32,className:"user-avatar",children:"微"})]})]}),e.jsxs("main",{className:"workspace-content",children:[e.jsxs("div",{className:"react-page-header",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"page-title",tabIndex:-1,children:de[h]||"业务概况"}),y&&e.jsx(f,{type:"secondary",children:y})]}),e.jsx(c,{id:"refresh",hidden:C&&h!=="my-overview","aria-label":"刷新当前页面数据",icon:e.jsx(ze,{spin:r==null?void 0:r.loading}),disabled:!a||(r==null?void 0:r.loading),children:"刷新数据"})]}),a&&(r==null?void 0:r.session)&&e.jsxs("div",{children:[C&&e.jsx(Mn,{tab:h,data:r,bridge:a}),h==="overview"&&e.jsx($n,{data:r,bridge:a})," ",h==="workbench"&&e.jsx(Rn,{data:r,bridge:a})," ",h==="jobs"&&e.jsx(Fn,{data:r,bridge:a})]},((B=r.session)==null?void 0:B.workspace_id)||"signed-out"),e.jsx(We,{html:wn,className:"business-pages"}),e.jsxs("div",{className:"compat-controls","aria-hidden":"true",hidden:!0,children:[e.jsx("details",{id:"tools-nav"}),e.jsx("button",{id:"balance"}),e.jsx("button",{id:"logout"})]}),e.jsxs("footer",{className:"workspace-footer",children:[e.jsx("span",{children:"微元 Voken · 让客户开发更进一步"}),e.jsx("span",{children:"公开信息优先，增强由你选择"})]})]})]})]})}),e.jsxs(De,{title:"工作空间导航",placement:"left",open:R&&u&&!!(r!=null&&r.session),onClose:()=>_(!1),className:"mobile-navigation",size:300,children:[K,x&&k,I,e.jsx(c,{className:"mobile-logout","aria-label":"退出登录",type:"text",icon:e.jsx(Se,{}),onClick:T,children:"退出登录"})]})]})}var Le;const Te=(Le=document.querySelector('meta[name="csp-nonce"]'))==null?void 0:Le.content;Xe.createRoot(document.getElementById("root")).render(e.jsx(en,{locale:nn,csp:Te?{nonce:Te}:void 0,theme:{token:{colorPrimary:"#2457e7",colorText:"#10224b",colorTextSecondary:"#5a6884",colorBgLayout:"#f7f9fd",colorBorderSecondary:"#e9edf6",borderRadius:8,fontFamily:'Inter, "Microsoft YaHei", "PingFang SC", sans-serif',fontSize:14,controlHeight:38},components:{Layout:{siderBg:"#ffffff",headerBg:"#ffffff"},Menu:{itemHeight:44,itemMarginBlock:5,itemBorderRadius:8,itemSelectedBg:"#eef3ff"},Table:{headerBg:"#f8faff",cellPaddingBlock:16},Card:{paddingLG:24}}},children:e.jsx(ye,{children:e.jsx(zn,{})})}));
