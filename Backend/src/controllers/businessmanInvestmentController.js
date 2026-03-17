const db = require('../config/db');

// Get all installments for a businessman
const getInstallments = async (req, res) => {
    const { businessman_id } = req.params;
    try {
        const result = await db.query(
            `SELECT * FROM businessman_investments WHERE businessman_id = $1 ORDER BY installment_no ASC`,
            [businessman_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get installments for logged-in retailer_a user
const getMyInstallments = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await db.query(
            `SELECT bi.* FROM businessman_investments bi
             JOIN businessman_profiles bp ON bi.businessman_id = bp.id
             WHERE bp.user_id = $1
             ORDER BY bi.installment_no ASC`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update installment status (admin)
const updateInstallmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status, payment_ref, paid_date } = req.body;
    try {
        const result = await db.query(
            `UPDATE businessman_investments
             SET status = $1, payment_ref = $2, paid_date = $3
             WHERE id = $4 RETURNING *`,
            [status, payment_ref || null, paid_date || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Installment not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getInstallments, getMyInstallments, updateInstallmentStatus };
