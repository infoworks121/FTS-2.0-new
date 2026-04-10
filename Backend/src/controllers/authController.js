const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { generateToken } = require('../utils/token');
const { sendVerificationEmail } = require('../utils/email');

const register = async (req, res) => {
    const { phone, email, full_name, password, role_code, district_id: body_district_id, subdivision_id, businessman_type, investment_amount, installment_count, installment_amounts, referral_code_used, kycDocuments } = req.body;

    try {
        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE phone = $1 OR (email = $2 AND email IS NOT NULL)', [phone, email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this phone or email' });
        }

        // Get role_id
        const roleResult = await db.query('SELECT id FROM user_roles WHERE role_code = $1', [role_code || 'customer']);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role code' });
        }
        const role_id = roleResult.rows[0].id;

        const final_district_id = body_district_id || null;
        const final_subdivision_id = subdivision_id || null;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Generate unique referral code for eligible roles (Retailer A, Core Body A, Core Body B)
        let final_referral_code = null;
        if (
            (role_code === 'businessman' && businessman_type === 'retailer_a') ||
            role_code === 'core_body_a' ||
            role_code === 'core_body_b'
        ) {
            final_referral_code = `FTS${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }

        // Insert user
        const newUser = await db.query(
            `INSERT INTO users (phone, email, full_name, password_hash, role_id, referral_code, district_id, subdivision_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, phone, email, full_name, role_id`,
            [phone, email, full_name, password_hash, role_id, final_referral_code, final_district_id, final_subdivision_id]
        );

        const user = newUser.rows[0];

        // Create core_body profile if role is core_body_a or core_body_b
        if ((role_code === 'core_body_a' || role_code === 'core_body_b') && investment_amount) {
            if (role_code === 'core_body_a' && Number(investment_amount) !== 100000) {
                return res.status(400).json({ message: 'Core Body A investment must be exactly ₹100,000.' });
            }
            if (role_code === 'core_body_b' && (Number(investment_amount) < 50000 || Number(investment_amount) > 250000)) {
                return res.status(400).json({ message: 'Core Body B investment must be between ₹50,000 and ₹250,000.' });
            }

            const coreBodyResult = await db.query(
                `INSERT INTO core_body_profiles (user_id, type, district_id, investment_amount, installment_count)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [
                    user.id,
                    role_code === 'core_body_a' ? 'A' : 'B',
                    final_district_id,
                    investment_amount,
                    installment_count || 1,
                ]
            );

            const coreBodyId = coreBodyResult.rows[0].id;

            // Insert installment records
            if (installment_amounts && installment_amounts.length > 0) {
                for (let i = 0; i < installment_amounts.length; i++) {
                    await db.query(
                        `INSERT INTO core_body_installments (core_body_id, installment_no, amount, status)
                         VALUES ($1, $2, $3, 'pending')`,
                        [coreBodyId, i + 1, installment_amounts[i]]
                    );
                }
            }
        }

        // Create businessman profile if role is businessman
        if (role_code === 'businessman' && businessman_type) {
            const advanceAmount = businessman_type === 'retailer_a' ? (investment_amount || 0) : 0;
            const bpResult = await db.query(
                'INSERT INTO businessman_profiles (user_id, type, district_id, advance_amount) VALUES ($1, $2, $3, $4) RETURNING id',
                [user.id, businessman_type, final_district_id, advanceAmount]
            );

            // Insert installment records for retailer_a
            if (businessman_type === 'retailer_a' && investment_amount && installment_amounts && installment_amounts.length > 0) {
                const bpId = bpResult.rows[0].id;
                for (let i = 0; i < installment_amounts.length; i++) {
                    await db.query(
                        `INSERT INTO businessman_investments (businessman_id, installment_no, amount, status)
                         VALUES ($1, $2, $3, 'pending')`,
                        [bpId, i + 1, installment_amounts[i]]
                    );
                }
            }
        }

        // Initialize 'main' wallet for every new user
        const typeRes = await db.query(`SELECT id FROM wallet_types WHERE type_code = 'main'`);
        if (typeRes.rows.length > 0) {
            await db.query(
                `INSERT INTO wallets (user_id, wallet_type_id, balance) VALUES ($1, $2, 0)`,
                [user.id, typeRes.rows[0].id]
            );
        }

        // --- REFERRAL SYSTEM LOGIC (Eligible for Retailer A only) ---
        if (final_referral_code) {
            // 1. Initialize referral_links for the new user
            await db.query(
                `INSERT INTO referral_links (user_id, referral_code) VALUES ($1, $2)`,
                [user.id, final_referral_code]
            );
        }

        // 2. Handle referral_code_used (Optional)
        if (referral_code_used) {
            const referrerResult = await db.query(
                `SELECT id FROM users WHERE referral_code = $1`,
                [referral_code_used]
            );

            if (referrerResult.rows.length > 0) {
                const referrerId = referrerResult.rows[0].id;

                // Insert into referral_registrations
                await db.query(
                    `INSERT INTO referral_registrations (referrer_id, referred_id, referral_code_used)
                     VALUES ($1, $2, $3)`,
                    [referrerId, user.id, referral_code_used]
                );

                // Increment total_referrals count
                await db.query(
                    `UPDATE referral_links SET total_referrals = total_referrals + 1 WHERE user_id = $1`,
                    [referrerId]
                );
            }
        }

        // --- KYC DOCUMENTS ---
        if (kycDocuments && kycDocuments.length > 0) {
            for (const doc of kycDocuments) {
                if (doc.doc_type && doc.doc_url) {
                    const doc_number_hash = doc.doc_number ? crypto.createHash('sha256').update(doc.doc_number).digest('hex') : null;
                    const kycRes = await db.query(
                        `INSERT INTO kyc_documents (user_id, doc_type, doc_url, doc_number_hash, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
                        [user.id, doc.doc_type, doc.doc_url, doc_number_hash]
                    );
                    await db.query(
                        'INSERT INTO kyc_audit_log (user_id, doc_id, action, performed_by, new_status, note) VALUES ($1, $2, $3, $4, $5, $6)',
                        [user.id, kycRes.rows[0].id, 'UPLOAD', user.id, 'pending', 'KYC document uploaded during registration']
                    );
                }
            }
        }

        const token = generateToken({ id: user.id, role_code });

        res.status(201).json({
            message: 'Registration successful. Your account is pending admin approval.',
            user,
            token,
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};

const login = async (req, res) => {
    const { identifier, password, panel } = req.body;

    try {
        console.log('Login attempt:', { identifier, panel });

        const userResult = await db.query(
            `SELECT u.*, r.role_code 
       FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.phone = $1 OR u.email = $1`,
            [identifier]
        );

        if (userResult.rows.length === 0) {
            console.log('User not found:', identifier);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        console.log('User found:', { id: user.id, role: user.role_code });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log('Password mismatch for:', identifier);
            await db.query(
                'INSERT INTO login_attempts (target, target_type, ip_address, success, panel, failure_reason) VALUES ($1, $2, $3, $4, $5, $6)',
                [identifier, identifier.includes('@') ? 'email' : 'phone', req.ip, false, panel, 'Invalid password']
            );
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            console.log('Account deactivated:', identifier);
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        if (!user.is_approved) {
            console.log('Account pending approval:', identifier);
            return res.status(403).json({ message: 'Your account is pending admin approval' });
        }

        // Log success attempt
        await db.query(
            'INSERT INTO login_attempts (target, target_type, ip_address, success, panel) VALUES ($1, $2, $3, $4, $5)',
            [identifier, identifier.includes('@') ? 'email' : 'phone', req.ip, true, panel]
        );

        // Track device and session
        const deviceFingerprint = req.get('user-agent') || 'unknown'; // Simplified fingerprint

        try {
            await db.query(
                `INSERT INTO user_devices (user_id, device_fingerprint, device_type, browser)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, device_fingerprint) 
         DO UPDATE SET last_seen_at = NOW()`,
                [user.id, deviceFingerprint, 'desktop', deviceFingerprint.split(' ')[0]]
            );
        } catch (deviceErr) {
            console.warn('Could not log device fingerprint', deviceErr);
        }

        // Create session
        const token = generateToken({ id: user.id, role_code: user.role_code });
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Check if user has set a transaction PIN in their wallet
        const walletPinRes = await db.query(
            'SELECT transaction_pin FROM wallets WHERE user_id = $1 LIMIT 1',
            [user.id]
        );
        const has_transaction_pin = walletPinRes.rows.length > 0 && walletPinRes.rows[0].transaction_pin !== null;

        // Fetch profile subtypes if applicable
        let businessman_type = null;
        let core_body_type = null;

        if (user.role_code === 'businessman') {
            const bProfile = await db.query('SELECT type FROM businessman_profiles WHERE user_id = $1', [user.id]);
            if (bProfile.rows.length > 0) businessman_type = bProfile.rows[0].type;
        } else if (user.role_code.startsWith('core_body')) {
            const cProfile = await db.query('SELECT type FROM core_body_profiles WHERE user_id = $1', [user.id]);
            if (cProfile.rows.length > 0) core_body_type = cProfile.rows[0].type;
        }

        await db.query(
            'INSERT INTO user_sessions (user_id, panel, token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
            [user.id, panel || 'unknown', token, req.ip, req.get('user-agent'), expires_at]
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                full_name: user.full_name,
                role_code: user.role_code,
                businessman_type,
                core_body_type,
                has_transaction_pin,
            },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        await db.query(
            'UPDATE user_sessions SET revoked = TRUE, revoked_at = NOW() WHERE token_hash = $1',
            [token]
        );
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user_id = req.user.id;

    try {
        const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [user_id]);
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const new_password_hash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [new_password_hash, user_id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const userResult = await db.query(
            `SELECT u.id, u.phone, u.email, u.full_name, r.role_code, u.is_active, u.created_at,
             COALESCE((SELECT transaction_pin IS NOT NULL FROM wallets WHERE user_id = u.id LIMIT 1), false) as has_transaction_pin
       FROM users u 
       JOIN user_roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendOTP = async (req, res) => {
    const { target, target_type, purpose } = req.body;

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'INSERT INTO otp_verifications (target, target_type, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [target, target_type, otp_hash, purpose, expires_at]
        );

        if (target_type === 'email') {
            await sendVerificationEmail(target, otp);
        }

        console.log(`OTP for ${target}: ${otp}`);

        res.json({ message: `OTP sent to ${target_type}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during OTP generation' });
    }
};

const verifyOTP = async (req, res) => {
    const { target, otp, purpose } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM otp_verifications WHERE target = $1 AND purpose = $2 AND verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [target, purpose]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        const otpData = result.rows[0];
        const isMatch = await bcrypt.compare(otp, otpData.otp_hash);

        if (!isMatch) {
            await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [otpData.id]);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await db.query('UPDATE otp_verifications SET verified = TRUE, verified_at = NOW() WHERE id = $1', [otpData.id]);

        if (purpose === 'email_verification') {
            await db.query('UPDATE users SET is_email_verified = TRUE WHERE email = $1', [target]);
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    sendOTP,
    verifyOTP,
    changePassword,
};
