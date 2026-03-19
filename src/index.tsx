// ============================================================
// 中流通 ZhongLiu Connect — Main Entry (Refactored)
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import guide from './guide'
import {
  mockMembers, mockProjects, mockTeachers,
  getUserStats, DEMO_VERIFY_CODE,
} from './data'
import { GlobalScripts, LogoSVG, Navbar, faviconSVG } from './components'

// ── Route Modules ──
import { registerLoginRoute } from './routes/login'
import { registerHomeRoute } from './routes/home'
import { registerProfileRoute } from './routes/profile'
import { registerProjectsRoute } from './routes/projects'
import { registerProjectDetailRoute } from './routes/project-detail'
import { registerCreateRoute } from './routes/create'
import { registerContractSignRoute } from './routes/contract-sign'
import { registerRepaymentsRoute } from './routes/repayments'
import { registerInvestmentsRoute } from './routes/investments'
import { registerRevenueReportRoute } from './routes/revenue-report'
import { registerAdminRoute } from './routes/admin'
import { registerTeacherRoute } from './routes/teacher'
import { registerShareRoute } from './routes/share'
import { registerNotificationsRoute } from './routes/notifications'

const app = new Hono()

// ── Favicon ──
app.get('/favicon.ico', (c) => {
  return new Response(faviconSVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.use(renderer)

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
// Page Routes (modularized)
// ══════════════════════════════════════════════════════════

registerLoginRoute(app)
registerHomeRoute(app)
registerProfileRoute(app)
registerProjectsRoute(app)
registerProjectDetailRoute(app)
registerCreateRoute(app)
registerContractSignRoute(app)
registerRepaymentsRoute(app)
registerInvestmentsRoute(app)
registerRevenueReportRoute(app)
registerAdminRoute(app)
registerTeacherRoute(app)
registerShareRoute(app)
registerNotificationsRoute(app)

// ── Guide Pages (Apple-style immersive demos) ──
app.route('/guide', guide)

app.notFound((c) => {
  return c.render(
    <div class="app-container">
      <GlobalScripts />
      <Navbar />
      <main class="max-w-lg mx-auto px-4 pt-16 pb-8 text-center page-enter">
        <div class="flex justify-center mb-4">
          <LogoSVG size={48} />
        </div>
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center justify-center rounded-full" style="width:72px;height:72px;background:#FEE2E2;">
            <span style="font-size:36px;line-height:1;">🔍</span>
          </div>
        </div>
        <h2 class="font-bold text-text-title mb-2" style="font-size:22px;font-family:'Noto Sans SC',sans-serif;">页面未找到</h2>
        <p class="text-text-secondary mb-1" style="font-size:15px;">您访问的页面不存在或已被移除</p>
        <p class="text-text-tertiary mb-8" style="font-size:13px;">请检查网址是否正确，或返回首页</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-semibold" style="text-decoration:none;font-size:15px;">
            <i class="fas fa-home" style="font-size:13px;" /> 返回首页
          </a>
          <a href="/projects" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold" style="text-decoration:none;font-size:15px;background:#F5F5F4;color:#44403C;">
            <i class="fas fa-store" style="font-size:13px;" /> 项目大厅
          </a>
        </div>
        <p class="text-text-tertiary mt-12" style="font-size:12px;">
          滴灌通 × 一亿中流 · 联合出品
        </p>
      </main>
    </div>,
    { title: '中流通 - 页面未找到' }
  )
})

export default app
