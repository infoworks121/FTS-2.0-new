const db = require('../src/config/db');

async function migrate() {
    try {
        await db.query('ALTER TABLE fulfillment_assignments ADD COLUMN IF NOT EXISTS packing_at TIMESTAMPTZ');
        await db.query('ALTER TABLE fulfillment_assignments ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ');
        console.log('Successfully added packing_at and received_at columns to fulfillment_assignments');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
