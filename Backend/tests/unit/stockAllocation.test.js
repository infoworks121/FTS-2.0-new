const stockAllocationController = require('../../src/controllers/stockAllocationController');
const { pool } = require('../../src/config/db');

describe('Stock Allocation Controller - Unit Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            user: { id: 'cb-user-id' },
            body: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        // Reset implementation to the robust one in setup.js if needed
    });

    describe('createPhysicalTransfer', () => {
        it('should successfully initiate a physical transfer from Core Body to Dealer', async () => {
            mockReq.body = {
                to_dealer_id: 'dealer-profile-id',
                product_id: 'product-id',
                quantity: 10,
                note: 'Sample transfer'
            };

            pool.query.mockImplementation((text, params) => {
                if (text.includes('core_body_profiles')) return Promise.resolve({ rows: [{ id: 'cb-profile-id', district_id: 'district-id' }] });
                if (text.includes('dealer_profiles')) return Promise.resolve({ rows: [{ id: 'dealer-profile-id' }] });
                if (text.includes('inventory_balances')) return Promise.resolve({ rows: [{ quantity: 50 }] });
                if (text.toUpperCase().includes('BEGIN') || text.toUpperCase().includes('COMMIT')) return Promise.resolve({ rowCount: 1 });
                return Promise.resolve({ rows: [], rowCount: 1 });
            });

            await stockAllocationController.createPhysicalTransfer(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Physical transfer dispatched successfully"
            }));
        });

        it('should fail if Core Body profile is not found', async () => {
            mockReq.body = { to_dealer_id: 'd-id', product_id: 'p-id', quantity: 10 };
            
            pool.query.mockImplementation((text) => {
                if (text.includes('core_body_profiles')) return Promise.resolve({ rows: [] });
                return Promise.resolve({ rowCount: 1 });
            });

            await stockAllocationController.createPhysicalTransfer(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "Only Core Body can initiate transfers" });
        });
    });

    describe('receivePhysicalTransfer', () => {
        it('should successfully receive stock by dealer', async () => {
            mockReq.user.id = 'dealer-user-id';
            mockReq.params.allocation_id = 'alloc-id';

            pool.query.mockImplementation((text) => {
                if (text.includes('dealer_profiles')) return Promise.resolve({ rows: [{ id: 'dealer-id' }] });
                if (text.includes('stock_allocations')) return Promise.resolve({ rows: [{ id: 'alloc-id', product_id: 'p-id', quantity: 10 }] });
                if (text.toUpperCase().includes('BEGIN') || text.toUpperCase().includes('COMMIT')) return Promise.resolve({ rowCount: 1 });
                return Promise.resolve({ rows: [], rowCount: 1 });
            });

            await stockAllocationController.receivePhysicalTransfer(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: "Stock received and inventoried successfully" });
        });
    });
});
