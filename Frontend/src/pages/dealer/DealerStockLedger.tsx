import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { History } from "lucide-react";

export default function DealerStockLedger() {
  const navItems = getDealerNavItems();
  return (
    <DashboardLayout role="dealer" navItems={navItems as any}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Inventory Ledger</h1>
        <p className="text-muted-foreground">Full audit trail of stock movements, additions, and subtractions.</p>
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
           <History className="h-12 w-12 mb-4 opacity-20" />
           <p>Stock Ledger view coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
