import api from './api';

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  slip_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

export interface UserWalletBalance {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role_code: string;
  is_approved: boolean;
  main_balance: number;
  referral_balance: number;
  main_frozen: boolean;
  main_wallet_id: string;
}

export const walletApi = {
  // User Actions
  setTransactionPin: async (pin: string) => {
    const response = await api.post('/wallet/me/set-pin', { pin });
    return response.data;
  },

  submitDepositRequest: async (data: {
    amount: number;
    payment_method: string;
    transaction_ref?: string;
    slip_url?: string;
  }) => {
    const response = await api.post('/wallet/me/deposit-request', data);
    return response.data;
  },

  getMyDepositRequests: async () => {
    const response = await api.get('/wallet/me/deposit-requests');
    return response.data;
  },

  getMyTransactions: async (type?: string, page: number = 1, limit: number = 50) => {
    const response = await api.get('/wallet/me/transactions', { params: { type, page, limit } });
    return response.data;
  },

  // Admin Actions
  getAllDepositRequests: async (status: string = 'pending') => {
    const response = await api.get(`/wallet/admin/deposit-requests?status=${status}`);
    return response.data;
  },

  getAllUserWallets: async (search: string = '', page: number = 1, limit: number = 50) => {
    const response = await api.get('/wallet/admin/user-wallets', { 
      params: { search, page, limit } 
    });
    return response.data as { users: UserWalletBalance[], total: number, page: number, limit: number };
  },

  updateDepositStatus: async (id: string, status: 'approved' | 'rejected', admin_note?: string) => {
    const response = await api.put(`/wallet/admin/deposit-requests/${id}/status`, {
      status,
      admin_note
    });
    return response.data;
  }
};

export default walletApi;
