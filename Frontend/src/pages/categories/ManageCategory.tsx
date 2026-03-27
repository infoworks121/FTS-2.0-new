import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Save, 
  Folder,
  Tag,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { CategoryFormData, Category } from "@/types/product";
import { productApi } from "@/lib/productApi";
import { useToast } from "@/components/ui/use-toast";

// Removed mockCommissionRules - now fetching from API

export default function ManageCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");
  const isEditing = !!categoryId;
  const { toast } = useToast();
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    parentId: "none",
    description: "",
    commissionRuleId: "none",
    iconUrl: "",
    sortOrder: 0,
    status: "active",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, rulesData] = await Promise.all([
          productApi.getCategories(),
          productApi.getCommissionRules()
        ]);
        setCategories(catData.categories || []);
        setCommissionRules(rulesData.rules || []);
        
        if (isEditing) {
          const cat = catData.categories.find((c: any) => c.id.toString() === categoryId);
          if (cat) {
            setFormData({
              name: cat.name,
              parentId: cat.parent_id ? cat.parent_id.toString() : "none",
              description: cat.description || "",
              commissionRuleId: cat.commission_rule_id || "none",
              iconUrl: cat.icon_url || "",
              sortOrder: cat.sort_order || 0,
              status: cat.is_active ? "active" : "inactive",
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      }
    };
    fetchData();
  }, [categoryId, isEditing, toast]);

  const selectedParent = categories.find(c => c.id.toString() === formData.parentId);
  const selectedRule = commissionRules.find(r => r.id === formData.commissionRuleId);

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        icon_url: formData.iconUrl,
        sort_order: Number(formData.sortOrder) || 0,
        parent_id: formData.parentId === "none" ? null : formData.parentId,
        commission_rule_id: formData.commissionRuleId === "none" ? null : formData.commissionRuleId,
        is_active: formData.status === "active",
      };
      
      if (isEditing && categoryId) {
        await productApi.updateCategory(categoryId, payload);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        await productApi.createCategory(payload);
        toast({ title: "Success", description: "Category created successfully" });
      }
      
      setHasChanges(false);
      navigate("/admin/categories");
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.error || "Failed to save category", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/categories")}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing 
              ? "Update category details and settings" 
              : "Create a new category for your products"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Enter the basic information for this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Electronics, Fashion, Services"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleInputChange("parentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Top Level)</SelectItem>
                    {categories.map((cat: any) => (
                      // Prevent a category from being its own parent
                      cat.id.toString() !== categoryId && (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to create a top-level category
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this category"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Icon URL */}
                <div className="space-y-2">
                  <Label htmlFor="iconUrl">Icon URL (Optional)</Label>
                  <Input
                    id="iconUrl"
                    placeholder="https://example.com/icon.png"
                    value={formData.iconUrl}
                    onChange={(e) => handleInputChange("iconUrl", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL for the category icon image
                  </p>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    placeholder="0"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first (e.g., 0, 1, 2)
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Category Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this category
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) => 
                      handleInputChange("status", checked ? "active" : "inactive")
                    }
                  />
                  <span className="text-sm">
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Commission Rule
              </CardTitle>
              <CardDescription>
                Assign a commission rule to products in this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.commissionRuleId}
                onValueChange={(value) => handleInputChange("commissionRuleId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Rule Selected</SelectItem>
                  {commissionRules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{rule.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {rule.percentage}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Products in this category will use this commission rule for profit calculation.
                  You can override this at the product level if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          {showPreview && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Folder className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{formData.name || "Category Name"}</p>
                    {selectedParent && (
                      <p className="text-xs text-muted-foreground">
                        Parent: {selectedParent.name}
                      </p>
                    )}
                  </div>
                </div>
                {formData.description && (
                  <p className="text-sm text-muted-foreground">
                    {formData.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                    {formData.status}
                  </Badge>
                  {selectedRule && (
                    <Badge variant="outline">
                      {selectedRule.name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">
                  Cannot delete categories with products
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                If you want to remove a category, first move or delete all products in it.
              </p>
            </CardContent>
          </Card>

          {/* Hierarchy Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Hierarchy Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {selectedParent ? (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Folder className="h-4 w-4" />
                      {selectedParent.name}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-muted-foreground">→</span>
                      <Folder className="h-4 w-4 text-amber-500" />
                      {formData.name || "New Category"}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-amber-500" />
                    {formData.name || "New Category"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                You have unsaved changes
              </span>
            ) : (
              "No unsaved changes"
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/categories")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !formData.name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
