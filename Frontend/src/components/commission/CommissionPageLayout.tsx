import React from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";

interface CommissionPageLayoutProps {
  children: React.ReactNode;
}

export function CommissionPageLayout({ children }: CommissionPageLayoutProps) {
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

export default CommissionPageLayout;
