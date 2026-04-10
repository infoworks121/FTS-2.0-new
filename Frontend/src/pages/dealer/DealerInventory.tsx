import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { Boxes } from "lucide-react";

export default function DealerInventory() {
  const navItems = getDealerNavItems();
  return (
    <DashboardLayout role="dealer" navItems={navItems as any} roleLabel="Subdivision Agent">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Inventory & Stock</h1>
        <p className="text-muted-foreground">Manage your auto-assigned stock from Core Bodies.</p>
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
           <Boxes className="h-12 w-12 mb-4 opacity-20" />
           <p>Inventory Dashboard coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
