import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Package, Wallet, Users, Settings, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifications, timeAgo } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const typeIcons = { order: Package, wallet: Wallet, referral: Users, system: Settings };

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(notifications);
  const navigate = useNavigate();

  const filtered = items.filter(n => filter === "all" || n.type === filter);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setItems(items.map(n => ({ ...n, read: true })))}>
          <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "order", "wallet", "referral", "system"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium transition-default capitalize shrink-0",
              filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(n => {
          const Icon = typeIcons[n.type];
          return (
            <button key={n.id} onClick={() => navigate(n.link)}
              className={cn("card-base p-4 flex items-start gap-3 w-full text-left transition-default hover:bg-muted/50", !n.read && "bg-primary/5 border-primary/20")}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.timestamp)}</p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
