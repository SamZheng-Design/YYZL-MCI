// Route: /repayments
import { Hono } from 'hono'
import {
  mockMembers, mockProjects, mockContracts, mockRevenueReports, mockRepaymentRecords,
  generateContractHTML,
} from '../data'
import type { Member, Project, Contract, RevenueReport, RepaymentRecord } from '../data'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript, statusLabel,
} from '../components'

export function registerRepaymentsRoute(app: Hono) {
app.get('/repayments', (c) => {
  // Pre-generate contract HTML map for all known contracts (server-side)
  const contractHTMLMap: Record<string, string> = {}
  for (const ct of mockContracts) {
    const proj = mockProjects.find(p => p.id === ct.projectId)
    if (!proj) continue
    const initiator = mockMembers.find(m => m.id === ct.initiatorId) || null
    const participant = mockMembers.find(m => m.id === ct.participantId) || null
    contractHTMLMap[ct.id] = generateContractHTML(ct, proj, participant, initiator)
  }

  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto dk-repayments-main">
        {/* Title */}
        <section class="px-4 pt-4 pb-0">
          <h1 class="font-bold text-text-title" style="font-size:22px;font-weight:700;color:#1C1917;font-family:'Noto Sans SC',sans-serif;">回款中心</h1>
        </section>

        {/* Tab switcher */}
        <div id="repayment-tabs" class="rep-tab-bar" style="background:#fff;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;margin-top:12px;">
          <button id="tab-invest" class="rep-tab rep-tab-active" style="flex:1;padding:12px 0;font-size:15px;font-weight:600;background:none;border:none;cursor:pointer;position:relative;color:#B91C1C;">
            我的投资
            <span class="rep-tab-line" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;" />
          </button>
          <button id="tab-initiate" class="rep-tab" style="flex:1;padding:12px 0;font-size:15px;font-weight:600;background:none;border:none;cursor:pointer;position:relative;color:#78716C;">
            我的发起
          </button>
        </div>

        {/* 我的投资 Content */}
        <div id="panel-invest" class="px-4 pt-4 pb-4 dk-repayments-content" />

        {/* 我的发起 Content */}
        <div id="panel-initiate" class="px-4 pt-4 pb-4 dk-repayments-content" style="display:none;" />
      </main>

      {/* Contract Full-text Modal for repayments page */}
      <div id="rep-contract-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;">
        <div id="rep-contract-modal-mask" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);opacity:0;transition:opacity 0.3s ease;" />
        <div id="rep-contract-modal-sheet" style="position:absolute;bottom:0;left:0;right:0;max-height:92vh;background:#fff;border-radius:24px 24px 0 0;overflow-y:auto;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1);">
          <div style="position:sticky;top:0;background:#fff;z-index:1;padding:20px 20px 12px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:17px;font-weight:600;color:#1C1917;">合同详情</span>
            <button id="rep-contract-modal-close" style="width:32px;height:32px;border-radius:50%;background:#F5F5F4;border:none;cursor:pointer;font-size:16px;color:#78716C;display:flex;align-items:center;justify-content:center;">×</button>
          </div>
          <div id="rep-contract-modal-body" style="padding:20px;" />
          <div id="rep-contract-modal-footer" style="padding:12px 20px 32px;text-align:center;" />
        </div>
      </div>

      <TabBar active="repayments" />

      {/* Client-side logic */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACTS = ${JSON.stringify(mockContracts)};
  var PROJECTS = ${JSON.stringify(mockProjects.map(p => ({ ...p })))};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company })))};
  var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
  var REV_REPORTS = ${JSON.stringify(mockRevenueReports)};
  var CONTRACT_HTML_MAP = ${JSON.stringify(contractHTMLMap)};

  // Also merge localStorage contracts
  var lsContracts = [];
  try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  // Also merge localStorage projects
  var lsProjects = [];
  try { lsProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  // Also merge localStorage revenue reports & repayment records
  var lsReports = [];
  try { lsReports = JSON.parse(localStorage.getItem('zlc_revenue_reports') || '[]'); } catch(e){}
  var lsRepRecords = [];
  try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}

  // Merge all data
  lsContracts.forEach(function(c){ if(!CONTRACTS.find(function(x){return x.id===c.id;})) CONTRACTS.push(c); });
  lsProjects.forEach(function(p){ if(!PROJECTS.find(function(x){return x.id===p.id;})) PROJECTS.push(p); });
  lsReports.forEach(function(r){ if(!REV_REPORTS.find(function(x){return x.id===r.id;})) REV_REPORTS.push(r); });
  lsRepRecords.forEach(function(r){ if(!REP_RECORDS.find(function(x){return x.id===r.id;})) REP_RECORDS.push(r); });

  // Tabs
  var tabInvest = document.getElementById('tab-invest');
  var tabInitiate = document.getElementById('tab-initiate');
  var panelInvest = document.getElementById('panel-invest');
  var panelInitiate = document.getElementById('panel-initiate');

  function setTab(which){
    if(which === 'invest'){
      tabInvest.style.color = '#B91C1C';
      tabInvest.innerHTML = '我的投资<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;"></span>';
      tabInitiate.style.color = '#78716C';
      tabInitiate.innerHTML = '我的发起';
      panelInvest.style.display = 'block';
      panelInitiate.style.display = 'none';
    } else {
      tabInitiate.style.color = '#B91C1C';
      tabInitiate.innerHTML = '我的发起<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;"></span>';
      tabInvest.style.color = '#78716C';
      tabInvest.innerHTML = '我的投资';
      panelInvest.style.display = 'none';
      panelInitiate.style.display = 'block';
    }
  }
  tabInvest.addEventListener('click', function(){ setTab('invest'); });
  tabInitiate.addEventListener('click', function(){ setTab('initiate'); });

  // ── 我的投资 ──
  var myContracts = CONTRACTS.filter(function(c){ return c.participantId === u.id && (c.status === 'active' || c.status === 'completed'); });

  // Summary
  var totalInvested = 0, totalRepaid = 0, activeCount = 0, completedCount = 0;
  myContracts.forEach(function(c){
    totalInvested += c.amount;
    // Calculate repaid from records
    var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
    var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (c.totalRepaid || 0);
    totalRepaid += repaid;
    if(c.status === 'active') activeCount++;
    if(c.status === 'completed') completedCount++;
  });
  var recoveryPct = totalInvested > 0 ? (totalRepaid / totalInvested * 100).toFixed(1) : '0.0';

  var investHTML = '';

  if(myContracts.length === 0){
    // Empty state
    investHTML += '<div style="text-align:center;padding:48px 0;">';
    investHTML += '<div style="width:64px;height:64px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><i class="fas fa-wallet" style="font-size:28px;color:#B91C1C;"></i></div>';
    investHTML += '<p style="font-size:16px;font-weight:600;color:#292524;margin-bottom:4px;">还没有参与任何项目</p>';
    investHTML += '<p style="font-size:14px;color:#78716C;margin-bottom:20px;">去项目大厅发现优质项目吧</p>';
    investHTML += '<a href="/projects" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">去项目大厅看看 <i class="fas fa-arrow-right" style="font-size:12px;"></i></a>';
    investHTML += '</div>';
  } else {
    // Summary card
    investHTML += '<div style="background:linear-gradient(135deg,#B91C1C,#7F1D1D);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px;">';
    investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">\\u00A5' + totalInvested + '\\u4E07</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">总投资</div></div>';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">\\u00A5' + totalRepaid.toFixed(1) + '\\u4E07</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">总回款</div></div>';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">' + recoveryPct + '%</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">综合回收</div></div>';
    investHTML += '</div>';
    investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    investHTML += '<div><span style="font-size:14px;opacity:0.8;">在投项目</span> <span style="font-size:16px;font-weight:700;">' + activeCount + '个</span></div>';
    investHTML += '<div><span style="font-size:14px;opacity:0.8;">已完成</span> <span style="font-size:16px;font-weight:700;">' + completedCount + '个</span></div>';
    investHTML += '</div></div>';

    // Project cards
    investHTML += '<div style="display:flex;flex-direction:column;gap:12px;">';
    myContracts.forEach(function(c){
      var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
      var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (c.totalRepaid || 0);
      var lastRec = recs.length > 0 ? recs[recs.length-1] : null;
      var monthlyAvg = recs.length > 0 ? (repaid / recs.length) : 0;
      var progressPct = c.recoveryCap > 0 ? (repaid / c.recoveryCap * 100).toFixed(1) : '0.0';
      var statusBadge = c.status === 'active' ? '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>' : '<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';
      var initiator = MEMBERS.find(function(m){ return m.id === c.initiatorId; });
      var initName = c.initiatorName || (initiator ? initiator.name : '');
      var initComp = c.initiatorCompany || (initiator ? initiator.company : '');
      var isCompletedContract = c.status === 'completed';
      var barBg = isCompletedContract ? 'linear-gradient(90deg,#16A34A,#15803D)' : 'linear-gradient(90deg,#D4A853,#B8860B)';
      var barColor = isCompletedContract ? '#16A34A' : '#D4A853';

      investHTML += '<a href="/investments/' + c.id + '" style="display:block;text-decoration:none;color:inherit;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform=\\'translateY(-2px)\\';this.style.boxShadow=\\'0 4px 16px rgba(0,0,0,0.08)\\';" onmouseout="this.style.transform=\\'none\\';this.style.boxShadow=\\'0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03)\\';">';
      investHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
      investHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + c.projectName + '</span>';
      investHTML += statusBadge;
      investHTML += '</div>';
      investHTML += '<div style="font-size:13px;color:#78716C;margin-bottom:10px;">' + initName + ' \\u00B7 ' + initComp + '</div>';
      investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + c.amount + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">我的投资</div></div>';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + repaid.toFixed(2) + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">已回款</div></div>';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + monthlyAvg.toFixed(2) + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">月回</div></div>';
      investHTML += '</div>';
      // Progress bar
      investHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      investHTML += '<div style="flex:1;height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;"><div style="height:100%;border-radius:3px;background:'+barBg+';width:' + Math.min(parseFloat(progressPct), 100) + '%;transition:width 0.6s;"></div></div>';
      investHTML += '<span style="font-size:12px;color:'+barColor+';font-weight:600;">' + progressPct + '%</span>';
      investHTML += '</div>';
      // Last repayment
      if(lastRec){
        var dateStr = lastRec.date.slice(5).replace('-','/');
        investHTML += '<div style="font-size:12px;color:#16A34A;">最近回款: ' + dateStr + ' +\\u00A5' + lastRec.shareAmount.toFixed(2) + '\\u4E07</div>';
      }
      // View contract button (inline)
      investHTML += '<div style="display:flex;justify-content:flex-end;margin-top:8px;">';
      investHTML += '<span class="rep-view-contract-btn" data-cid="' + c.id + '" data-status="' + c.status + '" data-signed="' + (c.signedAt || '') + '" style="font-size:12px;color:#B91C1C;cursor:pointer;font-weight:500;display:inline-flex;align-items:center;gap:4px;" onclick="event.preventDefault();event.stopPropagation();window.__openRepContractModal(this.dataset.cid,this.dataset.status,this.dataset.signed);">\\uD83D\\uDCC4 查看合同</span>';
      investHTML += '</div>';
      investHTML += '</a>';
    });
    investHTML += '</div>';
  }
  panelInvest.innerHTML = investHTML;

  // ── 我的发起 ──
  var myProjects = PROJECTS.filter(function(p){ return p.ownerId === u.id; });

  // Load share logs for share count
  var shareLogs = [];
  try { shareLogs = JSON.parse(localStorage.getItem('zlc_share_logs') || '[]'); } catch(e){}

  var initiateHTML = '';

  if(myProjects.length === 0){
    initiateHTML += '<div style="text-align:center;padding:48px 0;">';
    initiateHTML += '<div style="width:64px;height:64px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><i class="fas fa-rocket" style="font-size:28px;color:#B91C1C;"></i></div>';
    initiateHTML += '<p style="font-size:16px;font-weight:600;color:#292524;margin-bottom:4px;">还没有发起过项目</p>';
    initiateHTML += '<p style="font-size:14px;color:#78716C;margin-bottom:20px;">发起你的第一个项目吧</p>';
    initiateHTML += '<a href="/create" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">发起第一个项目 <i class="fas fa-plus" style="font-size:12px;"></i></a>';
    initiateHTML += '</div>';
  } else {
    initiateHTML += '<div style="display:flex;flex-direction:column;gap:12px;">';
    myProjects.forEach(function(p){
      var statusMap = {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',draft:'草稿'};
      var statusLabel = statusMap[p.status] || p.status;
      var badgeStyle = '';
      if(p.status==='open') badgeStyle = 'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;';
      else if(p.status==='active') badgeStyle = 'background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;';
      else if(p.status==='completed') badgeStyle = 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;';
      else if(p.status==='draft') badgeStyle = 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;';
      else badgeStyle = 'background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;';

      // Count participants from contracts (signed)
      var projContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id && c.status === 'active'; });
      var participantCount = projContracts.length || p.investors.length;

      // Get viewCount from localStorage or mock data (Task 3)
      var viewCounts = {};
      try { viewCounts = JSON.parse(localStorage.getItem('zlc_view_counts') || '{}'); } catch(e){}
      var viewCount = viewCounts[p.id] !== undefined ? viewCounts[p.id] : (p.viewCount || 0);

      initiateHTML += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;position:relative;">';
      // Share icon button (Task 2) — top right
      if(p.status !== 'draft'){
        initiateHTML += '<a href="/projects/' + p.id + '?share=true" style="position:absolute;top:16px;right:16px;color:#78716C;text-decoration:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;transition:color 0.2s,background 0.2s;" onmouseover="this.style.color=\\'#B91C1C\\';this.style.background=\\'#FEE2E2\\';" onmouseout="this.style.color=\\'#78716C\\';this.style.background=\\'transparent\\';"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></a>';
      }
      initiateHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;padding-right:' + (p.status !== 'draft' ? '32px' : '0') + ';">';
      initiateHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + p.name + '</span>';
      initiateHTML += '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;' + badgeStyle + '">' + statusLabel + '</span>';
      initiateHTML += '</div>';
      // View/Participant/Share count
      var shareCount = shareLogs.filter(function(sl){ return sl.projectId === p.id; }).length;
      var statsText = viewCount + '人浏览 · ' + participantCount + '人参与';
      if(shareCount > 0) statsText += ' · ' + shareCount + '次分享';
      initiateHTML += '<div style="font-size:12px;color:#A8A29E;margin-top:4px;margin-bottom:8px;">' + statsText + '</div>';
      initiateHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      initiateHTML += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + p.industry + '</span>';
      initiateHTML += '</div>';

      // Row 3: depends on status
      if(p.status === 'open'){
        var pct = p.targetAmount > 0 ? Math.round(p.raisedAmount / p.targetAmount * 100) : 0;
        initiateHTML += '<div style="margin-bottom:10px;">';
        initiateHTML += '<div style="height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;margin-bottom:4px;"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#D4A853,#B8860B);width:' + pct + '%;"></div></div>';
        initiateHTML += '<div style="font-size:13px;color:#78716C;">已募 \\u00A5' + p.raisedAmount + '/' + p.targetAmount + '\\u4E07 (' + pct + '%)</div>';
        initiateHTML += '</div>';
      } else if(p.status === 'active'){
        var projReports = REV_REPORTS.filter(function(r){ return r.projectId === p.id; });
        var totalRepaidProj = projReports.reduce(function(s,r){ return s + r.totalShareAmount; }, 0);
        var lastReport = projReports.length > 0 ? projReports[projReports.length-1] : null;
        initiateHTML += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px;font-size:13px;color:#78716C;">';
        initiateHTML += '<span>累计回款 <b style="color:#1C1917;">\\u00A5' + totalRepaidProj.toFixed(1) + '\\u4E07</b></span>';
        if(lastReport) initiateHTML += '<span>最近上报 <b style="color:#1C1917;">' + lastReport.period + '</b></span>';
        initiateHTML += '</div>';
      }

      // Row 4: action buttons
      initiateHTML += '<div style="display:flex;gap:8px;">';
      if(p.status === 'open'){
        initiateHTML += '<a href="/projects/' + p.id + '" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#78716C;font-size:13px;font-weight:600;text-decoration:none;">管理项目</a>';
      } else if(p.status === 'active'){
        initiateHTML += '<a href="/initiated/' + p.id + '/report" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#B91C1C;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">上报收入</a>';
        initiateHTML += '<a href="/projects/' + p.id + '" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#78716C;font-size:13px;font-weight:600;text-decoration:none;">查看详情</a>';
      } else if(p.status === 'draft'){
        initiateHTML += '<a href="/create" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#B91C1C;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">继续编辑</a>';
        initiateHTML += '<button onclick="deleteDraft(\\'' + p.id + '\\')" style="flex:1;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#DC2626;font-size:13px;font-weight:600;border:none;cursor:pointer;">删除</button>';
      }
      initiateHTML += '</div>';
      initiateHTML += '</div>';
    });
    initiateHTML += '</div>';
  }
  panelInitiate.innerHTML = initiateHTML;

  // Delete draft
  window.deleteDraft = function(pid){
    var ups = [];
    try { ups = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
    ups = ups.filter(function(p){ return p.id !== pid; });
    localStorage.setItem('zlc_user_projects', JSON.stringify(ups));
    window.location.reload();
  };

  // ── Coach Mark for Repayments Page ──
  setTimeout(function(){
    showCoachMark('#repayment-tabs', '左边看你投出去的钱的回款，右边管理你自己发起的项目', 'bottom', 'repay-tabs');
  }, 800);

  // ── Contract Modal Logic (repayments page) ──
  var repModal = document.getElementById('rep-contract-modal');
  var repMask = document.getElementById('rep-contract-modal-mask');
  var repSheet = document.getElementById('rep-contract-modal-sheet');
  var repCloseBtn = document.getElementById('rep-contract-modal-close');
  var repModalBody = document.getElementById('rep-contract-modal-body');
  var repModalFooter = document.getElementById('rep-contract-modal-footer');

  window.__openRepContractModal = function(contractId, status, signedAt) {
    var contractHTML = CONTRACT_HTML_MAP[contractId] || '';
    repModalBody.innerHTML = contractHTML || '<p style="text-align:center;color:#A8A29E;">合同内容不可用</p>';

    var footerHTML = '';
    if (status === 'active' || status === 'signed' || status === 'completed') {
      footerHTML = '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:#F0FDF4;color:#16A34A;font-size:13px;font-weight:600;">\\u2705 已签署 · ' + (signedAt || '') + '</div>';
    } else if (status === 'terminated') {
      footerHTML = '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:#FEF2F2;color:#DC2626;font-size:13px;font-weight:600;">\\u26A0\\uFE0F 已终止</div>';
    }
    repModalFooter.innerHTML = footerHTML;

    repModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function(){
      repMask.style.opacity = '1';
      repSheet.style.transform = 'translateY(0)';
    });
  };

  function closeRepContractModal() {
    repMask.style.opacity = '0';
    repSheet.style.transform = 'translateY(100%)';
    document.body.style.overflow = '';
    setTimeout(function(){ repModal.style.display = 'none'; }, 350);
  }
  repCloseBtn.addEventListener('click', closeRepContractModal);
  repMask.addEventListener('click', closeRepContractModal);
})();
`}} />
    </div>,
    { title: '中流通 - 回款中心' }
  )
})
}
