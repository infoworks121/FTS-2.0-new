const { pool } = require('./src/config/db');

async function checkPending() {
  try {
    const res = await pool.query(`
      SELECT count(*) 
      FROM products p 
      JOIN users u ON p.created_by = u.id 
      WHERE u.role_code LIKE 'core_body%' AND p.approval_status = 'pending'
    `);
    console.log('Pending CoreBody Products:', res.rows[0].count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPending();
