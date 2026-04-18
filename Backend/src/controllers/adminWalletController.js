const db = require('../config/db');

/**
 * GET /api/wallet/admin/user-wallets
 * Returns a list of all users with their main and referral wallet balances.
 */
exports.getAllUserWallets = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query to get users and their balances by joining wallets with types
    // We use COALESCE and filtered joins to pivot the balances
    let query = `
      SELECT 
        u.id as user_id, 
        u.full_name, 
        u.email, 
        u.phone, 
        r.role_code,
        u.is_approved,
        COALESCE(mw.balance, 0) as main_balance,
        COALESCE(rw.balance, 0) as referral_balance,
        mw.is_frozen as main_frozen,
        mw.id as main_wallet_id,
        bp.type as businessman_type
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      LEFT JOIN wallets mw ON u.id = mw.user_id AND mw.wallet_type_id = (SELECT id FROM wallet_types WHERE type_code = 'main')
      LEFT JOIN wallets rw ON u.id = rw.user_id AND rw.wallet_type_id = (SELECT id FROM wallet_types WHERE type_code = 'referral')
      LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
      WHERE 1=1
    `;

    const params = [];
    if (search) {
      query += ` AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Count for pagination
    let countQuery = `SELECT COUNT(*) FROM users`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE (full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get all user wallets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/users/:userId/transactions
 * Returns paginated transaction log for a specific user (admin view).
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get user wallet ID(s)
    const walletRes = await db.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    if (walletRes.rows.length === 0) return res.json({ transactions: [], total: 0 });
    
    // For now we mostly care about the 'main' wallet transactions, 
    // but the wallet_transactions table usually links all wallets for that user.
    // Fixed query to handle multiple wallets if necessary, or specific one.
    const walletIds = walletRes.rows.map(r => r.id);

    let query = `
      WITH all_txns AS (
        SELECT 
          wt.id, 
          wt.transaction_type as txn_type, 
          wt.amount, 
          wt.source_type, 
          wt.source_ref_id, 
          wt.description, 
          wt.balance_after,
          wt.created_at,
          wt.wallet_id,
          wtype.type_code as wallet_type
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        JOIN wallet_types wtype ON w.wallet_type_id = wtype.id
        WHERE wt.user_id = $1::uuid

        UNION ALL

        SELECT 
          bi.id,
          'credit' as txn_type,
          bi.amount,
          'businessman_installment' as source_type,
          bi.id as source_ref_id,
          'Investment Installment #' || bi.installment_no || ' Paid' as description,
          NULL::numeric as balance_after,
          COALESCE(bi.paid_date::timestamptz, bi.created_at) as created_at,
          NULL::uuid as wallet_id,
          'invest' as wallet_type
        FROM businessman_investments bi
        JOIN businessman_profiles bp ON bi.businessman_id = bp.id
        WHERE bp.user_id = $1::uuid AND bi.status = 'paid'

        UNION ALL

        SELECT 
          cbi.id,
          'credit' as txn_type,
          cbi.amount,
          'core_body_installment' as source_type,
          cbi.id as source_ref_id,
          'Investment Installment #' || cbi.installment_no || ' Paid' as description,
          NULL::numeric as balance_after,
          COALESCE(cbi.paid_date::timestamptz, cbi.created_at) as created_at,
          NULL::uuid as wallet_id,
          'invest' as wallet_type
        FROM core_body_installments cbi
        JOIN core_body_profiles cbp ON cbi.core_body_id = cbp.id
        WHERE cbp.user_id = $1::uuid AND cbi.status = 'paid'
      )
      SELECT 
        at.*,
        (
          SELECT STRING_AGG(p.name || ' x' || (oi.quantity::int), ', ')
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = at.source_ref_id AND at.source_type = 'order_payment'
        ) as items_summary
      FROM all_txns at
      WHERE 1=1`;
    
    let countQuery = `
      WITH all_txns AS (
        SELECT id FROM wallet_transactions WHERE user_id = $1
        UNION ALL
        SELECT bi.id FROM businessman_investments bi JOIN businessman_profiles bp ON bi.businessman_id = bp.id WHERE bp.user_id = $1 AND bi.status = 'paid'
        UNION ALL
        SELECT cbi.id FROM core_body_installments cbi JOIN core_body_profiles cbp ON cbi.core_body_id = cbp.id WHERE cbp.user_id = $1 AND cbi.status = 'paid'
      )
      SELECT COUNT(*) FROM all_txns`;
    const params = [userId];

    if (type) {
      params.push(type);
      query += ` AND at.txn_type = $${params.length}`;
      // Note: countQuery would need more complex filtering if type is used, 
      // but usually 'type' only applies to wallet transactions.
    }

    query += ` ORDER BY at.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));

    // Get Summary Statistics
    const [summaryRes] = await Promise.all([
      db.query(`
        WITH user_role AS (
          SELECT r.role_code 
          FROM users u 
          JOIN user_roles r ON u.role_id = r.id 
          WHERE u.id = $1
        )
        SELECT 
          (SELECT COALESCE(SUM(balance), 0) FROM wallets WHERE user_id = $1) as total_balance,
          (SELECT COALESCE(SUM(balance), 0) FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE w.user_id = $1 AND wt.type_code = 'main') as main_balance,
          (SELECT COALESCE(SUM(balance), 0) FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE w.user_id = $1 AND wt.type_code = 'referral') as referral_balance,
          (SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE user_id = $1 AND transaction_type = 'credit' AND source_type IN ('profit_distribution', 'referral_commission', 'manual_credit')) as total_earnings,
          (SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE user_id = $1 AND source_type = 'withdrawal_approved') as total_withdrawals,
          COALESCE(
            (SELECT SUM(amount) FROM businessman_investments bi 
             JOIN businessman_profiles bp ON bi.businessman_id = bp.id 
             WHERE bp.user_id = $1 AND (SELECT role_code FROM user_role) = 'businessman' AND bi.status = 'paid'), 0
          ) + COALESCE(
            (SELECT SUM(amount) FROM core_body_installments cbi 
             JOIN core_body_profiles cbp ON cbi.core_body_id = cbp.id 
             WHERE cbp.user_id = $1 AND (SELECT role_code FROM user_role) LIKE 'core_body%' AND cbi.status = 'paid'), 0
          ) as total_invest_paid,
          COALESCE(
            (SELECT SUM(amount) FROM businessman_investments bi 
             JOIN businessman_profiles bp ON bi.businessman_id = bp.id 
             WHERE bp.user_id = $1 AND (SELECT role_code FROM user_role) = 'businessman'), 0
          ) + COALESCE(
            (SELECT SUM(amount) FROM core_body_installments cbi 
             JOIN core_body_profiles cbp ON cbi.core_body_id = cbp.id 
             WHERE cbp.user_id = $1 AND (SELECT role_code FROM user_role) LIKE 'core_body%'), 0
          ) as total_to_invest
      `, [userId])
    ]);

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      summary: summaryRes.rows[0]
    });
  } catch (err) {
    console.error('Get user transactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

