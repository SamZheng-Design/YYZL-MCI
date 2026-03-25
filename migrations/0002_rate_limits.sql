-- ============================================================
-- 中流通 ZhongLiu Connect — Migration: 0002_rate_limits
-- P0 安全加固：登录限流表
-- Date: 2026-03-25
-- ============================================================

-- 登录限流表（IP 维度的滑动窗口限流）
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,                 -- 'login:{ip_address}'
  attempts INTEGER DEFAULT 0,           -- 窗口内尝试次数
  first_attempt_at INTEGER,             -- 窗口开始时间（Unix ms）
  locked_until INTEGER DEFAULT 0        -- 锁定截止时间（Unix ms，0=未锁定）
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_locked ON rate_limits(locked_until);
