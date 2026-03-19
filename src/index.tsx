// ============================================================
// 中流通 ZhongLiu Connect — Main Entry
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import { mockMembers, DEMO_VERIFY_CODE } from './data'
import type { Member } from './data'

const app = new Hono()

// Favicon — inline SVG as ICO to avoid 404
app.get('/favicon.ico', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#DC2626"/></linearGradient></defs><circle cx="44" cy="28" r="22" fill="url(#a)"/><circle cx="36" cy="44" r="22" fill="url(#b)" opacity=".85"/></svg>`
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.use(renderer)

// ── Logo SVG Component ────────────────────────────────────
const LogoSVG = ({ size = 40 }: { size?: number }) => (
  <svg
    width={String(size)}
    height={String(size)}
    viewBox="0 0 80 80"
    xmlns="http://www.w3.org/2000/svg"
  >
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

// ── API: 验证登录 ─────────────────────────────────────────
app.post('/api/login', async (c) => {
  try {
    const body = await c.req.json<{ phone: string; code: string }>()
    const { phone, code } = body

    if (!phone || !code) {
      return c.json({ ok: false, error: '请输入手机号和验证码' }, 400)
    }

    if (code !== DEMO_VERIFY_CODE) {
      return c.json({ ok: false, error: '验证码错误' }, 400)
    }

    const member = mockMembers.find((m) => m.phone === phone)
    if (!member) {
      return c.json({ ok: false, error: '该手机号未认证为一亿中流学员' }, 403)
    }

    return c.json({
      ok: true,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        company: member.company,
        industry: member.industry,
        title: member.title,
        bio: member.bio,
        cohort: member.cohort,
      },
    })
  } catch {
    return c.json({ ok: false, error: '请求格式错误' }, 400)
  }
})

// ── API: 获取学员列表（后续页面使用） ──────────────────────
app.get('/api/members', (c) => {
  const members = mockMembers
    .filter((m) => m.status === 'active')
    .map(({ id, name, company, industry, title, cohort }) => ({
      id,
      name,
      company,
      industry,
      title,
      cohort,
    }))
  return c.json({ ok: true, members })
})

// ── Login Page ────────────────────────────────────────────
app.get('/login', (c) => {
  return c.render(
    <div>
      {/* Full-screen background */}
      <div class="login-bg" />

      {/* Main content */}
      <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Glass Card */}
        <div class="glass-card w-full max-w-[420px] p-12 sm:p-10" style="padding: 48px 40px;">
          {/* Logo */}
          <div class="flex justify-center mb-3">
            <LogoSVG size={40} />
          </div>

          {/* Brand Name */}
          <h1
            class="text-center text-white font-extrabold"
            style="font-size: 28px; font-family: 'Noto Sans SC', sans-serif; letter-spacing: 0.05em;"
          >
            中流通
          </h1>

          {/* Subtitles */}
          <p class="text-center text-white mt-1.5" style="font-size: 14px; opacity: 0.7;">
            一亿中流学员专属
          </p>
          <p class="text-center text-white" style="font-size: 14px; opacity: 0.7;">
            收入分成协作平台
          </p>

          {/* Spacer */}
          <div style="height: 32px;" />

          {/* Phone Input */}
          <div class="relative">
            <i
              class="fas fa-mobile-alt absolute left-4 top-1/2 -translate-y-1/2 text-white"
              style="opacity: 0.45; font-size: 16px;"
            />
            <input
              id="phone-input"
              type="tel"
              maxlength={11}
              class="login-input"
              placeholder="请输入手机号"
              autocomplete="tel"
            />
          </div>

          {/* Spacer */}
          <div style="height: 16px;" />

          {/* Code Input + Button */}
          <div class="flex gap-3">
            <div class="relative flex-1">
              <i
                class="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-white"
                style="opacity: 0.45; font-size: 15px;"
              />
              <input
                id="code-input"
                type="text"
                maxlength={6}
                class="login-input"
                placeholder="请输入验证码"
                autocomplete="one-time-code"
              />
            </div>
            <button id="send-code-btn" type="button" class="btn-code">
              获取验证码
            </button>
          </div>

          {/* Spacer */}
          <div style="height: 24px;" />

          {/* Login Button */}
          <button id="login-btn" type="button" class="btn-gold">
            登录
          </button>

          {/* Spacer */}
          <div style="height: 16px;" />

          {/* Disclaimer */}
          <p class="text-center text-white" style="font-size: 12px; opacity: 0.4;">
            仅限一亿中流2035战略私董会认证学员使用
          </p>
        </div>

        {/* Footer */}
        <div
          class="absolute bottom-0 left-0 right-0 text-center pb-8"
          style="color: rgba(255,255,255,0.3); font-size: 12px;"
        >
          滴灌通 × 一亿中流 · 联合出品
        </div>
      </div>

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Inline Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  // ── Elements ──
  var phoneInput  = document.getElementById('phone-input');
  var codeInput   = document.getElementById('code-input');
  var sendCodeBtn = document.getElementById('send-code-btn');
  var loginBtn    = document.getElementById('login-btn');
  var toastEl     = document.getElementById('toast');

  // ── Toast ──
  var toastTimer = null;
  function showToast(msg, type) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className = 'toast toast-' + (type || 'error');
    requestAnimationFrame(function(){
      toastEl.classList.add('show');
    });
    toastTimer = setTimeout(function(){
      toastEl.classList.remove('show');
    }, 3000);
  }

  // ── Send Code (60s countdown) ──
  var countdown = 0;
  var cdTimer = null;
  sendCodeBtn.addEventListener('click', function(){
    if (countdown > 0) return;
    var phone = phoneInput.value.trim();
    if (!/^1[3-9]\\d{9}$/.test(phone)) {
      showToast('请输入正确的11位手机号', 'error');
      return;
    }
    countdown = 60;
    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = '60s';
    showToast('验证码已发送（Demo: 888888）', 'success');
    cdTimer = setInterval(function(){
      countdown--;
      if (countdown <= 0) {
        clearInterval(cdTimer);
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = '获取验证码';
        countdown = 0;
      } else {
        sendCodeBtn.textContent = countdown + 's';
      }
    }, 1000);
  });

  // ── Login ──
  var isLoading = false;
  loginBtn.addEventListener('click', function(){
    if (isLoading) return;
    var phone = phoneInput.value.trim();
    var code  = codeInput.value.trim();

    if (!/^1[3-9]\\d{9}$/.test(phone)) {
      showToast('请输入正确的11位手机号', 'error');
      return;
    }
    if (!code || code.length < 4) {
      showToast('请输入验证码', 'error');
      return;
    }

    isLoading = true;
    loginBtn.innerHTML = '<span class="spinner"></span>';
    loginBtn.disabled = true;

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, code: code })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.ok) {
        localStorage.setItem('zlc_user', JSON.stringify(data.member));
        localStorage.setItem('zlc_token', 'demo-token-' + Date.now());
        showToast('登录成功，欢迎回来！', 'success');
        setTimeout(function(){ window.location.href = '/'; }, 800);
      } else {
        showToast(data.error || '登录失败', 'error');
        loginBtn.innerHTML = '登录';
        loginBtn.disabled = false;
        isLoading = false;
      }
    })
    .catch(function(){
      showToast('网络错误，请重试', 'error');
      loginBtn.innerHTML = '登录';
      loginBtn.disabled = false;
      isLoading = false;
    });
  });

  // ── Enter key submit ──
  codeInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') loginBtn.click();
  });
  phoneInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') codeInput.focus();
  });
})();
          `,
        }}
      />
    </div>,
    { title: '登录 — 中流通 ZhongLiu Connect' }
  )
})

// ── Home Page (placeholder + auth check) ──────────────────
app.get('/', (c) => {
  return c.render(
    <div>
      <div class="min-h-screen bg-surface-page flex flex-col">
        {/* Top bar */}
        <header class="bg-white border-b border-surface-divider px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <LogoSVG size={32} />
            <span class="font-extrabold text-brand" style="font-size: 20px; font-family: 'Noto Sans SC', sans-serif;">
              中流通
            </span>
            <span class="text-text-tertiary text-xs ml-1 hidden sm:inline">ZhongLiu Connect</span>
          </div>
          <button
            id="logout-btn"
            class="text-sm text-text-secondary hover:text-brand transition-colors cursor-pointer bg-transparent border-0"
          >
            <i class="fas fa-right-from-bracket mr-1" />
            退出
          </button>
        </header>

        {/* Main content */}
        <main class="flex-1 flex items-center justify-center p-6">
          <div class="text-center max-w-lg">
            <div class="mb-6">
              <LogoSVG size={56} />
            </div>
            <h1
              class="text-3xl font-extrabold text-text-title mb-2"
              style="font-family: 'Noto Sans SC', sans-serif;"
            >
              欢迎来到中流通
            </h1>
            <p class="text-text-secondary mb-1" id="welcome-user" />
            <p class="text-text-tertiary text-sm mb-8">
              一亿中流 × 滴灌通 · 收入分成协作平台
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { icon: 'fa-chart-line', label: '投资机会', color: 'text-brand' },
                { icon: 'fa-handshake', label: '学员协作', color: 'text-gold-dark' },
                { icon: 'fa-building', label: '企业画像', color: 'text-brand-dark' },
                { icon: 'fa-wallet', label: '我的投资', color: 'text-gold' },
                { icon: 'fa-users', label: '社区动态', color: 'text-brand-light' },
                { icon: 'fa-gear', label: '账户设置', color: 'text-text-secondary' },
              ].map((item) => (
                <div class="bg-white rounded-xl p-4 shadow-sm border border-surface-divider hover:shadow-md transition-shadow cursor-pointer">
                  <i class={`fas ${item.icon} text-xl mb-2 ${item.color}`} />
                  <p class="text-sm text-text-primary font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            <p class="text-text-tertiary text-xs mt-10">
              更多功能正在开发中，敬请期待
            </p>
          </div>
        </main>
      </div>

      {/* Inline Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  // Auth check
  var user = null;
  try { user = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!user) {
    window.location.href = '/login';
    return;
  }

  // Welcome text
  var el = document.getElementById('welcome-user');
  if (el) {
    el.textContent = user.name + ' · ' + user.company + ' · ' + user.title;
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function(){
    localStorage.removeItem('zlc_user');
    localStorage.removeItem('zlc_token');
    window.location.href = '/login';
  });
})();
          `,
        }}
      />
    </div>,
    { title: '中流通 ZhongLiu Connect — 首页' }
  )
})

export default app
