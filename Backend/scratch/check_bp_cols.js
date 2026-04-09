const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkBusinessProfileColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businessman_profiles'
      AND table_schema = 'public'
    `);
    console.log("=== columns in businessman_profiles ===");
    console.log(res.rows.map(r => r.column_name).sort());
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkBusinessProfileColumns();
