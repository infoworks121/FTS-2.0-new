import React from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";

interface ProductsPageLayoutProps {
  children: React.ReactNode;
}

export function ProductsPageLayout({ children }: ProductsPageLayoutProps) {
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

export default ProductsPageLayout;
