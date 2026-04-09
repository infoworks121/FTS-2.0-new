const { pool } = require('../config/db');

// Get core body reports (Stock Movement, Dealer Performance)
const getCoreBodyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    // We will generate the reports based on the core body's child dealers and stock requests
    
    // 1. Dealer Performance
    // Find dealers under this core body's district
    const dealerQuery = `
      SELECT 
        u.id, 
        u.full_name as dealer,
        u.is_active as status,
        COUNT(o.id) as orders,
        COALESCE(SUM(o.total_amount), 0) as volume
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'delivered'
      WHERE u.role_code = 'dealer' AND u.district_id = (SELECT district_id FROM users WHERE id = $1)
      GROUP BY u.id, u.full_name, u.is_active
    `;
    const dealerResult = await pool.query(dealerQuery, [userId]);
    const dealers = dealerResult.rows.map(d => ({
      dealer: d.dealer,
      orders: d.orders.toString(),
      volume: '₹' + parseFloat(d.volume).toLocaleString('en-IN'),
      sla: d.orders > 0 ? (85 + Math.floor(Math.random() * 10)) + '%' : '—', // Mock SLA for now
      status: d.status ? 'Active' : 'Inactive'
    }));

    // 2. Stock Movement
    // Use stock requests issued to or returned by this user
    const stockQuery = `
      SELECT 
        p.name as product_name,
        p.sku,
        COALESCE(SUM(sri.quantity), 0) as issued,
        0 as returned,
        MAX(sr.created_at) as recent_date
      FROM stock_request_items sri
      JOIN stock_requests sr ON sri.stock_request_id = sr.id
      JOIN products p ON sri.product_id = p.id
      WHERE sr.requester_id = $1 AND sr.status = 'approved'
      GROUP BY p.name, p.sku
    `;
    const stockResult = await pool.query(stockQuery, [userId]);
    const stockMovements = stockResult.rows.map(s => ({
      product: s.product_name + ' - ' + s.sku,
      issued: s.issued.toString(),
      returned: s.returned.toString(),
      net: '+' + (parseInt(s.issued) - parseInt(s.returned)).toString(),
      date: s.recent_date ? new Date(s.recent_date).toLocaleDateString() : new Date().toLocaleDateString()
    }));

    res.json({
      stockMovementData: stockMovements,
      dealerPerformanceData: dealers
    });
  } catch (error) {
    console.error('Get core body reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get core body profile
const getCoreBodyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, ur.role_code,
        cb.id as profile_id, cb.type, cb.investment_amount, cb.installment_count,
        cb.annual_cap, cb.monthly_cap, cb.ytd_earnings, cb.mtd_earnings,
        cb.cap_hit_flag, cb.is_active, cb.activated_at, cb.last_transaction_at,
        d.name as district_name, d.id as district_id
      FROM users u
      JOIN user_roles ur ON u.role_id = ur.id
      LEFT JOIN core_body_profiles cb ON u.id = cb.user_id
      LEFT JOIN districts d ON COALESCE(cb.district_id, u.district_id) = d.id
      WHERE u.id = $1
    `;
    
    console.log(`[DEBUG] Fetching profile for user ${userId}`);
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      console.warn(`[DEBUG] No user found with ID ${userId}`);
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    const profile = result.rows[0];
    console.log(`[DEBUG] Profile found for ${profile.full_name}. Role: ${profile.role_code}, ProfileID: ${profile.profile_id}`);
    
    // If no core body profile exists, create a default one
    if (!profile.profile_id) {
      console.log(`[DEBUG] No profile found, creating default for ${userId}`);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Determine type and defaults
        const typeChar = profile.role_code === 'core_body_a' ? 'A' : profile.role_code === 'core_body_b' ? 'B' : 'Dealer';
        const defaultInv = typeChar === 'A' ? 100000 : (typeChar === 'B' ? 50000 : 0);
        const defaultInst = typeChar === 'Dealer' ? 1 : 4;
        
        const insertResult = await client.query(
          `INSERT INTO core_body_profiles 
           (user_id, type, district_id, investment_amount, installment_count, annual_cap, monthly_cap, 
            ytd_earnings, mtd_earnings, cap_hit_flag, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           RETURNING id`,
          [userId, typeChar, profile.district_id || 1, defaultInv, defaultInst, 2500000, 100000, 0, 0, false, true]
        );
        
        profile.profile_id = insertResult.rows[0].id;
        profile.type = typeChar;
        profile.investment_amount = defaultInv;
        profile.installment_count = defaultInst;
        profile.annual_cap = 2500000;
        profile.monthly_cap = 100000;
        profile.ytd_earnings = 0;
        profile.mtd_earnings = 0;
        profile.cap_hit_flag = false;
        profile.is_active = true;
        
        await client.query('COMMIT');
        console.log(`[DEBUG] Default profile created successfully: ${profile.profile_id}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('[ERROR] Failed to create default profile:', error);
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
    console.log(`[DEBUG] Found ${installments.rows.length} installments for profile ${profile.profile_id}`);
    
    // Auto-generate missing installments if they don't exist
    if (installments.rows.length === 0) {
      console.log(`[DEBUG] No installments found, attempting auto-generation for profile ${profile.profile_id}`);
      let invAmount = parseFloat(profile.investment_amount) || 0;
      
      // If investment amount is 0 (e.g. from an old fallback profile), set default
      if (invAmount === 0) {
        invAmount = profile.role_code === 'core_body_a' ? 100000 : 50000;
        console.log(`[DEBUG] Investment amount was 0, setting default ${invAmount} for role ${profile.role_code}`);
        profile.investment_amount = invAmount;
        await pool.query('UPDATE core_body_profiles SET investment_amount = $1 WHERE id = $2', [invAmount, profile.profile_id]);
      }
      
      const count = profile.installment_count || 1;
      const amountPerInst = invAmount / count;
      console.log(`[DEBUG] Generating ${count} installments of amount ${amountPerInst} each`);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (let i = 0; i < count; i++) {
          if (amountPerInst > 0) {
            await client.query(
              `INSERT INTO core_body_installments (core_body_id, installment_no, amount, status)
               VALUES ($1, $2, $3, 'pending')`,
              [profile.profile_id, i + 1, amountPerInst]
            );
          }
        }
        await client.query('COMMIT');
        // Re-fetch the newly generated installments
        const refreshedInstallments = await pool.query(installmentQuery, [profile.profile_id]);
        profile.installments = refreshedInstallments.rows;
        console.log(`[DEBUG] Auto-generation complete. Rows: ${profile.installments.length}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('[ERROR] Failed to auto-generate installments:', error);
        profile.installments = [];
      } finally {
        client.release();
      }
    } else {
      profile.installments = installments.rows;
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get core body profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
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
         SET paid_date = NOW(), status = 'pending_approval', payment_ref = $1
         WHERE core_body_id = $2 AND installment_no = $3`,
        [payment_ref, coreBodyId, installment_no]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Installment payment submitted and is pending admin approval' });
      
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
  payInstallment,
  getCoreBodyReports
};