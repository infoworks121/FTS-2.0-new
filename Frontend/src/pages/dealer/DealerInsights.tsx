import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { BarChart3 } from "lucide-react";

export default function DealerInsights() {
  const navItems = getDealerNavItems();
  return (
    <DashboardLayout role="dealer" navItems={navItems as any}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Product Insights</h1>
        <p className="text-muted-foreground">Regional demand and performance reporting for your subdivision.</p>
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
           <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
           <p>Insights Dashboard coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
