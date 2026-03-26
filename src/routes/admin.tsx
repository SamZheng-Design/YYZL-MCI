// Route: /admin
import { Hono } from 'hono'
import {
  GlobalScripts, LogoSVG, Navbar, TabBar, statusLabel, AuthCheckScript,
} from '../components'
import type { HonoEnv } from '../types'

export function registerAdminRoute(app: Hono<HonoEnv>) {
app.get('/admin', async (c) => {
  // ═══ Phase 1C: NO DB calls — pure HTML skeleton ═══
  return c.render(
    <div class="app-container has-tabbar" style="background:#F8F7F6;">
      <AuthCheckScript />
      {/* Admin-only: redirect non-admin users */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
    if(!cu || cu.role !== 'admin'){ window.location.replace('/'); return; }
  } catch(e){ window.location.replace('/login'); }
})();
`}} />
      <GlobalScripts />

      {/* Admin Navbar */}
      <nav class="app-navbar" style="background:rgba(255,255,255,0.97);border-bottom:0.5px solid rgba(0,0,0,0.06);">
        <div style="display:flex;align-items:center;gap:2px;">
          <a href="/admin" style="text-decoration:none;display:flex;align-items:center;gap:2px;">
            <LogoSVG size={24} />
            <span style="font-size:17px;font-weight:700;color:#B91C1C;font-family:'Noto Sans SC',sans-serif;">中流通</span>
          </a>
          <span style="font-size:11px;background:rgba(185,28,28,0.1);color:#B91C1C;border-radius:4px;padding:2px 8px;margin-left:8px;">管理后台</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          {/* Demo guide button for admin (Task 5) */}
          <span onclick="window.location.href='/guide/admin'" style="font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.08);border-radius:8px;padding:4px 10px;cursor:pointer;">📖 演示</span>
          <div style="position:relative;" id="admin-nav-user-wrap">
          <button id="admin-nav-user-btn" style="width:32px;height:32px;border-radius:50%;background:#B91C1C;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" />
          <div id="admin-nav-user-dropdown" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);min-width:200px;padding:8px 0;z-index:1000;">
            <div style="padding:16px;border-bottom:1px solid #F5F5F4;">
              <div id="admin-dd-name" style="font-size:15px;font-weight:600;color:#1C1917;" />
              <div style="font-size:12px;color:#78716C;margin-top:2px;">管理员</div>
            </div>
            <div id="admin-dd-switch" style="padding:12px 16px;font-size:14px;color:#44403C;cursor:pointer;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='transparent'">🔄 切换账号</div>
            <div style="border-top:1px solid #F5F5F4;margin:4px 0;" />
            <div id="admin-dd-logout" style="padding:12px 16px;font-size:14px;color:#44403C;cursor:pointer;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='transparent'">🚪 退出登录</div>
          </div>
        </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div id="admin-tabs" style="position:sticky;top:52px;z-index:40;background:rgba(255,255,255,0.97);border-bottom:1px solid rgba(0,0,0,0.06);display:flex;overflow-x:auto;white-space:nowrap;padding:0 16px;-webkit-overflow-scrolling:touch;">
        <button class="admin-tab admin-tab-active" data-tab="overview">总览</button>
        <button class="admin-tab" data-tab="settlement">分账</button>
        <button class="admin-tab" data-tab="members">学员</button>
        <button class="admin-tab" data-tab="classes">班级</button>
        <button class="admin-tab" data-tab="teachers">老师</button>
        <button class="admin-tab" data-tab="projects">项目</button>
        <button class="admin-tab" data-tab="review">审核</button>
        <button class="admin-tab" data-tab="invites">邀请码</button>
        <button class="admin-tab" data-tab="audit">日志</button>
      </div>

      <main class="max-w-lg mx-auto pb-4 dk-admin-main">
        {/* Tab Content Panels */}
        <div id="tab-overview" class="admin-tab-panel" style="opacity:1;">
          {/* Skeleton for overview */}
          <div class="animate-pulse" style="padding:20px 16px;">
            <div style="height:15px;background:#F5F5F4;border-radius:6px;width:60%;margin-bottom:16px;" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              {[1,2,3,4,5,6].map(i => (
                <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                  <div style="height:28px;background:#F5F5F4;border-radius:8px;width:50%;margin-bottom:8px;" />
                  <div style="height:12px;background:#F5F5F4;border-radius:4px;width:40%;" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="tab-settlement" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-members" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-classes" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-teachers" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-projects" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-review" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-invites" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-audit" class="admin-tab-panel" style="display:none;opacity:0;" />
      </main>

      <TabBar active="admin" />

      {/* Batch Register Modal Overlay */}
      <div id="batch-register-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1100;align-items:center;justify-content:center;" />

      {/* Member Detail Modal Overlay */}
      <div id="member-detail-overlay" class="dk-modal-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1100;" />

      <style dangerouslySetInnerHTML={{ __html: `
.admin-tab{padding:14px 16px;font-size:14px;font-weight:500;color:#78716C;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;transition:color 0.2s;}
.admin-tab-active{color:#B91C1C;border-bottom:2px solid #B91C1C;font-weight:600;}
.admin-tab-panel{transition:opacity 200ms ease;}
`}} />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  // ── Auth: check zlc_current_user for role ──
  var cu = null;
  try { cu = JSON.parse(localStorage.getItem('zlc_current_user')); } catch(e){}
  if (!cu || cu.role !== 'admin') { window.location.href = '/'; return; }

  // Also get full user data
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) u = cu;

  // ── Data loaded via API (Phase 1C) ──
  var MOCK_MEMBERS = [];
  var MOCK_PROJECTS = [];
  var MOCK_CONTRACTS = [];
  var MOCK_REP_RECORDS = [];
  var MOCK_TEACHERS = [];

  function getMembers(){ return MOCK_MEMBERS.slice(); }
  function saveMembers(members){}

  // ── Admin nav dropdown ──
  var navBtn = document.getElementById('admin-nav-user-btn');
  var navDD = document.getElementById('admin-nav-user-dropdown');
  var navName = document.getElementById('admin-dd-name');
  if(navBtn) navBtn.textContent = (u.name || cu.name || '?').charAt(0);
  if(navName) navName.textContent = u.name || cu.name || '';
  var ddOpen = false;
  if(navBtn) navBtn.addEventListener('click',function(e){e.stopPropagation();ddOpen=!ddOpen;navDD.style.display=ddOpen?'block':'none';});
  document.addEventListener('click',function(e){if(ddOpen&&!navDD.contains(e.target)&&e.target!==navBtn){ddOpen=false;navDD.style.display='none';}});
  var switchBtn=document.getElementById('admin-dd-switch');
  var logoutBtn=document.getElementById('admin-dd-logout');
  if(switchBtn) switchBtn.addEventListener('click',function(){localStorage.removeItem('zlc_current_user');localStorage.removeItem('zlc_user');localStorage.removeItem('zlc_token');window.location.href='/login';});
  if(logoutBtn) logoutBtn.addEventListener('click',function(){localStorage.removeItem('zlc_current_user');localStorage.removeItem('zlc_user');localStorage.removeItem('zlc_token');window.location.href='/login';});

  // ── Tab Switching with hash ──
  var tabs = document.querySelectorAll('.admin-tab');
  var panels = {
    overview: document.getElementById('tab-overview'),
    settlement: document.getElementById('tab-settlement'),
    members: document.getElementById('tab-members'),
    classes: document.getElementById('tab-classes'),
    teachers: document.getElementById('tab-teachers'),
    projects: document.getElementById('tab-projects'),
    review: document.getElementById('tab-review'),
    invites: document.getElementById('tab-invites'),
    audit: document.getElementById('tab-audit')
  };
  var currentTab = 'overview';
  var rendered = {};

  function switchTab(tabName){
    if(tabName === currentTab) return;
    tabs.forEach(function(t){t.classList.remove('admin-tab-active');if(t.dataset.tab===tabName)t.classList.add('admin-tab-active');});
    panels[currentTab].style.opacity='0';
    setTimeout(function(){
      panels[currentTab].style.display='none';
      currentTab = tabName;
      if(!rendered[tabName]){ renderTab(tabName); rendered[tabName]=true; }
      panels[tabName].style.display='block';
      requestAnimationFrame(function(){ panels[tabName].style.opacity='1'; });
    },200);
    window.location.hash = tabName;
  }

  tabs.forEach(function(t){t.addEventListener('click',function(){switchTab(t.dataset.tab);});});

  // Check hash on load
  var initHash = window.location.hash.replace('#','');
  if(initHash && panels[initHash]){
    tabs.forEach(function(t){t.classList.remove('admin-tab-active');if(t.dataset.tab===initHash)t.classList.add('admin-tab-active');});
    panels['overview'].style.display='none';panels['overview'].style.opacity='0';
    currentTab = initHash;
  }

  // ── Render Tabs ──
  function renderTab(name){
    if(name==='overview') renderOverview();
    else if(name==='settlement') renderSettlementTab();
    else if(name==='members') renderMembers();
    else if(name==='classes') renderClasses();
    else if(name==='teachers') renderTeachersTab();
    else if(name==='projects') renderProjectsTab();
    else if(name==='review') renderReviewTab();
    else if(name==='invites') renderInvitesTab();
    else if(name==='audit') renderAuditTab();
  }

  // ── Load data from APIs then render ──
  Promise.all([
    fetch('/api/data/members').then(function(r){return r.json();}),
    fetch('/api/data/teachers').then(function(r){return r.json();}),
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/repayment-records').then(function(r){return r.json();})
  ]).then(function(results){
    MOCK_MEMBERS = results[0].ok ? results[0].data : [];
    MOCK_TEACHERS = results[1].ok ? results[1].data : [];
    MOCK_PROJECTS = results[2].ok ? results[2].data : [];
    MOCK_CONTRACTS = results[3].ok ? results[3].data : [];
    MOCK_REP_RECORDS = results[4].ok ? results[4].data : [];

    // Render initial tab
    renderOverview(); rendered['overview']=true;
    if(currentTab !== 'overview'){ renderTab(currentTab); rendered[currentTab]=true; panels[currentTab].style.display='block'; panels[currentTab].style.opacity='1'; }
  }).catch(function(err){
    console.error('Failed to load admin data:', err);
    panels.overview.innerHTML = '<div style="text-align:center;padding:40px;"><p style="color:#DC2626;font-size:14px;">数据加载失败，请刷新重试</p></div>';
  });

  // ══════════════════════════════════
  // TAB: Overview (总览)
  // ══════════════════════════════════
  function renderOverview(){
    var members = getMembers();
    var studentCount = members.filter(function(m){return m.role!=='admin';}).length;
    var teacherCount = MOCK_TEACHERS.length;
    var projectCount = MOCK_PROJECTS.length;
    var totalAmount = MOCK_PROJECTS.reduce(function(s,p){return s+(p.targetAmount||0);},0);
    var totalRepaid = MOCK_REP_RECORDS.reduce(function(s,r){return s+(r.shareAmount||0);},0);
    var activeProjects = MOCK_PROJECTS.filter(function(p){return p.status==='open'||p.status==='active';}).length;

    // Status distribution
    var statusCounts = {draft:0,open:0,active:0,completed:0,terminated:0};
    MOCK_PROJECTS.forEach(function(p){if(statusCounts[p.status]!==undefined)statusCounts[p.status]++;else statusCounts[p.status]=1;});
    var total = MOCK_PROJECTS.length || 1;
    var statusColors = {draft:'#D6D3D1',open:'#3B82F6',active:'#D4A853',completed:'#16A34A',terminated:'#DC2626'};
    var statusLabels = {draft:'草稿',open:'募集中',active:'运营中',completed:'已完成',terminated:'已终止'};

    var barHTML = '';
    var legendHTML = '';
    ['draft','open','active','completed','terminated'].forEach(function(s){
      if(statusCounts[s]>0){
        var pct = (statusCounts[s]/total*100);
        barHTML += '<div style="width:'+pct+'%;height:100%;background:'+statusColors[s]+';"></div>';
      }
      legendHTML += '<div style="display:flex;align-items:center;gap:4px;"><div style="width:10px;height:10px;border-radius:2px;background:'+statusColors[s]+';flex-shrink:0;"></div><span>'+(statusLabels[s]||s)+' '+statusCounts[s]+'</span></div>';
    });

    // Pending review count
    var pendingReviewCount = MOCK_PROJECTS.filter(function(p){return p.status==='pending_review';}).length;
    // Pending registration count
    var pendingRegCount = members.filter(function(m){return m.status==='pending';}).length;

    var html = '<div style="padding:20px 16px 12px;"><p style="font-size:15px;color:#44403C;">管理员您好，以下是平台运营概况</p></div>';

    // KPI Cards 2x3
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px;">';
    var kpis = [
      {val:studentCount,label:'认证学员',color:'#B91C1C',id:'kpi-students'},
      {val:teacherCount,label:'班级老师',color:'#D4A853',id:'kpi-teachers'},
      {val:projectCount,label:'全部项目',color:'#1C1917',id:'kpi-projects'},
      {val:'¥'+totalAmount+'万',label:'累计融资',color:'#B91C1C',id:'kpi-amount',raw:totalAmount},
      {val:'¥'+totalRepaid.toFixed(1)+'万',label:'累计回款',color:'#16A34A',id:'kpi-repaid',raw:totalRepaid},
      {val:activeProjects,label:'进行中',color:'#3B82F6',id:'kpi-active'}
    ];
    kpis.forEach(function(k){
      html += '<div style="background:white;border-radius:16px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">'
        +'<div id="'+k.id+'" style="font-size:28px;font-weight:800;color:'+k.color+';">0</div>'
        +'<div style="font-size:12px;color:#A8A29E;margin-top:4px;">'+k.label+'</div></div>';
    });
    html += '</div>';

    // Pending alerts
    if(pendingRegCount > 0){
      html += '<div style="margin:16px 16px 0;padding:12px 16px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="switchTab(\\'members\\')">';
      html += '<span style="font-size:20px;">👤</span>';
      html += '<span style="font-size:14px;color:#92400E;font-weight:600;">有 ' + pendingRegCount + ' 位学员待审核注册</span>';
      html += '<i class="fas fa-chevron-right" style="margin-left:auto;color:#92400E;font-size:12px;"></i>';
      html += '</div>';
    }
    if(pendingReviewCount > 0){
      html += '<div style="margin:'+(pendingRegCount>0?'8':'16')+'px 16px 0;padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="switchTab(\\'review\\')">';
      html += '<span style="font-size:20px;">⚠️</span>';
      html += '<span style="font-size:14px;color:#B91C1C;font-weight:600;">有 ' + pendingReviewCount + ' 个项目待审核</span>';
      html += '<i class="fas fa-chevron-right" style="margin-left:auto;color:#B91C1C;font-size:12px;"></i>';
      html += '</div>';
    }

    // Status bar
    html += '<div style="margin-top:20px;padding:0 16px;">';
    html += '<div style="height:32px;border-radius:8px;overflow:hidden;background:#F5F5F4;width:100%;display:flex;">'+barHTML+'</div>';
    html += '<div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;font-size:11px;color:#78716C;">'+legendHTML+'</div>';
    html += '</div>';

    // Recent activities — load from audit log API
    html += '<div style="margin-top:24px;padding:0 16px;"><div style="font-size:16px;font-weight:600;color:#1C1917;">最近平台动态</div></div>';
    html += '<div id="overview-activities" style="margin-top:8px;"><div style="text-align:center;padding:20px;color:#A8A29E;font-size:13px;">加载中...</div></div>';

    panels.overview.innerHTML = html;

    // Animate KPI numbers (0→target, 600ms, ease-out cubic)
    kpis.forEach(function(k){
      var el = document.getElementById(k.id);
      if(!el) return;
      var target = typeof k.val === 'number' ? k.val : (k.raw !== undefined ? k.raw : parseFloat(String(k.val).replace(/[^0-9.]/g,''))||0);
      var isDecimal = String(target).indexOf('.')!==-1;
      var prefix = typeof k.val==='string'&&k.val.indexOf('¥')===0?'¥':'';
      var suffix = typeof k.val==='string'&&k.val.indexOf('万')>0?'万':'';
      var start=0,startTime=performance.now();
      function anim(now){
        var elapsed=now-startTime;var progress=Math.min(elapsed/600,1);var eased=1-Math.pow(1-progress,3);
        var current=start+(target-start)*eased;
        el.textContent=prefix+(isDecimal?current.toFixed(1):Math.round(current))+suffix;
        if(progress<1)requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    });

    // Load recent activities from audit logs
    fetch('/api/data/audit-logs').then(function(r){return r.json();}).then(function(res){
      var logs = (res.ok ? res.data : []).slice(0, 8);
      var actEl = document.getElementById('overview-activities');
      if(!actEl || logs.length === 0){ if(actEl) actEl.innerHTML = '<div style="text-align:center;padding:20px;color:#A8A29E;font-size:13px;">暂无动态</div>'; return; }
      var iconMap = {create_project:'📁',review_project:'✅',participate_project:'💰',sign_contract:'✍️',submit_revenue_report:'📊',batch_register:'👥',create_referral:'🤝',settlement_import:'📥',generate_invite:'🎟️'};
      var actionMap = {create_project:'发起了新项目',review_project:'审核了项目',participate_project:'参与了投资',sign_contract:'签署了合同',submit_revenue_report:'提交了营收报告',batch_register:'批量注册了学员',create_referral:'发起了引荐',settlement_import:'导入了分账数据',generate_invite:'生成了邀请码'};
      var members = getMembers();
      actEl.innerHTML = logs.map(function(l){
        var icon = iconMap[l.action] || '📌';
        var text = actionMap[l.action] || l.action;
        var user = members.find(function(m){ return m.id === l.userId; });
        var userName = user ? user.name : (l.userId || '系统');
        var entityInfo = l.entityId ? ' · ' + (l.entityType||'') + ': ' + l.entityId : '';
        var timeStr = l.createdAt || '';
        return '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;gap:10px;">'
          +'<span style="font-size:20px;flex-shrink:0;">'+icon+'</span>'
          +'<span style="flex:1;font-size:13px;color:#44403C;">'+userName+' '+text+entityInfo+'</span>'
          +'<span style="font-size:12px;color:#A8A29E;white-space:nowrap;flex-shrink:0;">'+timeStr+'</span>'
          +'</div>';
      }).join('');
    }).catch(function(){});
  }

  // ══════════════════════════════════
  // TAB: Settlement (分账管理)
  // ══════════════════════════════════
  function renderSettlementTab(){
    var html = '<div style="padding:16px;">';

    // Header + Import button
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<div><div style="font-size:18px;font-weight:700;color:#1C1917;">分账管理</div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:2px;">导入分账数据、查看历史批次</div></div>';
    html += '<button id="btn-import-csv" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(185,28,28,0.25);"><span style="font-size:16px;">📁</span> 导入CSV</button>';
    html += '</div>';

    // CSV Template tip
    html += '<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:14px;margin-bottom:16px;">';
    html += '<div style="font-size:13px;font-weight:600;color:#92400E;margin-bottom:6px;">📋 CSV模板格式</div>';
    html += '<div style="font-size:12px;color:#A16207;line-height:1.6;">列顺序：结算日期, 账期, 项目ID, 项目名称, 总营收, 分账比例, 分账总额, 投资人ID, 投资人姓名, 分账金额, 到账状态</div>';
    html += '<button id="btn-download-template" style="margin-top:8px;background:white;border:1px solid #FDE68A;border-radius:6px;padding:4px 12px;font-size:12px;color:#92400E;cursor:pointer;">下载模板</button>';
    html += '</div>';

    // Import area (hidden by default)
    html += '<div id="csv-import-area" style="display:none;background:white;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<div style="font-size:15px;font-weight:600;color:#1C1917;margin-bottom:12px;">选择CSV文件</div>';
    html += '<input type="file" id="csv-file-input" accept=".csv,.txt" style="font-size:14px;margin-bottom:12px;width:100%;">';
    html += '<div id="csv-preview" style="display:none;">';
    html += '<div style="font-size:14px;font-weight:600;color:#1C1917;margin-bottom:8px;">预览 <span id="csv-row-count" style="color:#B91C1C;"></span></div>';
    html += '<div id="csv-table-wrap" style="max-height:300px;overflow:auto;border:1px solid #E7E5E4;border-radius:8px;margin-bottom:12px;"></div>';
    html += '<div id="csv-warnings" style="display:none;background:#FEF2F2;border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px;color:#B91C1C;"></div>';
    html += '<div style="display:flex;gap:10px;">';
    html += '<button id="csv-confirm-import" style="flex:1;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;">确认导入</button>';
    html += '<button id="csv-cancel" style="flex:1;background:#F5F5F4;color:#78716C;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;">取消</button>';
    html += '</div></div></div>';

    // Summary stats
    var totalSettlements = MOCK_REP_RECORDS.length;
    var totalShareAmount = 0;
    MOCK_REP_RECORDS.forEach(function(r){totalShareAmount += (r.shareAmount||0);});
    var involvedProjects = [];
    MOCK_REP_RECORDS.forEach(function(r){if(involvedProjects.indexOf(r.projectName)===-1)involvedProjects.push(r.projectName);});

    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">';
    html += '<div style="background:white;border-radius:12px;padding:14px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">';
    html += '<div style="font-size:22px;font-weight:800;color:#B91C1C;">'+totalSettlements+'</div>';
    html += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">回款记录</div></div>';
    html += '<div style="background:white;border-radius:12px;padding:14px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">';
    html += '<div style="font-size:22px;font-weight:800;color:#16A34A;">¥'+totalShareAmount.toFixed(1)+'万</div>';
    html += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">累计分账</div></div>';
    html += '<div style="background:white;border-radius:12px;padding:14px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">';
    html += '<div style="font-size:22px;font-weight:800;color:#1C1917;">'+involvedProjects.length+'</div>';
    html += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">涉及项目</div></div>';
    html += '</div>';

    // Recent records grouped by project
    html += '<div style="font-size:16px;font-weight:600;color:#1C1917;margin-bottom:12px;">近期分账记录</div>';
    var recentRecords = MOCK_REP_RECORDS.slice(0,30);
    var projectGroups = {};
    recentRecords.forEach(function(r){
      if(!projectGroups[r.projectName]) projectGroups[r.projectName] = [];
      projectGroups[r.projectName].push(r);
    });

    Object.keys(projectGroups).forEach(function(pn){
      var items = projectGroups[pn];
      var groupTotal = 0;
      items.forEach(function(it){groupTotal += (it.shareAmount||0);});
      html += '<div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
      html += '<span style="font-size:14px;font-weight:600;color:#1C1917;">'+pn+'</span>';
      html += '<span style="font-size:13px;font-weight:700;color:#16A34A;">¥'+groupTotal.toFixed(2)+'万</span>';
      html += '</div>';
      items.forEach(function(it){
        var member = MOCK_MEMBERS.find(function(m){return m.id===it.participantId;}) || {name:'?'};
        var statusColor = it.arrivalStatus==='arrived'?'#16A34A':'#F59E0B';
        var statusText = it.arrivalStatus==='arrived'?'已到账':'处理中';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid #F5F5F4;font-size:13px;">';
        html += '<div><span style="color:#1C1917;">'+member.name+'</span><span style="color:#A8A29E;margin-left:8px;">'+it.date+'</span></div>';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="color:#1C1917;font-weight:600;">¥'+it.shareAmount+'万</span>';
        html += '<span style="width:6px;height:6px;border-radius:50%;background:'+statusColor+';"></span>';
        html += '<span style="font-size:11px;color:'+statusColor+';">'+statusText+'</span>';
        html += '</div></div>';
      });
      html += '</div>';
    });
    html += '</div>';
    panels.settlement.innerHTML = html;

    // ── Event: Import CSV Button ──
    document.getElementById('btn-import-csv').addEventListener('click',function(){
      document.getElementById('csv-import-area').style.display='block';
      document.getElementById('csv-import-area').scrollIntoView({behavior:'smooth'});
    });

    // ── Event: Download template ──
    document.getElementById('btn-download-template').addEventListener('click',function(){
      var header = '结算日期,账期,项目ID,项目名称,总营收(万),分账比例(%),分账总额(万),投资人ID,投资人姓名,分账金额(万),到账状态';
      var sample = '2026-03-15,2026年3月,p-001,华南餐饮连锁联营,180,8.5,15.3,m-002,李芳华,5.1,arrived';
      var csv = header+'\\n'+sample+'\\n';
      var blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');a.href=url;a.download='分账导入模板.csv';a.click();
      URL.revokeObjectURL(url);
      showToast('模板已下载','success');
    });

    // ── Event: File select ──
    var parsedRows = [];
    document.getElementById('csv-file-input').addEventListener('change',function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(evt){
        var text = evt.target.result;
        var lines = text.split(/\\n|\\r\\n?/).filter(function(l){return l.trim();});
        if(lines.length<2){showToast('CSV文件至少需要表头+1行数据','error');return;}
        // Skip header
        parsedRows = [];
        var warnings = [];
        for(var i=1;i<lines.length;i++){
          var cols = lines[i].split(',');
          if(cols.length<10){warnings.push('第'+(i+1)+'行列数不足('+cols.length+'/11)');continue;}
          parsedRows.push({
            settlement_date: cols[0].trim(),
            period: cols[1].trim(),
            project_id: cols[2].trim(),
            project_name: cols[3].trim(),
            total_revenue: parseFloat(cols[4])||0,
            share_rate: parseFloat(cols[5])||0,
            total_share_amount: parseFloat(cols[6])||0,
            participant_id: cols[7].trim(),
            participant_name: cols[8].trim(),
            share_amount: parseFloat(cols[9])||0,
            arrival_status: (cols[10]||'arrived').trim()
          });
        }
        // Show preview
        document.getElementById('csv-preview').style.display='block';
        document.getElementById('csv-row-count').textContent = parsedRows.length+'条记录';
        var tableHtml = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
        tableHtml += '<tr style="background:#F5F5F4;"><th style="padding:6px;text-align:left;">日期</th><th>项目</th><th>投资人</th><th style="text-align:right;">分账(万)</th><th>状态</th></tr>';
        parsedRows.slice(0,20).forEach(function(r){
          tableHtml += '<tr style="border-bottom:1px solid #F5F5F4;">';
          tableHtml += '<td style="padding:6px;">'+r.settlement_date+'</td>';
          tableHtml += '<td>'+r.project_name+'</td>';
          tableHtml += '<td>'+r.participant_name+'</td>';
          tableHtml += '<td style="text-align:right;font-weight:600;">'+r.share_amount+'</td>';
          tableHtml += '<td>'+r.arrival_status+'</td></tr>';
        });
        if(parsedRows.length>20) tableHtml += '<tr><td colspan="5" style="padding:8px;text-align:center;color:#A8A29E;">...还有'+(parsedRows.length-20)+'条</td></tr>';
        tableHtml += '</table>';
        document.getElementById('csv-table-wrap').innerHTML = tableHtml;

        if(warnings.length>0){
          document.getElementById('csv-warnings').style.display='block';
          document.getElementById('csv-warnings').innerHTML = '⚠️ '+warnings.join('<br>');
        } else {
          document.getElementById('csv-warnings').style.display='none';
        }
      };
      reader.readAsText(file);
    });

    // ── Event: Confirm import ──
    document.getElementById('csv-confirm-import').addEventListener('click',function(){
      if(parsedRows.length===0){showToast('没有可导入的数据','error');return;}
      var btn = this;
      btn.disabled=true;btn.textContent='导入中...';
      fetch('/api/admin/settlement/import',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({rows:parsedRows, fileName:document.getElementById('csv-file-input').files[0].name, adminId:cu.id})
      }).then(function(r){return r.json();}).then(function(d){
        btn.disabled=false;btn.textContent='确认导入';
        if(d.ok){
          showToast('成功导入 '+d.data.processedCount+'/'+d.data.totalRecords+' 条记录','success');
          if(d.data.warnings && d.data.warnings.length>0){
            showToast('⚠️ '+d.data.warnings.length+' 条警告','info',6000);
          }
          document.getElementById('csv-import-area').style.display='none';
          // Reload repayment data
          fetch('/api/data/repayment-records').then(function(r){return r.json();}).then(function(rd){
            if(rd.ok) MOCK_REP_RECORDS = rd.data;
            rendered['settlement']=false;renderSettlementTab();rendered['settlement']=true;
          });
        } else {
          showToast(d.error||'导入失败','error');
        }
      }).catch(function(){
        btn.disabled=false;btn.textContent='确认导入';
        showToast('网络错误','error');
      });
    });

    // ── Event: Cancel ──
    document.getElementById('csv-cancel').addEventListener('click',function(){
      document.getElementById('csv-import-area').style.display='none';
      parsedRows = [];
    });
  }

  // ══════════════════════════════════
  // TAB: Members (学员)
  // ══════════════════════════════════
  var memberSearchTerm = '';
  var memberClassFilter = '全部';

  function renderMembers(){
    var allMem = getMembers();
    var members = allMem.filter(function(m){return m.role!=='admin' && m.status!=='pending';});
    var pendingMembers = allMem.filter(function(m){return m.status==='pending';});

    // Extract unique class names
    var classNames = ['全部'];
    members.forEach(function(m){if(m.className&&classNames.indexOf(m.className)===-1)classNames.push(m.className);});

    // Filter
    var filtered = members;
    if(memberClassFilter!=='全部') filtered = filtered.filter(function(m){return m.className===memberClassFilter;});
    if(memberSearchTerm){
      var term = memberSearchTerm.toLowerCase();
      filtered = filtered.filter(function(m){
        return m.name.toLowerCase().indexOf(term)!==-1 || m.phone.indexOf(term)!==-1;
      });
    }

    var html = '';

    // ── Pending Registrations Section ──
    if(pendingMembers.length > 0){
      html += '<div style="margin:12px 16px;background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:1px solid #FDE68A;border-radius:14px;padding:16px;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
      html += '<span style="font-size:14px;font-weight:600;color:#92400E;"><i class="fas fa-user-clock" style="margin-right:6px;"></i>待审核注册 <span style="background:#F59E0B;color:white;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">'+pendingMembers.length+'</span></span>';
      html += '</div>';
      pendingMembers.forEach(function(pm){
        var bio = pm.bio || '';
        html += '<div style="background:white;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">';
        html += '<div style="width:40px;height:40px;background:#FEF3C7;color:#B45309;font-weight:700;font-size:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+pm.name.charAt(0)+'</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-size:14px;font-weight:600;color:#1C1917;">'+pm.name+'</div>';
        html += '<div style="font-size:12px;color:#78716C;margin-top:2px;">'+pm.phone+'</div>';
        if(bio) html += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">'+bio+'</div>';
        html += '</div>';
        html += '<div style="display:flex;gap:6px;flex-shrink:0;">';
        html += '<button class="pending-approve-btn" data-uid="'+pm.id+'" data-uname="'+pm.name+'" style="background:#16A34A;color:white;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;">通过</button>';
        html += '<button class="pending-reject-btn" data-uid="'+pm.id+'" data-uname="'+pm.name+'" style="background:#F5F5F4;color:#78716C;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:500;cursor:pointer;">拒绝</button>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    // Search + Action buttons
    html += '<div style="padding:16px 16px 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
    html += '<input id="member-search" type="text" placeholder="搜索学员姓名或手机号" value="'+(memberSearchTerm||'')+'" style="flex:1;min-width:150px;background:#F5F5F4;border:none;border-radius:12px;padding:12px 16px;font-size:14px;outline:none;" />';
    html += '<button id="add-single-member-btn" style="background:#FAFAF9;border:1.5px solid #B91C1C;color:#B91C1C;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;"><i class="fas fa-user-plus" style="margin-right:4px;"></i>新增</button>';
    html += '<button id="batch-register-btn" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;"><i class="fas fa-file-import" style="margin-right:4px;"></i>批量</button>';
    html += '<button id="export-members-btn" style="background:#FAFAF9;border:1px solid #E7E5E4;color:#57534E;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;"><i class="fas fa-download" style="margin-right:4px;"></i>导出</button>';
    html += '</div>';

    // Class filter tags
    html += '<div style="display:flex;gap:8px;padding:12px 16px;overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap;">';
    classNames.forEach(function(cn){
      var isActive = memberClassFilter === cn;
      var style = isActive ? 'background:#B91C1C;color:white;' : 'background:#F5F5F4;color:#57534E;';
      html += '<button class="member-class-tag" data-class="'+cn+'" style="'+style+'border-radius:20px;padding:6px 14px;font-size:13px;border:none;cursor:pointer;white-space:nowrap;">'+cn+'</button>';
    });
    html += '</div>';

    // Member list
    if(filtered.length === 0){
      html += '<div style="text-align:center;padding:60px 20px;"><i class="fas fa-user-slash" style="font-size:40px;color:#D6D3D1;display:block;margin-bottom:12px;"></i><p style="font-size:14px;color:#78716C;">没有找到符合条件的学员</p></div>';
    } else {
      filtered.forEach(function(m){
        var maskedPhone = m.phone.slice(0,3)+'****'+m.phone.slice(7);
        var initiated = MOCK_PROJECTS.filter(function(p){return p.ownerId===m.id;}).length;
        var participated = MOCK_CONTRACTS.filter(function(c){return c.participantId===m.id;}).length;
        var investSum = MOCK_CONTRACTS.filter(function(c){return c.participantId===m.id;}).reduce(function(s,c){return s+c.amount;},0);
        var isInactive = m.status === 'inactive';

        html += '<div class="member-card-item" data-member-id="'+m.id+'" style="margin:8px 16px;background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);cursor:pointer;display:flex;align-items:center;gap:14px;'+(isInactive?'opacity:0.5;':'')+'">';
        html += '<div style="width:48px;height:48px;background:'+(isInactive?'#E7E5E4':'#FEE2E2')+';color:'+(isInactive?'#A8A29E':'#B91C1C')+';font-weight:700;font-size:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+m.name.charAt(0)+'</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span style="font-size:15px;font-weight:600;color:#1C1917;">'+m.name+'</span>';
        html += '<span style="font-size:11px;background:#F5F5F4;color:#78716C;border-radius:6px;padding:2px 8px;">'+(m.className||m.cohort||'')+'</span>';
        if(isInactive) html += '<span style="font-size:10px;background:#FEE2E2;color:#DC2626;border-radius:4px;padding:1px 6px;">已禁用</span>';
        html += '</div>';
        html += '<div style="font-size:13px;color:#A8A29E;margin-top:4px;">'+maskedPhone+'</div>';
        html += '<div style="margin-top:8px;font-size:12px;color:#78716C;display:flex;gap:16px;">'
          +'<span>发起 '+initiated+'</span><span>参与 '+participated+'</span><span>投资 ¥'+investSum+'万</span></div>';
        html += '</div>';
        html += '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">';
        html += '<button class="reset-pw-btn" data-uid="'+m.id+'" data-uname="'+m.name+'" style="font-size:11px;color:#A8A29E;background:#F5F5F4;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;" title="重置密码">🔑</button>';
        html += '<button class="toggle-status-btn" data-uid="'+m.id+'" data-uname="'+m.name+'" data-status="'+m.status+'" style="font-size:10px;color:'+(isInactive?'#16A34A':'#DC2626')+';background:'+(isInactive?'#ECFDF5':'#FEF2F2')+';border:none;border-radius:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;">'+(isInactive?'启用':'禁用')+'</button>';
        html += '</div>';
        html += '</div>';
      });
      html += '<div style="font-size:13px;color:#A8A29E;text-align:center;padding:16px;">共 '+filtered.length+' 位学员</div>';
    }

    panels.members.innerHTML = html;

    // ── Bind events ──
    var searchEl = document.getElementById('member-search');
    if(searchEl){
      searchEl.addEventListener('input',function(e){
        memberSearchTerm = e.target.value.trim();
        renderMembers();
      });
      searchEl.focus();
      searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
    }
    var batchBtn = document.getElementById('batch-register-btn');
    if(batchBtn) batchBtn.addEventListener('click', openBatchRegister);
    var addSingleBtn = document.getElementById('add-single-member-btn');
    if(addSingleBtn) addSingleBtn.addEventListener('click', openSingleMemberCreate);
    var exportBtn = document.getElementById('export-members-btn');
    if(exportBtn) exportBtn.addEventListener('click', exportMembersCSV);
    document.querySelectorAll('.member-class-tag').forEach(function(btn){
      btn.addEventListener('click',function(){
        memberClassFilter = btn.dataset.class;
        renderMembers();
      });
    });
    document.querySelectorAll('.member-card-item').forEach(function(card){
      card.addEventListener('click',function(e){
        if(e.target.closest && (e.target.closest('.reset-pw-btn') || e.target.closest('.toggle-status-btn'))) return;
        openMemberDetail(card.dataset.memberId);
      });
    });
    document.querySelectorAll('.reset-pw-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var uid = btn.dataset.uid;
        var uname = btn.dataset.uname;
        showConfirm({
          title: '重置密码',
          desc: '确定重置「' + uname + '」的密码？重置后会生成临时密码',
          onConfirm: function(){
            fetch('/api/admin/reset-password', {
              method:'POST',headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ adminId: u.id, targetUserId: uid })
            }).then(function(r){return r.json();}).then(function(res){
              if(res.ok){
                showToast('已重置，临时密码: ' + res.data.tempPassword, 'success', 10000);
              } else { showToast(res.error || '重置失败', 'error'); }
            }).catch(function(){ showToast('网络错误', 'error'); });
          }
        });
      });
    });
    // Toggle status buttons
    document.querySelectorAll('.toggle-status-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var uid = btn.dataset.uid;
        var uname = btn.dataset.uname;
        var curStatus = btn.dataset.status;
        var action = curStatus === 'active' ? '禁用' : '启用';
        showConfirm({
          title: action + '账号',
          desc: '确定' + action + '「' + uname + '」的账号？',
          onConfirm: function(){
            fetch('/api/admin/members/' + uid + '/toggle-status', {
              method:'POST',headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ adminId: u.id })
            }).then(function(r){return r.json();}).then(function(res){
              if(res.ok){
                showToast(res.message, 'success');
                refreshMembers();
              } else { showToast(res.error || '操作失败', 'error'); }
            }).catch(function(){ showToast('网络错误', 'error'); });
          }
        });
      });
    });
    // Pending approve/reject buttons
    document.querySelectorAll('.pending-approve-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var uid = btn.dataset.uid;
        var uname = btn.dataset.uname;
        btn.disabled = true; btn.textContent = '...';
        fetch('/api/admin/members/' + uid + '/approve', {
          method:'POST',headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ adminId: u.id })
        }).then(function(r){return r.json();}).then(function(res){
          if(res.ok){
            showToast('已通过 '+uname+' 的注册', 'success');
            refreshMembers();
          } else { showToast(res.error || '操作失败', 'error'); btn.disabled=false; btn.textContent='通过'; }
        }).catch(function(){ showToast('网络错误', 'error'); btn.disabled=false; btn.textContent='通过'; });
      });
    });
    document.querySelectorAll('.pending-reject-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var uid = btn.dataset.uid;
        var uname = btn.dataset.uname;
        showConfirm({
          title: '拒绝注册',
          desc: '确定拒绝「'+uname+'」的注册申请？此操作将删除其申请记录',
          onConfirm: function(){
            fetch('/api/admin/members/' + uid + '/reject', {
              method:'POST',headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ adminId: u.id })
            }).then(function(r){return r.json();}).then(function(res){
              if(res.ok){ showToast('已拒绝', 'success'); refreshMembers(); }
              else { showToast(res.error || '操作失败', 'error'); }
            }).catch(function(){ showToast('网络错误', 'error'); });
          }
        });
      });
    });
  }

  // ── Refresh members from API ──
  function refreshMembers(){
    fetch('/api/data/members').then(function(r){return r.json();}).then(function(md){
      if(md.ok) MOCK_MEMBERS = md.data;
      else if(Array.isArray(md)) MOCK_MEMBERS = md;
      renderMembers();
    }).catch(function(){ renderMembers(); });
  }

  // ── Single member create modal ──
  function openSingleMemberCreate(){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:420px;width:100%;overflow:hidden;">'
      +'<div style="background:linear-gradient(135deg,#B91C1C,#991B1B);padding:18px 24px;color:white;"><div style="font-size:17px;font-weight:600;">新增学员</div><div style="font-size:12px;opacity:0.8;margin-top:4px;">管理员直接创建账号，自动生成初始密码</div></div>'
      +'<div style="padding:20px 24px;">'
      +'<div style="margin-bottom:12px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:4px;">姓名 *</label><input id="sc-name" type="text" placeholder="学员姓名" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<div style="margin-bottom:12px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:4px;">手机号 *</label><input id="sc-phone" type="tel" maxlength="11" placeholder="11位手机号" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<div style="margin-bottom:12px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:4px;">班级/期数 *</label><input id="sc-class" type="text" placeholder="如：第12期" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<div style="display:flex;gap:10px;margin-bottom:12px;"><div style="flex:1;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:4px;">公司</label><input id="sc-company" type="text" placeholder="选填" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<div style="flex:1;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:4px;">职位</label><input id="sc-title" type="text" placeholder="选填" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div></div>'
      +'<div style="display:flex;gap:12px;margin-top:20px;">'
      +'<button id="sc-cancel" style="flex:1;height:44px;background:#F5F5F4;border:none;border-radius:12px;color:#78716C;font-weight:600;font-size:14px;cursor:pointer;">取消</button>'
      +'<button id="sc-submit" style="flex:1;height:44px;background:#B91C1C;border:none;border-radius:12px;color:#fff;font-weight:600;font-size:14px;cursor:pointer;">创建账号</button>'
      +'</div></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    document.getElementById('sc-cancel').addEventListener('click',function(){overlay.remove();});
    document.getElementById('sc-submit').addEventListener('click',function(){
      var name = document.getElementById('sc-name').value.trim();
      var phone = document.getElementById('sc-phone').value.trim();
      var cls = document.getElementById('sc-class').value.trim();
      if(!name||!phone||!cls){ showToast('请填写必填项', 'error'); return; }
      if(!/^1\\d{10}$/.test(phone)){ showToast('请输入正确手机号', 'error'); return; }
      this.disabled=true; this.textContent='创建中...';
      fetch('/api/admin/members/batch-register', {
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({adminId:u.id,members:[{name:name,phone:phone,className:cls}]})
      }).then(function(r){return r.json();}).then(function(res){
        if(res.ok){
          overlay.remove();
          // 显示账号密码列表
          if(res.data && res.data.accountList && res.data.accountList.length > 0){
            showAccountListModal(res.data.accountList);
          } else {
            showToast('创建成功！初始密码: '+res.data.initialPassword, 'success', 10000);
          }
          refreshMembers();
        } else { showToast(res.error||'创建失败','error'); document.getElementById('sc-submit').disabled=false; document.getElementById('sc-submit').textContent='创建账号'; }
      }).catch(function(){ showToast('网络错误','error'); document.getElementById('sc-submit').disabled=false; document.getElementById('sc-submit').textContent='创建账号'; });
    });
  }

  // ── Export Members CSV ──
  function exportMembersCSV(){
    var members = getMembers().filter(function(m){return m.role!=='admin';});
    var csv = '姓名,手机号,班级,公司,职位,状态\\n';
    members.forEach(function(m){
      csv += '"'+m.name+'","'+m.phone+'","'+(m.className||'')+'","'+(m.company||'')+'","'+(m.title||'')+'","'+(m.status||'active')+'\"\\n';
    });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '学员列表_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
    showToast('已导出 '+members.length+' 位学员', 'success');
  }

  // ── Member Detail Modal ──
  function openMemberDetail(memberId){
    var members = getMembers();
    var m = members.find(function(x){return x.id===memberId;});
    if(!m) return;

    var initiated = MOCK_PROJECTS.filter(function(p){return p.ownerId===m.id;});
    var participated = MOCK_CONTRACTS.filter(function(c){return c.participantId===m.id;});
    var investSum = participated.reduce(function(s,c){return s+c.amount;},0);

    // All projects this member is involved in
    var allProjects = [];
    initiated.forEach(function(p){allProjects.push({name:p.name,role:'发起人',amount:'¥'+p.targetAmount+'万'});});
    participated.forEach(function(c){allProjects.push({name:c.projectName,role:'参与人',amount:'¥'+c.amount+'万'});});

    var overlay = document.getElementById('member-detail-overlay');
    var html = '<div style="position:absolute;bottom:0;left:0;right:0;background:white;border-radius:24px 24px 0 0;max-height:90vh;overflow-y:auto;transform:translateY(100%);transition:transform 300ms ease-out;" id="member-detail-panel">';
    html += '<div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:12px auto 0;"></div>';
    html += '<button id="member-detail-close" style="position:absolute;top:16px;right:20px;background:none;border:none;font-size:20px;color:#A8A29E;cursor:pointer;">✕</button>';

    // Avatar + info (admin sees full phone number)
    html += '<div style="padding:24px;text-align:center;">';
    html += '<div style="width:72px;height:72px;background:linear-gradient(135deg,#B91C1C,#7F1D1D);color:white;font-size:28px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;">'+m.name.charAt(0)+'</div>';
    html += '<div style="font-size:20px;font-weight:700;color:#1C1917;margin-top:12px;">'+m.name+'</div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">'+(m.className||m.cohort||'')+' · '+m.phone+'</div>';
    html += '</div>';

    // KPI mini cards
    html += '<div style="display:flex;gap:12px;margin-top:4px;padding:0 16px;">';
    html += '<div style="flex:1;background:#FAFAF9;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#B91C1C;">'+initiated.length+'</div><div style="font-size:11px;color:#A8A29E;">发起项目</div></div>';
    html += '<div style="flex:1;background:#FAFAF9;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#B91C1C;">'+participated.length+'</div><div style="font-size:11px;color:#A8A29E;">参与投资</div></div>';
    html += '<div style="flex:1;background:#FAFAF9;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#B91C1C;">¥'+investSum+'万</div><div style="font-size:11px;color:#A8A29E;">总投资额</div></div>';
    html += '</div>';

    // Project list
    html += '<div style="margin-top:20px;padding:0 16px 24px;">';
    html += '<div style="font-size:14px;font-weight:600;color:#1C1917;margin-bottom:8px;">参与的项目</div>';
    if(allProjects.length===0){
      html += '<div style="font-size:13px;color:#A8A29E;padding:12px 0;">暂无项目记录</div>';
    } else {
      allProjects.forEach(function(p){
        var roleStyle = p.role==='发起人'?'background:#FEE2E2;color:#B91C1C;':'background:#EFF6FF;color:#3B82F6;';
        html += '<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<span style="font-size:13px;color:#1C1917;flex:1;">'+p.name+'</span>';
        html += '<span style="font-size:11px;'+roleStyle+'border-radius:4px;padding:1px 6px;margin-right:8px;">'+p.role+'</span>';
        html += '<span style="font-size:13px;color:#78716C;">'+p.amount+'</span>';
        html += '</div>';
      });
    }
    html += '</div></div>';

    overlay.innerHTML = html;
    overlay.style.display = 'block';
    var panel = document.getElementById('member-detail-panel');
    void panel.offsetHeight;
    panel.style.transform = 'translateY(0)';

    function closeDetail(){
      panel.style.transform = 'translateY(100%)';
      setTimeout(function(){overlay.style.display='none';},300);
    }
    document.getElementById('member-detail-close').addEventListener('click', closeDetail);
    overlay.addEventListener('click',function(e){if(e.target===overlay)closeDetail();});
  }

  // ── Batch Register Modal ──
  function openBatchRegister(){
    var members = getMembers();
    var classNames = [];
    members.forEach(function(m){if(m.className&&classNames.indexOf(m.className)===-1)classNames.push(m.className);});

    var overlay = document.getElementById('batch-register-overlay');
    var html = '<div style="background:white;border-radius:20px;padding:28px;max-width:480px;width:92%;margin:auto;max-height:90vh;overflow-y:auto;" id="batch-register-box">';
    html += '<div style="font-size:18px;font-weight:700;color:#1C1917;">批量注册学员</div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">支持手动输入或导入 CSV 文件，系统自动创建账户</div>';

    // Class select
    html += '<div style="margin-top:20px;"><label style="font-size:13px;font-weight:600;color:#44403C;">所属班级</label>';
    html += '<select id="batch-class-select" style="width:100%;padding:12px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;background:white;margin-top:6px;outline:none;box-sizing:border-box;">';
    classNames.forEach(function(cn){html += '<option value="'+cn+'">'+cn+'</option>';});
    html += '<option value="__new__">新建班级...</option>';
    html += '</select></div>';

    // New class input (hidden)
    html += '<div id="new-class-row" style="display:none;margin-top:8px;"><input id="new-class-input" type="text" placeholder="班级名称（如第18期）" style="width:100%;padding:12px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;" /></div>';

    // Mode tabs: manual / file
    html += '<div style="display:flex;gap:8px;margin-top:16px;">';
    html += '<button id="batch-mode-manual" style="flex:1;padding:10px;border:1.5px solid #B91C1C;background:#FEF2F2;color:#B91C1C;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;">✏️ 手动输入</button>';
    html += '<button id="batch-mode-file" style="flex:1;padding:10px;border:1.5px solid #E7E5E4;background:white;color:#78716C;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;">📁 CSV文件导入</button>';
    html += '</div>';

    // Manual input area
    html += '<div id="batch-manual-area" style="margin-top:14px;">';
    html += '<label style="font-size:13px;font-weight:600;color:#44403C;">学员信息（每行一位：姓名 手机号）</label>';
    html += '<textarea id="batch-textarea" placeholder="张三 13800001234&#10;李四 13900005678&#10;王五 13700009012" style="width:100%;height:160px;padding:14px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;font-family:monospace;resize:vertical;margin-top:6px;outline:none;box-sizing:border-box;"></textarea>';
    html += '</div>';

    // File import area (hidden)
    html += '<div id="batch-file-area" style="display:none;margin-top:14px;">';
    html += '<div id="batch-drop-zone" style="border:2px dashed #D6D3D1;border-radius:14px;padding:32px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#FAFAF9;">';
    html += '<div style="font-size:36px;margin-bottom:10px;">📄</div>';
    html += '<div style="font-size:14px;color:#44403C;font-weight:500;">点击选择或拖拽 CSV 文件</div>';
    html += '<div style="font-size:12px;color:#A8A29E;margin-top:6px;">格式：姓名, 手机号（表头可选）</div>';
    html += '<input id="batch-file-input" type="file" accept=".csv,.txt" style="display:none;" />';
    html += '</div>';
    html += '<div id="batch-file-preview" style="display:none;margin-top:12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    html += '<span id="batch-file-name" style="font-size:13px;color:#44403C;font-weight:500;"></span>';
    html += '<button id="batch-file-clear" style="font-size:12px;color:#DC2626;background:none;border:none;cursor:pointer;">✕ 清除</button>';
    html += '</div>';
    html += '<div id="batch-file-table" style="max-height:200px;overflow-y:auto;border:1px solid #E7E5E4;border-radius:10px;font-size:12px;"></div>';
    html += '</div>';
    html += '<div style="margin-top:10px;padding:10px;background:#F0FDF4;border-radius:8px;font-size:12px;color:#166534;line-height:1.5;">';
    html += '<strong>CSV 格式说明：</strong><br>';
    html += '• 每行一位学员，用逗号分隔<br>';
    html += '• 第一列：姓名，第二列：手机号<br>';
    html += '• 如有表头行会自动跳过<br>';
    html += '• 示例：<span style="font-family:monospace;background:#DCFCE7;padding:1px 4px;border-radius:3px;">张三,13800001234</span>';
    html += '</div></div>';

    // Buttons
    html += '<div style="margin-top:20px;display:flex;gap:10px;">';
    html += '<button id="batch-cancel" style="flex:1;background:#F5F5F4;color:#44403C;border:none;border-radius:12px;padding:14px;font-size:14px;cursor:pointer;">取消</button>';
    html += '<button id="batch-submit" style="flex:1;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;">确认注册 0 位</button>';
    html += '</div></div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';

    var classSelect = document.getElementById('batch-class-select');
    var newClassRow = document.getElementById('new-class-row');
    var textarea = document.getElementById('batch-textarea');
    var submitBtn = document.getElementById('batch-submit');
    var manualArea = document.getElementById('batch-manual-area');
    var fileArea = document.getElementById('batch-file-area');
    var modeManualBtn = document.getElementById('batch-mode-manual');
    var modeFileBtn = document.getElementById('batch-mode-file');
    var dropZone = document.getElementById('batch-drop-zone');
    var fileInput = document.getElementById('batch-file-input');
    var filePreview = document.getElementById('batch-file-preview');
    var fileNameEl = document.getElementById('batch-file-name');
    var fileTableEl = document.getElementById('batch-file-table');
    var fileClearBtn = document.getElementById('batch-file-clear');
    var currentMode = 'manual';
    var fileImportData = [];

    // Mode switching
    modeManualBtn.addEventListener('click', function(){
      currentMode = 'manual';
      manualArea.style.display = 'block'; fileArea.style.display = 'none';
      modeManualBtn.style.cssText = 'flex:1;padding:10px;border:1.5px solid #B91C1C;background:#FEF2F2;color:#B91C1C;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;';
      modeFileBtn.style.cssText = 'flex:1;padding:10px;border:1.5px solid #E7E5E4;background:white;color:#78716C;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;';
      updateCount();
    });
    modeFileBtn.addEventListener('click', function(){
      currentMode = 'file';
      manualArea.style.display = 'none'; fileArea.style.display = 'block';
      modeFileBtn.style.cssText = 'flex:1;padding:10px;border:1.5px solid #B91C1C;background:#FEF2F2;color:#B91C1C;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;';
      modeManualBtn.style.cssText = 'flex:1;padding:10px;border:1.5px solid #E7E5E4;background:white;color:#78716C;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;';
      updateCount();
    });

    classSelect.addEventListener('change',function(){
      newClassRow.style.display = classSelect.value==='__new__'?'block':'none';
    });

    function updateCount(){
      var count = currentMode === 'file' ? fileImportData.length : countManual();
      submitBtn.textContent = '确认注册 '+count+' 位';
      return count;
    }
    function countManual(){
      var lines = textarea.value.split(/\\n|\\r\\n?/);
      var count = 0;
      lines.forEach(function(line){
        line = line.trim();
        if(!line) return;
        var parts = line.split(/\\s+/);
        if(parts.length>=2 && /^1[3-9]\\d{9}$/.test(parts[parts.length-1])) count++;
      });
      return count;
    }
    textarea.addEventListener('input', updateCount);

    // ── File Import Logic ──
    dropZone.addEventListener('click', function(){ fileInput.click(); });
    dropZone.addEventListener('dragover', function(e){
      e.preventDefault(); e.stopPropagation();
      dropZone.style.borderColor = '#B91C1C'; dropZone.style.background = '#FEF2F2';
    });
    dropZone.addEventListener('dragleave', function(e){
      e.preventDefault(); e.stopPropagation();
      dropZone.style.borderColor = '#D6D3D1'; dropZone.style.background = '#FAFAF9';
    });
    dropZone.addEventListener('drop', function(e){
      e.preventDefault(); e.stopPropagation();
      dropZone.style.borderColor = '#D6D3D1'; dropZone.style.background = '#FAFAF9';
      if(e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function(){
      if(fileInput.files && fileInput.files.length > 0) processFile(fileInput.files[0]);
    });
    fileClearBtn.addEventListener('click', function(){
      fileImportData = [];
      filePreview.style.display = 'none'; dropZone.style.display = 'block';
      fileInput.value = ''; updateCount();
    });

    function processFile(file){
      if(!file) return;
      var ext = file.name.split('.').pop().toLowerCase();
      if(ext !== 'csv' && ext !== 'txt'){ showToast('请上传 CSV 或 TXT 格式文件','error'); return; }
      var reader = new FileReader();
      reader.onload = function(e){ parseCSVContent(e.target.result, file.name); };
      reader.readAsText(file, 'UTF-8');
    }

    function parseCSVContent(text, fileName){
      var lines = text.split(/\\r?\\n/);
      fileImportData = [];
      var errors = [];
      var tableHtml = '<table style="width:100%;border-collapse:collapse;">';
      tableHtml += '<tr style="background:#F5F5F4;"><th style="padding:6px 10px;text-align:left;font-weight:600;color:#44403C;">姓名</th><th style="padding:6px 10px;text-align:left;font-weight:600;color:#44403C;">手机号</th><th style="padding:6px 10px;text-align:center;font-weight:600;color:#44403C;">状态</th></tr>';
      lines.forEach(function(line, idx){
        line = line.trim();
        if(!line) return;
        var parts = line.split(/[,\\t]+/).map(function(s){return s.trim().replace(/^["']|["']$/g,'');});
        if(parts.length < 2) return;
        var name = parts[0]; var phone = parts[1];
        // Skip header row
        if(idx === 0 && !/^\\d/.test(phone)) return;
        var isValid = /^1[3-9]\\d{9}$/.test(phone);
        if(isValid){
          fileImportData.push({name: name, phone: phone});
          tableHtml += '<tr style="border-bottom:1px solid #F5F5F4;"><td style="padding:6px 10px;color:#1C1917;">'+name+'</td><td style="padding:6px 10px;color:#44403C;font-family:monospace;">'+phone+'</td><td style="padding:6px 10px;text-align:center;"><span style="color:#16A34A;">✓</span></td></tr>';
        } else {
          errors.push(name);
          tableHtml += '<tr style="border-bottom:1px solid #F5F5F4;background:#FEF2F2;"><td style="padding:6px 10px;color:#DC2626;">'+name+'</td><td style="padding:6px 10px;color:#DC2626;font-family:monospace;">'+(phone||'?')+'</td><td style="padding:6px 10px;text-align:center;"><span style="color:#DC2626;">✗</span></td></tr>';
        }
      });
      tableHtml += '</table>';
      if(fileImportData.length === 0){ showToast('文件中没有找到有效的学员数据','error'); return; }
      dropZone.style.display = 'none'; filePreview.style.display = 'block';
      fileNameEl.innerHTML = '<i class="fas fa-file-csv" style="color:#16A34A;margin-right:4px;"></i>' + fileName + ' <span style="color:#A8A29E;font-size:11px;">('+ fileImportData.length + ' 位有效' + (errors.length > 0 ? ', '+errors.length+' 位无效' : '') + ')</span>';
      fileTableEl.innerHTML = tableHtml;
      if(errors.length > 0) showToast(errors.length + ' 条记录手机号无效，已跳过', 'info');
      updateCount();
    }

    document.getElementById('batch-cancel').addEventListener('click',function(){overlay.style.display='none';});
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.style.display='none';});

    submitBtn.addEventListener('click',function(){
      var count = updateCount();
      if(count===0){showToast('请输入或导入有效的学员信息','error');return;}
      var className = classSelect.value;
      if(className==='__new__'){
        className = document.getElementById('new-class-input').value.trim();
        if(!className){showToast('请输入班级名称','error');return;}
      }

      var memberData = [];
      if(currentMode === 'file'){
        fileImportData.forEach(function(d){ memberData.push({name:d.name, phone:d.phone, className:className}); });
      } else {
        var lines = textarea.value.split(/\\n|\\r\\n?/);
        lines.forEach(function(line){
          line = line.trim(); if(!line) return;
          var parts = line.split(/\\s+/);
          if(parts.length<2) return;
          var phone = parts[parts.length-1];
          if(!/^1[3-9]\\d{9}$/.test(phone)) return;
          var name = parts.slice(0,parts.length-1).join(' ');
          memberData.push({name:name, phone:phone, className:className});
        });
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '注册中...';
      fetch('/api/admin/members/batch-register', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({members:memberData, adminId:cu.id})
      }).then(function(r){return r.json();}).then(function(d){
        if(d.ok){
          overlay.style.display='none';
          showToast(d.message || '注册成功','success');
          if(d.data && d.data.skipped && d.data.skipped.length > 0){
            showToast('跳过 '+d.data.skipped.length+' 位（已注册）', 'info', 5000);
          }
          // 显示账号密码列表弹窗（可下载）
          if(d.data && d.data.accountList && d.data.accountList.length > 0){
            showAccountListModal(d.data.accountList);
          }
          refreshMembers();
        } else {
          showToast(d.error||'注册失败','error');
          submitBtn.disabled=false;submitBtn.textContent='确认注册 '+count+' 位';
        }
      }).catch(function(){
        showToast('网络错误','error');
        submitBtn.disabled=false;submitBtn.textContent='确认注册 '+count+' 位';
      });
    });
  }

  // ── Account List Modal (批量注册后展示账号密码 + 下载) ──
  function showAccountListModal(accounts){
    var acOverlay = document.createElement('div');
    acOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';
    var html = '<div style="background:white;border-radius:20px;max-width:520px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">';
    html += '<div style="background:linear-gradient(135deg,#16A34A,#15803D);padding:20px 24px;color:white;">';
    html += '<div style="font-size:18px;font-weight:700;"><i class="fas fa-check-circle" style="margin-right:8px;"></i>注册成功</div>';
    html += '<div style="font-size:13px;opacity:0.85;margin-top:6px;">已成功创建 '+accounts.length+' 个学员账号，请妥善保存以下初始密码</div>';
    html += '</div>';
    html += '<div style="padding:16px 20px;overflow-y:auto;flex:1;">';
    html += '<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:#92400E;line-height:1.5;">';
    html += '<i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i><b>重要提示：</b>请立即下载或截图保存此密码列表。每个学员首次登录时需验证手机尾号并修改密码。</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
    html += '<thead><tr style="background:#F5F5F4;"><th style="padding:10px 12px;text-align:left;font-weight:600;color:#44403C;">姓名</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#44403C;">手机号</th><th style="padding:10px 12px;text-align:left;font-weight:600;color:#44403C;">初始密码</th></tr></thead><tbody>';
    accounts.forEach(function(a, i){
      var bg = i%2===0?'#fff':'#FAFAF9';
      html += '<tr style="background:'+bg+';border-bottom:1px solid #F5F5F4;"><td style="padding:8px 12px;color:#1C1917;font-weight:500;">'+a.name+'</td>';
      html += '<td style="padding:8px 12px;color:#57534E;font-family:monospace;">'+a.phone+'</td>';
      html += '<td style="padding:8px 12px;color:#B91C1C;font-family:monospace;font-weight:600;">'+a.password+'</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<div style="padding:16px 20px;border-top:1px solid #F5F5F4;display:flex;gap:10px;">';
    html += '<button id="ac-download-csv" style="flex:1;padding:12px;background:#F5F5F4;border:none;border-radius:10px;font-size:13px;color:#44403C;cursor:pointer;font-weight:500;"><i class="fas fa-file-csv" style="margin-right:6px;color:#16A34A;"></i>下载 CSV</button>';
    html += '<button id="ac-copy-all" style="flex:1;padding:12px;background:#F5F5F4;border:none;border-radius:10px;font-size:13px;color:#44403C;cursor:pointer;font-weight:500;"><i class="fas fa-copy" style="margin-right:6px;color:#3B82F6;"></i>复制全部</button>';
    html += '<button id="ac-close" style="flex:1;padding:12px;background:#B91C1C;border:none;border-radius:10px;font-size:13px;color:white;cursor:pointer;font-weight:600;">确认关闭</button>';
    html += '</div></div>';
    acOverlay.innerHTML = html;
    document.body.appendChild(acOverlay);

    // 下载CSV
    document.getElementById('ac-download-csv').addEventListener('click', function(){
      var csv = '\\uFEFF姓名,手机号,初始密码,班级\\n';
      accounts.forEach(function(a){
        csv += '"'+a.name+'","'+a.phone+'","'+a.password+'","'+(a.className||'')+'\"\\n';
      });
      var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = '学员账号密码_' + new Date().toISOString().slice(0,10) + '.csv';
      link.click();
      showToast('已下载密码列表 CSV', 'success');
    });

    // 复制全部
    document.getElementById('ac-copy-all').addEventListener('click', function(){
      var text = '中流通 学员账号密码列表\\n';
      text += '========================\\n';
      accounts.forEach(function(a){
        text += a.name + '  |  ' + a.phone + '  |  密码: ' + a.password + '\\n';
      });
      text += '========================\\n';
      text += '首次登录需验证手机尾号并修改密码\\n';
      text += '登录地址: https://zhongliutong.net\\n';
      if(navigator.clipboard){
        navigator.clipboard.writeText(text).then(function(){ showToast('已复制到剪贴板', 'success'); });
      } else {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('已复制到剪贴板', 'success');
      }
    });

    document.getElementById('ac-close').addEventListener('click', function(){ acOverlay.remove(); });
  }

  // ══════════════════════════════════
  // TAB: Classes (班级)
  // ══════════════════════════════════
  function renderClasses(){
    var members = getMembers().filter(function(m){return m.role!=='admin';});
    var classMap = {};
    members.forEach(function(m){
      var cn = m.className || '未分配';
      if(!classMap[cn]) classMap[cn] = [];
      classMap[cn].push(m);
    });

    var html = '<div style="padding:16px;">';

    // ── Action bar: 新增班级 + 批量导入班级 + 下载模板 ──
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';
    html += '<button id="btn-add-class" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;"><i class="fas fa-plus"></i> 新增班级</button>';
    html += '<button id="btn-import-classes-csv" style="background:#FAFAF9;border:1.5px solid #E7E5E4;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#44403C;display:flex;align-items:center;gap:6px;"><i class="fas fa-file-import"></i> 批量导入班级</button>';
    html += '<button id="btn-dl-class-tpl" style="background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#92400E;display:flex;align-items:center;gap:6px;"><i class="fas fa-download"></i> 下载班级CSV模板</button>';
    html += '<button id="btn-dl-student-tpl" style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#166534;display:flex;align-items:center;gap:6px;"><i class="fas fa-download"></i> 下载学员CSV模板</button>';
    html += '</div>';

    // ── Inline form: 新增单个班级 ──
    html += '<div id="add-class-form" style="display:none;background:white;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;border:1.5px solid #FECACA;">';
    html += '<div style="font-size:16px;font-weight:700;color:#1C1917;margin-bottom:16px;display:flex;align-items:center;gap:8px;"><i class="fas fa-graduation-cap" style="color:#B91C1C;"></i> 新增班级</div>';
    html += '<div style="display:grid;grid-template-columns:1fr;gap:12px;">';
    html += '<div><label style="font-size:13px;font-weight:600;color:#44403C;display:block;margin-bottom:4px;">班级名称 <span style="color:#DC2626;">*</span></label>';
    html += '<input id="ac-name" type="text" placeholder="如：第18期智能装备班" style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    html += '<div><label style="font-size:13px;font-weight:600;color:#44403C;display:block;margin-bottom:4px;">班级老师姓名 <span style="color:#DC2626;">*</span></label>';
    html += '<input id="ac-teacher" type="text" placeholder="如：王建国" style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>';
    html += '<div><label style="font-size:13px;font-weight:600;color:#44403C;display:block;margin-bottom:4px;">老师联系方式 <span style="color:#DC2626;">*</span></label>';
    html += '<input id="ac-phone" type="tel" placeholder="手机号" maxlength="11" style="width:100%;box-sizing:border-box;padding:10px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>';
    html += '</div></div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px;">';
    html += '<button id="ac-cancel" style="flex:1;background:#F5F5F4;color:#44403C;border:none;border-radius:10px;padding:12px;font-size:14px;cursor:pointer;">取消</button>';
    html += '<button id="ac-submit" style="flex:1;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;">确认创建</button>';
    html += '</div></div>';

    // ── Inline: 批量导入班级(CSV) ──
    html += '<div id="import-classes-area" style="display:none;background:white;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;border:1.5px solid #BFDBFE;">';
    html += '<div style="font-size:16px;font-weight:700;color:#1C1917;margin-bottom:12px;">📁 批量导入班级</div>';
    html += '<div style="font-size:12px;color:#78716C;line-height:1.6;margin-bottom:12px;background:#F0F9FF;padding:10px;border-radius:8px;">';
    html += '<strong>CSV格式：</strong>班级名称,班级老师姓名,班级老师联系方式<br>';
    html += '示例：<code style="background:#DBEAFE;padding:1px 4px;border-radius:3px;">第18期智能装备班,王建国,13800001234</code></div>';
    html += '<input type="file" id="class-csv-file" accept=".csv,.txt" style="font-size:14px;margin-bottom:12px;width:100%;">';
    html += '<div id="class-csv-preview" style="display:none;max-height:240px;overflow:auto;border:1px solid #E7E5E4;border-radius:8px;margin-bottom:12px;"></div>';
    html += '<div id="class-csv-warnings" style="display:none;background:#FEF2F2;border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px;color:#B91C1C;"></div>';
    html += '<div style="display:flex;gap:10px;">';
    html += '<button id="class-csv-cancel" style="flex:1;background:#F5F5F4;color:#44403C;border:none;border-radius:10px;padding:12px;font-size:14px;cursor:pointer;">取消</button>';
    html += '<button id="class-csv-confirm" style="flex:1;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;">确认导入</button>';
    html += '</div></div>';

    // ── Class list ──
    var classKeys = Object.keys(classMap);
    html += '<div style="font-size:14px;font-weight:600;color:#78716C;margin-bottom:10px;">共 '+classKeys.length+' 个班级</div>';
    classKeys.forEach(function(cn){
      var students = classMap[cn];
      var teacher = MOCK_TEACHERS.find(function(t){
        var classId = students[0] && students[0].classId;
        return classId && t.classIds.indexOf(classId)!==-1;
      });
      html += '<div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
      html += '<div><span style="font-size:16px;font-weight:700;color:#1C1917;">'+cn+'</span><span style="font-size:12px;color:#A8A29E;margin-left:8px;">'+students.length+'人</span></div>';
      if(teacher) html += '<span style="font-size:12px;color:#78716C;background:#F5F5F4;border-radius:6px;padding:2px 8px;"><i class="fas fa-chalkboard-teacher" style="margin-right:4px;font-size:10px;"></i>'+teacher.name+' · '+teacher.phone+'</span>';
      html += '</div>';
      students.forEach(function(s){
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<div style="width:32px;height:32px;background:#FEE2E2;color:#B91C1C;font-weight:600;font-size:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+s.name.charAt(0)+'</div>';
        html += '<span style="font-size:14px;color:#1C1917;">'+s.name+'</span>';
        html += '<span style="font-size:12px;color:#A8A29E;">'+s.company+'</span>';
        html += '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    panels.classes.innerHTML = html;

    // ── Event: 新增班级按钮 ──
    document.getElementById('btn-add-class').addEventListener('click', function(){
      document.getElementById('add-class-form').style.display = 'block';
      document.getElementById('ac-name').focus();
    });
    document.getElementById('ac-cancel').addEventListener('click', function(){
      document.getElementById('add-class-form').style.display = 'none';
    });
    document.getElementById('ac-submit').addEventListener('click', function(){
      var name = document.getElementById('ac-name').value.trim();
      var teacher = document.getElementById('ac-teacher').value.trim();
      var phone = document.getElementById('ac-phone').value.trim();
      if(!name){showToast('请输入班级名称','error');return;}
      if(!teacher){showToast('请输入老师姓名','error');return;}
      if(!phone||!/^1\\d{10}$/.test(phone)){showToast('请输入正确的手机号','error');return;}
      var btn = this; btn.disabled=true; btn.textContent='创建中...';
      fetch('/api/admin/classes/create',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({className:name,teacherName:teacher,teacherPhone:phone,adminId:cu.id})
      }).then(function(r){return r.json();}).then(function(d){
        btn.disabled=false; btn.textContent='确认创建';
        if(d.ok){
          showToast('班级「'+name+'」创建成功，老师：'+teacher,'success');
          document.getElementById('add-class-form').style.display='none';
          rendered['classes']=false;renderClasses();rendered['classes']=true;
        } else { showToast(d.error||'创建失败','error'); }
      }).catch(function(){ btn.disabled=false; btn.textContent='确认创建'; showToast('网络错误','error'); });
    });

    // ── Event: 下载班级CSV模板 ──
    document.getElementById('btn-dl-class-tpl').addEventListener('click', function(){
      var h = '班级名称,班级老师姓名,班级老师联系方式';
      var s1 = '第18期智能装备班,王建国,13800001234';
      var s2 = '第19期新能源班,李芳华,13900005678';
      var csv = '\\uFEFF'+h+'\\n'+s1+'\\n'+s2+'\\n';
      var blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');a.href=url;a.download='班级导入模板.csv';a.click();
      URL.revokeObjectURL(url);
      showToast('班级CSV模板已下载','success');
    });

    // ── Event: 下载学员CSV模板 ──
    document.getElementById('btn-dl-student-tpl').addEventListener('click', function(){
      var h = '姓名,手机号';
      var s1 = '张三,13800001111';
      var s2 = '李四,13900002222';
      var csv = '\\uFEFF'+h+'\\n'+s1+'\\n'+s2+'\\n';
      var blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');a.href=url;a.download='学员导入模板.csv';a.click();
      URL.revokeObjectURL(url);
      showToast('学员CSV模板已下载','success');
    });

    // ── Event: 批量导入班级 ──
    document.getElementById('btn-import-classes-csv').addEventListener('click', function(){
      document.getElementById('import-classes-area').style.display = 'block';
    });
    document.getElementById('class-csv-cancel').addEventListener('click', function(){
      document.getElementById('import-classes-area').style.display = 'none';
    });
    var classCsvRows = [];
    document.getElementById('class-csv-file').addEventListener('change', function(e){
      var file = e.target.files[0]; if(!file) return;
      var reader = new FileReader();
      reader.onload = function(evt){
        var text = evt.target.result;
        var lines = text.split(/\\n|\\r\\n?/).filter(function(l){return l.trim();});
        classCsvRows = []; var warnings = [];
        var startIdx = 0;
        if(lines.length>0 && (lines[0].indexOf('班级')!==-1 || lines[0].indexOf('老师')!==-1)) startIdx=1;
        for(var i=startIdx;i<lines.length;i++){
          var cols = lines[i].split(',');
          if(cols.length<3){warnings.push('第'+(i+1)+'行列数不足');continue;}
          var cn=cols[0].trim(),tn=cols[1].trim(),tp=cols[2].trim();
          if(!cn||!tn||!tp){warnings.push('第'+(i+1)+'行有空字段');continue;}
          if(!/^1\\d{10}$/.test(tp)){warnings.push('第'+(i+1)+'行手机号格式不对: '+tp);continue;}
          classCsvRows.push({className:cn,teacherName:tn,teacherPhone:tp});
        }
        var previewEl = document.getElementById('class-csv-preview');
        var tbl='<table style="width:100%;border-collapse:collapse;font-size:12px;">';
        tbl+='<tr style="background:#F5F5F4;"><th style="padding:8px;text-align:left;">班级名称</th><th>老师姓名</th><th>联系方式</th></tr>';
        classCsvRows.forEach(function(r){
          tbl+='<tr style="border-bottom:1px solid #F5F5F4;"><td style="padding:8px;">'+r.className+'</td><td>'+r.teacherName+'</td><td>'+r.teacherPhone+'</td></tr>';
        });
        tbl+='</table>';
        previewEl.innerHTML=tbl;previewEl.style.display='block';
        var warnEl=document.getElementById('class-csv-warnings');
        if(warnings.length>0){warnEl.innerHTML='⚠️ '+warnings.join('<br>');warnEl.style.display='block';}else{warnEl.style.display='none';}
      };
      reader.readAsText(file);
    });
    document.getElementById('class-csv-confirm').addEventListener('click', function(){
      if(classCsvRows.length===0){showToast('没有可导入的数据','error');return;}
      var btn=this;btn.disabled=true;btn.textContent='导入中...';
      fetch('/api/admin/classes/batch-create',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({classes:classCsvRows,adminId:cu.id})
      }).then(function(r){return r.json();}).then(function(d){
        btn.disabled=false;btn.textContent='确认导入';
        if(d.ok){
          showToast('成功导入 '+d.data.count+' 个班级','success');
          document.getElementById('import-classes-area').style.display='none';
          rendered['classes']=false;renderClasses();rendered['classes']=true;
        } else { showToast(d.error||'导入失败','error'); }
      }).catch(function(){btn.disabled=false;btn.textContent='确认导入';showToast('网络错误','error');});
    });
  }

  // ══════════════════════════════════
  // TAB: Teachers (老师)
  // ══════════════════════════════════
  function renderTeachersTab(){
    var html = '<div style="padding:16px;">';
    MOCK_TEACHERS.forEach(function(t){
      var classNames = t.classIds.map(function(c){return c.replace('class-','第')+'期';}).join('、');
      var members = getMembers().filter(function(m){return t.classIds.indexOf(m.classId)!==-1;});
      html += '<div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;display:flex;align-items:center;gap:14px;">';
      html += '<div style="width:48px;height:48px;background:linear-gradient(135deg,#D4A853,#B8860B);color:white;font-weight:700;font-size:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+t.name.charAt(0)+'</div>';
      html += '<div style="flex:1;">';
      html += '<div style="font-size:15px;font-weight:600;color:#1C1917;">'+t.name+'</div>';
      html += '<div style="font-size:13px;color:#78716C;margin-top:2px;">负责：'+classNames+'</div>';
      html += '<div style="font-size:12px;color:#A8A29E;margin-top:2px;">管理 '+members.length+' 位学员</div>';
      html += '</div></div>';
    });
    html += '</div>';
    panels.teachers.innerHTML = html;
  }

  // ══════════════════════════════════
  // TAB: Projects (项目)
  // ══════════════════════════════════
  var projectsPager = null;
  function renderProjectsTab(){
    var statusMap = {draft:'草稿',open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',pending_review:'待审核',terminated:'已终止'};
    var badgeStyles = {draft:'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;',open:'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;',active:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;',completed:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;',funded:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;',pending_review:'background:#FFFBEB;color:#92400E;border:1px solid #FDE68A;',terminated:'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;'};
    var members = getMembers();

    var html = '<div style="padding:16px;">';
    // Search + status filter
    html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">';
    html += '<input id="admin-project-search" type="text" placeholder="搜索项目名称" style="flex:1;min-width:150px;background:#F5F5F4;border:none;border-radius:10px;padding:10px 14px;font-size:13px;outline:none;" />';
    html += '<select id="admin-project-status" style="background:#F5F5F4;border:none;border-radius:10px;padding:10px 14px;font-size:13px;color:#44403C;">';
    html += '<option value="">全部状态</option>';
    Object.keys(statusMap).forEach(function(k){ html += '<option value="'+k+'">'+statusMap[k]+'</option>'; });
    html += '</select>';
    html += '</div>';
    html += '<div id="admin-project-list"></div>';
    html += '<div id="admin-project-pager"></div>';
    html += '</div>';
    panels.projects.innerHTML = html;

    projectsPager = new ZlcPagination({
      container: '#admin-project-list',
      pagerContainer: '#admin-project-pager',
      endpoint: '/api/data/projects',
      limit: 15,
      skeleton: (typeof ZLC_SKELETON !== 'undefined') ? ZLC_SKELETON.card(4) : '',
      renderItem: function(p){
        var owner = members.find(function(m){return m.id===p.ownerId;}) || {name:'?'};
        var pct = p.targetAmount>0?Math.round(p.raisedAmount/p.targetAmount*100):0;
        var h = '<a href="/projects/'+p.id+'" style="display:block;text-decoration:none;color:inherit;background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;">';
        h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
        h += '<span style="font-size:15px;font-weight:600;color:#1C1917;">'+p.name+'</span>';
        h += '<span style="'+(badgeStyles[p.status]||badgeStyles.draft)+';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">'+(statusMap[p.status]||p.status)+'</span>';
        h += '</div>';
        h += '<div style="display:flex;gap:12px;font-size:13px;color:#78716C;">';
        h += '<span>'+owner.name+'</span><span>\\u00a5'+p.targetAmount+'\\u4e07</span><span>'+pct+'%</span>';
        h += '</div></a>';
        return h;
      },
      renderSummary: function(total){ return '<div style="font-size:12px;color:#A8A29E;text-align:center;padding:8px 0;">\\u5171 '+total+' \\u4e2a\\u9879\\u76ee</div>'; },
    });
    projectsPager.load(1);

    // Search with debounce
    var searchTimer = null;
    document.getElementById('admin-project-search').addEventListener('input', function(e){
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function(){ projectsPager.setParams({ search: e.target.value.trim() }); }, 300);
    });
    document.getElementById('admin-project-status').addEventListener('change', function(e){
      projectsPager.setParams({ status: e.target.value });
    });
  }

  // ══════════════════════════════════
  // TAB: Review (项目审核)
  // ══════════════════════════════════
  var reviewPendingPager = null;
  var reviewHistoryPager = null;
  function renderReviewTab(){
    var statusMap = {pending_review:'待审核',open:'募集中',active:'运营中',completed:'已完成',draft:'草稿',funded:'已满额',terminated:'已终止'};
    var members = getMembers();

    var html = '<div style="padding:16px;">';
    html += '<h3 style="font-size:18px;font-weight:700;color:#1C1917;margin-bottom:16px;">项目审核</h3>';

    // Pending section
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="font-size:14px;font-weight:600;color:#B91C1C;margin-bottom:12px;" id="review-pending-title">待审核</div>';
    html += '<div id="review-pending-list"></div>';
    html += '<div id="review-pending-pager"></div>';
    html += '</div>';

    // Reviewed section
    html += '<div style="font-size:14px;font-weight:600;color:#44403C;margin-bottom:12px;">已审核项目</div>';
    html += '<div id="review-history-list"></div>';
    html += '<div id="review-history-pager"></div>';
    html += '</div>';
    panels.review.innerHTML = html;

    // Pending projects pager
    reviewPendingPager = new ZlcPagination({
      container: '#review-pending-list',
      pagerContainer: '#review-pending-pager',
      endpoint: '/api/data/projects',
      params: { status: 'pending_review' },
      limit: 10,
      skeleton: (typeof ZLC_SKELETON !== 'undefined') ? ZLC_SKELETON.card(2) : '',
      onLoad: function(res){
        var titleEl = document.getElementById('review-pending-title');
        if(titleEl) titleEl.innerHTML = '待审核 <span style="background:#F59E0B;color:white;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">'+(res.total||0)+'</span>';
      },
      renderItem: function(p){
        var owner = members.find(function(m){return m.id===p.ownerId;}) || {name:'?'};
        var h = '<div class="review-card" id="review-' + p.id + '" style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #FEE2E2;">';
        h += '<div style="display:flex;justify-content:space-between;align-items:start;">';
        h += '<div><div style="font-size:15px;font-weight:600;color:#1C1917;">' + p.name + '</div>';
        h += '<div style="font-size:12px;color:#78716C;margin-top:4px;">\\u53d1\\u8d77\\u4eba: ' + owner.name + ' \\u00B7 ' + (p.industry||'') + '</div>';
        h += '<div style="font-size:12px;color:#78716C;">\\u76ee\\u6807: \\u00a5' + p.targetAmount + '\\u4e07 \\u00B7 ' + p.totalShares + '\\u4efd \\u00d7 \\u00a5' + p.sharePrice + '\\u4e07</div>';
        if(p.description) h += '<div style="font-size:12px;color:#A8A29E;margin-top:6px;line-height:1.5;">' + p.description.slice(0,100) + (p.description.length>100?'...':'') + '</div>';
        h += '</div></div>';
        h += '<div style="display:flex;gap:8px;margin-top:12px;">';
        h += '<button onclick="reviewProject(\\'' + p.id + '\\',\\'approved\\')" style="flex:1;padding:8px;background:#16A34A;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">\\u901a\\u8fc7</button>';
        h += '<button onclick="reviewProject(\\'' + p.id + '\\',\\'rejected\\')" style="flex:1;padding:8px;background:#fff;color:#DC2626;border:1px solid #FECACA;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">\\u9a73\\u56de</button>';
        h += '</div></div>';
        return h;
      },
      renderEmpty: function(){ return '<div style="text-align:center;padding:20px;color:#A8A29E;font-size:13px;">\\u6682\\u65e0\\u5f85\\u5ba1\\u6838\\u9879\\u76ee</div>'; },
    });
    reviewPendingPager.load(1);

    // Reviewed history pager — exclude draft and pending_review
    reviewHistoryPager = new ZlcPagination({
      container: '#review-history-list',
      pagerContainer: '#review-history-pager',
      endpoint: '/api/data/projects',
      params: { status: 'open' }, // default: show open (recently approved)
      limit: 10,
      skeleton: (typeof ZLC_SKELETON !== 'undefined') ? ZLC_SKELETON.row(4) : '',
      renderItem: function(p){
        var owner = members.find(function(m){return m.id===p.ownerId;}) || {name:'?'};
        var badge = statusMap[p.status] || p.status;
        var badgeColor = p.status==='open'?'#DC2626':p.status==='active'?'#16A34A':'#78716C';
        var h = '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F5F4;">';
        h += '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:500;color:#1C1917;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + p.name + '</div>';
        h += '<div style="font-size:12px;color:#A8A29E;">' + owner.name + '</div></div>';
        h += '<span style="font-size:11px;padding:2px 8px;border-radius:6px;background:' + badgeColor + '1a;color:' + badgeColor + ';font-weight:500;">' + badge + '</span>';
        h += '</div>';
        return h;
      },
    });
    reviewHistoryPager.load(1);
  }

  window.reviewProject = function(pid, decision){
    var notePrompt = decision === 'rejected' ? prompt('请输入驳回理由:') : '';
    if(decision === 'rejected' && notePrompt === null) return;

    fetch('/api/admin/projects/' + pid + '/review', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ decision: decision, note: notePrompt || '', adminId: u.id })
    }).then(function(r){return r.json();}).then(function(res){
      if(res.ok){
        showToast(decision === 'approved' ? '\\u2705 \\u9879\\u76ee\\u5df2\\u901a\\u8fc7\\u5ba1\\u6838' : '\\u274c \\u9879\\u76ee\\u5df2\\u9a73\\u56de');
        // Update local data
        var proj = MOCK_PROJECTS.find(function(p){ return p.id === pid; });
        if(proj) proj.status = decision === 'approved' ? 'open' : 'draft';
        // Refresh paginated review lists
        if(reviewPendingPager) reviewPendingPager.refresh();
        if(reviewHistoryPager) reviewHistoryPager.refresh();
      } else {
        showToast(res.error || '操作失败', 'error');
      }
    }).catch(function(){ showToast('网络错误', 'error'); });
  };

  // ══════════════════════════════════
  // TAB: Invites (邀请码管理)
  // ══════════════════════════════════
  function renderInvitesTab(){
    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3 style="font-size:18px;font-weight:700;color:#1C1917;">邀请码管理</h3>';
    html += '<button id="btn-gen-invite" style="padding:8px 16px;background:#B91C1C;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;"><i class="fas fa-plus" style="margin-right:4px;"></i>生成邀请码</button>';
    html += '</div>';
    html += '<div id="invite-list" style="font-size:13px;color:#A8A29E;text-align:center;padding:24px;">加载中...</div>';
    html += '</div>';
    panels.invites.innerHTML = html;

    // Load invite codes
    fetch('/api/data/invite-codes').then(function(r){return r.json();}).then(function(res){
      var codes = (res.ok ? res.data : res) || [];
      var listEl = document.getElementById('invite-list');
      if(codes.length === 0){
        listEl.innerHTML = '<div style="text-align:center;padding:32px 0;"><div style="font-size:48px;color:#D6D3D1;margin-bottom:12px;">🎟️</div><p style="font-size:14px;color:#A8A29E;">暂无邀请码</p></div>';
        return;
      }
      var h = '';
      codes.forEach(function(c){
        var usedBadge = c.usedBy ? '<span style="color:#16A34A;font-size:11px;">✅ 已使用</span>' : '<span style="color:#D4A853;font-size:11px;">⏳ 未使用</span>';
        var expiredBadge = c.expiresAt && new Date(c.expiresAt) < new Date() ? '<span style="color:#DC2626;font-size:11px;margin-left:6px;">已过期</span>' : '';
        h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F5F5F4;">';
        h += '<div>';
        h += '<div style="font-family:monospace;font-size:15px;font-weight:600;color:#1C1917;letter-spacing:2px;">' + c.code + '</div>';
        h += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">' + (c.createdAt || '') + (c.usedBy ? ' · 使用者: ' + (c.usedByName||c.usedBy) : '') + '</div>';
        h += '</div>';
        h += '<div>' + usedBadge + expiredBadge + '</div>';
        h += '</div>';
      });
      listEl.innerHTML = h;
    }).catch(function(){
      document.getElementById('invite-list').innerHTML = '<div style="color:#DC2626;text-align:center;padding:16px;">加载失败</div>';
    });

    // Generate new invite code
    document.getElementById('btn-gen-invite').addEventListener('click', function(){
      fetch('/api/admin/invite-codes/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ adminId: u.id, count: 1 })
      }).then(function(r){return r.json();}).then(function(res){
        if(res.ok){
          showToast('✅ 邀请码已生成: ' + (res.data && res.data.codes ? res.data.codes[0] : ''));
          renderInvitesTab();
        } else {
          showToast(res.error || '生成失败', 'error');
        }
      }).catch(function(){ showToast('网络错误', 'error'); });
    });
  }

  // ══════════════════════════════════
  // TAB: Audit Log (审计日志) — Paginated
  // ══════════════════════════════════
  var auditPager = null;
  function renderAuditTab(){
    var actionMap = {
      'create_project':'创建项目','review_project':'审核项目','participate_project':'参与投资',
      'sign_contract':'签署合同','submit_revenue_report':'提交营收报告','batch_register':'批量注册',
      'create_referral':'发起引荐','settlement_import':'导入分账','generate_invite':'生成邀请码',
      'login_success':'登录成功','login_failed':'登录失败','login_blocked':'登录阻止',
      'change_password':'修改密码','admin_reset_password':'重置密码','self_register':'自助注册',
      'session_cleanup':'清理会话','approve_member':'审批通过','reject_member':'审批拒绝',
      'toggle_member_status':'切换用户状态',
    };
    var iconMap = {create_project:'\\ud83d\\udcc1',review_project:'\\u2705',participate_project:'\\ud83d\\udcb0',sign_contract:'\\u270d\\ufe0f',submit_revenue_report:'\\ud83d\\udcca',batch_register:'\\ud83d\\udc65',create_referral:'\\ud83e\\udd1d',settlement_import:'\\ud83d\\udce5',generate_invite:'\\ud83c\\udfab',login_success:'\\ud83d\\udd13',login_failed:'\\u274c',change_password:'\\ud83d\\udd11',admin_reset_password:'\\ud83d\\udd11',self_register:'\\ud83d\\udc64'};

    var html = '<div style="padding:16px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
    html += '<h3 style="font-size:18px;font-weight:700;color:#1C1917;">审计日志</h3>';
    html += '<select id="audit-action-filter" style="background:#F5F5F4;border:none;border-radius:8px;padding:6px 12px;font-size:13px;color:#44403C;">';
    html += '<option value="">全部操作</option>';
    Object.keys(actionMap).forEach(function(k){ html += '<option value="'+k+'">'+actionMap[k]+'</option>'; });
    html += '</select>';
    html += '</div>';
    html += '<div id="audit-list"></div>';
    html += '<div id="audit-pager"></div>';
    html += '</div>';
    panels.audit.innerHTML = html;

    auditPager = new ZlcPagination({
      container: '#audit-list',
      pagerContainer: '#audit-pager',
      endpoint: '/api/data/audit-logs',
      limit: 15,
      skeleton: (typeof ZLC_SKELETON !== 'undefined') ? ZLC_SKELETON.row(6) : '',
      renderItem: function(log){
        var actionText = actionMap[log.action] || log.action;
        var icon = iconMap[log.action] || '\\ud83d\\udccc';
        var detail = '';
        try { var d = typeof log.detail === 'string' ? JSON.parse(log.detail) : log.detail; detail = JSON.stringify(d).slice(0,120); } catch(e){ detail = log.detail || ''; }
        var h = '<div style="padding:12px 0;border-bottom:1px solid #F5F5F4;">';
        h += '<div style="display:flex;align-items:center;gap:8px;">';
        h += '<span style="font-size:16px;">' + icon + '</span>';
        h += '<span style="font-size:14px;font-weight:500;color:#1C1917;">' + actionText + '</span>';
        h += '<span style="font-size:11px;color:#A8A29E;margin-left:auto;">' + (log.createdAt || '') + '</span>';
        h += '</div>';
        h += '<div style="font-size:12px;color:#78716C;margin-top:4px;">\\u7528\\u6237: ' + (log.userId || '?') + ' \\u00B7 ' + (log.entityType||'') + ': ' + (log.entityId||'') + '</div>';
        if(detail) h += '<div style="font-size:11px;color:#A8A29E;margin-top:2px;word-break:break-all;max-height:40px;overflow:hidden;">' + detail + '</div>';
        h += '</div>';
        return h;
      },
      renderEmpty: function(){ return '<div style="text-align:center;padding:32px 0;"><div style="font-size:48px;color:#D6D3D1;margin-bottom:12px;">\\ud83d\\udccb</div><p style="font-size:14px;color:#A8A29E;">\\u6682\\u65e0\\u5ba1\\u8ba1\\u65e5\\u5fd7</p></div>'; },
    });
    auditPager.load(1);

    // Action filter
    document.getElementById('audit-action-filter').addEventListener('change', function(e){
      auditPager.setParams({ action: e.target.value });
    });
  }

})();
`}} />
    </div>,
    { title: '中流通 - 管理后台' }
  )
})
}
