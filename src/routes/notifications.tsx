// Route: /notifications
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, AuthCheckScript,
} from '../components'

export function registerNotificationsRoute(app: Hono<HonoEnv>) {
app.get('/notifications', (c) => {
  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />

      {/* Top bar */}
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:#fff;border-bottom:1px solid #F5F5F4;position:sticky;top:0;z-index:100;">
        <div style="display:flex;align-items:center;gap:12px;">
          <a href="/" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;text-decoration:none;">
            <i class="fas fa-arrow-left" style="font-size:16px;color:#1C1917;" />
          </a>
          <span style="font-size:17px;font-weight:600;color:#1C1917;">消息通知</span>
        </div>
        <button id="mark-all-read" style="background:none;border:none;cursor:pointer;font-size:13px;color:#B91C1C;font-weight:500;">全部已读</button>
      </div>

      {/* Notification list */}
      <div id="notification-list" style="background:#fff;min-height:calc(100vh - 56px);" />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) { window.location.href = '/login'; return; }

  var NOTIFS_KEY = 'zlc_notifications';

  // Relative time helper
  function relativeTime(dateStr){
    if(!dateStr) return '';
    var now = new Date();
    var d = new Date(dateStr);
    var diffMs = now - d;
    var diffMin = Math.floor(diffMs / 60000);
    if(diffMin < 1) return '刚刚';
    if(diffMin < 60) return diffMin + '分钟前';
    var diffHour = Math.floor(diffMin / 60);
    if(diffHour < 24) return diffHour + '小时前';
    var diffDay = Math.floor(diffHour / 24);
    if(diffDay < 30) return diffDay + '天前';
    var diffMonth = Math.floor(diffDay / 30);
    if(diffMonth < 12) return diffMonth + '个月前';
    return Math.floor(diffMonth / 12) + '年前';
  }

  // Load notifications from D1 API
  var allNotifs = [];
  var notifs = [];

  function loadNotifications(){
    fetch('/api/data/notifications').then(function(r){return r.json();}).then(function(d){
      if(!d.ok) return;
      allNotifs = d.data || [];
      // Filter by current user: global, or targetId match, or role match
      notifs = allNotifs.filter(function(n){
        if(!n.targetRole && !n.targetId) return true;
        if(n.targetId === u.id) return true;
        if(n.targetRole === u.role && (!n.targetId)) return true;
        return false;
      });
      // Sort by time descending
      notifs.sort(function(a,b){ return new Date(b.time||b.createdAt) - new Date(a.time||a.createdAt); });
      renderList();
    }).catch(function(){
      // Fallback to localStorage
      try { allNotifs = JSON.parse(localStorage.getItem(NOTIFS_KEY) || '[]'); } catch(e){}
      notifs = allNotifs.filter(function(n){
        if(!n.targetRole && !n.targetId) return true;
        if(n.targetId === u.id) return true;
        if(n.targetRole === u.role && (!n.targetId)) return true;
        return false;
      });
      notifs.sort(function(a,b){ return new Date(b.time) - new Date(a.time); });
      renderList();
    });
  }

  var listEl = document.getElementById('notification-list');
  var markAllBtn = document.getElementById('mark-all-read');

  function renderList(){
    if(!notifs || notifs.length === 0){
      listEl.innerHTML = '<div style="text-align:center;padding:80px 0;">'
        +'<div style="font-size:64px;color:#D6D3D1;margin-bottom:16px;">\\uD83D\\uDD14</div>'
        +'<p style="font-size:15px;color:#A8A29E;">暂无消息</p>'
        +'</div>';
      return;
    }

    var html = '';
    notifs.forEach(function(n){
      var dotHTML = !n.read
        ? '<div style="width:8px;height:8px;border-radius:50%;background:#B91C1C;flex-shrink:0;margin-top:6px;"></div>'
        : '<div style="width:8px;flex-shrink:0;"></div>';
      var titleColor = !n.read ? 'color:#B91C1C;' : 'color:#1C1917;';
      var linkAttr = n.link ? 'data-link="'+n.link+'"' : '';
      var timeDisplay = relativeTime(n.time);
      html += '<div class="notif-item" data-id="'+n.id+'" '+linkAttr+' style="padding:16px;border-bottom:1px solid #F5F5F4;cursor:pointer;display:flex;gap:10px;transition:background 0.15s;" onmouseover="this.style.background=\\'#FAFAF9\\'" onmouseout="this.style.background=\\'transparent\\'">'
        + dotHTML
        + '<div style="flex:1;min-width:0;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<span style="font-size:15px;font-weight:600;'+titleColor+'">'+n.title+'</span>'
        + '<span style="font-size:16px;flex-shrink:0;margin-left:8px;">'+n.icon+'</span>'
        + '</div>'
        + '<div style="font-size:13px;color:#57534E;margin-top:4px;line-height:1.5;">'+n.content+'</div>'
        + '<div style="font-size:12px;color:#A8A29E;margin-top:6px;">'+timeDisplay+'</div>'
        + '</div>'
        + '</div>';
    });
    listEl.innerHTML = html;

    // Bind click handlers
    listEl.querySelectorAll('.notif-item').forEach(function(item){
      item.addEventListener('click', function(){
        var nid = item.getAttribute('data-id');
        var link = item.getAttribute('data-link');
        // Mark as read in the full allNotifs array
        allNotifs.forEach(function(n){ if(n.id === nid) n.read = true; });
        // Also mark in filtered view
        notifs.forEach(function(n){ if(n.id === nid) n.read = true; });
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(allNotifs));
        if(link) window.location.href = link;
        else renderList();
      });
    });
  }

  // Mark all read
  markAllBtn.addEventListener('click', function(){
    // Mark all MY visible notifs as read
    var myIds = {};
    notifs.forEach(function(n){ myIds[n.id] = true; n.read = true; });
    allNotifs.forEach(function(n){ if(myIds[n.id]) n.read = true; });
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(allNotifs));
    renderList();
    showToast('已全部标为已读');
  });

  loadNotifications();
})();
`}} />
    </div>,
    { title: '中流通 - 消息通知' }
  )
})
}
