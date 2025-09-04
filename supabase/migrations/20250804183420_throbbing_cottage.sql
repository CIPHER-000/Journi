/*
  # Update Auth Schema for Email Verification

  1. Schema Updates
    - Add email_verified column to users table
    - Add last_login column to users table
    - Create email_verifications table for custom verification tokens
    
  2. Security
    - Update RLS policies to check email verification
    - Add policies for email verification table
*/

-- Add email verification columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- Create email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on email_verifications
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for email verifications (only backend can access)
CREATE POLICY "Service role can manage email verifications"
  ON email_verifications
  FOR ALL
  TO service_role
  USING (true);

-- Update users RLS policies to require email verification for most operations
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND email_verified = true);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND email_verified = true);

-- Allow service role full access to users table
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true);

-- Update journey policies to require email verification
DROP POLICY IF EXISTS "Users can read own journeys" ON user_journeys;
CREATE POLICY "Users can read own journeys"
  ON user_journeys
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND email_verified = true
    )
  );

DROP POLICY IF EXISTS "Users can insert own journeys" ON user_journeys;
CREATE POLICY "Users can insert own journeys"
  ON user_journeys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND email_verified = true
    )
  );

DROP POLICY IF EXISTS "Users can update own journeys" ON user_journeys;
CREATE POLICY "Users can update own journeys"
  ON user_journeys
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND email_verified = true
    )
  );

-- Create index for email verifications
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);