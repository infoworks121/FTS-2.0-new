const db = require('../config/db');
const xlsx = require('xlsx');
const fs = require('fs');

// =============================================================================
// CATEGORIES MANAGEMENT
// =============================================================================

exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.parent_id, c.name, c.slug, c.description, c.icon_url, 
             c.commission_rule_id, cr.name as commission_rule_name,
             c.is_active, c.sort_order, c.created_at
      FROM categories c
      LEFT JOIN commission_rules cr ON c.commission_rule_id = cr.id
      WHERE c.is_active = true
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon_url, sort_order, parent_id, commission_rule_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await db.query(
      `INSERT INTO categories (name, description, slug, icon_url, sort_order, parent_id, commission_rule_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description || null, slug, icon_url || null, sort_order || 0, parent_id || null, commission_rule_id === 'none' ? null : commission_rule_id || null]
    );
    
    res.status(201).json({ 
      category: result.rows[0], 
      message: 'Category created successfully' 
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Category name or slug already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// =============================================================================
// PRODUCTS MANAGEMENT (FTS Schema Compatible)
// =============================================================================

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon_url, sort_order, parent_id, commission_rule_id, is_active } = req.body;
    
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;
    
    // Check if category exists
    const existing = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const cat = existing.rows[0];

    const updatedName = name !== undefined ? name : cat.name;
    const updatedSlug = slug !== undefined ? slug : cat.slug;
    const updatedDescription = description !== undefined ? description : cat.description;
    const updatedIcon = icon_url !== undefined ? icon_url : cat.icon_url;
    const updatedSort = sort_order !== undefined ? sort_order : cat.sort_order;
    const updatedParent = parent_id !== undefined ? (parent_id === 'none' ? null : parent_id) : cat.parent_id;
    const updatedRule = commission_rule_id !== undefined ? (commission_rule_id === 'none' ? null : commission_rule_id) : cat.commission_rule_id;
    const updatedActive = is_active !== undefined ? is_active : cat.is_active;

    const result = await db.query(
      `UPDATE categories 
       SET name = $1, description = $2, slug = $3, icon_url = $4, sort_order = $5, parent_id = $6, commission_rule_id = $7, is_active = $8
       WHERE id = $9 RETURNING *`,
      [updatedName, updatedDescription, updatedSlug, updatedIcon, updatedSort, updatedParent, updatedRule, updatedActive, id]
    );
    
    res.json({ category: result.rows[0], message: 'Category updated successfully' });
  } catch (error) {
    if (error.code === '23505') res.status(400).json({ error: 'Category name already exists' });
    else res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE categories SET is_active = false WHERE id = $1`, [id]);
    res.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============================================================================
// PRODUCTS MANAGEMENT (FTS Schema Compatible)
// =============================================================================

exports.downloadBulkTemplate = (req, res) => {
  try {
    const headers = [
      'Category', 'Product Name', 'SKU', 'Description', 'Type (physical/digital/service)', 'Unit (e.g. kg/pcs)', 
      'Profit Channel (B2B/B2C)', 'MRP', 'Base Price', 'Selling Price', 'Initial Stock',
      'Variant Name', 'Variant SKU Suffix', 'Variant MRP', 'Variant Base Price', 'Variant Selling Price'
    ];
    
    const worksheet = xlsx.utils.aoa_to_sheet([headers]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="bulk_products_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUploadProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    if (data.length === 0) {
       if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File is empty' });
    }

    const profitChannelFallback = 'B2C';
    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    const categoriesResult = await db.query('SELECT id, name FROM categories');
    const categoriesMap = {};
    categoriesResult.rows.forEach(c => categoriesMap[c.name.toLowerCase()] = c.id);

    const profitRulesResult = await db.query('SELECT id, channel FROM profit_rules WHERE is_current = true');
    const profitRulesMap = {};
    profitRulesResult.rows.forEach(pr => profitRulesMap[pr.channel] = pr.id);
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const catName = row['Category'];
            const name = row['Product Name'];
            const sku = row['SKU'];
            let mrp = row['MRP'];
            let base_price = row['Base Price'];
            let selling_price = row['Selling Price'];
            
            if (!catName || !name || !sku || !mrp || !base_price || !selling_price) {
                throw new Error('Missing required fields: Category, Product Name, SKU, MRP, Base Price, or Selling Price');
            }

            let category_id = categoriesMap[catName.toLowerCase()];
            if (!category_id) {
                const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const newCat = await client.query(
                    `INSERT INTO categories (name, slug, is_active) VALUES ($1, $2, true) RETURNING id, name`,
                    [catName, slug]
                );
                category_id = newCat.rows[0].id;
                categoriesMap[catName.toLowerCase()] = category_id;
            }

            const type = (row['Type (physical/digital/service)'] || 'physical').toLowerCase();
            const unit = row['Unit (e.g. kg/pcs)'] || 'pcs';
            let profit_channel = (row['Profit Channel (B2B/B2C)'] || profitChannelFallback).toUpperCase();
            
            if (!['B2B', 'B2C'].includes(profit_channel)) profit_channel = profitChannelFallback;
            
            if (!profitRulesMap[profit_channel]) {
                throw new Error(`No active profit rule found for channel: ${profit_channel}`);
            }
            
            const initial_stock = parseFloat(row['Initial Stock']) || 0;
            
            const productResult = await client.query(
              `INSERT INTO products 
               (category_id, name, sku, description, type, unit, created_by) 
               VALUES ($1, $2, $3, $4, $5, $6, $7) 
               RETURNING id`,
              [category_id, name, sku, row['Description'] || '', type, unit, req.user.id]
            );
            const productId = productResult.rows[0].id;

            const varName = row['Variant Name'];
            let createdVariantId = null;
            if (varName) {
                const varSku = row['Variant SKU Suffix'] || '';
                const varMrp = row['Variant MRP'] || mrp;
                const varBase = row['Variant Base Price'] || base_price;
                const varSell = row['Variant Selling Price'] || selling_price;
                
                const variantResult = await client.query(
                  `INSERT INTO product_variants 
                   (product_id, variant_name, sku_suffix, attributes) 
                   VALUES ($1, $2, $3, '{}') RETURNING id`,
                  [productId, varName, varSku]
                );
                createdVariantId = variantResult.rows[0].id;
                
                await client.query(
                    `INSERT INTO product_pricing 
                     (product_id, variant_id, mrp, base_price, selling_price, is_current, created_by) 
                     VALUES ($1, $2, $3, $4, $5, true, $6)`,
                    [productId, createdVariantId, varMrp, varBase, varSell, req.user.id]
                );
            }
            
            await client.query(
              `INSERT INTO product_pricing 
               (product_id, variant_id, mrp, base_price, selling_price, is_current, created_by) 
               VALUES ($1, NULL, $2, $3, $4, true, $5)`,
              [productId, mrp, base_price, selling_price, req.user.id]
            );

            if (initial_stock > 0) {
                await client.query(
                    `INSERT INTO inventory_balances 
                     (entity_type, entity_id, product_id, variant_id, quantity_on_hand) 
                     VALUES ('admin', $1, $2, $3, $4)`,
                    [req.user.id, productId, createdVariantId, initial_stock]
                );
                
                await client.query(
                    `INSERT INTO inventory_ledger 
                     (product_id, variant_id, entity_type, entity_id, transaction_type, 
                      quantity, reference_type, note, created_by) 
                     VALUES ($1, $2, 'admin', $3, 'initial_stock', $4, 'product_creation', 
                             'Bulk Upload Initial Stock', $5)`,
                    [productId, createdVariantId, req.user.id, initial_stock, req.user.id]
                );
            }

            await client.query('COMMIT');
            results.success++;
        } catch (error) {
            await client.query('ROLLBACK');
            let errorMsg = error.message;
            if (error.code === '23505') errorMsg = 'SKU already exists';
            results.failed++;
            results.errors.push({ row: i + 2, sku: row['SKU'] || 'N/A', error: errorMsg });
        } finally {
            client.release();
        }
    }
    
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(200).json(results);
    
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category_id, search, type, is_dealer_routed, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE p.is_active = true';
    const params = [];
    
    if (category_id) {
      params.push(category_id);
      whereClause += ` AND p.category_id = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }
    
    if (type) {
      params.push(type);
      whereClause += ` AND p.type = $${params.length}`;
    }

    if (is_dealer_routed !== undefined) {
      params.push(is_dealer_routed === 'true');
      whereClause += ` AND p.is_dealer_routed = $${params.length}`;
    }
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );
    
    // Get products with variants and pricing
    params.push(limit, offset);
    const result = await db.query(`
      SELECT p.*, 
             c.name as category_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pv.id,
                   'variant_name', pv.variant_name,
                   'sku_suffix', pv.sku_suffix,
                   'attributes', pv.attributes
                 )
               ) FILTER (WHERE pv.id IS NOT NULL), 
               '[]'
             ) as variants,
             pp.mrp,
             pp.base_price,
             pp.selling_price,
             pp.bulk_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      ${whereClause}
      GROUP BY p.id, c.name, pp.mrp, pp.base_price, pp.selling_price, pp.bulk_price
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
    
    res.json({ 
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// COMPLETE PRODUCT CREATION FLOW (Schema-based)
exports.createProduct = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      // Basic Product Info
      category_id, name, sku, description, type = 'physical', unit,
      is_subscription = false, // FUTURE IMPLEMENTATION: Currently not active
      thumbnail_url, image_urls = [], tags = [],
      is_dealer_routed = false, // Added for Dealer Subdivision flow
      
      // Variants (optional)
      variants = [],
      
      // Pricing Info
      mrp, base_price, selling_price, admin_margin_pct, bulk_price,
      
      // Profit Distribution (B2B/B2C)
      profit_channel = 'B2C', // 'B2B' or 'B2C'
      
      // Initial Stock
      initial_stock_quantity = 0
    } = req.body;

    // Validation
    if (!category_id || !name || !sku || !mrp || !base_price || !selling_price) {
      return res.status(400).json({ 
        error: 'category_id, name, sku, mrp, base_price, selling_price are required' 
      });
    }

    if (!['physical', 'digital', 'service'].includes(type)) {
      return res.status(400).json({ error: 'type must be physical, digital, or service' });
    }

    if (!['B2B', 'B2C'].includes(profit_channel)) {
      return res.status(400).json({ error: 'profit_channel must be B2B or B2C' });
    }

    await client.query('BEGIN');

    // Step 1: Insert Product
    const productResult = await client.query(
      `INSERT INTO products 
       (category_id, name, sku, description, type, unit, is_subscription, 
        thumbnail_url, image_urls, tags, is_dealer_routed, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        category_id, name, sku, description, type, unit, is_subscription,
        thumbnail_url, JSON.stringify(image_urls), tags, is_dealer_routed, req.user.id
      ]
    );
    
    const product = productResult.rows[0];
    const productId = product.id;

    // Step 2: Insert Variants (if provided)
    const createdVariants = [];
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { variant_name, sku_suffix, attributes = {} } = variant;
        
        if (!variant_name) continue;
        
        const variantResult = await client.query(
          `INSERT INTO product_variants 
           (product_id, variant_name, sku_suffix, attributes) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [productId, variant_name, sku_suffix, JSON.stringify(attributes)]
        );
        
        const variantId = variantResult.rows[0].id;

        // NEW: Handle Variant-specific pricing if provided in bulk
        if (variant.mrp && variant.base_price) {
          await client.query(
            `INSERT INTO product_pricing 
             (product_id, variant_id, mrp, base_price, selling_price, 
              admin_margin_pct, bulk_price, is_current, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)`,
            [
              productId, variantId, variant.mrp, variant.base_price,
              variant.selling_price || 0, variant.admin_margin_pct || 0,
              variant.bulk_price || null, req.user.id
            ]
          );
        }

        // NEW: Handle Variant-specific initial stock
        if (variant.initial_stock_quantity > 0) {
          await client.query(
            `INSERT INTO inventory_balances 
             (entity_type, entity_id, product_id, variant_id, quantity_on_hand) 
             VALUES ('admin', $1, $2, $3, $4)`,
            [req.user.id, productId, variantId, variant.initial_stock_quantity]
          );
          
          await client.query(
            `INSERT INTO inventory_ledger 
             (product_id, variant_id, entity_type, entity_id, transaction_type, 
              quantity, reference_type, note, created_by) 
             VALUES ($1, $2, 'admin', $3, 'initial_stock', $4, 'product_creation', 
                     'Initial variant stock added during product creation', $5)`,
            [productId, variantId, req.user.id, variant.initial_stock_quantity, req.user.id]
          );
        }
        
        createdVariants.push(variantResult.rows[0]);
      }
    }

    // Step 3: Insert Base Product Pricing
    await client.query(
      `INSERT INTO product_pricing 
       (product_id, variant_id, mrp, base_price, selling_price, 
        admin_margin_pct, bulk_price, is_current, created_by) 
       VALUES ($1, NULL, $2, $3, $4, $5, $6, true, $7)`,
      [
        productId, mrp, base_price, selling_price, 
        admin_margin_pct || 0, bulk_price || null, req.user.id
      ]
    );

    // Step 4: Assign Profit Rules (get current active rule for channel)
    const profitRuleResult = await client.query(
      `SELECT id FROM profit_rules 
       WHERE channel = $1 AND is_current = true 
       LIMIT 1`,
      [profit_channel]
    );
    
    if (profitRuleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `No active profit rule found for channel: ${profit_channel}` 
      });
    }

    // Step 5: Create Initial Admin Stock Entry
    if (initial_stock_quantity > 0) {
      await client.query(
        `INSERT INTO inventory_balances 
         (entity_type, entity_id, product_id, variant_id, quantity_on_hand) 
         VALUES ('admin', $1, $2, NULL, $3)`,
        [req.user.id, productId, initial_stock_quantity]
      );
      
      // Log in inventory_ledger
      await client.query(
        `INSERT INTO inventory_ledger 
         (product_id, variant_id, entity_type, entity_id, transaction_type, 
          quantity, reference_type, note, created_by) 
         VALUES ($1, NULL, 'admin', $2, 'initial_stock', $3, 'product_creation', 
                 'Initial stock added during product creation', $4)`,
        [productId, req.user.id, initial_stock_quantity, req.user.id]
      );
    }

    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product,
        variants: createdVariants,
        pricing: { mrp, base_price, selling_price, admin_margin_pct, bulk_price },
        profit_channel,
        initial_stock: initial_stock_quantity
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'SKU already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  } finally {
    client.release();
  }
};

// =============================================================================
// PRODUCT VARIANTS MANAGEMENT
// =============================================================================

exports.getProductVariants = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const result = await db.query(`
      SELECT pv.*, 
             pp.mrp, pp.base_price, pp.selling_price, pp.bulk_price
      FROM product_variants pv
      LEFT JOIN product_pricing pp ON pv.id = pp.variant_id AND pp.is_current = true
      WHERE pv.product_id = $1 AND pv.is_active = true
      ORDER BY pv.created_at ASC
    `, [product_id]);
    
    res.json({ variants: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProductVariant = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { product_id } = req.params;
    const { 
      variant_name, sku_suffix, attributes = {},
      mrp, base_price, selling_price, admin_margin_pct, bulk_price 
    } = req.body;

    if (!variant_name) {
      return res.status(400).json({ error: 'variant_name is required' });
    }

    await client.query('BEGIN');

    // Create variant
    const variantResult = await client.query(
      `INSERT INTO product_variants 
       (product_id, variant_name, sku_suffix, attributes) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, variant_name, sku_suffix, JSON.stringify(attributes)]
    );
    
    const variant = variantResult.rows[0];

    // Create pricing if provided
    if (mrp && base_price && selling_price) {
      await client.query(
        `INSERT INTO product_pricing 
         (product_id, variant_id, mrp, base_price, selling_price, 
          admin_margin_pct, bulk_price, is_current, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)`,
        [
          product_id, variant.id, mrp, base_price, selling_price,
          admin_margin_pct || 0, bulk_price || null, req.user.id
        ]
      );
    }

    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Product variant created successfully',
      variant
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =============================================================================
// PRODUCT PRICING MANAGEMENT
// =============================================================================

exports.updateProductPricing = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { product_id, variant_id, mrp, base_price, selling_price, admin_margin_pct, bulk_price, reason } = req.body;

    if (!product_id || !mrp || !base_price || !selling_price) {
      return res.status(400).json({ 
        error: 'product_id, mrp, base_price, selling_price are required' 
      });
    }

    await client.query('BEGIN');

    // Get current pricing for history
    const currentResult = await client.query(
      `SELECT * FROM product_pricing 
       WHERE product_id = $1 AND ($2::uuid IS NULL OR variant_id = $2) AND is_current = true`,
      [product_id, variant_id || null]
    );

    if (currentResult.rows.length > 0) {
      const current = currentResult.rows[0];
      
      // Record price history
      await client.query(
        `INSERT INTO price_history 
         (product_id, variant_id, old_price, new_price, field_changed, changed_by, reason) 
         VALUES ($1, $2, $3, $4, 'selling_price', $5, $6)`,
        [product_id, variant_id || null, current.selling_price, selling_price, req.user.id, reason || 'Price update']
      );
      
      // Update existing pricing
      await client.query(
        `UPDATE product_pricing SET 
         mrp = $1, base_price = $2, selling_price = $3, 
         admin_margin_pct = $4, bulk_price = $5
         WHERE id = $6`,
        [mrp, base_price, selling_price, admin_margin_pct || 0, bulk_price || null, current.id]
      );
    } else {
      // Create new pricing
      await client.query(
        `INSERT INTO product_pricing 
         (product_id, variant_id, mrp, base_price, selling_price, 
          admin_margin_pct, bulk_price, is_current, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)`,
        [
          product_id, variant_id || null, mrp, base_price, selling_price,
          admin_margin_pct || 0, bulk_price || null, req.user.id
        ]
      );
    }

    await client.query('COMMIT');
    
    res.json({ message: 'Product pricing updated successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =============================================================================
// PROFIT RULES MANAGEMENT
// =============================================================================

exports.getProfitRules = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM profit_rules 
      WHERE is_current = true 
      ORDER BY channel ASC
    `);
    
    res.json({ profit_rules: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProfitRule = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      channel, rule_name,
      fts_share_pct, referral_share_pct, trust_fund_pct, admin_pct, company_pct,
      core_body_pool_pct, company_reserve_pct, stock_point_pct, referral_pct
    } = req.body;

    if (!channel || !rule_name) {
      return res.status(400).json({ error: 'channel and rule_name are required' });
    }

    if (!['B2B', 'B2C'].includes(channel)) {
      return res.status(400).json({ error: 'channel must be B2B or B2C' });
    }

    await client.query('BEGIN');

    // Deactivate existing rule for this channel
    await client.query(
      `UPDATE profit_rules SET is_current = false WHERE channel = $1 AND is_current = true`,
      [channel]
    );

    // Create new rule
    const result = await client.query(
      `INSERT INTO profit_rules 
       (channel, rule_name, fts_share_pct, referral_share_pct, trust_fund_pct, 
        admin_pct, company_pct, core_body_pool_pct, company_reserve_pct, 
        stock_point_pct, referral_pct, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        channel, rule_name, fts_share_pct || 0, referral_share_pct || 0, trust_fund_pct || 0,
        admin_pct || 0, company_pct || 0, core_body_pool_pct || 0, company_reserve_pct || 0,
        stock_point_pct || 0, referral_pct || 0, req.user.id
      ]
    );

    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Profit rule created successfully',
      profit_rule: result.rows[0]
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

// =============================================================================
// INVENTORY MANAGEMENT
// =============================================================================

exports.getInventoryBalances = async (req, res) => {
  try {
    const { entity_type, entity_id, product_id } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (entity_type) {
      params.push(entity_type);
      whereClause += ` AND ib.entity_type = $${params.length}`;
    }
    
    if (entity_id) {
      params.push(entity_id);
      whereClause += ` AND ib.entity_id = $${params.length}`;
    }
    
    if (product_id) {
      params.push(product_id);
      whereClause += ` AND ib.product_id = $${params.length}`;
    }
    
    const result = await db.query(`
      SELECT ib.*, 
             p.name as product_name, p.sku, p.unit,
             pv.variant_name,
             u.full_name as entity_name
      FROM inventory_balances ib
      LEFT JOIN products p ON ib.product_id = p.id
      LEFT JOIN product_variants pv ON ib.variant_id = pv.id
      LEFT JOIN users u ON ib.entity_id = u.id
      ${whereClause}
      ORDER BY ib.last_updated_at DESC
    `, params);
    
    res.json({ inventory_balances: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addInitialStock = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { product_id, variant_id, quantity, note } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'product_id and positive quantity are required' });
    }

    await client.query('BEGIN');

    // Add to admin inventory
    await client.query(
      `INSERT INTO inventory_balances 
       (entity_type, entity_id, product_id, variant_id, quantity_on_hand) 
       VALUES ('admin', $1, $2, $3, $4)
       ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
       DO UPDATE SET quantity_on_hand = inventory_balances.quantity_on_hand + $4, last_updated_at = NOW()`,
      [req.user.id, product_id, variant_id || null, quantity]
    );

    // Log in inventory_ledger
    await client.query(
      `INSERT INTO inventory_ledger 
       (product_id, variant_id, entity_type, entity_id, transaction_type, 
        quantity, reference_type, note, created_by) 
       VALUES ($1, $2, 'admin', $3, 'stock_in', $4, 'manual_addition', $5, $6)`,
      [product_id, variant_id || null, req.user.id, quantity, note || 'Manual stock addition', req.user.id]
    );

    await client.query('COMMIT');
    
    res.json({ message: 'Stock added successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
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
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }
    if (category_id) {
      params.push(category_id);
      whereClause += ` AND p.category_id = $${params.length}`;
    }
    if (type) {
      params.push(type);
      whereClause += ` AND p.type = $${params.length}`;
    }
    if (status) {
      if (status === 'active') {
        whereClause += ` AND p.is_active = true`;
      } else if (status === 'archived' || status === 'draft') {
        whereClause += ` AND p.is_active = false`;
      }
    }
    if (min_price) {
      params.push(min_price);
      whereClause += ` AND pp.base_price >= $${params.length}`;
    }
    if (max_price) {
      params.push(max_price);
      whereClause += ` AND pp.base_price <= $${params.length}`;
    }
    if (min_margin) {
      params.push(min_margin);
      whereClause += ` AND pp.admin_margin_pct >= $${params.length}`;
    }

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM products p
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);

    params.push(limit, offset);
    
    // Select aliases to match frontend expect: base_price -> selling_price (or mrp), cost_price -> pp.base_price, status -> is_active, stock_quantity -> ib.quantity_on_hand
    const query = `
      SELECT p.id, p.name, p.sku, p.category_id, c.name as category_name, p.type as product_type, 
             p.description, p.thumbnail_url, p.image_urls, p.created_at, p.updated_at,
             CASE WHEN p.is_active THEN 'active' ELSE 'draft' END as status,
             p.type = 'digital' as is_digital, p.type = 'service' as is_service,
             c.name as category_name,
             pp.mrp,
             pp.base_price,
             pp.selling_price,
             pp.bulk_price,
             pp.admin_margin_pct,
             pp.admin_margin_pct as min_margin_percent,
             pp.base_price as cost_price,
             CASE WHEN pp.selling_price > 0 THEN ((pp.selling_price - pp.base_price) / pp.selling_price) * 100 ELSE 0 END as margin_percent,
             COALESCE(ib.quantity_on_hand, 0) as stock_quantity,
             true as stock_required
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      LEFT JOIN inventory_balances ib ON p.id = ib.product_id AND ib.entity_type = 'admin' AND ib.variant_id IS NULL
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const result = await db.query(query, params);

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
      `SELECT p.id, p.name, p.sku, p.category_id, p.type as product_type, p.description, 
              p.thumbnail_url, p.image_urls, p.created_at, p.updated_at,
             CASE WHEN p.is_active THEN 'active' ELSE 'draft' END as status,
             p.type = 'digital' as is_digital, p.type = 'service' as is_service,
             c.name as category_name,
             pp.mrp,
             pp.base_price,
             pp.selling_price,
             pp.bulk_price,
             pp.admin_margin_pct,
             pp.admin_margin_pct as min_margin_percent,
             pp.base_price as cost_price,
             CASE WHEN pp.selling_price > 0 THEN ((pp.selling_price - pp.base_price) / pp.selling_price) * 100 ELSE 0 END as margin_percent,
             COALESCE(ib.quantity_on_hand, 0) as stock_quantity,
             true as stock_required
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
       LEFT JOIN inventory_balances ib ON p.id = ib.product_id AND ib.entity_type = 'admin' AND ib.variant_id IS NULL
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdminProduct = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      name, sku, category_id, product_type, base_price, mrp, selling_price, bulk_price,
      admin_margin_pct, stock_required, stock_quantity, is_digital,
      is_service, description, thumbnail_url, image_urls = [], status = 'draft'
    } = req.body;

    if (!name || !sku || !category_id || !product_type) {
      return res.status(400).json({ error: 'name, sku, category_id, product_type are required' });
    }

    const type = is_digital ? 'digital' : (is_service ? 'service' : product_type);
    const is_active = status === 'active';

    await client.query('BEGIN');

    // Step 1: Insert Product
    const productResult = await client.query(
      `INSERT INTO products 
       (category_id, name, sku, description, type, thumbnail_url, image_urls, is_active, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [category_id, name, sku, description || null, type, thumbnail_url || null, JSON.stringify(image_urls), is_active, req.user.id]
    );
    const product = productResult.rows[0];

    // Step 2: Insert Pricing (align with frontend field names)
    await client.query(
      `INSERT INTO product_pricing 
       (product_id, mrp, base_price, selling_price, bulk_price, admin_margin_pct, is_current, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
      [
        product.id, 
        mrp || 0, 
        base_price || 0, 
        selling_price || 0, 
        bulk_price || 0, 
        admin_margin_pct || 0, 
        req.user.id
      ]
    );

    // Step 3: Insert Initial Stock if any
    if (stock_quantity > 0) {
      await client.query(
        `INSERT INTO inventory_balances (entity_type, entity_id, product_id, quantity_on_hand) 
         VALUES ('admin', $1, $2, $3)`,
        [req.user.id, product.id, stock_quantity]
      );
      await client.query(
        `INSERT INTO inventory_ledger (product_id, entity_type, entity_id, transaction_type, quantity, reference_type, note, created_by) 
         VALUES ($1, 'admin', $2, 'initial_stock', $3, 'product_creation', 'Initial stock added from admin panel', $4)`,
        [product.id, req.user.id, stock_quantity, req.user.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ product: { ...product, id: product.id }, message: 'Product created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
       return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.updateAdminProduct = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const {
      name, sku, category_id, product_type, base_price, mrp, selling_price, bulk_price,
      admin_margin_pct, stock_quantity, is_digital,
      is_service, description, thumbnail_url, image_urls, status
    } = req.body;

    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    if (sku) {
      const skuCheck = await client.query('SELECT id FROM products WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuCheck.rows.length > 0) {
         await client.query('ROLLBACK');
         return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const type = is_digital ? 'digital' : (is_service ? 'service' : product_type);
    const is_active = status ? (status === 'active') : undefined;

    await client.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        sku = COALESCE($2, sku),
        category_id = COALESCE($3, category_id),
        type = COALESCE($4, type),
        description = COALESCE($5, description),
        thumbnail_url = COALESCE($6, thumbnail_url),
        image_urls = COALESCE($7, image_urls),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
       WHERE id = $9`,
      [name, sku, category_id, type, description, thumbnail_url, image_urls ? JSON.stringify(image_urls) : null, is_active, id]
    );

    // Pricing update logic with History Logging
    if (base_price !== undefined || mrp !== undefined || selling_price !== undefined || bulk_price !== undefined || admin_margin_pct !== undefined) {
      const currentPricing = await client.query(
        'SELECT * FROM product_pricing WHERE product_id = $1 AND is_current = true AND variant_id IS NULL', 
        [id]
      );
      
      if (currentPricing.rows.length > 0) {
        const cur = currentPricing.rows[0];
        // 1. Log old prices to history BEFORE updating
        const pFields = [
          { key: 'mrp', label: 'mrp' },
          { key: 'base_price', label: 'base_price' },
          { key: 'selling_price', label: 'selling_price' },
          { key: 'bulk_price', label: 'bulk_price' }
        ];

        for (const f of pFields) {
          const newVal = req.body[f.key];
          const oldVal = cur[f.key];
          
          if (newVal !== undefined && parseFloat(oldVal) !== parseFloat(newVal)) {
            await client.query(
              `INSERT INTO price_history (product_id, variant_id, old_price, new_price, field_changed, changed_by, reason) 
               VALUES ($1, NULL, $2, $3, $4, $5, 'Admin update')`,
              [id, oldVal, newVal, f.label, req.user.id]
            );
          }
        }
        
        // 2. Perform the update
        await client.query(
          `UPDATE product_pricing SET
            mrp = COALESCE($1, mrp),
            base_price = COALESCE($2, base_price),
            selling_price = COALESCE($3, selling_price),
            bulk_price = COALESCE($4, bulk_price),
            admin_margin_pct = COALESCE($5, admin_margin_pct),
            effective_from = NOW()
           WHERE id = $6`,
          [mrp, base_price, selling_price, bulk_price, admin_margin_pct, cur.id]
        );
      } else {
        await client.query(
          `INSERT INTO product_pricing (product_id, mrp, base_price, selling_price, bulk_price, admin_margin_pct, is_current, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
          [id, mrp || 0, base_price || 0, selling_price || 0, bulk_price || 0, admin_margin_pct || 0, req.user.id]
        );
      }
    }

    if (stock_quantity !== undefined) {
      await client.query(
        `INSERT INTO inventory_balances (entity_type, entity_id, product_id, quantity_on_hand)
         VALUES ('admin', $1, $2, $3)
         ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
         DO UPDATE SET quantity_on_hand = $3, last_updated_at = NOW()`,
        [req.user.id, id, stock_quantity]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product archived successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleAdminProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get current status
    const currentStatusRes = await db.query('SELECT is_active FROM products WHERE id = $1', [id]);
    if (currentStatusRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const newStatus = !currentStatusRes.rows[0].is_active;
    
    const result = await db.query(
      `UPDATE products 
       SET is_active = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, is_active`,
      [newStatus, id]
    );
    
    res.json({ 
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
      product_id: result.rows[0].id,
      is_active: result.rows[0].is_active,
      status: newStatus ? 'active' : 'draft'
    });
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
      
      // Record price history (align with SQL schema columns)
      await db.query(
        'INSERT INTO price_history (product_id, variant_id, old_price, new_price, field_changed, changed_by, reason) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [product_id, variant_id, currentPricing.price, price, 'selling_price', req.user?.id, reason || 'Global update']
      );
      
      // Update existing pricing
      await db.query(
        'UPDATE product_pricing SET price = $1, effective_from = NOW() WHERE id = $2',
        [price, currentPricing.id]
      );
    } else {
      // Create new pricing
      await db.query(
        'INSERT INTO product_pricing (product_id, variant_id, price, is_current, created_by) VALUES ($1, $2, $3, true, $4)',
        [product_id, variant_id, price, req.user?.id]
      );
    }
    
    res.json({ message: 'Pricing updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =============================================================================
// SERVICES MANAGEMENT
// =============================================================================

exports.getServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, 
             sc.service_type, sc.delivery_mode, sc.duration_minutes, sc.requires_booking,
             pp.mrp, pp.base_price, pp.selling_price
      FROM products p
      LEFT JOIN service_catalog sc ON p.id = sc.product_id
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      WHERE p.type = 'service' AND p.is_active = true
      ORDER BY p.created_at DESC
    `);
    res.json({ services: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createService = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { 
      // Basic Product Info
      name, description, category_id, thumbnail_url,
      // Pricing
      mrp, base_price, selling_price,
      // Service specific info
      service_type, delivery_mode, duration_minutes, requires_booking 
    } = req.body;
    
    if (!name || !category_id || !base_price || !selling_price || !mrp) {
      return res.status(400).json({ error: 'name, category_id, mrp, base_price and selling_price are required' });
    }
    
    await client.query('BEGIN');
    
    const sku = `SRV-${Date.now()}`;
    
    // 1. Insert into products
    const productResult = await client.query(
      `INSERT INTO products (category_id, name, sku, description, type, thumbnail_url, created_by) 
       VALUES ($1, $2, $3, $4, 'service', $5, $6) RETURNING *`,
      [category_id, name, sku, description, thumbnail_url, req.user.id]
    );
    
    const product = productResult.rows[0];
    const productId = product.id;

    // 2. Insert Base Product Pricing
    await client.query(
      `INSERT INTO product_pricing 
       (product_id, variant_id, mrp, base_price, selling_price, is_current, created_by) 
       VALUES ($1, NULL, $2, $3, $4, true, $5)`,
      [productId, mrp, base_price, selling_price, req.user.id]
    );

    // 3. Insert into service_catalog
    const serviceResult = await client.query(
      `INSERT INTO service_catalog 
       (product_id, service_type, delivery_mode, duration_minutes, requires_booking) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [productId, service_type, delivery_mode, duration_minutes, requires_booking || false]
    );

    await client.query('COMMIT');
    
    res.status(201).json({ 
      service: { ...product, ...serviceResult.rows[0], pricing: { mrp, base_price, selling_price } }, 
      message: 'Service created successfully' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT p.*, sc.id as service_catalog_id,
             sc.service_type, sc.delivery_mode, sc.duration_minutes, sc.requires_booking,
             pp.mrp, pp.base_price, pp.selling_price, pp.bulk_price
      FROM products p
      JOIN service_catalog sc ON p.id = sc.product_id
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      WHERE p.id = $1 AND p.type = 'service'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ service: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { 
      name, description, category_id, thumbnail_url,
      mrp, base_price, selling_price,
      service_type, delivery_mode, duration_minutes, requires_booking 
    } = req.body;

    await client.query('BEGIN');

    // 1. Update products table
    await client.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id),
        thumbnail_url = COALESCE($4, thumbnail_url),
        updated_at = NOW()
       WHERE id = $5 AND type = 'service'`,
      [name, description, category_id, thumbnail_url, id]
    );

    // 2. Update service_catalog table
    await client.query(
      `UPDATE service_catalog SET
        service_type = COALESCE($1, service_type),
        delivery_mode = COALESCE($2, delivery_mode),
        duration_minutes = COALESCE($3, duration_minutes),
        requires_booking = COALESCE($4, requires_booking)
       WHERE product_id = $5`,
      [service_type, delivery_mode, duration_minutes, requires_booking, id]
    );

    // 3. Update pricing
    if (mrp || base_price || selling_price) {
      const currentRes = await client.query(
        'SELECT * FROM product_pricing WHERE product_id = $1 AND is_current = true AND variant_id IS NULL',
        [id]
      );
      if (currentRes.rows.length > 0) {
        const cur = currentRes.rows[0];
        const sFields = [
          { key: 'mrp', label: 'mrp' },
          { key: 'base_price', label: 'base_price' },
          { key: 'selling_price', label: 'selling_price' }
        ];

        for (const f of sFields) {
          const newVal = req.body[f.key];
          const oldVal = cur[f.key];
          if (newVal !== undefined && parseFloat(oldVal) !== parseFloat(newVal)) {
            await client.query(
              `INSERT INTO price_history (product_id, old_price, new_price, field_changed, changed_by, reason)
               VALUES ($1, $2, $3, $4, $5, 'Service update')`,
              [id, oldVal, newVal, f.label, req.user.id]
            );
          }
        }

        await client.query(
          `UPDATE product_pricing SET
            mrp = COALESCE($1, mrp),
            base_price = COALESCE($2, base_price),
            selling_price = COALESCE($3, selling_price),
            effective_from = NOW()
           WHERE id = $4`,
          [mrp, base_price, selling_price, cur.id]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.getPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { variant_id } = req.query;
    
    let query = `
      SELECT ph.*, u.full_name as changed_by_name
      FROM price_history ph
      LEFT JOIN users u ON ph.changed_by = u.id
      WHERE ph.product_id = $1
    `;
    const params = [id];

    if (variant_id) {
      params.push(variant_id);
      query += ` AND ph.variant_id = $${params.length}`;
    } else {
      query += ` AND ph.variant_id IS NULL`;
    }

    query += ` ORDER BY ph.changed_at DESC`;

    const result = await db.query(query, params);
    res.json({ history: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============================================================================
// SUBSCRIPTION PLANS MANAGEMENT
// =============================================================================

exports.getSubscriptionPlans = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM products 
      WHERE is_subscription = true AND is_active = true
      ORDER BY created_at DESC
    `);
    res.json({ subscription_plans: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, category_id, base_price, duration_months } = req.body;
    
    if (!name || !category_id || !base_price) {
      return res.status(400).json({ error: 'name, category_id, and base_price are required' });
    }
    
    const sku = `SUB-${Date.now()}`;
    
    const result = await db.query(
      `INSERT INTO products (name, sku, description, category_id, type, is_subscription, created_by) 
       VALUES ($1, $2, $3, $4, 'digital', true, $5) RETURNING *`,
      [name, sku, description, category_id, req.user.id]
    );
    
    res.status(201).json({ 
      subscription_plan: result.rows[0], 
      message: 'Subscription plan created successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =============================================================================
// MARKET CATALOG (Issued Products)
// =============================================================================
exports.getIssuedProducts = async (req, res) => {
  try {
    const { category_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    
    let whereClause = "WHERE p.is_active = true";

    if (category_id && category_id !== 'all') {
      params.push(category_id);
      whereClause += ` AND p.category_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    const countResult = await db.query(`
      SELECT COUNT(DISTINCT p.id) 
      FROM products p
      ${whereClause}
    `, params);

    params.push(limit, offset);
    const result = await db.query(`
      SELECT p.id, p.name, p.sku, p.description, p.thumbnail_url, p.image_urls,
             c.name as category_name,
             pp.mrp, pp.selling_price, p.unit,
             COALESCE(bp.business_name, u.full_name, 'FTS Official') as seller_name,
             COALESCE(bp.business_address, 'Main Hub') as business_address,
             COALESCE(ib.quantity_on_hand - ib.quantity_reserved, 0) as available_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      LEFT JOIN inventory_balances ib ON p.id = ib.product_id
      LEFT JOIN users u ON ib.entity_id = u.id
      LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};