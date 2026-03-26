// ============================================================
// 中流通 ZhongLiu Connect — Security Middleware
// P0 安全加固：Session 鉴权、登录限流、安全 Headers、IP 审计
// ============================================================

import type { Context, Next } from 'hono'
import type { HonoEnv, SessionUser, DBUser } from './types'
import { toSessionUser } from './db'

// ══════════════════════════════════════════════════════════════
// 1. Session 鉴权中间件
// 从 Cookie 中读取 zlc_session → 查 D1 sessions 表 → 注入 c.set('user')
// ══════════════════════════════════════════════════════════════

/** 解析 Cookie 中的 zlc_session */
function getSessionIdFromCookie(c: Context<HonoEnv>): string | null {
  const cookie = c.req.header('Cookie') || ''
  const match = cookie.match(/zlc_session=([^;]+)/)
  return match ? match[1] : null
}

/** 获取客户端真实 IP（支持 Cloudflare 代理） */
export function getClientIP(c: Context<HonoEnv>): string {
  return c.req.header('CF-Connecting-IP')
    || c.req.header('X-Real-IP')
    || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown'
}

/**
 * Session 鉴权中间件 — 用于需要登录的 API 路由
 * 校验 Cookie 中的 session → 查 D1 → 注入 user 到 context
 * 拒绝未登录 / session 过期 / 账号被禁用的请求
 */
export async function requireAuth(c: Context<HonoEnv>, next: Next) {
  const sessionId = getSessionIdFromCookie(c)
  if (!sessionId) {
    return c.json({ ok: false, error: '未登录，请先登录', code: 'UNAUTHENTICATED' }, 401)
  }

  const db = c.env.DB

  // 查询 session + 关联用户（一次查询搞定）
  const session = await db.prepare(`
    SELECT s.id as session_id, s.user_id, s.expires_at,
           u.id, u.phone, u.name, u.role, u.status,
           u.company, u.industry, u.title, u.bio, u.cohort,
           u.class_id, u.class_name, u.class_ids,
           u.teacher_title, u.teacher_bio, u.avatar
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).bind(sessionId).first<any>()

  if (!session) {
    // Session 不存在或已被删除 → 清除 cookie
    c.header('Set-Cookie', 'zlc_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    return c.json({ ok: false, error: '登录已失效，请重新登录', code: 'SESSION_EXPIRED' }, 401)
  }

  // 检查 session 是否过期
  if (new Date(session.expires_at) < new Date()) {
    // 过期 → 删除并拒绝
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    c.header('Set-Cookie', 'zlc_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    return c.json({ ok: false, error: '登录已过期，请重新登录', code: 'SESSION_EXPIRED' }, 401)
  }

  // 检查用户状态
  if (session.status === 'inactive') {
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    c.header('Set-Cookie', 'zlc_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    return c.json({ ok: false, error: '您的账号已被禁用', code: 'ACCOUNT_DISABLED' }, 403)
  }

  // 构造 SessionUser 并注入到 context
  const user: SessionUser = {
    id: session.user_id,
    phone: session.phone,
    name: session.name,
    role: session.role,
    status: session.status,
    company: session.company,
    industry: session.industry,
    title: session.title,
    bio: session.bio,
    cohort: session.cohort,
    class_id: session.class_id,
    class_name: session.class_name,
    class_ids: session.class_ids ? JSON.parse(session.class_ids) : null,
    teacher_title: session.teacher_title,
    teacher_bio: session.teacher_bio,
    avatar: session.avatar,
  }

  c.set('user', user)
  await next()
}

/**
 * 管理员鉴权中间件 — 在 requireAuth 之后使用
 * 确认当前用户 role === 'admin'
 */
export async function requireAdmin(c: Context<HonoEnv>, next: Next) {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ ok: false, error: '无管理员权限', code: 'FORBIDDEN' }, 403)
  }
  await next()
}

/**
 * 老师鉴权中间件 — 在 requireAuth 之后使用
 * 确认当前用户 role === 'teacher'
 */
export async function requireTeacher(c: Context<HonoEnv>, next: Next) {
  const user = c.get('user')
  if (!user || user.role !== 'teacher') {
    return c.json({ ok: false, error: '无老师权限', code: 'FORBIDDEN' }, 403)
  }
  await next()
}

// ══════════════════════════════════════════════════════════════
// 2. 登录限流中间件（Rate Limiting）
// 基于 IP 的滑动窗口限流，防暴力破解
// 使用 D1 存储限流数据（Cloudflare Workers 无内存持久化）
// ══════════════════════════════════════════════════════════════

/**
 * 登录限流：同一 IP 每分钟最多 5 次登录尝试
 * 超限后锁定 5 分钟
 */
export async function loginRateLimit(c: Context<HonoEnv>, next: Next) {
  const ip = getClientIP(c)
  const db = c.env.DB
  const now = Date.now()
  const windowMs = 60 * 1000       // 1 分钟窗口
  const maxAttempts = 5             // 最多 5 次
  const lockoutMs = 5 * 60 * 1000  // 锁定 5 分钟

  try {
    // 确保限流表存在（首次调用自动建表，生产环境应放到 migration）
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        first_attempt_at INTEGER,
        locked_until INTEGER DEFAULT 0
      )
    `).run()

    const key = `login:${ip}`
    const record = await db.prepare(
      'SELECT * FROM rate_limits WHERE key = ?'
    ).bind(key).first<{
      key: string; attempts: number; first_attempt_at: number; locked_until: number
    }>()

    // 检查是否在锁定期内
    if (record && record.locked_until > now) {
      const remainSec = Math.ceil((record.locked_until - now) / 1000)
      return c.json({
        ok: false,
        error: `登录尝试过于频繁，请 ${remainSec} 秒后再试`,
        code: 'RATE_LIMITED',
        retryAfter: remainSec,
      }, 429)
    }

    // 窗口外 → 重置计数
    if (!record || (now - record.first_attempt_at > windowMs)) {
      await db.prepare(`
        INSERT OR REPLACE INTO rate_limits (key, attempts, first_attempt_at, locked_until)
        VALUES (?, 1, ?, 0)
      `).bind(key, now).run()
    } else {
      // 窗口内 → 增加计数
      const newAttempts = record.attempts + 1
      if (newAttempts > maxAttempts) {
        // 超限 → 锁定
        await db.prepare(`
          UPDATE rate_limits SET attempts = ?, locked_until = ? WHERE key = ?
        `).bind(newAttempts, now + lockoutMs, key).run()
        return c.json({
          ok: false,
          error: '登录尝试过于频繁，已锁定 5 分钟',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil(lockoutMs / 1000),
        }, 429)
      }
      await db.prepare(`
        UPDATE rate_limits SET attempts = ? WHERE key = ?
      `).bind(newAttempts, key).run()
    }
  } catch (e) {
    // 限流系统出错不应阻止登录，记录日志但放行
    console.error('Rate limit error:', e)
  }

  await next()
}

/**
 * 登录成功后清除限流记录
 */
export async function clearLoginRateLimit(db: D1Database, ip: string) {
  try {
    await db.prepare('DELETE FROM rate_limits WHERE key = ?').bind(`login:${ip}`).run()
  } catch (e) {
    // 静默失败
  }
}

// ══════════════════════════════════════════════════════════════
// 3. 安全 Headers 中间件
// ══════════════════════════════════════════════════════════════

/**
 * 全局安全 Headers — 防 XSS、点击劫持、MIME 嗅探
 */
export async function securityHeaders(c: Context<HonoEnv>, next: Next) {
  await next()

  // 防点击劫持
  c.header('X-Frame-Options', 'DENY')
  // 防 MIME 嗅探
  c.header('X-Content-Type-Options', 'nosniff')
  // XSS 保护（旧浏览器）
  c.header('X-XSS-Protection', '1; mode=block')
  // Referrer 策略
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  // 权限策略（禁用不需要的浏览器特性）
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS（仅生产环境，强制 HTTPS）
  // Cloudflare Pages 默认已强制 HTTPS，但加上 HSTS 更保险
  if (c.req.header('CF-Visitor')) {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

// ══════════════════════════════════════════════════════════════
// 4. Session 过期清理（定期调用）
// ══════════════════════════════════════════════════════════════

/**
 * 清理过期 session（可通过 admin API 触发或 Cron Trigger）
 * 同时清理过期的限流记录
 */
export async function cleanExpiredSessions(db: D1Database): Promise<{
  deletedSessions: number
  deletedRateLimits: number
}> {
  const now = new Date().toISOString()

  // 删除过期 session
  const sessionResult = await db.prepare(
    'DELETE FROM sessions WHERE expires_at < ?'
  ).bind(now).run()

  // 删除过期限流记录（超过 1 小时的）
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const rlResult = await db.prepare(
    'DELETE FROM rate_limits WHERE first_attempt_at < ?'
  ).bind(oneHourAgo).run()

  return {
    deletedSessions: sessionResult.meta?.changes ?? 0,
    deletedRateLimits: rlResult.meta?.changes ?? 0,
  }
}

// ══════════════════════════════════════════════════════════════
// 5. API Session 验证端点（供前端 AuthCheck 使用）
// ══════════════════════════════════════════════════════════════

/**
 * 验证当前 session 是否有效
 * GET /api/auth/me → 返回当前用户信息或 401
 */
export async function verifySession(c: Context<HonoEnv>) {
  const sessionId = getSessionIdFromCookie(c)
  if (!sessionId) {
    return c.json({ ok: false, code: 'UNAUTHENTICATED' }, 401)
  }

  const db = c.env.DB
  const session = await db.prepare(`
    SELECT s.user_id, s.expires_at,
           u.id, u.phone, u.name, u.role, u.status,
           u.company, u.industry, u.title, u.bio, u.cohort,
           u.class_id, u.class_name, u.class_ids,
           u.teacher_title, u.teacher_bio, u.avatar,
           u.must_change_password
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).bind(sessionId).first<any>()

  if (!session || new Date(session.expires_at) < new Date()) {
    c.header('Set-Cookie', 'zlc_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    return c.json({ ok: false, code: 'SESSION_EXPIRED' }, 401)
  }

  if (session.status === 'inactive') {
    return c.json({ ok: false, code: 'ACCOUNT_DISABLED' }, 403)
  }

  return c.json({
    ok: true,
    user: {
      id: session.user_id,
      phone: session.phone,
      name: session.name,
      role: session.role,
      status: session.status,
      company: session.company,
      industry: session.industry,
      title: session.title,
      bio: session.bio,
      cohort: session.cohort,
      classId: session.class_id,
      className: session.class_name,
      needsPasswordChange: session.must_change_password === 1,
    },
  })
}
