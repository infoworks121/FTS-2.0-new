const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────
// ADMIN VIEWS
// ─────────────────────────────────────────────

/**
 * GET /api/wallet/admin/overview
 * Returns balance summaries for Trust Fund, Reserve Fund, and Company Pool.
 */
exports.getAdminWalletOverview = async (req, res) => {
  try {
    const [trust, reserve, pool, distributed, withdrawals] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(credit_amount) - SUM(COALESCE(debit_amount, 0)), 0) AS balance FROM trust_fund_log`),
      db.query(`SELECT COALESCE(SUM(credit_amount) - SUM(COALESCE(debit_amount, 0)), 0) AS balance FROM reserve_fund_log`),
      db.query(`SELECT COALESCE(SUM(total_pool_amount), 0) AS total FROM company_pool_log`),
      db.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM wallet_transactions WHERE transaction_type = 'credit' AND source_type IN ('profit_distribution', 'referral_commission')`),
      db.query(`
        SELECT 
          COALESCE(SUM(requested_amount) FILTER (WHERE status = 'approved'), 0) as paid,
          COALESCE(SUM(requested_amount) FILTER (WHERE status = 'pending'), 0) as pending
        FROM withdrawal_requests
      `)
    ]);

    res.json({
      trust_fund: parseFloat(trust.rows[0].balance || 0),
      reserve_fund: parseFloat(reserve.rows[0].balance || 0),
      company_pool: parseFloat(pool.rows[0].total || 0),
      total_distributed: parseFloat(distributed.rows[0].total || 0),
      total_withdrawals_paid: parseFloat(withdrawals.rows[0].paid || 0),
      pending_withdrawals: parseFloat(withdrawals.rows[0].pending || 0),
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

    let walletResult = await db.query(
      `SELECT wt.type_code, w.balance, w.id as wallet_id, w.is_frozen
       FROM wallets w
       JOIN wallet_types wt ON w.wallet_type_id = wt.id
       WHERE w.user_id = $1`,
      [userId]
    );

    // Auto-create 'main' wallet if missing
    const hasMain = walletResult.rows.some(r => r.type_code === 'main');
    if (!hasMain) {
        const typeRes = await db.query(`SELECT id FROM wallet_types WHERE type_code = 'main'`);
        if (typeRes.rows.length > 0) {
            const newWallet = await db.query(
                `INSERT INTO wallets (user_id, wallet_type_id, balance) VALUES ($1, $2, 0) RETURNING id`,
                [userId, typeRes.rows[0].id]
            );
            // Refresh walletResult
            walletResult = await db.query(
                `SELECT wt.type_code, w.balance, w.id as wallet_id, w.is_frozen
                 FROM wallets w
                 JOIN wallet_types wt ON w.wallet_type_id = wt.id
                 WHERE w.user_id = $1`,
                [userId]
            );
        }
    }

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
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get wallet ID first
    const walletRes = await db.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    if (walletRes.rows.length === 0) return res.json({ transactions: [], total: 0 });
    const walletId = walletRes.rows[0].id;

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
        (
          SELECT STRING_AGG(p.name || ' x' || (oi.quantity::int), ', ')
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = wt.source_ref_id AND wt.source_type = 'order_payment'
        ) as items_summary
      FROM wallet_transactions wt
      WHERE wt.wallet_id = $1`;
    let countQuery = `SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = $1`;
    const params = [walletId];

    if (type) {
      params.push(type);
      query += ` AND transaction_type = $${params.length}`;
      countQuery += ` AND transaction_type = $${params.length}`;
    }

    query += ` ORDER BY wt.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

/**
 * POST /api/wallet/admin/add-funds
 * Admin: Add funds to a user's wallet.
 */
exports.addFunds = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { user_id, amount, bank_ref, notes } = req.body;
    const adminId = req.user.id;

    if (!user_id || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid user_id and positive amount are required' });
    }

    await client.query('BEGIN');

    // Get or create 'main' wallet for user
    let walletResult = await client.query(
      `SELECT w.id, w.balance 
       FROM wallets w
       JOIN wallet_types wt ON w.wallet_type_id = wt.id
       WHERE w.user_id = $1 AND wt.type_code = 'main' FOR UPDATE`,
      [user_id]
    );

    let walletId;
    let oldBalance = 0;

    if (walletResult.rows.length === 0) {
      // Create main wallet
      const typeRes = await client.query(`SELECT id FROM wallet_types WHERE type_code = 'main'`);
      if (typeRes.rows.length === 0) throw new Error('Main wallet type not configured in DB.');
      
      const newWallet = await client.query(
        `INSERT INTO wallets (user_id, wallet_type_id, balance) VALUES ($1, $2, $3) RETURNING id`,
        [user_id, typeRes.rows[0].id, amount]
      );
      walletId = newWallet.rows[0].id;
    } else {
      walletId = walletResult.rows[0].id;
      oldBalance = parseFloat(walletResult.rows[0].balance);
      
      // Update balance
      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
        [amount, walletId]
      );
    }

    const newBalance = oldBalance + parseFloat(amount);

    // Record Transaction
    await client.query(
      `INSERT INTO wallet_transactions
       (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, description)
       VALUES ($1, $2, 'credit', $3, $4, $5, 'admin_deposit', $6)`,
      [
        walletId, 
        user_id, 
        amount, 
        oldBalance, 
        newBalance, 
        `Funds added by Admin. Ref: ${bank_ref || 'N/A'}. Notes: ${notes || ''}`
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'Funds successfully added to user wallet.', new_balance: newBalance });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Add funds error:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * POST /api/wallet/me/set-pin
 * User: Set or update 6-digit transaction PIN.
 */
exports.setPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;

    if (!pin || pin.length !== 6 || isNaN(pin)) {
      return res.status(400).json({ error: 'PIN must be a 6-digit number.' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await db.query(
      `UPDATE wallets SET transaction_pin = $1, updated_at = NOW() WHERE user_id = $2`,
      [hashedPin, userId]
    );

    res.json({ message: 'Transaction PIN set successfully.' });
  } catch (err) {
    console.error('Set pin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/wallet/me/deposit-request
 * Businessman: Submit a manual deposit request with bank/cash slip.
 */
exports.createDepositRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, payment_method, transaction_ref, slip_url, user_note } = req.body;

    if (!amount || parseFloat(amount) <= 0 || !payment_method) {
      return res.status(400).json({ error: 'Amount and payment method are required.' });
    }

    // Get primary wallet
    let walletRes = await db.query(
      `SELECT id FROM wallets WHERE user_id = $1`, [userId]
    );
    
    // Auto-create if not found
    if (walletRes.rows.length === 0) {
      const typeRes = await db.query(`SELECT id FROM wallet_types WHERE type_code = 'main'`);
      if (typeRes.rows.length > 0) {
          const newWallet = await db.query(
              `INSERT INTO wallets (user_id, wallet_type_id, balance) VALUES ($1, $2, 0) RETURNING id`,
              [userId, typeRes.rows[0].id]
          );
          walletRes = { rows: [newWallet.rows[0]] };
      } else {
          return res.status(404).json({ error: 'Wallet system not initialized. Contact admin.' });
      }
    }
    const walletId = walletRes.rows[0].id;

    const result = await db.query(
      `INSERT INTO wallet_deposit_requests 
       (user_id, wallet_id, amount, payment_method, transaction_ref, slip_url, user_note, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [userId, walletId, amount, payment_method, transaction_ref || null, slip_url || null, user_note || null]
    );

    res.status(201).json({ 
      message: 'Deposit request submitted successfully. Waiting for admin approval.',
      request: result.rows[0]
    });
  } catch (err) {
    console.error('Create deposit request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/me/deposit-requests
 * User: View own deposit requests.
 */
exports.getMyDepositRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM wallet_deposit_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('Get my deposit requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/wallet/admin/deposit-requests
 * Admin: List all pending deposit requests.
 */
exports.getAllDepositRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const result = await db.query(
      `SELECT r.*, u.full_name, u.email, u.phone 
       FROM wallet_deposit_requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.status = $1
       ORDER BY r.created_at DESC`,
      [status]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error('Get admin deposit requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/wallet/admin/deposit-requests/:id/status
 * Admin: Approve or Reject a deposit request.
 */
exports.updateDepositStatus = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body; // approved or rejected
    const adminId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use approved or rejected.' });
    }

    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT * FROM wallet_deposit_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`,
      [id]
    );

    if (reqResult.rows.length === 0) {
      throw new Error('Deposit request not found or already processed.');
    }

    const depositReq = reqResult.rows[0];

    // Update request status
    await client.query(
      `UPDATE wallet_deposit_requests 
       SET status = $1, admin_note = $2, processed_by = $3, processed_at = NOW() 
       WHERE id = $4`,
      [status, admin_note || null, adminId, id]
    );

    if (status === 'approved') {
      // 1. Get current balance
      const walletRes = await client.query(
        `SELECT balance FROM wallets WHERE id = $1 FOR UPDATE`, [depositReq.wallet_id]
      );
      const oldBalance = parseFloat(walletRes.rows[0].balance);
      const amount = parseFloat(depositReq.amount);
      const newBalance = oldBalance + amount;

      // 2. Update balance
      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
        [amount, depositReq.wallet_id]
      );

      // 3. Log transaction
      await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
         VALUES ($1, $2, 'credit', $3, $4, $5, 'deposit_request', $6, $7)`,
        [
          depositReq.wallet_id, 
          depositReq.user_id, 
          amount, 
          oldBalance, 
          newBalance, 
          id, 
          `Approved deposit from ${depositReq.payment_method}. ${admin_note || ''}`
        ]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `Deposit request ${status} successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update deposit status error:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};
