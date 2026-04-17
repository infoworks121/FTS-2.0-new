
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash('password123', 10);
    const pinHash = await bcrypt.hash('123456', 10);
    const districtId = 1; // Alipurduar
    const subdivisionId = 1; // Alipurduar

    console.log("Setting up users...");

    // 1. Create/Identify Users
    const roles = { admin: 1, core_body_a: 2, dealer: 4, businessman: 5 };
    const users = {};

    for (const [roleName, roleId] of Object.entries(roles)) {
      const phone = `900000000${roleId}`;
      const email = `test_${roleName}@fts.com`;
      const fullName = `Test ${roleName.toUpperCase()}`;
      const referralCode = `REF${roleId}${Math.floor(Math.random() * 1000)}`;

      const userRes = await client.query(
        `INSERT INTO users (phone, email, full_name, role_id, password_hash, is_active, is_phone_verified, is_email_verified, 
                            referral_code, district_id, subdivision_id, is_approved)
         VALUES ($1, $2, $3, $4, $5, true, true, true, $6, $7, $8, true)
         ON CONFLICT (phone) DO UPDATE SET is_active = true, is_approved = true
         RETURNING id`,
        [phone, email, fullName, roleId, passwordHash, referralCode, districtId, subdivisionId]
      );
      users[roleName] = userRes.rows[0].id;
      
      // Ensure role_code is set in users table (redundant but sometimes used)
      await client.query(`UPDATE users SET role_code = $1 WHERE id = $2`, [roleName, users[roleName]]);

      // Create Wallet if missing
      const walletTypeRes = await client.query(`SELECT id FROM wallet_types WHERE type_code = 'main'`);
      if (walletTypeRes.rows.length > 0) {
        await client.query(
          `INSERT INTO wallets (user_id, wallet_type_id, balance, transaction_pin)
           VALUES ($1, $2, 10000, $3)
           ON CONFLICT (user_id, wallet_type_id) DO UPDATE SET balance = GREATEST(wallets.balance, 10000), transaction_pin = $3`,
          [users[roleName], walletTypeRes.rows[0].id, pinHash]
        );
      }
    }

    console.log("Setting up profiles...");

    // 2. Profiles
    // Core Body Profile
    await client.query(
        `INSERT INTO core_body_profiles (user_id, type, district_id, investment_amount, is_active)
         VALUES ($1, 'A', $2, 100000, true)
         ON CONFLICT (user_id) DO UPDATE SET is_active = true, district_id = $2`,
        [users.core_body_a, districtId]
    );
    const coreBodyProfileRes = await client.query(`SELECT id FROM core_body_profiles WHERE user_id = $1`, [users.core_body_a]);
    const coreBodyProfileId = coreBodyProfileRes.rows[0].id;

    // Dealer Profile
    await client.query(
        `INSERT INTO dealer_profiles (user_id, subdivision_id, district_id, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (user_id) DO UPDATE SET is_active = true, subdivision_id = $2, district_id = $3`,
        [users.dealer, subdivisionId, districtId]
    );
    const dealerProfileRes = await client.query(`SELECT id FROM dealer_profiles WHERE user_id = $1`, [users.dealer]);
    const dealerProfileId = dealerProfileRes.rows[0].id;

    // Businessman Profile
    await client.query(
        `INSERT INTO businessman_profiles (user_id, type, district_id, advance_amount, assigned_core_body_id, is_active)
         VALUES ($1, 'businessman', $2, 0, $3, true)
         ON CONFLICT (user_id) DO UPDATE SET is_active = true, assigned_core_body_id = $3`,
        [users.businessman, districtId, coreBodyProfileId]
    );

    console.log("Setting up product...");

    // 3. Category & Product
    const catRes = await client.query(`SELECT id FROM categories LIMIT 1`);
    const categoryId = catRes.rows[0]?.id || 1;

    const sku = "TEST-DEALER-SKU";
    const productRes = await client.query(
        `INSERT INTO products (category_id, name, sku, description, type, unit, is_dealer_routed, is_active, created_by)
         VALUES ($1, 'Dealer Flow Test Product', $2, 'Test product for dealer routing', 'physical', 'pcs', true, true, $3)
         ON CONFLICT (sku) DO UPDATE SET is_dealer_routed = true, is_active = true
         RETURNING id`,
        [categoryId, sku, users.admin]
    );
    const productId = productRes.rows[0].id;

    // Pricing
    await client.query(
        `INSERT INTO product_pricing (product_id, mrp, base_price, selling_price, bulk_price, min_order_quantity, is_current, created_by)
         VALUES ($1, 1000, 500, 800, 600, 1, true, $2)
         ON CONFLICT (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)) WHERE is_current = true
         DO UPDATE SET mrp = 1000, base_price = 500, selling_price = 800, bulk_price = 600`,
        [productId, users.admin]
    );

    // Initial Stock to Core Body
    await client.query(
        `INSERT INTO inventory_balances (entity_type, entity_id, product_id, quantity_on_hand)
         VALUES ('core_body', $1, $2, 100)
         ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
         DO UPDATE SET quantity_on_hand = inventory_balances.quantity_on_hand + 100`,
        [users.core_body_a, productId]
    );

    // Map Product to Dealer for Subdivision
    await client.query(
        `INSERT INTO dealer_product_map (subdivision_id, product_id, dealer_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (subdivision_id, product_id) DO UPDATE SET dealer_id = $3`,
        [subdivisionId, productId, dealerProfileId]
    );

    await client.query('COMMIT');
    console.log("Setup complete!");
    console.log("\n--- TEST CREDENTIALS ---");
    console.log("Admin: 9000000001 / password123");
    console.log("Core Body: 9000000002 / password123");
    console.log("Dealer: 9000000004 / password123");
    console.log("Businessman: 9000000005 / password123");
    console.log("PIN: 123456");
    console.log("Product ID:", productId);
    console.log("Subdivision ID:", subdivisionId);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Setup failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
