const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('Starting migration: Adding min_order_quantity to product_pricing');
    
    // Add min_order_quantity column if it doesn't exist
    await db.query(`
      ALTER TABLE product_pricing 
      ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1
    `);
    
    console.log('Migration successful: min_order_quantity added to product_pricing');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
