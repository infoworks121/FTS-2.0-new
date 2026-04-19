import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Search, Eye, Loader2, AlertCircle, ShoppingBag, User, Info, Tag, Package, BarChart3, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProductApproval {
  id: string;
  name: string;
  sku: string;
  thumbnail_url: string;
  image_urls: string[] | string;
  description: string;
  category_name: string;
  created_by_name: string;
  created_at: string;
  approval_status: string;
  mrp: string;
  base_price: string;
  selling_price: string;
  bulk_price: string;
}

export default function ProductApprovals() {
  const [products, setProducts] = useState<ProductApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductApproval | null>(null);
  const [isResolverOpen, setIsResolverOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [resolveType, setResolveType] = useState<"approved" | "rejected">("approved");
  const [resolveNote, setResolveNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/catalog/approvals/pending");
      setProducts(res.data.products);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch pending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleOpenResolver = (product: ProductApproval, type: "approved" | "rejected") => {
    setSelectedProduct(product);
    setResolveType(type);
    setResolveNote("");
    setIsResolverOpen(true);
  };

  const handleOpenDetails = (product: ProductApproval) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedProduct) return;
    if (resolveType === "rejected" && !resolveNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/catalog/approvals/${selectedProduct.id}/resolve`, {
        status: resolveType,
        note: resolveNote
      });
      toast.success(`Product ${resolveType} successfully`);
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setIsResolverOpen(false);
      setIsDetailsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to ${resolveType} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Product Audit & Approvals</h1>
          <p className="text-sm text-muted-foreground">Verify core product details before enabling them for marketplace listing.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border p-4 rounded-xl shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          placeholder="Search by product, SKU or creator..." 
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center border border-dashed rounded-xl bg-card/50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Syncing pending approvals...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/60 rounded-xl bg-card/30 space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground/50">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending product approvals at the moment.</p>
          </div>
        </div>
      ) : (
        <DataTable 
          columns={[
            {
              header: "Product Detail",
              accessor: (row: ProductApproval) => (
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleOpenDetails(row)}>
                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted/30 transition-shadow group-hover:shadow-md">
                    {row.thumbnail_url ? (
                      <img src={row.thumbnail_url} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-full w-full p-3 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{row.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{row.sku}</span>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-bold border-muted-foreground/20">{row.category_name}</Badge>
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: "Created By",
              accessor: (row: ProductApproval) => (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary/70" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{row.created_by_name || "Unknown"}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: "Pricing Matrix",
              accessor: (row: ProductApproval) => (
                <div className="bg-muted/10 p-2 rounded-lg border border-border/40 grid grid-cols-2 gap-x-3 gap-y-1.5 w-fit">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">MRP</span>
                    <span className="text-xs font-bold text-foreground/80">₹{row.mrp}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-blue-500/70 font-bold uppercase tracking-tighter">Base</span>
                    <span className="text-xs font-black text-blue-600">₹{row.base_price}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-green-500/70 font-bold uppercase tracking-tighter">Selling</span>
                    <span className="text-xs font-black text-green-600">₹{row.selling_price}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-purple-500/70 font-bold uppercase tracking-tighter">Bulk</span>
                    <span className="text-xs font-black text-purple-600">₹{row.bulk_price}</span>
                  </div>
                </div>
              )
            },
            {
              header: "Audit",
              accessor: (row: ProductApproval) => (
                <div className="flex items-center gap-2">
                   <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-9 w-9 text-primary hover:bg-primary/5"
                    onClick={() => handleOpenDetails(row)}
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </Button>
                   <Button 
                    size="sm" 
                    className="h-8.5 px-3 gap-1.5 bg-green-600 hover:bg-green-700 shadow-sm border-none transition-all active:scale-95"
                    onClick={() => handleOpenResolver(row, "approved")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                   </Button>
                   <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8.5 px-3 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95"
                    onClick={() => handleOpenResolver(row, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )
            }
          ]}
          data={filteredProducts}
        />
      )}

      {/* Product Details Sheet (Audit Drawer) */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-md border-l border-border bg-card/95 backdrop-blur-xl p-0">
          {selectedProduct && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-bold border-blue-200 bg-blue-50 text-blue-600 uppercase">
                    Verification Needed
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{selectedProduct.sku}</span>
                </div>
                <SheetTitle className="text-xl font-black leading-tight text-foreground">{selectedProduct.name}</SheetTitle>
                <SheetDescription className="text-xs font-medium text-muted-foreground">
                  Audit product details provided by <span className="text-foreground font-bold">{selectedProduct.created_by_name}</span>
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6">
                <div className="py-6 space-y-8">
                  {/* Hero Image Block */}
                  <div className="space-y-3">
                     <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/10 group">
                      {selectedProduct.thumbnail_url ? (
                        <img src={selectedProduct.thumbnail_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Audit Matrix */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Base Cost</span>
                      </div>
                      <div className="text-lg font-black text-blue-600">{formatCurrency(selectedProduct.base_price)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Selling</span>
                      </div>
                      <div className="text-lg font-black text-green-600">{formatCurrency(selectedProduct.selling_price)}</div>
                    </div>
                     <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">MRP</span>
                      </div>
                      <div className="text-lg font-black text-foreground/70">{formatCurrency(selectedProduct.mrp)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/40">
                      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Bulk Price</span>
                      </div>
                      <div className="text-lg font-black text-purple-600">{formatCurrency(selectedProduct.bulk_price)}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Catalog Context */}
                    <div className="bg-muted/5 rounded-2xl p-5 border border-border/40 space-y-4">
                       <h4 className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <Package className="h-3.5 w-3.5 text-primary/60" /> Catalog Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                          <span className="text-xs font-bold text-muted-foreground">Category</span>
                          <span className="text-xs font-black">{selectedProduct.category_name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                          <span className="text-xs font-bold text-muted-foreground">Submitted At</span>
                          <span className="text-xs font-black">{new Date(selectedProduct.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Audit */}
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <Info className="h-3.5 w-3.5 text-primary/60" /> Description Audit
                      </h4>
                      <div className="bg-muted/10 rounded-2xl p-5 border border-dashed border-primary/20">
                        <p className="text-xs font-medium text-foreground/80 leading-relaxed italic">
                          {selectedProduct.description || "No description provided for this submission."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border bg-muted/5 grid grid-cols-2 gap-3">
                <Button 
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white font-bold h-11 shadow-md active:scale-95 transition-all"
                  onClick={() => handleOpenResolver(selectedProduct, "approved")}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Listing
                </Button>
                <Button 
                  variant="outline"
                  className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold h-11 active:scale-95 transition-all"
                  onClick={() => handleOpenResolver(selectedProduct, "rejected")}
                >
                  <XCircle className="h-4 w-4" /> Reject Listing
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Resolution Dialog (Already existing, slightly refined style) */}
      <Dialog open={isResolverOpen} onOpenChange={setIsResolverOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className={cn(
              "flex items-center gap-2.5 text-xl font-black",
              resolveType === "approved" ? "text-green-600" : "text-red-600"
            )}>
              {resolveType === "approved" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              {resolveType === "approved" ? "Confirm Approval" : "Confirm Rejection"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium pt-1">
              {resolveType === "approved" 
                ? "This product will be instantly activated across the platform catalog."
                : "A reason is required to notify the user about the rejection."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder={resolveType === "approved" ? "Note for the user (optional)..." : "Specify the reason for rejection..."}
              className="resize-none rounded-xl bg-muted/10 border-border focus:ring-primary/20"
              rows={4}
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsResolverOpen(false)} disabled={isSubmitting} className="font-bold flex-1">
              Cancel
            </Button>
            <Button 
              className={cn(
                "font-bold flex-1 shadow-md",
                resolveType === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              )}
              onClick={handleResolve}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
