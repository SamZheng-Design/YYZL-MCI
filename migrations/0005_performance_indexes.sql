-- ============================================================
-- 中流通 ZhongLiu Connect — Migration 0005
-- 性能优化：复合索引 + 缺失索引
-- Date: 2026-03-26
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 1. users — 复合索引：按角色+状态筛选（loadMembers, loadTeachers 热路径）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);

-- ═══════════════════════════════════════════════════════════
-- 2. repayment_details — 复合索引：按到账状态+日期排序（loadRepayments 热路径）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_repayment_details_arrival_date ON repayment_details(arrival_status, date DESC);

-- 复合索引：按参与人+到账状态（getUserInvestmentStats 热路径）
CREATE INDEX IF NOT EXISTS idx_repayment_details_participant_arrival ON repayment_details(participant_id, arrival_status);

-- ═══════════════════════════════════════════════════════════
-- 3. contracts — 复合索引：按参与人+状态（getUserInvestmentStats）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_contracts_participant_status ON contracts(participant_id, status);

-- ═══════════════════════════════════════════════════════════
-- 4. notifications — created_at 索引（ORDER BY created_at DESC LIMIT）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 复合索引：按目标用户/角色 + 未读状态查未读数（getUnreadNotificationCount 热路径）
CREATE INDEX IF NOT EXISTS idx_notifications_target_read ON notifications(target_id, target_role, is_read);

-- ═══════════════════════════════════════════════════════════
-- 5. settlement_records — 按日期排序（loadRevenueReports 热路径）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_settlement_records_date ON settlement_records(settlement_date DESC);

-- ═══════════════════════════════════════════════════════════
-- 6. projects — created_at 排序（loadProjects ORDER BY created_at DESC）
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
