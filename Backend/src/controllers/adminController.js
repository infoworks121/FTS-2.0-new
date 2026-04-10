const db = require('../config/db');

const getPendingUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.phone, u.email, u.full_name, u.pan_number, u.referral_code, 
                   r.role_code, u.district_id, u.created_at,
                   d.name as district_name,
                   bp.type as businessman_type, bp.business_name, bp.gst_number, bp.advance_amount,
                   cp.type as core_body_type, cp.investment_amount,
                   (
                       SELECT json_agg(i.* ORDER BY i.installment_no) 
                       FROM core_body_installments i 
                       WHERE i.core_body_id = cp.id
                   ) as core_body_installments,
                   (
                       SELECT json_agg(bi.* ORDER BY bi.installment_no) 
                       FROM businessman_investments bi 
                       WHERE bi.businessman_id = bp.id
                   ) as businessman_installments
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            LEFT JOIN districts d ON u.district_id = d.id
            LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
            LEFT JOIN core_body_profiles cp ON u.id = cp.user_id
            WHERE u.is_approved = FALSE AND u.role_id != 1
            ORDER BY u.created_at DESC
        `);

        res.json({ users: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveUser = async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user.id;

    try {
        await db.query(
            'UPDATE users SET is_approved = TRUE, approved_by = $1, approved_at = NOW() WHERE id = $2',
            [adminId, userId]
        );

        res.json({ message: 'User approved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const rejectUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Delete related core body installments first
        await db.query('DELETE FROM core_body_installments WHERE core_body_id IN (SELECT id FROM core_body_profiles WHERE user_id = $1)', [userId]);
        // Delete related businessman investments
        await db.query('DELETE FROM businessman_investments WHERE businessman_id IN (SELECT id FROM businessman_profiles WHERE user_id = $1)', [userId]);
        
        // Delete profiles and sessions
        await db.query('DELETE FROM businessman_profiles WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM core_body_profiles WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM user_devices WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM wallets WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM referral_links WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM referral_registrations WHERE referred_id = $1', [userId]);
        
        // Then delete the user
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        
        res.json({ message: 'User rejected and removed' });
    } catch (err) {
        console.error('Reject user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllBusinessmen = async (req, res) => {
    try {
        const { search, mode, district, status } = req.query;

        let query = `
            SELECT 
                u.id, u.full_name as name, u.email, u.phone,
                bp.mode, bp.is_active, bp.type,
                bp.business_name, bp.commission_earned as total_earnings,
                bp.ytd_sales, bp.mtd_sales, bp.monthly_target,
                d.name as district, d.id as district_id,
                u.created_at,
                u.is_approved,
                CASE WHEN u.is_approved = TRUE AND bp.is_active = TRUE THEN 'active'
                     WHEN bp.is_active = FALSE THEN 'inactive'
                     ELSE 'suspended' END as status
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            JOIN businessman_profiles bp ON u.id = bp.user_id
            LEFT JOIN districts d ON bp.district_id = d.id
            WHERE r.role_code = 'businessman'
        `;

        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR CAST(u.id AS TEXT) ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (mode) {
            query += ` AND bp.mode = $${paramIndex}`;
            params.push(mode);
            paramIndex++;
        }
        if (district) {
            query += ` AND d.name = $${paramIndex}`;
            params.push(district);
            paramIndex++;
        }
        if (status === 'active') {
            query += ` AND u.is_approved = TRUE AND bp.is_active = TRUE`;
        } else if (status === 'inactive') {
            query += ` AND bp.is_active = FALSE`;
        } else if (status === 'suspended') {
            query += ` AND u.is_approved = FALSE`;
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);

        // KPI summary
        const kpiResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE u.is_approved = TRUE AND bp.is_active = TRUE) as active,
                COALESCE(SUM(bp.commission_earned), 0) as total_earnings
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            JOIN businessman_profiles bp ON u.id = bp.user_id
            WHERE r.role_code = 'businessman'
        `);

        res.json({
            businessmen: result.rows,
            kpis: kpiResult.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAllCoreBodies = async (req, res) => {
    try {
        const { search, type, district, status } = req.query;

        let query = `
            SELECT 
                u.id, u.full_name as name, u.email, u.phone,
                cb.type, cb.is_active,
                cb.investment_amount, cb.ytd_earnings, cb.annual_cap,
                cb.mtd_earnings, cb.monthly_cap,
                d.name as district, d.id as district_id,
                u.created_at,
                u.is_approved,
                CASE 
                    WHEN cb.is_active = FALSE THEN 'inactive'
                    WHEN (cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 >= 100 THEN 'cap-reached'
                    WHEN (cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 >= 80 THEN 'warning'
                    ELSE 'active' 
                END as status,
                ROUND((cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100, 1) as cap_usage
            FROM users u
            JOIN core_body_profiles cb ON u.id = cb.user_id
            LEFT JOIN districts d ON cb.district_id = d.id
        `;

        const params = [];
        let paramIndex = 1;
        let whereClauses = [];

        if (search) {
            whereClauses.push(`(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR CAST(u.id AS TEXT) ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (type) {
            whereClauses.push(`cb.type = $${paramIndex}`);
            params.push(type);
            paramIndex++;
        }
        if (district) {
            whereClauses.push(`d.name = $${paramIndex}`);
            params.push(district);
            paramIndex++;
        }
        if (status) {
            if (status === 'active') {
                whereClauses.push(`cb.is_active = TRUE AND (cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 < 80`);
            } else if (status === 'warning') {
                whereClauses.push(`(cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 >= 80 AND (cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 < 100`);
            } else if (status === 'cap-reached') {
                whereClauses.push(`(cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 >= 100`);
            } else if (status === 'inactive') {
                whereClauses.push(`cb.is_active = FALSE`);
            }
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);

        // KPI summary
        const kpiQuery = `
            SELECT 
                COUNT(*) as total_core_bodies,
                COUNT(*) FILTER (WHERE cb.type = 'A') as type_a,
                COUNT(*) FILTER (WHERE cb.type = 'B') as type_b,
                COUNT(*) FILTER (WHERE cb.is_active = TRUE) as active,
                COUNT(*) FILTER (WHERE cb.is_active = FALSE) as inactive,
                COUNT(*) FILTER (WHERE (cb.ytd_earnings / NULLIF(cb.annual_cap, 0)) * 100 >= 80) as cap_warning,
                COALESCE(SUM(cb.investment_amount), 0) as total_investment,
                COALESCE(SUM(cb.ytd_earnings), 0) as total_earnings
            FROM core_body_profiles cb
        `;
        const kpiResult = await db.query(kpiQuery);

        res.json({
            coreBodies: result.rows,
            kpis: kpiResult.rows[0]
        });
    } catch (err) {
        console.error('Get all core bodies error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCoreBodyById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Basic Profile & User Info
        const profileResult = await db.query(`
            SELECT 
                u.id, u.full_name as name, u.email, u.phone, u.profile_photo_url, u.is_sph,
                cb.id as profile_id, cb.type, cb.is_active,
                cb.investment_amount, cb.installment_count,
                cb.annual_cap, cb.monthly_cap,
                cb.ytd_earnings, cb.mtd_earnings,
                cb.activated_at, cb.created_at,
                d.name as district, d.id as district_id,
                s.name as state
            FROM users u
            JOIN core_body_profiles cb ON u.id = cb.user_id
            LEFT JOIN districts d ON cb.district_id = d.id
            LEFT JOIN states s ON d.state_id = s.id
            WHERE u.id = $1
        `, [id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Core Body not found' });
        }

        const profile = profileResult.rows[0];

        // 2. Businessman Count
        const businessmanResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM businessman_profiles 
            WHERE assigned_core_body_id = $1
        `, [profile.profile_id]);

        profile.businessman_count = parseInt(businessmanResult.rows[0].count);

        // 3. Installments
        const installmentsResult = await db.query(`
            SELECT * FROM core_body_installments 
            WHERE core_body_id = $1
            ORDER BY installment_no ASC
        `, [profile.profile_id]);

        profile.installments = installmentsResult.rows;

        // 4. Earnings History (Last 12 months)
        const earningsHistoryResult = await db.query(`
            SELECT period_label as month, total_earned as amount
            FROM earnings_summary
            WHERE user_id = $1 AND period_type = 'monthly'
            ORDER BY snapshot_at DESC
            LIMIT 12
        `, [id]);

        // 5. Recent Activity (Last 20 transactions)
        const recentActivityResult = await db.query(`
            SELECT 
                id, transaction_type as action, amount, 
                created_at as date, description,
                CASE 
                    WHEN transaction_type IN ('earning', 'deposit', 'credit') THEN 'credit'
                    WHEN transaction_type IN ('withdrawal', 'debit', 'fee') THEN 'debit'
                    ELSE 'info'
                END as type
            FROM wallet_transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `, [id]);

        res.json({
            profile,
            earningsHistory: earningsHistoryResult.rows.reverse(),
            recentActivity: recentActivityResult.rows
        });

    } catch (err) {
        console.error('Get core body by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEntryModeUsers = async (req, res) => {
    try {
        // 1. Fetch KPIs
        const kpiResult = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (
                    WHERE EXISTS (
                        SELECT 1 FROM user_sessions 
                        WHERE user_id = businessman_profiles.user_id 
                        AND user_sessions.created_at > NOW() - INTERVAL '30 days'
                    )
                ) as active_users,
                SUM(commission_earned) as total_earnings,
                COUNT(*) FILTER (WHERE commission_earned >= 10000) as upgrade_eligible
            FROM businessman_profiles
            WHERE mode = 'entry'
        `);

        // 2. Fetch User List
        const usersResult = await db.query(`
            SELECT 
                u.id, u.full_name as name, u.phone, u.email, u.is_approved,
                bp.id as profile_id, bp.is_active, bp.commission_earned as earnings,
                bp.mtd_sales, bp.ytd_sales,
                COALESCE(ref.full_name, 'Direct') as referral_source,
                cbu.full_name as linked_hub,
                (
                    SELECT MAX(wt.created_at) 
                    FROM wallet_transactions wt
                    JOIN wallets uw ON wt.wallet_id = uw.id
                    WHERE uw.user_id = u.id
                ) as last_transaction,
                (
                    SELECT MAX(user_sessions.created_at) 
                    FROM user_sessions 
                    WHERE user_id = u.id
                ) as last_login_time
            FROM users u
            JOIN businessman_profiles bp ON u.id = bp.user_id
            LEFT JOIN referral_registrations rr ON rr.referred_id = u.id
            LEFT JOIN users ref ON rr.referrer_id = ref.id
            LEFT JOIN core_body_profiles cbp ON bp.assigned_core_body_id = cbp.id
            LEFT JOIN users cbu ON cbp.user_id = cbu.id
            WHERE bp.mode = 'entry'
            ORDER BY u.created_at DESC
        `);

        res.json({
            kpis: {
                totalUsers: parseInt(kpiResult.rows[0].total_users || 0),
                activeUsers: parseInt(kpiResult.rows[0].active_users || 0),
                totalEarnings: parseFloat(kpiResult.rows[0].total_earnings || 0),
                upgradeEligible: parseInt(kpiResult.rows[0].upgrade_eligible || 0)
            },
            users: usersResult.rows.map(row => {
                const now = new Date();
                const lastLogin = row.last_login_time ? new Date(row.last_login_time) : null;
                const inactivityDays = lastLogin 
                    ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
                    : 999;

                // Determine effective status
                let status = 'active';
                if (!row.is_approved) {
                    status = 'pending';
                } else if (!row.is_active) {
                    status = 'suspended';
                } else if (inactivityDays > 30) {
                    status = 'inactive';
                }

                return {
                    id: row.id,
                    name: row.name,
                    phone: row.phone,
                    email: row.email,
                    earnings: parseFloat(row.earnings || 0),
                    status,
                    referralSource: row.referral_source,
                    linkedHub: row.linked_hub,
                    lastTransaction: row.last_transaction,
                    inactivityDays,
                    isUpgradeEligible: parseFloat(row.earnings || 0) >= 10000
                };
            })
        });

    } catch (err) {
        console.error('Get entry mode users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBusinessmanById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Basic User & Businessman Profile Info
        const profileResult = await db.query(`
            SELECT 
                u.id, u.full_name as name, u.email, u.phone, u.profile_photo_url, u.is_approved, u.is_sph,
                bp.id as profile_id, bp.type, bp.mode, bp.is_active,
                bp.business_name, bp.business_address, bp.gst_number, bp.pan_number,
                bp.bank_account, bp.ifsc_code,
                bp.advance_amount, bp.assigned_core_body_id,
                bp.monthly_target, bp.ytd_sales, bp.mtd_sales, bp.commission_earned,
                bp.created_at, bp.updated_at,
                d.name as district, d.id as district_id,
                cbu.full_name as linked_hub_name
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            JOIN businessman_profiles bp ON u.id = bp.user_id
            LEFT JOIN districts d ON bp.district_id = d.id
            LEFT JOIN core_body_profiles cbp ON bp.assigned_core_body_id = cbp.id
            LEFT JOIN users cbu ON cbp.user_id = cbu.id
            WHERE u.id = $1 AND r.role_code = 'businessman'
        `, [id]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Businessman not found' });
        }

        const profile = profileResult.rows[0];

        // 2. If it's a Stock Point, get extra info
        if (profile.mode === 'stock_point' || profile.type === 'stock_point') {
            const stockPointResult = await db.query(`
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

        res.json({ profile });
    } catch (err) {
        console.error('Get businessman by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBusinessmanSettings = async (req, res) => {
    const { id } = req.params;
    const { 
        name, email, phone, status, mode, district_id,
        business_name, business_address, gst_number, pan_number,
        bank_account, ifsc_code, monthly_target, advance_amount,
        storage_capacity, min_inventory_value, warehouse_address, is_sph
    } = req.body;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Update User Table
        const is_approved = status === 'active' || status === 'inactive'; 
        
        let user_is_active = true;
        let user_is_approved = true;
        
        if (status === 'suspended') {
            user_is_active = false;
        } else if (status === 'pending') {
            user_is_approved = false;
        }

        await client.query(`
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                is_approved = $4,
                is_sph = $5,
                updated_at = NOW()
            WHERE id = $6
        `, [name, email, phone, user_is_approved, is_sph, id]);

        // 2. Update Businessman Profile
        const bp_is_active = status !== 'suspended' && status !== 'inactive';

        await client.query(`
            UPDATE businessman_profiles 
            SET mode = COALESCE($1, mode),
                type = COALESCE($1, type),
                district_id = COALESCE($2, district_id),
                business_name = COALESCE($3, business_name),
                business_address = COALESCE($4, business_address),
                gst_number = COALESCE($5, gst_number),
                pan_number = COALESCE($6, pan_number),
                bank_account = COALESCE($7, bank_account),
                ifsc_code = COALESCE($8, ifsc_code),
                monthly_target = COALESCE($9, monthly_target),
                advance_amount = COALESCE($10, advance_amount),
                is_active = $11,
                updated_at = NOW()
            WHERE user_id = $12
        `, [
            mode, district_id, business_name, business_address, gst_number, 
            pan_number, bank_account, ifsc_code, monthly_target, advance_amount,
            bp_is_active, id
        ]);

        // 3. Update Stock Point Profile if mode/type is stock_point
        if (mode === 'stock_point') {
            const bpResult = await client.query('SELECT id FROM businessman_profiles WHERE user_id = $1', [id]);
            const bpId = bpResult.rows[0].id;

            await client.query(`
                INSERT INTO stock_point_profiles (businessman_id, district_id, storage_capacity, min_inventory_value, warehouse_address)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (businessman_id) DO UPDATE SET
                    storage_capacity = EXCLUDED.storage_capacity,
                    min_inventory_value = EXCLUDED.min_inventory_value,
                    warehouse_address = EXCLUDED.warehouse_address,
                    district_id = EXCLUDED.district_id
            `, [bpId, district_id, storage_capacity, min_inventory_value, warehouse_address]);
        }

        await client.query('COMMIT');
        res.json({ message: 'Businessman settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update businessman settings error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;

        let query = `
            SELECT 
                u.id, u.full_name as name, u.email, u.phone, u.profile_photo_url,
                u.is_approved, u.is_sph, u.created_at,
                r.role_code as role, r.role_label as role_name,
                bp.type as business_type,
                CASE 
                    WHEN u.is_approved = TRUE THEN 'active'
                    ELSE 'pending'
                END as status
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            LEFT JOIN businessman_profiles bp ON u.id = bp.user_id
            WHERE r.role_code != 'admin'
        `;

        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR CAST(u.id AS TEXT) ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (role && role !== 'all') {
            query += ` AND r.role_code = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        if (status && status !== 'all') {
            if (status === 'active') {
                query += ` AND u.is_approved = TRUE`;
            } else if (status === 'pending') {
                query += ` AND u.is_approved = FALSE`;
            }
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);

        // KPI summary
        const kpiResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE u.is_approved = TRUE) as active,
                COUNT(*) FILTER (WHERE u.is_approved = FALSE) as pending,
                COUNT(*) FILTER (WHERE u.is_sph = TRUE) as sph_active
            FROM users u
            JOIN user_roles r ON u.role_id = r.id
            WHERE r.role_code != 'admin'
        `);

        res.json({
            users: result.rows,
            kpis: kpiResult.rows[0]
        });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserSPHStatus = async (req, res) => {
    const { id } = req.params;
    const { is_sph } = req.body;

    try {
        await db.query(
            'UPDATE users SET is_sph = $1, updated_at = NOW() WHERE id = $2',
            [is_sph, id]
        );

        res.json({ message: `User SPH status updated successfully` });
    } catch (err) {
        console.error('Update user SPH status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminDashboardStats = async (req, res) => {

    try {
        // 1. KPI Stats
        const kpiResult = await db.query(`
            SELECT 
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered') as total_revenue,
                (SELECT COALESCE(balance, 0) FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE wt.type_code = 'trust_fund' LIMIT 1) as trust_fund,
                (SELECT COUNT(DISTINCT district_id) FROM users WHERE is_active = TRUE) as active_districts,
                (SELECT COUNT(*) FROM users WHERE is_approved = FALSE) as fraud_alerts
        `);

        // 2. Profit Flow Chart (Last 6 Months)
        const profitResult = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as month,
                SUM(total_amount) as revenue,
                SUM(total_amount * 0.05) as trust -- Assuming 5% goes to trust fund for simulation
            FROM orders
            WHERE created_at > NOW() - INTERVAL '6 months' AND status = 'delivered'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at) ASC
        `);

        // 3. District Activity Chart
        const districtResult = await db.query(`
            SELECT 
                d.name,
                COUNT(o.id) as orders,
                COUNT(DISTINCT bp.user_id) as businessmen,
                '₹' || ROUND(SUM(o.total_amount)/100000.0, 1) || 'L' as revenue
            FROM districts d
            LEFT JOIN orders o ON o.district_id = d.id
            LEFT JOIN businessman_profiles bp ON bp.district_id = d.id
            GROUP BY d.name
            LIMIT 5
        `);

        // 4. Recent Activity
        const activityResult = await db.query(`
            SELECT 
                id, transaction_type as type, description, amount, 
                created_at as time,
                CASE 
                    WHEN transaction_type IN ('earning', 'deposit') THEN 'active'
                    WHEN transaction_type = 'withdrawal' THEN 'pending'
                    ELSE 'warning'
                END as status
            FROM wallet_transactions
            ORDER BY created_at DESC
            LIMIT 5
        `);

        res.json({
            kpis: kpiResult.rows[0],
            profitData: profitResult.rows,
            districtData: districtResult.rows,
            recentActivity: activityResult.rows.map(row => ({
                id: row.id.substring(0, 8),
                type: row.type,
                user: row.description ? (row.description.split(' ')[0] || 'System') : 'System',
                amount: '₹' + parseFloat(row.amount).toLocaleString('en-IN'),
                status: row.status,
                time: new Date(row.time).toLocaleTimeString()
            }))
        });
    } catch (err) {
        console.error('Admin dashboard stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const getPendingCoreBodyInstallments = async (req, res) => {
    try {
        const query = `
            SELECT 
                i.id as installment_id, i.installment_no, i.amount, i.payment_ref, i.created_at,
                u.id as user_id, u.full_name as name, u.phone, u.email,
                cb.type as core_body_type,
                d.name as district_name
            FROM core_body_installments i
            JOIN core_body_profiles cb ON i.core_body_id = cb.id
            JOIN users u ON cb.user_id = u.id
            LEFT JOIN districts d ON cb.district_id = d.id
            WHERE i.status = 'pending_approval'
            ORDER BY i.created_at DESC
        `;
        const result = await db.query(query);
        res.json({ pendingInstallments: result.rows });
    } catch (err) {
        console.error('Get pending core body installments error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveCoreBodyInstallment = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;
    
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Fetch installment details
        const installmentResult = await client.query(`
            SELECT i.*, cb.user_id 
            FROM core_body_installments i
            JOIN core_body_profiles cb ON i.core_body_id = cb.id
            WHERE i.id = $1
        `, [id]);

        if (installmentResult.rows.length === 0) {
            throw new Error('Installment not found');
        }

        const installment = installmentResult.rows[0];
        
        if (action === 'approve') {
            // Update installment to paid
            await client.query(`
                UPDATE core_body_installments 
                SET status = 'paid'
                WHERE id = $1
            `, [id]);

            // Activate Core Body profile and user
            await client.query(`
                UPDATE core_body_profiles 
                SET is_active = TRUE, activated_at = COALESCE(activated_at, NOW()), updated_at = NOW() 
                WHERE id = $1
            `, [installment.core_body_id]);

            await client.query(`
                UPDATE users 
                SET is_approved = TRUE, approved_by = $1, approved_at = COALESCE(approved_at, NOW()), updated_at = NOW() 
                WHERE id = $2
            `, [adminId, installment.user_id]);
            
            // Add to wallet ledger if applicable - user wanted it transferred to corebody wallet
            const walletQuery = await client.query(`
                SELECT w.id, w.balance
                FROM wallets w 
                JOIN wallet_types wt ON w.wallet_type_id = wt.id 
                WHERE w.user_id = $1 AND wt.type_code = 'main'
            `, [installment.user_id]);
            let walletId;
            
            if (walletQuery.rows.length > 0) {
                walletId = walletQuery.rows[0].id;
                const oldBalance = parseFloat(walletQuery.rows[0].balance || 0);
                const newBalance = oldBalance + parseFloat(installment.amount);

                await client.query(`
                    UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2
                `, [newBalance, walletId]);
                
                await client.query(`
                    INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, source_type, source_ref_id)
                    VALUES ($1, $2, 'deposit', $3, $4, $5, 'Investment Installment Payment Approved', 'core_body_installment', $6)
                `, [walletId, installment.user_id, installment.amount, oldBalance, newBalance, id]);
            }

            await client.query('COMMIT');
            res.json({ message: 'Installment approved and user activated successfully' });
        } else if (action === 'reject') {
            await client.query(`
                UPDATE core_body_installments 
                SET status = 'rejected', payment_ref = NULL
                WHERE id = $1
            `, [id]);

            await client.query('COMMIT');
            res.json({ message: 'Installment payment rejected' });
        } else {
            throw new Error('Invalid action');
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Approve core body installment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

const getPendingBusinessmanInstallments = async (req, res) => {
    try {
        const query = `
            SELECT 
                bi.id as installment_id, bi.installment_no, bi.amount, bi.payment_ref, bi.created_at,
                u.id as user_id, u.full_name as name, u.phone, u.email,
                bp.mode as businessman_mode,
                d.name as district_name
            FROM businessman_investments bi
            JOIN businessman_profiles bp ON bi.businessman_id = bp.id
            JOIN users u ON bp.user_id = u.id
            LEFT JOIN districts d ON bp.district_id = d.id
            WHERE bi.status = 'pending_approval'
            ORDER BY bi.created_at DESC
        `;
        const result = await db.query(query);
        res.json({ pendingInstallments: result.rows });
    } catch (err) {
        console.error('Get pending businessman installments error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveBusinessmanInstallment = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;
    
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Fetch installment details
        const installmentResult = await client.query(`
            SELECT bi.*, bp.user_id 
            FROM businessman_investments bi
            JOIN businessman_profiles bp ON bi.businessman_id = bp.id
            WHERE bi.id = $1
        `, [id]);

        if (installmentResult.rows.length === 0) {
            throw new Error('Installment not found');
        }

        const installment = installmentResult.rows[0];
        
        if (action === 'approve') {
            // Update installment to paid
            await client.query(`
                UPDATE businessman_investments 
                SET status = 'paid', paid_date = NOW()
                WHERE id = $1
            `, [id]);

            // Activate Businessman profile and user if needed
            await client.query(`
                UPDATE businessman_profiles 
                SET is_active = TRUE, updated_at = NOW() 
                WHERE id = $1
            `, [installment.businessman_id]);

            await client.query(`
                UPDATE users 
                SET is_approved = TRUE, approved_by = $1, approved_at = COALESCE(approved_at, NOW()), updated_at = NOW() 
                WHERE id = $2
            `, [adminId, installment.user_id]);
            
            // Add to wallet ledger
            const walletQuery = await client.query(`
                SELECT w.id, w.balance
                FROM wallets w 
                JOIN wallet_types wt ON w.wallet_type_id = wt.id 
                WHERE w.user_id = $1 AND wt.type_code = 'main'
            `, [installment.user_id]);
            
            if (walletQuery.rows.length > 0) {
                const walletId = walletQuery.rows[0].id;
                const oldBalance = parseFloat(walletQuery.rows[0].balance || 0);
                const newBalance = oldBalance + parseFloat(installment.amount);

                await client.query(`
                    UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2
                `, [newBalance, walletId]);
                
                await client.query(`
                    INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, source_type, source_ref_id)
                    VALUES ($1, $2, 'deposit', $3, $4, $5, 'Businessman Investment Installment Payment Approved', 'businessman_installment', $6)
                `, [walletId, installment.user_id, installment.amount, oldBalance, newBalance, id]);
            }

            await client.query('COMMIT');
            res.json({ message: 'Installment approved and profile activated successfully' });
        } else if (action === 'reject') {
            await client.query(`
                UPDATE businessman_investments 
                SET status = 'rejected', payment_ref = NULL, paid_date = NULL
                WHERE id = $1
            `, [id]);

            await client.query('COMMIT');
            res.json({ message: 'Installment payment rejected' });
        } else {
            throw new Error('Invalid action');
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Approve businessman installment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

const updateCoreBodySettings = async (req, res) => {
    const { id } = req.params;
    const { 
        name, email, phone, status, type, district_id,
        investment_amount, installment_count, annual_cap, monthly_cap,
        is_sph
    } = req.body;

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Update User Table
        let user_is_approved = true;
        
        if (status === 'pending') {
            user_is_approved = false;
        }

        await client.query(`
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                is_approved = $4,
                is_sph = $5,
                updated_at = NOW()
            WHERE id = $6
        `, [name, email, phone, user_is_approved, is_sph, id]);

        // 2. Update Core Body Profile
        const cb_is_active = status !== 'suspended' && status !== 'inactive';

        await client.query(`
            UPDATE core_body_profiles 
            SET type = COALESCE($1, type),
                district_id = COALESCE($2, district_id),
                investment_amount = COALESCE($3, investment_amount),
                installment_count = COALESCE($4, installment_count),
                annual_cap = COALESCE($5, annual_cap),
                monthly_cap = COALESCE($6, monthly_cap),
                is_active = $7,
                updated_at = NOW()
            WHERE user_id = $8
        `, [
            type, district_id, investment_amount, installment_count, 
            annual_cap, monthly_cap, cb_is_active, id
        ]);

        await client.query('COMMIT');
        res.json({ message: 'Core Body settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update core body settings error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

const getLowStockAlerts = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;
        const userId = req.user.id;

        const query = `
            SELECT 
                ib.id as balance_id,
                ib.quantity_on_hand,
                ib.quantity_reserved,
                p.id as product_id,
                p.name AS product_name,
                p.sku AS product_sku,
                p.thumbnail_url,
                pv.id as variant_id,
                pv.variant_name,
                pv.sku_suffix
            FROM inventory_balances ib
            JOIN products p ON ib.product_id = p.id
            LEFT JOIN product_variants pv ON ib.variant_id = pv.id
            WHERE ib.entity_id = $1 
              AND ib.quantity_on_hand <= $2
            ORDER BY ib.quantity_on_hand ASC
        `;

        const result = await db.query(query, [userId, threshold]);

        res.json({
            alerts: result.rows,
            count: result.rows.length,
            threshold
        });
    } catch (err) {
        console.error('Get low stock alerts error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getPendingUsers, 
    approveUser, 
    rejectUser, 
    getAllBusinessmen, 
    getAllCoreBodies,
    getCoreBodyById,
    getEntryModeUsers,
    getBusinessmanById,
    updateBusinessmanSettings,
    updateCoreBodySettings,
    getAllUsers,
    updateUserSPHStatus,
    getAdminDashboardStats,
    getPendingCoreBodyInstallments,
    approveCoreBodyInstallment,
<<<<<<< HEAD
    getPendingBusinessmanInstallments,
    approveBusinessmanInstallment,
    getLowStockAlerts
=======
    getLowStockAlerts,
    getPendingBusinessmanInstallments,
    approveBusinessmanInstallment
>>>>>>> af53d87c71a15ace031a20f0fbdd5f7e6df4fdd5
};
