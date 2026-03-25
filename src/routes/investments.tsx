// Route: /investments/:contractId
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, AuthCheckScript,
} from '../components'

export function registerInvestmentsRoute(app: Hono<HonoEnv>) {
app.get('/investments/:contractId', async (c) => {
  const db = c.env.DB
  const { loadMembers, loadProjects, loadContracts, loadRepaymentRecords, generateContractHTML } = await import('../db-bridge')
  const [allMembers, allProjects, allContracts, allRepRecords] = await Promise.all([
    loadMembers(db), loadProjects(db), loadContracts(db), loadRepaymentRecords(db)
  ])
  const contractId = c.req.param('contractId')

  // Pre-generate contract HTML map for all known contracts (server-side)
  const contractHTMLMap: Record<string, string> = {}
  for (const ct of allContracts) {
    const proj = allProjects.find(p => p.id === ct.projectId)
    if (!proj) continue
    const initiator = allMembers.find(m => m.id === ct.initiatorId) || null
    const participant = allMembers.find(m => m.id === ct.participantId) || null
    contractHTMLMap[ct.id] = generateContractHTML(ct, proj, participant, initiator)
  }

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="/repayments" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回回款中心
        </a>

        <div id="invest-detail-content">
          <div class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载中...</p>
          </div>
        </div>
      </main>

      {/* Contract Full-text Modal (slide up from bottom) */}
      <div id="contract-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;">
        <div id="contract-modal-mask" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);opacity:0;transition:opacity 0.3s ease;" />
        <div id="contract-modal-sheet" style="position:absolute;bottom:0;left:0;right:0;max-height:92vh;background:#fff;border-radius:24px 24px 0 0;overflow-y:auto;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);">
          {/* Modal header */}
          <div style="position:sticky;top:0;background:#fff;z-index:1;padding:20px 20px 12px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:17px;font-weight:600;color:#1C1917;">合同详情</span>
            <button id="contract-modal-close" style="width:32px;height:32px;border-radius:50%;background:#F5F5F4;border:none;cursor:pointer;font-size:16px;color:#78716C;display:flex;align-items:center;justify-content:center;">×</button>
          </div>
          {/* Modal body */}
          <div id="contract-modal-body" style="padding:20px;" />
          {/* Modal footer — status label */}
          <div id="contract-modal-footer" style="padding:12px 20px 32px;text-align:center;" />
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACT_ID = '${contractId}';
  var CONTRACTS = ${JSON.stringify(allContracts)};
  var REP_RECORDS = ${JSON.stringify(allRepRecords)};
  var MEMBERS = ${JSON.stringify(allMembers.map(m => ({ id:m.id, name:m.name, company:m.company })))};
  var CONTRACT_HTML_MAP = ${JSON.stringify(contractHTMLMap)};

  // Merge localStorage data
  var lsContracts = [];
  try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  lsContracts.forEach(function(c){ if(!CONTRACTS.find(function(x){return x.id===c.id;})) CONTRACTS.push(c); });
  var lsRepRecords = [];
  try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}
  lsRepRecords.forEach(function(r){ if(!REP_RECORDS.find(function(x){return x.id===r.id;})) REP_RECORDS.push(r); });

  var contract = CONTRACTS.find(function(c){ return c.id === CONTRACT_ID; });
  var el = document.getElementById('invest-detail-content');

  if(!contract){
    el.innerHTML = '<div style="text-align:center;padding:40px 0;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">合同未找到</p></div>';
    return;
  }

  var recs = REP_RECORDS.filter(function(r){ return r.contractId === contract.id; });
  recs.sort(function(a,b){ return a.date.localeCompare(b.date); });

  var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (contract.totalRepaid || 0);
  var progressPct = contract.recoveryCap > 0 ? (repaid / contract.recoveryCap * 100) : 0;
  var monthlyAvg = recs.length > 0 ? (repaid / recs.length) : 0;
  var remaining = monthlyAvg > 0 ? Math.ceil((contract.recoveryCap - repaid) / monthlyAvg) : 0;

  var initiator = MEMBERS.find(function(m){ return m.id === contract.initiatorId; });
  var initName = contract.initiatorName || (initiator ? initiator.name : '');
  var initComp = contract.initiatorCompany || (initiator ? initiator.company : '');

  var statusBadge = contract.status === 'active'
    ? '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>'
    : '<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';

  var isCompleted = contract.status === 'completed';
  var ringColor = isCompleted ? '#16A34A' : '#D4A853';
  var ringColorEnd = isCompleted ? '#15803D' : '#B8860B';
  var barGradient = isCompleted ? 'linear-gradient(180deg,#16A34A,#15803D)' : 'linear-gradient(180deg,#D4A853,#B8860B)';

  var html = '';

  // 0. Completed badge (top green banner)
  if(isCompleted){
    html += '<div style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;border-radius:12px;padding:12px 20px;text-align:center;font-size:15px;font-weight:600;margin-bottom:12px;">\\u2705 \\u9879\\u76EE\\u5DF2\\u5B8C\\u6210</div>';
  }

  // 0.5 Payback celebration banner (Task 2)
  if(repaid >= contract.amount){
    var roi = (repaid / contract.amount * 100).toFixed(1);
    var confettiColors = ['#B91C1C','#D4A853','#16A34A','#3B82F6','#B91C1C','#D4A853'];
    var confettiHTML = '';
    for(var ci=0;ci<6;ci++){
      confettiHTML += '<span class="confetti-piece" style="background:'+confettiColors[ci]+';animation:confetti-'+(ci+1)+' 1.2s ease-out '+(ci*0.05).toFixed(2)+'s forwards;"></span>';
    }
    html += '<div class="payback-banner" style="position:relative;overflow:visible;">';
    html += confettiHTML;
    html += '<div class="emoji-row">\\uD83C\\uDF89\\uD83C\\uDF8A\\uD83C\\uDF89</div>';
    html += '<div class="banner-title">恭喜，本项目已回本！</div>';
    html += '<div class="banner-sub">累计回款 ¥' + repaid.toFixed(2) + '万，投资回报率 ' + roi + '%</div>';
    html += '</div>';
  }

  // 1. Project info
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;margin-bottom:12px;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
  html += '<span style="font-size:18px;font-weight:600;color:#1C1917;">' + contract.projectName + '</span>';
  html += statusBadge;
  html += '</div>';
  html += '<div style="font-size:14px;color:#78716C;">发起人: ' + initName + ' \\u00B7 ' + initComp + '</div>';
  html += '</div>';

  // 2. Investment info
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">\\u00A5' + contract.amount + '\\u4E07</div><div style="font-size:12px;color:#78716C;margin-top:2px;">我的投资</div></div>';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">' + contract.revenueShareRatio + '%</div><div style="font-size:12px;color:#78716C;margin-top:2px;">分成比例</div></div>';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">\\u00A5' + contract.recoveryCap + '\\u4E07</div><div style="font-size:12px;color:#78716C;margin-top:2px;">回收上限</div></div>';
  html += '</div></div>';

  // 3. Recovery ring progress
  var circumference = 2 * Math.PI * 68; // 427.26
  var dashOffset = circumference * (1 - progressPct / 100);

  html += '<div style="background:#fff;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:32px;margin-bottom:12px;text-align:center;">';
  html += '<svg width="160" height="160" viewBox="0 0 160 160" style="margin:0 auto;display:block;">';
  html += '<defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+ringColor+'"/><stop offset="100%" stop-color="'+ringColorEnd+'"/></linearGradient></defs>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="#F5F5F4" stroke-width="12"/>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="url(#ring-grad)" stroke-width="12" stroke-dasharray="' + circumference.toFixed(2) + '" stroke-dashoffset="' + dashOffset.toFixed(2) + '" stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset 1s ease;"/>';
  html += '<text x="80" y="72" text-anchor="middle" fill="'+ringColor+'" font-size="32" font-weight="800" font-family="Montserrat,sans-serif">' + progressPct.toFixed(1) + '%</text>';
  html += '<text x="80" y="96" text-anchor="middle" fill="#78716C" font-size="12">回收进度</text>';
  html += '</svg>';
  html += '<div style="margin-top:16px;font-size:15px;color:#292524;">已回款 \\u00A5' + repaid.toFixed(2) + '\\u4E07 / \\u00A5' + contract.recoveryCap + '\\u4E07</div>';
  if(remaining > 0) html += '<div style="margin-top:4px;font-size:13px;color:#78716C;">预计还需约 ' + remaining + ' 个月</div>';
  html += '</div>';

  // 4. Bar chart (pure CSS)
  if(recs.length > 0){
    var maxShare = Math.max.apply(null, recs.map(function(r){ return r.shareAmount; }));

    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
    html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:16px;">回款趋势</div>';
    html += '<div style="display:flex;align-items:flex-end;gap:16px;height:200px;padding:20px 0 0;">';
    recs.forEach(function(r){
      var pctH = maxShare > 0 ? (r.shareAmount / maxShare * 100) : 0;
      var dateLabel = r.date.slice(5,7) + '月';
      html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
      html += '<div style="font-size:11px;color:#78716C;margin-bottom:4px;">\\u00A5' + r.shareAmount.toFixed(2) + '\\u4E07</div>';
      html += '<div style="width:40px;border-radius:4px 4px 0 0;background:'+barGradient+';height:' + Math.max(pctH, 5) + '%;transition:height 0.6s ease;"></div>';
      html += '<div style="font-size:12px;color:#78716C;margin-top:6px;">' + dateLabel + '</div>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  // 5. Repayment detail list
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
  html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">回款明细</div>';
  // Header
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;padding-bottom:8px;border-bottom:1px solid #F5F5F4;">';
  html += '<div style="font-size:12px;color:#78716C;">日期</div>';
  html += '<div style="font-size:12px;color:#78716C;">项目收入</div>';
  html += '<div style="font-size:12px;color:#78716C;">我的分成</div>';
  html += '<div style="font-size:12px;color:#78716C;">累计回款</div>';
  html += '</div>';
  // Rows (reverse order — latest first)
  var recsReversed = recs.slice().reverse();
  recsReversed.forEach(function(r){
    var dateStr = r.date.slice(5).replace('-','/');
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;padding:12px 0;border-bottom:1px solid #F5F5F4;">';
    html += '<div style="font-size:14px;color:#292524;">' + dateStr + '</div>';
    html += '<div style="font-size:14px;color:#292524;">\\u00A5' + r.projectRevenue + '\\u4E07</div>';
    html += '<div style="font-size:14px;color:#16A34A;font-weight:600;">+\\u00A5' + r.shareAmount.toFixed(2) + '\\u4E07</div>';
    html += '<div style="font-size:14px;color:#292524;">\\u00A5' + r.cumulativeShare.toFixed(2) + '\\u4E07</div>';
    html += '</div>';
  });
  html += '</div>';

  // 6. View contract button — now opens modal instead of navigating
  html += '<button id="view-contract-btn" style="width:100%;background:#fff;border:1px solid #E7E5E4;border-radius:14px;padding:14px;font-size:15px;color:#44403C;font-weight:500;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;transition:background 0.2s;" onmouseover="this.style.background=\\'#FAFAF9\\'" onmouseout="this.style.background=\\'#fff\\'">';
  html += '\\uD83D\\uDCC4 查看合同';
  html += '</button>';

  el.innerHTML = html;

  // ── Contract Modal Logic ──
  var modal = document.getElementById('contract-modal');
  var mask = document.getElementById('contract-modal-mask');
  var sheet = document.getElementById('contract-modal-sheet');
  var closeBtn = document.getElementById('contract-modal-close');
  var modalBody = document.getElementById('contract-modal-body');
  var modalFooter = document.getElementById('contract-modal-footer');

  function openContractModal() {
    // Fill contract content
    var contractHTML = CONTRACT_HTML_MAP[CONTRACT_ID] || '';
    modalBody.innerHTML = contractHTML || '<p style="text-align:center;color:#A8A29E;">合同内容不可用</p>';

    // Fill status footer
    var footerHTML = '';
    if (contract.status === 'active' || contract.status === 'signed' || contract.status === 'completed') {
      footerHTML = '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:#F0FDF4;color:#16A34A;font-size:13px;font-weight:600;">\\u2705 已签署 · ' + (contract.signedAt || '') + '</div>';
    } else if (contract.status === 'terminated') {
      footerHTML = '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:#FEF2F2;color:#DC2626;font-size:13px;font-weight:600;">\\u26A0\\uFE0F 已终止</div>';
    }
    modalFooter.innerHTML = footerHTML;

    // Show modal with animation
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function(){
      mask.style.opacity = '1';
      sheet.style.transform = 'translateY(0)';
    });
  }

  function closeContractModal() {
    mask.style.opacity = '0';
    sheet.style.transform = 'translateY(100%)';
    document.body.style.overflow = '';
    setTimeout(function(){ modal.style.display = 'none'; }, 350);
  }

  document.getElementById('view-contract-btn').addEventListener('click', openContractModal);
  closeBtn.addEventListener('click', closeContractModal);
  mask.addEventListener('click', closeContractModal);
})();
`}} />
    </div>,
    { title: '中流通 - 投资详情' }
  )
})
}
