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

      {/* Full-screen gradient background (mobile/tablet) */}
      <div id="login-mobile-bg" style="position:fixed;inset:0;background:linear-gradient(135deg,#7F1D1D 0%,#B91C1C 50%,#991B1B 100%);" />

      <div id="login-form-area" style="position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;">
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
            <div id="phone-login-toggle" style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;cursor:pointer;user-select:none;">使用手机号+密码登录 ▾</div>
            <div id="phone-login-area" style="max-height:0;overflow:hidden;transition:max-height 300ms ease;opacity:0;">
              <div style="padding-top:16px;">
                <input id="phone-input" type="tel" maxlength={11} placeholder="请输入手机号" autocomplete="tel" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
                <div style="display:flex;gap:10px;margin-top:12px;">
                  <input id="code-input" type="password" maxlength={20} placeholder="请输入密码" autocomplete="current-password" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;color:white;padding:14px 16px;font-size:15px;outline:none;box-sizing:border-box;" />
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
      { id:'m-admin', name:'管理员', info:'平台管理', phone:'18000000000', role:'admin', classId:'class-admin', className:'管理组' }
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

    // Call API with demo password to authenticate via D1
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
      areaEl.style.maxHeight = '300px';
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
  // ── Change Password Modal ──
  function showChangePasswordModal(member){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = '<div style="background:#fff;border-radius:20px;padding:32px 24px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">'
      +'<div style="text-align:center;margin-bottom:24px;">'
      +'<div style="width:56px;height:56px;border-radius:50%;background:#FEF2F2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><span style="font-size:24px;">🔐</span></div>'
      +'<h3 style="font-size:18px;font-weight:700;color:#1C1917;">首次登录请修改密码</h3>'
      +'<p style="font-size:13px;color:#78716C;margin-top:8px;">为了账户安全，请设置您的新密码</p></div>'
      +'<div style="margin-bottom:16px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:6px;">新密码</label>'
      +'<input id="cp-new" type="password" placeholder="至少6位" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<div style="margin-bottom:24px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:6px;">确认新密码</label>'
      +'<input id="cp-confirm" type="password" placeholder="再次输入新密码" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>'
      +'<button id="cp-submit" style="width:100%;padding:14px;background:#B91C1C;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">确认修改</button>'
      +'<button id="cp-skip" style="width:100%;padding:10px;background:transparent;color:#A8A29E;border:none;font-size:13px;cursor:pointer;margin-top:8px;">跳过，以后再改</button>'
      +'</div>';
    document.body.appendChild(overlay);

    document.getElementById('cp-submit').addEventListener('click', function(){
      var newPw = document.getElementById('cp-new').value;
      var confirmPw = document.getElementById('cp-confirm').value;
      if(!newPw || newPw.length < 6){ showToast('密码至少6位', 'error'); return; }
      if(newPw !== confirmPw){ showToast('两次密码不一致', 'error'); return; }
      this.disabled = true; this.textContent = '修改中...';
      fetch('/api/change-password', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId: member.id, oldPassword: codeInput.value.trim(), newPassword: newPw })
      }).then(function(r){return r.json();}).then(function(res){
        if(res.ok){
          showToast('密码已修改，欢迎使用！', 'success');
          overlay.remove();
          setTimeout(function(){window.location.href=member.role==='teacher'?'/teacher':(member.role==='admin'?'/admin':'/');},800);
        } else {
          showToast(res.error || '修改失败', 'error');
          document.getElementById('cp-submit').disabled = false;
          document.getElementById('cp-submit').textContent = '确认修改';
        }
      }).catch(function(){ showToast('网络错误', 'error'); document.getElementById('cp-submit').disabled=false; document.getElementById('cp-submit').textContent='确认修改'; });
    });

    document.getElementById('cp-skip').addEventListener('click', function(){
      overlay.remove();
      showToast('登录成功，欢迎回来！','success');
      setTimeout(function(){window.location.href=member.role==='teacher'?'/teacher':(member.role==='admin'?'/admin':'/');},800);
    });
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
      else{showToast(d.error||'登录失败','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;}
    }).catch(function(){showToast('网络错误，请重试','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;});
  });
  codeInput.addEventListener('keydown',function(e){if(e.key==='Enter')loginBtn.click();});
  phoneInput.addEventListener('keydown',function(e){if(e.key==='Enter')codeInput.focus();});

  // ── Desktop split layout ──
  if(window.innerWidth >= 1025){
    var wrapper = document.querySelector('#login-form-area').parentElement;
    var brandPanel = document.getElementById('login-desktop-brand-panel');
    var formArea = document.getElementById('login-form-area');
    var mobileBg = document.getElementById('login-mobile-bg');
    if(brandPanel && formArea){
      // Create flex container
      wrapper.style.display = 'flex';
      wrapper.style.minHeight = '100vh';
      // Show brand panel
      brandPanel.style.display = 'flex';
      // Make form area take right half
      formArea.style.width = '50%';
      formArea.style.position = 'relative';
      formArea.style.background = 'linear-gradient(160deg, #7F1D1D 0%, #B91C1C 50%, #991B1B 100%)';
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
