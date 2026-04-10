import { useState } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CapacityBar } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Percent,
  MapPin,
  Users,
  Wallet,
  ShoppingCart,
  ShieldAlert,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  Building2,
  AlertTriangle,
  BarChart3,
  Plus,
  Save,
  ArrowLeft,
  AlertCircle,
  Info,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
} from "lucide-react";

// Navigation items (same as AllDistricts)
const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products & Categories", icon: Package, submenu: [
    { title: "All Products", url: "/admin/products", icon: Package },
    { title: "Add New Product", url: "/admin/products/new", icon: Package },
    { title: "Product Pricing & Margin", url: "/admin/products/pricing", icon: DollarSign },
    { title: "Product Status", url: "/admin/products/status", icon: TrendingUp },
    { title: "Category List", url: "/admin/categories", icon: FileText },
    { title: "Add / Edit Category", url: "/admin/categories/manage", icon: FileText },
    { title: "Category Commission Rules", url: "/admin/categories/commission", icon: Percent },
    { title: "Services & Digital Products", url: "/admin/services", icon: ShoppingCart },
  ]},
  { title: "Commission & Profit Engine", icon: Percent, warning: true, submenu: [
    { title: "B2B Commission Structure", url: "/admin/commission/b2b", icon: Building2 },
    { title: "B2C Commission Structure", url: "/admin/commission/b2c", icon: Users },
    { title: "Referral Percentage Rules", url: "/admin/commission/referral", icon: UsersRound },
    { title: "Profit Distribution", url: "/admin/commission/profit", icon: DollarSign },
    { title: "Trust Fund Rules", url: "/admin/commission/trust", icon: ShieldCheck },
    { title: "Company Share Rules", url: "/admin/commission/company", icon: Building2 },
    { title: "Core Body Share Rules", url: "/admin/commission/corebody", icon: Users },
    { title: "Stock Point Share Rules", url: "/admin/commission/stockpoint", icon: Warehouse },
  ]},
  { title: "District & Core Body", icon: MapPin, submenu: [
    { title: "All Districts", url: "/admin/districts", icon: MapPin },
    // { title: "Add / Edit District", url: "/admin/districts/manage", icon: MapPin },
    { title: "District Performance", url: "/admin/districts/performance", icon: BarChart3 },
    { title: "Core Body List", url: "/admin/corebody", icon: Users },
    // { title: "Core Body A Management", url: "/admin/corebody/a", icon: Users },
    // { title: "Core Body B Management", url: "/admin/corebody/b", icon: Users },
  ]},
  { title: "Users & Roles", icon: Users, submenu: [
    { title: "All Businessmen", url: "/admin/users/businessmen", icon: Users },
    // { title: "Entry Mode Users", url: "/admin/users/entry", icon: Users },
    // { title: "Advance Mode Users", url: "/admin/users/advance", icon: Users },
    // { title: "Bulk Users", url: "/admin/users/bulk", icon: Users },
    { title: "Stock Point List", url: "/admin/users/stockpoints", icon: Warehouse },
    { title: "Role Permissions", url: "/admin/users/roles", icon: ShieldCheck },
    { title: "Feature Access Control", url: "/admin/users/features", icon: Settings },
  ]},
  { title: "Wallets & Finance", icon: Wallet, warning: true, submenu: [
    { title: "Main Wallet", url: "/admin/wallet/main", icon: DollarSign },
    { title: "Referral Wallet", url: "/admin/wallet/referral", icon: UsersRound },
    { title: "Trust Wallet", url: "/admin/wallet/trust", icon: ShieldCheck },
    { title: "Reserve Fund Wallet", url: "/admin/wallet/reserve", icon: Warehouse },
    { title: "Withdrawal Requests", url: "/admin/wallet/withdrawals", icon: DollarSign },
    { title: "Pending Approvals", url: "/admin/wallet/approvals", icon: AlertTriangle },
    { title: "Approved / Rejected History", url: "/admin/wallet/history", icon: FileText },
    { title: "TDS Configuration", url: "/admin/finance/tds", icon: Percent },
    { title: "Processing Fee Rules", url: "/admin/finance/fees", icon: DollarSign },
  ]},
  { title: "Orders & Transactions", icon: ShoppingCart, submenu: [
    { title: "All Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "B2B Orders", url: "/admin/orders/b2b", icon: Building2 },
    { title: "B2C Orders", url: "/admin/orders/b2c", icon: Users },
    { title: "Bulk Orders", url: "/admin/orders/bulk", icon: Package },
    { title: "Order Returns & Refunds", url: "/admin/orders/refunds", icon: Receipt },
    { title: "Transaction Logs", url: "/admin/transactions", icon: FileText },
    { title: "Ledger View", url: "/admin/ledger", icon: FileText },
  ]},
  { title: "Risk, Fraud & Compliance", icon: ShieldAlert, warning: true, submenu: [
    { title: "Suspicious Transactions", url: "/admin/fraud/transactions", icon: AlertTriangle },
    { title: "Fake Orders", url: "/admin/fraud/orders", icon: ShoppingCart },
    { title: "Duplicate Accounts", url: "/admin/fraud/accounts", icon: Users },
    { title: "Device Tracking Flags", url: "/admin/fraud/devices", icon: AlertTriangle },
    { title: "PAN / Aadhaar Verification", url: "/admin/compliance/kyc", icon: ShieldCheck },
    { title: "Cap Violation Reports", url: "/admin/compliance/cap", icon: AlertTriangle },
    { title: "Referral Abuse Detection", url: "/admin/compliance/referral", icon: Users },
    { title: "Actions & Freezes", url: "/admin/fraud/actions", icon: ShieldAlert },
  ]},
  { title: "Audit & System Logs", icon: FileText, submenu: [
    { title: "Admin Activity Logs", url: "/admin/audit/admin", icon: FileText },
    { title: "Financial Audit Logs", url: "/admin/audit/financial", icon: DollarSign },
    { title: "Rule Change History", url: "/admin/audit/rules", icon: FileText },
    { title: "Login & Access Logs", url: "/admin/audit/login", icon: ShieldCheck },
  ]},
  { title: "Settings", icon: Settings, submenu: [
    { title: "Platform Settings", url: "/admin/settings/platform", icon: Settings },
    { title: "Notification Rules", url: "/admin/settings/notifications", icon: AlertTriangle },
    { title: "API & Integration", url: "/admin/settings/api", icon: Settings },
    { title: "Language & Localization", url: "/admin/settings/language", icon: Settings },
    { title: "Maintenance Mode", url: "/admin/settings/maintenance", icon: Settings },
  ]},
];

// Sample existing district data (for edit mode)
const existingDistricts = [
  { id: "1", name: "North Delhi", code: "ND", state: "Delhi", status: "active" },
  { id: "2", name: "South Mumbai", code: "SM", state: "Maharashtra", status: "active" },
];

export default function ManageDistrict() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  // Form state
  const [formData, setFormData] = useState({
    name: isEditMode ? "North Delhi" : "",
    state: isEditMode ? "Delhi" : "",
    code: isEditMode ? "ND" : "",
    isActive: isEditMode ? true : false,
    isActive: isEditMode ? true : false,
    notes: isEditMode ? "Primary district in Delhi NCR region" : "",
  });

  const [subdivisions, setSubdivisions] = useState<{id: string, name: string, is_active: boolean}[]>([
    { id: "1", name: "Connaught Place Region", is_active: true },
    { id: "2", name: "Karol Bagh Zone", is_active: true }
  ]);
  const [newSubdivision, setNewSubdivision] = useState("");

  const handleAddSubdivision = () => {
    if (!newSubdivision.trim()) return;
    setSubdivisions([...subdivisions, { id: Date.now().toString(), name: newSubdivision, is_active: true }]);
    setNewSubdivision("");
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check for duplicate district
  const isDuplicate = existingDistricts.some(
    d => d.name.toLowerCase() === formData.name.toLowerCase() && d.id !== editId
  );

  // Max limit is locked at 20
  const MAX_CORE_BODY_LIMIT = 20;

  const handleSave = () => {
    setShowConfirmDialog(false);
    // Save logic would go here
    console.log("Saving district:", formData);
  };

  return (
    <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/districts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                {isEditMode ? "Edit District" : "Add New District"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? "Update district details and configuration" : "Create a new district for territorial expansion"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Enter district details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">District Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g., North Delhi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {isDuplicate && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        District with this name already exists
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">District Code <span className="text-destructive">*</span></Label>
                    <Input
                      id="code"
                      placeholder="e.g., ND"
                      maxLength={4}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                    <Input
                      id="state"
                      placeholder="e.g., Delhi"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit">Max Core Body Limit</Label>
                    <div className="relative">
                      <Input
                        id="limit"
                        value={MAX_CORE_BODY_LIMIT}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge variant="outline" className="text-xs bg-cap/10 text-cap border-cap/20">
                          Locked
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Maximum 20 Core Bodies per district as per policy
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activation">Activation Status</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable district for Core Body registration
                    </p>
                  </div>
                  <Switch
                    id="activation"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Notes</CardTitle>
                <CardDescription>Internal notes (visible to admins only)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add internal notes about this district..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Subdivisions Management */}
            {isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    Subdivision Distribution Map
                    <Badge variant="secondary">{subdivisions.length} Active</Badge>
                  </CardTitle>
                  <CardDescription>Create subdivisions to assign local Dealers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter new subdivision name..." 
                      value={newSubdivision}
                      onChange={(e) => setNewSubdivision(e.target.value)}
                    />
                    <Button onClick={handleAddSubdivision} disabled={!newSubdivision.trim()}>
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {subdivisions.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{sub.name}</span>
                        </div>
                        <Switch checked={sub.is_active} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/districts">Cancel</Link>
              </Button>
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <Button disabled={!formData.name || !formData.state || !formData.code || isDuplicate}>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update District" : "Create District"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm {isEditMode ? "Update" : "Creation"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isEditMode ? (
                        <>You are about to update the district <strong>{formData.name}</strong>. This action will be logged.</>
                      ) : (
                        <>You are about to create a new district <strong>{formData.name}</strong> in {formData.state}. Core Bodies can register once activated.</>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>
                      Confirm {isEditMode ? "Update" : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Sidebar - Preview & Info */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <p className="font-semibold text-card-foreground">{formData.name || "District Name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.state || "State"} • {formData.code || "CODE"}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <CapacityBar used={0} max={MAX_CORE_BODY_LIMIT} showLabel={true} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit History (for edit mode) */}
            {isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-profit" />
                      </div>
                      <div>
                        <p className="font-medium">Activated</p>
                        <p className="text-xs text-muted-foreground">2025-08-15 10:30 by Admin</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Created</p>
                        <p className="text-xs text-muted-foreground">2025-06-01 09:00 by Admin</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activation Impact Warning */}
            <Card className={formData.isActive ? "border-warning/30" : ""}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.isActive ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-warning">This district will be activated and:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>Allow Core Body registrations</li>
                      <li>Start accepting orders</li>
                      <li>Enable revenue tracking</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">This district is currently inactive:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>No new registrations allowed</li>
                      <li>Existing Core Bodies remain active</li>
                      <li>Historical data preserved</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
