const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    await client.query('BEGIN');

    // Add new columns to products table
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
      ADD COLUMN IF NOT EXISTS highlights TEXT[],
      ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS return_policy_days INTEGER DEFAULT 7;
    `);
    console.log('Added new columns to products table.');

    // Remove admin_margin_pct from product_pricing
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='product_pricing' AND column_name='admin_margin_pct';
    `);

    if (checkColumn.rows.length > 0) {
      await client.query(`ALTER TABLE product_pricing DROP COLUMN admin_margin_pct;`);
      console.log('Dropped admin_margin_pct from product_pricing.');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
