// Route: /contracts/:id/terms — 条款通 Terms Connect
// 投资人认购后的条款联动确认页面
// P0 升级：三滑块联动（金额↔比例↔期限）+ RBF核心公式卡片 + IRR计算
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, AuthCheckScript,
} from '../components'

export function registerTermsConnectRoute(app: Hono<HonoEnv>) {
app.get('/contracts/:id/terms', async (c) => {
  const db = c.env.DB
  const contractId = c.req.param('id')

  // 加载合同及项目数据
  const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(contractId).first<any>()
  if (!contract) {
    return c.html('<div style="text-align:center;padding:80px 20px;"><h2>合同不存在</h2><a href="/">返回首页</a></div>')
  }

  const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(contract.project_id).first<any>()
  const initiator = await db.prepare('SELECT id, name, company, class_name FROM users WHERE id = ?').bind(contract.initiator_id).first<any>()
  const participant = await db.prepare('SELECT id, name, company, class_name FROM users WHERE id = ?').bind(contract.participant_id).first<any>()

  // 核心参数
  const totalAmount = project?.target_amount || 0
  const totalShareRate = project?.revenue_share_rate || 0
  const k = totalShareRate > 0 ? totalAmount / totalShareRate : 0  // 锚点 k：每1%分成价值
  const duration = project?.duration || 24
  const annualYieldRate = project?.annual_yield_rate || 12.0
  const exitMode = project?.exit_mode || 'both'
  const estimatedRevenue = project?.estimated_monthly_revenue || 0
  const sharePrice = project?.share_price || 0
  const totalShares = project?.total_shares || 0
  const minShares = project?.min_shares || 1

  // 合同已有数据
  const contractAmount = contract.amount || 0
  const contractShares = contract.shares || 0
  const contractShareRatio = contract.revenue_share_ratio || 0
  const contractTerm = contract.cooperation_term || duration

  // 序列化数据给前端
  const termsData = JSON.stringify({
    contractId: contract.id,
    projectId: contract.project_id,
    projectName: project?.name || '',
    initiatorName: initiator?.name || '',
    initiatorCompany: initiator?.company || '',
    initiatorClassName: initiator?.class_name || '',
    participantName: participant?.name || '',
    participantId: participant?.id || '',
    participantCompany: participant?.company || '',
    totalAmount, totalShareRate, k, duration,
    annualYieldRate, exitMode, estimatedRevenue,
    sharePrice, totalShares, minShares,
    contractAmount, contractShares, contractShareRatio, contractTerm,
    approvalStatus: contract.approval_status || 'draft',
    // 企业信息（只读展示）
    companyFullName: project?.company_full_name || '',
    legalRepresentative: project?.legal_representative || '',
    businessAddress: project?.business_address || '',
    // 风控
    lossThresholdMonths: project?.loss_threshold_months || null,
    lossThresholdAmount: project?.loss_threshold_amount || null,
    // 数据传输
    dataTransmitMode: project?.data_transmit_mode || '手工上报',
    reportFrequency: project?.report_frequency || '每自然月',
  })

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-2 pb-6 page-enter" id="terms-main">
        {/* Header */}
        <div style="text-align:center;padding:8px 0 16px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FEF2F2,#FFF1F2);margin-bottom:8px;">
            <i class="fas fa-sliders-h" style="font-size:24px;color:#B91C1C;" />
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#1C1917;font-family:'Noto Sans SC',sans-serif;">条款通</h1>
          <p style="font-size:13px;color:#A8A29E;margin-top:4px;">三维联动 · 实时计算 · 确认条款</p>
        </div>

        {/* Status Banner */}
        <div id="status-banner" />

        {/* ═══ RBF Core Formula Hero Card ═══ */}
        <div class="rbf-hero">
          <div class="rbf-hero-label">RBF Revenue-Based Financing</div>
          <div class="rbf-hero-formula">
            <span class="rbf-var rbf-var-red">月回款</span> = 月收入 &times;
            <span class="rbf-var rbf-var-blue">分成%</span>
          </div>
          <div class="rbf-hero-formula" style="margin-top:6px;">
            <span class="rbf-var rbf-var-gold">封顶</span> =
            <span class="rbf-var rbf-var-red">融资额</span> &times; (1 +
            <span style="color:#FDE68A;">年化率</span> &times;
            <span class="rbf-var rbf-var-green">期限</span> / 12)
          </div>
          <div class="rbf-hero-desc">
            收入分成模式 — 不入股、不借贷，按项目实际收入约定比例分成。到期或封顶自动退出。
          </div>
        </div>

        {/* Project Info Card */}
        <div class="detail-card" style="border-left:4px solid #B91C1C;">
          <div class="detail-card-header">
            <i class="fas fa-briefcase detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
            <span>项目信息</span>
          </div>
          <div id="project-info-body" />
        </div>

        {/* ═══ Three-Slider Card — 融资额 ↔ 分成比例 ↔ 合作期限 ═══ */}
        <div class="detail-card" id="slider-card">
          <div class="detail-card-header">
            <i class="fas fa-link detail-card-header-icon" style="background:linear-gradient(135deg,#DBEAFE,#BFDBFE);color:#2563EB;" />
            <span>三维条款联动</span>
            <span style="margin-left:auto;font-size:11px;color:#A8A29E;">金额 ↔ 比例等比联动</span>
          </div>

          {/* 融资额滑块 — 红色 */}
          <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label style="font-size:13px;font-weight:600;color:#1C1917;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#DC2626;margin-right:6px;" />认购融资额</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input id="amount-input" type="number" style="width:80px;text-align:right;font-size:16px;font-weight:700;color:#B91C1C;border:1px solid #E7E5E4;border-radius:8px;padding:4px 8px;" />
                <span style="font-size:13px;color:#78716C;">万元</span>
              </div>
            </div>
            <input id="amount-slider" type="range" class="terms-slider terms-slider-red" />
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#A8A29E;margin-top:2px;">
              <span id="amount-min" />
              <span id="amount-max" />
            </div>
          </div>

          {/* 分成比例滑块 — 蓝色 */}
          <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label style="font-size:13px;font-weight:600;color:#1C1917;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3B82F6;margin-right:6px;" />个人分成比例</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input id="ratio-input" type="number" style="width:72px;text-align:right;font-size:16px;font-weight:700;color:#2563EB;border:1px solid #E7E5E4;border-radius:8px;padding:4px 8px;" step="0.01" />
                <span style="font-size:13px;color:#78716C;">%</span>
              </div>
            </div>
            <input id="ratio-slider" type="range" class="terms-slider terms-slider-blue" step="0.01" />
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#A8A29E;margin-top:2px;">
              <span id="ratio-min" />
              <span id="ratio-max" />
            </div>
          </div>

          {/* 合作期限滑块 — 绿色 (P0 新增) */}
          <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label style="font-size:13px;font-weight:600;color:#1C1917;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22C55E;margin-right:6px;" />合作期限</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input id="term-input" type="number" style="width:64px;text-align:right;font-size:16px;font-weight:700;color:#16A34A;border:1px solid #E7E5E4;border-radius:8px;padding:4px 8px;" />
                <span style="font-size:13px;color:#78716C;">个月</span>
              </div>
            </div>
            <input id="term-slider" type="range" class="terms-slider terms-slider-green" />
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#A8A29E;margin-top:2px;">
              <span id="term-min" />
              <span id="term-max" />
            </div>
          </div>

          {/* 锚点说明 */}
          <div style="background:#FAFAF9;border-radius:10px;padding:12px 14px;margin-bottom:4px;">
            <div style="font-size:11px;color:#78716C;line-height:1.6;">
              <i class="fas fa-link" style="color:#D4A853;margin-right:4px;" />
              <strong>等比联动：</strong>融资额与分成比例按锚点 <span id="k-display" style="font-weight:700;color:#B91C1C;" /> 等比升降。
              <span style="display:block;margin-top:4px;">即：分成 1% 对应融资 <span id="k-per-pct" style="font-weight:600;" /> 万元。期限独立调整，影响封顶倍数和 IRR。</span>
            </div>
          </div>
        </div>

        {/* 退出条件卡片 */}
        <div class="detail-card" id="exit-card">
          <div class="detail-card-header">
            <i class="fas fa-door-open detail-card-header-icon" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;" />
            <span>退出条件</span>
            <span id="exit-mode-badge" style="margin-left:auto;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;" />
          </div>
          <div id="exit-conditions" />
        </div>

        {/* 实时计算面板 — P0升级：增加IRR */}
        <div class="detail-card" style="background:linear-gradient(135deg,#FEF2F2,#FFF1F2);border:1px solid #FECACA;">
          <div class="detail-card-header" style="margin-bottom:12px;">
            <i class="fas fa-calculator detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
            <span style="font-size:14px;color:#B91C1C;">实时计算</span>
          </div>
          <div class="auto-calc-grid" style="grid-template-columns:1fr 1fr;">
            <div>
              <div class="auto-calc-item-label">每月预估分成</div>
              <div class="auto-calc-item-value" id="calc-monthly" style="color:#B91C1C;">—</div>
            </div>
            <div>
              <div class="auto-calc-item-label">预估回本月数</div>
              <div class="auto-calc-item-value" id="calc-payback">—</div>
            </div>
            <div>
              <div class="auto-calc-item-label">回收上限金额</div>
              <div class="auto-calc-item-value" id="calc-cap" style="color:#B91C1C;">—</div>
            </div>
            <div>
              <div class="auto-calc-item-label">等效封顶倍数</div>
              <div class="auto-calc-item-value" id="calc-multiple">—</div>
            </div>
          </div>
          {/* IRR Row — P0 新增 */}
          <div style="margin-top:12px;padding:14px;background:linear-gradient(135deg,#1C1917,#292524);border-radius:12px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">预估年化 IRR</div>
              <div id="calc-irr" style="font-size:22px;font-weight:800;color:#D4A853;font-family:'SF Mono','Fira Code',monospace;">—</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">投资回报总额</div>
              <div id="calc-total-return" style="font-size:16px;font-weight:700;color:#86EFAC;">—</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">净利润</div>
              <div id="calc-net-profit" style="font-size:16px;font-weight:700;color:#FCA5A5;">—</div>
            </div>
          </div>
          <div style="margin-top:8px;padding:10px 12px;background:rgba(255,255,255,0.6);border-radius:10px;">
            <div class="auto-calc-item-label" style="margin-bottom:4px;">退出条件说明</div>
            <div id="calc-exit-desc" style="font-size:12px;color:#57534E;line-height:1.6;" />
          </div>
        </div>

        {/* 简单来说 */}
        <div id="plain-lang" class="plain-lang-block" style="display:none;" />

        {/* 操作按钮 */}
        <div id="action-buttons" style="margin-top:16px;" />
      </main>

      {/* === Client Script === */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var TD = ${termsData};

  // Auth check
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_current_user') || localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) { window.location.href = '/login'; return; }

  // ══════════════════════════════════════════════════
  // 状态横幅
  // ══════════════════════════════════════════════════
  var banner = document.getElementById('status-banner');
  function renderBanner(){
    var s = TD.approvalStatus;
    var html = '';
    if(s === 'draft'){
      html = '<div style="background:#DBEAFE;border:1px solid #93C5FD;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">'
        + '<i class="fas fa-edit" style="color:#2563EB;font-size:18px;flex-shrink:0;"></i>'
        + '<div><div style="font-size:14px;font-weight:600;color:#1E40AF;">待确认条款</div>'
        + '<div style="font-size:12px;color:#3B82F6;margin-top:2px;">请调整三个滑块确认融资额、分成比例和合作期限，然后提交确认</div></div></div>';
    } else if(s === 'pending_approval'){
      html = '<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">'
        + '<i class="fas fa-hourglass-half" style="color:#B45309;font-size:18px;flex-shrink:0;"></i>'
        + '<div><div style="font-size:14px;font-weight:600;color:#92400E;">等待班主任审批</div>'
        + '<div style="font-size:12px;color:#B45309;margin-top:2px;">条款已提交，请等待班主任审批后签署合同</div></div></div>';
    } else if(s === 'approved'){
      html = '<div style="background:#D1FAE5;border:1px solid #6EE7B7;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">'
        + '<i class="fas fa-check-circle" style="color:#16A34A;font-size:18px;flex-shrink:0;"></i>'
        + '<div><div style="font-size:14px;font-weight:600;color:#166534;">审批通过</div>'
        + '<div style="font-size:12px;color:#16A34A;margin-top:2px;">条款已审批通过，请前往签署合同</div></div></div>';
    } else if(s === 'rejected'){
      html = '<div style="background:#FEE2E2;border:1px solid #FECACA;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">'
        + '<i class="fas fa-times-circle" style="color:#DC2626;font-size:18px;flex-shrink:0;"></i>'
        + '<div><div style="font-size:14px;font-weight:600;color:#991B1B;">审批未通过</div>'
        + '<div style="font-size:12px;color:#DC2626;margin-top:2px;">请调整条款后重新提交</div></div></div>';
    }
    if(banner) banner.innerHTML = html;
  }
  renderBanner();

  // ══════════════════════════════════════════════════
  // 项目信息
  // ══════════════════════════════════════════════════
  var piBody = document.getElementById('project-info-body');
  if(piBody){
    var rows = [
      ['项目名称', TD.projectName],
      ['发起人', TD.initiatorName + (TD.initiatorCompany ? ' \\u00B7 '+TD.initiatorCompany : '')],
      ['融资总额', '\\u00A5' + TD.totalAmount + '万'],
      ['总分成比例', TD.totalShareRate + '%'],
      ['联营期限', TD.duration + '个月'],
      ['年化收益率', TD.annualYieldRate + '%'],
    ];
    var piHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">';
    rows.forEach(function(r, i){
      piHtml += '<div style="padding:10px 0;border-bottom:1px solid #F5F5F4;' + (i%2===0?'padding-right:12px;':'padding-left:12px;') + '">'
        + '<div style="font-size:11px;color:#78716C;">' + r[0] + '</div>'
        + '<div style="font-size:14px;font-weight:600;color:#1C1917;margin-top:2px;">' + r[1] + '</div></div>';
    });
    piHtml += '</div>';
    piBody.innerHTML = piHtml;
  }

  // ══════════════════════════════════════════════════
  // 三滑块联动逻辑 (P0 升级)
  // ══════════════════════════════════════════════════
  var amountSlider = document.getElementById('amount-slider');
  var amountInput = document.getElementById('amount-input');
  var ratioSlider = document.getElementById('ratio-slider');
  var ratioInput = document.getElementById('ratio-input');
  var termSlider = document.getElementById('term-slider');
  var termInput = document.getElementById('term-input');

  var minAmount = TD.sharePrice;
  var maxAmount = TD.totalAmount;
  var amountStep = TD.sharePrice;
  var minRatio = TD.totalShareRate / TD.totalShares;
  var maxRatio = TD.totalShareRate;
  var ratioStep = minRatio;

  // 期限范围：项目期限的50%到150%，最小6个月
  var minTerm = Math.max(6, Math.floor(TD.duration * 0.5));
  var maxTerm = Math.min(60, Math.ceil(TD.duration * 1.5));
  var termStep = 1;

  // 配置滑块范围 — 金额
  amountSlider.min = minAmount;
  amountSlider.max = maxAmount;
  amountSlider.step = amountStep;
  amountSlider.value = TD.contractAmount || minAmount;
  amountInput.value = TD.contractAmount || minAmount;

  // 配置滑块范围 — 比例
  ratioSlider.min = minRatio.toFixed(4);
  ratioSlider.max = maxRatio.toFixed(4);
  ratioSlider.step = ratioStep.toFixed(4);
  ratioSlider.value = TD.contractShareRatio || minRatio.toFixed(4);
  ratioInput.value = TD.contractShareRatio || minRatio.toFixed(2);

  // 配置滑块范围 — 期限
  termSlider.min = minTerm;
  termSlider.max = maxTerm;
  termSlider.step = termStep;
  termSlider.value = TD.contractTerm || TD.duration;
  termInput.value = TD.contractTerm || TD.duration;

  // 显示范围
  document.getElementById('amount-min').textContent = minAmount + '万';
  document.getElementById('amount-max').textContent = maxAmount + '万';
  document.getElementById('ratio-min').textContent = minRatio.toFixed(2) + '%';
  document.getElementById('ratio-max').textContent = maxRatio.toFixed(2) + '%';
  document.getElementById('term-min').textContent = minTerm + '月';
  document.getElementById('term-max').textContent = maxTerm + '月';

  // 锚点显示
  document.getElementById('k-display').textContent = 'k = ' + TD.k.toFixed(2);
  document.getElementById('k-per-pct').textContent = TD.k.toFixed(2);

  // 当前值
  var curAmount = parseFloat(amountSlider.value);
  var curRatio = parseFloat(ratioSlider.value);
  var curShares = Math.round(curAmount / TD.sharePrice);
  var curTerm = parseInt(termSlider.value);

  // 联动：金额 → 比例 (期限不变)
  function amountChanged(fromSlider){
    curAmount = parseFloat(fromSlider ? amountSlider.value : amountInput.value) || minAmount;
    curShares = Math.max(1, Math.round(curAmount / TD.sharePrice));
    curAmount = curShares * TD.sharePrice;
    if(curAmount > maxAmount) { curAmount = maxAmount; curShares = Math.round(curAmount / TD.sharePrice); }
    if(curAmount < minAmount) { curAmount = minAmount; curShares = 1; }
    curRatio = TD.k > 0 ? +(curAmount / TD.k).toFixed(4) : 0;

    amountSlider.value = curAmount;
    amountInput.value = curAmount;
    ratioSlider.value = curRatio;
    ratioInput.value = curRatio.toFixed(2);
    updateCalcs();
  }

  // 联动：比例 → 金额 (期限不变)
  function ratioChanged(fromSlider){
    curRatio = parseFloat(fromSlider ? ratioSlider.value : ratioInput.value) || minRatio;
    curAmount = +(curRatio * TD.k).toFixed(2);
    curShares = Math.max(1, Math.round(curAmount / TD.sharePrice));
    curAmount = curShares * TD.sharePrice;
    curRatio = TD.k > 0 ? +(curAmount / TD.k).toFixed(4) : 0;
    if(curAmount > maxAmount) { curAmount = maxAmount; curShares = Math.round(curAmount / TD.sharePrice); curRatio = TD.k > 0 ? +(curAmount / TD.k).toFixed(4) : 0; }
    if(curAmount < minAmount) { curAmount = minAmount; curShares = 1; curRatio = TD.k > 0 ? +(curAmount / TD.k).toFixed(4) : 0; }

    amountSlider.value = curAmount;
    amountInput.value = curAmount;
    ratioSlider.value = curRatio;
    ratioInput.value = curRatio.toFixed(2);
    updateCalcs();
  }

  // 期限变更 (金额和比例不变，但封顶倍数和IRR会变)
  function termChanged(fromSlider){
    curTerm = parseInt(fromSlider ? termSlider.value : termInput.value) || TD.duration;
    if(curTerm > maxTerm) curTerm = maxTerm;
    if(curTerm < minTerm) curTerm = minTerm;
    termSlider.value = curTerm;
    termInput.value = curTerm;
    updateCalcs();
  }

  amountSlider.addEventListener('input', function(){ amountChanged(true); });
  amountInput.addEventListener('change', function(){ amountChanged(false); });
  ratioSlider.addEventListener('input', function(){ ratioChanged(true); });
  ratioInput.addEventListener('change', function(){ ratioChanged(false); });
  termSlider.addEventListener('input', function(){ termChanged(true); });
  termInput.addEventListener('change', function(){ termChanged(false); });

  // ══════════════════════════════════════════════════
  // IRR 计算函数 (牛顿迭代法)
  // ══════════════════════════════════════════════════
  function calcIRR(investment, monthlyCF, months, recoveryCap) {
    // 简化模型：每月固定现金流 monthlyCF，直到到期或封顶
    // 生成现金流序列
    var cfs = [-investment]; // 初始投资（负值）
    var cumulative = 0;
    for (var m = 1; m <= months; m++) {
      var cf = monthlyCF;
      if (recoveryCap > 0 && cumulative + cf >= recoveryCap) {
        cf = recoveryCap - cumulative;
        cfs.push(cf);
        break;
      }
      cumulative += cf;
      cfs.push(cf);
    }

    // 牛顿迭代求月度IRR
    if (cfs.length < 2 || investment <= 0) return 0;
    var r = 0.01; // 初始猜测月利率1%
    for (var iter = 0; iter < 100; iter++) {
      var npv = 0, dnpv = 0;
      for (var i = 0; i < cfs.length; i++) {
        var pv = cfs[i] / Math.pow(1 + r, i);
        npv += pv;
        if (i > 0) dnpv -= i * cfs[i] / Math.pow(1 + r, i + 1);
      }
      if (Math.abs(dnpv) < 1e-12) break;
      var rNew = r - npv / dnpv;
      if (Math.abs(rNew - r) < 1e-8) { r = rNew; break; }
      r = rNew;
      if (r < -0.99) { r = -0.99; break; }
      if (r > 10) { r = 10; break; }
    }
    // 转换为年化
    var annualIRR = (Math.pow(1 + r, 12) - 1) * 100;
    return annualIRR;
  }

  // ══════════════════════════════════════════════════
  // 实时计算 (P0 升级：含 IRR)
  // ══════════════════════════════════════════════════
  function updateCalcs(){
    // 每月预估分成 = 预估月收入 × 个人分成%
    var monthlyShare = TD.estimatedRevenue * (curRatio / 100);
    // 等效封顶倍数（按年化收益率 × 当前期限）
    var capMultiple = 1 + (TD.annualYieldRate / 100) * (curTerm / 12);
    // 回收上限金额
    var recoveryCap = curAmount * capMultiple;
    // 回本月数
    var paybackMonths = monthlyShare > 0 ? Math.ceil(curAmount / monthlyShare) : 0;

    // IRR 计算 (P0 新增)
    var irr = 0;
    var totalReturn = 0;
    if (monthlyShare > 0 && curAmount > 0) {
      irr = calcIRR(curAmount, monthlyShare, curTerm, recoveryCap);
      // 总回报 = min(月分成 × 期限, 封顶额)
      var rawReturn = monthlyShare * curTerm;
      totalReturn = (TD.exitMode === 'term_only') ? rawReturn :
                    (TD.exitMode === 'cap_only') ? Math.min(rawReturn, recoveryCap) :
                    Math.min(rawReturn, recoveryCap);
    }
    var netProfit = totalReturn - curAmount;

    document.getElementById('calc-monthly').textContent = monthlyShare > 0 ? '\\u00A5' + monthlyShare.toFixed(2) + '万/月' : '\\u2014';
    document.getElementById('calc-payback').textContent = paybackMonths > 0 ? '约' + paybackMonths + '个月' : '\\u2014';
    document.getElementById('calc-cap').textContent = recoveryCap > 0 ? '\\u00A5' + recoveryCap.toFixed(2) + '万' : '\\u2014';
    document.getElementById('calc-multiple').textContent = capMultiple > 0 ? capMultiple.toFixed(2) + 'x' : '\\u2014';

    // IRR 显示 (P0 新增)
    var irrEl = document.getElementById('calc-irr');
    var totalReturnEl = document.getElementById('calc-total-return');
    var netProfitEl = document.getElementById('calc-net-profit');
    if (irrEl) {
      if (irr > 0 && isFinite(irr)) {
        irrEl.textContent = irr.toFixed(1) + '%';
        irrEl.style.color = irr >= 0 ? '#D4A853' : '#FCA5A5';
      } else {
        irrEl.textContent = '\\u2014';
      }
    }
    if (totalReturnEl) {
      totalReturnEl.textContent = totalReturn > 0 ? '\\u00A5' + totalReturn.toFixed(2) + '万' : '\\u2014';
    }
    if (netProfitEl) {
      if (netProfit !== 0) {
        netProfitEl.textContent = (netProfit >= 0 ? '+' : '') + netProfit.toFixed(2) + '万';
        netProfitEl.style.color = netProfit >= 0 ? '#86EFAC' : '#FCA5A5';
      } else {
        netProfitEl.textContent = '\\u2014';
      }
    }

    // 退出条件说明
    var exitDesc = document.getElementById('calc-exit-desc');
    if(exitDesc){
      var em = TD.exitMode;
      var endDateStr = (function(){
        var d = new Date();
        d.setMonth(d.getMonth() + curTerm);
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      })();

      if(em === 'term_only'){
        exitDesc.innerHTML = '<strong>期限到期退出：</strong>联营期限 ' + curTerm + ' 个月到期（约 ' + endDateStr + '）后合同自动终止，无论回款多少。';
      } else if(em === 'cap_only'){
        exitDesc.innerHTML = '<strong>封顶倍数退出：</strong>当累计回款达到 \\u00A5' + recoveryCap.toFixed(2) + ' 万（' + capMultiple.toFixed(2) + 'x）时合同自动终止。'
          + '<br/><span style="color:#78716C;">公式：' + curAmount + '万 \\u00D7 (1 + ' + TD.annualYieldRate + '% \\u00D7 ' + curTerm + '/12) = ' + recoveryCap.toFixed(2) + '万</span>';
      } else {
        exitDesc.innerHTML = '<strong>双条件先到为准：</strong>'
          + '<br/>\\u2460 期限到期：' + curTerm + ' 个月到期（约 ' + endDateStr + '）'
          + '<br/>\\u2461 封顶倍数：累计回款达 \\u00A5' + recoveryCap.toFixed(2) + ' 万（' + capMultiple.toFixed(2) + 'x）'
          + '<br/><span style="color:#B91C1C;font-weight:600;">以先到者为准终止合同</span>'
          + '<br/><span style="color:#78716C;font-size:11px;">公式：' + curAmount + ' \\u00D7 (1 + ' + TD.annualYieldRate + '% \\u00D7 ' + curTerm + '/12) = ' + recoveryCap.toFixed(2) + '万</span>';
      }
    }

    // 退出条件卡片
    renderExitCard(capMultiple, recoveryCap);

    // 简单来说
    renderPlainLang(monthlyShare, paybackMonths, recoveryCap, capMultiple, irr, totalReturn, netProfit);
  }

  // ══════════════════════════════════════════════════
  // 退出条件卡片
  // ══════════════════════════════════════════════════
  function renderExitCard(capMultiple, recoveryCap){
    var badge = document.getElementById('exit-mode-badge');
    var box = document.getElementById('exit-conditions');
    var em = TD.exitMode;

    if(badge){
      if(em === 'term_only') { badge.textContent = '期限到期'; badge.style.background = '#DBEAFE'; badge.style.color = '#2563EB'; }
      else if(em === 'cap_only') { badge.textContent = '封顶倍数'; badge.style.background = '#FEF3C7'; badge.style.color = '#B45309'; }
      else { badge.textContent = '双条件先到为准'; badge.style.background = '#FEE2E2'; badge.style.color = '#B91C1C'; }
    }

    if(!box) return;
    var html = '<div style="display:flex;flex-direction:column;gap:12px;margin-top:8px;">';

    if(em !== 'cap_only'){
      html += '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:#F0F9FF;border-radius:10px;">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:#DBEAFE;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
        + '<i class="fas fa-calendar-alt" style="color:#2563EB;font-size:14px;"></i></div>'
        + '<div><div style="font-size:13px;font-weight:600;color:#1E40AF;">期限到期</div>'
        + '<div style="font-size:12px;color:#3B82F6;margin-top:2px;">联营期限 ' + curTerm + ' 个月到期后自动终止</div></div></div>';
    }

    if(em !== 'term_only'){
      html += '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:#FFFBEB;border-radius:10px;">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:#FEF3C7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
        + '<i class="fas fa-chart-line" style="color:#B45309;font-size:14px;"></i></div>'
        + '<div><div style="font-size:13px;font-weight:600;color:#92400E;">封顶倍数 ' + capMultiple.toFixed(2) + 'x</div>'
        + '<div style="font-size:12px;color:#B45309;margin-top:2px;">累计回款达 \\u00A5' + recoveryCap.toFixed(2) + ' 万时自动终止</div>'
        + '<div style="font-size:11px;color:#78716C;margin-top:4px;">年化 ' + TD.annualYieldRate + '% \\u00D7 期限 ' + curTerm + '月 \\u2192 倍数 ' + capMultiple.toFixed(2) + '</div></div></div>';
    }

    if(em === 'both'){
      html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#FEF2F2;border-radius:10px;border:1px dashed #FECACA;">'
        + '<i class="fas fa-exclamation-triangle" style="color:#B91C1C;font-size:13px;flex-shrink:0;"></i>'
        + '<span style="font-size:12px;color:#991B1B;font-weight:500;">两个条件以先满足者为准终止合同</span></div>';
    }

    html += '</div>';
    box.innerHTML = html;
  }

  // ══════════════════════════════════════════════════
  // 简单来说 (P0 升级：含 IRR)
  // ══════════════════════════════════════════════════
  function renderPlainLang(monthlyShare, paybackMonths, recoveryCap, capMultiple, irr, totalReturn, netProfit){
    var el = document.getElementById('plain-lang');
    if(!el) return;
    if(curAmount <= 0) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    var irrText = (irr > 0 && isFinite(irr)) ? '\\u3002预估年化 IRR 为 <strong>' + irr.toFixed(1) + '%</strong>，期内总回报约 <strong>\\u00A5' + totalReturn.toFixed(2) + '万</strong>，净利润约 <strong>' + (netProfit>=0?'+':'') + netProfit.toFixed(2) + '万</strong>' : '';
    el.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
      + '<div class="plain-lang-body">'
      + '您认购 <strong>' + curShares + ' 份</strong>（\\u00A5' + curAmount + '万），占项目分成比例 <strong>' + curRatio.toFixed(2) + '%</strong>，合作期限 <strong>' + curTerm + ' 个月</strong>。'
      + '<br/><br/>按预估月收入 \\u00A5' + TD.estimatedRevenue + '万计算，您每月约可获得 <strong>\\u00A5' + monthlyShare.toFixed(2) + '万</strong> 的分成回款。'
      + '<br/><br/>回收上限为 <strong>\\u00A5' + recoveryCap.toFixed(2) + '万</strong>（' + capMultiple.toFixed(2) + '倍），预估约 <strong>' + paybackMonths + ' 个月</strong> 收回本金' + irrText + '。'
      + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。退出条件以合同约定为准。</span>'
      + '</div>';
  }

  // ══════════════════════════════════════════════════
  // 操作按钮
  // ══════════════════════════════════════════════════
  var actBox = document.getElementById('action-buttons');
  function renderActions(){
    if(!actBox) return;
    var s = TD.approvalStatus;
    var html = '';

    if(s === 'draft' || s === 'rejected'){
      html = '<div class="btn-row">'
        + '<button class="btn-secondary" onclick="window.location.href=\\'/projects/' + TD.projectId + '\\'"><i class="fas fa-arrow-left" style="font-size:12px;margin-right:4px;"></i>返回项目</button>'
        + '<button class="btn-primary" id="btn-confirm-terms" style="flex:1.5;background:linear-gradient(135deg,#DC2626,#B91C1C);">'
        + '<i class="fas fa-check" style="font-size:12px;margin-right:4px;"></i>确认条款并提交</button>'
        + '</div>';
    } else if(s === 'pending_approval'){
      html = '<div class="btn-row">'
        + '<button class="btn-secondary" onclick="window.location.href=\\'/\\'">' + '<i class="fas fa-home" style="font-size:12px;margin-right:4px;"></i>返回首页</button>'
        + '<button class="btn-secondary" disabled style="flex:1.5;opacity:0.6;cursor:not-allowed;">'
        + '<i class="fas fa-hourglass-half" style="font-size:12px;margin-right:4px;"></i>等待班主任审批中...</button>'
        + '</div>';
    } else if(s === 'approved'){
      html = '<div class="btn-row">'
        + '<button class="btn-secondary" onclick="window.location.href=\\'/\\'">' + '<i class="fas fa-home" style="font-size:12px;margin-right:4px;"></i>返回首页</button>'
        + '<button class="btn-primary" onclick="window.location.href=\\'/contracts/' + TD.contractId + '/sign\\'" style="flex:1.5;background:linear-gradient(135deg,#16A34A,#15803D);">'
        + '<i class="fas fa-pen-fancy" style="font-size:12px;margin-right:4px;"></i>前往签署合同</button>'
        + '</div>';
    }
    actBox.innerHTML = html;

    // 绑定确认按钮事件
    var confirmBtn = document.getElementById('btn-confirm-terms');
    if(confirmBtn){
      confirmBtn.addEventListener('click', function(){
        confirmBtn.disabled = true;
        confirmBtn.textContent = '提交中...';

        fetch('/api/admin/contracts/' + TD.contractId + '/confirm-terms', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin',
          body: JSON.stringify({
            fundingAmount: curAmount,
            revenueShareRatio: curRatio,
            shares: curShares,
            cooperationTerm: curTerm
          })
        }).then(function(r){ return r.json(); }).then(function(d){
          if(!d.ok){
            showToast(d.error || '\\u63d0\\u4ea4\\u5931\\u8d25', 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check" style="font-size:12px;margin-right:4px;"></i>确认条款并提交';
            return;
          }
          TD.approvalStatus = 'pending_approval';
          showToast('\\u6761\\u6b3e\\u5df2\\u786e\\u8ba4\\uff0c\\u7b49\\u5f85\\u73ed\\u4e3b\\u4efb\\u5ba1\\u6279', 'success');
          // 禁用所有滑块
          amountSlider.disabled = true;
          amountInput.disabled = true;
          ratioSlider.disabled = true;
          ratioInput.disabled = true;
          termSlider.disabled = true;
          termInput.disabled = true;
          renderBanner();
          renderActions();
        }).catch(function(){
          showToast('\\u7f51\\u7edc\\u9519\\u8bef', 'error');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-check" style="font-size:12px;margin-right:4px;"></i>确认条款并提交';
        });
      });
    }
  }
  renderActions();

  // 如果不是 draft/rejected 状态，禁用所有滑块
  if(TD.approvalStatus !== 'draft' && TD.approvalStatus !== 'rejected'){
    amountSlider.disabled = true;
    amountInput.disabled = true;
    ratioSlider.disabled = true;
    ratioInput.disabled = true;
    termSlider.disabled = true;
    termInput.disabled = true;
  }

  // 初始计算
  updateCalcs();
})();
`}} />
    </div>,
    { title: '中流通 - 条款通' }
  )
})
}
