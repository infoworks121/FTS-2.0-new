const db = require('../config/db');

// Create a return request
exports.createReturnRequest = async (req, res) => {
    try {
        const { order_id, order_item_id, reason, return_type } = req.body;
        const user = req.user;

        if (!order_id || !reason) {
            return res.status(400).json({ error: 'order_id and reason are required' });
        }

        // Verify order belongs to user and is delivered
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orderRes.rows[0];
        if (order.customer_id !== user.id) {
            return res.status(403).json({ error: 'Unauthorized to return this order' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ error: 'Only delivered orders can be returned' });
        }

        if (order.return_window_closed) {
            return res.status(400).json({ error: 'Return window has closed for this order' });
        }

        const result = await db.query(
            `INSERT INTO return_requests 
             (order_id, order_item_id, requested_by, reason, return_type) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [order_id, order_item_id || null, user.id, reason, return_type || 'return']
        );

        res.status(201).json({
            message: 'Return request submitted successfully',
            returnRequest: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating return request:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Admin/System reviews and updates return request
exports.reviewReturnRequest = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { status, amount_to_refund, review_note } = req.body; // approved, rejected, completed
        const user = req.user;

        if (!['approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await client.query('BEGIN');

        // Get the return request
        const returnReq = await client.query('SELECT * FROM return_requests WHERE id = $1', [id]);
        if (returnReq.rows.length === 0) {
            throw new Error('Return request not found');
        }

        const oldStatus = returnReq.rows[0].status;

        const result = await client.query(
            `UPDATE return_requests 
             SET status = $1, amount_to_refund = COALESCE($2, amount_to_refund), 
                 reviewed_by = $3, review_note = $4, updated_at = NOW() 
             WHERE id = $5 RETURNING *`,
            [status, amount_to_refund, user.id, review_note, id]
        );

        // Log status change
        await client.query(
            `INSERT INTO return_status_log (return_id, old_status, new_status, note, performed_by) 
             VALUES ($1, $2, $3, $4, $5)`,
            [id, oldStatus, status, review_note, user.id]
        );

        await client.query('COMMIT');
        res.json({ message: `Return request ${status}`, returnRequest: result.rows[0] });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error reviewing return:', error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Create a complaint
exports.createComplaint = async (req, res) => {
    try {
        const { order_id, category, description } = req.body;
        const user = req.user;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const result = await db.query(
            `INSERT INTO complaints 
             (order_id, raised_by, category, description) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [order_id || null, user.id, category || 'general', description]
        );

        res.status(201).json({
            message: 'Complaint registered successfully',
            complaint: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Resolve complaint
exports.resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_note } = req.body;
        const user = req.user;

        const result = await db.query(
            `UPDATE complaints 
             SET status = 'resolved', resolved_by = $1, resolution_note = $2, updated_at = NOW() 
             WHERE id = $3 RETURNING *`,
            [user.id, resolution_note, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json({ message: 'Complaint resolved', complaint: result.rows[0] });

    } catch (error) {
        console.error('Error resolving complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
