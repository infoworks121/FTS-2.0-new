const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration to add missing columns to users table...');
    
    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS role_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS district_id INT REFERENCES districts(id) ON DELETE RESTRICT,
      ADD COLUMN IF NOT EXISTS subdivision_id INT REFERENCES subdivisions(id) ON DELETE RESTRICT;
    `);
    
    console.log('Migration successful: Columns added to users table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
