// ============================================================
// 中流通 ZhongLiu Connect — Database Access Layer
// Provides typed helpers for D1 queries
// ============================================================

import type {
  DBUser, DBProject, DBContract, DBSettlementRecord,
  DBRepaymentDetail, DBReferral, DBNotification,
  DBSettlementBatch, DBAuditLog, DBSession, DBInviteCode,
  SessionUser, ProjectWithInvestors,
  UserRole, ProjectStatus, ContractStatus
} from './types'

// ══════════════════════════════════════════════════════════════
// Password Hashing (Web Crypto API — Cloudflare Workers compatible)
// ══════════════════════════════════════════════════════════════

/** 生成密码哈希 (SHA-256 + salt) — Cloudflare Workers 兼容 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const data = new TextEncoder().encode(salt + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return `$sha256$${salt}$${hashHex}`
}

/** 验证密码 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Demo 密码兼容
  if (hash.startsWith('$demo$')) {
    return password === hash.replace('$demo$', '')
  }
  // SHA-256 hash 验证
  if (hash.startsWith('$sha256$')) {
    const parts = hash.split('$')  // ['', 'sha256', salt, hashHex]
    const salt = parts[2]
    const data = new TextEncoder().encode(salt + password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex === parts[3]
  }
  return false
}

// ══════════════════════════════════════════════════════════════
// User Helpers
// ══════════════════════════════════════════════════════════════

/** 将 DBUser 转为 SessionUser（去除敏感字段） */
export function toSessionUser(u: DBUser): SessionUser {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    role: u.role,
    status: u.status,
    company: u.company,
    industry: u.industry,
    title: u.title,
    bio: u.bio,
    cohort: u.cohort,
    class_id: u.class_id,
    class_name: u.class_name,
    class_ids: u.class_ids ? JSON.parse(u.class_ids) : null,
    teacher_title: u.teacher_title,
    teacher_bio: u.teacher_bio,
    avatar: u.avatar,
  }
}

/** 根据手机号查找用户 */
export async function getUserByPhone(db: D1Database, phone: string): Promise<DBUser | null> {
  return await db.prepare('SELECT * FROM users WHERE phone = ?').bind(phone).first<DBUser>()
}

/** 根据 ID 查找用户 */
export async function getUserById(db: D1Database, id: string): Promise<DBUser | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<DBUser>()
}

/** 获取所有活跃学员 */
export async function getActiveMembers(db: D1Database): Promise<DBUser[]> {
  const result = await db.prepare(
    "SELECT * FROM users WHERE role = 'member' AND status = 'active' ORDER BY cohort, name"
  ).all<DBUser>()
  return result.results
}

/** 获取所有老师 */
export async function getTeachers(db: D1Database): Promise<DBUser[]> {
  const result = await db.prepare(
    "SELECT * FROM users WHERE role = 'teacher' AND status = 'active'"
  ).all<DBUser>()
  return result.results
}

/** 获取指定班级的老师 */
export async function getTeacherForClass(db: D1Database, classId: string): Promise<DBUser | null> {
  // class_ids 是 JSON 数组，用 LIKE 模糊匹配
  const result = await db.prepare(
    "SELECT * FROM users WHERE role = 'teacher' AND status = 'active' AND class_ids LIKE ? LIMIT 1"
  ).bind(`%${classId}%`).first<DBUser>()
  return result
}

/** 生成新用户ID */
export async function generateUserId(db: D1Database, role: UserRole): Promise<string> {
  const prefix = role === 'teacher' ? 't' : 'm'
  const result = await db.prepare(
    `SELECT id FROM users WHERE id LIKE ? ORDER BY id DESC`
  ).bind(`${prefix}-%`).all<{ id: string }>()

  let maxNum = 0
  for (const row of result.results) {
    const parts = row.id.split('-')
    const n = parseInt(parts[1])
    if (!isNaN(n) && n > maxNum) maxNum = n
  }
  return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`
}

// ══════════════════════════════════════════════════════════════
// Project Helpers
// ══════════════════════════════════════════════════════════════

/** 获取所有项目（含投资人列表） */
export async function getProjects(db: D1Database, status?: ProjectStatus): Promise<ProjectWithInvestors[]> {
  let query = 'SELECT * FROM projects'
  const params: string[] = []
  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  query += ' ORDER BY created_at DESC'

  const result = await db.prepare(query).bind(...params).all<DBProject>()

  // 批量获取投资人
  const projects: ProjectWithInvestors[] = []
  for (const p of result.results) {
    const investors = await db.prepare(
      'SELECT investor_id FROM project_investors WHERE project_id = ?'
    ).bind(p.id).all<{ investor_id: string }>()

    projects.push({
      ...p,
      investors: investors.results.map(i => i.investor_id),
    })
  }
  return projects
}

/** 获取单个项目（含投资人） */
export async function getProjectById(db: D1Database, id: string): Promise<ProjectWithInvestors | null> {
  const p = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<DBProject>()
  if (!p) return null

  const investors = await db.prepare(
    'SELECT investor_id FROM project_investors WHERE project_id = ?'
  ).bind(id).all<{ investor_id: string }>()

  // 获取发起人信息
  const owner = await getUserById(db, p.owner_id)

  return {
    ...p,
    investors: investors.results.map(i => i.investor_id),
    owner_name: owner?.name,
    owner_company: owner?.company || undefined,
  }
}

/** 根据分享码查找项目 */
export async function getProjectByShareCode(db: D1Database, code: string): Promise<DBProject | null> {
  return await db.prepare(
    'SELECT * FROM projects WHERE share_code = ?'
  ).bind(code.toUpperCase()).first<DBProject>()
}

/** 生成新项目ID */
export async function generateProjectId(db: D1Database): Promise<string> {
  const result = await db.prepare(
    "SELECT id FROM projects ORDER BY id DESC LIMIT 1"
  ).first<{ id: string }>()
  if (!result) return 'p-001'
  const num = parseInt(result.id.split('-')[1]) + 1
  return `p-${String(num).padStart(3, '0')}`
}

// ══════════════════════════════════════════════════════════════
// Contract Helpers
// ══════════════════════════════════════════════════════════════

/** 获取项目的所有合同 */
export async function getContractsByProject(db: D1Database, projectId: string): Promise<DBContract[]> {
  const result = await db.prepare(
    'SELECT * FROM contracts WHERE project_id = ? ORDER BY signed_at DESC'
  ).bind(projectId).all<DBContract>()
  return result.results
}

/** 获取用户参与的合同（投资人视角） */
export async function getContractsByParticipant(db: D1Database, userId: string): Promise<DBContract[]> {
  const result = await db.prepare(
    'SELECT * FROM contracts WHERE participant_id = ? ORDER BY signed_at DESC'
  ).bind(userId).all<DBContract>()
  return result.results
}

/** 获取用户发起的合同（融资方视角） */
export async function getContractsByInitiator(db: D1Database, userId: string): Promise<DBContract[]> {
  const result = await db.prepare(
    'SELECT * FROM contracts WHERE initiator_id = ? ORDER BY signed_at DESC'
  ).bind(userId).all<DBContract>()
  return result.results
}

/** 获取单个合同 */
export async function getContractById(db: D1Database, id: string): Promise<DBContract | null> {
  return await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first<DBContract>()
}

/** 生成新合同ID */
export async function generateContractId(db: D1Database): Promise<string> {
  const result = await db.prepare(
    "SELECT id FROM contracts ORDER BY id DESC LIMIT 1"
  ).first<{ id: string }>()
  if (!result) return 'c-001'
  const num = parseInt(result.id.split('-')[1]) + 1
  return `c-${String(num).padStart(3, '0')}`
}

// ══════════════════════════════════════════════════════════════
// Settlement & Repayment Helpers (分账与回款)
// ══════════════════════════════════════════════════════════════

/** 获取用户的回款明细（投资人视角） */
export async function getRepaymentsByParticipant(
  db: D1Database, userId: string
): Promise<DBRepaymentDetail[]> {
  const result = await db.prepare(
    'SELECT * FROM repayment_details WHERE participant_id = ? ORDER BY date DESC'
  ).bind(userId).all<DBRepaymentDetail>()
  return result.results
}

/** 获取合同的回款明细 */
export async function getRepaymentsByContract(
  db: D1Database, contractId: string
): Promise<DBRepaymentDetail[]> {
  const result = await db.prepare(
    'SELECT * FROM repayment_details WHERE contract_id = ? ORDER BY date ASC'
  ).bind(contractId).all<DBRepaymentDetail>()
  return result.results
}

/** 获取项目的所有分账记录 */
export async function getSettlementsByProject(
  db: D1Database, projectId: string
): Promise<DBSettlementRecord[]> {
  const result = await db.prepare(
    'SELECT * FROM settlement_records WHERE project_id = ? ORDER BY settlement_date DESC'
  ).bind(projectId).all<DBSettlementRecord>()
  return result.results
}

// ══════════════════════════════════════════════════════════════
// Referral Helpers
// ══════════════════════════════════════════════════════════════

/** 获取老师收到的引荐请求 */
export async function getReferralsByTeacher(db: D1Database, teacherId: string): Promise<DBReferral[]> {
  const result = await db.prepare(
    'SELECT * FROM referrals WHERE teacher_id = ? ORDER BY created_at DESC'
  ).bind(teacherId).all<DBReferral>()
  return result.results
}

/** 获取项目的引荐记录 */
export async function getReferralsByProject(db: D1Database, projectId: string): Promise<DBReferral[]> {
  const result = await db.prepare(
    'SELECT * FROM referrals WHERE project_id = ? ORDER BY created_at DESC'
  ).bind(projectId).all<DBReferral>()
  return result.results
}

// ══════════════════════════════════════════════════════════════
// Notification Helpers
// ══════════════════════════════════════════════════════════════

/** 获取用户的通知 */
export async function getNotificationsForUser(
  db: D1Database, userId: string, role: UserRole
): Promise<DBNotification[]> {
  const result = await db.prepare(`
    SELECT * FROM notifications
    WHERE (target_id = ? OR target_id IS NULL)
      AND (target_role = ? OR target_role IS NULL)
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(userId, role).all<DBNotification>()
  return result.results
}

/** 获取未读通知数量 */
export async function getUnreadNotificationCount(
  db: D1Database, userId: string, role: UserRole
): Promise<number> {
  const result = await db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE (target_id = ? OR target_id IS NULL)
      AND (target_role = ? OR target_role IS NULL)
      AND is_read = 0
  `).bind(userId, role).first<{ count: number }>()
  return result?.count ?? 0
}

/** 创建通知 */
export async function createNotification(
  db: D1Database,
  opts: {
    type: string; title: string; content: string;
    icon?: string; link?: string;
    targetRole?: string; targetId?: string;
  }
): Promise<void> {
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  await db.prepare(`
    INSERT INTO notifications (id, type, title, content, icon, link, target_role, target_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, opts.type, opts.title, opts.content,
    opts.icon || null, opts.link || null,
    opts.targetRole || null, opts.targetId || null
  ).run()
}

// ══════════════════════════════════════════════════════════════
// Audit Log Helpers
// ══════════════════════════════════════════════════════════════

/** 记录审计日志 */
export async function logAudit(
  db: D1Database,
  opts: {
    userId?: string; action: string;
    entityType?: string; entityId?: string;
    detail?: Record<string, any>; ipAddress?: string;
  }
): Promise<void> {
  await db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, detail, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    opts.userId || null,
    opts.action,
    opts.entityType || null,
    opts.entityId || null,
    opts.detail ? JSON.stringify(opts.detail) : null,
    opts.ipAddress || null
  ).run()
}

// ══════════════════════════════════════════════════════════════
// Invite Code Helpers
// ══════════════════════════════════════════════════════════════

/** 生成随机邀请码 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉容易混淆的 I/O/0/1
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `INV-${code}`
}

/** 生成随机初始密码 */
export function generateInitialPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

/** 验证邀请码 */
export async function validateInviteCode(
  db: D1Database, code: string
): Promise<DBInviteCode | null> {
  const invite = await db.prepare(
    "SELECT * FROM invite_codes WHERE code = ? AND status = 'active'"
  ).bind(code).first<DBInviteCode>()

  if (!invite) return null

  // 检查是否过期
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    await db.prepare("UPDATE invite_codes SET status = 'expired' WHERE id = ?").bind(invite.id).run()
    return null
  }

  return invite
}

// ══════════════════════════════════════════════════════════════
// Statistics Helpers
// ══════════════════════════════════════════════════════════════

/** 平台统计概览 */
export async function getPlatformStats(db: D1Database): Promise<{
  totalMembers: number
  totalTeachers: number
  totalProjects: number
  openProjects: number
  activeProjects: number
  completedProjects: number
  totalRaised: number
  totalRepaid: number
  totalContracts: number
}> {
  const [members, teachers, projects, raised, repaid, contracts] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'member' AND status = 'active'").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'teacher' AND status = 'active'").first<{ c: number }>(),
    db.prepare("SELECT status, COUNT(*) as c FROM projects GROUP BY status").all<{ status: string; c: number }>(),
    db.prepare("SELECT SUM(raised_amount) as total FROM projects").first<{ total: number }>(),
    db.prepare("SELECT SUM(share_amount) as total FROM repayment_details WHERE arrival_status = 'arrived'").first<{ total: number }>(),
    db.prepare("SELECT COUNT(*) as c FROM contracts").first<{ c: number }>(),
  ])

  const statusMap: Record<string, number> = {}
  for (const row of projects.results) {
    statusMap[row.status] = row.c
  }

  return {
    totalMembers: members?.c ?? 0,
    totalTeachers: teachers?.c ?? 0,
    totalProjects: Object.values(statusMap).reduce((a, b) => a + b, 0),
    openProjects: statusMap['open'] ?? 0,
    activeProjects: (statusMap['active'] ?? 0) + (statusMap['funded'] ?? 0),
    completedProjects: statusMap['completed'] ?? 0,
    totalRaised: raised?.total ?? 0,
    totalRepaid: repaid?.total ?? 0,
    totalContracts: contracts?.c ?? 0,
  }
}

/** 用户投资统计 */
export async function getUserInvestmentStats(db: D1Database, userId: string): Promise<{
  initiated: number
  invested: number
  totalInvested: number
  totalRepaid: number
}> {
  const [initiated, invested, totalInvested, totalRepaid] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM projects WHERE owner_id = ?").bind(userId).first<{ c: number }>(),
    db.prepare("SELECT COUNT(DISTINCT project_id) as c FROM project_investors WHERE investor_id = ?").bind(userId).first<{ c: number }>(),
    db.prepare("SELECT SUM(amount) as total FROM contracts WHERE participant_id = ? AND status != 'pending'").bind(userId).first<{ total: number }>(),
    db.prepare("SELECT SUM(share_amount) as total FROM repayment_details WHERE participant_id = ? AND arrival_status = 'arrived'").bind(userId).first<{ total: number }>(),
  ])

  return {
    initiated: initiated?.c ?? 0,
    invested: invested?.c ?? 0,
    totalInvested: totalInvested?.total ?? 0,
    totalRepaid: totalRepaid?.total ?? 0,
  }
}
