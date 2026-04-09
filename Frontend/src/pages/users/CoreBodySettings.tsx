import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsersLayout } from "@/components/users/UsersLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, User as UserIcon, ShieldCheck, CreditCard, BarChart3, Loader2, Store, Landmark, AlertTriangle, CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserStatusBadge } from "@/components/users/UserComponents";
import { UserStatus } from "@/types/users";
import { toast } from "sonner";
import { coreBodyApi, CoreBodyDetail } from "@/lib/coreBodyApi";
import { geographyApi, DistrictSummary } from "@/lib/geographyApi";

export default function CoreBodySettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "A" as 'A' | 'B' | 'Dealer',
    status: "pending" as UserStatus,
    district_id: "" as string | number,
    investment_amount: "0",
    installment_count: "4",
    annual_cap: "2500000",
    monthly_cap: "100000",
    is_sph: false,
  });

  const [profile, setProfile] = useState<CoreBodyDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [profileRes, geoRes] = await Promise.all([
          coreBodyApi.getCoreBodyById(id),
          geographyApi.getDistrictsSummary()
        ]);
        
        const p = profileRes.profile;
        setProfile(p);
        setDistricts(geoRes.districts);
        
        // Map status
        let status: UserStatus = "pending";
        if (p.is_approved && p.is_active) status = "active";
        else if (!p.is_active) status = "inactive"; // or suspended
        else if (!p.is_approved) status = "pending";

        setFormData({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          type: p.type || "A",
          status: status,
          district_id: p.district_id || "",
          investment_amount: p.investment_amount?.toString() || "0",
          installment_count: p.installment_count?.toString() || "4",
          annual_cap: p.annual_cap?.toString() || "2500000",
          monthly_cap: p.monthly_cap?.toString() || "100000",
          is_sph: p.is_sph || false,
        });
      } catch (error) {
        console.error("Error fetching core body data:", error);
        toast.error("Failed to load core body details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await coreBodyApi.updateCoreBodySettings(id, {
        ...formData,
        investment_amount: parseFloat(formData.investment_amount),
        installment_count: parseInt(formData.installment_count),
        annual_cap: parseFloat(formData.annual_cap),
        monthly_cap: parseFloat(formData.monthly_cap),
        district_id: formData.district_id ? parseInt(formData.district_id.toString()) : null,
      });
      toast.success("Core Body settings updated successfully");
    } catch (error) {
      console.error("Error updating core body settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading core body settings...</p>
      </div>
    );
  }

  return (
    <UsersLayout
      title={`Settings: ${formData.name}`}
      description="Manage roles, investment terms, and earning caps"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Profile Summary */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-center">{formData.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-1 truncate max-w-full">{id}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <UserStatusBadge status={formData.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">Type {formData.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">District:</span>
                  <span className="font-medium text-xs">{profile?.district || "Not Assigned"}</span>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Cap Utilization</span>
                    <span className="text-primary font-medium">{profile?.cap_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${profile && profile.cap_usage > 90 ? 'bg-rose-500' : profile && profile.cap_usage > 70 ? 'bg-amber-500' : 'bg-primary'}`} 
                      style={{ width: `${profile?.cap_usage || 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dealers Linked:</span>
                <span className="font-bold">{profile?.businessman_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">YTD Earnings:</span>
                <span className="font-bold text-emerald-600">₹{profile?.ytd_earnings?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MTD Earnings:</span>
                <span className="font-bold text-blue-600">₹{profile?.mtd_earnings?.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 md:col-span-3">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> General Info
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex items-center gap-2">
                <Landmark className="h-4 w-4" /> Investment
              </TabsTrigger>
              <TabsTrigger value="caps" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Earning Caps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Update basic identifying information and platform status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <Select value={formData.status} onValueChange={(v) => handleChange("status", v as UserStatus)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended (Blocked)</SelectItem>
                          <SelectItem value="pending">Pending Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>District Assignment</Label>
                        <Select 
                          value={formData.district_id?.toString()} 
                          onValueChange={(v) => handleChange("district_id", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select District" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name} ({d.state_name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              isSPH Status
                            </Label>
                            <p className="text-[10px] text-muted-foreground">Higher trust factor for user verification</p>
                          </div>
                          <Switch 
                            checked={formData.is_sph} 
                            onCheckedChange={(checked) => handleChange("is_sph", checked)} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investment & Role Configuration</CardTitle>
                  <CardDescription>Configure core body type and investment installment plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Core Body Type</Label>
                      <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Type A (Major Hub)</SelectItem>
                          <SelectItem value="B">Type B (Local Hub)</SelectItem>
                          <SelectItem value="Dealer">Dealer (No Hub)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investment">Total Investment Amount (₹)</Label>
                      <Input id="investment" type="number" value={formData.investment_amount} onChange={(e) => handleChange("investment_amount", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installments">Installment Count</Label>
                      <Select value={formData.installment_count} onValueChange={(v) => handleChange("installment_count", v)}>
                        <SelectTrigger id="installments">
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (Lump Sum)</SelectItem>
                          <SelectItem value="2">2 Installments</SelectItem>
                          <SelectItem value="3">3 Installments</SelectItem>
                          <SelectItem value="4">4 Installments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Important Note</p>
                      <p className="text-xs text-amber-800">Changing installment counts or amounts will not affect already paid installments. It only clarifies future expectations for the user profile.</p>
                    </div>
                  </div>

                  {/* Installment Breakdown Section */}
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Investment Tracking (Deposits)
                      </h4>
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Installment Breakdown</span>
                    </div>

                    <div className="space-y-3">
                      {profile?.installments && profile.installments.length > 0 ? (
                        profile.installments.map((inst, idx) => (
                          <div key={inst.id || idx} className="p-4 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between transition-all hover:bg-muted/20">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-sm">
                                #{inst.installment_no}
                              </div>
                              <div>
                                <div className="text-sm font-bold">₹{inst.amount.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  {inst.paid_date ? (
                                    <>Paid on {new Date(inst.paid_date).toLocaleDateString()}</>
                                  ) : (
                                    <>Due date: {inst.due_date ? new Date(inst.due_date).toLocaleDateString() : "Pending"}</>
                                  )}
                                  {inst.payment_ref && <span className="ml-2 font-mono text-primary bg-primary/5 px-1 rounded">Ref: {inst.payment_ref}</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {inst.status === 'paid' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Received
                                </div>
                              )}
                              {inst.status === 'pending_approval' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold uppercase animate-pulse">
                                  <Clock className="h-3 w-3" />
                                  Awaiting Approval
                                </div>
                              )}
                              {inst.status === 'pending' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase">
                                  <Clock className="h-3 w-3" />
                                  Pending Deposit
                                </div>
                              )}
                              {inst.status === 'rejected' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold uppercase">
                                  <XCircle className="h-3 w-3" />
                                  Rejected
                                </div>
                              )}
                              {inst.status === 'overdue' && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold uppercase">
                                  <AlertTriangle className="h-3 w-3" />
                                  Overdue
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/50">
                          <HelpCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No installment data found for this profile.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="caps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Earning Limit (Cap) Control</CardTitle>
                  <CardDescription>Define how much this core body can earn in specified periods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualCap">Annual Earning Cap (₹)</Label>
                      <Input id="annualCap" type="number" value={formData.annual_cap} onChange={(e) => handleChange("annual_cap", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyCap">Monthly Earning Cap (₹)</Label>
                      <Input id="monthlyCap" type="number" value={formData.monthly_cap} onChange={(e) => handleChange("monthly_cap", e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-tight font-bold">Annual Utilization</div>
                      <div className="text-2xl font-mono font-bold">₹{profile?.ytd_earnings?.toLocaleString()} / ₹{parseFloat(formData.annual_cap).toLocaleString()}</div>
                      <div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(profile?.ytd_earnings || 0) / parseFloat(formData.annual_cap) * 100}%` }} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-tight font-bold">Monthly Status</div>
                      <div className="text-2xl font-mono font-bold">₹{profile?.mtd_earnings?.toLocaleString()} / ₹{parseFloat(formData.monthly_cap).toLocaleString()}</div>
                      <div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(profile?.mtd_earnings || 0) / parseFloat(formData.monthly_cap) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UsersLayout>
  );
}
