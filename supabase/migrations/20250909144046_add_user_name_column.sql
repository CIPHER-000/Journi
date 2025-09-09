/*
  # Add user name column

  1. Changes
    - Add `name` column to users table for storing user's full name
    - Update existing users to use email prefix as default name
    
  2. Security
    - Maintains existing RLS policies
    - No changes to authentication flow
*/

-- Add name column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name text;

-- Set default name for existing users (using email prefix)
UPDATE users 
SET name = split_part(email, '@', 1)
WHERE name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.name IS 'User full name for display purposes';
