// ============================================================
// 中流通 ZhongLiu Connect — Main Entry
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import {
  mockMembers, mockProjects, mockRepayments,
  getUserStats, DEMO_VERIFY_CODE,
} from './data'
import type { Member, Project } from './data'

const app = new Hono()

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
    <button id="nav-bell" class="flex items-center justify-center" style="width:36px;height:36px;background:none;border:none;cursor:pointer;position:relative;">
      <i class="fas fa-bell" style="font-size:18px;color:#78716C;" />
      <span style="position:absolute;top:4px;right:4px;width:8px;height:8px;background:#DC2626;border-radius:50%;border:2px solid #fff;" />
    </button>
  </nav>
)

// ── Tab Bar ───────────────────────────────────────────────
const TabBar = ({ active }: { active: string }) => {
  const tabs = [
    { key: 'home', icon: 'fa-home', label: '首页', href: '/' },
    { key: 'projects', icon: 'fa-store', label: '大厅', href: '/projects' },
    { key: 'create', icon: 'fa-plus', label: '发起', href: '/create' },
    { key: 'repayments', icon: 'fa-coins', label: '回款', href: '/repayments' },
    { key: 'profile', icon: 'fa-user', label: '我的', href: '/profile' },
  ]
  return (
    <div class="tab-bar">
      {tabs.map((t) => {
        const isActive = t.key === active
        const cls = isActive ? 'tab-active' : 'tab-inactive'
        if (t.key === 'create') {
          return (
            <a href={t.href} class={cls} style="text-decoration:none;">
              <div class="tab-center-btn">
                <i class={`fas ${t.icon}`} />
              </div>
              <span class="tab-item-label" style="margin-top:2px;">{t.label}</span>
            </a>
          )
        }
        return (
          <a href={t.href} class={cls} style="text-decoration:none;">
            <i class={`fas ${t.icon} tab-item-icon`} />
            <span class="tab-item-label">{t.label}</span>
          </a>
        )
      })}
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
    const member = mockMembers.find((m) => m.phone === phone)
    if (!member) return c.json({ ok: false, error: '该手机号未认证为一亿中流学员' }, 403)
    return c.json({
      ok: true,
      member: {
        id: member.id, name: member.name, phone: member.phone,
        company: member.company, industry: member.industry,
        title: member.title, bio: member.bio, cohort: member.cohort,
        joinDate: member.joinDate,
      },
    })
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
      <div class="login-bg" />
      <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div class="glass-card w-full max-w-[420px]" style="padding: 48px 40px;">
          <div class="flex justify-center mb-3"><LogoSVG size={40} /></div>
          <h1 class="text-center text-white font-extrabold" style="font-size:28px;font-family:'Noto Sans SC',sans-serif;letter-spacing:0.05em;">中流通</h1>
          <p class="text-center text-white mt-1.5" style="font-size:14px;opacity:0.7;">一亿中流学员专属</p>
          <p class="text-center text-white" style="font-size:14px;opacity:0.7;">收入分成协作平台</p>
          <div style="height:32px;" />
          <div class="relative">
            <i class="fas fa-mobile-alt absolute left-4 top-1/2 -translate-y-1/2 text-white" style="opacity:0.45;font-size:16px;" />
            <input id="phone-input" type="tel" maxlength={11} class="login-input" placeholder="请输入手机号" autocomplete="tel" />
          </div>
          <div style="height:16px;" />
          <div class="flex gap-3">
            <div class="relative flex-1">
              <i class="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-white" style="opacity:0.45;font-size:15px;" />
              <input id="code-input" type="text" maxlength={6} class="login-input" placeholder="请输入验证码" autocomplete="one-time-code" />
            </div>
            <button id="send-code-btn" type="button" class="btn-code">获取验证码</button>
          </div>
          <div style="height:24px;" />
          <button id="login-btn" type="button" class="btn-gold">登录</button>
          <div style="height:16px;" />
          <p class="text-center text-white" style="font-size:12px;opacity:0.4;">仅限一亿中流2035战略私董会认证学员使用</p>
        </div>
        <div class="absolute bottom-0 left-0 right-0 text-center pb-8" style="color:rgba(255,255,255,0.3);font-size:12px;">
          滴灌通 × 一亿中流 · 联合出品
        </div>
      </div>
      <div id="toast" class="toast" />
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var phoneInput=document.getElementById('phone-input'),codeInput=document.getElementById('code-input'),
      sendCodeBtn=document.getElementById('send-code-btn'),loginBtn=document.getElementById('login-btn'),
      toastEl=document.getElementById('toast');
  var toastTimer=null;
  function showToast(m,t){clearTimeout(toastTimer);toastEl.textContent=m;toastEl.className='toast toast-'+(t||'error');requestAnimationFrame(function(){toastEl.classList.add('show');});toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3000);}
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
      if(d.ok){localStorage.setItem('zlc_user',JSON.stringify(d.member));localStorage.setItem('zlc_token','demo-token-'+Date.now());showToast('登录成功，欢迎回来！','success');setTimeout(function(){window.location.href='/';},800);}
      else{showToast(d.error||'登录失败','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;}
    }).catch(function(){showToast('网络错误，请重试','error');loginBtn.innerHTML='登录';loginBtn.disabled=false;isLoading=false;});
  });
  codeInput.addEventListener('keydown',function(e){if(e.key==='Enter')loginBtn.click();});
  phoneInput.addEventListener('keydown',function(e){if(e.key==='Enter')codeInput.focus();});
})();
`}} />
    </div>,
    { title: '登录 — 中流通' }
  )
})

// ── Home Page ─────────────────────────────────────────────
app.get('/', (c) => {
  // Pre-compute data for SSR (will be hydrated client-side with user-specific data)
  const openProjects = mockProjects.filter(p => p.status === 'open').slice(0, 3)
  const recentRepayments = mockRepayments.slice(0, 5)

  return c.render(
    <div class="has-tabbar">
      <AuthCheckScript />
      <Navbar />

      {/* Content */}
      <main class="px-4 pt-4 pb-4 max-w-lg mx-auto">

        {/* 1. Welcome */}
        <section class="mb-5">
          <h2 id="greeting" class="font-bold text-text-title" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;" />
          <p id="user-subtitle" class="text-text-secondary mt-0.5" style="font-size:14px;" />
        </section>

        {/* 2. Quick Actions */}
        <section class="grid grid-cols-2 gap-3 mb-5">
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
                      <div class="progress-fill" style={`width:${pct}%`} />
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
    var el1 = document.getElementById('stat-initiated'); if(el1) el1.textContent = s.initiated;
    var el2 = document.getElementById('stat-invested');  if(el2) el2.textContent = s.invested;
    var el3 = document.getElementById('stat-total-inv'); if(el3) el3.textContent = s.totalInvested;
    var el4 = document.getElementById('stat-total-rep'); if(el4) el4.textContent = s.totalRepaid;
  }).catch(function(){});
})();
`}} />
    </div>,
    { title: '中流通 — 首页' }
  )
})

// ── Profile Page ──────────────────────────────────────────
app.get('/profile', (c) => {
  return c.render(
    <div class="has-tabbar">
      <AuthCheckScript />
      <Navbar />

      <main class="px-4 pt-5 pb-4 max-w-lg mx-auto">
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
          <div class="menu-row">
            <i class="fas fa-file-contract text-brand" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">我的合同</span>
            <i class="fas fa-chevron-right text-text-tertiary" style="font-size:12px;" />
          </div>
          <div class="menu-row">
            <i class="fas fa-circle-question text-gold" style="font-size:16px;width:20px;text-align:center;" />
            <span class="flex-1 text-text-primary font-medium" style="font-size:15px;">使用帮助</span>
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

  document.getElementById('logout-btn').addEventListener('click', function(){
    localStorage.removeItem('zlc_user');
    localStorage.removeItem('zlc_token');
    window.location.href = '/login';
  });
})();
`}} />
    </div>,
    { title: '我的 — 中流通' }
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

app.get('/projects', (c) => c.render(
  <PlaceholderPage tabKey="projects" title="项目大厅" icon="fa-store" desc="发现优质收入分成项目，与学员共同参与" />,
  { title: '项目大厅 — 中流通' }
))

app.get('/projects/:id', (c) => {
  const id = c.req.param('id')
  const proj = mockProjects.find(p => p.id === id)
  return c.render(
    <PlaceholderPage tabKey="projects" title={proj ? proj.name : '项目详情'} icon="fa-file-invoice-dollar" desc={proj ? proj.description : '项目详情页开发中'} />,
    { title: (proj ? proj.name : '项目详情') + ' — 中流通' }
  )
})

app.get('/create', (c) => c.render(
  <PlaceholderPage tabKey="create" title="发起项目" icon="fa-rocket" desc="发起收入分成项目，邀请学员共同参与" />,
  { title: '发起项目 — 中流通' }
))

app.get('/repayments', (c) => c.render(
  <PlaceholderPage tabKey="repayments" title="回款管理" icon="fa-coins" desc="查看回款记录与收益详情" />,
  { title: '回款管理 — 中流通' }
))

export default app
