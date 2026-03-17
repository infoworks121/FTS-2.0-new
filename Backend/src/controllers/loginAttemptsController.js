const db = require('../config/db');

const getLoginAttempts = async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    try {
        const result = await db.query(
            `SELECT id, target, target_type, ip_address, success, panel, failure_reason, attempted_at 
             FROM login_attempts 
             WHERE target IN (SELECT phone FROM users WHERE id = $1 UNION SELECT email FROM users WHERE id = $1)
             ORDER BY attempted_at DESC 
             LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllLoginAttempts = async (req, res) => {
    const { limit = 100, offset = 0, success } = req.query;
    try {
        let query = `SELECT la.*, u.full_name, u.phone, u.email 
                     FROM login_attempts la 
                     LEFT JOIN users u ON (la.target = u.phone OR la.target = u.email)`;
        const params = [limit, offset];
        
        if (success !== undefined) {
            query += ` WHERE la.success = $3`;
            params.push(success === 'true');
        }
        
        query += ` ORDER BY la.attempted_at DESC LIMIT $1 OFFSET $2`;
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getLoginAttempts, getAllLoginAttempts };
