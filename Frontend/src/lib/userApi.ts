import api from "./api";

export interface EntryModeUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  earnings: number;
  status: "active" | "inactive" | "suspended" | "pending";
  referralSource: string;
  linkedHub: string | null;
  lastTransaction: string | null;
  inactivityDays: number;
  isUpgradeEligible: boolean;
}

export interface EntryModeUsersResponse {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    totalEarnings: number;
    upgradeEligible: number;
  };
  users: EntryModeUser[];
}

export interface BusinessmanProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  profile_photo_url: string | null;
  is_approved: boolean;
  profile_id: string;
  type: string;
  mode: string;
  is_active: boolean;
  business_name: string | null;
  business_address: string | null;
  gst_number: string | null;
  pan_number: string | null;
  bank_account: string | null;
  ifsc_code: string | null;
  advance_amount: number;
  assigned_core_body_id: string | null;
  monthly_target: number;
  ytd_sales: number;
  mtd_sales: number;
  commission_earned: number;
  created_at: string;
  updated_at: string;
  district: string | null;
  district_id: number | null;
  linked_hub_name: string | null;
  storage_capacity?: number;
  min_inventory_value?: number;
  warehouse_address?: string;
  sla_score?: number;
  is_sph: boolean;
}

export const userApi = {
  getEntryModeUsers: async (): Promise<EntryModeUsersResponse> => {
    const response = await api.get("/admin/users/entry");
    return response.data;
  },
  getBusinessmanById: async (id: string): Promise<{ profile: BusinessmanProfile }> => {
    const response = await api.get(`/admin/users/businessmen/${id}`);
    return response.data;
  },
  updateBusinessmanSettings: async (id: string, data: any): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/businessmen/${id}/settings`, data);
    return response.data;
  },
};
