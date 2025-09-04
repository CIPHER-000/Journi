/*
  # Add password hash column to users table

  1. Schema Changes
    - Add `password_hash` column to `users` table for storing hashed passwords
    - This allows us to handle authentication directly without relying on Supabase Auth

  2. Security
    - Passwords will be hashed using bcrypt before storage
    - No plain text passwords stored in database
*/

-- Add password_hash column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text;
  END IF;
END $$;