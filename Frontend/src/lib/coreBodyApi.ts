import api from './api';

export interface CoreBodySummary {
  id: string;
  name: string;
  type: 'A' | 'B' | 'Dealer';
  district: string;
  district_id: number;
  investment_amount: number;
  ytd_earnings: number;
  annual_cap: number;
  mtd_earnings: number;
  monthly_cap: number;
  is_active: boolean;
  is_approved: boolean;
  status: 'active' | 'warning' | 'cap-reached' | 'inactive';
  cap_usage: number;
  created_at: string;
}

export interface CoreBodiesResponse {
  coreBodies: CoreBodySummary[];
  kpis: {
    total_core_bodies: number;
    type_a: number;
    type_b: number;
    active: number;
    inactive: number;
    cap_warning: number;
    total_investment: number;
    total_earnings: number;
  };
}

export interface CoreBodyInstallment {
  id: string;
  installment_no: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

export interface CoreBodyDetail extends CoreBodySummary {
  profile_id: string;
  phone: string;
  email: string;
  profile_photo_url: string | null;
  state: string;
  activated_at: string | null;
  installment_count: number;
  businessman_count: number;
  installments: CoreBodyInstallment[];
}

export interface CoreBodyDetailResponse {
  profile: CoreBodyDetail;
  earningsHistory: { month: string; amount: number }[];
  recentActivity: {
    id: string;
    action: string;
    amount: number;
    date: string;
    description: string;
    type: 'credit' | 'debit' | 'info';
  }[];
}

export const coreBodyApi = {
  getAllCoreBodies: async (filters: any = {}): Promise<CoreBodiesResponse> => {
    const response = await api.get('/admin/corebodies', { params: filters });
    return response.data;
  },
  getCoreBodyById: async (id: string): Promise<CoreBodyDetailResponse> => {
    const response = await api.get(`/admin/corebodies/${id}`);
    return response.data;
  },
  getMyDashboard: async () => {
    const response = await api.get('/corebody-profile/dashboard');
    return response.data;
  },
  getCoreBodyReports: async () => {
    const response = await api.get('/corebody-profile/reports');
    return response.data;
  },
  updateCoreBodySettings: async (id: string, data: any): Promise<{ message: string }> => {
    const response = await api.put(`/admin/corebodies/${id}/settings`, data);
    return response.data;
  },
  getDistrictUsers: async () => {
    const response = await api.get('/corebody-profile/users');
    return response.data;
  },
  getDirectoryUsers: async () => {
    const response = await api.get('/corebody-profile/directory-users');
    return response.data;
  },
  getDirectoryUserDetail: async (id: string): Promise<any> => {
    const response = await api.get(`/corebody-profile/directory-users/${id}`);
    return response.data;
  },
  getDistrictPerformance: async (): Promise<any> => {
    const response = await api.get('/corebody-profile/district-performance');
    return response.data;
  },
};

export default coreBodyApi;
