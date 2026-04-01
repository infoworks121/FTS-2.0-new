const db = require('../config/db');

/**
 * Get overall referral statistics for the logged-in user
 */
const getReferralStats = async (req, res) => {
    const userId = req.user.id;

    try {
        const statsResult = await db.query(
            `SELECT referral_code, total_referrals, total_earned 
             FROM referral_links 
             WHERE user_id = $1`,
            [userId]
        );

        if (statsResult.rows.length === 0) {
            return res.status(404).json({ message: 'Referral link not found' });
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
                COUNT(*) as total_referrals,
                COALESCE(SUM(CAST(gross_amount AS NUMERIC)), 0) as total_commissions_paid
            FROM referral_earnings
            WHERE status = 'processed'
        `;
        
        const countQuery = `SELECT COUNT(*) as total_registrations FROM referral_registrations`;

        const statsResult = await db.query(statsQuery);
        const countResult = await db.query(countQuery);

        res.json({
            total_referrals: parseInt(countResult.rows[0].total_registrations),
            total_commissions_paid: statsResult.rows[0].total_commissions_paid,
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
