-- Migration: Add job tracking columns to user_journeys
-- Created at: 2025-09-09 13:25:53

-- Up
ALTER TABLE IF EXISTS public.user_journeys
  ADD COLUMN IF NOT EXISTS job_id TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS progress_data JSONB;

-- Optional index to speed up updates by job_id
CREATE INDEX IF NOT EXISTS idx_user_journeys_job_id ON public.user_journeys (job_id);

-- Down
-- To rollback, drop the columns (be careful, this will remove data)
-- ALTER TABLE IF EXISTS public.user_journeys
--   DROP COLUMN IF EXISTS job_id,
--   DROP COLUMN IF EXISTS error_message,
--   DROP COLUMN IF EXISTS progress_data;
