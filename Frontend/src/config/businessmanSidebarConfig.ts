import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  Clock,
  FileClock,
  Gauge,
  HandCoins,
  History,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Package,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  UserCheck,
  Wallet,
  LucideIcon,
} from "lucide-react";

export type BusinessmanMenuKey =
  | "dashboard"
  | "purchaseAdvance"
  | "bulkOrders"
  | "stockInventory"
  | "orderTracking"
  | "referrals"
  | "wallet"
  | "performance"
  | "b2cMarketplace";

export interface BusinessmanSidebarBadge {
  count: number;
  variant?: "default" | "warning" | "danger" | "success";
}

export interface BusinessmanSubMenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: BusinessmanSidebarBadge;
}

export interface BusinessmanNavItem {
  key: BusinessmanMenuKey;
  title: string;
  url?: string;
  icon: LucideIcon;
  submenu?: BusinessmanSubMenuItem[];
  badge?: BusinessmanSidebarBadge;
  warning?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export interface BusinessmanSidebarContext {
  isStockPoint: boolean;
  bulkEnabled: boolean;
  entryModeEnabled: boolean;
  advanceModeEnabled: boolean;
  permissions: string[];
  businessmanType?: string;
  blockedMenus?: Partial<Record<BusinessmanMenuKey, string>>;
}

export const businessmanSidebarBadgeState = {
  activeOrders: 6,
  alerts: 2,
  withdrawalPending: 1,
  slaWarnings: 1,
};

const hasPermission = (permissions: string[], permission: string) => permissions.includes(permission);

const withBlockedState = (
  item: BusinessmanNavItem,
  blockedMenus: BusinessmanSidebarContext["blockedMenus"]
): BusinessmanNavItem => {
  const blockedReason = blockedMenus?.[item.key];
  if (!blockedReason) return item;

  return {
    ...item,
    disabled: true,
    warning: true,
    disabledReason: blockedReason,
  };
};

export function getBusinessmanSidebarNavItems(context: BusinessmanSidebarContext): BusinessmanNavItem[] {
  const {
    isStockPoint,
    bulkEnabled,
    entryModeEnabled,
    advanceModeEnabled,
    permissions,
    businessmanType,
    blockedMenus,
  } = context;

  const items: BusinessmanNavItem[] = [
    {
      key: "dashboard",
      title: "Dashboard",
      url: "/businessman/dashboard",
      icon: LayoutDashboard,
      badge: businessmanSidebarBadgeState.alerts > 0 ? { count: businessmanSidebarBadgeState.alerts, variant: "warning" } : undefined,
    },
    {
      key: "dashboard",
      title: "Marketplace",
      url: "/products-issued",
      icon: ShoppingCart,
    },
    {
      key: "purchaseAdvance",
      title: "Purchase / Advance",
      url: "/businessman/purchase",
      icon: ShoppingCart,
      submenu: [
        { title: "Product Purchase", url: "/businessman/purchase/product-purchase", icon: ShoppingCart },
        { title: "Advance Requests", url: "/businessman/purchase/advance-requests", icon: HandCoins },
        { title: "Advance Ledger", url: "/businessman/purchase/advance-ledger", icon: ClipboardList },
        { title: "Purchase History", url: "/businessman/purchase/purchase-history", icon: History },
      ],
    },
    /*
    {
      key: "bulkOrders",
      title: "Bulk Orders",
      url: "/businessman/bulk-orders",
      icon: Package,
      submenu: [
        { title: "Create Bulk Order", url: "/businessman/bulk-orders/create", icon: Package },
        { title: "Negotiation Requests", url: "/businessman/bulk-orders/negotiations", icon: FileClock },
        { title: "Approved Bulk Orders", url: "/businessman/bulk-orders/approved", icon: ListChecks },
        { title: "Bulk Order History", url: "/businessman/bulk-orders/history", icon: History },
      ],
    },
    */
    {
      key: "stockInventory",
      title: "Stock Inventory",
      url: "/businessman/stock",
      icon: Boxes,
      submenu: [
        { title: "Inventory Overview", url: "/businessman/stock/inventory-overview", icon: Boxes },
        { title: "Stock In / Stock Out", url: "/businessman/stock/in-out", icon: TrendingUp },
        {
          title: "Minimum Stock Status",
          url: "/businessman/stock/minimum-status",
          icon: AlertTriangle,
          badge: businessmanSidebarBadgeState.slaWarnings > 0 ? { count: businessmanSidebarBadgeState.slaWarnings, variant: "warning" } : undefined,
        },
        { title: "Inventory History", url: "/businessman/stock/history", icon: History },
      ],
    },
    {
      key: "orderTracking",
      title: "Order Tracking",
      url: "/businessman/orders",
      icon: Clock,
      badge: businessmanSidebarBadgeState.activeOrders > 0 ? { count: businessmanSidebarBadgeState.activeOrders, variant: "default" } : undefined,
      submenu: [
        {
          title: "Active Orders",
          url: "/businessman/orders/active",
          icon: Clock,
          badge: businessmanSidebarBadgeState.activeOrders > 0 ? { count: businessmanSidebarBadgeState.activeOrders, variant: "default" } : undefined,
        },
        { title: "Completed Orders", url: "/businessman/orders/completed", icon: ListChecks },
        { title: "Returned / Cancelled Orders", url: "/businessman/orders/returned-cancelled", icon: History },
      ],
    },
    {
      key: "referrals",
      title: "Referrals",
      url: "/businessman/referrals",
      icon: Users,
      submenu: [
        { title: "My Referrals", url: "/businessman/referrals/my-referrals", icon: UserPlus },
        { title: "Referral Earnings", url: "/businessman/referrals/earnings", icon: Wallet },
        { title: "Referral History", url: "/businessman/referrals/history", icon: History },
      ],
    },
    {
      key: "wallet",
      title: "Wallet",
      url: "/businessman/wallet",
      icon: Wallet,
      badge:
        businessmanSidebarBadgeState.withdrawalPending > 0
          ? { count: businessmanSidebarBadgeState.withdrawalPending, variant: "warning" }
          : undefined,
      warning: true,
      submenu: [
        { title: "Wallet Overview", url: "/businessman/wallet", icon: Wallet },
        { title: "Transaction Ledger", url: "/businessman/wallet/transaction-ledger", icon: ClipboardList },
        { title: "Withdrawal Request", url: "/businessman/wallet/withdrawal-request", icon: HandCoins },
        { title: "Withdrawal History", url: "/businessman/wallet/withdrawal-history", icon: History },
      ],
    },
    {
      key: "performance",
      title: "Performance",
      url: "/businessman/performance",
      icon: BarChart3,
      submenu: [
        { title: "Performance Metrics", url: "/businessman/performance/metrics", icon: BarChart3 },
        { title: "SLA Status", url: "/businessman/performance/sla-status", icon: Clock },
        {
          title: "Risk & Warnings",
          url: "/businessman/performance/risk-warnings",
          icon: ShieldAlert,
          badge: businessmanSidebarBadgeState.slaWarnings > 0 ? { count: businessmanSidebarBadgeState.slaWarnings, variant: "warning" } : undefined,
        },
        { title: "Upgrade Eligibility", url: "/businessman/performance/upgrade-eligibility", icon: TrendingUp },
      ],
    },
    {
      key: "b2cMarketplace",
      title: "B2C Market Manager",
      url: "/businessman/b2c-manager",
      icon: ShoppingCart,
      submenu: [
        { title: "My B2C Listings", url: "/businessman/b2c-manager/listings", icon: ListChecks },
        { title: "Browse Bulk Catalog", url: "/businessman/b2c-manager/browse", icon: Package },
        { title: "Add Custom Product", url: "/businessman/b2c-manager/add-custom", icon: UserPlus },
      ],
    },
    {
      key: "dashboard",
      title: "Settings",
      url: "/businessman/settings",
      icon: Users,
      submenu: [
        { title: "KYC Management", url: "/businessman/kyc", icon: UserCheck },
        { title: "Device Management", url: "/businessman/settings/devices", icon: ShieldAlert },
      ],
    },
  ];

  const filteredItems = items
    .filter((item) => {
      if ((item.key === "stockInventory" || item.key === "b2cMarketplace") && !isStockPoint) return false;
      if (item.key === "bulkOrders" && !bulkEnabled) return false;
      if (item.key === "purchaseAdvance" && !entryModeEnabled && !advanceModeEnabled) return false;

      if (item.key === "referrals" && businessmanType !== 'retailer_a') return false;

      const permissionMap: Record<BusinessmanMenuKey, string> = {
        dashboard: "businessman.dashboard.view",
        purchaseAdvance: "businessman.purchase.view",
        bulkOrders: "businessman.bulk.view",
        stockInventory: "businessman.stock.view",
        orderTracking: "businessman.orders.view",
        referrals: "businessman.referrals.view",
        wallet: "businessman.wallet.view",
        performance: "businessman.performance.view",
        b2cMarketplace: "businessman.stock.view", // Reusing stock permission for simplicity, or create new
      };

      return hasPermission(permissions, permissionMap[item.key]);
    })
    .map((item) => {
      const filteredSubmenu = item.submenu?.filter((subItem) => {
        if (item.key === "purchaseAdvance") {
          if (subItem.title === "Advance Requests" || subItem.title === "Advance Ledger") {
            return advanceModeEnabled;
          }

          return entryModeEnabled || advanceModeEnabled;
        }

        return true;
      });

      return {
        ...item,
        submenu: filteredSubmenu,
      };
    })
    .map((item) => withBlockedState(item, blockedMenus));

  return filteredItems;
}

