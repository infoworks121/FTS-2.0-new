const { Pool } = require('pg');
const profitEngine = require('./src/services/profitEngineService');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fulfillOrderManually() {
  const client = await pool.connect();
  try {
    const orderId = 'e2740545-5193-4a07-af17-564959146c32'; // The order ID we found
    const fulfillerId = '21fe598a-e47a-470a-9725-0e25317066f8'; // test_dealer@fts.com ID
    const superAdminId = process.env.SUPER_ADMIN_USER_ID || '4ac1c3c7-39fb-4d93-97f6-2a74965776e2';

    await client.query('BEGIN');

    console.log('--- Updating Fulfillment to Delivered ---');
    
    // Update assignment
    await client.query(
      `UPDATE fulfillment_assignments 
       SET status = 'delivered', accepted_at = NOW(), dispatched_at = NOW(), delivered_at = NOW() 
       WHERE order_id = $1`,
      [orderId]
    );

    // Update order
    await client.query(
      `UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );

    // Insert order status logs
    await client.query(
      `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
       VALUES ($1, 'accepted', 'Manual test accept', $2),
              ($1, 'dispatched', 'Manual test dispatch', $2),
              ($1, 'delivered', 'Manual test deliver', $2)`,
      [orderId, fulfillerId]
    );

    await client.query('COMMIT');
    console.log('✅ Order marked as delivered in DB');

    // Trigger Profit Engine
    console.log('--- Triggering Profit Engine ---');
    const result = await profitEngine.calculateAndDistributeProfit(orderId, superAdminId);
    console.log('Profit Engine Result:', result);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during manual fulfillment:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fulfillOrderManually();
