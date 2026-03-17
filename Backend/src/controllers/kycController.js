const db = require('../config/db');
const crypto = require('crypto');

const uploadKYC = async (req, res) => {
    const { doc_type, doc_url, doc_number } = req.body;
    const user_id = req.user.id;

    try {
        if (!doc_type || !doc_url) {
            return res.status(400).json({ message: 'Document type and URL are required' });
        }

        // Hash document number for security
        const doc_number_hash = doc_number ? crypto.createHash('sha256').update(doc_number).digest('hex') : null;

        const result = await db.query(
            `INSERT INTO kyc_documents (user_id, doc_type, doc_url, doc_number_hash) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, doc_type, doc_url, doc_number_hash]
        );

        await db.query(
            'INSERT INTO kyc_audit_log (user_id, doc_id, action, performed_by, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [user_id, result.rows[0].id, 'UPLOAD', user_id, 'pending', 'KYC document uploaded']
        );

        res.status(201).json({
            message: 'KYC document uploaded successfully',
            data: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during KYC upload' });
    }
};

const getKYCStatus = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, doc_type, status, review_note, reviewed_at, uploaded_at FROM kyc_documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
            [req.user.id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching KYC status' });
    }
};

const reviewKYC = async (req, res) => {
    const { doc_id, status, note } = req.body; // status: 'approved', 'rejected'
    const admin_id = req.user.id;

    try {
        // Verify admin exists and doc exists
        const docResult = await db.query('SELECT * FROM kyc_documents WHERE id = $1', [doc_id]);
        if (docResult.rows.length === 0) {
            return res.status(404).json({ message: 'KYC document not found' });
        }

        const oldStatus = docResult.rows[0].status;

        // Update status
        const result = await db.query(
            `UPDATE kyc_documents 
       SET status = $1, reviewed_by = $2, review_note = $3, reviewed_at = NOW() 
       WHERE id = $4 RETURNING *`,
            [status, admin_id, note, doc_id]
        );

        // Audit log
        await db.query(
            'INSERT INTO kyc_audit_log (user_id, doc_id, action, performed_by, old_status, new_status, note) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [docResult.rows[0].user_id, doc_id, 'REVIEW', admin_id, oldStatus, status, note]
        );

        res.json({
            message: `KYC document ${status}`,
            data: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during KYC review' });
    }
};

const getKYCAuditLog = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT kal.*, u.full_name as performed_by_name 
             FROM kyc_audit_log kal 
             LEFT JOIN users u ON kal.performed_by = u.id 
             WHERE kal.user_id = $1 
             ORDER BY kal.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching audit log' });
    }
};

const getAllPendingKYC = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT kd.*, u.full_name, u.phone, u.email 
             FROM kyc_documents kd 
             JOIN users u ON kd.user_id = u.id 
             WHERE kd.status = 'pending' 
             ORDER BY kd.uploaded_at ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching pending KYC' });
    }
};

module.exports = {
    uploadKYC,
    getKYCStatus,
    reviewKYC,
    getKYCAuditLog,
    getAllPendingKYC,
};
