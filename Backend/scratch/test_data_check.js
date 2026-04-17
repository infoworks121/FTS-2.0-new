
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("--- System Users and Roles ---");
    const users = await client.query(`
      SELECT u.full_name, u.phone, ur.role_code, d.name as district, sd.name as subdivision
      FROM users u
      JOIN user_roles ur ON u.role_id = ur.id
      LEFT JOIN districts d ON u.district_id = d.id
      LEFT JOIN subdivisions sd ON u.subdivision_id = sd.id
      LIMIT 20
    `);
    console.table(users.rows);

    console.log("\n--- Products ---");
    const products = await client.query(`
      SELECT id, name, is_dealer_routed, is_active FROM products LIMIT 5
    `);
    console.table(products.rows);

    console.log("\n--- Dealer Product Maps ---");
    const maps = await client.query(`
      SELECT dpm.*, sd.name as subdivision_name, u.full_name as dealer_name
      FROM dealer_product_map dpm
      JOIN subdivisions sd ON dpm.subdivision_id = sd.id
      JOIN dealer_profiles dp ON dpm.dealer_id = dp.id
      JOIN users u ON dp.user_id = u.id
    `);
    console.table(maps.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
