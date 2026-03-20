// Route: /
import { Hono } from 'hono'
import {
  mockMembers, mockProjects, mockRepayments, mockContracts, mockRepaymentRecords, mockTeachers,
} from '../data'
import type { Member, Teacher, Project, Contract, RepaymentRecord } from '../data'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript,
} from '../components'

export function registerHomeRoute(app: Hono) {
app.get('/', (c) => {
  // Pre-compute data for SSR (will be hydrated client-side with user-specific data)
  const openProjects = mockProjects.filter(p => p.status === 'open').slice(0, 3)
  const recentRepayments = mockRepayments.slice(0, 5)

  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      {/* Role-based redirect: admin → /admin, teacher → /teacher */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
    if(cu && cu.role === 'admin'){ window.location.replace('/admin'); return; }
    if(cu && cu.role === 'teacher'){ window.location.replace('/teacher'); return; }
  } catch(e){}
})();
`}} />
      <GlobalScripts />
      <Navbar />

      {/* Content */}
      <main class="px-4 pt-4 pb-4 max-w-lg mx-auto page-enter dk-home-main">

        {/* 1. Welcome — spans full width on desktop */}
        <section class="mb-5 dk-home-welcome">
          <h2 id="greeting" class="font-bold text-text-title dk-home-greeting" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;" />
          <p id="user-subtitle" class="text-text-secondary mt-0.5" style="font-size:14px;" />
          {/* 1.5 Share Code Input — inline on desktop welcome bar */}
          <div id="share-code-input" class="dk-home-share-input" style="margin:8px 0 0 0;">
            <div style="background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04);display:flex;align-items:center;gap:10px;">
              <i class="fas fa-link" style="font-size:14px;color:#B91C1C;flex-shrink:0;" />
              <input id="home-share-input" type="text" maxlength={6} placeholder="收到分享码？输入6位码查看项目" style="flex:1;background:transparent;border:none;outline:none;font-size:14px;color:#1C1917;font-family:inherit;" />
              <button id="home-share-btn" style="flex-shrink:0;padding:6px 12px;background:rgba(185,28,28,0.08);border:none;border-radius:8px;color:#B91C1C;font-size:13px;font-weight:600;cursor:pointer;">查看</button>
            </div>
          </div>
        </section>

        {/* Left column content on desktop */}
        <div class="dk-home-left">
          {/* 1.8 Repayment Flash Bar (rendered by client JS) */}
          <div id="repayment-flash-bar" />

          {/* 1.9 Personal Investment Overview Card */}
          <div id="invest-overview-card" />

          {/* 2. Quick Actions */}
          <section id="quick-actions" class="grid grid-cols-2 gap-3 mb-5">
            <a href="/create" class="quick-card quick-card-brand dk-clickable-card">
              <i class="fas fa-rocket" style="font-size:22px;" />
              <span class="font-semibold" style="font-size:15px;">发起项目</span>
            </a>
            <a href="/projects" class="quick-card quick-card-gold dk-clickable-card">
              <i class="fas fa-store" style="font-size:22px;" />
              <span class="font-semibold" style="font-size:15px;">项目大厅</span>
            </a>
          </section>

          {/* 3. My Stats */}
          <section class="grid grid-cols-2 gap-3 mb-6 dk-home-stats">
            {[
              { id: 'stat-initiated', label: '已发起', suffix: '' },
              { id: 'stat-invested', label: '已参与', suffix: '' },
              { id: 'stat-total-inv', label: '总投资(万)', suffix: '' },
              { id: 'stat-total-rep', label: '总回款(万)', suffix: '' },
            ].map(s => (
              <div class="bg-white rounded-xl shadow-card p-4">
                <div id={s.id} class="font-extrabold text-text-title" style="font-size:24px;">—</div>
                <div class="text-text-tertiary mt-1" style="font-size:12px;">{s.label}</div>
              </div>
            ))}
          </section>

          {/* 4. Latest Projects */}
          <section class="mb-6 dk-home-projects">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-text-title" style="font-size:16px;">我参与的项目</h3>
              <a href="/projects" class="text-brand font-medium" style="font-size:13px;text-decoration:none;">
                查看全部 <i class="fas fa-arrow-right" style="font-size:11px;" />
              </a>
            </div>
            <div class="flex flex-col gap-3 dk-home-project-grid">
              {openProjects.map(proj => {
                const owner = mockMembers.find(m => m.id === proj.ownerId)
                const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)
                return (
                  <a href={`/projects/${proj.id}`} class="bg-white rounded-2xl shadow-card p-4 block dk-clickable-card" style="text-decoration:none;color:inherit;">
                    {/* Row 1: Owner */}
                    <div class="flex items-center gap-2.5 mb-2">
                      <div class="flex items-center justify-center rounded-full bg-brand text-white font-bold" style="width:32px;height:32px;font-size:13px;">
                        {owner?.name.charAt(0)}
                      </div>
                      <div>
                        <span class="text-text-primary font-medium" style="font-size:14px;">{owner?.name}</span>
                        <span class="text-text-tertiary ml-1.5" style="font-size:12px;">{owner?.company}</span>
                      </div>
                    </div>
                    {/* Row 2: Name */}
                    <div class="font-semibold text-text-title mb-2" style="font-size:15px;">{proj.name}</div>
                    {/* Row 3: Tags */}
                    <div class="flex items-center gap-2 flex-wrap mb-3">
                      <span class="bg-brand-soft text-brand px-2.5 py-0.5 rounded-full font-medium" style="font-size:11px;">{proj.industry}</span>
                      <span class="text-text-secondary" style="font-size:12px;">融资 {proj.targetAmount}万</span>
                      <span class="text-text-secondary" style="font-size:12px;">分成 {proj.revenueShareRate}%</span>
                    </div>
                    {/* Row 4: Progress */}
                    <div class="flex items-center gap-3">
                      <div class="progress-bar flex-1">
                        <div class="progress-fill" data-width={`${pct}%`} />
                      </div>
                      <span class="font-semibold text-gold-dark" style="font-size:13px;">{pct}%</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right column content on desktop (sticky sidebar) */}
        <div class="dk-home-right">
          {/* 5. Recent Repayments */}
          <section class="mb-4">
            <h3 class="font-bold text-text-title mb-3" style="font-size:16px;">回款动态</h3>
            <div class="bg-white rounded-2xl shadow-card overflow-hidden">
              {recentRepayments.map((r, i) => (
                <div class={`flex items-center justify-between px-4 py-3 ${i < recentRepayments.length - 1 ? 'border-b border-surface-divider' : ''}`}>
                  <div class="flex items-center gap-3">
                    <span class="text-text-tertiary" style="font-size:12px;min-width:62px;">{r.date.slice(5)}</span>
                    <span class="text-text-primary font-medium" style="font-size:13px;">{r.projectName.length > 12 ? r.projectName.slice(0, 12) + '...' : r.projectName}</span>
                  </div>
                  <span class="font-semibold" style="font-size:14px;color:#16a34a;">+¥{r.amount.toFixed(2)}万</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <TabBar active="home" />

      {/* Client script — hydrate user-specific data */}
      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // Greeting
  var h = new Date().getHours();
  var tg = h >= 6 && h < 12 ? '上午好' : h >= 12 && h < 18 ? '下午好' : '晚上好';
  var greetEl = document.getElementById('greeting');
  if (greetEl) greetEl.textContent = '\\uD83D\\uDC4B ' + u.name + ' 同学，' + tg;
  var subEl = document.getElementById('user-subtitle');
  if (subEl) subEl.textContent = u.company + ' · ' + u.title + ' · ' + (u.cohort || '');

  // Fetch stats
  fetch('/api/user-stats/' + u.id).then(function(r){return r.json();}).then(function(d){
    if (!d.ok) return;
    var s = d.stats;
    var el1 = document.getElementById('stat-initiated'); if(el1) animateNumber(el1, s.initiated, 600, 0);
    var el2 = document.getElementById('stat-invested');  if(el2) animateNumber(el2, s.invested, 600, 0);
    var el3 = document.getElementById('stat-total-inv'); if(el3) animateNumber(el3, s.totalInvested, 600, 0);
    var el4 = document.getElementById('stat-total-rep'); if(el4) animateNumber(el4, s.totalRepaid, 600, 1);
  }).catch(function(){});

  // ── Repayment Flash Bar ──
  (function(){
    var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
    var CONTRACTS = ${JSON.stringify(mockContracts.map(c => ({ id:c.id, participantId:c.participantId })))};

    // Dynamically patch latest 3 records' dates to today/yesterday for demo
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    function fmtDate(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    var allSorted = REP_RECORDS.slice().sort(function(a,b){ return b.date.localeCompare(a.date); });
    if(allSorted.length >= 1) allSorted[0].date = fmtDate(today);
    if(allSorted.length >= 2) allSorted[1].date = fmtDate(today);
    if(allSorted.length >= 3) allSorted[2].date = fmtDate(yesterday);

    // Find my contracts
    var myContractIds = {};
    CONTRACTS.forEach(function(c){ if(c.participantId === u.id) myContractIds[c.id] = true; });

    // Filter this week's repayments for current user
    var now = new Date();
    var dayOfWeek = now.getDay() || 7;
    var weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + 1);
    weekStart.setHours(0,0,0,0);

    var weekTotal = 0, projectSet = {};
    allSorted.forEach(function(r){
      if(!myContractIds[r.contractId]) return;
      var rd = new Date(r.date);
      if(rd >= weekStart){
        weekTotal += r.shareAmount;
        projectSet[r.contractId] = true;
      }
    });
    var projectCount = Object.keys(projectSet).length;

    if(weekTotal > 0){
      var bar = document.getElementById('repayment-flash-bar');
      if(bar){
        var amt = weekTotal.toFixed(2);
        bar.innerHTML = '<div id="flash-inner" style="margin:12px 16px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#16A34A,#15803D);cursor:pointer;display:flex;align-items:center;justify-content:space-between;opacity:0;transform:translateX(40px);transition:opacity 500ms ease-out,transform 500ms ease-out;" onclick="window.location.href=\\'/repayments\\'">'
          +'<div style="display:flex;align-items:center;gap:8px;">'
          +'<span style="font-size:20px;">\\uD83D\\uDCB0</span>'
          +'<span style="color:#fff;font-size:14px;">\\u672C\\u5468\\u56DE\\u6B3E +\\u00A5<b style="font-weight:700;">'+amt+'</b>\\u4E07\\u3000\\u6765\\u81EA '+projectCount+' \\u4E2A\\u9879\\u76EE</span>'
          +'</div>'
          +'<span style="color:#fff;font-size:18px;font-weight:300;">\\u203A</span>'
          +'</div>';
        setTimeout(function(){
          var inner = document.getElementById('flash-inner');
          if(inner){ inner.style.opacity='1'; inner.style.transform='translateX(0)'; }
        }, 300);
      }
    }
  })();

  // ── Personal Investment Overview Card (Task 3 — member only) ──
  (function(){
    // Only show for member role (not admin, not teacher)
    var cu = null;
    try { cu = JSON.parse(localStorage.getItem('zlc_current_user')); } catch(e){}
    if(cu && (cu.role === 'admin' || cu.role === 'teacher')) return;

    var ALL_CONTRACTS = ${JSON.stringify(mockContracts.map(c => ({ id:c.id, participantId:c.participantId, amount:c.amount, status:c.status, projectId:c.projectId })))};
    var ALL_REP_RECORDS = ${JSON.stringify(mockRepaymentRecords.map(r => ({ contractId:r.contractId, participantId:r.participantId, shareAmount:r.shareAmount })))};

    // Merge localStorage contracts
    var lsContracts = [];
    try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
    lsContracts.forEach(function(c){
      if(c.status === 'active' && !ALL_CONTRACTS.find(function(x){return x.id===c.id;})){
        ALL_CONTRACTS.push({ id:c.id, participantId:c.userId||u.id, amount:c.amount, status:c.status, projectId:c.projectId });
      }
    });

    // Filter signed contracts for current user
    var myContracts = ALL_CONTRACTS.filter(function(c){
      return c.participantId === u.id && (c.status === 'active' || c.status === 'completed');
    });
    if(myContracts.length === 0) return;

    // Calculate totals
    var totalInvested = 0;
    var projectIds = {};
    myContracts.forEach(function(c){
      totalInvested += c.amount;
      projectIds[c.projectId] = true;
    });
    var projectCount = Object.keys(projectIds).length;

    var myContractIds = {};
    myContracts.forEach(function(c){ myContractIds[c.id] = true; });

    var totalRepaid = 0;
    ALL_REP_RECORDS.forEach(function(r){
      if(myContractIds[r.contractId]){ totalRepaid += r.shareAmount; }
    });
    // Also check localStorage repayment records
    var lsRepRecords = [];
    try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}
    lsRepRecords.forEach(function(r){
      if(myContractIds[r.contractId] && !ALL_REP_RECORDS.find(function(x){return x.contractId===r.contractId && x.shareAmount===r.shareAmount;})){ totalRepaid += r.shareAmount; }
    });

    var recoveryRate = totalInvested > 0 ? (totalRepaid / totalInvested) : 0;
    var displayRate = Math.min(recoveryRate, 1.5); // cap at 150%
    var ratePercent = (recoveryRate * 100).toFixed(1);

    // SVG half-circle gauge
    // Arc from left to right: M 10 65 A 50 50 0 0 1 110 65
    var arcLength = Math.PI * 50; // ~157.08
    var filledLength = arcLength * displayRate;

    var svgHTML = '<svg viewBox="0 0 120 70" width="120" height="70">'
      + '<defs><linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">'
      + '<stop offset="0%" stop-color="#B91C1C"/>'
      + '<stop offset="50%" stop-color="#D4A853"/>'
      + '<stop offset="100%" stop-color="#16A34A"/>'
      + '</linearGradient></defs>'
      + '<path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#F5F5F4" stroke-width="10" stroke-linecap="round"/>'
      + '<path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="url(#gauge-gradient)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + arcLength.toFixed(2) + '" stroke-dashoffset="' + (arcLength - filledLength).toFixed(2) + '"/>'
      + '<text x="60" y="55" text-anchor="middle" fill="#1C1917" font-size="20" font-weight="800">' + ratePercent + '%</text>'
      + '<text x="60" y="67" text-anchor="middle" fill="#A8A29E" font-size="10">回收率</text>'
      + '</svg>';

    var cardEl = document.getElementById('invest-overview-card');
    if(cardEl){
      cardEl.innerHTML = '<div class="invest-overview-card">'
        + '<div class="invest-overview-left">'
        + '<div class="invest-overview-label">总投资</div>'
        + '<div class="invest-overview-total">¥' + totalInvested.toFixed(1) + '万</div>'
        + '<div class="invest-overview-label" style="margin-top:8px;">总回款</div>'
        + '<div class="invest-overview-repaid">¥' + totalRepaid.toFixed(2) + '万</div>'
        + '<div class="invest-overview-count">参与项目 ' + projectCount + ' 个</div>'
        + '</div>'
        + '<div class="invest-overview-right">' + svgHTML + '</div>'
        + '</div>';
    }
  })();

  // Share code input
  var shareInput = document.getElementById('home-share-input');
  var shareBtn = document.getElementById('home-share-btn');
  var SHARE_CODES = ${JSON.stringify(mockProjects.filter(p => p.shareCode).map(p => ({ code: p.shareCode, id: p.id })))};

  if(shareInput){
    shareInput.addEventListener('input', function(){
      shareInput.value = shareInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    });
    shareInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter') doShareLookup();
    });
  }
  if(shareBtn){
    shareBtn.addEventListener('click', doShareLookup);
  }
  function doShareLookup(){
    var code = shareInput.value.trim().toUpperCase();
    if(code.length < 6){ showToast('请输入完整的6位分享码', 'error'); return; }
    var found = SHARE_CODES.find(function(s){ return s.code === code; });
    if(found){
      window.location.href = '/projects/' + found.id + '?from=share';
    } else {
      showToast('未找到该分享码对应的项目', 'error');
    }
  }

  // ── Onboarding (first-time) ──
  showOnboarding();

  // ── Coach Marks for Home Page ──
  setTimeout(function(){
    showCoachMark('#quick-actions', '从这里开始：发起你的项目，或去大厅看看同学的项目', 'bottom', 'home-quick');
  }, 800);
  setTimeout(function(){
    showCoachMark('#share-code-input', '收到同学的分享码？在这里输入就能直接查看项目', 'bottom', 'home-share');
  }, 1500);
})();
`}} />
    </div>,
    { title: '中流通 - 首页' }
  )
})
}
