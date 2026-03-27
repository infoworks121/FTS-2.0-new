const db = require('../config/db');

// Request stock by a stock point
exports.createStockRequest = async (req, res) => {
    try {
        const { product_id, variant_id, requested_qty, request_note } = req.body;
        const user = req.user;

        if (!product_id || !requested_qty || requested_qty <= 0) {
            return res.status(400).json({ error: 'product_id and positive requested_qty are required' });
        }

        // Verify the user is a stock point
        const spResult = await db.query(
            `SELECT sp.id FROM stock_point_profiles sp
             JOIN businessman_profiles bp ON sp.businessman_id = bp.id
             WHERE bp.user_id = $1 AND sp.is_active = true`,
            [user.id]
        );

        if (spResult.rows.length === 0) {
            return res.status(403).json({ error: 'Only active stock points can request stock' });
        }

        const stockPointId = spResult.rows[0].id;

        const result = await db.query(
            `INSERT INTO stock_requests 
             (stock_point_id, product_id, variant_id, requested_qty, request_note) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [stockPointId, product_id, variant_id || null, requested_qty, request_note]
        );

        res.status(201).json({ 
            message: 'Stock request created successfully', 
            stock_request: result.rows[0] 
        });
    } catch (error) {
        console.error('Error creating stock request:', error);
        res.status(500).json({ error: 'Failed to create stock request' });
    }
};

// Admin / Core Body fetch requests
exports.getStockRequests = async (req, res) => {
    try {
        const { status, stock_point_id } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (status) {
            params.push(status);
            whereClause += ` AND sr.status = $${params.length}`;
        }
        
        if (stock_point_id) {
            params.push(stock_point_id);
            whereClause += ` AND sr.stock_point_id = $${params.length}`;
        }

        const result = await db.query(`
            SELECT sr.*, 
                   p.name as product_name, p.sku, 
                   pv.variant_name,
                   u.full_name as requester_name, u.phone as requester_phone
            FROM stock_requests sr
            JOIN products p ON sr.product_id = p.id
            LEFT JOIN product_variants pv ON sr.variant_id = pv.id
            JOIN stock_point_profiles sp ON sr.stock_point_id = sp.id
            JOIN businessman_profiles bp ON sp.businessman_id = bp.id
            JOIN users u ON bp.user_id = u.id
            ${whereClause}
            ORDER BY sr.created_at DESC
        `, params);

        res.json({ stock_requests: result.rows });
    } catch (error) {
        console.error('Error fetching stock requests:', error);
        res.status(500).json({ error: 'Failed to fetch stock requests' });
    }
};

// Approve or Reject stock request
exports.reviewStockRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, review_note } = req.body;
        const user = req.user;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
        }

        // Must be admin or appropriate core body (omitted specific core body checks for brevity, assuming standard admin approval for now)
        if (user.role_code !== 'admin' && !user.role_code.startsWith('core_body')) {
            return res.status(403).json({ error: 'Unauthorized to review stock requests' });
        }

        const result = await db.query(
            `UPDATE stock_requests 
             SET status = $1, review_note = $2, reviewed_by = $3, updated_at = NOW()
             WHERE id = $4 AND status = 'pending'
             RETURNING *`,
            [status, review_note, user.id, requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pending stock request not found' });
        }

        res.json({ 
            message: `Stock request ${status} successfully`, 
            stock_request: result.rows[0] 
        });
    } catch (error) {
        console.error('Error reviewing stock request:', error);
        res.status(500).json({ error: 'Failed to review stock request' });
    }
};
