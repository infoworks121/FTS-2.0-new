import { LucideIcon, LayoutDashboard, UserCheck, Package, Percent, MapPin, Users, Wallet, ShoppingCart, ShieldAlert, FileText, Settings, Building2, TrendingUp, DollarSign, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

// Badge type for sidebar items
export interface SidebarBadge {
  count: number;
  variant?: "default" | "warning" | "danger" | "success";
}

// Submenu item
export interface SubMenuItem {
  title: string;
  url: string;
}

// Main navigation item with expandable submenus
export interface SidebarNavItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  submenu?: SubMenuItem[];
  badge?: SidebarBadge;
  warning?: boolean; // For financial/risk sections
  requiredRole?: "admin" | "corebody" | "businessman" | "all";
}

// Badge counter states (these would come from API in real app)
export const sidebarBadgeState = {
  pendingApprovals: 12,
  fraudAlerts: 3,
  withdrawalRequests: 8,
  activeOrders: 24,
  pendingRefunds: 5,
};

// Icon mapping
export const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  UserCheck,
  Package,
  Percent,
  MapPin,
  Users,
  Wallet,
  ShoppingCart,
  ShieldAlert,
  FileText,
  Settings,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
};

// Full sidebar navigation configuration
export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/admin",
    requiredRole: "admin",
  },
  {
    title: "Marketplace",
    icon: ShoppingCart,
    url: "/products-issued",
    requiredRole: "admin",
  },
  {
    title: "User Approval",
    icon: UserCheck,
    url: "/admin/approval",
    requiredRole: "admin",
  },
  {
    title: "KYC Review",
    icon: UserCheck,
    url: "/admin/kyc/review",
    requiredRole: "admin",
  },
  {
    title: "B2B & Categories",
    icon: Package,
    requiredRole: "admin",
    submenu: [
      { title: "All Products", url: "/admin/products" },
      { title: "Product Pricing & Margin", url: "/admin/products/pricing" },
      // { title: "Product Status", url: "/admin/products/status" },
      { title: "Category List", url: "/admin/categories" },
      { title: "Category Commission Rules", url: "/admin/categories/commission" },
      // { title: "Services & Digital Products", url: "/admin/services" },
    ],
  },
  {
    title: "B2C Manager",
    icon: ShoppingCart,
    requiredRole: "admin",
    submenu: [
      { title: "Add B2C Product", url: "/admin/products/new?channel=B2C" },
      { title: "B2C Commission Structure", url: "/admin/commission/b2c" },
    ],
  },
  {
    title: "Commission & Profit Engine",
    icon: Percent,
    warning: true,
    requiredRole: "admin",
    submenu: [
      { title: "B2B Commission Structure", url: "/admin/commission/b2b" },
      { title: "Referral Percentage Rules", url: "/admin/commission/referral" },
      { title: "Profit Distribution", url: "/admin/commission/profit" },
      { title: "Trust Fund Rules", url: "/admin/commission/trust" },
      { title: "Company Share Rules", url: "/admin/commission/company" },
      { title: "Core Body Share Rules", url: "/admin/commission/corebody" },
      { title: "Stock Point Share Rules", url: "/admin/commission/stockpoint" },
    ],
  },
  {
    title: "District & Core Body",
    icon: MapPin,
    requiredRole: "admin",
    submenu: [
      { title: "All Districts", url: "/admin/districts" },
      // { title: "Add / Edit District", url: "/admin/districts/manage" },
      { title: "District Performance", url: "/admin/districts/performance" },
      { title: "Core Body List", url: "/admin/corebody" },
      // { title: "Core Body A Management", url: "/admin/corebody/a" },
      // { title: "Core Body B Management", url: "/admin/corebody/b" },
    ],
  },
  {
    title: "Users & Roles",
    icon: Users,
    requiredRole: "admin",
    submenu: [
      { title: "All Users", url: "/admin/users" },
      { title: "All Businessmen", url: "/admin/users/businessmen" },
      // { title: "Entry Mode Users", url: "/admin/users/entry" },
      // { title: "Advance Mode Users", url: "/admin/users/advance" },
      // { title: "Bulk Users", url: "/admin/users/bulk" },
      { title: "Stock Point List", url: "/admin/users/stockpoints" },
      { title: "Role Permissions", url: "/admin/users/roles" },
      { title: "Feature Access Control", url: "/admin/users/features" },
    ],
  },
  {
    title: "Referral Management",
    icon: Users,
    requiredRole: "admin",
    submenu: [
      { title: "Referral Network", url: "/admin/referral/network" },
      { title: "Referral Earnings Log", url: "/admin/referral/earnings" },
      { title: "Referral Rules", url: "/admin/commission/referral" },
      { title: "Abuse Detection", url: "/admin/compliance/referral" },
    ],
  },
  {
    title: "Wallets & Finance",
    icon: Wallet,
    warning: true,
    requiredRole: "admin",
    badge: { count: sidebarBadgeState.withdrawalRequests, variant: "warning" },
    submenu: [
      { title: "All User Wallets", url: "/admin/wallet/user-wallets" },
      { title: "Main Wallet", url: "/admin/wallet/main" },
      { title: "Invest Wallet", url: "/admin/wallet/invest" },
      { title: "Referral Wallet", url: "/admin/wallet/referral" },
      { title: "Trust Wallet", url: "/admin/wallet/trust" },
      { title: "Reserve Fund Wallet", url: "/admin/wallet/reserve" },
      { title: "Withdrawal Requests", url: "/admin/wallet/withdrawals" },
      { title: "Deposit Requests", url: "/admin/wallet/deposits" },
      { title: "Installment Approval", url: "/admin/wallet/approvals" },
      { title: "Approved / Rejected History", url: "/admin/wallet/history" },
      { title: "TDS Configuration", url: "/admin/finance/tds" },
      { title: "Processing Fee Rules", url: "/admin/finance/fees" },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    badge: { count: sidebarBadgeState.activeOrders, variant: "default" },
    requiredRole: "admin",
    submenu: [
      { title: "All Orders", url: "/admin/orders" },
      { title: "Shortage Resolution", url: "/admin/stock/shortages" },
      { title: "B2B Orders", url: "/admin/orders/b2b" },
      { title: "B2C Orders", url: "/admin/orders/b2c" },
      { title: "Order Returns & Refunds", url: "/admin/orders/refunds" },
    ],
  },
  {
    title: "Financial Records",
    icon: FileText,
    warning: true,
    requiredRole: "admin",
    submenu: [
      { title: "Transaction Logs", url: "/admin/transactions" },
      { title: "Ledger View", url: "/admin/ledger" },
    ],
  },
  {
    title: "Risk, Fraud & Compliance",
    icon: ShieldAlert,
    warning: true,
    badge: { count: sidebarBadgeState.fraudAlerts, variant: "danger" },
    requiredRole: "admin",
    submenu: [
      { title: "Suspicious Transactions", url: "/admin/fraud/transactions" },
      { title: "Fake Orders", url: "/admin/fraud/orders" },
      { title: "Duplicate Accounts", url: "/admin/fraud/accounts" },
      { title: "Device Tracking Flags", url: "/admin/fraud/devices" },
      { title: "PAN / Aadhaar Verification", url: "/admin/compliance/kyc" },
      { title: "Cap Violation Reports", url: "/admin/compliance/cap" },
      { title: "Referral Abuse Detection", url: "/admin/compliance/referral" },
      { title: "Actions & Freezes", url: "/admin/fraud/actions" },
    ],
  },
  {
    title: "Audit & System Logs",
    icon: FileText,
    requiredRole: "admin",
    submenu: [
      { title: "Admin Activity Logs", url: "/admin/audit/admin" },
      { title: "Financial Audit Logs", url: "/admin/audit/financial" },
      { title: "Rule Change History", url: "/admin/audit/rules" },
      { title: "Login & Access Logs", url: "/admin/audit/login" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    requiredRole: "admin",
    submenu: [
      { title: "Platform Settings", url: "/admin/settings/platform" },
      { title: "Notification Rules", url: "/admin/settings/notifications" },
      { title: "API & Integration", url: "/admin/settings/api" },
      { title: "Payment Gateway Settings", url: "/admin/settings/payment" },
      { title: "Language & Localization", url: "/admin/settings/language" },
      { title: "Maintenance Mode", url: "/admin/settings/maintenance" },
      { title: "Device Management", url: "/admin/settings/devices" },
      { title: "Login History", url: "/admin/settings/login-history" },
      { title: "Session Management", url: "/admin/settings/sessions" },
    ],
  },
];
