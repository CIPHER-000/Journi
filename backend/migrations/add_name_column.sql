-- Add name column to users table for storing user's full name
-- Run this directly in Supabase SQL Editor

-- Add name column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name text;

-- Set default name for existing users (using email prefix)
UPDATE public.users 
SET name = split_part(email, '@', 1)
WHERE name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.users.name IS 'User full name for display purposes';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'name';
