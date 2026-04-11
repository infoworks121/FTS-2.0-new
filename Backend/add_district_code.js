const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateSchema() {
  const client = await pool.connect();
  try {
    console.log('Adding code column to districts table...');
    await client.query(`
      ALTER TABLE districts 
      ADD COLUMN IF NOT EXISTS code VARCHAR(10);
    `);
    console.log('Districts table updated.');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateSchema();
