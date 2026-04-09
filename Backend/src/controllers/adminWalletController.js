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
