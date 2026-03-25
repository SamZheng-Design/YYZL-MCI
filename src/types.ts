// ============================================================
// 中流通 ZhongLiu Connect — Unified Type Definitions
// Maps 1:1 to D1 database schema (0001_initial_schema.sql)
// ============================================================

// ══════════════════════════════════════════════════════════════
// Cloudflare Bindings
// ══════════════════════════════════════════════════════════════
export type Bindings = {
  DB: D1Database
}

export type HonoEnv = {
  Bindings: Bindings
  Variables: {
    user?: SessionUser     // 当前登录用户（由 auth 中间件注入）
  }
}

// ══════════════════════════════════════════════════════════════
// User / Auth Types
// ══════════════════════════════════════════════════════════════
export type UserRole = 'member' | 'teacher' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'pending'

/** 数据库行 — users 表完整字段 */
export interface DBUser {
  id: string
  phone: string
  name: string
  password_hash: string | null
  role: UserRole
  status: UserStatus

  // 学员字段
  company: string | null
  industry: string | null
  title: string | null
  bio: string | null
  cohort: string | null
  class_id: string | null
  class_name: string | null

  // 老师字段
  class_ids: string | null          // JSON 数组字符串 '["class-12","class-14"]'
  teacher_title: string | null
  teacher_bio: string | null
  avatar: string | null

  // 通用
  join_date: string | null
  must_change_password: number       // 0 or 1
  created_at: string
  updated_at: string
}

/** 会话中的用户信息（轻量版，不含密码等） */
export interface SessionUser {
  id: string
  phone: string
  name: string
  role: UserRole
  status: UserStatus
  company: string | null
  industry: string | null
  title: string | null
  bio: string | null
  cohort: string | null
  class_id: string | null
  class_name: string | null
  class_ids: string[] | null        // 老师：已解析的数组
  teacher_title: string | null
  teacher_bio: string | null
  avatar: string | null
}

/** 登录请求 */
export interface LoginRequest {
  phone: string
  password: string
}

/** 登录响应 */
export interface LoginResponse {
  ok: boolean
  token?: string
  user?: SessionUser
  must_change_password?: boolean
  error?: string
}

// ══════════════════════════════════════════════════════════════
// Project Types
// ══════════════════════════════════════════════════════════════
export type ProjectStatus = 'draft' | 'pending_review' | 'open' | 'funded' | 'active' | 'completed' | 'terminated'

/** 数据库行 — projects 表完整字段 */
export interface DBProject {
  id: string
  name: string
  owner_id: string
  industry: string | null
  description: string | null

  target_amount: number
  raised_amount: number
  revenue_share_rate: number
  duration: number
  recovery_multiple: number
  estimated_monthly_revenue: number

  total_shares: number
  raised_shares: number
  share_price: number
  min_shares: number

  status: ProjectStatus
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null

  share_code: string | null
  initiator_class_id: string | null
  initiator_class_name: string | null
  recommended_by_teachers: string | null   // JSON 数组
  view_count: number
  highlight_text: string | null
  highlights: string | null                // JSON 数组
  initiator_note: string | null

  // 企业主体信息（项目级）
  company_full_name: string | null
  credit_code: string | null
  registered_address: string | null
  legal_representative: string | null
  legal_rep_type: string | null
  actual_controller: string | null
  actual_controller_id: string | null
  business_address: string | null

  // 退出条件
  annual_yield_rate: number
  exit_mode: string               // 'term_only' | 'cap_only' | 'both'

  // 风控条款
  loss_threshold_months: number | null
  loss_threshold_amount: number | null

  // 数据传输与收款
  data_transmit_mode: string | null
  report_frequency: string | null
  payment_mode: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_name: string | null
  bank_branch: string | null
  taxpayer_id: string | null

  created_at: string
  completed_at: string | null
  updated_at: string
}

/** API 返回的项目（附带投资人列表） */
export interface ProjectWithInvestors extends DBProject {
  investors: string[]                        // investor user_ids
  owner_name?: string
  owner_company?: string
}

// ══════════════════════════════════════════════════════════════
// Contract Types
// ══════════════════════════════════════════════════════════════
export type ContractStatus = 'pending' | 'signed' | 'active' | 'completed' | 'terminated'

/** 数据库行 — contracts 表 */
export interface DBContract {
  id: string
  project_id: string
  project_name: string

  initiator_id: string
  initiator_name: string
  initiator_company: string | null

  participant_id: string
  participant_name: string

  amount: number
  shares: number
  revenue_share_ratio: number
  cooperation_term: number
  recovery_cap: number

  signed_by_initiator: number     // 0 or 1
  signed_by_participant: number   // 0 or 1
  signed_at: string | null

  total_repaid: number

  // 条款通 + 退出条件
  annual_yield_rate: number
  exit_mode: string               // 'term_only' | 'cap_only' | 'both'
  end_date: string | null
  cap_multiple_at_term: number

  // 审批流
  approval_status: string         // 'draft' | 'pending_approval' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  approval_note: string | null
  terms_confirmed_at: string | null

  // 电子签约（预留）
  esign_url: string | null
  esign_status: string | null

  status: ContractStatus

  created_at: string
  updated_at: string
}

// ══════════════════════════════════════════════════════════════
// Settlement & Repayment Types (分账与回款)
// ══════════════════════════════════════════════════════════════

/** 分账批次 — settlement_batches 表 */
export interface DBSettlementBatch {
  id: string
  imported_by: string
  source: 'csv_import' | 'api_push' | 'manual'
  file_name: string | null
  total_records: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  note: string | null
  created_at: string
  confirmed_at: string | null
}

/** 分账记录（项目维度） — settlement_records 表 */
export interface DBSettlementRecord {
  id: string
  batch_id: string | null
  project_id: string
  project_name: string | null

  period: string                    // '2026-03'
  period_type: 'monthly' | 'daily'
  total_revenue: number
  share_rate: number
  total_share_amount: number

  settlement_date: string
  source: string
  external_ref: string | null

  created_at: string
}

/** 回款明细（投资人维度） — repayment_details 表 */
export interface DBRepaymentDetail {
  id: string
  settlement_record_id: string
  contract_id: string
  participant_id: string

  project_name: string | null
  date: string
  project_revenue: number
  share_amount: number
  cumulative_share: number
  recovery_progress: number
  arrival_status: 'arrived' | 'pending' | 'failed'

  created_at: string
}

// ══════════════════════════════════════════════════════════════
// Referral Types (引荐)
// ══════════════════════════════════════════════════════════════
export type ReferralStatus = 'pending' | 'completed' | 'connected' | 'declined'

export interface DBReferral {
  id: string
  project_id: string
  project_name: string | null

  requester_id: string
  requester_name: string | null
  requester_class: string | null

  teacher_id: string
  teacher_name: string | null

  message: string | null
  status: ReferralStatus
  completed_note: string | null
  completed_at: string | null

  created_at: string
  updated_at: string
}

// ══════════════════════════════════════════════════════════════
// Notification Types
// ══════════════════════════════════════════════════════════════
export type NotificationType = 'system' | 'participation' | 'repayment' | 'referral' | 'review'

export interface DBNotification {
  id: string
  type: NotificationType
  title: string
  content: string
  icon: string | null
  link: string | null
  target_role: string | null
  target_id: string | null
  is_read: number             // 0 or 1
  created_at: string
}

// ══════════════════════════════════════════════════════════════
// Invite Code Types
// ══════════════════════════════════════════════════════════════
export type InviteCodeStatus = 'active' | 'used' | 'expired' | 'revoked'

export interface DBInviteCode {
  id: number
  code: string
  created_by: string
  target_phone: string | null
  target_name: string | null
  target_role: UserRole
  target_class_id: string | null
  target_class_name: string | null
  status: InviteCodeStatus
  used_by: string | null
  used_at: string | null
  expires_at: string | null
  created_at: string
}

// ══════════════════════════════════════════════════════════════
// Audit Log Types
// ══════════════════════════════════════════════════════════════
export interface DBAuditLog {
  id: number
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  detail: string | null          // JSON
  ip_address: string | null
  created_at: string
}

// ══════════════════════════════════════════════════════════════
// Session Types
// ══════════════════════════════════════════════════════════════
export interface DBSession {
  id: string
  user_id: string
  device_info: string | null
  ip_address: string | null
  expires_at: string
  created_at: string
}

// ══════════════════════════════════════════════════════════════
// CSV Import Types (分账数据导入)
// ══════════════════════════════════════════════════════════════

/** CSV 导入的每一行解析结果 */
export interface SettlementCSVRow {
  settlement_date: string         // 分账日期 '2026-03-18'
  period: string                  // 分账期间 '2026-03'
  project_id: string              // 项目ID 'p-001'
  project_name: string            // 项目名称
  total_revenue: number           // 项目本期总收入（万元）
  share_rate: number              // 分成比例 %
  total_share_amount: number      // 本期分成总额（万元）
  participant_id: string          // 投资人ID 'm-004'
  participant_name: string        // 投资人姓名
  share_amount: number            // 应分金额（万元）
  arrival_status: string          // 到账状态
  external_ref?: string           // 第三方流水号（可选）
}

/** CSV 导入预览结果 */
export interface SettlementImportPreview {
  batch_id: string
  file_name: string
  rows: SettlementCSVRow[]
  total_records: number
  total_amount: number
  warnings: string[]               // 校验警告（项目不存在、金额异常等）
  errors: string[]                 // 严重错误（格式不对等）
}

// ══════════════════════════════════════════════════════════════
// API Response Helpers
// ══════════════════════════════════════════════════════════════
export interface APIResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}

/** 分页参数 */
export interface PaginationParams {
  page: number
  limit: number
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  ok: boolean
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
