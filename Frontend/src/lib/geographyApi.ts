import api from './api';

export interface DistrictSummary {
  id: number;
  name: string;
  state_name: string;
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

export const geographyApi = {
  getDistrictsSummary: async (): Promise<DistrictsSummaryResponse> => {
    const response = await api.get('/geography/districts/summary');
    return response.data;
  },
};

export default geographyApi;
