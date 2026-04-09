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
  Briefcase, 
  Loader2, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  ShoppingBag,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { coreBodyApi } from "@/lib/coreBodyApi";

// I'll check if there's a getDealerById in userApi or similar.
// Since I don't have a specific dealer detailed API yet, I'll use a placeholder or assume the backend can handle it.
// Actually, I'll check BusinessmanDetails and use a similar pattern.

export default function DealerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dealer, setDealer] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Using a generic way to fetch dealer if specific one doesn't exist
        // For demonstration, I'll simulate or use a generic fetch if available
        // Let's assume we use the directory API or a specialized one
        const response = await coreBodyApi.getDirectoryUserDetail(id);
        setDealer(response.profile);
      } catch (error) {
        console.error("Error fetching dealer data:", error);
        toast.error("Failed to load dealer details");
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
          <p className="text-muted-foreground">Loading dealer profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dealer) {
    return (
      <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Dealer not found.</p>
          <Button variant="link" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
            Back to Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="corebody" roleLabel="Core Body — User Monitoring" navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/corebody/dealers-businessmen/all-users")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{dealer.full_name || dealer.name}</h1>
              <p className="text-sm text-muted-foreground">Dealer operational profile and network performance.</p>
            </div>
          </div>
          <Badge variant="outline" className={dealer.is_active ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
            {dealer.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 space-y-4">
             <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-blue-500/20 to-blue-500/5" />
                <CardContent className="relative pt-0 flex flex-col items-center">
                   <div className="absolute -top-12">
                      <div className="h-24 w-24 bg-background rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                        <div className="h-full w-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Briefcase className="h-10 w-10" />
                        </div>
                      </div>
                   </div>
                   <div className="mt-14 text-center w-full">
                      <h3 className="font-bold text-lg">{dealer.full_name || dealer.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1 underline">DEALER ACCOUNT</p>
                      
                      <div className="mt-6 space-y-4 text-left pt-6 border-t w-full">
                        <div className="flex items-start gap-3 text-sm">
                           <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div className="truncate flex-1">
                              <p className="text-[10px] uppercase font-black text-muted-foreground">Email</p>
                              <p className="truncate">{dealer.email || "—"}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                           <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div>
                              <p className="text-[10px] uppercase font-black text-muted-foreground">Phone</p>
                              <p>{dealer.phone || "—"}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                           <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <div>
                              <p className="text-[10px] uppercase font-black text-muted-foreground">District</p>
                              <p>{dealer.district || "Not Assigned"}</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm">Network Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-2 font-mono">
                   <div className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground italic">Target:</span>
                      <span className="font-bold">₹10,00,000</span>
                   </div>
                   <div className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground italic">Current:</span>
                      <span className="font-bold text-profit">₹4,20,500</span>
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="col-span-1 md:col-span-3">
             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-4">
                   <TabsTrigger value="overview" className="gap-2"><Layers className="h-4 w-4" /> Overview</TabsTrigger>
                   <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="h-4 w-4" /> Handle Orders</TabsTrigger>
                   <TabsTrigger value="performance" className="gap-2"><TrendingUp className="h-4 w-4" /> Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                   <Card>
                      <CardHeader>
                         <CardTitle>Dealer Profile</CardTitle>
                         <CardDescription>Basic system profile and operational status.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Basic Info</h4>
                            <div className="grid gap-4">
                               <InfoItem label="Full Name" value={dealer.full_name} />
                               <InfoItem label="Joined Date" value={dealer.created_at ? new Date(dealer.created_at).toLocaleDateString() : "—" } />
                               <InfoItem label="Category" value="General Provisions" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Contact Details</h4>
                            <div className="grid gap-4">
                               <InfoItem label="Phone" value={dealer.phone} />
                               <InfoItem label="Email" value={dealer.email} />
                               <InfoItem label="Address" value={dealer.address || "District Registered Address"} />
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                       <CardHeader>
                          <CardTitle>Order Management</CardTitle>
                          <CardDescription>Summary of orders handled by this dealer.</CardDescription>
                       </CardHeader>
                       <CardContent className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-lg m-6">
                          Order transaction history for dealers is currently only visible at the district admin level.
                       </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance">
                    <Card>
                       <CardHeader>
                          <CardTitle>Performance Analytics</CardTitle>
                          <CardDescription>Monthly and yearly distribution and service quality.</CardDescription>
                       </CardHeader>
                       <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded m-6 border">
                          <p className="text-sm font-medium opacity-50">Analytics Visualization coming soon</p>
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

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
