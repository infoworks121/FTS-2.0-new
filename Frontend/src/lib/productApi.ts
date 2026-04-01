import api from './api';
import { ProductFormData } from '@/types/product';

export interface AdminProductFilters {
  search?: string;
  category_id?: string;
  type?: string;
  status?: string;
  min_price?: string;
  max_price?: string;
  min_margin?: string;
  page?: number;
  limit?: number;
}

export const productApi = {
  // Get all products with filters
  getAll: async (filters: AdminProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 'all') {
        params.append(key, String(val));
      }
    });
    const res = await api.get(`/catalog/admin/products?${params.toString()}`);
    return res.data;
  },

  // Get single product
  getById: async (id: string) => {
    const res = await api.get(`/catalog/admin/products/${id}`);
    return res.data;
  },

  // Create product
  create: async (data: ProductFormData & { status?: string }) => {
    const payload = {
      name: data.name,
      sku: data.sku,
      category_id: data.categoryId,
      product_type: data.type,
      base_price: data.basePrice,
      cost_price: data.costPrice,
      min_margin_percent: data.minMarginPercent,
      stock_required: data.stockRequired,
      stock_quantity: data.stockQuantity ?? 0,
      is_digital: data.isDigital,
      is_service: data.isService,
      description: data.description,
      thumbnail_url: data.thumbnailUrl,
      image_urls: data.imageUrls,
      status: data.status ?? 'draft',
    };
    const res = await api.post('/catalog/admin/products', payload);
    return res.data;
  },

  // Update product
  update: async (id: string, data: Partial<ProductFormData> & { status?: string }) => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.categoryId !== undefined) payload.category_id = data.categoryId;
    if (data.type !== undefined) payload.product_type = data.type;
    if (data.basePrice !== undefined) payload.base_price = data.basePrice;
    if (data.costPrice !== undefined) payload.cost_price = data.costPrice;
    if (data.minMarginPercent !== undefined) payload.min_margin_percent = data.minMarginPercent;
    if (data.stockRequired !== undefined) payload.stock_required = data.stockRequired;
    if (data.stockQuantity !== undefined) payload.stock_quantity = data.stockQuantity;
    if (data.isDigital !== undefined) payload.is_digital = data.isDigital;
    if (data.isService !== undefined) payload.is_service = data.isService;
    if (data.description !== undefined) payload.description = data.description;
    if (data.thumbnailUrl !== undefined) payload.thumbnail_url = data.thumbnailUrl;
    if (data.imageUrls !== undefined) payload.image_urls = data.imageUrls;
    if (data.status !== undefined) payload.status = data.status;
    const res = await api.put(`/catalog/admin/products/${id}`, payload);
    return res.data;
  },

  // Delete (archive) product
  delete: async (id: string) => {
    const res = await api.delete(`/catalog/admin/products/${id}`);
    return res.data;
  },

  // Get categories for dropdown
  getCategories: async () => {
    const res = await api.get('/catalog/categories');
    return res.data;
  },

  // Get commission rules
  getCommissionRules: async () => {
    const res = await api.get('/commission-rules');
    return res.data;
  },
  createCommissionRule: async (data: any) => {
    const res = await api.post('/commission-rules', data);
    return res.data;
  },
  updateCommissionRule: async (id: string, data: any) => {
    const res = await api.put(`/commission-rules/${id}`, data);
    return res.data;
  },
  deleteCommissionRule: async (id: string) => {
    const res = await api.delete(`/commission-rules/${id}`);
    return res.data;
  },

  // Category mutations
  createCategory: async (data: any) => {
    const res = await api.post('/catalog/categories', data);
    return res.data;
  },
  updateCategory: async (id: string, data: any) => {
    const res = await api.put(`/catalog/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string) => {
    const res = await api.delete(`/catalog/categories/${id}`);
    return res.data;
  },
  
  // Market Catalog (Issued Products)
  getIssuedProducts: async (params: { category_id?: string; search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 'all') {
        query.append(key, String(val));
      }
    });
    const res = await api.get(`/catalog/issued-products?${query.toString()}`);
    return res.data;
  },
};
