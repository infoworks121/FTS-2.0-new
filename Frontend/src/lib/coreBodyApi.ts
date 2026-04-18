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
  getDistrictDealers: async () => {
    const response = await api.get('/corebody-profile/district-dealers');
    return response.data;
  },
  getCoreBodyInventory: async () => {
    const response = await api.get('/corebody-profile/inventory');
    return response.data;
  },
  getCoreBodyStockLedger: async (): Promise<{ ledger: StockLedgerEntry[] }> => {
    const response = await api.get('/corebody-profile/inventory-ledger');
    return response.data;
  },
  blockStock: async (data: { product_id: string; quantity: number; note?: string }) => {
    const response = await api.post('/corebody-profile/block-stock', data);
    return response.data;
  },
  releaseStock: async (data: { product_id: string; quantity: number; note?: string }) => {
    const response = await api.post('/corebody-profile/release-stock', data);
    return response.data;
  },
};

export interface StockLedgerEntry {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_sku: string;
  variant_name: string | null;
  entity_type: string;
  entity_id: string;
  transaction_type: string;
  quantity: string;
  unit: string;
  reference_type: string | null;
  reference_id: string | null;
  note: string;
  created_by: string;
  created_at: string;
}

export interface CoreBodyInventoryItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: string | number;
  reserved: string | number;
}

export default coreBodyApi;
