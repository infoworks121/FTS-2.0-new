const orderController = require('../../src/controllers/orderController');
const { pool } = require('../../src/config/db');
const bcrypt = require('bcryptjs');

describe('Order Routing Unit Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            user: { id: 'bsm-user-id', role_code: 'businessman', subdivision_id: 'sub-1' },
            body: {
                items: [{ product_id: 'p-1', quantity: 10 }],
                payment_method: 'wallet',
                transaction_pin: '1234'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    });

    describe('createB2BOrder - Dealer Routing', () => {
        it('should correctly assign items to a Dealer if is_dealer_routed is true', async () => {
            const client = {
                query: jest.fn((text) => {
                    const q = text.toUpperCase();
                    if (q.includes('PRODUCT_PRICING')) return Promise.resolve({ rows: [{ mrp: 100, selling_price: 80, base_price: 60, product_name: 'Test Product', is_dealer_routed: true }] });
                    if (q.includes('DEALER_PRODUCT_MAP')) return Promise.resolve({ rows: [{ profile_id: 'dealer-1', district_id: 'dist-1' }] });
                    if (q.includes('INVENTORY_BALANCES')) return Promise.resolve({ rows: [{ id: 'inv-1', quantity_on_hand: 50, quantity_reserved: 0 }] });
                    if (q.includes('FROM WALLETS')) return Promise.resolve({ rows: [{ id: 'w-1', balance: 5000, transaction_pin: 'hashed-pin' }] });
                    if (q.includes('INSERT INTO ORDERS')) return Promise.resolve({ rows: [{ id: 'order-1', order_number: 'FTS-B2B-123' }] });
                    if (q.includes('BEGIN') || q.includes('COMMIT')) return Promise.resolve({ rowCount: 1 });
                    return Promise.resolve({ rows: [], rowCount: 1 });
                }),
                release: jest.fn()
            };
            pool.connect.mockResolvedValue(client);

            await orderController.createB2BOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            
            const assignmentCall = client.query.mock.calls.find(call => 
                call[0].includes('INSERT INTO fulfillment_assignments')
            );
            expect(assignmentCall[1]).toContain('dealer');
            expect(assignmentCall[1]).toContain('dealer-1');
        });
    });
});
