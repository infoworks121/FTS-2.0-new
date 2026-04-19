const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding profit_channel to products table...');
        
        // Check if column exists
        const checkCol = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'profit_channel'
        `);

        if (checkCol.rows.length === 0) {
            console.log('Adding column profit_channel...');
            await db.query(`
                ALTER TABLE products 
                ADD COLUMN profit_channel VARCHAR(20) DEFAULT 'B2C'
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column profit_channel already exists.');
        }

        // Update existing products to B2C if they are null
        const updateRes = await db.query(`
            UPDATE products 
            SET profit_channel = 'B2C' 
            WHERE profit_channel IS NULL
        `);
        console.log(`Updated ${updateRes.rowCount} existing products.`);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
