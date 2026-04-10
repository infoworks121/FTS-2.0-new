const db = require('../config/db');

// Create a stock request / demand signal
exports.createStockRequest = async (req, res) => {
    try {
        const { product_id, variant_id, requested_qty, request_note, urgency_level } = req.body;
        const user = req.user;

        if (!product_id) {
            return res.status(400).json({ error: 'product_id is required' });
        }

        if (!request_note || request_note.trim().length === 0) {
            return res.status(400).json({ error: 'A message explaining the demand context is mandatory' });
        }

        let dealerId = null;
        let districtId = null;
        let stockPointId = null;

        // Check if user is a Dealer
        const dealerRes = await db.query(
            'SELECT id, district_id FROM dealer_profiles WHERE user_id = $1',
            [user.id]
        );

        if (dealerRes.rows.length > 0) {
            dealerId = dealerRes.rows[0].id;
            districtId = dealerRes.rows[0].district_id;
        } else {
            // Check if user is a Stock Point (Legacy support)
            const spResult = await db.query(
                `SELECT sp.id FROM stock_point_profiles sp
                 JOIN businessman_profiles bp ON sp.businessman_id = bp.id
                 WHERE bp.user_id = $1 AND sp.is_active = true`,
                [user.id]
            );
            if (spResult.rows.length > 0) {
                stockPointId = spResult.rows[0].id;
            } else {
                return res.status(403).json({ error: 'Only authorized dealers or stock points can send demand signals' });
            }
        }

        const result = await db.query(
            `INSERT INTO stock_requests 
             (dealer_id, stock_point_id, district_id, product_id, variant_id, requested_qty, request_note, urgency_level) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [
                dealerId, 
                stockPointId, 
                districtId, 
                product_id, 
                variant_id || null, 
                requested_qty || null, 
                request_note, 
                urgency_level || 'normal'
            ]
        );

        res.status(201).json({ 
            message: 'Demand signal sent successfully', 
            stock_request: result.rows[0] 
        });
    } catch (error) {
        console.error('Error creating stock request:', error);
        res.status(500).json({ error: 'Failed to send demand signal' });
    }
};

// Get stock requests / demand signals (Filtered by role and district)
exports.getStockRequests = async (req, res) => {
    try {
        const { status, dealer_id } = req.query;
        const user = req.user;
        
        const params = [];
        let whereClause = 'WHERE 1=1';

        // Filters for specific dealer viewing their own requests
        if (dealer_id) {
            params.push(dealer_id);
            whereClause += ` AND sr.dealer_id = $${params.length}`;
        } else if (user.role_code === 'dealer') {
            // Self-view for dealers
            params.push(user.id);
            whereClause += ` AND (sr.dealer_id IN (SELECT id FROM dealer_profiles WHERE user_id = $${params.length}))`;
        }

        // Filters for Core Body viewing district requests
        if (user.role_code.startsWith('core_body')) {
            const profileRes = await db.query(
                'SELECT district_id FROM core_body_profiles WHERE user_id = $1',
                [user.id]
            );
            if (profileRes.rows.length > 0) {
                params.push(profileRes.rows[0].district_id);
                whereClause += ` AND sr.district_id = $${params.length}`;
            }
        }

        if (status) {
            params.push(status);
            whereClause += ` AND sr.status = $${params.length}`;
        }

        const result = await db.query(`
            SELECT sr.*, 
                   p.name as product_name, p.sku, p.thumbnail_url,
                   c.name as category_name,
                   sd.name as subdivision_name,
                   u.full_name as requester_name
            FROM stock_requests sr
            JOIN products p ON sr.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN dealer_profiles dp ON sr.dealer_id = dp.id
            LEFT JOIN subdivisions sd ON dp.subdivision_id = sd.id
            LEFT JOIN users u ON (dp.user_id = u.id OR sr.stock_point_id IN (SELECT id FROM stock_point_profiles WHERE businessman_id IN (SELECT id FROM businessman_profiles WHERE user_id = u.id)))
            ${whereClause}
            ORDER BY sr.created_at DESC
        `, params);

        res.json({ stock_requests: result.rows });
    } catch (error) {
        console.error('Error fetching stock requests:', error);
        res.status(500).json({ error: 'Failed to fetch demand signals' });
    }
};

// Acknowledge / Reply to stock request (For Core Bodies)
exports.reviewStockRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, review_note } = req.body; // status: 'acknowledged' or 'completed'
        const user = req.user;

        if (!['acknowledged', 'completed', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        if (user.role_code !== 'admin' && !user.role_code.startsWith('core_body')) {
            return res.status(403).json({ error: 'Unauthorized to review stock requests' });
        }

        const result = await db.query(
            `UPDATE stock_requests 
             SET status = $1, reply_note = $2, reviewed_by = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [status, review_note, user.id, requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stock request not found' });
        }

        res.json({ 
            message: `Demand signal marked as ${status}`, 
            stock_request: result.rows[0] 
        });
    } catch (error) {
        console.error('Error reviewing stock request:', error);
        res.status(500).json({ error: 'Failed to update demand signal' });
    }
};

