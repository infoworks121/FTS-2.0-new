import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  Users,
  Wallet,
  User,
  BarChart3,
  History,
  Clock,
  FileText,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface DealerNavItem {
  title: string;
  icon?: LucideIcon;
  url?: string;
  submenu?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  badge?: {
    count: number;
    variant?: "default" | "warning" | "danger" | "success";
  };
}

export const getDealerNavItems = (): DealerNavItem[] => {
  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dealer",
    },
    {
      title: "Product Management",
      icon: Package,
      submenu: [
        {
          title: "My Mapped Products",
          url: "/dealer/products",
        },
        {
          title: "Product Insights",
          url: "/dealer/products/insights",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Inventory Management",
      icon: Boxes,
      submenu: [
        {
          title: "Stock Balances",
          url: "/dealer/inventory",
        },
        {
          title: "Inventory Ledger",
          url: "/dealer/inventory/ledger",
          icon: History,
        },
        {
          title: "Stock Arrivals",
          url: "/dealer/inventory/arrivals",
          icon: Truck,
        },
      ],
    },
    {
      title: "Order Fulfillment",
      icon: Truck,
      submenu: [
        {
          title: "Assigned Orders",
          url: "/dealer/orders",
        },
        {
          title: "Fulfillment History",
          url: "/dealer/orders/history",
          icon: Clock,
        },
      ],
    },
    {
      title: "Dealer Network",
      icon: Users,
      submenu: [
        {
          title: "Subdivision Businessmen",
          url: "/dealer/network",
        },
      ],
    },
    {
      title: "Earnings & Wallet",
      icon: Wallet,
      submenu: [
        {
          title: "My Wallet",
          url: "/dealer/wallet",
        },
        {
          title: "Transaction History",
          url: "/dealer/wallet/history",
          icon: FileText,
        },
      ],
    },
    {
      title: "Profile & Settings",
      icon: Settings,
      submenu: [
        {
          title: "Dealer Profile",
          url: "/dealer/profile",
          icon: User,
        },
      ],
    },
  ];
};
