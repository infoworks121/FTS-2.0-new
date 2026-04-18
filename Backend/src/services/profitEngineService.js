const db = require('../config/db');
const walletService = require('./walletService');

/**
 * Automatically calculates and distributes profit for a given order
 * based on the predefined profit rules (B2B / B2C)
 */
exports.calculateAndDistributeProfit = async (orderId, processedByUserId, providedClient = null) => {
  const client = providedClient || await db.pool.connect();
  const isInternalTransaction = !providedClient;

  try {
    if (isInternalTransaction) await client.query('BEGIN');

    // 1. Fetch Order Details (Lock for update)
    const orderResult = await client.query(`
      SELECT o.id, o.order_type, o.status, o.total_profit, o.customer_id, o.district_id
      FROM orders o
      WHERE o.id = $1 FOR UPDATE
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];

    // 1.1 Fetch Stock Point info separately if B2C
    if (order.order_type === 'B2C') {
        const faResult = await client.query(`
            SELECT fulfiller_id 
            FROM fulfillment_assignments 
            WHERE order_id = $1 AND fulfiller_type = 'stock_point'
            LIMIT 1
        `, [orderId]);
        order.stock_point_id = faResult.rows[0]?.fulfiller_id || null;
    }

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
      
      // 1. Check for Referrer first to decide the split (Fallback Logic)
      const regResult = await client.query(
        `SELECT referrer_id FROM referral_registrations WHERE referred_id = $1 LIMIT 1`,
        [order.customer_id]
      );
      const hasReferrer = regResult.rows.length > 0;

      let ftsSharePct, refSharePct, trustPct, adminPct, companyPoolPct;

      if (hasReferrer) {
        // Normal split (55/45)
        ftsSharePct = parseFloat(rule.fts_share_pct || 55);
        refSharePct = parseFloat(rule.referral_share_pct || 45);
        trustPct = parseFloat(rule.trust_fund_pct || 10);
        adminPct = parseFloat(rule.admin_pct || 1);
        companyPoolPct = parseFloat(rule.core_body_pool_pct || 44);
      } else {
        // FALLBACK: 55% becomes 100% since there's no referral network to pay
        ftsSharePct = 100;
        refSharePct = 0;
        trustPct = parseFloat(rule.trust_fund_pct || 10); // Standard 10%
        adminPct = parseFloat(rule.admin_pct || 1); // Standard 1%
        companyPoolPct = 100 - trustPct - adminPct; // Remainder (usually 89%) goes to Company Pool
      }

      const ftsAmount = (totalCalculatedProfit * ftsSharePct) / 100;
      const refAmount = (totalCalculatedProfit * refSharePct) / 100;

      // --- 1. Referral Network ---
      if (hasReferrer) {
        await addLineItem('referral_network', refAmount, refSharePct);
        const referrerId = regResult.rows[0].referrer_id;
        
        // Insert into referral_earnings table
        await client.query(
          `INSERT INTO referral_earnings (referrer_id, order_id, referred_user_id, gross_amount, status)
           VALUES ($1, $2, $3, $4, 'processed')`,
          [referrerId, orderId, order.customer_id, refAmount]
        );
        
        // CREDIT MAIN WALLET
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
      const trustAmount = (totalCalculatedProfit * trustPct) / 100;
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
      // --- Proportional Core Body Distribution ---
      const coreBodyShareRatio = parseFloat(rule.core_body_pool_pct === "70" ? 0.7 : 0.7); // Fallback to 70% if naming implies it
      // Actually we use the sub-split of the pool amount. 
      // User says: local fulfillment -> 70% core bodies. Admin fulfillment -> 70% admin.
      // poolAmount = the total portion dedicated to this specific split.
      
      let coreBodyShare = (poolAmount * 70) / 100;
      let reserveShare = (poolAmount * 30) / 100;

      // 1. Calculate Total Quantity in Order
      const totalQtyRes = await client.query(`SELECT SUM(quantity) as total FROM order_items WHERE order_id = $1`, [orderId]);
      const totalOrderQty = parseFloat(totalQtyRes.rows[0].total || 1);

      // 2. Fetch all fulfillment assignments and group by Fulfiller + District
      const assignmentsRes = await client.query(
          `SELECT fulfiller_type, source_district_id, items FROM fulfillment_assignments WHERE order_id = $1 AND status = 'delivered'`,
          [orderId]
      );
      
      const fulfillerSharesMap = new Map(); // Key: 'admin' or DistrictID -> Quantity
      
      if (assignmentsRes.rows.length > 0) {
          for (const fa of assignmentsRes.rows) {
              const dId = fa.source_district_id || order.district_id; 
              const items = fa.items || [];
              const faQty = items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0);
              
              const key = fa.fulfiller_type === 'admin' ? 'admin' : dId;
              fulfillerSharesMap.set(key, (fulfillerSharesMap.get(key) || 0) + faQty);
          }
      } else {
          // If no assignments found, assign to order's district
          fulfillerSharesMap.set(order.district_id, totalOrderQty);
      }

      // 3. Distribute profit based on fulfiller bucket
      let totalDistributedToCoreBodies = 0;
      const superAdminId = process.env.SUPER_ADMIN_USER_ID || '4ac1c3c7-39fb-4d93-97f6-2a74965776e2';

      for (const [key, dQty] of fulfillerSharesMap.entries()) {
          const shareRatio = dQty / totalOrderQty;
          const shareAmount = coreBodyShare * shareRatio;

          if (shareAmount <= 0) continue;

          if (key === 'admin') {
              // CASE: Admin Fulfillment Retention
              // The 70% share goes directly to Super Admin wallet
              await walletService.creditWallet(
                 superAdminId, 'main', shareAmount, 'Admin_Fulfillment_Retention', orderId, 
                 `Retention share (${(shareRatio*100).toFixed(1)}%) for central hub fulfillment of order ${order.order_number}`, client
              );
          } else {
              // CASE: District Fulfillment
              const coreBodiesRes = await client.query(
                `SELECT cb.id, cb.user_id, cb.type, cb.investment_amount, cb.annual_cap, cb.monthly_cap, cb.ytd_earnings, cb.mtd_earnings 
                 FROM core_body_profiles cb 
                 WHERE cb.district_id = $1 AND cb.is_active = true AND cb.type IN ('A', 'B') FOR UPDATE`,
                [key]
              );

              const cbMembers = coreBodiesRes.rows;
              if (cbMembers.length > 0) {
                const perMemberShare = shareAmount / cbMembers.length;

                for (const cb of cbMembers) {
                   let awardedAmount = perMemberShare;
                   let currentYtd = parseFloat(cb.ytd_earnings || 0);
                   let currentMtd = parseFloat(cb.mtd_earnings || 0);

                   // Simplistic Cap check 
                   if (cb.type === 'A' && (currentYtd + perMemberShare) > parseFloat(cb.annual_cap || 2500000)) {
                       awardedAmount = Math.max(0, parseFloat(cb.annual_cap || 2500000) - currentYtd);
                   } else if (cb.type === 'B' && (currentMtd + perMemberShare) > parseFloat(cb.monthly_cap || cb.investment_amount || 0)) {
                       awardedAmount = Math.max(0, parseFloat(cb.monthly_cap || cb.investment_amount || 0) - currentMtd);
                   }

                   if (awardedAmount > 0) {
                      await walletService.creditWallet(
                         cb.user_id, 'main', awardedAmount, 'Inter_District_Share', orderId, 
                         `Proportional share (${(shareRatio*100).toFixed(1)}%) from district order ${order.order_number}`, client
                      );
                      totalDistributedToCoreBodies += awardedAmount;

                      await client.query(
                         `UPDATE core_body_profiles SET ytd_earnings = ytd_earnings + $1, mtd_earnings = mtd_earnings + $1, updated_at = NOW() WHERE id = $2`,
                         [awardedAmount, cb.id]
                      );
                   }
                }
              } else {
                 // No core bodies in this district -> share goes to reserve
                 reserveShare += shareAmount;
              }
          }
      }
      
      // Log Reserve Fund
      await client.query(
        `INSERT INTO reserve_fund_log (source_type, source_ref_id, credit_amount, balance_after, note)
         VALUES ('B2B_Order', $1, $2, 
           COALESCE((SELECT balance_after FROM reserve_fund_log ORDER BY created_at DESC LIMIT 1), 0) + $2, 
           'Company Reserve portion from B2B Pool')`,
        [orderId, reserveShare]
      );

      // --- CREDIT SYSTEM WALLETS ---
      if (superAdminId) {
        // Credit Admin Fund
        await walletService.creditWallet(superAdminId, 'trust', trustAmount, 'B2B_Trust', orderId, 'B2B Trust Fund Share', client);
        await walletService.creditWallet(superAdminId, 'reserve', reserveShare, 'B2B_Reserve', orderId, 'B2B Reserve Fund Share', client);
        await walletService.creditWallet(superAdminId, 'main', adminAmount, 'B2B_Admin', orderId, 'B2B Admin Fee', client);
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

    if (isInternalTransaction) await client.query('COMMIT');
    return { success: true, message: 'Profit successfully distributed' };
  } catch (error) {
    if (isInternalTransaction) await client.query('ROLLBACK');
    console.error('Profit Distribution Error:', error);
    throw error;
  } finally {
    if (isInternalTransaction) client.release();
  }
};
