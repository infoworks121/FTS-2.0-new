import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/lib/productApi";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Package, 
  DollarSign, 
  Tag,
  AlertTriangle,
  Save,
} from "lucide-react";
import { ProductsLayout } from "@/components/products";
import { ProductType, ProductFormData } from "@/types/product";

// Steps configuration
const steps = [
  { id: 1, title: "Basic Info", description: "Product name, SKU, category", icon: Package },
  { id: 2, title: "Pricing", description: "Price, cost, margin settings", icon: DollarSign },
  { id: 3, title: "Inventory", description: "Stock and availability", icon: Tag },
  { id: 4, title: "Review", description: "Confirm and publish", icon: Check },
];



export default function AddNewProduct() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi.getCategories()
      .then((data) => {
        const cats = (data.categories || []).map((c: { id: number; name: string }) => ({
          id: String(c.id),
          name: c.name,
        }));
        setCategories(cats);
      })
      .catch((err) => {
        console.error('Categories fetch error:', err?.response?.data || err.message);
        setCategories([]);
      });
  }, []);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    categoryId: "",
    type: "physical",
    basePrice: 0,
    costPrice: 0,
    minMarginPercent: 15,
    stockRequired: true,
    stockQuantity: 0,
    isDigital: false,
    isService: false,
    description: "",
  });

  // Derived calculations
  const marginPercent = formData.costPrice > 0 
    ? ((formData.basePrice - formData.costPrice) / formData.basePrice) * 100 
    : 0;
  const marginWarning = marginPercent < formData.minMarginPercent;

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await productApi.create({ ...formData, status: 'active' });
      setHasChanges(false);
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to publish product';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await productApi.create({ ...formData, status: 'draft' });
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save draft';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.sku && formData.categoryId && formData.type;
      case 2:
        return formData.basePrice > 0 && formData.costPrice >= 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Code *</Label>
                <Input
                  id="sku"
                  placeholder="e.g., WBH-001"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label>Product Type *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "physical", label: "Physical", icon: Package },
                    { value: "digital", label: "Digital", icon: DollarSign },
                    { value: "service", label: "Service", icon: Tag },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                        formData.type === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <type.icon className={cn(
                        "h-6 w-6",
                        formData.type === type.value ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        formData.type === type.value ? "text-primary" : "text-muted-foreground"
                      )}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description (optional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Commission</CardTitle>
              <CardDescription>
                Set your product pricing and margin settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.basePrice || ""}
                  onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.costPrice || ""}
                  onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Margin Display */}
              <div className={cn(
                "p-4 rounded-lg border",
                marginWarning 
                  ? "border-amber-500/30 bg-amber-500/10" 
                  : "border-green-500/30 bg-green-500/10"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Calculated Margin</p>
                    <p className="text-xs text-muted-foreground">
                      Based on base price and cost price
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-2xl font-bold",
                      marginWarning ? "text-amber-600" : "text-green-600"
                    )}>
                      {marginPercent.toFixed(1)}%
                    </p>
                    {marginWarning && (
                      <p className="text-xs text-amber-600">
                        Below minimum {formData.minMarginPercent}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Minimum Margin */}
              <div className="space-y-2">
                <Label htmlFor="minMargin">Minimum Allowed Margin (%)</Label>
                <Input
                  id="minMargin"
                  type="number"
                  value={formData.minMarginPercent}
                  onChange={(e) => handleInputChange("minMarginPercent", parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  System will warn if margin falls below this threshold
                </p>
              </div>

              {/* Commission Rule Info */}
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Commission Rule</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Category commission rule will be automatically applied based on the selected category.
                  You can override this in Product Pricing settings after creation.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Inventory & Availability</CardTitle>
              <CardDescription>
                Configure stock settings and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stock Required */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stockRequired"
                  checked={formData.stockRequired}
                  onCheckedChange={(checked) => handleInputChange("stockRequired", checked)}
                />
                <Label htmlFor="stockRequired" className="text-sm font-normal">
                  Track inventory for this product
                </Label>
              </div>

              {/* Stock Quantity (if stock required) */}
              {formData.stockRequired && (
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Initial Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="0"
                    value={formData.stockQuantity || ""}
                    onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Digital Flag */}
              {formData.type === "digital" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDigital"
                    checked={formData.isDigital}
                    onCheckedChange={(checked) => handleInputChange("isDigital", checked)}
                  />
                  <Label htmlFor="isDigital" className="text-sm font-normal">
                    This is a digital product (will be delivered electronically)
                  </Label>
                </div>
              )}

              {/* Service Flag */}
              {formData.type === "service" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isService"
                    checked={formData.isService}
                    onCheckedChange={(checked) => handleInputChange("isService", checked)}
                  />
                  <Label htmlFor="isService" className="text-sm font-normal">
                    This is a service (will be performed on-demand)
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>
                Review your product details before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium">{formData.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{formData.sku || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {categories.find(c => c.id === formData.categoryId)?.name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="secondary" className="capitalize">
                    {formData.type}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">₹{formData.basePrice.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="font-medium">₹{formData.costPrice.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Margin</p>
                  <p className={cn(
                    "font-medium",
                    marginWarning ? "text-amber-600" : "text-green-600"
                  )}>
                    {marginPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium">
                    {formData.stockRequired 
                      ? `${formData.stockQuantity} units` 
                      : "Not tracked"}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {marginWarning && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-amber-600">
                    Margin is below the minimum threshold of {formData.minMarginPercent}%
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-lg border bg-blue-500/10">
                <Tag className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-blue-600">
                  Product will be saved as "Draft" and can be activated later
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-600">
          {error}
        </div>
      )}
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep >= step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="hidden md:block">
                <p className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "w-12 lg:w-24 h-0.5 mx-2",
                currentStep > step.id ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            {currentStep < 4 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                disabled={!canProceed() || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? "Publishing..." : "Publish Product"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
