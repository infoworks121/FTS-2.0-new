const db = require('../config/db');

// ─────────────────────────────────────────────
// ADMIN VIEWS
// ─────────────────────────────────────────────

/**
 * GET /api/wallet/admin/overview
 * Returns balance summaries for Trust Fund, Reserve Fund, and Company Pool.
 */
exports.getAdminWalletOverview = async (req, res) => {
  try {
    const [trust, reserve, companyPool] = await Promise.all([
      db.query(
        `SELECT COALESCE(SUM(credit_amount) - SUM(COALESCE(debit_amount, 0)), 0) AS balance
         FROM trust_fund_log`
      ),
      db.query(
        `SELECT COALESCE(SUM(credit_amount) - SUM(COALESCE(debit_amount, 0)), 0) AS balance
         FROM reserve_fund_log`
      ),
      db.query(
        `SELECT COALESCE(SUM(core_body_share), 0) AS core_body_total,
                COALESCE(SUM(reserve_share), 0) AS reserve_total,
                COALESCE(SUM(total_pool_amount), 0) AS total_pool
         FROM company_pool_log`
      ),
    ]);

    res.json({
      trust_fund: parseFloat(trust.rows[0].balance || 0),
      reserve_fund: parseFloat(reserve.rows[0].balance || 0),
      company_pool: {
        total: parseFloat(companyPool.rows[0].total_pool || 0),
        core_body_allocated: parseFloat(companyPool.rows[0].core_body_total || 0),
        reserve_allocated: parseFloat(companyPool.rows[0].reserve_total || 0),
      },
    });
  } catch (err) {
    console.error('Admin wallet overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/trust-fund
 * Returns Trust Fund transaction log (paginated).
 */
exports.getTrustFundLog = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT id, source_type, source_ref_id, credit_amount, debit_amount, balance_after, note, created_at
       FROM trust_fund_log
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query(`SELECT COUNT(*) FROM trust_fund_log`);

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Trust fund log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/reserve-fund
 * Returns Reserve Fund transaction log (paginated).
 */
exports.getReserveFundLog = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT id, source_type, source_ref_id, credit_amount, debit_amount, balance_after, note, created_at
       FROM reserve_fund_log
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query(`SELECT COUNT(*) FROM reserve_fund_log`);

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Reserve fund log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/profit-distributions
 * Returns the profit_distribution_log with line items for admin audit.
 */
exports.getProfitDistributionLog = async (req, res) => {
  try {
    const { page = 1, limit = 20, channel } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [parseInt(limit), offset];
    let channelFilter = '';
    if (channel && ['B2B', 'B2C'].includes(channel.toUpperCase())) {
      params.push(channel.toUpperCase());
      channelFilter = `WHERE pdl.channel = $${params.length}`;
    }

    const result = await db.query(
      `SELECT pdl.id, pdl.order_id, o.order_number, pdl.channel,
              pdl.total_profit, pdl.status, pdl.processed_at,
              json_agg(dli ORDER BY dli.id) AS line_items
       FROM profit_distribution_log pdl
       JOIN orders o ON pdl.order_id = o.id
       LEFT JOIN distribution_line_items dli ON dli.distribution_id = pdl.id
       ${channelFilter}
       GROUP BY pdl.id, o.order_number
       ORDER BY pdl.processed_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countResult = await db.query(`SELECT COUNT(*) FROM profit_distribution_log`);

    res.json({
      distributions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Profit distribution log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// USER WALLETS (Core Body, Businessman, etc.)
// ─────────────────────────────────────────────

/**
 * GET /api/wallet/me
 * Returns the current user's aggregated wallet balances and recent transactions.
 */
exports.getMyWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const walletResult = await db.query(
      `SELECT wt.type_code, w.balance, w.id as wallet_id, w.is_frozen
       FROM wallets w
       JOIN wallet_types wt ON w.wallet_type_id = wt.id
       WHERE w.user_id = $1`,
      [userId]
    );

    const walletData = {
      main_balance: 0,
      referral_balance: 0,
      trust_balance: 0,
      reserve_balance: 0,
      is_frozen: false,
      currency: 'INR'
    };

    let primaryWalletId = null;

    walletResult.rows.forEach(row => {
      if (row.type_code === 'main') {
          walletData.main_balance = parseFloat(row.balance);
          primaryWalletId = row.wallet_id;
          walletData.is_frozen = row.is_frozen;
      } else if (row.type_code === 'referral') {
          walletData.referral_balance = parseFloat(row.balance);
      } else if (row.type_code === 'trust') {
          walletData.trust_balance = parseFloat(row.balance);
      } else if (row.type_code === 'reserve') {
          walletData.reserve_balance = parseFloat(row.balance);
      }
    });

    if (!primaryWalletId && walletResult.rows.length > 0) {
        primaryWalletId = walletResult.rows[0].wallet_id;
    }

    const txnResult = primaryWalletId ? await db.query(
      `SELECT id, transaction_type as txn_type, amount, source_type, source_ref_id, description, created_at
       FROM wallet_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    ) : { rows: [] };

    res.json({ wallet: walletData, recent_transactions: txnResult.rows });
  } catch (err) {
    console.error('Get my wallet error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/wallet/withdraw
 * Creates a withdrawal request for the logged-in user.
 */
exports.requestWithdrawal = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const userId = req.user.id;
    const { amount, bank_account_id, upi_id, notes } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    await client.query('BEGIN');

    // Check 'main' wallet balance
    const walletResult = await client.query(
      `SELECT w.id, w.balance as main_balance, w.is_frozen 
       FROM wallets w
       JOIN wallet_types wt ON w.wallet_type_id = wt.id
       WHERE w.user_id = $1 AND wt.type_code = 'main' FOR UPDATE`,
      [userId]
    );

    if (walletResult.rows.length === 0) {
      throw new Error('Wallet not found');
    }

    const wallet = walletResult.rows[0];

    if (wallet.is_frozen) {
      throw new Error('Your wallet is frozen. Please contact support.');
    }

    const balance = parseFloat(wallet.main_balance);
    if (balance < parseFloat(amount)) {
      throw new Error(`Insufficient balance. Available: ₹${balance.toFixed(2)}`);
    }

    // Create withdrawal request (pending admin approval)
    const result = await client.query(
      `INSERT INTO withdrawal_requests 
       (user_id, wallet_id, requested_amount, bank_account_id, upi_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *`,
      [userId, wallet.id, amount, bank_account_id || null, upi_id || null, notes || null]
    );

    // Reserve the amount (deduct from available balance)
    await client.query(
      `UPDATE wallets SET balance = balance - $1, updated_at = NOW()
       WHERE id = $2`,
      [amount, wallet.id]
    );

    // Log the transaction
    await client.query(
      `INSERT INTO wallet_transactions 
       (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
       VALUES ($1, $2, 'debit', $3, $4, $5, 'withdrawal_request', $6, 'Withdrawal request pending approval')`,
      [wallet.id, userId, amount, balance, balance - parseFloat(amount), result.rows[0].id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Withdrawal request submitted. Pending admin approval.',
      request: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * GET /api/wallet/admin/withdrawals
 * Admin: Get all pending withdrawal requests.
 */
exports.getWithdrawalRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT wr.*, u.full_name, u.email, u.phone, ur.role_code,
              w.balance as current_wallet_balance
       FROM withdrawal_requests wr
       JOIN users u ON wr.user_id = u.id
       JOIN user_roles ur ON u.role_id = ur.id
       JOIN wallets w ON wr.wallet_id = w.id
       WHERE wr.status = $1
       ORDER BY wr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, parseInt(limit), offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM withdrawal_requests WHERE status = $1`, [status]
    );

    res.json({
      requests: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get withdrawal requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/wallet/admin/withdrawals/:id/approve
 * Admin: Approve a withdrawal request.
 */
exports.approveWithdrawal = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { transaction_ref, notes } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT * FROM withdrawal_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      throw new Error('Withdrawal request not found or already processed');
    }

    await client.query(
      `UPDATE withdrawal_requests 
       SET status = 'approved', processed_by = $1, processed_at = NOW(),
           transaction_ref = $2, admin_notes = $3
       WHERE id = $4`,
      [adminId, transaction_ref || null, notes || null, id]
    );

    // Log the approval in wallet_transactions
    await client.query(
      `INSERT INTO wallet_transactions
       (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
       VALUES ($1, $2, 'debit_confirmed', $3, $4, $4, 'withdrawal_approved', $5, 'Withdrawal approved by admin')`,
      [reqResult.rows[0].wallet_id, reqResult.rows[0].user_id, reqResult.rows[0].requested_amount, 0, id] // balance_before/after not used for confirm?
    );

    await client.query('COMMIT');
    res.json({ message: 'Withdrawal approved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * PUT /api/wallet/admin/withdrawals/:id/reject
 * Admin: Reject a withdrawal request and refund the amount to user wallet.
 */
exports.rejectWithdrawal = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT * FROM withdrawal_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      throw new Error('Withdrawal request not found or already processed');
    }

    const wr = reqResult.rows[0];

    // Refund the reserved amount back to wallet
    await client.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
      [wr.requested_amount, wr.wallet_id]
    );

    await client.query(
      `UPDATE withdrawal_requests 
       SET status = 'rejected', processed_by = $1, processed_at = NOW(), admin_notes = $2
       WHERE id = $3`,
      [adminId, reason || null, id]
    );

    // Log the refund
    const currentBalanceRes = await client.query('SELECT balance FROM wallets WHERE id = $1', [wr.wallet_id]);
    const currentBalance = parseFloat(currentBalanceRes.rows[0].balance);

    await client.query(
      `INSERT INTO wallet_transactions
       (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
       VALUES ($1, $2, 'credit', $3, $4, $5, 'withdrawal_rejected', $6, $7)`,
      [wr.wallet_id, wr.user_id, wr.requested_amount, currentBalance - parseFloat(wr.requested_amount), currentBalance, id, `Withdrawal rejected: ${reason || 'No reason given'}`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Withdrawal rejected and amount refunded to wallet.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * GET /api/wallet/admin/profit-rules
 * Admin: Get current active profit distribution rules.
 */
exports.getProfitRules = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profit_rules WHERE is_current = TRUE ORDER BY channel');
    res.json({ rules: result.rows });
  } catch (err) {
    console.error('Get profit rules error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/wallet/admin/profit-rules/:id
 * Admin: Update a profit rule (archives old, creates new).
 */
exports.updateProfitRule = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const updates = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    // 1. Get current rule
    const currentRes = await client.query('SELECT * FROM profit_rules WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      throw new Error('Profit rule not found');
    }
    const current = currentRes.rows[0];

    // 2. Mark current as not active
    await client.query(
      'UPDATE profit_rules SET is_current = FALSE, effective_to = NOW() WHERE id = $1',
      [id]
    );

    // 3. Insert new rule
    const fields = [
      'channel', 'fts_share_pct', 'referral_share_pct', 'trust_fund_pct', 'admin_pct',
      'company_pct', 'core_body_pool_pct', 'company_reserve_pct', 'stock_point_pct', 'referral_pct'
    ];

    const values = fields.map(f => updates[f] !== undefined ? updates[f] : current[f]);

    const insertQuery = `
      INSERT INTO profit_rules (${fields.join(', ')}, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [...values, adminId]);

    await client.query('COMMIT');
    res.json({ message: 'Profit rule updated successfully', rule: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update profit rule error:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * GET /api/wallet/admin/reserve-fund
 * Admin: Get reserve fund transaction log.
 */
exports.getReserveFundLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT * FROM reserve_fund_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM reserve_fund_log');

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Get reserve fund log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/profit-distributions
 * Admin: Get overall profit distribution logs.
 */
exports.getProfitLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT pd.*, o.order_number, pr.channel as rule_channel
       FROM profit_distribution_log pd
       JOIN orders o ON pd.order_id = o.id
       JOIN profit_rules pr ON pd.rule_id = pr.id
       ORDER BY pd.processed_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM profit_distribution_log');

    res.json({
      distributions: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Get profit log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/company-pool
 * Admin: Get company pool (Core Body share) log.
 */
exports.getCompanyPoolLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT cp.*, pd.channel, o.order_number
       FROM company_pool_log cp
       JOIN profit_distribution_log pd ON cp.distribution_id = pd.id
       JOIN orders o ON pd.order_id = o.id
       ORDER BY cp.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM company_pool_log');

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Get company pool log error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * GET /api/wallet/me/transactions
 * Returns paginated transaction log for the current user.
 */
exports.getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, wallet } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get wallet ID first
    const walletRes = await db.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    if (walletRes.rows.length === 0) return res.json({ transactions: [], total: 0 });
    const walletId = walletRes.rows[0].id;

    let query = `SELECT * FROM wallet_transactions WHERE wallet_id = $1`;
    let countQuery = `SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = $1`;
    const params = [walletId];

    if (type) {
      params.push(type);
      query += ` AND txn_type = $${params.length}`;
      countQuery += ` AND txn_type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    const countResult = await db.query(countQuery, params.slice(0, params.length - 2));

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get my transactions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/me/withdrawals
 * Returns withdrawal history for the current user.
 */
exports.getMyWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM withdrawal_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ withdrawals: result.rows });
  } catch (err) {
    console.error('Get my withdrawals error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
