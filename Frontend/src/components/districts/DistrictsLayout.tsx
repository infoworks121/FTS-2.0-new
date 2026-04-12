import React from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";

interface DistrictsLayoutProps {
  children: React.ReactNode;
}

export function DistrictsLayout({ children }: DistrictsLayoutProps) {
  return (
    <DashboardLayout
      role="admin"
      navItems={sidebarNavItems as NavItem[]}
      roleLabel="Super Admin"
    >
      {children}
    </DashboardLayout>
  );
}

export default DistrictsLayout;
