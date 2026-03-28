import api from './api';

export interface CartItem {
  id: string; // Product ID
  name: string;
  category: string;
  image: string;
  basePrice: number;
  quantity: number;
  stock: number;
}

export const cartApi = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data; // { items: CartItem[] }
  },

  addToCart: async (productId: string, quantity: number) => {
    const res = await api.post('/cart', { id: productId, quantity });
    return res.data;
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const res = await api.put(`/cart/${productId}`, { quantity });
    return res.data;
  },

  removeFromCart: async (productId: string) => {
    const res = await api.delete(`/cart/${productId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data;
  }
};
