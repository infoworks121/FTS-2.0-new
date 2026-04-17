const { pool } = require('../src/config/db');

async function findUser() {
  const id = 'fafea357-ade8-4406-be77-917c4e268319';
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    console.log('User found:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

findUser();
