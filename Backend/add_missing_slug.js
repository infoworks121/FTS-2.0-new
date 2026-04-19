const db = require('./src/config/db');

async function addSlugColumn() {
    try {
        console.log('Checking for slug column...');
        const checkResult = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'slug';
        `);

        if (checkResult.rows.length === 0) {
            console.log('Adding "slug" column to "products" table...');
            await db.query('ALTER TABLE products ADD COLUMN slug VARCHAR(255)');
            console.log('Column added.');

            console.log('Populating slugs for existing products...');
            const productsResult = await db.query('SELECT id, name, sku FROM products WHERE slug IS NULL');
            console.log(`Found ${productsResult.rows.length} products to update.`);

            for (const row of productsResult.rows) {
                const slug = row.name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '') + '-' + row.sku.toLowerCase();
                
                await db.query('UPDATE products SET slug = $1 WHERE id = $2', [slug, row.id]);
            }
            console.log('Slugs populated.');

            console.log('Adding unique constraint and not null...');
            // We use name + sku so it should be unique.
            await db.query('ALTER TABLE products ALTER COLUMN slug SET NOT NULL');
            await db.query('ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug)');
            console.log('Database updated successfully.');
        } else {
            console.log('Column "slug" already exists.');
        }

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        process.exit();
    }
}

addSlugColumn();
