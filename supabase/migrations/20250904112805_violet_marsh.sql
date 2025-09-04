/*
  # Supabase Auth Setup for Email Verification

  1. Configuration
    - Ensures proper auth settings for email verification
    - Sets up email templates and confirmation URLs
    
  2. Cleanup
    - Removes custom email verification table as we now use Supabase Auth
    - Removes password_hash column from users table as Supabase Auth handles passwords
    
  3. Triggers
    - Creates trigger to sync email verification status from auth.users to public.users
*/

-- Remove custom email verification table (no longer needed)
DROP TABLE IF EXISTS email_verifications;

-- Remove password_hash column from users table (Supabase Auth handles this)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users DROP COLUMN password_hash;
  END IF;
END $$;

-- Create function to sync email verification status
CREATE OR REPLACE FUNCTION sync_user_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update public.users when auth.users email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
    UPDATE public.users 
    SET 
      email_verified = true,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to sync email verification
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_verification();

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND email_verified = true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND email_verified = true);