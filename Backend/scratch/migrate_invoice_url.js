const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Running migration: Add invoice_url to delivery_tracking...');
        await db.query('ALTER TABLE delivery_tracking ADD COLUMN IF NOT EXISTS invoice_url TEXT;');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
