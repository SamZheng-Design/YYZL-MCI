// Route: /admin
import { Hono } from 'hono'
import {
  GlobalScripts, LogoSVG, Navbar, TabBar, statusLabel,
} from '../components'
import type { HonoEnv } from '../types'

export function registerAdminRoute(app: Hono<HonoEnv>) {
app.get('/admin', async (c) => {
  // Load data from D1 via bridge
  const db = c.env.DB
  const { loadMembers, loadTeachers, loadProjects, loadContracts, loadRepaymentRecords } = await import('../db-bridge')
  const [allMembers, allTeachers, allProjects, allContracts, allRepRecords] = await Promise.all([
    loadMembers(db), loadTeachers(db), loadProjects(db), loadContracts(db), loadRepaymentRecords(db)
  ])
  return c.render(
    <div class="app-container has-tabbar" style="background:#F8F7F6;">
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
      </div>

      <main class="max-w-lg mx-auto pb-4 dk-admin-main">
        {/* Tab Content Panels */}
        <div id="tab-overview" class="admin-tab-panel" style="opacity:1;" />
        <div id="tab-settlement" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-members" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-classes" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-teachers" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-projects" class="admin-tab-panel" style="display:none;opacity:0;" />
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

  // ── Data from D1 ──
  var MOCK_MEMBERS = ${JSON.stringify(allMembers)};
  var MOCK_PROJECTS = ${JSON.stringify(allProjects)};
  var MOCK_CONTRACTS = ${JSON.stringify(allContracts)};
  var MOCK_REP_RECORDS = ${JSON.stringify(allRepRecords)};
  var MOCK_TEACHERS = ${JSON.stringify(allTeachers)};

  // Merge localStorage members
  function getMembers(){
    var members = MOCK_MEMBERS.slice();
    try {
      var lsM = JSON.parse(localStorage.getItem('zlc_mock_members') || '[]');
      lsM.forEach(function(m){ if(!members.find(function(x){return x.id===m.id;})) members.push(m); });
    } catch(e){}
    return members;
  }
  function saveMembers(members){
    // Save the FULL updated array so other pages can read it
    var newOnes = members.filter(function(m){ return !MOCK_MEMBERS.find(function(x){return x.id===m.id;}); });
    localStorage.setItem('zlc_mock_members', JSON.stringify(newOnes));
  }

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
    projects: document.getElementById('tab-projects')
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
  }

  // Render initial tab
  renderOverview(); rendered['overview']=true;
  if(currentTab !== 'overview'){ renderTab(currentTab); rendered[currentTab]=true; panels[currentTab].style.display='block'; panels[currentTab].style.opacity='1'; }

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

    var activities = [
      {icon:'🎓',text:'张明远（第12期）发起了新项目「华南餐饮连锁联营」',time:'2小时前'},
      {icon:'💰',text:'李芳华（第12期）参与投资「华南餐饮连锁联营」¥10万',time:'5小时前'},
      {icon:'📊',text:'王建国（第14期）提交了收入报告「智能制造设备融资」',time:'1天前'},
      {icon:'🤝',text:'刘老师 完成了一次引荐对接',time:'2天前'},
      {icon:'✅',text:'项目「华南社区团购联营试点」已完成全部回款',time:'5天前'}
    ];

    var actHTML = activities.map(function(a){
      return '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;gap:10px;">'
        +'<span style="font-size:20px;flex-shrink:0;">'+a.icon+'</span>'
        +'<span style="flex:1;font-size:13px;color:#44403C;">'+a.text+'</span>'
        +'<span style="font-size:12px;color:#A8A29E;white-space:nowrap;flex-shrink:0;">'+a.time+'</span>'
        +'</div>';
    }).join('');

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

    // Status bar
    html += '<div style="margin-top:20px;padding:0 16px;">';
    html += '<div style="height:32px;border-radius:8px;overflow:hidden;background:#F5F5F4;width:100%;display:flex;">'+barHTML+'</div>';
    html += '<div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;font-size:11px;color:#78716C;">'+legendHTML+'</div>';
    html += '</div>';

    // Recent activities
    html += '<div style="margin-top:24px;padding:0 16px;"><div style="font-size:16px;font-weight:600;color:#1C1917;">最近平台动态</div></div>';
    html += '<div style="margin-top:8px;">'+actHTML+'</div>';

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
    var members = getMembers().filter(function(m){return m.role!=='admin';});

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
    // Search + Batch Register
    html += '<div style="padding:16px 16px 0;display:flex;gap:10px;align-items:center;">';
    html += '<input id="member-search" type="text" placeholder="搜索学员姓名或手机号" value="'+(memberSearchTerm||'')+'" style="width:60%;background:#F5F5F4;border:none;border-radius:12px;padding:12px 16px;font-size:14px;outline:none;" />';
    html += '<button id="batch-register-btn" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:12px;padding:10px 16px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;">+批量注册</button>';
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

        html += '<div class="member-card-item" data-member-id="'+m.id+'" style="margin:8px 16px;background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);cursor:pointer;display:flex;align-items:center;gap:14px;">';
        html += '<div style="width:48px;height:48px;background:#FEE2E2;color:#B91C1C;font-weight:700;font-size:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+m.name.charAt(0)+'</div>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:15px;font-weight:600;color:#1C1917;">'+m.name+'</span><span style="font-size:11px;background:#F5F5F4;color:#78716C;border-radius:6px;padding:2px 8px;">'+(m.className||m.cohort||'')+'</span></div>';
        html += '<div style="font-size:13px;color:#A8A29E;margin-top:4px;">'+maskedPhone+'</div>';
        html += '<div style="margin-top:8px;font-size:12px;color:#78716C;display:flex;gap:16px;">'
          +'<span>发起 '+initiated+'</span><span>参与 '+participated+'</span><span>投资 ¥'+investSum+'万</span></div>';
        html += '</div>';
        html += '<span style="color:#D6D3D1;font-size:18px;align-self:center;flex-shrink:0;">›</span>';
        html += '</div>';
      });
      html += '<div style="font-size:13px;color:#A8A29E;text-align:center;padding:16px;">共 '+filtered.length+' 位认证学员</div>';
    }

    panels.members.innerHTML = html;

    // Bind events
    var searchEl = document.getElementById('member-search');
    if(searchEl){
      searchEl.addEventListener('input',function(e){
        memberSearchTerm = e.target.value.trim();
        renderMembers();
      });
      // Keep focus after re-render
      searchEl.focus();
      searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
    }
    var batchBtn = document.getElementById('batch-register-btn');
    if(batchBtn) batchBtn.addEventListener('click', openBatchRegister);
    document.querySelectorAll('.member-class-tag').forEach(function(btn){
      btn.addEventListener('click',function(){
        memberClassFilter = btn.dataset.class;
        renderMembers();
      });
    });
    document.querySelectorAll('.member-card-item').forEach(function(card){
      card.addEventListener('click',function(){
        openMemberDetail(card.dataset.memberId);
      });
    });
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
    var html = '<div style="background:white;border-radius:20px;padding:28px;max-width:400px;width:90%;margin:auto;max-height:90vh;overflow-y:auto;" id="batch-register-box">';
    html += '<div style="font-size:18px;font-weight:700;color:#1C1917;">批量注册学员</div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">输入学员信息，每行一位，系统将自动创建账户并发送邀请</div>';

    // Class select
    html += '<div style="margin-top:20px;"><label style="font-size:13px;font-weight:600;color:#44403C;">所属班级</label>';
    html += '<select id="batch-class-select" style="width:100%;padding:12px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;background:white;margin-top:6px;outline:none;">';
    classNames.forEach(function(cn){html += '<option value="'+cn+'">'+cn+'</option>';});
    html += '<option value="__new__">新建班级...</option>';
    html += '</select></div>';

    // New class input (hidden)
    html += '<div id="new-class-row" style="display:none;margin-top:8px;"><input id="new-class-input" type="text" placeholder="班级名称（如第18期）" style="width:100%;padding:12px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;outline:none;" /></div>';

    // Textarea
    html += '<div style="margin-top:16px;"><label style="font-size:13px;font-weight:600;color:#44403C;">学员信息（每行一位：姓名 手机号）</label>';
    html += '<textarea id="batch-textarea" placeholder="张三 13800001234&#10;李四 13900005678&#10;王五 13700009012" style="width:100%;height:160px;padding:14px 16px;border:1px solid #E7E5E4;border-radius:12px;font-size:14px;font-family:monospace;resize:vertical;margin-top:6px;outline:none;box-sizing:border-box;"></textarea></div>';

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

    classSelect.addEventListener('change',function(){
      newClassRow.style.display = classSelect.value==='__new__'?'block':'none';
    });

    function countValid(){
      var lines = textarea.value.split(/\\n|\\r\\n?/);
      var count = 0;
      lines.forEach(function(line){
        line = line.trim();
        if(!line) return;
        var parts = line.split(/\\s+/);
        if(parts.length>=2 && /^1[3-9]\\d{9}$/.test(parts[parts.length-1])) count++;
      });
      submitBtn.textContent = '确认注册 '+count+' 位';
      return count;
    }
    textarea.addEventListener('input', countValid);

    document.getElementById('batch-cancel').addEventListener('click',function(){overlay.style.display='none';});
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.style.display='none';});

    submitBtn.addEventListener('click',function(){
      var count = countValid();
      if(count===0){showToast('请输入有效的学员信息','error');return;}
      var className = classSelect.value;
      if(className==='__new__'){
        className = document.getElementById('new-class-input').value.trim();
        if(!className){showToast('请输入班级名称','error');return;}
      }

      var lines = textarea.value.split(/\\n|\\r\\n?/);
      var memberData = [];
      lines.forEach(function(line){
        line = line.trim();
        if(!line) return;
        var parts = line.split(/\\s+/);
        if(parts.length<2) return;
        var phone = parts[parts.length-1];
        if(!/^1[3-9]\\d{9}$/.test(phone)) return;
        var name = parts.slice(0,parts.length-1).join(' ');
        memberData.push({name:name, phone:phone, className:className});
      });

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
          if(d.data && d.data.initialPassword){
            showToast('初始密码: '+d.data.initialPassword, 'info', 8000);
          }
          // Reload data from API
          fetch('/api/data/members').then(function(r){return r.json();}).then(function(md){
            if(md.ok) MOCK_MEMBERS = md.data;
            rendered['members']=false;renderMembers();rendered['members']=true;
          });
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
    Object.keys(classMap).forEach(function(cn){
      var students = classMap[cn];
      var teacher = MOCK_TEACHERS.find(function(t){
        var classId = students[0] && students[0].classId;
        return classId && t.classIds.indexOf(classId)!==-1;
      });
      html += '<div style="background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
      html += '<div><span style="font-size:16px;font-weight:700;color:#1C1917;">'+cn+'</span><span style="font-size:12px;color:#A8A29E;margin-left:8px;">'+students.length+'人</span></div>';
      if(teacher) html += '<span style="font-size:12px;color:#78716C;background:#F5F5F4;border-radius:6px;padding:2px 8px;">'+teacher.name+'</span>';
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
  function renderProjectsTab(){
    var html = '<div style="padding:16px;">';
    var projects = MOCK_PROJECTS.slice();
    // Merge localStorage projects
    try{var lp=JSON.parse(localStorage.getItem('zlc_user_projects')||'[]');lp.forEach(function(p){if(!projects.find(function(x){return x.id===p.id;}))projects.push(p);});}catch(e){}

    var statusMap = {draft:'草稿',open:'募集中',funded:'已满额',active:'运营中',completed:'已完成'};
    var badgeStyles = {draft:'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;',open:'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;',active:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;',completed:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;',funded:'background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;'};
    var members = getMembers();

    projects.forEach(function(p){
      var owner = members.find(function(m){return m.id===p.ownerId;}) || {name:'?'};
      var pct = p.targetAmount>0?Math.round(p.raisedAmount/p.targetAmount*100):0;
      html += '<a href="/projects/'+p.id+'" style="display:block;text-decoration:none;color:inherit;background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:12px;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
      html += '<span style="font-size:15px;font-weight:600;color:#1C1917;">'+p.name+'</span>';
      html += '<span style="'+(badgeStyles[p.status]||'')+';padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">'+(statusMap[p.status]||p.status)+'</span>';
      html += '</div>';
      html += '<div style="display:flex;gap:12px;font-size:13px;color:#78716C;">';
      html += '<span>'+owner.name+'</span><span>¥'+p.targetAmount+'万</span><span>'+pct+'%</span>';
      html += '</div></a>';
    });
    html += '</div>';
    panels.projects.innerHTML = html;
  }

})();
`}} />
    </div>,
    { title: '中流通 - 管理后台' }
  )
})
}
