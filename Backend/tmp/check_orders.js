const db = require('../config/db');

async function checkOrders() {
  try {
    const res = await db.query('SELECT o.id, o.order_number, o.customer_id, u.email, o.order_type, o.status, o.total_amount FROM orders o JOIN users u ON o.customer_id = u.id');
    console.log('Orders found in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkOrders();
