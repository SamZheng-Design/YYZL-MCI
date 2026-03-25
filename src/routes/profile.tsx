// Route: /profile
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, TabBar, AuthCheckScript,
} from '../components'

export function registerProfileRoute(app: Hono<HonoEnv>) {
app.get('/profile', async (c) => {
  const db = c.env.DB
  const { loadTeachers } = await import('../db-bridge')
  const allTeachers = await loadTeachers(db)
  return c.render(
    <div class="app-container has-tabbar">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="px-4 pt-5 pb-4 max-w-lg mx-auto page-enter dk-profile-main">
        {/* Profile Card */}
        <div class="bg-white rounded-2xl shadow-card p-6 mb-5 text-center dk-profile-card">
          {/* Avatar placeholder */}
          <div id="profile-avatar" class="mx-auto flex items-center justify-center rounded-full bg-brand text-white font-bold mb-3" style="width:80px;height:80px;font-size:32px;font-family:'Noto Sans SC',sans-serif;">
            —
          </div>
          <h2 id="profile-name" class="font-bold text-text-title" style="font-size:22px;font-family:'Noto Sans SC',sans-serif;">—</h2>
          <p id="profile-company" class="text-text-secondary mt-1" style="font-size:14px;">—</p>
          <p id="profile-cohort" class="text-text-tertiary mt-0.5" style="font-size:13px;">—</p>
          <button id="edit-profile-btn" class="mt-4 px-6 py-2 rounded-lg border border-surface-divider text-text-secondary text-sm font-medium bg-white" style="cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='#FAFAF9'" onmouseout="this.style.background='#fff'">
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
          <div class="menu-row" id="menu-contracts" style="cursor:pointer;">
            <i class="fas fa-file-contract text-brand" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">我的合同</span>
            <span style="font-size:10px;color:#B91C1C;background:#FEE2E2;padding:1px 6px;border-radius:4px;font-weight:600;margin-right:4px;">即将上线</span>
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
          <div class="menu-row" id="menu-contact-admin" style="cursor:pointer;">
            <i class="fas fa-phone text-brand-dark" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">联系管理员</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row" id="menu-change-pw" style="cursor:pointer;">
            <i class="fas fa-key" style="font-size:16px;width:20px;text-align:center;color:#B91C1C;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">修改密码</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row" id="menu-terms" style="cursor:pointer;">
            <i class="fas fa-file-lines text-text-secondary" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">服务条款</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row" id="menu-privacy" style="cursor:pointer;">
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
window.__ZLC_TEACHERS__ = ${JSON.stringify(allTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
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
        fetch('/api/logout',{method:'POST'}).catch(function(){});
        localStorage.removeItem('zlc_user');
        localStorage.removeItem('zlc_current_user');
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

  // Change password
  var cpBtn = document.getElementById('menu-change-pw');
  if(cpBtn){
    cpBtn.addEventListener('click', function(){
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
      overlay.innerHTML = '<div style="background:#fff;border-radius:20px;padding:32px 24px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
        '<div style="text-align:center;margin-bottom:20px;"><div style="width:48px;height:48px;border-radius:50%;background:#FEF2F2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-key" style="font-size:20px;color:#B91C1C;"></i></div>' +
        '<h3 style="font-size:17px;font-weight:700;color:#1C1917;">修改密码</h3></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:5px;">当前密码</label>' +
        '<input id="cp-old" type="password" placeholder="请输入当前密码" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:5px;">新密码</label>' +
        '<input id="cp-new" type="password" placeholder="至少6位" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>' +
        '<div style="margin-bottom:20px;"><label style="font-size:13px;color:#44403C;display:block;margin-bottom:5px;">确认新密码</label>' +
        '<input id="cp-confirm" type="password" placeholder="再次输入新密码" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid #E7E5E4;border-radius:10px;font-size:14px;outline:none;" /></div>' +
        '<button id="cp-do" style="width:100%;padding:13px;background:#B91C1C;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">确认修改</button>' +
        '<button id="cp-cancel" style="width:100%;padding:10px;background:transparent;color:#A8A29E;border:none;font-size:13px;cursor:pointer;margin-top:6px;">取消</button></div>';
      document.body.appendChild(overlay);
      document.getElementById('cp-cancel').addEventListener('click', function(){ overlay.remove(); });
      overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.remove(); });
      document.getElementById('cp-do').addEventListener('click', function(){
        var oldPw = document.getElementById('cp-old').value;
        var newPw = document.getElementById('cp-new').value;
        var confirmPw = document.getElementById('cp-confirm').value;
        if(!oldPw){ showToast('请输入当前密码','error'); return; }
        if(!newPw || newPw.length < 6){ showToast('新密码至少6位','error'); return; }
        if(newPw !== confirmPw){ showToast('两次密码不一致','error'); return; }
        this.disabled = true; this.textContent = '修改中...';
        fetch('/api/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:u.id,oldPassword:oldPw,newPassword:newPw})})
          .then(function(r){return r.json();}).then(function(res){
            if(res.ok){ showToast('密码修改成功','success'); overlay.remove(); }
            else { showToast(res.error||'修改失败','error'); document.getElementById('cp-do').disabled=false; document.getElementById('cp-do').textContent='确认修改'; }
          }).catch(function(){ showToast('网络错误','error'); document.getElementById('cp-do').disabled=false; document.getElementById('cp-do').textContent='确认修改'; });
      });
    });
  }

  // Placeholder menu items — show Toast
  var placeholderMenus = [
    { id:'menu-contracts', msg:'合同管理功能即将上线，敬请期待' },
    { id:'menu-contact-admin', msg:'如需帮助请联系管理员：18000000000' },
    { id:'menu-terms', msg:'服务条款正在整理中，敬请期待' },
    { id:'menu-privacy', msg:'隐私政策正在整理中，敬请期待' }
  ];
  placeholderMenus.forEach(function(item){
    var el = document.getElementById(item.id);
    if(el) el.addEventListener('click', function(){ showToast(item.msg, 'info'); });
  });

  // Edit profile button
  var editProfileBtn = document.getElementById('edit-profile-btn');
  if(editProfileBtn){
    editProfileBtn.addEventListener('click', function(){
      showToast('资料编辑功能即将上线', 'info');
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
}
