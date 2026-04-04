const db = require('./config/db');

async function checkColumns() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    console.log('Columns in products:');
    res.rows.forEach(row => console.log(`- ${row.column_name}`));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkColumns();
