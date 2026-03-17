const { pool } = require('../config/db');

// Get unified profile for any role
const getUnifiedProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role_code;
    
    let profileQuery = '';
    let profileParams = [userId];
    
    // Base user info
    const baseQuery = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role_code, u.is_active, 
             u.created_at, u.updated_at, d.name as district_name, d.id as district_id
      FROM users u
      LEFT JOIN districts d ON u.district_id = d.id
      WHERE u.id = $1
    `;
    
    const userResult = await pool.query(baseQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profile = userResult.rows[0];
    
    // Role-specific profile data
    switch (userRole) {
      case 'core_body_a':
      case 'core_body_b':
      case 'dealer':
        const coreBodyQuery = `
          SELECT cb.*, cbi.installment_no, cbi.amount as installment_amount, 
                 cbi.due_date, cbi.paid_date, cbi.status as installment_status, cbi.payment_ref
          FROM core_body_profiles cb
          LEFT JOIN core_body_installments cbi ON cb.id = cbi.core_body_id
          WHERE cb.user_id = $1
          ORDER BY cbi.installment_no
        `;
        const coreBodyResult = await pool.query(coreBodyQuery, [userId]);
        if (coreBodyResult.rows.length > 0) {
          const coreBodyData = coreBodyResult.rows[0];
          profile = { ...profile, ...coreBodyData };
          
          // Group installments
          const installments = coreBodyResult.rows
            .filter(row => row.installment_no)
            .map(row => ({
              installment_no: row.installment_no,
              amount: row.installment_amount,
              due_date: row.due_date,
              paid_date: row.paid_date,
              status: row.installment_status,
              payment_ref: row.payment_ref
            }));
          profile.installments = installments;
        }
        break;
        
      case 'businessman':
        const businessmanQuery = `
          SELECT bp.*, bt.name as business_type_name
          FROM businessman_profiles bp
          LEFT JOIN business_types bt ON bp.business_type_id = bt.id
          WHERE bp.user_id = $1
        `;
        const businessmanResult = await pool.query(businessmanQuery, [userId]);
        if (businessmanResult.rows.length > 0) {
          profile = { ...profile, ...businessmanResult.rows[0] };
        }
        break;
        
      case 'stock_point':
        const stockPointQuery = `
          SELECT sp.*
          FROM stock_point_profiles sp
          WHERE sp.user_id = $1
        `;
        const stockPointResult = await pool.query(stockPointQuery, [userId]);
        if (stockPointResult.rows.length > 0) {
          profile = { ...profile, ...stockPointResult.rows[0] };
        }
        break;
        
      case 'retailer':
        const retailerQuery = `
          SELECT rp.*
          FROM retailer_profiles rp
          WHERE rp.user_id = $1
        `;
        const retailerResult = await pool.query(retailerQuery, [userId]);
        if (retailerResult.rows.length > 0) {
          profile = { ...profile, ...retailerResult.rows[0] };
        }
        break;
        
      case 'admin':
        // Admin doesn't have additional profile table
        break;
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get unified profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update unified profile
const updateUnifiedProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role_code;
    const updateData = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update base user info
      const { full_name, phone } = updateData;
      if (full_name || phone) {
        await client.query(
          `UPDATE users SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3`,
          [full_name, phone, userId]
        );
      }
      
      // Role-specific updates
      switch (userRole) {
        case 'core_body_a':
        case 'core_body_b':
        case 'dealer':
          const { investment_amount, installment_count } = updateData;
          if (investment_amount !== undefined || installment_count !== undefined) {
            await client.query(
              `UPDATE core_body_profiles 
               SET investment_amount = COALESCE($1, investment_amount),
                   installment_count = COALESCE($2, installment_count),
                   updated_at = NOW()
               WHERE user_id = $3`,
              [investment_amount, installment_count, userId]
            );
          }
          break;
          
        case 'businessman':
          const { business_name, business_address, gst_number, pan_number, 
                  bank_account, ifsc_code, monthly_target } = updateData;
          await client.query(
            `UPDATE businessman_profiles 
             SET business_name = COALESCE($1, business_name),
                 business_address = COALESCE($2, business_address),
                 gst_number = COALESCE($3, gst_number),
                 pan_number = COALESCE($4, pan_number),
                 bank_account = COALESCE($5, bank_account),
                 ifsc_code = COALESCE($6, ifsc_code),
                 monthly_target = COALESCE($7, monthly_target),
                 updated_at = NOW()
             WHERE user_id = $8`,
            [business_name, business_address, gst_number, pan_number, 
             bank_account, ifsc_code, monthly_target, userId]
          );
          break;
          
        case 'stock_point':
          const { warehouse_address, storage_capacity } = updateData;
          await client.query(
            `UPDATE stock_point_profiles 
             SET warehouse_address = COALESCE($1, warehouse_address),
                 storage_capacity = COALESCE($2, storage_capacity),
                 updated_at = NOW()
             WHERE user_id = $3`,
            [warehouse_address, storage_capacity, userId]
          );
          break;
          
        case 'retailer':
          const { shop_name, shop_address, shop_type, gst_number: retailer_gst, 
                  pan_number: retailer_pan, bank_account: retailer_bank, 
                  ifsc_code: retailer_ifsc } = updateData;
          await client.query(
            `UPDATE retailer_profiles 
             SET shop_name = COALESCE($1, shop_name),
                 shop_address = COALESCE($2, shop_address),
                 shop_type = COALESCE($3, shop_type),
                 gst_number = COALESCE($4, gst_number),
                 pan_number = COALESCE($5, pan_number),
                 bank_account = COALESCE($6, bank_account),
                 ifsc_code = COALESCE($7, ifsc_code),
                 updated_at = NOW()
             WHERE user_id = $8`,
            [shop_name, shop_address, shop_type, retailer_gst, 
             retailer_pan, retailer_bank, retailer_ifsc, userId]
          );
          break;
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Profile updated successfully' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update unified profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats for any role
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role_code;
    
    let stats = {};
    
    switch (userRole) {
      case 'core_body_a':
      case 'core_body_b':
      case 'dealer':
        const coreBodyStatsQuery = `
          SELECT cb.*, 
                 COALESCE(cb.ytd_earnings, 0) as ytd_earnings,
                 COALESCE(cb.mtd_earnings, 0) as mtd_earnings,
                 COALESCE(cb.annual_cap, 0) as annual_cap,
                 COALESCE(cb.monthly_cap, 0) as monthly_cap
          FROM core_body_profiles cb
          WHERE cb.user_id = $1
        `;
        const coreBodyStats = await pool.query(coreBodyStatsQuery, [userId]);
        if (coreBodyStats.rows.length > 0) {
          const profile = coreBodyStats.rows[0];
          const annualUtilization = profile.annual_cap ? 
            ((profile.ytd_earnings / profile.annual_cap) * 100).toFixed(1) : 0;
          const monthlyUtilization = profile.monthly_cap ? 
            ((profile.mtd_earnings / profile.monthly_cap) * 100).toFixed(1) : 0;
          
          stats = {
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
        }
        break;
        
      case 'businessman':
        const businessmanStatsQuery = `
          SELECT bp.*,
                 COALESCE(bp.ytd_sales, 0) as ytd_sales,
                 COALESCE(bp.mtd_sales, 0) as mtd_sales,
                 COALESCE(bp.commission_earned, 0) as commission_earned,
                 COALESCE(bp.monthly_target, 0) as monthly_target
          FROM businessman_profiles bp
          WHERE bp.user_id = $1
        `;
        const businessmanStats = await pool.query(businessmanStatsQuery, [userId]);
        if (businessmanStats.rows.length > 0) {
          const profile = businessmanStats.rows[0];
          const targetAchievement = profile.monthly_target ? 
            ((profile.mtd_sales / profile.monthly_target) * 100).toFixed(1) : 0;
          
          stats = {
            sales: {
              ytd: profile.ytd_sales,
              mtd: profile.mtd_sales,
              commission_earned: profile.commission_earned,
              target_achievement: targetAchievement
            }
          };
        }
        break;
        
      case 'retailer':
        const retailerStatsQuery = `
          SELECT rp.*,
                 COALESCE(rp.ytd_sales, 0) as ytd_sales,
                 COALESCE(rp.mtd_sales, 0) as mtd_sales,
                 COALESCE(rp.commission_earned, 0) as commission_earned,
                 COALESCE(rp.monthly_target, 0) as monthly_target
          FROM retailer_profiles rp
          WHERE rp.user_id = $1
        `;
        const retailerStats = await pool.query(retailerStatsQuery, [userId]);
        if (retailerStats.rows.length > 0) {
          const profile = retailerStats.rows[0];
          const targetAchievement = profile.monthly_target ? 
            ((profile.mtd_sales / profile.monthly_target) * 100).toFixed(1) : 0;
          
          stats = {
            sales: {
              ytd: profile.ytd_sales,
              mtd: profile.mtd_sales,
              commission_earned: profile.commission_earned,
              target_achievement: targetAchievement
            }
          };
        }
        break;
        
      case 'admin':
        const adminStatsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM users WHERE role_code = 'businessman') as businessman_count,
            (SELECT COUNT(*) FROM users WHERE role_code IN ('core_body_a', 'core_body_b')) as corebody_count,
            (SELECT COUNT(*) FROM users WHERE role_code = 'dealer') as dealer_count,
            (SELECT COUNT(*) FROM users WHERE role_code = 'stock_point') as stockpoint_count,
            (SELECT COUNT(*) FROM users WHERE approval_status = 'pending') as pending_approvals,
            (SELECT COUNT(DISTINCT district_id) FROM users WHERE district_id IS NOT NULL) as active_districts
        `;
        const adminStats = await pool.query(adminStatsQuery);
        if (adminStats.rows.length > 0) {
          const data = adminStats.rows[0];
          stats = {
            users: {
              businessman: parseInt(data.businessman_count),
              corebody: parseInt(data.corebody_count),
              dealer: parseInt(data.dealer_count),
              stockpoint: parseInt(data.stockpoint_count)
            },
            pendingApprovals: parseInt(data.pending_approvals),
            activeDistricts: parseInt(data.active_districts)
          };
        }
        break;
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUnifiedProfile,
  updateUnifiedProfile,
  getDashboardStats
};