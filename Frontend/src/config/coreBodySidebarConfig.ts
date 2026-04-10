import {
  LayoutDashboard,
  BarChart3,
  Package,
  Boxes,
  History,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
  ShoppingCart,
  Truck,
  Clock,
  Wallet,
  BookOpen,
  Gauge,
  ArrowRightLeft,
  Bell,
  UserMinus,
  AlertTriangle,
  FileBarChart,
  ClipboardList,
  Activity,
  ArrowUpCircle,
  ListChecks,
  UserCog,
  TrendingUp,
  ShieldAlert,
  FileText,
  CircleDollarSign,
  Landmark,
  HandCoins,
  Receipt,
  RotateCcw,
  Ban,
  Scale,
  MessageSquare,
  Archive,
  WalletCards,
  Download,
  ClipboardCheck,
  Settings,
  LucideIcon,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoreBodyType = "A" | "B" | "Dealer";

export interface CoreBodyBadge {
  count: number;
  variant?: "default" | "warning" | "danger" | "success";
  label?: string;
}

export interface CoreBodySubMenuItem {
  title: string;
  url: string;
  badge?: CoreBodyBadge;
  readOnly?: boolean;
  coreBodyAOnly?: boolean;
}

export interface CoreBodyNavGroup {
  groupLabel: string;
  groupIcon: LucideIcon;
  purpose: string;
  items: CoreBodyNavItem[];
}

export interface CoreBodyNavItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  submenu?: CoreBodySubMenuItem[];
  badge?: CoreBodyBadge;
  readOnly?: boolean;
  coreBodyAOnly?: boolean; // Hidden/disabled for Core Body B
  warning?: boolean;
  safety?: "control" | "monitor";
}

// ─── Badge State (would come from API in real app) ───────────────────────────

export const coreBodyBadgeState = {
  pendingOrders: 7,
  inactiveUsers: 3,
  capNearLimit: true,
  pendingFulfilments: 4,
  activityAlerts: 2,
  inactivityWarnings: 1,
  pendingReferralPayouts: 5,
  blockedReferrals: 2,
  suspendedEntities: 3,
  slaViolations: 2,
  pendingUpgrades: 4,
};

// ─── Cap Data (would come from API in real app) ──────────────────────────────

export interface CapData {
  current: number;
  max: number;
  label: string;
  period: "monthly" | "annual";
}

export const defaultCapData: CapData = {
  current: 184200,
  max: 250000,
  label: "Earnings Cap",
  period: "monthly",
};

// ─── Navigation Groups ──────────────────────────────────────────────────────

export function getCoreBodyNavGroups(coreBodyType: CoreBodyType): CoreBodyNavGroup[] {
  return [
    // ── 1) DASHBOARD ──
    {
      groupLabel: "Dashboard",
      groupIcon: LayoutDashboard,
      purpose: "District overview, earnings posture, and cap-risk monitoring.",
      items: [
        {
          title: "Overview",
          icon: LayoutDashboard,
          url: "/corebody",
          safety: "monitor",
        },
        {
          title: "Marketplace",
          icon: ShoppingCart,
          url: "/products-issued",
          safety: "monitor",
        },
        {
          title: "Earnings vs Cap",
          icon: CircleDollarSign,
          url: "/corebody/dashboard/earnings-vs-cap",
          badge: coreBodyBadgeState.capNearLimit
            ? { count: 1, variant: "danger", label: "Cap stop warning" }
            : undefined,
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Active Stock Summary",
          icon: Package,
          url: "/corebody/dashboard/active-stock-summary",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Risk Indicators",
          icon: ShieldAlert,
          url: "/corebody/dashboard/risk-indicators",
          warning: true,
          safety: "monitor",
        },
        {
          title: "District Performance Snapshot",
          icon: BarChart3,
          url: "/corebody/dashboard/district-performance-snapshot",
          readOnly: true,
          safety: "monitor",
        },
      ],
    },

    // ── 2) ORDER & INVENTORY MANAGEMENT ──
    {
      groupLabel: "Order & Inventory",
      groupIcon: Package,
      purpose: "Consolidated district inventory controls and order fulfillment monitoring.",
      items: [
        {
          title: "Order & Inventory Management",
          icon: Package,
          badge: (coreBodyBadgeState.pendingOrders + coreBodyBadgeState.pendingFulfilments) > 0
            ? {
                count: coreBodyBadgeState.pendingOrders + coreBodyBadgeState.pendingFulfilments,
                variant: coreBodyBadgeState.pendingFulfilments > 0 ? "warning" : "default",
              }
            : undefined,
          submenu: [
            // Stock Operations

            {
              title: "Stock Inventory",
              url: "/corebody/stock/current-inventory",
              readOnly: coreBodyType === "B",
            },

            {
              title: "Stock Ledger",
              url: "/corebody/stock/ledger",
              readOnly: true,
            },
            {
              title: "Block / Release Stock",
              url: "/corebody/stock/block-release",
              coreBodyAOnly: true,
            },
            {
              title: "Demand Signals",
              url: "/corebody/stock/demand-signals",
              badge: { count: 1, variant: "warning", label: "New messages" }
            },
            {
              title: "Dispatch Stock",
              url: "/corebody/stock/physical-transfer"
            },
            // Order Operations
            {
              title: "B2B Orders",
              url: "/corebody/orders/b2b-orders",
              badge: coreBodyBadgeState.pendingOrders > 0
                ? {
                    count: coreBodyBadgeState.pendingOrders,
                    variant: "default",
                  }
                : undefined,
            },
            {
              title: "B2C Fulfillment",
              url: "/corebody/orders/b2c-fulfillment",
            },
            {
              title: "Distribution Tracking",
              url: "/corebody/orders/distribution-tracking",
            },
            {
              title: "Returns & Cancellations",
              url: "/corebody/orders/cancelled-returned",
              readOnly: true,
            },
            {
              title: "Delayed Orders",
              url: "/corebody/orders/pending-delayed",
              badge: coreBodyBadgeState.pendingFulfilments > 0
                ? {
                    count: coreBodyBadgeState.pendingFulfilments,
                    variant: "warning",
                  }
                : undefined,
              warning: true,
            },
            {
              title: "Allocation Logic View",
              url: "/corebody/orders/allocation-logic-view",
              readOnly: true,
            },
          ],
          safety: "control",
        },
      ],
    },

    // ── 3) USER MANAGEMENT ──
    {
      groupLabel: "User Management",
      groupIcon: Users,
      purpose: "District-scoped downstream participant monitoring and performance tracking.",
      items: [
        {
          title: "Users",
          icon: Users,
          submenu: [
            {
              title: "All Users",
              url: "/corebody/dealers-businessmen/all-users",
              readOnly: true,
            },
            {
              title: "Performance Snapshot",
              url: "/corebody/dealers-businessmen/performance-snapshot",
              readOnly: true,
            },
          ],
          safety: "monitor",
        },
      ],
    },


    // ── 5) WALLET & EARNINGS ──
    {
      groupLabel: "Wallet & Earnings",
      groupIcon: Wallet,
      purpose: "Financial controls, immutable ledger traces, and cap-stop transparency.",
      items: [
        {
          title: "Wallet Management",
          icon: Wallet,
          submenu: [
            {
              title: "Main Wallet",
              url: "/corebody/wallet/main-wallet",
              readOnly: true,
            },
            {
              title: "Deposit Funds",
              url: "/corebody/wallet/deposit",
            },
            {
              title: "Referral Wallet",
              url: "/corebody/wallet/referral-wallet",
              readOnly: true,
            },
            {
              title: "Earnings Breakdown",
              url: "/corebody/wallet/earnings-breakdown",
              readOnly: true,
            },
            {
              title: "Cap Utilization Tracker",
              url: "/corebody/dashboard/earnings-vs-cap",
              readOnly: true,
              badge: coreBodyBadgeState.capNearLimit
                ? { count: 1, variant: "danger" }
                : undefined,
            },
            {
              title: "Excess Profit Transfer Log",
              url: "/corebody/wallet/excess-profit-transfer-log",
              readOnly: true,
            },
            {
              title: "Withdrawal History",
              url: "/corebody/wallet/withdrawal-history",
              readOnly: true,
            },
            {
              title: "Ledger View",
              url: "/corebody/wallet/ledger-view",
              readOnly: true,
            },
          ],
          safety: "monitor",
        },
      ],
    },

    // ── 6) REFERRALS ──
    {
      groupLabel: "Referrals",
      groupIcon: Users,
      purpose: "Single-level referral transparency with payout and fraud visibility.",
      items: [
        {
          title: "Referrals",
          icon: Users,
          url: "/corebody/referrals",
          submenu: [
            { title: "My Referrals", url: "/corebody/referrals/my-referrals" },
            { title: "Referral Earnings", url: "/corebody/referrals/earnings" },
            { title: "Referral History", url: "/corebody/referrals/history" },
          ],
          safety: "monitor",
        },
      ],
    },

    // ── 7) SETTINGS & REPORTS ──
    {
      groupLabel: "Settings & Reports",
      groupIcon: Settings,
      purpose: "Access all system settings, compliance rules, and audit-ready management reports.",
      items: [
        {
          title: "System Settings",
          icon: Settings,
          submenu: [
            {
              title: "Rules & Limitations",
              url: "/corebody/upgrade/rules-limitations",
            },
            {
              title: "System Alerts",
              url: "/corebody/activity-alerts/system-alerts",
              badge: coreBodyBadgeState.activityAlerts > 0
                ? {
                    count: coreBodyBadgeState.activityAlerts,
                    variant: "danger",
                  }
                : undefined,
            },
            {
              title: "Inactivity Warnings",
              url: "/corebody/activity-alerts/inactivity-warnings",
              badge: coreBodyBadgeState.inactivityWarnings > 0
                ? {
                    count: coreBodyBadgeState.inactivityWarnings,
                    variant: "warning",
                  }
                : undefined,
            },
            {
              title: "SLA Violations",
              url: "/corebody/activity-alerts/sla-violations",
              badge: coreBodyBadgeState.slaViolations > 0
                ? {
                    count: coreBodyBadgeState.slaViolations,
                    variant: "warning",
                  }
                : undefined,
            },
            {
              title: "Compliance Notices",
              url: "/corebody/activity-alerts/compliance-notices",
            },
            {
              title: "Admin Messages",
              url: "/corebody/activity-alerts/admin-messages",
            },
          ],
          safety: "monitor",
        },
        {
          title: "Management Reports",
          icon: FileBarChart,
          submenu: [
            {
              title: "Earnings Reports",
              url: "/corebody/reports/earnings",
            },
            {
              title: "Stock Reports",
              url: "/corebody/reports/stock",
            },
            {
              title: "Order Reports",
              url: "/corebody/reports/orders",
            },
            {
              title: "Activity Logs",
              url: "/corebody/reports-logs/activity-logs",
            },
            {
              title: "Financial Ledger Export",
              url: "/corebody/reports-logs/financial-ledger-export",
            },
            {
              title: "District Performance Report",
              url: "/corebody/reports/dealer-performance",
            },
          ],
          safety: "monitor",
        },
      ],
    },
  ];
}

// ─── Flat nav items for simple sidebar (backward compat) ─────────────────────

export function getCoreBodyFlatNavItems(coreBodyType: CoreBodyType): CoreBodyNavItem[] {
  const groups = getCoreBodyNavGroups(coreBodyType);
  return groups.flatMap((group) =>
    group.items
      .filter((item) => {
        if (item.coreBodyAOnly && coreBodyType !== "A") return false;
        // Hide referral menu for Dealers (only A and B are eligible)
        if (group.groupLabel === "Referrals" && coreBodyType === "Dealer") return false;
        return true;
      })
      .map((item) => {
        // Filter submenus for coreBodyAOnly
        if (item.submenu) {
          return {
            ...item,
            submenu: item.submenu.filter((sub) => {
              if (sub.coreBodyAOnly && coreBodyType !== "A") return false;
              return true;
            }),
          };
        }
        return item;
      })
  );
}
