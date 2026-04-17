const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkData() {
  const client = await pool.connect();
  try {
    console.log('--- Users ---');
    const users = await client.query('SELECT id, phone, email, role_code FROM users LIMIT 10');
    console.table(users.rows);

    console.log('--- Products ---');
    const products = await client.query('SELECT id, name FROM products LIMIT 5');
    console.table(products.rows);

    console.log('--- Wallets ---');
    const wallets = await client.query('SELECT w.id, u.email, w.balance FROM wallets w JOIN users u ON w.user_id = u.id LIMIT 10');
    console.table(wallets.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
