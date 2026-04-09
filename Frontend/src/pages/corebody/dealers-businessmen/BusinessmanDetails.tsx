import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Package, 
  Briefcase, 
  CreditCard, 
  Loader2, 
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { UserStatusBadge, ModeBadge } from "@/components/users/UserComponents";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { coreBodyApi } from "@/lib/coreBodyApi";
import { userApi, BusinessmanProfile } from "@/lib/userApi";

export default function BusinessmanDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessmanProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await coreBodyApi.getDirectoryUserDetail(id);
        setProfile(response.profile);
      } catch (error) {
        console.error("Error fetching businessman data:", error);
        toast.error("Failed to load businessman details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat("en-IN", { 
      style: "currency", 
      currency: "INR", 
      maximumFractionDigits: 0 
    }).format(value || 0);

  if (loading) {
    return (
      <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading businessman profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Businessman not found.</p>
          <Button variant="link" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
            Back to Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = profile.is_active && profile.is_approved ? "active" : (!profile.is_active ? "suspended" : "pending");

  return (
    <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">Viewing detailed businessman profile for operational monitoring.</p>
            </div>
          </div>
          <div className="flex gap-2">
             <ModeBadge mode={(profile.mode || profile.type || "entry") as any} />
             <UserStatusBadge status={status as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Summary Card */}
          <div className="col-span-1 space-y-4">
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
              <CardContent className="relative pt-0">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="h-24 w-24 bg-background rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon className="h-12 w-12" />
                    </div>
                  </div>
                </div>
                <div className="mt-14 text-center">
                  <h3 className="font-bold text-lg">{profile.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
                    ID: {id?.substring(0, 8)}...
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {profile.type?.replace('_', ' ') || 'Businessman'}
                    </Badge>
                    {profile.is_sph && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-bold">
                        <Store className="h-3 w-3 mr-1" /> isSPH
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-border/50">
                   <div className="flex items-start gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 truncate">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Email</p>
                        <p className="truncate">{profile.email || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Phone</p>
                        <p>{profile.phone || "—"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">District</p>
                        <p>{profile.district || "Not Assigned"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Member Since</p>
                        <p>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm">Account Summary</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Earnings</span>
                    <span className="font-bold text-profit">{formatCurrency(profile.commission_earned)}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-bold">0</span>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Detailed Content Tabs */}
          <div className="col-span-1 md:col-span-3">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-4 bg-muted/50 p-1 w-full justify-start overflow-x-auto">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> General Info
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Business Details
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Financials
                </TabsTrigger>
                <TabsTrigger value="logistics" className="flex items-center gap-2">
                  <Package className="h-4 w-4" /> Stock Point
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Primary profile details and operational metadata.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Full Name" value={profile.name} />
                    <DetailItem label="Email Address" value={profile.email} />
                    <DetailItem label="Phone Number" value={profile.phone} />
                    <DetailItem label="District" value={profile.district} />
                    <DetailItem label="Account Type" value={profile.type?.replace('_', ' ')} />
                    <DetailItem label="Status" value={status} statusBadge />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Identity</CardTitle>
                    <CardDescription>Registered business name and tax identifiers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem label="Business Name" value={profile.business_name} colSpan={2} />
                      <DetailItem label="GST Number" value={profile.gst_number} />
                      <DetailItem label="PAN Number" value={profile.pan_number} />
                      <DetailItem label="Business Address" value={profile.business_address} colSpan={2} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Settings</CardTitle>
                    <CardDescription>Banking details and performance metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                      <DetailItem label="Bank Account" value={profile.bank_account || "Not provided"} />
                      <DetailItem label="IFSC Code" value={profile.ifsc_code || "Not provided"} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <MetricCard label="Monthly Target" value={formatCurrency(profile.monthly_target)} />
                       <MetricCard label="Advance Amount" value={formatCurrency(profile.advance_amount)} />
                       <MetricCard label="MTD Sales" value={formatCurrency(profile.mtd_sales)} />
                       <MetricCard label="YTD Sales" value={formatCurrency(profile.ytd_sales)} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logistics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Point & Logistics</CardTitle>
                    <CardDescription>Fulfillment capacity and warehousing details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.mode === "stock_point" || profile.type === "stock_point" ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DetailItem label="Storage Capacity" value={profile.storage_capacity} />
                          <DetailItem label="Min Inventory Value" value={formatCurrency(profile.min_inventory_value)} />
                          <DetailItem label="Warehouse Address" value={profile.warehouse_address} colSpan={2} />
                        </div>
                        {profile.sla_score !== undefined && (
                           <div className="pt-6 border-t border-border/50">
                              <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Service Level Performance</p>
                              <div className="flex justify-between items-center mb-1 text-sm">
                                <span>SLA Score</span>
                                <span className="font-bold">{profile.sla_score}%</span>
                              </div>
                              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${profile.sla_score}%` }} />
                              </div>
                           </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-muted/30 p-12 rounded-lg text-center border-2 border-dashed">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h4 className="font-bold text-muted-foreground">Standard Businessman Profile</h4>
                        <p className="text-sm text-muted-foreground">This user does not operate as a dedicated stock point.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailItem({ label, value, colSpan = 1, statusBadge = false }: { label: string, value: any, colSpan?: number, statusBadge?: boolean }) {
  return (
    <div className={`space-y-1 ${colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "lg:col-span-3" : ""}`}>
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
      {statusBadge ? (
        <div className="pt-1">
          <UserStatusBadge status={value as any} />
        </div>
      ) : (
        <p className="font-medium text-sm text-foreground/80 break-words">{value || "—"}</p>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
       <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{label}</p>
       <p className="text-lg font-black font-mono">{value}</p>
    </div>
  );
}
