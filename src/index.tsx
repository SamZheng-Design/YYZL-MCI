// ============================================================
// 中流通 ZhongLiu Connect — Main Entry
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import {
  mockMembers, mockProjects, mockRepayments,
  mockContracts, mockRevenueReports, mockRepaymentRecords,
  getUserStats, getProjectStats, calculateRBF, distributeRevenue,
  DEMO_VERIFY_CODE,
} from './data'
import type { Member, Project, Contract, RevenueReport, RepaymentRecord, DistributionResult } from './data'

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
    <div class="has-tabbar">
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto">
        {/* Title */}
        <section class="px-4 pt-4 pb-3">
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
(function(){
  var PROJECTS = ${JSON.stringify(mockProjects)};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, company:m.company, cohort:m.cohort })))};

  // Merge user-created projects from localStorage
  var userProjects = [];
  try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  userProjects.forEach(function(up){
    if(up.status !== 'draft'){
      PROJECTS.push(up);
      if(u && !MEMBERS.find(function(m){return m.id===u.id;})){
        MEMBERS.push({id:u.id, name:u.name, company:u.company||'', cohort:u.cohort||''});
      }
    }
  });

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
    else list.sort(function(a,b){return b.createdAt.localeCompare(a.createdAt);});

    if(!list.length){ listEl.innerHTML=''; emptyEl.style.display='block'; return; }
    emptyEl.style.display='none';

    listEl.innerHTML = list.map(function(p){
      var o = getMember(p.ownerId);
      var pct = Math.round(p.raisedAmount/p.targetAmount*100);
      var remain = p.totalShares - p.raisedShares;
      return '<a href="/projects/'+p.id+'" class="bg-white rounded-2xl shadow-card shadow-card-hover p-5 block" style="text-decoration:none;color:inherit;">'
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
      +'</a>';
    }).join('');
  }

  fInd.addEventListener('change', render);
  fSta.addEventListener('change', render);
  fSort.addEventListener('change', render);
  render();
})();
`}} />
    </div>,
    { title: '项目大厅 — 中流通' }
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
      <div>
        <AuthCheckScript />
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
      { title: '项目详情 — 中流通' }
    )
  }

  const owner = mockMembers.find(m => m.id === proj.ownerId)!
  const rbf = calculateRBF(proj.targetAmount, proj.revenueShareRate, proj.estimatedMonthlyRevenue, proj.recoveryMultiple)
  const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)
  const remainShares = proj.totalShares - proj.raisedShares
  const investorMembers = proj.investors.map(iid => mockMembers.find(m => m.id === iid)).filter(Boolean) as Member[]
  const bgColors = ['#B91C1C','#D4A853','#991B1B','#B8860B','#7F1D1D']

  return c.render(
    <div>
      <AuthCheckScript />
      <Navbar />

      <main class="px-4 pt-3 pb-8 max-w-lg mx-auto">
        {/* Back link */}
        <a href="/projects" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
        </a>

        {/* 1. Project Header Card */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <div class="flex items-center justify-between mb-3">
            <span class="bg-brand-soft text-brand px-2.5 py-0.5 rounded font-semibold" style="font-size:11px;">{proj.industry}</span>
            <StatusBadge status={proj.status} />
          </div>
          <h1 class="font-bold text-text-title mb-4" style="font-size:24px;font-family:'Noto Sans SC',sans-serif;line-height:1.3;">{proj.name}</h1>

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
        <div class="terms-card shadow-card mb-4">
          <div class="px-5 py-4" style="border-bottom:1px solid #F5F5F4;">
            <h3 class="font-semibold text-text-title" style="font-size:16px;">
              <i class="fas fa-file-contract text-brand mr-2" style="font-size:14px;" />
              收入分成条款
            </h3>
          </div>
          <div class="terms-grid">
            <div class="terms-cell">
              <div class="terms-label">融资总额</div>
              <div class="terms-value">¥{proj.targetAmount}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="terms-label">分成比例</div>
              <div class="terms-value">{proj.revenueShareRate}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">%</span></div>
            </div>
            <div class="terms-cell">
              <div class="terms-label">联营期限</div>
              <div class="terms-value">{proj.duration}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">月</span></div>
            </div>
            <div class="terms-cell">
              <div class="terms-label">回收倍数</div>
              <div class="terms-value">{proj.recoveryMultiple}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">x</span></div>
            </div>
            <div class="terms-cell">
              <div class="terms-label">回收上限</div>
              <div class="terms-value">¥{rbf.recoveryCap}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="terms-label">预估月收入</div>
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

        {/* 3. Fundraising Progress */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 class="font-semibold text-text-title mb-3" style="font-size:16px;">
            <i class="fas fa-chart-pie text-gold mr-2" style="font-size:14px;" />
            募集进度
          </h3>
          <div class="progress-bar-lg mb-3">
            <div class="progress-fill" style={`width:${pct}%`} />
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
          <div class="calc-card shadow-card p-5 mb-4">
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
            <div class="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl" style="background:#FAFAF9;">
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
      </main>

      {/* Confirm Modal */}
      <div id="confirm-modal" class="modal-overlay">
        <div class="modal-box">
          <div class="flex items-center justify-center mb-3">
            <div class="flex items-center justify-center rounded-full" style="width:48px;height:48px;background:linear-gradient(135deg,#D4A853,#B8860B);">
              <i class="fas fa-handshake text-white" style="font-size:22px;" />
            </div>
          </div>
          <h4 class="font-bold text-text-title mb-2" style="font-size:18px;">确认参与</h4>
          <p id="modal-text" class="text-text-secondary" style="font-size:14px;">—</p>
          <div class="modal-btn-row">
            <button id="modal-cancel" class="modal-btn modal-btn-cancel">取消</button>
            <button id="modal-confirm" class="modal-btn modal-btn-confirm">确认</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
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
  })};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name })))};

  // Toast
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(m,t){
    if(!toastEl) return;
    clearTimeout(toastTimer);toastEl.textContent=m;toastEl.className='toast toast-'+(t||'error');
    requestAnimationFrame(function(){toastEl.classList.add('show');});
    toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3000);
  }

  // Hide calculator if owner
  var ownerHint = document.getElementById('owner-hint');
  var partBtn = document.getElementById('participate-btn');
  if (u.id === PROJ.ownerId && partBtn) {
    partBtn.style.display = 'none';
    if (ownerHint) ownerHint.style.display = 'block';
  }

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
  }
  if(sel) { sel.addEventListener('change', updateCalc); updateCalc(); }

  // Modal
  var modal = document.getElementById('confirm-modal');
  var modalText = document.getElementById('modal-text');
  var modalCancel = document.getElementById('modal-cancel');
  var modalConfirm = document.getElementById('modal-confirm');

  function openModal(){
    if(!sel) return;
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;
    if(modalText) modalText.textContent = '确认参与「' + PROJ.name + '」' + n + '份，共 ¥' + cost + '万？';
    if(modal) modal.classList.add('show');
  }
  function closeModal(){ if(modal) modal.classList.remove('show'); }

  if(partBtn) partBtn.addEventListener('click', openModal);
  if(modalCancel) modalCancel.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });

  if(modalConfirm) modalConfirm.addEventListener('click', function(){
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;

    // Check if already invested (from localStorage)
    var investments = [];
    try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
    var existing = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
    if(existing){
      closeModal();
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

    // Find owner name from MEMBERS injected data or fallback
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

    closeModal();
    showToast('参与成功！即将跳转签署合同...', 'success');

    // Disable button
    if(partBtn){
      partBtn.disabled = true;
      partBtn.textContent = '已参与 ¥' + cost + '万';
    }
    if(sel) sel.disabled = true;

    // Redirect to contract sign page
    setTimeout(function(){ window.location.href = '/contracts/' + contractId + '/sign'; }, 1000);
  });

  // Check if already invested on load
  var investments = [];
  try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
  var alreadyIn = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
  if(alreadyIn && partBtn){
    partBtn.disabled = true;
    partBtn.textContent = '已参与 ¥' + alreadyIn.amount + '万';
    if(sel) sel.disabled = true;
  }
})();
`}} />
    </div>,
    { title: proj.name + ' — 中流通' }
  )
})

// ══════════════════════════════════════════════════════════
// Create Project  (/create) — 3-Step Form
// ══════════════════════════════════════════════════════════
app.get('/create', (c) => {
  const industries = ['餐饮连锁','智能制造','教育培训','物流供应链','美容健康','零售','SaaS','其他']

  return c.render(
    <div class="has-tabbar">
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-2 pb-6">
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
          <div class="bg-white rounded-2xl shadow-card p-5">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:17px;font-family:'Noto Sans SC',sans-serif;">
              <i class="fas fa-file-contract text-brand mr-2" style="font-size:14px;" />条款设定
            </h3>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label">融资总额 <span class="req">*</span></label>
                <div class="input-unit-wrap">
                  <input id="f-amount" type="number" class="form-input" placeholder="如 200" min={1} />
                  <span class="input-unit">万元</span>
                </div>
              </div>
              <div>
                <label class="form-label">分成比例 <span class="req">*</span></label>
                <div class="input-unit-wrap">
                  <input id="f-rate" type="number" class="form-input" placeholder="如 12" min={0.1} max={100} step={0.1} />
                  <span class="input-unit">%</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label">联营期限 <span class="req">*</span></label>
                <div class="input-unit-wrap">
                  <input id="f-duration" type="number" class="form-input" placeholder="如 24" min={1} />
                  <span class="input-unit">个月</span>
                </div>
              </div>
              <div>
                <label class="form-label">最低参与额 <span class="req">*</span></label>
                <div class="input-unit-wrap">
                  <input id="f-minamt" type="number" class="form-input" placeholder="如 10" min={1} />
                  <span class="input-unit">万/份</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="form-label">预估月收入 <span class="req">*</span></label>
                <div class="input-unit-wrap">
                  <input id="f-revenue" type="number" class="form-input" placeholder="如 30" min={0} step={0.1} />
                  <span class="input-unit">万元</span>
                </div>
              </div>
              <div>
                <label class="form-label">回收倍数</label>
                <div class="input-unit-wrap">
                  <input id="f-multiple" type="number" class="form-input" placeholder="1.5" min={1} max={10} step={0.1} value="1.5" />
                  <span class="input-unit">x</span>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">上报频率</label>
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

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Client script for create project */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  // Toast
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(m,t){
    if(!toastEl) return;
    clearTimeout(toastTimer);toastEl.textContent=m;toastEl.className='toast toast-'+(t||'error');
    requestAnimationFrame(function(){toastEl.classList.add('show');});
    toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3000);
  }

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
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        newPanel.classList.remove(enterClass);
      });
    });
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
  });

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
    return {
      id: id, name: fName.value.trim(), ownerId: u.id,
      industry: fIndustry.value, description: fDesc.value.trim(),
      detail: fDetail.value.trim(), attachment: uploadedFileName,
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
    var projects = [];
    try { projects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
    projects.push(proj);
    localStorage.setItem('zlc_user_projects', JSON.stringify(projects));
    showToast('项目发布成功！', 'success');
    setTimeout(function(){ window.location.href = '/projects/' + proj.id; }, 800);
  });
})();
`}} />
    </div>,
    { title: '发起项目 — 中流通' }
  )
})

// ══════════════════════════════════════════════════════════
// Contract Sign  (/contracts/:id/sign)
// ══════════════════════════════════════════════════════════
app.get('/contracts/:id/sign', (c) => {
  const contractId = c.req.param('id')

  return c.render(
    <div>
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8">
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

      {/* Success overlay */}
      <div class="sign-success-overlay" id="success-overlay">
        <div class="sign-success-icon">
          <i class="fas fa-check text-white" style="font-size:36px;" />
        </div>
        <div class="sign-success-text">合同签署成功</div>
        <div class="sign-success-sub">协议已生效，即将跳转到回款页面...</div>
      </div>

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var CONTRACT_ID = '${contractId}';

  // Toast
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(m,t){
    if(!toastEl) return;
    clearTimeout(toastTimer);toastEl.textContent=m;toastEl.className='toast toast-'+(t||'error');
    requestAnimationFrame(function(){toastEl.classList.add('show');});
    toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3000);
  }

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

      // Show success
      setTimeout(function(){
        var overlay = document.getElementById('success-overlay');
        overlay.classList.add('show');
        // Redirect after 3s
        setTimeout(function(){ window.location.href = '/repayments'; }, 3000);
      }, 500);
    }, 1000);
  });
})();
`}} />
    </div>,
    { title: '合同签署 — 中流通' }
  )
})

// ══════════════════════════════════════════════════════════
// Repayments Center  (/repayments)
// ══════════════════════════════════════════════════════════
app.get('/repayments', (c) => {
  return c.render(
    <div class="has-tabbar">
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto">
        {/* Title */}
        <section class="px-4 pt-4 pb-0">
          <h1 class="font-bold text-text-title" style="font-size:22px;font-weight:700;color:#1C1917;font-family:'Noto Sans SC',sans-serif;">回款中心</h1>
        </section>

        {/* Tab switcher */}
        <div class="rep-tab-bar" style="background:#fff;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;margin-top:12px;">
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
  var PROJECTS = ${JSON.stringify(mockProjects)};
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
  var myContracts = CONTRACTS.filter(function(c){ return c.participantId === u.id && c.status === 'active'; });

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
      var statusBadge = c.status === 'active' ? '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>' : '<span style="background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';
      var initiator = MEMBERS.find(function(m){ return m.id === c.initiatorId; });
      var initName = c.initiatorName || (initiator ? initiator.name : '');
      var initComp = c.initiatorCompany || (initiator ? initiator.company : '');

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
      investHTML += '<div style="flex:1;height:6px;border-radius:3px;background:#F5F5F4;overflow:hidden;"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#D4A853,#B8860B);width:' + Math.min(parseFloat(progressPct), 100) + '%;transition:width 0.6s;"></div></div>';
      investHTML += '<span style="font-size:12px;color:#D4A853;font-weight:600;">' + progressPct + '%</span>';
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

      // Count participants from contracts
      var projContracts = CONTRACTS.filter(function(c){ return c.projectId === p.id && c.status === 'active'; });
      var participantCount = projContracts.length || p.investors.length;

      initiateHTML += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;">';
      initiateHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
      initiateHTML += '<span style="font-size:16px;font-weight:600;color:#1C1917;">' + p.name + '</span>';
      initiateHTML += '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;' + badgeStyle + '">' + statusLabel + '</span>';
      initiateHTML += '</div>';
      initiateHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      initiateHTML += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">' + p.industry + '</span>';
      initiateHTML += '<span style="font-size:13px;color:#78716C;">' + participantCount + '位同学参与</span>';
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
})();
`}} />
    </div>,
    { title: '回款中心 — 中流通' }
  )
})

// ══════════════════════════════════════════════════════════
// Investment Detail  (/investments/:contractId)
// ══════════════════════════════════════════════════════════
app.get('/investments/:contractId', (c) => {
  const contractId = c.req.param('contractId')

  return c.render(
    <div>
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8">
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
    : '<span style="background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">已完成</span>';

  var html = '';

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
  html += '<defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D4A853"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="#F5F5F4" stroke-width="12"/>';
  html += '<circle cx="80" cy="80" r="68" fill="none" stroke="url(#ring-grad)" stroke-width="12" stroke-dasharray="' + circumference.toFixed(2) + '" stroke-dashoffset="' + dashOffset.toFixed(2) + '" stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset 1s ease;"/>';
  html += '<text x="80" y="72" text-anchor="middle" fill="#D4A853" font-size="32" font-weight="800" font-family="Montserrat,sans-serif">' + progressPct.toFixed(1) + '%</text>';
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
      html += '<div style="width:40px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#D4A853,#B8860B);height:' + Math.max(pctH, 5) + '%;transition:height 0.6s ease;"></div>';
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
    { title: '投资详情 — 中流通' }
  )
})

// ══════════════════════════════════════════════════════════
// Revenue Report  (/initiated/:projectId/report)
// ══════════════════════════════════════════════════════════
app.get('/initiated/:projectId/report', (c) => {
  const projectId = c.req.param('projectId')

  return c.render(
    <div>
      <AuthCheckScript />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8">
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

  // Toast
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(m,t){
    if(!toastEl) return;
    clearTimeout(toastTimer);toastEl.textContent=m;toastEl.className='toast toast-'+(t||'error');
    requestAnimationFrame(function(){toastEl.classList.add('show');});
    toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3000);
  }

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
    { title: '上报收入 — 中流通' }
  )
})

export default app
