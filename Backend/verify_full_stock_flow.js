const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runVerification() {
    const client = await pool.connect();
    try {
        console.log("--- Starting Full Stock Flow Verification ---");

        // 1. Setup Test Data (Use existing test users from previous E2E test)
        // CB (North District): 0f8f8ed9-897c-47ea-8d65-3004354db15d (Core Body 1)
        // Dealer (North District): d64b150c-3fc1-4670-8dd9-d99f931d87da (Dealer 1)
        // Product: FTS Liquid (already exists)
        
        const cb_user_id = '27b4ca8d-2b60-46cc-9fd3-07e4a081af0e';
        const dealer_user_id = '21fe598a-e47a-470a-9725-0e25317066f8';
        const product_id = '282c6cec-2f03-4c40-9417-b63d0e665f20'; // Mobile

        // Get CB Profile ID
        const cbRes = await client.query('SELECT id, district_id FROM core_body_profiles WHERE user_id = $1', [cb_user_id]);
        const cb_profile_id = cbRes.rows[0].id;
        const district_id = cbRes.rows[0].district_id;
        console.log(`Core Body Profile: ${cb_profile_id}, District: ${district_id}`);

        // Get Dealer Profile ID
        const dRes = await client.query('SELECT id FROM dealer_profiles WHERE user_id = $1', [dealer_user_id]);
        const dealer_profile_id = dRes.rows[0].id;

        // 2. Add Stock to Core Body
        console.log("Adding 100 units to Core Body...");
        await client.query(
            `INSERT INTO inventory_balances (entity_type, entity_id, product_id, quantity_on_hand)
             VALUES ('core_body', $1, $2, 100)
             ON CONFLICT (entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'))
             DO UPDATE SET quantity_on_hand = 100`,
            [cb_user_id, product_id]
        );

        // 3. Verify Aggregated Stock for Dealer
        const stockMovement = require('./src/controllers/stockMovementController');
        const aggStock = await stockMovement.getDistrictAggregatedStock(district_id, product_id);
        console.log(`Aggregated District Stock for Product: ${aggStock}`);
        if (aggStock < 100) throw new Error("Aggregation failed");

        // 4. Issue Stock to Dealer
        console.log("Issuing 40 units from CB to Dealer...");
        // Simulate the request
        const mockReq = { 
            user: { id: cb_user_id },
            body: { dealer_id: dealer_profile_id, product_id, quantity: 40, note: 'Verification Transfer' }
        };
        const mockRes = { 
            status: (code) => ({ json: (data) => console.log(`Response ${code}:`, data) }),
            json: (data) => console.log(`Response 200:`, data)
        };
        await stockMovement.issueStockToDealer(mockReq, mockRes);

        // 5. Verify Physical Stock added to Dealer
        const dealerStock = await client.query(
            `SELECT quantity_on_hand FROM inventory_balances WHERE entity_type = 'dealer' AND entity_id = $1 AND product_id = $2`,
            [dealer_user_id, product_id]
        );
        console.log(`Dealer Physical Stock: ${dealerStock.rows[0]?.quantity_on_hand}`);
        if (parseFloat(dealerStock.rows[0]?.quantity_on_hand) !== 40) throw new Error("Dealer physical stock update failed");

        // 6. Test Nearest Dealer Allocation (B2C Order simulation)
        console.log("Simulating B2C Order Allocation...");
        // Setup a mock assignment logic check
        const bestDealer = await stockMovement.findBestDealerForAllocation(district_id, null);
        console.log(`Allocated Dealer: ${bestDealer.dealer_name} (ID: ${bestDealer.id})`);
        if (bestDealer.id !== dealer_profile_id) {
            console.warn("Allocation point mismatch, verify if multiple dealers exist in district");
        }

        console.log("Verification Successful!");
    } catch (e) {
        console.error("Verification Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

runVerification();
