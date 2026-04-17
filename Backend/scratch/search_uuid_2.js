const { pool } = require('../src/config/db');

async function searchEverywhere() {
  const uuid = 'b83f6fe4-791d-452b-82d2-aec829cea3c1';
  try {
    console.log(`Searching for UUID: ${uuid}`);
    
    const tables = [
      { name: 'users', col: 'id' },
      { name: 'core_body_profiles', col: 'id' },
      { name: 'core_body_profiles', col: 'user_id' },
      { name: 'businessman_profiles', col: 'id' },
      { name: 'businessman_profiles', col: 'user_id' }
    ];

    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table.name} WHERE ${table.col}::text = $1`, [uuid]);
        if (res.rows.length > 0) {
          console.log(`Found in ${table.name}.${table.col}:`, res.rows[0]);
        }
      } catch (e) {
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

searchEverywhere();
