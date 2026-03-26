// Route: /contracts/:id/sign
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, AuthCheckScript,
} from '../components'

export function registerContractSignRoute(app: Hono<HonoEnv>) {
app.get('/contracts/:id/sign', async (c) => {
  // ═══ Phase 1C: NO DB calls — pure HTML skeleton ═══
  const contractId = c.req.param('id')

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="javascript:history.back()" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回
        </a>

        {/* Approval Status Banner */}
        <div id="approval-banner" />

        {/* Contract Content — scrollable full contract */}
        <div id="contract-body-card" style="background:#fff;border-radius:16px;border:1px solid #E7E5E4;margin-bottom:16px;overflow:hidden;">
          {/* Scroll hint */}
          <div id="contract-scroll-hint" style="background:#FEF3C7;border-radius:8px;padding:8px 12px;font-size:12px;color:#92400E;margin:16px 16px 0 16px;">
            ⚠️ 请仔细阅读以下协议条款，滑动至底部后方可签署
          </div>
          {/* Scrollable contract text */}
          <div id="contract-content" style="max-height:60vh;overflow-y:auto;padding:20px;">
            <p style="text-align:center;color:#A8A29E;">加载中...</p>
          </div>
        </div>

        {/* Plain Language Block for contract */}
        <div id="contract-plain-lang" class="plain-lang-block mb-4" style="display:none;" />

        {/* Sign Area */}
        <div class="sign-area mb-4" id="sign-area">
          <h4 class="font-semibold text-text-title mb-4" style="font-size:16px;">
            <i class="fas fa-pen-nib mr-2" style="color:#D4A853;font-size:14px;" />签署确认
          </h4>

          {/* Scroll-gated sign button */}
          <button class="mt-0 mb-3" id="sign-scroll-btn" disabled={true} style="width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:600;border:none;cursor:not-allowed;background:#E7E5E4;color:#A8A29E;transition:all 0.3s ease;">
            <i class="fas fa-signature mr-2" />请先阅读完整合同
          </button>

          <div id="sign-form-area" style="display:none;">
            <div class="checkbox-row mb-3">
              <input type="checkbox" id="agree-check" />
              <label for="agree-check">我已阅读并同意以上合同条款</label>
            </div>

            <div class="verify-row">
              <input type="text" class="verify-input" id="verify-code" placeholder="请输入验证码" maxlength={6} />
              <button class="verify-send-btn" id="verify-send">发送验证码</button>
            </div>

            <button class="btn-gold mt-4" id="sign-btn" disabled={true} style="opacity:0.5;">
              <i class="fas fa-signature mr-2" />确认签署
            </button>
          </div>

          {/* Sign Status */}
          <div class="sign-status" id="sign-status">
            <div class="sign-status-item">
              <div class="sign-status-label">甲方（发起人）</div>
              <div class="sign-status-val sign-status-pending" id="sign-a">
                <i class="fas fa-clock mr-1" />待签署
              </div>
            </div>
            <div class="sign-status-item">
              <div class="sign-status-label">乙方（参与人）</div>
              <div class="sign-status-val sign-status-pending" id="sign-b">
                <i class="fas fa-clock mr-1" />待签署
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ceremony full-screen page (Task 1 — replaces old success overlay) */}
      <div class="ceremony-page" id="ceremony-page">
        <div class="ceremony-check-circle" id="ceremony-circle">
          <span class="ceremony-check-mark" id="ceremony-check">✓</span>
        </div>
        <div class="ceremony-title">
          <h2>投资协议已生效</h2>
          <p>合同由平台托管，具有法律效力</p>
        </div>
        <div class="ceremony-summary" id="ceremony-summary">
          {/* Rows injected by JS */}
        </div>
        <div class="ceremony-buttons">
          <button class="ceremony-btn-primary" id="ceremony-share-btn">📤 分享给同学</button>
          <button class="ceremony-btn-secondary" id="ceremony-contract-btn">查看合同详情</button>
          <button class="ceremony-btn-tertiary" id="ceremony-home-btn">返回首页</button>
        </div>
      </div>

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACT_ID = '${contractId}';
  var contract = null;

  // Fetch contract data + project data via APIs
  Promise.all([
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();})
  ]).then(function(results){
    var allContracts = results[0].ok ? results[0].data : [];
    var allProjects = results[1].ok ? results[1].data : [];
    var allMembers = results[2].ok ? results[2].data : [];
    var tc = allContracts.find(function(c){return c.id === CONTRACT_ID;});
    if(!tc){
      // Fallback: try fetching from admin API for newly created contracts
      return fetch('/api/admin/contracts/' + CONTRACT_ID).then(function(r){return r.json();}).then(function(res){
        if(res.ok && res.data){ contract = res.data; renderContract(); }
        else { document.getElementById('contract-content').innerHTML='<p style="text-align:center;color:#DC2626;">合同未找到</p>'; document.getElementById('sign-area').style.display='none'; }
      });
    }
    var tp = allProjects.find(function(p){return p.id === tc.projectId;});
    var ti = allMembers.find(function(m){return m.id === tc.initiatorId;});
    contract = {
      id:tc.id, projectId:tc.projectId, projectName:tc.projectName, userId:tc.participantId,
      amount:tc.amount, shares:tc.shares, revenueShareRatio:tc.revenueShareRatio,
      cooperationTerm:tc.cooperationTerm, recoveryCap:tc.recoveryCap,
      signedByInitiator:tc.signedByInitiator, signedByParticipant:tc.signedByParticipant,
      signedAt:tc.signedAt, status:tc.status, totalRepaid:tc.totalRepaid||0,
      ownerName: (ti?ti.name:null) || tc.initiatorName || '发起人',
      approvalStatus: tc.approvalStatus || 'draft',
      annualYieldRate: tc.annualYieldRate || 0,
      exitMode: tc.exitMode || 'both',
      endDate: tc.endDate || null,
      capMultipleAtTerm: tc.capMultipleAtTerm || 0,
      initiatorId: tc.initiatorId,
      project: tp ? {
        id:tp.id, name:tp.name, targetAmount:tp.targetAmount,
        revenueShareRate:tp.revenueShareRate, recoveryMultiple:tp.recoveryMultiple,
        duration:tp.duration, exitMode:tp.exitMode||'both',
        annualYieldRate:tp.annualYieldRate!=null?tp.annualYieldRate:12,
        expectMultiple:tp.expectMultiple!=null?tp.expectMultiple:null,
        settlementCycle:tp.settlementCycle||'monthly',
        estimatedMonthlyRevenue:tp.estimatedMonthlyRevenue||0,
      } : null,
    };
    renderContract();
  }).catch(function(){
    document.getElementById('contract-content').innerHTML='<p style="text-align:center;color:#DC2626;">合同未找到</p>';
    document.getElementById('sign-area').style.display='none';
  });

  function renderContract(){
  if(!contract) return;

  // ── 审批状态检查：未审批通过的合同不显示合同内容 ──
  var approvalBanner = document.getElementById('approval-banner');
  var approvalStatus = contract.approvalStatus || 'draft';
  if(approvalStatus === 'draft'){
    if(approvalBanner) approvalBanner.innerHTML = '<div style="background:#DBEAFE;border:1px solid #93C5FD;border-radius:12px;padding:16px 18px;margin-bottom:16px;text-align:center;">'
      + '<i class="fas fa-edit" style="color:#2563EB;font-size:24px;margin-bottom:8px;display:block;"></i>'
      + '<div style="font-size:15px;font-weight:600;color:#1E40AF;">条款尚未确认</div>'
      + '<div style="font-size:13px;color:#3B82F6;margin-top:4px;">请先前往条款通确认联营条款</div>'
      + '<a href="/contracts/' + CONTRACT_ID + '/terms" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#2563EB;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">前往条款通</a></div>';
    document.getElementById('contract-body-card').style.display = 'none';
    var signArea = document.getElementById('sign-area');
    if(signArea) signArea.style.display = 'none';
    return;
  }
  if(approvalStatus === 'pending_approval'){
    if(approvalBanner) approvalBanner.innerHTML = '<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;padding:16px 18px;margin-bottom:16px;text-align:center;">'
      + '<i class="fas fa-hourglass-half" style="color:#B45309;font-size:24px;margin-bottom:8px;display:block;"></i>'
      + '<div style="font-size:15px;font-weight:600;color:#92400E;">等待班主任审批</div>'
      + '<div style="font-size:13px;color:#B45309;margin-top:4px;">合同条款已提交，需要班主任审批后方可查看和签署</div></div>';
    document.getElementById('contract-body-card').style.display = 'none';
    var signArea = document.getElementById('sign-area');
    if(signArea) signArea.style.display = 'none';
    return;
  }
  if(approvalStatus === 'rejected'){
    if(approvalBanner) approvalBanner.innerHTML = '<div style="background:#FEE2E2;border:1px solid #FECACA;border-radius:12px;padding:16px 18px;margin-bottom:16px;text-align:center;">'
      + '<i class="fas fa-times-circle" style="color:#DC2626;font-size:24px;margin-bottom:8px;display:block;"></i>'
      + '<div style="font-size:15px;font-weight:600;color:#991B1B;">审批未通过</div>'
      + '<div style="font-size:13px;color:#DC2626;margin-top:4px;">合同条款未通过审批，请修改后重新提交</div>'
      + '<a href="/contracts/' + CONTRACT_ID + '/terms" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#DC2626;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">重新修改条款</a></div>';
    document.getElementById('contract-body-card').style.display = 'none';
    var signArea = document.getElementById('sign-area');
    if(signArea) signArea.style.display = 'none';
    return;
  }
  // approved 状态：显示审批通过横幅
  if(approvalStatus === 'approved'){
    if(approvalBanner) approvalBanner.innerHTML = '<div style="background:#D1FAE5;border:1px solid #6EE7B7;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">'
      + '<i class="fas fa-check-circle" style="color:#16A34A;font-size:18px;flex-shrink:0;"></i>'
      + '<div><div style="font-size:14px;font-weight:600;color:#166534;">审批通过</div>'
      + '<div style="font-size:12px;color:#16A34A;margin-top:2px;">合同已审批通过，请双方签署</div></div></div>';
  }

  // Load project data
  var proj = contract.project;
  var ownerName = contract.ownerName || '发起人';

  // ── Render full contract HTML via API ──
  document.getElementById('contract-content').innerHTML = '<div style="text-align:center;padding:20px;"><div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:24px;height:24px;margin:0 auto;"></div></div>';
  fetch('/api/data/contracts/' + CONTRACT_ID + '/html').then(function(r){return r.json();}).then(function(res){
    if(res.ok && res.data){ document.getElementById('contract-content').innerHTML = res.data; setupScrollDetection(); }
    else { renderFallbackContract(); }
  }).catch(function(){ renderFallbackContract(); });

  function renderFallbackContract(){
    // Ultimate fallback — old-style rendering
    var html = '';
    html += '<div style="text-align:center;padding-bottom:24px;border-bottom:2px solid #B91C1C;">';
    html += '<div style="font-size:11px;color:#A8A29E;letter-spacing:2px;">合同编号：' + CONTRACT_ID + '</div>';
    html += '<div style="font-size:22px;font-weight:800;color:#B91C1C;margin-top:12px;letter-spacing:4px;">联合经营协议</div>';
    html += '</div>';
    html += '<div style="margin-top:24px;font-size:13px;color:#57534E;">';
    html += '<p>甲方（项目发起方）：<b>' + ownerName + '</b></p>';
    html += '<p>乙方（投资参与方）：<b>' + u.name + '</b></p>';
    html += '<p style="margin-top:12px;">项目名称：<b>' + proj.name + '</b></p>';
    html += '<p>投资金额：<b>¥' + contract.amount + '万元</b></p>';
    html += '<p>分成比例：<b>' + proj.revenueShareRate + '%</b></p>';
    html += '<p>联营期限：<b>' + proj.duration + ' 个月</b></p>';
    html += '</div>';
    document.getElementById('contract-content').innerHTML = html;
  }

  // Render plain-language block for contract
  (function(){
    var plEl = document.getElementById('contract-plain-lang');
    if(!plEl || !proj) return;
    var amount = contract.amount;
    var ratio = proj.revenueShareRate;
    var estRevenue = proj.estimatedMonthlyRevenue;
    var totalAmount = proj.targetAmount;
    var monthlyShare = estRevenue * ratio / 100;
    var myMonthly = monthlyShare * (amount / totalAmount);
    var myMonths = myMonthly > 0 ? Math.ceil(amount / myMonthly) : 0;
    var myCap = contract.recoveryCap;
    if(!myCap){
      var _em = proj.exitMode || 'both';
      if(_em === 'term_only'){
        myCap = amount * (proj.expectMultiple || proj.recoveryMultiple || 1.3);
      } else {
        var _yr = (_em === 'term_only') ? 0 : (proj.annualYieldRate != null ? proj.annualYieldRate : 12);
        var _basis = proj.settlementCycle || 'monthly';
        var _flat = _yr / (_basis==='weekly'?52:_basis==='daily'?365:12) / 100;
        var _monthlyS = (proj.estimatedMonthlyRevenue||0) * (proj.revenueShareRate||0) / 100;
        var _myMonthly = _monthlyS * (amount / (proj.targetAmount||1));
        var _payback = _myMonthly > 0 ? Math.ceil(amount / _myMonthly) : 24;
        var _dur = _em === 'cap_only' ? _payback : (proj.duration || 36);
        var _periods = _basis==='weekly'?Math.ceil(_dur*4.33):_basis==='daily'?Math.ceil(_dur*30.42):_dur;
        myCap = amount + amount * _flat * _periods;
      }
    }

    plEl.style.display = 'block';
    plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
      + '<div class="plain-lang-body">'
      + '你将投入 ' + amount + ' 万参与"' + proj.name + '"项目。项目每月收入的 ' + ratio + '% 按你的份额比例分给你。按预估，你每月约拿到 ' + myMonthly.toFixed(2) + ' 万，约 ' + myMonths + ' 个月收回本金，最多拿回 ' + myCap.toFixed(2) + ' 万。'
      + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
      + '</div>';
  })();

  // ── Scroll-to-bottom detection ──
  var scrollContainer = document.getElementById('contract-content');
  var scrollBtn = document.getElementById('sign-scroll-btn');
  var signFormArea = document.getElementById('sign-form-area');
  var hasScrolledToBottom = false;

  function checkScrollBottom() {
    if (hasScrolledToBottom) return;
    var el = scrollContainer;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      hasScrolledToBottom = true;
      scrollBtn.style.background = 'linear-gradient(135deg, #B91C1C, #991B1B)';
      scrollBtn.style.color = '#fff';
      scrollBtn.style.cursor = 'pointer';
      scrollBtn.disabled = false;
      scrollBtn.innerHTML = '<i class="fas fa-signature" style="margin-right:8px;"></i>我已阅读完毕，开始签署';
    }
  }

  function setupScrollDetection(){
    scrollContainer.addEventListener('scroll', checkScrollBottom);
    setTimeout(function(){
      if (scrollContainer.scrollHeight <= scrollContainer.clientHeight + 20) {
        hasScrolledToBottom = true;
        scrollBtn.style.background = 'linear-gradient(135deg, #B91C1C, #991B1B)';
        scrollBtn.style.color = '#fff';
        scrollBtn.style.cursor = 'pointer';
        scrollBtn.disabled = false;
        scrollBtn.innerHTML = '<i class="fas fa-signature" style="margin-right:8px;"></i>我已阅读完毕，开始签署';
      }
    }, 300);
  }
  setupScrollDetection();

  scrollBtn.addEventListener('click', function(){
    if (!hasScrolledToBottom) return;
    scrollBtn.style.display = 'none';
    signFormArea.style.display = 'block';
    document.getElementById('contract-scroll-hint').style.display = 'none';
  });

  // Check if already signed
  if(contract.status === 'active'){
    document.getElementById('contract-scroll-hint').style.display = 'none';
    scrollBtn.style.display = 'none';
    signFormArea.style.display = 'none';
    document.getElementById('sign-area').innerHTML = '<div style="text-align:center;padding:20px;"><div style="width:56px;height:56px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 12px;"><i class="fas fa-check"></i></div><p style="font-size:16px;font-weight:600;color:#16a34a;">合同已签署生效</p></div>';
    return;
  }

  // Verify code logic
  var verifyBtn = document.getElementById('verify-send');
  var verifyInput = document.getElementById('verify-code');
  var agreeCheck = document.getElementById('agree-check');
  var signBtn = document.getElementById('sign-btn');
  var countdown = 0;

  verifyBtn.addEventListener('click', function(){
    if(countdown > 0) return;
    countdown = 60;
    verifyBtn.disabled = true;
    verifyBtn.textContent = '60s';
    showToast('验证码已发送（Demo: 888888）', 'success');
    var cd = setInterval(function(){
      countdown--;
      if(countdown <= 0){ clearInterval(cd); verifyBtn.disabled = false; verifyBtn.textContent = '发送验证码'; }
      else { verifyBtn.textContent = countdown + 's'; }
    }, 1000);
  });

  // Enable sign button when both checked and code filled
  function checkCanSign(){
    var canSign = agreeCheck.checked && verifyInput.value.trim().length >= 4;
    signBtn.disabled = !canSign;
    signBtn.style.opacity = canSign ? '1' : '0.5';
  }
  agreeCheck.addEventListener('change', checkCanSign);
  verifyInput.addEventListener('input', checkCanSign);

  // Sign
  signBtn.addEventListener('click', function(){
    if(signBtn.disabled) return;
    if(verifyInput.value.trim() !== '888888'){
      showToast('验证码错误', 'error');
      return;
    }

    // Update sign status — participant signs
    var signB = document.getElementById('sign-b');
    signB.className = 'sign-status-val sign-status-done';
    signB.innerHTML = '<i class="fas fa-check-circle mr-1"></i>已签署';

    // Disable sign area inputs
    signBtn.disabled = true;
    signBtn.textContent = '签署中...';
    agreeCheck.disabled = true;
    verifyInput.disabled = true;
    verifyBtn.disabled = true;

    // Call API to sign as participant
    fetch('/api/admin/contracts/' + CONTRACT_ID + '/sign', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId: u.id, role: 'participant' })
    }).then(function(r){return r.json();}).then(function(d){
      if(!d.ok){ showToast(d.error || '签署失败', 'error'); return; }

      // Auto-sign as initiator after 1s
      setTimeout(function(){
        fetch('/api/admin/contracts/' + CONTRACT_ID + '/sign', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ userId: contract.initiatorId || 'auto', role: 'initiator' })
        }).then(function(r){return r.json();}).then(function(){
          var signA = document.getElementById('sign-a');
          signA.className = 'sign-status-val sign-status-done';
          signA.innerHTML = '<i class="fas fa-check-circle mr-1"></i>已签署';

          contract.status = 'active';

          // Show ceremony page
          setTimeout(function(){
            var investmentAmount = contract.amount;
            var proj = contract.project || contract;
            var sharePercentage = (investmentAmount / (proj.targetAmount||1) * 100).toFixed(1);
            var monthlyShare = (investmentAmount * (proj.revenueShareRate||0) / 100).toFixed(2);
            var recoveryCap;
            if(contract.recoveryCap){
              recoveryCap = contract.recoveryCap.toFixed(1);
            } else {
              var _cEm = proj.exitMode || 'both';
              if(_cEm === 'term_only'){
                recoveryCap = (investmentAmount * (proj.expectMultiple || proj.recoveryMultiple || 1.3)).toFixed(1);
              } else {
                var _cYr = (proj.annualYieldRate != null ? proj.annualYieldRate : 12);
                var _cBasis = proj.settlementCycle || 'monthly';
                var _cFlat = _cYr / (_cBasis==='weekly'?52:_cBasis==='daily'?365:12) / 100;
                var _cMs = (proj.estimatedMonthlyRevenue||0) * (proj.revenueShareRate||0) / 100;
                var _cMyM = _cMs * (investmentAmount / (proj.targetAmount||1));
                var _cPb = _cMyM > 0 ? Math.ceil(investmentAmount / _cMyM) : 24;
                var _cDur = _cEm === 'cap_only' ? _cPb : (proj.duration || 36);
                var _cPer = _cBasis==='weekly'?Math.ceil(_cDur*4.33):_cBasis==='daily'?Math.ceil(_cDur*30.42):_cDur;
                recoveryCap = (investmentAmount + investmentAmount * _cFlat * _cPer).toFixed(1);
              }
            }

            var summaryEl = document.getElementById('ceremony-summary');
            if(summaryEl){
              summaryEl.innerHTML = ''
                + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">投资金额</span><span class="ceremony-summary-value">¥' + investmentAmount + '万</span></div>'
                + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">占比份额</span><span class="ceremony-summary-value">' + sharePercentage + '%</span></div>'
                + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">预估月回款</span><span class="ceremony-summary-value">≈¥' + monthlyShare + '万</span></div>'
                + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">回收上限</span><span class="ceremony-summary-value">¥' + recoveryCap + '万</span></div>';
            }

            var ceremony = document.getElementById('ceremony-page');
            if(ceremony){
              ceremony.classList.add('show');
              var circle = document.getElementById('ceremony-circle');
              var check = document.getElementById('ceremony-check');
              if(circle) circle.classList.add('animate');
              if(check) check.classList.add('animate');
            }

            var shareBtn = document.getElementById('ceremony-share-btn');
            if(shareBtn){
              shareBtn.addEventListener('click', function(){
                window.location.href = '/projects/' + contract.projectId + '?share=true';
              });
            }
            var contractBtn = document.getElementById('ceremony-contract-btn');
            if(contractBtn){
              contractBtn.addEventListener('click', function(){
                ceremony.classList.remove('show');
              });
            }
            var homeBtn = document.getElementById('ceremony-home-btn');
            if(homeBtn){
              homeBtn.addEventListener('click', function(){
                window.location.href = '/';
              });
            }
          }, 500);
        });
      }, 1000);
    }).catch(function(){
      showToast('网络错误', 'error');
      signBtn.disabled = false; signBtn.textContent = '确认签署';
      agreeCheck.disabled = false; verifyInput.disabled = false; verifyBtn.disabled = false;
    });
  });
  } // end renderContract
  if(contract) renderContract();
})();
`}} />
    </div>,
    { title: '中流通 - 合同签署' }
  )
})
}
