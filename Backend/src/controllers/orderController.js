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

    // 2. Determine Eligible Suppliers (Local Core Body -> Admin)
    const eligibleSuppliers = [];
    
    // Core Bodies are only eligible suppliers for other Core Bodies (A/B) or specific flows.
    // As per new Dealer flow, Businessmen/Dealers bypass Core Body fulfillment.
    if (user.role_code.startsWith('core_body')) {
       if (user.district_id) {
          const coreBodies = await client.query(
             `SELECT u.id, cbp.type 
              FROM core_body_profiles cbp 
              JOIN users u ON cbp.user_id = u.id
              WHERE cbp.district_id = $1 AND u.is_active = true
              ORDER BY cbp.type ASC`, 
             [user.district_id]
          );
          for (const cb of coreBodies.rows) {
             eligibleSuppliers.push({ type: 'core_body', id: cb.id, label: `Core Body Type ${cb.type}` });
          }
       }
    }
    // Always fallback to Admin
    eligibleSuppliers.push({ type: 'admin', id: null, label: 'Admin (Central)' });

    // 3. Process Items and Fetch Pricing
    const { preferred_fulfiller } = req.body; // { id: string, type: 'admin'|'dealer'|'stock_point' }

    for (const item of items) {
      // ... (existing pricing logic remains same)
      const { product_id, variant_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        throw new Error(`Invalid product_id or quantity for one of the items`);
      }

      // Fetch Pricing
      const priceResult = await client.query(
        `SELECT pp.mrp, pp.base_price, pp.selling_price, pp.bulk_price, p.is_dealer_routed, p.name as product_name
         FROM product_pricing pp 
         JOIN products p ON pp.product_id = p.id
         WHERE pp.product_id = $1 AND ($2::uuid IS NULL OR pp.variant_id = $2) AND pp.is_current = true`,
        [product_id, variant_id || null]
      );

      if (priceResult.rows.length === 0) {
        throw new Error(`Pricing not found for product_id: ${product_id}`);
      }

      const pricing = priceResult.rows[0];
      const unit_price = pricing.bulk_price ? parseFloat(pricing.bulk_price) : parseFloat(pricing.selling_price);
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
        unit_profit,
        is_dealer_routed: pricing.is_dealer_routed,
        product_name: pricing.product_name
      });
    }

    // 4. Per-Item Supplier Inventory Validation and Deduction
    const assignmentsMap = new Map(); // Key: 'type_id', Value: { type, id, items: [] }

    for (const item of orderItemsData) {
        let requestedQty = parseFloat(item.quantity);
        let handled = false;

        // --- Case A: Strict/Preferred Fulfiller Selection (Marketplace Choice) ---
        if (preferred_fulfiller && preferred_fulfiller.id) {
            const invRes = await client.query(
                `SELECT id, quantity_on_hand, quantity_reserved, entity_type, entity_id
                 FROM inventory_balances 
                 WHERE entity_type = $1 AND entity_id = $2 AND product_id = $3 FOR UPDATE`,
                [preferred_fulfiller.type, preferred_fulfiller.id, item.product_id]
            );

            if (invRes.rows.length > 0) {
                const available = parseFloat(invRes.rows[0].quantity_on_hand) - parseFloat(invRes.rows[0].quantity_reserved);
                if (available < requestedQty) {
                    throw new Error(`Insufficient stock for ${item.product_name} at the selected fulfiller. Available: ${available}`);
                }

                // Reserve Stock
                await client.query(
                    `UPDATE inventory_balances SET quantity_reserved = quantity_reserved + $1 WHERE id = $2`,
                    [requestedQty, invRes.rows[0].id]
                );

                // Fetch fulfiller district
                const fulfillerUserRes = await client.query(`SELECT district_id FROM users WHERE id = $1`, [preferred_fulfiller.id]);
                const fDistrictId = fulfillerUserRes.rows[0]?.district_id || null;

                const key = `${preferred_fulfiller.type}_${preferred_fulfiller.id}`;
                if (!assignmentsMap.has(key)) {
                    assignmentsMap.set(key, { type: preferred_fulfiller.type, id: preferred_fulfiller.id, district_id: fDistrictId, items: [] });
                }
                assignmentsMap.get(key).items.push({ product_id: item.product_id, quantity: requestedQty, product_name: item.product_name });
                handled = true;
            } else {
                throw new Error(`Selected fulfiller does not carry stock for ${item.product_name}`);
            }
        }

        // --- Case B: Automatic Routing (Legacy/No selection) ---
        if (!handled) {
            let dealerQty = 0;
            let adminQty = requestedQty;

            // P1: Check Local Dealer
            if (item.is_dealer_routed && user.subdivision_id) {
                const dealerQuery = await client.query(
                    `SELECT dp.id as profile_id, dp.district_id
                     FROM dealer_product_map dpm
                     JOIN dealer_profiles dp ON dpm.dealer_id = dp.id
                     WHERE dpm.subdivision_id = $1 AND dpm.product_id = $2
                     LIMIT 1`,
                    [user.subdivision_id, item.product_id]
                );

                if (dealerQuery.rows.length > 0) {
                    const dealer = dealerQuery.rows[0];
                    const invRes = await client.query(
                        `SELECT id, quantity_on_hand, quantity_reserved 
                         FROM inventory_balances 
                         WHERE entity_type = 'dealer' AND entity_id = $1 AND product_id = $2 FOR UPDATE`,
                        [dealer.profile_id, item.product_id]
                    );

                    if (invRes.rows.length > 0) {
                        const available = parseFloat(invRes.rows[0].quantity_on_hand) - parseFloat(invRes.rows[0].quantity_reserved);
                        dealerQty = Math.min(requestedQty, available);
                        adminQty = requestedQty - dealerQty;

                        if (dealerQty > 0) {
                            await client.query(
                                `UPDATE inventory_balances SET quantity_reserved = quantity_reserved + $1 WHERE id = $2`,
                                [dealerQty, invRes.rows[0].id]
                            );
                            const key = `dealer_${dealer.profile_id}`;
                            if (!assignmentsMap.has(key)) {
                                assignmentsMap.set(key, { type: 'dealer', id: dealer.profile_id, district_id: dealer.district_id, items: [] });
                            }
                            assignmentsMap.get(key).items.push({ product_id: item.product_id, quantity: dealerQty, product_name: item.product_name });
                        }
                    }
                }
            }

            // P2: Fallback to Admin
            if (adminQty > 0) {
                const superAdminId = process.env.SUPER_ADMIN_USER_ID || '4ac1c3c7-39fb-4d93-97f6-2a74965776e2';
                const key = `admin_${superAdminId}`;
                if (!assignmentsMap.has(key)) {
                    assignmentsMap.set(key, { type: 'admin', id: superAdminId, district_id: null, items: [], is_shortage: true });
                }
                assignmentsMap.get(key).items.push({ product_id: item.product_id, quantity: adminQty, product_name: item.product_name });
            }
        }
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
       VALUES ($1, 'pending', $2, $3)`,
      [newOrder.id, `Order placed by B2B user. Split into ${assignmentsMap.size} fulfillments.`, user.id]
    );

    // 5.5 Insert into fulfillment_assignments (Split Logic)
    for (const [key, assignment] of assignmentsMap.entries()) {
        await client.query(
            `INSERT INTO fulfillment_assignments 
             (order_id, fulfiller_type, fulfiller_id, source_district_id, items, status, is_shortage_fulfillment) 
             VALUES ($1, $2, $3, $4, $5, 'assigned', $6)`,
            [
                newOrder.id, 
                assignment.type, 
                assignment.id, 
                assignment.district_id, 
                JSON.stringify(assignment.items),
                assignment.is_shortage || false
            ]
        );
    }

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

    // 4. Auto Assignment Engine (Find nearest stock point with FULL inventory)
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

       // Check Inventory per Stock Point sequentially
       for (const sp of spsResult.rows) {
          let hasFullStock = true;
          const lockedRows = [];

          for (const item of orderItemsData) {
             // Check specific entity's stock availability
             const invRes = await client.query(
               `SELECT id, quantity_on_hand, quantity_reserved 
                FROM inventory_balances 
                WHERE entity_type = 'stock_point' AND entity_id = $1 
                  AND product_id = $2 AND ($3::uuid IS NULL OR variant_id = $3)
                FOR UPDATE`,
               [sp.id, item.product_id, item.variant_id]
             );

             if (invRes.rows.length === 0) {
                hasFullStock = false;
                break; // Missing product completely
             }

             const available = parseFloat(invRes.rows[0].quantity_on_hand) - parseFloat(invRes.rows[0].quantity_reserved);
             if (available < item.quantity) {
                hasFullStock = false;
                break; // Insufficient product quantity
             }

             // Validly held product -> queue for reservation
             lockedRows.push({
                 id: invRes.rows[0].id,
                 quantity: item.quantity
             });
          }

          if (hasFullStock) {
             assignedStockPoint = sp;
             
             // Commit Reservations
             for (const lock of lockedRows) {
                await client.query(
                  `UPDATE inventory_balances 
                   SET quantity_reserved = quantity_reserved + $1, last_updated_at = NOW() 
                   WHERE id = $2`,
                  [lock.quantity, lock.id]
                );
             }
             break; // Successful routing. Cease scanning.
          }
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
    const roleCode = user.role_code || '';
    
    let query = `
      SELECT o.*, d.name as district_name, u.full_name as customer_name,
        (SELECT STRING_AGG(p.name, ', ')
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = o.id) as product_names,
        (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as total_quantity
      FROM orders o 
      LEFT JOIN districts d ON o.district_id = d.id
      LEFT JOIN users u ON o.customer_id = u.id
    `;
    const params = [];

    // Admins and core bodies see all orders; everyone else sees only their own
    if (roleCode !== 'admin' && !roleCode.startsWith('core_body')) {
      query += ` WHERE o.customer_id = $1`;
      params.push(user.id);
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
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

