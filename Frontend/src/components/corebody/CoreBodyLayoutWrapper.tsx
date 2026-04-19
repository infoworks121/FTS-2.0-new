import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getCoreBodyFlatNavItems, getUserContext } from "@/config/coreBodySidebarConfig";

interface CoreBodyLayoutWrapperProps {
  children: React.ReactNode;
}

export function CoreBodyLayoutWrapper({ children }: CoreBodyLayoutWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null; // Or a smaller loader
  }

  const context = getUserContext(user);
  const navItems = getCoreBodyFlatNavItems(context);
  
  // District info
  const distName = user?.district_name || 'District';
  const typeLabel = context.coreBodyType === 'Dealer' ? 'Dealer' : `Type ${context.coreBodyType}`;
  const roleLabel = `Core Body — ${typeLabel} (${distName})`;

  return (
    <DashboardLayout 
      role="corebody" 
      navItems={navItems as any} 
      roleLabel={roleLabel}
    >
      {children}
    </DashboardLayout>
  );
}

export default CoreBodyLayoutWrapper;
