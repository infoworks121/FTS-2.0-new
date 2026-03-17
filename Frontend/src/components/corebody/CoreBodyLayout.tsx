import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Bell,
  User,
  LogOut,
  Building2,
  Sun,
  Moon,
  Eye,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTheme } from "@/hooks/useTheme";
import {
  CoreBodyType,
  CoreBodyNavGroup,
  CoreBodyNavItem,
  CoreBodyBadge,
  CapData,
  getCoreBodyNavGroups,
  defaultCapData,
  coreBodyBadgeState,
} from "@/config/coreBodySidebarConfig";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CoreBodyLayoutProps {
  children: React.ReactNode;
  coreBodyType: CoreBodyType;
  districtName: string;
  capData?: CapData;
}

// ─── Badge Variant Colors ────────────────────────────────────────────────────

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-500 text-white",
  success: "bg-green-500 text-white",
};

// ─── Cap Progress (Sidebar Mini) ─────────────────────────────────────────────

function SidebarCapProgress({
  current,
  max,
  label,
  period,
  collapsed,
}: CapData & { collapsed: boolean }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearCap = percentage >= 80;
  const isAtCap = percentage >= 100;
  const capStateLabel = isAtCap ? "Auto-stop" : isNearCap ? "Near limit" : "Healthy";

  const colorClass = isAtCap
    ? "bg-red-500"
    : isNearCap
    ? "bg-amber-500"
    : "bg-emerald-500";

  const textColorClass = isAtCap
    ? "text-red-400"
    : isNearCap
    ? "text-amber-400"
    : "text-emerald-400";

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mx-auto flex flex-col items-center gap-1 px-1 py-2">
            <div className="h-12 w-1.5 rounded-full bg-muted overflow-hidden flex flex-col-reverse">
              <div
                className={cn("w-full rounded-full transition-all duration-500", colorClass)}
                style={{ height: `${percentage}%` }}
              />
            </div>
            <span className={cn("text-[9px] font-bold font-mono", textColorClass)}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p className="font-semibold">{label}</p>
          <p className="text-muted-foreground">Annual / Monthly Cap Usage</p>
          <p className="font-mono">
            ₹{current.toLocaleString()} / ₹{max.toLocaleString()}
          </p>
          {isAtCap && <p className="text-red-400 font-semibold mt-1">🛑 Auto-stopped</p>}
          {isNearCap && !isAtCap && (
            <p className="text-amber-400 font-semibold mt-1">⚠ Near limit</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-1.5 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <span className={cn("text-[10px] font-bold font-mono", textColorClass)}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">Annual / Monthly Cap Usage</span>
            <span
              className={cn(
                "text-[9px] font-semibold",
                isAtCap ? "text-red-400" : isNearCap ? "text-amber-400" : "text-emerald-400"
              )}
            >
              {capStateLabel}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colorClass)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-muted-foreground">
              ₹{current.toLocaleString()}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">
              ₹{max.toLocaleString()}
            </span>
          </div>
          {isAtCap && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-red-400 font-semibold">Auto-stopped</span>
            </div>
          )}
          {isNearCap && !isAtCap && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] text-amber-400 font-semibold">Approaching limit</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        <p className="font-medium">Annual / Monthly Cap Usage</p>
        <p>
          {period === "monthly" ? "Monthly" : "Annual"}: <span className="font-mono font-bold">{percentage.toFixed(1)}%</span>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Authority Badge ─────────────────────────────────────────────────────────

function AuthorityBadge({
  coreBodyType,
  collapsed,
}: {
  coreBodyType: CoreBodyType;
  collapsed: boolean;
}) {
  const isA = coreBodyType === "A";

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "mx-auto flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-black tracking-tight",
              isA
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
            )}
          >
            {coreBodyType}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-semibold">Type: {coreBodyType}</p>
          <p className="text-muted-foreground text-[10px]">
            {isA ? "Full stock & supply authority" : "Limited authority — upgrade eligible"}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold",
        isA
          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      )}
    >
      <Shield className="h-3.5 w-3.5" />
      <span>Type: {coreBodyType}</span>
      {isA && (
        <span className="ml-auto text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
          Full Access
        </span>
      )}
      {!isA && (
        <span className="ml-auto text-[9px] bg-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
          Limited
        </span>
      )}
    </div>
  );
}

// ─── Single Nav Item ─────────────────────────────────────────────────────────

function NavItem({
  item,
  collapsed,
  coreBodyType,
}: {
  item: CoreBodyNavItem;
  collapsed: boolean;
  coreBodyType: CoreBodyType;
}) {
  const location = useLocation();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const isActive = location.pathname === item.url;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isSubmenuActive = hasSubmenu && item.submenu?.some(sub => location.pathname === sub.url);
  const isDisabled = item.coreBodyAOnly && coreBodyType === "B";
  const IconComponent = item.icon;

  // Disabled state for Core Body B on A-only items
  if (isDisabled) {
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center rounded-md px-3 py-2 text-sm opacity-30 cursor-not-allowed">
              <IconComponent className="h-4 w-4 shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span>{item.title}</span>
            </div>
            <p className="text-muted-foreground text-[10px] mt-0.5">Core Body A only</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm opacity-30 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <IconComponent className="h-4 w-4 shrink-0" />
          <span className="text-sidebar-foreground">{item.title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider">A only</span>
        </div>
        <Lock className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }

  // Collapsed mode
  if (collapsed) {
    const content = (
      <div
        className={cn(
          "flex items-center justify-center rounded-md px-3 py-2 text-sm transition-colors relative group",
          (isActive || isSubmenuActive)
            ? "bg-sidebar-accent text-sidebar-primary font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {(isActive || isSubmenuActive) && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
        )}
        <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
        {item.badge && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold px-0.5",
              badgeVariants[item.badge.variant || "default"]
            )}
          >
            {item.badge.count > 99 ? "99+" : item.badge.count}
          </span>
        )}
      </div>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {hasSubmenu ? (
            <button onClick={() => setSubmenuOpen(!submenuOpen)} className="w-full">
              {content}
            </button>
          ) : (
            <Link to={item.url || "#"}>{content}</Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <div className="flex items-center gap-1.5">
            <span>{item.title}</span>
            {item.readOnly && <Eye className="h-3 w-3 text-muted-foreground" />}
          </div>
          {hasSubmenu && (
            <div className="mt-1 space-y-0.5">
              {item.submenu?.map(sub => (
                <Link key={sub.url} to={sub.url} className="block text-[10px] text-muted-foreground hover:text-foreground">
                  • {sub.title}
                </Link>
              ))}
            </div>
          )}
          {item.badge && (
            <p className="text-muted-foreground font-mono mt-0.5">
              {item.badge.label ? `${item.badge.label}: ` : ""}
              {item.badge.count}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded mode with submenu support
  if (hasSubmenu) {
    return (
      <Collapsible open={submenuOpen} onOpenChange={setSubmenuOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors relative group",
            item.warning && "border-l-2 border-amber-500/50",
            (isActive || isSubmenuActive)
              ? "bg-sidebar-accent text-sidebar-primary font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {(isActive || isSubmenuActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
          )}
          <div className="flex items-center gap-3">
            <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
            <span>{item.title}</span>
            {item.coreBodyAOnly && (
              <span className="text-[9px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                A only
              </span>
            )}
            {item.readOnly && <Eye className="h-3 w-3 text-muted-foreground opacity-50" />}
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span
                className={cn(
                  "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1",
                  badgeVariants[item.badge.variant || "default"]
                )}
              >
                {item.badge.count > 99 ? "99+" : item.badge.count}
              </span>
            )}
            {submenuOpen ? (
              <ChevronDown className="h-3 w-3 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 mt-0.5 ml-7">
          {item.submenu?.map((subItem) => {
            const isSubActive = location.pathname === subItem.url;
            const isSubDisabled = subItem.coreBodyAOnly && coreBodyType === "B";
            
            if (isSubDisabled) {
              return (
                <div
                  key={subItem.url}
                  className="flex items-center justify-between rounded-md px-3 py-1.5 text-xs opacity-30 cursor-not-allowed"
                >
                  <span>{subItem.title}</span>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              );
            }

            return (
              <Link
                key={subItem.url}
                to={subItem.url}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors",
                  isSubActive
                    ? "bg-sidebar-accent/50 text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{subItem.title}</span>
                  {subItem.readOnly && <Eye className="h-3 w-3 text-muted-foreground opacity-50" />}
                </div>
                {subItem.badge && (
                  <span
                    className={cn(
                      "min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-0.5",
                      badgeVariants[subItem.badge.variant || "default"]
                    )}
                  >
                    {subItem.badge.count > 99 ? "99+" : subItem.badge.count}
                  </span>
                )}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Expanded mode without submenu
  return (
    <Link
      to={item.url || "#"}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors relative group",
        item.warning && "border-l-2 border-amber-500/50",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
      )}
      <div className="flex items-center gap-3">
        <IconComponent className={cn("h-4 w-4 shrink-0", item.warning && "text-amber-400")} />
        <span>{item.title}</span>
        {item.coreBodyAOnly && (
          <span className="text-[9px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
            A only
          </span>
        )}
        {item.readOnly && <Eye className="h-3 w-3 text-muted-foreground opacity-50" />}
      </div>
      {item.badge && (
        <span
          className={cn(
            "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1",
            badgeVariants[item.badge.variant || "default"]
          )}
        >
          {item.badge.count > 99 ? "99+" : item.badge.count}
        </span>
      )}
    </Link>
  );
}

// ─── Nav Group ───────────────────────────────────────────────────────────────

function NavGroup({
  group,
  collapsed,
  coreBodyType,
}: {
  group: CoreBodyNavGroup;
  collapsed: boolean;
  coreBodyType: CoreBodyType;
}) {
  const location = useLocation();
  const visibleItems = group.items.filter((item) => {
    // Don't completely hide A-only items for B — show them disabled
    return true;
  });

  // Check if entire group is A-only and user is B
  const allAOnly = group.items.every((item) => item.coreBodyAOnly);
  const isGroupDisabledForB = allAOnly && coreBodyType === "B";

  const isAnyActive = visibleItems.some((item) => location.pathname === item.url);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const GroupIcon = group.groupIcon;

  if (collapsed) {
    // In collapsed mode, show compact group marker with tooltip, then items
    return (
      <div className="space-y-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center justify-center py-1 mt-2",
                isGroupDisabledForB && "opacity-30"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/40">
                <GroupIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-semibold">
            <p>{group.groupLabel}</p>
            <p className="text-[10px] font-normal text-muted-foreground max-w-[220px]">{group.purpose}</p>
            {isGroupDisabledForB && (
              <p className="text-muted-foreground font-normal text-[10px]">Core Body A only</p>
            )}
          </TooltipContent>
        </Tooltip>
        {visibleItems.map((item) => (
          <NavItem
            key={item.url || item.title}
            item={item}
            collapsed={collapsed}
            coreBodyType={coreBodyType}
          />
        ))}
      </div>
    );
  }

  // Expanded mode — collapsible group
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors mt-3 first:mt-0",
          isGroupDisabledForB && "opacity-40",
          isAnyActive || isOpen
            ? "text-sidebar-primary"
            : "text-muted-foreground hover:text-sidebar-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <GroupIcon className="h-3.5 w-3.5" />
          <span>{group.groupLabel}</span>
          {isGroupDisabledForB && <Lock className="h-3 w-3 ml-1" />}
        </div>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
      </CollapsibleTrigger>
      {isOpen && !collapsed && (
        <p className="px-3 pb-1 text-[10px] text-muted-foreground leading-tight">{group.purpose}</p>
      )}
      <CollapsibleContent className="space-y-0.5 mt-0.5">
        {visibleItems.map((item) => (
          <NavItem
            key={item.url || item.title}
            item={item}
            collapsed={collapsed}
            coreBodyType={coreBodyType}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export function CoreBodyLayout({
  children,
  coreBodyType,
  districtName,
  capData = defaultCapData,
}: CoreBodyLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const navGroups = useMemo(
    () => getCoreBodyNavGroups(coreBodyType),
    [coreBodyType]
  );

  // Calculate total badge count for notification bell
  const totalBadges = useMemo(() => {
    return navGroups.reduce((acc, group) => {
      return (
        acc +
        group.items.reduce((itemAcc, item) => {
          return itemAcc + (item.badge?.count || 0);
        }, 0)
      );
    }, 0);
  }, [navGroups]);

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "[" && e.ctrlKey) {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div
      className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-300"
      onKeyDown={handleKeyDown}
    >
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-[272px]"
        )}
      >
        {/* ── Header: Title ── */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">
                  Core Body Panel
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  District: {districtName}
                </span>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <Building2 className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">Core Body Panel</p>
                <p className="text-muted-foreground text-[10px]">District: {districtName}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* ── Authority Badge + Cap Progress ── */}
        <div className={cn("border-b border-sidebar-border", collapsed ? "px-2 py-2" : "px-3 py-3")}>
          <div className="space-y-2">
            <AuthorityBadge coreBodyType={coreBodyType} collapsed={collapsed} />
            <SidebarCapProgress {...capData} collapsed={collapsed} />
          </div>
        </div>

        {/* ── Navigation Groups ── */}
        <nav
          className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin"
          role="navigation"
          aria-label="Core Body district authority navigation"
        >
          {navGroups.map((group) => (
            <NavGroup
              key={group.groupLabel}
              group={group}
              collapsed={collapsed}
              coreBodyType={coreBodyType}
            />
          ))}
        </nav>

        {/* ── Collapse Toggle ── */}
        <div className="border-t border-sidebar-border p-2 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex w-full items-center justify-center rounded-md py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    collapsed && "rotate-180"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand sidebar (Ctrl+[)" : "Collapse sidebar (Ctrl+[)"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <span className="text-sm text-muted-foreground">
              {location.pathname
                .split("/")
                .filter(Boolean)
                .map((path, i, arr) => (
                  <span key={path}>
                    {i > 0 && <span className="mx-1 text-border">/</span>}
                    <span className={cn("capitalize", i === arr.length - 1 && "text-foreground font-medium")}>
                      {path.replace(/-/g, " ")}
                    </span>
                  </span>
                ))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Wallet Balance (read-only) */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs text-muted-foreground font-mono cursor-default hover:bg-transparent"
            >
              <Eye className="h-3.5 w-3.5" />
              ₹{capData.current.toLocaleString()}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative transition-colors duration-300"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <Sun
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-all duration-300",
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0 absolute"
                )}
              />
              <Moon
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-all duration-300",
                  theme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0 absolute"
                )}
              />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {totalBadges > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>

            {/* Profile */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/")}
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
