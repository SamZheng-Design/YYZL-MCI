// Route: /create
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript,
} from '../components'

export function registerCreateRoute(app: Hono<HonoEnv>) {
app.get('/create', (c) => {
  const industries = ['餐饮连锁','智能制造','教育培训','物流供应链','美容健康','零售','SaaS','其他']

  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      {/* Admin intercept — shown via JS if role=admin */}
      <div id="admin-create-block" style="display:none;">
        <div style="text-align:center;margin-top:120px;padding:0 24px;">
          <p style="font-size:15px;color:#78716C;">管理员无法发起项目，请切换到学员或老师账号</p>
          <a href="/admin" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">返回工作台</a>
        </div>
      </div>

      <main class="max-w-lg mx-auto px-4 pt-2 pb-6 page-enter" id="create-main">
        {/* Page title */}
        <div style="text-align:center;padding:8px 0 4px;">
          <h1 style="font-size:20px;font-weight:700;color:#1C1917;font-family:'Noto Sans SC',sans-serif;">发起项目</h1>
          <p style="font-size:13px;color:#A8A29E;margin-top:4px;">填写项目信息，设定收入分成条款</p>
        </div>

        {/* Stepper — 4 steps */}
        <div class="stepper" id="stepper">
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-active" id="dot-1">1</div>
              <div class="stepper-label stepper-label-active" id="label-1">基本信息</div>
            </div>
          </div>
          <div class="stepper-line stepper-line-pending" id="line-1" />
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-pending" id="dot-2">2</div>
              <div class="stepper-label" id="label-2">条款设定</div>
            </div>
          </div>
          <div class="stepper-line stepper-line-pending" id="line-2" />
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-pending" id="dot-3">3</div>
              <div class="stepper-label" id="label-3">企业与收款</div>
            </div>
          </div>
          <div class="stepper-line stepper-line-pending" id="line-3" />
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-pending" id="dot-4">4</div>
              <div class="stepper-label" id="label-4">预览发布</div>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Info — Multi-card layout */}
        <div id="step-1" class="step-panel">
          {/* Card A: Project Basics */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-info-circle detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
              <span>基本信息</span>
            </div>
            <div class="mb-4">
              <label class="form-label">项目名称 <span class="req">*</span></label>
              <input id="f-name" type="text" class="form-input" placeholder="如：星火餐饮华南区20店扩张" maxlength={80} />
            </div>
            <div>
              <label class="form-label">所属行业 <span class="req">*</span></label>
              <select id="f-industry" class="form-select">
                <option value="">请选择行业</option>
                {industries.map(ind => <option value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>

          {/* Card B: Project Description */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-align-left detail-card-header-icon" style="background:linear-gradient(135deg,#F0F9FF,#DBEAFE);color:#2563EB;" />
              <span>项目描述</span>
            </div>
            <div class="mb-4">
              <label class="form-label">项目简介 <span class="req">*</span></label>
              <textarea id="f-desc" class="form-textarea" placeholder="简述项目背景、核心优势和发展计划（200字以内）" maxlength={200} rows={3} />
              <div class="char-count" id="desc-count">0/200</div>
            </div>
            <div>
              <label class="form-label">一句话推介 <span style="font-size:12px;color:#A8A29E;">（选填，将显示在分享卡片上）</span></label>
              <div style="position:relative;">
                <input id="f-highlight-text" type="text" class="form-input" placeholder="如：华南餐饮龙头品牌，月均流水稳定300万" maxlength={50} />
                <div style="position:absolute;right:12px;bottom:-18px;font-size:11px;color:#A8A29E;" id="highlight-text-count">0/50</div>
              </div>
            </div>
          </div>

          {/* Card C: Highlights & Detail */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-star detail-card-header-icon" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;" />
              <span>项目亮点与详情</span>
            </div>
            {/* Highlights in tinted area */}
            <div style="background:#FAFAF9;border-radius:12px;padding:16px;margin-bottom:16px;">
              <label class="form-label" style="margin-bottom:10px;">核心亮点 <span style="font-size:12px;color:#A8A29E;">（选填，最多3条）</span></label>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❶</span>
                  <input id="f-highlight-1" type="text" class="form-input" placeholder="如：18家直营门店，运营超5年" maxlength={30} style="flex:1;" />
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❷</span>
                  <input id="f-highlight-2" type="text" class="form-input" placeholder="如：月均流水300万+" maxlength={30} style="flex:1;" />
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❸</span>
                  <input id="f-highlight-3" type="text" class="form-input" placeholder="如：已获两轮机构投资" maxlength={30} style="flex:1;" />
                </div>
              </div>
            </div>
            <div>
              <label class="form-label">项目详情 <span style="font-size:12px;color:#A8A29E;">（选填）</span></label>
              <textarea id="f-detail" class="form-textarea" placeholder="详细的项目介绍、商业模式、团队背景等" rows={4} />
            </div>
          </div>

          {/* Card D: Attachments */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-paperclip detail-card-header-icon" style="background:linear-gradient(135deg,#F5F5F4,#E7E5E4);color:#57534E;" />
              <span>附件资料 <span style="font-size:12px;color:#A8A29E;font-weight:400;margin-left:4px;">（选填）</span></span>
            </div>
            <div class="upload-zone" id="upload-zone">
              <i class="fas fa-cloud-upload-alt text-text-tertiary mb-2" style="font-size:28px;" />
              <p class="text-text-secondary" style="font-size:13px;">点击上传项目资料</p>
              <p class="text-text-tertiary" style="font-size:11px;">Demo阶段仅记录文件名</p>
              <input id="f-file" type="file" style="display:none;" />
            </div>
            <div id="file-name" class="text-text-secondary mt-2" style="font-size:13px;display:none;">
              <i class="fas fa-paperclip mr-1" />
              <span id="file-name-text" />
            </div>
          </div>

          <div class="btn-row">
            <button class="btn-primary" id="btn-next-1" style="flex:1;">下一步 <i class="fas fa-arrow-right ml-1" style="font-size:12px;" /></button>
          </div>
        </div>

        {/* Step 2: Terms */}
        <div id="step-2" class="step-panel" style="display:none;">
          {/* Reference Cases Card */}
          <div class="detail-card" id="case-toggle" style="padding:14px 18px;cursor:pointer;border:1px solid rgba(0,0,0,0.04);">
            <div class="case-toggle-header">
              <i class="fas fa-lightbulb" style="color:#F59E0B;font-size:14px;flex-shrink:0;" />
              <span style="flex:1;font-size:13px;color:#78716C;">不确定怎么填？查看同行案例参考</span>
              <i class="fas fa-chevron-down case-toggle-arrow" id="case-arrow" style="font-size:12px;" />
            </div>
            <div id="case-content">
              <div style="padding-top:12px;">
                <div style="font-size:14px;font-weight:600;color:#1C1917;margin-bottom:12px;">📊 同行案例参考</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div class="case-item" style="border-left:4px solid #DC2626;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">餐饮连锁</div>
                    <div style="font-size:11px;color:#78716C;">融资 200-500万 · 分成 10-15% · 期限 24-36月 · 年化 10-15%</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #3B82F6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">智能制造</div>
                    <div style="font-size:11px;color:#78716C;">融资 300-800万 · 分成 12-18% · 期限 36-48月 · 年化 8-12%</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #16A34A;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">教育培训</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 8-12% · 期限 18-24月 · 年化 12-18%</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #8B5CF6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">美容健康</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 10-15% · 期限 18-30月 · 年化 10-15%</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #F59E0B;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">物流供应链</div>
                    <div style="font-size:11px;color:#78716C;">融资 500-1000万 · 分成 15-20% · 期限 36-48月 · 年化 8-12%</div>
                  </div>
                </div>
                <div style="font-size:11px;color:#A8A29E;margin-top:8px;">ℹ️ 以上为平台典型案例范围，仅供参考</div>
              </div>
            </div>
          </div>

          {/* Terms Card — restructured: exit mode first */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-file-contract detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
              <span>条款设定</span>
            </div>

            {/* ━━ Group 1: 退出方式（前置，决定后续字段显隐）━━ */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-door-open mr-1.5" style="font-size:11px;color:#D4A853;" />退出条件</div>
              <div class="mb-3">
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">退出方式 <span class="req">*</span>
                  <span class="help-icon" data-help-id="exitMode">?</span>
                </label>
                <div class="help-text">决定合同何时终止。"先到为准"最常用：到期或达到封顶，哪个先到就终止。</div>
                <div style="display:flex;gap:8px;margin-top:4px;">
                  <label class="radio-card" id="exit-both" style="flex:1;">
                    <input type="radio" name="exitMode" value="both" checked />
                    <div class="radio-card-content">
                      <i class="fas fa-check-double" style="color:#B91C1C;font-size:14px;" />
                      <span style="font-size:12px;font-weight:600;">先到为准</span>
                      <span style="font-size:10px;color:#78716C;">期限或封顶</span>
                    </div>
                  </label>
                  <label class="radio-card" id="exit-cap" style="flex:1;">
                    <input type="radio" name="exitMode" value="cap_only" />
                    <div class="radio-card-content">
                      <i class="fas fa-chart-line" style="color:#B45309;font-size:14px;" />
                      <span style="font-size:12px;font-weight:600;">仅封顶</span>
                      <span style="font-size:10px;color:#78716C;">达封顶结束</span>
                    </div>
                  </label>
                  <label class="radio-card" id="exit-term" style="flex:1;">
                    <input type="radio" name="exitMode" value="term_only" />
                    <div class="radio-card-content">
                      <i class="fas fa-calendar-alt" style="color:#2563EB;font-size:14px;" />
                      <span style="font-size:12px;font-weight:600;">仅期限</span>
                      <span style="font-size:10px;color:#78716C;">到期结束</span>
                    </div>
                  </label>
                </div>
              </div>
              {/* 退出方式说明条 */}
              <div id="exit-mode-desc" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;margin-top:4px;">
                <div style="display:flex;align-items:flex-start;gap:8px;">
                  <i class="fas fa-info-circle" style="color:#D97706;font-size:13px;margin-top:2px;flex-shrink:0;" />
                  <span style="font-size:12px;color:#92400E;line-height:1.5;" id="exit-mode-desc-text">
                    先到为准：需要同时设定「封顶退出条件」和「最长分成期限」，满足任一条件合同即终止。
                  </span>
                </div>
              </div>
            </div>

            {/* ━━ Group 2: 基础参数 — 预估月收入 + 年化/倍数 ━━ */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-coins mr-1.5" style="font-size:11px;color:#D4A853;" />基础参数</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">预估月收入 <span class="req">*</span>
                    <span class="help-icon" data-help-id="estimatedMonthlyRevenue">?</span>
                  </label>
                  <div class="help-text">发起人对项目月度收入的预估。这只是预估，实际回款取决于真实经营情况。</div>
                  <div class="input-unit-wrap">
                    <input id="f-revenue" type="number" class="form-input" placeholder="如 30" min={0} step={0.1} />
                    <span class="input-unit">万元</span>
                  </div>
                </div>
                {/* 年化收益率 — 仅封顶/先到为准可见 */}
                <div id="yield-group">
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">年化收益率 <span class="req">*</span>
                    <span id="yield-help-btn2" class="help-icon" style="cursor:pointer;">?</span>
                  </label>
                  <div class="input-unit-wrap">
                    <input id="f-yield" type="number" class="form-input" value="12" min={1} max={50} step={0.5} style="text-align:right;padding-right:32px;font-size:16px;font-weight:600;color:#1C1917;" />
                    <span class="input-unit" style="right:10px;font-weight:600;">%</span>
                  </div>
                  <div style="font-size:11px;color:#78716C;margin-top:4px;">对融资者来说就是资金使用成本</div>
                </div>
                {/* 预期收益倍数 — 仅期限模式可见 */}
                <div id="multiple-group" style="display:none;">
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">预期收益倍数 <span class="req">*</span>
                    <span id="multiple-help-btn" class="help-icon" style="cursor:pointer;">?</span>
                  </label>
                  <div class="input-unit-wrap">
                    <input id="f-expect-multiple" type="number" class="form-input" value="1.3" min={1.01} max={5} step={0.01} style="text-align:right;padding-right:32px;font-size:16px;font-weight:600;color:#1C1917;" />
                    <span class="input-unit" style="right:10px;font-weight:600;">x</span>
                  </div>
                  <div style="font-size:11px;color:#78716C;margin-top:4px;">参与人最多能拿回本金的多少倍，如 1.3x = 赚30%</div>
                </div>
              </div>
            </div>

            {/* ━━ Group 3: 退出参数（动态显隐）━━ */}
            {/* 3A: 封顶退出平息口径 — both / cap_only 可见 */}
            <div class="create-terms-group" id="cap-exit-group">
              <div class="create-terms-group-label"><i class="fas fa-lock mr-1.5" style="font-size:11px;color:#D4A853;" />封顶退出条件</div>
              <label class="form-label" style="display:flex;align-items:center;gap:4px;">平息口径 <span class="req">*</span>
                <span class="help-icon" data-help-id="flatRateBasis">?</span>
              </label>
              <div class="help-text">选择封顶退出的计算口径。月平息最宽松（封顶金额较高），日平息最保守（封顶金额较低）。</div>
              <div style="display:flex;gap:8px;margin-top:4px;">
                <label class="radio-card" id="basis-monthly" style="flex:1;">
                  <input type="radio" name="flatRateBasis" value="monthly" checked />
                  <div class="radio-card-content">
                    <span style="font-size:16px;font-weight:700;color:#1D4ED8;" id="basis-monthly-val">1%</span>
                    <span style="font-size:12px;font-weight:600;">月平息</span>
                    <span style="font-size:10px;color:#78716C;">年化÷12</span>
                  </div>
                </label>
                <label class="radio-card" id="basis-weekly" style="flex:1;">
                  <input type="radio" name="flatRateBasis" value="weekly" />
                  <div class="radio-card-content">
                    <span style="font-size:16px;font-weight:700;color:#1D4ED8;" id="basis-weekly-val">0.23%</span>
                    <span style="font-size:12px;font-weight:600;">周平息</span>
                    <span style="font-size:10px;color:#78716C;">年化÷52</span>
                  </div>
                </label>
                <label class="radio-card" id="basis-daily" style="flex:1;">
                  <input type="radio" name="flatRateBasis" value="daily" />
                  <div class="radio-card-content">
                    <span style="font-size:16px;font-weight:700;color:#1D4ED8;" id="basis-daily-val">0.033%</span>
                    <span style="font-size:12px;font-weight:600;">日平息</span>
                    <span style="font-size:10px;color:#78716C;">年化÷365</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 3B: 最长分成期限 — both / term_only 可见 */}
            <div class="create-terms-group" id="term-exit-group">
              <div class="create-terms-group-label"><i class="fas fa-calendar-alt mr-1.5" style="font-size:11px;color:#D4A853;" />最长分成期限</div>
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;" id="duration-label">最长分成期限 <span class="req">*</span>
                  <span class="help-icon" data-help-id="cooperationTerm">?</span>
                </label>
                <div class="help-text">合作的最长时间。到期后无论是否收回投资，合同自动终止。</div>
                <div class="input-unit-wrap">
                  <input id="f-duration" type="number" class="form-input" placeholder="如 24" min={1} />
                  <span class="input-unit">个月</span>
                </div>
              </div>
            </div>

            {/* ━━ Group 4: 联动滑块 — 收入分成比例 ↔ 融资金额 ━━ */}
            <div class="create-terms-group" id="linkage-group">
              <div class="create-terms-group-label"><i class="fas fa-link mr-1.5" style="font-size:11px;color:#D4A853;" />融资与分成联动</div>

              {/* 联动公式提示 — 动态内容 */}
              <div id="formula-hint" style="background:linear-gradient(135deg,#F0F9FF,#EFF6FF);border:1px solid #BFDBFE;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
                <div style="font-size:12px;font-weight:600;color:#1D4ED8;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
                  <i class="fas fa-calculator" style="font-size:11px;" />
                  融资金额自动计算公式
                </div>
                <div id="formula-hint-text" style="font-size:12px;color:#334155;line-height:1.7;" />
              </div>

              {/* 收入分成比例滑块 */}
              <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <label class="form-label" style="margin-bottom:0;display:flex;align-items:center;gap:4px;">收入分成比例 <span class="req">*</span>
                    <span class="help-icon" data-help-id="revenueShareRatio">?</span>
                  </label>
                  <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
                  <div class="input-unit-wrap" id="input-share-ratio" style="width:100px;flex-shrink:0;">
                    <input id="f-rate" type="number" class="form-input" placeholder="如 12" min={0.1} max={100} step={0.1} style="text-align:right;padding-right:28px;font-size:16px;font-weight:700;color:#2563EB;" />
                    <span class="input-unit" style="right:8px;font-weight:600;">%</span>
                  </div>
                </div>
                <input id="f-rate-slider" type="range" class="terms-slider terms-slider-blue" min="0" max="100" step="0.5" value="10" style="width:100%;" />
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#A8A29E;margin-top:2px;">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 融资总额滑块 */}
              <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <label class="form-label" style="margin-bottom:0;display:flex;align-items:center;gap:4px;">融资总额 <span class="req">*</span>
                    <span class="help-icon" data-help-id="totalAmount">?</span>
                  </label>
                  <div class="help-text">按公式自动计算的融资总额。拖动滑块或手动输入均可，另一项会自动联动。</div>
                  <div class="input-unit-wrap" style="width:120px;flex-shrink:0;">
                    <input id="f-amount" type="number" class="form-input" placeholder="自动计算" min={0} style="text-align:right;padding-right:32px;font-size:16px;font-weight:700;color:#B91C1C;" />
                    <span class="input-unit" style="right:8px;font-weight:600;">万</span>
                  </div>
                </div>
                <input id="f-amount-slider" type="range" class="terms-slider terms-slider-red" min="0" max="5000" step="1" value="0" style="width:100%;" />
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#A8A29E;margin-top:2px;">
                  <span>0万</span>
                  <span id="amount-slider-max-label">5000万</span>
                </div>
                <div id="amount-calc-detail" style="font-size:11px;color:#64748B;margin-top:4px;line-height:1.5;" />
              </div>
            </div>

            {/* ━━ Group 5: 补充信息 — 最低参与额 + 上报频率 ━━ */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-cog mr-1.5" style="font-size:11px;color:#D4A853;" />补充信息</div>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">最低参与额 <span class="req">*</span>
                    <span class="help-icon" data-help-id="minParticipation">?</span>
                  </label>
                  <div class="help-text">每个参与人最少要投多少钱。这个金额除以融资总额就是一份的比例。</div>
                  <div class="input-unit-wrap">
                    <input id="f-minamt" type="number" class="form-input" placeholder="如 10" min={1} />
                    <span class="input-unit">万/份</span>
                  </div>
                </div>
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">上报频率
                    <span class="help-icon" data-help-id="reportFrequency">?</span>
                  </label>
                  <div class="help-text">你多久向参与人汇报一次项目收入。月报适合大部分项目。</div>
                  <select id="f-freq" class="form-select">
                    <option value="每自然月">每自然月</option>
                    <option value="每自然周">每自然周</option>
                    <option value="每自然日">每自然日</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ━━ Group 6: 风控（选填）━━ */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-shield-alt mr-1.5" style="font-size:11px;color:#D4A853;" />项目亏损终止条件（选填）</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label" style="font-size:11px;">连续低收入月数</label>
                  <select id="f-loss-months" class="form-select" style="font-size:13px;">
                    <option value="">不设置</option>
                    <option value="3">连续3个月</option>
                    <option value="6">连续6个月</option>
                    <option value="9">连续9个月</option>
                    <option value="12">连续12个月</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" style="font-size:11px;">收入门槛（万元/月）</label>
                  <div class="input-unit-wrap">
                    <input id="f-loss-amount" type="number" class="form-input" placeholder="如 5" min={0} step={0.1} style="font-size:13px;" />
                    <span class="input-unit" style="font-size:11px;">万</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 隐藏的回收倍数字段（兼容旧逻辑） */}
          <input id="f-multiple" type="hidden" value="1.5" />

          {/* 封顶计算展示卡片 */}
          <div class="detail-card" id="cap-calc-panel" style="background:linear-gradient(135deg,#FEF2F2,#FFF1F2);border:1px solid #FECACA;">
            <div style="font-size:13px;font-weight:600;color:#B91C1C;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
              <i class="fas fa-lock" style="font-size:12px;" />
              封顶退出计算
            </div>
            <div id="cap-calc-detail" style="font-size:12px;color:#44403C;line-height:1.7;" />
          </div>

          {/* Auto-calc card */}
          <div class="detail-card" id="auto-calc" style="background:linear-gradient(135deg,#FEF2F2,#FFF1F2);border:1px solid #FECACA;">
            <div class="detail-card-header" style="margin-bottom:12px;">
              <i class="fas fa-calculator detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
              <span style="font-size:14px;color:#B91C1C;">自动计算</span>
            </div>
            <div class="auto-calc-grid">
              <div>
                <div class="auto-calc-item-label">总份额数</div>
                <div class="auto-calc-item-value" id="calc-shares">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">锚点 k值</div>
                <div class="auto-calc-item-value" id="calc-k" style="font-size:14px;">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label" id="calc-cap-label">等效封顶倍数</div>
                <div class="auto-calc-item-value" id="calc-cap-multiple">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">回收上限</div>
                <div class="auto-calc-item-value" id="calc-cap2">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">月均回款</div>
                <div class="auto-calc-item-value" id="calc-monthly2">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">预估回收期</div>
                <div class="auto-calc-item-value" id="calc-payback">—</div>
              </div>
            </div>
          </div>

          {/* Example card */}
          <div class="detail-card" id="example-card" style="background:#FFFBEB;border:1px solid #FDE68A;padding:16px 18px;">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <i class="fas fa-lightbulb" style="color:#D4A853;font-size:14px;margin-top:2px;flex-shrink:0;" />
              <span id="example-text" style="font-size:13px;color:#78716C;line-height:1.6;">填写条款后，此处会显示参与举例说明</span>
            </div>
          </div>

          {/* Plain language block for create page */}
          <div id="create-plain-lang" class="plain-lang-block" style="display:none;" />

          <div class="btn-row">
            <button class="btn-secondary" id="btn-prev-2"><i class="fas fa-arrow-left mr-1" style="font-size:12px;" /> 上一步</button>
            <button class="btn-primary" id="btn-next-2">下一步 <i class="fas fa-arrow-right ml-1" style="font-size:12px;" /></button>
          </div>
        </div>

        {/* Step 3: Enterprise Info & Payment */}
        <div id="step-3" class="step-panel" style="display:none;">
          {/* Enterprise Info Card */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-building detail-card-header-icon" style="background:linear-gradient(135deg,#DBEAFE,#BFDBFE);color:#2563EB;" />
              <span>企业主体信息</span>
            </div>
            <div class="mb-4">
              <label class="form-label">企业全称 <span class="req">*</span></label>
              <input id="f-company-full" type="text" class="form-input" placeholder="如：深圳市星火餐饮管理有限公司" />
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="form-label">统一社会信用代码 <span class="req">*</span></label>
                <input id="f-credit-code" type="text" class="form-input" placeholder="18位信用代码" maxlength={18} />
              </div>
              <div>
                <label class="form-label">负责人类型</label>
                <select id="f-rep-type" class="form-select">
                  <option value="法定代表人">法定代表人</option>
                  <option value="负责人">负责人</option>
                  <option value="执行事务合伙人">执行事务合伙人</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="form-label">法定代表人 <span class="req">*</span></label>
                <input id="f-legal-rep" type="text" class="form-input" placeholder="姓名" />
              </div>
              <div>
                <label class="form-label">实际控制人</label>
                <input id="f-controller" type="text" class="form-input" placeholder="姓名（选填）" />
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label">实控人身份证号</label>
              <input id="f-controller-id" type="text" class="form-input" placeholder="18位身份证号码（选填）" maxlength={18} />
            </div>
            <div class="mb-4">
              <label class="form-label">注册地址 <span class="req">*</span></label>
              <input id="f-reg-addr" type="text" class="form-input" placeholder="营业执照上的注册地址" />
            </div>
            <div>
              <label class="form-label">经营地址</label>
              <input id="f-biz-addr" type="text" class="form-input" placeholder="实际经营地址（选填，如与注册地址相同可不填）" />
            </div>
          </div>

          {/* Data Transmission Card */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-exchange-alt detail-card-header-icon" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;" />
              <span>数据传输方式</span>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="form-label">传输方式</label>
                <select id="f-transmit" class="form-select">
                  <option value="手工上报">手工上报</option>
                  <option value="自动对接(SaaS)">自动对接(SaaS)</option>
                  <option value="API推送">API推送</option>
                </select>
              </div>
              <div>
                <label class="form-label">分账方式</label>
                <select id="f-payment-mode" class="form-select">
                  <option value="手动分账">手动分账</option>
                  <option value="自动分账">自动分账</option>
                  <option value="平台代扣">平台代扣</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Account Card */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-university detail-card-header-icon" style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#16A34A;" />
              <span>收款银行账户</span>
            </div>
            <div class="mb-4">
              <label class="form-label">收款户名 <span class="req">*</span></label>
              <input id="f-bank-name-acct" type="text" class="form-input" placeholder="与企业全称一致" />
            </div>
            <div class="mb-4">
              <label class="form-label">银行账号 <span class="req">*</span></label>
              <input id="f-bank-number" type="text" class="form-input" placeholder="银行账号" />
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="form-label">开户银行 <span class="req">*</span></label>
                <select id="f-bank-name" class="form-select">
                  <option value="">请选择</option>
                  <option value="中国银行">中国银行</option>
                  <option value="中国工商银行">中国工商银行</option>
                  <option value="中国建设银行">中国建设银行</option>
                  <option value="中国农业银行">中国农业银行</option>
                  <option value="交通银行">交通银行</option>
                  <option value="招商银行">招商银行</option>
                  <option value="中信银行">中信银行</option>
                  <option value="兴业银行">兴业银行</option>
                  <option value="民生银行">民生银行</option>
                  <option value="平安银行">平安银行</option>
                  <option value="浦发银行">浦发银行</option>
                  <option value="光大银行">光大银行</option>
                  <option value="华夏银行">华夏银行</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="form-label">开户支行</label>
                <input id="f-bank-branch" type="text" class="form-input" placeholder="如：深圳南山支行" />
              </div>
            </div>
            <div>
              <label class="form-label">纳税人识别号</label>
              <input id="f-taxpayer" type="text" class="form-input" placeholder="开票用纳税人识别号（选填）" />
            </div>
          </div>

          <div class="btn-row">
            <button class="btn-secondary" id="btn-prev-3"><i class="fas fa-arrow-left mr-1" style="font-size:12px;" /> 上一步</button>
            <button class="btn-primary" id="btn-next-3">下一步 <i class="fas fa-arrow-right ml-1" style="font-size:12px;" /></button>
          </div>
        </div>

        {/* Step 4: Preview & Publish */}
        <div id="step-4" class="step-panel" style="display:none;">
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-eye detail-card-header-icon" style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#16A34A;" />
              <span>项目预览</span>
            </div>

            {/* Preview content — filled by JS */}
            <div id="preview-content" />
          </div>

          <div class="btn-row" style="flex-wrap:wrap;">
            <button class="btn-secondary" id="btn-prev-4" style="flex:0 0 auto;width:auto;padding:0 20px;">
              <i class="fas fa-arrow-left mr-1" style="font-size:12px;" /> 上一步
            </button>
            <button class="btn-secondary" id="btn-draft" style="flex:1;">
              <i class="fas fa-save mr-1" style="font-size:12px;" /> 保存草稿
            </button>
            <button class="btn-primary" id="btn-publish" style="flex:1.5;background:linear-gradient(135deg,#DC2626,#B91C1C);">
              <i class="fas fa-rocket mr-1" style="font-size:12px;" /> 发布到项目大厅
            </button>
          </div>
        </div>
      </main>

      <TabBar active="create" />

      {/* Client script for create project */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  // Admin intercept check
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
    if(cu && cu.role === 'admin'){
      var blockEl = document.getElementById('admin-create-block');
      var mainEl = document.getElementById('create-main');
      if(blockEl) blockEl.style.display = 'block';
      if(mainEl) mainEl.style.display = 'none';
      return;
    }
  } catch(e){}

  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // ════════════════════════════════════════════
  // Utility functions (previously missing — bug fix)
  // ════════════════════════════════════════════
  function getSelectedBasis(){
    var radios = document.querySelectorAll('input[name="flatRateBasis"]');
    for(var i=0;i<radios.length;i++){ if(radios[i].checked) return radios[i].value; }
    return 'monthly';
  }
  function getFlatRate(yieldRate, basis){
    if(basis === 'weekly') return yieldRate / 52;
    if(basis === 'daily') return yieldRate / 365;
    return yieldRate / 12; // monthly default
  }
  function getBasisLabel(basis){ return basis === 'weekly' ? '周' : basis === 'daily' ? '日' : '月'; }
  function getPeriods(durationMonths, basis){
    if(basis === 'weekly') return Math.ceil(durationMonths * 4.33);
    if(basis === 'daily') return Math.ceil(durationMonths * 30.42);
    return durationMonths;
  }
  function getExitMode(){
    var radios = document.querySelectorAll('input[name="exitMode"]');
    for(var i=0;i<radios.length;i++){ if(radios[i].checked) return radios[i].value; }
    return 'both';
  }

  // Step navigation — 4 steps
  var currentStep = 1;
  var TOTAL_STEPS = 4;
  var panels = [null, document.getElementById('step-1'), document.getElementById('step-2'), document.getElementById('step-3'), document.getElementById('step-4')];

  function updateStepper(){
    for(var i=1;i<=TOTAL_STEPS;i++){
      var dot = document.getElementById('dot-'+i);
      var label = document.getElementById('label-'+i);
      if(!dot || !label) continue;
      dot.className = 'stepper-dot ' + (i < currentStep ? 'stepper-dot-done' : i === currentStep ? 'stepper-dot-active' : 'stepper-dot-pending');
      dot.textContent = i < currentStep ? '\\u2713' : i;
      label.className = 'stepper-label ' + (i < currentStep ? 'stepper-label-done' : i === currentStep ? 'stepper-label-active' : '');
    }
    for(var i=1;i<=TOTAL_STEPS-1;i++){
      var line = document.getElementById('line-'+i);
      if(!line) continue;
      line.className = 'stepper-line ' + (i < currentStep ? 'stepper-line-done' : 'stepper-line-pending');
    }
  }

  function goStep(n, direction){
    if(n < 1 || n > TOTAL_STEPS) return;
    var oldPanel = panels[currentStep];
    var newPanel = panels[n];
    if(!oldPanel || !newPanel) return;
    oldPanel.style.display = 'none';
    newPanel.style.display = 'block';
    var enterClass = direction === 'left' ? 'step-panel-enter-left' : 'step-panel-enter-right';
    newPanel.classList.add(enterClass);
    void newPanel.offsetHeight;
    newPanel.classList.remove(enterClass);
    currentStep = n;
    updateStepper();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // ════════════════════════════════════════════
  // Form field references
  // ════════════════════════════════════════════
  var fName = document.getElementById('f-name');
  var fIndustry = document.getElementById('f-industry');
  var fDesc = document.getElementById('f-desc');
  var fDetail = document.getElementById('f-detail');
  var fFile = document.getElementById('f-file');
  var fHighlightText = document.getElementById('f-highlight-text');
  var fHighlight1 = document.getElementById('f-highlight-1');
  var fHighlight2 = document.getElementById('f-highlight-2');
  var fHighlight3 = document.getElementById('f-highlight-3');
  var fAmount = document.getElementById('f-amount');
  var fAmountSlider = document.getElementById('f-amount-slider');
  var fRate = document.getElementById('f-rate');
  var fRateSlider = document.getElementById('f-rate-slider');
  var fDuration = document.getElementById('f-duration');
  var fMinamt = document.getElementById('f-minamt');
  var fRevenue = document.getElementById('f-revenue');
  var fMultiple = document.getElementById('f-multiple');
  var fFreq = document.getElementById('f-freq');
  var fYield = document.getElementById('f-yield');
  var fExpectMultiple = document.getElementById('f-expect-multiple');
  var fLossMonths = document.getElementById('f-loss-months');
  var fLossAmount = document.getElementById('f-loss-amount');
  // Step 3 fields
  var fCompanyFull = document.getElementById('f-company-full');
  var fCreditCode = document.getElementById('f-credit-code');
  var fRepType = document.getElementById('f-rep-type');
  var fLegalRep = document.getElementById('f-legal-rep');
  var fController = document.getElementById('f-controller');
  var fControllerId = document.getElementById('f-controller-id');
  var fRegAddr = document.getElementById('f-reg-addr');
  var fBizAddr = document.getElementById('f-biz-addr');
  var fTransmit = document.getElementById('f-transmit');
  var fPaymentMode = document.getElementById('f-payment-mode');
  var fBankNameAcct = document.getElementById('f-bank-name-acct');
  var fBankNumber = document.getElementById('f-bank-number');
  var fBankName = document.getElementById('f-bank-name');
  var fBankBranch = document.getElementById('f-bank-branch');
  var fTaxpayer = document.getElementById('f-taxpayer');

  // Dynamic group references
  var capExitGroup = document.getElementById('cap-exit-group');
  var termExitGroup = document.getElementById('term-exit-group');
  var yieldGroup = document.getElementById('yield-group');
  var multipleGroup = document.getElementById('multiple-group');
  var capCalcPanel = document.getElementById('cap-calc-panel');
  var exitModeDescText = document.getElementById('exit-mode-desc-text');
  var formulaHintText = document.getElementById('formula-hint-text');

  // ════════════════════════════════════════════
  // Exit mode → UI visibility control
  // ════════════════════════════════════════════
  function updateExitModeUI(){
    var em = getExitMode();
    var showCap = (em === 'both' || em === 'cap_only');
    var showTerm = (em === 'both' || em === 'term_only');
    var showYield = showCap;
    var showMultiple = (em === 'term_only');

    capExitGroup.style.display = showCap ? 'block' : 'none';
    termExitGroup.style.display = showTerm ? 'block' : 'none';
    yieldGroup.style.display = showYield ? 'block' : 'none';
    multipleGroup.style.display = showMultiple ? 'block' : 'none';
    capCalcPanel.style.display = showCap ? 'block' : 'none';

    // Update desc text
    if(em === 'both'){
      exitModeDescText.textContent = '先到为准：需要同时设定「封顶退出条件」和「最长分成期限」，满足任一条件合同即终止。';
    } else if(em === 'cap_only'){
      exitModeDescText.textContent = '仅封顶：达到回收上限后合同自动终止，无固定期限约束。';
    } else {
      exitModeDescText.textContent = '仅期限：到最长分成期限后合同终止，无论是否收回本金。需设定预期收益倍数。';
    }

    // Update formula hint
    updateFormulaHint(em);

    // Update auto-calc label
    var calcCapLabel = document.getElementById('calc-cap-label');
    if(calcCapLabel) calcCapLabel.textContent = showMultiple ? '预期收益倍数' : '等效封顶倍数';
  }

  function updateFormulaHint(em){
    if(!formulaHintText) return;
    if(em === 'term_only'){
      formulaHintText.innerHTML = '融资金额 = 月收入 × 分成比例 × 最长分成期限 ÷ 预期收益倍数<br/>'
        + '<span style="font-size:11px;color:#64748B;">拖动分成比例或融资金额滑块，另一项自动联动。</span>';
    } else if(em === 'cap_only'){
      formulaHintText.innerHTML = '融资金额 = 月收入 × 分成比例 × 预估占用月数 ÷ (1 + 平息 × 期数)<br/>'
        + '<span style="font-size:11px;color:#64748B;">预估占用月数 = 融资金额 ÷ (月收入 × 分成比例)。拖动滑块自动联动。</span>';
    } else {
      formulaHintText.innerHTML = '融资金额 = 月收入 × 分成比例 × 最长分成期限 ÷ (1 + 平息 × 期数)<br/>'
        + '<span style="font-size:11px;color:#64748B;">拖动分成比例或融资金额滑块，另一项自动联动。</span>';
    }
  }

  // Bind exit mode change
  var exitRadios = document.querySelectorAll('input[name="exitMode"]');
  exitRadios.forEach(function(r){
    r.addEventListener('change', function(){
      updateExitModeUI();
      recalcLinkage('rate'); // re-trigger linkage
      updateAutoCalc();
    });
  });
  // Init visibility
  updateExitModeUI();

  // ════════════════════════════════════════════
  // Flat rate basis → update display values
  // ════════════════════════════════════════════
  function updateBasisDisplay(){
    var yr = parseFloat(fYield.value) || 12;
    var mEl = document.getElementById('basis-monthly-val');
    var wEl = document.getElementById('basis-weekly-val');
    var dEl = document.getElementById('basis-daily-val');
    if(mEl) mEl.textContent = (yr/12).toFixed(2) + '%';
    if(wEl) wEl.textContent = (yr/52).toFixed(2) + '%';
    if(dEl) dEl.textContent = (yr/365).toFixed(3) + '%';
  }
  updateBasisDisplay();
  if(fYield) fYield.addEventListener('input', function(){ updateBasisDisplay(); recalcLinkage('rate'); updateAutoCalc(); });
  if(fExpectMultiple) fExpectMultiple.addEventListener('input', function(){ recalcLinkage('rate'); updateAutoCalc(); });
  document.querySelectorAll('input[name="flatRateBasis"]').forEach(function(r){
    r.addEventListener('change', function(){ recalcLinkage('rate'); updateAutoCalc(); });
  });

  // ════════════════════════════════════════════
  // 年化收益率 ? 帮助弹窗
  // ════════════════════════════════════════════
  var yieldHelpBtn2 = document.getElementById('yield-help-btn2');
  if(yieldHelpBtn2){
    yieldHelpBtn2.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
      overlay.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:440px;width:100%;max-height:85vh;overflow-y:auto;padding:0;box-shadow:0 20px 60px rgba(0,0,0,0.3);">'
        +'<div style="background:linear-gradient(135deg,#1E40AF,#3B82F6);padding:20px 24px;border-radius:20px 20px 0 0;color:#fff;">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div style="font-size:18px;font-weight:700;">📐 年化收益率 = 资金成本</div>'
        +'<button id="yield-help-close" style="background:rgba(255,255,255,0.2);border:none;border-radius:50%;width:32px;height:32px;color:#fff;font-size:16px;cursor:pointer;">\\u00D7</button>'
        +'</div>'
        +'<div style="font-size:13px;opacity:0.85;margin-top:6px;">对融资者来说，年化收益率就是你使用这笔资金的成本</div>'
        +'</div>'
        +'<div style="padding:20px 24px;">'
        +'<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:14px;margin-bottom:16px;">'
        +'<div style="font-size:14px;font-weight:700;color:#92400E;margin-bottom:8px;">💰 对融资者的意义</div>'
        +'<div style="font-size:13px;color:#44403C;line-height:1.8;">'
        +'年化收益率就是你「借钱的利率」。例如年化 <b>12%</b>，意味着每使用 <b>100万</b> 一年，你的资金成本约为 <b>12万</b>。<br/>这个数字越高，参与人越愿意投资，但你的成本越高。'
        +'</div></div>'
        +'<div style="background:#F0F9FF;border:1px solid #BFDBFE;border-radius:12px;padding:14px;margin-bottom:16px;">'
        +'<div style="font-size:14px;font-weight:700;color:#1E40AF;margin-bottom:10px;">📊 换算公式</div>'
        +'<div style="font-size:13px;color:#334155;line-height:1.8;">'
        +'<div style="padding:6px 0;border-bottom:1px dashed #BFDBFE;"><b>月平息</b> = 年化 ÷ 12</div>'
        +'<div style="padding:6px 0;border-bottom:1px dashed #BFDBFE;"><b>周平息</b> = 年化 ÷ 52</div>'
        +'<div style="padding:6px 0;"><b>日平息</b> = 年化 ÷ 365</div>'
        +'</div></div>'
        +'<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px;">'
        +'<div style="font-size:14px;font-weight:700;color:#166534;margin-bottom:10px;">💡 计算案例</div>'
        +'<div style="font-size:13px;color:#334155;line-height:1.9;">'
        +'年化 <b>12%</b>，融资 <b>100万</b>，占用 <b>24个月</b>：<br/>'
        +'月平息 = 1%，封顶回收 = 100 + 100 × 1% × 24 = <b>¥124万</b><br/>'
        +'等效倍数 = 1.24x，你的资金成本 = <b>24万</b>'
        +'</div></div>'
        +'</div></div>';
      document.body.appendChild(overlay);
      document.getElementById('yield-help-close').addEventListener('click', function(){
        overlay.style.opacity='0'; overlay.style.transition='opacity 0.2s';
        setTimeout(function(){ overlay.remove(); }, 200);
      });
      overlay.addEventListener('click', function(ev){ if(ev.target===overlay){ overlay.style.opacity='0'; overlay.style.transition='opacity 0.2s'; setTimeout(function(){overlay.remove();},200); }});
    });
  }

  // 预期收益倍数 ? 帮助
  var multipleHelpBtn = document.getElementById('multiple-help-btn');
  if(multipleHelpBtn){
    multipleHelpBtn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
      overlay.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:400px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">'
        +'<div style="font-size:16px;font-weight:700;color:#1C1917;margin-bottom:12px;">📐 预期收益倍数</div>'
        +'<div style="font-size:13px;color:#44403C;line-height:1.8;margin-bottom:16px;">'
        +'参与人在整个合作期内最多能拿回本金的多少倍。<br/><br/>'
        +'例如倍数 <b>1.3x</b>，投入 <b>10万</b>，最多拿回 <b>13万</b>（赚 30%）。<br/>'
        +'倍数 <b>1.0x</b> = 只还本金不赚钱<br/>'
        +'倍数 <b>1.5x</b> = 赚 50%<br/><br/>'
        +'<span style="color:#B91C1C;font-weight:600;">公式：融资金额 = 月收入 × 分成比例 × 期限 ÷ 倍数</span>'
        +'</div>'
        +'<button id="mult-help-close" style="width:100%;padding:12px;background:#1C1917;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">知道了</button>'
        +'</div>';
      document.body.appendChild(overlay);
      document.getElementById('mult-help-close').addEventListener('click', function(){ overlay.remove(); });
      overlay.addEventListener('click', function(ev){ if(ev.target===overlay) overlay.remove(); });
    });
  }

  // ════════════════════════════════════════════
  // CORE: Dual slider linkage — rate ↔ amount
  // ════════════════════════════════════════════
  var _linkageLock = false; // prevent infinite loops

  // Calculate amount from rate (primary direction)
  function calcAmountFromRate(rate){
    var revenue = parseFloat(fRevenue.value) || 0;
    var em = getExitMode();
    if(revenue <= 0 || rate <= 0) return 0;

    if(em === 'term_only'){
      // 融资金额 = 月收入 × 分成比例 × 期限 ÷ 预期收益倍数
      var duration = parseInt(fDuration.value) || 0;
      var mult = parseFloat(fExpectMultiple.value) || 1.3;
      if(duration <= 0 || mult <= 0) return 0;
      return revenue * (rate / 100) * duration / mult;
    } else if(em === 'cap_only'){
      // No fixed duration — iterative solve:
      // amount = revenue × rate% × T / (1 + flatRate × periods(T))
      // where T = amount / (revenue × rate%) → substitute:
      // Let monthlyShare = revenue × rate%
      // amount = monthlyShare × T / (1 + flatRate × periods(T))
      // T = amount / monthlyShare
      // → amount = monthlyShare × (amount/monthlyShare) / (1 + flatRate × periods(T))
      // → amount = amount / (1 + flatRate × periods(T))
      // This is circular. Use iterative approach:
      // Start with T_guess = 24 months, compute amount, then recalc T
      var yieldRate = parseFloat(fYield.value) || 12;
      var basis = getSelectedBasis();
      var flatRate = getFlatRate(yieldRate, basis) / 100;
      var monthlyShare = revenue * (rate / 100);
      // Iterate: guess T → calc amount → recalc T
      var T = 24; // initial guess
      for(var iter = 0; iter < 10; iter++){
        var periods = getPeriods(T, basis);
        var divisor = 1 + flatRate * periods;
        var newAmount = monthlyShare * T / divisor;
        var newT = monthlyShare > 0 ? newAmount / monthlyShare : 0;
        if(Math.abs(newT - T) < 0.01) break;
        T = newT;
      }
      var finalPeriods = getPeriods(T, basis);
      return monthlyShare * T / (1 + flatRate * finalPeriods);
    } else {
      // both: 融资金额 = 月收入 × 分成比例 × 期限 ÷ (1 + 平息 × 期数)
      var duration = parseInt(fDuration.value) || 0;
      var yieldRate = parseFloat(fYield.value) || 12;
      var basis = getSelectedBasis();
      var flatRate = getFlatRate(yieldRate, basis) / 100;
      if(duration <= 0) return 0;
      var periods = getPeriods(duration, basis);
      return revenue * (rate / 100) * duration / (1 + flatRate * periods);
    }
  }

  // Calculate rate from amount (reverse direction)
  function calcRateFromAmount(amount){
    var revenue = parseFloat(fRevenue.value) || 0;
    var em = getExitMode();
    if(revenue <= 0 || amount <= 0) return 0;

    if(em === 'term_only'){
      var duration = parseInt(fDuration.value) || 0;
      var mult = parseFloat(fExpectMultiple.value) || 1.3;
      if(duration <= 0 || mult <= 0) return 0;
      // rate = amount × mult / (revenue × duration) × 100
      return (amount * mult / (revenue * duration)) * 100;
    } else if(em === 'cap_only'){
      // Iterative: rate% = amount × (1 + flatRate × periods(T)) / (revenue × T)
      // where T = amount / (revenue × rate%)
      var yieldRate = parseFloat(fYield.value) || 12;
      var basis = getSelectedBasis();
      var flatRate = getFlatRate(yieldRate, basis) / 100;
      var rateGuess = 10;
      for(var iter = 0; iter < 10; iter++){
        var monthlyShare = revenue * (rateGuess / 100);
        var T = monthlyShare > 0 ? amount / monthlyShare : 24;
        var periods = getPeriods(T, basis);
        var newRate = (amount * (1 + flatRate * periods) / (revenue * T)) * 100;
        if(Math.abs(newRate - rateGuess) < 0.01) break;
        rateGuess = newRate;
      }
      return Math.min(100, Math.max(0, rateGuess));
    } else {
      var duration = parseInt(fDuration.value) || 0;
      var yieldRate = parseFloat(fYield.value) || 12;
      var basis = getSelectedBasis();
      var flatRate = getFlatRate(yieldRate, basis) / 100;
      if(duration <= 0) return 0;
      var periods = getPeriods(duration, basis);
      // rate = amount × (1 + flatRate × periods) / (revenue × duration) × 100
      return (amount * (1 + flatRate * periods) / (revenue * duration)) * 100;
    }
  }

  function recalcLinkage(source){
    if(_linkageLock) return;
    _linkageLock = true;
    try {
      if(source === 'rate'){
        var rate = parseFloat(fRate.value) || 0;
        var newAmount = calcAmountFromRate(rate);
        if(newAmount > 0){
          fAmount.value = Math.round(newAmount * 100) / 100;
          if(fAmountSlider){
            var maxSlider = Math.max(newAmount * 2, 1000);
            fAmountSlider.max = Math.ceil(maxSlider);
            fAmountSlider.value = Math.round(newAmount);
            var maxLabel = document.getElementById('amount-slider-max-label');
            if(maxLabel) maxLabel.textContent = Math.ceil(maxSlider) + '万';
          }
        }
      } else if(source === 'amount'){
        var amount = parseFloat(fAmount.value) || 0;
        var newRate = calcRateFromAmount(amount);
        if(newRate > 0 && newRate <= 100){
          fRate.value = Math.round(newRate * 10) / 10;
          if(fRateSlider) fRateSlider.value = Math.round(newRate * 10) / 10;
        }
      }
    } finally {
      _linkageLock = false;
    }
  }

  // Bind sliders and inputs
  if(fRateSlider){
    fRateSlider.addEventListener('input', function(){
      fRate.value = fRateSlider.value;
      recalcLinkage('rate');
      updateAutoCalc();
    });
  }
  if(fRate){
    fRate.addEventListener('input', function(){
      if(fRateSlider) fRateSlider.value = fRate.value;
      recalcLinkage('rate');
      updateAutoCalc();
    });
  }
  if(fAmountSlider){
    fAmountSlider.addEventListener('input', function(){
      fAmount.value = fAmountSlider.value;
      recalcLinkage('amount');
      updateAutoCalc();
    });
  }
  if(fAmount){
    fAmount.addEventListener('input', function(){
      if(fAmountSlider) fAmountSlider.value = fAmount.value;
      recalcLinkage('amount');
      updateAutoCalc();
    });
  }
  // When revenue or duration changes, re-calc from rate
  if(fRevenue) fRevenue.addEventListener('input', function(){ recalcLinkage('rate'); updateAutoCalc(); });
  if(fDuration) fDuration.addEventListener('input', function(){ recalcLinkage('rate'); updateAutoCalc(); });

  // ════════════════════════════════════════════
  // Char count, file upload, step 1 validation
  // ════════════════════════════════════════════
  var descCount = document.getElementById('desc-count');
  fDesc.addEventListener('input', function(){
    var len = fDesc.value.length;
    descCount.textContent = len + '/200';
    descCount.className = len > 200 ? 'char-count char-count-over' : 'char-count';
  });
  var htCount = document.getElementById('highlight-text-count');
  fHighlightText.addEventListener('input', function(){
    var len = fHighlightText.value.length;
    htCount.textContent = len + '/50';
    htCount.style.color = len > 50 ? '#DC2626' : '#A8A29E';
  });

  var uploadZone = document.getElementById('upload-zone');
  var fileNameDiv = document.getElementById('file-name');
  var fileNameText = document.getElementById('file-name-text');
  var uploadedFileName = '';
  uploadZone.addEventListener('click', function(){ fFile.click(); });
  fFile.addEventListener('change', function(){
    if(fFile.files && fFile.files.length > 0){
      uploadedFileName = fFile.files[0].name;
      fileNameText.textContent = uploadedFileName;
      fileNameDiv.style.display = 'block';
    }
  });

  document.getElementById('btn-next-1').addEventListener('click', function(){
    var errors = [];
    if(!fName.value.trim()) errors.push('项目名称');
    if(!fIndustry.value) errors.push('所属行业');
    if(!fDesc.value.trim()) errors.push('项目简介');
    if(fDesc.value.length > 200) errors.push('项目简介超过200字');
    if(errors.length > 0){ showToast('请填写：' + errors.join('、'), 'error'); return; }
    goStep(2, 'right');
    // Nudge
    if (!localStorage.getItem('zlc_nudge_create_terms')) {
      var termsNudgeTimer = setTimeout(function(){ showNudge('\\uD83D\\uDCCA', '不确定怎么填？展开上方的「同行案例参考」看看', 'create_terms'); }, 30000);
      function cancelTermsNudge(){ clearTimeout(termsNudgeTimer); }
      [fAmount, fRate, fDuration, fMinamt, fRevenue, fYield].forEach(function(input){
        if(input) input.addEventListener('input', cancelTermsNudge);
      });
      window.addEventListener('beforeunload', cancelTermsNudge);
    }
  });

  // Reference cases toggle
  var caseToggle = document.getElementById('case-toggle');
  var caseContent = document.getElementById('case-content');
  var caseArrow = document.getElementById('case-arrow');
  if(caseToggle && caseContent && caseArrow){
    caseToggle.addEventListener('click', function(){
      caseContent.classList.toggle('expanded');
      caseArrow.classList.toggle('rotate-180');
    });
  }

  if(typeof initHelpIcons === 'function') initHelpIcons();

  // ════════════════════════════════════════════
  // Auto-calc panel update
  // ════════════════════════════════════════════
  function updateAutoCalc(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var em = getExitMode();

    var shares = minamt > 0 && amount > 0 ? Math.floor(amount / minamt) : 0;
    var k = rate > 0 ? amount / rate : 0;
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;

    // Cap calculation depends on mode
    var cap = 0, capMultiple = 1;
    var basisLabel = '月', flatRatePct = 0, periods = 0;

    if(em === 'term_only'){
      var mult = parseFloat(fExpectMultiple.value) || 1.3;
      capMultiple = mult;
      cap = amount * mult;
    } else {
      var yieldRate = parseFloat(fYield.value) || 12;
      var basis = getSelectedBasis();
      flatRatePct = getFlatRate(yieldRate, basis);
      var flatRate = flatRatePct / 100;
      basisLabel = getBasisLabel(basis);

      if(em === 'cap_only'){
        // Use estimated payback as duration
        var estDuration = payback > 0 ? payback : 24;
        periods = getPeriods(estDuration, basis);
      } else {
        periods = getPeriods(duration, basis);
      }
      cap = amount + amount * flatRate * periods;
      capMultiple = amount > 0 ? cap / amount : 1;
    }

    // Update hidden recovery multiple
    if(fMultiple) fMultiple.value = capMultiple.toFixed(4);

    document.getElementById('calc-shares').textContent = shares > 0 ? shares + ' 份' : '—';
    document.getElementById('calc-k').textContent = k > 0 ? k.toFixed(2) + '万/1%' : '—';
    document.getElementById('calc-cap-multiple').textContent = capMultiple > 1 ? capMultiple.toFixed(2) + 'x' : '—';
    document.getElementById('calc-cap2').textContent = cap > 0 ? '\\u00A5' + cap.toFixed(1) + '万' : '—';
    document.getElementById('calc-monthly2').textContent = monthly > 0 ? '\\u00A5' + monthly.toFixed(2) + '万' : '—';
    document.getElementById('calc-payback').textContent = payback > 0 ? payback + ' 个月' : '—';

    // Cap calc detail panel (only for cap modes)
    var capDetailEl = document.getElementById('cap-calc-detail');
    if(capDetailEl){
      if(em === 'term_only'){
        var mult = parseFloat(fExpectMultiple.value) || 1.3;
        if(amount > 0){
          capDetailEl.innerHTML = '<strong>回收上限</strong> = 融资金额 × 预期收益倍数<br/>'
            + '= ' + amount.toFixed(2) + ' × ' + mult.toFixed(2) + ' = <strong style="color:#B91C1C;">\\u00A5' + cap.toFixed(2) + '万</strong>';
        } else { capDetailEl.innerHTML = ''; }
      } else if(amount > 0 && periods > 0){
        capDetailEl.innerHTML = '<strong>回收上限</strong> = 本金 + 本金 × ' + basisLabel + '平息 × ' + basisLabel + '数<br/>'
          + '= ' + amount.toFixed(2) + ' + ' + amount.toFixed(2) + ' × ' + flatRatePct.toFixed(3) + '% × ' + periods
          + ' = <strong style="color:#B91C1C;">\\u00A5' + cap.toFixed(2) + '万</strong>（等效 ' + capMultiple.toFixed(2) + 'x）<br/>'
          + '<span style="font-size:11px;color:#78716C;">不足一个' + basisLabel + '按一个' + basisLabel + '计算</span>';
      } else { capDetailEl.innerHTML = ''; }
    }

    // Calc detail under amount
    var calcDetailEl = document.getElementById('amount-calc-detail');
    if(calcDetailEl && amount > 0 && rate > 0 && revenue > 0){
      if(em === 'term_only'){
        var mult = parseFloat(fExpectMultiple.value) || 1.3;
        calcDetailEl.innerHTML = '= ' + revenue + ' × ' + rate + '% × ' + duration + ' ÷ ' + mult.toFixed(2) + ' = ' + amount.toFixed(2) + '万';
      } else if(em === 'cap_only'){
        var yieldRate = parseFloat(fYield.value) || 12;
        var estT = payback > 0 ? payback : 24;
        calcDetailEl.innerHTML = '= ' + revenue + ' × ' + rate + '% × ~' + estT + '月 ÷ (1 + ' + flatRatePct.toFixed(3) + '% × ' + periods + ') = ' + amount.toFixed(2) + '万';
      } else {
        calcDetailEl.innerHTML = '= ' + revenue + ' × ' + rate + '% × ' + duration + ' ÷ (1 + ' + flatRatePct.toFixed(3) + '% × ' + periods + ') = ' + amount.toFixed(2) + '万';
      }
    } else if(calcDetailEl){ calcDetailEl.innerHTML = ''; }

    // Example
    var exampleEl = document.getElementById('example-text');
    if(minamt > 0 && monthly > 0 && amount > 0){
      var perShareMonthly = revenue * (rate / 100) * (minamt / amount);
      var perSharePayback = Math.ceil(minamt / perShareMonthly);
      var perShareCap = minamt * capMultiple;
      exampleEl.textContent = '如果参与 \\u00A5' + minamt + '万，预估每月回款 \\u00A5' + perShareMonthly.toFixed(2) + '万，约' + perSharePayback + '个月收回本金，回收上限 \\u00A5' + perShareCap.toFixed(2) + '万';
    } else {
      exampleEl.textContent = '填写条款后，此处会显示参与举例说明';
    }

    // Plain language block
    var plEl = document.getElementById('create-plain-lang');
    if(plEl){
      if(amount > 0 && rate > 0 && revenue > 0 && minamt > 0){
        var monthlyShareAll = revenue * (rate / 100);
        var perShareM = monthlyShareAll * (minamt / amount);
        var perSharePB = perShareM > 0 ? Math.ceil(minamt / perShareM) : 0;
        var perShareCapVal = minamt * capMultiple;
        var costDesc = '';
        if(em === 'term_only'){
          costDesc = '预期收益倍数 ' + (parseFloat(fExpectMultiple.value)||1.3).toFixed(2) + 'x';
        } else {
          var yr = parseFloat(fYield.value) || 12;
          costDesc = '年化收益率 ' + yr + '%（' + basisLabel + '平息 ' + flatRatePct.toFixed(3) + '%）';
        }
        plEl.style.display = 'block';
        plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
          + '<div class="plain-lang-body">'
          + '这个项目总共需要 ' + amount.toFixed(2) + ' 万资金，' + costDesc + '。'
          + '<br/>你承诺把项目每月收入的 ' + rate + '% 分给所有参与人。按预估每月收入 ' + revenue + ' 万计算，每月总共分出约 ' + monthlyShareAll.toFixed(2) + ' 万。'
          + '<br/><br/>如果有人参与 ' + minamt + ' 万（1份），他每月大约能拿到 ' + perShareM.toFixed(2) + ' 万，大概 ' + perSharePB + ' 个月收回本金，回收上限 ' + perShareCapVal.toFixed(2) + ' 万（等效 ' + capMultiple.toFixed(2) + ' 倍）。'
          + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
          + '</div>';
      } else {
        plEl.style.display = 'none';
      }
    }
  }

  // Bind minamt change
  if(fMinamt) fMinamt.addEventListener('input', function(){ updateAutoCalc(); });

  // ════════════════════════════════════════════
  // Step 2 nav + validation
  // ════════════════════════════════════════════
  document.getElementById('btn-prev-2').addEventListener('click', function(){ goStep(1, 'left'); });
  document.getElementById('btn-next-2').addEventListener('click', function(){
    var em = getExitMode();
    var errors = [];
    if(!fRevenue.value || parseFloat(fRevenue.value)<=0) errors.push('预估月收入');
    if(em !== 'term_only' && (!fYield.value || parseFloat(fYield.value)<=0)) errors.push('年化收益率');
    if(em === 'term_only' && (!fExpectMultiple.value || parseFloat(fExpectMultiple.value)<=1)) errors.push('预期收益倍数');
    if((em === 'both' || em === 'term_only') && (!fDuration.value || parseInt(fDuration.value)<=0)) errors.push('最长分成期限');
    if(!fRate.value || parseFloat(fRate.value)<=0) errors.push('分成比例');
    if(!fAmount.value || parseFloat(fAmount.value)<=0) errors.push('融资总额');
    if(!fMinamt.value || parseFloat(fMinamt.value)<=0) errors.push('最低参与额');
    if(errors.length > 0){
      showToast('请填写：' + errors.join('、'), 'error');
      return;
    }
    if(fCompanyFull && !fCompanyFull.value && u.company) fCompanyFull.value = u.company;
    if(fBankNameAcct && !fBankNameAcct.value && u.company) fBankNameAcct.value = u.company;
    goStep(3, 'right');
  });

  // ════════════════════════════════════════════
  // Step 4 preview builder
  // ════════════════════════════════════════════
  function buildPreview(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var em = getExitMode();
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;

    // Determine cap/multiple for preview
    var cap = 0, capMultiple = 1, yieldRate = parseFloat(fYield.value) || 12;
    var basis = getSelectedBasis();
    var flatRate = getFlatRate(yieldRate, basis) / 100;
    var basisLbl = getBasisLabel(basis);
    var periods = getPeriods(duration, basis);
    if(em === 'term_only'){
      capMultiple = parseFloat(fExpectMultiple.value) || 1.3;
      cap = amount * capMultiple;
    } else {
      if(em === 'cap_only') periods = getPeriods(payback > 0 ? payback : 24, basis);
      cap = amount + amount * flatRate * periods;
      capMultiple = amount > 0 ? cap / amount : 1;
    }

    var exitModeLabel = em === 'both' ? '先到为准' : em === 'term_only' ? '仅期限到期' : '仅封顶';

    var html = '';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">' + (fIndustry.value||'') + '</span>';
    html += '<span class="badge badge-open">募集中</span>';
    html += '</div>';
    html += '<h2 style="font-size:20px;font-weight:700;color:#292524;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + fName.value + '</h2>';
    if(fHighlightText.value.trim()){
      html += '<div style="font-size:14px;color:#B91C1C;font-style:italic;margin-bottom:12px;line-height:1.5;">' + fHighlightText.value.trim() + '</div>';
    }
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:12px;">';
    html += '<div style="width:40px;height:40px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
    html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + '</div>';
    html += '<div style="font-size:12px;color:#78716C;">' + (fCompanyFull.value || u.company || '') + '</div></div></div>';
    html += '<p style="font-size:14px;line-height:1.7;color:#292524;margin-bottom:16px;">' + fDesc.value + '</p>';
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    if(hlArr.length > 0){
      html += '<div style="margin-bottom:16px;padding:16px 20px;background:#fff;border-radius:14px;border-left:3px solid #D4A853;">';
      html += '<div style="font-size:14px;font-weight:600;color:#1C1917;">项目亮点 \\u2B50</div><div style="margin-top:10px;">';
      hlArr.forEach(function(h){ html += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;"><span style="width:6px;height:6px;background:#D4A853;border-radius:50%;flex-shrink:0;margin-top:6px;"></span><span style="font-size:14px;color:#44403C;line-height:1.6;">' + h + '</span></div>'; });
      html += '</div></div>';
    }
    html += '<div style="border-left:4px solid #B91C1C;border-radius:12px;overflow:hidden;background:#fff;border:1px solid #F5F5F4;border-left:4px solid #B91C1C;">';
    html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;font-size:15px;font-weight:600;color:#292524;"><i class="fas fa-file-contract" style="color:#B91C1C;margin-right:8px;font-size:13px;"></i>收入分成条款</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">';
    var terms = [
      ['融资总额', '\\u00A5'+amount.toFixed(2)+'万'], ['分成比例', rate+'%'],
      ['退出方式', exitModeLabel],
    ];
    if(em !== 'term_only') terms.push(['年化收益率', yieldRate+'%']);
    if(em !== 'term_only') terms.push(['平息口径', basisLbl+'平息 '+(flatRate*100).toFixed(3)+'%']);
    if(em === 'term_only') terms.push(['预期收益倍数', capMultiple.toFixed(2)+'x']);
    if(em !== 'cap_only') terms.push(['最长分成期限', duration+'个月']);
    terms.push(['回收上限', '\\u00A5'+cap.toFixed(2)+'万']);
    terms.push(['预估月收入', '\\u00A5'+revenue+'万']);
    terms.forEach(function(t,i){
      html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;' + (i%2===0?'border-right:1px solid #F5F5F4;':'') + '">';
      html += '<div style="font-size:11px;color:#78716C;margin-bottom:2px;">' + t[0] + '</div>';
      html += '<div style="font-size:15px;font-weight:700;color:#1C1917;">' + t[1] + '</div></div>';
    });
    html += '</div>';
    html += '<div style="background:#FEF2F2;padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    html += '<div><div style="font-size:11px;color:#78716C;">预估月回款</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">\\u00A5' + monthly.toFixed(2) + '万</div></div>';
    html += '<div><div style="font-size:11px;color:#78716C;">预估回收期</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">约' + payback + '月</div></div>';
    html += '</div></div>';
    html += '<div style="margin-top:12px;font-size:12px;color:#78716C;">总份额 ' + shares + ' 份 · 每份 \\u00A5' + minamt + '万 · 上报频率：' + fFreq.value + '</div>';
    if(fCompanyFull.value){
      html += '<div style="margin-top:16px;padding:14px;background:#F0F9FF;border-radius:12px;border-left:3px solid #2563EB;">';
      html += '<div style="font-size:13px;font-weight:600;color:#1E40AF;margin-bottom:8px;"><i class="fas fa-building" style="margin-right:4px;"></i>企业主体</div>';
      html += '<div style="font-size:12px;color:#57534E;line-height:1.8;">';
      html += fCompanyFull.value + '<br/>法定代表人：' + (fLegalRep.value || '—') + '<br/>信用代码：' + (fCreditCode.value || '—');
      html += '</div></div>';
    }
    if(uploadedFileName){
      html += '<div style="margin-top:8px;font-size:12px;color:#78716C;"><i class="fas fa-paperclip" style="margin-right:4px;"></i>附件：' + uploadedFileName + '</div>';
    }
    document.getElementById('preview-content').innerHTML = html;
  }

  // Step 3 nav
  document.getElementById('btn-prev-3').addEventListener('click', function(){ goStep(2, 'left'); });
  document.getElementById('btn-next-3').addEventListener('click', function(){
    var errors = [];
    if(!fCompanyFull.value.trim()) errors.push('企业全称');
    if(!fCreditCode.value.trim()) errors.push('统一社会信用代码');
    if(!fLegalRep.value.trim()) errors.push('法定代表人');
    if(!fRegAddr.value.trim()) errors.push('注册地址');
    if(!fBankNameAcct.value.trim()) errors.push('收款户名');
    if(!fBankNumber.value.trim()) errors.push('银行账号');
    if(!fBankName.value) errors.push('开户银行');
    if(errors.length > 0){ showToast('请填写：' + errors.join('、'), 'error'); return; }
    buildPreview();
    goStep(4, 'right');
  });

  document.getElementById('btn-prev-4').addEventListener('click', function(){ goStep(3, 'left'); });

  // ════════════════════════════════════════════
  // Collect form data for API submission
  // ════════════════════════════════════════════
  function collectData(status){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var em = getExitMode();
    var yieldRate = parseFloat(fYield.value) || 12;
    var expectMultiple = parseFloat(fExpectMultiple.value) || 1.3;
    var basis = getSelectedBasis();
    var flatRate = getFlatRate(yieldRate, basis) / 100;

    // Compute recovery multiple for storage
    var capMultiple = 1;
    if(em === 'term_only'){
      capMultiple = expectMultiple;
    } else {
      var p = em === 'cap_only' ? getPeriods(Math.ceil(amount / (revenue * rate / 100)) || 24, basis) : getPeriods(duration, basis);
      capMultiple = amount > 0 ? (amount + amount * flatRate * p) / amount : 1;
    }
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    return {
      name: fName.value.trim(), ownerId: u.id,
      industry: fIndustry.value, description: fDesc.value.trim(),
      detail: fDetail.value.trim(), attachment: uploadedFileName,
      highlightText: fHighlightText.value.trim() || '',
      highlights: hlArr.length > 0 ? hlArr : [],
      targetAmount: amount, revenueShareRate: rate, duration: duration,
      recoveryMultiple: capMultiple, estimatedMonthlyRevenue: revenue,
      settlementCycle: basis,
      totalShares: shares, sharePrice: minamt, minShares: 1,
      reportFrequency: fFreq.value,
      annualYieldRate: em === 'term_only' ? 0 : yieldRate,
      expectMultiple: em === 'term_only' ? expectMultiple : null,
      exitMode: em,
      lossThresholdMonths: fLossMonths.value ? parseInt(fLossMonths.value) : null,
      lossThresholdAmount: fLossAmount.value ? parseFloat(fLossAmount.value) : null,
      companyFullName: fCompanyFull.value.trim() || null,
      creditCode: fCreditCode.value.trim() || null,
      registeredAddress: fRegAddr.value.trim() || null,
      legalRepresentative: fLegalRep.value.trim() || null,
      legalRepType: fRepType.value || '法定代表人',
      actualController: fController.value.trim() || null,
      actualControllerId: fControllerId.value.trim() || null,
      businessAddress: fBizAddr.value.trim() || null,
      dataTransmitMode: fTransmit.value || '手工上报',
      paymentMode: fPaymentMode.value || '手动分账',
      bankAccountName: fBankNameAcct.value.trim() || null,
      bankAccountNumber: fBankNumber.value.trim() || null,
      bankName: fBankName.value || null,
      bankBranch: fBankBranch.value.trim() || null,
      taxpayerId: fTaxpayer.value.trim() || null,
      status: status,
    };
  }

  // Save draft
  document.getElementById('btn-draft').addEventListener('click', function(){
    var proj = collectData('draft');
    var btn = this;
    btn.disabled = true; btn.textContent = '保存中...';
    fetch('/api/admin/projects/create', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'same-origin',
      body: JSON.stringify(Object.assign({}, proj, { initiatorNote: proj.detail, status: 'draft' }))
    }).then(function(r){return r.json();}).then(function(d){
      btn.disabled = false; btn.textContent = '保存草稿';
      if(d.ok){ showToast('草稿已保存', 'success'); setTimeout(function(){ window.location.href = '/'; }, 800); }
      else { showToast(d.error || '保存失败', 'error'); }
    }).catch(function(){ btn.disabled = false; btn.textContent = '保存草稿'; showToast('网络错误', 'error'); });
  });

  // Publish
  document.getElementById('btn-publish').addEventListener('click', function(){
    var proj = collectData('open');
    var btn = this;
    btn.disabled = true; btn.textContent = '提交中...';
    fetch('/api/admin/projects/create', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'same-origin',
      body: JSON.stringify(Object.assign({}, proj, { initiatorNote: proj.detail }))
    }).then(function(r){return r.json();}).then(function(d){
      btn.disabled = false; btn.textContent = '发布项目';
      if(!d.ok){ showToast(d.error || '提交失败', 'error'); return; }
      var projectId = d.data.projectId;
      var shareCode = d.data.shareCode;
      var overlay = document.createElement('div');
      overlay.className = 'success-modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
      overlay.innerHTML = '<div style="background:#fff;border-radius:24px;padding:32px;max-width:320px;width:90%;text-align:center;">'
        + '<i class="fas fa-check-circle" style="font-size:64px;color:#16A34A;animation:iconPop 0.5s cubic-bezier(0.16,1,0.3,1);"></i>'
        + '<div style="font-size:20px;font-weight:700;color:#1C1917;margin-top:16px;">发起成功</div>'
        + '<div style="font-size:14px;color:#78716C;margin-top:8px;">项目已提交' + (shareCode ? '，分享码: '+shareCode : '') + '</div>'
        + '<div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">'
        + '<button id="success-share-btn" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:#fff;border:none;border-radius:12px;padding:14px;width:100%;font-size:15px;font-weight:600;cursor:pointer;">\\uD83D\\uDCE4 分享给同学</button>'
        + '<button id="success-view-btn" style="background:transparent;color:#44403C;border:1px solid #E7E5E4;border-radius:12px;padding:14px;width:100%;font-size:15px;font-weight:600;cursor:pointer;">查看项目</button>'
        + '</div></div>';
      document.body.appendChild(overlay);
      requestAnimationFrame(function(){ overlay.style.opacity = '1'; });
      document.getElementById('success-share-btn').addEventListener('click', function(){ window.location.href = '/projects/' + projectId + '?share=true'; });
      document.getElementById('success-view-btn').addEventListener('click', function(){ window.location.href = '/projects/' + projectId; });
    }).catch(function(){ btn.disabled = false; btn.textContent = '发布项目'; showToast('网络错误', 'error'); });
  });
})();
`}} />
    </div>,
    { title: '中流通 - 发起项目' }
  )
})
}
