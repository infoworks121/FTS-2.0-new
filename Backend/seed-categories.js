const db = require('./src/config/db');

async function seedCategories() {
  try {
    // Check if categories table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'categories'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ categories table does not exist. Run product_catalog_schema.sql first.');
      process.exit(1);
    }

    // Check if data exists
    const countResult = await db.query('SELECT COUNT(*) FROM categories');
    const count = parseInt(countResult.rows[0].count);

    if (count > 0) {
      console.log(`✅ categories table already has ${count} rows.`);
      const rows = await db.query('SELECT id, name FROM categories ORDER BY id');
      console.log('Categories:', rows.rows);
      process.exit(0);
    }

    // Insert sample categories
    await db.query(`
      INSERT INTO categories (name, description, slug, sort_order) VALUES
      ('Electronics', 'Electronic products and gadgets', 'electronics', 1),
      ('Clothing', 'Apparel and fashion items', 'clothing', 2),
      ('Home & Garden', 'Home improvement and garden supplies', 'home-garden', 3),
      ('Digital Products', 'Software, ebooks, online courses', 'digital-products', 4),
      ('Services', 'Professional and home services', 'services', 5)
      ON CONFLICT DO NOTHING
    `);

    const inserted = await db.query('SELECT id, name FROM categories ORDER BY id');
    console.log('✅ Categories seeded successfully:');
    console.log(inserted.rows);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit();
  }
}

seedCategories();
