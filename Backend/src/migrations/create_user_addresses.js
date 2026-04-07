const { pool } = require('../config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: user_addresses table');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_addresses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                label VARCHAR(100) NOT NULL,
                street_address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                pincode VARCHAR(10) NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create index for singleton default address per user
        // We drop it first to avoid errors if it exists but with different definition
        await client.query(`
            DROP INDEX IF EXISTS idx_user_addresses_default_singleton;
            CREATE UNIQUE INDEX idx_user_addresses_default_singleton 
            ON user_addresses (user_id) WHERE (is_default = TRUE);
        `);

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
