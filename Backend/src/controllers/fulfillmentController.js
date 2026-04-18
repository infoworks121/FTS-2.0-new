const db = require('../config/db');

// Assign an order to a Stock Point
// This can be triggered manually by Admin or automatically by B2C order creation
exports.assignOrder = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { order_id, stock_point_id } = req.body;
        if (!order_id || !stock_point_id) {
            return res.status(400).json({ error: 'order_id and stock_point_id are required' });
        }

        await client.query('BEGIN');

        // Verify order exists and is pending
        const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderResult.rows.length === 0) {
            throw new Error('Order not found');
        }
        const order = orderResult.rows[0];

        // Verify stock point exists
        const spResult = await client.query('SELECT * FROM stock_point_profiles WHERE id = $1 AND is_active = true', [stock_point_id]);
        if (spResult.rows.length === 0) {
            throw new Error('Active Stock Point not found');
        }

        // Create Assignment
        const result = await client.query(
            `INSERT INTO fulfillment_assignments 
             (order_id, fulfiller_type, fulfiller_id, status) 
             VALUES ($1, 'stock_point', $2, 'assigned') RETURNING *`,
            [order_id, stock_point_id]
        );

        // Update Order Status
        await client.query(
            `UPDATE orders SET status = 'assigned', updated_at = NOW() WHERE id = $1`,
            [order_id]
        );

        // Set SLA Rule (e.g., 24 hours to dispatch)
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        await client.query(
          `INSERT INTO order_sla_log (order_id, fulfiller_id, fulfiller_type, sla_type, sla_deadline) 
           VALUES ($1, $2, 'stock_point', 'dispatch', $3)`,
          [order_id, stock_point_id, deadline]
        );

        // Log Status
        await client.query(
            `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
             VALUES ($1, 'assigned', 'Order assigned to stock point', $2)`,
            [order_id, req.user.id]
        );

        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: 'Order assigned successfully', 
            assignment: result.rows[0] 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error assigning order:', error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Stock Point updates status (accepted, dispatched, delivered)
exports.updateFulfillmentStatus = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { assignment_id } = req.params;
        const { status, tracking_number, carrier } = req.body; // status: accepted, dispatched, delivered
        const user = req.user;

        if (!['accepted', 'packing', 'dispatched', 'delivered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await client.query('BEGIN');

        // Get assignment and join with appropriate profile
        const assignmentResult = await client.query(
            `SELECT fa.*, 
                    CASE 
                        WHEN fa.fulfiller_type = 'stock_point' THEN sp_u.id 
                        WHEN fa.fulfiller_type = 'dealer' THEN d_u.id
                        WHEN fa.fulfiller_type = 'core_body' THEN cb_u.id
                        WHEN fa.fulfiller_type = 'admin' THEN fa.fulfiller_id
                        ELSE NULL 
                    END as user_id
             FROM fulfillment_assignments fa
             LEFT JOIN stock_point_profiles sp ON fa.fulfiller_id = sp.id AND fa.fulfiller_id IS NOT NULL AND fa.fulfiller_type = 'stock_point'
             LEFT JOIN businessman_profiles bp ON sp.businessman_id = bp.id
             LEFT JOIN users sp_u ON bp.user_id = sp_u.id
             LEFT JOIN dealer_profiles dp ON fa.fulfiller_id = dp.id AND fa.fulfiller_type = 'dealer'
             LEFT JOIN users d_u ON dp.user_id = d_u.id
             LEFT JOIN core_body_profiles cbp ON fa.fulfiller_id = cbp.id AND fa.fulfiller_type = 'core_body'
             LEFT JOIN users cb_u ON cbp.user_id = cb_u.id
             WHERE fa.id = $1`,
            [assignment_id]
        );

        if (assignmentResult.rows.length === 0) {
            throw new Error('Fulfillment assignment not found');
        }

        const assignment = assignmentResult.rows[0];

        // Only the assigned user or an admin can update
        if (assignment.user_id !== user.id && user.role_code !== 'admin') {
            throw new Error('Unauthorized to update this assignment');
        }

        const timestampField = `${status}_at`;

        // Update assignment
        await client.query(
            `UPDATE fulfillment_assignments 
             SET status = $1, ${timestampField} = NOW() 
             WHERE id = $2`,
            [status, assignment_id]
        );

        // Update overall order status
        await client.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
            [status, assignment.order_id]
        );

        // If dispatched, handle tracking info and SLA check
        if (status === 'dispatched') {
            if (tracking_number && carrier) {
                const { invoice_url } = req.body;
                await client.query(
                    `INSERT INTO delivery_tracking (order_id, carrier, tracking_number, current_status, invoice_url) 
                     VALUES ($1, $2, $3, 'dispatched', $4)
                     ON CONFLICT (order_id) DO UPDATE SET carrier = EXCLUDED.carrier, tracking_number = EXCLUDED.tracking_number, current_status = 'dispatched', invoice_url = COALESCE(EXCLUDED.invoice_url, delivery_tracking.invoice_url)`,
                    [assignment.order_id, carrier, tracking_number, invoice_url || null]
                );
            }

            // Check SLA for dispatch
            const slaResult = await client.query(
                `SELECT * FROM order_sla_log WHERE order_id = $1 AND sla_type = 'dispatch'`,
                [assignment.order_id]
            );

            if (slaResult.rows.length > 0) {
                const sla = slaResult.rows[0];
                const now = new Date();
                const deadline = new Date(sla.sla_deadline);
                const isBreached = now > deadline;
                const breachDuration = isBreached ? Math.floor((now - deadline) / 60000) : 0; // minutes

                await client.query(
                    `UPDATE order_sla_log 
                     SET actual_time = NOW(), is_breached = $1, breach_duration_min = $2 
                     WHERE id = $3`,
                    [isBreached, breachDuration, sla.id]
                );

                // --- Universal Penalty/Reward Logic ---
                if (isBreached) {
                    // Penalty: reduce sla_score (min 0)
                    let table = 'stock_point_profiles';
                    if (assignment.fulfiller_type === 'dealer') table = 'dealer_profiles';
                    else if (assignment.fulfiller_type === 'core_body') table = 'core_body_profiles';

                    await client.query(
                        `UPDATE ${table} SET sla_score = GREATEST(sla_score - 2.5, 0) WHERE id = $1`,
                        [assignment.fulfiller_id]
                    );
                } else {
                    // Reward: increase sla_score (max 100)
                    let table = 'stock_point_profiles';
                    if (assignment.fulfiller_type === 'dealer') table = 'dealer_profiles';
                    else if (assignment.fulfiller_type === 'core_body') table = 'core_body_profiles';

                    await client.query(
                        `UPDATE ${table} SET sla_score = LEAST(sla_score + 0.5, 100.0) WHERE id = $1`,
                        [assignment.fulfiller_id]
                    );
                }
            }
        }

        // If delivered, update delivery tracking actual delivery
        if (status === 'delivered') {
            await client.query(
                `UPDATE delivery_tracking SET current_status = 'delivered', actual_delivery = NOW(), last_updated_at = NOW() WHERE order_id = $1`,
                [assignment.order_id]
            );
            // Inventory and Profit logic moved to 'confirmReceipt' in orderController.js
        }

        // Log the status update
        await client.query(
            `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
             VALUES ($1, $2, 'Updated by fulfiller', $3)`,
            [assignment.order_id, status, user.id]
        );

        await client.query('COMMIT');
        res.json({ message: `Fulfillment marked as ${status}` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating fulfillment:', error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Get fulfillments for a stock point or all for admin
exports.getFulfillments = async (req, res) => {
    try {
        const { status } = req.query;
        const user = req.user;
        let whereClause = 'WHERE 1=1';
        const params = [];

        // If not admin, restrict to user's assigned fulfillments
        if (user.role_code !== 'admin') {
            params.push(user.id);
            whereClause += ` AND bp.user_id = $${params.length}`;
        }

        if (status) {
            params.push(status);
            whereClause += ` AND fa.status = $${params.length}`;
        }

        const query = `
            SELECT fa.*, 
                   o.order_number, o.total_amount, o.created_at as order_date,
                   u.full_name as customer_name, u.phone as customer_phone
            FROM fulfillment_assignments fa
            JOIN orders o ON fa.order_id = o.id
            JOIN users u ON o.customer_id = u.id
            LEFT JOIN stock_point_profiles sp ON fa.fulfiller_id = sp.id AND fa.fulfiller_type = 'stock_point'
            LEFT JOIN businessman_profiles bp ON sp.businessman_id = bp.id
            LEFT JOIN dealer_profiles dp ON fa.fulfiller_id = dp.id AND fa.fulfiller_type = 'dealer'
            LEFT JOIN core_body_profiles cbp ON fa.fulfiller_id = cbp.id AND fa.fulfiller_type = 'core_body'
            WHERE 
                (fa.fulfiller_type = 'stock_point' AND (bp.user_id = $1 OR $userRole = 'admin'))
             OR (fa.fulfiller_type = 'dealer' AND (dp.user_id = $1 OR $userRole = 'admin'))
             OR (fa.fulfiller_type = 'core_body' AND (cbp.user_id = $1 OR $userRole = 'admin'))
             OR (fa.fulfiller_type = 'admin' AND (fa.fulfiller_id = $1 OR $userRole = 'admin'))
            ${status ? `AND fa.status = $${params.length + 1}` : ''}
            ORDER BY fa.assigned_at DESC
        `;

        // Note: Using a template-style replacement for $userRole for clarity
        const finalQuery = query.replace(/\$userRole/g, `'${user.role_code}'`);
        if (status) params.push(status);

        const result = await db.query(finalQuery, params);
        res.json({ fulfillments: result.rows });
    } catch (error) {
        console.error('Error fetching fulfillments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all shortages (for Admin Shortage Dashboard)
exports.getShortageAssignments = async (req, res) => {
    try {
        const query = `
            SELECT fa.*, 
                   o.order_number, 
                   u.full_name as dealer_name,
                   d.subdivision_id
            FROM fulfillment_assignments fa
            JOIN orders o ON fa.order_id = o.id
            JOIN dealer_profiles d ON fa.fulfiller_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE fa.is_shortage_fulfillment = true AND fa.status = 'assigned'
            ORDER BY fa.assigned_at DESC
        `;
        const result = await db.query(query);
        res.json({ shortages: result.rows });
    } catch (error) {
        console.error('Error fetching shortages:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Core Bodies that have stock for a specific product (Across all districts)
exports.getCoreBodyInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const query = `
            SELECT ib.quantity, ib.entity_id,
                   u.full_name as cb_name,
                   d.name as district_name
            FROM inventory_balances ib
            JOIN core_body_profiles cbp ON ib.entity_id = cbp.id
            JOIN users u ON cbp.user_id = u.id
            JOIN districts d ON cbp.district_id = d.id
            WHERE ib.entity_type = 'core_body' AND ib.product_id = $1 AND ib.quantity > 0
            ORDER BY ib.quantity DESC
        `;
        const result = await db.query(query, [productId]);
        res.json({ inventory: result.rows });
    } catch (error) {
        console.error('Error fetching CB inventory:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
