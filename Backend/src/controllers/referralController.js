const db = require('../config/db');

/**
 * Get overall referral statistics for the logged-in user
 */
const getReferralStats = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Check if stats entry already exists
        let statsResult = await db.query(
            `SELECT referral_code, total_referrals, total_earned 
             FROM referral_links 
             WHERE user_id = $1`,
            [userId]
        );
        
        // 2. If not found, check if user is eligible to have one generated on-the-fly
        if (statsResult.rows.length === 0) {
            const userCheck = await db.query(
                `SELECT u.id, ur.role_code, bp.type as businessman_type
                 FROM users u
                 JOIN user_roles ur ON u.role_id = ur.id
                 LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
                 WHERE u.id = $1`,
                [userId]
            );

            if (userCheck.rows.length > 0) {
                const user = userCheck.rows[0];
                const isEligible = 
                    (user.role_code === 'businessman' && user.businessman_type === 'retailer_a') ||
                    user.role_code === 'core_body_a' ||
                    user.role_code === 'core_body_b';

                if (isEligible) {
                    const newReferralCode = `FTS${Date.now()}${Math.floor(Math.random() * 1000)}`;
                    
                    // Update user table
                    await db.query(`UPDATE users SET referral_code = $1 WHERE id = $2`, [newReferralCode, userId]);
                    
                    // Create referral_links entry
                    await db.query(
                        `INSERT INTO referral_links (user_id, referral_code) VALUES ($1, $2)`,
                        [userId, newReferralCode]
                    );

                    // Re-fetch to get the initial stats
                    statsResult = await db.query(
                        `SELECT referral_code, total_referrals, total_earned 
                         FROM referral_links 
                         WHERE user_id = $1`,
                        [userId]
                    );
                }
            }
        }

        if (statsResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Referral system is currently restricted for your account category. Only Retailer A, Core Body A, and Core Body B members are eligible for referral links.' 
            });
        }

        const stats = statsResult.rows[0];
        // Generate a dynamic referral link (Example URL structure)
        const referralLink = `${process.env.FRONTEND_URL || 'https://fts.com'}/register?ref=${stats.referral_code}`;

        res.json({
            ...stats,
            referral_link: referralLink
        });
    } catch (err) {
        console.error('Error fetching referral stats:', err);
        res.status(500).json({ message: 'Server error while fetching referral stats' });
    }
};

/**
 * Get a list of users referred by the current user
 */
const getMyReferrals = async (req, res) => {
    const userId = req.user.id;

    try {
        const referralsResult = await db.query(
            `SELECT u.id, u.full_name, u.phone, u.created_at, ur.role_label
             FROM referral_registrations rr
             JOIN users u ON rr.referred_id = u.id
             JOIN user_roles ur ON u.role_id = ur.id
             WHERE rr.referrer_id = $1
             ORDER BY u.created_at DESC`,
            [userId]
        );

        res.json(referralsResult.rows);
    } catch (err) {
        console.error('Error fetching referral list:', err);
        res.status(500).json({ message: 'Server error while fetching referral list' });
    }
};

/**
 * Get referral earning history linked to orders
 */
const getEarningsHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const earningsResult = await db.query(
            `SELECT re.id, re.order_id, re.gross_amount, re.status, re.created_at, u.full_name as referred_user_name
             FROM referral_earnings re
             JOIN users u ON re.referred_user_id = u.id
             WHERE re.referrer_id = $1
             ORDER BY re.created_at DESC`,
            [userId]
        );

        res.json(earningsResult.rows);
    } catch (err) {
        console.error('Error fetching earning history:', err);
        res.status(500).json({ message: 'Server error while fetching earning history' });
    }
};

/**
 * @desc    Get all referral registrations (Admin)
 * @access  Private/Admin
 */
const adminGetAllReferrals = async (req, res) => {
    try {
        const query = `
            SELECT 
                rr.id,
                rr.created_at,
                u_ref.full_name as referrer_name,
                u_ref.phone as referrer_phone,
                u_referred.full_name as referred_name,
                u_referred.phone as referred_phone,
                u_referred.id as referred_id,
                ur_referred.role_label as referred_role
            FROM referral_registrations rr
            JOIN users u_ref ON rr.referrer_id = u_ref.id
            JOIN users u_referred ON rr.referred_id = u_referred.id
            JOIN user_roles ur_referred ON u_referred.role_id = ur_referred.id
            ORDER BY rr.created_at DESC
        `;

        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching global referrals:', err);
        res.status(500).json({ message: 'Server error while fetching global referrals' });
    }
};

/**
 * @desc    Get all referral earnings log (Admin)
 * @access  Private/Admin
 */
const adminGetGlobalEarnings = async (req, res) => {
    try {
        const query = `
            SELECT 
                re.id,
                re.order_id,
                re.gross_amount,
                re.status,
                re.created_at,
                u_referrer.full_name as referrer_name,
                u_referred.full_name as referred_user_name
            FROM referral_earnings re
            JOIN users u_referrer ON re.referrer_id = u_referrer.id
            JOIN users u_referred ON re.referred_user_id = u_referred.id
            ORDER BY re.created_at DESC
        `;

        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching global earnings:', err);
        res.status(500).json({ message: 'Server error while fetching global earnings' });
    }
};

/**
 * @desc    Get global referral statistics (Admin)
 * @access  Private/Admin
 */
const adminGetReferralStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COALESCE(SUM(CAST(gross_amount AS NUMERIC)) FILTER (WHERE status = 'processed'), 0) as available_balance,
                COALESCE(SUM(CAST(gross_amount AS NUMERIC)) FILTER (WHERE status = 'pending'), 0) as pending_balance,
                COALESCE(SUM(CAST(gross_amount AS NUMERIC)) FILTER (WHERE status = 'processed' AND created_at >= date_trunc('month', CURRENT_DATE)), 0) as released_this_month,
                COUNT(*) FILTER (WHERE status IN ('reversed', 'flagged')) as fraud_counts
            FROM referral_earnings
        `;
        
        const countQuery = `SELECT COUNT(*) as total_registrations FROM referral_registrations`;

        const statsResult = await db.query(statsQuery);
        const countResult = await db.query(countQuery);

        res.json({
            available_balance: statsResult.rows[0].available_balance,
            pending_balance: statsResult.rows[0].pending_balance,
            released_this_month: statsResult.rows[0].released_this_month,
            fraud_counts: parseInt(statsResult.rows[0].fraud_counts),
            total_referrals: parseInt(countResult.rows[0].total_registrations),
        });
    } catch (err) {
        console.error('Error fetching global referral stats:', err);
        res.status(500).json({ message: 'Server error while fetching global referral stats' });
    }
};

module.exports = {
    getReferralStats,
    getMyReferrals,
    getEarningsHistory,
    adminGetAllReferrals,
    adminGetGlobalEarnings,
    adminGetReferralStats,
};
