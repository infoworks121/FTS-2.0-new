const { pool } = require('../src/config/db');

async function fixConstraint() {
    try {
        console.log("Dropping NOT NULL constraint from bank_account_details...");
        await pool.query('ALTER TABLE withdrawal_requests ALTER COLUMN bank_account_details DROP NOT NULL');
        console.log("Success.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

fixConstraint();
