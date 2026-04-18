const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgres://postgres:123456@localhost:5432/fts_db"
});

async function debug() {
  try {
    const userRes = await pool.query(`
      SELECT u.id, u.full_name, r.role_code 
      FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.full_name ILIKE '%Raja cable%'
    `);
    if (userRes.rows.length === 0) {
      console.log("User not found");
      return;
    }
    const userId = userRes.rows[0].id;
    const roleCode = userRes.rows[0].role_code;
    console.log(`Found User: ${userRes.rows[0].full_name} (${userId}) - Role: ${roleCode}`);

    const bizRes = await pool.query(`
      SELECT bp.id, bp.type, bp.advance_amount, bp.is_active, bi.amount, bi.status 
      FROM businessman_profiles bp 
      LEFT JOIN businessman_investments bi ON bp.id = bi.businessman_id 
      WHERE bp.user_id = $1
    `, [userId]);
    console.log("Businessman Data:", bizRes.rows);

    const cbRes = await pool.query(`
      SELECT cbp.id, cbp.investment_amount, cbp.is_active, cbi.amount, cbi.status 
      FROM core_body_profiles cbp 
      LEFT JOIN core_body_installments cbi ON cbp.id = cbi.core_body_id 
      WHERE cbp.user_id = $1
    `, [userId]);
    console.log("Core Body Data:", cbRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

debug();
