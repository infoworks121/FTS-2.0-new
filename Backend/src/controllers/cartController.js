const { Client } = require('pg');

const getDbClient = () => {
    return new Client({
        connectionString: process.env.DATABASE_URL
    });
};

exports.getCart = async (req, res) => {
    const client = getDbClient();
    try {
        await client.connect();
        const userId = req.user.id;

        const query = `
            SELECT 
                c.product_id as id,
                p.name,
                cat.name as category,
                p.thumbnail_url as image,
                COALESCE(pp.selling_price, pp.mrp, 0) as "basePrice",
                c.quantity,
                COALESCE((SELECT SUM(ib.quantity_on_hand - ib.quantity_reserved) FROM inventory_balances ib WHERE ib.product_id = p.id), 0) as stock
            FROM user_cart_items c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
            WHERE c.user_id = $1
            ORDER BY c.created_at ASC
        `;
        const result = await client.query(query, [userId]);
        
        // Convert string formatted numbers to actual numbers for frontend
        const items = result.rows.map(row => ({
            ...row,
            basePrice: Number(row.basePrice),
            quantity: Number(row.quantity),
            stock: Number(row.stock)
        }));

        res.json({ items });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart completely.' });
    } finally {
        await client.end();
    }
};

exports.addToCart = async (req, res) => {
    const client = getDbClient();
    try {
        await client.connect();
        const userId = req.user.id;
        const { id, quantity } = req.body;

        if (!id || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity required' });
        }

        const query = `
            INSERT INTO user_cart_items (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET 
                quantity = user_cart_items.quantity + EXCLUDED.quantity,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await client.query(query, [userId, id, quantity]);
        res.status(201).json({ item: result.rows[0], message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart.' });
    } finally {
        await client.end();
    }
};

exports.updateQuantity = async (req, res) => {
    const client = getDbClient();
    try {
        await client.connect();
        const userId = req.user.id;
        const productId = req.params.productId;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 1) {
             return res.status(400).json({ error: 'Invalid quantity' });
        }

        const query = `
            UPDATE user_cart_items 
            SET quantity = $3, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND product_id = $2
            RETURNING *
        `;
        const result = await client.query(query, [userId, productId, quantity]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        res.json({ item: result.rows[0], message: 'Quantity updated' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Failed to update quantity.' });
    } finally {
        await client.end();
    }
};

exports.removeFromCart = async (req, res) => {
    const client = getDbClient();
    try {
        await client.connect();
        const userId = req.user.id;
        const productId = req.params.productId;

        const query = `DELETE FROM user_cart_items WHERE user_id = $1 AND product_id = $2`;
        await client.query(query, [userId, productId]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item.' });
    } finally {
        await client.end();
    }
};

exports.clearCart = async (req, res) => {
    const client = getDbClient();
    try {
        await client.connect();
        const userId = req.user.id;

        const query = `DELETE FROM user_cart_items WHERE user_id = $1`;
        await client.query(query, [userId]);
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart.' });
    } finally {
        await client.end();
    }
};
