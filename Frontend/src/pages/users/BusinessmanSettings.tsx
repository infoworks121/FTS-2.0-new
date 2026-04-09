import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsersLayout } from "@/components/users/UsersLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, User as UserIcon, Package, ShieldCheck, Briefcase, CreditCard, BarChart3, Loader2, Store } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserStatusBadge, ModeBadge } from "@/components/users/UserComponents";
import { UserMode, UserStatus } from "@/types/users";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { userApi, BusinessmanProfile } from "@/lib/userApi";
import { geographyApi, DistrictSummary } from "@/lib/geographyApi";

export default function BusinessmanSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mode: "entry" as UserMode,
    status: "pending" as UserStatus,
    district_id: "" as string | number,
    business_name: "",
    business_address: "",
    gst_number: "",
    pan_number: "",
    bank_account: "",
    ifsc_code: "",
    monthly_target: "0",
    advance_amount: "0",
    storage_capacity: "0",
    min_inventory_value: "0",
    warehouse_address: "",
    is_sph: false,
  });

  const [profile, setProfile] = useState<BusinessmanProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [profileRes, geoRes] = await Promise.all([
          userApi.getBusinessmanById(id),
          geographyApi.getDistrictsSummary()
        ]);
        
        const p = profileRes.profile;
        setProfile(p);
        setDistricts(geoRes.districts);
        
        // Map status
        let status: UserStatus = "pending";
        if (p.is_active && p.is_approved) status = "active";
        else if (!p.is_active) status = "suspended";
        else if (!p.is_approved) status = "pending";

        setFormData({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          mode: (p.mode || p.type || "entry") as UserMode,
          status: status,
          district_id: p.district_id || "",
          business_name: p.business_name || "",
          business_address: p.business_address || "",
          gst_number: p.gst_number || "",
          pan_number: p.pan_number || "",
          bank_account: p.bank_account || "",
          ifsc_code: p.ifsc_code || "",
          monthly_target: p.monthly_target?.toString() || "0",
          advance_amount: p.advance_amount?.toString() || "0",
          storage_capacity: p.storage_capacity?.toString() || "0",
          min_inventory_value: p.min_inventory_value?.toString() || "0",
          warehouse_address: p.warehouse_address || "",
          is_sph: p.is_sph || false,
        });
      } catch (error) {
        console.error("Error fetching businessman data:", error);
        toast.error("Failed to load businessman details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await userApi.updateBusinessmanSettings(id, {
        ...formData,
        monthly_target: parseFloat(formData.monthly_target),
        advance_amount: parseFloat(formData.advance_amount),
        storage_capacity: parseFloat(formData.storage_capacity),
        min_inventory_value: parseFloat(formData.min_inventory_value),
        district_id: formData.district_id ? parseInt(formData.district_id.toString()) : null,
        is_sph: formData.is_sph
      });
      toast.success("Businessman settings updated successfully");
    } catch (error) {
      console.error("Error updating businessman settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading businessman settings...</p>
      </div>
    );
  }

  return (
    <UsersLayout
      title={`Settings: ${formData.name}`}
      description="Manage roles, storage settings, and geographic coverage"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users/businessmen")}>
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
                  <span className="text-muted-foreground">Mode:</span>
                  <ModeBadge mode={formData.mode} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize text-[10px] font-bold border-slate-200">
                    {profile?.type?.replace('_', ' ') || 'Businessman'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">District:</span>
                  <span className="font-medium">{profile?.district || "Not Assigned"}</span>
                </div>
                {formData.is_sph && (
                  <div className="flex items-center justify-between text-xs mt-2 p-2 bg-emerald-500/10 text-emerald-600 rounded-md border border-emerald-500/20">
                    <span className="flex items-center gap-1 font-bold italic">
                      <Store className="h-3 w-3" /> isSPH Verified
                    </span>
                    <span className="text-[10px] uppercase font-black">B2C Enabled</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Performance</span>
                    <span className="text-primary font-medium">{profile?.commission_earned ? `₹${profile.commission_earned}` : "₹0"}</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[45%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Account Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved:</span>
                <span>{profile?.is_approved ? "Yes" : "No"}</span>
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
                  <CardDescription>Update the basic identifying information for this user.</CardDescription>
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
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Operational Mode</Label>
                        <Select value={formData.mode} onValueChange={(v) => handleChange("mode", v as UserMode)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {!formData.is_sph && <SelectItem value="entry">Entry Mode</SelectItem>}
                            {!formData.is_sph && <SelectItem value="advance">Advance Mode</SelectItem>}
                            <SelectItem value="businessman">Businessman</SelectItem>
                            <SelectItem value="stock_point">Stock Point</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-bold flex items-center gap-2">
                              <Store className="h-4 w-4 text-primary" />
                              isSPH Status
                            </Label>
                            <p className="text-[10px] text-muted-foreground">Enable direct B2C selling on customer panel</p>
                          </div>
                          <Switch 
                            checked={formData.is_sph} 
                            onCheckedChange={(checked) => {
                              handleChange("is_sph", checked as any);
                              if (checked && (formData.mode === "entry" || formData.mode === "advance")) {
                                handleChange("mode", "businessman");
                              }
                            }} 
                          />
                        </div>
                      </div>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Configure business identity and tax information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input 
                        id="business_name" 
                        value={formData.business_name} 
                        onChange={(e) => handleChange("business_name", e.target.value)} 
                        placeholder="Company or Enterprise Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gst_number">GST Number</Label>
                      <Input 
                        id="gst_number" 
                        value={formData.gst_number} 
                        onChange={(e) => handleChange("gst_number", e.target.value)} 
                        placeholder="GSTIN"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pan_number">PAN Number</Label>
                      <Input 
                        id="pan_number" 
                        value={formData.pan_number} 
                        onChange={(e) => handleChange("pan_number", e.target.value)} 
                        placeholder="PAN Card"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="business_address">Business Address</Label>
                      <Input 
                        id="business_address" 
                        value={formData.business_address} 
                        onChange={(e) => handleChange("business_address", e.target.value)} 
                        placeholder="Full registered address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Configuration</CardTitle>
                  <CardDescription>Setup banking and performance targets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account">Bank Account Number</Label>
                      <Input id="bank_account" value={formData.bank_account} onChange={(e) => handleChange("bank_account", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc_code">IFSC Code</Label>
                      <Input id="ifsc_code" value={formData.ifsc_code} onChange={(e) => handleChange("ifsc_code", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_target">Monthly Sales Target (₹)</Label>
                      <Input id="monthly_target" type="number" value={formData.monthly_target} onChange={(e) => handleChange("monthly_target", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advance_amount">Advance Investment (₹)</Label>
                      <Input id="advance_amount" type="number" value={formData.advance_amount} onChange={(e) => handleChange("advance_amount", e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg flex-1">
                        <div className="text-xs text-muted-foreground mb-1">MTD Sales</div>
                        <div className="text-lg font-bold">₹{profile?.mtd_sales || 0}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg flex-1">
                        <div className="text-xs text-muted-foreground mb-1">YTD Sales</div>
                        <div className="text-lg font-bold">₹{profile?.ytd_sales || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Stock Point Configuration
                    {formData.mode !== "stock_point" && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-normal">Inactive Mode</span>
                    )}
                  </CardTitle>
                  <CardDescription>Configure warehousing and inventory limits. Only applies if mode is set to Stock Point.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Storage Capacity (Units/Value)</Label>
                      <Input 
                        id="capacity" 
                        type="number" 
                        value={formData.storage_capacity} 
                        onChange={(e) => handleChange("storage_capacity", e.target.value)} 
                        disabled={formData.mode !== "stock_point"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minInventory">Min Inventory Threshold (₹)</Label>
                      <Input 
                        id="minInventory" 
                        type="number" 
                        value={formData.min_inventory_value} 
                        onChange={(e) => handleChange("min_inventory_value", e.target.value)} 
                        disabled={formData.mode !== "stock_point"}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="warehouse_address">Warehouse Address</Label>
                      <Input 
                        id="warehouse_address" 
                        value={formData.warehouse_address} 
                        onChange={(e) => handleChange("warehouse_address", e.target.value)} 
                        placeholder="Full physical address for B2C fulfillment"
                        disabled={formData.mode !== "stock_point"}
                      />
                    </div>
                  </div>
                  
                  {formData.mode === "stock_point" && profile?.sla_score !== undefined && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <Label>SLA Performance Score</Label>
                          <span className={`font-bold ${profile.sla_score > 80 ? "text-green-600" : "text-yellow-600"}`}>
                            {profile.sla_score}/100
                          </span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${profile.sla_score > 80 ? "bg-green-500" : "bg-yellow-500"}`} 
                            style={{ width: `${profile.sla_score}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UsersLayout>
  );
}
