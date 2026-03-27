const db = require('../config/db');

/**
 * Wallet Service
 * Handles atomic balance updates and transaction logging for a multi-wallet system.
 */

/**
 * Credits a specific wallet for a user.
 * 
 * @param {string} userId - UUID of the user
 * @param {string} walletTypeCode - 'main', 'referral', 'trust', 'reserve'
 * @param {number} amount - Amount to credit
 * @param {string} sourceType - Description of source (e.g., 'order_profit', 'referral_bonus')
 * @param {string} sourceRefId - UUID of the source record (e.g., orderId)
 * @param {string} description - Human-readable description
 * @param {object} client - Optional DB client for transaction participation
 */
exports.creditWallet = async (userId, walletTypeCode, amount, sourceType, sourceRefId, description, client = db) => {
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // 1. Get Wallet Type ID
    const typeRes = await client.query(
        `SELECT id FROM wallet_types WHERE type_code = $1`,
        [walletTypeCode]
    );
    if (typeRes.rows.length === 0) throw new Error(`Invalid wallet type: ${walletTypeCode}`);
    const typeId = typeRes.rows[0].id;

    // 2. Ensure Wallet exists for this user/type (Upsert)
    // In a production system, wallets are usually created on user registration.
    // Here we ensure it exists before update.
    await client.query(
        `INSERT INTO wallets (user_id, wallet_type_id, balance)
         VALUES ($1, $2, 0)
         ON CONFLICT (user_id, wallet_type_id) DO NOTHING`,
        [userId, typeId]
    );

    // 3. Update Balance (Atomic)
    const updateRes = await client.query(
        `UPDATE wallets 
         SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2 AND wallet_type_id = $3
         RETURNING id, balance`,
        [amountVal, userId, typeId]
    );

    const wallet = updateRes.rows[0];

    // 4. Log Transaction
    await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
         VALUES ($1, $2, 'credit', $3, $4, $5, $6, $7, $8)`,
        [
            wallet.id, 
            userId, 
            amountVal, 
            wallet.balance - amountVal, 
            wallet.balance, 
            sourceType, 
            sourceRefId, 
            description
        ]
    );

    return wallet;
};

/**
 * Debits a specific wallet for a user.
 * 
 * @param {string} userId - UUID of the user
 * @param {string} walletTypeCode - 'main', 'referral'
 * @param {number} amount - Amount to debit
 * @param {string} sourceType - Description of source
 * @param {string} sourceRefId - UUID of the source record
 * @param {string} description - Human-readable description
 * @param {object} client - Optional DB client
 */
exports.debitWallet = async (userId, walletTypeCode, amount, sourceType, sourceRefId, description, client = db) => {
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    // 1. Get Wallet Type ID
    const typeRes = await client.query(
        `SELECT id FROM wallet_types WHERE type_code = $1`,
        [walletTypeCode]
    );
    if (typeRes.rows.length === 0) throw new Error(`Invalid wallet type: ${walletTypeCode}`);
    const typeId = typeRes.rows[0].id;

    // 2. Lock and Check Balance
    const walletRes = await client.query(
        `SELECT id, balance FROM wallets WHERE user_id = $1 AND wallet_type_id = $2 FOR UPDATE`,
        [userId, typeId]
    );

    if (walletRes.rows.length === 0 || parseFloat(walletRes.rows[0].balance) < amountVal) {
        throw new Error('Insufficient balance');
    }

    const wallet = walletRes.rows[0];
    const newBalance = parseFloat(wallet.balance) - amountVal;

    // 3. Update Balance
    await client.query(
        `UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2`,
        [newBalance, wallet.id]
    );

    // 4. Log Transaction
    await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
         VALUES ($1, $2, 'debit', $3, $4, $5, $6, $7, $8)`,
        [
            wallet.id, 
            userId, 
            amountVal, 
            wallet.balance, 
            newBalance, 
            sourceType, 
            sourceRefId, 
            description
        ]
    );

    return { id: wallet.id, balance: newBalance };
};
