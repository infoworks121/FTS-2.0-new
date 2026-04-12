import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CapacityBar } from "@/components/districts";
import { useToast } from "@/components/ui/use-toast";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Save,
  ArrowLeft,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import geographyApi, { State } from "@/lib/geographyApi";

export default function ManageDistrict() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    state_id: "",
    code: "",
    isActive: true,
    max_core_body: 20,
    notes: "",
  });

  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [subdivisions, setSubdivisions] = useState<{id: string, name: string, is_active: boolean}[]>([]);
  const [newSubdivision, setNewSubdivision] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch states
        const statesData = await geographyApi.getStates();
        setStates(statesData);

        if (isEditMode) {
          // Fetch district details
          const district = await geographyApi.getDistrict(editId!);
          setFormData({
            name: district.name,
            state_id: district.state_id?.toString() || "",
            code: district.code || "",
            isActive: district.is_active,
            max_core_body: district.max_limit || 20,
            notes: "", // Notes are not yet supported in DB but could be added to extra JSON if needed
          });

          // Fetch subdivisions
          const subs = await geographyApi.getSubdivisionsByDistrict(editId!);
          setSubdivisions(subs);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [editId, isEditMode, toast]);

  const handleAddSubdivision = async () => {
    if (!newSubdivision.trim() || !editId) return;
    try {
      // Logic for adding subdivision would go through another API call if implemented
      // For now, we update local state but in a real app this should call geographyApi.createSubdivision
      setSubdivisions([...subdivisions, { id: Date.now().toString(), name: newSubdivision, is_active: true }]);
      setNewSubdivision("");
    } catch (error) {
      console.error("Failed to add subdivision:", error);
    }
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      if (isEditMode) {
        await geographyApi.updateDistrict(editId!, {
          name: formData.name,
          code: formData.code,
          is_active: formData.isActive,
          max_core_body: formData.max_core_body,
          state_id: parseInt(formData.state_id)
        });
        toast({
          title: "Success",
          description: "District updated successfully",
        });
      } else {
        await geographyApi.createDistrict({
          name: formData.name,
          code: formData.code,
          state_id: parseInt(formData.state_id),
          isActive: formData.isActive,
          max_core_body: formData.max_core_body
        });
        toast({
          title: "Success",
          description: "District created successfully",
        });
      }
      navigate("/admin/districts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save district",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedStateName = states.find(s => s.id.toString() === formData.state_id)?.name || "";

  return (
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
                    <Select value={formData.state_id} onValueChange={(val) => setFormData({ ...formData, state_id: val })}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit">Max Core Body Limit</Label>
                    <div className="relative">
                      <Input
                        id="limit"
                        value={formData.max_core_body}
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
              <Button 
                disabled={!formData.name || !formData.state_id || !formData.code || isSaving}
                onClick={() => setShowConfirmDialog(true)}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isEditMode ? "Update District" : "Create District"}
              </Button>

              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm {isEditMode ? "Update" : "Creation"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isEditMode ? (
                        <>You are about to update the district <strong>{formData.name}</strong>. This action will be logged.</>
                      ) : (
                        <>You are about to create a new district <strong>{formData.name}</strong> in {selectedStateName}. Core Bodies can register once activated.</>
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
                      {selectedStateName || "State"} • {formData.code || "CODE"}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <CapacityBar used={0} max={formData.max_core_body} showLabel={true} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
  );
}
