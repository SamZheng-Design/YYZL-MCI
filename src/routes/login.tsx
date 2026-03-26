// Route: /login
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts,
} from '../components'

export function registerLoginRoute(app: Hono<HonoEnv>) {
app.get('/login', (c) => {
  return c.render(
    <div>
      <GlobalScripts />

      {/* Desktop split layout wrapper — only visible ≥1025px */}
      <div id="login-desktop-brand-panel" class="login-desktop-brand" style="display:none;">
        <div class="login-desktop-brand-inner">
          <svg width="64" height="64" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:24px;">
            <defs>
              <linearGradient id="lb-gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#fff"/></linearGradient>
              <linearGradient id="lb-gb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#DC2626"/></linearGradient>
            </defs>
            <circle cx="44" cy="28" r="22" fill="url(#lb-gt)" opacity="0.9"/>
            <circle cx="36" cy="44" r="22" fill="url(#lb-gb)" opacity="0.7"/>
          </svg>
          <div style="color:white;font-size:40px;font-weight:800;letter-spacing:6px;font-family:'Noto Sans SC',sans-serif;">中流通</div>
          <div style="color:rgba(255,255,255,0.65);font-size:16px;margin-top:12px;line-height:1.6;">基于收入分成模式的<br/>私董会项目投资协作平台</div>
          <div style="display:flex;gap:32px;margin-top:36px;justify-content:center;">
            <div style="text-align:center;">
              <div style="font-size:28px;">🔗</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:6px;">同学互联</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px;">💰</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:6px;">收入分成</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px;">🛡️</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:6px;">合规保障</div>
            </div>
          </div>
          <div style="margin-top:40px;font-size:13px;color:rgba(255,255,255,0.3);font-style:italic;">Connect All Possibilities</div>
        </div>
      </div>

      {/* Floating glow orbs */}
      <div class="login-glow-orb"></div>
      <div class="login-glow-orb"></div>
      <div class="login-glow-orb"></div>

      {/* Particle canvas */}
      <canvas id="login-particles-canvas"></canvas>

      {/* Full-screen gradient background (mobile/tablet) */}
      <div id="login-mobile-bg" style="position:fixed;inset:0;background:linear-gradient(135deg,#7F1D1D 0%,#B91C1C 50%,#991B1B 100%);" />

      <div id="login-form-area" style="position:relative;z-index:10;min-height:100vh;min-height:100dvh;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;-webkit-overflow-scrolling:touch;">
        {/* Glass card */}
        <div id="login-card" style="max-width:460px;width:90%;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:40px 32px;opacity:0;transform:translateY(30px);animation:loginCardIn 600ms ease-out forwards;margin:auto 0;flex-shrink:0;">

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
            <div id="phone-login-toggle" style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;cursor:pointer;user-select:none;">使用手机号+密码登录 ▾</div>
            <div id="phone-login-area" style="max-height:0;overflow:hidden;transition:max-height 300ms ease,opacity 300ms ease;opacity:0;">
              {/* Login form */}
              <form id="login-form" style="padding-top:16px;" onsubmit="return false;" autocomplete="on">
                <input id="phone-input" type="tel" maxlength={11} placeholder="请输入手机号" autocomplete="tel" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                <div style="display:flex;gap:10px;margin-top:12px;">
                  <input id="code-input" type="password" maxlength={20} placeholder="请输入密码" autocomplete="current-password" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                </div>
                <button id="login-btn" type="button" style="width:100%;margin-top:16px;background:linear-gradient(135deg,#D4A853,#B8860B);color:white;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;cursor:pointer;">登录</button>
                <div id="switch-to-register" style="margin-top:12px;text-align:center;font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;">
                  还没有账号？<span style="color:#D4A853;font-weight:500;">申请注册</span>
                </div>
              </form>
              {/* Self-register form (hidden by default) */}
              <form id="register-form" style="padding-top:16px;display:none;" onsubmit="return false;" autocomplete="on">
                <div style="font-size:14px;color:rgba(255,255,255,0.8);text-align:center;margin-bottom:14px;line-height:1.5;">
                  <i class="fas fa-info-circle" style="margin-right:4px;" />注册后需管理员审核通过才能登录
                </div>
                <input id="reg-name" type="text" maxlength={20} placeholder="姓名 *" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-phone" type="tel" maxlength={11} placeholder="手机号 *" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-teacher" type="text" maxlength={20} placeholder="班主任名称 *" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-company" type="text" maxlength={30} placeholder="公司名称（选填）" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-title" type="text" maxlength={20} placeholder="职务（选填）" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-password" type="password" maxlength={20} placeholder="设置密码（至少6位）*" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;margin-bottom:10px;" />
                <input id="reg-password2" type="password" maxlength={20} placeholder="确认密码 *" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                <button id="register-btn" type="button" style="width:100%;margin-top:16px;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:600;cursor:pointer;">提交注册申请</button>
                <div id="switch-to-login" style="margin-top:12px;text-align:center;font-size:13px;color:rgba(255,255,255,0.5);cursor:pointer;">
                  已有账号？<span style="color:#D4A853;font-weight:500;">返回登录</span>
                </div>
              </form>
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
#cp-modal input::placeholder { color:rgba(255,255,255,0.35); }
.login-role-card:hover { background:rgba(255,255,255,0.15)!important; }
.login-role-selected { background:rgba(255,255,255,0.2)!important; border-color:#D4A853!important; }

/* ════════════════════════════════════════════
   V25 — Login Visual Enhancement
   ════════════════════════════════════════════ */

/* ── Floating Particles Canvas ── */
#login-particles-canvas {
  position:fixed; inset:0; z-index:1; pointer-events:none;
}

/* ── Radial Glow Orbs ── */
.login-glow-orb {
  position:fixed; border-radius:50%; pointer-events:none; z-index:2;
  filter: blur(60px); opacity:0.15;
  animation: orbFloat 12s ease-in-out infinite;
}
.login-glow-orb:nth-child(1) {
  width:300px; height:300px; top:-80px; left:-60px;
  background:radial-gradient(circle, #DC2626 0%, transparent 70%);
  animation-delay:0s;
}
.login-glow-orb:nth-child(2) {
  width:250px; height:250px; bottom:-60px; right:-40px;
  background:radial-gradient(circle, #D4A853 0%, transparent 70%);
  animation-delay:-4s; animation-duration:15s;
}
.login-glow-orb:nth-child(3) {
  width:200px; height:200px; top:40%; left:60%;
  background:radial-gradient(circle, #991B1B 0%, transparent 70%);
  animation-delay:-8s; animation-duration:18s;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(20px,-30px) scale(1.1); }
  66% { transform: translate(-15px,20px) scale(0.95); }
}

/* ── Role Card 3D Lift ── */
.login-role-card {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  transform-style: preserve-3d;
  perspective: 600px;
  position: relative;
  overflow: hidden;
}
.login-role-card::before {
  content:''; position:absolute; inset:-2px; border-radius:18px;
  background:linear-gradient(135deg, transparent 40%, rgba(212,168,83,0.3) 50%, transparent 60%);
  background-size:200% 200%;
  opacity:0; transition:opacity 0.3s;
  pointer-events:none; z-index:0;
}
.login-role-selected::before {
  opacity:1;
  animation: cardShimmer 3s ease-in-out infinite;
}
@keyframes cardShimmer {
  0% { background-position: -100% -100%; }
  50% { background-position: 200% 200%; }
  100% { background-position: -100% -100%; }
}
.login-role-card:active {
  transform: scale(0.96) !important;
}
.login-role-selected {
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 24px rgba(212,168,83,0.2), 0 0 0 1px rgba(212,168,83,0.3) !important;
}

/* ── Demo Account Row Slide-in ── */
.demo-account-row {
  opacity:0; transform:translateX(-12px);
  animation: demoRowIn 0.4s ease-out forwards;
}
.demo-account-row:nth-child(1) { animation-delay: 0.05s; }
.demo-account-row:nth-child(2) { animation-delay: 0.12s; }
.demo-account-row:nth-child(3) { animation-delay: 0.19s; }
@keyframes demoRowIn {
  from { opacity:0; transform:translateX(-12px); }
  to { opacity:1; transform:translateX(0); }
}

/* ── Input Focus Glow ── */
#phone-login-area input:focus {
  border-color: rgba(212,168,83,0.6) !important;
  box-shadow: 0 0 0 3px rgba(212,168,83,0.12), 0 0 16px rgba(212,168,83,0.1) !important;
  transition: all 0.25s ease !important;
}

/* ── Login Button Pulse Hint ── */
#login-btn:not(:disabled):not(:active) {
  animation: loginBtnPulse 3s ease-in-out infinite;
}
@keyframes loginBtnPulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(212,168,83,0.3); }
  50% { box-shadow: 0 4px 24px rgba(212,168,83,0.5), 0 0 0 4px rgba(212,168,83,0.08); }
}
#login-btn:active {
  transform: scale(0.98);
  animation: none !important;
}

/* ── Shake animation for phone verification ── */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(4px); }
}
#cp-phone4:focus {
  border-color: #B91C1C !important;
  box-shadow: 0 0 0 3px rgba(185,28,28,0.1) !important;
}

/* ── Demo Login Button Hover Glow ── */
.demo-login-btn:hover {
  box-shadow: 0 0 12px rgba(212,168,83,0.25) !important;
  background: rgba(212,168,83,0.15) !important;
}

/* ── Emoji micro-bounce on role select ── */
.login-role-selected > div:first-child {
  animation: emojiPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes emojiPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.25) rotate(-8deg); }
  70% { transform: scale(0.95) rotate(3deg); }
  100% { transform: scale(1) rotate(0); }
}

/* ── Subtle grid texture on glass card ── */
#login-card::before {
  content:''; position:absolute; inset:0; border-radius:24px;
  background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0);
  background-size: 20px 20px;
  pointer-events:none; z-index:0;
}
#login-card { position:relative; }
#login-card > * { position:relative; z-index:1; }
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
      { id:'m-admin', name:'管理员', info:'平台管理', phone:'18000000000', role:'admin', classId:'class-admin', className:'管理组' }
    ]
  };

  var currentRole = 'member';
  var _lastUsedPassword = 'zhongliu2026'; // Track password for change-password modal

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

    // Call API with demo password to authenticate via D1
    _lastUsedPassword = 'zhongliu2026';
    showToast('正在登录...', 'info');
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: acc.phone, password: 'zhongliu2026' })
    }).then(function(r){ return r.json(); }).then(function(d){
      if(d.ok){
        var member = d.member;
        localStorage.setItem('zlc_user', JSON.stringify(member));
        var currentUserData = { id: member.id, name: member.name, phone: member.phone, role: member.role || 'member', classId: member.classId || '', className: member.className || '' };
        if(member.classIds) currentUserData.classIds = member.classIds;
        localStorage.setItem('zlc_current_user', JSON.stringify(currentUserData));
        localStorage.setItem('zlc_token', 'session-' + Date.now());

        // Demo accounts also need password change check
        if(d.needsPasswordChange){
          showChangePasswordModal(member);
          return;
        }

        showToast('登录成功，欢迎回来！', 'success');
        setTimeout(function(){
          var role = member.role || 'member';
          if(role === 'teacher') window.location.href = '/teacher';
          else if(role === 'admin') window.location.href = '/admin';
          else window.location.href = '/';
        }, 600);
      } else {
        showToast(d.error || '登录失败', 'error');
      }
    }).catch(function(){
      showToast('网络错误，请重试', 'error');
    });
  }

  renderAccounts();

  // ── Phone login fold toggle ──
  var toggleEl = document.getElementById('phone-login-toggle');
  var areaEl = document.getElementById('phone-login-area');
  var phoneExpanded = false;
  toggleEl.addEventListener('click', function(){
    phoneExpanded = !phoneExpanded;
    if(phoneExpanded){
      areaEl.style.maxHeight = '800px';
      areaEl.style.opacity = '1';
      toggleEl.textContent = '使用手机号+密码登录 ▴';
    } else {
      areaEl.style.maxHeight = '0';
      areaEl.style.opacity = '0';
      toggleEl.textContent = '使用手机号+密码登录 ▾';
    }
  });

  // ── Phone login logic (kept from original) ──
  var phoneInput=document.getElementById('phone-input'),codeInput=document.getElementById('code-input'),
      sendCodeBtn=document.getElementById('send-code-btn'),loginBtn=document.getElementById('login-btn');
  // ── Change Password Modal (方案B：输入完整手机号验证 + 强制改密) ──
  function showChangePasswordModal(member){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';
    overlay.innerHTML = '<div id="cp-modal" style="background:linear-gradient(160deg,rgba(127,29,29,0.97),rgba(185,28,28,0.97),rgba(153,27,27,0.97));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:32px 24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.5);">'    
      // ── Step 1: 输入完整手机号验证 (dark theme) ──
      +'<div id="cp-step1">'
      +'<div style="text-align:center;margin-bottom:24px;">'
      +'<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:24px;">🔐</span></div>'
      +'<h3 style="font-size:18px;font-weight:700;color:#fff;">首次登录 · 身份验证</h3>'
      +'<p style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:8px;line-height:1.6;">欢迎 <b style="color:#fff;">' + member.name + '</b>！<br/>请输入您的完整手机号以确认身份</p></div>'
      +'<div style="text-align:center;margin-bottom:20px;">'
      +'<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);padding:10px 20px;border-radius:12px;">'
      +'<i class="fas fa-user-check" style="color:rgba(255,255,255,0.5);"></i>'
      +'<span style="font-size:14px;color:rgba(255,255,255,0.7);">管理员已为您注册账号，请验证手机号</span></div></div>'
      +'<div style="margin-bottom:20px;">'
      +'<label style="font-size:13px;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">请输入您的完整手机号</label>'
      +'<input id="cp-phone4" type="tel" maxlength="13" placeholder="请输入11位手机号" autocomplete="off" style="width:100%;box-sizing:border-box;padding:14px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:12px;font-size:18px;letter-spacing:2px;text-align:center;outline:none;font-weight:600;color:#fff;" /></div>'
      // 演示账号提示（仅 demo 账号显示）
      +(function(){
        var demoIds = ['m-001','m-002','m-003','t-001','t-002','m-admin'];
        if(demoIds.indexOf(member.id) !== -1){
          return '<div style="margin-bottom:16px;background:rgba(212,168,83,0.15);border:1px solid rgba(212,168,83,0.3);border-radius:10px;padding:10px 14px;display:flex;align-items:flex-start;gap:8px;">'
            +'<span style="font-size:14px;flex-shrink:0;">🎯</span>'
            +'<div style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.6;">'
            +'<span style="font-weight:600;">演示账号提示</span><br/>'
            +'该账号的验证手机号为：<b style="color:#D4A853;letter-spacing:1px;font-size:13px;">' + member.phone + '</b>'
            +'</div></div>';
        }
        return '';
      })()
      +'<button id="cp-verify" style="width:100%;padding:14px;background:linear-gradient(135deg,#D4A853,#B8860B);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">验证身份</button>'
      +'<div id="cp-verify-error" style="text-align:center;font-size:13px;color:#FCA5A5;margin-top:12px;display:none;"></div>'
      +'</div>'
      // ── Step 2: 设置新密码 (dark theme) ──
      +'<div id="cp-step2" style="display:none;">'
      +'<div style="text-align:center;margin-bottom:24px;">'
      +'<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:24px;">✅</span></div>'
      +'<h3 style="font-size:18px;font-weight:700;color:#fff;">身份验证通过</h3>'
      +'<p style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:8px;">请设置您的专属密码（至少6位）</p></div>'
      +'<div style="margin-bottom:16px;"><label style="font-size:13px;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">设置新密码</label>'
      +'<div style="position:relative;">'
      +'<input id="cp-new" type="password" placeholder="至少6位，建议字母+数字" style="width:100%;box-sizing:border-box;padding:12px 44px 12px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;font-size:14px;outline:none;color:#fff;" />'
      +'<button id="cp-toggle-pw1" type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);font-size:14px;padding:4px;"><i class="fas fa-eye"></i></button></div></div>'
      +'<div style="margin-bottom:8px;"><label style="font-size:13px;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">确认新密码</label>'
      +'<div style="position:relative;">'
      +'<input id="cp-confirm" type="password" placeholder="再次输入新密码" style="width:100%;box-sizing:border-box;padding:12px 44px 12px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;font-size:14px;outline:none;color:#fff;" />'
      +'<button id="cp-toggle-pw2" type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.5);font-size:14px;padding:4px;"><i class="fas fa-eye"></i></button></div></div>'
      // 密码强度提示
      +'<div id="cp-strength" style="margin-bottom:20px;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.08);font-size:12px;color:rgba(255,255,255,0.6);">密码强度：<span id="cp-strength-text">—</span></div>'
      +'<button id="cp-submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#D4A853,#B8860B);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">确认修改并进入平台</button>'
      +'</div>'
      // ── Footer ──
      +'<button id="cp-skip" style="width:100%;padding:10px;background:transparent;color:rgba(255,255,255,0.45);border:none;font-size:13px;cursor:pointer;margin-top:8px;">暂时跳过</button>'
      +'</div>';
    document.body.appendChild(overlay);

    var verifyAttempts = 0;

    // Step 1: 验证完整手机号
    document.getElementById('cp-phone4').addEventListener('input', function(){
      // 实时去除非数字字符，限制11位
      var v = this.value.replace(/\\D/g, '');
      if(v.length > 11) v = v.slice(0, 11);
      this.value = v;
    });
    document.getElementById('cp-verify').addEventListener('click', function(){
      var phoneInput = document.getElementById('cp-phone4').value.replace(/\\D/g, '').trim();
      if(!/^1\\d{10}$/.test(phoneInput)){ showToast('请输入正确的11位手机号（当前' + phoneInput.length + '位）', 'error'); return; }
      verifyAttempts++;
      if(verifyAttempts > 5){
        showToast('验证次数过多，请联系管理员', 'error');
        document.getElementById('cp-verify').disabled = true;
        return;
      }
      // 前端校验完整手机号（快速反馈）
      var realPhone = member.phone || '';
      if(phoneInput !== realPhone){
        var errEl = document.getElementById('cp-verify-error');
        errEl.style.display = 'block';
        errEl.textContent = '手机号不匹配，请确认您的注册手机号（' + (5-verifyAttempts) + '次机会）';
        document.getElementById('cp-phone4').value = '';
        document.getElementById('cp-phone4').focus();
        // 输入框抖动动画
        var input = document.getElementById('cp-phone4');
        input.style.borderColor = '#DC2626';
        input.style.animation = 'shake 0.4s ease';
        setTimeout(function(){ input.style.animation=''; input.style.borderColor='#E7E5E4'; }, 500);
        return;
      }
      // 验证通过，切换到 Step 2
      document.getElementById('cp-step1').style.display = 'none';
      document.getElementById('cp-step2').style.display = 'block';
      setTimeout(function(){ document.getElementById('cp-new').focus(); }, 100);
    });

    // 密码强度检测
    var newPwInput = document.getElementById('cp-new');
    if(newPwInput){
      newPwInput.addEventListener('input', function(){
        var v = this.value;
        var strengthEl = document.getElementById('cp-strength-text');
        if(!v){ strengthEl.textContent = '—'; strengthEl.style.color='#78716C'; return; }
        var score = 0;
        if(v.length >= 6) score++;
        if(v.length >= 8) score++;
        if(/[A-Z]/.test(v)) score++;
        if(/[a-z]/.test(v)) score++;
        if(/[0-9]/.test(v)) score++;
        if(/[^A-Za-z0-9]/.test(v)) score++;
        if(score <= 2){ strengthEl.textContent = '弱 ⚠️'; strengthEl.style.color='#DC2626'; }
        else if(score <= 4){ strengthEl.textContent = '中等 👍'; strengthEl.style.color='#D97706'; }
        else { strengthEl.textContent = '强 💪'; strengthEl.style.color='#16A34A'; }
      });
    }

    // 密码显示切换
    ['cp-toggle-pw1','cp-toggle-pw2'].forEach(function(btnId, idx){
      var btn = document.getElementById(btnId);
      if(!btn) return;
      btn.addEventListener('click', function(){
        var inputId = idx === 0 ? 'cp-new' : 'cp-confirm';
        var input = document.getElementById(inputId);
        if(input.type === 'password'){ input.type='text'; btn.innerHTML='<i class="fas fa-eye-slash"></i>'; }
        else { input.type='password'; btn.innerHTML='<i class="fas fa-eye"></i>'; }
      });
    });

    // Step 2: 提交新密码
    document.getElementById('cp-submit').addEventListener('click', function(){
      var newPw = document.getElementById('cp-new').value;
      var confirmPw = document.getElementById('cp-confirm').value;
      if(!newPw || newPw.length < 6){ showToast('密码至少6位', 'error'); return; }
      if(newPw !== confirmPw){ showToast('两次密码不一致', 'error'); return; }
      if(newPw === 'zhongliu2026' || newPw === _lastUsedPassword){ showToast('新密码不能与默认密码相同', 'error'); return; }
      this.disabled = true; this.textContent = '修改中...';
      var phoneLast4 = member.phone ? member.phone.slice(-4) : '';
      fetch('/api/change-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId: member.id, oldPassword: _lastUsedPassword, newPassword: newPw, phoneLast4: phoneLast4 })
      }).then(function(r){return r.json();}).then(function(res){
        if(res.ok){
          showToast('密码已修改，欢迎使用中流通！', 'success');
          overlay.remove();
          setTimeout(function(){window.location.href=member.role==='teacher'?'/teacher':(member.role==='admin'?'/admin':'/');},800);
        } else {
          showToast(res.error || '修改失败', 'error');
          document.getElementById('cp-submit').disabled = false;
          document.getElementById('cp-submit').textContent = '确认修改并进入平台';
        }
      }).catch(function(){ showToast('网络错误', 'error'); document.getElementById('cp-submit').disabled=false; document.getElementById('cp-submit').textContent='确认修改并进入平台'; });
    });

    document.getElementById('cp-skip').addEventListener('click', function(){
      overlay.remove();
      showToast('登录成功，欢迎回来！','success');
      setTimeout(function(){window.location.href=member.role==='teacher'?'/teacher':(member.role==='admin'?'/admin':'/');},800);
    });

    // 按 Enter 键流程
    setTimeout(function(){ var el=document.getElementById('cp-phone4'); if(el) el.focus(); }, 100);
    document.getElementById('cp-phone4').addEventListener('keydown', function(e){ if(e.key==='Enter') document.getElementById('cp-verify').click(); });
    document.getElementById('cp-new').addEventListener('keydown', function(e){ if(e.key==='Enter') document.getElementById('cp-confirm').focus(); });
    document.getElementById('cp-confirm').addEventListener('keydown', function(e){ if(e.key==='Enter') document.getElementById('cp-submit').click(); });
  }

  sendCodeBtn && sendCodeBtn.addEventListener('click',function(){
    var phone=phoneInput.value.trim();
    if(!/^1[3-9]\\d{9}$/.test(phone)){showToast('请输入正确的11位手机号','error');return;}
    // Password mode — no need for countdown
    showToast('请使用您的密码登录','info');
  });
  var isLoading=false;
  loginBtn.addEventListener('click',function(){
    if(isLoading)return;var phone=phoneInput.value.trim(),code=codeInput.value.trim();
    if(!/^1[3-9]\\d{9}$/.test(phone)){showToast('请输入正确的11位手机号','error');return;}
    if(!code||code.length<4){showToast('请输入密码','error');return;}
    _lastUsedPassword = code;
    isLoading=true;loginBtn.innerHTML='<span class="spinner"></span>';loginBtn.disabled=true;
    fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:phone,password:code})})
    .then(function(r){return r.json();}).then(function(d){
      if(d.ok){
        localStorage.setItem('zlc_user',JSON.stringify(d.member));
        localStorage.setItem('zlc_current_user',JSON.stringify({id:d.member.id,name:d.member.name,phone:d.member.phone,role:d.member.role||'member',classId:d.member.classId||'',className:d.member.className||''}));
        localStorage.setItem('zlc_token','session-'+Date.now());

        // Check if user needs to change password
        if(d.needsPasswordChange){
          showChangePasswordModal(d.member);
          loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;
          return;
        }

        showToast('登录成功，欢迎回来！','success');
        setTimeout(function(){window.location.href=d.member.role==='teacher'?'/teacher':(d.member.role==='admin'?'/admin':'/');},800);
      }
      else{
        if(d.isPending){
          showToast('账号审核中，请等待管理员通过','error');
          // Show a persistent banner
          var banner = document.createElement('div');
          banner.style.cssText = 'margin-top:14px;padding:14px 16px;background:rgba(234,179,8,0.15);border:1px solid rgba(234,179,8,0.3);border-radius:12px;color:rgba(255,255,255,0.9);font-size:13px;line-height:1.6;text-align:center;';
          banner.innerHTML = '<i class="fas fa-clock" style="color:#EAB308;margin-right:6px;"></i>您的注册申请正在审核中<br><span style="font-size:12px;color:rgba(255,255,255,0.5);">管理员审核通过后即可登录使用</span>';
          var existingBanner = document.getElementById('pending-banner');
          if(existingBanner) existingBanner.remove();
          banner.id = 'pending-banner';
          loginBtn.parentNode.appendChild(banner);
        } else {
          showToast(d.error||'登录失败','error');
        }
        loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;
      }
    }).catch(function(){showToast('网络错误，请重试','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;});
  });
  codeInput.addEventListener('keydown',function(e){if(e.key==='Enter')loginBtn.click();});
  phoneInput.addEventListener('keydown',function(e){if(e.key==='Enter')codeInput.focus();});

  // ── Register / Login mode switching ──
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var switchToRegister = document.getElementById('switch-to-register');
  var switchToLogin = document.getElementById('switch-to-login');

  if(switchToRegister){
    switchToRegister.addEventListener('click', function(){
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
  }
  if(switchToLogin){
    switchToLogin.addEventListener('click', function(){
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // ── Self Register submit ──
  var regBtn = document.getElementById('register-btn');
  if(regBtn){
    regBtn.addEventListener('click', function(){
      var regName = document.getElementById('reg-name').value.trim();
      var regPhone = document.getElementById('reg-phone').value.trim();
      var regTeacher = document.getElementById('reg-teacher').value.trim();
      var regCompany = document.getElementById('reg-company').value.trim();
      var regTitle = document.getElementById('reg-title').value.trim();
      var regPw = document.getElementById('reg-password').value;
      var regPw2 = document.getElementById('reg-password2').value;

      if(!regName){ showToast('请输入姓名', 'error'); return; }
      if(!/^1[3-9]\\d{9}$/.test(regPhone)){ showToast('请输入正确的11位手机号', 'error'); return; }
      if(!regTeacher){ showToast('请输入班主任名称', 'error'); return; }
      if(!regPw || regPw.length < 6){ showToast('密码至少6位', 'error'); return; }
      if(regPw !== regPw2){ showToast('两次密码不一致', 'error'); return; }

      regBtn.disabled = true; regBtn.innerHTML = '<span class="spinner"></span>';

      fetch('/api/self-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, phone: regPhone, password: regPw, teacherName: regTeacher, company: regCompany, title: regTitle })
      }).then(function(r){ return r.json(); }).then(function(d){
        regBtn.disabled = false; regBtn.textContent = '提交注册申请';
        if(d.ok){
          showToast(d.message || '注册申请已提交', 'success');
          // Switch back to login
          setTimeout(function(){
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
          }, 1500);
        } else {
          showToast(d.error || '注册失败', 'error');
        }
      }).catch(function(){
        regBtn.disabled = false; regBtn.textContent = '提交注册申请';
        showToast('网络错误，请重试', 'error');
      });
    });
  }

  // ── Login Particles Animation ──
  (function(){
    var canvas = document.getElementById('login-particles-canvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;
    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    // Create particles
    for(var i=0; i<40; i++){
      particles.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
        r: Math.random()*2 + 0.5,
        o: Math.random()*0.4 + 0.1,
        color: Math.random() > 0.7 ? '212,168,83' : '255,255,255'
      });
    }
    
    function draw(){
      ctx.clearRect(0,0,W,H);
      particles.forEach(function(p){
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = W;
        if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H;
        if(p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.o + ')';
        ctx.fill();
      });
      // Draw connections
      for(var a=0; a<particles.length; a++){
        for(var b=a+1; b<particles.length; b++){
          var dx=particles[a].x-particles[b].x, dy=particles[a].y-particles[b].y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<120){
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle='rgba(255,255,255,' + (0.06*(1-dist/120)) + ')';
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ── Desktop split layout ──
  if(window.innerWidth >= 1025){
    var wrapper = document.querySelector('#login-form-area').parentElement;
    var brandPanel = document.getElementById('login-desktop-brand-panel');
    var formArea = document.getElementById('login-form-area');
    var mobileBg = document.getElementById('login-mobile-bg');
    if(brandPanel && formArea){
      // Create flex container — height:100vh + overflow-y:auto so the whole right panel scrolls
      wrapper.style.display = 'flex';
      wrapper.style.height = '100vh';
      wrapper.style.overflow = 'hidden';
      // Show brand panel
      brandPanel.style.display = 'flex';
      brandPanel.style.flexShrink = '0';
      // Make form area take right half — scrollable independently
      formArea.style.width = '50%';
      formArea.style.height = '100vh';
      formArea.style.position = 'relative';
      formArea.style.background = 'linear-gradient(160deg, #7F1D1D 0%, #B91C1C 50%, #991B1B 100%)';
      formArea.style.overflowY = 'auto';
      formArea.style.minHeight = 'unset';  // Remove min-height:100vh so it doesn't force expand
      // Hide the fixed background
      if(mobileBg) mobileBg.style.display = 'none';
    }
  }
})();
`}} />
    </div>,
    { title: '中流通 - 登录' }
  )
})
}
