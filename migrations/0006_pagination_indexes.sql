-- ============================================================
-- Phase 2B: Additional indexes for pagination queries
-- ============================================================

-- Contracts: participant_id + signed_at for efficient paginated participant queries
CREATE INDEX IF NOT EXISTS idx_contracts_participant_signed
ON contracts(participant_id, signed_at DESC);

-- Audit logs: action + created_at for filtered + sorted pagination
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created
ON audit_logs(action, created_at DESC);

-- Repayment details: date prefix for month filtering (already using date index, this is composite)
CREATE INDEX IF NOT EXISTS idx_repayment_details_date_desc
ON repayment_details(date DESC, contract_id);

-- Notifications: composite for paginated target queries
CREATE INDEX IF NOT EXISTS idx_notifications_target_created
ON notifications(target_id, created_at DESC);
