const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminProfileRoutes = require('./routes/adminProfileRoutes');
const coreBodyProfileRoutes = require('./routes/coreBodyProfileRoutes');
const businessmanProfileRoutes = require('./routes/businessmanProfileRoutes');
const dealerProfileRoutes = require('./routes/dealerProfileRoutes');
const stockPointProfileRoutes = require('./routes/stockPointProfileRoutes');
const unifiedProfileRoutes = require('./routes/unifiedProfileRoutes');
const productCatalogRoutes = require('./routes/productCatalogRoutes');
const roleRoutes = require('./routes/roleRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const loginAttemptsRoutes = require('./routes/loginAttemptsRoutes');
const businessmanInvestmentRoutes = require('./routes/businessmanInvestmentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const geographyRoutes = require('./routes/geographyRoutes');
const stockRequestRoutes = require('./routes/stockRequestRoutes');
const commissionRuleRoutes = require('./routes/commissionRuleRoutes');
const fulfillmentRoutes = require('./routes/fulfillmentRoutes');
const returnComplaintRoutes = require('./routes/returnComplaintRoutes');
const walletRoutes = require('./routes/walletRoutes');
const cartRoutes = require('./routes/cartRoutes');
const referralRoutes = require('./routes/referralRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:8080','http://localhost:8081'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-profile', adminProfileRoutes);
app.use('/api/corebody-profile', coreBodyProfileRoutes);
app.use('/api/businessman-profile', businessmanProfileRoutes);
app.use('/api/dealer-profile', dealerProfileRoutes);
app.use('/api/stockpoint-profile', stockPointProfileRoutes);
app.use('/api/profile', unifiedProfileRoutes);
app.use('/api/catalog', productCatalogRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/login-attempts', loginAttemptsRoutes);
app.use('/api/businessman-investments', businessmanInvestmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/geography', geographyRoutes);
app.use('/api/stock-requests', stockRequestRoutes);
app.use('/api/commission-rules', commissionRuleRoutes);
app.use('/api/fulfillments', fulfillmentRoutes);
app.use('/api/customer-service', returnComplaintRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'FTS Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {},
    });
});

module.exports = app;
