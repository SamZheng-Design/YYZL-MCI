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

        {/* Stepper */}
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
              <div class="stepper-label" id="label-3">预览发布</div>
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
                    <div style="font-size:11px;color:#78716C;">融资 200-500万 · 分成 10-15% · 期限 24-36月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #3B82F6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">智能制造</div>
                    <div style="font-size:11px;color:#78716C;">融资 300-800万 · 分成 12-18% · 期限 36-48月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #16A34A;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">教育培训</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 8-12% · 期限 18-24月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #8B5CF6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">美容健康</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 10-15% · 期限 18-30月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #F59E0B;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">物流供应链</div>
                    <div style="font-size:11px;color:#78716C;">融资 500-1000万 · 分成 15-20% · 期限 36-48月 · 倍数 1.5x</div>
                  </div>
                </div>
                <div style="font-size:11px;color:#A8A29E;margin-top:8px;">ℹ️ 以上为平台典型案例范围，仅供参考</div>
              </div>
            </div>
          </div>

          {/* Terms Card — with internal grouping */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-file-contract detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
              <span>条款设定</span>
            </div>

            {/* Group 1: Funding */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-coins mr-1.5" style="font-size:11px;color:#D4A853;" />资金规模</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">融资总额 <span class="req">*</span>
                    <span class="help-icon" data-help-id="totalAmount">?</span>
                  </label>
                  <div class="help-text">这个项目总共需要多少资金。所有参与人的投资加起来等于这个数。</div>
                  <div class="input-unit-wrap">
                    <input id="f-amount" type="number" class="form-input" placeholder="如 200" min={1} />
                    <span class="input-unit">万元</span>
                  </div>
                </div>
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">分成比例 <span class="req">*</span>
                    <span class="help-icon" data-help-id="revenueShareRatio">?</span>
                  </label>
                  <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
                  <div class="input-unit-wrap" id="input-share-ratio">
                    <input id="f-rate" type="number" class="form-input" placeholder="如 12" min={0.1} max={100} step={0.1} />
                    <span class="input-unit">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Terms */}
            <div class="create-terms-group">
              <div class="create-terms-group-label"><i class="fas fa-handshake mr-1.5" style="font-size:11px;color:#D4A853;" />合作条件</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">联营期限 <span class="req">*</span>
                    <span class="help-icon" data-help-id="cooperationTerm">?</span>
                  </label>
                  <div class="help-text">合作持续多长时间。到期后无论是否收回投资，合同自动结束。</div>
                  <div class="input-unit-wrap">
                    <input id="f-duration" type="number" class="form-input" placeholder="如 24" min={1} />
                    <span class="input-unit">个月</span>
                  </div>
                </div>
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
              </div>
            </div>

            {/* Group 3: Returns & Reporting */}
            <div style="padding-top:16px;">
              <div class="create-terms-group-label"><i class="fas fa-chart-line mr-1.5" style="font-size:11px;color:#D4A853;" />回报预估</div>
              <div class="grid grid-cols-2 gap-3 mb-3">
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
                <div>
                  <label class="form-label" style="display:flex;align-items:center;gap:4px;">回收倍数
                    <span class="help-icon" data-help-id="recoveryMultiple">?</span>
                  </label>
                  <div class="help-text">参与人最多能拿回投资额的多少倍。1.5倍意味着投10万最多拿回15万。达到上限后合同自动结束。</div>
                  <div class="input-unit-wrap">
                    <input id="f-multiple" type="number" class="form-input" placeholder="1.5" min={1} max={10} step={0.1} value="1.5" />
                    <span class="input-unit">x</span>
                  </div>
                </div>
              </div>
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">上报频率
                  <span class="help-icon" data-help-id="reportFrequency">?</span>
                </label>
                <div class="help-text">你多久向参与人汇报一次项目收入。月报适合大部分项目，日报适合零售等每日有流水的项目。</div>
                <select id="f-freq" class="form-select">
                  <option value="月报">月报</option>
                  <option value="日报">日报</option>
                </select>
              </div>
            </div>
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

        {/* Step 3: Preview & Publish */}
        <div id="step-3" class="step-panel" style="display:none;">
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-eye detail-card-header-icon" style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#16A34A;" />
              <span>项目预览</span>
            </div>

            {/* Preview content — filled by JS */}
            <div id="preview-content" />
          </div>

          <div class="btn-row" style="flex-wrap:wrap;">
            <button class="btn-secondary" id="btn-prev-3" style="flex:0 0 auto;width:auto;padding:0 20px;">
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

  // Step navigation
  var currentStep = 1;
  var panels = [null, document.getElementById('step-1'), document.getElementById('step-2'), document.getElementById('step-3')];

  function updateStepper(){
    for(var i=1;i<=3;i++){
      var dot = document.getElementById('dot-'+i);
      var label = document.getElementById('label-'+i);
      dot.className = 'stepper-dot ' + (i < currentStep ? 'stepper-dot-done' : i === currentStep ? 'stepper-dot-active' : 'stepper-dot-pending');
      dot.textContent = i < currentStep ? '\\u2713' : i;
      label.className = 'stepper-label ' + (i < currentStep ? 'stepper-label-done' : i === currentStep ? 'stepper-label-active' : '');
    }
    for(var i=1;i<=2;i++){
      var line = document.getElementById('line-'+i);
      line.className = 'stepper-line ' + (i < currentStep ? 'stepper-line-done' : 'stepper-line-pending');
    }
  }

  function goStep(n, direction){
    if(n < 1 || n > 3) return;
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

  // Form fields
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
  var fRate = document.getElementById('f-rate');
  var fDuration = document.getElementById('f-duration');
  var fMinamt = document.getElementById('f-minamt');
  var fRevenue = document.getElementById('f-revenue');
  var fMultiple = document.getElementById('f-multiple');
  var fFreq = document.getElementById('f-freq');

  // Char count
  var descCount = document.getElementById('desc-count');
  fDesc.addEventListener('input', function(){
    var len = fDesc.value.length;
    descCount.textContent = len + '/200';
    descCount.className = len > 200 ? 'char-count char-count-over' : 'char-count';
  });
  // Highlight text char count
  var htCount = document.getElementById('highlight-text-count');
  fHighlightText.addEventListener('input', function(){
    var len = fHighlightText.value.length;
    htCount.textContent = len + '/50';
    htCount.style.color = len > 50 ? '#DC2626' : '#A8A29E';
  });

  // File upload
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

  // Step 1 validation
  document.getElementById('btn-next-1').addEventListener('click', function(){
    var errors = [];
    if(!fName.value.trim()) errors.push('项目名称');
    if(!fIndustry.value) errors.push('所属行业');
    if(!fDesc.value.trim()) errors.push('项目简介');
    if(fDesc.value.length > 200) errors.push('项目简介超过200字');
    if(errors.length > 0){
      showToast('请填写：' + errors.join('、'), 'error');
      return;
    }
    goStep(2, 'right');
    // Inline hint for share ratio (replaces Coach Mark overlay)
    setTimeout(function(){
      var hintKey = 'zlc_create_ratio_hint';
      if(localStorage.getItem(hintKey)) return;
      var target = document.getElementById('input-share-ratio');
      if(!target) return;
      var hint = document.createElement('div');
      hint.id = 'create-ratio-hint';
      hint.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;margin-top:8px;display:flex;align-items:flex-start;gap:8px;animation:coachFadeIn 0.4s ease forwards;';
      hint.innerHTML = '<span style="flex-shrink:0;">💡</span><div style="flex:1;font-size:12px;color:#92400E;line-height:1.5;">这是你愿意分给参与人的月收入比例。填高了回款快但让利多，填低了可能不够吸引人。一般在8%-20%。<button id="create-ratio-hint-dismiss" style="color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-left:4px;padding:0;font-size:12px;">知道了</button></div>';
      target.parentNode.insertBefore(hint, target.nextSibling);
      document.getElementById('create-ratio-hint-dismiss').addEventListener('click', function(){
        localStorage.setItem(hintKey, '1');
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.3s';
        setTimeout(function(){ hint.remove(); }, 300);
      });
    }, 600);
    // ── Nudge B: Terms step 30s without number input ──
    if (!localStorage.getItem('zlc_nudge_create_terms')) {
      var termsNudgeTimer = setTimeout(function(){ showNudge('\\uD83D\\uDCCA', '不确定怎么填？展开上方的「同行案例参考」看看', 'create_terms'); }, 30000);
      function cancelTermsNudge(){ clearTimeout(termsNudgeTimer); }
      [fAmount, fRate, fDuration, fMinamt, fRevenue, fMultiple].forEach(function(input){
        input.addEventListener('input', cancelTermsNudge);
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

  // Re-init help icons for step 2 (created dynamically)
  if(typeof initHelpIcons === 'function') initHelpIcons();

  // Step 2 auto-calc
  var calcFields = [fAmount, fRate, fDuration, fMinamt, fRevenue, fMultiple];
  function updateAutoCalc(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;

    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var cap = amount * multiple;
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;

    document.getElementById('calc-shares').textContent = shares > 0 ? shares + ' 份' : '—';
    document.getElementById('calc-cap2').textContent = cap > 0 ? '¥' + cap.toFixed(1) + '万' : '—';
    document.getElementById('calc-monthly2').textContent = monthly > 0 ? '¥' + monthly.toFixed(2) + '万' : '—';
    document.getElementById('calc-payback').textContent = payback > 0 ? payback + ' 个月' : '—';

    // Example
    var exampleEl = document.getElementById('example-text');
    if(minamt > 0 && monthly > 0){
      var perShareMonthly = revenue * (rate / 100) * (minamt / amount);
      var perSharePayback = Math.ceil(minamt / perShareMonthly);
      exampleEl.textContent = '如果参与 ¥' + minamt + '万，预估每月回款 ¥' + perShareMonthly.toFixed(2) + '万，约' + perSharePayback + '个月收回本金';
    } else {
      exampleEl.textContent = '填写条款后，此处会显示参与举例说明';
    }

    // Plain language block for create page
    var plEl = document.getElementById('create-plain-lang');
    if(plEl){
      if(amount > 0 && rate > 0 && revenue > 0 && minamt > 0){
        var monthlyShareAll = revenue * (rate / 100);
        var perShareM = monthlyShareAll * (minamt / amount);
        var perSharePB = perShareM > 0 ? Math.ceil(minamt / perShareM) : 0;
        var perShareCap = minamt * multiple;
        plEl.style.display = 'block';
        plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
          + '<div class="plain-lang-body">'
          + '这个项目总共需要 ' + amount + ' 万资金。你承诺把项目每月收入的 ' + rate + '% 分给所有参与人。按预估每月收入 ' + revenue + ' 万计算，每月总共分出约 ' + monthlyShareAll.toFixed(2) + ' 万。'
          + '<br/><br/>如果有人参与 ' + minamt + ' 万（1份），他每月大约能拿到 ' + perShareM.toFixed(2) + ' 万，大概 ' + perSharePB + ' 个月收回本金，最多能拿回 ' + perShareCap.toFixed(2) + ' 万（投资额的 ' + multiple + ' 倍）。'
          + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
          + '</div>';
      } else {
        plEl.style.display = 'none';
      }
    }
  }
  calcFields.forEach(function(f){ f.addEventListener('input', updateAutoCalc); });

  // Step 2 nav
  document.getElementById('btn-prev-2').addEventListener('click', function(){ goStep(1, 'left'); });
  document.getElementById('btn-next-2').addEventListener('click', function(){
    var errors = [];
    if(!fAmount.value || parseFloat(fAmount.value)<=0) errors.push('融资总额');
    if(!fRate.value || parseFloat(fRate.value)<=0) errors.push('分成比例');
    if(!fDuration.value || parseFloat(fDuration.value)<=0) errors.push('联营期限');
    if(!fMinamt.value || parseFloat(fMinamt.value)<=0) errors.push('最低参与额');
    if(!fRevenue.value || parseFloat(fRevenue.value)<=0) errors.push('预估月收入');
    if(errors.length > 0){
      showToast('请填写：' + errors.join('、'), 'error');
      return;
    }
    buildPreview();
    goStep(3, 'right');
  });

  // Step 3 preview builder
  function buildPreview(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var cap = amount * multiple;
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;

    var html = '';
    // Header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">' + (fIndustry.value||'') + '</span>';
    html += '<span class="badge badge-open">募集中</span>';
    html += '</div>';
    // Name
    html += '<h2 style="font-size:20px;font-weight:700;color:#292524;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + fName.value + '</h2>';
    // HighlightText (if any)
    if(fHighlightText.value.trim()){
      html += '<div style="font-size:14px;color:#B91C1C;font-style:italic;margin-bottom:12px;line-height:1.5;">' + fHighlightText.value.trim() + '</div>';
    }
    // Owner
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:12px;">';
    html += '<div style="width:40px;height:40px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
    html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + ' <span style="font-size:12px;color:#78716C;font-weight:400;">· ' + (u.title||'') + '</span></div>';
    html += '<div style="font-size:12px;color:#78716C;">' + (u.company||'') + ' · ' + (u.cohort||'') + '</div></div></div>';
    // Description
    html += '<p style="font-size:14px;line-height:1.7;color:#292524;margin-bottom:16px;">' + fDesc.value + '</p>';
    if(fDetail.value.trim()){
      html += '<p style="font-size:13px;line-height:1.7;color:#78716C;margin-bottom:16px;">' + fDetail.value + '</p>';
    }
    // Highlights (if any)
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    if(hlArr.length > 0){
      html += '<div style="margin-bottom:16px;padding:16px 20px;background:#fff;border-radius:14px;border-left:3px solid #D4A853;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:14px;font-weight:600;color:#1C1917;">项目亮点</span><span style="font-size:14px;">\\u2B50</span></div>';
      html += '<div style="margin-top:10px;">';
      hlArr.forEach(function(h){
        html += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;"><span style="width:6px;height:6px;background:#D4A853;border-radius:50%;flex-shrink:0;margin-top:6px;"></span><span style="font-size:14px;color:#44403C;line-height:1.6;">' + h + '</span></div>';
      });
      html += '</div></div>';
    }
    // Terms grid
    html += '<div style="border-left:4px solid #B91C1C;border-radius:12px;overflow:hidden;background:#fff;border:1px solid #F5F5F4;border-left:4px solid #B91C1C;">';
    html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;font-size:15px;font-weight:600;color:#292524;"><i class="fas fa-file-contract" style="color:#B91C1C;margin-right:8px;font-size:13px;"></i>收入分成条款</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">';
    var terms = [
      ['融资总额', '¥'+amount+'万'], ['分成比例', rate+'%'], ['联营期限', duration+'个月'],
      ['回收倍数', multiple+'x'], ['回收上限', '¥'+cap.toFixed(1)+'万'], ['预估月收入', '¥'+revenue+'万']
    ];
    terms.forEach(function(t,i){
      html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;' + (i%2===0?'border-right:1px solid #F5F5F4;':'') + '">';
      html += '<div style="font-size:11px;color:#78716C;margin-bottom:2px;">' + t[0] + '</div>';
      html += '<div style="font-size:17px;font-weight:700;color:#1C1917;">' + t[1] + '</div></div>';
    });
    html += '</div>';
    html += '<div style="background:#FEF2F2;padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    html += '<div><div style="font-size:11px;color:#78716C;">预估月回款</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">¥' + monthly.toFixed(2) + '万</div></div>';
    html += '<div><div style="font-size:11px;color:#78716C;">预估回收期</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">约' + payback + '月</div></div>';
    html += '</div></div>';
    // Info
    html += '<div style="margin-top:12px;font-size:12px;color:#78716C;">总份额 ' + shares + ' 份 · 每份 ¥' + minamt + '万 · 上报频率：' + fFreq.value + '</div>';
    if(uploadedFileName){
      html += '<div style="margin-top:8px;font-size:12px;color:#78716C;"><i class="fas fa-paperclip" style="margin-right:4px;"></i>附件：' + uploadedFileName + '</div>';
    }
    document.getElementById('preview-content').innerHTML = html;
  }

  // Step 3 nav
  document.getElementById('btn-prev-3').addEventListener('click', function(){ goStep(2, 'left'); });

  // Collect form data
  function collectData(status){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var id = 'p-' + Date.now().toString(36);
    // Collect highlights (filter empty)
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    return {
      id: id, name: fName.value.trim(), ownerId: u.id,
      industry: fIndustry.value, description: fDesc.value.trim(),
      detail: fDetail.value.trim(), attachment: uploadedFileName,
      highlightText: fHighlightText.value.trim() || '',
      highlights: hlArr.length > 0 ? hlArr : [],
      targetAmount: amount, raisedAmount: 0,
      revenueShareRate: rate, duration: duration,
      recoveryMultiple: multiple, estimatedMonthlyRevenue: revenue,
      totalShares: shares, raisedShares: 0,
      sharePrice: minamt, minShares: 1,
      reportFrequency: fFreq.value,
      status: status, createdAt: new Date().toISOString().slice(0,10),
      investors: []
    };
  }

  // Save draft via API
  document.getElementById('btn-draft').addEventListener('click', function(){
    var proj = collectData('draft');
    var btn = this;
    btn.disabled = true; btn.textContent = '保存中...';
    fetch('/api/admin/projects/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: u.id, name: proj.name, industry: proj.industry,
        description: proj.description, targetAmount: proj.targetAmount,
        revenueShareRate: proj.revenueShareRate, duration: proj.duration,
        recoveryMultiple: proj.recoveryMultiple, estimatedMonthlyRevenue: proj.estimatedMonthlyRevenue,
        totalShares: proj.totalShares, sharePrice: proj.sharePrice, minShares: proj.minShares || 1,
        highlightText: proj.highlightText, highlights: proj.highlights,
        initiatorNote: proj.detail, status: 'draft'
      })
    }).then(function(r){return r.json();}).then(function(d){
      btn.disabled = false; btn.textContent = '保存草稿';
      if(d.ok){
        showToast('草稿已保存', 'success');
        setTimeout(function(){ window.location.href = '/'; }, 800);
      } else {
        showToast(d.error || '保存失败', 'error');
      }
    }).catch(function(){
      btn.disabled = false; btn.textContent = '保存草稿';
      showToast('网络错误', 'error');
    });
  });

  // Publish via API
  document.getElementById('btn-publish').addEventListener('click', function(){
    var proj = collectData('open');
    var btn = this;
    btn.disabled = true; btn.textContent = '提交中...';
    fetch('/api/admin/projects/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: u.id, name: proj.name, industry: proj.industry,
        description: proj.description, targetAmount: proj.targetAmount,
        revenueShareRate: proj.revenueShareRate, duration: proj.duration,
        recoveryMultiple: proj.recoveryMultiple, estimatedMonthlyRevenue: proj.estimatedMonthlyRevenue,
        totalShares: proj.totalShares, sharePrice: proj.sharePrice, minShares: proj.minShares || 1,
        highlightText: proj.highlightText, highlights: proj.highlights,
        initiatorNote: proj.detail
      })
    }).then(function(r){return r.json();}).then(function(d){
      btn.disabled = false; btn.textContent = '发布项目';
      if(!d.ok){ showToast(d.error || '提交失败', 'error'); return; }
      var projectId = d.data.projectId;
      var shareCode = d.data.shareCode;

      // Show custom success modal with share button
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

      document.getElementById('success-share-btn').addEventListener('click', function(){
        window.location.href = '/projects/' + projectId + '?share=true';
      });
      document.getElementById('success-view-btn').addEventListener('click', function(){
        window.location.href = '/projects/' + projectId;
      });
    }).catch(function(){
      btn.disabled = false; btn.textContent = '发布项目';
      showToast('网络错误', 'error');
    });
  });
})();
`}} />
    </div>,
    { title: '中流通 - 发起项目' }
  )
})
}
