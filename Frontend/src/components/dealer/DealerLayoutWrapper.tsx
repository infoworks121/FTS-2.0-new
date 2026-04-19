import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";

interface DealerLayoutWrapperProps {
  children: React.ReactNode;
}

export function DealerLayoutWrapper({ children }: DealerLayoutWrapperProps) {
  const [userName, setUserName] = useState<string>('Dealer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.full_name || 'Dealer');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  const navItems = getDealerNavItems();
  const roleLabel = `Subdivision Agent — ${userName}`;

  return (
    <DashboardLayout
      role="dealer"
      navItems={navItems as any}
      roleLabel={roleLabel}
    >
      {children}
    </DashboardLayout>
  );
}

export default DealerLayoutWrapper;
