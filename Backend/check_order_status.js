const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOrderStatus() {
  const client = await pool.connect();
  try {
    const orderId = 'e2740545-5193-4a07-af17-564959146c32';
    const orderRes = await client.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    console.log('Order Status:', orderRes.rows[0]?.status);

    const assignments = await client.query('SELECT status FROM fulfillment_assignments WHERE order_id = $1', [orderId]);
    console.log('Fulfillment Assignments:', assignments.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkOrderStatus();
