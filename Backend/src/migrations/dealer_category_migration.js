const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Updating dealer_product_map for category support...');
        
        await client.query('BEGIN');

        // 1. Add category_id (INT) to dealer_product_map
        await client.query(`
            ALTER TABLE dealer_product_map 
            ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE RESTRICT
        `);

        // 2. Make product_id NULLABLE
        await client.query(`
            ALTER TABLE dealer_product_map 
            ALTER COLUMN product_id DROP NOT NULL
        `);

        // 3. Update UNIQUE constraint
        // First, drop the old constraint if we can find its name, or just add a new one.
        // The old one was UNIQUE(subdivision_id, product_id) per schema.
        await client.query(`
            ALTER TABLE dealer_product_map 
            DROP CONSTRAINT IF EXISTS dealer_product_map_subdivision_id_product_id_key
        `);

        // Add a more flexible constraint that allows (subdiv, category) OR (subdiv, product)
        // We'll use two separate unique indexes to handle NULLs correctly in a logical way for this business rule
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_category_unq 
            ON dealer_product_map (subdivision_id, category_id) 
            WHERE category_id IS NOT NULL
        `);

        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_product_unq 
            ON dealer_product_map (subdivision_id, product_id) 
            WHERE product_id IS NOT NULL
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
