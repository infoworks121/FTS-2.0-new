require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function createSuperAdmin() {
    try {
        // Get admin role_id
        const roleResult = await db.query(
            "SELECT id FROM user_roles WHERE role_code = 'admin'"
        );

        if (roleResult.rows.length === 0) {
            console.error('❌ Admin role not found');
            process.exit(1);
        }

        const adminRoleId = roleResult.rows[0].id;

        // Get a district (Kolkata)
        const districtResult = await db.query(
            "SELECT id FROM districts WHERE name = 'Kolkata' LIMIT 1"
        );

        const districtId = districtResult.rows.length > 0 ? districtResult.rows[0].id : null;

        // Check if admin already exists
        const existingAdmin = await db.query(
            "SELECT id FROM users WHERE email = 'admin@fts.com' OR phone = '9999999999'"
        );

        if (existingAdmin.rows.length > 0) {
            console.log('⚠️  Admin user already exists. Updating password...');
            
            const password = 'admin123';
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            await db.query(
                `UPDATE users SET password_hash = $1, is_approved = TRUE WHERE id = $2`,
                [password_hash, existingAdmin.rows[0].id]
            );

            console.log('\n✅ Admin password updated successfully!\n');
        } else {
            console.log('Creating new admin user...\n');

            const password = 'admin123';
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Generate unique referral code
            const referralCode = 'ADMIN' + Date.now().toString().slice(-6);

            await db.query(`
                INSERT INTO users (
                    phone, email, full_name, role_id, password_hash, 
                    is_active, is_email_verified, is_phone_verified, 
                    is_approved, referral_code, district_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                '9999999999',
                'admin@fts.com',
                'Super Admin',
                adminRoleId,
                password_hash,
                true,
                true,
                true,
                true,
                referralCode,
                districtId
            ]);

            console.log('✅ Super Admin created successfully!\n');
        }

        console.log('═══════════════════════════════════════');
        console.log('     SUPERADMIN LOGIN CREDENTIALS      ');
        console.log('═══════════════════════════════════════');
        console.log('Email:    admin@fts.com');
        console.log('Phone:    9999999999');
        console.log('Password: admin123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err);
        process.exit(1);
    }
}

createSuperAdmin();
