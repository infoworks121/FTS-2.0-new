const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT id FROM users WHERE role_code = 'dealer' AND id NOT IN (SELECT user_id FROM dealer_profiles)");
    const ids = res.rows.map(r => r.id);
    
    if (ids.length > 0) {
      console.log('Found broken dealer accounts:', ids);
      
      // Delete in correct order to avoid FK violations
      for (const id of ids) {
        await pool.query('DELETE FROM wallets WHERE user_id = $1', [id]);
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
      }
      
      console.log('Successfully deleted broken accounts.');
    } else {
      console.log('No broken dealer accounts found.');
    }
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await pool.end();
  }
}

run();
