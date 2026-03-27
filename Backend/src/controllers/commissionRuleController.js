const db = require('../config/db');

// Create a new commission rule
exports.createRule = async (req, res) => {
    try {
        const { name, description, percentage, type, status } = req.body;
        
        if (!name || percentage === undefined) {
            return res.status(400).json({ error: 'Name and percentage are required' });
        }
        
        const result = await db.query(
            `INSERT INTO commission_rules (name, description, percentage, type, status)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, description || null, percentage, type || 'category', status || 'active']
        );
        
        res.status(201).json({ 
            message: 'Commission rule created', 
            rule: result.rows[0] 
        });
    } catch (error) {
        console.error('Error creating commission rule:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all rules
exports.getRules = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM commission_rules ORDER BY created_at DESC`);
        res.json({ rules: result.rows });
    } catch (error) {
        console.error('Error fetching commission rules:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a rule
exports.updateRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, percentage, type, status } = req.body;
        
        const existing = await db.query('SELECT * FROM commission_rules WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        const rule = existing.rows[0];
        
        const result = await db.query(
            `UPDATE commission_rules 
             SET name = $1, description = $2, percentage = $3, type = $4, status = $5, updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [
              name !== undefined ? name : rule.name,
              description !== undefined ? description : rule.description,
              percentage !== undefined ? percentage : rule.percentage,
              type !== undefined ? type : rule.type,
              status !== undefined ? status : rule.status,
              id
            ]
        );
        
        res.json({ message: 'Commission rule updated', rule: result.rows[0] });
    } catch (error) {
        console.error('Error updating commission rule:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a rule
exports.deleteRule = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM commission_rules WHERE id = $1`, [id]);
        res.json({ message: 'Commission rule deleted successfully' });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({ error: 'Cannot delete rule as it is currently assigned to one or more categories/products' });
        } else {
            console.error('Error deleting commission rule:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};
