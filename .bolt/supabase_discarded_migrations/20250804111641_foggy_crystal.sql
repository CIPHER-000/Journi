/*
  # Update Pricing Structure

  1. New Tables
    - Update subscription_plans with new pricing structure
    - Add user_subscriptions table for tracking subscriptions
    
  2. Security
    - Enable RLS on user_subscriptions table
    - Add policies for user access
    
  3. Changes
    - Update existing plans to match new structure
    - Add Pro plan with $15/month pricing
*/

-- Update subscription plans
DELETE FROM subscription_plans;

INSERT INTO subscription_plans (id, name, journey_limit, price_monthly, features, is_active) VALUES
('starter', 'Starter', 5, 0.00, '["5 journey maps included", "Limited to first 5 teams", "Uses platform API key", "All core features", "Export capabilities"]', true),
('pro', 'Pro', NULL, 15.00, '["Unlimited journey maps", "Bring your own OpenAI API key", "Priority processing", "Advanced export options", "Email support", "Usage analytics"]', true),
('pro_flex', 'Pro Flex', NULL, 5.00, '["Pay per journey ($5 each)", "Bring your own OpenAI API key", "No monthly commitment", "All Pro features", "Flexible usage"]', false);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id text REFERENCES subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update users table to track starter plan limit
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_starter_eligible'
  ) THEN
    ALTER TABLE users ADD COLUMN is_starter_eligible boolean DEFAULT true;
  END IF;
END $$;

-- Create function to check starter plan eligibility (first 5 teams)
CREATE OR REPLACE FUNCTION check_starter_eligibility()
RETURNS trigger AS $$
BEGIN
  -- Count existing starter users
  IF (SELECT COUNT(*) FROM users WHERE plan_type = 'starter') >= 5 THEN
    NEW.is_starter_eligible = false;
    NEW.plan_type = 'pro'; -- Force new users to Pro if starter is full
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for starter eligibility
DROP TRIGGER IF EXISTS trigger_check_starter_eligibility ON users;
CREATE TRIGGER trigger_check_starter_eligibility
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_starter_eligibility();