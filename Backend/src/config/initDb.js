const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const initDb = async () => {
    const connectionString = process.env.DATABASE_URL;
    const dbName = connectionString.split('/').pop().split('?')[0];
    const baseUrl = connectionString.substring(0, connectionString.lastIndexOf('/'));

    // 1. Connect to default 'postgres' database to ensure target DB exists
    const rootClient = new Client({
        connectionString: `${baseUrl}/postgres`
    });

    try {
        await rootClient.connect();

        // Check if DB exists
        const res = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating it...`);
            // Note: CREATE DATABASE cannot be run inside a transaction block or with parameters in some drivers
            await rootClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
    } catch (err) {
        console.error('Error during DB creation check:', err.message);
    } finally {
        await rootClient.end();
    }

    // 2. Now connect to the actual DB and run schema
    const dbClient = new Client({
        connectionString: connectionString
    });

    try {
        const schemaPath = path.join(__dirname, '../../fts_complete_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log(`Connecting to "${dbName}" to initialize schema...`);
        await dbClient.connect();

        console.log('Executing schema script...');
        // We run the whole file. pg driver allows multiple statements in one query call if no parameters are used.
        await dbClient.query(schema);
        console.log('Database schema initialized successfully.');
    } catch (err) {
        console.error('DATABASE INITIALIZATION FAILED!');
        console.error('Error Detail:', err.message);
        if (err.position) {
            console.error('Error at position:', err.position);
        }
        process.exit(1);
    } finally {
        await dbClient.end();
    }
};

if (require.main === module) {
    initDb();
}

module.exports = initDb;
