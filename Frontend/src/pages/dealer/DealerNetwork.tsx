import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { Users } from "lucide-react";

export default function DealerNetwork() {
  const navItems = getDealerNavItems();
  return (
    <DashboardLayout role="dealer" navItems={navItems as any} roleLabel="Subdivision Agent">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Subdivision Network</h1>
        <p className="text-muted-foreground">Businessmen and retailers connected to your supply node.</p>
        <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
           <Users className="h-12 w-12 mb-4 opacity-20" />
           <p>Network Directory coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
