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
  }
};

export default dealerApi;
