import api from './api';

export interface DealerProfile {
  id: string;
  user_id: string;
  subdivision_id: number;
  subdivision_name: string;
  district_name: string;
  is_active: boolean;
  full_name: string;
  email: string;
  phone: string;
}

export interface DealerProfileResponse {
  profile: DealerProfile;
  products: any[];
}

export const dealerApi = {
  getDealerProfile: async (): Promise<DealerProfileResponse> => {
    const response = await api.get('/dealer-profile/profile');
    return response.data;
  },
  
  getDealerDashboard: async (): Promise<any> => {
    const response = await api.get('/dealer-profile/dashboard');
    return response.data;
  },

  // Admin mapping
  assignProduct: async (dealerId: string, productId: string) => {
    const response = await api.post('/dealer-profile/assign-product', {
      dealer_id: dealerId,
      product_id: productId
    });
    return response.data;
  },

  unassignProduct: async (dealerId: string, productId: string) => {
    const response = await api.post('/dealer-profile/unassign-product', {
      dealer_id: dealerId,
      product_id: productId
    });
    return response.data;
  },

  getAssignedProducts: async (profileId: string) => {
    const response = await api.get(`/dealer-profile/${profileId}/products`);
    return response.data;
  },

  getMyProducts: async () => {
    const response = await api.get('/dealer-profile/my-products');
    return response.data;
  },

  getDealerInsights: async () => {
    const response = await api.get('/dealer-profile/insights');
    return response.data;
  },

  getInventoryLedger: async () => {
    const response = await api.get('/dealer-profile/inventory-ledger');
    return response.data;
  },

  // Demand Signaling (Stock Requests)
  sendDemandSignal: async (data: any) => {
    const response = await api.post('/stock-requests', data);
    return response.data;
  },

  getDemandSignals: async (params?: any) => {
    const response = await api.get('/stock-requests', { params });
    return response.data;
  },

  acknowledgeDemandSignal: async (requestId: string, data: any) => {
    const response = await api.put(`/stock-requests/${requestId}/review`, data);
    return response.data;
  }
};

export default dealerApi;
