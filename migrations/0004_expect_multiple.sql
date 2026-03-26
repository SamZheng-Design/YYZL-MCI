-- Add expect_multiple column for term_only exit mode
ALTER TABLE projects ADD COLUMN expect_multiple REAL DEFAULT NULL;
