const db = require('../config/db');

// Generate unique order number
const generateOrderNumber = async (client) => {
  const prefix = 'FTS-B2B-';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${random}`;
};

exports.createB2BOrder = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { items, payment_method, notes, district_id, pincode_id, delivery_address } = req.body;
    const user = req.user;

    // 1. Verify Authorization (Role Check)
    const allowedRoles = ['core_body_a', 'core_body_b', 'businessman', 'dealer'];
    if (!allowedRoles.includes(user.role_code)) {
      return res.status(403).json({ error: 'Only B2B users can place B2B orders.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required.' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    let total_profit = 0;

    const orderItemsData = [];

    // 2. Process Items and Verify Inventory
    for (const item of items) {
      const { product_id, variant_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        throw new Error(`Invalid product_id or quantity for one of the items`);
      }

      // Fetch Pricing
      const priceResult = await client.query(
        `SELECT pp.mrp, pp.base_price, pp.selling_price, pp.bulk_price 
         FROM product_pricing pp 
         WHERE pp.product_id = $1 AND ($2::uuid IS NULL OR pp.variant_id = $2) AND pp.is_current = true`,
        [product_id, variant_id || null]
      );

      if (priceResult.rows.length === 0) {
        throw new Error(`Pricing not found for product_id: ${product_id}`);
      }

      const pricing = priceResult.rows[0];
      
      // For B2B, prefer bulk_price over selling_price
      const unit_price = pricing.bulk_price ? parseFloat(pricing.bulk_price) : parseFloat(pricing.selling_price);
      const item_total = unit_price * quantity;
      
      // Basic unit profit assumption (unit_price - base_price)
      const unit_profit = unit_price - parseFloat(pricing.base_price);

      subtotal += item_total;
      total_profit += (unit_profit * quantity);

      // Verify Admin Inventory (For B2B orders, assuming stock comes from Admin initially)
      const inventoryResult = await client.query(
        `SELECT quantity_on_hand, quantity_reserved 
         FROM inventory_balances 
         WHERE entity_type = 'admin' AND product_id = $1 AND ($2::uuid IS NULL OR variant_id = $2)
         FOR UPDATE`, // Lock the row
        [product_id, variant_id || null]
      );

      if (inventoryResult.rows.length === 0) {
        throw new Error(`Out of stock for product_id: ${product_id}. No admin inventory found.`);
      }

      const inv = inventoryResult.rows[0];
      const availableStock = parseFloat(inv.quantity_on_hand) - parseFloat(inv.quantity_reserved);

      if (availableStock < quantity) {
        throw new Error(`Insufficient stock for product_id: ${product_id}. Available: ${availableStock}, Requested: ${quantity}`);
      }

      // Reserve Inventory
      await client.query(
        `UPDATE inventory_balances 
         SET quantity_reserved = quantity_reserved + $1, last_updated_at = NOW() 
         WHERE entity_type = 'admin' AND product_id = $2 AND ($3::uuid IS NULL OR variant_id = $3)`,
        [quantity, product_id, variant_id || null]
      );

      orderItemsData.push({
        product_id,
        variant_id: variant_id || null,
        quantity,
        unit_price,
        mrp: pricing.mrp,
        total_price: item_total,
        unit_profit
      });
    }

    const order_number = await generateOrderNumber(client);
    const total_amount = subtotal; // Assuming no tax/delivery for this basic flow

    // 3. Create Order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (order_number, customer_id, order_type, status, subtotal, total_amount, total_profit, 
        payment_method, delivery_address, district_id, pincode_id, notes) 
       VALUES ($1, $2, 'B2B', 'pending', $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        order_number, 
        user.id, 
        subtotal, 
        total_amount, 
        total_profit, 
        payment_method || 'wallet', 
        delivery_address ? JSON.stringify(delivery_address) : null,
        district_id || user.district_id || null,
        pincode_id || null,
        notes || null
      ]
    );

    const newOrder = orderResult.rows[0];

    // 4. Create Order Items
    for (const data of orderItemsData) {
      await client.query(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, quantity, unit_price, mrp, total_price, unit_profit) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newOrder.id, 
          data.product_id, 
          data.variant_id, 
          data.quantity, 
          data.unit_price, 
          data.mrp, 
          data.total_price, 
          data.unit_profit
        ]
      );
    }

    // 5. Track Order Status Log
    await client.query(
      `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
       VALUES ($1, 'pending', 'Order placed by B2B user', $2)`,
      [newOrder.id, user.id]
    );

    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'B2B Order placed successfully',
      order: newOrder
    });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};
