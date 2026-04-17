import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { navItems as coreBodyNavItems } from "@/pages/CoreBodyDashboard";
import { sidebarNavItems as adminNavItems } from "@/config/sidebarConfig";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { coreBodyApi } from "@/lib/coreBodyApi";
import { UserProfileView } from "@/components/users/UserProfileView";

export default function UnifiedMemberProfile() {
  const { id: pathId, role: roleParam } = useParams<{ id: string, role?: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const id = pathId || queryId;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Determine if viewing from admin or corebody panel
  const isAdminView = location.pathname.startsWith('/admin');
  const viewerRole = isAdminView ? 'admin' : 'corebody';
  const layoutNavItems = isAdminView ? adminNavItems : coreBodyNavItems;
  const layoutLabel = isAdminView ? 'Super Admin — User Insight' : 'Core Body — Network Monitoring';

  // Determine target user role from route parameter or data
  const [userRole, setUserRole] = useState<string>(roleParam || 'businessman');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Using the directory user detail API as it returns a generic profile
        const response = await coreBodyApi.getDirectoryUserDetail(id);
        setData(response.profile);
        
        // Refine role if not provided in URL
        if (!roleParam) {
          const role = response.profile.role_code || response.profile.role || 'businessman';
          setUserRole(role);
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, roleParam]);

  const handleBack = () => {
    if (isAdminView) {
      navigate("/admin/users");
    } else {
      navigate("/corebody/dealers-businessmen/all-users");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={viewerRole as any} roleLabel={layoutLabel} navItems={layoutNavItems as NavItem[]}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Synchronizing profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout role={viewerRole as any} roleLabel={layoutLabel} navItems={layoutNavItems as NavItem[]}>
        <div className="p-12 text-center max-w-md mx-auto">
          <div className="bg-muted/30 p-8 rounded-2xl border-2 border-dashed border-border mb-6">
            <p className="text-muted-foreground mb-4 font-medium">This profile could not be located or access is restricted.</p>
            <Button onClick={handleBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Directory
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={viewerRole as any} roleLabel={layoutLabel} navItems={layoutNavItems as NavItem[]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack} className="rounded-full hover:bg-primary/5 hover:text-primary border-primary/20 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{data.name || data.full_name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Unified Profile Management — <span className="capitalize font-medium text-foreground/70">{userRole.replace('_', ' ')} Records</span>
              </p>
            </div>
          </div>
        </div>

        <UserProfileView 
          data={data} 
          role={userRole} 
          viewerRole={viewerRole} 
        />
      </div>
    </DashboardLayout>
  );
}
