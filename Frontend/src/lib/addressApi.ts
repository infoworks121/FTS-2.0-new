import api from "./api";

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const addressApi = {
  getAddresses: async () => {
    const response = await api.get("/addresses");
    return response.data.addresses as UserAddress[];
  },

  addAddress: async (data: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">) => {
    const response = await api.post("/addresses", data);
    return response.data.address as UserAddress;
  },

  updateAddress: async (id: string, data: Partial<UserAddress>) => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data.address as UserAddress;
  },

  deleteAddress: async (id: string) => {
    await api.delete(`/addresses/${id}`);
  },

  setDefault: async (id: string) => {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data.address as UserAddress;
  }
};
