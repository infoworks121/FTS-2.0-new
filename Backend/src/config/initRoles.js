const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initRoles() {
    try {
        // Check if roles exist
        const result = await pool.query('SELECT COUNT(*) FROM user_roles');
        
        if (result.rows[0].count === '0') {
            console.log('Inserting default roles...');
            await pool.query(`
                INSERT INTO user_roles (role_code, role_label, description) 
                VALUES 
                    ('admin', 'Admin / Company', 'Central control authority'),
                    ('core_body', 'Core Body', 'District-level distributor and dealer'),
                    ('businessman', 'Businessman', 'Business user with stock and order management'),
                    ('customer', 'Customer', 'End customer with basic access')
                ON CONFLICT (role_code) DO NOTHING
            `);
            console.log('✓ Roles inserted successfully');
        } else {
            console.log('✓ Roles already exist');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error initializing roles:', err.message);
        process.exit(1);
    }
}

initRoles();
