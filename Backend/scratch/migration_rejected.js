const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    await client.query('BEGIN');
    
    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
