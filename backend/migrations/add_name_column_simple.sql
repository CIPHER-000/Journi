-- Simple SQL to add name column to users table
-- Create a new query in Supabase SQL Editor and paste this

-- Step 1: Add the name column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name text;

-- Step 2: Set default names for existing users
UPDATE public.users 
SET name = split_part(email, '@', 1)
WHERE name IS NULL;

-- Step 3: Verify the change
SELECT id, email, name 
FROM public.users 
LIMIT 5;
