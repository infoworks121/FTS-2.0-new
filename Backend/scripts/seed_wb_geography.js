const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const wbData = {
    "Alipurduar": ["Alipurduar"],
    "Bankura": ["Bankura Sadar", "Bishnupur", "Khatra"],
    "Birbhum": ["Bolpur", "Rampurhat", "Suri Sadar"],
    "Cooch Behar": ["Cooch Behar Sadar", "Dinhata", "Mathabhanga", "Mekhliganj", "Tufanganj"],
    "Dakshin Dinajpur": ["Balurghat", "Gangarampur"],
    "Darjeeling": ["Darjeeling Sadar", "Kurseong", "Mirik", "Siliguri"],
    "Hooghly": ["Arambag", "Chandannagore", "Chinsurah Sadar", "Srirampore"],
    "Howrah": ["Howrah Sadar", "Uluberia"],
    "Jalpaiguri": ["Jalpaiguri Sadar", "Malbazar", "Dhupguri"],
    "Jhargram": ["Jhargram"],
    "Kalimpong": ["Kalimpong"],
    "Kolkata": ["Kolkata"],
    "Malda": ["Chanchal", "Malda Sadar"],
    "Murshidabad": ["Berhampore", "Domkal", "Jangipur", "Kandi", "Lalbag"],
    "Nadia": ["Kalyani", "Krishnanagar Sadar", "Ranaghat", "Tehatta"],
    "North 24 Parganas": ["Bangaon", "Barasat Sadar", "Barrackpore", "Basirhat", "Bidhannagar"],
    "Paschim Bardhaman": ["Asansol Sadar", "Durgapur"],
    "Paschim Medinipur": ["Ghatal", "Kharagpur", "Medinipur Sadar"],
    "Purba Bardhaman": ["Bardhaman Sadar North", "Bardhaman Sadar South", "Kalna", "Katwa"],
    "Purba Medinipur": ["Contai", "Egra", "Haldia", "Tamluk"],
    "Purulia": ["Jhalda", "Manbazar", "Purulia Sadar", "Raghunathpur"],
    "South 24 Parganas": ["Alipore Sadar", "Baruipur", "Canning", "Diamond Harbour", "Kakdwip"],
    "Uttar Dinajpur": ["Islampur", "Raiganj"]
};

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create subdivision table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS subdivisions (
                id          SERIAL PRIMARY KEY,
                district_id INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
                name        VARCHAR(150) NOT NULL,
                is_active   BOOLEAN DEFAULT TRUE,
                UNIQUE(district_id, name)
            );
        `);
        console.log('Ensure subdivisions table exists.');

        // 2. Insert Country (India)
        const countryRes = await client.query(
            'INSERT INTO countries (name, iso_code) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            ['India', 'IN']
        );
        const countryId = countryRes.rows[0].id;

        // 3. Insert State (West Bengal)
        const stateRes = await client.query(
            'INSERT INTO states (country_id, name, code) VALUES ($1, $2, $3) ON CONFLICT (country_id, name) DO UPDATE SET code = EXCLUDED.code RETURNING id',
            [countryId, 'West Bengal', 'WB']
        );
        const stateId = stateRes.rows[0].id;

        console.log(`Seeding West Bengal (ID: ${stateId}) districts and subdivisions...`);

        for (const [districtName, subdivisions] of Object.entries(wbData)) {
            // Insert District
            const distRes = await client.query(
                'INSERT INTO districts (state_id, name) VALUES ($1, $2) ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                [stateId, districtName]
            );
            const districtId = distRes.rows[0].id;

            // Insert Subdivisions
            for (const subName of subdivisions) {
                await client.query(
                    'INSERT INTO subdivisions (district_id, name) VALUES ($1, $2) ON CONFLICT (district_id, name) DO NOTHING',
                    [districtId, subName]
                );
            }
        }

        await client.query('COMMIT');
        console.log('Seeding completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
