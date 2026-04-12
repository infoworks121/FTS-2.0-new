import { useState } from "react";
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Wallet, 
  Activity, 
  Award,
  Briefcase,
  Package,
  CreditCard,
  Store,
  BarChart3,
  Landmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge, ModeBadge } from "@/components/users/UserComponents";
import { CoreBodyDetail } from "@/lib/coreBodyApi";
import { BusinessmanProfile } from "@/lib/userApi";

interface UserProfileViewProps {
  data: any; // Can be CoreBodyDetail or BusinessmanProfile
  role: string; // 'corebody' | 'dealer' | 'businessman' | 'stock_point'
  viewerRole?: string; // 'admin' | 'corebody'
}

export function UserProfileView({ data, role, viewerRole = "corebody" }: UserProfileViewProps) {
  const isCoreBody = role === 'corebody' || role.includes('core_body');
  const isDealer = role === 'dealer';
  const isBusinessman = role === 'businessman';
  const isStockPoint = role === 'stock_point' || (data as any).is_sph;

  const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat("en-IN", { 
      style: "currency", 
      currency: "INR", 
      maximumFractionDigits: 0 
    }).format(value || 0);

  const capUsage = data.annual_cap ? Math.min(100, (data.ytd_earnings / data.annual_cap) * 100) : 0;
  
  const status = data.is_active && (data.is_approved || data.status === 'active') ? "active" : (!data.is_active ? "suspended" : "pending");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar: Profile Summary */}
        <div className="col-span-1 space-y-4">
          <Card className="overflow-hidden border-primary/20 shadow-lg">
            <div className={`h-24 bg-gradient-to-r ${isCoreBody ? 'from-primary/30 to-primary/10' : isDealer ? 'from-blue-500/30 to-blue-500/10' : 'from-emerald-500/30 to-emerald-500/10'}`} />
            <CardContent className="relative pt-0 flex flex-col items-center">
              <div className="absolute -top-12">
                <div className="h-24 w-24 bg-background rounded-full border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                  <div className={`h-full w-full flex items-center justify-center ${isCoreBody ? 'bg-primary/10 text-primary' : isDealer ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {isCoreBody ? <Award className="h-10 w-10" /> : isDealer ? <Briefcase className="h-10 w-10" /> : <UserIcon className="h-10 w-10" />}
                  </div>
                </div>
              </div>
              
              <div className="mt-14 text-center w-full">
                <h3 className="font-bold text-lg">{data.name || data.full_name}</h3>
                <div className="flex flex-col items-center gap-2 mt-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isCoreBody ? 'bg-primary/10 text-primary' : isDealer ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {role.replace('_', ' ')} {data.type && `— ${data.type}`}
                  </p>
                  <div className="flex gap-1">
                    <UserStatusBadge status={status as any} />
                    {isStockPoint && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] font-bold h-5">
                        <Store className="h-3 w-3 mr-1" /> isSPH
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 space-y-4 text-left pt-6 border-t w-full">
                  <ContactItem icon={Mail} label="Email" value={data.email} />
                  <ContactItem icon={Phone} label="Phone" value={data.phone} />
                  <ContactItem icon={MapPin} label="District" value={data.district || "Not Assigned"} />
                </div>
              </div>
            </CardContent>
          </Card>

          {isCoreBody && (
            <Card className="shadow-md">
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
                  <MetricSquare label="ANNUAL CAP" value={formatCurrency(data.annual_cap)} />
                  <MetricSquare label="EARNED" value={formatCurrency(data.ytd_earnings)} className="text-profit" />
                </div>
              </CardContent>
            </Card>
          )}

          {(isBusinessman || isDealer) && (
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 pt-2">
                <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase font-bold">Earnings</span>
                  <span className="font-bold text-profit">{formatCurrency(data.commission_earned || data.ytd_earnings)}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase font-bold">Network</span>
                  <span className="font-bold">{data.businessman_count || 0} Members</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Section: Detailed Tabs */}
        <div className="col-span-1 md:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted/50 p-1 mb-4 flex-wrap h-auto justify-start">
              <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
              {isCoreBody && <TabsTrigger value="financials" className="gap-2"><Wallet className="h-4 w-4" /> Financials</TabsTrigger>}
              {isBusinessman && <TabsTrigger value="business" className="gap-2"><Briefcase className="h-4 w-4" /> Business</TabsTrigger>}
              {(isBusinessman || isStockPoint) && <TabsTrigger value="logistics" className="gap-2"><Package className="h-4 w-4" /> Logistics</TabsTrigger>}
              {isDealer && <TabsTrigger value="portfolio" className="gap-2"><Store className="h-4 w-4" /> Portfolio</TabsTrigger>}
              <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" /> Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Member Profile</CardTitle>
                  <CardDescription>Comprehensive system record for {data.name || data.full_name}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Primary Information</h4>
                      <div className="grid gap-4">
                        <DataItem label="Full Legal Name" value={data.name || data.full_name} />
                        <DataItem label="Role / Designation" value={role.replace('_', ' ')} />
                        {data.type && <DataItem label="Category Type" value={`Type ${data.type}`} />}
                        <DataItem label="Member Since" value={data.created_at ? new Date(data.created_at).toLocaleDateString() : "—" } />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">Operational Metrics</h4>
                      <div className="grid gap-4">
                        <DataItem label="Assigned District" value={data.district || "Pending Assignment"} />
                        <DataItem label="Associated Hub" value={data.linked_hub_name || "Primary Network"} />
                        <DataItem label="Total Network Members" value={data.businessman_count || 0} />
                        {isCoreBody && <DataItem label="Portfolio Value" value={formatCurrency(data.investment_amount)} />}
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
                  <CardDescription>Core Body investment schedule and payment status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.installments && data.installments.length > 0 ? (
                    <div className="space-y-3">
                      {data.installments.map((inst: any, idx: number) => (
                        <div key={inst.id || idx} className="p-4 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-sm">
                              #{inst.installment_no}
                            </div>
                            <div>
                              <div className="text-sm font-bold">{formatCurrency(inst.amount)}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {inst.paid_date ? `Received: ${new Date(inst.paid_date).toLocaleDateString()}` : `Due: ${new Date(inst.due_date).toLocaleDateString()}`}
                              </div>
                            </div>
                          </div>
                          <InstallmentStatus status={inst.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-lg m-2">
                       Detailed installment ledger is restricted or not available for this role.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Identity</CardTitle>
                  <CardDescription>Registered business information and tax identifiers.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <DataItem label="Business Name" value={data.business_name} />
                   <DataItem label="Business GST" value={data.gst_number} />
                   <DataItem label="PAN Number" value={data.pan_number} />
                   <DataItem label="Account Holder" value={data.name} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logistics">
              <Card>
                <CardHeader>
                  <CardTitle>Logistics & Inventory</CardTitle>
                  <CardDescription>Storage capacity and fulfillment performance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DataItem label="Warehouse Address" value={data.warehouse_address} />
                      <DataItem label="Storage Capacity" value={data.storage_capacity ? `${data.storage_capacity} Units` : "Standard"} />
                      <DataItem label="SLA Score" value={data.sla_score ? `${data.sla_score}%` : "No history"} />
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Product Assignments</CardTitle>
                  <CardDescription>Products managed by this dealer.</CardDescription>
                </CardHeader>
                <CardContent className="p-12 text-center text-muted-foreground italic border-2 border-dashed rounded-lg">
                   Product assignment ledger is currently restricted to district coordinators.
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Historical earnings and volume data.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded m-2 border">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-sm font-medium opacity-50 px-12">Performance reports are generated weekly and visible in the main dashboard reports section.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="truncate flex-1">
        <p className="text-[9px] uppercase font-black text-muted-foreground leading-none mb-1">{label}</p>
        <p className="truncate font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

function MetricSquare({ label, value, className = "" }: { label: string, value: string, className?: string }) {
  return (
    <div className="p-2 bg-muted/30 rounded border text-center">
      <p className="text-[8px] text-muted-foreground font-black">{label}</p>
      <p className={`text-xs font-mono font-bold leading-none mt-1 ${className}`}>{value}</p>
    </div>
  );
}

function DataItem({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase text-muted-foreground font-black tracking-tight">{label}</p>
      <p className="text-sm font-semibold text-foreground/80">{value || "—"}</p>
    </div>
  );
}

function InstallmentStatus({ status }: { status: string }) {
  switch (status) {
    case 'paid':
      return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3 w-3" /> Received</div>;
    case 'pending':
      return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase"><Clock className="h-3 w-3" /> Pending</div>;
    case 'overdue':
      return <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold uppercase"><AlertTriangle className="h-3 w-3" /> Overdue</div>;
    default:
      return <div className="text-[10px] font-bold uppercase text-muted-foreground">{status}</div>;
  }
}
