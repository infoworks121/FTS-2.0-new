import { Link, useLocation } from "react-router-dom";
import { Home, Store, Package, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/marketplace" },
  { icon: Package, label: "Orders", path: "/orders" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Store, label: "More", path: "/referrals" },
];

export function MobileTabBar() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 flex">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
        return (
          <Link key={tab.path} to={tab.path}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 transition-default",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
