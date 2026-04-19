const { pool } = require('./src/config/db');

async function debugAllDealers() {
  try {
    const dealers = await pool.query(`
      SELECT dp.user_id, u.full_name, dp.district_id 
      FROM dealer_profiles dp
      JOIN users u ON dp.user_id = u.id
    `);

    for (const dealer of dealers.rows) {
      const query = `
      WITH dealer_info AS (
        SELECT user_id, id as profile_id, district_id FROM dealer_profiles WHERE user_id = $1
      ),
      direct_mappings AS (
        SELECT p.id, dpm.assigned_at,
               CASE 
                  WHEN dpm.product_id IS NOT NULL THEN 'Product Specialized'
                  ELSE 'Category Specialized'
               END as mapping_type
        FROM dealer_product_map dpm
        JOIN dealer_info di ON dpm.dealer_id = di.profile_id
        LEFT JOIN products p ON (dpm.product_id = p.id OR dpm.category_id = p.category_id)
        WHERE p.id IS NOT NULL
      ),
      corebody_district_products AS (
        SELECT p.id, p.created_at as assigned_at, 'District Auto-Assign' as mapping_type
        FROM products p
        JOIN users u ON p.created_by = u.id
        JOIN dealer_info di ON u.district_id = di.district_id
        WHERE u.role_code LIKE 'core_body%' AND p.approval_status = 'approved' AND p.is_active = true
      ),
      combined_products AS (
        SELECT * FROM direct_mappings
        UNION
        SELECT * FROM corebody_district_products
      )
      SELECT p.name, cp.mapping_type
      FROM combined_products cp
      JOIN products p ON cp.id = p.id
      ORDER BY p.name ASC
      `;
      
      const res = await pool.query(query, [dealer.user_id]);
      console.log(`Dealer: ${dealer.full_name} (Dist: ${dealer.district_id}) -> Products:`, res.rows.length);
      if (res.rows.length > 0) {
          res.rows.forEach(r => console.log(`  - ${r.name} (${r.mapping_type})`));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugAllDealers();
