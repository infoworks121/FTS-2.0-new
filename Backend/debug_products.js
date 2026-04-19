const { pool } = require('./src/config/db');

async function debug() {
  try {
    console.log('--- Debugging District 19 ---');
    
    const dealers = await pool.query(`
      SELECT dp.id as profile_id, dp.user_id, u.full_name, dp.district_id 
      FROM dealer_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.district_id = 19
    `);
    console.log('Dealers in Dist 19:', dealers.rows);

    const coreBodies = await pool.query(`
      SELECT u.id, u.full_name, u.role_code, u.district_id 
      FROM users u 
      WHERE u.role_code LIKE 'core_body%' AND u.district_id = 19
    `);
    console.log('CoreBodies in Dist 19:', coreBodies.rows);

    const products = await pool.query(`
      SELECT p.id, p.name, p.created_by, p.approval_status, p.is_active, u.role_code
      FROM products p
      JOIN users u ON p.created_by = u.id
      WHERE u.role_code LIKE 'core_body%' AND u.district_id = 19
    `);
    console.log('Products created by CoreBodies in Dist 19:', products.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
