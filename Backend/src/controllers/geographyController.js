const db = require('../config/db');

// ==========================================
// COUNTRIES
// ==========================================
exports.getCountries = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM countries WHERE is_active = true ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching countries:', err);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
};

exports.createCountry = async (req, res) => {
    try {
        const { name, iso_code } = req.body;
        const result = await db.query(
            'INSERT INTO countries (name, iso_code) VALUES ($1, $2) RETURNING *',
            [name, iso_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating country:', err);
        res.status(500).json({ error: 'Failed to create country' });
    }
};

// ==========================================
// STATES
// ==========================================
exports.getStatesByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;
        const { rows } = await db.query('SELECT * FROM states WHERE country_id = $1 AND is_active = true ORDER BY name ASC', [countryId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching states:', err);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
};

exports.getStates = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM states WHERE is_active = true ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching all states:', err);
        res.status(500).json({ error: 'Failed to fetch states' });
    }
};

exports.createState = async (req, res) => {
    try {
        const { country_id, name, code } = req.body;
        const result = await db.query(
            'INSERT INTO states (country_id, name, code) VALUES ($1, $2, $3) RETURNING *',
            [country_id, name, code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating state:', err);
        res.status(500).json({ error: 'Failed to create state' });
    }
};

// ==========================================
// DISTRICTS
// ==========================================
exports.getDistrictsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const { rows } = await db.query('SELECT * FROM districts WHERE state_id = $1 AND is_active = true ORDER BY name ASC', [stateId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching districts:', err);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
};

exports.getDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(`
            SELECT d.*, dq.max_core_body 
            FROM districts d 
            LEFT JOIN district_quota dq ON d.id = dq.district_id 
            WHERE d.id = $1
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'District not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching district:', err);
        res.status(500).json({ error: 'Failed to fetch district' });
    }
};

exports.createDistrict = async (req, res) => {
    try {
        const { state_id, name, code, max_core_body, is_active } = req.body;
        
        // Start transaction
        await db.query('BEGIN');
        
        const result = await db.query(
            'INSERT INTO districts (state_id, name, code, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
            [state_id, name, code, is_active !== undefined ? is_active : true]
        );
        
        const districtId = result.rows[0].id;
        
        // Create quota entry
        await db.query(
            'INSERT INTO district_quota (district_id, max_core_body, current_count) VALUES ($1, $2, 0)',
            [districtId, max_core_body || 20]
        );
        
        await db.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error creating district:', err);
        res.status(500).json({ error: 'Failed to create district' });
    }
};

exports.updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, is_active, max_core_body, state_id } = req.body;
        
        await db.query('BEGIN');
        
        const result = await db.query(
            `UPDATE districts 
             SET name = $1, code = $2, is_active = $3, state_id = COALESCE($4, state_id), updated_at = NOW() 
             WHERE id = $5 RETURNING *`,
            [name, code, is_active, state_id, id]
        );
        
        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'District not found' });
        }
        
        // Update quota if provided
        if (max_core_body !== undefined) {
            const check = await db.query('SELECT * FROM district_quota WHERE district_id = $1', [id]);
            if (check.rows.length === 0) {
                await db.query(
                    'INSERT INTO district_quota (district_id, max_core_body, current_count) VALUES ($1, $2, 0)',
                    [id, max_core_body]
                );
            } else {
                await db.query(
                    'UPDATE district_quota SET max_core_body = $1, updated_at = NOW() WHERE district_id = $2',
                    [max_core_body, id]
                );
            }
        }
        
        await db.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error updating district:', err);
        res.status(500).json({ error: 'Failed to update district' });
    }
};

// ==========================================
// SUBDIVISIONS
// ==========================================
exports.getSubdivisionsByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;
        const { rows } = await db.query('SELECT * FROM subdivisions WHERE district_id = $1 AND is_active = true ORDER BY name ASC', [districtId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching subdivisions:', err);
        res.status(500).json({ error: 'Failed to fetch subdivisions' });
    }
};

exports.createSubdivision = async (req, res) => {
    try {
        const { district_id, name } = req.body;
        const result = await db.query(
            'INSERT INTO subdivisions (district_id, name) VALUES ($1, $2) RETURNING *',
            [district_id, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating subdivision:', err);
        res.status(500).json({ error: 'Failed to create subdivision' });
    }
};

exports.getSubdivisionAssignedProducts = async (req, res) => {
    try {
        const { subdivisionId } = req.params;
        const { rows } = await db.query(
            'SELECT product_id FROM dealer_product_map WHERE subdivision_id = $1',
            [subdivisionId]
        );
        res.json(rows.map(r => r.product_id));
    } catch (err) {
        console.error('Error fetching assigned products:', err);
        res.status(500).json({ error: 'Failed to fetch assigned products' });
    }
};

// ==========================================
// CITIES
// ==========================================
exports.getCitiesByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;
        const { rows } = await db.query('SELECT * FROM cities WHERE district_id = $1 AND is_active = true ORDER BY name ASC', [districtId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
};

exports.createCity = async (req, res) => {
    try {
        const { district_id, name } = req.body;
        const result = await db.query(
            'INSERT INTO cities (district_id, name) VALUES ($1, $2) RETURNING *',
            [district_id, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating city:', err);
        res.status(500).json({ error: 'Failed to create city' });
    }
};

// ==========================================
// PINCODES
// ==========================================
exports.getPincodesByCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { rows } = await db.query('SELECT * FROM pincodes WHERE city_id = $1 AND is_active = true ORDER BY pincode ASC', [cityId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching pincodes:', err);
        res.status(500).json({ error: 'Failed to fetch pincodes' });
    }
};

exports.createPincode = async (req, res) => {
    try {
        const { city_id, pincode } = req.body;
        const result = await db.query(
            'INSERT INTO pincodes (city_id, pincode) VALUES ($1, $2) RETURNING *',
            [city_id, pincode]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating pincode:', err);
        res.status(500).json({ error: 'Failed to create pincode' });
    }
};

// ==========================================
// DISTRICT QUOTA
// ==========================================
exports.getDistrictQuota = async (req, res) => {
    try {
        const { districtId } = req.params;
        const { rows } = await db.query('SELECT * FROM district_quota WHERE district_id = $1', [districtId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Quota not found for this district' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching district quota:', err);
        res.status(500).json({ error: 'Failed to fetch district quota' });
    }
};

exports.getAllDistrictQuotas = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT dq.*, d.name as district_name FROM district_quota dq JOIN districts d ON dq.district_id = d.id');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching quotas:', err);
        res.status(500).json({ error: 'Failed to fetch district quotas' });
    }
};

exports.updateDistrictQuota = async (req, res) => {
    try {
        const { districtId } = req.params;
        const { max_core_body } = req.body;
        
        // Check if exists
        const check = await db.query('SELECT * FROM district_quota WHERE district_id = $1', [districtId]);
        let result;
        
        if (check.rows.length === 0) {
            // Insert
            result = await db.query(
                'INSERT INTO district_quota (district_id, max_core_body, current_count) VALUES ($1, $2, 0) RETURNING *',
                [districtId, max_core_body]
            );
        } else {
            // Update
            result = await db.query(
                'UPDATE district_quota SET max_core_body = $1, updated_at = NOW() WHERE district_id = $2 RETURNING *',
                [max_core_body, districtId]
            );
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating district quota:', err);
        res.status(500).json({ error: 'Failed to update district quota' });
    }
};

// ==========================================
// DISTRICT SUMMARY FOR DASHBOARD
// ==========================================
exports.getDistrictsSummary = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id, 
                d.name, 
                d.code,
                s.name as state_name,
                COALESCE(dq.max_core_body, 20) as max_limit,
                COALESCE(dq.current_count, 0) as current_count,
                (SELECT COUNT(*) FROM core_body_profiles cbp WHERE cbp.district_id = d.id AND cbp.type = 'A' AND cbp.is_active = true) as core_body_count_a,
                (SELECT COUNT(*) FROM core_body_profiles cbp WHERE cbp.district_id = d.id AND cbp.type = 'B' AND cbp.is_active = true) as core_body_count_b,
                (SELECT COUNT(*) FROM orders o WHERE o.district_id = d.id) as total_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.district_id = d.id) as total_revenue,
                d.is_active
            FROM districts d
            JOIN states s ON d.state_id = s.id
            LEFT JOIN district_quota dq ON d.id = dq.district_id
            ORDER BY d.name ASC
        `;
        
        const { rows } = await db.query(query);
        
        // Calculate totals for KPI cards
        const kpiData = {
            totalDistricts: rows.length,
            activeDistricts: rows.filter(d => d.is_active).length,
            totalCoreBodies: rows.reduce((sum, d) => sum + parseInt(d.core_body_count_a) + parseInt(d.core_body_count_b), 0),
            totalRevenue: rows.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0),
            avgOrdersPerDistrict: rows.length > 0 ? (rows.reduce((sum, d) => sum + parseInt(d.total_orders), 0) / rows.length).toFixed(0) : 0
        };

        res.json({
            districts: rows.map(r => ({
                ...r,
                core_body_count_a: parseInt(r.core_body_count_a),
                core_body_count_b: parseInt(r.core_body_count_b),
                total_orders: parseInt(r.total_orders),
                total_revenue: parseFloat(r.total_revenue)
            })),
            kpiData
        });
    } catch (err) {
        console.error('Error fetching district summary:', err);
        res.status(500).json({ error: 'Failed to fetch district summary' });
    }
};
exports.getDistrictPerformance = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Basic District Info
        const districtRes = await db.query(`
            SELECT d.*, s.name as state_name, dq.max_core_body, COALESCE(dq.current_count, 0) as current_count
            FROM districts d
            JOIN states s ON d.state_id = s.id
            LEFT JOIN district_quota dq ON d.id = dq.district_id
            WHERE d.id = $1
        `, [id]);
        
        if (districtRes.rows.length === 0) {
            return res.status(404).json({ error: 'District not found' });
        }
        
        const district = districtRes.rows[0];
        
        // 2. Core Body Counts
        const cbCountsRes = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE type = 'A') as count_a,
                COUNT(*) FILTER (WHERE type = 'B') as count_b
            FROM core_body_profiles
            WHERE district_id = $1 AND is_active = true
        `, [id]);
        
        const counts = cbCountsRes.rows[0];
        
        // 3. Overall Order Stats
        const orderStatsRes = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM orders
            WHERE district_id = $1
        `, [id]);
        
        const stats = orderStatsRes.rows[0];
        
        // 4. Monthly Trends (Last 6 Months)
        const trendsRes = await db.query(`
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', NOW() - INTERVAL '5 months'),
                    date_trunc('month', NOW()),
                    '1 month'::interval
                ) as month
            )
            SELECT 
                to_char(m.month, 'Mon') as month_label,
                COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_type = 'B2B'), 0) as b2b_revenue,
                COALESCE(SUM(o.total_amount) FILTER (WHERE o.order_type = 'B2C'), 0) as b2c_revenue,
                COUNT(o.id) as order_count
            FROM months m
            LEFT JOIN orders o ON date_trunc('month', o.created_at) = m.month AND o.district_id = $1
            GROUP BY m.month
            ORDER BY m.month ASC
        `, [id]);
        
        // 5. Core Body List
        const cbListRes = await db.query(`
            SELECT 
                cbp.id,
                u.full_name as name,
                cbp.type,
                cbp.investment_amount as investment,
                cbp.ytd_earnings as earnings,
                cbp.is_active,
                cbp.last_transaction_at as last_active
            FROM core_body_profiles cbp
            JOIN users u ON cbp.user_id = u.id
            WHERE cbp.district_id = $1
            ORDER BY cbp.type ASC, u.full_name ASC
        `, [id]);
        
        // Response
        res.json({
            districtInfo: {
                id: district.id,
                name: district.name,
                state: district.state_name,
                coreBodyCountA: parseInt(counts.count_a),
                coreBodyCountB: parseInt(counts.count_b),
                maxLimit: district.max_core_body || 20,
                totalOrders: parseInt(stats.total_orders),
                totalRevenue: parseFloat(stats.total_revenue),
                status: district.is_active ? 'active' : 'inactive'
            },
            revenueTrend: trendsRes.rows.map(r => ({
                month: r.month_label,
                b2b: parseFloat(r.b2b_revenue),
                b2c: parseFloat(r.b2c_revenue)
            })),
            ordersTrend: trendsRes.rows.map(r => ({
                month: r.month_label,
                orders: parseInt(r.order_count)
            })),
            coreBodies: cbListRes.rows.map(r => ({
                id: `CB-${r.id.toString().padStart(4, '0')}`,
                name: r.name,
                type: r.type,
                investment: parseFloat(r.investment),
                earnings: parseFloat(r.earnings),
                status: r.is_active ? 'active' : 'inactive',
                lastActive: r.last_active ? new Date(r.last_active).toISOString().split('T')[0] : 'Never'
            }))
        });
        
    } catch (err) {
        console.error('Error fetching district performance:', err);
        res.status(500).json({ error: 'Failed to fetch district performance data' });
    }
};

exports.getDistrictDealers = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                s.id as subdivision_id,
                s.name as subdivision_name,
                dp.id as dealer_id,
                u.id as user_id,
                u.full_name as dealer_name,
                u.phone as dealer_phone,
                dp.is_active,
                (SELECT COUNT(*) FROM dealer_product_map dpm WHERE dpm.dealer_id = dp.id) as product_specialization_count
            FROM subdivisions s
            LEFT JOIN dealer_profiles dp ON s.id = dp.subdivision_id
            LEFT JOIN users u ON dp.user_id = u.id
            WHERE s.district_id = $1
            ORDER BY s.name ASC, u.full_name ASC
        `;
        
        const { rows } = await db.query(query, [id]);
        
        // Group by subdivision
        const subdivisionMap = {};
        
        rows.forEach(row => {
            if (!subdivisionMap[row.subdivision_id]) {
                subdivisionMap[row.subdivision_id] = {
                    id: row.subdivision_id,
                    name: row.subdivision_name,
                    dealers: []
                };
            }
            
            if (row.dealer_id) {
                subdivisionMap[row.subdivision_id].dealers.push({
                    id: row.dealer_id,
                    userId: row.user_id,
                    name: row.dealer_name,
                    phone: row.dealer_phone,
                    status: row.is_active ? 'active' : 'inactive',
                    productCount: parseInt(row.product_specialization_count)
                });
            }
        });
        
        res.json(Object.values(subdivisionMap));
    } catch (err) {
// ...
        console.error('Error fetching district dealers:', err);
        res.status(500).json({ error: 'Failed to fetch subdivision-wise dealer data' });
    }
};
