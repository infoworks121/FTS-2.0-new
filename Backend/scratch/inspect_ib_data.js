const db = require('../src/config/db');

async function inspect() {
    try {
        const res = await db.query('SELECT entity_type, entity_id FROM inventory_balances LIMIT 5');
        console.log('Sample data in inventory_balances:', res.rows);
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspect();
