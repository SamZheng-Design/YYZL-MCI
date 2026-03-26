// ============================================================
// 中流通 ZhongLiu Connect — DB Bridge Layer
// 将 D1 数据库数据转换为前端路由期望的 camelCase 格式
// 前端路由文件可以用相同的函数签名，底层从 D1 读取
// ============================================================

import type {
  DBUser, DBProject, DBContract, DBSettlementRecord,
  DBRepaymentDetail, DBReferral, DBNotification,
  SessionUser
} from './types'

// ═══════════════════════════════════════════════════════════
// Legacy interfaces — 与 data.ts 中原有接口保持一致(camelCase)
// 前端路由直接使用这些类型
// ═══════════════════════════════════════════════════════════

export interface Member {
  id: string; phone: string; name: string; company: string
  industry: string; title: string; bio: string; cohort: string
  status: 'active' | 'inactive' | 'pending'; joinDate: string
  role?: 'member' | 'admin' | 'teacher'; classId?: string; className?: string
}

export interface Teacher {
  id: string; name: string; phone: string; avatar: string | null
  classIds: string[]; role: 'teacher'; status: 'active' | 'inactive'
  title?: string; bio?: string
}

export interface Project {
  id: string; name: string; ownerId: string; industry: string
  description: string; targetAmount: number; raisedAmount: number
  revenueShareRate: number; duration: number; recoveryMultiple: number
  estimatedMonthlyRevenue: number; totalShares: number; raisedShares: number
  sharePrice: number; minShares: number
  status: 'open' | 'funded' | 'active' | 'completed' | 'draft' | 'terminated' | 'pending_review'
  createdAt: string; completedAt?: string; investors: string[]
  shareCode?: string; initiatorClassId?: string; initiatorClassName?: string
  recommendedByTeacher?: string[]; viewCount?: number
  highlightText?: string; highlights?: string[]; initiatorNote?: string
  // 企业主体
  companyFullName?: string; creditCode?: string; registeredAddress?: string
  legalRepresentative?: string; legalRepType?: string
  actualController?: string; actualControllerId?: string
  businessAddress?: string
  // 退出条件
  annualYieldRate: number; exitMode: string; settlementCycle?: string
  // 风控
  lossThresholdMonths?: number; lossThresholdAmount?: number
  // 数据传输与收款
  dataTransmitMode?: string; reportFrequency?: string; paymentMode?: string
  bankAccountName?: string; bankAccountNumber?: string
  bankName?: string; bankBranch?: string; taxpayerId?: string
}

export interface Contract {
  id: string; projectId: string; projectName: string
  initiatorId: string; initiatorName: string; initiatorCompany: string
  participantId: string; participantName: string
  amount: number; shares: number; revenueShareRatio: number
  cooperationTerm: number; recoveryCap: number
  signedByInitiator: boolean; signedByParticipant: boolean; signedAt: string
  totalRepaid: number; status: string
  // 条款通 + 退出条件
  annualYieldRate: number; exitMode: string
  endDate?: string; capMultipleAtTerm: number
  // 审批流
  approvalStatus: string; approvedBy?: string; approvedAt?: string
  approvalNote?: string; termsConfirmedAt?: string
  // 电子签约
  esignUrl?: string; esignStatus?: string
}

export interface RevenueReport {
  id: string; projectId: string; projectName: string
  period: string; totalRevenue: number; shareRate: number
  totalShareAmount: number; settlementDate: string
}

export interface RepaymentRecord {
  id: string; contractId: string; participantId: string
  projectName: string; date: string; projectRevenue: number
  shareAmount: number; cumulativeShare: number
  recoveryProgress: number; arrivalStatus: string
}

export interface Repayment {
  id: string; projectId: string; projectName: string
  investorId: string; amount: number; date: string; type: string
}

export interface Referral {
  id: string; projectId: string; projectName: string
  requesterId: string; requesterName: string; requesterClass: string
  teacherId: string; teacherName: string
  message: string; status: string
  completedNote?: string; completedAt?: string
  createdAt: string; updatedAt?: string
}

export interface Notification {
  id: string; type: string; title: string; content: string
  icon?: string; link?: string; targetRole?: string; targetId?: string
  isRead: boolean; createdAt: string
}

export interface RelationTag {
  text: string; type: 'gold' | 'green' | 'gray'
}

export interface ShareLog {
  id: string; projectId: string; sharerId: string; shareType: string; createdAt: string
}

// ═══════════════════════════════════════════════════════════
// DB → Legacy 转换函数
// ═══════════════════════════════════════════════════════════

function dbUserToMember(u: DBUser): Member {
  return {
    id: u.id, phone: u.phone, name: u.name,
    company: u.company || '', industry: u.industry || '',
    title: u.title || '', bio: u.bio || '', cohort: u.cohort || '',
    status: (u.status === 'active' ? 'active' : u.status === 'pending' ? 'pending' : 'inactive') as Member['status'],
    joinDate: u.join_date || u.created_at || '',
    role: u.role as any, classId: u.class_id || '', className: u.class_name || '',
  }
}

function dbUserToTeacher(u: DBUser): Teacher {
  return {
    id: u.id, name: u.name, phone: u.phone,
    avatar: u.avatar, role: 'teacher',
    classIds: u.class_ids ? JSON.parse(u.class_ids) : [],
    status: u.status === 'active' ? 'active' : 'inactive',
    title: u.teacher_title || '', bio: u.teacher_bio || '',
  }
}

function dbProjectToProject(p: DBProject, investors: string[]): Project {
  return {
    id: p.id, name: p.name, ownerId: p.owner_id,
    industry: p.industry || '', description: p.description || '',
    targetAmount: p.target_amount, raisedAmount: p.raised_amount,
    revenueShareRate: p.revenue_share_rate, duration: p.duration,
    recoveryMultiple: p.recovery_multiple,
    estimatedMonthlyRevenue: p.estimated_monthly_revenue,
    totalShares: p.total_shares, raisedShares: p.raised_shares,
    sharePrice: p.share_price, minShares: p.min_shares,
    status: p.status as any, createdAt: p.created_at,
    completedAt: p.completed_at || undefined, investors,
    shareCode: p.share_code || undefined,
    initiatorClassId: p.initiator_class_id || undefined,
    initiatorClassName: p.initiator_class_name || undefined,
    recommendedByTeacher: p.recommended_by_teachers ? JSON.parse(p.recommended_by_teachers) : undefined,
    viewCount: p.view_count || 0,
    highlightText: p.highlight_text || undefined,
    highlights: p.highlights ? JSON.parse(p.highlights) : undefined,
    initiatorNote: p.initiator_note || undefined,
    // 企业主体
    companyFullName: p.company_full_name || undefined,
    creditCode: p.credit_code || undefined,
    registeredAddress: p.registered_address || undefined,
    legalRepresentative: p.legal_representative || undefined,
    legalRepType: p.legal_rep_type || undefined,
    actualController: p.actual_controller || undefined,
    actualControllerId: p.actual_controller_id || undefined,
    businessAddress: p.business_address || undefined,
    // 退出条件
    annualYieldRate: p.annual_yield_rate ?? 12.0,
    exitMode: p.exit_mode || 'both',
    settlementCycle: p.settlement_cycle || 'monthly',
    expectMultiple: p.expect_multiple || undefined,
    // 风控
    lossThresholdMonths: p.loss_threshold_months || undefined,
    lossThresholdAmount: p.loss_threshold_amount || undefined,
    // 数据传输与收款
    dataTransmitMode: p.data_transmit_mode || undefined,
    reportFrequency: p.report_frequency || undefined,
    paymentMode: p.payment_mode || undefined,
    bankAccountName: p.bank_account_name || undefined,
    bankAccountNumber: p.bank_account_number || undefined,
    bankName: p.bank_name || undefined,
    bankBranch: p.bank_branch || undefined,
    taxpayerId: p.taxpayer_id || undefined,
  }
}

function dbContractToContract(c: DBContract): Contract {
  return {
    id: c.id, projectId: c.project_id, projectName: c.project_name,
    initiatorId: c.initiator_id, initiatorName: c.initiator_name,
    initiatorCompany: c.initiator_company || '',
    participantId: c.participant_id, participantName: c.participant_name,
    amount: c.amount, shares: c.shares,
    revenueShareRatio: c.revenue_share_ratio,
    cooperationTerm: c.cooperation_term, recoveryCap: c.recovery_cap,
    signedByInitiator: c.signed_by_initiator === 1,
    signedByParticipant: c.signed_by_participant === 1,
    signedAt: c.signed_at || '',
    totalRepaid: c.total_repaid, status: c.status,
    // 条款通 + 退出条件
    annualYieldRate: c.annual_yield_rate || 0,
    exitMode: c.exit_mode || 'both',
    endDate: c.end_date || undefined,
    capMultipleAtTerm: c.cap_multiple_at_term || 0,
    // 审批流
    approvalStatus: c.approval_status || 'draft',
    approvedBy: c.approved_by || undefined,
    approvedAt: c.approved_at || undefined,
    approvalNote: c.approval_note || undefined,
    termsConfirmedAt: c.terms_confirmed_at || undefined,
    // 电子签约
    esignUrl: c.esign_url || undefined,
    esignStatus: c.esign_status || undefined,
  }
}

function dbSettlementToRevenueReport(s: DBSettlementRecord): RevenueReport {
  return {
    id: s.id, projectId: s.project_id,
    projectName: s.project_name || '',
    period: s.period, totalRevenue: s.total_revenue,
    shareRate: s.share_rate, totalShareAmount: s.total_share_amount,
    settlementDate: s.settlement_date,
  }
}

function dbRepaymentToRecord(r: DBRepaymentDetail): RepaymentRecord {
  return {
    id: r.id, contractId: r.contract_id, participantId: r.participant_id,
    projectName: r.project_name || '', date: r.date,
    projectRevenue: r.project_revenue, shareAmount: r.share_amount,
    cumulativeShare: r.cumulative_share,
    recoveryProgress: r.recovery_progress,
    arrivalStatus: r.arrival_status,
  }
}

function dbReferralToReferral(r: DBReferral): Referral {
  return {
    id: r.id, projectId: r.project_id, projectName: r.project_name || '',
    requesterId: r.requester_id, requesterName: r.requester_name || '',
    requesterClass: r.requester_class || '',
    teacherId: r.teacher_id, teacherName: r.teacher_name || '',
    message: r.message || '', status: r.status,
    completedNote: r.completed_note || undefined,
    completedAt: r.completed_at || undefined,
    createdAt: r.created_at, updatedAt: r.updated_at || undefined,
  }
}

function dbNotificationToNotification(n: DBNotification): Notification {
  return {
    id: n.id, type: n.type, title: n.title, content: n.content,
    icon: n.icon || undefined, link: n.link || undefined,
    targetRole: n.target_role || undefined, targetId: n.target_id || undefined,
    isRead: n.is_read === 1, createdAt: n.created_at,
  }
}

// ═══════════════════════════════════════════════════════════
// 数据加载函数 — 替代原来的 mock 导入
// ═══════════════════════════════════════════════════════════

/** 加载所有活跃学员 (member + admin) */
export async function loadMembers(db: D1Database): Promise<Member[]> {
  const res = await db.prepare(
    "SELECT * FROM users WHERE (role = 'member' OR role = 'admin') ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, cohort, name"
  ).all<DBUser>()
  return res.results.map(dbUserToMember)
}

/** 加载所有老师 */
export async function loadTeachers(db: D1Database): Promise<Teacher[]> {
  const res = await db.prepare(
    "SELECT * FROM users WHERE role = 'teacher' AND status = 'active'"
  ).all<DBUser>()
  return res.results.map(dbUserToTeacher)
}

/** 加载所有项目（含投资人列表）— 优化：2次查询替代 N+1 */
export async function loadProjects(db: D1Database): Promise<Project[]> {
  // 查询1：所有项目
  const projRes = await db.prepare(
    'SELECT * FROM projects ORDER BY created_at DESC'
  ).all<DBProject>()

  if (projRes.results.length === 0) return []

  // 查询2：一次性获取所有 project_investors
  const invRes = await db.prepare(
    'SELECT project_id, investor_id FROM project_investors'
  ).all<{ project_id: string; investor_id: string }>()

  // JS 端按 project_id 分组
  const investorMap = new Map<string, string[]>()
  for (const inv of invRes.results) {
    const list = investorMap.get(inv.project_id)
    if (list) {
      list.push(inv.investor_id)
    } else {
      investorMap.set(inv.project_id, [inv.investor_id])
    }
  }

  return projRes.results.map(p =>
    dbProjectToProject(p, investorMap.get(p.id) || [])
  )
}

/** 加载单个项目 — 2次查询（project + investors），无 N+1 */
export async function loadProjectById(db: D1Database, id: string): Promise<Project | null> {
  // 并行查询项目和投资人
  const [p, invRes] = await Promise.all([
    db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<DBProject>(),
    db.prepare('SELECT investor_id FROM project_investors WHERE project_id = ?').bind(id).all<{ investor_id: string }>(),
  ])
  if (!p) return null
  return dbProjectToProject(p, invRes.results.map(i => i.investor_id))
}

/** 通过分享码查找项目 */
export async function loadProjectByShareCode(db: D1Database, code: string): Promise<Project | null> {
  const p = await db.prepare(
    'SELECT * FROM projects WHERE share_code = ?'
  ).bind(code.toUpperCase()).first<DBProject>()
  if (!p) return null
  const invRes = await db.prepare(
    'SELECT investor_id FROM project_investors WHERE project_id = ?'
  ).bind(p.id).all<{ investor_id: string }>()
  // share_code 查询已经是 2 次固定查询，无需优化
  return dbProjectToProject(p, invRes.results.map(i => i.investor_id))
}

/** 加载所有合同 */
export async function loadContracts(db: D1Database): Promise<Contract[]> {
  const res = await db.prepare(
    'SELECT * FROM contracts ORDER BY signed_at DESC'
  ).all<DBContract>()
  return res.results.map(dbContractToContract)
}

/** 加载项目的合同 */
export async function loadContractsByProject(db: D1Database, projectId: string): Promise<Contract[]> {
  const res = await db.prepare(
    'SELECT * FROM contracts WHERE project_id = ? ORDER BY signed_at DESC'
  ).bind(projectId).all<DBContract>()
  return res.results.map(dbContractToContract)
}

/** 加载所有分账记录 (RevenueReport) */
export async function loadRevenueReports(db: D1Database): Promise<RevenueReport[]> {
  const res = await db.prepare(
    'SELECT * FROM settlement_records ORDER BY settlement_date DESC'
  ).all<DBSettlementRecord>()
  return res.results.map(dbSettlementToRevenueReport)
}

/** 加载所有回款明细 (RepaymentRecord) — 加 LIMIT 防止数据爆炸 */
export async function loadRepaymentRecords(db: D1Database, limit: number = 500): Promise<RepaymentRecord[]> {
  const res = await db.prepare(
    'SELECT * FROM repayment_details ORDER BY date DESC LIMIT ?'
  ).bind(limit).all<DBRepaymentDetail>()
  return res.results.map(dbRepaymentToRecord)
}

/** 加载 Repayments（简化版回款列表，给首页用） */
export async function loadRepayments(db: D1Database): Promise<Repayment[]> {
  const res = await db.prepare(
    "SELECT rd.*, c.project_id FROM repayment_details rd JOIN contracts c ON rd.contract_id = c.id WHERE rd.arrival_status = 'arrived' ORDER BY rd.date DESC LIMIT 20"
  ).all<any>()
  return res.results.map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    projectName: r.project_name || '',
    investorId: r.participant_id,
    amount: r.share_amount,
    date: r.date,
    type: 'revenue_share',
  }))
}

/** 加载引荐记录 — 加 LIMIT */
export async function loadReferrals(db: D1Database, limit: number = 200): Promise<Referral[]> {
  const res = await db.prepare(
    'SELECT * FROM referrals ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all<DBReferral>()
  return res.results.map(dbReferralToReferral)
}

/** 加载通知 — 加 LIMIT 防止数据爆炸 */
export async function loadNotifications(db: D1Database, limit: number = 200): Promise<Notification[]> {
  const res = await db.prepare(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all<DBNotification>()
  return res.results.map(dbNotificationToNotification)
}

/** 加载分享记录 — 加 LIMIT 防止数据爆炸 */
export async function loadShareLogs(db: D1Database, limit: number = 200): Promise<ShareLog[]> {
  const res = await db.prepare(
    'SELECT id, project_id, sharer_id, share_type, created_at FROM share_logs ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all<any>()
  return res.results.map((s: any) => ({
    id: s.id, projectId: s.project_id, sharerId: s.sharer_id,
    shareType: s.share_type, createdAt: s.created_at,
  }))
}

// ═══════════════════════════════════════════════════════════
// Paginated Query Functions — Phase 2B
// ═══════════════════════════════════════════════════════════

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** 分页加载学员 — 支持 class_id / search / status 筛选 */
export async function loadMembersPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; classId?: string; search?: string; status?: string }
): Promise<PaginatedResult<Member>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  let where = "(role = 'member' OR role = 'admin')"
  const binds: any[] = []

  if (opts.classId) { where += ' AND class_id = ?'; binds.push(opts.classId) }
  if (opts.status) { where += ' AND status = ?'; binds.push(opts.status) }
  if (opts.search) {
    where += ' AND (name LIKE ? OR phone LIKE ? OR company LIKE ?)'
    const s = '%' + opts.search + '%'
    binds.push(s, s, s)
  }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM users WHERE ${where}`)
  const dataQ = db.prepare(
    `SELECT * FROM users WHERE ${where} ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, cohort, name LIMIT ? OFFSET ?`
  )

  // Bind params
  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = (binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset))

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<DBUser>(),
  ])

  const total = countRes?.cnt || 0
  return {
    data: dataRes.results.map(dbUserToMember),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/** 分页加载项目 — 支持 status / search 筛选 */
export async function loadProjectsPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; status?: string; search?: string; ownerId?: string }
): Promise<PaginatedResult<Project>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  let where = '1=1'
  const binds: any[] = []

  if (opts.status) { where += ' AND status = ?'; binds.push(opts.status) }
  if (opts.ownerId) { where += ' AND owner_id = ?'; binds.push(opts.ownerId) }
  if (opts.search) {
    where += ' AND (name LIKE ? OR description LIKE ? OR industry LIKE ?)'
    const s = '%' + opts.search + '%'
    binds.push(s, s, s)
  }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM projects WHERE ${where}`)
  const dataQ = db.prepare(
    `SELECT * FROM projects WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )

  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset)

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<DBProject>(),
  ])

  const total = countRes?.cnt || 0

  // Batch load investors for these projects
  if (dataRes.results.length > 0) {
    const ids = dataRes.results.map(p => p.id)
    const placeholders = ids.map(() => '?').join(',')
    const invRes = await db.prepare(
      `SELECT project_id, investor_id FROM project_investors WHERE project_id IN (${placeholders})`
    ).bind(...ids).all<{ project_id: string; investor_id: string }>()
    const investorMap = new Map<string, string[]>()
    for (const inv of invRes.results) {
      const list = investorMap.get(inv.project_id)
      if (list) list.push(inv.investor_id)
      else investorMap.set(inv.project_id, [inv.investor_id])
    }
    return {
      data: dataRes.results.map(p => dbProjectToProject(p, investorMap.get(p.id) || [])),
      total, page, limit, totalPages: Math.ceil(total / limit),
    }
  }

  return { data: [], total, page, limit, totalPages: Math.ceil(total / limit) }
}

/** 分页加载合同 — 支持 project_id / participant_id / status 筛选 */
export async function loadContractsPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; projectId?: string; participantId?: string; initiatorId?: string; status?: string }
): Promise<PaginatedResult<Contract>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  let where = '1=1'
  const binds: any[] = []

  if (opts.projectId) { where += ' AND project_id = ?'; binds.push(opts.projectId) }
  if (opts.participantId) { where += ' AND participant_id = ?'; binds.push(opts.participantId) }
  if (opts.initiatorId) { where += ' AND initiator_id = ?'; binds.push(opts.initiatorId) }
  if (opts.status) { where += ' AND status = ?'; binds.push(opts.status) }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM contracts WHERE ${where}`)
  const dataQ = db.prepare(
    `SELECT * FROM contracts WHERE ${where} ORDER BY signed_at DESC LIMIT ? OFFSET ?`
  )

  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset)

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<DBContract>(),
  ])

  const total = countRes?.cnt || 0
  return {
    data: dataRes.results.map(dbContractToContract),
    total, page, limit, totalPages: Math.ceil(total / limit),
  }
}

/** 分页加载回款明细 — 支持 contract_id / participant_id / month / project_id 筛选 */
export async function loadRepaymentRecordsPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; contractId?: string; participantId?: string; month?: string; projectId?: string }
): Promise<PaginatedResult<RepaymentRecord>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  // For month and project_id filtering, we need to JOIN contracts
  const needJoin = !!opts.month || !!opts.projectId
  const from = needJoin
    ? 'repayment_details rd JOIN contracts c ON rd.contract_id = c.id'
    : 'repayment_details rd'

  let where = '1=1'
  const binds: any[] = []

  if (opts.contractId) { where += ' AND rd.contract_id = ?'; binds.push(opts.contractId) }
  if (opts.participantId) { where += ' AND rd.participant_id = ?'; binds.push(opts.participantId) }
  if (opts.month) {
    // month format: '2026-03' → filter by date LIKE '2026-03%'
    where += ' AND rd.date LIKE ?'
    binds.push(opts.month + '%')
  }
  if (opts.projectId) { where += ' AND c.project_id = ?'; binds.push(opts.projectId) }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM ${from} WHERE ${where}`)
  const dataQ = db.prepare(
    `SELECT rd.* FROM ${from} WHERE ${where} ORDER BY rd.date DESC LIMIT ? OFFSET ?`
  )

  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset)

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<DBRepaymentDetail>(),
  ])

  const total = countRes?.cnt || 0
  return {
    data: dataRes.results.map(dbRepaymentToRecord),
    total, page, limit, totalPages: Math.ceil(total / limit),
  }
}

/** 分页加载通知 — 支持 target_id 筛选 */
export async function loadNotificationsPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; targetId?: string; targetRole?: string; unreadOnly?: boolean }
): Promise<PaginatedResult<Notification>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  let where = '1=1'
  const binds: any[] = []

  if (opts.targetId) { where += ' AND (target_id = ? OR target_id = ?)'; binds.push(opts.targetId, 'all') }
  if (opts.targetRole) { where += ' AND (target_role = ? OR target_role = ?)'; binds.push(opts.targetRole, 'all') }
  if (opts.unreadOnly) { where += ' AND is_read = 0' }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM notifications WHERE ${where}`)
  const dataQ = db.prepare(
    `SELECT * FROM notifications WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )

  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset)

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<DBNotification>(),
  ])

  const total = countRes?.cnt || 0
  return {
    data: dataRes.results.map(dbNotificationToNotification),
    total, page, limit, totalPages: Math.ceil(total / limit),
  }
}

/** 分页加载审计日志 */
export async function loadAuditLogsPaginated(
  db: D1Database,
  opts: { page?: number; limit?: number; action?: string; userId?: string }
): Promise<PaginatedResult<any>> {
  const page = Math.max(1, opts.page || 1)
  const limit = Math.min(100, Math.max(1, opts.limit || 20))
  const offset = (page - 1) * limit

  let where = '1=1'
  const binds: any[] = []
  if (opts.action) { where += ' AND action = ?'; binds.push(opts.action) }
  if (opts.userId) { where += ' AND user_id = ?'; binds.push(opts.userId) }

  const countQ = db.prepare(`SELECT COUNT(*) as cnt FROM audit_logs WHERE ${where}`)
  const dataQ = db.prepare(`SELECT * FROM audit_logs WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)

  const countStmt = binds.length > 0 ? countQ.bind(...binds) : countQ
  const dataStmt = binds.length > 0 ? dataQ.bind(...binds, limit, offset) : dataQ.bind(limit, offset)

  const [countRes, dataRes] = await Promise.all([
    countStmt.first<{ cnt: number }>(),
    dataStmt.all<any>(),
  ])

  const total = countRes?.cnt || 0
  return {
    data: (dataRes.results || []).map((l: any) => ({
      id: l.id, userId: l.user_id, action: l.action, entityType: l.entity_type,
      entityId: l.entity_id, detail: l.detail, createdAt: l.created_at,
    })),
    total, page, limit, totalPages: Math.ceil(total / limit),
  }
}

/** 获取回款月份列表（去重） */
export async function getRepaymentMonths(db: D1Database): Promise<string[]> {
  const res = await db.prepare(
    "SELECT DISTINCT substr(date, 1, 7) as month FROM repayment_details ORDER BY month DESC"
  ).all<{ month: string }>()
  return res.results.map(r => r.month)
}

/** 获取有回款的项目列表（用于筛选） */
export async function getRepaymentProjects(db: D1Database): Promise<{ id: string; name: string }[]> {
  const res = await db.prepare(
    "SELECT DISTINCT c.project_id as id, p.name FROM repayment_details rd JOIN contracts c ON rd.contract_id = c.id JOIN projects p ON c.project_id = p.id ORDER BY p.name"
  ).all<{ id: string; name: string }>()
  return res.results
}

// ═══════════════════════════════════════════════════════════
// 工具函数 — 替代 data.ts 中的纯函数
// ═══════════════════════════════════════════════════════════

export function getTeacherForMember(member: Member, teachers: Teacher[]): Teacher | null {
  if (!member.classId) return null
  return teachers.find(t => t.classIds.includes(member.classId!)) || null
}

export function isSameClass(memberA: Member, memberB: Member): boolean {
  return !!(memberA.classId && memberB.classId && memberA.classId === memberB.classId)
}

export function getRelationTag(
  project: Project, currentUser: { classId?: string }, teachers: Teacher[]
): RelationTag {
  const myTeacher = currentUser.classId
    ? teachers.find(t => t.classIds.includes(currentUser.classId!))
    : null
  if (myTeacher && project.recommendedByTeacher && project.recommendedByTeacher.includes(myTeacher.id)) {
    return { text: '🌟 老师推荐', type: 'gold' }
  }
  if (project.initiatorClassId && project.initiatorClassId === currentUser.classId) {
    return { text: '同班 · ' + (project.initiatorClassName || ''), type: 'green' }
  }
  return { text: project.initiatorClassName || '', type: 'gray' }
}

export function getRelevanceScore(
  project: Project, currentUser: { classId?: string }, myTeacher: Teacher | null
): number {
  let score = 0
  if (project.initiatorClassId === currentUser.classId) score += 30
  if (myTeacher && project.recommendedByTeacher?.includes(myTeacher.id)) score += 50
  if (project.status === 'open') score += 10
  return score
}

export interface RBFResult {
  recoveryCap: number; monthlyShare: number; paybackMonths: number
}

export function calculateRBF(
  totalAmount: number, revenueShareRate: number,
  estimatedMonthlyRevenue: number, recoveryMultiple: number
): RBFResult {
  const recoveryCap = totalAmount * recoveryMultiple
  const monthlyShare = estimatedMonthlyRevenue * (revenueShareRate / 100)
  const paybackMonths = monthlyShare > 0 ? Math.ceil(totalAmount / monthlyShare) : 0
  return { recoveryCap, monthlyShare, paybackMonths }
}

export interface DistributionResult {
  contractId: string; participantId: string; participantName: string
  investAmount: number; shareAmount: number
  newCumulative: number; recoveryProgress: number; isCompleted: boolean
}

export function distributeRevenue(
  projectRevenue: number, revenueShareRatio: number, contracts: Contract[]
): DistributionResult[] {
  const totalShareAmount = projectRevenue * (revenueShareRatio / 100)
  const totalInvested = contracts.reduce((s, c) => s + c.amount, 0)
  return contracts.map(c => {
    const ratio = c.amount / totalInvested
    let share = +(totalShareAmount * ratio).toFixed(4)
    const newCumulative = +(c.totalRepaid + share).toFixed(4)
    if (newCumulative > c.recoveryCap) {
      share = +(c.recoveryCap - c.totalRepaid).toFixed(4)
      if (share < 0) share = 0
    }
    return {
      contractId: c.id, participantId: c.participantId,
      participantName: c.participantName, investAmount: c.amount,
      shareAmount: share, newCumulative: +(c.totalRepaid + share).toFixed(4),
      recoveryProgress: +((c.totalRepaid + share) / c.recoveryCap * 100).toFixed(2),
      isCompleted: (c.totalRepaid + share) >= c.recoveryCap,
    }
  })
}

/** 项目大厅统计 */
export function getProjectStats(projects: Project[], repayments: Repayment[]) {
  const openCount = projects.filter(p => p.status === 'open').length
  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'funded').length
  const totalRaised = projects.reduce((s, p) => s + p.raisedAmount, 0)
  const totalRepaid = repayments.reduce((s, r) => s + r.amount, 0)
  return {
    openCount, activeCount,
    totalRaised: Math.round(totalRaised),
    totalRepaid: Math.round(totalRepaid * 100) / 100,
  }
}

/** 用户统计 */
export function getUserStats(
  userId: string, projects: Project[],
  contracts: Contract[], repaymentRecords: RepaymentRecord[]
) {
  const initiated = projects.filter(p => p.ownerId === userId).length
  const invested = projects.filter(p => p.investors.includes(userId)).length
  const totalInvested = contracts
    .filter(c => c.participantId === userId && c.status !== 'pending')
    .reduce((s, c) => s + c.amount, 0)
  const totalRepaid = repaymentRecords
    .filter(r => r.participantId === userId && r.arrivalStatus === 'arrived')
    .reduce((s, r) => s + r.shareAmount, 0)
  return {
    initiated, invested, totalInvested,
    totalRepaid: Math.round(totalRepaid * 100) / 100,
  }
}

/** 合同全文生成 — 适配滴灌通联营协议退出条件 */
export function generateContractHTML(
  contract: Contract, project: Project,
  participant: Member | null, initiator: Member | null
): string {
  const cId = contract.id || ''
  const investmentAmount = contract.amount || 0
  const sharePercentage = contract.revenueShareRatio || 0
  const recoveryCap = contract.recoveryCap || 0
  const signedAt = contract.signedAt || '—'
  const pName = project.name || ''
  const pDesc = project.description || ''
  const revenueShareRate = project.revenueShareRate || 0
  const termMonths = contract.cooperationTerm || project.duration || 0
  const descTruncated = pDesc.length > 100 ? pDesc.substring(0, 100) + '...' : pDesc
  const iName = initiator ? initiator.name : (contract.initiatorName || '发起人')
  const iCompany = project.companyFullName || (initiator ? (initiator.company || '') : (contract.initiatorCompany || ''))
  const iClassName = initiator ? (initiator.className || '') : ''
  const pName2 = participant ? participant.name : (contract.participantName || '参与人')
  const pCompany = participant ? (participant.company || '') : ''
  const pClassName = participant ? (participant.className || '') : ''

  // 退出条件
  const annualYieldRate = contract.annualYieldRate || project.annualYieldRate || 12
  const exitMode = contract.exitMode || project.exitMode || 'both'
  const settlementCycle = project.settlementCycle || 'monthly'
  const basisLabel = settlementCycle === 'weekly' ? '周' : settlementCycle === 'daily' ? '日' : '月'
  const flatRatePct = settlementCycle === 'weekly' ? annualYieldRate / 52 : settlementCycle === 'daily' ? annualYieldRate / 365 : annualYieldRate / 12
  let capPeriods = termMonths
  if (settlementCycle === 'weekly') capPeriods = Math.ceil(termMonths * 4.33)
  if (settlementCycle === 'daily') capPeriods = Math.ceil(termMonths * 30.42)
  const capMultiple = contract.capMultipleAtTerm || (investmentAmount > 0 ? (investmentAmount + investmentAmount * flatRatePct / 100 * capPeriods) / investmentAmount : 1)
  const endDate = contract.endDate || '—'

  // 企业信息
  const companyFull = project.companyFullName || iCompany || '—'
  const creditCode = project.creditCode || '—'
  const legalRep = project.legalRepresentative || iName
  const legalRepType = project.legalRepType || '法定代表人'
  const regAddr = project.registeredAddress || '—'
  const bizAddr = project.businessAddress || regAddr

  // 退出条件文本
  let exitClause = ''
  const capFormulaText = `本金 + 本金 × ${basisLabel}平息${flatRatePct.toFixed(3)}% × ${capPeriods}${basisLabel} = ${recoveryCap}万元（等效${capMultiple.toFixed(2)}倍）`
  if (exitMode === 'term_only') {
    exitClause = `联营期限届满（${termMonths}个月，即${endDate}）时，本协议自动终止，无论乙方是否已收回全部投资。`
  } else if (exitMode === 'cap_only') {
    exitClause = `当乙方累计分成金额达到人民币 ${recoveryCap} 万元时，收入分成自动终止，无期限限制。<br/>封顶计算：${capFormulaText}`
  } else {
    exitClause = `以下两个条件以先满足者为准终止合同：<br/>（1）期限到期：联营期限${termMonths}个月届满（即${endDate}）；<br/>（2）封顶回收：乙方累计分成金额达到人民币 ${recoveryCap} 万元。<br/>封顶计算：${capFormulaText}`
  }

  return `<div style="font-family:'SimSun','Songti SC',serif;color:#1C1917;line-height:1.8;font-size:14px;">
  <div style="text-align:center;padding-bottom:24px;border-bottom:2px solid #B91C1C;">
    <div style="font-size:11px;color:#A8A29E;letter-spacing:2px;">合同编号：${cId}</div>
    <div style="font-size:22px;font-weight:800;color:#B91C1C;margin-top:12px;letter-spacing:4px;">联合经营协议</div>
    <div style="font-size:12px;color:#78716C;margin-top:6px;">（收入分成模式 · 滴灌通联营）</div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:12px;">签署各方</div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#B91C1C;font-weight:600;">甲方（联营方 / 项目发起人）</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">${companyFull}</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">统一社会信用代码：${creditCode}</div>
      <div style="font-size:12px;color:#78716C;">${legalRepType}：${legalRep}</div>
      <div style="font-size:12px;color:#78716C;">注册地址：${regAddr}</div>
    </div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#3B82F6;font-weight:600;">乙方（投资参与人）</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">${pName2}</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">${pCompany}${pClassName ? ' · ' + pClassName : ''}</div>
    </div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;">
      <div style="font-size:12px;color:#D4A853;font-weight:600;">平台见证方</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">中流通平台</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">滴灌通 × 一亿中流 · 联合出品</div>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:8px;">鉴于</div>
    <div style="font-size:13px;color:#57534E;">甲方经营${pName}相关业务（经营地址：${bizAddr}），乙方拟通过收入分成的联合经营方式参与该项目。各方经友好协商，根据中国相关法律法规，就联营合作达成一致，特订立如下条款。</div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第一条 联营合作商业安排</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;width:35%;">项目名称</td><td style="padding:10px 0;font-weight:600;">${pName}</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">甲方企业全称</td><td style="padding:10px 0;font-weight:600;">${companyFull}</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">联营资金金额</td><td style="padding:10px 0;font-weight:600;color:#B91C1C;">人民币 ${investmentAmount} 万元整</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">固定分成比例</td><td style="padding:10px 0;font-weight:600;">${sharePercentage}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">项目总分成比例</td><td style="padding:10px 0;font-weight:600;">${revenueShareRate}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">联营期限</td><td style="padding:10px 0;font-weight:600;">${termMonths} 个月（至 ${endDate}）</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">年化收益率</td><td style="padding:10px 0;font-weight:600;">${annualYieldRate}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">平息口径</td><td style="padding:10px 0;font-weight:600;">${basisLabel}平息 ${flatRatePct.toFixed(3)}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">等效封顶倍数</td><td style="padding:10px 0;font-weight:600;">${capMultiple.toFixed(2)} 倍</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">回收上限金额</td><td style="padding:10px 0;font-weight:600;color:#B91C1C;">人民币 ${recoveryCap} 万元</td></tr>
      <tr><td style="padding:10px 0;color:#78716C;">联营资金用途</td><td style="padding:10px 0;">${descTruncated}</td></tr>
    </table>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第二条 收入分成期间与退出条件</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>2.1 分成起始日：</strong>自本协议签署之日起计算。</p>
      <p style="margin-bottom:8px;"><strong>2.2 分成方式：</strong>甲方应按约定频率向平台上报项目营业收入，平台根据乙方投资占比（${sharePercentage}%）自动计算乙方应得的分成金额，并进行分配。</p>
      <p style="margin-bottom:8px;"><strong>2.3 退出条件（分成终止触发条件）：</strong></p>
      <div style="background:#FEF2F2;border-radius:8px;padding:12px;margin:8px 0 12px;border-left:3px solid #B91C1C;">
        ${exitClause}
      </div>
      <p style="margin-bottom:8px;"><strong>2.4 封顶计算说明：</strong>回收上限金额 = 联营资金 + 联营资金 × ${basisLabel}平息(${flatRatePct.toFixed(3)}%) × 占用${basisLabel}数(${capPeriods}${basisLabel})。当联营期限为${termMonths}个月时，等效封顶倍数约为 ${capMultiple.toFixed(2)} 倍。</p>
      <p style="margin-bottom:8px;"><strong>2.5 联营方收入定义：</strong>指甲方就本项目扣除所有税项及费用前的全部营业收入（包含主营业务收入及其他业务收入）。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第三条 各方权利义务</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>3.1 甲方义务：</strong>（1）按时、如实上报项目营业收入；（2）确保收入数据真实、准确、完整；（3）不得挪用联营资金；（4）如发生影响项目运营的重大事项，应在 5 个自然日内书面通知平台及乙方。</p>
      <p style="margin-bottom:8px;"><strong>3.2 乙方义务：</strong>（1）按本协议约定支付联营资金；（2）配合完成电子签署流程；（3）理解并接受收入分成模式的风险特征。</p>
      <p style="margin-bottom:8px;"><strong>3.3 平台义务：</strong>（1）提供合同生成与电子签署服务；（2）提供收入上报与回款分配的技术支持；（3）提供项目全生命周期的数据追踪服务；（4）合同文件托管与存证。</p>
      <p style="margin-bottom:8px;"><strong>3.4 经营独立性：</strong>甲方负责项目的日常经营并以自身名义对外经营，乙方不参与甲方的日常经营决策。本协议不构成各方之间的合伙、合资、代理或借贷关系。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第四条 提前终止与补偿</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>4.1 提前终止补偿：</strong>提前终止补偿金 = 当前联营资金 + (当前联营资金 × ${basisLabel}平息${flatRatePct.toFixed(3)}% × (已占用${basisLabel}数 + 1${basisLabel}))。</p>
      <p style="margin-bottom:8px;"><strong>4.2 严重违约：</strong>如甲方出现挪用资金、虚报收入、擅自终止经营等严重违约情形，乙方有权要求退还全部联营资金，并要求支付联营资金 20% 的违约金。</p>
      <p style="margin-bottom:8px;"><strong>4.3 自动终止：</strong>当退出条件满足时（见第二条），本协议自动终止。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第五条 陈述、保证与其他</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>5.1</strong> 各方均具有适当的法律资格和法律能力签署、交付并履行本协议。</p>
      <p style="margin-bottom:8px;"><strong>5.2</strong> 甲方保证其合法合规经营，已取得经营业务所需的全部批准、许可及政府授权。</p>
      <p style="margin-bottom:8px;"><strong>5.3 保密：</strong>未经披露方书面同意，任何一方不得向第三方披露本协议内容。</p>
      <p style="margin-bottom:8px;"><strong>5.4 争议解决：</strong>因本协议引起的争议，各方应友好协商解决；协商不成的，提交深圳国际仲裁院仲裁。</p>
      <p style="margin-bottom:8px;"><strong>5.5 协议效力：</strong>本协议自各方电子签署后生效，具有同等法律效力。</p>
    </div>
  </div>
  <div style="margin-top:32px;border-top:1px solid #E7E5E4;padding-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:16px;">签署确认</div>
    <div style="display:flex;gap:16px;">
      <div style="flex:1;background:#FAFAF9;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#78716C;">甲方（联营方）</div>
        <div style="font-size:14px;font-weight:600;margin-top:8px;">${companyFull}</div>
        <div style="font-size:12px;color:#78716C;margin-top:4px;">${legalRepType}：${legalRep}</div>
        <div style="margin-top:12px;border-bottom:1px solid #D6D3D1;padding-bottom:4px;">
          <span style="font-size:11px;color:#A8A29E;">签字：</span>
          <span style="font-size:14px;font-weight:600;color:#B91C1C;font-style:italic;">${iName}</span>
        </div>
        <div style="font-size:11px;color:#A8A29E;margin-top:6px;">签署日期：${signedAt}</div>
      </div>
      <div style="flex:1;background:#FAFAF9;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#78716C;">乙方（投资参与人）</div>
        <div style="font-size:14px;font-weight:600;margin-top:8px;">${pName2}</div>
        <div style="font-size:12px;color:#78716C;margin-top:4px;">${pCompany}</div>
        <div style="margin-top:12px;border-bottom:1px solid #D6D3D1;padding-bottom:4px;">
          <span style="font-size:11px;color:#A8A29E;">签字：</span>
          <span style="font-size:14px;font-weight:600;color:#3B82F6;font-style:italic;">${pName2}</span>
        </div>
        <div style="font-size:11px;color:#A8A29E;margin-top:6px;">签署日期：${signedAt}</div>
      </div>
    </div>
    <div style="margin-top:12px;background:#FAFAF9;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:12px;color:#78716C;">平台见证</div>
      <div style="font-size:14px;font-weight:600;margin-top:4px;">中流通平台 · 滴灌通 × 一亿中流</div>
      <div style="margin-top:8px;">
        <span style="display:inline-block;width:48px;height:48px;border-radius:50%;border:2px solid #B91C1C;line-height:48px;text-align:center;font-size:11px;color:#B91C1C;font-weight:700;">见证章</span>
      </div>
    </div>
  </div>
  <div style="margin-top:24px;text-align:center;font-size:11px;color:#A8A29E;">
    <div>本协议一式两份，甲乙双方各执一份，具有同等法律效力</div>
    <div style="margin-top:4px;">中流通平台提供电子签署与合同托管服务</div>
  </div>
</div>`
}
