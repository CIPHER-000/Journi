/*
  # Freemium Model Database Schema

  1. New Tables
    - `users` - User profiles with journey tracking
    - `user_journeys` - Individual journey records for tracking
    - `subscription_plans` - Plan definitions (free, pro, enterprise)
    - `user_subscriptions` - User subscription status

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure users can only access their own data

  3. Features
    - Journey count tracking
    - Plan-based limits
    - Upgrade flow preparation
*/

-- Users table with journey tracking
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  journey_count integer DEFAULT 0,
  plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  openai_api_key text, -- For BYOK users
  is_active boolean DEFAULT true
);

-- Individual journey records for detailed tracking
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

-- Subscription plans configuration
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  journey_limit integer, -- NULL means unlimited
  price_monthly decimal(10,2),
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User subscription status
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id text REFERENCES subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_journeys table
CREATE POLICY "Users can read own journeys"
  ON user_journeys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys"
  ON user_journeys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON user_journeys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can read active plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, journey_limit, price_monthly, features) VALUES
  ('free', 'Free Plan', 5, 0.00, '["5 journey maps", "Basic templates", "Email support"]'::jsonb),
  ('pro', 'Pro Plan', 50, 29.99, '["50 journey maps", "Advanced templates", "Priority support", "Export options"]'::jsonb),
  ('enterprise', 'Enterprise Plan', NULL, 99.99, '["Unlimited journey maps", "Custom templates", "Dedicated support", "API access", "Team collaboration"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Function to update journey count when a journey is created
CREATE OR REPLACE FUNCTION update_user_journey_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET journey_count = journey_count + 1, updated_at = now()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET journey_count = GREATEST(0, journey_count - 1), updated_at = now()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update journey count
DROP TRIGGER IF EXISTS trigger_update_journey_count ON user_journeys;
CREATE TRIGGER trigger_update_journey_count
  AFTER INSERT OR DELETE ON user_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_journey_count();