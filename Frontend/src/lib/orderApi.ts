import api from './api';

export interface B2BOrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface B2BOrderPayload {
  items: B2BOrderItem[];
  payment_method?: string;
  notes?: string;
  district_id?: number;
  pincode_id?: number;
  delivery_address?: any;
  transaction_pin?: string;
  preferred_fulfiller?: {
    id: string;
    type: string;
  };
}

export const orderApi = {
  getBusinessmanProfile: async () => {
    const res = await api.get('/auth/me'); // Using /auth/me to get the context including district_id
    return res.data;
  },
  
  createB2BOrder: async (data: B2BOrderPayload) => {
    const res = await api.post('/orders/b2b', data);
    return res.data;
  },
  
  // Future B2C order support
  createB2COrder: async (data: any) => {
    const res = await api.post('/orders/b2c', data);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  getOrderDetails: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  }
};
