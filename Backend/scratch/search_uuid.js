const { pool } = require('../src/config/db');

async function searchEverywhere() {
  const uuid = 'd1a98c0d-8108-4ab1-a4f9-d62d998cb337';
  try {
    console.log(`Searching for UUID: ${uuid}`);
    
    const tables = [
      { name: 'users', col: 'id' },
      { name: 'core_body_profiles', col: 'id' },
      { name: 'core_body_profiles', col: 'user_id' },
      { name: 'businessman_profiles', col: 'id' },
      { name: 'businessman_profiles', col: 'user_id' },
      { name: 'dealer_profiles', col: 'id' },
      { name: 'dealer_profiles', col: 'user_id' }
    ];

    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table.name} WHERE ${table.col}::text = $1`, [uuid]);
        if (res.rows.length > 0) {
          console.log(`Found in ${table.name}.${table.col}:`, res.rows[0]);
        }
      } catch (e) {
        // Table might not exist or column might not exist
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

searchEverywhere();
