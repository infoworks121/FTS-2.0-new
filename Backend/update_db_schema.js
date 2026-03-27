const db = require('./src/config/db');

async function updateDB() {
    try {
        console.log("Creating commission_rules table...");
        await db.query(`
            DROP TABLE IF EXISTS commission_rules CASCADE;
            CREATE TABLE IF NOT EXISTS commission_rules (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name            VARCHAR(150) NOT NULL,
                description     TEXT,
                percentage      NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
                type            VARCHAR(20) DEFAULT 'category',
                status          VARCHAR(20) DEFAULT 'active',
                effective_from  TIMESTAMPTZ DEFAULT NOW(),
                effective_to    TIMESTAMPTZ,
                created_at      TIMESTAMPTZ DEFAULT NOW(),
                updated_at      TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log("Table commission_rules created.");
        
        console.log("Adding commission_rule_id to categories...");
        // Since categories table might already map to rules, check if column exists
        await db.query(`
            ALTER TABLE categories 
            ADD COLUMN IF NOT EXISTS commission_rule_id UUID REFERENCES commission_rules(id) ON DELETE SET NULL;
        `);
        console.log("Categories table updated successfully.");
        
        console.log("Adding default rule...");
        await db.query(`
            INSERT INTO commission_rules (name, percentage, type) 
            VALUES ('Standard Commission', 15.00, 'category');
        `);
        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error("Error migrating DB:", e.message, e.query);
        process.exit(1);
    }
}

updateDB();
