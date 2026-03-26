// Route: /teacher — Phase 1C: API-driven skeleton (zero DB calls)
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, LogoSVG, Navbar, TabBar, AuthCheckScript,
} from '../components'

export function registerTeacherRoute(app: Hono<HonoEnv>) {
app.get('/teacher', async (c) => {
  // ═══ NO DB calls — pure HTML skeleton ═══
  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      {/* Teacher-only: redirect non-teacher users */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_user'));
    if(!cu || cu.role !== 'teacher'){ window.location.replace('/'); return; }
  } catch(e){ window.location.replace('/login'); }
})();
`}} />
      <GlobalScripts />
      {/* Navbar */}
      <nav class="app-navbar">
        <a href="/teacher" class="flex items-center gap-2" style="text-decoration:none;">
          <LogoSVG size={24} />
          <span class="font-bold text-brand" style="font-size:17px; font-family:'Noto Sans SC',sans-serif;">
            中流通
          </span>
        </a>
        <div style="display:flex;align-items:center;gap:8px;">
          <span onclick="window.location.href='/guide/teacher'" style="font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.08);border-radius:8px;padding:4px 10px;cursor:pointer;">📖 演示</span>
          <span id="teacher-nav-title" style="font-size:14px;color:#78716C;"></span>
        </div>
      </nav>

      <main class="max-w-lg mx-auto px-4 pt-4 pb-8 page-enter dk-teacher-main">
        {/* Welcome Card skeleton */}
        <div id="teacher-welcome-card" class="animate-pulse" style="padding:20px 16px;margin-bottom:12px;">
          <div style="height:20px;background:#F5F5F4;border-radius:8px;width:50%;margin-bottom:10px;" />
          <div style="height:14px;background:#F5F5F4;border-radius:6px;width:70%;" />
        </div>

        {/* Stats Bar skeleton */}
        <div id="teacher-stats-bar" class="animate-pulse" style="display:flex;gap:0;background:white;border-radius:14px;margin:0 0 12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
          <div style="flex:1;text-align:center;padding:16px 8px;border-right:1px solid #F5F5F4;"><div style="height:22px;background:#F5F5F4;border-radius:6px;width:40%;margin:0 auto 6px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;margin:0 auto;" /></div>
          <div style="flex:1;text-align:center;padding:16px 8px;border-right:1px solid #F5F5F4;"><div style="height:22px;background:#F5F5F4;border-radius:6px;width:40%;margin:0 auto 6px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;margin:0 auto;" /></div>
          <div style="flex:1;text-align:center;padding:16px 8px;"><div style="height:22px;background:#F5F5F4;border-radius:6px;width:40%;margin:0 auto 6px;" /><div style="height:11px;background:#F5F5F4;border-radius:4px;width:50%;margin:0 auto;" /></div>
        </div>

        {/* Header */}
        <div class="teacher-header" id="teacher-header">
          <div class="teacher-header-name" id="th-name">老师</div>
          <div class="teacher-header-sub" id="th-sub">加载中...</div>
        </div>

        {/* Referral Requests */}
        <div class="teacher-card" id="referral-section">
          <div class="teacher-card-title">
            <span>引荐请求</span>
            <span class="ref-badge" id="ref-badge" style="display:none;">0</span>
          </div>
          <div id="referral-tabs" style="display:flex;gap:0;margin-bottom:12px;background:#F5F5F4;border-radius:10px;padding:3px;">
            <button id="ref-tab-pending" style="flex:1;padding:8px 0;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#fff;color:#B91C1C;box-shadow:0 1px 2px rgba(0,0,0,0.05);" onclick="switchRefTab('pending')">待处理</button>
            <button id="ref-tab-completed" style="flex:1;padding:8px 0;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#78716C;" onclick="switchRefTab('completed')">已处理</button>
          </div>
          <div id="referral-list">
            <div class="animate-pulse" style="padding:16px;">
              <div style="height:14px;background:#F5F5F4;border-radius:4px;width:60%;margin-bottom:8px;" />
              <div style="height:14px;background:#F5F5F4;border-radius:4px;width:40%;" />
            </div>
          </div>
        </div>

        {/* My Classes */}
        <div class="teacher-card" id="classes-section">
          <div class="teacher-card-title"><span>我的班级</span></div>
          <div id="class-list" class="animate-pulse">
            <div style="height:40px;background:#F5F5F4;border-radius:8px;margin-bottom:8px;" />
            <div style="height:40px;background:#F5F5F4;border-radius:8px;" />
          </div>
        </div>

        {/* Recommend Projects */}
        <div class="teacher-card" id="recommend-section">
          <div class="teacher-card-title"><span>推荐项目给我的学员</span></div>
          <p style="font-size:12px;color:#78716C;margin-bottom:14px;">推荐后，你管理的班级学员会在大厅看到「老师推荐」金色标签</p>
          <div id="recommended-list" class="teacher-recommend-list"></div>
          <button id="btn-recommend-new" style="width:100%;margin-top:12px;padding:10px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;color:#B91C1C;font-size:14px;font-weight:600;cursor:pointer;">推荐新项目</button>
        </div>

        {/* Footer */}
        <div class="teacher-footer">
          <button id="teacher-logout-btn" class="teacher-logout-btn">退出登录</button>
          <div class="teacher-footer-text">滴灌通 × 一亿中流 · 联合出品</div>
        </div>
      </main>

      <TabBar active="teacher" />

      {/* Recommend Panel Overlay */}
      <div id="recommend-overlay" class="dk-modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:1100;">
        <div id="recommend-panel" class="dk-modal-panel" style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:20px 20px 0 0;max-height:70vh;overflow-y:auto;padding:24px;transform:translateY(100%);transition:transform 300ms ease-out;">
          <div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:0 auto 20px;"></div>
          <div style="font-size:18px;font-weight:600;color:#1C1917;margin-bottom:16px;">选择要推荐的项目</div>
          <div id="recommend-project-list"></div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u || u.role !== 'teacher') { window.location.href = '/login'; return; }

  // Fetch all needed data in parallel from APIs
  Promise.all([
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();}),
    fetch('/api/data/teachers').then(function(r){return r.json();}),
    fetch('/api/data/referrals').then(function(r){return r.json();})
  ]).then(function(results){
    var ALL_PROJECTS = (results[0].ok ? results[0].data : []).map(function(p){ return {id:p.id,name:p.name,ownerId:p.ownerId,industry:p.industry,status:p.status,recommendedByTeacher:p.recommendedByTeacher||[]}; });
    var ALL_MEMBERS = (results[1].ok ? results[1].data : []).map(function(m){ return {id:m.id,name:m.name,company:m.company,industry:m.industry,classId:m.classId||'',className:m.className||''}; });
    var ALL_TEACHERS = (results[2].ok ? results[2].data : []).map(function(t){ return {id:t.id,name:t.name,phone:t.phone,classIds:t.classIds||[]}; });
    var ALL_REFERRALS = (results[3].ok ? results[3].data : []).map(function(r){ return {id:r.id,projectId:r.projectId,requesterId:r.requesterId,requesterName:r.requesterName||'',requesterClass:r.requesterClass||'',teacherId:r.teacherId,status:r.status,message:r.message||'',createdAt:r.createdAt||'',requestedAt:r.requestedAt||'',completedAt:r.completedAt||'',completedNote:r.completedNote||'',connectedAt:r.connectedAt||'',projectName:r.projectName||''}; });

    // Set teachers for navbar renderer
    window.__ZLC_TEACHERS__ = ALL_TEACHERS;

    renderTeacherPage(ALL_PROJECTS, ALL_MEMBERS, ALL_TEACHERS, ALL_REFERRALS);
  }).catch(function(err){
    console.error('Failed to load teacher data:', err);
    document.getElementById('th-sub').textContent = '数据加载失败，请刷新重试';
  });

  function renderTeacherPage(ALL_PROJECTS, ALL_MEMBERS, ALL_TEACHERS, ALL_REFERRALS){
  var myTeacher = ALL_TEACHERS.find(function(t){ return t.id === u.id; });
  if (!myTeacher) { myTeacher = { id: u.id, name: u.name, classIds: u.classIds || [] }; }

  // Header
  document.getElementById('th-name').textContent = u.name + '老师';
  var myStudents = ALL_MEMBERS.filter(function(m){ return myTeacher.classIds.indexOf(m.classId) !== -1; });
  var classCount = myTeacher.classIds.length;
  document.getElementById('th-sub').textContent = '管理 ' + classCount + ' 个班级 · ' + myStudents.length + ' 位学员';
  document.getElementById('teacher-nav-title').textContent = u.name + '老师的工作台';

  // ── Teacher Welcome Card ──
  (function(){
    var h = new Date().getHours();
    var greeting = (h >= 6 && h < 12) ? '早上好' : (h >= 12 && h < 18) ? '下午好' : (h >= 18 && h < 24) ? '晚上好' : '夜深了';
    var wcEl = document.getElementById('teacher-welcome-card');
    if(wcEl){
      wcEl.className = '';
      wcEl.innerHTML = '<div style="font-size:20px;font-weight:700;color:#1C1917;">' + greeting + '，' + u.name + '</div>'
        + '<div style="margin-top:8px;font-size:13px;color:#78716C;">您负责 ' + classCount + ' 个班级，共 ' + myStudents.length + ' 位学员</div>'
        + '<div style="margin-top:12px;display:flex;gap:10px;">'
        + '<a href="/guide/teacher" style="text-decoration:none;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:10px;padding:8px 14px;font-size:13px;color:#44403C;cursor:pointer;display:inline-block;">📖 查看演示</a>'
        + '<a href="/projects" style="text-decoration:none;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:10px;padding:8px 14px;font-size:13px;color:#44403C;cursor:pointer;display:inline-block;">📊 项目大厅</a>'
        + '</div>';
    }
  })();

  // ── Teacher Stats Bar ──
  (function(){
    var pendingCount = ALL_REFERRALS.filter(function(r){ return r.teacherId === myTeacher.id && r.status === 'pending'; }).length;
    var recommendedCount = ALL_PROJECTS.filter(function(p){ return p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1; }).length;
    var myClassIds = myTeacher.classIds || [];
    var activeProjectCount = 0;
    ALL_PROJECTS.forEach(function(p){
      if(p.status === 'open' || p.status === 'active'){
        var ownerMember = ALL_MEMBERS.find(function(m){ return m.id === p.ownerId; });
        if(ownerMember && myClassIds.indexOf(ownerMember.classId) !== -1) activeProjectCount++;
      }
    });
    var statsEl = document.getElementById('teacher-stats-bar');
    if(statsEl){
      statsEl.className = '';
      statsEl.innerHTML = '<div style="flex:1;text-align:center;padding:16px 8px;border-right:1px solid #F5F5F4;">'
        + '<div style="font-size:22px;font-weight:700;color:#DC2626;">' + pendingCount + '</div>'
        + '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">待引荐</div></div>'
        + '<div style="flex:1;text-align:center;padding:16px 8px;border-right:1px solid #F5F5F4;">'
        + '<div style="font-size:22px;font-weight:700;color:#D4A853;">' + recommendedCount + '</div>'
        + '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">已推荐</div></div>'
        + '<div style="flex:1;text-align:center;padding:16px 8px;">'
        + '<div style="font-size:22px;font-weight:700;color:#3B82F6;">' + activeProjectCount + '</div>'
        + '<div style="font-size:11px;color:#A8A29E;margin-top:2px;">进行中</div></div>';
    }
  })();

  // ── Referral Requests ──
  var currentRefTab = 'pending';
  window.switchRefTab = function(tab){
    currentRefTab = tab;
    var pendingBtn = document.getElementById('ref-tab-pending');
    var completedBtn = document.getElementById('ref-tab-completed');
    if(tab === 'pending'){
      pendingBtn.style.background = '#fff'; pendingBtn.style.color = '#B91C1C'; pendingBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      completedBtn.style.background = 'transparent'; completedBtn.style.color = '#78716C'; completedBtn.style.boxShadow = 'none';
    } else {
      completedBtn.style.background = '#fff'; completedBtn.style.color = '#B91C1C'; completedBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      pendingBtn.style.background = 'transparent'; pendingBtn.style.color = '#78716C'; pendingBtn.style.boxShadow = 'none';
    }
    renderReferrals();
  };

  function renderReferrals() {
    var myRefs = ALL_REFERRALS.filter(function(r){ return r.teacherId === myTeacher.id; });
    var pending = myRefs.filter(function(r){ return r.status === 'pending'; });
    var completed = myRefs.filter(function(r){ return r.status === 'completed' || r.status === 'connected'; });
    pending.sort(function(a,b){ return new Date(b.createdAt || b.requestedAt || 0) - new Date(a.createdAt || a.requestedAt || 0); });
    completed.sort(function(a,b){ return new Date(b.completedAt || b.connectedAt || 0) - new Date(a.completedAt || a.connectedAt || 0); });
    var badge = document.getElementById('ref-badge');
    if (pending.length > 0) { badge.style.display = 'inline-flex'; badge.textContent = pending.length; } else { badge.style.display = 'none'; }
    var items = currentRefTab === 'pending' ? pending : completed;
    var listEl = document.getElementById('referral-list');
    if (items.length === 0){
      var emptyMsg = currentRefTab === 'pending' ? '暂无待处理的引荐请求' : '暂无已处理的引荐记录';
      listEl.innerHTML = '<div style="text-align:center;padding:16px;font-size:14px;color:#78716C;">' + emptyMsg + '</div>';
      return;
    }
    listEl.innerHTML = items.map(function(r) {
      var project = ALL_PROJECTS.find(function(p){ return p.id === r.projectId; });
      var projectOwner = project ? ALL_MEMBERS.find(function(m){ return m.id === project.ownerId; }) : null;
      var ownerName = projectOwner ? projectOwner.name : '';
      var dateStr = r.createdAt || r.requestedAt || '';
      var html = '<div class="ref-request-item">';
      html += '<div class="ref-person-row"><div class="ref-avatar">' + r.requesterName.charAt(0) + '</div>';
      html += '<span style="font-size:14px;color:#1C1917;">' + r.requesterName + '</span>';
      html += '<span style="font-size:12px;color:#A8A29E;">' + (r.requesterClass || '') + '</span></div>';
      html += '<div style="font-size:12px;color:#A8A29E;margin:4px 0;">想了解项目</div>';
      html += '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">';
      html += '<span style="font-size:14px;font-weight:600;color:#1C1917;">' + r.projectName + '</span>';
      if(ownerName) html += '<span style="font-size:12px;color:#78716C;">(发起人: ' + ownerName + ')</span>';
      html += '</div>';
      if(r.message) html += '<div class="ref-msg-block">\\uD83D\\uDCAC ' + r.message + '</div>';
      html += '<div style="font-size:11px;color:#A8A29E;margin-top:6px;">' + dateStr + '</div>';
      if(currentRefTab === 'pending'){
        html += '<div class="ref-btn-row">';
        html += '<button class="ref-btn ref-btn-connected" onclick="handleRef(\\'' + r.id + '\\',\\'completed\\')">已对接</button>';
        html += '<button class="ref-btn ref-btn-decline" onclick="handleRef(\\'' + r.id + '\\',\\'declined\\')">暂缓</button>';
        html += '</div>';
      } else {
        var completedInfo = r.completedNote || r.completedAt || '已完成';
        var completedDate = r.completedAt || r.connectedAt || '';
        html += '<div style="margin-top:8px;padding:8px 12px;background:#F0FDF4;border-radius:8px;font-size:12px;color:#16a34a;">';
        html += '\\u2705 ' + completedInfo;
        if(completedDate) html += ' <span style="color:#A8A29E;">(' + completedDate + ')</span>';
        html += '</div>';
      }
      html += '</div>';
      return html;
    }).join('');
  }

  window.handleRef = function(refId, newStatus) {
    fetch('/api/admin/referrals/' + refId + '/handle', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: newStatus === 'connected' ? 'completed' : newStatus })
    }).then(function(r){return r.json();}).then(function(res){
      if(res.ok){
        var ref = ALL_REFERRALS.find(function(r){ return r.id === refId; });
        if(ref){
          ref.status = newStatus === 'connected' ? 'completed' : newStatus;
          if(newStatus === 'completed' || newStatus === 'connected'){
            var today = new Date();
            ref.completedAt = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
            ref.completedNote = '已完成对接';
          }
        }
        showToast(res.message || (newStatus === 'completed' || newStatus === 'connected' ? '已标记为已对接' : '已暂缓'));
        renderReferrals();
      } else { showToast(res.error || '操作失败', 'error'); }
    }).catch(function(){ showToast('网络错误', 'error'); });
  };
  renderReferrals();

  // ── My Classes ──
  var classListEl = document.getElementById('class-list');
  classListEl.className = '';
  var classMap = {};
  myTeacher.classIds.forEach(function(cid) {
    var className = cid.replace('class-', '第') + '期';
    var students = ALL_MEMBERS.filter(function(m){ return m.classId === cid; });
    classMap[cid] = { name: className, students: students };
  });
  var classHTML = '';
  Object.keys(classMap).forEach(function(cid, ci) {
    var cls = classMap[cid];
    classHTML += '<button class="class-expand-btn" onclick="toggleClass(' + ci + ')">';
    classHTML += '<span><span style="font-weight:600;">' + cls.name + '</span> <span style="font-size:13px;color:#78716C;">' + cls.students.length + '位学员</span></span>';
    classHTML += '<i class="fas fa-chevron-down" style="font-size:12px;color:#A8A29E;transition:transform 200ms;" id="class-arrow-' + ci + '"></i>';
    classHTML += '</button>';
    classHTML += '<div class="class-students" id="class-students-' + ci + '">';
    cls.students.forEach(function(s) {
      classHTML += '<div class="class-student-row">';
      classHTML += '<div class="ref-avatar-sm">' + s.name.charAt(0) + '</div>';
      classHTML += '<span>' + s.name + '</span>';
      classHTML += '<span style="color:#78716C;">' + (s.company||'') + '</span>';
      classHTML += '<span style="color:#A8A29E;font-size:12px;">' + (s.industry||'') + '</span>';
      classHTML += '</div>';
    });
    classHTML += '</div>';
  });
  classListEl.innerHTML = classHTML;
  if(Object.keys(classMap).length > 0){
    var firstEl = document.getElementById('class-students-0');
    var firstArrow = document.getElementById('class-arrow-0');
    if(firstEl){ firstEl.classList.add('open'); }
    if(firstArrow){ firstArrow.style.transform = 'rotate(180deg)'; }
  }
  window.toggleClass = function(idx) {
    var el = document.getElementById('class-students-' + idx);
    var arrow = document.getElementById('class-arrow-' + idx);
    if (el.classList.contains('open')) { el.classList.remove('open'); arrow.style.transform = 'rotate(0)'; }
    else { el.classList.add('open'); arrow.style.transform = 'rotate(180deg)'; }
  };

  // ── Recommend Projects ──
  function renderRecommended() {
    var recommended = [];
    ALL_PROJECTS.forEach(function(p) {
      if (p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1) {
        var owner = ALL_MEMBERS.find(function(m){ return m.id === p.ownerId; });
        recommended.push({ id: p.id, name: p.name, ownerName: owner ? owner.name : '?' });
      }
    });
    var listEl = document.getElementById('recommended-list');
    if (recommended.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:12px;font-size:13px;color:#A8A29E;">暂无推荐项目</div>';
      return;
    }
    listEl.innerHTML = recommended.map(function(r) {
      return '<div class="teacher-recommend-item">'
        + '<div><div class="teacher-recommend-text">' + r.name + '</div><div class="teacher-recommend-sub">发起人: ' + r.ownerName + '</div></div>'
        + '<button class="teacher-recommend-remove" onclick="removeRecommend(\\'' + r.id + '\\')">取消推荐</button>'
        + '</div>';
    }).join('');
  }

  window.removeRecommend = function(pid) {
    fetch('/api/admin/projects/' + pid + '/recommend', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ teacherId: myTeacher.id, action: 'remove' })
    }).then(function(r){return r.json();}).then(function(res){
      if(res.ok){
        var proj = ALL_PROJECTS.find(function(p){ return p.id === pid; });
        if(proj) proj.recommendedByTeacher = proj.recommendedByTeacher.filter(function(t){ return t !== myTeacher.id; });
        showToast('已取消推荐');
        renderRecommended();
      } else { showToast(res.error || '操作失败', 'error'); }
    }).catch(function(){ showToast('网络错误', 'error'); });
  };
  renderRecommended();

  // Recommend new project panel
  var recOverlay = document.getElementById('recommend-overlay');
  var recPanel = document.getElementById('recommend-panel');
  document.getElementById('btn-recommend-new').addEventListener('click', function() {
    var openProjects = ALL_PROJECTS.filter(function(p){ return p.status === 'open'; });
    var listEl = document.getElementById('recommend-project-list');
    if (openProjects.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#78716C;">暂无可推荐的项目</div>';
    } else {
      listEl.innerHTML = openProjects.map(function(p) {
        var owner = ALL_MEMBERS.find(function(m){ return m.id === p.ownerId; });
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F5F5F4;">'
          + '<div><div style="font-size:14px;font-weight:500;color:#1C1917;">' + p.name + '</div>'
          + '<div style="font-size:12px;color:#78716C;">' + (owner ? owner.name : '?') + ' · ' + (p.industry||'') + '</div></div>'
          + '<button onclick="doRecommend(\\'' + p.id + '\\')" style="padding:6px 14px;background:#B91C1C;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">推荐</button>'
          + '</div>';
      }).join('');
    }
    recOverlay.style.display = 'block';
    void recPanel.offsetHeight;
    recPanel.style.transform = 'translateY(0)';
  });
  recOverlay.addEventListener('click', function(e) {
    if (e.target === recOverlay) { recPanel.style.transform = 'translateY(100%)'; setTimeout(function(){ recOverlay.style.display = 'none'; }, 250); }
  });

  window.doRecommend = function(pid) {
    fetch('/api/admin/projects/' + pid + '/recommend', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ teacherId: myTeacher.id, action: 'add' })
    }).then(function(r){return r.json();}).then(function(res){
      if(res.ok){
        var proj = ALL_PROJECTS.find(function(p){ return p.id === pid; });
        if(proj && proj.recommendedByTeacher.indexOf(myTeacher.id) === -1) proj.recommendedByTeacher.push(myTeacher.id);
        showToast('已推荐');
        recPanel.style.transform = 'translateY(100%)';
        setTimeout(function(){ recOverlay.style.display = 'none'; }, 250);
        renderRecommended();
      } else { showToast(res.error || '操作失败', 'error'); }
    }).catch(function(){ showToast('网络错误', 'error'); });
  };

  // Logout
  document.getElementById('teacher-logout-btn').addEventListener('click', function(){
    showConfirm({
      title: '确认退出登录？',
      desc: '退出后需要重新验证手机号登录',
      danger: true,
      onConfirm: function(){
        localStorage.removeItem('zlc_user');
        localStorage.removeItem('zlc_token');
        window.location.href = '/login';
      }
    });
  });
  } // end renderTeacherPage
})();
`}} />
    </div>,
    { title: '中流通 - 老师工作台' }
  )
})
}
