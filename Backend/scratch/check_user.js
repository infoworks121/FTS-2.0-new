const { pool } = require('../src/config/db');

async function checkUser() {
  const id = '896caf95-321b-4c14-9d98-92528dc5ec6d';
  try {
    const userResult = await pool.query(`
      SELECT u.id, u.full_name as name, u.email, u.phone, r.role_code
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('User found:', user);

    if (user.role_code === 'businessman') {
      const profileResult = await pool.query(`
        SELECT bp.*, d.name as district_name
        FROM businessman_profiles bp
        LEFT JOIN districts d ON bp.district_id = d.id
        WHERE bp.user_id = $1
      `, [id]);
      console.log('Businessman Profile:', profileResult.rows[0]);
    } else if (user.role_code === 'dealer') {
      const dealerResult = await pool.query(`
        SELECT u.*, d.name as district
        FROM users u
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.id = $1
      `, [id]);
      console.log('Dealer Profile:', dealerResult.rows[0]);
    } else if (['core_body_a', 'core_body_b', 'core_body'].includes(user.role_code)) {
      const profileResult = await pool.query(`
        SELECT cp.*, d.name as district
        FROM core_body_profiles cp
        LEFT JOIN districts d ON cp.district_id = d.id
        WHERE cp.user_id = $1
      `, [id]);
      console.log('Core Body Profile:', profileResult.rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkUser();
