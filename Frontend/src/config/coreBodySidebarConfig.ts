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
          title: "Active Dealers Count",
          icon: UserCheck,
          url: "/corebody/dashboard/active-dealers-count",
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

    // ── 2) STOCK MANAGEMENT ──
    {
      groupLabel: "Stock Management",
      groupIcon: Package,
      purpose: "Stock issuance and district inventory controls with strict role restrictions.",
      items: [
        {
          title: "Issue Stock to Businessman",
          icon: Package,
          url: "/corebody/stock/issue-to-businessman",
          coreBodyAOnly: true,
          safety: "control",
        },
        {
          title: "Current Stock Inventory",
          icon: Boxes,
          url: "/corebody/stock/current-inventory",
          readOnly: coreBodyType === "B",
          safety: "monitor",
        },
        {
          title: "Stock Transfer History",
          icon: History,
          url: "/corebody/stock/transfer-history",
          readOnly: coreBodyType === "B",
          safety: "monitor",
        },
        {
          title: "Stock Ledger",
          icon: BookOpen,
          url: "/corebody/stock/ledger",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Stock Block / Release",
          icon: Ban,
          url: "/corebody/stock/block-release",
          coreBodyAOnly: true,
          safety: "monitor",
        },
      ],
    },

    // ── 3) DEALERS & BUSINESSMEN ──
    {
      groupLabel: "Dealers & Businessmen",
      groupIcon: Users,
      purpose: "District-scoped downstream participant monitoring with read-only operations.",
      items: [
        {
          title: "All Dealers List",
          icon: UserCheck,
          url: "/corebody/dealers-businessmen/all-dealers",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "All Businessmen List",
          icon: Users,
          url: "/corebody/dealers-businessmen/all-businessmen",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Status (Active / Inactive)",
          icon: UserX,
          url: "/corebody/dealers-businessmen/status",
          badge: coreBodyBadgeState.suspendedEntities > 0
            ? {
                count: coreBodyBadgeState.suspendedEntities,
                variant: "warning",
                label: "Inactive entities",
              }
            : undefined,
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Performance Snapshot",
          icon: TrendingUp,
          url: "/corebody/dealers-businessmen/performance-snapshot",
          readOnly: true,
          safety: "monitor",
        },
      ],
    },

    // ── 4) ORDERS & DISTRIBUTION ──
    {
      groupLabel: "Orders & Distribution",
      groupIcon: ShoppingCart,
      purpose: "District-level order flow, fulfilment health, and SLA visibility.",
      items: [
        {
          title: "B2B Orders",
          icon: ShoppingCart,
          url: "/corebody/orders/b2b-orders",
          badge: coreBodyBadgeState.pendingOrders > 0
            ? {
                count: coreBodyBadgeState.pendingOrders,
                variant: "default",
                label: "Pending orders",
          }
            : undefined,
          safety: "monitor",
        },
        {
          title: "B2C Fulfillment (via Stock Points)",
          icon: Package,
          url: "/corebody/orders/b2c-fulfillment",
          safety: "monitor",
        },
        {
          title: "Distribution Tracking",
          icon: Truck,
          url: "/corebody/orders/distribution-tracking",
          safety: "monitor",
        },
        {
          title: "Cancelled / Returned Orders",
          icon: RotateCcw,
          url: "/corebody/orders/cancelled-returned",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Pending / Delayed Orders",
          icon: Clock,
          url: "/corebody/orders/pending-delayed",
          badge: coreBodyBadgeState.pendingFulfilments > 0
            ? {
                count: coreBodyBadgeState.pendingFulfilments,
                variant: "warning",
                label: "Pending fulfilments",
              }
            : undefined,
          warning: true,
          safety: "monitor",
        },
        {
          title: "Allocation Logic View",
          icon: ClipboardCheck,
          url: "/corebody/orders/allocation-logic-view",
          readOnly: true,
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
          title: "Main Wallet",
          icon: Wallet,
          url: "/corebody/wallet/main-wallet",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Referral Wallet",
          icon: WalletCards,
          url: "/corebody/wallet/referral-wallet",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Earnings Breakdown",
          icon: CircleDollarSign,
          url: "/corebody/wallet/earnings-breakdown",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Cap Utilization Tracker",
          icon: Gauge,
          url: "/corebody/wallet/cap-utilization-tracker",
          readOnly: true,
          badge: coreBodyBadgeState.capNearLimit
            ? { count: 1, variant: "danger", label: "Cap stop warning" }
            : undefined,
          warning: coreBodyBadgeState.capNearLimit,
          safety: "monitor",
        },
        {
          title: "Excess Profit Transfer Log",
          icon: ArrowRightLeft,
          url: "/corebody/wallet/excess-profit-transfer-log",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Withdrawal History",
          icon: HandCoins,
          url: "/corebody/wallet/withdrawal-history",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Ledger View",
          icon: Landmark,
          url: "/corebody/wallet/ledger-view",
          readOnly: true,
          safety: "monitor",
        },
      ],
    },

    // ── 6) REFERRAL OVERVIEW ──
    {
      groupLabel: "Referral Overview",
      groupIcon: Users,
      purpose: "Single-level referral transparency with payout and fraud visibility.",
      items: [
        {
          title: "Direct Referrals List",
          icon: Users,
          url: "/corebody/referrals/direct-referrals-list",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Referral Earnings",
          icon: CircleDollarSign,
          url: "/corebody/referrals/referral-earnings",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Pending Referral Payouts",
          icon: Clock,
          url: "/corebody/referrals/pending-referral-payouts",
          badge: coreBodyBadgeState.pendingReferralPayouts > 0
            ? {
                count: coreBodyBadgeState.pendingReferralPayouts,
                variant: "warning",
                label: "Pending payouts",
              }
            : undefined,
          safety: "monitor",
        },
        {
          title: "Reversed Referrals (Refund)",
          icon: RotateCcw,
          url: "/corebody/referrals/reversed-referrals",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Blocked / Invalid Referrals",
          icon: Ban,
          url: "/corebody/referrals/blocked-invalid-referrals",
          badge: coreBodyBadgeState.blockedReferrals > 0
            ? {
                count: coreBodyBadgeState.blockedReferrals,
                variant: "danger",
                label: "Fraud flags",
              }
            : undefined,
          warning: coreBodyBadgeState.blockedReferrals > 0,
          safety: "monitor",
        },
      ],
    },

    // ── 7) UPGRADE & STATUS ──
    {
      groupLabel: "Upgrade & Status",
      groupIcon: ArrowUpCircle,
      purpose: "Role lifecycle, investment posture, and upgrade/reactivation pathways.",
      items: [
        {
          title: "Upgrade Eligibility",
          icon: ListChecks,
          url: "/corebody/upgrade/upgrade-eligibility",
          readOnly: true,
          badge: coreBodyBadgeState.pendingUpgrades > 0
            ? {
                count: coreBodyBadgeState.pendingUpgrades,
                variant: "default",
                label: "Upgrade candidates",
              }
            : undefined,
          safety: "monitor",
        },
        {
          title: "Investment Status",
          icon: Landmark,
          url: "/corebody/upgrade/investment-status",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Monthly / Annual Cap Status",
          icon: Gauge,
          url: "/corebody/upgrade/monthly-annual-cap-status",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Reactivation Request",
          icon: RotateCcw,
          url: "/corebody/upgrade/reactivation-request",
          readOnly: coreBodyType === "A",
          safety: "monitor",
        },
        {
          title: "Rules & Limitations",
          icon: FileText,
          url: "/corebody/upgrade/rules-limitations",
          readOnly: true,
          safety: "monitor",
        },
      ],
    },

    // ── 8) ACTIVITY & ALERTS ──
    {
      groupLabel: "Activity & Alerts",
      groupIcon: Bell,
      purpose: "Auto-generated and admin-triggered risk, inactivity, and compliance notices.",
      items: [
        {
          title: "System Alerts",
          icon: Bell,
          url: "/corebody/activity-alerts/system-alerts",
          badge: coreBodyBadgeState.activityAlerts > 0
            ? {
                count: coreBodyBadgeState.activityAlerts,
                variant: "danger",
                label: "System alerts",
              }
            : undefined,
          warning: coreBodyBadgeState.activityAlerts > 0,
          safety: "monitor",
        },
        {
          title: "Inactivity Warnings",
          icon: UserMinus,
          url: "/corebody/activity-alerts/inactivity-warnings",
          badge: coreBodyBadgeState.inactivityWarnings > 0
            ? {
                count: coreBodyBadgeState.inactivityWarnings,
                variant: "warning",
                label: "Inactivity warnings",
              }
            : undefined,
          safety: "monitor",
        },
        {
          title: "SLA Violations",
          icon: AlertTriangle,
          url: "/corebody/activity-alerts/sla-violations",
          badge: coreBodyBadgeState.slaViolations > 0
            ? {
                count: coreBodyBadgeState.slaViolations,
                variant: "warning",
                label: "SLA breaches",
              }
            : undefined,
          warning: coreBodyBadgeState.slaViolations > 0,
          safety: "monitor",
        },
        {
          title: "Compliance Notices",
          icon: Scale,
          url: "/corebody/activity-alerts/compliance-notices",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Admin Messages",
          icon: MessageSquare,
          url: "/corebody/activity-alerts/admin-messages",
          safety: "monitor",
        },
      ],
    },

    // ── 9) REPORTS & LOGS ──
    {
      groupLabel: "Reports & Logs",
      groupIcon: FileBarChart,
      purpose: "Immutable audit-safe reporting and district traceability exports.",
      items: [
        {
          title: "Earnings Reports",
          icon: FileBarChart,
          url: "/corebody/reports/earnings",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Stock Reports",
          icon: Archive,
          url: "/corebody/reports/stock",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Order Reports",
          icon: ClipboardList,
          url: "/corebody/reports/orders",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Activity Logs",
          icon: Activity,
          url: "/corebody/reports-logs/activity-logs",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "Financial Ledger Export",
          icon: Download,
          url: "/corebody/reports-logs/financial-ledger-export",
          readOnly: true,
          safety: "monitor",
        },
        {
          title: "District Performance Report",
          icon: BarChart3,
          url: "/corebody/reports/dealer-performance",
          readOnly: true,
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
    group.items.filter((item) => {
      if (item.coreBodyAOnly && coreBodyType !== "A") return false;
      return true;
    })
  );
}
