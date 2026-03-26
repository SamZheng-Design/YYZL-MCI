import { jsxRenderer } from 'hono/jsx-renderer'
import { AIAssistantScript } from './ai-assistant'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title || '中流通'}</title>

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><circle cx='44' cy='28' r='22' fill='%23DC2626'/><circle cx='36' cy='44' r='22' fill='%23991B1B' opacity='0.85'/></svg>" />

        {/* DNS Prefetch for CDN domains */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />

        {/* Tailwind CSS (locally built, production-ready) — loaded first, no network */}
        <link rel="stylesheet" href="/static/tailwind.css" />

        {/* System font stack — no external font loading, instant rendering
            Chinese: PingFang SC (macOS/iOS), Microsoft YaHei (Windows), Noto Sans SC (Android/Linux)
            English: system-ui auto-selects the best system font */}
        {/* FontAwesome — deferred with media trick */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          media="print"
          onload="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
        </noscript>

        {/* Global Styles — extracted to external CSS for caching + smaller Worker bundle */}
        <link rel="stylesheet" href="/static/app.css" />


      </head>
      <body class="bg-surface-page text-text-primary">

        {/* ══ Splash Screen ══ */}
        <div id="splash-screen" dangerouslySetInnerHTML={{__html: `
          <style>
            #splash-screen {
              position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;
              background:linear-gradient(160deg,#7F1D1D 0%,#B91C1C 40%,#991B1B 70%,#7F1D1D 100%);
              display:flex;align-items:center;justify-content:center;
              opacity:1;transition:none;
            }
            #splash-screen::before {
              content:'';position:absolute;inset:0;
              background-image:repeating-radial-gradient(circle at 1px 1px,rgba(255,255,255,0.07) 0px,transparent 1px);
              background-size:3px 3px;opacity:0.05;pointer-events:none;
            }
            #splash-screen .sp-line-top {
              position:absolute;top:0;left:50%;width:1px;height:80px;
              background:linear-gradient(180deg,transparent,rgba(255,255,255,0.3),transparent);
              transform:translateX(-50%) scaleY(0);transform-origin:top;
              animation:splash-line-grow 1000ms ease-out 200ms forwards;
            }
            #splash-screen .sp-line-bot {
              position:absolute;bottom:0;left:50%;width:1px;height:80px;
              background:linear-gradient(0deg,transparent,rgba(255,255,255,0.3),transparent);
              transform:translateX(-50%) scaleY(0);transform-origin:bottom;
              animation:splash-line-grow 1000ms ease-out 200ms forwards;
            }
            #splash-screen .sp-center {
              display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
              position:relative;z-index:1;
            }
            #splash-screen .sp-brand {
              display:flex;align-items:center;justify-content:center;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 0ms forwards;
            }
            #splash-screen .sp-brand-text {
              font-size:28px;font-weight:800;color:#fff;letter-spacing:4px;
              font-family:'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;
            }
            #splash-screen .sp-brand-x {
              font-size:28px;font-weight:300;color:rgba(255,255,255,0.6);margin:0 12px;
            }
            #splash-screen .sp-product {
              font-size:18px;font-weight:500;color:rgba(255,255,255,0.5);letter-spacing:8px;margin-top:16px;
              font-family:'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 400ms forwards;
            }
            #splash-screen .sp-slogan {
              font-size:14px;font-weight:400;color:rgba(255,255,255,0.7);letter-spacing:3px;font-style:italic;margin-top:24px;
              font-family:system-ui,-apple-system,sans-serif;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 800ms forwards;
            }
            #splash-screen .sp-dots {
              display:flex;gap:8px;justify-content:center;margin-top:40px;
              opacity:0;animation:splash-fade-in 500ms ease-out 1200ms forwards;
            }
            #splash-screen .sp-dot {
              width:6px;height:6px;border-radius:50%;background:#fff;
              animation:splash-dot-bounce 600ms ease-in-out infinite;
            }
            #splash-screen .sp-dot:nth-child(2){animation-delay:150ms;}
            #splash-screen .sp-dot:nth-child(3){animation-delay:300ms;}

            #splash-screen.sp-dots-hide .sp-dots {
              opacity:0 !important;transition:opacity 300ms ease;
            }
            #splash-screen.sp-out {
              opacity:0 !important;transition:opacity 500ms ease-in !important;
            }

            #zlc-page-wrap {opacity:0;transition:opacity 400ms ease;}
            #zlc-page-wrap.sp-visible {opacity:1;}

            @keyframes splash-fade-in {
              from {opacity:0;transform:translateY(20px);}
              to {opacity:1;transform:translateY(0);}
            }
            @keyframes splash-dot-bounce {
              0%,100% {transform:translateY(0);}
              50% {transform:translateY(-8px);}
            }
            @keyframes splash-line-grow {
              from {transform:translateX(-50%) scaleY(0);}
              to {transform:translateX(-50%) scaleY(1);}
            }
          </style>
          <div class="sp-line-top"></div>
          <div class="sp-line-bot"></div>
          <div class="sp-center">
            <div class="sp-brand">
              <span class="sp-brand-text">\u6EF4\u704C\u901A</span>
              <span class="sp-brand-x">\u00D7</span>
              <span class="sp-brand-text">\u4E00\u4EBF\u4E2D\u6D41</span>
            </div>
            <div class="sp-product">\u4E2D\u6D41\u901A</div>
            <div class="sp-slogan">Connect All Possibilities</div>
            <div class="sp-dots"><div class="sp-dot"></div><div class="sp-dot"></div><div class="sp-dot"></div></div>
          </div>
        `}} />

        {/* ══ Page Content (hidden until splash finishes) ══ */}
        <div id="zlc-page-wrap">
          {/* ══ Desktop Sidebar (hidden on mobile/tablet via CSS) ══ */}
          <aside class="desktop-sidebar" id="desktop-sidebar" style="display:none;">
            <div class="ds-brand">
              <div class="ds-brand-logo">
                <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ds-gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient>
                    <linearGradient id="ds-gb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#DC2626"/></linearGradient>
                  </defs>
                  <circle cx="44" cy="28" r="22" fill="url(#ds-gt)"/>
                  <circle cx="36" cy="44" r="22" fill="url(#ds-gb)" opacity="0.85"/>
                </svg>
                <span class="ds-brand-name">中流通</span>
              </div>
              <div class="ds-brand-sub">滴灌通 × 一亿中流</div>
            </div>
            <nav class="ds-nav" id="ds-nav-menu">
              {/* Populated by JS based on role */}
            </nav>
            <div class="ds-stats" id="ds-stats">
              {/* Populated by JS */}
            </div>
            <div class="ds-user" id="ds-user-area">
              <div class="ds-user-avatar" id="ds-user-avatar">?</div>
              <div class="ds-user-info">
                <div class="ds-user-name" id="ds-user-name">用户</div>
                <div class="ds-user-role" id="ds-user-role">学员</div>
              </div>
              <button class="ds-user-switch" id="ds-user-switch">切换</button>
            </div>
          </aside>

          {/* ══ Desktop Top Bar (hidden on mobile/tablet via CSS) ══ */}
          <div class="desktop-topbar" id="desktop-topbar" style="display:none;">
            <div class="dt-title" id="dt-page-title">首页</div>
            <div class="dt-actions">
              <button class="dt-demo-btn" id="dt-demo-btn" style="display:none;">📖 演示</button>
              <button class="dt-bell" id="dt-bell" onclick="window.location.href='/notifications'">
                <i class="fas fa-bell" style="font-size:18px;color:#78716C;"></i>
                <span class="dt-bell-dot" id="dt-bell-dot"></span>
              </button>
              <button id="dt-user-btn" style="width:32px;height:32px;border-radius:50%;background:#B91C1C;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;"></button>
            </div>
          </div>

          {children}
        </div>

        {/* ══ Desktop Sidebar + TopBar init logic ══ */}
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  // Only run on desktop (≥1025px)
  if(window.innerWidth < 1025) return;

  var path = window.location.pathname;

  // Mark body for login/guide pages
  if(path === '/login') {
    document.body.classList.add('is-login-page');
    // Force html element scrollable — CSS :has() may not be supported in all browsers
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    return;
  }
  if(path.indexOf('/guide') === 0) { document.body.classList.add('is-guide-page'); return; }

  // Show sidebar and topbar
  var sidebar = document.getElementById('desktop-sidebar');
  var topbar = document.getElementById('desktop-topbar');
  if(sidebar) sidebar.style.display = '';
  if(topbar) topbar.style.display = '';

  // ── Get user data ──
  var u = null, cu = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  try { cu = JSON.parse(localStorage.getItem('zlc_current_user')); } catch(e){}
  var role = (cu && cu.role) ? cu.role : 'member';

  // ── Build nav menu ──
  var memberTabs = [
    { icon:'🏠', label:'首页', href:'/', key:'/' },
    { icon:'🏛', label:'项目大厅', href:'/projects', key:'/projects' },
    { icon:'➕', label:'发起项目', href:'/create', key:'/create' },
    { icon:'💰', label:'回款', href:'/repayments', key:'/repayments' },
    { icon:'👤', label:'我的', href:'/profile', key:'/profile' }
  ];
  var teacherTabs = [
    { icon:'📋', label:'我的班级', href:'/teacher', key:'/teacher' },
    { icon:'🏛', label:'项目大厅', href:'/projects', key:'/projects' },
    { icon:'➕', label:'发起项目', href:'/create', key:'/create' },
    { icon:'💰', label:'回款', href:'/repayments', key:'/repayments' },
    { icon:'👤', label:'我的', href:'/profile', key:'/profile' }
  ];
  var adminTabs = [
    { icon:'📊', label:'管理工作台', href:'/admin', key:'/admin' },
    { icon:'⚙️', label:'个人设置', href:'/profile', key:'/profile' }
  ];

  var tabs = role === 'admin' ? adminTabs : (role === 'teacher' ? teacherTabs : memberTabs);
  var navEl = document.getElementById('ds-nav-menu');
  if(navEl){
    var html = '';
    tabs.forEach(function(t){
      var isActive = path === t.key || (t.key !== '/' && path.indexOf(t.key) === 0);
      // Special: for home, exact match only
      if(t.key === '/' && path !== '/') isActive = false;
      html += '<a class="ds-nav-item' + (isActive ? ' ds-active' : '') + '" href="' + t.href + '">';
      html += '<span class="ds-nav-icon">' + t.icon + '</span>';
      html += '<span>' + t.label + '</span></a>';
    });
    navEl.innerHTML = html;
  }

  // ── Stats ──
  var statsEl = document.getElementById('ds-stats');
  if(statsEl){
    // Fetch stats from API
    fetch('/api/projects').then(function(r){return r.json();}).then(function(d){
      if(!d.ok) return;
      var projects = d.projects || [];
      var active = projects.filter(function(p){return p.status==='open'||p.status==='active'||p.status==='funded';}).length;
      var totalAmt = 0;
      projects.forEach(function(p){ totalAmt += (p.targetAmount || 0); });
      fetch('/api/members').then(function(r2){return r2.json();}).then(function(d2){
        var memberCount = (d2.ok && d2.members) ? d2.members.length : 0;
        statsEl.innerHTML = '<div class="ds-stats-line">📦 ' + active + ' 个进行中项目</div>'
          + '<div class="ds-stats-line">👥 ' + memberCount + ' 位学员</div>'
          + '<div class="ds-stats-line">💰 累计融资 ¥' + Math.round(totalAmt) + '万</div>';
      });
    }).catch(function(){});
  }

  // ── User area ──
  if(u){
    var avatarEl = document.getElementById('ds-user-avatar');
    var nameEl = document.getElementById('ds-user-name');
    var roleEl = document.getElementById('ds-user-role');
    if(avatarEl) avatarEl.textContent = u.name ? u.name.charAt(0) : '?';
    if(nameEl) nameEl.textContent = u.name || '用户';
    var roleMap = {member:'学员',teacher:'老师',admin:'管理员'};
    if(roleEl) roleEl.textContent = roleMap[role] || '学员';
  }
  var switchBtn = document.getElementById('ds-user-switch');
  if(switchBtn){
    switchBtn.addEventListener('click', function(){
      localStorage.removeItem('zlc_current_user');
      localStorage.removeItem('zlc_user');
      localStorage.removeItem('zlc_token');
      window.location.href = '/login';
    });
  }

  // ── Page title ──
  var titleMap = {
    '/': '首页', '/projects': '项目大厅', '/create': '发起项目',
    '/repayments': '回款', '/profile': '我的', '/admin': '管理工作台',
    '/teacher': '我的班级', '/notifications': '通知中心',
    '/investments': '我的投资'
  };
  var titleEl = document.getElementById('dt-page-title');
  if(titleEl){
    var pageTitle = titleMap[path];
    if(!pageTitle && path.indexOf('/projects/') === 0) pageTitle = '项目详情';
    if(!pageTitle && path.indexOf('/contract') === 0) pageTitle = '合同签署';
    if(!pageTitle && path.indexOf('/revenue') === 0) pageTitle = '收入报告';
    if(!pageTitle && path.indexOf('/share') === 0) pageTitle = '分享';
    titleEl.textContent = pageTitle || '中流通';
  }

  // ── Demo button ──
  var demoBtn = document.getElementById('dt-demo-btn');
  if(demoBtn && cu){
    var guideMap = { member:'/guide/member', teacher:'/guide/teacher', admin:'/guide/admin' };
    var guideHref = guideMap[role] || '/guide/member';
    demoBtn.style.display = 'inline-block';
    demoBtn.addEventListener('click', function(){ window.location.href = guideHref; });
  }

  // ── Bell unread (from D1 API) ──
  var bellDot = document.getElementById('dt-bell-dot');
  if(bellDot && u){
    fetch('/api/data/notifications/unread-count')
      .then(function(r){ return r.json(); })
      .then(function(d){
        var unreadCount = d.count || 0;
        if(unreadCount > 0){
          bellDot.style.display = 'block';
          bellDot.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        } else {
          bellDot.style.display = 'none';
        }
      }).catch(function(){ bellDot.style.display = 'none'; });
  }

  // ── Desktop user btn ──
  var dtUserBtn = document.getElementById('dt-user-btn');
  if(dtUserBtn && u){
    dtUserBtn.textContent = u.name ? u.name.charAt(0) : '?';
    dtUserBtn.addEventListener('click', function(){ window.location.href = '/profile'; });
  }
})();
`}} />

        {/* ══ Splash dismiss logic ══ */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            var sp = document.getElementById('splash-screen');
            var pw = document.getElementById('zlc-page-wrap');
            if(!sp) { if(pw) pw.classList.add('sp-visible'); return; }
            if(sessionStorage.getItem('zlc_splash_done')){
              sp.style.display='none';
              if(pw) pw.classList.add('sp-visible');
              return;
            }
            sessionStorage.setItem('zlc_splash_done','1');
            setTimeout(function(){
              sp.classList.add('sp-dots-hide');
              setTimeout(function(){
                sp.classList.add('sp-out');
                if(pw) pw.classList.add('sp-visible');
                setTimeout(function(){ sp.style.display='none'; }, 520);
              }, 300);
            }, 3000);
          })();
        `}} />

        {/* ══ AI Assistant (智能助理浮窗) ══ */}
        <AIAssistantScript />
      </body>
    </html>
  )
})
