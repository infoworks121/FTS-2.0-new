const express = require('express');
const passport = require('passport');
const { register, login, logout, getMe, sendOTP, verifyOTP, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { generateToken } = require('../utils/token');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  async (req, res) => {
    // Check if new user needs role selection
    if (req.user.isNewUser) {
      return res.redirect(`http://localhost:5173/auth/google/redirect?email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.full_name)}`);
    }

    // Existing user - generate token and redirect
    const roleResult = await require('../config/db').query(
      'SELECT role_code FROM user_roles WHERE id = $1', 
      [req.user.role_id]
    );
    const role_code = roleResult.rows[0].role_code;
    const token = generateToken({ id: req.user.id, role_code });
    
    res.redirect(`http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role_code
    }))}`);  
  }
);

// Complete Google registration with role
router.post('/google/complete', async (req, res) => {
  const { email, full_name, role_code } = req.body;

  try {
    const roleResult = await require('../config/db').query('SELECT id FROM user_roles WHERE role_code = $1', [role_code]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid role code' });
    }
    const role_id = roleResult.rows[0].id;
    const referral_code = `FTS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const phone = `G${Date.now().toString().slice(-9)}`;
    
    const userResult = await require('../config/db').query(
      `INSERT INTO users (email, full_name, role_id, referral_code, is_email_verified, phone) 
       VALUES ($1, $2, $3, $4, TRUE, $5) RETURNING *`,
      [email, full_name, role_id, referral_code, phone]
    );

    const user = userResult.rows[0];
    const token = generateToken({ id: user.id, role_code });

    res.json({
      message: 'Registration completed',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role_code
      },
      token
    });
  } catch (err) {
    console.error('Google complete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
