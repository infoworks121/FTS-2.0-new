const { query } = require('./src/config/db');

async function check() {
    try {
        const roles = await query('SELECT * FROM user_roles');
        console.log('Roles:', roles.rows);

        const admin = await query('SELECT u.id, u.full_name, r.role_code FROM users u JOIN user_roles r ON u.role_id = r.id WHERE r.role_code = \'admin\' LIMIT 1');
        console.log('Admin User:', admin.rows[0]);

        const walletTypes = await query('SELECT * FROM wallet_types');
        console.log('Wallet Types:', walletTypes.rows);

        if (admin.rows[0]) {
            const adminWallets = await query('SELECT w.*, wt.type_code FROM wallets w JOIN wallet_types wt ON w.wallet_type_id = wt.id WHERE w.user_id = $1', [admin.rows[0].id]);
            console.log('Admin Wallets:', adminWallets.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
