const db = require('../src/config/db');

async function inspect() {
    try {
        const res = await db.query('SELECT * FROM inventory_balances LIMIT 0');
        console.log('Columns in inventory_balances:', res.fields.map(f => f.name));
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
