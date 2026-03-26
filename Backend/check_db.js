const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkDb() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      AND table_name IN ('products', 'product_pricing', 'inventory_balances', 'admin_products')
    `);
    console.log("=== TABLES ===");
    console.log(res.rows.map(r => r.table_name).join(', '));
    
    // Check columns of products table
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' 
      AND table_name='products'
    `);
    console.log("\n=== PRODUCTS TABLE ===");
    cols.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    
    // Check columns of product_pricing
    const ppCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' 
      AND table_name='product_pricing'
    `);
    console.log("\n=== PRODUCT_PRICING TABLE ===");
    ppCols.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    pool.end();
  }
}

checkDb();
