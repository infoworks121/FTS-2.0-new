const db = require('./src/config/db');

async function inspect() {
    const tables = ['orders', 'fulfillment_assignments', 'order_items', 'order_status_log', 'order_sla_log'];
    try {
        for (const table of tables) {
            const result = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`Columns in ${table}:`, result.rows.map(c => c.column_name));
        }
    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        process.exit();
    }
}

inspect();
