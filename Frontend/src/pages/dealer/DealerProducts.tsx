import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { Package, ShieldCheck } from "lucide-react";

export default function DealerProducts() {
  const navItems = getDealerNavItems();
  return (
    <DashboardLayout role="dealer" navItems={navItems as any} roleLabel="Subdivision Agent">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Mapped Products</h1>
        <p className="text-muted-foreground">Products you are authorized to distribute in your subdivision.</p>
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
           <Package className="h-12 w-12 mb-4 opacity-20" />
           <p>Product Listing coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
