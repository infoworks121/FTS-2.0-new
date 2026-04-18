import api from './api';

export interface StockTransfer {
  id: string;
  product_id: string;
  product_name: string;
  from_entity_id: string;
  to_entity_id: string;
  quantity: number;
  status: 'dispatched' | 'received';
  dispatched_at: string;
  received_at?: string;
  note?: string;
  sender_name?: string;
  linked_order_number?: string;
}

export const stockApi = {
  issuePhysicalStock: async (data: { dealer_id: string; product_id: string; quantity: number; note?: string }) => {
    const res = await api.post('/stock/transfer', data);
    return res.data;
  },

  getAggregatedStock: async (productId: string) => {
    const res = await api.get(`/stock/available-stock/${productId}`);
    return res.data;
  },

  getPendingArrivals: async (): Promise<{ arrivals: StockTransfer[] }> => {
    const res = await api.get('/stock/pending-arrivals');
    return res.data;
  },

  confirmReceipt: async (allocationId: string) => {
    const res = await api.put(`/stock/receive/${allocationId}`);
    return res.data;
  },
  
  getCurrentInventory: async () => {
    const res = await api.get('/stock/current-inventory');
    return res.data;
  }
};
