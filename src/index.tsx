// ============================================================
// 中流通 ZhongLiu Connect — Main Entry
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import guide from './guide'
import {
  mockMembers, mockProjects, mockRepayments,
  mockContracts, mockRevenueReports, mockRepaymentRecords,
  mockTeachers, mockReferrals,
  getTeacherForMember, isSameClass, findProjectByShareCode,
  getRelationTag, getRelevanceScore,
  getUserStats, getProjectStats, calculateRBF, distributeRevenue,
  DEMO_VERIFY_CODE,
} from './data'
import type { Member, Teacher, Project, Contract, RevenueReport, RepaymentRecord, DistributionResult, RelationTag, Referral } from './data'

const app = new Hono()

// ── Global JS Utilities (injected into every page) ─────
const GlobalScripts = () => (
  <script dangerouslySetInnerHTML={{ __html: `
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

  // Bell unread dot
  var bellDot = document.getElementById('nav-bell-dot');
  if(bellDot){
    var unread = localStorage.getItem('zlc_unread_notifications');
    if(unread === null) unread = 'true';
    bellDot.style.display = (unread === 'true') ? 'block' : 'none';
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

// ── Favicon ──────────────────────────────────────────────
app.get('/favicon.ico', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#DC2626"/></linearGradient></defs><circle cx="44" cy="28" r="22" fill="url(#a)"/><circle cx="36" cy="44" r="22" fill="url(#b)" opacity=".85"/></svg>`
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.use(renderer)

// ══════════════════════════════════════════════════════════
// JSX Components
// ══════════════════════════════════════════════════════════

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

// ── Navbar ────────────────────────────────────────────────
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
        <span id="nav-bell-dot" style="position:absolute;top:4px;right:4px;width:8px;height:8px;background:#DC2626;border-radius:50%;border:2px solid #fff;display:none;" />
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

// ── Tab Bar ───────────────────────────────────────────────
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

// ── Auth Check Script ─────────────────────────────────────
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

// ══════════════════════════════════════════════════════════
// API Routes
// ══════════════════════════════════════════════════════════

app.post('/api/login', async (c) => {
  try {
    const { phone, code } = await c.req.json<{ phone: string; code: string }>()
    if (!phone || !code) return c.json({ ok: false, error: '请输入手机号和验证码' }, 400)
    if (code !== DEMO_VERIFY_CODE) return c.json({ ok: false, error: '验证码错误' }, 400)

    // Check members first
    const member = mockMembers.find((m) => m.phone === phone)
    if (member) {
      return c.json({
        ok: true,
        member: {
          id: member.id, name: member.name, phone: member.phone,
          company: member.company, industry: member.industry,
          title: member.title, bio: member.bio, cohort: member.cohort,
          joinDate: member.joinDate, role: member.role || 'member',
          classId: member.classId || '', className: member.className || '',
        },
      })
    }

    // Check teachers
    const teacher = mockTeachers.find((t) => t.phone === phone)
    if (teacher) {
      return c.json({
        ok: true,
        member: {
          id: teacher.id, name: teacher.name, phone: teacher.phone,
          company: '一亿中流', industry: '教育管理',
          title: '班主任', bio: '一亿中流班主任老师', cohort: '导师团队',
          joinDate: '2023-01-01', role: 'teacher' as string,
          classIds: teacher.classIds,
        },
      })
    }

    return c.json({ ok: false, error: '该手机号未认证为一亿中流学员' }, 403)
  } catch { return c.json({ ok: false, error: '请求格式错误' }, 400) }
})

app.get('/api/members', (c) => {
  const members = mockMembers.filter((m) => m.status === 'active')
    .map(({ id, name, company, industry, title, cohort }) => ({ id, name, company, industry, title, cohort }))
  return c.json({ ok: true, members })
})

app.get('/api/projects', (c) => c.json({ ok: true, projects: mockProjects }))

app.get('/api/user-stats/:id', (c) => {
  const stats = getUserStats(c.req.param('id'))
  return c.json({ ok: true, stats })
})

// ══════════════════════════════════════════════════════════
// Pages
// ══════════════════════════════════════════════════════════

// ── Login ─────────────────────────────────────────────────
app.get('/login', (c) => {
  return c.render(
    <div>
      <GlobalScripts />
      {/* Full-screen gradient background */}
      <div style="position:fixed;inset:0;background:linear-gradient(135deg,#7F1D1D 0%,#B91C1C 50%,#991B1B 100%);" />

      <div style="position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;">
        {/* Glass card */}
        <div id="login-card" style="max-width:460px;width:90%;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:40px 32px;opacity:0;transform:translateY(30px);animation:loginCardIn 600ms ease-out forwards;">

          {/* Part 1: Brand */}
          <div style="text-align:center;">
            <div style="color:white;font-size:32px;font-weight:800;letter-spacing:4px;font-family:'Noto Sans SC',sans-serif;">中流通</div>
            <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:8px;">一亿中流 · 私董会项目投资平台</div>
          </div>

          {/* Part 2: Role Selection */}
          <div style="margin-top:36px;">
            <div style="color:white;font-size:16px;font-weight:600;text-align:center;">选择您的身份</div>
            <div id="role-cards" style="display:flex;gap:12px;margin-top:16px;">
              <div class="login-role-card login-role-selected" data-role="member" style="width:33.33%;padding:20px 12px;border-radius:16px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.2);border:2px solid #D4A853;transition:all 0.2s;">
                <div style="font-size:36px;">🎓</div>
                <div style="font-size:14px;color:white;font-weight:600;margin-top:8px;">学员</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;">发起项目 · 参与投资</div>
              </div>
              <div class="login-role-card" data-role="teacher" style="width:33.33%;padding:20px 12px;border-radius:16px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.08);border:2px solid transparent;transition:all 0.2s;">
                <div style="font-size:36px;">👨‍🏫</div>
                <div style="font-size:14px;color:white;font-weight:600;margin-top:8px;">老师</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;">班级管理 · 引荐对接</div>
              </div>
              <div class="login-role-card" data-role="admin" style="width:33.33%;padding:20px 12px;border-radius:16px;text-align:center;cursor:pointer;background:rgba(255,255,255,0.08);border:2px solid transparent;transition:all 0.2s;">
                <div style="font-size:36px;">⚙️</div>
                <div style="font-size:14px;color:white;font-weight:600;margin-top:8px;">管理员</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:4px;">平台管理 · 数据总览</div>
              </div>
            </div>
          </div>

          {/* Part 3: Demo Quick Accounts */}
          <div style="margin-top:28px;">
            <div style="color:rgba(255,255,255,0.7);font-size:13px;text-align:center;">快捷体验账号</div>
            <div id="demo-accounts" style="margin-top:12px;" />
          </div>

          {/* Part 4: Phone Login Fold */}
          <div style="margin-top:24px;">
            <div id="phone-login-toggle" style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;cursor:pointer;user-select:none;">使用手机号登录 ▾</div>
            <div id="phone-login-area" style="max-height:0;overflow:hidden;transition:max-height 300ms ease;opacity:0;">
              <div style="padding-top:16px;">
                <input id="phone-input" type="tel" maxlength={11} placeholder="请输入手机号" autocomplete="tel" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                <div style="display:flex;gap:10px;margin-top:12px;">
                  <input id="code-input" type="text" maxlength={6} placeholder="请输入验证码" autocomplete="one-time-code" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                  <button id="send-code-btn" type="button" style="white-space:nowrap;background:transparent;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.85);border-radius:12px;padding:0 16px;font-size:13px;cursor:pointer;flex-shrink:0;">获取验证码</button>
                </div>
                <button id="login-btn" type="button" style="width:100%;margin-top:16px;background:linear-gradient(135deg,#D4A853,#B8860B);color:white;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;cursor:pointer;">登录</button>
              </div>
            </div>
          </div>

          {/* Part 5: Footer */}
          <div style="margin-top:32px;text-align:center;color:rgba(255,255,255,0.35);font-size:11px;">
            滴灌通 × 一亿中流 · 联合出品
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
@keyframes loginCardIn {
  from { opacity:0; transform:translateY(30px); }
  to   { opacity:1; transform:translateY(0); }
}
#phone-login-area input::placeholder { color:rgba(255,255,255,0.4); }
.login-role-card:hover { background:rgba(255,255,255,0.15)!important; }
.login-role-selected { background:rgba(255,255,255,0.2)!important; border-color:#D4A853!important; }
`}} />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  // ── Demo account data ──
  var DEMO_ACCOUNTS = {
    member: [
      { id:'m-001', name:'张明远', info:'第12期 · 项目发起人', phone:'13800001111', role:'member', classId:'class-12', className:'第12期' },
      { id:'m-002', name:'李芳华', info:'第12期 · 投资参与人', phone:'13800002222', role:'member', classId:'class-12', className:'第12期' },
      { id:'m-003', name:'王建国', info:'第14期 · 项目发起人', phone:'13800003333', role:'member', classId:'class-14', className:'第14期' }
    ],
    teacher: [
      { id:'t-001', name:'刘老师', info:'负责第12期、第14期', phone:'18011111111', role:'teacher', classIds:['class-12','class-14'] },
      { id:'t-002', name:'陈老师', info:'负责第16期', phone:'18022222222', role:'teacher', classIds:['class-10','class-11'] }
    ],
    admin: [
      { id:'m-admin', name:'平台管理员', info:'系统管理', phone:'19900001111', role:'admin', classId:'class-admin', className:'管理组' }
    ]
  };

  var currentRole = 'member';

  // ── Role card selection ──
  var roleCards = document.querySelectorAll('.login-role-card');
  roleCards.forEach(function(card){
    card.addEventListener('click', function(){
      roleCards.forEach(function(c){
        c.classList.remove('login-role-selected');
        c.style.background = 'rgba(255,255,255,0.08)';
        c.style.borderColor = 'transparent';
      });
      card.classList.add('login-role-selected');
      card.style.background = 'rgba(255,255,255,0.2)';
      card.style.borderColor = '#D4A853';
      currentRole = card.getAttribute('data-role');
      renderAccounts();
    });
  });

  // ── Render demo accounts ──
  function renderAccounts(){
    var container = document.getElementById('demo-accounts');
    var accounts = DEMO_ACCOUNTS[currentRole] || [];
    container.innerHTML = accounts.map(function(acc){
      var initial = acc.name.charAt(0);
      return '<div class="demo-account-row" data-account-id="' + acc.id + '" style="display:flex;align-items:center;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,0.1);margin-bottom:8px;cursor:pointer;transition:background 0.2s;">'
        + '<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);color:white;font-weight:700;font-size:16px;text-align:center;line-height:40px;flex-shrink:0;">' + initial + '</div>'
        + '<div style="flex:1;margin-left:12px;">'
        + '<div style="font-size:14px;color:white;font-weight:600;">' + acc.name + '</div>'
        + '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;">' + acc.info + '</div>'
        + '</div>'
        + '<button class="demo-login-btn" data-account-id="' + acc.id + '" style="font-size:12px;color:#D4A853;border:1px solid rgba(212,168,83,0.4);border-radius:8px;padding:4px 12px;background:transparent;cursor:pointer;transition:background 0.2s;flex-shrink:0;">一键登录</button>'
        + '</div>';
    }).join('');

    // Hover effects
    container.querySelectorAll('.demo-account-row').forEach(function(row){
      row.addEventListener('mouseenter', function(){ row.style.background = 'rgba(255,255,255,0.18)'; });
      row.addEventListener('mouseleave', function(){ row.style.background = 'rgba(255,255,255,0.1)'; });
    });
    container.querySelectorAll('.demo-login-btn').forEach(function(btn){
      btn.addEventListener('mouseenter', function(){ btn.style.background = 'rgba(212,168,83,0.15)'; });
      btn.addEventListener('mouseleave', function(){ btn.style.background = 'transparent'; });
    });

    // Click handler for quick login
    container.querySelectorAll('.demo-account-row').forEach(function(row){
      row.addEventListener('click', function(e){
        var accId = row.getAttribute('data-account-id');
        quickLogin(accId);
      });
    });
  }

  function quickLogin(accId){
    var allAccounts = DEMO_ACCOUNTS.member.concat(DEMO_ACCOUNTS.teacher).concat(DEMO_ACCOUNTS.admin);
    var acc = allAccounts.find(function(a){ return a.id === accId; });
    if(!acc) return;

    // Build user object compatible with existing zlc_user format
    var userData;
    if(acc.role === 'teacher'){
      userData = {
        id: acc.id, name: acc.name, phone: acc.phone, role: 'teacher',
        company: '一亿中流', industry: '教育管理', title: '班主任',
        bio: '一亿中流班主任老师', cohort: '导师团队', joinDate: '2023-01-01',
        classIds: acc.classIds
      };
    } else if(acc.role === 'admin'){
      userData = {
        id: acc.id, name: acc.name, phone: acc.phone, role: 'admin',
        company: '一亿中流', industry: '平台管理', title: '平台管理员',
        bio: '一亿中流平台管理员', cohort: '管理团队', joinDate: '2023-01-01',
        classId: acc.classId, className: acc.className
      };
    } else {
      // member — use demo data directly
      userData = {
        id: acc.id, name: acc.name, phone: acc.phone, role: 'member',
        company: '一亿中流学员', industry: '综合', title: '学员',
        bio: '一亿中流私董会学员', cohort: acc.className || '',
        joinDate: '2024-01-01',
        classId: acc.classId || '', className: acc.className || ''
      };
    }

    // Store zlc_current_user
    var currentUserData = { id: acc.id, name: acc.name, phone: acc.phone, role: acc.role, classId: acc.classId || '', className: acc.className || '' };
    if(acc.classIds) currentUserData.classIds = acc.classIds;
    localStorage.setItem('zlc_current_user', JSON.stringify(currentUserData));
    localStorage.setItem('zlc_user', JSON.stringify(userData));
    localStorage.setItem('zlc_token', 'demo-token-' + Date.now());

    // Redirect based on role
    if(acc.role === 'teacher'){
      window.location.href = '/teacher';
    } else if(acc.role === 'admin'){
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  }

  renderAccounts();

  // ── Phone login fold toggle ──
  var toggleEl = document.getElementById('phone-login-toggle');
  var areaEl = document.getElementById('phone-login-area');
  var phoneExpanded = false;
  toggleEl.addEventListener('click', function(){
    phoneExpanded = !phoneExpanded;
    if(phoneExpanded){
      areaEl.style.maxHeight = '300px';
      areaEl.style.opacity = '1';
      toggleEl.textContent = '使用手机号登录 ▴';
    } else {
      areaEl.style.maxHeight = '0';
      areaEl.style.opacity = '0';
      toggleEl.textContent = '使用手机号登录 ▾';
    }
  });

  // ── Phone login logic (kept from original) ──
  var phoneInput=document.getElementById('phone-input'),codeInput=document.getElementById('code-input'),
      sendCodeBtn=document.getElementById('send-code-btn'),loginBtn=document.getElementById('login-btn');
  var countdown=0,cdTimer=null;
  sendCodeBtn.addEventListener('click',function(){
    if(countdown>0)return;var phone=phoneInput.value.trim();
    if(!/^1[3-9]\\d{9}$/.test(phone)){showToast('请输入正确的11位手机号','error');return;}
    countdown=60;sendCodeBtn.disabled=true;sendCodeBtn.textContent='60s';showToast('验证码已发送（Demo: 888888）','success');
    cdTimer=setInterval(function(){countdown--;if(countdown<=0){clearInterval(cdTimer);sendCodeBtn.disabled=false;sendCodeBtn.textContent='获取验证码';countdown=0;}else{sendCodeBtn.textContent=countdown+'s';}},1000);
  });
  var isLoading=false;
  loginBtn.addEventListener('click',function(){
    if(isLoading)return;var phone=phoneInput.value.trim(),code=codeInput.value.trim();
    if(!/^1[3-9]\\d{9}$/.test(phone)){showToast('请输入正确的11位手机号','error');return;}
    if(!code||code.length<4){showToast('请输入验证码','error');return;}
    isLoading=true;loginBtn.innerHTML='<span class="spinner"></span>';loginBtn.disabled=true;
    fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:phone,code:code})})
    .then(function(r){return r.json();}).then(function(d){
      if(d.ok){
        localStorage.setItem('zlc_user',JSON.stringify(d.member));
        localStorage.setItem('zlc_current_user',JSON.stringify({id:d.member.id,name:d.member.name,phone:d.member.phone,role:d.member.role||'member',classId:d.member.classId||'',className:d.member.className||''}));
        localStorage.setItem('zlc_token','demo-token-'+Date.now());
        showToast('登录成功，欢迎回来！','success');
        setTimeout(function(){window.location.href=d.member.role==='teacher'?'/teacher':(d.member.role==='admin'?'/admin':'/');},800);
      }
      else{showToast(d.error||'登录失败','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;}
    }).catch(function(){showToast('网络错误，请重试','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;});
  });
  codeInput.addEventListener('keydown',function(e){if(e.key==='Enter')loginBtn.click();});
  phoneInput.addEventListener('keydown',function(e){if(e.key==='Enter')codeInput.focus();});
})();
`}} />
    </div>,
    { title: '中流通 - 登录' }
  )
})

// ── Home Page ─────────────────────────────────────────────
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
      <main class="px-4 pt-4 pb-4 max-w-lg mx-auto page-enter">

        {/* 1. Welcome */}
        <section class="mb-5">
          <h2 id="greeting" class="font-bold text-text-title" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;" />
          <p id="user-subtitle" class="text-text-secondary mt-0.5" style="font-size:14px;" />
        </section>

        {/* 1.5 Share Code Input */}
        <section id="share-code-input" style="margin:0 0 12px 0;">
          <div style="background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04);display:flex;align-items:center;gap:10px;">
            <i class="fas fa-link" style="font-size:14px;color:#B91C1C;flex-shrink:0;" />
            <input id="home-share-input" type="text" maxlength={6} placeholder="收到分享码？输入6位码查看项目" style="flex:1;background:transparent;border:none;outline:none;font-size:14px;color:#1C1917;font-family:inherit;" />
            <button id="home-share-btn" style="flex-shrink:0;padding:6px 12px;background:rgba(185,28,28,0.08);border:none;border-radius:8px;color:#B91C1C;font-size:13px;font-weight:600;cursor:pointer;">查看</button>
          </div>
        </section>

        {/* 1.8 Repayment Flash Bar (rendered by client JS) */}
        <div id="repayment-flash-bar" />

        {/* 1.9 Personal Investment Overview Card (Task 3 — rendered by client JS, member only) */}
        <div id="invest-overview-card" />

        {/* 2. Quick Actions */}
        <section id="quick-actions" class="grid grid-cols-2 gap-3 mb-5">
          <a href="/create" class="quick-card quick-card-brand">
            <i class="fas fa-rocket" style="font-size:22px;" />
            <span class="font-semibold" style="font-size:15px;">发起项目</span>
          </a>
          <a href="/projects" class="quick-card quick-card-gold">
            <i class="fas fa-store" style="font-size:22px;" />
            <span class="font-semibold" style="font-size:15px;">项目大厅</span>
          </a>
        </section>

        {/* 3. My Stats */}
        <section class="grid grid-cols-2 gap-3 mb-6">
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
        <section class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-text-title" style="font-size:16px;">最新项目</h3>
            <a href="/projects" class="text-brand font-medium" style="font-size:13px;text-decoration:none;">
              查看全部 <i class="fas fa-arrow-right" style="font-size:11px;" />
            </a>
          </div>
          <div class="flex flex-col gap-3">
            {openProjects.map(proj => {
              const owner = mockMembers.find(m => m.id === proj.ownerId)
              const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)
              return (
                <a href={`/projects/${proj.id}`} class="bg-white rounded-2xl shadow-card shadow-card-hover p-4 block" style="text-decoration:none;color:inherit;">
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

// ── Profile Page ──────────────────────────────────────────
app.get('/profile', (c) => {
  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="px-4 pt-5 pb-4 max-w-lg mx-auto page-enter">
        {/* Profile Card */}
        <div class="bg-white rounded-2xl shadow-card p-6 mb-5 text-center">
          {/* Avatar placeholder */}
          <div id="profile-avatar" class="mx-auto flex items-center justify-center rounded-full bg-brand text-white font-bold mb-3" style="width:80px;height:80px;font-size:32px;font-family:'Noto Sans SC',sans-serif;">
            —
          </div>
          <h2 id="profile-name" class="font-bold text-text-title" style="font-size:22px;font-family:'Noto Sans SC',sans-serif;">—</h2>
          <p id="profile-company" class="text-text-secondary mt-1" style="font-size:14px;">—</p>
          <p id="profile-cohort" class="text-text-tertiary mt-0.5" style="font-size:13px;">—</p>
          <button class="mt-4 px-6 py-2 rounded-lg border border-surface-divider text-text-secondary text-sm font-medium bg-white" style="cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='#fff'">
            <i class="fas fa-pen mr-1.5" style="font-size:11px;" />
            编辑资料
          </button>
        </div>

        {/* Menu List */}
        <div class="bg-white rounded-2xl shadow-card overflow-hidden mb-5">
          {/* Admin entry (hidden by default, shown via JS for admin users) */}
          <a id="admin-entry" href="/admin" class="menu-row" style="display:none;text-decoration:none;color:inherit;">
            <i class="fas fa-shield-halved" style="font-size:16px;width:20px;text-align:center;color:#D4A853;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">管理后台</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </a>
          <div class="menu-row">
            <i class="fas fa-file-contract text-brand" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">我的合同</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row" id="open-faq-btn" style="cursor:pointer;">
            <i class="fas fa-circle-question text-gold" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">使用帮助</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row" id="reset-guide-btn" style="cursor:pointer;">
            <i class="fas fa-redo" style="font-size:14px;width:20px;text-align:center;color:#3B82F6;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">重新查看使用引导</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row">
            <i class="fas fa-phone text-brand-dark" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">联系管理员</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row">
            <i class="fas fa-file-lines text-text-secondary" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">服务条款</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row">
            <i class="fas fa-lock text-text-secondary" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">隐私政策</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
        </div>

        {/* Logout */}
        <div class="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          <button id="logout-btn" class="menu-row w-full" style="border:none;background:none;">
            <i class="fas fa-right-from-bracket" style="font-size:16px;width:20px;text-align:center;color:#DC2626;" />
            <span class="flex-1 text-left font-medium" style="font-size:15px;color:#DC2626;">退出登录</span>
          </button>
        </div>

        {/* Footer */}
        <p class="text-center text-text-secondary mb-2" style="font-size:12px;">
          滴灌通 × 一亿中流 · 联合出品
        </p>
      </main>

      <TabBar active="profile" />

      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var av = document.getElementById('profile-avatar');
  if (av) av.textContent = u.name ? u.name.charAt(0) : '?';
  var nm = document.getElementById('profile-name');
  if (nm) nm.textContent = u.name || '';
  var co = document.getElementById('profile-company');
  if (co) co.textContent = (u.company || '') + ' · ' + (u.title || '');
  var ch = document.getElementById('profile-cohort');
  if (ch) ch.textContent = (u.cohort || '') + (u.joinDate ? ' · 加入于 ' + u.joinDate : '');

  // Show admin entry if admin
  if (u.role === 'admin') {
    var adminEntry = document.getElementById('admin-entry');
    if (adminEntry) adminEntry.style.display = 'flex';
  }

  document.getElementById('logout-btn').addEventListener('click', function(){
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

  // Open FAQ from profile page
  var openFaqBtn = document.getElementById('open-faq-btn');
  if(openFaqBtn){
    openFaqBtn.addEventListener('click', function(){
      if(typeof openFAQPanel === 'function') openFAQPanel();
    });
  }

  // Reset guide button
  var resetGuideBtn = document.getElementById('reset-guide-btn');
  if(resetGuideBtn){
    resetGuideBtn.addEventListener('click', function(){
      showConfirm({
        title: '确认重置所有引导？',
        desc: '下次进入页面时会重新显示使用引导。',
        onConfirm: function(){
          var userId = u.id || '';
          Object.keys(localStorage).forEach(function(key){
            if(key.indexOf('zlc_coach_') === 0 || key.indexOf('zlc_nudge_') === 0 || key.indexOf('zlc_onboarding_') === 0){
              if(!userId || key.indexOf('_' + userId) !== -1 || !key.match(/_[a-z]-\d+$/) && !key.match(/_[a-z]-admin$/)){
                localStorage.removeItem(key);
              }
            }
          });
          showToast('引导已重置，即将刷新', 'success');
          setTimeout(function(){ window.location.href = '/'; }, 1000);
        }
      });
    });
  }
})();
`}} />
    </div>,
    { title: '中流通 - 我的' }
  )
})

// ── Placeholder Pages ─────────────────────────────────────
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

// ── Status badge helper ───────────────────────────────────
const statusLabel: Record<string, string> = { open: '募集中', funded: '已满额', active: '运营中', completed: '已完成' }
const StatusBadge = ({ status }: { status: string }) => (
  <span class={`badge badge-${status}`}>{statusLabel[status] || status}</span>
)

// ══════════════════════════════════════════════════════════
// Projects Hall  (/projects)
// ══════════════════════════════════════════════════════════
app.get('/projects', (c) => {
  const stats = getProjectStats()
  const industries = ['全部', ...Array.from(new Set(mockProjects.map(p => p.industry)))]

  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto">
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
        <div class="filter-bar">
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
        <section id="project-list" class="px-4 pt-4 pb-4 flex flex-col gap-4" />

        {/* Empty state (hidden by default) */}
        <div id="empty-state" class="px-4 py-12 text-center" style="display:none;">
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
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var PROJECTS = ${JSON.stringify(mockProjects.map(p => ({
    id:p.id, name:p.name, ownerId:p.ownerId, industry:p.industry,
    targetAmount:p.targetAmount, raisedAmount:p.raisedAmount,
    revenueShareRate:p.revenueShareRate, duration:p.duration,
    recoveryMultiple:p.recoveryMultiple||0,
    totalShares:p.totalShares, raisedShares:p.raisedShares,
    status:p.status, createdAt:p.createdAt, investors:p.investors,
    initiatorClassId:p.initiatorClassId||'', initiatorClassName:p.initiatorClassName||'',
    recommendedByTeacher:p.recommendedByTeacher||[],
  })))};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company, cohort:m.cohort, classId:m.classId||'' })))};
  var TEACHERS = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, classIds:t.classIds })))};
  var CONTRACTS = ${JSON.stringify(mockContracts.map(c => ({ id:c.id, projectId:c.projectId, amount:c.amount, recoveryCap:c.recoveryCap, status:c.status })))};
  var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords.map(r => ({ contractId:r.contractId, cumulativeShare:r.cumulativeShare })))};

  // Merge user-created projects from localStorage
  var userProjects = [];
  try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  userProjects.forEach(function(up){
    if(up.status !== 'draft'){
      PROJECTS.push(up);
      if(u && !MEMBERS.find(function(m){return m.id===u.id;})){
        MEMBERS.push({id:u.id, name:u.name, company:u.company||'', cohort:u.cohort||'', classId:u.classId||''});
      }
    }
  });

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
          +'<span style="font-size:12px;color:#78716C;">已募 '+pct+'% (¥'+p.raisedAmount+'/'+p.targetAmount+'万)'+(p.status==="open"?' · 剩余'+remain+'份':'')+'</span>'
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

  // ── Coach Mark for Projects Hall ──
  setTimeout(function(){
    showCoachMark('.relation-tag', '绿色表示同班同学，金色是老师推荐的项目，帮你快速识别', 'bottom', 'hall-tags');
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

// ══════════════════════════════════════════════════════════
// Project Detail  (/projects/:id)
// ══════════════════════════════════════════════════════════
app.get('/projects/:id', (c) => {
  const id = c.req.param('id')
  const proj = mockProjects.find(p => p.id === id)

  // If project not found in mock data, serve a client-side lookup page
  if (!proj) {
    return c.render(
      <div class="app-container">
        <AuthCheckScript />
        <GlobalScripts />
        <Navbar />
        <main class="max-w-lg mx-auto px-4 pt-3 pb-8">
          <a href="/projects" class="back-link mb-4 inline-flex">
            <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
          </a>
          <div id="dynamic-project-content" class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载项目中...</p>
          </div>
        </main>
        <div id="toast" class="toast" />
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;
  var projectId = '${id}';
  var userProjects = [];
  try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  var proj = userProjects.find(function(p){ return p.id === projectId; });
  var el = document.getElementById('dynamic-project-content');
  if(!proj){
    el.innerHTML = '<div style="padding:40px 0;text-align:center;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">项目未找到</p><p style="font-size:14px;color:#78716C;margin-top:4px;">该项目不存在或已被删除</p></div>';
    return;
  }
  // Render project detail
  var pct = proj.targetAmount > 0 ? Math.round(proj.raisedAmount / proj.targetAmount * 100) : 0;
  var cap = proj.targetAmount * proj.recoveryMultiple;
  var monthly = proj.estimatedMonthlyRevenue * (proj.revenueShareRate / 100);
  var payback = monthly > 0 ? Math.ceil(proj.targetAmount / monthly) : 0;
  var remainShares = proj.totalShares - proj.raisedShares;
  var statusLabel = {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',draft:'草稿'}[proj.status]||proj.status;

  var html = '<div class="bg-white rounded-2xl shadow-card p-5 mb-4">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  html += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">' + proj.industry + '</span>';
  html += '<span class="badge badge-' + proj.status + '">' + statusLabel + '</span></div>';
  html += '<h1 style="font-size:22px;font-weight:700;color:#292524;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + proj.name + '</h1>';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:12px;">';
  html += '<div style="width:40px;height:40px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
  html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + ' · ' + (u.title||'') + '</div>';
  html += '<div style="font-size:12px;color:#78716C;">' + (u.company||'') + ' · ' + (u.cohort||'') + '</div></div></div>';
  html += '<p style="font-size:15px;line-height:1.7;color:#292524;">' + proj.description + '</p>';
  if(proj.detail){ html += '<p style="font-size:13px;line-height:1.7;color:#78716C;margin-top:8px;">' + proj.detail + '</p>'; }
  html += '</div>';

  // Terms
  html += '<div class="terms-card shadow-card mb-4"><div style="padding:12px 20px;border-bottom:1px solid #F5F5F4;"><h3 style="font-size:16px;font-weight:600;color:#292524;"><i class="fas fa-file-contract" style="color:#B91C1C;margin-right:8px;font-size:14px;"></i>收入分成条款</h3></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;">';
  var terms = [["融资总额","¥"+proj.targetAmount+"万"],["分成比例",proj.revenueShareRate+"%"],["联营期限",proj.duration+"月"],["回收倍数",proj.recoveryMultiple+"x"],["回收上限","¥"+cap.toFixed(1)+"万"],["预估月收入","¥"+proj.estimatedMonthlyRevenue+"万"]];
  terms.forEach(function(t,i){ html += "<div style=\\"padding:14px 20px;border-bottom:1px solid #F5F5F4;"+(i%2===0?"border-right:1px solid #F5F5F4;":"")+"\\"><div style=\\"font-size:12px;color:#78716C;margin-bottom:4px;\\">"+t[0]+"</div><div style=\\"font-size:18px;font-weight:700;color:#1C1917;\\">"+t[1]+"</div></div>"; });
  html += '</div><div style="background:#FEF2F2;padding:16px 20px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
  html += '<div><div style="font-size:12px;color:#78716C;">预估月回款</div><div style="font-size:18px;font-weight:700;color:#B91C1C;">¥'+monthly.toFixed(1)+'万</div></div>';
  html += '<div><div style="font-size:12px;color:#78716C;">预估回收期</div><div style="font-size:18px;font-weight:700;color:#B91C1C;">约'+payback+'月</div></div>';
  html += '</div></div>';

  // Progress
  html += '<div class="bg-white rounded-2xl shadow-card p-5 mb-4">';
  html += '<h3 style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;"><i class="fas fa-chart-pie" style="color:#D4A853;margin-right:8px;font-size:14px;"></i>募集进度</h3>';
  html += '<div style="height:12px;border-radius:99px;background:#F5F5F4;overflow:hidden;margin-bottom:12px;"><div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#D4A853,#B8860B);width:'+pct+'%;"></div></div>';
  html += '<div style="font-size:16px;font-weight:600;color:#292524;">已募 ¥'+proj.raisedAmount+'万 / ¥'+proj.targetAmount+'万 <span style="color:#B8860B;">('+pct+'%)</span></div>';
  html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">总 '+proj.totalShares+' 份 · 剩余 '+remainShares+' 份</div></div>';
  html += '<p style="text-align:center;font-size:13px;color:#78716C;margin-top:16px;">发布于 '+proj.createdAt+'</p>';

  el.innerHTML = html;
})();
`}} />
      </div>,
      { title: '中流通 - 项目详情' }
    )
  }

  const owner = mockMembers.find(m => m.id === proj.ownerId)!
  const rbf = calculateRBF(proj.targetAmount, proj.revenueShareRate, proj.estimatedMonthlyRevenue, proj.recoveryMultiple)
  const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)
  const remainShares = proj.totalShares - proj.raisedShares
  const investorMembers = proj.investors.map(iid => mockMembers.find(m => m.id === iid)).filter(Boolean) as Member[]
  const bgColors = ['#B91C1C','#D4A853','#991B1B','#B8860B','#7F1D1D']

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="px-4 pt-3 pb-8 max-w-lg mx-auto page-enter">
        {/* Back link */}
        <a href="/projects" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
        </a>

        {/* From share banner — shown via JS if ?from=share */}
        <div id="share-from-banner" style="display:none;background:#EFF6FF;color:#2563EB;border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:12px;font-weight:500;">
          🔗 通过分享码查看
        </div>

        {/* Relation Tag — rendered via client JS based on current user's classId */}
        <div id="detail-relation-tag" style="display:none;margin-bottom:12px;" />

        {/* 1. Project Header Card */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <div class="flex items-center justify-between mb-3">
            <span class="bg-brand-soft text-brand px-2.5 py-0.5 rounded font-semibold" style="font-size:11px;">{proj.industry}</span>
            <StatusBadge status={proj.status} />
          </div>
          <h1 class="font-bold text-text-title mb-1" style="font-size:24px;font-family:'Noto Sans SC',sans-serif;line-height:1.3;">{proj.name}</h1>
          {/* 推介语 */}
          {proj.highlightText && (
            <div style="font-size:14px;color:#B91C1C;font-style:italic;margin-top:6px;line-height:1.5;">{proj.highlightText}</div>
          )}
          {/* View / Participant Count (Task 3) */}
          <div id="detail-view-count" style="font-size:12px;color:#A8A29E;margin-top:4px;margin-bottom:12px;" />

          {/* Owner */}
          <div class="flex items-start gap-3 mb-4 p-3 rounded-xl" style="background:#FAFAF9;">
            <div class="flex items-center justify-center rounded-full bg-brand text-white font-bold flex-shrink-0" style="width:44px;height:44px;font-size:18px;">
              {owner.name.charAt(0)}
            </div>
            <div>
              <div class="font-semibold text-text-title" style="font-size:15px;">{owner.name} <span class="text-text-tertiary font-normal" style="font-size:13px;">· {owner.title}</span></div>
              <div class="text-text-secondary" style="font-size:13px;">{owner.company} · {owner.cohort}</div>
              <div class="text-text-tertiary mt-1" style="font-size:12px;">{owner.bio}</div>
            </div>
          </div>

          <p class="text-text-title" style="font-size:15px;line-height:1.7;">{proj.description}</p>
        </div>

        {/* 2. RBF Terms Card */}
        <div class="terms-card shadow-card mb-3">
          <div class="px-5 py-4" style="border-bottom:1px solid #F5F5F4;">
            <h3 class="font-semibold text-text-title" style="font-size:16px;">
              <i class="fas fa-file-contract text-brand mr-2" style="font-size:14px;" />
              收入分成条款
            </h3>
          </div>
          <div class="terms-grid">
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">融资总额</span>
                <span class="help-icon" data-help-id="totalAmount">?</span>
              </div>
              <div class="help-text">这个项目总共需要多少资金。所有参与人的投资加起来等于这个数。</div>
              <div class="terms-value">¥{proj.targetAmount}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">分成比例</span>
                <span class="help-icon" data-help-id="revenueShareRatio">?</span>
              </div>
              <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
              <div class="terms-value">{proj.revenueShareRate}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">%</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">联营期限</span>
                <span class="help-icon" data-help-id="cooperationTerm">?</span>
              </div>
              <div class="help-text">合作持续多长时间。到期后无论是否收回投资，合同自动结束。</div>
              <div class="terms-value">{proj.duration}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">月</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">回收倍数</span>
                <span class="help-icon" data-help-id="recoveryMultiple">?</span>
              </div>
              <div class="help-text">参与人最多能拿回投资额的多少倍。1.5倍意味着投10万最多拿回15万。达到上限后合同自动结束。</div>
              <div class="terms-value">{proj.recoveryMultiple}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">x</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">回收上限</span>
                <span class="help-icon" data-help-id="recoveryCap">?</span>
              </div>
              <div class="help-text">你最多能拿回的总金额 = 投资额 × 回收倍数。</div>
              <div class="terms-value">¥{rbf.recoveryCap}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">预估月收入</span>
                <span class="help-icon" data-help-id="estimatedMonthlyRevenue">?</span>
              </div>
              <div class="help-text">发起人对项目月度收入的预估。这只是预估，实际回款取决于真实经营情况。</div>
              <div class="terms-value">¥{proj.estimatedMonthlyRevenue}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
          </div>
          <div class="calc-highlight">
            <div>
              <div class="terms-label">预估月回款</div>
              <div class="font-bold text-brand" style="font-size:18px;">¥{rbf.monthlyShare.toFixed(1)}万</div>
            </div>
            <div>
              <div class="terms-label">预估回收期</div>
              <div class="font-bold text-brand" style="font-size:18px;">约{rbf.paybackMonths}月</div>
            </div>
          </div>
        </div>

        {/* 2.5 项目亮点 — 仅当 highlights 存在时显示 */}
        {proj.highlights && proj.highlights.length > 0 && (
          <div style="margin:12px 0px;padding:16px 20px;background:#fff;border-radius:14px;border-left:3px solid #D4A853;" class="shadow-card">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:14px;font-weight:600;color:#1C1917;">项目亮点</span>
              <span style="font-size:14px;">⭐</span>
            </div>
            <div style="margin-top:10px;">
              {proj.highlights.map((h: string) => (
                <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
                  <span style="width:6px;height:6px;background:#D4A853;border-radius:50%;flex-shrink:0;margin-top:6px;" />
                  <span style="font-size:14px;color:#44403C;line-height:1.6;">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2.5a 发起人说 — 仅当 initiatorNote 非空时显示 (Task 4) */}
        {proj.initiatorNote && proj.initiatorNote.trim() && (
          <div class="initiator-note">
            <div class="initiator-note-header">
              <div class="initiator-note-avatar">{owner.name.charAt(0)}</div>
              <span class="initiator-note-name">{owner.name}</span>
              <span class="initiator-note-tag">发起人</span>
            </div>
            <div class="initiator-note-body">
              <span class="initiator-note-quote">"</span>
              <span class="initiator-note-text">{proj.initiatorNote}</span>
            </div>
          </div>
        )}

        {/* 2.5b Plain Language Block */}
        <div class="plain-lang-block mb-4" id="plain-lang-detail" />

        {/* 3. Fundraising Progress */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 class="font-semibold text-text-title mb-3" style="font-size:16px;">
            <i class="fas fa-chart-pie text-gold mr-2" style="font-size:14px;" />
            募集进度
          </h3>
          <div class="progress-bar-lg mb-3">
            <div class="progress-fill" data-width={`${pct}%`} />
          </div>
          <div class="font-semibold text-text-title mb-1" style="font-size:16px;">
            已募 ¥{proj.raisedAmount}万 / ¥{proj.targetAmount}万 <span class="text-gold-dark">({pct}%)</span>
          </div>
          <div class="text-text-secondary" style="font-size:13px;">
            已参与 {proj.investors.length} 位同学 · {remainShares > 0 ? `剩余 ${remainShares} 份` : '已满额'}
          </div>
        </div>

        {/* 4. Participate Calculator (open only, not owner) */}
        {proj.status === 'open' && remainShares > 0 && (
          <div id="participate-calculator" class="calc-card shadow-card p-5 mb-4">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:16px;">
              <i class="fas fa-calculator text-gold mr-2" style="font-size:14px;" />
              我要参与
            </h3>
            <div class="flex items-center gap-3 mb-4">
              <select id="share-select" class="share-select">
                {Array.from({ length: Math.min(remainShares, 10) }, (_, i) => i + 1).map(n => (
                  <option value={String(n)}>{n} 份</option>
                ))}
              </select>
              <span class="text-text-tertiary" style="font-size:15px;">=</span>
              <span id="share-amount" class="font-bold text-text-title" style="font-size:22px;">¥{proj.sharePrice}万</span>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3 p-3 rounded-xl" style="background:#FAFAF9;">
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">月回款预估</div>
                <div id="calc-monthly" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">回收上限</div>
                <div id="calc-cap" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">预估回收期</div>
                <div id="calc-months" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
            </div>
            {/* Calculator plain-language hint */}
            <div id="calc-plain-hint" style="font-size:12px;line-height:1.6;color:#78716C;margin-bottom:16px;" />
            <button id="participate-btn" class="btn-gold" style="font-size:16px;">
              确认参与 ¥{proj.sharePrice}万
            </button>
            <p id="owner-hint" class="text-center text-text-tertiary mt-3" style="font-size:12px;display:none;">
              您是项目发起人，无法参与自己的项目
            </p>
          </div>
        )}

        {/* 5. Investors */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 class="font-semibold text-text-title mb-3" style="font-size:16px;">
            <i class="fas fa-users text-brand-dark mr-2" style="font-size:14px;" />
            已参与学员
          </h3>
          <div class="avatar-stack mb-2">
            {investorMembers.slice(0, 6).map((m, i) => (
              <div class="av-circle" style={`background:${bgColors[i % bgColors.length]};`}>{m.name.charAt(0)}</div>
            ))}
            {investorMembers.length > 6 && (
              <div class="av-circle" style="background:#78716C;">+{investorMembers.length - 6}</div>
            )}
          </div>
          <p class="text-text-secondary" style="font-size:13px;">共 {investorMembers.length} 位同学参与</p>
        </div>

        {/* 6. Share / Referral Buttons */}
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="flex:1;height:1px;background:#D6D3D1;" />
            <span style="font-size:12px;color:#A8A29E;white-space:nowrap;">或者</span>
            <div style="flex:1;height:1px;background:#D6D3D1;" />
          </div>
          <div style="display:flex;gap:12px;">
            <button id="btn-referral" style="flex:1;height:44px;background:#fff;border:1.5px solid #B91C1C;border-radius:12px;color:#B91C1C;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;">
              <i class="fas fa-user-tie" style="font-size:13px;" /> 请老师引荐
            </button>
            <button id="btn-share-project" style="flex:1;height:44px;background:#fff;border:1.5px solid #78716C;border-radius:12px;color:#78716C;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;">
              <i class="fas fa-share-alt" style="font-size:13px;" /> 分享项目
            </button>
          </div>
          {/* Referral status line — rendered via client JS */}
          <div id="referral-status-line" style="display:none;margin-top:10px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;" />
        </div>
      </main>

      {/* Share Sheet Overlay (Task 1 — Premium Share Card) */}
      <div id="share-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;">
        <div id="share-panel" style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:24px 24px 0 0;padding:24px;transform:translateY(100%);transition:transform 300ms ease-out;max-height:85vh;overflow-y:auto;">
          {/* Drag indicator */}
          <div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:0 auto 20px;" />

          {/* Premium Share Card Preview — 高端邀请函风格 */}
          <div id="share-card-preview" style="width:100%;max-width:320px;margin:0 auto;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#1C1917 0%,#292524 40%,#1C1917 100%);box-shadow:0 8px 32px rgba(0,0,0,0.3);">
            {/* A. 品牌头部 */}
            <div style="padding:20px 24px 16px;">
              <div style="width:40px;height:2px;background:linear-gradient(90deg,#D4A853,#F5DEB3);margin-bottom:12px;" />
              <div style="font-size:12px;color:#D4A853;letter-spacing:3px;">中流通 · 项目推介</div>
            </div>
            {/* B. 项目名称区 */}
            <div style="padding:0 24px;">
              <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.3;">{proj.name}</div>
              {proj.highlightText && (
                <div style="margin-top:8px;font-size:14px;color:rgba(212,168,83,0.9);font-style:italic;line-height:1.5;">{proj.highlightText}</div>
              )}
            </div>
            {/* C. 发起人信息 */}
            <div style="padding:12px 24px 0;">
              <div style="font-size:13px;color:rgba(255,255,255,0.5);">发起人 {owner.name} · {owner.className || owner.cohort}</div>
            </div>
            {/* D. 核心数据区 */}
            <div style="margin:20px 24px;padding:20px;background:rgba(255,255,255,0.06);border-radius:14px;border:1px solid rgba(255,255,255,0.08);">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">¥{proj.targetAmount}万</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;">融资规模</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.revenueShareRate}%</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;">收入分成</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.duration}个月</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;">联营期限</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">≈¥{(proj.estimatedMonthlyRevenue * proj.revenueShareRate / 100).toFixed(1)}万</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;">预估月回款</div></div>
              </div>
            </div>
            {/* E. 项目亮点区 */}
            {proj.highlights && proj.highlights.length > 0 && (
              <div style="padding:0 24px;margin-top:4px;">
                {proj.highlights.map((h: string) => (
                  <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
                    <span style="color:#D4A853;font-size:13px;flex-shrink:0;line-height:1.5;">◆</span>
                    <span style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;">{h}</span>
                  </div>
                ))}
              </div>
            )}
            {/* F. 分享码区域 */}
            <div style="padding:24px;text-align:center;">
              <div style="border:1px dashed rgba(212,168,83,0.4);border-radius:12px;padding:16px;margin:0 24px;">
                <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#D4A853;font-family:monospace;">{proj.shareCode || '------'}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;">输入分享码 或 扫码查看</div>
                <div style="margin:10px auto 0;width:80px;height:80px;background:rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:14px;color:rgba(255,255,255,0.2);">QR</span>
                </div>
              </div>
            </div>
            {/* G. 底部 */}
            <div style="padding:12px 24px 20px;text-align:center;">
              <div style="width:40px;height:1px;background:rgba(212,168,83,0.3);margin:0 auto 8px;" />
              <div style="font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:2px;">一亿中流 · 私董会项目投资平台</div>
            </div>
          </div>

          {/* Action Buttons 2x2 Grid */}
          <div style="margin-top:20px;padding:0 8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button id="btn-copy-code" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">复制分享码</button>
            <button id="btn-copy-link" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">复制链接</button>
            <button id="btn-copy-text" style="background:linear-gradient(135deg,#B91C1C,#991B1B);border:none;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#fff;cursor:pointer;transition:opacity 0.2s;">复制文字版</button>
            <button id="btn-save-card" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">保存卡片</button>
          </div>
        </div>
      </div>

      {/* Referral Modal Overlay */}
      <div id="referral-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:1100;display:none;align-items:center;justify-content:center;">
        <div id="referral-modal" style="background:#fff;border-radius:16px;width:92%;max-width:400px;margin:auto;padding:0;overflow:hidden;transform:scale(0.95);opacity:0;transition:transform 250ms ease-out,opacity 250ms ease-out;">
          {/* Header */}
          <div style="background:linear-gradient(135deg,#B91C1C 0%,#991B1B 100%);padding:20px 24px;color:#fff;">
            <div style="font-size:17px;font-weight:600;margin-bottom:4px;">请老师引荐</div>
            <div style="font-size:12px;opacity:0.85;">请您的班主任老师帮忙引荐对接项目发起人</div>
          </div>
          <div style="padding:20px 24px;">
            {/* Teacher info */}
            <div id="ref-teacher-info" style="display:flex;align-items:center;gap:12px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:16px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">
                <i class="fas fa-user-tie" />
              </div>
              <div>
                <div id="ref-teacher-name" style="font-size:15px;font-weight:600;color:#1C1917;">老师</div>
                <div style="font-size:12px;color:#78716C;">将帮你对接 <span id="ref-initiator-name" style="font-weight:600;">{owner.name}</span></div>
              </div>
            </div>
            {/* Project info mini */}
            <div style="padding:10px 12px;background:#FEF2F2;border-radius:8px;margin-bottom:16px;">
              <div style="font-size:13px;font-weight:600;color:#1C1917;margin-bottom:2px;">{proj.name}</div>
              <div style="font-size:11px;color:#78716C;">¥{proj.targetAmount}万 · {proj.revenueShareRate}% 分成 · {proj.duration}月</div>
            </div>
            {/* Message textarea */}
            <div style="margin-bottom:16px;">
              <label style="font-size:13px;font-weight:500;color:#57534E;display:block;margin-bottom:6px;">留言（选填）</label>
              <textarea id="ref-message" placeholder="可以写上你对项目的关注点，方便老师引荐..." style="width:100%;height:72px;border:1px solid #D6D3D1;border-radius:10px;padding:10px 12px;font-size:13px;resize:none;outline:none;font-family:inherit;transition:border-color 0.2s;" onfocus="this.style.borderColor='#B91C1C'" onblur="this.style.borderColor='#D6D3D1'" />
            </div>
            {/* Buttons */}
            <div style="display:flex;gap:12px;">
              <button id="ref-cancel-btn" style="flex:1;height:44px;background:#F5F5F4;border:none;border-radius:12px;color:#78716C;font-weight:600;font-size:14px;cursor:pointer;">取消</button>
              <button id="ref-submit-btn" style="flex:1;height:44px;background:#B91C1C;border:none;border-radius:12px;color:#fff;font-weight:600;font-size:14px;cursor:pointer;">提交引荐请求</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var PROJ = ${JSON.stringify({
    id: proj.id, name: proj.name, ownerId: proj.ownerId, status: proj.status,
    sharePrice: proj.sharePrice, totalShares: proj.totalShares, raisedShares: proj.raisedShares,
    targetAmount: proj.targetAmount, raisedAmount: proj.raisedAmount,
    revenueShareRate: proj.revenueShareRate, estimatedMonthlyRevenue: proj.estimatedMonthlyRevenue,
    recoveryMultiple: proj.recoveryMultiple, duration: proj.duration,
    industry: proj.industry, description: proj.description,
    shareCode: proj.shareCode || '',
    initiatorClassId: proj.initiatorClassId || '',
    initiatorClassName: proj.initiatorClassName || '',
    recommendedByTeacher: proj.recommendedByTeacher || [],
    viewCount: proj.viewCount || 0,
    highlightText: proj.highlightText || '',
    highlights: proj.highlights || [],
  })};
  var OWNER = ${JSON.stringify({ name: owner.name, className: owner.className || owner.cohort || '' })};
  var MOCK_CONTRACTS_FOR_COUNT = ${JSON.stringify(mockContracts.filter(c => c.projectId === proj.id && c.status === 'active').length)};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, classId:m.classId||'' })))};
  var TEACHERS = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, classIds:t.classIds })))};

  // Show from=share banner
  if(window.location.search.indexOf('from=share') !== -1){
    var banner = document.getElementById('share-from-banner');
    if(banner) banner.style.display = 'block';
  }

  // ── Task 3: viewCount increment + display ──
  (function(){
    // Read stored view counts from localStorage
    var viewCounts = {};
    try { viewCounts = JSON.parse(localStorage.getItem('zlc_view_counts') || '{}'); } catch(e){}
    var currentCount = viewCounts[PROJ.id] !== undefined ? viewCounts[PROJ.id] : PROJ.viewCount;
    currentCount++;
    viewCounts[PROJ.id] = currentCount;
    localStorage.setItem('zlc_view_counts', JSON.stringify(viewCounts));

    // Get participant count (signed contracts)
    var participantCount = MOCK_CONTRACTS_FOR_COUNT;
    // Also check localStorage contracts
    var lsContracts = [];
    try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
    var lsSignedCount = lsContracts.filter(function(c){ return c.projectId === PROJ.id && c.status === 'active'; }).length;
    participantCount = Math.max(participantCount, participantCount + lsSignedCount);

    var vcEl = document.getElementById('detail-view-count');
    if(vcEl) vcEl.textContent = currentCount + '人浏览 · ' + participantCount + '人参与';
  })();

  // Render relation tag on detail page
  (function(){
    var myClassId = u.classId || '';
    var myTeacher = null;
    if(myClassId){
      myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
    }
    var tag = null;
    if(myTeacher && PROJ.recommendedByTeacher && PROJ.recommendedByTeacher.indexOf(myTeacher.id) !== -1){
      tag = { text: '\\u{1F31F} 老师推荐', type: 'gold' };
    } else if(PROJ.initiatorClassId && PROJ.initiatorClassId === myClassId){
      tag = { text: '同班 · ' + (PROJ.initiatorClassName || ''), type: 'green' };
    } else if(PROJ.initiatorClassName){
      tag = { text: PROJ.initiatorClassName, type: 'gray' };
    }
    if(tag){
      var styles = {
        gold: 'background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;',
        green: 'background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;',
        gray: 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;'
      };
      var el = document.getElementById('detail-relation-tag');
      if(el){
        el.innerHTML = '<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;' + styles[tag.type] + '">' + tag.text + '</span>';
        el.style.display = 'block';
      }
    }
  })();

  // Hide calculator if owner
  var ownerHint = document.getElementById('owner-hint');
  var partBtn = document.getElementById('participate-btn');
  if (u.id === PROJ.ownerId && partBtn) {
    partBtn.style.display = 'none';
    if (ownerHint) ownerHint.style.display = 'block';
  }

  // Admin cannot invest — disable participate button (Task 4)
  (function(){
    try {
      var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
      if(cu && cu.role === 'admin' && partBtn){
        partBtn.disabled = true;
        partBtn.style.background = '#E7E5E4';
        partBtn.style.color = '#A8A29E';
        partBtn.style.cursor = 'not-allowed';
        partBtn.style.boxShadow = 'none';
        partBtn.textContent = '管理员不可参与投资';
        partBtn.onclick = function(e){ e.preventDefault(); e.stopPropagation(); };
      }
    } catch(e){}
  })();

  // Share calculator
  var sel = document.getElementById('share-select');
  var amtEl = document.getElementById('share-amount');
  var calcM = document.getElementById('calc-monthly');
  var calcC = document.getElementById('calc-cap');
  var calcMo = document.getElementById('calc-months');

  function updateCalc(){
    if(!sel) return;
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;
    if(amtEl) amtEl.textContent = '¥' + cost + '万';
    var ratio = cost / PROJ.targetAmount;
    var monthly = PROJ.estimatedMonthlyRevenue * (PROJ.revenueShareRate / 100) * ratio;
    var cap = cost * PROJ.recoveryMultiple;
    var months = monthly > 0 ? Math.ceil(cost / monthly) : 0;
    if(calcM) calcM.textContent = '¥' + monthly.toFixed(2) + '万';
    if(calcC) calcC.textContent = '¥' + cap.toFixed(1) + '万';
    if(calcMo) calcMo.textContent = '约' + months + '月';
    if(partBtn && partBtn.style.display !== 'none') partBtn.textContent = '确认参与 ¥' + cost + '万';
    // Update calculator plain-language hint
    var hintEl = document.getElementById('calc-plain-hint');
    if(hintEl && monthly > 0){
      hintEl.innerHTML = '\\uD83D\\uDCA1 你投入 ' + cost + ' 万参与这个项目。按预估，你每月大约拿到 ' + monthly.toFixed(2) + ' 万。约 ' + months + ' 个月收回本金，最多拿回 ' + cap.toFixed(2) + ' 万。';
    }
  }
  if(sel) { sel.addEventListener('change', updateCalc); updateCalc(); }

  // Render plain-language block for project detail page
  (function(){
    var plEl = document.getElementById('plain-lang-detail');
    if(!plEl) return;
    var totalAmount = PROJ.targetAmount;
    var ratio = PROJ.revenueShareRate;
    var estRevenue = PROJ.estimatedMonthlyRevenue;
    var multiple = PROJ.recoveryMultiple;
    var minPart = PROJ.sharePrice;
    var monthlyShare = estRevenue * ratio / 100;
    var perShareMonthly = monthlyShare * (minPart / totalAmount);
    var paybackMonths = perShareMonthly > 0 ? Math.ceil(minPart / perShareMonthly) : 0;
    var perShareCap = minPart * multiple;

    plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
      + '<div class="plain-lang-body">'
      + '这个项目总共需要 ' + totalAmount + ' 万资金。发起人承诺把项目每月收入的 ' + ratio + '% 分给所有参与人。按目前预估每月收入 ' + estRevenue + ' 万计算，每月总共分出约 ' + monthlyShare.toFixed(2) + ' 万。'
      + '<br/><br/>如果你参与 ' + minPart + ' 万（1份），你每月大约能拿到 ' + perShareMonthly.toFixed(2) + ' 万，大概 ' + paybackMonths + ' 个月收回本金，最多能拿回 ' + perShareCap.toFixed(2) + ' 万（投资额的 ' + multiple + ' 倍）。'
      + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
      + '</div>';
  })();

  // Participate with confirm modal
  function doParticipate(){
    if(!sel) return;
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;

    showConfirm({
      title: '确认参与 ' + PROJ.name + '？',
      desc: '投资 ' + n + ' 份，共 ¥' + cost + '万',
      onConfirm: function(){
        // Check if already invested
        var investments = [];
        try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
        var existing = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
        if(existing){
          showToast('您已参与过该项目','error');
          return;
        }

        // Save investment
        investments.push({
          projectId: PROJ.id,
          userId: u.id,
          shares: n,
          amount: cost,
          date: new Date().toISOString().slice(0,10),
          projectName: PROJ.name,
        });
        localStorage.setItem('zlc_investments', JSON.stringify(investments));

        // Create contract record
        var contractId = 'c-' + Date.now().toString(36);
        var contracts = [];
        try { contracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}

        var ownerName = '发起人';
        if(typeof MEMBERS !== 'undefined'){
          var ownerM = MEMBERS.find(function(m){return m.id===PROJ.ownerId;});
          if(ownerM) ownerName = ownerM.name;
        }

        contracts.push({
          id: contractId,
          projectId: PROJ.id,
          userId: u.id,
          shares: n,
          amount: cost,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ownerName: ownerName,
          project: {
            id: PROJ.id, name: PROJ.name, industry: PROJ.industry || '',
            description: PROJ.description || '',
            sharePrice: PROJ.sharePrice, targetAmount: PROJ.targetAmount,
            revenueShareRate: PROJ.revenueShareRate,
            duration: PROJ.duration || 0,
            recoveryMultiple: PROJ.recoveryMultiple,
            estimatedMonthlyRevenue: PROJ.estimatedMonthlyRevenue,
            reportFrequency: PROJ.reportFrequency || '月报',
            ownerId: PROJ.ownerId,
          }
        });
        localStorage.setItem('zlc_contracts', JSON.stringify(contracts));

        // Disable button
        if(partBtn){
          partBtn.disabled = true;
          partBtn.textContent = '已参与 ¥' + cost + '万';
        }
        if(sel) sel.disabled = true;

        // Show success modal
        showSuccessModal({
          title: '参与成功！',
          sub: '即将进入合同签署',
          duration: 2000,
          onDone: function(){ window.location.href = '/contracts/' + contractId + '/sign'; }
        });
      }
    });
  }

  if(partBtn) partBtn.addEventListener('click', doParticipate);

  // Check if already invested on load
  var investments = [];
  try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
  var alreadyIn = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
  if(alreadyIn && partBtn){
    partBtn.disabled = true;
    partBtn.textContent = '已参与 ¥' + alreadyIn.amount + '万';
    if(sel) sel.disabled = true;
  }

  // ── Share Panel Logic ──
  var shareOverlay = document.getElementById('share-overlay');
  var sharePanel = document.getElementById('share-panel');
  var btnShareProject = document.getElementById('btn-share-project');
  var btnReferral = document.getElementById('btn-referral');

  function openSharePanel(){
    shareOverlay.style.display = 'block';
    void sharePanel.offsetHeight;
    sharePanel.style.transform = 'translateY(0)';
  }
  function closeSharePanel(){
    sharePanel.style.transform = 'translateY(100%)';
    setTimeout(function(){ shareOverlay.style.display = 'none'; }, 220);
  }

  if(btnShareProject){
    btnShareProject.addEventListener('click', openSharePanel);
  }
  if(shareOverlay){
    shareOverlay.addEventListener('click', function(e){
      if(e.target === shareOverlay) closeSharePanel();
    });
  }

  // Auto-open share sheet if ?share=true (Task 2)
  if(window.location.search.indexOf('share=true') !== -1){
    setTimeout(openSharePanel, 500);
  }

  // ── Referral Logic ──
  var refOverlay = document.getElementById('referral-overlay');
  var refModal = document.getElementById('referral-modal');
  var refCancelBtn = document.getElementById('ref-cancel-btn');
  var refSubmitBtn = document.getElementById('ref-submit-btn');
  var refMessage = document.getElementById('ref-message');
  var refTeacherNameEl = document.getElementById('ref-teacher-name');
  var refStatusLine = document.getElementById('referral-status-line');

  // Find teacher for current user
  var myClassId = u.classId || '';
  var myTeacher = null;
  if(myClassId){
    myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
  }

  // Find project owner info
  var projOwnerMember = MEMBERS.find(function(m){ return m.id === PROJ.ownerId; });
  var isSameClassAsInitiator = myClassId && PROJ.initiatorClassId === myClassId;
  var isOwner = u.id === PROJ.ownerId;

  // Handle edge cases for referral button visibility
  if(btnReferral){
    if(isOwner){
      // Hide for project initiator
      btnReferral.style.display = 'none';
    } else if(!myTeacher){
      // Hide if user has no teacher
      btnReferral.style.display = 'none';
    } else if(isSameClassAsInitiator){
      // Same class: change text
      btnReferral.innerHTML = '<i class="fas fa-user-tie" style="font-size:13px;"></i> 请老师深入介绍';
    }
  }

  // Load existing referrals from localStorage
  var referrals = [];
  try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
  var existingRef = referrals.find(function(r){ return r.projectId === PROJ.id && r.requesterId === u.id; });

  function updateReferralUI(){
    if(!btnReferral) return;
    referrals = [];
    try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
    existingRef = referrals.find(function(r){ return r.projectId === PROJ.id && r.requesterId === u.id; });

    if(existingRef){
      // Disable button
      btnReferral.disabled = true;
      btnReferral.style.background = '#F5F5F4';
      btnReferral.style.borderColor = '#D6D3D1';
      btnReferral.style.color = '#78716C';
      btnReferral.style.cursor = 'default';
      btnReferral.innerHTML = '<i class="fas fa-clock" style="font-size:13px;"></i> 已请求引荐';

      // Show status line
      if(refStatusLine){
        if(existingRef.status === 'connected'){
          refStatusLine.style.display = 'block';
          refStatusLine.style.background = '#ECFDF5';
          refStatusLine.style.color = '#047857';
          refStatusLine.innerHTML = '\\u2705 ' + existingRef.teacherName + '已帮你对接 · 你可以随时参与投资';
        } else {
          refStatusLine.style.display = 'block';
          refStatusLine.style.background = '#FFFBEB';
          refStatusLine.style.color = '#92400E';
          refStatusLine.innerHTML = '\\u23F3 已请求引荐 · 等待' + existingRef.teacherName + '对接';
        }
      }
    }
  }

  function openReferralModal(){
    if(!myTeacher) return;
    if(refTeacherNameEl) refTeacherNameEl.textContent = myTeacher.name;
    refOverlay.style.display = 'flex';
    void refModal.offsetHeight;
    refModal.style.transform = 'scale(1)';
    refModal.style.opacity = '1';
  }
  function closeReferralModal(){
    refModal.style.transform = 'scale(0.95)';
    refModal.style.opacity = '0';
    setTimeout(function(){ refOverlay.style.display = 'none'; }, 200);
  }

  if(btnReferral && !isOwner && myTeacher){
    btnReferral.addEventListener('click', function(){
      if(existingRef){ return; }
      openReferralModal();
    });
  }
  if(refCancelBtn){
    refCancelBtn.addEventListener('click', closeReferralModal);
  }
  if(refOverlay){
    refOverlay.addEventListener('click', function(e){
      if(e.target === refOverlay) closeReferralModal();
    });
  }

  // Submit referral
  if(refSubmitBtn){
    refSubmitBtn.addEventListener('click', function(){
      if(!myTeacher) return;
      var msg = refMessage ? refMessage.value.trim() : '';
      var now = new Date().toISOString();
      var ref = {
        id: 'ref-' + Date.now().toString(36),
        projectId: PROJ.id,
        projectName: PROJ.name,
        requesterId: u.id,
        requesterName: u.name || '',
        requesterClassName: u.className || '',
        initiatorId: PROJ.ownerId,
        initiatorName: projOwnerMember ? projOwnerMember.name : '',
        initiatorClassName: PROJ.initiatorClassName || '',
        teacherId: myTeacher.id,
        teacherName: myTeacher.name,
        message: msg,
        status: 'pending',
        requestedAt: now,
        connectedAt: null
      };
      referrals.push(ref);
      localStorage.setItem('zlc_referrals', JSON.stringify(referrals));
      existingRef = ref;
      closeReferralModal();
      setTimeout(function(){
        showToast('引荐请求已发送给' + myTeacher.name, 'success');
        updateReferralUI();
      }, 300);
    });
  }

  // Initial referral UI update
  updateReferralUI();

  // Copy share code
  var btnCopyCode = document.getElementById('btn-copy-code');
  if(btnCopyCode){
    btnCopyCode.addEventListener('click', function(){
      if(PROJ.shareCode){
        navigator.clipboard.writeText(PROJ.shareCode).then(function(){
          btnCopyCode.textContent = '\\u2713 已复制';
          setTimeout(function(){ btnCopyCode.textContent = '复制分享码'; }, 2000);
        }).catch(function(){ showToast('复制失败，请手动复制: ' + PROJ.shareCode, 'error'); });
      }
    });
  }

  // Copy link
  var btnCopyLink = document.getElementById('btn-copy-link');
  if(btnCopyLink){
    btnCopyLink.addEventListener('click', function(){
      var link = 'https://zlc.yyzltop.com/share/' + PROJ.shareCode;
      navigator.clipboard.writeText(link).then(function(){
        btnCopyLink.textContent = '\\u2713 已复制';
        setTimeout(function(){ btnCopyLink.textContent = '复制链接'; }, 2000);
      }).catch(function(){ showToast('复制失败，请手动复制', 'error'); });
    });
  }

  // Copy text version (core feature)
  var btnCopyText = document.getElementById('btn-copy-text');
  if(btnCopyText){
    btnCopyText.addEventListener('click', function(){
      var monthlyRepayment = (PROJ.estimatedMonthlyRevenue * PROJ.revenueShareRate / 100).toFixed(1);
      var textContent = '\\uD83D\\uDCE2 【项目推介】' + PROJ.name + '\\n';
      if(PROJ.highlightText){ textContent += '\\uD83D\\uDCAC ' + PROJ.highlightText + '\\n'; }
      textContent += '\\n\\uD83D\\uDC64 发起人：' + OWNER.name + '（' + OWNER.className + '）\\n'
        + '\\uD83D\\uDCB0 融资规模：¥' + PROJ.targetAmount + '万\\n'
        + '\\uD83D\\uDCCA 收入分成：' + PROJ.revenueShareRate + '%\\n'
        + '\\u23F1 联营期限：' + PROJ.duration + '个月\\n'
        + '\\uD83D\\uDCC8 预估月回款：≈¥' + monthlyRepayment + '万\\n';
      if(PROJ.highlights && PROJ.highlights.length > 0){
        PROJ.highlights.forEach(function(h){ textContent += '\\u2705 ' + h + '\\n'; });
      }
      textContent += '\\n\\uD83D\\uDD17 查看详情：https://zlc.yyzltop.com/share/' + PROJ.shareCode + '\\n'
        + '\\uD83D\\uDD11 分享码：' + PROJ.shareCode + '\\n\\n'
        + '——来自「中流通」一亿中流私董会项目投资平台';
      navigator.clipboard.writeText(textContent).then(function(){
        btnCopyText.textContent = '\\u2713 已复制，去微信粘贴吧';
        setTimeout(function(){ btnCopyText.textContent = '复制文字版'; }, 3000);
      }).catch(function(){ showToast('复制失败，请手动复制', 'error'); });
    });
  }

  // Save card
  var btnSaveCard = document.getElementById('btn-save-card');
  if(btnSaveCard){
    btnSaveCard.addEventListener('click', function(){
      showToast('请长按上方卡片截图保存', 'info');
    });
  }

  // ── Coach Marks for Project Detail ──
  setTimeout(function(){
    showCoachMark('#participate-calculator', '选择份额数，系统自动帮你算预估回款', 'top', 'detail-calc');
  }, 800);
  setTimeout(function(){
    showCoachMark('#btn-referral', '不认识发起人？点这里请你的老师帮忙对接，先见面再投资', 'top', 'detail-referral');
  }, 1500);

  // ── Nudge C: Detail page 30s without action ──
  if (PROJ.status === 'open' && !localStorage.getItem('zlc_nudge_detail_action')) {
    var detailNudgeTimer = setTimeout(function(){ showNudge('\\uD83E\\uDD1D', '感兴趣的话可以直接参与，也可以请老师先引荐认识一下', 'detail_action'); }, 30000);
    function cancelDetailNudge(){ clearTimeout(detailNudgeTimer); }
    if(partBtn) partBtn.addEventListener('click', cancelDetailNudge);
    if(btnReferral) btnReferral.addEventListener('click', cancelDetailNudge);
    if(btnShareProject) btnShareProject.addEventListener('click', cancelDetailNudge);
    window.addEventListener('beforeunload', cancelDetailNudge);
  }
})();
`}} />
    </div>,
    { title: '中流通 - ' + proj.name }
  )
})

// ══════════════════════════════════════════════════════════
// Create Project  (/create) — 3-Step Form
// ══════════════════════════════════════════════════════════
app.get('/create', (c) => {
  const industries = ['餐饮连锁','智能制造','教育培训','物流供应链','美容健康','零售','SaaS','其他']

  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      {/* Admin intercept — shown via JS if role=admin */}
      <div id="admin-create-block" style="display:none;">
        <div style="text-align:center;margin-top:120px;padding:0 24px;">
          <p style="font-size:15px;color:#78716C;">管理员无法发起项目，请切换到学员或老师账号</p>
          <a href="/admin" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">返回工作台</a>
        </div>
      </div>

      <main class="max-w-lg mx-auto px-4 pt-2 pb-6 page-enter" id="create-main">
        {/* Stepper */}
        <div class="stepper" id="stepper">
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-active" id="dot-1">1</div>
              <div class="stepper-label stepper-label-active" id="label-1">基本信息</div>
            </div>
          </div>
          <div class="stepper-line stepper-line-pending" id="line-1" />
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-pending" id="dot-2">2</div>
              <div class="stepper-label" id="label-2">条款设定</div>
            </div>
          </div>
          <div class="stepper-line stepper-line-pending" id="line-2" />
          <div class="stepper-step">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="stepper-dot stepper-dot-pending" id="dot-3">3</div>
              <div class="stepper-label" id="label-3">预览发布</div>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        <div id="step-1" class="step-panel">
          <div class="bg-white rounded-2xl shadow-card p-5">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:17px;font-family:'Noto Sans SC',sans-serif;">
              <i class="fas fa-info-circle text-brand mr-2" style="font-size:14px;" />基本信息
            </h3>

            <div class="mb-4">
              <label class="form-label">项目名称 <span class="req">*</span></label>
              <input id="f-name" type="text" class="form-input" placeholder="如：星火餐饮华南区20店扩张" maxlength={80} />
            </div>

            <div class="mb-4">
              <label class="form-label">所属行业 <span class="req">*</span></label>
              <select id="f-industry" class="form-select">
                <option value="">请选择行业</option>
                {industries.map(ind => <option value={ind}>{ind}</option>)}
              </select>
            </div>

            <div class="mb-4">
              <label class="form-label">项目简介 <span class="req">*</span></label>
              <textarea id="f-desc" class="form-textarea" placeholder="简述项目背景、核心优势和发展计划（200字以内）" maxlength={200} rows={3} />
              <div class="char-count" id="desc-count">0/200</div>
            </div>

            {/* 推介语输入 */}
            <div class="mb-4">
              <label style="font-size:13px;font-weight:600;color:#44403C;display:block;margin-bottom:6px;">一句话推介（选填，将显示在分享卡片上）</label>
              <div style="position:relative;">
                <input id="f-highlight-text" type="text" class="form-input" placeholder="如：华南餐饮龙头品牌，月均流水稳定300万" maxlength={50} />
                <div style="position:absolute;right:12px;bottom:-18px;font-size:11px;color:#A8A29E;" id="highlight-text-count">0/50</div>
              </div>
            </div>

            {/* 项目亮点输入 */}
            <div class="mb-4" style="margin-top:16px;">
              <label style="font-size:13px;font-weight:600;color:#44403C;display:block;margin-bottom:6px;">项目亮点（选填，最多3条，每条一个核心卖点）</label>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❶</span>
                  <input id="f-highlight-1" type="text" class="form-input" placeholder="如：18家直营门店，运营超5年" maxlength={30} style="flex:1;" />
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❷</span>
                  <input id="f-highlight-2" type="text" class="form-input" placeholder="如：月均流水300万+" maxlength={30} style="flex:1;" />
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#D4A853;font-size:14px;flex-shrink:0;">❸</span>
                  <input id="f-highlight-3" type="text" class="form-input" placeholder="如：已获两轮机构投资" maxlength={30} style="flex:1;" />
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">项目详情 <span style="font-size:12px;color:#A8A29E;">（选填）</span></label>
              <textarea id="f-detail" class="form-textarea" placeholder="详细的项目介绍、商业模式、团队背景等" rows={4} />
            </div>

            <div class="mb-2">
              <label class="form-label">附件上传 <span style="font-size:12px;color:#A8A29E;">（选填）</span></label>
              <div class="upload-zone" id="upload-zone">
                <i class="fas fa-cloud-upload-alt text-text-tertiary mb-2" style="font-size:28px;" />
                <p class="text-text-secondary" style="font-size:13px;">点击上传项目资料</p>
                <p class="text-text-tertiary" style="font-size:11px;">Demo阶段仅记录文件名</p>
                <input id="f-file" type="file" style="display:none;" />
              </div>
              <div id="file-name" class="text-text-secondary mt-2" style="font-size:13px;display:none;">
                <i class="fas fa-paperclip mr-1" />
                <span id="file-name-text" />
              </div>
            </div>
          </div>

          <div class="btn-row">
            <button class="btn-primary" id="btn-next-1" style="flex:1;">下一步 <i class="fas fa-arrow-right ml-1" style="font-size:12px;" /></button>
          </div>
        </div>

        {/* Step 2: Terms */}
        <div id="step-2" class="step-panel" style="display:none;">
          {/* Reference Cases Card */}
          <div class="case-toggle-card" id="case-toggle">
            <div class="case-toggle-header">
              <i class="fas fa-lightbulb" style="color:#F59E0B;font-size:14px;flex-shrink:0;" />
              <span style="flex:1;font-size:13px;color:#78716C;">不确定怎么填？查看同行案例参考</span>
              <i class="fas fa-chevron-down case-toggle-arrow" id="case-arrow" style="font-size:12px;" />
            </div>
            <div id="case-content">
              <div style="padding-top:12px;">
                <div style="font-size:14px;font-weight:600;color:#1C1917;margin-bottom:12px;">📊 同行案例参考</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  <div class="case-item" style="border-left:4px solid #DC2626;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">餐饮连锁</div>
                    <div style="font-size:11px;color:#78716C;">融资 200-500万 · 分成 10-15% · 期限 24-36月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #3B82F6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">智能制造</div>
                    <div style="font-size:11px;color:#78716C;">融资 300-800万 · 分成 12-18% · 期限 36-48月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #16A34A;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">教育培训</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 8-12% · 期限 18-24月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #8B5CF6;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">美容健康</div>
                    <div style="font-size:11px;color:#78716C;">融资 100-300万 · 分成 10-15% · 期限 18-30月 · 倍数 1.5x</div>
                  </div>
                  <div class="case-item" style="border-left:4px solid #F59E0B;">
                    <div style="font-size:12px;font-weight:600;color:#1C1917;">物流供应链</div>
                    <div style="font-size:11px;color:#78716C;">融资 500-1000万 · 分成 15-20% · 期限 36-48月 · 倍数 1.5x</div>
                  </div>
                </div>
                <div style="font-size:11px;color:#A8A29E;margin-top:8px;">ℹ️ 以上为平台典型案例范围，仅供参考</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-card p-5">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:17px;font-family:'Noto Sans SC',sans-serif;">
              <i class="fas fa-file-contract text-brand mr-2" style="font-size:14px;" />条款设定
            </h3>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">融资总额 <span class="req">*</span>
                  <span class="help-icon" data-help-id="totalAmount">?</span>
                </label>
                <div class="help-text">这个项目总共需要多少资金。所有参与人的投资加起来等于这个数。</div>
                <div class="input-unit-wrap">
                  <input id="f-amount" type="number" class="form-input" placeholder="如 200" min={1} />
                  <span class="input-unit">万元</span>
                </div>
              </div>
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">分成比例 <span class="req">*</span>
                  <span class="help-icon" data-help-id="revenueShareRatio">?</span>
                </label>
                <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
                <div class="input-unit-wrap" id="input-share-ratio">
                  <input id="f-rate" type="number" class="form-input" placeholder="如 12" min={0.1} max={100} step={0.1} />
                  <span class="input-unit">%</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">联营期限 <span class="req">*</span>
                  <span class="help-icon" data-help-id="cooperationTerm">?</span>
                </label>
                <div class="help-text">合作持续多长时间。到期后无论是否收回投资，合同自动结束。</div>
                <div class="input-unit-wrap">
                  <input id="f-duration" type="number" class="form-input" placeholder="如 24" min={1} />
                  <span class="input-unit">个月</span>
                </div>
              </div>
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">最低参与额 <span class="req">*</span>
                  <span class="help-icon" data-help-id="minParticipation">?</span>
                </label>
                <div class="help-text">每个参与人最少要投多少钱。这个金额除以融资总额就是一份的比例。</div>
                <div class="input-unit-wrap">
                  <input id="f-minamt" type="number" class="form-input" placeholder="如 10" min={1} />
                  <span class="input-unit">万/份</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">预估月收入 <span class="req">*</span>
                  <span class="help-icon" data-help-id="estimatedMonthlyRevenue">?</span>
                </label>
                <div class="help-text">发起人对项目月度收入的预估。这只是预估，实际回款取决于真实经营情况。</div>
                <div class="input-unit-wrap">
                  <input id="f-revenue" type="number" class="form-input" placeholder="如 30" min={0} step={0.1} />
                  <span class="input-unit">万元</span>
                </div>
              </div>
              <div>
                <label class="form-label" style="display:flex;align-items:center;gap:4px;">回收倍数
                  <span class="help-icon" data-help-id="recoveryMultiple">?</span>
                </label>
                <div class="help-text">参与人最多能拿回投资额的多少倍。1.5倍意味着投10万最多拿回15万。达到上限后合同自动结束。</div>
                <div class="input-unit-wrap">
                  <input id="f-multiple" type="number" class="form-input" placeholder="1.5" min={1} max={10} step={0.1} value="1.5" />
                  <span class="input-unit">x</span>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" style="display:flex;align-items:center;gap:4px;">上报频率
                <span class="help-icon" data-help-id="reportFrequency">?</span>
              </label>
              <div class="help-text">你多久向参与人汇报一次项目收入。月报适合大部分项目，日报适合零售等每日有流水的项目。</div>
              <select id="f-freq" class="form-select">
                <option value="月报">月报</option>
                <option value="日报">日报</option>
              </select>
            </div>
          </div>

          {/* Auto-calc card */}
          <div class="auto-calc-card mt-4" id="auto-calc">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-calculator text-brand" style="font-size:13px;" />
              <span class="font-semibold text-brand" style="font-size:14px;">自动计算</span>
            </div>
            <div class="auto-calc-grid">
              <div>
                <div class="auto-calc-item-label">总份额数</div>
                <div class="auto-calc-item-value" id="calc-shares">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">回收上限</div>
                <div class="auto-calc-item-value" id="calc-cap2">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">月均回款</div>
                <div class="auto-calc-item-value" id="calc-monthly2">—</div>
              </div>
              <div>
                <div class="auto-calc-item-label">预估回收期</div>
                <div class="auto-calc-item-value" id="calc-payback">—</div>
              </div>
            </div>
          </div>

          {/* Example card */}
          <div class="example-card mt-3" id="example-card">
            <i class="fas fa-lightbulb mr-1" style="color:#D4A853;" />
            <span id="example-text">填写条款后，此处会显示参与举例说明</span>
          </div>

          {/* Plain language block for create page */}
          <div id="create-plain-lang" class="plain-lang-block mt-3" style="display:none;" />

          <div class="btn-row">
            <button class="btn-secondary" id="btn-prev-2"><i class="fas fa-arrow-left mr-1" style="font-size:12px;" /> 上一步</button>
            <button class="btn-primary" id="btn-next-2">下一步 <i class="fas fa-arrow-right ml-1" style="font-size:12px;" /></button>
          </div>
        </div>

        {/* Step 3: Preview & Publish */}
        <div id="step-3" class="step-panel" style="display:none;">
          <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:17px;font-family:'Noto Sans SC',sans-serif;">
              <i class="fas fa-eye text-brand mr-2" style="font-size:14px;" />项目预览
            </h3>

            {/* Preview content — filled by JS */}
            <div id="preview-content" />
          </div>

          <div class="btn-row" style="flex-wrap:wrap;">
            <button class="btn-secondary" id="btn-prev-3" style="flex:0 0 auto;width:auto;padding:0 20px;">
              <i class="fas fa-arrow-left mr-1" style="font-size:12px;" /> 上一步
            </button>
            <button class="btn-secondary" id="btn-draft" style="flex:1;">
              <i class="fas fa-save mr-1" style="font-size:12px;" /> 保存草稿
            </button>
            <button class="btn-primary" id="btn-publish" style="flex:1.5;background:linear-gradient(135deg,#DC2626,#B91C1C);">
              <i class="fas fa-rocket mr-1" style="font-size:12px;" /> 发布到项目大厅
            </button>
          </div>
        </div>
      </main>

      <TabBar active="create" />

      {/* Client script for create project */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  // Admin intercept check
  try {
    var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
    if(cu && cu.role === 'admin'){
      var blockEl = document.getElementById('admin-create-block');
      var mainEl = document.getElementById('create-main');
      if(blockEl) blockEl.style.display = 'block';
      if(mainEl) mainEl.style.display = 'none';
      return;
    }
  } catch(e){}

  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // Step navigation
  var currentStep = 1;
  var panels = [null, document.getElementById('step-1'), document.getElementById('step-2'), document.getElementById('step-3')];

  function updateStepper(){
    for(var i=1;i<=3;i++){
      var dot = document.getElementById('dot-'+i);
      var label = document.getElementById('label-'+i);
      dot.className = 'stepper-dot ' + (i < currentStep ? 'stepper-dot-done' : i === currentStep ? 'stepper-dot-active' : 'stepper-dot-pending');
      dot.textContent = i < currentStep ? '\\u2713' : i;
      label.className = 'stepper-label ' + (i < currentStep ? 'stepper-label-done' : i === currentStep ? 'stepper-label-active' : '');
    }
    for(var i=1;i<=2;i++){
      var line = document.getElementById('line-'+i);
      line.className = 'stepper-line ' + (i < currentStep ? 'stepper-line-done' : 'stepper-line-pending');
    }
  }

  function goStep(n, direction){
    if(n < 1 || n > 3) return;
    var oldPanel = panels[currentStep];
    var newPanel = panels[n];
    if(!oldPanel || !newPanel) return;
    oldPanel.style.display = 'none';
    newPanel.style.display = 'block';
    var enterClass = direction === 'left' ? 'step-panel-enter-left' : 'step-panel-enter-right';
    newPanel.classList.add(enterClass);
    void newPanel.offsetHeight;
    newPanel.classList.remove(enterClass);
    currentStep = n;
    updateStepper();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // Form fields
  var fName = document.getElementById('f-name');
  var fIndustry = document.getElementById('f-industry');
  var fDesc = document.getElementById('f-desc');
  var fDetail = document.getElementById('f-detail');
  var fFile = document.getElementById('f-file');
  var fHighlightText = document.getElementById('f-highlight-text');
  var fHighlight1 = document.getElementById('f-highlight-1');
  var fHighlight2 = document.getElementById('f-highlight-2');
  var fHighlight3 = document.getElementById('f-highlight-3');
  var fAmount = document.getElementById('f-amount');
  var fRate = document.getElementById('f-rate');
  var fDuration = document.getElementById('f-duration');
  var fMinamt = document.getElementById('f-minamt');
  var fRevenue = document.getElementById('f-revenue');
  var fMultiple = document.getElementById('f-multiple');
  var fFreq = document.getElementById('f-freq');

  // Char count
  var descCount = document.getElementById('desc-count');
  fDesc.addEventListener('input', function(){
    var len = fDesc.value.length;
    descCount.textContent = len + '/200';
    descCount.className = len > 200 ? 'char-count char-count-over' : 'char-count';
  });
  // Highlight text char count
  var htCount = document.getElementById('highlight-text-count');
  fHighlightText.addEventListener('input', function(){
    var len = fHighlightText.value.length;
    htCount.textContent = len + '/50';
    htCount.style.color = len > 50 ? '#DC2626' : '#A8A29E';
  });

  // File upload
  var uploadZone = document.getElementById('upload-zone');
  var fileNameDiv = document.getElementById('file-name');
  var fileNameText = document.getElementById('file-name-text');
  var uploadedFileName = '';
  uploadZone.addEventListener('click', function(){ fFile.click(); });
  fFile.addEventListener('change', function(){
    if(fFile.files && fFile.files.length > 0){
      uploadedFileName = fFile.files[0].name;
      fileNameText.textContent = uploadedFileName;
      fileNameDiv.style.display = 'block';
    }
  });

  // Step 1 validation
  document.getElementById('btn-next-1').addEventListener('click', function(){
    var errors = [];
    if(!fName.value.trim()) errors.push('项目名称');
    if(!fIndustry.value) errors.push('所属行业');
    if(!fDesc.value.trim()) errors.push('项目简介');
    if(fDesc.value.length > 200) errors.push('项目简介超过200字');
    if(errors.length > 0){
      showToast('请填写：' + errors.join('、'), 'error');
      return;
    }
    goStep(2, 'right');
    // Coach Mark for create page - share ratio
    setTimeout(function(){
      showCoachMark('#input-share-ratio', '这是你愿意分给参与人的月收入比例。填高了回款快但你让利多，填低了可能不够吸引人。一般在8%-20%', 'bottom', 'create-ratio');
    }, 800);
    // ── Nudge B: Terms step 30s without number input ──
    if (!localStorage.getItem('zlc_nudge_create_terms')) {
      var termsNudgeTimer = setTimeout(function(){ showNudge('\\uD83D\\uDCCA', '不确定怎么填？展开上方的「同行案例参考」看看', 'create_terms'); }, 30000);
      function cancelTermsNudge(){ clearTimeout(termsNudgeTimer); }
      [fAmount, fRate, fDuration, fMinamt, fRevenue, fMultiple].forEach(function(input){
        input.addEventListener('input', cancelTermsNudge);
      });
      window.addEventListener('beforeunload', cancelTermsNudge);
    }
  });

  // Reference cases toggle
  var caseToggle = document.getElementById('case-toggle');
  var caseContent = document.getElementById('case-content');
  var caseArrow = document.getElementById('case-arrow');
  if(caseToggle && caseContent && caseArrow){
    caseToggle.addEventListener('click', function(){
      caseContent.classList.toggle('expanded');
      caseArrow.classList.toggle('rotate-180');
    });
  }

  // Re-init help icons for step 2 (created dynamically)
  if(typeof initHelpIcons === 'function') initHelpIcons();

  // Step 2 auto-calc
  var calcFields = [fAmount, fRate, fDuration, fMinamt, fRevenue, fMultiple];
  function updateAutoCalc(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;

    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var cap = amount * multiple;
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;

    document.getElementById('calc-shares').textContent = shares > 0 ? shares + ' 份' : '—';
    document.getElementById('calc-cap2').textContent = cap > 0 ? '¥' + cap.toFixed(1) + '万' : '—';
    document.getElementById('calc-monthly2').textContent = monthly > 0 ? '¥' + monthly.toFixed(2) + '万' : '—';
    document.getElementById('calc-payback').textContent = payback > 0 ? payback + ' 个月' : '—';

    // Example
    var exampleEl = document.getElementById('example-text');
    if(minamt > 0 && monthly > 0){
      var perShareMonthly = revenue * (rate / 100) * (minamt / amount);
      var perSharePayback = Math.ceil(minamt / perShareMonthly);
      exampleEl.textContent = '如果参与 ¥' + minamt + '万，预估每月回款 ¥' + perShareMonthly.toFixed(2) + '万，约' + perSharePayback + '个月收回本金';
    } else {
      exampleEl.textContent = '填写条款后，此处会显示参与举例说明';
    }

    // Plain language block for create page
    var plEl = document.getElementById('create-plain-lang');
    if(plEl){
      if(amount > 0 && rate > 0 && revenue > 0 && minamt > 0){
        var monthlyShareAll = revenue * (rate / 100);
        var perShareM = monthlyShareAll * (minamt / amount);
        var perSharePB = perShareM > 0 ? Math.ceil(minamt / perShareM) : 0;
        var perShareCap = minamt * multiple;
        plEl.style.display = 'block';
        plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
          + '<div class="plain-lang-body">'
          + '这个项目总共需要 ' + amount + ' 万资金。你承诺把项目每月收入的 ' + rate + '% 分给所有参与人。按预估每月收入 ' + revenue + ' 万计算，每月总共分出约 ' + monthlyShareAll.toFixed(2) + ' 万。'
          + '<br/><br/>如果有人参与 ' + minamt + ' 万（1份），他每月大约能拿到 ' + perShareM.toFixed(2) + ' 万，大概 ' + perSharePB + ' 个月收回本金，最多能拿回 ' + perShareCap.toFixed(2) + ' 万（投资额的 ' + multiple + ' 倍）。'
          + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
          + '</div>';
      } else {
        plEl.style.display = 'none';
      }
    }
  }
  calcFields.forEach(function(f){ f.addEventListener('input', updateAutoCalc); });

  // Step 2 nav
  document.getElementById('btn-prev-2').addEventListener('click', function(){ goStep(1, 'left'); });
  document.getElementById('btn-next-2').addEventListener('click', function(){
    var errors = [];
    if(!fAmount.value || parseFloat(fAmount.value)<=0) errors.push('融资总额');
    if(!fRate.value || parseFloat(fRate.value)<=0) errors.push('分成比例');
    if(!fDuration.value || parseFloat(fDuration.value)<=0) errors.push('联营期限');
    if(!fMinamt.value || parseFloat(fMinamt.value)<=0) errors.push('最低参与额');
    if(!fRevenue.value || parseFloat(fRevenue.value)<=0) errors.push('预估月收入');
    if(errors.length > 0){
      showToast('请填写：' + errors.join('、'), 'error');
      return;
    }
    buildPreview();
    goStep(3, 'right');
  });

  // Step 3 preview builder
  function buildPreview(){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var cap = amount * multiple;
    var monthly = revenue * (rate / 100);
    var payback = monthly > 0 ? Math.ceil(amount / monthly) : 0;

    var html = '';
    // Header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">' + (fIndustry.value||'') + '</span>';
    html += '<span class="badge badge-open">募集中</span>';
    html += '</div>';
    // Name
    html += '<h2 style="font-size:20px;font-weight:700;color:#292524;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + fName.value + '</h2>';
    // HighlightText (if any)
    if(fHighlightText.value.trim()){
      html += '<div style="font-size:14px;color:#B91C1C;font-style:italic;margin-bottom:12px;line-height:1.5;">' + fHighlightText.value.trim() + '</div>';
    }
    // Owner
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:12px;">';
    html += '<div style="width:40px;height:40px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
    html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + ' <span style="font-size:12px;color:#78716C;font-weight:400;">· ' + (u.title||'') + '</span></div>';
    html += '<div style="font-size:12px;color:#78716C;">' + (u.company||'') + ' · ' + (u.cohort||'') + '</div></div></div>';
    // Description
    html += '<p style="font-size:14px;line-height:1.7;color:#292524;margin-bottom:16px;">' + fDesc.value + '</p>';
    if(fDetail.value.trim()){
      html += '<p style="font-size:13px;line-height:1.7;color:#78716C;margin-bottom:16px;">' + fDetail.value + '</p>';
    }
    // Highlights (if any)
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    if(hlArr.length > 0){
      html += '<div style="margin-bottom:16px;padding:16px 20px;background:#fff;border-radius:14px;border-left:3px solid #D4A853;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:14px;font-weight:600;color:#1C1917;">项目亮点</span><span style="font-size:14px;">\\u2B50</span></div>';
      html += '<div style="margin-top:10px;">';
      hlArr.forEach(function(h){
        html += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;"><span style="width:6px;height:6px;background:#D4A853;border-radius:50%;flex-shrink:0;margin-top:6px;"></span><span style="font-size:14px;color:#44403C;line-height:1.6;">' + h + '</span></div>';
      });
      html += '</div></div>';
    }
    // Terms grid
    html += '<div style="border-left:4px solid #B91C1C;border-radius:12px;overflow:hidden;background:#fff;border:1px solid #F5F5F4;border-left:4px solid #B91C1C;">';
    html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;font-size:15px;font-weight:600;color:#292524;"><i class="fas fa-file-contract" style="color:#B91C1C;margin-right:8px;font-size:13px;"></i>收入分成条款</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">';
    var terms = [
      ['融资总额', '¥'+amount+'万'], ['分成比例', rate+'%'], ['联营期限', duration+'个月'],
      ['回收倍数', multiple+'x'], ['回收上限', '¥'+cap.toFixed(1)+'万'], ['预估月收入', '¥'+revenue+'万']
    ];
    terms.forEach(function(t,i){
      html += '<div style="padding:12px 16px;border-bottom:1px solid #F5F5F4;' + (i%2===0?'border-right:1px solid #F5F5F4;':'') + '">';
      html += '<div style="font-size:11px;color:#78716C;margin-bottom:2px;">' + t[0] + '</div>';
      html += '<div style="font-size:17px;font-weight:700;color:#1C1917;">' + t[1] + '</div></div>';
    });
    html += '</div>';
    html += '<div style="background:#FEF2F2;padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    html += '<div><div style="font-size:11px;color:#78716C;">预估月回款</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">¥' + monthly.toFixed(2) + '万</div></div>';
    html += '<div><div style="font-size:11px;color:#78716C;">预估回收期</div><div style="font-size:17px;font-weight:700;color:#B91C1C;">约' + payback + '月</div></div>';
    html += '</div></div>';
    // Info
    html += '<div style="margin-top:12px;font-size:12px;color:#78716C;">总份额 ' + shares + ' 份 · 每份 ¥' + minamt + '万 · 上报频率：' + fFreq.value + '</div>';
    if(uploadedFileName){
      html += '<div style="margin-top:8px;font-size:12px;color:#78716C;"><i class="fas fa-paperclip" style="margin-right:4px;"></i>附件：' + uploadedFileName + '</div>';
    }
    document.getElementById('preview-content').innerHTML = html;
  }

  // Step 3 nav
  document.getElementById('btn-prev-3').addEventListener('click', function(){ goStep(2, 'left'); });

  // Collect form data
  function collectData(status){
    var amount = parseFloat(fAmount.value) || 0;
    var rate = parseFloat(fRate.value) || 0;
    var duration = parseInt(fDuration.value) || 0;
    var minamt = parseFloat(fMinamt.value) || 0;
    var revenue = parseFloat(fRevenue.value) || 0;
    var multiple = parseFloat(fMultiple.value) || 1.5;
    var shares = minamt > 0 ? Math.floor(amount / minamt) : 0;
    var id = 'p-' + Date.now().toString(36);
    // Collect highlights (filter empty)
    var hlArr = [fHighlight1.value.trim(), fHighlight2.value.trim(), fHighlight3.value.trim()].filter(function(v){return v;});
    return {
      id: id, name: fName.value.trim(), ownerId: u.id,
      industry: fIndustry.value, description: fDesc.value.trim(),
      detail: fDetail.value.trim(), attachment: uploadedFileName,
      highlightText: fHighlightText.value.trim() || '',
      highlights: hlArr.length > 0 ? hlArr : [],
      targetAmount: amount, raisedAmount: 0,
      revenueShareRate: rate, duration: duration,
      recoveryMultiple: multiple, estimatedMonthlyRevenue: revenue,
      totalShares: shares, raisedShares: 0,
      sharePrice: minamt, minShares: 1,
      reportFrequency: fFreq.value,
      status: status, createdAt: new Date().toISOString().slice(0,10),
      investors: []
    };
  }

  // Save draft
  document.getElementById('btn-draft').addEventListener('click', function(){
    var proj = collectData('draft');
    var projects = [];
    try { projects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
    projects.push(proj);
    localStorage.setItem('zlc_user_projects', JSON.stringify(projects));
    showToast('草稿已保存', 'success');
    setTimeout(function(){ window.location.href = '/'; }, 800);
  });

  // Publish
  document.getElementById('btn-publish').addEventListener('click', function(){
    var proj = collectData('open');
    // Generate a share code
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var shareCode = '';
    for(var i=0;i<6;i++) shareCode += chars.charAt(Math.floor(Math.random()*chars.length));
    proj.shareCode = shareCode;
    proj.initiatorClassId = u.classId || '';
    proj.initiatorClassName = u.className || '';
    proj.viewCount = 0;
    var projects = [];
    try { projects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
    projects.push(proj);
    localStorage.setItem('zlc_user_projects', JSON.stringify(projects));

    // Show custom success modal with share button (Task 2)
    var overlay = document.createElement('div');
    overlay.className = 'success-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
    overlay.innerHTML = '<div style="background:#fff;border-radius:24px;padding:32px;max-width:320px;width:90%;text-align:center;">'
      + '<i class="fas fa-check-circle" style="font-size:64px;color:#16A34A;animation:iconPop 0.5s cubic-bezier(0.16,1,0.3,1);"></i>'
      + '<div style="font-size:20px;font-weight:700;color:#1C1917;margin-top:16px;">发起成功</div>'
      + '<div style="font-size:14px;color:#78716C;margin-top:8px;">项目已发布到大厅，分享给同学吧</div>'
      + '<div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">'
      + '<button id="success-share-btn" style="background:linear-gradient(135deg,#B91C1C,#991B1B);color:#fff;border:none;border-radius:12px;padding:14px;width:100%;font-size:15px;font-weight:600;cursor:pointer;">\\uD83D\\uDCE4 分享给同学</button>'
      + '<button id="success-view-btn" style="background:transparent;color:#44403C;border:1px solid #E7E5E4;border-radius:12px;padding:14px;width:100%;font-size:15px;font-weight:600;cursor:pointer;">查看项目</button>'
      + '</div></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.style.opacity = '1'; });

    document.getElementById('success-share-btn').addEventListener('click', function(){
      window.location.href = '/projects/' + proj.id + '?share=true';
    });
    document.getElementById('success-view-btn').addEventListener('click', function(){
      window.location.href = '/projects/' + proj.id;
    });
  });
})();
`}} />
    </div>,
    { title: '中流通 - 发起项目' }
  )
})

// ══════════════════════════════════════════════════════════
// Contract Sign  (/contracts/:id/sign)
// ══════════════════════════════════════════════════════════
app.get('/contracts/:id/sign', (c) => {
  const contractId = c.req.param('id')

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="javascript:history.back()" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回
        </a>

        {/* Contract Content */}
        <div class="contract-card mb-4" id="contract-body-card">
          <div class="contract-title">收入分成合作协议</div>
          <div class="contract-no" id="contract-no">协议编号：—</div>

          <div class="contract-body" id="contract-content">
            <p style="text-align:center;color:#A8A29E;">加载中...</p>
          </div>
        </div>

        {/* Plain Language Block for contract */}
        <div id="contract-plain-lang" class="plain-lang-block mb-4" style="display:none;" />

        {/* Sign Area */}
        <div class="sign-area mb-4" id="sign-area">
          <h4 class="font-semibold text-text-title mb-4" style="font-size:16px;">
            <i class="fas fa-pen-nib mr-2" style="color:#D4A853;font-size:14px;" />签署确认
          </h4>

          <div class="checkbox-row mb-3">
            <input type="checkbox" id="agree-check" />
            <label for="agree-check">我已阅读并同意以上合同条款</label>
          </div>

          <div class="verify-row">
            <input type="text" class="verify-input" id="verify-code" placeholder="请输入验证码" maxlength={6} />
            <button class="verify-send-btn" id="verify-send">发送验证码</button>
          </div>

          <button class="btn-gold mt-4" id="sign-btn" disabled={true} style="opacity:0.5;">
            <i class="fas fa-signature mr-2" />确认签署
          </button>

          {/* Sign Status */}
          <div class="sign-status" id="sign-status">
            <div class="sign-status-item">
              <div class="sign-status-label">甲方（发起人）</div>
              <div class="sign-status-val sign-status-pending" id="sign-a">
                <i class="fas fa-clock mr-1" />待签署
              </div>
            </div>
            <div class="sign-status-item">
              <div class="sign-status-label">乙方（参与人）</div>
              <div class="sign-status-val sign-status-pending" id="sign-b">
                <i class="fas fa-clock mr-1" />待签署
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ceremony full-screen page (Task 1 — replaces old success overlay) */}
      <div class="ceremony-page" id="ceremony-page">
        <div class="ceremony-check-circle" id="ceremony-circle">
          <span class="ceremony-check-mark" id="ceremony-check">✓</span>
        </div>
        <div class="ceremony-title">
          <h2>投资协议已生效</h2>
          <p>合同由平台托管，具有法律效力</p>
        </div>
        <div class="ceremony-summary" id="ceremony-summary">
          {/* Rows injected by JS */}
        </div>
        <div class="ceremony-buttons">
          <button class="ceremony-btn-primary" id="ceremony-share-btn">📤 分享给同学</button>
          <button class="ceremony-btn-secondary" id="ceremony-contract-btn">查看合同详情</button>
          <button class="ceremony-btn-tertiary" id="ceremony-home-btn">返回首页</button>
        </div>
      </div>

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACT_ID = '${contractId}';

  // Load contract data from localStorage
  var contracts = [];
  try { contracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  var contract = contracts.find(function(c){ return c.id === CONTRACT_ID; });

  if(!contract){
    document.getElementById('contract-content').innerHTML = '<p style="text-align:center;color:#DC2626;">合同未找到</p>';
    document.getElementById('sign-area').style.display = 'none';
    return;
  }

  // Load project data
  var proj = contract.project;
  var ownerName = contract.ownerName || '发起人';

  // Set contract number
  document.getElementById('contract-no').textContent = '协议编号：ZLC-' + proj.id + '-' + CONTRACT_ID;

  // Build contract body
  var html = '';
  html += '<div class="contract-party"><div class="contract-party-label">甲方（项目发起方）</div>';
  html += '<div class="contract-party-name">' + ownerName + '</div></div>';
  html += '<div class="contract-party"><div class="contract-party-label">乙方（投资参与方）</div>';
  html += '<div class="contract-party-name">' + u.name + '</div></div>';

  html += '<h4>第一条 项目基本信息</h4>';
  html += '<p class="indent">项目名称：<b>' + proj.name + '</b></p>';
  html += '<p class="indent">所属行业：' + proj.industry + '</p>';
  html += '<p class="indent">项目简介：' + proj.description + '</p>';

  html += '<h4>第二条 投资条款</h4>';
  html += '<p class="indent">乙方同意向甲方项目投入资金 <b>¥' + contract.amount + '万元</b>（共 ' + contract.shares + ' 份，每份 ¥' + proj.sharePrice + '万元）。</p>';
  html += '<p class="indent">收入分成比例：甲方同意将项目收入的 <b>' + proj.revenueShareRate + '%</b> 按投资占比分配给全体投资人。</p>';
  html += '<p class="indent">联营期限：自合同生效之日起 <b>' + proj.duration + ' 个月</b>。</p>';

  html += '<h4>第三条 回收上限</h4>';
  html += '<p class="indent">乙方投资回收上限为投资金额的 <b>' + proj.recoveryMultiple + '</b> 倍，即 <b>¥' + (contract.amount * proj.recoveryMultiple).toFixed(1) + '万元</b>。达到回收上限后，分成自动停止。</p>';

  html += '<h4>第四条 收入确认与分成计算</h4>';
  html += '<p class="indent">甲方按' + (proj.reportFrequency || '月报') + '频率向平台提交经营收入数据。</p>';
  html += '<p class="indent">分成计算公式：<b>月分成 = 当月确认收入 × ' + proj.revenueShareRate + '% × (乙方投资额 ÷ 融资总额)</b></p>';

  html += '<h4>第五条 风险提示</h4>';
  html += '<p class="indent">本项目为收入分成模式（RBF），非固定回报承诺。实际回款取决于项目经营情况，投资人需自行承担经营风险。</p>';

  html += '<h4>第六条 其他约定</h4>';
  html += '<p class="indent">本协议一式两份，甲乙双方各执一份（电子版），经双方签署后生效。</p>';
  html += '<p class="indent">本协议由「中流通」平台提供电子签署服务，具有同等法律效力。</p>';

  html += '<div style="margin-top:24px;display:flex;gap:20px;">';
  html += '<div style="flex:1;"><div style="font-size:12px;color:#78716C;margin-bottom:4px;">甲方签署</div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + ownerName + '</div></div>';
  html += '<div style="flex:1;"><div style="font-size:12px;color:#78716C;margin-bottom:4px;">乙方签署</div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + '</div></div>';
  html += '</div>';

  document.getElementById('contract-content').innerHTML = html;

  // Render plain-language block for contract
  (function(){
    var plEl = document.getElementById('contract-plain-lang');
    if(!plEl || !proj) return;
    var amount = contract.amount;
    var ratio = proj.revenueShareRate;
    var estRevenue = proj.estimatedMonthlyRevenue;
    var multiple = proj.recoveryMultiple;
    var totalAmount = proj.targetAmount;
    var monthlyShare = estRevenue * ratio / 100;
    var myMonthly = monthlyShare * (amount / totalAmount);
    var myMonths = myMonthly > 0 ? Math.ceil(amount / myMonthly) : 0;
    var myCap = amount * multiple;

    plEl.style.display = 'block';
    plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
      + '<div class="plain-lang-body">'
      + '你将投入 ' + amount + ' 万参与"' + proj.name + '"项目。项目每月收入的 ' + ratio + '% 按你的份额比例分给你。按预估，你每月约拿到 ' + myMonthly.toFixed(2) + ' 万，约 ' + myMonths + ' 个月收回本金，最多拿回 ' + myCap.toFixed(2) + ' 万。'
      + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
      + '</div>';
  })();

  // Check if already signed
  if(contract.status === 'active'){
    document.getElementById('sign-area').innerHTML = '<div style="text-align:center;padding:20px;"><div style="width:56px;height:56px;border-radius:50%;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 12px;"><i class="fas fa-check"></i></div><p style="font-size:16px;font-weight:600;color:#16a34a;">合同已签署生效</p></div>';
    return;
  }

  // Verify code logic
  var verifyBtn = document.getElementById('verify-send');
  var verifyInput = document.getElementById('verify-code');
  var agreeCheck = document.getElementById('agree-check');
  var signBtn = document.getElementById('sign-btn');
  var countdown = 0;

  verifyBtn.addEventListener('click', function(){
    if(countdown > 0) return;
    countdown = 60;
    verifyBtn.disabled = true;
    verifyBtn.textContent = '60s';
    showToast('验证码已发送（Demo: 888888）', 'success');
    var cd = setInterval(function(){
      countdown--;
      if(countdown <= 0){ clearInterval(cd); verifyBtn.disabled = false; verifyBtn.textContent = '发送验证码'; }
      else { verifyBtn.textContent = countdown + 's'; }
    }, 1000);
  });

  // Enable sign button when both checked and code filled
  function checkCanSign(){
    var canSign = agreeCheck.checked && verifyInput.value.trim().length >= 4;
    signBtn.disabled = !canSign;
    signBtn.style.opacity = canSign ? '1' : '0.5';
  }
  agreeCheck.addEventListener('change', checkCanSign);
  verifyInput.addEventListener('input', checkCanSign);

  // Sign
  signBtn.addEventListener('click', function(){
    if(signBtn.disabled) return;
    if(verifyInput.value.trim() !== '888888'){
      showToast('验证码错误', 'error');
      return;
    }

    // Update sign status — participant signs
    var signB = document.getElementById('sign-b');
    signB.className = 'sign-status-val sign-status-done';
    signB.innerHTML = '<i class="fas fa-check-circle mr-1"></i>已签署';

    // Disable sign area inputs
    signBtn.disabled = true;
    signBtn.textContent = '签署中...';
    agreeCheck.disabled = true;
    verifyInput.disabled = true;
    verifyBtn.disabled = true;

    // Simulate owner auto-sign after 1s
    setTimeout(function(){
      var signA = document.getElementById('sign-a');
      signA.className = 'sign-status-val sign-status-done';
      signA.innerHTML = '<i class="fas fa-check-circle mr-1"></i>已签署';

      // Update contract in localStorage
      contract.status = 'active';
      contract.signedAt = new Date().toISOString();
      var allContracts = [];
      try { allContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
      var idx = allContracts.findIndex(function(c){ return c.id === CONTRACT_ID; });
      if(idx >= 0) allContracts[idx] = contract;
      localStorage.setItem('zlc_contracts', JSON.stringify(allContracts));

      // Check if project should become active
      var projectContracts = allContracts.filter(function(c){ return c.projectId === proj.id; });
      var allActive = projectContracts.every(function(c){ return c.status === 'active'; });
      if(allActive){
        // Update user project status if exists
        var userProjects = [];
        try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
        var pIdx = userProjects.findIndex(function(p){ return p.id === proj.id; });
        if(pIdx >= 0){ userProjects[pIdx].status = 'active'; localStorage.setItem('zlc_user_projects', JSON.stringify(userProjects)); }
      }

      // Show ceremony page (Task 1)
      setTimeout(function(){
        // Calculate ceremony data
        var investmentAmount = contract.amount;
        var proj = contract.project;
        var sharePercentage = (investmentAmount / proj.targetAmount * 100).toFixed(1);
        var monthlyShare = (investmentAmount * proj.revenueShareRate / 100).toFixed(2);
        var recoveryCap = (investmentAmount * proj.recoveryMultiple).toFixed(1);

        // Fill summary rows
        var summaryEl = document.getElementById('ceremony-summary');
        if(summaryEl){
          summaryEl.innerHTML = ''
            + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">投资金额</span><span class="ceremony-summary-value">¥' + investmentAmount + '万</span></div>'
            + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">占比份额</span><span class="ceremony-summary-value">' + sharePercentage + '%</span></div>'
            + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">预估月回款</span><span class="ceremony-summary-value">≈¥' + monthlyShare + '万</span></div>'
            + '<div class="ceremony-summary-row"><span class="ceremony-summary-label">回收上限</span><span class="ceremony-summary-value">¥' + recoveryCap + '万</span></div>';
        }

        // Show ceremony page
        var ceremony = document.getElementById('ceremony-page');
        if(ceremony){
          ceremony.classList.add('show');
          // Trigger animations
          var circle = document.getElementById('ceremony-circle');
          var check = document.getElementById('ceremony-check');
          if(circle) circle.classList.add('animate');
          if(check) check.classList.add('animate');
        }

        // Button handlers
        var shareBtn = document.getElementById('ceremony-share-btn');
        if(shareBtn){
          shareBtn.addEventListener('click', function(){
            window.location.href = '/projects/' + contract.projectId + '?share=true';
          });
        }
        var contractBtn = document.getElementById('ceremony-contract-btn');
        if(contractBtn){
          contractBtn.addEventListener('click', function(){
            ceremony.classList.remove('show');
          });
        }
        var homeBtn = document.getElementById('ceremony-home-btn');
        if(homeBtn){
          homeBtn.addEventListener('click', function(){
            window.location.href = '/';
          });
        }
      }, 500);
    }, 1000);
  });
})();
`}} />
    </div>,
    { title: '中流通 - 合同签署' }
  )
})

// ══════════════════════════════════════════════════════════
// Repayments Center  (/repayments)
// ══════════════════════════════════════════════════════════
app.get('/repayments', (c) => {
  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto">
        {/* Title */}
        <section class="px-4 pt-4 pb-0">
          <h1 class="font-bold text-text-title" style="font-size:22px;font-weight:700;color:#1C1917;font-family:'Noto Sans SC',sans-serif;">回款中心</h1>
        </section>

        {/* Tab switcher */}
        <div id="repayment-tabs" class="rep-tab-bar" style="background:#fff;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;margin-top:12px;">
          <button id="tab-invest" class="rep-tab rep-tab-active" style="flex:1;padding:12px 0;font-size:15px;font-weight:600;background:none;border:none;cursor:pointer;position:relative;color:#B91C1C;">
            我的投资
            <span class="rep-tab-line" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;" />
          </button>
          <button id="tab-initiate" class="rep-tab" style="flex:1;padding:12px 0;font-size:15px;font-weight:600;background:none;border:none;cursor:pointer;position:relative;color:#78716C;">
            我的发起
          </button>
        </div>

        {/* 我的投资 Content */}
        <div id="panel-invest" class="px-4 pt-4 pb-4" />

        {/* 我的发起 Content */}
        <div id="panel-initiate" class="px-4 pt-4 pb-4" style="display:none;" />
      </main>

      <TabBar active="repayments" />

      {/* Client-side logic */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACTS = ${JSON.stringify(mockContracts)};
  var PROJECTS = ${JSON.stringify(mockProjects.map(p => ({ ...p })))};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company })))};
  var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
  var REV_REPORTS = ${JSON.stringify(mockRevenueReports)};

  // Also merge localStorage contracts
  var lsContracts = [];
  try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  // Also merge localStorage projects
  var lsProjects = [];
  try { lsProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  // Also merge localStorage revenue reports & repayment records
  var lsReports = [];
  try { lsReports = JSON.parse(localStorage.getItem('zlc_revenue_reports') || '[]'); } catch(e){}
  var lsRepRecords = [];
  try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}

  // Merge all data
  lsContracts.forEach(function(c){ if(!CONTRACTS.find(function(x){return x.id===c.id;})) CONTRACTS.push(c); });
  lsProjects.forEach(function(p){ if(!PROJECTS.find(function(x){return x.id===p.id;})) PROJECTS.push(p); });
  lsReports.forEach(function(r){ if(!REV_REPORTS.find(function(x){return x.id===r.id;})) REV_REPORTS.push(r); });
  lsRepRecords.forEach(function(r){ if(!REP_RECORDS.find(function(x){return x.id===r.id;})) REP_RECORDS.push(r); });

  // Tabs
  var tabInvest = document.getElementById('tab-invest');
  var tabInitiate = document.getElementById('tab-initiate');
  var panelInvest = document.getElementById('panel-invest');
  var panelInitiate = document.getElementById('panel-initiate');

  function setTab(which){
    if(which === 'invest'){
      tabInvest.style.color = '#B91C1C';
      tabInvest.innerHTML = '我的投资<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;"></span>';
      tabInitiate.style.color = '#78716C';
      tabInitiate.innerHTML = '我的发起';
      panelInvest.style.display = 'block';
      panelInitiate.style.display = 'none';
    } else {
      tabInitiate.style.color = '#B91C1C';
      tabInitiate.innerHTML = '我的发起<span style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:48px;height:3px;background:#B91C1C;border-radius:2px;"></span>';
      tabInvest.style.color = '#78716C';
      tabInvest.innerHTML = '我的投资';
      panelInvest.style.display = 'none';
      panelInitiate.style.display = 'block';
    }
  }
  tabInvest.addEventListener('click', function(){ setTab('invest'); });
  tabInitiate.addEventListener('click', function(){ setTab('initiate'); });

  // ── 我的投资 ──
  var myContracts = CONTRACTS.filter(function(c){ return c.participantId === u.id && (c.status === 'active' || c.status === 'completed'); });

  // Summary
  var totalInvested = 0, totalRepaid = 0, activeCount = 0, completedCount = 0;
  myContracts.forEach(function(c){
    totalInvested += c.amount;
    // Calculate repaid from records
    var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
    var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (c.totalRepaid || 0);
    totalRepaid += repaid;
    if(c.status === 'active') activeCount++;
    if(c.status === 'completed') completedCount++;
  });
  var recoveryPct = totalInvested > 0 ? (totalRepaid / totalInvested * 100).toFixed(1) : '0.0';

  var investHTML = '';

  if(myContracts.length === 0){
    // Empty state
    investHTML += '<div style="text-align:center;padding:48px 0;">';
    investHTML += '<div style="width:64px;height:64px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><i class="fas fa-wallet" style="font-size:28px;color:#B91C1C;"></i></div>';
    investHTML += '<p style="font-size:16px;font-weight:600;color:#292524;margin-bottom:4px;">还没有参与任何项目</p>';
    investHTML += '<p style="font-size:14px;color:#78716C;margin-bottom:20px;">去项目大厅发现优质项目吧</p>';
    investHTML += '<a href="/projects" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">去项目大厅看看 <i class="fas fa-arrow-right" style="font-size:12px;"></i></a>';
    investHTML += '</div>';
  } else {
    // Summary card
    investHTML += '<div style="background:linear-gradient(135deg,#B91C1C,#7F1D1D);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px;">';
    investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">\\u00A5' + totalInvested + '\\u4E07</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">总投资</div></div>';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">\\u00A5' + totalRepaid.toFixed(1) + '\\u4E07</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">总回款</div></div>';
    investHTML += '<div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;">' + recoveryPct + '%</div><div style="font-size:12px;opacity:0.7;margin-top:2px;">综合回收</div></div>';
    investHTML += '</div>';
    investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    investHTML += '<div><span style="font-size:14px;opacity:0.8;">在投项目</span> <span style="font-size:16px;font-weight:700;">' + activeCount + '个</span></div>';
    investHTML += '<div><span style="font-size:14px;opacity:0.8;">已完成</span> <span style="font-size:16px;font-weight:700;">' + completedCount + '个</span></div>';
    investHTML += '</div></div>';

    // Project cards
    investHTML += '<div style="display:flex;flex-direction:column;gap:12px;">';
    myContracts.forEach(function(c){
      var recs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
      var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (c.totalRepaid || 0);
      var lastRec = recs.length > 0 ? recs[recs.length-1] : null;
      var monthlyAvg = recs.length > 0 ? (repaid / recs.length) : 0;
      var progressPct = c.recoveryCap > 0 ? (repaid / c.recoveryCap * 100).toFixed(1) : '0.0';
      var statusBadge = c.status === 'active' ? '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>' : '<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';
      var initiator = MEMBERS.find(function(m){ return m.id === c.initiatorId; });
      var initName = c.initiatorName || (initiator ? initiator.name : '');
      var initComp = c.initiatorCompany || (initiator ? initiator.company : '');
      var isCompletedContract = c.status === 'completed';
      var barBg = isCompletedContract ? 'linear-gradient(90deg,#16A34A,#15803D)' : 'linear-gradient(90deg,#D4A853,#B8860B)';
      var barColor = isCompletedContract ? '#16A34A' : '#D4A853';

      investHTML += '<a href="/investments/' + c.id + '" style="display:block;text-decoration:none;color:inherit;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform=\\'translateY(-2px)\\';this.style.boxShadow=\\'0 4px 16px rgba(0,0,0,0.08)\\';" onmouseout="this.style.transform=\\'none\\';this.style.boxShadow=\\'0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03)\\';">';
      investHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
      investHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + c.projectName + '</span>';
      investHTML += statusBadge;
      investHTML += '</div>';
      investHTML += '<div style="font-size:13px;color:#78716C;margin-bottom:10px;">' + initName + ' \\u00B7 ' + initComp + '</div>';
      investHTML += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + c.amount + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">我的投资</div></div>';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + repaid.toFixed(2) + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">已回款</div></div>';
      investHTML += '<div><div style="font-size:16px;font-weight:700;color:#1C1917;">\\u00A5' + monthlyAvg.toFixed(2) + '\\u4E07</div><div style="font-size:11px;color:#A8A29E;">月回</div></div>';
      investHTML += '</div>';
      // Progress bar
      investHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
      investHTML += '<div style="flex:1;height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;"><div style="height:100%;border-radius:3px;background:'+barBg+';width:' + Math.min(parseFloat(progressPct), 100) + '%;transition:width 0.6s;"></div></div>';
      investHTML += '<span style="font-size:12px;color:'+barColor+';font-weight:600;">' + progressPct + '%</span>';
      investHTML += '</div>';
      // Last repayment
      if(lastRec){
        var dateStr = lastRec.date.slice(5).replace('-','/');
        investHTML += '<div style="font-size:12px;color:#16A34A;">最近回款: ' + dateStr + ' +\\u00A5' + lastRec.shareAmount.toFixed(2) + '\\u4E07</div>';
      }
      investHTML += '</a>';
    });
    investHTML += '</div>';
  }
  panelInvest.innerHTML = investHTML;

  // ── 我的发起 ──
  var myProjects = PROJECTS.filter(function(p){ return p.ownerId === u.id; });

  var initiateHTML = '';

  if(myProjects.length === 0){
    initiateHTML += '<div style="text-align:center;padding:48px 0;">';
    initiateHTML += '<div style="width:64px;height:64px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><i class="fas fa-rocket" style="font-size:28px;color:#B91C1C;"></i></div>';
    initiateHTML += '<p style="font-size:16px;font-weight:600;color:#292524;margin-bottom:4px;">还没有发起过项目</p>';
    initiateHTML += '<p style="font-size:14px;color:#78716C;margin-bottom:20px;">发起你的第一个项目吧</p>';
    initiateHTML += '<a href="/create" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;background:#B91C1C;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">发起第一个项目 <i class="fas fa-plus" style="font-size:12px;"></i></a>';
    initiateHTML += '</div>';
  } else {
    initiateHTML += '<div style="display:flex;flex-direction:column;gap:12px;">';
    myProjects.forEach(function(p){
      var statusMap = {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',draft:'草稿'};
      var statusLabel = statusMap[p.status] || p.status;
      var badgeStyle = '';
      if(p.status==='open') badgeStyle = 'background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;';
      else if(p.status==='active') badgeStyle = 'background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;';
      else if(p.status==='completed') badgeStyle = 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;';
      else if(p.status==='draft') badgeStyle = 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;';
      else badgeStyle = 'background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;';

      // Count participants from contracts (signed)
      var projContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id && c.status === 'active'; });
      var participantCount = projContracts.length || p.investors.length;

      // Get viewCount from localStorage or mock data (Task 3)
      var viewCounts = {};
      try { viewCounts = JSON.parse(localStorage.getItem('zlc_view_counts') || '{}'); } catch(e){}
      var viewCount = viewCounts[p.id] !== undefined ? viewCounts[p.id] : (p.viewCount || 0);

      initiateHTML += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;position:relative;">';
      // Share icon button (Task 2) — top right
      if(p.status !== 'draft'){
        initiateHTML += '<a href="/projects/' + p.id + '?share=true" style="position:absolute;top:16px;right:16px;color:#78716C;text-decoration:none;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;transition:color 0.2s,background 0.2s;" onmouseover="this.style.color=\\'#B91C1C\\';this.style.background=\\'#FEE2E2\\';" onmouseout="this.style.color=\\'#78716C\\';this.style.background=\\'transparent\\';"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></a>';
      }
      initiateHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;padding-right:' + (p.status !== 'draft' ? '32px' : '0') + ';">';
      initiateHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + p.name + '</span>';
      initiateHTML += '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;' + badgeStyle + '">' + statusLabel + '</span>';
      initiateHTML += '</div>';
      // View/Participant count (Task 3)
      initiateHTML += '<div style="font-size:12px;color:#A8A29E;margin-top:4px;margin-bottom:8px;">' + viewCount + '人浏览 · ' + participantCount + '人参与</div>';
      initiateHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      initiateHTML += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + p.industry + '</span>';
      initiateHTML += '</div>';

      // Row 3: depends on status
      if(p.status === 'open'){
        var pct = p.targetAmount > 0 ? Math.round(p.raisedAmount / p.targetAmount * 100) : 0;
        initiateHTML += '<div style="margin-bottom:10px;">';
        initiateHTML += '<div style="height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;margin-bottom:4px;"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#D4A853,#B8860B);width:' + pct + '%;"></div></div>';
        initiateHTML += '<div style="font-size:13px;color:#78716C;">已募 \\u00A5' + p.raisedAmount + '/' + p.targetAmount + '\\u4E07 (' + pct + '%)</div>';
        initiateHTML += '</div>';
      } else if(p.status === 'active'){
        var projReports = REV_REPORTS.filter(function(r){ return r.projectId === p.id; });
        var totalRepaidProj = projReports.reduce(function(s,r){ return s + r.totalShareAmount; }, 0);
        var lastReport = projReports.length > 0 ? projReports[projReports.length-1] : null;
        initiateHTML += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px;font-size:13px;color:#78716C;">';
        initiateHTML += '<span>累计回款 <b style="color:#1C1917;">\\u00A5' + totalRepaidProj.toFixed(1) + '\\u4E07</b></span>';
        if(lastReport) initiateHTML += '<span>最近上报 <b style="color:#1C1917;">' + lastReport.period + '</b></span>';
        initiateHTML += '</div>';
      }

      // Row 4: action buttons
      initiateHTML += '<div style="display:flex;gap:8px;">';
      if(p.status === 'open'){
        initiateHTML += '<a href="/projects/' + p.id + '" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#78716C;font-size:13px;font-weight:600;text-decoration:none;">管理项目</a>';
      } else if(p.status === 'active'){
        initiateHTML += '<a href="/initiated/' + p.id + '/report" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#B91C1C;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">上报收入</a>';
        initiateHTML += '<a href="/projects/' + p.id + '" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#78716C;font-size:13px;font-weight:600;text-decoration:none;">查看详情</a>';
      } else if(p.status === 'draft'){
        initiateHTML += '<a href="/create" style="flex:1;text-align:center;padding:8px 0;border-radius:8px;background:#B91C1C;color:#fff;font-size:13px;font-weight:600;text-decoration:none;">继续编辑</a>';
        initiateHTML += '<button onclick="deleteDraft(\\'' + p.id + '\\')" style="flex:1;padding:8px 0;border-radius:8px;background:#F5F5F4;color:#DC2626;font-size:13px;font-weight:600;border:none;cursor:pointer;">删除</button>';
      }
      initiateHTML += '</div>';
      initiateHTML += '</div>';
    });
    initiateHTML += '</div>';
  }
  panelInitiate.innerHTML = initiateHTML;

  // Delete draft
  window.deleteDraft = function(pid){
    var ups = [];
    try { ups = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
    ups = ups.filter(function(p){ return p.id !== pid; });
    localStorage.setItem('zlc_user_projects', JSON.stringify(ups));
    window.location.reload();
  };

  // ── Coach Mark for Repayments Page ──
  setTimeout(function(){
    showCoachMark('#repayment-tabs', '左边看你投出去的钱的回款，右边管理你自己发起的项目', 'bottom', 'repay-tabs');
  }, 800);
})();
`}} />
    </div>,
    { title: '中流通 - 回款中心' }
  )
})

// ══════════════════════════════════════════════════════════
// Investment Detail  (/investments/:contractId)
// ══════════════════════════════════════════════════════════
app.get('/investments/:contractId', (c) => {
  const contractId = c.req.param('contractId')

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="/repayments" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回回款中心
        </a>

        <div id="invest-detail-content">
          <div class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载中...</p>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACT_ID = '${contractId}';
  var CONTRACTS = ${JSON.stringify(mockContracts)};
  var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company })))};

  // Merge localStorage data
  var lsContracts = [];
  try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  lsContracts.forEach(function(c){ if(!CONTRACTS.find(function(x){return x.id===c.id;})) CONTRACTS.push(c); });
  var lsRepRecords = [];
  try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}
  lsRepRecords.forEach(function(r){ if(!REP_RECORDS.find(function(x){return x.id===r.id;})) REP_RECORDS.push(r); });

  var contract = CONTRACTS.find(function(c){ return c.id === CONTRACT_ID; });
  var el = document.getElementById('invest-detail-content');

  if(!contract){
    el.innerHTML = '<div style="text-align:center;padding:40px 0;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">合同未找到</p></div>';
    return;
  }

  var recs = REP_RECORDS.filter(function(r){ return r.contractId === contract.id; });
  recs.sort(function(a,b){ return a.date.localeCompare(b.date); });

  var repaid = recs.length > 0 ? recs[recs.length-1].cumulativeShare : (contract.totalRepaid || 0);
  var progressPct = contract.recoveryCap > 0 ? (repaid / contract.recoveryCap * 100) : 0;
  var monthlyAvg = recs.length > 0 ? (repaid / recs.length) : 0;
  var remaining = monthlyAvg > 0 ? Math.ceil((contract.recoveryCap - repaid) / monthlyAvg) : 0;

  var initiator = MEMBERS.find(function(m){ return m.id === contract.initiatorId; });
  var initName = contract.initiatorName || (initiator ? initiator.name : '');
  var initComp = contract.initiatorCompany || (initiator ? initiator.company : '');

  var statusBadge = contract.status === 'active'
    ? '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>'
    : '<span style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';

  var isCompleted = contract.status === 'completed';
  var ringColor = isCompleted ? '#16A34A' : '#D4A853';
  var ringColorEnd = isCompleted ? '#15803D' : '#B8860B';
  var barGradient = isCompleted ? 'linear-gradient(180deg,#16A34A,#15803D)' : 'linear-gradient(180deg,#D4A853,#B8860B)';

  var html = '';

  // 0. Completed badge (top green banner)
  if(isCompleted){
    html += '<div style="background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;border-radius:12px;padding:12px 20px;text-align:center;font-size:15px;font-weight:600;margin-bottom:12px;">\\u2705 \\u9879\\u76EE\\u5DF2\\u5B8C\\u6210</div>';
  }

  // 0.5 Payback celebration banner (Task 2)
  if(repaid >= contract.amount){
    var roi = (repaid / contract.amount * 100).toFixed(1);
    var confettiColors = ['#B91C1C','#D4A853','#16A34A','#3B82F6','#B91C1C','#D4A853'];
    var confettiHTML = '';
    for(var ci=0;ci<6;ci++){
      confettiHTML += '<span class="confetti-piece" style="background:'+confettiColors[ci]+';animation:confetti-'+(ci+1)+' 1.2s ease-out '+(ci*0.05).toFixed(2)+'s forwards;"></span>';
    }
    html += '<div class="payback-banner" style="position:relative;overflow:visible;">';
    html += confettiHTML;
    html += '<div class="emoji-row">\\uD83C\\uDF89\\uD83C\\uDF8A\\uD83C\\uDF89</div>';
    html += '<div class="banner-title">恭喜，本项目已回本！</div>';
    html += '<div class="banner-sub">累计回款 ¥' + repaid.toFixed(2) + '万，投资回报率 ' + roi + '%</div>';
    html += '</div>';
  }

  // 1. Project info
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;margin-bottom:12px;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
  html += '<span style="font-size:18px;font-weight:600;color:#1C1917;">' + contract.projectName + '</span>';
  html += statusBadge;
  html += '</div>';
  html += '<div style="font-size:14px;color:#78716C;">发起人: ' + initName + ' \\u00B7 ' + initComp + '</div>';
  html += '</div>';

  // 2. Investment info
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">\\u00A5' + contract.amount + '\\u4E07</div><div style="font-size:12px;color:#78716C;margin-top:2px;">我的投资</div></div>';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">' + contract.revenueShareRatio + '%</div><div style="font-size:12px;color:#78716C;margin-top:2px;">分成比例</div></div>';
  html += '<div><div style="font-size:22px;font-weight:800;color:#1C1917;font-family:Montserrat,sans-serif;">\\u00A5' + contract.recoveryCap + '\\u4E07</div><div style="font-size:12px;color:#78716C;margin-top:2px;">回收上限</div></div>';
  html += '</div></div>';

  // 3. Recovery ring progress
  var circumference = 2 * Math.PI * 68; // 427.26
  var dashOffset = circumference * (1 - progressPct / 100);

  html += '<div style="background:#fff;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:32px;margin-bottom:12px;text-align:center;">';
  html += '<svg width="160" height="160" viewBox="0 0 160 160" style="margin:0 auto;display:block;">';
  html += '<defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+ringColor+'"/><stop offset="100%" stop-color="'+ringColorEnd+'"/></linearGradient></defs>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="#F5F5F4" stroke-width="12"/>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="url(#ring-grad)" stroke-width="12" stroke-dasharray="' + circumference.toFixed(2) + '" stroke-dashoffset="' + dashOffset.toFixed(2) + '" stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset 1s ease;"/>';
  html += '<text x="80" y="72" text-anchor="middle" fill="'+ringColor+'" font-size="32" font-weight="800" font-family="Montserrat,sans-serif">' + progressPct.toFixed(1) + '%</text>';
  html += '<text x="80" y="96" text-anchor="middle" fill="#78716C" font-size="12">回收进度</text>';
  html += '</svg>';
  html += '<div style="margin-top:16px;font-size:15px;color:#292524;">已回款 \\u00A5' + repaid.toFixed(2) + '\\u4E07 / \\u00A5' + contract.recoveryCap + '\\u4E07</div>';
  if(remaining > 0) html += '<div style="margin-top:4px;font-size:13px;color:#78716C;">预计还需约 ' + remaining + ' 个月</div>';
  html += '</div>';

  // 4. Bar chart (pure CSS)
  if(recs.length > 0){
    var maxShare = Math.max.apply(null, recs.map(function(r){ return r.shareAmount; }));

    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
    html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:16px;">回款趋势</div>';
    html += '<div style="display:flex;align-items:flex-end;gap:16px;height:200px;padding:20px 0 0;">';
    recs.forEach(function(r){
      var pctH = maxShare > 0 ? (r.shareAmount / maxShare * 100) : 0;
      var dateLabel = r.date.slice(5,7) + '月';
      html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
      html += '<div style="font-size:11px;color:#78716C;margin-bottom:4px;">\\u00A5' + r.shareAmount.toFixed(2) + '\\u4E07</div>';
      html += '<div style="width:40px;border-radius:4px 4px 0 0;background:'+barGradient+';height:' + Math.max(pctH, 5) + '%;transition:height 0.6s ease;"></div>';
      html += '<div style="font-size:12px;color:#78716C;margin-top:6px;">' + dateLabel + '</div>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  // 5. Repayment detail list
  html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
  html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">回款明细</div>';
  // Header
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;padding-bottom:8px;border-bottom:1px solid #F5F5F4;">';
  html += '<div style="font-size:12px;color:#78716C;">日期</div>';
  html += '<div style="font-size:12px;color:#78716C;">项目收入</div>';
  html += '<div style="font-size:12px;color:#78716C;">我的分成</div>';
  html += '<div style="font-size:12px;color:#78716C;">累计回款</div>';
  html += '</div>';
  // Rows (reverse order — latest first)
  var recsReversed = recs.slice().reverse();
  recsReversed.forEach(function(r){
    var dateStr = r.date.slice(5).replace('-','/');
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;padding:12px 0;border-bottom:1px solid #F5F5F4;">';
    html += '<div style="font-size:14px;color:#292524;">' + dateStr + '</div>';
    html += '<div style="font-size:14px;color:#292524;">\\u00A5' + r.projectRevenue + '\\u4E07</div>';
    html += '<div style="font-size:14px;color:#16A34A;font-weight:600;">+\\u00A5' + r.shareAmount.toFixed(2) + '\\u4E07</div>';
    html += '<div style="font-size:14px;color:#292524;">\\u00A5' + r.cumulativeShare.toFixed(2) + '\\u4E07</div>';
    html += '</div>';
  });
  html += '</div>';

  // 6. View contract button
  var contractPage = '/contracts/' + contract.id + '/sign';
  html += '<div style="text-align:center;margin-top:16px;">';
  html += '<a href="' + contractPage + '" style="display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:10px;background:#F5F5F4;color:#78716C;font-size:14px;font-weight:600;text-decoration:none;"><i class="fas fa-file-contract" style="font-size:13px;"></i> 查看合同</a>';
  html += '</div>';

  el.innerHTML = html;
})();
`}} />
    </div>,
    { title: '中流通 - 投资详情' }
  )
})

// ══════════════════════════════════════════════════════════
// Revenue Report  (/initiated/:projectId/report)
// ══════════════════════════════════════════════════════════
app.get('/initiated/:projectId/report', (c) => {
  const projectId = c.req.param('projectId')

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="/repayments" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回回款中心
        </a>

        <div id="report-content">
          <div class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载中...</p>
          </div>
        </div>
      </main>

      {/* Success overlay */}
      <div class="sign-success-overlay" id="report-success-overlay">
        <div class="sign-success-icon">
          <i class="fas fa-check text-white" style="font-size:36px;" />
        </div>
        <div class="sign-success-text">上报成功</div>
        <div class="sign-success-sub">收入已记录，分成已自动分配</div>
      </div>

      <div id="toast" class="toast" />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var PROJECT_ID = '${projectId}';
  var CONTRACTS = ${JSON.stringify(mockContracts)};
  var PROJECTS = ${JSON.stringify(mockProjects)};
  var REV_REPORTS = ${JSON.stringify(mockRevenueReports)};
  var REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company })))};

  // Merge localStorage
  var lsContracts = [];
  try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
  lsContracts.forEach(function(c){ if(!CONTRACTS.find(function(x){return x.id===c.id;})) CONTRACTS.push(c); });
  var lsProjects = [];
  try { lsProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  lsProjects.forEach(function(p){ if(!PROJECTS.find(function(x){return x.id===p.id;})) PROJECTS.push(p); });
  var lsReports = [];
  try { lsReports = JSON.parse(localStorage.getItem('zlc_revenue_reports') || '[]'); } catch(e){}
  lsReports.forEach(function(r){ if(!REV_REPORTS.find(function(x){return x.id===r.id;})) REV_REPORTS.push(r); });
  var lsRepRecords = [];
  try { lsRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}
  lsRepRecords.forEach(function(r){ if(!REP_RECORDS.find(function(x){return x.id===r.id;})) REP_RECORDS.push(r); });

  var proj = PROJECTS.find(function(p){ return p.id === PROJECT_ID; });
  var el = document.getElementById('report-content');

  if(!proj){
    el.innerHTML = '<div style="text-align:center;padding:40px 0;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">项目未找到</p></div>';
    return;
  }

  var projContracts = CONTRACTS.filter(function(c){ return c.projectId === proj.id && c.status === 'active'; });
  var projReports = REV_REPORTS.filter(function(r){ return r.projectId === proj.id; });
  var shareRatio = proj.revenueShareRate || (projContracts.length > 0 ? projContracts[0].revenueShareRatio : 0);

  // Generate month options (from a reasonable start to current month)
  var now = new Date();
  var months = [];
  // Start from 2025-12 or project active date, go to current month
  var startYear = 2025, startMonth = 12;
  for(var y = startYear; y <= now.getFullYear(); y++){
    var mStart = (y === startYear) ? startMonth : 1;
    var mEnd = (y === now.getFullYear()) ? (now.getMonth() + 1) : 12;
    for(var m = mStart; m <= mEnd; m++){
      var key = y + '-' + String(m).padStart(2, '0');
      months.push({ key: key, label: y + '年' + m + '月' });
    }
  }
  months.reverse(); // Latest first

  function render(){
    // Reload merged data
    var allReports = REV_REPORTS.filter(function(r){ return r.projectId === proj.id; });
    allReports.sort(function(a,b){ return b.period.localeCompare(a.period); });

    var html = '';

    // 1. Project info
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;margin-bottom:12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">';
    html += '<span style="font-size:18px;font-weight:600;color:#1C1917;">' + proj.name + '</span>';
    html += '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>';
    html += '</div>';
    html += '<div style="font-size:13px;color:#78716C;">参与人 ' + projContracts.length + ' 位 | 分成比例 ' + shareRatio + '%</div>';
    html += '</div>';

    // 2. Report form
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:24px;margin-bottom:12px;border-top:3px solid #B91C1C;">';
    html += '<div style="font-size:18px;font-weight:600;color:#292524;margin-bottom:16px;">上报本期收入</div>';

    // Period select
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">报告期间</label>';
    html += '<select id="rpt-period" style="width:100%;background:#fff;appearance:none;-webkit-appearance:none;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'10\\' height=\\'6\\'%3E%3Cpath d=\\'M0 0l5 6 5-6z\\' fill=\\'%2378716C\\'/%3E%3C/svg%3E&quot;);background-repeat:no-repeat;background-position:right 14px center;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 36px 14px 16px;font-size:15px;color:#1C1917;outline:none;cursor:pointer;font-family:inherit;">';
    months.forEach(function(m,i){
      var reported = allReports.find(function(r){ return r.period === m.key; });
      html += '<option value="' + m.key + '"' + (i===0?' selected':'') + '>' + m.label + (reported ? ' (已上报)' : '') + '</option>';
    });
    html += '</select></div>';

    // Revenue input
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">本期总收入</label>';
    html += '<div style="position:relative;">';
    html += '<input id="rpt-revenue" type="number" step="0.01" min="0" placeholder="请输入本期项目总收入" style="width:100%;background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 52px 14px 16px;font-size:15px;color:#1C1917;outline:none;font-family:inherit;box-sizing:border-box;" />';
    html += '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;color:#78716C;pointer-events:none;">万元</span>';
    html += '</div></div>';

    // Note
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">备注 <span style="font-size:12px;color:#A8A29E;">（选填）</span></label>';
    html += '<input id="rpt-note" type="text" placeholder="如有说明请填写" style="width:100%;background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 16px;font-size:15px;color:#1C1917;outline:none;font-family:inherit;box-sizing:border-box;" />';
    html += '</div>';

    // Auto-calc area
    html += '<div id="rpt-calc" style="background:#FEF2F2;border-radius:12px;padding:16px;margin-top:16px;">';
    html += '<div style="font-size:15px;color:#B91C1C;font-weight:600;">本期分成总额: <span id="rpt-share-total">—</span></div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">将分配给 ' + projContracts.length + ' 位参与人</div>';
    html += '</div>';

    // Submit button
    html += '<button id="rpt-submit-btn" style="width:100%;height:48px;background:linear-gradient(135deg,#DC2626,#B91C1C);color:#fff;font-weight:700;font-size:16px;border:none;border-radius:12px;cursor:pointer;margin-top:16px;transition:transform 0.15s,box-shadow 0.25s;" onmouseover="this.style.transform=\\'translateY(-1px)\\';this.style.boxShadow=\\'0 6px 24px rgba(185,28,28,0.35)\\';" onmouseout="this.style.transform=\\'none\\';this.style.boxShadow=\\'none\\';">提交收入上报</button>';
    html += '</div>';

    // 3. History
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
    html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">历史上报</div>';
    if(allReports.length === 0){
      html += '<div style="text-align:center;padding:16px;color:#78716C;font-size:14px;">暂无上报记录</div>';
    } else {
      allReports.forEach(function(r){
        var yM = r.period.split('-');
        var label = yM[0] + '年' + parseInt(yM[1]) + '月';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<span style="font-size:14px;color:#292524;">' + label + '</span>';
        html += '<span style="font-size:14px;font-weight:600;color:#292524;">收入 \\u00A5' + r.totalRevenue + '\\u4E07</span>';
        html += '<span style="font-size:14px;color:#D4A853;font-weight:600;">分成 \\u00A5' + r.totalShareAmount.toFixed(1) + '\\u4E07</span>';
        html += '</div>';
      });
    }
    html += '</div>';

    // 4. Distribution details (latest report)
    if(allReports.length > 0){
      var latestReport = allReports[0];
      var totalInvested = projContracts.reduce(function(s,c){ return s + c.amount; }, 0);
      var latestShareTotal = latestReport.totalRevenue * (shareRatio / 100);

      html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
      html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">本期分配明细</div>';
      projContracts.forEach(function(c){
        var ratio = totalInvested > 0 ? c.amount / totalInvested : 0;
        var share = latestShareTotal * ratio;
        var mem = MEMBERS.find(function(m){ return m.id === c.participantId; });
        var mName = c.participantName || (mem ? mem.name : '');
        var mComp = mem ? mem.company : '';

        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<div style="display:flex;align-items:center;gap:10px;">';
        html += '<div style="width:36px;height:36px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">' + mName.charAt(0) + '</div>';
        html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + mName + '</div><div style="font-size:12px;color:#78716C;">' + mComp + '</div></div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:12px;color:#78716C;">投资 \\u00A5' + c.amount + '\\u4E07</div>';
        html += '<div style="font-size:14px;font-weight:600;color:#D4A853;">本期 \\u00A5' + share.toFixed(2) + '\\u4E07</div>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    el.innerHTML = html;

    // Wire up events
    var revenueInput = document.getElementById('rpt-revenue');
    var shareTotalEl = document.getElementById('rpt-share-total');

    if(revenueInput){
      revenueInput.addEventListener('input', function(){
        var rev = parseFloat(revenueInput.value) || 0;
        var share = rev * (shareRatio / 100);
        shareTotalEl.textContent = share > 0 ? '\\u00A5' + share.toFixed(2) + '\\u4E07' : '\\u2014';
      });
    }

    var submitBtn = document.getElementById('rpt-submit-btn');
    if(submitBtn){
      submitBtn.addEventListener('click', function(){
        var period = document.getElementById('rpt-period').value;
        var revenue = parseFloat(document.getElementById('rpt-revenue').value);
        var note = document.getElementById('rpt-note').value.trim();

        if(!revenue || revenue <= 0){
          showToast('请输入本期收入', 'error');
          return;
        }

        // Check if already reported this period
        var existing = allReports.find(function(r){ return r.period === period; });
        if(existing){
          showToast('该期已上报过，请选择其他月份', 'error');
          return;
        }

        // Create RevenueReport
        var reportId = 'rr-' + Date.now().toString(36);
        var shareTotal = revenue * (shareRatio / 100);
        var newReport = {
          id: reportId,
          projectId: proj.id,
          reportedBy: u.id,
          period: period,
          periodType: 'monthly',
          totalRevenue: revenue,
          totalShareAmount: +shareTotal.toFixed(4),
          reportedAt: new Date().toISOString().slice(0, 10),
          note: note
        };

        // Save to localStorage
        var savedReports = [];
        try { savedReports = JSON.parse(localStorage.getItem('zlc_revenue_reports') || '[]'); } catch(e){}
        savedReports.push(newReport);
        localStorage.setItem('zlc_revenue_reports', JSON.stringify(savedReports));
        REV_REPORTS.push(newReport);

        // Auto-distribute to participants
        var totalInvested = projContracts.reduce(function(s,c){ return s + c.amount; }, 0);
        var savedRepRecords = [];
        try { savedRepRecords = JSON.parse(localStorage.getItem('zlc_repayment_records') || '[]'); } catch(e){}

        projContracts.forEach(function(c){
          var ratio = totalInvested > 0 ? c.amount / totalInvested : 0;
          var share = +(shareTotal * ratio).toFixed(4);
          var prevRecs = REP_RECORDS.filter(function(r){ return r.contractId === c.id; });
          var prevCumulative = prevRecs.length > 0 ? prevRecs[prevRecs.length-1].cumulativeShare : (c.totalRepaid || 0);
          var newCumulative = +(prevCumulative + share).toFixed(4);

          // Cap check
          if(newCumulative > c.recoveryCap){
            share = +(c.recoveryCap - prevCumulative).toFixed(4);
            if(share < 0) share = 0;
            newCumulative = +(prevCumulative + share).toFixed(4);
          }

          var recId = 'rep-' + Date.now().toString(36) + '-' + c.id;
          var newRec = {
            id: recId,
            contractId: c.id,
            revenueReportId: reportId,
            participantId: c.participantId,
            projectName: proj.name,
            date: new Date().toISOString().slice(0, 10),
            projectRevenue: revenue,
            shareAmount: share,
            cumulativeShare: newCumulative,
            recoveryProgress: +(newCumulative / c.recoveryCap * 100).toFixed(2)
          };
          savedRepRecords.push(newRec);
          REP_RECORDS.push(newRec);

          // Update contract totalRepaid
          c.totalRepaid = newCumulative;
        });
        localStorage.setItem('zlc_repayment_records', JSON.stringify(savedRepRecords));

        // Update contracts in localStorage
        var allLsContracts = [];
        try { allLsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
        projContracts.forEach(function(c){
          var idx = allLsContracts.findIndex(function(x){ return x.id === c.id; });
          if(idx >= 0) allLsContracts[idx].totalRepaid = c.totalRepaid;
        });
        localStorage.setItem('zlc_contracts', JSON.stringify(allLsContracts));

        // Show success
        var overlay = document.getElementById('report-success-overlay');
        overlay.classList.add('show');
        setTimeout(function(){
          overlay.classList.remove('show');
          render(); // re-render page
        }, 2000);
      });
    }
  }

  render();
})();
`}} />
    </div>,
    { title: '中流通 - 上报收入' }
  )
})

// ══════════════════════════════════════════════════════════
// Admin Backend  (/admin) — Upgraded Full Management Console
// ══════════════════════════════════════════════════════════
app.get('/admin', (c) => {
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
        <button class="admin-tab" data-tab="members">学员</button>
        <button class="admin-tab" data-tab="classes">班级</button>
        <button class="admin-tab" data-tab="teachers">老师</button>
        <button class="admin-tab" data-tab="projects">项目</button>
      </div>

      <main class="max-w-lg mx-auto pb-4">
        {/* Tab Content Panels */}
        <div id="tab-overview" class="admin-tab-panel" style="opacity:1;" />
        <div id="tab-members" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-classes" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-teachers" class="admin-tab-panel" style="display:none;opacity:0;" />
        <div id="tab-projects" class="admin-tab-panel" style="display:none;opacity:0;" />
      </main>

      <TabBar active="admin" />

      {/* Batch Register Modal Overlay */}
      <div id="batch-register-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1100;align-items:center;justify-content:center;" />

      {/* Member Detail Modal Overlay */}
      <div id="member-detail-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1100;" />

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

  // ── Data ──
  var MOCK_MEMBERS = ${JSON.stringify(mockMembers)};
  var MOCK_PROJECTS = ${JSON.stringify(mockProjects)};
  var MOCK_CONTRACTS = ${JSON.stringify(mockContracts)};
  var MOCK_REP_RECORDS = ${JSON.stringify(mockRepaymentRecords)};
  var MOCK_TEACHERS = ${JSON.stringify(mockTeachers)};

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
      var classId = 'class-'+className.replace(/[^\\u4e00-\\u9fa5a-zA-Z0-9]/g,'');

      var lines = textarea.value.split(/\\n|\\r\\n?/);
      var allMembers = getMembers();
      var added = 0;
      var ts = Date.now();
      lines.forEach(function(line,i){
        line = line.trim();
        if(!line) return;
        var parts = line.split(/\\s+/);
        if(parts.length<2) return;
        var phone = parts[parts.length-1];
        if(!/^1[3-9]\\d{9}$/.test(phone)) return;
        var name = parts.slice(0,parts.length-1).join(' ');
        var newId = 'm-new-'+String(ts+i);
        allMembers.push({
          id:newId,phone:phone,name:name,company:'',industry:'',title:'学员',
          bio:'',cohort:className,status:'active',joinDate:new Date().toISOString().slice(0,10),
          role:'member',classId:classId,className:className
        });
        added++;
      });
      saveMembers(allMembers);
      overlay.style.display='none';
      showToast('成功注册 '+added+' 位学员','success');
      rendered['members']=false;
      renderMembers(); rendered['members']=true;
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

// ══════════════════════════════════════════════════════════
// Teacher Workbench  (/teacher)
// ══════════════════════════════════════════════════════════
app.get('/teacher', (c) => {
  const allProjects = mockProjects
  const allMembers = mockMembers

  return c.render(
    <div class="app-container has-tabbar">
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
          {/* Demo guide button for teacher (Task 5) */}
          <span onclick="window.location.href='/guide/teacher'" style="font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.08);border-radius:8px;padding:4px 10px;cursor:pointer;">📖 演示</span>
          <span id="teacher-nav-title" style="font-size:14px;color:#78716C;"></span>
        </div>
      </nav>

      <main class="max-w-lg mx-auto px-4 pt-4 pb-8 page-enter">
        {/* Welcome Card (Task 3 Enhancement 1) */}
        <div id="teacher-welcome-card" style="padding:20px 16px;margin-bottom:12px;" />

        {/* Stats Bar (Task 3 Enhancement 2) */}
        <div id="teacher-stats-bar" style="display:flex;gap:0;background:white;border-radius:14px;margin:0 0 12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);" />

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
          <div id="referral-list">
            <div style="text-align:center;padding:16px;font-size:14px;color:#78716C;">暂无待处理的引荐请求</div>
          </div>
        </div>

        {/* My Classes */}
        <div class="teacher-card" id="classes-section">
          <div class="teacher-card-title"><span>我的班级</span></div>
          <div id="class-list"></div>
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
      <div id="recommend-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:1100;">
        <div id="recommend-panel" style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:20px 20px 0 0;max-height:70vh;overflow-y:auto;padding:24px;transform:translateY(100%);transition:transform 300ms ease-out;">
          <div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:0 auto 20px;"></div>
          <div style="font-size:18px;font-weight:600;color:#1C1917;margin-bottom:16px;">选择要推荐的项目</div>
          <div id="recommend-project-list"></div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u || u.role !== 'teacher') { window.location.href = '/login'; return; }

  var ALL_PROJECTS = ${JSON.stringify(allProjects.map(p => ({
    id:p.id, name:p.name, ownerId:p.ownerId, industry:p.industry,
    status:p.status, recommendedByTeacher:p.recommendedByTeacher||[],
  })))};
  var ALL_MEMBERS = ${JSON.stringify(allMembers.map(m => ({
    id:m.id, name:m.name, company:m.company, industry:m.industry,
    classId:m.classId||'', className:m.className||'',
  })))};
  var ALL_TEACHERS = ${JSON.stringify(mockTeachers.map(t => ({
    id:t.id, name:t.name, classIds:t.classIds,
  })))};

  // Also merge user-created projects from localStorage
  var userProjects = [];
  try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  userProjects.forEach(function(up){
    if(!ALL_PROJECTS.find(function(p){return p.id===up.id;})){
      ALL_PROJECTS.push({id:up.id, name:up.name, ownerId:up.ownerId, industry:up.industry||'', status:up.status, recommendedByTeacher:up.recommendedByTeacher||[]});
    }
  });

  // Find my teacher record
  var myTeacher = ALL_TEACHERS.find(function(t){ return t.id === u.id; });
  if (!myTeacher) { myTeacher = { id: u.id, name: u.name, classIds: u.classIds || [] }; }

  // Header
  document.getElementById('th-name').textContent = u.name + '老师';
  var myStudents = ALL_MEMBERS.filter(function(m){ return myTeacher.classIds.indexOf(m.classId) !== -1; });
  var classCount = myTeacher.classIds.length;
  document.getElementById('th-sub').textContent = '管理 ' + classCount + ' 个班级 · ' + myStudents.length + ' 位学员';
  document.getElementById('teacher-nav-title').textContent = u.name + '老师的工作台';

  // ── Teacher Welcome Card (Task 3 Enhancement 1) ──
  (function(){
    var h = new Date().getHours();
    var greeting = (h >= 6 && h < 12) ? '早上好' : (h >= 12 && h < 18) ? '下午好' : (h >= 18 && h < 24) ? '晚上好' : '夜深了';
    var teacherName = u.name || '老师';
    var totalStudents = myStudents.length;
    var totalClasses = classCount;

    var wcEl = document.getElementById('teacher-welcome-card');
    if(wcEl){
      wcEl.innerHTML = '<div style="font-size:20px;font-weight:700;color:#1C1917;">' + greeting + '，' + teacherName + '</div>'
        + '<div style="margin-top:8px;font-size:13px;color:#78716C;">您负责 ' + totalClasses + ' 个班级，共 ' + totalStudents + ' 位学员</div>'
        + '<div style="margin-top:12px;display:flex;gap:10px;">'
        + '<a href="/guide/teacher" style="text-decoration:none;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:10px;padding:8px 14px;font-size:13px;color:#44403C;cursor:pointer;display:inline-block;">📖 查看演示</a>'
        + '<a href="/projects" style="text-decoration:none;background:#FAFAF9;border:1px solid #E7E5E4;border-radius:10px;padding:8px 14px;font-size:13px;color:#44403C;cursor:pointer;display:inline-block;">📊 项目大厅</a>'
        + '</div>';
    }
  })();

  // ── Teacher Stats Bar (Task 3 Enhancement 2) ──
  (function(){
    // Pending referrals for this teacher
    var referrals = [];
    try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
    var pendingCount = referrals.filter(function(r){ return r.teacherId === myTeacher.id && r.status === 'pending'; }).length;

    // Recommended projects count
    var recommendedCount = ALL_PROJECTS.filter(function(p){ return p.recommendedByTeacher && p.recommendedByTeacher.indexOf(myTeacher.id) !== -1; }).length;

    // Active projects in my classes
    var myClassIds = myTeacher.classIds || [];
    var activeProjectCount = 0;
    // Also check user-created projects
    var allP = ALL_PROJECTS.slice();
    try {
      var up = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]');
      up.forEach(function(proj){
        if(!allP.find(function(p){ return p.id === proj.id; })){
          allP.push(proj);
        }
      });
    } catch(e){}
    allP.forEach(function(p){
      if(p.status === 'open' || p.status === 'active'){
        // Check if project owner is in one of my classes
        var ownerMember = ALL_MEMBERS.find(function(m){ return m.id === p.ownerId; });
        if(ownerMember && myClassIds.indexOf(ownerMember.classId) !== -1){
          activeProjectCount++;
        }
      }
    });

    var statsEl = document.getElementById('teacher-stats-bar');
    if(statsEl){
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
  // Init referrals in localStorage if not exist
  var initialReferrals = [
    {
      id: 'ref-demo-001', projectId: 'p-004', projectName: '华东冷链仓储扩建',
      requesterId: 'm-005', requesterName: '赵丽华', requesterClassName: '第11期',
      initiatorId: 'm-004', initiatorName: '陈伟强', initiatorClassName: '第8期',
      teacherId: 't-002', teacherName: '陈老师',
      message: '我对冷链物流赛道很感兴趣，之前考察过类似项目，想和陈总深入聊一下',
      status: 'pending', requestedAt: '2026-03-18T10:30:00', connectedAt: null
    }
  ];
  if (!localStorage.getItem('zlc_referrals')) {
    localStorage.setItem('zlc_referrals', JSON.stringify(initialReferrals));
  }

  function renderReferrals() {
    var referrals = [];
    try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
    var pending = referrals.filter(function(r){ return r.teacherId === myTeacher.id && r.status === 'pending'; });

    var badge = document.getElementById('ref-badge');
    if (pending.length > 0) {
      badge.style.display = 'inline-flex';
      badge.textContent = pending.length;
    } else {
      badge.style.display = 'none';
    }

    var listEl = document.getElementById('referral-list');
    if (pending.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:16px;font-size:14px;color:#78716C;">暂无待处理的引荐请求</div>';
      return;
    }

    listEl.innerHTML = pending.map(function(r) {
      var initiatorMember = ALL_MEMBERS.find(function(m){ return m.id === r.initiatorId; });
      var initiatorCompany = initiatorMember ? initiatorMember.company : '';
      var reqDate = new Date(r.requestedAt);
      var dateStr = reqDate.getFullYear() + '-' + String(reqDate.getMonth()+1).padStart(2,'0') + '-' + String(reqDate.getDate()).padStart(2,'0') + ' ' + String(reqDate.getHours()).padStart(2,'0') + ':' + String(reqDate.getMinutes()).padStart(2,'0');

      var html = '<div class="ref-request-item">';
      html += '<div class="ref-person-row"><div class="ref-avatar">' + r.requesterName.charAt(0) + '</div>';
      html += '<span style="font-size:14px;color:#1C1917;">' + r.requesterName + '</span>';
      html += '<span style="font-size:12px;color:#A8A29E;">' + r.requesterClassName + '</span></div>';
      html += '<div style="font-size:12px;color:#A8A29E;margin:4px 0;">想认识</div>';
      html += '<div class="ref-person-row"><div class="ref-avatar" style="background:#D4A853;">' + r.initiatorName.charAt(0) + '</div>';
      html += '<span style="font-size:14px;color:#1C1917;">' + r.initiatorName + '</span>';
      if(initiatorCompany) html += '<span style="font-size:12px;color:#78716C;">' + initiatorCompany + '</span>';
      html += '<span style="font-size:12px;color:#A8A29E;">' + (r.initiatorClassName||'') + '</span></div>';
      if(r.message){
        html += '<div class="ref-msg-block">\\uD83D\\uDCAC ' + r.message + '</div>';
      }
      html += '<div style="font-size:11px;color:#A8A29E;margin-top:6px;">' + dateStr + '</div>';
      html += '<div class="ref-btn-row">';
      html += '<button class="ref-btn ref-btn-connected" onclick="handleRef(\\'' + r.id + '\\',\\'connected\\')">已对接</button>';
      html += '<button class="ref-btn ref-btn-decline" onclick="handleRef(\\'' + r.id + '\\',\\'declined\\')">暂缓</button>';
      html += '</div></div>';
      return html;
    }).join('');
  }

  window.handleRef = function(refId, newStatus) {
    var referrals = [];
    try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
    var ref = referrals.find(function(r){ return r.id === refId; });
    if (ref) {
      ref.status = newStatus;
      if (newStatus === 'connected') ref.connectedAt = new Date().toISOString();
      localStorage.setItem('zlc_referrals', JSON.stringify(referrals));
      showToast(newStatus === 'connected' ? '已标记为已对接' : '已暂缓');
      renderReferrals();
    }
  };
  renderReferrals();

  // ── My Classes ──
  var classListEl = document.getElementById('class-list');
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
      classHTML += '<span style="color:#78716C;">' + s.company + '</span>';
      classHTML += '<span style="color:#A8A29E;font-size:12px;">' + (s.industry||'') + '</span>';
      classHTML += '</div>';
    });
    classHTML += '</div>';
  });
  classListEl.innerHTML = classHTML;

  window.toggleClass = function(idx) {
    var el = document.getElementById('class-students-' + idx);
    var arrow = document.getElementById('class-arrow-' + idx);
    if (el.classList.contains('open')) {
      el.classList.remove('open');
      arrow.style.transform = 'rotate(0)';
    } else {
      el.classList.add('open');
      arrow.style.transform = 'rotate(180deg)';
    }
  };

  // ── Recommend Projects ──
  function renderRecommended() {
    // Reload projects to get updated recommendedByTeacher
    var projects = ${JSON.stringify(allProjects.map(p => ({ id:p.id, name:p.name, ownerId:p.ownerId, recommendedByTeacher:p.recommendedByTeacher||[] })))};
    // Also check localStorage for updated recommendations
    var lsRecs = {};
    try { lsRecs = JSON.parse(localStorage.getItem('zlc_teacher_recommendations') || '{}'); } catch(e){}

    var recommended = [];
    projects.forEach(function(p) {
      var recs = lsRecs[p.id] || p.recommendedByTeacher;
      if (recs && recs.indexOf(myTeacher.id) !== -1) {
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
    var lsRecs = {};
    try { lsRecs = JSON.parse(localStorage.getItem('zlc_teacher_recommendations') || '{}'); } catch(e){}
    var recs = lsRecs[pid] || [];
    // Also check mock data
    var proj = ALL_PROJECTS.find(function(p){ return p.id === pid; });
    if (proj && !lsRecs[pid]) recs = (proj.recommendedByTeacher || []).slice();
    recs = recs.filter(function(tid){ return tid !== myTeacher.id; });
    lsRecs[pid] = recs;
    localStorage.setItem('zlc_teacher_recommendations', JSON.stringify(lsRecs));
    showToast('已取消推荐');
    renderRecommended();
  };

  renderRecommended();

  // Recommend new project panel
  var recOverlay = document.getElementById('recommend-overlay');
  var recPanel = document.getElementById('recommend-panel');
  document.getElementById('btn-recommend-new').addEventListener('click', function() {
    // Show panel with open projects
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
    if (e.target === recOverlay) {
      recPanel.style.transform = 'translateY(100%)';
      setTimeout(function(){ recOverlay.style.display = 'none'; }, 250);
    }
  });

  window.doRecommend = function(pid) {
    var lsRecs = {};
    try { lsRecs = JSON.parse(localStorage.getItem('zlc_teacher_recommendations') || '{}'); } catch(e){}
    var proj = ALL_PROJECTS.find(function(p){ return p.id === pid; });
    var recs = lsRecs[pid] || (proj ? (proj.recommendedByTeacher||[]).slice() : []);
    if (recs.indexOf(myTeacher.id) === -1) recs.push(myTeacher.id);
    lsRecs[pid] = recs;
    localStorage.setItem('zlc_teacher_recommendations', JSON.stringify(lsRecs));
    showToast('已推荐');
    // Close panel
    recPanel.style.transform = 'translateY(100%)';
    setTimeout(function(){ recOverlay.style.display = 'none'; }, 250);
    renderRecommended();
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
})();
`}} />
    </div>,
    { title: '中流通 - 老师工作台' }
  )
})

// ══════════════════════════════════════════════════════════
// Share Code Route  (/share/:code)
// ══════════════════════════════════════════════════════════
app.get('/share/:code', (c) => {
  const code = c.req.param('code').toUpperCase()
  const project = findProjectByShareCode(code)
  if (project) {
    return c.redirect('/projects/' + project.id + '?from=share')
  }
  // Project not found — show error page
  return c.render(
    <div class="app-container">
      <GlobalScripts />
      <Navbar />
      <main class="max-w-lg mx-auto px-4 pt-16 pb-8 text-center page-enter">
        <div class="flex justify-center mb-4">
          <LogoSVG size={48} />
        </div>
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center justify-center rounded-full" style="width:64px;height:64px;background:#FEE2E2;">
            <i class="fas fa-circle-xmark" style="font-size:28px;color:#DC2626;" />
          </div>
        </div>
        <h2 class="font-bold text-text-title mb-2" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;">该项目不存在或已关闭</h2>
        <p class="text-text-secondary mb-2" style="font-size:14px;">分享码 <span style="font-weight:700;color:#B91C1C;letter-spacing:2px;font-family:Montserrat,sans-serif;">{code}</span> 未匹配到任何项目</p>
        <p class="text-text-tertiary mb-8" style="font-size:13px;">请检查分享码是否正确，或联系分享人确认</p>
        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-semibold" style="text-decoration:none;font-size:15px;">
          <i class="fas fa-home" style="font-size:13px;" /> 返回首页
        </a>
      </main>
    </div>,
    { title: '中流通 - 项目不存在' }
  )
})

// ══════════════════════════════════════════════════════════
// Notifications Page (/notifications)
// ══════════════════════════════════════════════════════════
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
  var UNREAD_KEY = 'zlc_unread_notifications';

  // Default notifications
  var defaultNotifs = [
    { id:'n-001', type:'participation', title:'新投资参与', content:'李明远 参与了您发起的项目「华南餐饮连锁联营」，投资金额 ¥10万', time:'2小时前', read:false, icon:'💰', link:'/projects/p-001' },
    { id:'n-002', type:'repayment', title:'回款到账', content:'项目「华南餐饮连锁联营」本月回款已分配，您收到 ¥0.18万', time:'1天前', read:false, icon:'📈', link:'/repayments' },
    { id:'n-003', type:'referral', title:'引荐请求', content:'学员 王晓薇（第14期）请求您引荐「智能制造设备融资」项目发起人', time:'2天前', read:true, icon:'🤝', link:'/teacher' },
    { id:'n-004', type:'system', title:'项目状态更新', content:'您参与的项目「社区生鲜供应链」已满额募集，即将进入运营期', time:'3天前', read:true, icon:'📋', link:'/projects/p-003' },
    { id:'n-005', type:'system', title:'平台公告', content:'中流通平台 V1.0 正式上线，欢迎各位学员体验！', time:'5天前', read:true, icon:'📢', link:null },
    { id:'n-006', type:'repayment', title:'回款报告提醒', content:'您发起的项目「教育培训机构扩张」本月尚未提交收入报告，请及时上报', time:'5天前', read:true, icon:'⏰', link:'/initiated/p-004/report' }
  ];

  // Load from localStorage or use defaults
  var notifs = null;
  try { notifs = JSON.parse(localStorage.getItem(NOTIFS_KEY)); } catch(e){}
  if(!notifs) {
    notifs = defaultNotifs;
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    localStorage.setItem(UNREAD_KEY, 'true');
  }

  var listEl = document.getElementById('notification-list');
  var markAllBtn = document.getElementById('mark-all-read');

  function renderList(){
    if(!notifs || notifs.length === 0){
      listEl.innerHTML = '<div style="text-align:center;padding:80px 0;">'
        +'<div style="font-size:64px;color:#D6D3D1;margin-bottom:16px;">🔔</div>'
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
      html += '<div class="notif-item" data-id="'+n.id+'" '+linkAttr+' style="padding:16px;border-bottom:1px solid #F5F5F4;cursor:pointer;display:flex;gap:10px;transition:background 0.15s;" onmouseover="this.style.background=\\'#FAFAF9\\'" onmouseout="this.style.background=\\'transparent\\'">'
        + dotHTML
        + '<div style="flex:1;min-width:0;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<span style="font-size:15px;font-weight:600;'+titleColor+'">'+n.title+'</span>'
        + '<span style="font-size:16px;flex-shrink:0;margin-left:8px;">'+n.icon+'</span>'
        + '</div>'
        + '<div style="font-size:13px;color:#57534E;margin-top:4px;line-height:1.5;">'+n.content+'</div>'
        + '<div style="font-size:12px;color:#A8A29E;margin-top:6px;">'+n.time+'</div>'
        + '</div>'
        + '</div>';
    });
    listEl.innerHTML = html;

    // Bind click handlers
    listEl.querySelectorAll('.notif-item').forEach(function(item){
      item.addEventListener('click', function(){
        var nid = item.getAttribute('data-id');
        var link = item.getAttribute('data-link');
        // Mark as read
        notifs.forEach(function(n){ if(n.id === nid) n.read = true; });
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
        updateUnreadState();
        if(link) window.location.href = link;
        else renderList();
      });
    });
  }

  function updateUnreadState(){
    var hasUnread = notifs.some(function(n){ return !n.read; });
    localStorage.setItem(UNREAD_KEY, hasUnread ? 'true' : 'false');
  }

  // Mark all read
  markAllBtn.addEventListener('click', function(){
    notifs.forEach(function(n){ n.read = true; });
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    localStorage.setItem(UNREAD_KEY, 'false');
    renderList();
    showToast('已全部标为已读');
  });

  renderList();
})();
`}} />
    </div>,
    { title: '中流通 - 消息通知' }
  )
})

// ── Guide Pages (Apple-style immersive demos) ──────────────
app.route('/guide', guide)

export default app
