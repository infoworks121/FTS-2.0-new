const db = require('./src/config/db');

async function checkTable(tableName, expectedColumns) {
    try {
        const result = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [tableName]);
        const actualColumns = result.rows.map(c => c.column_name);
        console.log(`\nTable: ${tableName}`);
        expectedColumns.forEach(col => {
            if (actualColumns.includes(col)) {
                console.log(`[OK] ${col}`);
            } else {
                console.log(`[MISSING] ${col}`);
            }
        });
    } catch (err) {
        console.error(`Error checking table ${tableName}:`, err.message);
    }
}

async function run() {
    await checkTable('orders', ['subdivision_id']);
    await checkTable('fulfillment_assignments', ['source_district_id', 'items', 'is_shortage_fulfillment']);
    await checkTable('products', ['is_dealer_routed']);
    process.exit();
}

run();
