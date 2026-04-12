const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    // 1. Check profit rules
    const rules = await pool.query(`SELECT * FROM profit_rules WHERE is_current = true`);
    console.log('Profit Rules:', JSON.stringify(rules.rows, null, 2));

    // 2. Find Admin User
    const admin = await pool.query(`SELECT id, full_name, email FROM users WHERE role_code = 'admin' LIMIT 1`);
    console.log('Admin User:', JSON.stringify(admin.rows, null, 2));

    // 3. Check if Admin has a wallet
    if (admin.rows.length > 0) {
        const wallet = await pool.query(`
            SELECT w.id FROM wallets w 
            JOIN wallet_types wt ON w.wallet_type_id = wt.id
            WHERE w.user_id = $1 AND wt.type_code = 'main'
        `, [admin.rows[0].id]);
        console.log('Admin Wallet Result:', JSON.stringify(wallet.rows, null, 2));
    }

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

run();
