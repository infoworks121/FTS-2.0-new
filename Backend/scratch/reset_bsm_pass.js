const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgres://postgres:123456@localhost:5432/fts_db'
});

async function reset() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    const res = await pool.query('UPDATE users SET password_hash = $1 WHERE phone = $2', [hash, '9000000005']);
    console.log('Businessman password reset successfully:', res.rowCount);
  } catch (err) {
    console.error('Error during password reset:', err);
  } finally {
    await pool.end();
  }
}

reset();
