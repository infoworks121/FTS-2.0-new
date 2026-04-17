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
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
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

// Get all downstream users (Dealers & Businessmen) in the Core Body's district
const getDistrictUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get Core Body's district
    const userRes = await pool.query('SELECT district_id FROM users WHERE id = $1', [userId]);
    const districtId = userRes.rows[0]?.district_id;
    
    if (!districtId) {
      return res.status(400).json({ message: 'Core Body district not found' });
    }

    // 2. Fetch Dealers in that district
    // Note: Based on dealerProfileController, they also use core_body_profiles or just 'dealer' role
    const dealerQuery = `
      SELECT 
        u.id as "dealerId", 
        u.full_name as "dealerName",
        u.is_active as "status",
        u.created_at as "joinedDate",
        COUNT(o.id) as "totalOrdersHandled",
        COALESCE(SUM(o.total_amount), 0) as "currentMonthVolume"
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      WHERE r.role_code = 'dealer' AND u.district_id = $1
      GROUP BY u.id, u.full_name, u.is_active, u.created_at
    `;
    const dealerResult = await pool.query(dealerQuery, [districtId]);

    // 3. Fetch Businessmen in that district
    const bsmQuery = `
      SELECT 
        u.id as "businessmanId",
        u.full_name as "name",
        bp.type as "modeType",
        u.is_active as "status",
        COUNT(o.id) as "totalOrders",
        COALESCE(SUM(o.total_amount), 0) as "walletBalance"
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      JOIN businessman_profiles bp ON u.id = bp.user_id
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      WHERE r.role_code = 'businessman' AND u.district_id = $1
      GROUP BY u.id, u.full_name, bp.type, u.is_active
    `;
    const bsmResult = await pool.query(bsmQuery, [districtId]);

    // Format data for frontend (adding prefixes and default values for missing fields)
    const dealers = dealerResult.rows.map(d => ({
      ...d,
      dealerId: `DLR-${d.dealerId.toString().padStart(4, '0')}`,
      joinedDate: new Date(d.joinedDate).toISOString().split('T')[0],
      currentStatus: d.status ? 'Active' : 'Inactive',
      categorySpecialization: 'General Provisions',
      lastActivityDate: new Date().toISOString().split('T')[0]
    }));

    const businessmen = bsmResult.rows.map(b => ({
      ...b,
      businessmanId: `BSM-${b.businessmanId.toString().padStart(4, '0')}`,
      status: b.status ? 'Active' : 'Inactive',
      associatedDealer: 'Direct District',
      lastOrderDate: new Date().toISOString().split('T')[0]
    }));

    res.json({
      dealers,
      businessmen
    });
  } catch (error) {
    console.error('Get district users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all directory users (Core Bodies, Dealers, Businessmen) across all districts
const getDirectoryUsers = async (req, res) => {
  try {
    // 1. Fetch Core Bodies
    const cbQuery = `
      SELECT 
        u.id, u.full_name as "name", u.email, u.phone,
        cb.type, cb.is_active,
        cb.investment_amount, cb.ytd_earnings, cb.annual_cap,
        cb.mtd_earnings, cb.monthly_cap,
        u.created_at,
        u.is_approved,
        d.name as "district"
      FROM users u
      JOIN core_body_profiles cb ON u.id = cb.user_id
      LEFT JOIN districts d ON cb.district_id = d.id
      ORDER BY u.created_at DESC
    `;
    const cbResult = await pool.query(cbQuery);
    const coreBodies = cbResult.rows.map(cb => ({
      ...cb,
      coreBodyId: `CB-${cb.id.toString().padStart(4, '0')}`,
      status: cb.is_active ? 'Active' : 'Inactive',
      joinedDate: new Date(cb.created_at).toISOString().split('T')[0]
    }));

    // 2. Fetch Dealers
    const dealerQuery = `
      SELECT 
        u.id as "dealerId", 
        u.full_name as "dealerName",
        u.is_active as "status",
        u.created_at as "joinedDate",
        COUNT(o.id) as "totalOrdersHandled",
        COALESCE(SUM(o.total_amount), 0) as "currentMonthVolume",
        d.name as "district"
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      LEFT JOIN districts d ON u.district_id = d.id
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      WHERE r.role_code = 'dealer'
      GROUP BY u.id, u.full_name, u.is_active, u.created_at, d.name
    `;
    const dealerResult = await pool.query(dealerQuery);
    const dealers = dealerResult.rows.map(d => ({
      ...d,
      dealerId: `DLR-${d.dealerId.toString().padStart(4, '0')}`,
      joinedDate: new Date(d.joinedDate).toISOString().split('T')[0],
      currentStatus: d.status ? 'Active' : 'Inactive',
      categorySpecialization: 'General Provisions',
      lastActivityDate: new Date().toISOString().split('T')[0]
    }));

    // 3. Fetch Businessmen
    const bsmQuery = `
      SELECT 
        u.id as "businessmanId",
        u.full_name as "name",
        bp.type as "modeType",
        u.is_active as "status",
        COUNT(o.id) as "totalOrders",
        COALESCE(SUM(o.total_amount), 0) as "walletBalance",
        d.name as "district"
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      JOIN businessman_profiles bp ON u.id = bp.user_id
      LEFT JOIN districts d ON bp.district_id = d.id
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      WHERE r.role_code = 'businessman'
      GROUP BY u.id, u.full_name, bp.type, u.is_active, d.name
    `;
    const bsmResult = await pool.query(bsmQuery);
    const businessmen = bsmResult.rows.map(b => ({
      ...b,
      businessmanId: `BSM-${b.businessmanId.toString().padStart(4, '0')}`,
      status: b.status ? 'Active' : 'Inactive',
      associatedDealer: 'Direct District',
      lastOrderDate: new Date().toISOString().split('T')[0]
    }));

    res.json({
      coreBodies,
      dealers,
      businessmen
    });
  } catch (error) {
    console.error('Get directory users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDirectoryUserDetail = async (req, res) => {
  try {
    let { id } = req.params;

    // Remove entity prefixes if present (e.g., BSM-, DLR-, CB-)
    if (typeof id === 'string') {
      if (id.startsWith('BSM-')) id = id.replace('BSM-', '');
      if (id.startsWith('DLR-')) id = id.replace('DLR-', '');
      if (id.startsWith('CB-')) id = id.replace('CB-', '');
    }

    // 1. Fetch user and role
    const userResult = await pool.query(`
      SELECT u.id, u.full_name as name, u.email, u.phone, r.role_code
      FROM users u
      JOIN user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // 2. Based on role, fetch detailed profile
    if (user.role_code === 'businessman') {
      const profileResult = await pool.query(`
        SELECT 
          u.id, u.full_name as name, u.email, u.phone, u.profile_photo_url, u.is_approved, u.is_sph,
          bp.id as profile_id, bp.type, bp.mode, bp.is_active,
          bp.business_name, bp.business_address, bp.gst_number, bp.pan_number,
          bp.bank_account, bp.ifsc_code,
          bp.advance_amount, bp.assigned_core_body_id,
          bp.monthly_target, bp.ytd_sales, bp.mtd_sales, bp.commission_earned,
          bp.created_at, bp.updated_at,
          d.name as district, d.id as district_id
        FROM users u
        JOIN businessman_profiles bp ON u.id = bp.user_id
        LEFT JOIN districts d ON bp.district_id = d.id
        WHERE u.id = $1
      `, [id]);

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ message: 'Businessman profile not found' });
      }

      const profile = profileResult.rows[0];

      if (profile.mode === 'stock_point' || profile.type === 'stock_point') {
        const stockPointResult = await pool.query(`
          SELECT storage_capacity, min_inventory_value, warehouse_address, sla_score
          FROM stock_point_profiles
          WHERE businessman_id = $1
        `, [profile.profile_id]);

        if (stockPointResult.rows.length > 0) {
          const sp = stockPointResult.rows[0];
          profile.storage_capacity = sp.storage_capacity;
          profile.min_inventory_value = sp.min_inventory_value;
          profile.warehouse_address = sp.warehouse_address;
          profile.sla_score = sp.sla_score;
        }
      }
      return res.json({ profile });

    } else if (user.role_code === 'dealer') {
      const dealerResult = await pool.query(`
        SELECT 
          u.id, u.full_name as name, u.email, u.phone, u.is_active,
          u.created_at, d.name as district
        FROM users u
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.id = $1
      `, [id]);
      
      const profile = dealerResult.rows[0];
      return res.json({ profile });

    } else if (user.role_code === 'core_body_a' || user.role_code === 'core_body_b' || user.role_code === 'core_body') {
      const profileResult = await pool.query(`
        SELECT 
          u.id, u.full_name as name, u.email, u.phone, u.is_active, u.is_approved,
          cp.type, cp.investment_amount, cp.ytd_earnings, cp.annual_cap,
          cp.created_at, d.name as district,
          (SELECT COUNT(*) FROM businessman_profiles WHERE assigned_core_body_id = cp.id) as businessman_count,
          (SELECT COUNT(*) FROM core_body_installments WHERE core_body_id = cp.id) as installment_count
        FROM users u
        JOIN core_body_profiles cp ON u.id = cp.user_id
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.id = $1
      `, [id]);

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ message: 'Core Body profile not found' });
      }

      return res.json({ profile: profileResult.rows[0] });
    }

    res.json({ profile: user });
  } catch (error) {
    console.error('Get directory user detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// District-wise Performance Snapshot (all districts: core bodies + dealers stats + individual users)
const getDistrictPerformanceSnapshot = async (req, res) => {
  try {
    // 1. Core Body A & B aggregates per district
    const cbQuery = `
      SELECT
        d.id AS district_id, d.name AS district_name, cb.type AS cb_type,
        COUNT(cb.id) AS total_members,
        COUNT(cb.id) FILTER (WHERE cb.is_active = true) AS active_members,
        COALESCE(SUM(cb.ytd_earnings), 0) AS total_ytd_earnings,
        COALESCE(SUM(cb.mtd_earnings), 0) AS total_mtd_earnings,
        COALESCE(SUM(cb.annual_cap), 0) AS total_annual_cap,
        COALESCE(SUM(cb.monthly_cap), 0) AS total_monthly_cap,
        COUNT(cb.id) FILTER (WHERE cb.cap_hit_flag = true) AS cap_hit_count
      FROM districts d
      JOIN core_body_profiles cb ON cb.district_id = d.id
      WHERE cb.type IN ('A', 'B')
      GROUP BY d.id, d.name, cb.type
      ORDER BY d.name, cb.type
    `;
    const cbResult = await pool.query(cbQuery);

    // 2. Dealer aggregates per district
    const dealerQuery = `
      SELECT
        d.id AS district_id, d.name AS district_name,
        COUNT(DISTINCT u.id) AS total_dealers,
        COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = true) AS active_dealers,
        COALESCE(SUM(o.total_amount), 0) AS total_order_volume,
        COUNT(o.id) AS total_orders
      FROM districts d
      JOIN users u ON u.district_id = d.id
      JOIN user_roles r ON u.role_id = r.id AND r.role_code = 'dealer'
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;
    const dealerResult = await pool.query(dealerQuery);

    // 3. Individual Core Body users (A and B)
    const individualCBQuery = `
      SELECT
        u.id, u.full_name AS name, u.email, u.is_active,
        cb.type, cb.ytd_earnings, cb.mtd_earnings,
        cb.annual_cap, cb.monthly_cap, cb.cap_hit_flag,
        cb.investment_amount, cb.activated_at,
        d.id AS district_id, d.name AS district_name
      FROM users u
      JOIN core_body_profiles cb ON cb.user_id = u.id
      JOIN districts d ON cb.district_id = d.id
      WHERE cb.type IN ('A', 'B')
      ORDER BY d.name, cb.type, u.full_name
    `;
    const individualCBResult = await pool.query(individualCBQuery);

    // 4. Individual Dealer users
    const individualDealerQuery = `
      SELECT
        u.id, u.full_name AS name, u.email, u.is_active,
        u.created_at,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS order_volume,
        d.id AS district_id, d.name AS district_name
      FROM users u
      JOIN user_roles r ON u.role_id = r.id AND r.role_code = 'dealer'
      LEFT JOIN districts d ON u.district_id = d.id
      LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'delivered'
      GROUP BY u.id, u.full_name, u.email, u.is_active, u.created_at, d.id, d.name
      ORDER BY d.name, u.full_name
    `;
    const individualDealerResult = await pool.query(individualDealerQuery);

    // 5. Build district aggregates map
    const districtMap = {};

    for (const row of cbResult.rows) {
      const id = row.district_id;
      if (!districtMap[id]) {
        districtMap[id] = {
          district_id: id, district_name: row.district_name,
          core_body_a: { total: 0, active: 0, ytd_earnings: 0, annual_cap: 0, cap_hit: 0 },
          core_body_b: { total: 0, active: 0, mtd_earnings: 0, monthly_cap: 0, cap_hit: 0 },
          dealers: { total: 0, active: 0, order_volume: 0, order_count: 0 },
        };
      }
      if (row.cb_type === 'A') {
        districtMap[id].core_body_a = {
          total: parseInt(row.total_members), active: parseInt(row.active_members),
          ytd_earnings: parseFloat(row.total_ytd_earnings), annual_cap: parseFloat(row.total_annual_cap),
          cap_hit: parseInt(row.cap_hit_count),
        };
      } else if (row.cb_type === 'B') {
        districtMap[id].core_body_b = {
          total: parseInt(row.total_members), active: parseInt(row.active_members),
          mtd_earnings: parseFloat(row.total_mtd_earnings), monthly_cap: parseFloat(row.total_monthly_cap),
          cap_hit: parseInt(row.cap_hit_count),
        };
      }
    }

    for (const row of dealerResult.rows) {
      const id = row.district_id;
      if (!districtMap[id]) {
        districtMap[id] = {
          district_id: id, district_name: row.district_name,
          core_body_a: { total: 0, active: 0, ytd_earnings: 0, annual_cap: 0, cap_hit: 0 },
          core_body_b: { total: 0, active: 0, mtd_earnings: 0, monthly_cap: 0, cap_hit: 0 },
          dealers: { total: 0, active: 0, order_volume: 0, order_count: 0 },
        };
      }
      districtMap[id].dealers = {
        total: parseInt(row.total_dealers), active: parseInt(row.active_dealers),
        order_volume: parseFloat(row.total_order_volume), order_count: parseInt(row.total_orders),
      };
    }

    const districts = Object.values(districtMap);

    // 6. Format individual users
    const coreBodyUsers = individualCBResult.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      type: u.type,
      is_active: u.is_active,
      district_id: u.district_id,
      district_name: u.district_name,
      ytd_earnings: parseFloat(u.ytd_earnings || 0),
      mtd_earnings: parseFloat(u.mtd_earnings || 0),
      annual_cap: parseFloat(u.annual_cap || 0),
      monthly_cap: parseFloat(u.monthly_cap || 0),
      cap_hit: u.cap_hit_flag,
      investment_amount: parseFloat(u.investment_amount || 0),
      activated_at: u.activated_at,
      cap_pct: u.type === 'A'
        ? (u.annual_cap > 0 ? Math.min(100, (u.ytd_earnings / u.annual_cap) * 100) : 0)
        : (u.monthly_cap > 0 ? Math.min(100, (u.mtd_earnings / u.monthly_cap) * 100) : 0),
    }));

    const dealerUsers = individualDealerResult.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      is_active: u.is_active,
      district_id: u.district_id,
      district_name: u.district_name,
      order_count: parseInt(u.order_count),
      order_volume: parseFloat(u.order_volume),
      joined_at: u.created_at,
    }));

    // 7. Summary KPIs
    const summary = {
      total_districts: districts.length,
      total_core_body_a: districts.reduce((s, d) => s + d.core_body_a.total, 0),
      total_core_body_b: districts.reduce((s, d) => s + d.core_body_b.total, 0),
      total_dealers: districts.reduce((s, d) => s + d.dealers.total, 0),
      total_order_volume: districts.reduce((s, d) => s + d.dealers.order_volume, 0),
      total_cap_hit: districts.reduce((s, d) => s + d.core_body_a.cap_hit + d.core_body_b.cap_hit, 0),
    };

    res.json({ districts, coreBodyUsers, dealerUsers, summary });
  } catch (error) {
    console.error('District performance snapshot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all dealers in the same district as the Core Body
const getDistrictDealers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        dp.id, u.full_name, s.name as subdivision_name
      FROM dealer_profiles dp
      JOIN users u ON dp.user_id = u.id
      JOIN subdivisions s ON dp.subdivision_id = s.id
      WHERE dp.district_id = (SELECT district_id FROM users WHERE id = $1)
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({ dealers: result.rows });
  } catch (error) {
    console.error('Get district dealers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current Core Body's inventory balances
const getCoreBodyInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        ib.product_id, p.name as product_name, p.sku, 
        ib.quantity_on_hand as quantity
      FROM inventory_balances ib
      JOIN products p ON ib.product_id = p.id
      WHERE ib.entity_id = $1 AND ib.entity_type = 'core_body'
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Get core body inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCoreBodyProfile,
  updateCoreBodyProfile,
  getCoreBodyDashboard,
  payInstallment,
  getCoreBodyReports,
  getDistrictUsers,
  getDirectoryUsers,
  getDirectoryUserDetail,
  getDistrictPerformanceSnapshot,
  getDistrictDealers,
  getCoreBodyInventory
};