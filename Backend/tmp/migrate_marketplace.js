const db = require('../src/config/db');

async function migrate() {
  try {
    console.log('Starting Marketplace Migration...');

    // 1. Create market_listings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS market_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
        retail_price NUMERIC(12, 2) NOT NULL,
        special_price NUMERIC(12, 2),
        stock_quantity NUMERIC(12, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, seller_id, variant_id)
      );
    `);
    console.log('Table market_listings created.');

    // 2. Add indexes for performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_market_seller ON market_listings(seller_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_market_product ON market_listings(product_id);');
    console.log('Indexes created.');

    // 3. Update products table trigger for updated_at if it doesn't exist for market_listings
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_market_listings_updated_at ON market_listings;
      CREATE TRIGGER update_market_listings_updated_at
      BEFORE UPDATE ON market_listings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('Trigger created.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
