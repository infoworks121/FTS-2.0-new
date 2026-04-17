import api from './api';

export interface ReferralEarning {
  id: string;
  order_id: string;
  gross_amount: string;
  status: string;
  created_at: string;
  referrer_name: string;
  referred_user_name: string;
}

export interface AdminReferralStats {
  available_balance: string;
  pending_balance: string;
  released_this_month: string;
  fraud_counts: number;
  total_referrals: number;
}

export const referralApi = {
  // Admin Endpoints
  getAdminStats: async () => {
    const response = await api.get('/referral/admin/stats');
    return response.data as AdminReferralStats;
  },

  getGlobalEarnings: async () => {
    const response = await api.get('/referral/admin/admin-earnings');
    return response.data as ReferralEarning[];
  },

  getAllReferrals: async () => {
    const response = await api.get('/referral/admin/list');
    return response.data;
  }
};

export default referralApi;
