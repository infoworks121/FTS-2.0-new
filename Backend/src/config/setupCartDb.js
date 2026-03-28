const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const setupCartDb = async () => {
    const connectionString = process.env.DATABASE_URL;
    const dbClient = new Client({ connectionString });

    try {
        const schemaPath = path.join(__dirname, '../../db/add_cart_table.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Connecting to DB to add/update user_cart_items table...');
        await dbClient.connect();

        await dbClient.query(schema);
        console.log('Cart tables initialized successfully.');
    } catch (err) {
        console.error('Failed to initialize cart table!', err.message);
    } finally {
        await dbClient.end();
    }
};

setupCartDb();
