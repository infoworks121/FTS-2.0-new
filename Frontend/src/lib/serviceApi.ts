import api from './api';

export interface ServiceFormData {
  name: string;
  description?: string;
  categoryId: string;
  thumbnailUrl?: string;
  mrp: number;
  basePrice: number;
  sellingPrice: number;
  serviceType?: string;
  deliveryMode?: string;
  durationMinutes?: number;
  requiresBooking?: boolean;
}

export const serviceApi = {
  // Get all services
  getAll: async () => {
    const res = await api.get('/catalog/services');
    return res.data;
  },

  // Create service
  create: async (data: ServiceFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      category_id: data.categoryId,
      thumbnail_url: data.thumbnailUrl,
      mrp: data.mrp,
      base_price: data.basePrice,
      selling_price: data.sellingPrice,
      service_type: data.serviceType,
      delivery_mode: data.deliveryMode,
      duration_minutes: data.durationMinutes,
      requires_booking: data.requiresBooking,
    };
    const res = await api.post('/catalog/services', payload);
    return res.data;
  },

  // Get categories for dropdown
  getCategories: async () => {
    const res = await api.get('/catalog/categories');
    return res.data;
  },
};
