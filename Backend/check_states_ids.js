const { pool } = require('./src/config/db');

async function checkStates() {
    try {
        const res = await pool.query('SELECT id, name FROM states LIMIT 5');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStates();
