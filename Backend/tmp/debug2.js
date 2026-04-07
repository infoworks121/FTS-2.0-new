const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function main() {
  try {
    // Check orders
    const res = await pool.query(`
      SELECT o.id, o.order_number, o.customer_id, u.email, o.order_type, o.status, o.payment_method, o.total_amount
      FROM orders o 
      JOIN users u ON o.customer_id = u.id 
      ORDER BY o.created_at DESC
    `);
    
    process.stdout.write('ORDERS_COUNT:' + res.rows.length + '\n');
    res.rows.forEach(o => {
      process.stdout.write('ORDER:' + JSON.stringify(o) + '\n');
    });

    // Check users table columns
    const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' ORDER BY ordinal_position
    `);
    process.stdout.write('USER_COLS:' + cols.rows.map(c => c.column_name).join(',') + '\n');

    // Check businessmen
    const bizCol = cols.rows.find(c => c.column_name === 'role_code') ? 'role_code' : 
                   cols.rows.find(c => c.column_name === 'role') ? 'role' : 'unknown';
    process.stdout.write('ROLE_COL:' + bizCol + '\n');
    
    if (bizCol !== 'unknown') {
      const biz = await pool.query(`SELECT id, email, ${bizCol} FROM users WHERE ${bizCol} = 'businessman'`);
      biz.rows.forEach(u => {
        process.stdout.write('BIZ:' + JSON.stringify(u) + '\n');
      });
    }

  } catch (err) {
    process.stdout.write('ERROR:' + err.message + '\n');
  } finally {
    await pool.end();
  }
}

main();
