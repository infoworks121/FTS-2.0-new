const db = require('./src/config/db');

async function setupProductCatalog() {
  try {
    console.log('🔄 Setting up Product Catalog tables...');
    
    // Check existing categories table and add missing columns
    try {
      await db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`);
      await db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`);
      console.log('✅ Updated categories table');
    } catch (error) {
      console.log('ℹ️ Categories table already up to date');
    }
    
    // Create sub_categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created sub_categories table');
    
    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          sub_category_id INTEGER NOT NULL REFERENCES sub_categories(id),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sku VARCHAR(100) UNIQUE,
          brand VARCHAR(255),
          unit VARCHAR(50),
          weight DECIMAL(10,2),
          dimensions VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created products table');
    
    // Create service_catalog table
    await db.query(`
      CREATE TABLE IF NOT EXISTS service_catalog (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          service_type VARCHAR(100),
          duration VARCHAR(100),
          price DECIMAL(10,2),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created service_catalog table');
    
    // Create subscription_plans table
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          duration_months INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          features JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created subscription_plans table');
    
    // Insert sample data for service_catalog
    await db.query(`
      INSERT INTO service_catalog (name, description, service_type, duration, price) 
      SELECT 'Installation Service', 'Professional installation service', 'installation', '2 hours', 500.00
      WHERE NOT EXISTS (SELECT 1 FROM service_catalog WHERE name = 'Installation Service')
    `);
    
    await db.query(`
      INSERT INTO service_catalog (name, description, service_type, duration, price) 
      SELECT 'Maintenance Service', 'Regular maintenance service', 'maintenance', '1 hour', 300.00
      WHERE NOT EXISTS (SELECT 1 FROM service_catalog WHERE name = 'Maintenance Service')
    `);
    
    // Insert sample data for subscription_plans
    await db.query(`
      INSERT INTO subscription_plans (name, description, duration_months, price, features) 
      SELECT 'Basic Plan', 'Basic subscription with essential features', 6, 2999.00, '["Basic Support", "Standard Features"]'::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Basic Plan')
    `);
    
    await db.query(`
      INSERT INTO subscription_plans (name, description, duration_months, price, features) 
      SELECT 'Premium Plan', 'Premium subscription with all features', 12, 9999.00, '["Priority Support", "All Features", "Advanced Analytics"]'::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium Plan')
    `);
    
    console.log('✅ Product Catalog setup completed successfully!');
    console.log('📋 Tables ready:');
    console.log('   - categories (updated)');
    console.log('   - sub_categories (new)');
    console.log('   - products (new)');
    console.log('   - service_catalog (new with sample data)');
    console.log('   - subscription_plans (new with sample data)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Product Catalog:', error);
    process.exit(1);
  }
}

setupProductCatalog();