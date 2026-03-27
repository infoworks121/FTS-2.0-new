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
}

export const orderApi = {
  createB2BOrder: async (data: B2BOrderPayload) => {
    const res = await api.post('/orders/b2b', data);
    return res.data;
  },
  
  // Future B2C order support
  createB2COrder: async (data: any) => {
    const res = await api.post('/orders/b2c', data);
    return res.data;
  }
};
