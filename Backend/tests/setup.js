// Global Jest Setup / Mocks
jest.mock('uuid', () => ({
    v4: () => 'mocked-uuid-' + Math.random().toString(36).substr(2, 9)
}));

// Mocking pg pool for database-less testing
jest.mock('../src/config/db', () => {
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(),
    };
    return { 
        pool: mPool,
        query: mPool.query,
    };
});

// Mocking external services if any
jest.mock('../src/services/walletService', () => ({
    creditWallet: jest.fn().mockResolvedValue({ success: true }),
    debitWallet: jest.fn().mockResolvedValue({ success: true }),
}));

global.mockDb = require('../src/config/db');

// Utility to reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation that handles transactions automatically
    const { pool } = require('../src/config/db');
    pool.query.mockImplementation((text) => {
        const q = typeof text === 'string' ? text.toUpperCase() : '';
        if (q.includes('BEGIN') || q.includes('COMMIT') || q.includes('ROLLBACK')) {
            return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({ rows: [], rowCount: 0 });
    });
    
    pool.connect.mockImplementation(() => {
        const client = {
            query: jest.fn((text) => {
                const q = typeof text === 'string' ? text.toUpperCase() : '';
                if (q.includes('BEGIN') || q.includes('COMMIT') || q.includes('ROLLBACK')) {
                    return Promise.resolve({ rowCount: 1 });
                }
                return Promise.resolve({ rows: [], rowCount: 0 });
            }),
            release: jest.fn()
        };
        return Promise.resolve(client);
    });
});
