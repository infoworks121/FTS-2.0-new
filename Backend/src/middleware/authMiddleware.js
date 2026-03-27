const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if session is revoked
            const sessionResult = await db.query(
                'SELECT * FROM user_sessions WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
                [token]
            );

            if (sessionResult.rows.length === 0) {
                return res.status(401).json({ message: 'Session expired or revoked' });
            }

            // Add user from payload
            req.user = decoded;

            return next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role_code)) {
            return res.status(403).json({
                message: `User role ${req.user.role_code} is not authorized to access this route`,
            });
        }
        next();
    };
};

const adminOnly = (req, res, next) => {
    if (req.user.role_code !== 'admin') {
        return res.status(403).json({ message: 'Admin access only' });
    }
    next();
};

// Roles allowed to issue stock:
// admin → anyone
// core_body_a, core_body_b → businessman (B2B only)
// businessman (stock_point type) → customer (B2C only)
// dealer → only if admin has approved via dealer_stock_permissions
const canIssueStock = async (req, res, next) => {
    const allowed = ['admin', 'core_body_a', 'core_body_b', 'businessman', 'dealer'];
    if (!allowed.includes(req.user.role_code)) {
        return res.status(403).json({
            message: `Role '${req.user.role_code}' is not authorized to issue stock`,
        });
    }
    // Dealer: check admin approval in dealer_stock_permissions
    if (req.user.role_code === 'dealer') {
        try {
            const result = await db.query(
                'SELECT id FROM dealer_stock_permissions WHERE dealer_id = $1 AND is_active = true',
                [req.user.id]
            );
            if (result.rows.length === 0) {
                return res.status(403).json({
                    message: 'Dealer is not approved by Admin to issue stock',
                });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Permission check failed' });
        }
    }
    next();
};

const authenticate = protect;
module.exports = { protect, authenticate, authorize, adminOnly, canIssueStock };
