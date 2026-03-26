import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import UnifiedProfile from "@/components/UnifiedProfile";
import { sidebarNavItems } from "@/config/sidebarConfig";

export default function AdminProfile() {
  return (
    <DashboardLayout role="admin" navItems={sidebarNavItems as NavItem[]} roleLabel="Super Admin">
      <UnifiedProfile />
    </DashboardLayout>
  );
}