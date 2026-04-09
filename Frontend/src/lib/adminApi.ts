import api from './api';

export interface AdminDashboardStats {
  kpis: {
    total_revenue: number;
    trust_fund: number;
    active_districts: number;
    fraud_alerts: number;
  };
  profitData: {
    month: string;
    revenue: number;
    trust: number;
    commission?: number;
  }[];
  districtData: {
    name: string;
    businessmen: number;
    orders: number;
    revenue: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    user: string;
    amount: string;
    status: 'active' | 'pending' | 'warning' | 'suspended';
    time: string;
  }[];
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },
  
  getPendingUsers: async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },
  
  approveUser: async (userId: string) => {
    const response = await api.post(`/admin/approve-user/${userId}`);
    return response.data;
  },
  
  rejectUser: async (userId: string) => {
    const response = await api.delete(`/admin/reject-user/${userId}`);
    return response.data;
  },

  getProfitRule: async (channel: string) => {
    const response = await api.get(`/admin/profit-rules/${channel}`);
    return response.data;
  },

  updateProfitRule: async (channel: string, data: { name?: string; percentage: number }) => {
    const response = await api.post(`/admin/profit-rules/${channel}`, data);
    return response.data;
  },

  getProfitRuleHistory: async (channel: string) => {
    const response = await api.get(`/admin/profit-rules/${channel}/history`);
    return response.data;
  },

  getPendingCoreBodyInstallments: async () => {
    const response = await api.get('/admin/corebodies/installments/pending');
    return response.data;
  },

  approveCoreBodyInstallment: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.put(`/admin/corebodies/installments/${id}/approve`, { action });
    return response.data;
  },

  getPendingDeposits: async () => {
    const response = await api.get('/wallet/admin/deposit-requests?status=pending');
    return response.data;
  },

  updateDepositStatus: async (id: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const response = await api.put(`/wallet/admin/deposit-requests/${id}/status`, { status, admin_note: adminNote });
    return response.data;
  }
};

export default adminApi;
