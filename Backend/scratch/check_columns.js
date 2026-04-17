const { pool } = require('../src/config/db');

async function checkColumns() {
  try {
    console.log('--- users ---');
    const users = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log(users.rows.map(r => r.column_name).join(', '));

    console.log('--- businessman_profiles ---');
    const bp = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'businessman_profiles'");
    console.log(bp.rows.map(r => r.column_name).join(', '));

    console.log('--- core_body_profiles ---');
    const cp = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'core_body_profiles'");
    console.log(cp.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkColumns();
