-- Table to store payment gateway configurations (Super Admin only)
CREATE TABLE IF NOT EXISTS gateway_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_name VARCHAR(50) NOT NULL UNIQUE, -- 'razorpay', 'payu', etc.
    api_key TEXT NOT NULL,
    api_secret TEXT NOT NULL, -- Should be encrypted in a real production app
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Update wallet_deposit_requests to store gateway-specific transaction details
ALTER TABLE wallet_deposit_requests 
ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS gateway_signature TEXT,
ADD COLUMN IF NOT EXISTS gateway_name VARCHAR(50);

-- Insert initial empty records for Razorpay and PayU
INSERT INTO gateway_configurations (gateway_name, api_key, api_secret, is_active, is_test_mode)
VALUES 
('razorpay', 'YOUR_RAZORPAY_KEY', 'YOUR_RAZORPAY_SECRET', false, true),
('payu', 'YOUR_PAYU_KEY', 'YOUR_PAYU_SECRET', false, true)
ON CONFLICT (gateway_name) DO NOTHING;
