const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/Ignitova Pvt Ltd 2/Downloads/New folder/FTS-2.0-new/Backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", tables.rows.map(t => t.table_name).join(', '));
        
        const roles = await pool.query("SELECT * FROM user_roles");
        console.log("Roles:", JSON.stringify(roles.rows, null, 2));

        const districts = await pool.query("SELECT id, name FROM districts LIMIT 5");
        console.log("Districts:", JSON.stringify(districts.rows, null, 2));
        
        const products = await pool.query("SELECT id, name, is_dealer_routed FROM products LIMIT 5");
        console.log("Products:", JSON.stringify(products.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
