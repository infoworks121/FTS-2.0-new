const { pool } = require('../src/config/db');

async function checkTypes() {
  try {
    const res = await pool.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('users', 'businessman_profiles', 'core_body_profiles', 'districts') AND column_name IN ('id', 'district_id')");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkTypes();
