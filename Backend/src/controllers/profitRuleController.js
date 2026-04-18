const db = require('../config/db');

// Get profit rule by channel
exports.getProfitRuleByChannel = async (req, res) => {
    try {
        const { channel } = req.params;
        const result = await db.query(
            `SELECT * FROM profit_rules WHERE channel = $1 AND is_current = TRUE`,
            [channel]
        );

        if (result.rows.length === 0) {
            // Create a default rule if not found
            const defaultRule = await db.query(
                `INSERT INTO profit_rules (channel, rule_name, percentage, settings, is_current, created_at)
                 VALUES ($1, $2, $3, $4, TRUE, NOW()) RETURNING *`,
                [channel, `${channel.charAt(0).toUpperCase() + channel.slice(1)} Default Rule`, 10, {}]
            );
            return res.json({ rule: defaultRule.rows[0] });
        }

        res.json({ rule: result.rows[0] });
    } catch (error) {
        console.error('Error fetching profit rule:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update profit rule and archive old one to history
exports.updateProfitRule = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { channel } = req.params;
        const { name, percentage, settings } = req.body;
        const adminId = req.user.id;

        await client.query('BEGIN');

        // 1. Get current rule
        const currentRuleResult = await client.query(
            `SELECT * FROM profit_rules WHERE channel = $1 AND is_current = TRUE`,
            [channel]
        );

        if (currentRuleResult.rows.length > 0) {
            const oldRule = currentRuleResult.rows[0];

            // 2. Archive to history
            await client.query(
                `INSERT INTO profit_rule_history (rule_id, snapshot, archived_by, archived_at)
                 VALUES ($1, $2, $3, NOW())`,
                [oldRule.id, oldRule, adminId]
            );

            // 3. Mark old rule as not current
            await client.query(
                `UPDATE profit_rules SET is_current = FALSE, effective_to = NOW() WHERE id = $1`,
                [oldRule.id]
            );
        }

        // 4. Create new current rule
        const newRuleResult = await client.query(
            `INSERT INTO profit_rules (channel, rule_name, percentage, settings, is_current, created_by, created_at, effective_from)
             VALUES ($1, $2, $3, $4, TRUE, $5, NOW(), NOW()) RETURNING *`,
            [channel, name || `${channel} Update`, percentage, settings || {}, adminId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Profit rule updated successfully', rule: newRuleResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating profit rule:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};

// Get profit rule history
exports.getProfitRuleHistory = async (req, res) => {
    try {
        const { channel } = req.params;
        const result = await db.query(
            `SELECT h.*, u.full_name as changed_by
             FROM profit_rule_history h
             JOIN profit_rules r ON h.rule_id = r.id
             LEFT JOIN users u ON h.archived_by = u.id
             WHERE r.channel = $1
             ORDER BY h.archived_at DESC`,
            [channel]
        );

        res.json({ history: result.rows });
    } catch (error) {
        console.error('Error fetching profit rule history:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
