const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function main() {
  try {
    console.log('\n=== ALL ORDERS ===');
    const res = await pool.query('SELECT o.id, o.order_number, o.customer_id, u.email, o.order_type, o.status, o.payment_method, o.total_amount, o.created_at FROM orders o JOIN users u ON o.customer_id = u.id ORDER BY o.created_at DESC');
    if (res.rows.length === 0) {
      console.log('❌ No orders found in the database!');
    } else {
      console.log(`✅ Found ${res.rows.length} order(s):`);
      res.rows.forEach(o => {
        console.log(`  - ${o.order_number} | ${o.email} | type: ${o.order_type} | status: ${o.status} | amount: ${o.total_amount}`);
      });
    }

    console.log('\n=== BUSINESSMEN USERS ===');
    const users = await pool.query("SELECT id, email, role_code, is_approved FROM users WHERE role_code = 'businessman'");
    users.rows.forEach(u => {
      console.log(`  - ${u.email} | id: ${u.id} | approved: ${u.is_approved}`);
    });

    console.log('\n=== WALLETS ===');
    const wallets = await pool.query(`
      SELECT w.id, w.balance, w.transaction_pin IS NOT NULL as has_pin, u.email
      FROM wallets w
      JOIN users u ON w.user_id = u.id
      WHERE u.role_code = 'businessman'
    `);
    wallets.rows.forEach(w => {
      console.log(`  - ${w.email} | balance: ${w.balance} | has_pin: ${w.has_pin}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
