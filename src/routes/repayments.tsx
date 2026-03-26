// Route: /repayments — Phase 1C: API-driven skeleton (zero DB calls)
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript, statusLabel,
} from '../components'

export function registerRepaymentsRoute(app: Hono<HonoEnv>) {
app.get('/repayments', async (c) => {
  // ═══ NO DB calls — pure HTML skeleton ═══
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

        {/* Skeleton: 我的投资 */}
        <div id="panel-invest" class="px-4 pt-4 pb-4 dk-repayments-content">
          {/* Summary skeleton */}
          <div class="animate-pulse" style="background:linear-gradient(135deg,#E7E5E4,#D6D3D1);border-radius:20px;padding:24px;margin-bottom:16px;">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
              <div><div style="height:28px;background:rgba(255,255,255,0.3);border-radius:8px;width:80%;margin-bottom:6px;" /><div style="height:12px;background:rgba(255,255,255,0.2);border-radius:4px;width:50%;" /></div>
              <div><div style="height:28px;background:rgba(255,255,255,0.3);border-radius:8px;width:80%;margin-bottom:6px;" /><div style="height:12px;background:rgba(255,255,255,0.2);border-radius:4px;width:50%;" /></div>
              <div><div style="height:28px;background:rgba(255,255,255,0.3);border-radius:8px;width:60%;margin-bottom:6px;" /><div style="height:12px;background:rgba(255,255,255,0.2);border-radius:4px;width:50%;" /></div>
            </div>
          </div>
          {/* Card skeletons */}
          {[1,2,3].map(i => (
            <div class="animate-pulse" style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);padding:16px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <div style="height:16px;background:#F5F5F4;border-radius:4px;width:40%;" />
                <div style="height:16px;background:#F0FDF4;border-radius:4px;width:15%;" />
              </div>
              <div style="height:13px;background:#F5F5F4;border-radius:4px;width:55%;margin-bottom:10px;" />
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
                <div><div style="height:16px;background:#F5F5F4;border-radius:4px;width:70%;margin-bottom:4px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;" /></div>
                <div><div style="height:16px;background:#F5F5F4;border-radius:4px;width:70%;margin-bottom:4px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;" /></div>
                <div><div style="height:16px;background:#F5F5F4;border-radius:4px;width:70%;margin-bottom:4px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;" /></div>
              </div>
              <div style="height:6px;background:#F5F5F4;border-radius:3px;" />
            </div>
          ))}
        </div>

        {/* 我的发起 Content (hidden) */}
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

      {/* Client-side logic — fetches data from API */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // Fetch all needed data in parallel from APIs
  Promise.all([
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();}),
    fetch('/api/data/repayment-records').then(function(r){return r.json();}),
    fetch('/api/data/revenue-reports').then(function(r){return r.json();}),
    fetch('/api/data/share-logs').then(function(r){return r.json();})
  ]).then(function(results){
    var CONTRACTS = results[0].ok ? results[0].data : [];
    var PROJECTS = results[1].ok ? results[1].data : [];
    var MEMBERS = (results[2].ok ? results[2].data : []).map(function(m){ return {id:m.id, name:m.name, company:m.company}; });
    var REP_RECORDS = results[3].ok ? results[3].data : [];
    var REV_REPORTS = results[4].ok ? results[4].data : [];
    var shareLogs = results[5].ok ? results[5].data : [];

    renderPage(CONTRACTS, PROJECTS, MEMBERS, REP_RECORDS, REV_REPORTS, shareLogs);
  }).catch(function(err){
    console.error('Failed to load repayment data:', err);
    document.getElementById('panel-invest').innerHTML = '<div style="text-align:center;padding:48px 0;"><p style="font-size:14px;color:#DC2626;">加载失败，请刷新重试</p></div>';
  });

  function renderPage(CONTRACTS, PROJECTS, MEMBERS, REP_RECORDS, REV_REPORTS, shareLogs){
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

  var totalInvested = 0, totalRepaid = 0, activeCount = 0, completedCount = 0;
  myContracts.forEach(function(c){
    totalInvested += c.amount;
    var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
    var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (c.totalRepaid || 0);
    totalRepaid += repaid;
    if(c.status === 'active') activeCount++;
    if(c.status === 'completed') completedCount++;
  });
  var recoveryPct = totalInvested > 0 ? (totalRepaid / totalInvested * 100).toFixed(1) : '0.0';

  var investHTML = '';
  if(myContracts.length === 0){
    investHTML += '<div style="text-align:center;padding:48px 0;">';
    investHTML += '<div style="width:64px;height:64px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><i class="fas fa-wallet" style="font-size:28px;color:#B91C1C;"></i></div>';
    investHTML += '<p style="font-size:16px;font-weight:600;color:#292524;margin-bottom:4px;">还没有参与任何项目</p>';
    investHTML += '<p style="font-size:14px;color:#78716C;margin-bottom:20px;">去项目大厅发现优质项目吧</p>';
    investHTML += '<a href="/projects" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">去项目大厅看看 <i class="fas fa-arrow-right" style="font-size:12px;"></i></a>';
    investHTML += '</div>';
  } else {
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
      investHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      investHTML += '<div style="flex:1;height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;"><div style="height:100%;border-radius:3px;background:'+barBg+';width:' + Math.min(parseFloat(progressPct), 100) + '%;transition:width 0.6s;"></div></div>';
      investHTML += '<span style="font-size:12px;color:'+barColor+';font-weight:600;">' + progressPct + '%</span>';
      investHTML += '</div>';
      if(lastRec){
        var dateStr = lastRec.date.slice(5).replace('-','/');
        investHTML += '<div style="font-size:12px;color:#16A34A;">最近回款: ' + dateStr + ' +\\u00A5' + lastRec.shareAmount.toFixed(2) + '\\u4E07</div>';
      }
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

      var projContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id && c.status === 'active'; });
      var participantCount = projContracts.length || (p.investors ? p.investors.length : 0);
      var viewCount = p.viewCount || 0;

      initiateHTML += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;position:relative;">';
      if(p.status !== 'draft'){
        initiateHTML += '<a href="/projects/' + p.id + '?share=true" style="position:absolute;top:16px;right:16px;color:#78716C;text-decoration:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;transition:color 0.2s,background 0.2s;" onmouseover="this.style.color=\\'#B91C1C\\';this.style.background=\\'#FEE2E2\\';" onmouseout="this.style.color=\\'#78716C\\';this.style.background=\\'transparent\\';"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></a>';
      }
      initiateHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;padding-right:' + (p.status !== 'draft' ? '32px' : '0') + ';">';
      initiateHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + p.name + '</span>';
      initiateHTML += '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;' + badgeStyle + '">' + statusLabel + '</span>';
      initiateHTML += '</div>';
      var shareCount = shareLogs.filter(function(sl){ return sl.projectId === p.id; }).length;
      var statsText = viewCount + '人浏览 · ' + participantCount + '人参与';
      if(shareCount > 0) statsText += ' · ' + shareCount + '次分享';
      initiateHTML += '<div style="font-size:12px;color:#A8A29E;margin-top:4px;margin-bottom:8px;">' + statsText + '</div>';
      initiateHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      initiateHTML += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + (p.industry||'') + '</span>';
      initiateHTML += '</div>';

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

  // ── Inline Hint for repayment tabs ──
  setTimeout(function(){
    var userId = '';
    try { userId = JSON.parse(localStorage.getItem('zlc_user')).id; } catch(e){}
    var hintKey = userId ? 'zlc_repay_hint_' + userId : 'zlc_repay_hint';
    if(localStorage.getItem(hintKey)) return;
    var tabs = document.getElementById('repayment-tabs');
    if(!tabs) return;
    var hint = document.createElement('div');
    hint.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:10px 14px;margin:0 16px 12px;display:flex;align-items:flex-start;gap:8px;animation:coachFadeIn 0.4s ease forwards;';
    hint.innerHTML = '<span style="flex-shrink:0;">\\uD83D\\uDCA1</span>'
      + '<div style="flex:1;font-size:12px;color:#92400E;line-height:1.5;">左边查看你投出去的钱的回款情况，右边管理你自己发起的项目。'
      + '<button id="repay-hint-dismiss" style="color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-left:4px;padding:0;font-size:12px;">知道了</button></div>';
    tabs.parentNode.insertBefore(hint, tabs.nextSibling);
    document.getElementById('repay-hint-dismiss').addEventListener('click', function(){
      localStorage.setItem(hintKey, 'true');
      hint.style.opacity = '0'; hint.style.transition = 'opacity 0.3s';
      setTimeout(function(){ hint.remove(); }, 300);
    });
  }, 800);

  // ── Contract Modal Logic — loads HTML on demand via API ──
  var repModal = document.getElementById('rep-contract-modal');
  var repMask = document.getElementById('rep-contract-modal-mask');
  var repSheet = document.getElementById('rep-contract-modal-sheet');
  var repCloseBtn = document.getElementById('rep-contract-modal-close');
  var repModalBody = document.getElementById('rep-contract-modal-body');
  var repModalFooter = document.getElementById('rep-contract-modal-footer');

  window.__openRepContractModal = function(contractId, status, signedAt) {
    repModalBody.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:24px;height:24px;margin:0 auto;"></div><p style="font-size:13px;color:#A8A29E;margin-top:12px;">加载合同...</p></div>';

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

    // Fetch contract HTML on demand
    fetch('/api/data/contracts/' + contractId + '/html').then(function(r){return r.json();}).then(function(res){
      repModalBody.innerHTML = (res.ok && res.data) ? res.data : '<p style="text-align:center;color:#A8A29E;">合同内容不可用</p>';
    }).catch(function(){
      repModalBody.innerHTML = '<p style="text-align:center;color:#DC2626;">加载失败</p>';
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
  } // end renderPage
})();
`}} />
    </div>,
    { title: '中流通 - 回款中心' }
  )
})
}
