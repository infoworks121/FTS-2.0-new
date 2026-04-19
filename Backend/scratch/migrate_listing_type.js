const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:123456@localhost:5432/fts_db'
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Adding listing_type column to market_listings...');
    await client.query(`
      ALTER TABLE market_listings 
      ADD COLUMN IF NOT EXISTS listing_type VARCHAR(10) DEFAULT 'B2C'
    `);
    
    console.log('Updating unique constraint to include listing_type...');
    // Drop existing unique constraint if it doesn't include type
    // In PostgreSQL, we usually need to find the constraint name. 
    // Assuming product_id, seller_id unique constraint exists.
    
    // Let's find the constraint name first
    const conRes = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'market_listings'::regclass
      AND contype = 'u'
    `);
    
    for (const row of conRes.rows) {
      await client.query(`ALTER TABLE market_listings DROP CONSTRAINT ${row.conname}`);
    }
    
    await client.query(`
      ALTER TABLE market_listings 
      ADD CONSTRAINT market_listings_unique_product_seller_type 
      UNIQUE (product_id, seller_id, listing_type)
    `);

    await client.query('COMMIT');
    console.log('Migration successful');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
