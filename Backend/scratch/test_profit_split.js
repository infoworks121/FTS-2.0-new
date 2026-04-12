const { Pool } = require('pg');
const { calculateAndDistributeProfit } = require('../src/services/profitEngineService');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testProfitEngine() {
  const client = await pool.connect();
  try {
    const adminId = process.env.SUPER_ADMIN_USER_ID || '4ac1c3c7-39fb-4d93-97f6-2a74965776e2';
    
    await client.query('BEGIN');

    // 1. Create a dummy order
    // We need a customer. I'll use a random businessman from the DB.
    const userRes = await client.query("SELECT id FROM users WHERE role_code = 'businessman' LIMIT 1");
    const customerId = userRes.rows[0].id;

    const orderRes = await client.query(`
      INSERT INTO orders (order_number, customer_id, order_type, status, subtotal, total_amount, total_profit, district_id)
      VALUES ($1, $2, 'B2B', 'delivered', 1000, 1000, 300, 19)
      RETURNING id
    `, [`TEST-COND-PROFIT-${Date.now()}`, customerId]);
    const orderId = orderRes.rows[0].id;

    // 2. Add order items
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, unit_profit, total_price)
      VALUES ($1, '282c6cec-2f03-4c40-9417-b63d0e665f20', 10, 100, 20, 1000)
    `, [orderId]);

    // 3. Create Split Fulfillment Assignments
    // 5 units by Dealer (District 19)
    // We need a dealer profile ID.
    const dealerRes = await client.query("SELECT id FROM dealer_profiles LIMIT 1");
    const dealerId = dealerRes.rows[0].id;
    
    await client.query(`
      INSERT INTO fulfillment_assignments (order_id, fulfiller_type, fulfiller_id, source_district_id, items, status)
      VALUES ($1, 'dealer', $2, 19, '[{"quantity": 5}]', 'delivered')
    `, [orderId, dealerId]);

    // 5 units by Admin (Central)
    await client.query(`
      INSERT INTO fulfillment_assignments (order_id, fulfiller_type, fulfiller_id, status, items)
      VALUES ($1, 'admin', $2, 'delivered', '[{"quantity": 5}]')
    `, [orderId, adminId]);

    await client.query('COMMIT');

    console.log('Order created for testing. ID:', orderId);

    // 4. Run Profit Engine (Pass orderId)
    // Note: the service handles its own transaction, so we provided a mock client or run it standalone
    // Since provide 'client' as argument is supported in my implementation...
    const result = await calculateAndDistributeProfit(orderId);
    console.log('Profit Engine Result:', result);

    // 5. Verify Results
    const txRes = await pool.query(`
      SELECT transaction_type, amount, source_type, description
      FROM wallet_transactions
      WHERE source_ref_id = $1
      ORDER BY created_at ASC
    `, [orderId]);
    
    console.log('Transactions Logged:');
    txRes.rows.forEach(tx => {
      console.log(`- Type: ${tx.transaction_type}, Amount: ${tx.amount}, Source: ${tx.source_type}, Desc: ${tx.description}`);
    });

  } catch (e) {
    if (client) await client.query('ROLLBACK');
    console.error('Test Failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

testProfitEngine();
