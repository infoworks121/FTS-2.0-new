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

exports.createDistrict = async (req, res) => {
    try {
        const { state_id, name } = req.body;
        const result = await db.query(
            'INSERT INTO districts (state_id, name) VALUES ($1, $2) RETURNING *',
            [state_id, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating district:', err);
        res.status(500).json({ error: 'Failed to create district' });
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
            WHERE d.is_active = true
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
