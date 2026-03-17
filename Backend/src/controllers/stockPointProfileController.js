const { pool } = require('../config/db');

const getStockPointProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role_code,
        sp.id as profile_id, sp.location, sp.capacity, sp.current_stock,
        sp.manager_name, sp.contact_number, sp.operational_hours,
        sp.is_active, sp.activated_at, sp.last_stock_update,
        d.name as district_name, d.id as district_id
      FROM users u
      JOIN stock_point_profiles sp ON u.id = sp.user_id
      JOIN districts d ON sp.district_id = d.id
      WHERE u.id = $1 AND u.role_code = 'stock_point'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock Point profile not found' });
    }
    
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get stock point profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStockPointProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, capacity, manager_name, contact_number, operational_hours } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        `UPDATE stock_point_profiles 
         SET location = $1, capacity = $2, manager_name = $3, 
             contact_number = $4, operational_hours = $5, updated_at = NOW() 
         WHERE user_id = $6`,
        [location, capacity, manager_name, contact_number, operational_hours, userId]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Stock Point profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update stock point profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStockPointDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profileQuery = `
      SELECT sp.*, d.name as district_name
      FROM stock_point_profiles sp
      JOIN districts d ON sp.district_id = d.id
      WHERE sp.user_id = $1
    `;
    
    const profileResult = await pool.query(profileQuery, [userId]);
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const profile = profileResult.rows[0];
    
    const capacityUtilization = profile.capacity ? 
      ((profile.current_stock / profile.capacity) * 100).toFixed(1) : 0;
    
    const stats = {
      profile,
      stock: {
        current: profile.current_stock,
        capacity: profile.capacity,
        utilization: capacityUtilization,
        available_space: profile.capacity - profile.current_stock
      },
      operations: {
        location: profile.location,
        manager: profile.manager_name,
        contact: profile.contact_number,
        hours: profile.operational_hours,
        is_active: profile.is_active
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stock point dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStockPointProfile,
  updateStockPointProfile,
  getStockPointDashboard
};