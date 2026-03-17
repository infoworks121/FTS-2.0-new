const { pool } = require('../config/db');

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.created_at,
        ap.permissions, ap.created_at as profile_created_at
      FROM users u
      LEFT JOIN admin_profiles ap ON u.id = ap.user_id
      WHERE u.id = $1 AND u.role_code = 'admin'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }
    
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, permissions } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update user basic info
      await client.query(
        'UPDATE users SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3',
        [full_name, phone, userId]
      );
      
      // Update or create admin profile
      const profileResult = await client.query(
        'SELECT id FROM admin_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length > 0) {
        // Update existing profile
        await client.query(
          'UPDATE admin_profiles SET permissions = $1, updated_at = NOW() WHERE user_id = $2',
          [JSON.stringify(permissions), userId]
        );
      } else {
        // Create new profile
        await client.query(
          'INSERT INTO admin_profiles (user_id, permissions) VALUES ($1, $2)',
          [userId, JSON.stringify(permissions)]
        );
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Admin profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = {};
    
    // Total users by role
    const userStats = await pool.query(`
      SELECT role_code, COUNT(*) as count 
      FROM users 
      WHERE is_approved = true 
      GROUP BY role_code
    `);
    
    stats.users = userStats.rows.reduce((acc, row) => {
      acc[row.role_code] = parseInt(row.count);
      return acc;
    }, {});
    
    // Pending approvals
    const pendingApprovals = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = false'
    );
    stats.pendingApprovals = parseInt(pendingApprovals.rows[0].count);
    
    // Active districts
    const activeDistricts = await pool.query(
      'SELECT COUNT(DISTINCT district_id) as count FROM core_body_profiles WHERE is_active = true'
    );
    stats.activeDistricts = parseInt(activeDistricts.rows[0].count);
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats
};