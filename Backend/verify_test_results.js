const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyOrder() {
  const client = await pool.connect();
  try {
    console.log('--- Latest Orders ---');
    const orders = await client.query('SELECT id, order_number, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
    console.table(orders.rows);

    if (orders.rows.length > 0) {
      const latestOrderId = orders.rows[0].id;
      
      console.log('--- Profit Logs for Latest Order ---');
      const profitLogs = await client.query('SELECT * FROM profit_distribution_log WHERE order_id = $1', [latestOrderId]);
      console.table(profitLogs.rows);

      console.log('--- Distribution Line Items ---');
      const lineItems = await client.query('SELECT * FROM distribution_line_items WHERE distribution_id = (SELECT id FROM profit_distribution_log WHERE order_id = $1)', [latestOrderId]);
      console.table(lineItems.rows);
      
      console.log('--- Wallet Transactions ---');
      const txs = await client.query('SELECT * FROM wallet_transactions WHERE source_ref_id = $1 OR source_type = \'profit_distribution\' ORDER BY created_at DESC LIMIT 10', [latestOrderId]);
      console.table(txs.rows);
    }

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyOrder();
