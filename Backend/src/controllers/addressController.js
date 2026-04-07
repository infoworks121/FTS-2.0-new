const { pool } = require('../config/db');

const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [userId]
        );
        res.json({ addresses: result.rows });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
};

const addAddress = async (req, res) => {
    const { label, street_address, city, state, pincode, is_default } = req.body;
    const userId = req.user.id;

    if (!label || !street_address || !city || !state || !pincode) {
        return res.status(400).json({ error: 'Missing required address fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (is_default) {
            // Unset other defaults for this user
            await client.query(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
                [userId]
            );
        }

        const result = await client.query(
            `INSERT INTO user_addresses (user_id, label, street_address, city, state, pincode, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, label, street_address, city, state, pincode, is_default || false]
        );

        await client.query('COMMIT');
        res.status(201).json({ address: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Failed to add address' });
    } finally {
        client.release();
    }
};

const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { label, street_address, city, state, pincode, is_default } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (is_default) {
            await client.query(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
                [userId]
            );
        }

        const result = await client.query(
            `UPDATE user_addresses 
             SET label = COALESCE($1, label),
                 street_address = COALESCE($2, street_address),
                 city = COALESCE($3, city),
                 state = COALESCE($4, state),
                 pincode = COALESCE($5, pincode),
                 is_default = COALESCE($6, is_default),
                 updated_at = NOW()
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [label, street_address, city, state, pincode, is_default, id, userId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Address not found or unauthorized' });
        }

        await client.query('COMMIT');
        res.json({ address: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Failed to update address' });
    } finally {
        client.release();
    }
};

const deleteAddress = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found or unauthorized' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
};

const setDefaultAddress = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
            [userId]
        );

        const result = await client.query(
            'UPDATE user_addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Address not found or unauthorized' });
        }

        await client.query('COMMIT');
        res.json({ address: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Set default address error:', error);
        res.status(500).json({ error: 'Failed to set default address' });
    } finally {
        client.release();
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
