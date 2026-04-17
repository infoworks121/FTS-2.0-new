const { pool } = require('../src/config/db');

async function checkInstallments() {
  try {
    console.log('--- core_body_installments ---');
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'core_body_installments'");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkInstallments();
