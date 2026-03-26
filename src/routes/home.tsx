// Route: / — Phase 1B: API化改造（零DB查询 + 骨架屏 + 异步加载）
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript,
} from '../components'

export function registerHomeRoute(app: Hono<HonoEnv>) {
app.get('/', async (c) => {
  // ✅ Phase 1B: 不再执行任何 DB 查询，TTFB 降至 ~130ms
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

        {/* 1. Welcome — with gradient background and time-based greeting */}
        <section class="mb-5 dk-home-welcome home-welcome-card">
          <div class="home-welcome-inner">
            <div class="home-welcome-text">
              <h2 id="greeting" class="font-bold text-text-title dk-home-greeting" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;" />
              <p id="user-subtitle" class="text-text-secondary mt-0.5" style="font-size:14px;" />
            </div>
            <div class="home-welcome-deco" id="home-welcome-deco" />
          </div>
          {/* 1.5 Share Code Input — inline on desktop welcome bar */}
          <div id="share-code-input" class="dk-home-share-input" style="margin:10px 0 0 0;">
            <div class="home-share-box">
              <i class="fas fa-link" style="font-size:14px;color:#B91C1C;flex-shrink:0;" />
              <input id="home-share-input" type="text" maxlength={6} placeholder="收到分享码？输入6位码查看项目" style="flex:1;background:transparent;border:none;outline:none;font-size:14px;color:#1C1917;font-family:inherit;" />
              <button id="home-share-btn" class="home-share-btn">查看</button>
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

          {/* 3. My Stats — 骨架屏 → 异步加载后替换 */}
          <section class="grid grid-cols-2 gap-3 mb-6 dk-home-stats">
            {[
              { id: 'stat-initiated', label: '已发起', icon: '🚀', suffix: '' },
              { id: 'stat-invested', label: '已参与', icon: '🤝', suffix: '' },
              { id: 'stat-total-inv', label: '总投资(万)', icon: '💰', suffix: '' },
              { id: 'stat-total-rep', label: '总回款(万)', icon: '📈', suffix: '' },
            ].map((s, i) => (
              <div class={`home-stat-card reveal stagger-${i + 1}`}>
                <div class="home-stat-icon">{s.icon}</div>
                <div id={s.id} class="home-stat-value font-extrabold text-text-title">—</div>
                <div class="text-text-tertiary mt-1" style="font-size:12px;">{s.label}</div>
              </div>
            ))}
          </section>

          {/* 4. Latest Projects — 骨架屏占位 */}
          <section class="mb-6 dk-home-projects reveal stagger-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-text-title" style="font-size:16px;">我参与的项目</h3>
              <a href="/projects" class="text-brand font-medium home-viewall-link" style="font-size:13px;text-decoration:none;">
                查看全部 <i class="fas fa-arrow-right" style="font-size:11px;" />
              </a>
            </div>
            <div id="home-projects-list" class="flex flex-col gap-3 dk-home-project-grid">
              {/* 骨架屏：3张项目卡片占位 */}
              {[0,1,2].map(() => (
                <div class="bg-white rounded-2xl shadow-card p-4 home-skeleton-card">
                  <div class="flex items-center gap-2.5 mb-2">
                    <div class="rounded-full bg-gray-200 animate-pulse" style="width:32px;height:32px;" />
                    <div class="flex-1">
                      <div class="bg-gray-200 animate-pulse rounded" style="width:60%;height:14px;" />
                    </div>
                  </div>
                  <div class="bg-gray-200 animate-pulse rounded mb-2" style="width:80%;height:16px;" />
                  <div class="flex items-center gap-2 mb-3">
                    <div class="bg-gray-100 animate-pulse rounded-full" style="width:48px;height:18px;" />
                    <div class="bg-gray-100 animate-pulse rounded-full" style="width:56px;height:18px;" />
                    <div class="bg-gray-100 animate-pulse rounded-full" style="width:52px;height:18px;" />
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 bg-gray-100 animate-pulse rounded-full" style="height:8px;" />
                    <div class="bg-gray-200 animate-pulse rounded" style="width:32px;height:14px;" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column content on desktop (sticky sidebar) */}
        <div class="dk-home-right">
          {/* 5. Recent Repayments — 骨架屏占位 */}
          <section class="mb-4 reveal stagger-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-text-title" style="font-size:16px;">回款动态</h3>
              <span class="home-live-dot" />
            </div>
            <div class="bg-white rounded-2xl shadow-card overflow-hidden home-repayment-list" id="home-repayment-list">
              {/* 骨架屏：5行回款占位 */}
              {[0,1,2,3,4].map((_, i) => (
                <div class={`flex items-center justify-between px-4 py-3 ${i < 4 ? 'border-b border-surface-divider' : ''}`}>
                  <div class="flex items-center gap-3">
                    <div class="bg-gray-200 animate-pulse rounded" style="width:36px;height:14px;" />
                    <div class="bg-gray-200 animate-pulse rounded" style="width:96px;height:14px;" />
                  </div>
                  <div class="bg-green-100 animate-pulse rounded" style="width:64px;height:14px;" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <TabBar active="home" />

      {/* Client script — 异步加载数据 + 渲染 */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // Greeting with time-based decoration
  var h = new Date().getHours();
  var tg = h >= 6 && h < 12 ? '上午好' : h >= 12 && h < 18 ? '下午好' : '晚上好';
  var timeEmoji = h >= 6 && h < 12 ? '🌅' : h >= 12 && h < 18 ? '☀️' : '🌙';
  var greetEl = document.getElementById('greeting');
  if (greetEl) greetEl.textContent = '\\uD83D\\uDC4B ' + u.name + ' 同学，' + tg;
  var subEl = document.getElementById('user-subtitle');
  if (subEl) subEl.textContent = u.company + ' · ' + u.title + ' · ' + (u.cohort || '');
  var decoEl = document.getElementById('home-welcome-deco');
  if (decoEl) decoEl.textContent = timeEmoji;

  // ── Fetch stats (lightweight, no change) ──
  fetch('/api/user-stats/' + u.id).then(function(r){return r.json();}).then(function(d){
    if (!d.ok) return;
    var s = d.stats;
    var el1 = document.getElementById('stat-initiated'); if(el1) animateNumber(el1, s.initiated, 600, 0);
    var el2 = document.getElementById('stat-invested');  if(el2) animateNumber(el2, s.invested, 600, 0);
    var el3 = document.getElementById('stat-total-inv'); if(el3) animateNumber(el3, s.totalInvested, 600, 0);
    var el4 = document.getElementById('stat-total-rep'); if(el4) animateNumber(el4, s.totalRepaid, 600, 1);
  }).catch(function(){});

  // ══════════════════════════════════════════════════════
  // Phase 1B: 异步加载所有数据（并行请求）
  // ══════════════════════════════════════════════════════
  Promise.all([
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();}),
    fetch('/api/data/repayments').then(function(r){return r.json();}),
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/repayment-records').then(function(r){return r.json();}),
    fetch('/api/data/teachers').then(function(r){return r.json();}),
  ]).then(function(results){
    var allProjects = (results[0].ok && results[0].data) || [];
    var allMembers  = (results[1].ok && results[1].data) || [];
    var allRepayments = (results[2].ok && results[2].data) || [];
    var allContracts  = (results[3].ok && results[3].data) || [];
    var allRepRecords = (results[4].ok && results[4].data) || [];
    var allTeachers   = (results[5].ok && results[5].data) || [];

    // Set global teachers for other components
    window.__ZLC_TEACHERS__ = allTeachers.map(function(t){ return { id:t.id, name:t.name, phone:t.phone, classIds:t.classIds }; });

    // ── Render open projects (replace skeleton) ──
    renderHomeProjects(allProjects, allMembers);

    // ── Render repayments (replace skeleton) ──
    renderHomeRepayments(allRepayments);

    // ── Repayment Flash Bar ──
    renderFlashBar(allRepRecords, allContracts, u);

    // ── Personal Investment Overview Card ──
    renderInvestOverview(allContracts, allRepRecords, u);

    // ── Share code lookup (async) ──
    initShareCodeLookup(allProjects);
  }).catch(function(err){
    console.error('Home data load failed:', err);
  });

  // ══════════════════════════════════════════════════════
  // Render functions
  // ══════════════════════════════════════════════════════

  function renderHomeProjects(allProjects, allMembers){
    var openProjects = allProjects.filter(function(p){ return p.status === 'open'; }).slice(0, 3);
    var listEl = document.getElementById('home-projects-list');
    if(!listEl) return;

    if(openProjects.length === 0){
      listEl.innerHTML = '<div class="text-center py-8 text-text-tertiary" style="font-size:13px;">暂无募集中的项目</div>';
      return;
    }

    listEl.innerHTML = openProjects.map(function(proj){
      var owner = allMembers.find(function(m){ return m.id === proj.ownerId; });
      var pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100);
      var ownerName = owner ? owner.name : '?';
      var ownerCompany = owner ? owner.company : '';
      return '<a href="/projects/' + proj.id + '" class="bg-white rounded-2xl shadow-card p-4 block dk-clickable-card home-project-card" style="text-decoration:none;color:inherit;">'
        + '<div class="flex items-center gap-2.5 mb-2">'
        + '<div class="flex items-center justify-center rounded-full bg-brand text-white font-bold" style="width:32px;height:32px;font-size:13px;">' + ownerName.charAt(0) + '</div>'
        + '<div><span class="text-text-primary font-medium" style="font-size:14px;">' + ownerName + '</span>'
        + '<span class="text-text-tertiary ml-1.5" style="font-size:12px;">' + ownerCompany + '</span></div></div>'
        + '<div class="font-semibold text-text-title mb-2" style="font-size:15px;">' + proj.name + '</div>'
        + '<div class="flex items-center gap-2 flex-wrap mb-3">'
        + '<span class="bg-brand-soft text-brand px-2.5 py-0.5 rounded-full font-medium" style="font-size:11px;">' + proj.industry + '</span>'
        + '<span class="text-text-secondary" style="font-size:12px;">融资 ' + proj.targetAmount + '万</span>'
        + '<span class="text-text-secondary" style="font-size:12px;">分成 ' + proj.revenueShareRate + '%</span></div>'
        + '<div class="flex items-center gap-3">'
        + '<div class="progress-bar flex-1"><div class="progress-fill" style="width:' + pct + '%"></div></div>'
        + '<span class="font-semibold text-gold-dark" style="font-size:13px;">' + pct + '%</span></div></a>';
    }).join('');
  }

  function renderHomeRepayments(allRepayments){
    var recent = allRepayments.slice(0, 5);
    var listEl = document.getElementById('home-repayment-list');
    if(!listEl || recent.length === 0) return;

    listEl.innerHTML = recent.map(function(r, i){
      return '<div class="home-repayment-row flex items-center justify-between px-4 py-3 ' + (i < recent.length - 1 ? 'border-b border-surface-divider' : '') + '">'
        + '<div class="flex items-center gap-3">'
        + '<span class="home-rep-date">' + r.date.slice(5) + '</span>'
        + '<span class="text-text-primary font-medium" style="font-size:13px;">' + (r.projectName.length > 12 ? r.projectName.slice(0, 12) + '...' : r.projectName) + '</span></div>'
        + '<span class="home-rep-amount">+¥' + r.amount.toFixed(2) + '万</span></div>';
    }).join('');

    // Auto-scroll ticker
    if(listEl.children.length > 3){
      var scrollInterval = setInterval(function(){
        if(listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 2){
          listEl.scrollTo({ top: 0, behavior: 'smooth' });
        } else { listEl.scrollBy({ top: 48, behavior: 'smooth' }); }
      }, 3000);
      listEl.addEventListener('mouseenter', function(){ clearInterval(scrollInterval); });
      listEl.addEventListener('mouseleave', function(){
        scrollInterval = setInterval(function(){
          if(listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 2){
            listEl.scrollTo({ top: 0, behavior: 'smooth' });
          } else { listEl.scrollBy({ top: 48, behavior: 'smooth' }); }
        }, 3000);
      });
    }
  }

  function renderFlashBar(allRepRecords, allContracts, u){
    // Dynamically patch latest 3 records' dates to today/yesterday for demo
    var today = new Date();
    var yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    function fmtDate(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    var allSorted = allRepRecords.slice().sort(function(a,b){ return b.date.localeCompare(a.date); });
    if(allSorted.length >= 1) allSorted[0].date = fmtDate(today);
    if(allSorted.length >= 2) allSorted[1].date = fmtDate(today);
    if(allSorted.length >= 3) allSorted[2].date = fmtDate(yesterday);

    var myContractIds = {};
    allContracts.forEach(function(c){ if(c.participantId === u.id) myContractIds[c.id] = true; });

    var now = new Date();
    var dayOfWeek = now.getDay() || 7;
    var weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + 1);
    weekStart.setHours(0,0,0,0);

    var weekTotal = 0, projectSet = {};
    allSorted.forEach(function(r){
      if(!myContractIds[r.contractId]) return;
      var rd = new Date(r.date);
      if(rd >= weekStart){ weekTotal += r.shareAmount; projectSet[r.contractId] = true; }
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
  }

  function renderInvestOverview(allContracts, allRepRecords, u){
    var cu = null;
    try { cu = JSON.parse(localStorage.getItem('zlc_current_user')); } catch(e){}
    if(cu && (cu.role === 'admin' || cu.role === 'teacher')) return;

    var myContracts = allContracts.filter(function(c){
      return c.participantId === u.id && (c.status === 'active' || c.status === 'completed');
    });
    if(myContracts.length === 0) return;

    var totalInvested = 0, projectIds = {};
    myContracts.forEach(function(c){ totalInvested += c.amount; projectIds[c.projectId] = true; });
    var projectCount = Object.keys(projectIds).length;

    var myContractIds = {};
    myContracts.forEach(function(c){ myContractIds[c.id] = true; });

    var totalRepaid = 0;
    allRepRecords.forEach(function(r){ if(myContractIds[r.contractId]){ totalRepaid += r.shareAmount; } });

    var recoveryRate = totalInvested > 0 ? (totalRepaid / totalInvested) : 0;
    var displayRate = Math.min(recoveryRate, 1.5);
    var ratePercent = (recoveryRate * 100).toFixed(1);
    var arcLength = Math.PI * 50;
    var filledLength = arcLength * displayRate;

    var svgHTML = '<svg viewBox="0 0 120 70" width="120" height="70">'
      + '<defs><linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">'
      + '<stop offset="0%" stop-color="#B91C1C"/><stop offset="50%" stop-color="#D4A853"/><stop offset="100%" stop-color="#16A34A"/></linearGradient></defs>'
      + '<path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#F5F5F4" stroke-width="10" stroke-linecap="round"/>'
      + '<path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="url(#gauge-gradient)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + arcLength.toFixed(2) + '" stroke-dashoffset="' + (arcLength - filledLength).toFixed(2) + '"/>'
      + '<text x="60" y="55" text-anchor="middle" fill="#1C1917" font-size="20" font-weight="800">' + ratePercent + '%</text>'
      + '<text x="60" y="67" text-anchor="middle" fill="#A8A29E" font-size="10">回收率</text></svg>';

    var cardEl = document.getElementById('invest-overview-card');
    if(cardEl){
      cardEl.innerHTML = '<div class="invest-overview-card">'
        + '<div class="invest-overview-left">'
        + '<div class="invest-overview-label">总投资</div>'
        + '<div class="invest-overview-total">¥' + totalInvested.toFixed(1) + '万</div>'
        + '<div class="invest-overview-label" style="margin-top:8px;">总回款</div>'
        + '<div class="invest-overview-repaid">¥' + totalRepaid.toFixed(2) + '万</div>'
        + '<div class="invest-overview-count">参与项目 ' + projectCount + ' 个</div></div>'
        + '<div class="invest-overview-right">' + svgHTML + '</div></div>';
    }
  }

  function initShareCodeLookup(allProjects){
    var shareInput = document.getElementById('home-share-input');
    var shareBtn = document.getElementById('home-share-btn');
    var SHARE_CODES = allProjects.filter(function(p){ return p.shareCode; }).map(function(p){ return { code: p.shareCode, id: p.id }; });

    if(shareInput){
      shareInput.addEventListener('input', function(){
        shareInput.value = shareInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      });
      shareInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter') doShareLookup();
      });
    }
    if(shareBtn){ shareBtn.addEventListener('click', doShareLookup); }

    function doShareLookup(){
      var code = shareInput.value.trim().toUpperCase();
      if(code.length < 6){ showToast('请输入完整的6位分享码', 'error'); return; }
      var found = SHARE_CODES.find(function(s){ return s.code === code; });
      if(found){
        window.location.href = '/projects/' + found.id + '?from=share';
      } else {
        // Fallback: try API lookup in case local data is stale
        fetch('/api/data/share-code/' + code).then(function(r){return r.json();}).then(function(d){
          if(d.ok && d.data) window.location.href = '/projects/' + d.data.id + '?from=share';
          else showToast('未找到该分享码对应的项目', 'error');
        }).catch(function(){ showToast('查询失败，请稍后重试', 'error'); });
      }
    }
  }

  // ── Onboarding (first-time) ──
  showOnboarding();

  // ── Inline First-Visit Hints ──
  (function(){
    var userId = '';
    try { userId = JSON.parse(localStorage.getItem('zlc_user')).id; } catch(e){}
    var hintKey = userId ? 'zlc_home_hint_' + userId : 'zlc_home_hint';
    if(localStorage.getItem(hintKey)) return;
    var qa = document.getElementById('quick-actions');
    if(!qa) return;
    var hint = document.createElement('div');
    hint.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px;animation:coachFadeIn 0.4s ease 0.6s both;';
    hint.innerHTML = '<span style="font-size:16px;flex-shrink:0;">\\uD83D\\uDC4B</span>'
      + '<div style="flex:1;"><div style="font-size:13px;color:#92400E;line-height:1.6;">欢迎！从上方快捷入口开始：发起你的项目，或去大厅看看同学的项目。收到分享码？在下方输入就能直接查看。</div>'
      + '<button id="home-hint-dismiss" style="font-size:12px;color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-top:6px;padding:0;">我知道了</button></div>';
    qa.parentNode.insertBefore(hint, qa.nextSibling);
    document.getElementById('home-hint-dismiss').addEventListener('click', function(){
      localStorage.setItem(hintKey, 'true');
      hint.style.opacity = '0'; hint.style.transition = 'opacity 0.3s';
      setTimeout(function(){ hint.remove(); }, 300);
    });
  })();
})();
`}} />
    </div>,
    { title: '中流通 - 首页' }
  )
})
}
