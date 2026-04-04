// User Types
export type UserMode = "entry" | "advance" | "bulk" | "businessman" | "stock_point";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";
export type UserRole = "admin" | "corebody_a" | "corebody_b" | "businessman" | "stock_point";

export interface Businessman {
  id: string;
  name: string;
  email: string;
  phone: string;
  mode: UserMode;
  district: string;
  districtId: string;
  coreBodyId?: string;
  coreBodyName?: string;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  status: UserStatus;
  createdAt: string;
  lastTransaction?: string;
  kycVerified: boolean;
  totalEarnings: number;
  activeProducts?: number;
  advanceAmount?: number;
  marginPercent?: number;
}

export interface EntryModeUser {
  id: string;
  name: string;
  referralSource: string;
  earnings: number;
  status: UserStatus;
  lastTransaction: string;
  isUpgradeEligible: boolean;
  inactivityDays: number;
}

export interface AdvanceModeUser {
  id: string;
  name: string;
  advanceAmount: number;
  marginPercent: number;
  activeProducts: number;
  earnings: number;
  status: UserStatus;
  advanceHistory: AdvanceHistory[];
  isOverExposed: boolean;
}

export interface AdvanceHistory {
  id: string;
  amount: number;
  date: string;
  type: "issued" | "settled" | "adjusted";
}

export interface BulkUser {
  id: string;
  businessName: string;
  contactPerson: string;
  negotiationStatus: "pending" | "approved" | "rejected" | "negotiating";
  approvedMargin: number;
  monthlyVolume: number;
  slaRating: number;
  status: UserStatus;
  isAdminApproved: boolean;
  negotiationHistory: NegotiationHistory[];
  riskLevel: "low" | "medium" | "high";
}

export interface NegotiationHistory {
  id: string;
  date: string;
  requestedMargin: number;
  approvedMargin: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface StockPoint {
  id: string;
  name: string;
  district: string;
  districtId: string;
  inventoryLevel: number;
  minInventoryThreshold: number;
  slaScore: number;
  ordersFulfilled: number;
  status: UserStatus;
  performanceTrend: "up" | "down" | "stable";
  managerName: string;
  contactPhone: string;
  createdAt: string;
}

// Role & Permission Types
export type Permission = "view" | "create" | "edit" | "approve" | "withdraw" | "audit";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isLocked: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface PermissionMatrix {
  roleId: string;
  permissions: Record<Permission, boolean>;
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

// Feature Access Types
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  isEnabled: boolean;
  isGlobal: boolean;
}

export interface FeatureAccess {
  featureId: string;
  roleId: string;
  hasAccess: boolean;
  override?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  isTemporary: boolean;
}

export interface FeatureAccessConfig {
  feature: Feature;
  accessByRole: Record<UserRole, boolean>;
  overrideByRole: Record<UserRole, boolean>;
}

// Filter Types
export interface UserFilters {
  search?: string;
  mode?: UserMode;
  district?: string;
  status?: UserStatus;
  coreBodyId?: string;
}

export interface StockPointFilters {
  search?: string;
  district?: string;
  status?: UserStatus;
  minSlaScore?: number;
}

// KPI Types
export interface UsersKPIs {
  totalBusinessmen: number;
  activeBusinessmen: number;
  totalWalletBalance: number;
  totalEarnings: number;
  entryModeCount: number;
  advanceModeCount: number;
  bulkModeCount: number;
}

export interface StockPointKPIs {
  totalStockPoints: number;
  activeStockPoints: number;
  totalOrdersFulfilled: number;
  averageSlaScore: number;
  lowInventoryCount: number;
}

// Configuration
export const userModeConfig: Record<UserMode, { label: string; color: string; bgColor: string }> = {
  entry: { label: "Entry", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  advance: { label: "Advance", color: "text-purple-400", bgColor: "bg-purple-500/10" },
  bulk: { label: "Bulk", color: "text-orange-400", bgColor: "bg-orange-500/10" },
  businessman: { label: "Businessman", color: "text-green-400", bgColor: "bg-green-500/10" },
  stock_point: { label: "Stock Point", color: "text-amber-400", bgColor: "bg-amber-500/10" },
};

export const roleConfig: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  admin: { label: "Admin", color: "text-red-400", bgColor: "bg-red-500/10" },
  corebody_a: { label: "Core Body A", color: "text-purple-400", bgColor: "bg-purple-500/10" },
  corebody_b: { label: "Core Body B", color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
  businessman: { label: "Businessman", color: "text-green-400", bgColor: "bg-green-500/10" },
  stock_point: { label: "Stock Point", color: "text-amber-400", bgColor: "bg-amber-500/10" },
};

export const permissionLabels: Record<Permission, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  approve: "Approve",
  withdraw: "Withdraw",
  audit: "Audit",
};

export const negotiationStatusConfig: Record<BulkUser["negotiationStatus"], { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  approved: { label: "Approved", color: "text-green-400", bgColor: "bg-green-500/10" },
  rejected: { label: "Rejected", color: "text-red-400", bgColor: "bg-red-500/10" },
  negotiating: { label: "Negotiating", color: "text-blue-400", bgColor: "bg-blue-500/10" },
};

export const riskLevelConfig: Record<BulkUser["riskLevel"], { label: string; color: string; bgColor: string }> = {
  low: { label: "Low Risk", color: "text-green-400", bgColor: "bg-green-500/10" },
  medium: { label: "Medium Risk", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  high: { label: "High Risk", color: "text-red-400", bgColor: "bg-red-500/10" },
};

// Mock Data
export const mockDistricts = [
  "Dhaka North",
  "Dhaka South",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

export const mockCoreBodies = [
  { id: "cb1", name: "Core Body Dhaka Central" },
  { id: "cb2", name: "Core Body Chittagong North" },
  { id: "cb3", name: "Core Body Sylhet" },
];
