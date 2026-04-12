const db = require('../config/db');

// =============================================================================
// SPH MARKETPLACE MANAGEMENT
// =============================================================================

/**
 * Get products from the global catalog that an SPH can list for B2C
 */
exports.getBulkCatalogForSPH = async (req, res) => {
  try {
    const { category_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // We only show products that the seller HAS NOT already listed
    let whereClause = 'WHERE p.is_active = true AND p.created_by != $1';
    const params = [req.user.id];
    
    // Also exclude products already in market_listings for this seller
    whereClause += ' AND p.id NOT IN (SELECT product_id FROM market_listings WHERE seller_id = $1)';

    if (category_id && category_id !== 'all') {
      params.push(category_id);
      whereClause += ` AND p.category_id = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }
    
    const countResult = await db.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );
    
    params.push(limit, offset);
    const result = await db.query(`
      SELECT p.id, p.name, p.sku, p.thumbnail_url, c.name as category_name,
             pp.mrp, pp.base_price as bulk_price, pp.selling_price as recommended_retail_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      ${whereClause}
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
    console.error('getBulkCatalogForSPH error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Link a system product to SPH's B2C shop
 */
exports.addListingFromCatalog = async (req, res) => {
  try {
    const { product_id, retail_price, stock_quantity = 0 } = req.body;
    const seller_id = req.user.id;

    if (!product_id || !retail_price) {
      return res.status(400).json({ error: 'product_id and retail_price are required' });
    }

    // Validation: Check if product exists and get its base pricing
    const pricingResult = await db.query(
      'SELECT base_price, mrp FROM product_pricing WHERE product_id = $1 AND is_current = true AND variant_id IS NULL',
      [product_id]
    );

    if (pricingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product pricing not found' });
    }

    const { base_price, mrp } = pricingResult.rows[0];

    // Business Logic: Retail price should be within [base_price, mrp]
    if (parseFloat(retail_price) < parseFloat(base_price)) {
      return res.status(400).json({ error: `Retail price cannot be lower than bulk price (₹${base_price})` });
    }
    if (parseFloat(retail_price) > parseFloat(mrp)) {
      return res.status(400).json({ error: `Retail price cannot exceed MRP (₹${mrp})` });
    }

    const result = await db.query(
      `INSERT INTO market_listings (product_id, seller_id, retail_price, stock_quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, seller_id, retail_price, stock_quantity]
    );

    res.status(201).json({
      message: 'Product listed successfully in your B2C shop',
      listing: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'You have already listed this product' });
    }
    console.error('addListingFromCatalog error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get SPH's own B2C listings
 */
exports.getMyB2CListings = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const { search, category_id } = req.query;

    let query = `
      SELECT ml.*, p.name, p.sku, p.thumbnail_url, c.name as category_name,
             pp.mrp, pp.base_price as bulk_price
      FROM market_listings ml
      JOIN products p ON ml.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_pricing pp ON p.id = pp.product_id AND pp.is_current = true AND pp.variant_id IS NULL
      WHERE ml.seller_id = $1
    `;
    
    const params = [seller_id];

    if (category_id && category_id !== 'all') {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    query += ' ORDER BY ml.created_at DESC';

    const result = await db.query(query, params);
    res.json({ listings: result.rows });
  } catch (error) {
    console.error('getMyB2CListings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing B2C listing
 */
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { retail_price, is_active, stock_quantity } = req.body;
    const seller_id = req.user.id;

    // Verify ownership
    const listingCheck = await db.query(
      'SELECT ml.product_id, pp.base_price, pp.mrp FROM market_listings ml JOIN product_pricing pp ON ml.product_id = pp.product_id WHERE ml.id = $1 AND ml.seller_id = $2 AND pp.is_current = true',
      [id, seller_id]
    );

    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or access denied' });
    }

    const { base_price, mrp } = listingCheck.rows[0];

    // Validation
    if (retail_price !== undefined) {
      if (parseFloat(retail_price) < parseFloat(base_price)) {
        return res.status(400).json({ error: `Retail price cannot be lower than bulk price (₹${base_price})` });
      }
      if (parseFloat(retail_price) > parseFloat(mrp)) {
        return res.status(400).json({ error: `Retail price cannot exceed MRP (₹${mrp})` });
      }
    }

    const result = await db.query(
      `UPDATE market_listings 
       SET retail_price = COALESCE($1, retail_price),
           is_active = COALESCE($2, is_active),
           stock_quantity = COALESCE($3, stock_quantity),
           updated_at = NOW()
       WHERE id = $4 AND seller_id = $5
       RETURNING *`,
      [retail_price, is_active, stock_quantity, id, seller_id]
    );

    res.json({ message: 'Listing updated successfully', listing: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * SPH direct product creation (Custom Product)
 */
exports.createCustomSPHProduct = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      name, sku, category_id, description, thumbnail_url, image_urls = [],
      retail_price, mrp, cost_price, stock_quantity = 0,
      variants = [], type = 'physical'
    } = req.body;

    if (!name || !sku || !category_id || !retail_price || !mrp) {
      return res.status(400).json({ error: 'Required fields missing: name, sku, category_id, retail_price, mrp' });
    }

    await client.query('BEGIN');

    // 1. Create Product
    const productResult = await client.query(
      `INSERT INTO products 
       (category_id, name, sku, description, type, thumbnail_url, image_urls, is_active, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8) 
       RETURNING id`,
      [category_id, name, sku, description, type, thumbnail_url, JSON.stringify(image_urls), req.user.id]
    );
    const productId = productResult.rows[0].id;

    // 2. Create Pricing (Base Product)
    // For custom products, we use retail_price as selling_price and cost_price (or retail_price) as base_price
    await client.query(
      `INSERT INTO product_pricing 
       (product_id, variant_id, mrp, base_price, selling_price, is_current, created_by) 
       VALUES ($1, NULL, $2, $3, $4, true, $5)`,
      [productId, mrp, cost_price || retail_price, retail_price, req.user.id]
    );

    // 3. Handle Variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { variant_name, sku_suffix, attributes = {}, mrp: vMrp, basePrice: vBase, sellingPrice: vSell } = variant;
        
        if (!variant_name) continue;
        
        const variantResult = await client.query(
          `INSERT INTO product_variants 
           (product_id, variant_name, sku_suffix, attributes) 
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [productId, variant_name, sku_suffix, JSON.stringify(attributes)]
        );
        const variantId = variantResult.rows[0].id;

        // Variant Pricing
        await client.query(
          `INSERT INTO product_pricing 
           (product_id, variant_id, mrp, base_price, selling_price, is_current, created_by) 
           VALUES ($1, $2, $3, $4, $5, true, $6)`,
          [productId, variantId, vMrp || mrp, vBase || cost_price || retail_price, vSell || retail_price, req.user.id]
        );
      }
    }

    // 4. Create Initial Stock Entry (Admin context for the product itself)
    if (parseFloat(stock_quantity) > 0) {
      await client.query(
        `INSERT INTO inventory_balances 
         (entity_type, entity_id, product_id, variant_id, quantity_on_hand) 
         VALUES ('admin', $1, $2, NULL, $3)`,
        [req.user.id, productId, stock_quantity]
      );
    }

    // 5. Create Marketplace Listing immediately for the creator
    const listingResult = await client.query(
      `INSERT INTO market_listings (product_id, seller_id, retail_price, stock_quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, req.user.id, retail_price, stock_quantity]
    );

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Custom product with advanced details created and listed successfully',
      listing: listingResult.rows[0],
      product_id: productId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(400).json({ error: 'SKU already exists' });
    console.error('createCustomSPHProduct expanded error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
