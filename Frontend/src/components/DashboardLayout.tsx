import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
  Bell,
  Wallet,
  User,
  LogOut,
  Shield,
  Building2,
  Briefcase,
  LayoutDashboard,
  Package,
  Percent,
  MapPin,
  Users,
  ShoppingCart,
  ShieldAlert,
  FileText,
  Settings,
  Lock,
  Sun,
  Moon,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { CartSheet } from "./cart/CartSheet";
import { walletApi } from "@/lib/walletApi";
import { adminApi } from "@/lib/adminApi";

export type UserRole = "admin" | "corebody" | "businessman" | "dealer" | "stock_point";

interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  submenu?: NavItem[];
  disabled?: boolean;
  disabledReason?: string;
  badge?: {
    count: number;
    variant?: "default" | "warning" | "danger" | "success";
  };
  warning?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  navItems: NavItem[];
  roleLabel: string;
}

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Shield,
  corebody: Building2,
  businessman: Briefcase,
  dealer: Store,
  stock_point: Package,
};

const roleColors: Record<UserRole, string> = {
  admin: "text-blue-400",
  corebody: "text-purple-400",
  businessman: "text-green-400",
  dealer: "text-emerald-400",
  stock_point: "text-yellow-400",
};

const getIcon = (iconName: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    LayoutDashboard, Package, Percent, MapPin, Users,
    Wallet, ShoppingCart, ShieldAlert, FileText, Settings,
  };
  return icons[iconName] || Settings;
};

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-500 text-white",
  success: "bg-green-500 text-white",
};

function NavItemComponent({
  item,
  collapsed,
  level = 0,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  level?: number;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isChildActive = item.submenu?.some(
    (sub) => sub.url && location.pathname.startsWith(sub.url)
  );
  const [isOpen, setIsOpen] = useState(item.isOpen || isChildActive || false);

  const isActive = location.pathname === item.url;
  const isDisabled = !!item.disabled;
  const IconComponent =
    typeof item.icon === "string"
      ? getIcon(item.icon as string)
      : item.icon || Settings;

  if (isDisabled) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-md px-3 py-2 text-sm opacity-40 cursor-not-allowed",
          level > 0 && "ml-4",
          item.warning && "border-l-2 border-amber-500"
        )}
        title={item.disabledReason || "Temporarily unavailable"}
      >
        <div className="flex items-center gap-3">
          <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
          {!collapsed && <span>{item.title}</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className={cn(
                "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1",
                badgeVariants[item.badge.variant || "default"]
              )}>
                {item.badge.count > 99 ? "99+" : item.badge.count}
              </span>
            )}
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  // Collapsed: show icon only
  if (collapsed) {
    return (
      <Link
        to={item.url || "#"}
        className={cn(
          "flex items-center justify-center rounded-md px-3 py-2 text-sm transition-colors relative",
          isActive || isChildActive
            ? "bg-sidebar-accent text-sidebar-primary font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        title={item.title}
        onClick={onNavigate}
      >
        <IconComponent className="h-4 w-4 shrink-0" />
        {item.badge && (
          <span className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1",
            badgeVariants[item.badge.variant || "default"]
          )}>
            {item.badge.count > 99 ? "99+" : item.badge.count}
          </span>
        )}
      </Link>
    );
  }

  // Has submenu
  if (hasSubmenu) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
            level > 0 && "ml-4",
            item.warning && "border-l-2 border-amber-500",
            isChildActive || isOpen
              ? "bg-sidebar-accent text-sidebar-primary font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
            <span className="flex-1 text-left truncate">{item.title}</span>
            {item.badge && (
              <span className={cn(
                "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1 mr-1 shrink-0",
                badgeVariants[item.badge.variant || "default"]
              )}>
                {item.badge.count > 99 ? "99+" : item.badge.count}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 ml-1" />
          ) : (
            <ChevronRightIcon className="h-3 w-3 shrink-0 ml-1" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-1">
          {item.submenu?.map((subItem) => (
            <NavItemComponent
              key={subItem.url || subItem.title}
              item={subItem}
              collapsed={collapsed}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Simple link
  return (
    <Link
      to={item.url || "#"}
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
        level > 0 && "ml-4",
        item.warning && "border-l-2 border-amber-500",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      onClick={onNavigate}
    >
      <div className="flex items-center gap-3 min-w-0">
        <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
        <span className="truncate">{item.title}</span>
      </div>
      {item.badge && (
        <span className={cn(
          "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1 shrink-0",
          badgeVariants[item.badge.variant || "default"]
        )}>
          {item.badge.count > 99 ? "99+" : item.badge.count}
        </span>
      )}
    </Link>
  );
}

export function DashboardLayout({ children, role, navItems, roleLabel }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  // Desktop: collapsed icon-only | Mobile: hidden/overlay
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const RoleIcon = roleIcons[role];
  const { theme, toggleTheme } = useTheme();
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await walletApi.getMyWallet();
        if (data && data.wallet) {
          setBalance(data.wallet.main_balance);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchBalance();
    
    // Optional: set up interval to refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await adminApi.getLowStockAlerts(5);
        if (data && data.alerts) {
          setLowStockAlerts(data.alerts);
          setAlertsCount(data.count);
        }
      } catch (e) { 
        console.error("Error fetching low stock alerts", e); 
      }
    };

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 60000); // 1 minute
    return () => clearInterval(alertInterval);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.full_name || "User";
  const userEmail = user.email || "user@example.com";
  const userPhone = user.phone || "N/A";
  const userRole = user.role_code || role;
  const businessmanType = user.businessman_type;
  const coreBodyType = user.core_body_type;

  const getSubRoleLabel = () => {
    if (userRole === "dealer") {
      return "SUBDIVISION DEALER";
    }
    if (userRole === "businessman" && businessmanType) {
      return businessmanType.replace("_", " ").toUpperCase();
    }
    if (userRole.startsWith("core_body") && coreBodyType) {
      return `CORE BODY TYPE ${coreBodyType}`;
    }
    return roleLabel;
  };

  const finalRoleLabel = getSubRoleLabel();

  const getProfileRoute = () => {
    switch (role) {
      case "admin": return "/admin/profile";
      case "corebody": return "/corebody/profile";
      case "businessman": return "/businessman/profile";
      case "dealer": return "/dealer/profile";
      default: return "#";
    }
  };

  const totalBadges = navItems.reduce((acc, item) => {
    if (item.badge) return acc + item.badge.count;
    if (item.submenu)
      return acc + item.submenu.reduce((s, sub) => s + (sub.badge?.count || 0), 0);
    return acc;
  }, 0);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 shrink-0">
        {!collapsed || isMobile ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shrink-0">
              FTS
            </div>
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight">FTS Platform</span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
            FTS
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className={cn("border-b border-sidebar-border px-4 py-3 shrink-0", collapsed && !isMobile && "px-2")}>
        <div className={cn(
          "flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-2",
          collapsed && !isMobile && "justify-center px-0"
        )}>
          <RoleIcon className={cn("h-4 w-4 shrink-0", roleColors[role])} />
          {(!collapsed || isMobile) && (
            <span className="text-[11px] font-bold text-sidebar-accent-foreground truncate">
              {finalRoleLabel} - {userName}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5">
        {navItems.map((item, index) => (
          <NavItemComponent
            key={item.url || item.title || index}
            item={item}
            collapsed={collapsed && !isMobile}
            onNavigate={isMobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Collapse Toggle — desktop only */}
      {!isMobile && (
        <div className="border-t border-sidebar-border p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-md py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-300">

      {/* ── MOBILE OVERLAY ── */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE SIDEBAR (drawer) ── */}
      {isMobile && (
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Close button */}
          <button
            className="absolute top-3 right-3 rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
          {sidebarContent}
        </aside>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}>
          {sidebarContent}
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile: open drawer | desktop: toggle collapse */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed(!collapsed)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {location.pathname.split("/").filter(Boolean).map((path, i) => (
                <span key={`${path}-${i}`}>
                  {i > 0 && " / "}
                  <span className="capitalize">{path}</span>
                </span>
              ))}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground font-mono hidden md:flex">
              <Wallet className="h-3.5 w-3.5" />
              {balance !== null ? `₹${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading..."}
            </Button>

            {/* Cart Sheet */}
            <CartSheet />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <Sun className={cn("h-4 w-4 text-muted-foreground transition-all duration-300",
                theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0 absolute"
              )} />
              <Moon className={cn("h-4 w-4 text-muted-foreground transition-all duration-300",
                theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0 absolute"
              )} />
            </Button>

            {/* Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {(totalBadges > 0 || alertsCount > 0) && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                      {(totalBadges + alertsCount) > 99 ? '99+' : (totalBadges + alertsCount)}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-bold flex items-center justify-between">
                  <span>Notifications</span>
                  {alertsCount > 0 && <span className="text-[10px] uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{alertsCount} Low Stock</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {alertsCount > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {lowStockAlerts.map(alert => (
                      <DropdownMenuItem key={alert.balance_id} className="flex flex-col items-start p-3 gap-1 cursor-pointer focus:bg-red-50 focus:text-red-900 transition-colors" onClick={() => navigate('/admin/products')}>
                        <div className="flex items-start justify-between w-full">
                           <span className="font-semibold text-sm line-clamp-2 pr-2">{alert.product_name}</span>
                           <span className="text-xs font-black bg-red-500 text-white shadow-sm px-1.5 py-0.5 rounded shrink-0">Qty: {alert.quantity_on_hand}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                          <span className="font-mono bg-muted px-1 py-0.5 rounded">{alert.product_sku}{alert.sku_suffix ? alert.sku_suffix : ''}</span>
                          {alert.variant_name && <span className="text-muted-foreground/70 text-[10px] uppercase truncate">{alert.variant_name}</span>}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                     <Bell className="h-6 w-6 text-muted-foreground/30 mb-2" />
                     <p>All caught up!</p>
                     <p className="text-xs">No active alerts or low stock warnings.</p>
                  </div>
                )}
                
                {(alertsCount > 0) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="w-full justify-center p-2 text-xs font-semibold text-blue-600 focus:bg-blue-50 focus:text-blue-700 cursor-pointer" onClick={() => navigate('/admin/products')}>
                      View Inventory Management
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Phone: {userPhone}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Role: {finalRoleLabel}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getProfileRoute())}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export type { NavItem };
