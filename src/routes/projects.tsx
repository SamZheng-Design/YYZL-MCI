// Route: /projects — Phase 1B: API化改造（零DB查询 + 骨架屏 + 异步加载）
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript, statusLabel,
} from '../components'

export function registerProjectsRoute(app: Hono<HonoEnv>) {
app.get('/projects', async (c) => {
  // ✅ Phase 1B: 不再执行任何 DB 查询，TTFB 降至 ~130ms
  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto dk-projects-main">
        {/* Title */}
        <section class="px-4 pt-4 pb-3 page-enter">
          <h1 class="font-bold text-text-title" style="font-size:22px;font-family:'Noto Sans SC',sans-serif;">项目大厅</h1>
          <p class="text-text-secondary mt-0.5" style="font-size:14px;">发现同学的优质项目</p>
        </section>

        {/* KPI Banner — 骨架屏占位 */}
        <section class="px-4 mb-4">
          <div class="kpi-banner" id="kpi-banner">
            <div class="kpi-item"><div class="kpi-val" id="kpi-open"><span class="inline-block bg-gray-200 animate-pulse rounded" style="width:24px;height:20px;" /></div><div class="kpi-label">募集中</div></div>
            <div class="kpi-item"><div class="kpi-val" id="kpi-active"><span class="inline-block bg-gray-200 animate-pulse rounded" style="width:24px;height:20px;" /></div><div class="kpi-label">运营中</div></div>
            <div class="kpi-item"><div class="kpi-val" id="kpi-raised"><span class="inline-block bg-gray-200 animate-pulse rounded" style="width:48px;height:20px;" /></div><div class="kpi-label">累计金额(万)</div></div>
            <div class="kpi-item"><div class="kpi-val" id="kpi-repaid"><span class="inline-block bg-gray-200 animate-pulse rounded" style="width:48px;height:20px;" /></div><div class="kpi-label">累计回款(万)</div></div>
          </div>
        </section>

        {/* Filter Bar */}
        <div class="filter-bar dk-projects-filter">
          <select id="filter-industry" class="filter-select">
            <option value="全部">全部</option>
          </select>
          <select id="filter-status" class="filter-select">
            <option value="全部">全部状态</option>
            <option value="open">募集中</option>
            <option value="active">运营中</option>
            <option value="completed">已完成</option>
          </select>
          <select id="filter-sort" class="filter-select">
            <option value="relevant">与我相关</option>
            <option value="latest">最新发布</option>
            <option value="amount">金额最大</option>
            <option value="rate">分成最高</option>
          </select>
        </div>

        {/* Project Cards — 骨架屏占位 */}
        <section id="project-list" class="px-4 pt-4 pb-4 flex flex-col gap-4 dk-project-list">
          {[0,1,2,3].map(() => (
            <div class="bg-white rounded-2xl shadow-card p-5 projects-skeleton-card">
              {/* Tag skeleton */}
              <div class="mb-2"><div class="inline-block bg-gray-100 animate-pulse rounded" style="width:64px;height:18px;" /></div>
              {/* Owner row */}
              <div class="flex items-center gap-2.5 mb-2.5">
                <div class="rounded-full bg-gray-200 animate-pulse" style="width:36px;height:36px;" />
                <div class="flex-1">
                  <div class="bg-gray-200 animate-pulse rounded" style="width:50%;height:14px;" />
                </div>
              </div>
              {/* Title */}
              <div class="bg-gray-200 animate-pulse rounded mb-2" style="width:75%;height:18px;" />
              {/* Tags */}
              <div class="flex items-center gap-2 mb-3">
                <div class="bg-red-100 animate-pulse rounded" style="width:44px;height:20px;" />
                <div class="bg-gray-100 animate-pulse rounded" style="width:44px;height:20px;" />
              </div>
              {/* KPI grid */}
              <div class="grid grid-cols-3 gap-2 mb-3">
                {[0,1,2].map(() => (
                  <div>
                    <div class="bg-gray-200 animate-pulse rounded mb-1" style="width:60%;height:18px;" />
                    <div class="bg-gray-100 animate-pulse rounded" style="width:48px;height:12px;" />
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div class="bg-gray-100 animate-pulse rounded-full mb-2" style="height:8px;" />
              <div class="flex justify-between">
                <div class="bg-gray-100 animate-pulse rounded" style="width:40%;height:13px;" />
                <div class="bg-gray-100 animate-pulse rounded" style="width:20%;height:13px;" />
              </div>
            </div>
          ))}
        </section>

        {/* Empty state (hidden by default) */}
        <div id="empty-state" class="px-4 py-12 text-center dk-empty-state" style="display:none;">
          <div class="flex items-center justify-center mb-3">
            <div class="flex items-center justify-center rounded-full bg-brand-soft" style="width:56px;height:56px;">
              <i class="fas fa-search text-brand" style="font-size:22px;" />
            </div>
          </div>
          <p class="text-text-secondary font-medium" style="font-size:15px;">暂无符合条件的项目</p>
          <p class="text-text-tertiary mt-1" style="font-size:13px;">请调整筛选条件再试</p>
        </div>
      </main>

      <TabBar active="projects" />

      {/* Client script — 异步加载数据 + 筛选渲染 */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}

  // ══════════════════════════════════════════════════════
  // Phase 1B: 异步加载所有数据
  // ══════════════════════════════════════════════════════
  Promise.all([
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();}),
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/repayment-records').then(function(r){return r.json();}),
    fetch('/api/data/teachers').then(function(r){return r.json();}),
    fetch('/api/data/repayments').then(function(r){return r.json();}),
  ]).then(function(results){
    var PROJECTS  = (results[0].ok && results[0].data) || [];
    var MEMBERS   = (results[1].ok && results[1].data) || [];
    var CONTRACTS = (results[2].ok && results[2].data) || [];
    var REP_RECORDS = (results[3].ok && results[3].data) || [];
    var TEACHERS  = (results[4].ok && results[4].data) || [];
    var REPAYMENTS = (results[5].ok && results[5].data) || [];

    // Set global teachers
    window.__ZLC_TEACHERS__ = TEACHERS.map(function(t){ return { id:t.id, name:t.name, phone:t.phone, classIds:t.classIds }; });

    // ── Populate KPI Banner ──
    var openCount = PROJECTS.filter(function(p){return p.status==='open';}).length;
    var activeCount = PROJECTS.filter(function(p){return p.status==='active'||p.status==='funded';}).length;
    var totalRaised = Math.round(PROJECTS.reduce(function(s,p){return s+p.raisedAmount;},0));
    var totalRepaid = Math.round(REPAYMENTS.reduce(function(s,r){return s+r.amount;},0)*100)/100;

    var kpiOpen = document.getElementById('kpi-open');
    var kpiActive = document.getElementById('kpi-active');
    var kpiRaised = document.getElementById('kpi-raised');
    var kpiRepaid = document.getElementById('kpi-repaid');
    if(kpiOpen) kpiOpen.textContent = openCount;
    if(kpiActive) kpiActive.textContent = activeCount;
    if(kpiRaised) kpiRaised.textContent = '¥' + totalRaised;
    if(kpiRepaid) kpiRepaid.textContent = '¥' + totalRepaid;

    // ── Populate industry filter ──
    var industries = ['全部'];
    var indSet = {};
    PROJECTS.forEach(function(p){ if(p.industry && !indSet[p.industry]){ indSet[p.industry]=true; industries.push(p.industry); }});
    var fInd = document.getElementById('filter-industry');
    if(fInd){
      fInd.innerHTML = industries.map(function(ind){ return '<option value="'+ind+'">'+ind+'</option>'; }).join('');
    }

    // ── Filtering & Rendering ──
    var myClassId = (u && u.classId) ? u.classId : '';
    var myTeacher = null;
    if(myClassId){
      myTeacher = TEACHERS.find(function(t){ return t.classIds && t.classIds.indexOf(myClassId) !== -1; }) || null;
    }

    function getRelationTag(p){
      if(!myClassId) return { text: p.initiatorClassName || '', type: 'gray' };
      if(myTeacher && p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1){
        return { text: '\\u{1F31F} 老师推荐', type: 'gold' };
      }
      if(p.initiatorClassId && p.initiatorClassId === myClassId){
        return { text: '同班 · ' + (p.initiatorClassName || ''), type: 'green' };
      }
      return { text: p.initiatorClassName || '', type: 'gray' };
    }

    function getRelevanceScore(p){
      var score = 0;
      if(p.initiatorClassId === myClassId) score += 30;
      if(myTeacher && p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1) score += 20;
      if(p.status === 'open') score += 10;
      if(p.status === 'active') score += 5;
      return score;
    }

    var tagStyles = {
      gold: 'background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;',
      green: 'background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;',
      gray: 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;'
    };

    var listEl = document.getElementById('project-list');
    var emptyEl = document.getElementById('empty-state');
    var fSta = document.getElementById('filter-status');
    var fSort = document.getElementById('filter-sort');

    function getMember(id){ return MEMBERS.find(function(m){return m.id===id;}) || {name:'?',company:'',cohort:''}; }
    function statusLabel(s){ return {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成'}[s]||s; }
    function badgeClass(s){ return 'badge badge-'+s; }

    function render(){
      var ind = fInd.value, sta = fSta.value, sort = fSort.value;
      var list = PROJECTS.filter(function(p){
        if(ind!=='全部' && p.industry!==ind) return false;
        if(sta!=='全部' && p.status!==sta) return false;
        return true;
      });
      if(sort==='amount') list.sort(function(a,b){return b.targetAmount-a.targetAmount;});
      else if(sort==='rate') list.sort(function(a,b){return b.revenueShareRate-a.revenueShareRate;});
      else if(sort==='relevant') list.sort(function(a,b){
        var sa = getRelevanceScore(a), sb = getRelevanceScore(b);
        if(sb !== sa) return sb - sa;
        return b.createdAt.localeCompare(a.createdAt);
      });
      else list.sort(function(a,b){return b.createdAt.localeCompare(a.createdAt);});

      if(!list.length){ listEl.innerHTML=''; emptyEl.style.display='block'; return; }
      emptyEl.style.display='none';

      listEl.innerHTML = list.map(function(p){
        var o = getMember(p.ownerId);
        var pct = Math.round(p.raisedAmount/p.targetAmount*100);
        var remain = p.totalShares - p.raisedShares;
        var tag = getRelationTag(p);
        var tagHTML = tag.text ? '<span class="relation-tag" style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;'+tagStyles[tag.type]+'">'+tag.text+'</span>' : '';
        var completedLine = '';
        if(p.status === 'completed'){
          var pContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id; });
          var totalInvested = 0, totalRepaid = 0;
          pContracts.forEach(function(c){
            totalInvested += c.amount;
            var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
            if(recs.length > 0){ totalRepaid += recs[recs.length-1].cumulativeShare; }
          });
          var returnPct = totalInvested > 0 ? (totalRepaid / totalInvested * 100).toFixed(1) : '0.0';
          completedLine = '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #F0FDF4;font-size:13px;color:#16A34A;font-weight:600;">\\u2705 \\u5B9E\\u9645\\u56DE\\u62A5 '+returnPct+'% \\u00B7 \\u5386\\u65F6'+p.duration+'\\u4E2A\\u6708</div>';
        }
        return '<a href="/projects/'+p.id+'" class="bg-white rounded-2xl shadow-card shadow-card-hover p-5 block" style="text-decoration:none;color:inherit;">'
          +(tagHTML ? '<div style="margin-bottom:8px;">'+tagHTML+'</div>' : '')
          +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
            +'<div style="width:36px;height:36px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">'+o.name.charAt(0)+'</div>'
            +'<div><span style="font-size:14px;font-weight:500;color:#1C1917;">'+o.name+'</span>'
            +'<span style="font-size:12px;color:#78716C;margin-left:6px;">'+o.company+' · '+o.cohort+'</span></div>'
          +'</div>'
          +'<div style="font-size:18px;font-weight:600;color:#1C1917;margin-bottom:8px;">'+p.name+'</div>'
          +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">'
            +'<span style="background:#FEE2E2;color:#B91C1C;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">'+p.industry+'</span>'
            +'<span class="'+badgeClass(p.status)+'">'+statusLabel(p.status)+'</span>'
          +'</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">'
            +'<div><div style="font-size:17px;font-weight:700;color:#1C1917;">¥'+p.targetAmount+'<span style="font-size:12px;font-weight:400;color:#78716C;">万</span></div><div style="font-size:11px;color:#A8A29E;">融资总额</div></div>'
            +'<div><div style="font-size:17px;font-weight:700;color:#1C1917;">'+p.revenueShareRate+'<span style="font-size:12px;font-weight:400;color:#78716C;">%</span></div><div style="font-size:11px;color:#A8A29E;">分成比例</div></div>'
            +'<div><div style="font-size:17px;font-weight:700;color:#1C1917;">'+p.duration+'<span style="font-size:12px;font-weight:400;color:#78716C;">月</span></div><div style="font-size:11px;color:#A8A29E;">联营期限</div></div>'
          +'</div>'
          +'<div style="height:8px;border-radius:99px;background:#F5F5F4;overflow:hidden;margin-bottom:8px;">'
            +'<div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#D4A853,#B8860B);width:'+pct+'%;"></div>'
          +'</div>'
          +'<div style="display:flex;justify-content:space-between;align-items:center;">'
            +'<span style="font-size:12px;color:#78716C;">已募 '+pct+'% (¥'+p.raisedAmount+'/'+p.targetAmount+'万)'+((p.status==="open"||p.status==="active") && remain > 0 ?' · 剩余'+remain+'份':'')+'</span>'
            +'<span style="font-size:13px;font-weight:600;color:#B91C1C;">查看详情 →</span>'
          +'</div>'
          +completedLine
        +'</a>';
      }).join('');
    }

    fInd.addEventListener('change', render);
    fSta.addEventListener('change', render);
    fSort.addEventListener('change', render);
    render();

    // ── Inline Hint for relation tags ──
    setTimeout(function(){
      var userId = '';
      try { userId = JSON.parse(localStorage.getItem('zlc_user')).id; } catch(e){}
      var hintKey = userId ? 'zlc_hall_hint_' + userId : 'zlc_hall_hint';
      if(localStorage.getItem(hintKey)) return;
      var tag = document.querySelector('.relation-tag');
      if(!tag) return;
      var listEl = document.getElementById('project-list');
      if(!listEl) return;
      var hint = document.createElement('div');
      hint.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:flex-start;gap:8px;animation:coachFadeIn 0.4s ease forwards;';
      hint.innerHTML = '<span style="flex-shrink:0;">\\uD83C\\uDFF7\\uFE0F</span>'
        + '<div style="flex:1;font-size:12px;color:#92400E;line-height:1.5;">绿色标签表示同班同学，金色是老师推荐的项目，帮你快速识别。'
        + '<button id="hall-hint-dismiss" style="color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-left:4px;padding:0;font-size:12px;">知道了</button></div>';
      listEl.insertBefore(hint, listEl.firstChild);
      document.getElementById('hall-hint-dismiss').addEventListener('click', function(){
        localStorage.setItem(hintKey, 'true');
        hint.style.opacity = '0'; hint.style.transition = 'opacity 0.3s';
        setTimeout(function(){ hint.remove(); }, 300);
      });
    }, 800);

    // ── Nudge A: Browse 30s without clicking ──
    var hallNudgeTimer = null;
    function cancelHallNudge(){ clearTimeout(hallNudgeTimer); hallNudgeTimer = null; }
    if (!localStorage.getItem('zlc_nudge_hall_browse')) {
      hallNudgeTimer = setTimeout(function(){ showNudge('\\uD83D\\uDCA1', '点击任意项目可以查看详细条款和预估回报', 'hall_browse'); }, 30000);
      document.addEventListener('click', function(e){
        if(e.target.closest('a[href^="/projects/"]')) cancelHallNudge();
      });
    }
    window.addEventListener('beforeunload', cancelHallNudge);

  }).catch(function(err){
    console.error('Projects data load failed:', err);
    var listEl = document.getElementById('project-list');
    if(listEl) listEl.innerHTML = '<div class="text-center py-8 text-text-tertiary" style="font-size:13px;">数据加载失败，请刷新重试</div>';
  });
})();
`}} />
    </div>,
    { title: '中流通 - 项目大厅' }
  )
})
}
