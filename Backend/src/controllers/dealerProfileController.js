const { pool } = require('../config/db');

// Get dealer profile
const getDealerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role_code,
        dp.id as profile_id, dp.subdivision_id,
        dp.is_active, dp.created_at, dp.updated_at,
        sd.name as subdivision_name, d.name as district_name, d.id as district_id
      FROM users u
      JOIN dealer_profiles dp ON u.id = dp.user_id
      JOIN subdivisions sd ON dp.subdivision_id = sd.id
      JOIN districts d ON sd.district_id = d.id
      WHERE u.id = $1 AND u.role_code = 'dealer'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer profile not found' });
    }
    
    const profile = result.rows[0];

    // Fetch mapped products
    const productsQuery = `
      SELECT p.id, p.name, p.sku, dpm.assigned_at
      FROM dealer_product_map dpm
      JOIN products p ON dpm.product_id = p.id
      WHERE dpm.dealer_id = $1
    `;
    const productsResult = await pool.query(productsQuery, [profile.profile_id]);
    
    res.json({ profile, products: productsResult.rows });
  } catch (error) {
    console.error('Get dealer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update dealer profile
const updateDealerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_active } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      if (is_active !== undefined) {
        await client.query(
          `UPDATE dealer_profiles 
           SET is_active = $1, updated_at = NOW() 
           WHERE user_id = $2`,
          [is_active, userId]
        );
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Dealer profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update dealer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dealer dashboard stats
const getDealerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profileQuery = `
      SELECT dp.*, sd.name as subdivision_name, d.name as district_name
      FROM dealer_profiles dp
      JOIN subdivisions sd ON dp.subdivision_id = sd.id
      JOIN districts d ON sd.district_id = d.id
      WHERE dp.user_id = $1
    `;
    
    const profileResult = await pool.query(profileQuery, [userId]);
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const profile = profileResult.rows[0];
    
    // Inventory stats
    const inventoryQuery = `
      SELECT COALESCE(SUM(quantity_on_hand), 0) as total_stock
      FROM inventory_balances
      WHERE entity_id = $1 AND entity_type = 'dealer'
    `;
    const invResult = await pool.query(inventoryQuery, [userId]);
    
    // Assigned products
    const productsQuery = `
      SELECT p.id, p.name, p.sku, dpm.assigned_at
      FROM dealer_product_map dpm
      JOIN products p ON dpm.product_id = p.id
      WHERE dpm.dealer_id = $1
    `;
    const productsResult = await pool.query(productsQuery, [profile.id]);

    const stats = {
      profile,
      inventory: {
        total_stock: invResult.rows[0].total_stock
      },
      assigned_products: productsResult.rows
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dealer dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign product to dealer (Admin only)
const assignProductToDealer = async (req, res) => {
  try {
    const { dealer_id, product_id } = req.body;
    
    if (!dealer_id || !product_id) {
      return res.status(400).json({ message: 'Dealer ID and Product ID are required' });
    }

    // Get dealer's subdivision
    const dealerRes = await pool.query('SELECT subdivision_id FROM dealer_profiles WHERE id = $1', [dealer_id]);
    if (dealerRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    const subdivision_id = dealerRes.rows[0].subdivision_id;

    // Check if product is already assigned in this subdivision
    const checkRes = await pool.query(
      'SELECT id FROM dealer_product_map WHERE subdivision_id = $1 AND product_id = $2',
      [subdivision_id, product_id]
    );

    if (checkRes.rows.length > 0) {
      return res.status(400).json({ message: 'A dealer is already assigned to this product in this subdivision' });
    }

    await pool.query(
      'INSERT INTO dealer_product_map (dealer_id, product_id, subdivision_id) VALUES ($1, $2, $3)',
      [dealer_id, product_id, subdivision_id]
    );

    res.json({ message: 'Product assigned to dealer successfully' });
  } catch (error) {
    console.error('Assign product to dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unassign product from dealer (Admin only)
const unassignProductFromDealer = async (req, res) => {
  try {
    const { dealer_id, product_id } = req.body;
    
    if (!dealer_id || !product_id) {
      return res.status(400).json({ message: 'Dealer ID and Product ID are required' });
    }

    const result = await pool.query(
      'DELETE FROM dealer_product_map WHERE dealer_id = $1 AND product_id = $2',
      [dealer_id, product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Product unassigned from dealer successfully' });
  } catch (error) {
    console.error('Unassign product from dealer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products assigned to a specific dealer (authorized products)
const getDealerAssignedProducts = async (req, res) => {
  try {
    const { id } = req.params; // Profile ID
    
    // This query finds products directly mapped OR products in specialized categories
    // It also joins with inventory_balances for the specific dealer (via user_id)
    const query = `
      WITH dealer_info AS (
        SELECT user_id, id as profile_id FROM dealer_profiles WHERE id = $1
      )
      SELECT DISTINCT ON (p.id)
          p.id, 
          p.name, 
          p.sku, 
          p.thumbnail_url,
          c.name as category_name,
          CASE 
              WHEN dpm.product_id IS NOT NULL THEN 'Product Specialized'
              ELSE 'Category Specialized'
          END as mapping_type,
          COALESCE(ib.quantity_on_hand, 0) as stock_quantity,
          dpm.assigned_at
      FROM dealer_product_map dpm
      JOIN dealer_info di ON dpm.dealer_id = di.profile_id
      LEFT JOIN products p ON (dpm.product_id = p.id OR dpm.category_id = p.category_id)
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory_balances ib ON (ib.product_id = p.id AND ib.entity_id = di.user_id AND ib.entity_type = 'dealer')
      WHERE p.id IS NOT NULL
      ORDER BY p.id, p.name ASC
    `;
    
    const result = await pool.query(query, [id]);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get dealer assigned products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products authorized for the logged-in dealer
const getMyAuthorizedProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      WITH dealer_info AS (
        SELECT id as profile_id FROM dealer_profiles WHERE user_id = $1
      )
      SELECT DISTINCT ON (p.id)
          p.id, 
          p.name, 
          p.sku, 
          p.thumbnail_url,
          c.name as category_name,
          CASE 
              WHEN dpm.product_id IS NOT NULL THEN 'Product Specialized'
              ELSE 'Category Specialized'
          END as mapping_type,
          COALESCE(ib.quantity_on_hand, 0) as stock_quantity,
          dpm.assigned_at
      FROM dealer_product_map dpm
      JOIN dealer_info di ON dpm.dealer_id = di.profile_id
      LEFT JOIN products p ON (dpm.product_id = p.id OR dpm.category_id = p.category_id)
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory_balances ib ON (ib.product_id = p.id AND ib.entity_id = $1 AND ib.entity_type = 'dealer')
      WHERE p.id IS NOT NULL
      ORDER BY p.id, p.name ASC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get my authorized products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get insights for the logged-in dealer (subdivision specific)
const getDealerInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Dealer Profile and Subdivision
    const profileRes = await pool.query(
      'SELECT id, subdivision_id FROM dealer_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer profile not found' });
    }

    const { subdivision_id } = profileRes.rows[0];

    // 2. MTD Sales in the subdivision
    // Assuming 'orders' table has customer_id and we join with users to get subdivision_id
    const mtdSalesRes = await pool.query(`
      SELECT COALESCE(SUM(o.total_amount), 0) as mtd_sales
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE u.subdivision_id = $1 
      AND o.created_at >= date_trunc('month', CURRENT_DATE)
    `, [subdivision_id]);

    // 3. Stock Health Stats
    // Using the same recursive logic as authorized products
    const stockStatsRes = await pool.query(`
      WITH authorized_products AS (
        SELECT DISTINCT p.id
        FROM dealer_product_map dpm
        JOIN dealer_profiles dp ON dpm.dealer_id = dp.id
        LEFT JOIN products p ON (dpm.product_id = p.id OR dpm.category_id = p.category_id)
        WHERE dp.user_id = $1 AND p.id IS NOT NULL
      )
      SELECT 
        COUNT(*) as total_skus,
        COUNT(*) FILTER (WHERE COALESCE(ib.quantity_on_hand, 0) < 5) as low_stock_skus
      FROM authorized_products ap
      LEFT JOIN inventory_balances ib ON (ap.id = ib.product_id AND ib.entity_id = $1 AND ib.entity_type = 'dealer')
    `, [userId]);

    // 4. Pending Orders count in subdivision
    const pendingOrdersRes = await pool.query(`
      SELECT COUNT(*) as pending_count
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE u.subdivision_id = $1 AND o.status = 'pending'
    `, [subdivision_id]);

    // 5. Sales Trend (Last 15 days)
    const salesTrendRes = await pool.query(`
      SELECT 
        TO_CHAR(date_series, 'DD Mon') as date,
        COALESCE(count(o.id), 0) as count
      FROM generate_series(CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE, '1 day') as date_series
      LEFT JOIN (
        SELECT o.id, o.created_at
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE u.subdivision_id = $1
      ) o ON o.created_at::date = date_series::date
      GROUP BY date_series
      ORDER BY date_series
    `, [subdivision_id]);

    // 6. Category Distribution
    const categoryDistRes = await pool.query(`
      WITH authorized_products AS (
        SELECT DISTINCT p.id, p.category_id
        FROM dealer_product_map dpm
        JOIN dealer_profiles dp ON dpm.dealer_id = dp.id
        LEFT JOIN products p ON (dpm.product_id = p.id OR dpm.category_id = p.category_id)
        WHERE dp.user_id = $1 AND p.id IS NOT NULL
      )
      SELECT c.name, COUNT(ap.id) as value
      FROM authorized_products ap
      JOIN categories c ON ap.category_id = c.id
      GROUP BY c.name
    `, [userId]);

    res.json({
      stats: {
        mtd_sales: mtdSalesRes.rows[0].mtd_sales,
        total_skus: stockStatsRes.rows[0].total_skus,
        low_stock_skus: stockStatsRes.rows[0].low_stock_skus,
        pending_fulfillments: pendingOrdersRes.rows[0].pending_count
      },
      trends: {
        sales: salesTrendRes.rows,
        categories: categoryDistRes.rows
      }
    });

  } catch (error) {
    console.error('Get dealer insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dealer inventory ledger for the logged-in dealer
const getDealerInventoryLedger = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Dealer Profile ID
    const dealerRes = await pool.query('SELECT id FROM dealer_profiles WHERE user_id = $1', [userId]);
    if (dealerRes.rows.length === 0) return res.status(404).json({ error: "Dealer profile not found" });
    const dealerId = dealerRes.rows[0].id;
    
    const query = `
      WITH LedgerPool AS (
        SELECT 
          il.*, 
          p.name as product_name, 
          p.sku, 
          p.thumbnail_url,
          u.full_name as source_name,
          cbp.type as source_type,
          SUM(il.quantity) OVER (PARTITION BY il.product_id ORDER BY il.created_at ASC, il.id ASC) as running_balance
        FROM inventory_ledger il
        JOIN products p ON il.product_id = p.id
        LEFT JOIN users u ON il.created_by = u.id
        LEFT JOIN core_body_profiles cbp ON u.id = cbp.user_id
        WHERE il.entity_id = $1 AND il.entity_type = 'dealer'
      )
      SELECT * FROM LedgerPool 
      ORDER BY created_at DESC 
      LIMIT 100;
    `;
    
    const result = await pool.query(query, [dealerId]);
    
    res.json({
      success: true,
      ledger: result.rows
    });

  } catch (error) {
    console.error('Get dealer inventory ledger error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dealer network (subdivision associates)
const getDealerNetwork = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Dealer's subdivision and district
    const profileRes = await pool.query(`
      SELECT dp.subdivision_id, sd.district_id
      FROM dealer_profiles dp
      JOIN subdivisions sd ON dp.subdivision_id = sd.id
      WHERE dp.user_id = $1
    `, [userId]);

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer profile not found' });
    }

    const { subdivision_id } = profileRes.rows[0];

    // 2. Fetch all members in the same subdivision
    const networkRes = await pool.query(`
      SELECT 
        u.id, u.full_name as name, u.phone, u.email, u.is_active, u.is_approved,
        r.role_code, r.role_label,
        bp.business_name, bp.type as businessman_type,
        COALESCE(bp.mtd_sales, 0) as mtd_sales,
        COALESCE(bp.ytd_sales, 0) as ytd_sales,
        u.created_at
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
      WHERE u.subdivision_id = $1 AND u.id != $2
      ORDER BY u.full_name ASC
    `, [subdivision_id, userId]);

    // 3. Summarize KPIs
    const kpis = {
      total_members: networkRes.rows.length,
      active_members: networkRes.rows.filter(m => m.is_approved && m.is_active).length,
      mtd_sales: networkRes.rows.reduce((sum, m) => sum + parseFloat(m.mtd_sales || 0), 0)
    };

    res.json({
      success: true,
      network: networkRes.rows,
      kpis
    });

  } catch (error) {
    console.error('Get dealer network error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get core bodies in the dealer's district
const getDistrictCoreBodyDirectory = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get Dealer's district
    const profileRes = await pool.query(`
      SELECT sd.district_id
      FROM dealer_profiles dp
      JOIN subdivisions sd ON dp.subdivision_id = sd.id
      WHERE dp.user_id = $1
    `, [userId]);

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer profile not found' });
    }

    const { district_id } = profileRes.rows[0];

    // 2. Fetch core bodies in the same district
    const directoryRes = await pool.query(`
      SELECT 
        u.id, u.full_name as name, u.phone, u.email, u.profile_photo_url,
        r.role_label,
        d.name as district_name
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      JOIN districts d ON u.district_id = d.id
      WHERE u.district_id = $1 AND u.role_code LIKE 'core_body%'
      ORDER BY u.full_name ASC
    `, [district_id]);

    res.json({
      success: true,
      directory: directoryRes.rows
    });

  } catch (error) {
    console.error('Get district core body directory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealerProfile,
  updateDealerProfile,
  getDealerDashboard,
  assignProductToDealer,
  unassignProductFromDealer,
  getDealerAssignedProducts,
  getMyAuthorizedProducts,
  getDealerInsights,
  getDealerInventoryLedger,
  getDealerNetwork,
  getDistrictCoreBodyDirectory
};