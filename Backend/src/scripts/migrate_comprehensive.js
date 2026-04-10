const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting comprehensive migration...');
    
    // 1. Update users table
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS role_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS district_id INT REFERENCES districts(id) ON DELETE RESTRICT,
      ADD COLUMN IF NOT EXISTS subdivision_id INT REFERENCES subdivisions(id) ON DELETE RESTRICT;
    `);
    console.log('Users table updated.');

    // 2. Update businessman_profiles table
    await client.query(`
      ALTER TABLE businessman_profiles
      ADD COLUMN IF NOT EXISTS mode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS business_address TEXT,
      ADD COLUMN IF NOT EXISTS gst_number VARCHAR(15),
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(10),
      ADD COLUMN IF NOT EXISTS bank_account VARCHAR(30),
      ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(11),
      ADD COLUMN IF NOT EXISTS monthly_target NUMERIC(14,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ytd_sales NUMERIC(14,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS mtd_sales NUMERIC(14,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS commission_earned NUMERIC(14,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;
    `);
    console.log('Businessman profiles updated.');

    // 3. Update stock_point_profiles table
    await client.query(`
      ALTER TABLE stock_point_profiles
      ADD COLUMN IF NOT EXISTS warehouse_address TEXT,
      ADD COLUMN IF NOT EXISTS storage_capacity NUMERIC(14,2) DEFAULT 0;
    `);
    console.log('Stock point profiles updated.');

    // 4. Create businessman_investments if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS businessman_investments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        businessman_id UUID NOT NULL REFERENCES businessman_profiles(id) ON DELETE RESTRICT,
        installment_no SMALLINT NOT NULL CHECK (installment_no BETWEEN 1 AND 4),
        amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
        due_date DATE,
        paid_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        payment_ref TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Businessman investments table checked/created.');

    console.log('Comprehensive migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
