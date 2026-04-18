const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration to add missing B2B columns...');

    // 1. Update orders table
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS subdivision_id INT REFERENCES subdivisions(id) ON DELETE RESTRICT;
    `);
    console.log('[OK] Added subdivision_id to orders table.');

    // 2. Update fulfillment_assignments table
    await client.query(`
      ALTER TABLE fulfillment_assignments
      ADD COLUMN IF NOT EXISTS source_district_id INT REFERENCES districts(id) ON DELETE RESTRICT,
      ADD COLUMN IF NOT EXISTS items JSONB,
      ADD COLUMN IF NOT EXISTS is_shortage_fulfillment BOOLEAN DEFAULT FALSE;
    `);
    console.log('[OK] Updated fulfillment_assignments table (source_district_id, items, is_shortage_fulfillment).');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
