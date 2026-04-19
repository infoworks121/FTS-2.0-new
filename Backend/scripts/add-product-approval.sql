-- Add product approval columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- For existing products, we assume they are already approved by admin
UPDATE products SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Make 'pending' the default for future inserts (we'll handle this in code too)
ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'pending';
