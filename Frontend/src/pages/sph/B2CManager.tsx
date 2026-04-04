import { useState, useEffect } from "react";
import { ShoppingCart, Search, Plus, Filter, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface B2CListing {
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

export default function B2CManager() {
  const [listings, setListings] = useState<B2CListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const res = await api.get("/sph/listings/my");
      setListings(res.data.listings);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch listings");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My B2C Marketplace</h1>
          <p className="text-sm text-muted-foreground">Manage your products listed for direct customer sales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/businessman/b2c-manager/browse")}>
            <Search className="h-4 w-4" /> Browse Catalog
          </Button>
          <Button className="gap-2" onClick={() => navigate("/businessman/b2c-manager/add-custom")}>
            <Plus className="h-4 w-4" /> Add Custom Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border p-4 rounded-lg">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search your listings by name or SKU..." 
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
          title="Your Live Listings"
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
              header: "Pricing", 
              accessor: (row: any) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-emerald-500">₹{row.retail_price}</span>
                  <span className="text-[10px] text-muted-foreground italic">Cost: ₹{row.bulk_price}</span>
                </div>
              )
            },
            { 
              header: "Stock", 
              accessor: (row: any) => (
                <Badge variant={parseFloat(row.stock_quantity) < 10 ? "destructive" : "outline"} className="text-[10px]">
                  {row.stock_quantity} units
                </Badge>
              )
            },
            {
              header: "Status",
              accessor: (row: any) => (
                <Badge variant={row.is_active ? "default" : "secondary"}>
                  {row.is_active ? "LIVE" : "PAUSED"}
                </Badge>
              )
            },
            {
              header: "Actions",
              accessor: (row: any) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row.id, row.is_active)}>
                    {row.is_active ? "Pause" : "Resume"}
                  </Button>
                </div>
              )
            }
          ]}
          data={filteredListings}
        />
      )}
    </div>
  );
}
