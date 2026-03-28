const { pool } = require('../src/config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    
    // 1. Add missing columns to wallets table (if not exist)
    await client.query(`
      ALTER TABLE wallets 
      ADD COLUMN IF NOT EXISTS transaction_pin VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS freeze_reason TEXT;
    `);
    console.log('Wallets table updated with security columns.');

    // 2. Create wallet_deposit_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_deposit_requests (
          id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          wallet_id           UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
          amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
          payment_method      VARCHAR(50) NOT NULL,
          transaction_ref     VARCHAR(100),
          slip_url            TEXT,
          status              VARCHAR(20) DEFAULT 'pending',
          admin_note          TEXT,
          processed_by        UUID REFERENCES users(id),
          processed_at        TIMESTAMPTZ,
          created_at          TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('wallet_deposit_requests table created.');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
