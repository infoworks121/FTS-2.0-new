const db = require('./config/db');

async function check() {
  try {
    const res = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('businessman_profiles', 'core_body_profiles')
      ORDER BY table_name, column_name;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
