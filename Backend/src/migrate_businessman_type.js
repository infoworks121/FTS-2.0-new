const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration for businessman_profiles...');
    
    // Check if 'type' column exists
    const checkRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'businessman_profiles' AND column_name = 'type'
    `);

    if (checkRes.rows.length === 0) {
      console.log('Adding "type" column to businessman_profiles...');
      await db.query(`
        ALTER TABLE businessman_profiles 
        ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'retailer_b';
      `);
      
      // If 'mode' exists, maybe sync it? 
      const modeCheck = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'businessman_profiles' AND column_name = 'mode'
      `);
      
      if (modeCheck.rows.length > 0) {
        console.log('Syncing "mode" value to "type"...');
        await db.query(`UPDATE businessman_profiles SET type = mode WHERE mode IS NOT NULL`);
      }
      
      console.log('Migration for businessman_profiles completed.');
    } else {
      console.log('"type" column already exists.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
