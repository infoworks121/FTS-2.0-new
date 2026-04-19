const db = require('../src/config/db');

async function migrate() {
    try {
        await db.query('ALTER TABLE stock_point_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)');
        console.log('Successfully added user_id column to stock_point_profiles');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
