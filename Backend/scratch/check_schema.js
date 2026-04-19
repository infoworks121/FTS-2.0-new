const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
  try {
    const tables = ['products', 'product_pricing', 'orders', 'users'];
    for (const table of tables) {
      const res = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      console.log(`${table.toUpperCase()} COLUMNS:`, res.rows.map(r => r.column_name).sort().join(', '));
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkColumns();
