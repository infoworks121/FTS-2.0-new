const { pool } = require('../config/db');

// Get businessman profile
const getBusinessmanProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.pan_number, u.profile_photo_url, r.role_code,
        bp.id as profile_id, bp.type, bp.mode, bp.business_name, bp.business_address,
        bp.gst_number, bp.bank_account, bp.ifsc_code,
        bp.advance_amount, bp.assigned_core_body_id,
        bp.monthly_target, bp.ytd_sales, bp.mtd_sales, bp.commission_earned,
        bp.is_active, bp.activated_at, bp.last_order_at, bp.last_transaction_at,
        bp.created_at, bp.updated_at,
        d.name as district_name, d.id as district_id
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      JOIN businessman_profiles bp ON u.id = bp.user_id
      LEFT JOIN districts d ON bp.district_id = d.id
      WHERE u.id = $1 AND r.role_code = 'businessman'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Businessman profile not found' });
    }
    
    const profile = result.rows[0];
    
    // Fetch installments
    const installmentQuery = `
      SELECT installment_no, amount, due_date, paid_date, status, payment_ref
      FROM businessman_investments
      WHERE businessman_id = $1
      ORDER BY installment_no
    `;
    
    let installments = await pool.query(installmentQuery, [profile.profile_id]);
    
    // Auto-generate installments if Retailer A and none exist
    if (profile.type === 'retailer_a' && installments.rows.length === 0) {
      console.log(`[DEBUG] Auto-generating installments for Retailer A: ${profile.profile_id}`);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const totalAdvance = 50000; // Default advance for Retailer A
        const count = 4;
        const amountPerInst = totalAdvance / count;
        
        for (let i = 1; i <= count; i++) {
          await client.query(
            `INSERT INTO businessman_investments (businessman_id, installment_no, amount, status)
             VALUES ($1, $2, $3, 'pending')`,
            [profile.profile_id, i, amountPerInst]
          );
        }
        
        await client.query(
          `UPDATE businessman_profiles SET advance_amount = $1 WHERE id = $2`,
          [totalAdvance, profile.profile_id]
        );
        
        await client.query('COMMIT');
        
        // Refresh installments
        const refreshed = await pool.query(installmentQuery, [profile.profile_id]);
        profile.installments = refreshed.rows;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error auto-generating businessman installments:', error);
        profile.installments = [];
      } finally {
        client.release();
      }
    } else {
      profile.installments = installments.rows;
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get businessman profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Pay businessman investment installment
const payBusinessmanInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { installment_no, payment_ref } = req.body;
    
    if (!installment_no || !payment_ref) {
      return res.status(400).json({ message: 'Installment number and payment reference are required' });
    }
    
    // Find profile
    const profileRes = await pool.query('SELECT id FROM businessman_profiles WHERE user_id = $1', [userId]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ message: 'Businessman profile not found' });
    }
    
    const profileId = profileRes.rows[0].id;
    
    // Update installment status
    const result = await pool.query(
      `UPDATE businessman_investments 
       SET status = 'pending_approval', payment_ref = $1, paid_date = NOW()
       WHERE businessman_id = $2 AND installment_no = $3 AND status = 'pending'
       RETURNING *`,
      [payment_ref, profileId, installment_no]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Installment not found or already paid' });
    }
    
    res.json({ message: 'Payment submitted for approval', installment: result.rows[0] });
  } catch (error) {
    console.error('Pay businessman investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update businessman profile
const updateBusinessmanProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { business_name, business_address, gst_number, bank_account, ifsc_code,
            monthly_target, advance_amount, assigned_core_body_id } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        `UPDATE businessman_profiles 
         SET business_name = COALESCE($1, business_name),
             business_address = COALESCE($2, business_address),
             gst_number = COALESCE($3, gst_number),
             bank_account = COALESCE($4, bank_account),
             ifsc_code = COALESCE($5, ifsc_code),
             monthly_target = COALESCE($6, monthly_target),
             advance_amount = COALESCE($7, advance_amount),
             assigned_core_body_id = COALESCE($8, assigned_core_body_id),
             updated_at = NOW()
         WHERE user_id = $9`,
        [business_name, business_address, gst_number, bank_account, ifsc_code,
         monthly_target, advance_amount, assigned_core_body_id, userId]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Businessman profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update businessman profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get businessman dashboard stats
const getBusinessmanDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get profile info
    const profileQuery = `
      SELECT bp.*, d.name as district_name
      FROM businessman_profiles bp
      LEFT JOIN districts d ON bp.district_id = d.id
      WHERE bp.user_id = $1
    `;
    
    const profileResult = await pool.query(profileQuery, [userId]);
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const profile = profileResult.rows[0];
    
    // Calculate target achievement
    const targetAchievement = profile.monthly_target ? 
      ((profile.mtd_sales / profile.monthly_target) * 100).toFixed(1) : 0;
    
    const stats = {
      profile,
      sales: {
        ytd: profile.ytd_sales,
        mtd: profile.mtd_sales,
        monthly_target: profile.monthly_target,
        target_achievement: targetAchievement,
        commission_earned: profile.commission_earned
      },
      business: {
        name: profile.business_name,
        type: profile.type,
        mode: profile.mode,
        advance_amount: profile.advance_amount,
        assigned_core_body_id: profile.assigned_core_body_id,
        last_transaction_at: profile.last_transaction_at,
        gst_number: profile.gst_number,
        is_active: profile.is_active
      }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get businessman dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBusinessmanProfile,
  updateBusinessmanProfile,
  getBusinessmanDashboard,
  payBusinessmanInvestment
};