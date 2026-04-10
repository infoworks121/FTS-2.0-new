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

// Get products assigned to a specific dealer
const getDealerAssignedProducts = async (req, res) => {
  try {
    const { id } = req.params; // Profile ID
    
    const query = `
      SELECT p.id, p.name, p.sku, dpm.assigned_at
      FROM dealer_product_map dpm
      JOIN products p ON dpm.product_id = p.id
      WHERE dpm.dealer_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get dealer assigned products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealerProfile,
  updateDealerProfile,
  getDealerDashboard,
  assignProductToDealer,
  unassignProductFromDealer,
  getDealerAssignedProducts
};