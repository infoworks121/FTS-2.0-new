const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const adminId = process.env.SUPER_ADMIN_USER_ID || '4ac1c3c7-39fb-4d93-97f6-2a74965776e2';
  try {
    const res = await pool.query(`
      SELECT transaction_type, amount, balance_after, source_type, description, created_at
      FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [adminId]);
    console.log('Admin Transactions:', JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

run();
