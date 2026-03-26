// Route: /projects
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript, statusLabel,
} from '../components'

export function registerProjectsRoute(app: Hono<HonoEnv>) {
app.get('/projects', async (c) => {
  const db = c.env.DB
  const { loadMembers, loadProjects, loadContracts, loadRepaymentRecords, loadTeachers, loadRepayments, getProjectStats, getRelationTag, getRelevanceScore } = await import('../db-bridge')
  const [allMembers, allProjects, allContracts, allRepRecords, allTeachers, allRepayments] = await Promise.all([
    loadMembers(db), loadProjects(db), loadContracts(db), loadRepaymentRecords(db), loadTeachers(db), loadRepayments(db)
  ])
  const stats = getProjectStats(allProjects, allRepayments)
  const industries = ['全部', ...Array.from(new Set(allProjects.map(p => p.industry)))]

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

        {/* KPI Banner */}
        <section class="px-4 mb-4">
          <div class="kpi-banner">
            <div class="kpi-item"><div class="kpi-val">{stats.openCount}</div><div class="kpi-label">募集中</div></div>
            <div class="kpi-item"><div class="kpi-val">{stats.activeCount}</div><div class="kpi-label">运营中</div></div>
            <div class="kpi-item"><div class="kpi-val">¥{stats.totalRaised}</div><div class="kpi-label">累计金额(万)</div></div>
            <div class="kpi-item"><div class="kpi-val">¥{stats.totalRepaid}</div><div class="kpi-label">累计回款(万)</div></div>
          </div>
        </section>

        {/* Filter Bar */}
        <div class="filter-bar dk-projects-filter">
          <select id="filter-industry" class="filter-select">
            {industries.map(ind => <option value={ind}>{ind}</option>)}
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

        {/* Project Cards — rendered via client JS for filtering */}
        <section id="project-list" class="px-4 pt-4 pb-4 flex flex-col gap-4 dk-project-list" />

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

      {/* Inject projects data + filter logic */}
      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(allTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var PROJECTS = ${JSON.stringify(allProjects.map(p => ({
    id:p.id, name:p.name, ownerId:p.ownerId, industry:p.industry,
    targetAmount:p.targetAmount, raisedAmount:p.raisedAmount,
    revenueShareRate:p.revenueShareRate, duration:p.duration,
    recoveryMultiple:p.recoveryMultiple||0,
    exitMode:p.exitMode||'both', annualYieldRate:p.annualYieldRate??12,
    expectMultiple:p.expectMultiple??null, settlementCycle:p.settlementCycle||'monthly',
    estimatedMonthlyRevenue:p.estimatedMonthlyRevenue||0,
    totalShares:p.totalShares, raisedShares:p.raisedShares,
    status:p.status, createdAt:p.createdAt, investors:p.investors,
    initiatorClassId:p.initiatorClassId||'', initiatorClassName:p.initiatorClassName||'',
    recommendedByTeacher:p.recommendedByTeacher||[],
  })))};
  var MEMBERS = ${JSON.stringify(allMembers.map(m => ({ id:m.id, name:m.name, company:m.company, cohort:m.cohort, classId:m.classId||'' })))};
  var TEACHERS = ${JSON.stringify(allTeachers.map(t => ({ id:t.id, name:t.name, classIds:t.classIds })))};
  var CONTRACTS = ${JSON.stringify(allContracts.map(c => ({ id:c.id, projectId:c.projectId, amount:c.amount, recoveryCap:c.recoveryCap, status:c.status })))};
  var REP_RECORDS = ${JSON.stringify(allRepRecords.map(r => ({ contractId:r.contractId, cumulativeShare:r.cumulativeShare })))};

  // All projects now loaded from D1 via SSR — no localStorage merge needed
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}

  // Find teacher for current user
  var myClassId = (u && u.classId) ? u.classId : '';
  var myTeacher = null;
  if(myClassId){
    myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
  }

  // Relation tag function
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

  // Relevance score for smart sorting
  function getRelevanceScore(p){
    var score = 0;
    if(p.initiatorClassId === myClassId) score += 30;
    if(myTeacher && p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1) score += 20;
    if(p.status === 'open') score += 10;
    if(p.status === 'active') score += 5;
    return score;
  }

  // Tag style maps
  var tagStyles = {
    gold: 'background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;',
    green: 'background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;',
    gray: 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;'
  };

  var listEl = document.getElementById('project-list');
  var emptyEl = document.getElementById('empty-state');
  var fInd = document.getElementById('filter-industry');
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
      // Completed project extra line
      var completedLine = '';
      if(p.status === 'completed'){
        // Calculate actual return from repayment records
        var pContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id; });
        var totalInvested = 0, totalRepaid = 0;
        pContracts.forEach(function(c){
          totalInvested += c.amount;
          var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
          if(recs.length > 0){
            totalRepaid += recs[recs.length-1].cumulativeShare;
          }
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

  // ── Inline Hint for relation tags (replaces Coach Mark) ──
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
    hint.innerHTML = '<span style="flex-shrink:0;">🏷️</span>'
      + '<div style="flex:1;font-size:12px;color:#92400E;line-height:1.5;">绿色标签表示同班同学，金色是老师推荐的项目，帮你快速识别。'
      + '<button id="hall-hint-dismiss" style="color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-left:4px;padding:0;font-size:12px;">知道了</button></div>';
    listEl.insertBefore(hint, listEl.firstChild);
    document.getElementById('hall-hint-dismiss').addEventListener('click', function(){
      localStorage.setItem(hintKey, 'true');
      hint.style.opacity = '0'; hint.style.transition = 'opacity 0.3s';
      setTimeout(function(){ hint.remove(); }, 300);
    });
  }, 800);

  // ── Nudge A: Browse 30s without clicking any project ──
  var hallNudgeTimer = null;
  function cancelHallNudge(){ clearTimeout(hallNudgeTimer); hallNudgeTimer = null; }
  if (!localStorage.getItem('zlc_nudge_hall_browse')) {
    hallNudgeTimer = setTimeout(function(){ showNudge('\\uD83D\\uDCA1', '点击任意项目可以查看详细条款和预估回报', 'hall_browse'); }, 30000);
    // Cancel on any project card click
    document.addEventListener('click', function(e){
      if(e.target.closest('a[href^="/projects/"]')) cancelHallNudge();
    });
  }
  // Cleanup on unload
  window.addEventListener('beforeunload', cancelHallNudge);
})();
`}} />
    </div>,
    { title: '中流通 - 项目大厅' }
  )
})
}
