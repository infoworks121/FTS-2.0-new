const db = require('../config/db');

// Get all roles
const getAllRoles = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, role_code, role_label, description FROM user_roles ORDER BY id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching roles' });
    }
};

// Get role by code
const getRoleByCode = async (req, res) => {
    const { role_code } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM user_roles WHERE role_code = $1',
            [role_code]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllRoles,
    getRoleByCode,
};
