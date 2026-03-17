const db = require('../config/db');

const getActiveSessions = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, panel, ip_address, user_agent, expires_at, created_at 
             FROM user_sessions 
             WHERE user_id = $1 AND revoked = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const revokeSession = async (req, res) => {
    const { session_id } = req.params;
    try {
        await db.query(
            'UPDATE user_sessions SET revoked = TRUE, revoked_at = NOW() WHERE id = $1 AND user_id = $2',
            [session_id, req.user.id]
        );
        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const revokeAllSessions = async (req, res) => {
    try {
        await db.query(
            'UPDATE user_sessions SET revoked = TRUE, revoked_at = NOW() WHERE user_id = $1 AND revoked = FALSE',
            [req.user.id]
        );
        res.json({ message: 'All sessions revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getActiveSessions, revokeSession, revokeAllSessions };
