const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function findUsers() {
  const client = await pool.connect();
  try {
    const roles = await client.query('SELECT id, role_code FROM user_roles');
    console.log('Roles:', roles.rows);

    const users = await client.query(`
      SELECT u.id, u.email, u.phone, ur.role_code, u.is_approved 
      FROM users u 
      JOIN user_roles ur ON u.role_id = ur.id
    `);
    console.table(users.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

findUsers();
