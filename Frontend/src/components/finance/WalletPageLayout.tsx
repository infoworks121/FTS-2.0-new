import React from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";

interface WalletPageLayoutProps {
  children: React.ReactNode;
}

export function WalletPageLayout({ children }: WalletPageLayoutProps) {
  return (
    <DashboardLayout
      role="admin"
      navItems={sidebarNavItems as NavItem[]}
      roleLabel="Admin"
    >
      {children}
    </DashboardLayout>
  );
}

export default WalletPageLayout;
