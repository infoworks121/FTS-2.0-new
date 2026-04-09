const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE businessman_profiles ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ');
    console.log("Column last_order_at added successfully");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    pool.end();
  }
}

migrate();
