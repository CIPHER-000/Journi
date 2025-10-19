-- Migration: Create payment_transactions table
-- Description: Stores all Paystack payment transactions for idempotency and audit trail
-- Created: 2025-01-19

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'success',
    'failed',
    'abandoned',
    'reversed'
);

-- Create enum for payment channel
CREATE TYPE payment_channel AS ENUM (
    'card',
    'bank',
    'ussd',
    'qr',
    'mobile_money',
    'bank_transfer',
    'eft'
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Paystack reference (unique identifier for idempotency)
    reference VARCHAR(255) UNIQUE NOT NULL,
    
    -- User information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    
    -- Payment details
    amount BIGINT NOT NULL, -- Amount in kobo
    currency VARCHAR(3) DEFAULT 'NGN',
    status payment_status NOT NULL DEFAULT 'pending',
    channel payment_channel,
    
    -- Plan information
    plan_type VARCHAR(50) NOT NULL, -- 'pro', 'enterprise'
    
    -- Paystack response data
    access_code VARCHAR(255),
    authorization_url TEXT,
    authorization_code VARCHAR(255),
    
    -- Gateway response
    gateway_response TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata (JSON field for additional data)
    metadata JSONB DEFAULT '{}',
    
    -- Idempotency and audit fields
    processed BOOLEAN DEFAULT FALSE, -- Whether value has been delivered
    processed_at TIMESTAMP WITH TIME ZONE,
    webhook_received_count INTEGER DEFAULT 0, -- Track duplicate webhook calls
    last_webhook_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification tracking
    verification_count INTEGER DEFAULT 0, -- Track API verify calls
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_processed ON payment_transactions(processed);
CREATE INDEX idx_payment_transactions_customer_email ON payment_transactions(customer_email);

-- Create composite index for common queries
CREATE INDEX idx_payment_transactions_user_status ON payment_transactions(user_id, status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Add RLS (Row Level Security)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY payment_transactions_select_own
    ON payment_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend)
CREATE POLICY payment_transactions_service_all
    ON payment_transactions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create view for user payment history
CREATE OR REPLACE VIEW user_payment_history AS
SELECT 
    pt.id,
    pt.reference,
    pt.amount,
    pt.currency,
    pt.status,
    pt.channel,
    pt.plan_type,
    pt.paid_at,
    pt.created_at,
    u.email as user_email,
    u.plan_type as current_plan
FROM payment_transactions pt
LEFT JOIN users u ON pt.user_id = u.id
WHERE pt.processed = TRUE
ORDER BY pt.created_at DESC;

-- Grant access to view
GRANT SELECT ON user_payment_history TO authenticated;

-- Comments for documentation
COMMENT ON TABLE payment_transactions IS 'Stores all Paystack payment transactions with idempotency tracking';
COMMENT ON COLUMN payment_transactions.reference IS 'Unique Paystack transaction reference for idempotency';
COMMENT ON COLUMN payment_transactions.processed IS 'Whether value (plan upgrade) has been delivered to user';
COMMENT ON COLUMN payment_transactions.webhook_received_count IS 'Number of times webhook was received for this transaction';
COMMENT ON COLUMN payment_transactions.verification_count IS 'Number of times verify API was called for this transaction';
