const db = require('../config/db');

const getPendingUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.phone, u.email, u.full_name, r.role_code, u.district_id, u.created_at,
                   d.name as district_name,
                   bp.mode as businessman_type
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            LEFT JOIN districts d ON u.district_id = d.id
            LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
            WHERE u.is_approved = FALSE AND u.role_id != 1
            ORDER BY u.created_at DESC
        `);

        res.json({ users: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveUser = async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user.id;

    try {
        await db.query(
            'UPDATE users SET is_approved = TRUE, approved_by = $1, approved_at = NOW() WHERE id = $2',
            [adminId, userId]
        );

        res.json({ message: 'User approved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const rejectUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Delete related records first
        await db.query('DELETE FROM businessman_profiles WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM core_body_profiles WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_devices WHERE user_id = $1', [userId]);
        
        // Then delete the user
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        
        res.json({ message: 'User rejected and removed' });
    } catch (err) {
        console.error('Reject user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllBusinessmen = async (req, res) => {
    try {
        const { search, mode, district, status } = req.query;

        let query = `
            SELECT 
                u.id, u.full_name as name, u.email, u.phone,
                bp.mode, bp.is_active,
                bp.business_name, bp.commission_earned as total_earnings,
                bp.ytd_sales, bp.mtd_sales, bp.monthly_target,
                d.name as district, d.id as district_id,
                u.created_at,
                u.is_approved,
                CASE WHEN u.is_approved = TRUE AND bp.is_active = TRUE THEN 'active'
                     WHEN bp.is_active = FALSE THEN 'inactive'
                     ELSE 'suspended' END as status
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            JOIN businessman_profiles bp ON u.id = bp.user_id
            LEFT JOIN districts d ON bp.district_id = d.id
            WHERE r.role_code = 'businessman'
        `;

        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR CAST(u.id AS TEXT) ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (mode) {
            query += ` AND bp.mode = $${paramIndex}`;
            params.push(mode);
            paramIndex++;
        }
        if (district) {
            query += ` AND d.name = $${paramIndex}`;
            params.push(district);
            paramIndex++;
        }
        if (status === 'active') {
            query += ` AND u.is_approved = TRUE AND bp.is_active = TRUE`;
        } else if (status === 'inactive') {
            query += ` AND bp.is_active = FALSE`;
        } else if (status === 'suspended') {
            query += ` AND u.is_approved = FALSE`;
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);

        // KPI summary
        const kpiResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE u.is_approved = TRUE AND bp.is_active = TRUE) as active,
                COALESCE(SUM(bp.commission_earned), 0) as total_earnings
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            JOIN businessman_profiles bp ON u.id = bp.user_id
            WHERE r.role_code = 'businessman'
        `);

        res.json({
            businessmen: result.rows,
            kpis: kpiResult.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPendingUsers, approveUser, rejectUser, getAllBusinessmen };
