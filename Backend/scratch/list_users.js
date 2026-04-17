const { pool } = require('../src/config/db');

async function listUsers() {
  try {
    const res = await pool.query('SELECT u.id, u.full_name, r.role_code FROM users u JOIN user_roles r ON u.role_id = r.id LIMIT 10');
    console.log('Recent Users:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listUsers();
