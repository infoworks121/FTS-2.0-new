const db = require('../config/db');
const walletService = require('./walletService');

/**
 * Automatically calculates and distributes profit for a given order
 * based on the predefined profit rules (B2B / B2C)
 */
exports.calculateAndDistributeProfit = async (orderId, processedByUserId) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch Order Details & Items
    const orderResult = await client.query(`
      SELECT o.id, o.order_type, o.status, o.total_profit, o.customer_id,
             (CASE WHEN o.order_type = 'B2C' THEN fa.fulfiller_id ELSE NULL END) as stock_point_id
      FROM orders o
      LEFT JOIN fulfillment_assignments fa ON fa.order_id = o.id AND fa.fulfiller_type = 'stock_point'
      WHERE o.id = $1 FOR UPDATE
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];

    // Check if profit already distributed
    const existingLog = await client.query(
      `SELECT id FROM profit_distribution_log WHERE order_id = $1`, 
      [orderId]
    );

    if (existingLog.rows.length > 0) {
      // Already distributed, do not proceed
      await client.query('ROLLBACK');
      return { success: true, message: 'Profit already distributed for this order' };
    }

    // Usually Profit Engine runs ONLY when order is delivered/completed
    if (!['delivered', 'completed'].includes(order.status)) {
       // Just a warning, not an error. Depending on business logic, this might be strict.
       console.warn(`Warning: Distributing profit for order ${orderId} which is in status ${order.status}`);
    }

    // Fetch order items and calculate total profit
    const itemsResult = await client.query(`
      SELECT id, unit_price, mrp, quantity 
      FROM order_items 
      WHERE order_id = $1
    `, [orderId]);

    // We fetch base_price from product_pricing for precise profit calc
    // But since pricing can change, the ideal schema has base_price at order time
    // For now we rely on order.total_profit or recalc. We will use recalc assuming 'unit_profit' exists
    // Fetch 'unit_profit' directly from order_items as it represents the precise profit at the time of order creation
    const itemsProfitResult = await client.query(`
      SELECT id, quantity, unit_price, unit_profit
      FROM order_items
      WHERE order_id = $1
    `, [orderId]);

    let totalCalculatedProfit = 0;
    const itemProfits = [];

    for (const item of itemsProfitResult.rows) {
      const uProfit = parseFloat(item.unit_profit || 0);
      const qty = parseFloat(item.quantity || 0);
      const totalItemProfit = uProfit * qty;
      totalCalculatedProfit += totalItemProfit;

      itemProfits.push({
        id: item.id,
        profit: totalItemProfit
      });
      
      // Update order_items unit_profit if needed
      await client.query(`UPDATE order_items SET unit_profit = $1 WHERE id = $2`, [uProfit, item.id]);
    }

    if (totalCalculatedProfit <= 0) {
       await client.query('ROLLBACK');
       return { success: true, message: 'No profit generated to distribute' };
    }

    // 2. Fetch Active Profit Rule
    const ruleResult = await client.query(
      `SELECT * FROM profit_rules WHERE channel = $1 AND is_current = true LIMIT 1`,
      [order.order_type]
    );

    if (ruleResult.rows.length === 0) {
      throw new Error(`No active profit rule found for channel ${order.order_type}`);
    }

    const rule = ruleResult.rows[0];

    // Create Main Distribution Log
    const distLogResult = await client.query(
      `INSERT INTO profit_distribution_log (order_id, channel, total_profit, rule_id, status)
       VALUES ($1, $2, $3, $4, 'processed') RETURNING id`,
       [orderId, order.order_type, totalCalculatedProfit, rule.id]
    );
    const distLogId = distLogResult.rows[0].id;

    // Helper function to create line item
    const addLineItem = async (recipientType, amount, percentage) => {
      await client.query(
        `INSERT INTO distribution_line_items (distribution_id, recipient_type, amount, percentage_applied)
         VALUES ($1, $2, $3, $4)`,
        [distLogId, recipientType, amount, percentage]
      );
    };

    // 3. APPLY RULES (B2B vs B2C)
    if (order.order_type === 'B2B') {
      // RULE: B2B
      // Total Profit = 100%
      // Referral Network = rule.referral_share_pct (45%)
      // FTS (Company) = rule.fts_share_pct (55%)
      
      const ftsSharePct = parseFloat(rule.fts_share_pct || 55);
      const refSharePct = parseFloat(rule.referral_share_pct || 45);

      const ftsAmount = (totalCalculatedProfit * ftsSharePct) / 100;
      const refAmount = (totalCalculatedProfit * refSharePct) / 100;

      // --- 1. Referral Network ---
      await addLineItem('referral_network', refAmount, refSharePct);
      // Find the referrer
      const regResult = await client.query(
        `SELECT referrer_id FROM referral_registrations WHERE referred_id = $1 LIMIT 1`,
        [order.customer_id]
      );

      if (regResult.rows.length > 0) {
        const referrerId = regResult.rows[0].referrer_id;
        // Insert into referral_earnings table
        const refEarningRes = await client.query(
          `INSERT INTO referral_earnings (referrer_id, order_id, referred_user_id, gross_amount, status)
           VALUES ($1, $2, $3, $4, 'processed') RETURNING id`,
          [referrerId, orderId, order.customer_id, refAmount]
        );
        
        // CREDIT MAIN WALLET (AS PER USER REQUEST)
        await walletService.creditWallet(
          referrerId, 
          'main', 
          refAmount, 
          'B2B_Referral_Profit', 
          orderId, 
          `Profit share from B2B order ${orderId}`,
          client
        );
      }

      // --- 2. FTS Share Breakdown ---
      const trustPct = parseFloat(rule.trust_fund_pct || 10);
      const adminPct = parseFloat(rule.admin_pct || 1);
      const companyPoolPct = parseFloat(rule.core_body_pool_pct || 44); // This holds (70% core body, 30% reserve) of company pool

      const trustAmount = (totalCalculatedProfit * trustPct) / 100; // or (ftsAmount * trustPct)/100 ? Schema implies percentage of TOTAL
      const adminAmount = (totalCalculatedProfit * adminPct) / 100;
      const poolAmount  = (totalCalculatedProfit * companyPoolPct) / 100;

      await addLineItem('trust_fund', trustAmount, trustPct);
      await addLineItem('admin', adminAmount, adminPct);
      await addLineItem('company_pool', poolAmount, companyPoolPct);

      // Log Trust Fund
      await client.query(
        `INSERT INTO trust_fund_log (source_type, source_ref_id, credit_amount, balance_after, note)
         VALUES ('B2B_Order', $1, $2, 
           COALESCE((SELECT balance_after FROM trust_fund_log ORDER BY created_at DESC LIMIT 1), 0) + $2, 
           'Profit distribution from B2B order')`,
        [orderId, trustAmount]
      );

      // Log Company Pool & Reserve
      const coreBodyShare = (poolAmount * 70) / 100;
      const reserveShare = (poolAmount * 30) / 100;
      
      await client.query(
        `INSERT INTO company_pool_log (distribution_id, total_pool_amount, core_body_share, reserve_share, allocated)
         VALUES ($1, $2, $3, $4, false)`,
        [distLogId, poolAmount, coreBodyShare, reserveShare]
      );

      // Log Reserve Fund
      await client.query(
        `INSERT INTO reserve_fund_log (source_type, source_ref_id, credit_amount, balance_after, note)
         VALUES ('B2B_Order', $1, $2, 
           COALESCE((SELECT balance_after FROM reserve_fund_log ORDER BY created_at DESC LIMIT 1), 0) + $2, 
           'Company Reserve portion from B2B Pool')`,
        [orderId, reserveShare]
      );

      // --- CREDIT SYSTEM WALLETS ---
      const adminResult = await client.query(`SELECT user_id FROM admin_profiles LIMIT 1`);
      if (adminResult.rows.length > 0) {
        const adminUserId = adminResult.rows[0].user_id;

        // Credit Admin Fund
        await walletService.creditWallet(adminUserId, 'trust', trustAmount, 'B2B_Trust', orderId, 'B2B Trust Fund Share', client);
        await walletService.creditWallet(adminUserId, 'reserve', reserveShare, 'B2B_Reserve', orderId, 'B2B Reserve Fund Share', client);
        await walletService.creditWallet(adminUserId, 'main', adminAmount, 'B2B_Admin', orderId, 'B2B Admin Fee', client);
      }

    } else if (order.order_type === 'B2C') {
      // RULE: B2C
      // Fixed (21%): Trust (10%), Admin (1%), Company (10%)
      const trustPct = parseFloat(rule.trust_fund_pct || 10);
      const adminPct = parseFloat(rule.admin_pct || 1);
      const compPct  = parseFloat(rule.company_pct || 10);

      const trustAmount = (totalCalculatedProfit * trustPct) / 100;
      const adminAmount = (totalCalculatedProfit * adminPct) / 100;
      const compAmount  = (totalCalculatedProfit * compPct) / 100;

      await addLineItem('trust_fund', trustAmount, trustPct);
      await addLineItem('admin', adminAmount, adminPct);
      await addLineItem('company_direct', compAmount, compPct);

      await client.query(
        `INSERT INTO trust_fund_log (source_type, source_ref_id, credit_amount, balance_after, note)
         VALUES ('B2C_Order', $1, $2, 
           COALESCE((SELECT balance_after FROM trust_fund_log ORDER BY created_at DESC LIMIT 1), 0) + $2, 
           'Trust Fund from B2C fixed distribution')`,
        [orderId, trustAmount]
      );

      // CREDIT Admin for Trust/Company/Admin shares
      const adminResult = await client.query(`SELECT user_id FROM admin_profiles LIMIT 1`);
      if (adminResult.rows.length > 0) {
        const adminUserId = adminResult.rows[0].user_id;
        await walletService.creditWallet(adminUserId, 'trust', trustAmount, 'B2C_Trust', orderId, 'B2C Trust Fund Share', client);
        await walletService.creditWallet(adminUserId, 'main', adminAmount, 'B2C_Admin', orderId, 'B2C Admin Fee', client);
        await walletService.creditWallet(adminUserId, 'main', compAmount, 'B2C_Company', orderId, 'B2C Company Profit', client);
      }

      // Remaining (79%)
      const remainingProfit = totalCalculatedProfit - (trustAmount + adminAmount + compAmount);
      const stockPointPct = parseFloat(rule.stock_point_pct || 40);
      const referralPct = parseFloat(rule.referral_pct || 60);

      const stockPointAmount = (remainingProfit * stockPointPct) / 100;
      const refAmount = (remainingProfit * referralPct) / 100;

      await addLineItem('stock_point', stockPointAmount, stockPointPct);
      await addLineItem('referral_network', refAmount, referralPct);

      // Credit Stock Point (Add to wallet or distribution line)
      if (order.stock_point_id) {
         // Get the user_id associated with this stock point
         const spResult = await client.query(`
           SELECT bp.user_id FROM stock_point_profiles sp
           JOIN businessman_profiles bp ON sp.businessman_id = bp.id
           WHERE sp.id = $1`, [order.stock_point_id]);
         
         if (spResult.rows.length > 0) {
            const spUserId = spResult.rows[0].user_id;

            await client.query(
              `UPDATE distribution_line_items 
               SET recipient_id = $1 
               WHERE distribution_id = $2 AND recipient_type = 'stock_point'`,
              [spUserId, distLogId]
             );

             // ACTUAL WALLET CREDIT
             await walletService.creditWallet(
               spUserId, 
               'main', 
               stockPointAmount, 
               'B2C_Fullfillment_Profit', 
               orderId, 
               `Profit from order fulfillment ${orderId}`, 
               client
             );
         }
      }

      // Referral
      const regResult = await client.query(
        `SELECT referrer_id FROM referral_registrations WHERE referred_id = $1 LIMIT 1`,
        [order.customer_id]
      );

      if (regResult.rows.length > 0) {
        const referrerId = regResult.rows[0].referrer_id;
        await client.query(
          `INSERT INTO referral_earnings (referrer_id, order_id, referred_user_id, gross_amount, status)
           VALUES ($1, $2, $3, $4, 'processed')`,
          [referrerId, orderId, order.customer_id, refAmount]
        );

        // ACTUAL WALLET CREDIT (MAIN WALLET AS PER USER REQUEST)
        await walletService.creditWallet(
          referrerId, 
          'main', 
          refAmount, 
          'B2C_Referral_Profit', 
          orderId, 
          `Referral profit from order ${orderId}`, 
          client
        );
      }
    }

    // Finally updating total_profit in orders
    await client.query(`UPDATE orders SET total_profit = $1 WHERE id = $2`, [totalCalculatedProfit, orderId]);

    await client.query('COMMIT');
    return { success: true, message: 'Profit successfully distributed' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Profit Distribution Error:', error);
    throw error;
  } finally {
    client.release();
  }
};
