const { pool } = require('../config/db');

// Get core body profile
const getCoreBodyProfile = async (req, res) => {
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
      LEFT JOIN core_body_profiles cb ON u.id = cb.user_id
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = $1 AND u.role_code IN ('core_body_a', 'core_body_b', 'dealer')
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Core Body profile not found' });
    }
    
    const profile = result.rows[0];
    
    // If no core body profile exists, create a default one
    if (!profile.profile_id) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const insertResult = await client.query(
          `INSERT INTO core_body_profiles 
           (user_id, type, investment_amount, installment_count, annual_cap, monthly_cap, 
            ytd_earnings, mtd_earnings, cap_hit_flag, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           RETURNING id`,
          [userId, 
           profile.role_code === 'core_body_a' ? 'A' : profile.role_code === 'core_body_b' ? 'B' : 'Dealer',
           0, 1, 500000, 50000, 0, 0, false, true]
        );
        
        profile.profile_id = insertResult.rows[0].id;
        profile.type = profile.role_code === 'core_body_a' ? 'A' : profile.role_code === 'core_body_b' ? 'B' : 'Dealer';
        profile.investment_amount = 0;
        profile.installment_count = 1;
        profile.annual_cap = 500000;
        profile.monthly_cap = 50000;
        profile.ytd_earnings = 0;
        profile.mtd_earnings = 0;
        profile.cap_hit_flag = false;
        profile.is_active = true;
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    // Get installment details
    const installmentQuery = `
      SELECT installment_no, amount, due_date, paid_date, status, payment_ref
      FROM core_body_installments 
      WHERE core_body_id = $1 
      ORDER BY installment_no
    `;
    
    const installments = await pool.query(installmentQuery, [profile.profile_id]);
    profile.installments = installments.rows;
    
    res.json({ profile });
  } catch (error) {
    console.error('Get core body profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update core body profile
const updateCoreBodyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { investment_amount, installment_count } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update core body profile
      await client.query(
        `UPDATE core_body_profiles 
         SET investment_amount = $1, installment_count = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [investment_amount, installment_count, userId]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Core Body profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update core body profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get core body dashboard stats
const getCoreBodyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profile info
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
    
    // Calculate cap utilization
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
    console.error('Get core body dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pay installment
const payInstallment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { installment_no, payment_ref } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get core body profile
      const profileResult = await client.query(
        'SELECT id FROM core_body_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length === 0) {
        throw new Error('Core Body profile not found');
      }
      
      const coreBodyId = profileResult.rows[0].id;
      
      // Update installment
      await client.query(
        `UPDATE core_body_installments 
         SET paid_date = NOW(), status = 'paid', payment_ref = $1
         WHERE core_body_id = $2 AND installment_no = $3`,
        [payment_ref, coreBodyId, installment_no]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Installment payment recorded successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Pay installment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCoreBodyProfile,
  updateCoreBodyProfile,
  getCoreBodyDashboard,
  payInstallment
};