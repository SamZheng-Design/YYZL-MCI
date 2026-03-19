// Route: /login
import { Hono } from 'hono'
import {
  GlobalScripts,
} from '../components'

export function registerLoginRoute(app: Hono) {
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
}
