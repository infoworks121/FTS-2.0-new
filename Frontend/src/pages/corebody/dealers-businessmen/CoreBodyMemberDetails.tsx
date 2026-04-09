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
  BarChart3, 
  Loader2, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Wallet,
  Activity,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { coreBodyApi, CoreBodyDetail } from "@/lib/coreBodyApi";

export default function CoreBodyMemberDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<CoreBodyDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await coreBodyApi.getDirectoryUserDetail(id);
        setMember(response.profile);
      } catch (error) {
        console.error("Error fetching core body data:", error);
        toast.error("Failed to load core body details");
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
          <p className="text-muted-foreground">Loading core body profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Core Body member not found.</p>
          <Button variant="link" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
            Back to Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const capUsage = Math.min(100, (member.ytd_earnings / (member.annual_cap || 1)) * 100);

  return (
    <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <p className="text-sm text-muted-foreground">Core Body operational profile and investment monitoring.</p>
            </div>
          </div>
          <Badge variant="outline" className={member.is_active ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
            {member.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 space-y-4">
             <Card className="overflow-hidden border-primary/20">
                <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10" />
                <CardContent className="relative pt-0 flex flex-col items-center">
                   <div className="absolute -top-12">
                      <div className="h-24 w-24 bg-background rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                          <Award className="h-10 w-10" />
                        </div>
                      </div>
                   </div>
                   <div className="mt-14 text-center w-full">
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-xs text-primary font-black mt-1 uppercase">CORE BODY {member.type}</p>
                      
                      <div className="mt-6 space-y-4 text-left pt-6 border-t w-full">
                        <div className="flex items-start gap-3 text-sm">
                           <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div className="truncate flex-1">
                              <p className="text-[10px] uppercase font-black text-muted-foreground">Email</p>
                              <p className="truncate">{member.email || "—"}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                           <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div>
                              <p className="text-[10px] uppercase font-black text-muted-foreground">Phone</p>
                              <p>{member.phone || "—"}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                           <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div>
                              <p className="text-[10px] uppercase font-black text-muted-foreground">District</p>
                              <p>{member.district || "Not Assigned"}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                   <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                         <span className="text-muted-foreground">Cap Usage</span>
                         <span className={capUsage > 80 ? "text-amber-600" : "text-primary"}>{capUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                         <div className={`h-full ${capUsage > 80 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${capUsage}%` }} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted/30 rounded border text-center">
                         <p className="text-[8px] text-muted-foreground font-black">ANNUAL CAP</p>
                         <p className="text-xs font-mono font-bold leading-none mt-1">{formatCurrency(member.annual_cap)}</p>
                      </div>
                      <div className="p-2 bg-muted/30 rounded border text-center">
                         <p className="text-[8px] text-muted-foreground font-black">EARNED</p>
                         <p className="text-xs font-mono font-bold leading-none mt-1 text-profit">{formatCurrency(member.ytd_earnings)}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="col-span-1 md:col-span-3">
             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-4">
                   <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
                   <TabsTrigger value="financials" className="gap-2"><Wallet className="h-4 w-4" /> Financials</TabsTrigger>
                   <TabsTrigger value="performance" className="gap-2"><BarChart3 className="h-4 w-4" /> Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                   <Card>
                      <CardHeader>
                         <CardTitle>Member Profile</CardTitle>
                         <CardDescription>Core Body administrative and district information.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Administrative Info</h4>
                               <div className="grid gap-4">
                                  <DataItem label="Full Name" value={member.name} />
                                  <DataItem label="Core Body Type" value={member.type} />
                                  <DataItem label="District Assignment" value={member.district} />
                                  <DataItem label="Member Since" value={member.created_at ? new Date(member.created_at).toLocaleDateString() : "—" } />
                               </div>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Asset Monitoring</h4>
                               <div className="grid gap-4">
                                  <DataItem label="Businessman in Network" value={member.businessman_count || 0} />
                                  <DataItem label="Active Installments" value={member.installment_count || 0} />
                                  <DataItem label="Current Portfolio Value" value={formatCurrency(member.investment_amount)} />
                               </div>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="financials">
                   <Card>
                      <CardHeader>
                         <CardTitle>Installment Tracking</CardTitle>
                         <CardDescription>Investment payment history and upcoming schedule.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-lg m-6">
                         Detailed installment ledger for other Core Body members is restricted to root administrator view.
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="performance">
                   <Card>
                      <CardHeader>
                         <CardTitle>District-Level Performance</CardTitle>
                         <CardDescription>Earnings distribution and cap management analysis.</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded m-6 border">
                         <p className="text-sm font-medium opacity-50 text-center px-12">Performance reports for district participants are generated weekly and visible in the Reports section.</p>
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

function DataItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase text-muted-foreground font-black">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
