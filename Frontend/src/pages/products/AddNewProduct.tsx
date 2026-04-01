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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Eye,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { ProductsLayout } from "@/components/products";
import { ProductType, ProductFormData } from "@/types/product";

// Steps configuration
const steps = [
  { id: 1, title: "Basic Info", description: "Product name, SKU, category", icon: Package },
  { id: 2, title: "Media", description: "Thumbnail and gallery images", icon: Eye },
  { id: 3, title: "Pricing", description: "Price, cost, margin settings", icon: DollarSign },
  { id: 4, title: "Inventory", description: "Stock and availability", icon: Tag },
  { id: 5, title: "Review", description: "Confirm and publish", icon: Check },
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
    thumbnailUrl: "",
    imageUrls: [],
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
    if (currentStep < 5) {
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

  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleFileUpload = async (file: File, field: "thumbnailUrl" | "imageUrls", index?: number) => {
    try {
      const uploadId = index !== undefined ? `${field}-${index}` : field;
      setIsUploading(uploadId);
      const res = await uploadApi.uploadSingle(file);
      
      // The backend returns a relative URL like /uploads/filename.jpg
      const fileUrl = res.url; 
      
      if (field === "thumbnailUrl") {
        handleInputChange("thumbnailUrl", fileUrl);
      } else if (field === "imageUrls" && index !== undefined) {
        const newUrls = [...(formData.imageUrls || [])];
        newUrls[index] = fileUrl;
        handleInputChange("imageUrls", newUrls);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.sku && formData.categoryId && formData.type;
      case 2:
        return true; // Images are optional for now
      case 3:
        return formData.basePrice > 0 && formData.costPrice >= 0;
      case 4:
        return true;
      case 5:
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
              <CardTitle>Product Media</CardTitle>
              <CardDescription>
                Add a main thumbnail and gallery images for your product. You can either upload files or paste direct links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Thumbnail Section */}
              <div className="space-y-4">
                <Label className="text-base font-bold">Main Thumbnail</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="upload" className="flex gap-2">
                       <Upload className="h-4 w-4" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex gap-2">
                       <Tag className="h-4 w-4" /> Paste Link
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4 pt-4">
                    <div className="flex items-center gap-6">
                      <div className="relative group h-32 w-32 rounded-xl bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50">
                        {formData.thumbnailUrl ? (
                          <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Preview</p>
                          </div>
                        )}
                        {isUploading === "thumbnailUrl" && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                           <Button 
                             type="button" 
                             variant="outline" 
                             className="relative h-10 px-6 font-bold overflow-hidden"
                           >
                             <Upload className="h-4 w-4 mr-2" />
                             Choose File
                             <input 
                               type="file" 
                               className="absolute inset-0 opacity-0 cursor-pointer" 
                               accept="image/*"
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) handleFileUpload(file, "thumbnailUrl");
                               }}
                             />
                           </Button>
                           {formData.thumbnailUrl && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="text-red-500 hover:text-red-600 hover:bg-red-50"
                               onClick={() => handleInputChange("thumbnailUrl", "")}
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                          Recommended size: 800x800px. JPG, PNG or WebP allowed. Max size 5MB.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="link" className="space-y-4 pt-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <Input
                          id="thumbnail"
                          placeholder="https://example.com/image.jpg"
                          value={formData.thumbnailUrl}
                          onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Paste a direct link to an image. This image will be the face of your product.
                        </p>
                      </div>
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden border">
                        {formData.thumbnailUrl ? (
                          <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = "")} />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Gallery Section */}
              <div className="space-y-4 pt-10 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-bold">Product Gallery</Label>
                    <p className="text-xs text-muted-foreground">Add multiple images to showcase features and details.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="font-bold border-blue-500/30 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleInputChange("imageUrls", [...(formData.imageUrls || []), ""])}
                  >
                    + Add New Image
                  </Button>
                </div>
                
                <div className="grid gap-6">
                  {(formData.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Image #{idx + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            const newUrls = (formData.imageUrls || []).filter((_, i) => i !== idx);
                            handleInputChange("imageUrls", newUrls);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="bg-background/50 h-8 p-0.5">
                          <TabsTrigger value="upload" className="text-[10px] px-3 py-1">Upload</TabsTrigger>
                          <TabsTrigger value="link" className="text-[10px] px-3 py-1">Link</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload" className="pt-3">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded border bg-background flex items-center justify-center overflow-hidden">
                              {url ? (
                                <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                              ) : (
                                <Upload className="h-4 w-4 text-muted-foreground/30" />
                              )}
                              {isUploading === `imageUrls-${idx}` && (
                                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm" className="relative font-bold">
                               Select File
                               <input 
                                 type="file" 
                                 className="absolute inset-0 opacity-0 cursor-pointer" 
                                 accept="image/*"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) handleFileUpload(file, "imageUrls", idx);
                                 }}
                               />
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="link" className="pt-3">
                          <div className="flex gap-4">
                            <Input
                              placeholder="Paste gallery image URL"
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...(formData.imageUrls || [])];
                                newUrls[idx] = e.target.value;
                                handleInputChange("imageUrls", newUrls);
                              }}
                            />
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-background flex items-center justify-center overflow-hidden border">
                              {url ? (
                                <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground/50" />
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ))}
                  
                  {(formData.imageUrls || []).length === 0 && (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-3">
                      <Package className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">Your gallery is currently empty.</p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="font-bold"
                        onClick={() => handleInputChange("imageUrls", [""])}
                      >
                         Add First Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
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

      case 4:
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

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>
                Review your product details before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Media Summary */}
              <div className="p-4 rounded-lg border bg-muted/20">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Media Assets</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Thumbnail</p>
                    <div className="h-20 w-20 rounded bg-muted border overflow-hidden">
                      {formData.thumbnailUrl ? (
                         <img src={formData.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : <Package className="h-full w-full p-4 text-muted-foreground/30" />}
                    </div>
                  </div>
                  {formData.imageUrls && formData.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Gallery ({formData.imageUrls.length})</p>
                      <div className="flex gap-2">
                         {formData.imageUrls.slice(0, 3).map((url, i) => (
                           <div key={i} className="h-20 w-20 rounded bg-muted border overflow-hidden">
                             {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : null}
                           </div>
                         ))}
                         {formData.imageUrls.length > 3 && (
                           <div className="h-20 w-20 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary">
                             +{formData.imageUrls.length - 3} More
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                </div>
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
            {currentStep < 5 ? (
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
