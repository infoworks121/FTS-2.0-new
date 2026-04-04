import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/productApi";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ChevronLeft,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { ProductsLayout } from "@/components/products";
import { ProductType, ProductFormData, ProductStatus } from "@/types/product";
import { IMAGE_BASE_URL } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// Steps configuration
const steps = [
  { id: 1, title: "Basic Info", description: "Product name, SKU, category", icon: Package },
  { id: 2, title: "Media", description: "Thumbnail and gallery images", icon: Eye },
  { id: 3, title: "Pricing", description: "Price, cost, margin settings", icon: DollarSign },
  { id: 4, title: "Inventory", description: "Stock and availability", icon: Tag },
  { id: 5, title: "Review", description: "Confirm and publish", icon: Check },
];

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch product data
  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
  });

  const product = data?.product;

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    categoryId: "",
    type: "physical",
    mrp: 0,
    basePrice: 0,
    sellingPrice: 0,
    bulkPrice: 0,
    adminMarginPct: 0,
    profitChannel: "B2C",
    minMarginPercent: 15,
    stockRequired: true,
    stockQuantity: 0,
    isDigital: false,
    isService: false,
    description: "",
    thumbnailUrl: "",
    imageUrls: [],
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        categoryId: String(product.category_id) || "",
        type: product.product_type || "physical",
        mrp: product.mrp || 0,
        basePrice: product.base_price || 0,
        sellingPrice: product.selling_price || 0,
        bulkPrice: product.bulk_price || 0,
        adminMarginPct: product.admin_margin_pct || 0,
        profitChannel: product.profit_channel || "B2C",
        minMarginPercent: product.min_margin_percent || 15,
        stockRequired: product.stock_required ?? true,
        stockQuantity: product.stock_quantity || 0,
        isDigital: product.is_digital || false,
        isService: product.is_service || false,
        description: product.description || "",
        thumbnailUrl: product.thumbnail_url || "",
        imageUrls: Array.isArray(product.image_urls) ? product.image_urls : [],
        status: product.status || "draft",
      });
    }
  }, [product]);

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

  // Derived calculations
  const marginPercent = formData.sellingPrice > 0 
    ? ((formData.sellingPrice - formData.basePrice) / formData.sellingPrice) * 100 
    : 0;
  const marginWarning = marginPercent < formData.minMarginPercent;

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      if (!id) throw new Error("Product ID is missing");
      await productApi.update(id, formData);
      navigate(`/admin/products/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update product';
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
        return true;
      case 3:
        return formData.mrp > 0 && formData.basePrice >= 0 && formData.sellingPrice > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) return <EditProductSkeleton />;
  if (fetchError || !product) return <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"><Tag className="h-12 w-12 text-slate-200 mx-auto mb-4" /><h3 className="text-xl font-black">Error loading product</h3><Button onClick={() => navigate("/admin/products")} variant="link">Back to list</Button></div>;

  // Render step content (Copied and slightly adjusted from AddNewProduct)
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
            <CardHeader className="pb-4 md:pb-8 pt-6 md:pt-10 px-6 md:px-10">
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Basic Information</CardTitle>
              <CardDescription>
                Update the primary identifying details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 md:px-10 pb-6 md:pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Product Name *</Label>
                    <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">SKU / Code *</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., WBH-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-base focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange("categoryId", value)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 p-2 shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold py-3">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Product Type *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: "physical", label: "Physical", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
                    { value: "digital", label: "Digital", icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50" },
                    { value: "service", label: "Service", icon: Tag, color: "text-orange-500", bg: "bg-orange-50" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all group duration-300",
                        formData.type === type.value
                          ? "border-slate-900 bg-slate-900 text-white shadow-xl translate-y-[-4px]"
                          : "border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                        formData.type === type.value ? "bg-white/10" : type.bg
                      )}>
                        <type.icon className={cn(
                          "h-6 w-6 transition-all",
                          formData.type === type.value ? "text-white scale-110" : type.color
                        )} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-[0.2em]">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detail your product value proposition..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium text-base p-4 md:p-6"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
            <CardHeader className="pb-4 md:pb-8 pt-6 md:pt-10 px-6 md:px-10">
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Product Media Assets</CardTitle>
              <CardDescription>
                Refresh your thumbnail and gallery to catch the user's attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-10 px-6 md:px-10 pb-6 md:pb-10">
              {/* Thumbnail Section */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Current Thumbnail</Label>
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100">
                  <div className="relative group h-40 w-40 md:h-48 md:w-48 rounded-2xl md:rounded-[2rem] bg-white border shadow-inner flex items-center justify-center overflow-hidden transition-all hover:ring-8 hover:ring-blue-50">
                    {formData.thumbnailUrl ? (
                      <img 
                        src={formData.thumbnailUrl.startsWith('data:') || formData.thumbnailUrl.startsWith('http') ? formData.thumbnailUrl : `${IMAGE_BASE_URL}${formData.thumbnailUrl}`} 
                        alt="Thumbnail preview" 
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <Upload className="h-10 w-10 text-slate-200" />
                    )}
                    {isUploading === "thumbnailUrl" && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                       <Button 
                         type="button" 
                         variant="outline" 
                         className="relative h-12 px-8 font-black rounded-xl border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm"
                       >
                         <Upload className="h-5 w-5 mr-3 text-blue-600" />
                         UPLOAD NEW
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
                           onClick={() => handleInputChange("thumbnailUrl", "")}
                           className="h-12 px-6 rounded-xl text-red-500 font-bold hover:bg-red-50"
                         >
                           <X className="h-4 w-4 mr-2" /> REMOVE
                         </Button>
                       )}
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                       Optimal: 1200x1200px — JPG, WebP, PNG
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="space-y-4 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Product Gallery</Label>
                    <p className="text-xs font-bold text-slate-400 mt-1">{formData.imageUrls?.length || 0} Images Active</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="font-black text-xs h-10 px-6 rounded-xl border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    onClick={() => handleInputChange("imageUrls", [...(formData.imageUrls || []), ""])}
                  >
                    + ADD GALLERY IMAGE
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pt-4">
                  {(formData.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl md:rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200">
                      {url ? (
                        <img 
                          src={url.startsWith('data:') || url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`} 
                          alt="" 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <Package className="h-10 w-10 text-slate-200" />
                      )}
                      
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                         <div className="relative">
                            <Button variant="secondary" className="h-10 w-10 p-0 rounded-full bg-white text-slate-900 shadow-xl">
                              <Upload className="h-4 w-4" />
                            </Button>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "imageUrls", idx);
                              }}
                            />
                         </div>
                         <Button
                          variant="destructive"
                          size="icon"
                          className="h-10 w-10 rounded-full shadow-xl"
                          onClick={() => {
                            const newUrls = (formData.imageUrls || []).filter((_, i) => i !== idx);
                            handleInputChange("imageUrls", newUrls);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {isUploading === `imageUrls-${idx}` && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(formData.imageUrls || []).length === 0 && (
                    <div className="col-span-full py-16 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 bg-slate-50/30">
                      <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-lg"><Eye className="h-8 w-8 text-slate-200" /></div>
                      <div className="text-center">
                         <p className="font-black text-slate-400 text-xs uppercase tracking-widest">No Gallery Assets Found</p>
                         <p className="text-xs text-slate-300 font-medium mt-1">Add images to boost your conversion rates.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
            <CardHeader className="pb-4 md:pb-8 pt-6 md:pt-10 px-6 md:px-10">
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Financial Engine</CardTitle>
              <CardDescription>
                Calibrate your listing price and manage profit margins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8 px-6 md:px-10 pb-6 md:pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="mrp" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Maximum Retail Price (₹) *</Label>
                  <div className="relative">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <Input
                        id="mrp"
                        type="number"
                        placeholder="0.00"
                        value={formData.mrp || ""}
                        onChange={(e) => handleInputChange("mrp", parseFloat(e.target.value) || 0)}
                        className="h-12 md:h-16 rounded-xl md:rounded-2xl pl-10 md:pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-black text-lg md:text-2xl"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Base Price / Cost (₹) *</Label>
                  <div className="relative">
                     <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <Input
                        id="basePrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.basePrice || ""}
                        onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                        className="h-12 md:h-16 rounded-xl md:rounded-2xl pl-10 md:pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-black text-lg md:text-2xl"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Selling Price (B2C) ₹ *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0.00"
                      value={formData.sellingPrice || ""}
                      onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)}
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl pl-10 md:pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-black text-lg md:text-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulkPrice" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Bulk Price (B2B) ₹</Label>
                  <div className="relative">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                     <Input
                        id="bulkPrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.bulkPrice || ""}
                        onChange={(e) => handleInputChange("bulkPrice", parseFloat(e.target.value) || 0)}
                        className="h-12 md:h-16 rounded-xl md:rounded-2xl pl-10 md:pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-black text-lg md:text-2xl"
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminMarginPct" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Admin Margin %</Label>
                  <Input
                    id="adminMarginPct"
                    type="number"
                    placeholder="0.00"
                    value={formData.adminMarginPct || ""}
                    onChange={(e) => handleInputChange("adminMarginPct", parseFloat(e.target.value) || 0)}
                    className="h-12 rounded-xl text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profitChannel" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Profit Channel *</Label>
                  <Select
                    value={formData.profitChannel}
                    onValueChange={(value) => handleInputChange("profitChannel", value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white text-base">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2C">B2C (Retail)</SelectItem>
                      <SelectItem value="B2B">B2B (Bulk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={cn(
                "p-6 md:p-8 rounded-3xl border-2 transition-all duration-500",
                marginWarning 
                ? "border-amber-100 bg-amber-50/50 shadow-xl shadow-amber-500/5" 
                : "border-emerald-100 bg-emerald-50/50 shadow-xl shadow-emerald-500/5"
              )}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg ring-4 md:ring-8",
                      marginWarning ? "bg-amber-500 ring-amber-500/10" : "bg-emerald-500 ring-emerald-500/10"
                    )}>
                       <Check className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Projected Margin</p>
                      <h4 className={cn(
                        "text-2xl md:text-4xl font-black tracking-tighter",
                        marginWarning ? "text-amber-600" : "text-emerald-700"
                      )}>
                        {marginPercent.toFixed(1)}%
                      </h4>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                       <AlertTriangle className={cn("h-4 w-4", marginWarning ? "text-amber-500 animate-pulse" : "text-emerald-500")} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Threshold Check: {formData.minMarginPercent}%</span>
                    </div>
                    {marginWarning && (
                      <p className="text-xs text-amber-600 font-bold mt-2 uppercase tracking-tight">Warning: Margin falls below compliance</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <Label htmlFor="minMargin" className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Minimum Margin (%)</Label>
                   <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{formData.minMarginPercent}%</span>
                </div>
                <Input
                  id="minMargin"
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.minMarginPercent}
                  onChange={(e) => handleInputChange("minMarginPercent", parseFloat(e.target.value) || 0)}
                  className="h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2 italic">
                  * Margin floor is syncronized with the Category Global Rule.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
            <CardHeader className="pb-4 md:pb-8 pt-6 md:pt-10 px-6 md:px-10">
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Inventory Logic</CardTitle>
              <CardDescription>
                Configure how the system handles fulfillment and stock levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8 px-6 md:px-10 pb-6 md:pb-10">
              <div 
                className={cn(
                  "p-6 md:p-8 rounded-3xl border transition-all cursor-pointer group",
                  formData.stockRequired ? "bg-blue-600 border-blue-700 shadow-2xl shadow-blue-500/20" : "bg-slate-50 border-slate-100"
                )}
                onClick={() => handleInputChange("stockRequired", !formData.stockRequired)}
              >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                        formData.stockRequired ? "bg-white text-blue-600" : "bg-white text-slate-200"
                      )}>
                         <Package className="h-7 w-7" />
                      </div>
                      <div>
                         <p className={cn("text-lg font-black tracking-tight", formData.stockRequired ? "text-white" : "text-slate-900")}>Managed Inventory</p>
                         <p className={cn("text-sm font-medium", formData.stockRequired ? "text-blue-100" : "text-slate-400")}>Track every unit for high accuracy fulfillment</p>
                      </div>
                   </div>
                   <Checkbox
                     id="stockRequired"
                     checked={formData.stockRequired}
                     onCheckedChange={(checked) => handleInputChange("stockRequired", checked)}
                     className="h-6 w-6 border-slate-200 bg-white"
                   />
                </div>
              </div>

              {formData.stockRequired && (
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                  <Label htmlFor="stockQuantity" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Available Units in Warehouse</Label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="stockQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity || ""}
                      onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)}
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl pl-10 md:pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-black text-lg md:text-2xl"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div 
                   className={cn(
                     "p-6 rounded-[2rem] border transition-all cursor-pointer",
                     formData.isDigital ? "bg-purple-600 border-purple-700 text-white" : "bg-slate-50 border-slate-100"
                   )}
                   onClick={() => formData.type === "digital" && handleInputChange("isDigital", !formData.isDigital)}
                 >
                    <div className="flex flex-col gap-4">
                       <Database className={cn("h-8 w-8", formData.isDigital ? "text-purple-100" : "text-slate-200")} />
                       <div>
                          <p className="font-black text-xs uppercase tracking-[0.2em] mb-1">Digital SKU</p>
                          <p className="text-sm font-medium opacity-80">Mark as downloadable asset</p>
                       </div>
                    </div>
                 </div>

                 <div 
                   className={cn(
                     "p-6 rounded-[2rem] border transition-all cursor-pointer",
                     formData.isService ? "bg-orange-600 border-orange-700 text-white" : "bg-slate-50 border-slate-100"
                   )}
                   onClick={() => formData.type === "service" && handleInputChange("isService", !formData.isService)}
                 >
                    <div className="flex flex-col gap-4">
                       <Layers className={cn("h-8 w-8", formData.isService ? "text-orange-100" : "text-slate-200")} />
                       <div>
                          <p className="font-black text-xs uppercase tracking-[0.2em] mb-1">Service Logic</p>
                          <p className="text-sm font-medium opacity-80">Enable booking-based flows</p>
                       </div>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        // Reuse Review & Publish UI from AddNewProduct if needed or simplify
        return (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl">
            <CardHeader className="pb-4 md:pb-8 pt-6 md:pt-10 px-6 md:px-10">
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Strategic Audit</CardTitle>
              <CardDescription>Final validation of your product portfolio update.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-6 md:pb-10 space-y-6 md:space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                     <Package className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Metadata</p>
                     <h3 className="text-3xl font-black tracking-tighter mb-2">{formData.name}</h3>
                     <p className="text-blue-400 font-bold bg-blue-400/10 inline-block px-3 py-1 rounded-lg">SKU: {formData.sku}</p>
                     <Separator className="my-6 bg-white/10" />
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inventory</p>
                           <p className="text-xl font-black text-white">{formData.stockRequired ? `${formData.stockQuantity} Units` : "Unlimited"}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</p>
                           <p className="text-xl font-black text-white uppercase">{formData.type}</p>
                        </div>
                     </div>
                  </div>

                  <div className={cn(
                    "rounded-[2.5rem] p-8 border-2 relative overflow-hidden group",
                    marginWarning ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                  )}>
                     <DollarSign className="absolute -right-4 -bottom-4 h-32 w-32 text-slate-900/5 group-hover:scale-110 transition-transform duration-700" />
                     <p className={cn("text-xs font-black uppercase tracking-widest mb-4", marginWarning ? "text-amber-600" : "text-emerald-600")}>Financial Health</p>
                     <div className="flex items-baseline gap-2">
                        <h3 className="text-5xl font-black tracking-tighter text-slate-900">{formData.sellingPrice}</h3>
                        <span className="text-lg font-bold text-slate-400">INR</span>
                     </div>
                     <Separator className={cn("my-6", marginWarning ? "bg-amber-200" : "bg-emerald-200")} />
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Margin Yield</p>
                           <p className={cn("text-2xl font-black", marginWarning ? "text-amber-600" : "text-emerald-600")}>{marginPercent.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                           <Badge className={cn("font-black text-[10px] uppercase tracking-widest h-8 px-4", formData.status === 'active' ? "bg-emerald-500" : "bg-slate-400")}>
                             {formData.status}
                           </Badge>
                        </div>
                     </div>
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
    <div className="space-y-4 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(`/admin/products/${id}`)} className="h-8 w-8 rounded-full shadow-sm">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
           <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">Edit Product</h1>
           <p className="text-slate-500 font-medium text-[10px] md:text-xs">Modify SKU attributes and pricing</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-bold flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Modern Stepper */}
      <div className="grid grid-cols-5 gap-2 max-w-4xl px-2">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="space-y-2 cursor-pointer group"
            onClick={() => setCurrentStep(step.id)}
          >
            <div 
              className={cn(
                "h-1.5 rounded-full transition-all duration-700 group-hover:bg-slate-400",
                currentStep >= step.id ? "bg-slate-900" : "bg-slate-100"
              )} 
            />
            <div className={cn(
              "hidden sm:flex items-center gap-2 transition-opacity duration-300 group-hover:opacity-100",
              currentStep === step.id ? "opacity-100" : "opacity-40"
            )}>
               <step.icon className="h-3 w-3 text-slate-900" />
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-xl z-50 py-4 shadow-[0_-10px_40px_rgba(30,41,59,0.05)]">
        <div className="container max-w-5xl flex items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSaving}
            className="h-11 md:h-14 px-4 md:px-8 rounded-xl md:rounded-2xl font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] md:text-xs"
          >
            <ArrowLeft className="h-5 w-5 mr-1 md:mr-3" />
            Previous
          </Button>

          <div className="flex items-center gap-2 md:gap-4">
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-11 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px] md:text-xs"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-1 md:mr-3" />
              </Button>
            ) : (
              <div className="flex gap-2 md:gap-4">
                 <Button
                    variant="outline"
                    onClick={() => handleInputChange('status', formData.status === 'active' ? 'draft' : 'active')}
                    className="h-11 md:h-14 px-3 md:px-6 rounded-xl md:rounded-2xl border-slate-200 font-bold text-xs"
                  >
                    Set to {formData.status === 'active' ? 'Draft' : 'Active'}
                 </Button>
                 <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-11 md:h-14 px-6 md:px-12 rounded-xl md:rounded-2xl font-black bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] md:text-xs"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        SYNCING...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-3" />
                        UPDATE CATALOG
                      </>
                    )}
                  </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Database(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function Layers(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function EditProductSkeleton() {
  return (
    <div className="space-y-10 pb-32">
       <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
             <Skeleton className="h-8 w-48" />
             <Skeleton className="h-4 w-64" />
          </div>
       </div>
       <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-2 rounded-full" />)}
       </div>
       <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
    </div>
  );
}
