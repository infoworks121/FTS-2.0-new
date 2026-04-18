const db = require('../src/config/db');

async function checkTable(tableName) {
    try {
        const result = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [tableName]);
        console.log(`\nTable: ${tableName}`);
        result.rows.forEach(c => {
            console.log(`- ${c.column_name} (${c.data_type})`);
        });
    } catch (err) {
        console.error(`Error checking table ${tableName}:`, err.message);
    }
}

async function run() {
    await checkTable('products');
    await checkTable('product_pricing');
    process.exit();
}

run();
