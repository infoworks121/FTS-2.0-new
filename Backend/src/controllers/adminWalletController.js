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
        wtype.type_code as wallet_type,
        (
          SELECT STRING_AGG(p.name || ' x' || (oi.quantity::int), ', ')
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = wt.source_ref_id AND wt.source_type = 'order_payment'
        ) as items_summary
      FROM wallet_transactions wt
      JOIN wallets w ON wt.wallet_id = w.id
      JOIN wallet_types wtype ON w.wallet_type_id = wtype.id
      WHERE wt.user_id = $1`;
    
    let countQuery = `SELECT COUNT(*) FROM wallet_transactions WHERE user_id = $1`;
    const params = [userId];

    if (type) {
      params.push(type);
      query += ` AND wt.transaction_type = $${params.length}`;
      countQuery += ` AND transaction_type = $${params.length}`;
    }

    query += ` ORDER BY wt.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));

    // Get Summary Statistics
    const [summaryRes] = await Promise.all([
      db.query(`
        SELECT 
          (SELECT COALESCE(SUM(balance), 0) FROM wallets WHERE user_id = $1) as total_balance,
          (SELECT COALESCE(SUM(balance), 0) FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE w.user_id = $1 AND wt.type_code = 'main') as main_balance,
          (SELECT COALESCE(SUM(balance), 0) FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE w.user_id = $1 AND wt.type_code = 'referral') as referral_balance,
          (SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE user_id = $1 AND transaction_type = 'credit' AND source_type IN ('profit_distribution', 'referral_commission', 'manual_credit')) as total_earnings,
          (SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions WHERE user_id = $1 AND source_type = 'withdrawal_approved') as total_withdrawals
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

