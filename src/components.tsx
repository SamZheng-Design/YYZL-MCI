// ============================================================
// 中流通 ZhongLiu Connect — Shared Components
// ============================================================
import {
  mockReferrals, mockShareLogs, mockNotifications, mockTeachers,
} from './data'

// ── Global JS Utilities (injected into every page) ─────
const GlobalScripts = () => (
  <script dangerouslySetInnerHTML={{ __html: `
// ── Data Init: ensure localStorage has mock data ──
(function(){
  if(!localStorage.getItem('zlc_referrals')){
    localStorage.setItem('zlc_referrals', ${JSON.stringify(JSON.stringify(mockReferrals))});
  }
  if(!localStorage.getItem('zlc_share_logs')){
    localStorage.setItem('zlc_share_logs', ${JSON.stringify(JSON.stringify(mockShareLogs))});
  }
  if(!localStorage.getItem('zlc_notifications')){
    localStorage.setItem('zlc_notifications', ${JSON.stringify(JSON.stringify(mockNotifications))});
  }
})();

// ── Toast (reuse single element) ──
var _toastEl = null, _toastTimer = null;
function showToast(message, type, duration) {
  type = type || 'success'; duration = duration || 3000;
  if(_toastTimer){ clearTimeout(_toastTimer); _toastTimer = null; }
  if(!_toastEl){
    _toastEl = document.createElement('div');
    _toastEl.className = 'toast toast-' + type;
    document.body.appendChild(_toastEl);
  } else {
    _toastEl.className = 'toast toast-' + type;
  }
  _toastEl.textContent = message;
  requestAnimationFrame(function(){ _toastEl.classList.add('show'); });
  _toastTimer = setTimeout(function(){
    _toastEl.classList.remove('show');
    _toastTimer = null;
  }, duration);
}

// ── Confirm Modal (reuse single overlay) ──
var _confirmOverlay = null;
function showConfirm(opts) {
  if(!_confirmOverlay){
    _confirmOverlay = document.createElement('div');
    _confirmOverlay.className = 'modal-overlay';
    document.body.appendChild(_confirmOverlay);
  }
  _confirmOverlay.innerHTML = '<div class="modal-box">'
    + '<div class="modal-title">' + (opts.title || '确认') + '</div>'
    + (opts.desc ? '<div class="modal-desc">' + opts.desc + '</div>' : '')
    + '<div class="modal-btn-row">'
    + '<button class="modal-btn modal-btn-cancel">取消</button>'
    + '<button class="modal-btn ' + (opts.danger ? 'modal-btn-danger' : 'modal-btn-confirm') + '">确认</button>'
    + '</div></div>';
  _confirmOverlay.classList.add('show');
  function close(){ _confirmOverlay.classList.remove('show'); }
  _confirmOverlay.querySelector('.modal-btn-cancel').onclick = function(){ close(); if(opts.onCancel) opts.onCancel(); };
  _confirmOverlay.querySelector('.modal-btn-confirm').onclick = function(){ close(); if(opts.onConfirm) opts.onConfirm(); };
  _confirmOverlay.addEventListener('click', function handler(e){ if(e.target === _confirmOverlay){ close(); _confirmOverlay.removeEventListener('click', handler); } });
}

// ── Success Modal (green / gold) ──
function showSuccessModal(opts) {
  var colorClass = opts.gold ? 'success-icon-gold' : 'success-icon-green';
  var overlay = document.createElement('div');
  overlay.className = 'success-modal-overlay';
  var confettiHTML = '';
  if(opts.confetti){
    var colors = ['#D4A853','#B8860B','#F5DEB3','#B91C1C','#DC2626'];
    confettiHTML = '<div class="confetti-container">';
    for(var i=0;i<12;i++){
      var c = colors[i%colors.length];
      var left = Math.random()*100;
      var delay = Math.random()*0.8;
      confettiHTML += '<div class="confetti" style="left:'+left+'%;background:'+c+';animation-delay:'+delay.toFixed(2)+'s;"></div>';
    }
    confettiHTML += '</div>';
  }
  overlay.innerHTML = '<div class="success-modal-box">'
    + '<i class="fas fa-check-circle '+colorClass+'"></i>'
    + confettiHTML
    + '<div class="success-title">' + (opts.title || '成功') + '</div>'
    + '<div class="success-sub">' + (opts.sub || '') + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('show'); });
  setTimeout(function(){
    overlay.classList.remove('show');
    setTimeout(function(){ overlay.remove(); if(opts.onDone) opts.onDone(); }, 200);
  }, opts.duration || 2000);
}

// ── Number Animation ──
function animateNumber(el, target, duration, decimals) {
  duration = duration || 600; decimals = decimals || 0;
  var start = 0, startTime = performance.now();
  function update(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (start + (target - start) * eased).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Scroll Reveal + Progress Bars (shared single observer) ──
var _sharedObserver = null;
function _getSharedObserver() {
  if(!_sharedObserver){
    _sharedObserver = new IntersectionObserver(function(entries) {
      for(var i=0;i<entries.length;i++){
        var e = entries[i];
        if(e.isIntersecting){
          if(e.target.classList.contains('reveal')) e.target.classList.add('visible');
          if(e.target.dataset && e.target.dataset.width) e.target.style.width = e.target.dataset.width;
          _sharedObserver.unobserve(e.target);
        }
      }
    }, { threshold: 0.1 });
  }
  return _sharedObserver;
}
function initReveal() {
  var obs = _getSharedObserver();
  var els = document.querySelectorAll('.reveal');
  for(var i=0;i<els.length;i++) obs.observe(els[i]);
}
function initProgressBars() {
  var obs = _getSharedObserver();
  var els = document.querySelectorAll('.progress-fill[data-width]');
  for(var i=0;i<els.length;i++) obs.observe(els[i]);
}

// ── Help Icon Toggle (delegated) ──
var _helpIconsBound = false;
function initHelpIcons() {
  if(_helpIconsBound) return;
  _helpIconsBound = true;
  document.addEventListener('click', function(e) {
    var icon = e.target.closest('.help-icon');
    if(icon){
      e.stopPropagation();
      var helpEl = icon.nextElementSibling;
      if (!helpEl || !helpEl.classList.contains('help-text')) return;
      var wasOpen = helpEl.classList.contains('expanded');
      var allOpen = document.querySelectorAll('.help-text.expanded');
      for(var i=0;i<allOpen.length;i++) allOpen[i].classList.remove('expanded');
      if(!wasOpen) helpEl.classList.add('expanded');
      return;
    }
    // Close all on outside click
    var allOpen = document.querySelectorAll('.help-text.expanded');
    for(var i=0;i<allOpen.length;i++) allOpen[i].classList.remove('expanded');
  });
}

// ── Helper: get current user ID ──
function _getCurrentUserId() {
  try {
    var u = JSON.parse(localStorage.getItem('zlc_user'));
    return u && u.id ? u.id : '';
  } catch(e) { return ''; }
}

// ── Onboarding Carousel ──
function showOnboarding() {
  var userId = _getCurrentUserId();
  if (!userId) return;
  if (localStorage.getItem('zlc_onboarding_done_' + userId)) return;
  var overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.id = 'onboarding-overlay';
  overlay.innerHTML =
    '<button class="onboarding-skip" onclick="finishOnboarding()">跳过</button>'
    + '<div class="onboarding-viewport">'
    + '<div class="onboarding-container" id="ob-container">'
    // Page 1
    + '<div class="onboarding-page">'
    + '<div class="ob-icon-row">'
    + '<div class="ob-icon-circle" style="background:#FEE2E2;"><i class="fas fa-user" style="font-size:32px;color:#B91C1C;"></i></div>'
    + '<i class="fas fa-arrow-right ob-arrow"></i>'
    + '<div class="ob-icon-circle" style="background:#FFFBEB;"><i class="fas fa-coins" style="font-size:32px;color:#D4A853;"></i></div>'
    + '<i class="fas fa-arrow-right ob-arrow"></i>'
    + '<div class="ob-icon-circle" style="background:#F0FDF4;"><i class="fas fa-users" style="font-size:32px;color:#16A34A;"></i></div>'
    + '</div>'
    + '<div class="ob-title">不入股、不借贷</div>'
    + '<div class="ob-title-brand">按收入分成</div>'
    + '<div style="height:16px;"></div>'
    + '<div class="ob-desc">同学的好项目，一起参与</div>'
    + '<div class="ob-desc">项目赚钱了，按约定比例分给你</div>'
    + '</div>'
    // Page 2
    + '<div class="onboarding-page">'
    + '<div class="ob-title" style="margin-bottom:24px;">选择你舒服的方式</div>'
    + '<div style="display:flex;flex-direction:column;gap:12px;max-width:320px;width:100%;">'
    + '<div class="ob-card"><div class="ob-card-icon" style="background:#F0FDF4;"><i class="fas fa-handshake" style="font-size:20px;color:#16A34A;"></i></div><div><div class="ob-card-title">熟人分享</div><div class="ob-card-desc">同学把项目分享给你，直接参与</div></div></div>'
    + '<div class="ob-card"><div class="ob-card-icon" style="background:#EFF6FF;"><i class="fas fa-search" style="font-size:20px;color:#3B82F6;"></i></div><div><div class="ob-card-title">大厅发现</div><div class="ob-card-desc">浏览所有项目，看中就投</div></div></div>'
    + '<div class="ob-card"><div class="ob-card-icon" style="background:#FFFBEB;"><i class="fas fa-user-tie" style="font-size:20px;color:#D97706;"></i></div><div><div class="ob-card-title">老师引荐</div><div class="ob-card-desc">不认识发起人？请老师帮你对接</div></div></div>'
    + '</div>'
    + '</div>'
    // Page 3
    + '<div class="onboarding-page">'
    + '<div class="ob-shield"><i class="fas fa-shield-alt" style="font-size:40px;color:#B91C1C;"></i></div>'
    + '<div class="ob-title" style="margin-bottom:20px;">放心参与</div>'
    + '<div style="display:flex;flex-direction:column;gap:16px;max-width:280px;">'
    + '<div class="ob-feature-row"><i class="fas fa-lock" style="font-size:20px;color:#B91C1C;width:24px;text-align:center;flex-shrink:0;"></i><span class="ob-feature-text">仅限一亿中流认证学员</span></div>'
    + '<div class="ob-feature-row"><i class="fas fa-file-contract" style="font-size:20px;color:#B91C1C;width:24px;text-align:center;flex-shrink:0;"></i><span class="ob-feature-text">标准化电子合同，法律效力</span></div>'
    + '<div class="ob-feature-row"><i class="fas fa-university" style="font-size:20px;color:#B91C1C;width:24px;text-align:center;flex-shrink:0;"></i><span class="ob-feature-text">滴灌通提供基础设施保障</span></div>'
    + '</div>'
    + '<div style="height:24px;"></div>'
    + '<div style="font-size:12px;color:#A8A29E;text-align:center;">滴灌通 × 一亿中流 · 联合出品</div>'
    + '</div>'
    + '</div></div>'
    + '<div class="onboarding-controls">'
    + '<div class="onboarding-dots" id="ob-dots"><div class="onboarding-dot onboarding-dot-active"></div><div class="onboarding-dot"></div><div class="onboarding-dot"></div></div>'
    + '<button class="onboarding-next" id="ob-next-btn" onclick="obNext()">下一步</button>'
    + '</div>';
  document.body.appendChild(overlay);

  var obPage = 0;
  var container = document.getElementById('ob-container');
  var dots = document.querySelectorAll('#ob-dots .onboarding-dot');
  var nextBtn = document.getElementById('ob-next-btn');

  window.obGoTo = function(n) {
    obPage = n;
    container.style.transform = 'translateX(-' + (n * 100) + '%)';
    dots.forEach(function(d, i) {
      d.className = 'onboarding-dot' + (i === n ? ' onboarding-dot-active' : '');
    });
    if (n < 2) {
      nextBtn.className = 'onboarding-next';
      nextBtn.textContent = '下一步';
      nextBtn.onclick = function(){ window.obNext(); };
    } else {
      nextBtn.className = 'onboarding-start';
      nextBtn.textContent = '开始使用';
      nextBtn.onclick = function(){ window.finishOnboarding(); };
    }
  };
  window.obNext = function() {
    if (obPage < 2) window.obGoTo(obPage + 1);
    else window.finishOnboarding();
  };

  // Touch swipe support
  var startX = 0;
  var viewport = overlay.querySelector('.onboarding-viewport');
  viewport.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive: true});
  viewport.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (diff > 50 && obPage < 2) window.obGoTo(obPage + 1);
    if (diff < -50 && obPage > 0) window.obGoTo(obPage - 1);
  });
}

window.finishOnboarding = function() {
  var userId = _getCurrentUserId();
  if (userId) localStorage.setItem('zlc_onboarding_done_' + userId, 'true');
  var overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function(){ overlay.remove(); }, 300);
  }
};

// ── Coach Marks (Focused Bubble Guide) ──
var _coachQueue = [];
var _coachActive = false;

function showCoachMark(targetSelector, text, position, id) {
  var userId = _getCurrentUserId();
  var storageKey = userId ? 'zlc_coach_' + id + '_' + userId : 'zlc_coach_' + id;
  if (localStorage.getItem(storageKey)) return;
  var target = document.querySelector(targetSelector);
  if (!target) return;

  // If another coach is active, queue it
  if (_coachActive) {
    _coachQueue.push({ targetSelector: targetSelector, text: text, position: position, id: id });
    return;
  }
  _coachActive = true;

  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'coach-overlay';
  overlay.id = 'coach-overlay-' + id;

  // Highlight target
  var rect = target.getBoundingClientRect();
  var origPosition = target.style.position;
  var origZIndex = target.style.zIndex;
  var origBoxShadow = target.style.boxShadow;
  var origBorderRadius = target.style.borderRadius;
  target.style.position = 'relative';
  target.style.zIndex = '1501';
  target.style.boxShadow = '0 0 0 4000px rgba(0,0,0,0.6)';
  target.style.borderRadius = '12px';

  // Determine bubble position (auto-adapt)
  var finalPosition = position;
  if (position === 'bottom' && rect.bottom + 180 > window.innerHeight) finalPosition = 'top';
  if (position === 'top' && rect.top < 180) finalPosition = 'bottom';

  // Create bubble
  var bubble = document.createElement('div');
  bubble.className = 'coach-bubble';
  bubble.id = 'coach-bubble-' + id;

  var bubbleLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - 140, window.innerWidth - 296));
  if (finalPosition === 'bottom') {
    bubble.style.top = (rect.bottom + 12) + 'px';
    bubble.style.left = bubbleLeft + 'px';
    bubble.innerHTML = '<div class="coach-arrow-top" style="left:' + Math.min(Math.max(rect.left + rect.width/2 - bubbleLeft, 20), 260) + 'px;transform:none;"></div>';
  } else {
    bubble.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
    bubble.style.left = bubbleLeft + 'px';
    bubble.innerHTML = '<div class="coach-arrow-bottom" style="left:' + Math.min(Math.max(rect.left + rect.width/2 - bubbleLeft, 20), 260) + 'px;transform:none;"></div>';
  }
  bubble.innerHTML += '<div class="coach-bubble-text">' + text + '</div>'
    + '<button class="coach-dismiss-btn" id="coach-dismiss-' + id + '">知道了</button>';

  document.body.appendChild(overlay);
  document.body.appendChild(bubble);

  function dismiss() {
    var dismissUserId = _getCurrentUserId();
    var dismissKey = dismissUserId ? 'zlc_coach_' + id + '_' + dismissUserId : 'zlc_coach_' + id;
    localStorage.setItem(dismissKey, 'true');
    overlay.remove();
    bubble.remove();
    target.style.position = origPosition;
    target.style.zIndex = origZIndex;
    target.style.boxShadow = origBoxShadow;
    target.style.borderRadius = origBorderRadius;
    _coachActive = false;
    // Process next in queue
    if (_coachQueue.length > 0) {
      var next = _coachQueue.shift();
      setTimeout(function(){ showCoachMark(next.targetSelector, next.text, next.position, next.id); }, 400);
    }
  }

  document.getElementById('coach-dismiss-' + id).addEventListener('click', dismiss);
  overlay.addEventListener('click', dismiss);
}

// ── Floating Help Button + FAQ Panel ──
var _helpIdleTimer = null;
function initHelpButton() {
  if (document.getElementById('help-float-btn')) return;
  if (window.location.pathname === '/login') return;
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var firstLogin = localStorage.getItem('zlc_first_login_date');
  if (!firstLogin) {
    firstLogin = new Date().toISOString().slice(0,10);
    localStorage.setItem('zlc_first_login_date', firstLogin);
  }
  var daysSince = Math.floor((Date.now() - new Date(firstLogin).getTime()) / 86400000);
  var manualPref = localStorage.getItem('zlc_help_button_manual');

  var shouldShow = false;
  if (manualPref === 'show') shouldShow = true;
  else if (manualPref === 'hide') shouldShow = false;
  else shouldShow = daysSince <= 7;

  var btn = document.createElement('button');
  btn.id = 'help-float-btn';
  btn.innerHTML = '<i class="fas fa-question" style="font-size:18px;"></i>';
  if (daysSince <= 7) btn.classList.add('help-pulse');
  if (!shouldShow) btn.style.display = 'none';
  btn.addEventListener('click', openFAQPanel);
  document.body.appendChild(btn);

  // Throttled idle timer — show help button after 60s no interaction
  var _lastActivity = Date.now();
  function resetHelpIdle() { _lastActivity = Date.now(); }
  function checkIdle() {
    if (Date.now() - _lastActivity >= 60000) {
      var b = document.getElementById('help-float-btn');
      if (b && b.style.display === 'none') {
        b.style.display = 'flex';
        b.classList.add('pulse-once');
      }
    }
    _helpIdleTimer = setTimeout(checkIdle, 15000);
  }
  document.addEventListener('click', resetHelpIdle, {passive: true});
  document.addEventListener('scroll', resetHelpIdle, {passive: true});
  document.addEventListener('touchstart', resetHelpIdle, {passive: true});
  _helpIdleTimer = setTimeout(checkIdle, 15000);
}

function openFAQPanel() {
  if (document.getElementById('faq-overlay')) {
    document.getElementById('faq-overlay').classList.add('show');
    return;
  }

  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}

  // Find teacher for current user
  var TEACHERS_DATA = null;
  try { TEACHERS_DATA = window.__ZLC_TEACHERS__ || []; } catch(e) { TEACHERS_DATA = []; }
  var myClassId = (u && u.classId) ? u.classId : '';
  var myTeacher = null;
  if (myClassId && TEACHERS_DATA.length) {
    myTeacher = TEACHERS_DATA.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
  }

  var faqs = [
    { q: '收入分成是什么？跟借钱、入股有啥区别？', a: '收入分成是一种轻量合作模式：你出钱参与同学的项目，项目赚钱后按约定比例分给你。不需要入股（不涉及股权变更），也不是借贷（没有利息和还款义务）。分多少取决于项目实际赚多少。' },
    { q: '我怎么参与别人的项目？', a: '三种方式：1.同学直接把分享码发给你，输入后就能查看和参与；2.在项目大厅浏览所有项目，看中直接投；3.不认识发起人的话，点"请老师引荐"，老师帮你们对接后再决定。' },
    { q: '我怎么发起自己的项目？', a: '点底部的"发起"按钮，三步填完：项目信息、分成条款、预览确认。发布后所有同学都能在大厅看到你的项目。你也可以生成分享码发到班级群。' },
    { q: '回款是怎么计算的？', a: '公式很简单：你的月回款 = 项目当月收入 × 分成比例 × 你的份额占比。比如项目月收入50万、分成比例10%、你占所有参与人的5%，你当月回款就是50×10%×5%=0.25万。' },
    { q: '合同有法律效力吗？', a: '有。平台使用标准化电子合同，双方确认签署后即具有法律效力。合同由滴灌通提供基础设施支持。' },
    { q: '如果项目亏了怎么办？', a: '收入分成的特点是：项目赚多少分多少。如果某个月项目收入少，你拿到的分成也少；如果项目长期亏损没有收入，你就没有回款。到合同期限结束，无论是否收回投资，合同自动终止。这和买股票类似，有风险。' },
    { q: '分享码是什么？怎么用？', a: '每个项目都有一个6位分享码（如TH2K9A）。你可以把分享码或分享链接发到微信群，其他同学输入分享码就能直接查看这个项目。这是线上线下结合最方便的方式。' },
    { q: '我想先了解发起人再投，怎么办？', a: '在项目详情页点"请老师引荐"，你的老师会帮你和发起人对接。你们可以线下见面聊聊，了解清楚后再回到平台参与投资。' }
  ];

  var overlay = document.createElement('div');
  overlay.id = 'faq-overlay';

  var teacherHTML = '';
  if (myTeacher) {
    var classNames = myTeacher.classIds ? myTeacher.classIds.map(function(c){ return c.replace('class-','第')+'期'; }).join('、') : '';
    teacherHTML = '<div class="faq-teacher-block">'
      + '<div class="faq-teacher-title">\\uD83D\\uDC68\\u200D\\uD83C\\uDFEB 联系我的老师</div>'
      + '<div class="faq-teacher-name">' + myTeacher.name + ' · ' + classNames + '老师</div>'
      + '<div class="faq-teacher-btns">'
      + '<button class="faq-teacher-btn faq-teacher-btn-msg" id="faq-msg-btn">发消息</button>'
      + '<button class="faq-teacher-btn faq-teacher-btn-call" id="faq-call-btn" data-phone="' + myTeacher.phone + '">拨电话</button>'
      + '</div></div>';
  }

  var faqListHTML = faqs.map(function(f, i) {
    return '<div class="faq-item">'
      + '<div class="faq-q" data-faq-idx="' + i + '">'
      + '<span class="faq-q-text">' + f.q + '</span>'
      + '<i class="fas fa-chevron-down faq-q-icon"></i>'
      + '</div>'
      + '<div class="faq-a"><div class="faq-a-text">' + f.a + '</div></div>'
      + '</div>';
  }).join('');

  overlay.innerHTML = '<div id="faq-panel">'
    + '<div class="faq-drag-bar"></div>'
    + '<div class="faq-header"><span class="faq-title">帮助中心</span><button class="faq-close" id="faq-close-btn">✕</button></div>'
    + faqListHTML
    + teacherHTML
    + '<div class="faq-reset-guide" id="faq-reset-guide">\\uD83D\\uDD04 重新查看使用引导</div>'
    + '</div>';

  document.body.appendChild(overlay);
  // Use void offsetHeight to force layout, then add show class in same frame
  void overlay.offsetHeight;
  overlay.classList.add('show');

  // Close
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeFAQ(); });
  document.getElementById('faq-close-btn').addEventListener('click', closeFAQ);

  // Teacher contact buttons
  var faqMsgBtn = document.getElementById('faq-msg-btn');
  if(faqMsgBtn){
    faqMsgBtn.addEventListener('click', function(){ showToast('消息功能即将上线，请先电话联系老师'); });
  }
  var faqCallBtn = document.getElementById('faq-call-btn');
  if(faqCallBtn){
    faqCallBtn.addEventListener('click', function(){
      var phone = faqCallBtn.getAttribute('data-phone');
      if(phone) window.location.href = 'tel:' + phone;
    });
  }

  // Accordion — only one open
  var openIdx = -1;
  overlay.querySelectorAll('.faq-q').forEach(function(q) {
    q.addEventListener('click', function() {
      var idx = parseInt(q.dataset.faqIdx);
      var allA = overlay.querySelectorAll('.faq-a');
      var allIcons = overlay.querySelectorAll('.faq-q-icon');
      if (openIdx === idx) {
        allA[idx].classList.remove('open');
        allIcons[idx].classList.remove('open');
        openIdx = -1;
      } else {
        allA.forEach(function(a, i){ a.classList.remove('open'); allIcons[i].classList.remove('open'); });
        allA[idx].classList.add('open');
        allIcons[idx].classList.add('open');
        openIdx = idx;
      }
    });
  });

  // Reset guide
  document.getElementById('faq-reset-guide').addEventListener('click', function() {
    var userId = _getCurrentUserId();
    Object.keys(localStorage).forEach(function(key) {
      if (key.indexOf('zlc_coach_') === 0 || key.indexOf('zlc_nudge_') === 0 || key.indexOf('zlc_onboarding_') === 0) {
        // Only clear keys for current user (or old global keys)
        if (!userId || key.indexOf('_' + userId) !== -1 || key === 'zlc_onboarding_done' || !key.match(/_[a-z]-\d+$/)) {
          localStorage.removeItem(key);
        }
      }
    });
    closeFAQ();
    showToast('引导已重置，刷新页面即可重新查看');
    setTimeout(function(){ window.location.reload(); }, 800);
  });
}

function closeFAQ() {
  var ov = document.getElementById('faq-overlay');
  if (ov) { ov.classList.remove('show'); }
}

// ── Smart Nudge System ──
function showNudge(icon, text, id) {
  if (localStorage.getItem('zlc_nudge_' + id)) return;
  if (document.getElementById('nudge-' + id)) return;

  var nudge = document.createElement('div');
  nudge.id = 'nudge-' + id;
  nudge.className = 'nudge-bar';
  nudge.innerHTML = '<span class="nudge-icon">' + icon + '</span>'
    + '<span class="nudge-text">' + text + '</span>'
    + '<button class="nudge-close" data-nudge-id="' + id + '">✕</button>';

  nudge.querySelector('.nudge-close').addEventListener('click', function(){ closeNudge(id); });

  document.body.appendChild(nudge);
  // Single rAF is enough — the element needs one frame to be in DOM before transition triggers
  requestAnimationFrame(function(){ nudge.classList.add('show'); });

  // Auto-dismiss after 8s
  setTimeout(function(){ closeNudge(id); }, 8000);
}

function closeNudge(id) {
  localStorage.setItem('zlc_nudge_' + id, 'true');
  var nudge = document.getElementById('nudge-' + id);
  if (nudge) {
    nudge.classList.remove('show');
    setTimeout(function(){ if(nudge.parentNode) nudge.remove(); }, 220);
  }
}

// Init on page load — defer non-critical work
document.addEventListener('DOMContentLoaded', function(){
  initReveal();
  initProgressBars();
  initHelpIcons();
  // Defer help button init to not block first paint
  setTimeout(initHelpButton, 100);
  // Init navbar user dropdown
  setTimeout(initNavUserDropdown, 50);
});

// ── Navbar User Dropdown ──
function initNavUserDropdown() {
  var btn = document.getElementById('nav-user-btn');
  var dropdown = document.getElementById('nav-user-dropdown');
  var nameEl = document.getElementById('nav-dd-name');
  var roleEl = document.getElementById('nav-dd-role');
  var switchBtn = document.getElementById('nav-dd-switch');
  var logoutBtn = document.getElementById('nav-dd-logout');
  if(!btn || !dropdown) return;

  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if(!u) { btn.style.display = 'none'; return; }

  // Set avatar initial
  btn.textContent = u.name ? u.name.charAt(0) : '?';

  // Set dropdown info
  if(nameEl) nameEl.textContent = u.name || '';
  if(roleEl) {
    var roleMap = {member:'学员',teacher:'老师',admin:'管理员'};
    var roleText = roleMap[u.role] || '学员';
    if(u.className) roleText += ' · ' + u.className;
    else if(u.cohort) roleText += ' · ' + u.cohort;
    roleEl.textContent = roleText;
  }

  // Toggle dropdown
  var isOpen = false;
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    isOpen = !isOpen;
    dropdown.style.display = isOpen ? 'block' : 'none';
  });

  // Bell unread count (filtered by role/id)
  var bellDot = document.getElementById('nav-bell-dot');
  if(bellDot){
    var allNotifs = [];
    try { allNotifs = JSON.parse(localStorage.getItem('zlc_notifications') || '[]'); } catch(e){}
    if(!allNotifs || allNotifs.length === 0){
      try { allNotifs = JSON.parse(localStorage.getItem('zlc_notifications')); } catch(e){}
    }
    // Filter: global (both null) OR targetId matches OR (targetRole matches AND targetId null)
    var myNotifs = allNotifs.filter(function(n){
      if(n.targetRole === null && n.targetId === null) return true;
      if(n.targetId === u.id) return true;
      if(n.targetRole === u.role && n.targetId === null) return true;
      return false;
    });
    var unreadCount = myNotifs.filter(function(n){ return !n.read; }).length;
    if(unreadCount > 0){
      bellDot.style.display = 'block';
      bellDot.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
    } else {
      bellDot.style.display = 'none';
    }
  }

  // Close on outside click
  document.addEventListener('click', function(e){
    if(isOpen && !dropdown.contains(e.target) && e.target !== btn){
      isOpen = false;
      dropdown.style.display = 'none';
    }
  });

  // Switch account: only clear zlc_current_user and zlc_user, keep onboarding
  if(switchBtn){
    switchBtn.addEventListener('click', function(){
      localStorage.removeItem('zlc_current_user');
      localStorage.removeItem('zlc_user');
      localStorage.removeItem('zlc_token');
      window.location.href = '/login';
    });
  }

  // Logout: clear zlc_current_user + zlc_user
  if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
      localStorage.removeItem('zlc_current_user');
      localStorage.removeItem('zlc_user');
      localStorage.removeItem('zlc_token');
      window.location.href = '/login';
    });
  }
}
`}} />
)

// ── Favicon handler ──
export const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#DC2626"/></linearGradient></defs><circle cx="44" cy="28" r="22" fill="url(#a)"/><circle cx="36" cy="44" r="22" fill="url(#b)" opacity=".85"/></svg>`

const LogoSVG = ({ size = 40 }: { size?: number }) => (
  <svg width={String(size)} height={String(size)} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zlc-gt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DC2626" />
        <stop offset="100%" stop-color="#B91C1C" />
      </linearGradient>
      <linearGradient id="zlc-gb" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#991B1B" />
        <stop offset="100%" stop-color="#DC2626" />
      </linearGradient>
    </defs>
    <circle cx="44" cy="28" r="22" fill="url(#zlc-gt)" />
    <circle cx="36" cy="44" r="22" fill="url(#zlc-gb)" opacity="0.85" />
  </svg>
)

const Navbar = () => (
  <nav class="app-navbar">
    <a href="/" class="flex items-center gap-2" style="text-decoration:none;">
      <LogoSVG size={24} />
      <span class="font-bold text-brand" style="font-size:17px; font-family:'Noto Sans SC',sans-serif;">
        中流通
      </span>
    </a>
    <div style="display:flex;align-items:center;gap:8px;">
      {/* Demo guide button (Task 5) */}
      <span id="nav-demo-btn" style="font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.08);border-radius:8px;padding:4px 10px;cursor:pointer;display:none;" />
      <button id="nav-bell" class="flex items-center justify-center" style="width:36px;height:36px;background:none;border:none;cursor:pointer;position:relative;" onclick="window.location.href='/notifications'">
        <i class="fas fa-bell" style="font-size:18px;color:#78716C;" />
        <span id="nav-bell-dot" style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#DC2626;color:#fff;font-size:10px;font-weight:700;border-radius:8px;text-align:center;line-height:16px;padding:0 3px;display:none;" />
      </button>
      {/* User avatar button with dropdown */}
      <div id="nav-user-wrap" style="position:relative;">
        <button id="nav-user-btn" style="width:32px;height:32px;border-radius:50%;background:#B91C1C;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" />
        <div id="nav-user-dropdown" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);min-width:200px;padding:8px 0;z-index:1000;">
          <div id="nav-dd-userinfo" style="padding:16px;border-bottom:1px solid #F5F5F4;">
            <div id="nav-dd-name" style="font-size:15px;font-weight:600;color:#1C1917;" />
            <div id="nav-dd-role" style="font-size:12px;color:#78716C;margin-top:2px;" />
          </div>
          <a href="/profile" style="display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:14px;color:#44403C;text-decoration:none;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='transparent'">
            👤 个人主页
          </a>
          <div id="nav-dd-switch" style="padding:12px 16px;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='transparent'">
            🔄 切换账号
          </div>
          <div style="border-top:1px solid #F5F5F4;margin:4px 0;" />
          <div id="nav-dd-logout" style="padding:12px 16px;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='transparent'">
            🚪 退出登录
          </div>
        </div>
      </div>
    </div>
    {/* Demo button init script */}
    <script dangerouslySetInnerHTML={{ __html: `
(function(){
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
    var demoBtn = document.getElementById('nav-demo-btn');
    if(!cu || !demoBtn) return;
    var guideMap = { member:'/guide/member', teacher:'/guide/teacher', admin:'/guide/admin' };
    var href = guideMap[cu.role] || '/guide/member';
    demoBtn.textContent = '📖 演示';
    demoBtn.style.display = 'inline-block';
    demoBtn.addEventListener('click', function(){ window.location.href = href; });
  } catch(e){}
})();
`}} />
  </nav>
)

const TabBar = ({ active }: { active: string }) => {
  return (
    <div class="tab-bar" id="zlc-tabbar">
      {/* TabBar content rendered dynamically via client JS based on role */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var activeKey = '${active}';
  var role = 'member';
  try { var cu = JSON.parse(localStorage.getItem('zlc_current_user')); if(cu && cu.role) role = cu.role; } catch(e){}

  var tabBar = document.getElementById('zlc-tabbar');
  if(!tabBar) return;

  // Define tabs per role
  var memberTabs = [
    { key:'home', icon:'fa-home', label:'首页', href:'/' },
    { key:'projects', icon:'fa-store', label:'大厅', href:'/projects' },
    { key:'create', icon:'fa-plus', label:'发起', href:'/create', isCenter:true },
    { key:'repayments', icon:'fa-coins', label:'回款', href:'/repayments' },
    { key:'profile', icon:'fa-user', label:'我的', href:'/profile' }
  ];
  var teacherTabs = [
    { key:'teacher', svg:'class', label:'我的班级', href:'/teacher' },
    { key:'projects', icon:'fa-store', label:'大厅', href:'/projects' },
    { key:'create', icon:'fa-plus', label:'发起', href:'/create', isCenter:true },
    { key:'repayments', icon:'fa-coins', label:'回款', href:'/repayments' },
    { key:'profile', icon:'fa-user', label:'我的', href:'/profile' }
  ];
  var adminTabs = [
    { key:'admin', svg:'dashboard', label:'工作台', href:'/admin' },
    { key:'profile', svg:'gear', label:'设置', href:'/profile' }
  ];

  var tabs = role === 'admin' ? adminTabs : (role === 'teacher' ? teacherTabs : memberTabs);

  // SVG icons
  var svgIcons = {
    'class': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    'dashboard': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    'gear': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
  };

  // For admin: center the 2 tabs
  if(role === 'admin'){
    tabBar.style.justifyContent = 'center';
    tabBar.style.gap = '60px';
  }

  var html = '';
  tabs.forEach(function(t){
    var isActive = t.key === activeKey;
    var cls = isActive ? 'tab-active' : 'tab-inactive';
    if(t.isCenter){
      html += '<a href="'+t.href+'" class="'+cls+'" style="text-decoration:none;">';
      html += '<div class="tab-center-btn"><i class="fas '+t.icon+'"></i></div>';
      html += '<span class="tab-item-label" style="margin-top:2px;">'+t.label+'</span></a>';
    } else if(t.svg && svgIcons[t.svg]){
      html += '<a href="'+t.href+'" class="'+cls+'" style="text-decoration:none;'+(role==='admin'?'flex:none;width:80px;':'')+'">';
      html += '<span class="tab-item-icon" style="display:inline-flex;">'+svgIcons[t.svg]+'</span>';
      html += '<span class="tab-item-label">'+t.label+'</span></a>';
    } else {
      html += '<a href="'+t.href+'" class="'+cls+'" style="text-decoration:none;">';
      html += '<i class="fas '+(t.icon||'')+' tab-item-icon"></i>';
      html += '<span class="tab-item-label">'+t.label+'</span></a>';
    }
  });
  // Remove the script tag itself first, then set innerHTML
  var scripts = tabBar.querySelectorAll('script');
  scripts.forEach(function(s){ s.remove(); });
  tabBar.innerHTML = html;
})();
`}} />
    </div>
  )
}

const AuthCheckScript = () => (
  <script dangerouslySetInnerHTML={{
    __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) { window.location.href = '/login'; }
})();
`}} />
)


const PlaceholderPage = ({ tabKey, title, icon, desc }: { tabKey: string; title: string; icon: string; desc: string }) => (
  <div class="has-tabbar">
    <AuthCheckScript />
    <Navbar />
    <main class="px-4 pt-16 pb-4 max-w-lg mx-auto text-center">
      <div class="flex items-center justify-center mb-4">
        <div class="flex items-center justify-center rounded-2xl bg-brand-soft" style="width:64px;height:64px;">
          <i class={`fas ${icon} text-brand`} style="font-size:28px;" />
        </div>
      </div>
      <h2 class="font-bold text-text-title mb-2" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;">{title}</h2>
      <p class="text-text-secondary mb-6" style="font-size:14px;">{desc}</p>
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-soft text-brand" style="font-size:13px;font-weight:500;">
        <i class="fas fa-hammer" style="font-size:12px;" />
        功能开发中，敬请期待
      </div>
    </main>
    <TabBar active={tabKey} />
  </div>
)

const statusLabel: Record<string, string> = { open: '募集中', funded: '已满额', active: '运营中', completed: '已完成' }
const StatusBadge = ({ status }: { status: string }) => (
  <span class={`badge badge-${status}`}>{statusLabel[status] || status}</span>
)

export { GlobalScripts, LogoSVG, Navbar, TabBar, AuthCheckScript, PlaceholderPage, StatusBadge, statusLabel }
