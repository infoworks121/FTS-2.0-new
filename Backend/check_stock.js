const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkStock() {
  const client = await pool.connect();
  try {
    const products = await client.query('SELECT id, name, is_dealer_routed FROM products');
    console.table(products.rows);

    const stock = await client.query(`
      SELECT ib.id, p.name as product_name, ib.entity_type, ib.entity_id, ib.quantity_on_hand, ib.quantity_reserved 
      FROM inventory_balances ib 
      JOIN products p ON ib.product_id = p.id
    `);
    console.table(stock.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkStock();
