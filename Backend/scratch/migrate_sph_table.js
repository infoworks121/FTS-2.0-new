const { pool } = require('../src/config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting SPH table migration...');
    await client.query('BEGIN');

    // 1. Add user_id column if it doesn't exist
    // Check if column exists first to avoid errors
    const checkUserColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'stock_point_profiles' AND column_name = 'user_id'
    `);

    if (checkUserColumn.rows.length === 0) {
        console.log('Adding user_id column...');
        await client.query(`
            ALTER TABLE stock_point_profiles 
            ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE RESTRICT
        `);
        
        // Add unique constraint
        await client.query(`
            ALTER TABLE stock_point_profiles 
            ADD CONSTRAINT stock_point_profiles_user_id_key UNIQUE (user_id)
        `);
    }

    // 2. Make businessman_id optional
    console.log('Making businessman_id optional...');
    await client.query(`
        ALTER TABLE stock_point_profiles 
        ALTER COLUMN businessman_id DROP NOT NULL
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
