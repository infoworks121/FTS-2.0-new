const { query } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting Invest Wallet Migration...');

        // 1. Ensure 'invest' wallet type exists
        await query(`
            INSERT INTO wallet_types (type_code, label, description)
            VALUES ('invest', 'Investment Wallet', 'Holds advance payments and investments from users')
            ON CONFLICT (type_code) DO NOTHING
        `);
        console.log('Wallet type "invest" ensured.');

        // 2. Find the Admin user(s)
        const admins = await query("SELECT u.id FROM users u JOIN user_roles r ON u.role_id = r.id WHERE r.role_code = 'admin'");
        
        if (admins.rows.length === 0) {
            console.log('No admin users found to assign wallets.');
            return;
        }

        const investType = await query("SELECT id FROM wallet_types WHERE type_code = 'invest'");
        const investTypeId = investType.rows[0].id;

        for (const admin of admins.rows) {
            await query(`
                INSERT INTO wallets (user_id, wallet_type_id, balance)
                VALUES ($1, $2, 0)
                ON CONFLICT (user_id, wallet_type_id) DO NOTHING
            `, [admin.id, investTypeId]);
            console.log(`Invest wallet ensured for admin: ${admin.id}`);
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
