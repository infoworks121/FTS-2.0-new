const db = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Helper to get active gateway configuration
 */
async function getActiveGateway(name) {
  const result = await db.query(
    'SELECT * FROM gateway_configurations WHERE gateway_name = $1 AND is_active = true',
    [name]
  );
  return result.rows[0];
}

/**
 * POST /api/wallet/payment/razorpay/create-order
 * Initializes a Razorpay order.
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const config = await getActiveGateway('razorpay');
    if (!config) {
      return res.status(400).json({ error: 'Razorpay is currently disabled. Contact admin.' });
    }

    const instance = new Razorpay({
      key_id: config.api_key,
      key_secret: config.api_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    // Track the request in our DB
    await db.query(
      `INSERT INTO wallet_deposit_requests (user_id, wallet_id, amount, payment_method, gateway_name, gateway_order_id, status)
       VALUES ($1, (SELECT id FROM wallets WHERE user_id = $1), $2, 'online', 'razorpay', $3, 'pending')`,
      [userId, amount, order.id]
    );

    res.json({
      order_id: order.id,
      amount: options.amount,
      currency: options.currency,
      key_id: config.api_key
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

/**
 * POST /api/wallet/payment/razorpay/verify
 * Verifies the payment signature and updates the wallet status.
 */
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const config = await getActiveGateway('razorpay');
    if (!config) return res.status(400).json({ error: 'Gateway config missing' });

    const generated_signature = crypto
      .createHmac('sha256', config.api_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed (Invalid Signature)' });
    }

    // Update deposit request
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const depositRes = await client.query(
        `UPDATE wallet_deposit_requests 
         SET status = 'approved', 
             gateway_payment_id = $1, 
             gateway_signature = $2,
             processed_at = NOW() 
         WHERE gateway_order_id = $3 AND user_id = $4 AND status = 'pending'
         RETURNING wallet_id, amount`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id, userId]
      );

      if (depositRes.rows.length > 0) {
        const { wallet_id, amount } = depositRes.rows[0];
        
        // Update Wallet Balance
        const walletResult = await client.query(
          'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
          [amount, wallet_id]
        );

        const newBalance = parseFloat(walletResult.rows[0].balance);
        const oldBalance = newBalance - parseFloat(amount);

        // Record Transaction
        await client.query(
          `INSERT INTO wallet_transactions 
           (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
           VALUES ($1, $2, 'credit', $3, $4, $5, 'online_deposit', $6, $7)`,
          [wallet_id, userId, amount, oldBalance, newBalance, depositRes.rows[0].id, `Instant Deposit via Razorpay. Payment ID: ${razorpay_payment_id}`]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Payment verified and wallet updated.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};
