const db = require('./db');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
  try {
    console.log('🔄 Starting migration to restore missing columns...');

    // 1. Add missing columns to products table
    await db.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
      ADD COLUMN IF NOT EXISTS highlights TEXT[],
      ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS return_policy_days INTEGER DEFAULT 7;
    `);
    console.log('✅ Checked/Added columns to products table.');

    // 2. Add admin_margin_pct back to product_pricing
    await db.query(`
      ALTER TABLE product_pricing 
      ADD COLUMN IF NOT EXISTS admin_margin_pct NUMERIC(5,2) DEFAULT 0;
    `);
    console.log('✅ Checked/Added admin_margin_pct to product_pricing table.');

    // 3. Ensure min_order_quantity exists in product_pricing (just in case)
    await db.query(`
      ALTER TABLE product_pricing 
      ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;
    `);
    console.log('✅ Checked/Added min_order_quantity to product_pricing table.');

    console.log('🚀 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
