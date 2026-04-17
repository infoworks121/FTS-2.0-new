const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function inspectSchema() {
    try {
        const tables = ['inventory_balances', 'inventory_ledger', 'stock_requests', 'stock_point_profiles', 'dealer_profiles'];
        
        for (const table of tables) {
            console.log(`\n--- Schema for ${table} ---`);
            const result = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            console.table(result.rows);
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectSchema();
