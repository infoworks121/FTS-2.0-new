const db = require('../config/db');

/**
 * GET /api/wallet/admin/gateways
 * Returns all payment gateway configurations.
 */
exports.getGateways = async (req, res) => {
  try {
    const result = await db.query('SELECT id, gateway_name, api_key, is_active, is_test_mode, updated_at FROM gateway_configurations ORDER BY gateway_name');
    res.json({ gateways: result.rows });
  } catch (err) {
    console.error('Get gateways error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/wallet/admin/gateways/:id
 * Updates a gateway configuration.
 */
exports.updateGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key, api_secret, webhook_secret, is_active, is_test_mode } = req.body;
    const adminId = req.user.id;

    // Use COALESCE to keep old values if not provided
    const result = await db.query(
      `UPDATE gateway_configurations 
       SET api_key = COALESCE($1, api_key),
           api_secret = COALESCE($2, api_secret),
           webhook_secret = COALESCE($3, webhook_secret),
           is_active = COALESCE($4, is_active),
           is_test_mode = COALESCE($5, is_test_mode),
           updated_at = NOW(),
           updated_by = $6
       WHERE id = $7
       RETURNING id, gateway_name, is_active`,
      [api_key, api_secret, webhook_secret, is_active, is_test_mode, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gateway configuration not found.' });
    }

    res.json({ message: 'Gateway updated successfully.', gateway: result.rows[0] });
  } catch (err) {
    console.error('Update gateway error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
