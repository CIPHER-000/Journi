-- Run this SQL in Supabase SQL Editor to add job tracking columns
-- This will enhance the database to properly track job status and errors

-- Add the new columns if they don't already exist
ALTER TABLE public.user_journeys
  ADD COLUMN IF NOT EXISTS job_id TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS progress_data JSONB;

-- Create an index on job_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_journeys_job_id 
ON public.user_journeys (job_id);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_journeys' 
  AND column_name IN ('job_id', 'error_message', 'progress_data');

-- Optional: View the table structure
-- SELECT * FROM public.user_journeys LIMIT 0;
