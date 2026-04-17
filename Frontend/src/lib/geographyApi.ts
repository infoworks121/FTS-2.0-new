import api from './api';

export interface DistrictSummary {
  id: number;
  name: string;
  code?: string;
  state_name: string;
  state_id?: number;
  max_limit: number;
  current_count: number;
  core_body_count_a: number;
  core_body_count_b: number;
  total_orders: number;
  total_revenue: number;
  is_active: boolean;
}

export interface DistrictsSummaryResponse {
  districts: DistrictSummary[];
  kpiData: {
    totalDistricts: number;
    activeDistricts: number;
    totalCoreBodies: number;
    totalRevenue: number;
    avgOrdersPerDistrict: number;
  };
}

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface DistrictPerformanceResponse {
  districtInfo: {
    id: number;
    name: string;
    state: string;
    coreBodyCountA: number;
    coreBodyCountB: number;
    maxLimit: number;
    totalOrders: number;
    totalRevenue: number;
    status: 'active' | 'inactive';
  };
  revenueTrend: {
    month: string;
    b2b: number;
    b2c: number;
  }[];
  ordersTrend: {
    month: string;
    orders: number;
  }[];
  coreBodies: {
    id: string;
    name: string;
    type: 'A' | 'B';
    investment: number;
    earnings: number;
    status: 'active' | 'inactive';
    lastActive: string;
  }[];
  weeklySnapshot?: number[][];
}

export interface GlobalDistrictPerformance {
  id: number;
  name: string;
  state: string;
  total_revenue: number;
  total_orders: number;
  active_cb: number;
  max_cb: number;
  growth: string;
}

export interface SubdivisionDealers {
  id: number;
  name: string;
  dealers: {
    id: string;
    userId: string;
    name: string;
    phone: string;
    status: 'active' | 'inactive';
    productCount: number;
  }[];
}

export const geographyApi = {
  getDistrictsSummary: async (): Promise<DistrictsSummaryResponse> => {
    const response = await api.get('/geography/districts/summary');
    return response.data;
  },

  getStates: async (): Promise<State[]> => {
    const response = await api.get('/geography/states');
    return response.data;
  },

  getDistrict: async (id: number | string): Promise<DistrictSummary> => {
    const response = await api.get(`/geography/districts/${id}`);
    return response.data;
  },

  getDistrictPerformance: async (id: number | string): Promise<DistrictPerformanceResponse> => {
    const response = await api.get(`/geography/districts/${id}/performance`);
    return response.data;
  },

  getDistrictDealers: async (id: number | string): Promise<SubdivisionDealers[]> => {
    const response = await api.get(`/geography/districts/${id}/dealers`);
    return response.data;
  },

  getGlobalPerformance: async (): Promise<GlobalDistrictPerformance[]> => {
    const response = await api.get('/geography/districts/performance/global');
    return response.data;
  },

  createDistrict: async (data: any) => {
    const response = await api.post('/geography/districts', data);
    return response.data;
  },

  updateDistrict: async (id: number | string, data: any) => {
    const response = await api.put(`/geography/districts/${id}`, data);
    return response.data;
  },

  getSubdivisionsByDistrict: async (districtId: number | string): Promise<any[]> => {
    const response = await api.get(`/geography/districts/${districtId}/subdivisions`);
    return response.data;
  },
};

export default geographyApi;
