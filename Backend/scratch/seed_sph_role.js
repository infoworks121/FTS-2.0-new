const { pool } = require('../src/config/db');

async function seedRole() {
  try {
    console.log('Seeding stock_point role...');
    await pool.query(`
      INSERT INTO user_roles (role_code, role_label, description) 
      VALUES ('stock_point', 'Stock Point Partner', 'Fulfillment and B2C marketplace operator')
      ON CONFLICT (role_code) DO NOTHING
    `);
    console.log('Role seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding role:', error);
    process.exit(1);
  }
}

seedRole();
