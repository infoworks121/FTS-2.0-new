import UnifiedProfile from "@/components/UnifiedProfile";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DealerProfile() {
  return (
    <DashboardLayout role="dealer" navItems={[]} roleLabel="Dealer Profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your settings and addresses</p>
        </div>
        <UnifiedProfile variant="tabbed" />
      </div>
    </DashboardLayout>
  );
}