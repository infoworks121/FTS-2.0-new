const db = require('../config/db');

/**
 * Get aggregated stock for a product across all Core Bodies in a district
 */
const getDistrictAggregatedStock = async (district_id, product_id, variant_id = null) => {
    const query = `
        SELECT COALESCE(SUM(ib.quantity_on_hand), 0) as total_stock
        FROM inventory_balances ib
        JOIN core_body_profiles cbp ON ib.entity_id = cbp.user_id
        WHERE ib.entity_type = 'core_body' 
          AND cbp.district_id = $1 
          AND ib.product_id = $2 
          AND (ib.variant_id = $3 OR ($3 IS NULL AND ib.variant_id IS NULL))
    `;
    const result = await db.query(query, [district_id, product_id, variant_id]);
    return parseFloat(result.rows[0].total_stock);
};

/**
 * Find the nearest/best dealer to allocate an order to
 */
const findBestDealerForAllocation = async (district_id, subdivision_id = null) => {
    // Priority: Same subdivision -> Same District -> Highest SLA Score
    const query = `
        SELECT dp.*, u.full_name as dealer_name
        FROM dealer_profiles dp
        JOIN users u ON dp.user_id = u.id
        WHERE dp.district_id = $1 AND dp.is_active = true
        ORDER BY 
            (dp.subdivision_id = $2) DESC,
            dp.sla_score DESC
        LIMIT 1
    `;
    const result = await db.query(query, [district_id, subdivision_id]);
    return result.rows[0] || null;
};

/**
 * CORE BODY -> DEALER Physical Stock Transfer
 */
exports.issueStockToDealer = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { dealer_id, product_id, variant_id, quantity, note } = req.body;
        const sender_id = req.user.id; // User ID of the Core Body member

        if (!dealer_id || !product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'dealer_id, product_id, and positive quantity are required' });
        }

        await client.query('BEGIN');

        // 1. Get Sender's Core Body Profile
        const cbResult = await client.query(
            'SELECT id, district_id FROM core_body_profiles WHERE user_id = $1',
            [sender_id]
        );
        if (cbResult.rows.length === 0) {
            throw new Error('Unauthorized: Only Core Body members can issue stock');
        }
        const sender_cb = cbResult.rows[0];

        // 2. Get Target Dealer Profile
        const dealerResult = await client.query(
            'SELECT id, user_id, district_id FROM dealer_profiles WHERE id = $1',
            [dealer_id]
        );
        if (dealerResult.rows.length === 0) {
            throw new Error('Target Dealer not found');
        }
        const target_dealer = dealerResult.rows[0];

        // 3. Verify Same District
        if (sender_cb.district_id !== target_dealer.district_id) {
            throw new Error('Restriction: Can only issue stock to dealers in your own district');
        }

        // 4. Check Sender Stock
        const stockResult = await client.query(
            `SELECT quantity_on_hand FROM inventory_balances 
             WHERE entity_type = 'core_body' AND entity_id = $1 AND product_id = $2 AND (variant_id = $3 OR ($3 IS NULL AND variant_id IS NULL))`,
            [sender_id, product_id, variant_id || null]
        );

        const current_qty = stockResult.rows.length > 0 ? parseFloat(stockResult.rows[0].quantity_on_hand) : 0;
        if (current_qty < quantity) {
            throw new Error(`Insufficient stock. Available: ${current_qty}`);
        }

        // 5. Deduct from Sender
        await client.query(
            `UPDATE inventory_balances 
             SET quantity_on_hand = quantity_on_hand - $1, last_updated_at = NOW() 
             WHERE entity_type = 'core_body' AND entity_id = $2 AND product_id = $3 AND (variant_id = $4 OR ($4 IS NULL AND variant_id IS NULL))`,
            [quantity, sender_id, product_id, variant_id]
        );

        // 6. Add to Dealer (Physical Stock)
        const dealerStockIdResult = await client.query(
            `INSERT INTO inventory_balances (entity_type, entity_id, product_id, variant_id, quantity_on_hand)
             VALUES ('dealer', $1, $2, $3, $4)
             ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'))
             DO UPDATE SET quantity_on_hand = inventory_balances.quantity_on_hand + EXCLUDED.quantity_on_hand, last_updated_at = NOW()
             RETURNING id`,
            [target_dealer.user_id, product_id, variant_id || null, quantity]
        );

        // 7. Log in Ledger
        await client.query(
            `INSERT INTO inventory_ledger (product_id, variant_id, entity_type, entity_id, transaction_type, quantity, note, created_by)
             VALUES ($1, $2, 'core_body', $3, 'stock_issue_out', $4, $5, $6)`,
            [product_id, variant_id || null, sender_id, -quantity, `Issued to dealer: ${dealer_id}. Note: ${note || ''}`, sender_id]
        );

        await client.query(
            `INSERT INTO inventory_ledger (product_id, variant_id, entity_type, entity_id, transaction_type, quantity, note, created_by)
             VALUES ($1, $2, 'dealer', $3, 'stock_issue_in', $4, $5, $6)`,
            [product_id, variant_id || null, target_dealer.user_id, quantity, `Received from core body: ${sender_id}. Note: ${note || ''}`, sender_id]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Stock issued physically to dealer successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error issuing stock:', error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

/**
 * API to get aggregated district stock
 */
exports.getDistrictStock = async (req, res) => {
    try {
        const { product_id } = req.params;
        const user = req.user;

        // Determine district
        let district_id = req.query.district_id;
        if (!district_id) {
            // Try to find from profile
            const profileQuery = user.role_code.startsWith('core_body') 
                ? 'SELECT district_id FROM core_body_profiles WHERE user_id = $1'
                : 'SELECT district_id FROM dealer_profiles WHERE user_id = $1';
            const profile = await db.query(profileQuery, [user.id]);
            district_id = profile.rows[0]?.district_id;
        }

        if (!district_id) return res.status(400).json({ error: 'District ID could not be determined' });

        const total = await getDistrictAggregatedStock(district_id, product_id);
        res.json({ product_id, district_id, total_aggregated_stock: total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDistrictAggregatedStock = getDistrictAggregatedStock;
exports.findBestDealerForAllocation = findBestDealerForAllocation;

/**
 * Get comprehensive inventory for a Core Body user (Personal + District Aggregated)
 */
exports.getCoreBodyInventory = async (req, res) => {
    try {
        const user = req.user;
        
        // 1. Get Core Body District
        const profileQuery = `SELECT district_id FROM core_body_profiles WHERE user_id = $1`;
        const profile = await db.query(profileQuery, [user.id]);
        const district_id = profile.rows[0]?.district_id;

        if (!district_id) {
            return res.status(400).json({ error: 'Core Body profile or district not found' });
        }

        // 2. Fetch all active products with personal stock and district aggregated stock
        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.sku, 
                c.name as category_name,
                p.base_price,
                COALESCE(ib.quantity_on_hand, 0) as my_stock,
                (
                    SELECT COALESCE(SUM(dist_ib.quantity_on_hand), 0)
                    FROM inventory_balances dist_ib
                    LEFT JOIN core_body_profiles dist_cbp ON dist_ib.entity_id = dist_cbp.user_id AND dist_ib.entity_type = 'core_body'
                    LEFT JOIN dealer_profiles dist_dp ON dist_ib.entity_id = dist_ib.entity_id AND dist_ib.entity_type = 'dealer'
                    WHERE dist_ib.product_id = p.id
                      AND (dist_cbp.district_id = $2 OR dist_dp.district_id = $2)
                ) as district_stock,
                ib.last_updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory_balances ib ON p.id = ib.product_id 
                AND ib.entity_id = $1 
                AND ib.entity_type = 'core_body'
            WHERE p.is_active = true
            ORDER BY p.name ASC
        `;
        
        const result = await db.query(query, [user.id, district_id]);
        res.json({ 
            inventory: result.rows,
            district_id,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching Core Body inventory:', error);
        res.status(500).json({ error: error.message });
    }
};
