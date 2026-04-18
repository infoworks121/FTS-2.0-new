const { pool } = require('../src/config/db');

async function migrate() {
    try {
        console.log("Starting migration for withdrawal_requests...");
        
        // Add columns individually to avoid complete failure if some exist
        const queries = [
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_account_id UUID',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100)',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS notes TEXT',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES users(id)',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ',
            'ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100)'
        ];

        for (const query of queries) {
            try {
                await pool.query(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                console.log(`Failed (maybe already exists): ${query}`);
            }
        }
        
        console.log("Migration completed.");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        pool.end();
    }
}

migrate();
