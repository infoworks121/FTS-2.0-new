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

  getMyOrders: async (type?: string, status?: string) => {
    const res = await api.get('/orders', { params: { order_type: type, status } });
    return res.data;
  },

  cancelOrder: async (orderId: string) => {
    const res = await api.post(`/orders/${orderId}/cancel`);
    return res.data;
  },

  getOrderDetails: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  getRefundRequests: async () => {
    const res = await api.get('/customer-service/returns');
    return res.data;
  },

  getRefundTimeline: async (requestId: string) => {
    const res = await api.get(`/customer-service/returns/${requestId}/timeline`);
    return res.data;
  }
};
