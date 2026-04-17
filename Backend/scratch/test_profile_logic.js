const { pool } = require('../src/config/db');

async function testGetDirectoryUserDetail(id) {
    console.log(`Testing ID: ${id}`);
    try {
        // Remove entity prefixes if present (e.g., BSM-, DLR-, CB-)
        if (typeof id === 'string') {
            if (id.startsWith('BSM-')) id = id.replace('BSM-', '');
            if (id.startsWith('DLR-')) id = id.replace('DLR-', '');
            if (id.startsWith('CB-')) id = id.replace('CB-', '');
        }

        console.log(`Stripped ID: ${id}`);

        // 1. Fetch user and role
        let userResult = await pool.query(`
      SELECT u.id, u.full_name as name, u.email, u.phone, r.role_code
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id::text = $1
    `, [id]);

        // 1.1 If not found, try to resolve from profile tables
        if (userResult.rows.length === 0) {
            console.log(`ID ${id} not found in users table, attempting profile resolution`);
            try {
                // Try core_body_profiles
                const cbProfile = await pool.query('SELECT user_id FROM core_body_profiles WHERE id::text = $1', [id]);
                if (cbProfile.rows.length > 0) {
                    id = cbProfile.rows[0].user_id;
                    console.log(`Resolved ID ${id} from core_body_profiles`);
                } else {
                    // Try businessman_profiles
                    const bsmProfile = await pool.query('SELECT user_id FROM businessman_profiles WHERE id::text = $1', [id]);
                    if (bsmProfile.rows.length > 0) {
                        id = bsmProfile.rows[0].user_id;
                        console.log(`Resolved ID ${id} from businessman_profiles`);
                    }
                }

                // Re-fetch user with resolved ID
                if (id) {
                    userResult = await pool.query(`
            SELECT u.id, u.full_name as name, u.email, u.phone, r.role_code
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            WHERE u.id::text = $1
          `, [id]);
                }
            } catch (err) {
                console.warn('Profile resolution failed:', err.message);
            }
        }

        if (userResult.rows.length === 0) {
            console.log('User not found');
            return;
        }

        console.log('Result:', userResult.rows[0]);
    } catch (err) {
        console.error('CRASH:', err);
    } finally {
        await pool.end();
    }
}

// Test with one of the IDs the user used
testGetDirectoryUserDetail('CB-d1a98c0d-8108-4ab1-a4f9-d62d998cb337');
