import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/productApi";
import { orderApi } from "@/lib/orderApi";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NavItem } from "@/components/DashboardLayout";
import { sidebarNavItems as adminNavItems } from "@/config/sidebarConfig";
import { getBusinessmanSidebarNavItems } from "@/config/businessmanSidebarConfig";
import { getSPHSidebarNavItems } from "@/config/sphSidebarConfig";
import { getCoreBodyFlatNavItems } from "@/config/coreBodySidebarConfig";
import { 
  ArrowLeft, ShoppingCart, ShieldCheck, 
  Truck, Star, ChevronRight, Info, 
  CheckCircle2, Package, Layers, 
  AlertCircle, ChevronLeft, Heart, 
  Share2, MapPin, RefreshCcw, Tag,
  Minus, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { IMAGE_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export default function BusinessmanProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["businessman-profile"],
    queryFn: () => orderApi.getBusinessmanProfile(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-public", slug],
    queryFn: () => productApi.getBySku(slug!),
    enabled: !!slug,
  });

  const product = data?.product;

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [];
    if (product.thumbnail_url) images.push(product.thumbnail_url);
    if (product.image_urls && Array.isArray(product.image_urls)) {
      images.push(...product.image_urls);
    }
    return images;
  }, [product]);

  useEffect(() => {
    if (product?.thumbnail_url && !activeImage) {
      setActiveImage(product.thumbnail_url);
    }
    if (product?.variants?.length > 0 && !selectedVariantId) {
      setSelectedVariantId(null);
    }
    
    // Set initial quantity to min_order_quantity
    if (product && product.min_order_quantity && quantity < (product.min_order_quantity || 1)) {
      setQuantity(parseInt(product.min_order_quantity) || 1);
    }
  }, [product, activeImage, selectedVariantId, quantity]);

  const getImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId || !product?.variants) return null;
    return product.variants.find((v: any) => v.id === selectedVariantId);
  }, [selectedVariantId, product]);

  const displayPrice = selectedVariant?.selling_price || product?.selling_price || product?.base_price || 0;
  const displayMRP = selectedVariant?.mrp || product?.mrp || 0;
  const discountPercent = displayMRP > displayPrice ? Math.round(((displayMRP - displayPrice) / displayMRP) * 100) : 0;

  const isLocal = profile?.district_id === (product as any)?.source_district_id;

  const handlePurchase = async () => {
    if (pin.length !== 6) {
      toast({ title: "Invalid PIN", description: "Please enter a 6-digit transaction PIN.", variant: "destructive" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await orderApi.createB2BOrder({
        items: [
          {
            product_id: product.id,
            variant_id: selectedVariantId || undefined,
            quantity: quantity,
          }
        ],
        payment_method: "wallet",
        transaction_pin: pin,
        notes: `Purchase from details page`
      });

      toast({ title: "Success", description: "B2B Order placed successfully!" });
      setConfirmOpen(false);
      setPin("");
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const roleCode = user?.role_code || "guest";
  const layoutProps = useMemo(() => {
    switch (roleCode) {
      case "admin":
        return {
          role: "admin" as const,
          roleLabel: "Super Admin",
          navItems: adminNavItems as NavItem[]
        };
      case "retailer":
      case "businessman":
        return {
          role: "businessman" as const,
          roleLabel: `Businessman — ${user?.full_name || 'Business'}`,
          navItems: getBusinessmanSidebarNavItems({
            isStockPoint: user?.is_sph || false,
            bulkEnabled: true,
            entryModeEnabled: true,
            advanceModeEnabled: true,
            businessmanType: user?.businessman_type,
            permissions: user?.permissions || [],
            blockedMenus: {},
          }) as NavItem[]
        };
      case "stock_point":
        return {
          role: "stock_point" as const,
          roleLabel: "STOCK POINT HOLDER",
          navItems: getSPHSidebarNavItems({
            permissions: user?.permissions || [],
          }) as NavItem[]
        };
      case "core_body":
      case "core_body_a":
      case "core_body_b":
        const type = user?.core_body_type || (roleCode === "core_body_a" ? "A" : "B");
        return {
          role: "corebody" as const,
          roleLabel: `CORE BODY TYPE ${type}`,
          navItems: getCoreBodyFlatNavItems({
            coreBodyType: type as any,
            isSPH: !!user?.is_sph
          }) as NavItem[]
        };
      case "dealer":
        return {
          role: "dealer" as const,
          roleLabel: "SUBDIVISION DEALER",
          navItems: getCoreBodyFlatNavItems({
            coreBodyType: "Dealer",
            isSPH: !!user?.is_sph
          }) as NavItem[]
        };
      default:
        // Fallback for any logged in user to at least show the businessman layout if they are on this page
        if (user?.id) {
           return {
             role: "businessman" as const,
             roleLabel: user?.full_name || 'User',
             navItems: getBusinessmanSidebarNavItems({
               isStockPoint: user?.is_sph || false,
               bulkEnabled: true,
               entryModeEnabled: true,
               advanceModeEnabled: true,
               businessmanType: user?.businessman_type,
               permissions: user?.permissions || [],
               blockedMenus: {},
             }) as NavItem[]
           };
        }
        return null;
    }
  }, [roleCode, user]);

  if (isLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;
  if (error || !product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

  if (!layoutProps) {
    return (
      <div className="bg-white min-h-screen">
        {/* Breadcrumb row could go here */}
      </div>
    );
  }

  return (
    <DashboardLayout {...layoutProps}>
      <div className="bg-white">
        {/* Top Breadcrumb & Back */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Button>
          <div className="flex gap-4">
             {isLocal ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Local District Product</Badge>
             ) : (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">Admin / External Source</Badge>
             )}
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gallery (Sticky) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 space-y-4">
            <div className="flex gap-4">
              {/* Thumbnails */}
              <div className="hidden md:flex flex-col gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveImage(img)}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "h-16 w-16 border rounded-md overflow-hidden transition-all",
                      activeImage === img ? "border-blue-600 ring-2 ring-blue-100" : "hover:border-blue-400"
                    )}
                  >
                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-contain p-1" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 border rounded-xl overflow-hidden bg-white aspect-square flex items-center justify-center p-8 group relative shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={getImageUrl(activeImage || "")} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                />
                
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                   <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-sm"><Heart className="h-5 w-5" /></Button>
                   <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-sm"><Share2 className="h-5 w-5" /></Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center border rounded-lg bg-white overflow-hidden h-12">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-none hover:bg-slate-50 border-r"
                    onClick={() => setQuantity(prev => Math.max((parseInt(product.min_order_quantity) || 1), prev - 1))}
                    disabled={quantity <= (parseInt(product.min_order_quantity) || 1)}
                   >
                     <Minus className="h-4 w-4" />
                   </Button>
                   <div className="w-16 flex items-center justify-center font-bold text-lg">
                      {quantity}
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-none hover:bg-slate-50 border-l"
                    onClick={() => setQuantity(prev => prev + 1)}
                   >
                     <Plus className="h-4 w-4" />
                   </Button>
                </div>
                {product.min_order_quantity > 1 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Min Order: {product.min_order_quantity} Units</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="lg" className="w-full h-14 text-lg font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-50">
                  ADD TO CART
                </Button>
                <Button size="lg" onClick={() => setConfirmOpen(true)} className="w-full h-14 text-lg font-bold bg-[#fb641b] hover:bg-[#fb641b]/90 text-white shadow-lg">
                  BUY NOW
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium text-sm hover:underline cursor-pointer">
                {product.brand || "FTS General"}
              </span>
              <div className="flex items-center bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                4.2 <Star className="h-2.5 w-2.5 ml-0.5 fill-current" />
              </div>
            </div>
            <h1 className="text-2xl font-medium text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
          </div>

          <div className="space-y-1 py-1">
             <div className="flex items-baseline gap-3">
               <span className="text-3xl font-bold">{formatCurrency(displayPrice)}</span>
               <span className="text-slate-500 line-through text-base">{formatCurrency(displayMRP)}</span>
               <span className="text-emerald-600 font-bold text-lg">{discountPercent}% off</span>
             </div>
             <p className="text-xs font-bold text-emerald-600">Special Price</p>
          </div>

          <Separator />

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-800 Uppercase tracking-wider">Available Variations</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedVariantId(null)}
                  className={cn(
                    "px-4 py-2 border rounded-md text-sm transition-all",
                    selectedVariantId === null ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600" : "hover:border-slate-400"
                  )}
                >
                  Regular
                </button>
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={cn(
                      "px-4 py-2 border rounded-md text-sm transition-all",
                      selectedVariantId === v.id ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600" : "hover:border-slate-400"
                    )}
                  >
                    {v.variant_name} {Object.entries(v.attributes || {}).map(([k, v]) => `(${k}: ${v})`).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Highlights */}
          {product.highlights?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Key Highlights</h3>
              <ul className="space-y-2 list-disc pl-5">
                {product.highlights.map((h: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700 leading-relaxed">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Return Policy Info */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-4">
              <RefreshCcw className="h-6 w-6 text-slate-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-900">Return Policy</p>
                <p className="text-xs text-slate-600 mt-1">
                  {product.is_returnable 
                    ? `Eligible for return within ${product.return_policy_days || 7} days of delivery. Keep original packaging intact.` 
                    : "This item is non-returnable. Please check specifications carefully before purchasing."}
                </p>
              </div>
          </div>

          <Separator />

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Specifications</h3>
              <div className="border rounded-lg overflow-hidden">
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <div key={key} className={cn("grid grid-cols-12 text-sm border-b last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    <div className="col-span-4 p-4 font-medium text-slate-500 border-r">{key}</div>
                    <div className="col-span-8 p-4 text-slate-900">{(value as string)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
             <h3 className="text-xl font-bold text-slate-900">Product Description</h3>
             <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
               {product.description || "No description provided for this item."}
             </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm B2B Purchase</DialogTitle>
            <DialogDescription>
              Confirming purchase of {quantity} units. Enter your 6-digit transaction PIN.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
             <div className="flex items-center justify-center">
                <InputOTP maxLength={6} value={pin} onChange={setPin} disabled={isSubmitting}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>Cancel</Button>
             <Button onClick={handlePurchase} disabled={pin.length !== 6 || isSubmitting}>
               {isSubmitting ? "Processing..." : "Confirm & Pay"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
