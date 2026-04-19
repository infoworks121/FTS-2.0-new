const db = require('./src/config/db');

async function inspectProductsTable() {
    try {
        const result = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);
        console.log('Columns in "products" table:');
        console.table(result.rows);
        
        const mlResult = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'market_listings'
            ORDER BY ordinal_position;
        `);
        console.log('\nColumns in "market_listings" table:');
        console.table(mlResult.rows);

    } catch (err) {
        console.error('Error identifying columns:', err);
    } finally {
        process.exit();
    }
}

inspectProductsTable();
