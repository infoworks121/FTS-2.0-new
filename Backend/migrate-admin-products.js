const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'admin_products_schema.sql'), 'utf8');
    await db.query(sql);
    console.log('✅ admin_products table created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit();
  }
}

runMigration();
