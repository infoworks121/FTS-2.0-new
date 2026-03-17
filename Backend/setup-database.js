const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Setting up database...\n');

        // Check if roles exist
        console.log('1. Checking user roles...');
        const rolesResult = await client.query('SELECT COUNT(*) FROM user_roles');
        if (parseInt(rolesResult.rows[0].count) === 0) {
            console.log('   ⚠️  No roles found. Please run: psql -U postgres -d fts_db -f insert_roles.sql');
        } else {
            console.log(`   ✓ Found ${rolesResult.rows[0].count} roles`);
        }

        // Check if country exists
        console.log('\n2. Checking countries...');
        const countryResult = await client.query("SELECT id FROM countries WHERE iso_code = 'IN'");
        let countryId;
        if (countryResult.rows.length === 0) {
            console.log('   → Inserting India...');
            const insertCountry = await client.query(
                "INSERT INTO countries (name, iso_code) VALUES ('India', 'IN') RETURNING id"
            );
            countryId = insertCountry.rows[0].id;
            console.log('   ✓ India inserted');
        } else {
            countryId = countryResult.rows[0].id;
            console.log('   ✓ India exists');
        }

        // Check if West Bengal exists
        console.log('\n3. Checking states...');
        const stateResult = await client.query(
            "SELECT id FROM states WHERE name = 'West Bengal' AND country_id = $1",
            [countryId]
        );
        let stateId;
        if (stateResult.rows.length === 0) {
            console.log('   → Inserting West Bengal...');
            const insertState = await client.query(
                "INSERT INTO states (country_id, name, code) VALUES ($1, 'West Bengal', 'WB') RETURNING id",
                [countryId]
            );
            stateId = insertState.rows[0].id;
            console.log('   ✓ West Bengal inserted');
        } else {
            stateId = stateResult.rows[0].id;
            console.log('   ✓ West Bengal exists');
        }

        // Insert districts
        console.log('\n4. Checking districts...');
        const districtResult = await client.query(
            'SELECT COUNT(*) FROM districts WHERE state_id = $1',
            [stateId]
        );
        
        if (parseInt(districtResult.rows[0].count) === 0) {
            console.log('   → Inserting West Bengal districts...');
            const districts = [
                'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
                'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
                'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
                'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur',
                'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas',
                'Uttar Dinajpur'
            ];

            for (const district of districts) {
                await client.query(
                    'INSERT INTO districts (state_id, name) VALUES ($1, $2) ON CONFLICT (state_id, name) DO NOTHING',
                    [stateId, district]
                );
            }
            console.log(`   ✓ Inserted ${districts.length} districts`);
        } else {
            console.log(`   ✓ Found ${districtResult.rows[0].count} districts`);
        }

        // Check wallet types
        console.log('\n5. Checking wallet types...');
        const walletResult = await client.query('SELECT COUNT(*) FROM wallet_types');
        if (parseInt(walletResult.rows[0].count) === 0) {
            console.log('   ⚠️  No wallet types found. They should be in the schema.');
        } else {
            console.log(`   ✓ Found ${walletResult.rows[0].count} wallet types`);
        }

        console.log('\n✅ Database setup complete!\n');
        console.log('You can now test registration with:');
        console.log('  node test-registration-fix.js\n');

    } catch (err) {
        console.error('❌ Error setting up database:', err.message);
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
