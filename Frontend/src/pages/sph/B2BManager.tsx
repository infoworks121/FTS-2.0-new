import { useState, useEffect } from "react";
import { ShoppingBag, Search, Plus, ListChecks, Loader2, Eye, Info, Package, BarChart3, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import api from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface B2BListing {
  id: string;
  name: string;
  sku: string;
  thumbnail_url: string;
  category_name: string;
  retail_price: string;
  bulk_price: string;
  stock_quantity: string;
  is_active: boolean;
  [key: string]: any; 
}

export default function B2BManager() {
  const [listings, setListings] = useState<B2BListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<B2BListing | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sph/listings/my?type=B2B");
      setListings(res.data.listings);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch B2B listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/sph/listings/${id}`, { is_active: !currentStatus });
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
      toast.success("Listing updated");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const filteredListings = listings.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (listing: B2BListing) => {
    setSelectedListing(listing);
    setIsDetailsOpen(true);
  };

  const formatCurrency = (amount: any) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const basePath = location.pathname.startsWith("/corebody") 
    ? "/corebody" 
    : "/businessman";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">B2B Product Management</h1>
          <p className="text-sm text-muted-foreground">Manage products available for bulk ordering by dealers in your district.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`${basePath}/b2b-manager/browse`)}>
            <Search className="h-4 w-4" /> Browse Catalog
          </Button>
          <Button className="gap-2" onClick={() => navigate(`${basePath}/b2c-manager/add-custom`)}>
            <Plus className="h-4 w-4" /> Add Custom Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          title="B2B Products" 
          value={String(listings.length)} 
          subtitle="Currently Listed"
          icon={ShoppingBag}
        />
        <KPICard 
          title="Active Listings" 
          value={String(listings.filter(l => l.is_active).length)} 
          variant="profit"
          icon={ListChecks}
        />
        <KPICard 
          title="Inactive Listings" 
          value={String(listings.filter(l => !l.is_active).length)} 
          variant="warning"
          icon={ListChecks}
        />
      </div>

      <div className="flex items-center gap-3 bg-card border border-border p-4 rounded-lg">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search B2B listings by name or SKU..." 
          className="border-none bg-transparent focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center border border-border rounded-lg bg-card/50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          title="Your B2B Catalog"
          columns={[
            {
              header: "Product",
              accessor: (row: any) => (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded border border-border bg-muted">
                    {row.thumbnail_url ? (
                      <img src={row.thumbnail_url} alt={row.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">IMG</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground truncate max-w-[200px]">{row.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{row.sku}</div>
                  </div>
                </div>
              )
            },
            { header: "Category", accessor: "category_name" },
            { 
              header: "B2B Bulk Price", 
              accessor: (row: any) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-blue-500">₹{row.retail_price}</span>
                  <span className="text-[10px] text-muted-foreground italic">Base: ₹{row.bulk_price}</span>
                </div>
              )
            },
            {
              header: "Status",
              accessor: (row: any) => (
                <Badge variant={row.is_active ? "default" : "secondary"}>
                  {row.is_active ? "ACTIVE" : "PAUSED"}
                </Badge>
              )
            },
            {
              header: "Actions",
              accessor: (row: any) => (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => handleViewDetails(row)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleToggleStatus(row.id, row.is_active)}
                  >
                    {row.is_active ? "Pause" : "Resume"}
                  </Button>
                </div>
              )
            }
          ]}
          data={filteredListings}
        />
      )}

      {/* Listing Details Drawer */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-md border-l border-border bg-card/95 backdrop-blur-xl p-0">
          {selectedListing && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={selectedListing.is_active ? "default" : "secondary"} className="h-5 text-[10px] px-1.5">
                    {selectedListing.is_active ? "ACTIVE" : "PAUSED"}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">{selectedListing.sku}</span>
                </div>
                <SheetTitle className="text-xl font-bold leading-tight">{selectedListing.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  Detailed specifications and pricing for this B2B catalog item.
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6">
                <div className="py-6 space-y-8">
                  {/* Hero Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/30 group">
                    {selectedListing.thumbnail_url ? (
                      <img src={selectedListing.thumbnail_url} alt={selectedListing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Bulk Price</span>
                      </div>
                      <div className="text-lg font-bold text-blue-500">{formatCurrency(selectedListing.retail_price)}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Available Stock</span>
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        parseFloat(selectedListing.stock_quantity) < 10 ? "text-orange-500" : "text-foreground"
                      )}>
                        {selectedListing.stock_quantity} <span className="text-xs font-normal text-muted-foreground">Units</span>
                      </div>
                    </div>
                  </div>

                  {/* Informational Sections */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        <Package className="h-3.5 w-3.5" /> Catalog Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-medium">{selectedListing.category_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Base Supply Price</span>
                          <span className="font-medium">{formatCurrency(selectedListing.bulk_price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
                          <span className="text-muted-foreground">Listing Type</span>
                          <Badge variant="outline" className="text-[10px]">B2B BULK</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        <Info className="h-3.5 w-3.5" /> Product Description
                      </h4>
                      <div className="bg-muted/10 rounded-xl p-4 border border-dashed border-border">
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          {selectedListing.description || "No narrative description provided for this catalog entry."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border bg-muted/5">
                <Button 
                  className="w-full gap-2" 
                  variant={selectedListing.is_active ? "outline" : "default"}
                  onClick={() => handleToggleStatus(selectedListing.id, selectedListing.is_active)}
                >
                  <ListChecks className="h-4 w-4" />
                  {selectedListing.is_active ? "Pause This Listing" : "Resume This Listing"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
