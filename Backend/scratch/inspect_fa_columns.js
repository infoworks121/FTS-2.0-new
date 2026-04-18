const db = require('../src/config/db');

async function inspect() {
    try {
        const res = await db.query('SELECT * FROM fulfillment_assignments LIMIT 0');
        console.log('Columns in fulfillment_assignments:', res.fields.map(f => f.name));
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
