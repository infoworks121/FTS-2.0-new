const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const stockAllocationController = {
    // Core Body initiates a physical transfer to a Dealer
    createPhysicalTransfer: async (req, res) => {
        const { to_dealer_id, product_id, quantity, note } = req.body;
        const from_user_id = req.user.id; // The Core Body user

        try {
            await pool.query('BEGIN');

            // 1. Get Core Body Profile
            const coreBodyRes = await pool.query(
                'SELECT id, district_id FROM core_body_profiles WHERE user_id = $1',
                [from_user_id]
            );
            if (coreBodyRes.rows.length === 0) {
                return res.status(403).json({ error: "Only Core Body can initiate transfers" });
            }
            const coreBody = coreBodyRes.rows[0];

            // 2. Verify Dealer belongs to the same district (Security Check)
            const dealerRes = await pool.query(
                'SELECT id FROM dealer_profiles WHERE id = $1 AND district_id = $2',
                [to_dealer_id, coreBody.district_id]
            );
            if (dealerRes.rows.length === 0) {
                return res.status(400).json({ error: "Dealer not found in your district" });
            }

            // 3. Check Core Body has enough stock to transfer
            const stockRes = await pool.query(
                'SELECT quantity FROM inventory_balances WHERE entity_id = $1 AND product_id = $2',
                [coreBody.id, product_id]
            );
            const currentStock = stockRes.rows[0]?.quantity || 0;
            if (currentStock < quantity) {
                return res.status(400).json({ error: "Insufficient stock for this transfer" });
            }

            // 4. Create the Allocation/Transfer Record
            const allocationId = uuidv4();
            await pool.query(
                `INSERT INTO stock_allocations (
                    id, product_id, from_entity_type, from_entity_id, 
                    to_entity_type, to_entity_id, quantity, status, 
                    dispatched_at, note
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)`,
                [allocationId, product_id, 'core_body', coreBody.id, 'dealer', to_dealer_id, quantity, 'dispatched', note]
            );

            // 5. Reduce Core Body's balance (Reserve it)
            await pool.query(
                `UPDATE inventory_balances 
                 SET quantity = quantity - $1, updated_at = NOW()
                 WHERE entity_id = $2 AND product_id = $3`,
                [quantity, coreBody.id, product_id]
            );

            // 6. Log the OUT movement for Core Body
            await pool.query(
                `INSERT INTO inventory_ledger (
                    product_id, entity_type, entity_id, transaction_type, 
                    quantity, reference_type, reference_id, note, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [product_id, 'core_body', coreBody.id, 'transfer_out', -quantity, 'stock_allocation', allocationId, `Dispatched to dealer ${to_dealer_id}`, from_user_id]
            );

            await pool.query('COMMIT');
            res.json({ message: "Physical transfer dispatched successfully", allocation_id: allocationId });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error("Transfer error:", error);
            res.status(500).json({ error: "Failed to initiate transfer" });
        }
    },

    // Dealer confirms receipt of physical stock
    receivePhysicalTransfer: async (req, res) => {
        const { allocation_id } = req.params;
        const dealer_user_id = req.user.id;

        try {
            await pool.query('BEGIN');

            // 1. Get Dealer Profile
            const dealerRes = await pool.query('SELECT id FROM dealer_profiles WHERE user_id = $1', [dealer_user_id]);
            const dealerId = dealerRes.rows[0]?.id;

            // 2. Fetch and Lock the transfer
            const transferRes = await pool.query(
                'SELECT * FROM stock_allocations WHERE id = $1 AND to_entity_id = $2 AND status = $3 FOR UPDATE',
                [allocation_id, dealerId, 'dispatched']
            );

            if (transferRes.rows.length === 0) {
                return res.status(404).json({ error: "Pending transfer not found" });
            }
            const transfer = transferRes.rows[0];

            // 3. Update transfer status
            await pool.query(
                'UPDATE stock_allocations SET status = $1, received_at = NOW() WHERE id = $2',
                ['received', allocation_id]
            );

            // 4. Update Dealer's inventory balance
            const balanceRes = await pool.query(
                'INSERT INTO inventory_balances (entity_type, entity_id, product_id, quantity) VALUES ($1, $2, $3, $4) ON CONFLICT (entity_id, product_id) DO UPDATE SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW()',
                ['dealer', dealerId, transfer.product_id, transfer.quantity]
            );

            // 5. Log the IN movement for Dealer
            await pool.query(
                `INSERT INTO inventory_ledger (
                    product_id, entity_type, entity_id, transaction_type, 
                    quantity, reference_type, reference_id, note, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [transfer.product_id, 'dealer', dealerId, 'transfer_in', transfer.quantity, 'stock_allocation', allocation_id, "Physical stock received from Core Body", dealer_user_id]
            );

            await pool.query('COMMIT');
            res.json({ message: "Stock received and inventoried successfully" });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error("Receive error:", error);
            res.status(500).json({ error: "Failed to receive stock" });
        }
    },

    // List pending transfers for the logged-in Dealer
    getDealerPendingArrivals: async (req, res) => {
        try {
            const dealerRes = await pool.query('SELECT id FROM dealer_profiles WHERE user_id = $1', [req.user.id]);
            const dealerId = dealerRes.rows[0]?.id;

            const res_arrivals = await pool.query(
                `SELECT sa.*, p.name as product_name, p.thumbnail_url, u.full_name as sender_name,
                        o.order_number as linked_order_number
                 FROM stock_allocations sa
                 JOIN products p ON sa.product_id = p.id
                 JOIN core_body_profiles cbp ON sa.from_entity_id = cbp.id
                 JOIN users u ON cbp.user_id = u.id
                 LEFT JOIN orders o ON sa.order_id = o.id
                 WHERE sa.to_entity_id = $1 AND sa.status = 'dispatched'
                 ORDER BY sa.dispatched_at DESC`,
                [dealerId]
            );
            res.json({ arrivals: res_arrivals.rows });
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch arrivals" });
        }
    },

    // Admin requesting a Core Body to send stock to a Dealer (Inter-district)
    requestDirectedDispatch: async (req, res) => {
        const { from_core_body_id, to_dealer_id, product_id, quantity, order_id, note } = req.body;
        if (req.user.role_code !== 'admin') {
            return res.status(403).json({ error: "Only Admin can direct dispatches" });
        }

        try {
            const allocationId = uuidv4();
            await pool.query(
                `INSERT INTO stock_allocations (
                    id, product_id, from_entity_type, from_entity_id, 
                    to_entity_type, to_entity_id, quantity, status, 
                    order_id, note, is_admin_directed
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_cb_dispatch', $8, $9, true)`,
                [allocationId, product_id, 'core_body', from_core_body_id, 'dealer', to_dealer_id, quantity, order_id, note]
            );

            res.status(201).json({ message: "Dispatch request sent to Core Body", allocation_id: allocationId });
        } catch (error) {
            console.error("Directed dispatch error:", error);
            res.status(500).json({ error: "Failed to request directed dispatch" });
        }
    },

    // Core Body fetching dispatches directed to them by Admin
    getDirectedRequests: async (req, res) => {
        try {
            const coreBodyRes = await pool.query('SELECT id FROM core_body_profiles WHERE user_id = $1', [req.user.id]);
            const cbId = coreBodyRes.rows[0]?.id;

            const requests = await pool.query(
                `SELECT sa.*, p.name as product_name, d.full_name as dealer_name, d_p.subdivision_id
                 FROM stock_allocations sa
                 JOIN products p ON sa.product_id = p.id
                 JOIN dealer_profiles d_p ON sa.to_entity_id = d_p.id
                 JOIN users d ON d_p.user_id = d.id
                 WHERE sa.from_entity_id = $1 AND sa.status = 'pending_cb_dispatch'
                 ORDER BY sa.created_at DESC`,
                [cbId]
            );
            res.json({ requests: requests.rows });
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch directed requests" });
        }
    }
};

module.exports = stockAllocationController;
