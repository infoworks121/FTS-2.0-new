import {
  Boxes,
  Clock,
  History,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ClipboardList,
  HandCoins,
  ListChecks,
  BarChart3,
  ShieldAlert,
  UserCheck,
  LucideIcon,
} from "lucide-react";

export type SPHMenuKey =
  | "dashboard"
  | "marketplace"
  | "stockInventory"
  | "orderFulfillment"
  | "b2cManager"
  | "wallet"
  | "performance"
  | "settings";

export interface SPHSidebarBadge {
  count: number;
  variant?: "default" | "warning" | "danger" | "success";
}

export interface SPHSubMenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: SPHSidebarBadge;
}

export interface SPHNavItem {
  key: SPHMenuKey;
  title: string;
  url?: string;
  icon: LucideIcon;
  submenu?: SPHSubMenuItem[];
  badge?: SPHSidebarBadge;
  warning?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SPHSidebarContext {
  permissions: string[];
  blockedMenus?: Partial<Record<SPHMenuKey, string>>;
}

const hasPermission = (permissions: string[], permission: string) => 
  permissions.length === 0 || permissions.includes(permission);

export function getSPHSidebarNavItems(context: SPHSidebarContext): SPHNavItem[] {
  const { permissions, blockedMenus } = context;

  const items: SPHNavItem[] = [
    {
      key: "dashboard",
      title: "SPH Dashboard",
      url: "/stockpoint/dashboard",
      icon: LayoutDashboard,
    },
    {
      key: "marketplace",
      title: "Public Marketplace",
      url: "/products-issued",
      icon: ShoppingCart,
    },
    {
      key: "stockInventory",
      title: "Inventory Control",
      url: "/stockpoint/stock",
      icon: Boxes,
      submenu: [
        { title: "Inventory Overview", url: "/stockpoint/stock/inventory-overview", icon: Boxes },
        { title: "Stock In / Stock Out", url: "/stockpoint/stock/in-out", icon: TrendingUp },
        { title: "Inventory History", url: "/stockpoint/stock/history", icon: History },
      ],
    },
    {
      key: "orderFulfillment",
      title: "Order Fulfillment",
      url: "/stockpoint/orders",
      icon: Clock,
      submenu: [
        { title: "Active Assignments", url: "/stockpoint/orders/active", icon: Clock },
        { title: "Fulfillment History", url: "/stockpoint/orders/history", icon: ListChecks },
      ],
    },
    {
      key: "b2cManager",
      title: "Market Listings",
      url: "/stockpoint/b2c-manager",
      icon: Package,
      submenu: [
        { title: "My Listings", url: "/stockpoint/b2c-manager/listings", icon: ListChecks },
        { title: "Global Catalog", url: "/stockpoint/b2c-manager/browse", icon: Package },
        { title: "Custom Listing", url: "/stockpoint/b2c-manager/add-custom", icon: UserCheck },
      ],
    },
    {
      key: "wallet",
      title: "SPH Wallet",
      url: "/stockpoint/wallet",
      icon: Wallet,
      submenu: [
        { title: "Wallet Overview", url: "/stockpoint/wallet", icon: Wallet },
        { title: "Transaction Ledger", url: "/stockpoint/wallet/transaction-ledger", icon: ClipboardList },
        { title: "Withdrawal Request", url: "/stockpoint/wallet/withdrawal-request", icon: HandCoins },
      ],
    },
    {
      key: "performance",
      title: "Performance & SLA",
      url: "/stockpoint/performance",
      icon: BarChart3,
      submenu: [
        { title: "SLA Scorecard", url: "/stockpoint/performance/sla-status", icon: Clock },
        { title: "Compliance Risks", url: "/stockpoint/performance/risk-warnings", icon: ShieldAlert },
      ],
    },
    {
      key: "settings",
      title: "Account Settings",
      url: "/stockpoint/settings",
      icon: UserCheck,
      submenu: [
        { title: "KYC Verification", url: "/stockpoint/kyc", icon: UserCheck },
      ],
    },
  ];

  return items.filter(item => {
    // SPH role has inherent access to these, 
    // but we can add permission checks if needed
    return true; 
  });
}
