/*
  # Authentication and Usage Tracking Schema

  1. New Tables
    - `users` - Extended user profile with OpenAI API key storage
    - `token_usage` - Track OpenAI token consumption per user
    - `user_quotas` - Monthly token quotas and limits

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure API key storage with encryption
*/

-- Users table for extended profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  openai_api_key text, -- Encrypted BYOK storage
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  monthly_token_limit integer DEFAULT 10000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Token usage tracking
CREATE TABLE IF NOT EXISTS token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  model text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cost_usd decimal(10,6), -- Track estimated cost
  request_type text, -- 'journey_creation', 'agent_step', etc.
  job_id text -- Link to specific journey job
);

-- User quotas and limits
CREATE TABLE IF NOT EXISTS user_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: 'YYYY-MM'
  tokens_used integer DEFAULT 0,
  tokens_limit integer DEFAULT 10000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for token_usage table
CREATE POLICY "Users can read own token usage"
  ON token_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert token usage"
  ON token_usage
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for user_quotas table
CREATE POLICY "Users can read own quotas"
  ON user_quotas
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage quotas"
  ON user_quotas
  FOR ALL
  TO service_role
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_user_timestamp ON token_usage(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_month ON token_usage(user_id, date_trunc('month', timestamp));
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_month ON user_quotas(user_id, month_year);

-- Function to update user quotas automatically
CREATE OR REPLACE FUNCTION update_user_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(NEW.timestamp, 'YYYY-MM');
  
  INSERT INTO user_quotas (user_id, month_year, tokens_used, tokens_limit)
  VALUES (
    NEW.user_id, 
    current_month, 
    NEW.total_tokens,
    (SELECT monthly_token_limit FROM users WHERE id = NEW.user_id)
  )
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    tokens_used = user_quotas.tokens_used + NEW.total_tokens,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update quotas
CREATE TRIGGER trigger_update_user_quota
  AFTER INSERT ON token_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_user_quota();