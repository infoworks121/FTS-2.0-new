const db = require('./src/config/db');

async function inspect() {
    try {
        const result = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'`);
        const columns = result.rows.map(c => c.column_name);
        console.log('Columns in orders table:', columns);
        if (columns.includes('subdivision_id')) {
            console.log('Column subdivision_id EXISTS.');
        } else {
            console.log('Column subdivision_id MISSING.');
        }
    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        process.exit();
    }
}

inspect();
