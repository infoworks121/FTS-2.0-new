require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function createAdmin() {
    try {
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await db.query(
            `UPDATE users SET password_hash = $1 WHERE role_id = 1`,
            [password_hash]
        );

        console.log('Admin credentials:');
        console.log('Email: admin@fts.com');
        console.log('Phone: 9999999999');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
