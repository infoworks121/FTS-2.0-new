import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, ShoppingCart, User, Menu, X, ChevronDown, LogOut, Package, Wallet, Users, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { currentUser, notifications } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

export function TopNavbar() {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/marketplace/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b h-14 flex items-center px-4 gap-3">
      <Link to="/marketplace" className="flex items-center gap-2 shrink-0">
        <img src="/fts-logo.jpeg" alt="FTS" className="w-12 h-12 rounded-lg object-cover" />
        <span className="font-semibold text-foreground hidden sm:block">FTS</span>
      </Link>

      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products, orders..." className="pl-9 bg-muted border-0 rounded-lg h-9"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <button className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
        <Search className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" onClick={toggleDark}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">{unreadCount}</span>
          )}
        </Button>

        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">{itemCount}</span>
          )}
        </Button>

        <div className="relative">
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-default">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">{currentUser.name.charAt(0)}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl border shadow-lg z-50 py-1 animate-scale-in">
                <div className="px-3 py-2 border-b">
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                {[
                  { icon: User, label: "Profile", path: "/profile" },
                  { icon: Package, label: "Orders", path: "/orders" },
                  { icon: Wallet, label: "Wallet", path: "/wallet" },
                  { icon: Users, label: "Referrals", path: "/referrals" },
                ].map(item => (
                  <Link key={item.path} to={item.path} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-default">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
                <div className="border-t mt-1">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted w-full transition-default"
                    onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b p-3 md:hidden animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products, orders..." className="pl-9 bg-muted border-0 rounded-lg" autoFocus
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          </div>
        </div>
      )}
    </header>
  );
}
