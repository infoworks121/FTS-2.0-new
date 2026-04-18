const db = require('../src/config/db');

async function inspect() {
    try {
        const res = await db.query('SELECT * FROM delivery_tracking LIMIT 0');
        console.log('Columns in delivery_tracking:', res.fields.map(f => f.name));
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
