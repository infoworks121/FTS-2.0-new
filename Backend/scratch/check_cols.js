const db = require('../src/config/db');

async function checkCols() {
  try {
    const productsRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Products Columns:', productsRes.rows.map(r => r.column_name));

    const pricingRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_pricing'");
    console.log('Product Pricing Columns:', pricingRes.rows.map(r => r.column_name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCols();
