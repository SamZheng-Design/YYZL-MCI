-- ============================================================
-- 中流通 ZhongLiu Connect — Migration 0003
-- 合同条款通升级：企业主体 / 退出条件 / 风控 / 收款 / 审批
-- Date: 2026-03-25
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. projects 表 — 新增企业主体信息（项目级）
-- ══════════════════════════════════════════════════════════════
ALTER TABLE projects ADD COLUMN company_full_name TEXT;
ALTER TABLE projects ADD COLUMN credit_code TEXT;
ALTER TABLE projects ADD COLUMN registered_address TEXT;
ALTER TABLE projects ADD COLUMN legal_representative TEXT;
ALTER TABLE projects ADD COLUMN legal_rep_type TEXT DEFAULT '法定代表人';
ALTER TABLE projects ADD COLUMN actual_controller TEXT;
ALTER TABLE projects ADD COLUMN actual_controller_id TEXT;
ALTER TABLE projects ADD COLUMN business_address TEXT;

-- ══════════════════════════════════════════════════════════════
-- 2. projects 表 — 退出条件（替代纯静态 recovery_multiple）
-- NOTE: annual_yield_rate and settlement_cycle already in 0001_initial_schema.sql
-- ══════════════════════════════════════════════════════════════
-- ALTER TABLE projects ADD COLUMN annual_yield_rate REAL DEFAULT 12.0;  -- already in 0001
ALTER TABLE projects ADD COLUMN exit_mode TEXT DEFAULT 'both';

-- ══════════════════════════════════════════════════════════════
-- 3. projects 表 — 风控条款
-- ══════════════════════════════════════════════════════════════
ALTER TABLE projects ADD COLUMN loss_threshold_months INTEGER;
ALTER TABLE projects ADD COLUMN loss_threshold_amount REAL;

-- ══════════════════════════════════════════════════════════════
-- 4. projects 表 — 数据传输与收款
-- ══════════════════════════════════════════════════════════════
ALTER TABLE projects ADD COLUMN data_transmit_mode TEXT DEFAULT '手工上报';
ALTER TABLE projects ADD COLUMN report_frequency TEXT DEFAULT '每自然月';
ALTER TABLE projects ADD COLUMN payment_mode TEXT DEFAULT '手动分账';
ALTER TABLE projects ADD COLUMN bank_account_name TEXT;
ALTER TABLE projects ADD COLUMN bank_account_number TEXT;
ALTER TABLE projects ADD COLUMN bank_name TEXT;
ALTER TABLE projects ADD COLUMN bank_branch TEXT;
ALTER TABLE projects ADD COLUMN taxpayer_id TEXT;

-- ══════════════════════════════════════════════════════════════
-- 5. contracts 表 — 条款通 + 审批流 + 电子签约
-- ══════════════════════════════════════════════════════════════
ALTER TABLE contracts ADD COLUMN annual_yield_rate REAL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN exit_mode TEXT DEFAULT 'both';
ALTER TABLE contracts ADD COLUMN end_date TEXT;
ALTER TABLE contracts ADD COLUMN cap_multiple_at_term REAL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN approval_status TEXT DEFAULT 'draft';
ALTER TABLE contracts ADD COLUMN approved_by TEXT;
ALTER TABLE contracts ADD COLUMN approved_at TEXT;
ALTER TABLE contracts ADD COLUMN approval_note TEXT;
ALTER TABLE contracts ADD COLUMN terms_confirmed_at TEXT;
ALTER TABLE contracts ADD COLUMN esign_url TEXT;
ALTER TABLE contracts ADD COLUMN esign_status TEXT;
