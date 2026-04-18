const { pool } = require('../src/config/db');

async function fix() {
    try {
        console.log('Starting DB fix for transaction types...');
        const res = await pool.query("UPDATE wallet_transactions SET transaction_type = 'credit' WHERE transaction_type = 'deposit'");
        console.log(`Fix complete! Updated ${res.rowCount} rows.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fix();
