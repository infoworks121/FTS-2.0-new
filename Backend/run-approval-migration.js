require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'`);
    console.log('Added approval_status column');

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT`);
    console.log('Added rejection_reason column');

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id)`);
    console.log('Added reviewed_by column');

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
    console.log('Added reviewed_at column');

    await client.query(`UPDATE products SET approval_status = 'approved' WHERE approval_status IS NULL`);
    console.log('Set existing products to approved');

    await client.query(`ALTER TABLE products ALTER COLUMN approval_status SET DEFAULT 'pending'`);
    console.log("Changed default to 'pending' for new products");

    await client.query('COMMIT');
    console.log('\nMigration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
