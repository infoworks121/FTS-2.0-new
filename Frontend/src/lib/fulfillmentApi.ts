import api from './api';

export interface FulfillmentAssignment {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: 'assigned' | 'accepted' | 'dispatched' | 'delivered' | 'cancelled';
  assigned_at: string;
  total_amount: number;
  order_date: string;
}

export const fulfillmentApi = {
  getAssignments: async (status?: string): Promise<{ fulfillments: FulfillmentAssignment[] }> => {
    const params = status ? { status } : {};
    const res = await api.get('/fulfillments', { params });
    return res.data;
  },

  updateStatus: async (assignmentId: string, status: string, trackingData: any = {}) => {
    const res = await api.patch(`/fulfillments/assignments/${assignmentId}/status`, {
      status,
      ...trackingData
    });
    return res.data;
  }
};

export default fulfillmentApi;
