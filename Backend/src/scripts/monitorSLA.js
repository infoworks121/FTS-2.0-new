const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * monitorSLA.js
 * 
 * This script identifies fulfillment assignments that have exceeded their 
 * SLA deadline without being dispatched. It marks them as breached and 
 * applies a penalty to the fulfiller's profile score (Stock Point, Dealer, or Core Body).
 * 
 * Usage: node src/scripts/monitorSLA.js
 * Recommendation: Schedule via Cron every 1-6 hours.
 */
async function monitorSLA() {
  const client = await pool.connect();
  try {
    console.log(`[${new Date().toISOString()}] [SLA MONITOR] Starting SLA check...`);
    await client.query('BEGIN');

    // 1. Find breached assignments that haven't been penalized yet
    // Requirements: No actual_time (not dispatched), deadline passed, and is_breached not yet set
    const overdueRes = await client.query(`
      SELECT * FROM order_sla_log 
      WHERE is_breached IS NULL 
        AND actual_time IS NULL 
        AND sla_deadline < NOW()
    `);

    if (overdueRes.rows.length === 0) {
        console.log('[SLA MONITOR] No new breaches detected.');
        await client.query('COMMIT');
        return;
    }

    console.log(`[SLA MONITOR] Found ${overdueRes.rows.length} overdue assignments.`);

    for (const sla of overdueRes.rows) {
      // Mark as breached
      await client.query(
        `UPDATE order_sla_log SET is_breached = true WHERE id = $1`,
        [sla.id]
      );

      // Determine correct profile table based on fulfiller_type
      let table = 'stock_point_profiles';
      if (sla.fulfiller_type === 'dealer') table = 'dealer_profiles';
      else if (sla.fulfiller_type === 'core_body') table = 'core_body_profiles';

      // 2. Apply Penalty: Reduce sla_score by 2.5 (min score: 0)
      await client.query(
        `UPDATE ${table} SET sla_score = GREATEST(sla_score - 2.5, 0) WHERE id = $1`,
        [sla.fulfiller_id]
      );

      // 3. Add to Order Status Log for transparency
      // Note: We use a NIL UUID for system-performed actions
      const systemId = '00000000-0000-0000-0000-000000000000'; 
      await client.query(
        `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
         VALUES ($1, 'overdue', $2, $3)`,
        [sla.order_id, `SLA Breach: Fulfillment delayed beyond deadline. Penalty applied to ${sla.fulfiller_type}.`, systemId]
      );

      console.log(`[SLA MONITOR] Penalized ${sla.fulfiller_type} (ID: ${sla.fulfiller_id}) for Order ID: ${sla.order_id}`);
    }

    await client.query('COMMIT');
    console.log('[SLA MONITOR] SLA check completed successfully.');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[SLA MONITOR] Error during SLA monitoring:', error);
  } finally {
    if (client) client.release();
    process.exit(0);
  }
}

monitorSLA();
