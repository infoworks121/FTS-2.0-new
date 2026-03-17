const { pool } = require('../config/db');

// Get dealer profile
const getDealerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role_code,
        cb.id as profile_id, cb.type, cb.investment_amount, cb.installment_count,
        cb.annual_cap, cb.monthly_cap, cb.ytd_earnings, cb.mtd_earnings,
        cb.cap_hit_flag, cb.is_active, cb.activated_at, cb.last_transaction_at,
        d.name as district_name, d.id as district_id
      FROM users u
      JOIN core_body_profiles cb ON u.id = cb.user_id
      JOIN districts d ON cb.district_id = d.id
      WHERE u.id = $1 AND u.role_code = 'dealer'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dealer profile not found' });
    }
    
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get dealer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update dealer profile
const updateDealerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { investment_amount, installment_count } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        `UPDATE core_body_profiles 
         SET investment_amount = $1, installment_count = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [investment_amount, installment_count, userId]
      );
      
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
      SELECT cb.*, d.name as district_name
      FROM core_body_profiles cb
      JOIN districts d ON cb.district_id = d.id
      WHERE cb.user_id = $1
    `;
    
    const profileResult = await pool.query(profileQuery, [userId]);
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const profile = profileResult.rows[0];
    
    const annualUtilization = profile.annual_cap ? 
      ((profile.ytd_earnings / profile.annual_cap) * 100).toFixed(1) : 0;
    const monthlyUtilization = profile.monthly_cap ? 
      ((profile.mtd_earnings / profile.monthly_cap) * 100).toFixed(1) : 0;
    
    const stats = {
      profile,
      earnings: {
        ytd: profile.ytd_earnings,
        mtd: profile.mtd_earnings,
        annual_cap: profile.annual_cap,
        monthly_cap: profile.monthly_cap,
        annual_utilization: annualUtilization,
        monthly_utilization: monthlyUtilization,
        cap_hit: profile.cap_hit_flag
      },
      investment: {
        total_amount: profile.investment_amount,
        installments: profile.installment_count,
        per_installment: profile.investment_amount / profile.installment_count
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dealer dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealerProfile,
  updateDealerProfile,
  getDealerDashboard
};