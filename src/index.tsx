// ============================================================
// 中流通 ZhongLiu Connect — Main Entry (D1 Refactored)
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import guide from './guide'
import { GlobalScripts, LogoSVG, Navbar, faviconSVG } from './components'
import type { HonoEnv } from './types'
import {
  getUserByPhone, verifyPassword, toSessionUser,
  getActiveMembers, getTeachers,
  getPlatformStats, getUserInvestmentStats,
} from './db'
import {
  loadMembers, loadTeachers, loadProjects, loadContracts,
  loadRepaymentRecords, loadRepayments, loadRevenueReports,
  loadReferrals, loadNotifications, loadShareLogs,
  loadProjectById, loadProjectByShareCode,
  loadContractsByProject,
  getProjectStats, getUserStats, generateContractHTML,
  getTeacherForMember, getRelationTag, getRelevanceScore,
  calculateRBF, distributeRevenue,
  type Member, type Teacher, type Project, type Contract,
  type RepaymentRecord, type RevenueReport, type Referral,
  type Notification, type ShareLog, type Repayment,
} from './db-bridge'

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
import adminApi from './admin-api'

const app = new Hono<HonoEnv>()

// ── Favicon ──
app.get('/favicon.ico', (c) => {
  return new Response(faviconSVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.use(renderer)

// ══════════════════════════════════════════════════════════
// API Routes — 已从 mock 数据迁移到 D1 数据库
// ══════════════════════════════════════════════════════════

/** 登录 API — 邀请码+密码认证 (兼容 demo $demo$ 密码) */
app.post('/api/login', async (c) => {
  try {
    const body = await c.req.json<{ phone: string; code?: string; password?: string }>()
    const { phone } = body
    // 兼容旧的 code 字段和新的 password 字段
    const password = body.password || body.code || ''

    if (!phone || !password) return c.json({ ok: false, error: '请输入手机号和密码' }, 400)

    const db = c.env.DB
    const user = await getUserByPhone(db, phone)
    if (!user) return c.json({ ok: false, error: '该手机号未认证为一亿中流学员' }, 403)

    // 验证密码
    const valid = await verifyPassword(password, user.password_hash || '')
    if (!valid) return c.json({ ok: false, error: '密码错误' }, 400)

    const sessionUser = toSessionUser(user)

    // 兼容旧前端格式
    if (user.role === 'teacher') {
      return c.json({
        ok: true,
        member: {
          id: user.id, name: user.name, phone: user.phone,
          company: '一亿中流', industry: '教育管理',
          title: '班主任', bio: '一亿中流班主任老师', cohort: '导师团队',
          joinDate: user.join_date || '2023-01-01', role: 'teacher',
          classIds: user.class_ids ? JSON.parse(user.class_ids) : [],
        },
      })
    }

    return c.json({
      ok: true,
      member: {
        id: user.id, name: user.name, phone: user.phone,
        company: user.company || '', industry: user.industry || '',
        title: user.title || '', bio: user.bio || '', cohort: user.cohort || '',
        joinDate: user.join_date || '', role: user.role,
        classId: user.class_id || '', className: user.class_name || '',
      },
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '请求格式错误: ' + (e.message || '') }, 400)
  }
})

/** 成员列表 API */
app.get('/api/members', async (c) => {
  const db = c.env.DB
  const members = await loadMembers(db)
  return c.json({
    ok: true,
    members: members.map(({ id, name, company, industry, title, cohort }) =>
      ({ id, name, company, industry, title, cohort })
    ),
  })
})

/** 项目列表 API */
app.get('/api/projects', async (c) => {
  const db = c.env.DB
  const projects = await loadProjects(db)
  return c.json({ ok: true, projects })
})

/** 用户统计 API */
app.get('/api/user-stats/:id', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  const [projects, contracts, repRecords] = await Promise.all([
    loadProjects(db), loadContracts(db), loadRepaymentRecords(db),
  ])
  const stats = getUserStats(userId, projects, contracts, repRecords)
  return c.json({ ok: true, stats })
})

/** 平台统计 API（管理员用） */
app.get('/api/platform-stats', async (c) => {
  const db = c.env.DB
  const stats = await getPlatformStats(db)
  return c.json({ ok: true, stats })
})

// ══════════════════════════════════════════════════════════
// 数据加载 API — 供前端页面按需获取 D1 数据
// （替代原来注入到 <script> 标签里的巨型 JSON）
// ══════════════════════════════════════════════════════════

app.get('/api/data/members', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadMembers(db) })
})

app.get('/api/data/teachers', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadTeachers(db) })
})

app.get('/api/data/projects', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadProjects(db) })
})

app.get('/api/data/projects/:id', async (c) => {
  const db = c.env.DB
  const proj = await loadProjectById(db, c.req.param('id'))
  if (!proj) return c.json({ ok: false, error: '项目不存在' }, 404)
  return c.json({ ok: true, data: proj })
})

app.get('/api/data/contracts', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadContracts(db) })
})

app.get('/api/data/contracts/project/:projectId', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadContractsByProject(db, c.req.param('projectId')) })
})

app.get('/api/data/revenue-reports', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadRevenueReports(db) })
})

app.get('/api/data/repayment-records', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadRepaymentRecords(db) })
})

app.get('/api/data/repayments', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadRepayments(db) })
})

app.get('/api/data/referrals', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadReferrals(db) })
})

app.get('/api/data/notifications', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadNotifications(db) })
})

app.get('/api/data/share-logs', async (c) => {
  const db = c.env.DB
  return c.json({ ok: true, data: await loadShareLogs(db) })
})

app.get('/api/data/share-code/:code', async (c) => {
  const db = c.env.DB
  const proj = await loadProjectByShareCode(db, c.req.param('code'))
  if (!proj) return c.json({ ok: false, error: '分享码不存在' }, 404)
  return c.json({ ok: true, data: proj })
})


// ══════════════════════════════════════════════════════════
// Admin Write API (管理后台 + 学员操作)
// ══════════════════════════════════════════════════════════
app.route('/api/admin', adminApi)

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
