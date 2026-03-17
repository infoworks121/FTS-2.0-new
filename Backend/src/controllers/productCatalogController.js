const db = require('../config/db');

// Categories
exports.getCategories = async (req, res) => {
  try {
    // Check which columns exist in categories table
    const colCheck = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'categories'
    `);
    const cols = colCheck.rows.map(r => r.column_name);
    const hasIsActive = cols.includes('is_active');
    const hasSortOrder = cols.includes('sort_order');

    const whereClause = hasIsActive ? 'WHERE c.is_active = true' : '';
    const orderClause = hasSortOrder ? 'ORDER BY c.sort_order ASC, c.id ASC' : 'ORDER BY c.id ASC';

    const result = await db.query(`
      SELECT c.id, c.name, c.description
      FROM categories c
      ${whereClause}
      ${orderClause}
    `);
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image_url, sort_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await db.query(
      'INSERT INTO categories (name, description, slug, image_url, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, slug, image_url, sort_order || 0]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Products
exports.getProducts = async (req, res) => {
  try {
    const { category_id, sub_category_id, featured } = req.query;
    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    
    if (category_id) {
      params.push(category_id);
      whereClause += ` AND sc.category_id = $${params.length}`;
    }
    
    if (sub_category_id) {
      params.push(sub_category_id);
      whereClause += ` AND p.sub_category_id = $${params.length}`;
    }
    
    if (featured) {
      whereClause += ' AND p.featured = true';
    }
    
    const result = await db.query(`
      SELECT p.*, 
             sc.name as sub_category_name,
             c.name as category_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pv.id,
                   'variant_name', pv.variant_name,
                   'sku', pv.sku,
                   'attributes', pv.attributes
                 )
               ) FILTER (WHERE pv.id IS NOT NULL), 
               '[]'
             ) as variants
      FROM products p
      JOIN sub_categories sc ON p.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
      ${whereClause}
      GROUP BY p.id, sc.name, c.name
      ORDER BY p.created_at DESC
    `, params);
    
    res.json({ products: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { sub_category_id, name, description, sku, brand, unit, weight, dimensions, featured } = req.body;
    const result = await db.query(
      'INSERT INTO products (sub_category_id, name, description, sku, brand, unit, weight, dimensions, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [sub_category_id, name, description, sku, brand, unit, weight, dimensions, featured || false]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Services
exports.getServices = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM service_catalog WHERE is_active = true ORDER BY created_at DESC');
    res.json({ services: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, description, service_type, duration, price } = req.body;
    const result = await db.query(
      'INSERT INTO service_catalog (name, description, service_type, duration, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, service_type, duration, price]
    );
    res.status(201).json({ service: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Subscription Plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC');
    res.json({ plans: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, duration_months, price, features } = req.body;
    const result = await db.query(
      'INSERT INTO subscription_plans (name, description, duration_months, price, features) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, duration_months, price, JSON.stringify(features)]
    );
    res.status(201).json({ plan: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Stock Issue
// order_type rules:
//   B2B → admin (to anyone), core_body_a/b (to businessman only), dealer (to businessman only, if admin approved)
//   B2C → stock_point businessman (to customer only)
//   Stock Point CANNOT do B2B bulk issue
exports.issueStock = async (req, res) => {
  const client = await db.connect();
  try {
    const { product_id, variant_id, to_entity_type, to_entity_id, quantity, unit, note, order_type } = req.body;
    const issuer = req.user;

    if (!product_id || !to_entity_type || !to_entity_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'product_id, to_entity_type, to_entity_id, and quantity are required' });
    }

    if (!order_type || !['B2B', 'B2C'].includes(order_type)) {
      return res.status(400).json({ error: 'order_type must be B2B or B2C' });
    }

    // Determine from_entity_type based on role + order_type
    let from_entity_type;
    if (issuer.role_code === 'admin') {
      from_entity_type = 'admin';
    } else if (issuer.role_code === 'core_body_a' || issuer.role_code === 'core_body_b') {
      if (order_type !== 'B2B') {
        return res.status(403).json({ error: 'Core Body can only issue stock via B2B' });
      }
      if (to_entity_type !== 'businessman') {
        return res.status(403).json({ error: 'Core Body can only issue stock to Businessman' });
      }
      from_entity_type = 'core_body';
    } else if (issuer.role_code === 'dealer') {
      // Dealer: only B2B, only to businessman
      if (order_type !== 'B2B') {
        return res.status(403).json({ error: 'Dealer can only issue stock via B2B' });
      }
      if (to_entity_type !== 'businessman') {
        return res.status(403).json({ error: 'Dealer can only issue stock to Businessman' });
      }
      from_entity_type = 'dealer';
    } else if (issuer.role_code === 'businessman') {
      const spCheck = await client.query(
        `SELECT sp.id FROM stock_point_profiles sp
         JOIN businessman_profiles bp ON sp.businessman_id = bp.id
         WHERE bp.user_id = $1 AND sp.is_active = true`,
        [issuer.id]
      );
      if (spCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Only Stock Point type Businessman can issue stock' });
      }
      if (order_type !== 'B2C') {
        return res.status(403).json({ error: 'Stock Point can only issue stock via B2C (Customer Panel). B2B bulk issue is not allowed for Stock Point' });
      }
      if (to_entity_type !== 'customer') {
        return res.status(403).json({ error: 'Stock Point can only issue stock to Customer' });
      }
      from_entity_type = 'stock_point';
    }

    // Check issuer has enough inventory
    const balanceResult = await client.query(
      `SELECT id, quantity_on_hand, quantity_reserved FROM inventory_balances
       WHERE entity_type = $1 AND entity_id = $2 AND product_id = $3
       AND ($4::uuid IS NULL OR variant_id = $4)`,
      [from_entity_type, issuer.id, product_id, variant_id || null]
    );

    if (balanceResult.rows.length === 0) {
      return res.status(400).json({ error: 'No inventory found for this product' });
    }

    const balance = balanceResult.rows[0];
    const available = parseFloat(balance.quantity_on_hand) - parseFloat(balance.quantity_reserved);
    if (available < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${available}` });
    }

    await client.query('BEGIN');

    // Create stock allocation record
    await client.query(
      `INSERT INTO stock_allocations
       (product_id, variant_id, from_entity_type, from_entity_id, to_entity_type, to_entity_id, quantity, unit, status, approved_by, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'dispatched', $9, $10)`,
      [product_id, variant_id || null, from_entity_type, issuer.id, to_entity_type, to_entity_id, quantity, unit || null, issuer.id, `[${order_type}] ${note || ''}`]
    );

    // Deduct from issuer inventory
    await client.query(
      `UPDATE inventory_balances SET quantity_on_hand = quantity_on_hand - $1, last_updated_at = NOW()
       WHERE entity_type = $2 AND entity_id = $3 AND product_id = $4
       AND ($5::uuid IS NULL OR variant_id = $5)`,
      [quantity, from_entity_type, issuer.id, product_id, variant_id || null]
    );

    // Add to receiver inventory (upsert)
    await client.query(
      `INSERT INTO inventory_balances (entity_type, entity_id, product_id, variant_id, quantity_on_hand)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
       DO UPDATE SET quantity_on_hand = inventory_balances.quantity_on_hand + $5, last_updated_at = NOW()`,
      [to_entity_type, to_entity_id, product_id, variant_id || null, quantity]
    );

    // Log in inventory_ledger
    await client.query(
      `INSERT INTO inventory_ledger (product_id, variant_id, entity_type, entity_id, transaction_type, quantity, unit, reference_type, note, created_by)
       VALUES ($1, $2, $3, $4, 'issue_out', $5, $6, $7, $8, $9)`,
      [product_id, variant_id || null, from_entity_type, issuer.id, quantity, unit || null, `stock_allocation_${order_type}`, note || null, issuer.id]
    );
    await client.query(
      `INSERT INTO inventory_ledger (product_id, variant_id, entity_type, entity_id, transaction_type, quantity, unit, reference_type, note, created_by)
       VALUES ($1, $2, $3, $4, 'issue_in', $5, $6, $7, $8, $9)`,
      [product_id, variant_id || null, to_entity_type, to_entity_id, quantity, unit || null, `stock_allocation_${order_type}`, note || null, issuer.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Stock issued successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Dealer Stock Permission (Admin only)
exports.grantDealerStockPermission = async (req, res) => {
  try {
    const { dealer_id } = req.body;
    if (!dealer_id) return res.status(400).json({ error: 'dealer_id is required' });

    // Verify the user is actually a dealer
    const dealerCheck = await db.query(
      `SELECT u.id FROM users u
       JOIN user_roles r ON u.role_id = r.id
       WHERE u.id = $1 AND r.role_code = 'dealer' AND u.is_active = true`,
      [dealer_id]
    );
    if (dealerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Active dealer not found' });
    }

    // Upsert permission
    await db.query(
      `INSERT INTO dealer_stock_permissions (dealer_id, granted_by, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (dealer_id)
       DO UPDATE SET is_active = true, granted_by = $2, granted_at = NOW()`,
      [dealer_id, req.user.id]
    );

    res.json({ message: 'Stock issue permission granted to dealer' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.revokeDealerStockPermission = async (req, res) => {
  try {
    const { dealer_id } = req.body;
    if (!dealer_id) return res.status(400).json({ error: 'dealer_id is required' });

    const result = await db.query(
      `UPDATE dealer_stock_permissions SET is_active = false
       WHERE dealer_id = $1 AND is_active = true RETURNING id`,
      [dealer_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active permission found for this dealer' });
    }

    res.json({ message: 'Stock issue permission revoked from dealer' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDealerStockPermissions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT dsp.dealer_id, u.full_name, u.email, dsp.is_active, dsp.granted_at, dsp.granted_by
       FROM dealer_stock_permissions dsp
       JOIN users u ON dsp.dealer_id = u.id
       ORDER BY dsp.granted_at DESC`
    );
    res.json({ permissions: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Product Management (Full CRUD with frontend form fields)
exports.getAdminProducts = async (req, res) => {
  try {
    const { search, category_id, type, status, min_price, max_price, min_margin, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (ap.name ILIKE $${params.length} OR ap.sku ILIKE $${params.length})`;
    }
    if (category_id) {
      params.push(category_id);
      whereClause += ` AND ap.category_id = $${params.length}`;
    }
    if (type) {
      params.push(type);
      whereClause += ` AND ap.product_type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      whereClause += ` AND ap.status = $${params.length}`;
    }
    if (min_price) {
      params.push(min_price);
      whereClause += ` AND ap.base_price >= $${params.length}`;
    }
    if (max_price) {
      params.push(max_price);
      whereClause += ` AND ap.base_price <= $${params.length}`;
    }
    if (min_margin) {
      params.push(min_margin);
      whereClause += ` AND ap.margin_percent >= $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM admin_products ap ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await db.query(
      `SELECT ap.*, c.name as category_name
       FROM admin_products ap
       LEFT JOIN categories c ON ap.category_id = c.id
       ${whereClause}
       ORDER BY ap.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT ap.*, c.name as category_name
       FROM admin_products ap
       LEFT JOIN categories c ON ap.category_id = c.id
       WHERE ap.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdminProduct = async (req, res) => {
  try {
    const {
      name, sku, category_id, product_type, base_price, cost_price,
      min_margin_percent, stock_required, stock_quantity, is_digital,
      is_service, description, status = 'draft'
    } = req.body;

    if (!name || !sku || !category_id || !product_type || !base_price) {
      return res.status(400).json({ error: 'name, sku, category_id, product_type, base_price are required' });
    }

    // Check duplicate SKU
    const skuCheck = await db.query('SELECT id FROM admin_products WHERE sku = $1', [sku]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const margin_percent = cost_price > 0
      ? ((base_price - cost_price) / base_price) * 100
      : 0;

    const result = await db.query(
      `INSERT INTO admin_products
       (name, sku, category_id, product_type, base_price, cost_price, margin_percent,
        min_margin_percent, stock_required, stock_quantity, is_digital, is_service,
        description, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        name, sku, category_id, product_type, base_price, cost_price || 0,
        margin_percent, min_margin_percent || 15, stock_required ?? true,
        stock_quantity || 0, is_digital ?? false, is_service ?? false,
        description || null, status, req.user.id
      ]
    );

    res.status(201).json({ product: result.rows[0], message: 'Product created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, sku, category_id, product_type, base_price, cost_price,
      min_margin_percent, stock_required, stock_quantity, is_digital,
      is_service, description, status
    } = req.body;

    const existing = await db.query('SELECT id FROM admin_products WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    // Check SKU conflict with other products
    if (sku) {
      const skuCheck = await db.query('SELECT id FROM admin_products WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuCheck.rows.length > 0) return res.status(400).json({ error: 'SKU already exists' });
    }

    const margin_percent = (base_price && cost_price > 0)
      ? ((base_price - cost_price) / base_price) * 100
      : undefined;

    const result = await db.query(
      `UPDATE admin_products SET
        name = COALESCE($1, name),
        sku = COALESCE($2, sku),
        category_id = COALESCE($3, category_id),
        product_type = COALESCE($4, product_type),
        base_price = COALESCE($5, base_price),
        cost_price = COALESCE($6, cost_price),
        margin_percent = COALESCE($7, margin_percent),
        min_margin_percent = COALESCE($8, min_margin_percent),
        stock_required = COALESCE($9, stock_required),
        stock_quantity = COALESCE($10, stock_quantity),
        is_digital = COALESCE($11, is_digital),
        is_service = COALESCE($12, is_service),
        description = COALESCE($13, description),
        status = COALESCE($14, status),
        updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        name, sku, category_id, product_type, base_price, cost_price,
        margin_percent, min_margin_percent, stock_required, stock_quantity,
        is_digital, is_service, description, status, id
      ]
    );

    res.json({ product: result.rows[0], message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE admin_products SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product archived successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Product Pricing
exports.updatePricing = async (req, res) => {
  try {
    const { product_id, variant_id, price_type, price, reason } = req.body;
    
    // Check if pricing exists
    const existingResult = await db.query(
      'SELECT * FROM product_pricing WHERE product_id = $1 AND variant_id = $2 AND price_type = $3 AND is_active = true',
      [product_id, variant_id, price_type]
    );
    
    if (existingResult.rows.length > 0) {
      const currentPricing = existingResult.rows[0];
      
      // Record price history
      await db.query(
        'INSERT INTO price_history (product_id, variant_id, old_price, new_price, price_type, changed_by, change_reason) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [product_id, variant_id, currentPricing.price, price, price_type, req.user?.id, reason]
      );
      
      // Update existing pricing
      await db.query(
        'UPDATE product_pricing SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [price, currentPricing.id]
      );
    } else {
      // Create new pricing
      await db.query(
        'INSERT INTO product_pricing (product_id, variant_id, price_type, price) VALUES ($1, $2, $3, $4)',
        [product_id, variant_id, price_type, price]
      );
    }
    
    res.json({ message: 'Pricing updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};