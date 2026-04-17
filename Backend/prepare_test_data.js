const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function prepareData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const pin_hash = await bcrypt.hash('123456', salt);

    const emails = ['test_businessman@fts.com', 'test_dealer@fts.com'];

    for (const email of emails) {
      // Update password and approved status
      const userRes = await client.query(
        `UPDATE users SET password_hash = $1, is_approved = true, is_active = true WHERE email = $2 RETURNING id`,
        [password_hash, email]
      );

      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].id;
        
        // Update wallet balance and PIN
        await client.query(
          `UPDATE wallets SET balance = 50000, transaction_pin = $1 WHERE user_id = $2`,
          [pin_hash, userId]
        );
        
        console.log(`✅ Prepared user: ${email}`);
      } else {
        console.warn(`⚠️ User not found: ${email}`);
      }
    }

    await client.query('COMMIT');
    console.log('--- Data Preparation Complete ---');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during data preparation:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

prepareData();
