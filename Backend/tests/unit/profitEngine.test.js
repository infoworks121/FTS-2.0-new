const profitEngine = require('../../src/services/profitEngineService');
const { pool } = require('../../src/config/db');
const walletService = require('../../src/services/walletService');

describe('Profit Engine Unit Tests', () => {
    let client;

    beforeEach(() => {
        client = {
            query: jest.fn((text) => {
                const q = text.toUpperCase();
                if (q.includes('FROM ORDERS')) return Promise.resolve({ rows: [{ id: 'order-1', order_type: 'B2B', status: 'delivered', customer_id: 'cust-1', district_id: 'dist-1', order_number: 'FTS-B2B-123' }] });
                if (q.includes('PROFIT_DISTRIBUTION_LOG')) {
                    if (q.includes('INSERT')) return Promise.resolve({ rows: [{ id: 'dist-log-1' }] });
                    return Promise.resolve({ rows: [] });
                }
                if (q.includes('SUM(QUANTITY)')) return Promise.resolve({ rows: [{ total: 2 }] });
                if (q.includes('FROM ORDER_ITEMS')) return Promise.resolve({ rows: [{ id: 'item-1', quantity: 2, unit_price: 100, unit_profit: 20 }] });
                if (q.includes('FROM PROFIT_RULES')) return Promise.resolve({ rows: [{ id: 'rule-1', channel: 'B2B', fts_share_pct: 55, referral_share_pct: 45, trust_fund_pct: 10, admin_pct: 1, core_body_pool_pct: 44 }] });
                if (q.includes('REFERRAL_REGISTRATIONS')) return Promise.resolve({ rows: [{ referrer_id: 'ref-1' }] });
                if (q.includes('FULFILLMENT_ASSIGNMENTS')) return Promise.resolve({ rows: [{ fulfiller_type: 'core_body', source_district_id: 'dist-1', items: [{ quantity: 2 }] }] });
                if (q.includes('FROM CORE_BODY_PROFILES')) return Promise.resolve({ rows: [
                    { id: 'cb-1', user_id: 'u-1', type: 'A', ytd_earnings: 0, annual_cap: 1000000 },
                    { id: 'cb-2', user_id: 'u-2', type: 'B', mtd_earnings: 0, monthly_cap: 50000 }
                ]});
                if (q.includes('BEGIN') || q.includes('COMMIT')) return Promise.resolve({ rowCount: 1 });
                return Promise.resolve({ rows: [], rowCount: 1 });
            }),
            release: jest.fn()
        };
        pool.connect.mockResolvedValue(client);
    });

    it('should correctly distribute profit for a B2B order', async () => {
        await profitEngine.calculateAndDistributeProfit('order-1', 'admin-id');

        // Referral: 40 profit * 45% = 18
        expect(walletService.creditWallet).toHaveBeenCalledWith(
            'ref-1', 'main', 18, 'B2B_Referral_Profit', 'order-1', expect.any(String), client
        );

        // Core Body: 40 * 44% = 17.6 (Pool)
        // Core Body portion (70% of pool) = 17.6 * 0.7 = 12.32
        // Per member (2 members) = 6.16
        expect(walletService.creditWallet).toHaveBeenCalledWith(
            'u-1', 'main', 6.16, 'Inter_District_Share', 'order-1', expect.any(String), client
        );
    });
});
