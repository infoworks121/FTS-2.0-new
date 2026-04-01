import api from "@/lib/api";

export interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_earned: string | number;
  referral_link: string;
}

export interface ReferredUser {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  role_label: string;
}

export interface ReferralEarningHistory {
  id: string;
  order_id: string;
  gross_amount: string | number;
  status: string;
  created_at: string;
  referred_user_name: string;
}

export interface AdminReferredUser {
  id: string;
  created_at: string;
  referrer_name: string;
  referrer_phone: string;
  referred_name: string;
  referred_phone: string;
  referred_id: string;
  referred_role: string;
}

export interface AdminReferralEarning extends ReferralEarningHistory {
  referrer_name: string;
}

export interface AdminReferralStats {
  total_referrals: number;
  total_commissions_paid: string | number;
}

const referralApi = {
  getStats: async (): Promise<ReferralStats> => {
    const response = await api.get('/referral/stats');
    return response.data;
  },

  getList: async (): Promise<ReferredUser[]> => {
    const response = await api.get('/referral/list');
    return response.data;
  },

  getEarnings: async (): Promise<ReferralEarningHistory[]> => {
    const response = await api.get('/referral/earnings');
    return response.data;
  },

  // Admin Methods
  adminGetList: async (): Promise<AdminReferredUser[]> => {
    const response = await api.get('/referral/admin/list');
    return response.data;
  },

  adminGetEarnings: async (): Promise<AdminReferralEarning[]> => {
    const response = await api.get('/referral/admin/admin-earnings');
    return response.data;
  },

  adminGetStats: async (): Promise<AdminReferralStats> => {
    const response = await api.get('/referral/admin/stats');
    return response.data;
  }
};

export default referralApi;
