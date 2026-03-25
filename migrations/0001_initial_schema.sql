-- ============================================================
-- 中流通 ZhongLiu Connect — D1 Database Schema
-- Migration: 0001_initial_schema
-- Date: 2026-03-25
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. users — 统一用户表（学员 + 管理员 + 老师）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                          -- 'm-001', 't-001', 'm-admin' 等
  phone TEXT UNIQUE NOT NULL,                   -- 手机号（登录凭证）
  name TEXT NOT NULL,                           -- 姓名
  password_hash TEXT,                           -- 密码哈希（邀请码+密码登录）
  role TEXT NOT NULL DEFAULT 'member',          -- 'member' | 'teacher' | 'admin'
  status TEXT NOT NULL DEFAULT 'active',        -- 'active' | 'inactive' | 'pending'

  -- 学员专属字段
  company TEXT,                                 -- 公司名称
  industry TEXT,                                -- 行业
  title TEXT,                                   -- 职位
  bio TEXT,                                     -- 个人简介
  cohort TEXT,                                  -- 期数显示名（如 '第12期'）
  class_id TEXT,                                -- 班级ID（如 'class-12'）
  class_name TEXT,                              -- 班级名称（如 '第12期'）

  -- 老师专属字段
  class_ids TEXT,                               -- JSON数组：负责的班级IDs ['class-12','class-14']
  teacher_title TEXT,                           -- 导师头衔（如 '战略导师'）
  teacher_bio TEXT,                             -- 导师简介
  avatar TEXT,                                  -- 头像URL

  -- 通用
  join_date TEXT,                               -- 加入日期
  must_change_password INTEGER DEFAULT 1,       -- 是否需要修改初始密码（1=是）
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class_id ON users(class_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);


-- ══════════════════════════════════════════════════════════════
-- 2. projects — 项目表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,                          -- 'p-001' 等
  name TEXT NOT NULL,                           -- 项目名称
  owner_id TEXT NOT NULL,                       -- 发起人 user_id
  industry TEXT,                                -- 行业
  description TEXT,                             -- 项目描述

  -- 融资参数
  target_amount REAL NOT NULL DEFAULT 0,        -- 目标金额（万元）
  raised_amount REAL NOT NULL DEFAULT 0,        -- 已募金额（万元）
  revenue_share_rate REAL NOT NULL DEFAULT 0,   -- 分成比例 %
  duration INTEGER NOT NULL DEFAULT 0,          -- 联营期限（月）
  recovery_multiple REAL NOT NULL DEFAULT 1.0,  -- 回收倍数
  estimated_monthly_revenue REAL DEFAULT 0,     -- 预估月收入（万元）

  -- 份额
  total_shares INTEGER NOT NULL DEFAULT 0,      -- 总份数
  raised_shares INTEGER NOT NULL DEFAULT 0,     -- 已募份数
  share_price REAL NOT NULL DEFAULT 0,          -- 每份金额（万元）
  min_shares INTEGER NOT NULL DEFAULT 1,        -- 最低参与份数

  -- 状态
  status TEXT NOT NULL DEFAULT 'draft',         -- 'draft'|'pending_review'|'open'|'funded'|'active'|'completed'|'terminated'
  review_note TEXT,                             -- 审核意见（管理员审核时填写）
  reviewed_by TEXT,                             -- 审核人 user_id
  reviewed_at TEXT,                             -- 审核时间

  -- 展示
  share_code TEXT UNIQUE,                       -- 分享码（6位大写字母数字）
  initiator_class_id TEXT,                      -- 发起人班级ID（冗余，方便查询）
  initiator_class_name TEXT,                    -- 发起人班级名称（冗余）
  recommended_by_teachers TEXT,                 -- JSON数组：推荐老师IDs
  view_count INTEGER DEFAULT 0,                 -- 浏览次数
  highlight_text TEXT,                          -- 亮点一句话
  highlights TEXT,                              -- JSON数组：亮点列表
  initiator_note TEXT,                          -- 发起人寄语

  -- 时间
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_share_code ON projects(share_code);
CREATE INDEX IF NOT EXISTS idx_projects_initiator_class_id ON projects(initiator_class_id);


-- ══════════════════════════════════════════════════════════════
-- 3. project_investors — 项目投资人关联表（多对多）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS project_investors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  investor_id TEXT NOT NULL,                    -- user_id
  created_at TEXT DEFAULT (datetime('now')),

  UNIQUE(project_id, investor_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (investor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_project_investors_project ON project_investors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_investors_investor ON project_investors(investor_id);


-- ══════════════════════════════════════════════════════════════
-- 4. contracts — 合同表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,                          -- 'c-001' 等
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,                   -- 冗余，方便展示

  -- 甲方（发起人）
  initiator_id TEXT NOT NULL,
  initiator_name TEXT NOT NULL,
  initiator_company TEXT,

  -- 乙方（参与人/投资人）
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,

  -- 商业条款
  amount REAL NOT NULL DEFAULT 0,               -- 投资金额（万元）
  shares INTEGER NOT NULL DEFAULT 0,            -- 投资份数
  revenue_share_ratio REAL NOT NULL DEFAULT 0,  -- 分成比例 %
  cooperation_term INTEGER NOT NULL DEFAULT 0,  -- 合作期限（月）
  recovery_cap REAL NOT NULL DEFAULT 0,         -- 回收上限（万元）

  -- 签署状态
  signed_by_initiator INTEGER DEFAULT 0,        -- 甲方是否已签（0/1）
  signed_by_participant INTEGER DEFAULT 0,      -- 乙方是否已签（0/1）
  signed_at TEXT,                               -- 签署完成时间

  -- 回款汇总（由分账数据导入时自动更新）
  total_repaid REAL NOT NULL DEFAULT 0,         -- 累计已回款（万元）

  -- 状态
  status TEXT NOT NULL DEFAULT 'pending',       -- 'pending'|'signed'|'active'|'completed'|'terminated'

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (initiator_id) REFERENCES users(id),
  FOREIGN KEY (participant_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_initiator ON contracts(initiator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_participant ON contracts(participant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);


-- ══════════════════════════════════════════════════════════════
-- 5. settlement_batches — 分账批次表（每次CSV导入为一个批次）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settlement_batches (
  id TEXT PRIMARY KEY,                          -- 'batch-20260325-001'
  imported_by TEXT NOT NULL,                    -- 导入操作人 user_id（管理员）
  source TEXT DEFAULT 'csv_import',             -- 'csv_import' | 'api_push' | 'manual'
  file_name TEXT,                               -- 原始文件名
  total_records INTEGER DEFAULT 0,              -- 本批次总记录数
  total_amount REAL DEFAULT 0,                  -- 本批次总分账金额（万元）
  status TEXT DEFAULT 'pending',                -- 'pending'|'confirmed'|'cancelled'
  note TEXT,                                    -- 备注
  created_at TEXT DEFAULT (datetime('now')),
  confirmed_at TEXT,

  FOREIGN KEY (imported_by) REFERENCES users(id)
);


-- ══════════════════════════════════════════════════════════════
-- 6. settlement_records — 分账记录表（项目维度，每期一条）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settlement_records (
  id TEXT PRIMARY KEY,                          -- 'sr-001'
  batch_id TEXT,                                -- 关联批次
  project_id TEXT NOT NULL,
  project_name TEXT,                            -- 冗余

  period TEXT NOT NULL,                         -- 分账期间 '2026-03'
  period_type TEXT DEFAULT 'monthly',           -- 'monthly' | 'daily'
  total_revenue REAL NOT NULL DEFAULT 0,        -- 项目本期总收入（万元）
  share_rate REAL NOT NULL DEFAULT 0,           -- 分成比例 %
  total_share_amount REAL NOT NULL DEFAULT 0,   -- 本期分成总额（万元）

  settlement_date TEXT NOT NULL,                -- 分账日期（第三方机构实际执行日期）
  source TEXT DEFAULT 'csv_import',             -- 数据来源
  external_ref TEXT,                            -- 第三方分账流水号

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (batch_id) REFERENCES settlement_batches(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_settlement_records_project ON settlement_records(project_id);
CREATE INDEX IF NOT EXISTS idx_settlement_records_period ON settlement_records(period);
CREATE INDEX IF NOT EXISTS idx_settlement_records_batch ON settlement_records(batch_id);


-- ══════════════════════════════════════════════════════════════
-- 7. repayment_details — 回款明细表（投资人维度，每条分账对应每个投资人）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS repayment_details (
  id TEXT PRIMARY KEY,                          -- 'rep-001'
  settlement_record_id TEXT NOT NULL,           -- 关联分账记录
  contract_id TEXT NOT NULL,                    -- 关联合同
  participant_id TEXT NOT NULL,                 -- 投资人 user_id

  project_name TEXT,                            -- 冗余
  date TEXT NOT NULL,                           -- 到账日期
  project_revenue REAL DEFAULT 0,               -- 项目本期收入（万元）
  share_amount REAL NOT NULL DEFAULT 0,         -- 本次分账金额（万元）
  cumulative_share REAL NOT NULL DEFAULT 0,     -- 累计已回款（万元）
  recovery_progress REAL NOT NULL DEFAULT 0,    -- 回收进度 %
  arrival_status TEXT DEFAULT 'arrived',        -- 'arrived'|'pending'|'failed'

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (settlement_record_id) REFERENCES settlement_records(id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (participant_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_repayment_details_contract ON repayment_details(contract_id);
CREATE INDEX IF NOT EXISTS idx_repayment_details_participant ON repayment_details(participant_id);
CREATE INDEX IF NOT EXISTS idx_repayment_details_settlement ON repayment_details(settlement_record_id);
CREATE INDEX IF NOT EXISTS idx_repayment_details_date ON repayment_details(date);


-- ══════════════════════════════════════════════════════════════
-- 8. referrals — 引荐记录表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,                          -- 'ref-001'
  project_id TEXT NOT NULL,
  project_name TEXT,

  requester_id TEXT NOT NULL,                   -- 请求人 user_id
  requester_name TEXT,
  requester_class TEXT,                         -- 期数（如 '第14期'）

  teacher_id TEXT NOT NULL,                     -- 被请求老师 user_id
  teacher_name TEXT,

  message TEXT,                                 -- 留言
  status TEXT NOT NULL DEFAULT 'pending',       -- 'pending'|'completed'|'connected'|'declined'
  completed_note TEXT,                          -- 完成备注
  completed_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_project ON referrals(project_id);
CREATE INDEX IF NOT EXISTS idx_referrals_requester ON referrals(requester_id);
CREATE INDEX IF NOT EXISTS idx_referrals_teacher ON referrals(teacher_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);


-- ══════════════════════════════════════════════════════════════
-- 9. notifications — 通知表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,                          -- 'n-001'
  type TEXT NOT NULL DEFAULT 'system',          -- 'system'|'participation'|'repayment'|'referral'|'review'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT,                                    -- emoji图标
  link TEXT,                                    -- 跳转链接

  target_role TEXT,                             -- 目标角色（null=所有人）
  target_id TEXT,                               -- 目标用户ID（null=广播）

  is_read INTEGER DEFAULT 0,                    -- 是否已读（0/1）
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (target_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);


-- ══════════════════════════════════════════════════════════════
-- 10. invite_codes — 邀请码表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,                    -- 邀请码（如 'INV-ABC123'）
  created_by TEXT NOT NULL,                     -- 创建人 user_id（管理员/老师）
  target_phone TEXT,                            -- 指定手机号（可选）
  target_name TEXT,                             -- 预填姓名（可选）
  target_role TEXT DEFAULT 'member',            -- 'member' | 'teacher'
  target_class_id TEXT,                         -- 预设班级ID
  target_class_name TEXT,                       -- 预设班级名称

  status TEXT DEFAULT 'active',                 -- 'active'|'used'|'expired'|'revoked'
  used_by TEXT,                                 -- 使用者 user_id
  used_at TEXT,

  expires_at TEXT,                              -- 过期时间（null=永不过期）
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (used_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_status ON invite_codes(status);


-- ══════════════════════════════════════════════════════════════
-- 11. share_logs — 分享记录表
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS share_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  sharer_id TEXT NOT NULL,
  share_type TEXT NOT NULL,                     -- 'text_copy'|'card_save'|'code_copy'|'link_copy'
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (sharer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_share_logs_project ON share_logs(project_id);


-- ══════════════════════════════════════════════════════════════
-- 12. audit_logs — 审计日志表（关键操作记录）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,                                 -- 操作人
  action TEXT NOT NULL,                         -- 操作类型
  entity_type TEXT,                             -- 'user'|'project'|'contract'|'settlement'|...
  entity_id TEXT,                               -- 操作对象ID
  detail TEXT,                                  -- JSON: 操作详情
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);


-- ══════════════════════════════════════════════════════════════
-- 13. sessions — 用户会话表（JWT + session管理）
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                          -- session token / JWT jti
  user_id TEXT NOT NULL,
  device_info TEXT,                             -- 设备信息（user-agent摘要）
  ip_address TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
