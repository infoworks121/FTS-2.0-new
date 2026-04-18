
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUsers() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    try {
        await client.connect();
        
        console.log('--- Super Admins ---');
        const adminRes = await client.query(`
            SELECT u.id, u.email, u.full_name, r.role_code 
            FROM users u 
            JOIN user_roles r ON u.role_id = r.id 
            WHERE r.role_code = 'admin' OR r.role_code = 'super_admin'
            LIMIT 5
        `);
        console.table(adminRes.rows);

        console.log('\n--- Core Bodies ---');
        const cbRes = await client.query(`
            SELECT u.id, u.email, u.full_name, r.role_code, cb.type
            FROM users u 
            JOIN user_roles r ON u.role_id = r.id 
            LEFT JOIN core_body_profiles cb ON u.id = cb.user_id
            WHERE r.role_code LIKE 'core_body%'
            LIMIT 5
        `);
        console.table(cbRes.rows);

        await client.end();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
