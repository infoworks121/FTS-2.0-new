const { pool } = require('./src/config/db');

async function test() {
  const userId = '09cb6edc-7380-4bf7-ad2b-d4f62cf86a24';
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
      SELECT DISTINCT ON (p.id)
          p.id, 
          p.name, 
          p.sku, 
          p.thumbnail_url,
          c.name as category_name,
          cp.mapping_type,
          COALESCE(ib.quantity_on_hand, 0) as stock_quantity,
          cp.assigned_at
      FROM combined_products cp
      JOIN products p ON cp.id = p.id
      JOIN dealer_info di ON true
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory_balances ib ON (ib.product_id = p.id AND ib.entity_id = $1 AND ib.entity_type = 'dealer')
      ORDER BY p.id, p.name ASC
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    console.log('Result for Katwa Delaer (Dist 19):', result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
