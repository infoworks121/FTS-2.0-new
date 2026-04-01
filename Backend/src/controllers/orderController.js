const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
    const { items, payment_method, notes, district_id, pincode_id, delivery_address, transaction_pin } = req.body;
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

    // 2.5 Verify Wallet Balance
    let wallet = null;
    if (payment_method === 'wallet' || !payment_method) {
      const walletResult = await client.query(
        `SELECT w.id, w.balance, w.is_frozen, w.transaction_pin 
         FROM wallets w
         JOIN wallet_types wt ON w.wallet_type_id = wt.id
         WHERE w.user_id = $1 AND wt.type_code = 'main' FOR UPDATE`,
        [user.id]
      );

      if (walletResult.rows.length === 0) {
        throw new Error('Main wallet not found for the user.');
      }

      wallet = walletResult.rows[0];

      if (wallet.is_frozen) {
        throw new Error('Your wallet is frozen. Cannot place order.');
      }

      // PIN Verification
      if (!wallet.transaction_pin) {
        throw new Error('Please set your transaction PIN before making wallet payments.');
      }
      if (!transaction_pin) {
        throw new Error('Transaction PIN is required for wallet payments.');
      }
      const isPinValid = await bcrypt.compare(transaction_pin, wallet.transaction_pin);
      if (!isPinValid) {
        throw new Error('Invalid transaction PIN.');
      }

      const balance = parseFloat(wallet.balance);
      if (balance < total_amount) {
        throw new Error(`Insufficient wallet balance. Required: ₹${total_amount}, Available: ₹${balance}`);
      }

      // Deduct from wallet
      await client.query(
        `UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE id = $2`,
        [total_amount, wallet.id]
      );
    }

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

    // 6. Record Wallet Transaction
    if (wallet) {
      await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, source_type, source_ref_id, description)
         VALUES ($1, $2, 'debit', $3, $4, $5, 'order_payment', $6, $7)`,
        [
          wallet.id, 
          user.id, 
          total_amount, 
          wallet.balance, 
          parseFloat(wallet.balance) - total_amount, 
          newOrder.id, 
          `Payment for B2B Order ${newOrder.order_number}`
        ]
      );
    }

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

exports.createB2COrder = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { items, payment_method, notes, delivery_address, district_id, pincode_id, referral_code } = req.body;
    const user = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required.' });
    }

    if (!delivery_address) {
      return res.status(400).json({ error: 'Delivery address is required for B2C orders.' });
    }

    await client.query('BEGIN');

    let subtotal = 0;
    let total_profit = 0;
    const orderItemsData = [];
    const stockCheckQuery = []; // We will check stock points later

    // 1. Process Items and Prices
    for (const item of items) {
      const { product_id, variant_id, quantity } = item;
      
      const priceResult = await client.query(
        `SELECT pp.mrp, pp.base_price, pp.selling_price 
         FROM product_pricing pp 
         WHERE pp.product_id = $1 AND ($2::uuid IS NULL OR pp.variant_id = $2) AND pp.is_current = true`,
        [product_id, variant_id || null]
      );

      if (priceResult.rows.length === 0) {
        throw new Error(`Pricing not found for product_id: ${product_id}`);
      }

      const pricing = priceResult.rows[0];
      const unit_price = parseFloat(pricing.selling_price); // B2C always uses selling_price
      const item_total = unit_price * quantity;
      const unit_profit = unit_price - parseFloat(pricing.base_price);

      subtotal += item_total;
      total_profit += (unit_profit * quantity);

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

    const order_number = await generateOrderNumber(client).then(n => n.replace('B2B', 'B2C'));
    const delivery_charge = 50; // Flat delivery fee for B2C
    const total_amount = subtotal + delivery_charge;

    let referral_user_id = null;
    if (referral_code) {
      const refUser = await client.query('SELECT id FROM users WHERE phone = $1 OR email = $1', [referral_code]);
      if (refUser.rows.length > 0) {
        referral_user_id = refUser.rows[0].id;
      }
    }

    // 2. Create Order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (order_number, customer_id, order_type, status, subtotal, delivery_charge, total_amount, total_profit, 
        payment_method, delivery_address, district_id, pincode_id, referral_code_used, referral_user_id, notes) 
       VALUES ($1, $2, 'B2C', 'pending', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        order_number, user.id, subtotal, delivery_charge, total_amount, total_profit, 
        payment_method || 'online', JSON.stringify(delivery_address), district_id || null, pincode_id || null,
        referral_code || null, referral_user_id, notes || null
      ]
    );

    const newOrder = orderResult.rows[0];

    // 3. Insert Items
    for (const data of orderItemsData) {
      await client.query(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, quantity, unit_price, mrp, total_price, unit_profit) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newOrder.id, data.product_id, data.variant_id, data.quantity, data.unit_price, data.mrp, data.total_price, data.unit_profit]
      );
    }

    await client.query(
      `INSERT INTO order_status_log (order_id, new_status, note, performed_by) 
       VALUES ($1, 'pending', 'Order placed by B2C customer', $2)`,
      [newOrder.id, user.id]
    );

    // 4. Auto Assignment Engine (Find nearest stock point)
    let assignedStockPoint = null;
    if (district_id) {
       // Query Stock Points in the same district that have SLA score > 50
       const spsResult = await client.query(
         `SELECT sp.id, sp.sla_score, sp.businessman_id 
          FROM stock_point_profiles sp 
          WHERE sp.district_id = $1 AND sp.is_active = true AND sp.sla_score >= 50
          ORDER BY sp.sla_score DESC`,
         [district_id]
       );

       // Simple logic: Just pick the Stock Point with the highest SLA score for now
       // (A full system would verify stock for ALL items in the order before assigning)
       if (spsResult.rows.length > 0) {
         assignedStockPoint = spsResult.rows[0];
       }
    }

    if (assignedStockPoint) {
       // Create assignment immediately
       await client.query(
         `INSERT INTO fulfillment_assignments (order_id, fulfiller_type, fulfiller_id, status) 
          VALUES ($1, 'stock_point', $2, 'assigned')`,
         [newOrder.id, assignedStockPoint.id]
       );
       
       const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); 
       await client.query(
         `INSERT INTO order_sla_log (order_id, stock_point_id, sla_type, sla_deadline) 
          VALUES ($1, $2, 'dispatch', $3)`,
         [newOrder.id, assignedStockPoint.id, deadline]
       );

       await client.query(`UPDATE orders SET status = 'assigned' WHERE id = $1`, [newOrder.id]);
    }

    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'B2C Order placed successfully',
      order: newOrder,
      assigned_to: assignedStockPoint ? 'Nearest Stock Point' : 'Admin Queue'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    let query = `
      SELECT o.*, d.name as district_name, u.full_name as customer_name
      FROM orders o 
      LEFT JOIN districts d ON o.district_id = d.id
      LEFT JOIN users u ON o.customer_id = u.id
    `;
    const params = [];

    // For admins and core bodies (district-level), allow broader access
    if (user.role_code !== 'admin' && !user.role_code.startsWith('core_body')) {
      query += ` WHERE o.customer_id = $1`;
      params.push(user.id);
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const orderResult = await db.query(
      `SELECT o.*, d.name as district_name, u.full_name as customer_name
       FROM orders o 
       LEFT JOIN districts d ON o.district_id = d.id
       LEFT JOIN users u ON o.customer_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Authorization check
    if (user.role_code !== 'admin' && !user.role_code.startsWith('core_body') && order.customer_id !== user.id) {
       return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    const itemsResult = await db.query(
      `SELECT oi.*, p.name as product_name, pv.variant_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const logsResult = await db.query(
      `SELECT osl.*, u.full_name as performed_by_name
       FROM order_status_log osl
       LEFT JOIN users u ON osl.performed_by = u.id
       WHERE osl.order_id = $1
       ORDER BY osl.created_at ASC`,
      [id]
    );

    res.json({
      order,
      items: itemsResult.rows,
      status_log: logsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

