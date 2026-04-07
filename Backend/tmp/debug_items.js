const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Check latest orders and their items
  const orders = await pool.query(`SELECT id, order_number FROM orders ORDER BY created_at DESC LIMIT 5`);
  console.log('Latest orders:', orders.rows);

  for (const o of orders.rows) {
    const items = await pool.query(`
      SELECT oi.id, oi.product_id, oi.quantity, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [o.id]);
    console.log(`Items for ${o.order_number}:`, items.rows);
  }

  // Also test the sub-query directly
  const test = await pool.query(`
    SELECT o.order_number,
      (SELECT STRING_AGG(p.name, ', ')
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = o.id) as product_names,
      (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as total_quantity
    FROM orders o
    ORDER BY o.created_at DESC LIMIT 5
  `);
  console.log('\nSubquery test:', test.rows);

  pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
