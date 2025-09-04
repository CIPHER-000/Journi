/*
  # Complete Auth Flow Setup

  1. New Tables
    - Enhanced `users` table with proper constraints
    - `user_journeys` table for journey tracking
    - `subscription_plans` table for plan management
    - `user_subscriptions` table for user plan tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Proper foreign key constraints

  3. Functions
    - Auto-create user profile on signup
    - Update journey counts automatically
*/

-- Create subscription plans table first
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  journey_limit integer,
  price_monthly numeric(10,2),
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_plans (id, name, journey_limit, price_monthly, features, is_active) VALUES
  ('starter', 'Starter', 5, 0.00, '["5 journey maps", "Platform API key", "Basic export", "Email support"]'::jsonb, true),
  ('pro', 'Pro', null, 15.00, '["Unlimited journey maps", "Your own OpenAI API key", "Priority processing", "Advanced exports", "Usage analytics"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  journey_limit = EXCLUDED.journey_limit,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Enhanced users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  journey_count integer DEFAULT 0,
  plan_type text DEFAULT 'starter' REFERENCES subscription_plans(id),
  openai_api_key text,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  last_login timestamptz
);

-- User journeys table
CREATE TABLE IF NOT EXISTS user_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  industry text,
  status text DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  form_data jsonb,
  result_data jsonb
);

-- User subscriptions table
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
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_journeys table
CREATE POLICY "Users can read own journeys" ON user_journeys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys" ON user_journeys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON user_journeys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for subscription_plans table
CREATE POLICY "Anyone can read active plans" ON subscription_plans
  FOR SELECT TO authenticated
  USING (is_active = true);

-- RLS Policies for user_subscriptions table
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, email_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update journey count
CREATE OR REPLACE FUNCTION update_user_journey_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET journey_count = journey_count + 1, updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET journey_count = GREATEST(0, journey_count - 1), updated_at = NOW()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update email verification status
CREATE OR REPLACE FUNCTION update_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE users 
    SET email_verified = true, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

DROP TRIGGER IF EXISTS update_journey_count_trigger ON user_journeys;
CREATE TRIGGER update_journey_count_trigger
  AFTER INSERT OR DELETE ON user_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_journey_count();

DROP TRIGGER IF EXISTS update_email_verification_trigger ON auth.users;
CREATE TRIGGER update_email_verification_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_email_verification();