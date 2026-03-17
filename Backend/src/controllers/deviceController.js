const db = require('../config/db');

// Get user devices
const getUserDevices = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, device_fingerprint, device_type, os, browser, 
                    first_seen_at, last_seen_at, is_flagged, flag_reason 
             FROM user_devices 
             WHERE user_id = $1 
             ORDER BY last_seen_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching devices' });
    }
};

// Flag a device (Admin only)
const flagDevice = async (req, res) => {
    const { device_id, flag_reason } = req.body;
    try {
        const result = await db.query(
            `UPDATE user_devices 
             SET is_flagged = TRUE, flag_reason = $1 
             WHERE id = $2 
             RETURNING *`,
            [flag_reason, device_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Device not found' });
        }

        res.json({ message: 'Device flagged successfully', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error flagging device' });
    }
};

// Remove device
const removeDevice = async (req, res) => {
    const { device_id } = req.params;
    try {
        const result = await db.query(
            'DELETE FROM user_devices WHERE id = $1 AND user_id = $2 RETURNING *',
            [device_id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Device not found or unauthorized' });
        }

        res.json({ message: 'Device removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error removing device' });
    }
};

module.exports = {
    getUserDevices,
    flagDevice,
    removeDevice,
};
