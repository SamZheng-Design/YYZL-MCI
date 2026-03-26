// ============================================================
// 中流通 ZhongLiu Connect — Main Entry (D1 + P0 Security)
// P0 安全加固：Session 鉴权中间件、登录限流、安全 Headers
// ============================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import guide from './guide'
import { GlobalScripts, LogoSVG, Navbar, faviconSVG } from './components'
import type { HonoEnv } from './types'
import {
  getUserByPhone, verifyPassword, toSessionUser, hashPassword,
  getActiveMembers, getTeachers,
  getPlatformStats, getUserInvestmentStats,
  getUnreadNotificationCount,
  logAudit, generateUserId,
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
import {
  requireAuth, requireAdmin, requireTeacher,
  loginRateLimit, clearLoginRateLimit,
  securityHeaders, getClientIP,
  cleanExpiredSessions, verifySession,
} from './middleware'

// ── Route Modules ──
import { registerLoginRoute } from './routes/login'
import { registerHomeRoute } from './routes/home'
import { registerProfileRoute } from './routes/profile'
import { registerProjectsRoute } from './routes/projects'
import { registerProjectDetailRoute } from './routes/project-detail'
import { registerCreateRoute } from './routes/create'
import { registerContractSignRoute } from './routes/contract-sign'
import { registerTermsConnectRoute } from './routes/terms-connect'
import { registerRepaymentsRoute } from './routes/repayments'
import { registerInvestmentsRoute } from './routes/investments'
import { registerRevenueReportRoute } from './routes/revenue-report'
import { registerAdminRoute } from './routes/admin'
import { registerTeacherRoute } from './routes/teacher'
import { registerShareRoute } from './routes/share'
import { registerNotificationsRoute } from './routes/notifications'
import adminApi from './admin-api'

const app = new Hono<HonoEnv>()

// ══════════════════════════════════════════════════════════
// 全局中间件 — 安全 Headers（所有请求）
// ══════════════════════════════════════════════════════════
app.use('*', securityHeaders)

// ── Performance: Cache-Control for static assets ──
app.use('/static/*', async (c, next) => {
  await next()
  if (c.res.ok) {
    c.res.headers.set('Cache-Control', 'public, max-age=604800, immutable')
  }
})

// ── Performance: Cache-Control for read-only API data ──
app.use('/api/data/*', async (c, next) => {
  await next()
  if (c.req.method === 'GET' && c.res.ok) {
    c.res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  }
})

// ── Favicon ──
app.get('/favicon.ico', (c) => {
  return new Response(faviconSVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.use(renderer)

// ══════════════════════════════════════════════════════════
// 鉴权中间件 — 所有 /api/data/* 和 /api/admin/* 路由
// 排除：/api/login, /api/logout, /api/self-register, /api/auth/me
// ══════════════════════════════════════════════════════════
app.use('/api/data/*', requireAuth)
app.use('/api/members', requireAuth)
app.use('/api/projects', requireAuth)
app.use('/api/user-stats/*', requireAuth)
app.use('/api/platform-stats', requireAuth)
app.use('/api/change-password', requireAuth)
app.use('/api/admin/*', requireAuth)

// ══════════════════════════════════════════════════════════
// Auth API — 不需要鉴权的公开端点
// ══════════════════════════════════════════════════════════

/** 验证 Session 有效性（供前端 AuthCheck 使用） */
app.get('/api/auth/me', verifySession)

// ══════════════════════════════════════════════════════════
// API Routes — D1 数据库 + P0 Session 鉴权
// ══════════════════════════════════════════════════════════

/** 登录 API — 密码认证 + Session Cookie + 限流 + IP 审计 */
app.post('/api/login', loginRateLimit, async (c) => {
  try {
    const body = await c.req.json<{ phone: string; code?: string; password?: string }>()
    const { phone } = body
    const password = body.password || body.code || ''
    const ip = getClientIP(c)

    if (!phone || !password) return c.json({ ok: false, error: '请输入手机号和密码' }, 400)

    const db = c.env.DB
    const user = await getUserByPhone(db, phone)
    if (!user) {
      await logAudit(db, { action: 'login_failed', detail: { phone, reason: 'user_not_found' }, ipAddress: ip })
      return c.json({ ok: false, error: '该手机号未认证为一亿中流学员' }, 403)
    }

    // Check if user is pending approval
    if (user.status === 'pending') {
      return c.json({ ok: false, error: '您的账号正在审核中，请等待管理员通过后再登录', isPending: true }, 403)
    }
    // Check if user is disabled
    if (user.status === 'inactive') {
      await logAudit(db, { userId: user.id, action: 'login_blocked', detail: { reason: 'account_disabled' }, ipAddress: ip })
      return c.json({ ok: false, error: '您的账号已被禁用，请联系管理员', isInactive: true }, 403)
    }

    const valid = await verifyPassword(password, user.password_hash || '')
    if (!valid) {
      await logAudit(db, { userId: user.id, action: 'login_failed', detail: { reason: 'wrong_password' }, ipAddress: ip })
      return c.json({ ok: false, error: '密码错误' }, 400)
    }

    // ✅ 登录成功 — 创建 session，记录 IP 和设备信息
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    const deviceInfo = (c.req.header('User-Agent') || 'unknown').slice(0, 200)

    await db.prepare(
      `INSERT INTO sessions (id, user_id, expires_at, ip_address, device_info) VALUES (?, ?, ?, ?, ?)`
    ).bind(sessionId, user.id, expiresAt, ip, deviceInfo).run()

    // 登录成功，清除限流记录
    await clearLoginRateLimit(db, ip)

    // Check if using demo password (needs change)
    const needsPasswordChange = user.must_change_password === 1 || (user.password_hash || '').startsWith('$demo$')

    // Build response
    const memberData = user.role === 'teacher' ? {
      id: user.id, name: user.name, phone: user.phone,
      company: '一亿中流', industry: '教育管理',
      title: '班主任', bio: '一亿中流班主任老师', cohort: '导师团队',
      joinDate: user.join_date || '2023-01-01', role: 'teacher',
      classIds: user.class_ids ? JSON.parse(user.class_ids) : [],
    } : {
      id: user.id, name: user.name, phone: user.phone,
      company: user.company || '', industry: user.industry || '',
      title: user.title || '', bio: user.bio || '', cohort: user.cohort || '',
      joinDate: user.join_date || '', role: user.role,
      classId: user.class_id || '', className: user.class_name || '',
    }

    // Set session cookie (Secure flag for production HTTPS)
    c.header('Set-Cookie', `zlc_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*24*60*60}`)

    // 审计日志
    await logAudit(db, { userId: user.id, action: 'login_success', detail: { deviceInfo: deviceInfo.slice(0, 80) }, ipAddress: ip })

    return c.json({
      ok: true,
      member: memberData,
      needsPasswordChange,
      sessionId,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '请求格式错误: ' + (e.message || '') }, 400)
  }
})

/** 修改密码 API — 方案C：手机尾号验证 + 强制改密 */
app.post('/api/change-password', async (c) => {
  try {
    const sessionUser = c.get('user')!
    const { oldPassword, newPassword, phoneLast4 } = await c.req.json<{
      userId?: string; oldPassword: string; newPassword: string; phoneLast4?: string
    }>()
    if (!newPassword || newPassword.length < 6) {
      return c.json({ ok: false, error: '新密码至少6位' }, 400)
    }

    const db = c.env.DB
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(sessionUser.id).first<any>()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)

    // 方案C：首次改密时验证手机尾号
    if (user.must_change_password === 1 && phoneLast4) {
      const realLast4 = (user.phone || '').slice(-4)
      if (phoneLast4 !== realLast4) {
        await logAudit(db, { userId: sessionUser.id, action: 'change_password_failed', detail: { reason: 'phone_last4_mismatch' }, ipAddress: getClientIP(c) })
        return c.json({ ok: false, error: '手机尾号验证失败，请确认您的手机号后4位' }, 400)
      }
    }

    const valid = await verifyPassword(oldPassword, user.password_hash || '')
    if (!valid) return c.json({ ok: false, error: '原密码错误' }, 400)

    const newHash = await hashPassword(newPassword)
    await db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').bind(newHash, sessionUser.id).run()

    const ip = getClientIP(c)
    await logAudit(db, { userId: sessionUser.id, action: 'change_password', entityType: 'user', entityId: sessionUser.id, ipAddress: ip })

    return c.json({ ok: true, message: '密码修改成功' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

/** 管理员重置密码 API — 从 session 验证管理员身份 */
app.post('/api/admin/reset-password', async (c) => {
  try {
    const sessionUser = c.get('user')!
    if (sessionUser.role !== 'admin') {
      return c.json({ ok: false, error: '无管理员权限' }, 403)
    }

    const { targetUserId } = await c.req.json<{
      adminId?: string; targetUserId: string
    }>()

    const db = c.env.DB

    // Generate temporary password
    const tempPassword = 'zlc' + Math.random().toString(36).slice(2, 8)
    const newHash = await hashPassword(tempPassword)
    await db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?').bind(newHash, targetUserId).run()

    const ip = getClientIP(c)
    await logAudit(db, {
      userId: sessionUser.id, action: 'admin_reset_password',
      entityType: 'user', entityId: targetUserId,
      detail: { adminName: sessionUser.name }, ipAddress: ip,
    })

    return c.json({ ok: true, data: { tempPassword }, message: '密码已重置' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

/** 学员自助注册 API — 提交后状态为 pending，需管理员审核（限流保护） */
app.post('/api/self-register', loginRateLimit, async (c) => {
  try {
    const { name, phone, password, teacherName, company, title } = await c.req.json<{
      name: string; phone: string; password: string; teacherName: string; company?: string; title?: string
    }>()

    if (!name || !phone || !password || !teacherName) {
      return c.json({ ok: false, error: '请填写姓名、手机号、密码和班主任名称' }, 400)
    }
    if (password.length < 6) {
      return c.json({ ok: false, error: '密码至少6位' }, 400)
    }
    if (!/^1\d{10}$/.test(phone)) {
      return c.json({ ok: false, error: '请输入正确的手机号' }, 400)
    }

    const db = c.env.DB
    const ip = getClientIP(c)

    // Check if phone already registered
    const existing = await db.prepare('SELECT id, status FROM users WHERE phone = ?').bind(phone).first<{ id: string; status: string }>()
    if (existing) {
      if (existing.status === 'pending') {
        return c.json({ ok: false, error: '该手机号已提交注册申请，请等待审核' }, 400)
      }
      return c.json({ ok: false, error: '该手机号已注册' }, 400)
    }

    const userId = await generateUserId(db, 'member')
    const passwordHash = await hashPassword(password)

    // Store teacherName in bio temporarily for admin to review
    await db.prepare(`
      INSERT INTO users (id, phone, name, password_hash, role, status, company, title, bio, join_date, must_change_password)
      VALUES (?, ?, ?, ?, 'member', 'pending', ?, ?, ?, date('now'), 0)
    `).bind(userId, phone, name, passwordHash, company || '', title || '', '班主任：' + teacherName).run()

    await logAudit(db, {
      userId: userId, action: 'self_register',
      entityType: 'user', entityId: userId,
      detail: { name, phone, teacherName }, ipAddress: ip,
    })

    return c.json({ ok: true, message: '注册申请已提交，请等待管理员审核通过后登录' })
  } catch (e: any) {
    return c.json({ ok: false, error: '注册失败: ' + (e.message || '') }, 500)
  }
})

/** 登出 API */
app.post('/api/logout', async (c) => {
  try {
    // Get session from cookie
    const cookie = c.req.header('Cookie') || ''
    const match = cookie.match(/zlc_session=([^;]+)/)
    if (match) {
      const db = c.env.DB
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(match[1]).run()
    }
    // Clear cookie
    c.header('Set-Cookie', 'zlc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: true }) // Always succeed for logout
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

/** 用户统计 API — 优化：用针对性 SQL 替代全量加载 */
app.get('/api/user-stats/:id', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  const stats = await getUserInvestmentStats(db, userId)
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

/** 未读通知计数 API — 从 session 获取用户身份 */
app.get('/api/data/notifications/unread-count', async (c) => {
  const db = c.env.DB
  const sessionUser = c.get('user')!
  const count = await getUnreadNotificationCount(db, sessionUser.id, sessionUser.role)
  return c.json({ count })
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

// Invite codes API
app.get('/api/data/invite-codes', async (c) => {
  const db = c.env.DB
  const codes = await db.prepare(
    `SELECT ic.*, u.name as used_by_name FROM invite_codes ic LEFT JOIN users u ON ic.used_by = u.id ORDER BY ic.created_at DESC LIMIT 100`
  ).all<any>()
  return c.json({ ok: true, data: (codes.results || []).map((c: any) => ({
    id: c.id, code: c.code, createdBy: c.created_by, usedBy: c.used_by,
    usedByName: c.used_by_name, usedAt: c.used_at, expiresAt: c.expires_at,
    createdAt: c.created_at,
  }))})
})

// Contract HTML API — generate contract HTML on demand (for API-driven pages)
app.get('/api/data/contracts/:contractId/html', async (c) => {
  const db = c.env.DB
  const contractId = c.req.param('contractId')
  const [allMembers, allProjects, allContracts] = await Promise.all([
    loadMembers(db), loadProjects(db), loadContracts(db)
  ])
  const ct = allContracts.find(c => c.id === contractId)
  if (!ct) return c.json({ ok: false, error: '合同不存在' }, 404)
  const proj = allProjects.find(p => p.id === ct.projectId)
  if (!proj) return c.json({ ok: false, error: '项目不存在' }, 404)
  const initiator = allMembers.find(m => m.id === ct.initiatorId) || null
  const participant = allMembers.find(m => m.id === ct.participantId) || null
  const html = generateContractHTML(ct, proj, participant, initiator)
  return c.json({ ok: true, data: html })
})

// Audit logs API
app.get('/api/data/audit-logs', async (c) => {
  const db = c.env.DB
  const logs = await db.prepare(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'
  ).all<any>()
  return c.json({ ok: true, data: (logs.results || []).map((l: any) => ({
    id: l.id, userId: l.user_id, action: l.action, entityType: l.entity_type,
    entityId: l.entity_id, detail: l.detail, createdAt: l.created_at,
  }))})
})


// ══════════════════════════════════════════════════════════
// Admin Write API (管理后台 + 学员操作)
// 注意：/api/admin/* 已在上方通过 app.use 统一加了 requireAuth
// ══════════════════════════════════════════════════════════
app.route('/api/admin', adminApi)

// ══════════════════════════════════════════════════════════
// Session 清理 API（管理员定期调用或 Cron Trigger）
// ══════════════════════════════════════════════════════════
app.post('/api/admin/sessions/cleanup', async (c) => {
  const sessionUser = c.get('user')!
  if (sessionUser.role !== 'admin') {
    return c.json({ ok: false, error: '无权限' }, 403)
  }
  const db = c.env.DB
  const result = await cleanExpiredSessions(db)
  await logAudit(db, {
    userId: sessionUser.id, action: 'session_cleanup',
    detail: result, ipAddress: getClientIP(c),
  })
  return c.json({ ok: true, data: result })
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
registerTermsConnectRoute(app)
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
