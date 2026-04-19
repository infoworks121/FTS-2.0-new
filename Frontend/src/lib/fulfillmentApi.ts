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
  items: any[]; // New field for partial order details
  is_shortage_fulfillment: boolean; // New field for split orders
}

export const fulfillmentApi = {
  getAssignments: async (status?: string): Promise<{ fulfillments: FulfillmentAssignment[] }> => {
    const params = status ? { status } : {};
    const res = await api.get('/fulfillments', { params });
    return res.data;
  },
  
  getDistrictFulfillments: async (params?: { status?: string, order_type?: string }): Promise<{ fulfillments: FulfillmentAssignment[] }> => {
    const res = await api.get('/fulfillments/district', { params });
    return res.data;
  },

  updateStatus: async (assignmentId: string, status: string, trackingData: any = {}) => {
    // Backend route is PUT /api/fulfillments/:assignment_id/status
    const res = await api.put(`/fulfillments/${assignmentId}/status`, {
      status,
      ...trackingData
    });
    return res.data;
  }
};

export default fulfillmentApi;
