require('dotenv').config();
const db = require('./src/config/db');

async function addApprovalSystem() {
    try {
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
            ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ
        `);
        
        await db.query(`UPDATE users SET is_approved = TRUE WHERE role_id = 1`);
        
        console.log('Approval system added successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

addApprovalSystem();
