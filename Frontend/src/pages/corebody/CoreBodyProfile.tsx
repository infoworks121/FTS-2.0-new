import UnifiedProfile from "@/components/UnifiedProfile";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getCoreBodyFlatNavItems } from "@/config/coreBodySidebarConfig";

export default function CoreBodyProfile() {
  const getUserType = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role_code === 'core_body_b') return 'B';
      if (user.role_code === 'dealer') return 'Dealer';
      return 'A';
    } catch {
      return 'A';
    }
  };
  const navItems = getCoreBodyFlatNavItems(getUserType() as any);

  return (
    <DashboardLayout role="corebody" navItems={navItems as any} roleLabel="Core Body Profile">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your settings, addresses, and installments</p>
        </div>
        <UnifiedProfile variant="tabbed" />
      </div>
    </DashboardLayout>
  );
}