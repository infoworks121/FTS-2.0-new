import React from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";

interface UsersLayoutProps {
  children: React.ReactNode;
}

export function UsersLayout({ children }: UsersLayoutProps) {
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

export default UsersLayout;
