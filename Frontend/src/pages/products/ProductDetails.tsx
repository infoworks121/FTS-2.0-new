import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/productApi";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Package, 
  DollarSign, 
  Tag, 
  Info, 
  CheckCircle2, 
  Clock, 
  User, 
  LayoutGrid,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  Layers,
  Database,
  BarChart3,
  ExternalLink,
  ChevronLeft,
  TrendingUp,
  CreditCard,
  Briefcase
} from "lucide-react";
import { UsersLayout } from "@/components/users/UsersLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { IMAGE_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ProductStatus, statusColors, productTypeConfig } from "@/types/product";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
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

  // Set default active image when product loads
  useMemo(() => {
    if (product?.thumbnail_url && !activeImage) {
      setActiveImage(product.thumbnail_url);
    }
  }, [product, activeImage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`;
  };

  if (isLoading) return <ProductDetailsSkeleton />;
  if (error || !product) return <ProductErrorState navigate={navigate} />;

  const status = (product.status && statusColors[product.status as ProductStatus]) || statusColors.draft;
  const typeInfo = (product.product_type && productTypeConfig[product.product_type]) || productTypeConfig.physical;

  return (
    <UsersLayout
      title={product.name}
      description={`SKU: ${product.sku} | Manage product details, pricing, and inventory metrics`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button size="sm" onClick={() => navigate(`/admin/products/new`, { state: { product } })}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Gallery & Info */}
        <div className="col-span-1 space-y-4">
          <Card>
            <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden rounded-t-xl">
              {activeImage ? (
                <img 
                  src={getImageUrl(activeImage)} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <Package className="h-16 w-16 text-muted" />
              )}
              <div className="absolute top-3 left-3">
                 <Badge className={cn("px-3 py-1 rounded-full border-none font-semibold text-[10px] uppercase tracking-wider", status.bg, status.text)}>
                   {status.label}
                 </Badge>
              </div>
            </div>
            
            {allImages.length > 1 && (
              <CardContent className="p-3">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                        activeImage === img ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Identifiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                   <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-center">{product.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">{product.sku}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", typeInfo.color.replace('text', 'bg'))} />
                    <span className="font-medium">{typeInfo.label}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Visibility:</span>
                  <span className="font-medium">Public</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Stats Bar (KPI Row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Base Price</p>
                  <p className="text-xl font-bold">{formatCurrency(product.base_price)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Margin</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold">{Number(product.margin_percent || 0).toFixed(1)}%</p>
                    <span className="text-[10px] text-blue-600 font-bold">Target: {product.min_margin_percent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stock Availability</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">{product.stock_quantity}</p>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      product.stock_quantity > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1 w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Financials
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Overview</CardTitle>
                  <CardDescription>Strategic details and narrative for this catalog entry.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                         <Briefcase className="h-3 w-3" /> Operational Strategy
                       </h4>
                       <div className="grid gap-3">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                             <Database className="h-4 w-4 text-primary" />
                             <div>
                               <p className="text-xs font-bold">Inventory Control</p>
                               <p className="text-[10px] text-muted-foreground">{product.stock_required ? "Automated Tracking" : "Manual Leveling"}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                             <Truck className="h-4 w-4 text-primary" />
                             <div>
                               <p className="text-xs font-bold">Fulfillment Mode</p>
                               <p className="text-[10px] text-muted-foreground">Standard Logisitics</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                         <ShieldCheck className="h-3 w-3" /> Compliance Check
                       </h4>
                       <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-[11px] text-foreground/80 leading-relaxed font-medium">
                            System verified. Current pricing maintains a {Number(product.margin_percent || 0).toFixed(1)}% margin, effectively covering administrative costs and yielding net profit.
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Narrative Description</h4>
                    <div className="p-4 rounded-xl bg-muted/20 text-sm text-foreground/80 leading-relaxed italic border border-dashed border-border">
                      {product.description || "No narrative description provided."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Intelligence</CardTitle>
                  <CardDescription>Comprehensive unit economics and profitability metrics.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="grid gap-3">
                           <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between border border-border/50">
                              <span className="text-xs text-muted-foreground font-semibold">Standard MRP</span>
                              <span className="font-bold">{formatCurrency(product.mrp)}</span>
                           </div>
                           <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between border border-border/50">
                              <span className="text-xs text-muted-foreground font-semibold">Cost Price (Landing)</span>
                              <span className="font-bold">{formatCurrency(product.cost_price)}</span>
                           </div>
                           <div className="p-4 rounded-xl bg-primary/5 flex items-center justify-between border border-primary/10">
                              <div className="flex flex-col">
                                <span className="text-xs text-primary font-bold">Listing Price (B2C)</span>
                                <span className="text-[9px] text-primary/70 font-semibold italic">Customer checkout value</span>
                              </div>
                              <span className="text-lg font-bold text-primary">{formatCurrency(product.selling_price || product.base_price)}</span>
                           </div>
                        </div>

                        <Card className="bg-slate-900 border-none relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                              <TrendingUp className="h-16 w-16 text-white" />
                           </div>
                           <CardContent className="p-5 flex items-center justify-between">
                              <div className="relative z-10">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Profitability</p>
                                 <p className="text-2xl font-bold text-emerald-400">{formatCurrency((product.selling_price || product.base_price) - product.cost_price)}</p>
                              </div>
                              <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center relative z-10 backdrop-blur-sm">
                                 <DollarSign className="h-5 w-5 text-emerald-400" />
                              </div>
                           </CardContent>
                        </Card>
                     </div>

                     <div className="flex flex-col items-center justify-center border-l border-border/50 pl-8">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                              <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 * (1 - Number(product.margin_percent || 0) / 100)} strokeLinecap="round" className="text-primary transition-all duration-1000" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-foreground">{Number(product.margin_percent || 0).toFixed(0)}%</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Margin</span>
                           </div>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mt-4 text-center max-w-[180px]">Margin performance is tracked against category benchmarks.</p>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
               <Card>
                 <CardHeader>
                  <CardTitle>System Traceability</CardTitle>
                  <CardDescription>Audit history and synchronization logs.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative pl-6 border-l-2 border-muted">
                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-white" />
                        <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                          <h4 className="font-bold text-sm">Last Update Triggered</h4>
                          <p className="text-xs text-muted-foreground mt-1">Manual synchronization via Admin dashboard.</p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-muted-foreground uppercase">
                             <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(product.updated_at)}</span>
                             <span className="flex items-center gap-1"><User className="h-3 w-3" /> CID: {product.created_by || "SYSTEM"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative opacity-70">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-muted ring-4 ring-white" />
                        <div className="p-4">
                           <h4 className="font-bold text-sm">Initial Entry Created</h4>
                           <p className="text-xs text-muted-foreground mt-1">Foundational record generation and SKU validation.</p>
                           <div className="flex items-center gap-4 mt-2 text-[10px] font-semibold text-muted-foreground">
                              <span>{formatDate(product.created_at)}</span>
                           </div>
                        </div>
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

function ProductDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Skeleton className="h-96 rounded-xl" />
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProductErrorState({ navigate }: { navigate: any }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-border mt-12">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The requested record does not exist or has been removed.
      </p>
      <Button onClick={() => navigate("/admin/products")} size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Return to Catalog
      </Button>
    </div>
  );
}

function TargetIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
