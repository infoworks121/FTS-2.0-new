const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`)
  .then(r => {
    const cols = r.rows.map(c => c.column_name);
    console.log('USER COLS:', cols.join(', '));
    return pool.query(`SELECT id, email, ${cols.includes('role_id') ? 'role_id' : cols.find(c => c.includes('role'))} FROM users LIMIT 5`);
  })
  .then(r => {
    console.log('USERS:', JSON.stringify(r.rows));
    return pool.query(`SELECT o.id, o.order_number, o.customer_id, o.status, o.total_amount, o.payment_method FROM orders o ORDER BY o.created_at DESC`);
  })
  .then(r => {
    console.log('ALL ORDERS:', JSON.stringify(r.rows));
    pool.end();
  })
  .catch(e => { console.error('ERR:', e.message); pool.end(); });
