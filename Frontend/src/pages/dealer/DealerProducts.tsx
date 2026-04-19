import { useState, useEffect } from "react";

import { Package, Search, Filter, AlertTriangle, Info } from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DealerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await dealerApi.getMyProducts();
        setProducts(res.products || []);
      } catch (err) {
        console.error("Failed to load dealer products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "Product Detail",
      accessorKey: "name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {row.original.thumbnail_url ? (
              <img src={row.original.thumbnail_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-slate-300" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{row.original.name}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{row.original.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      accessorKey: "category_name",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-bold text-[10px]">
          {row.original.category_name || "Uncategorized"}
        </Badge>
      )
    },
    {
      header: "Mapping Type",
      accessorKey: "mapping_type",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Badge 
            className={
              row.original.mapping_type === "Product Specialized" 
                ? "bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px]" 
                : "bg-blue-50 text-blue-700 border-blue-100 font-bold text-[10px]"
            }
          >
            {row.original.mapping_type}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-0 text-[10px] font-bold py-2">
                {row.original.mapping_type === "Product Specialized" 
                  ? "Individually assigned to you." 
                  : "Inherited from your category specialization."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      header: "Current Stock",
      accessorKey: "stock_quantity",
      cell: ({ row }: any) => {
        const stock = parseInt(row.original.stock_quantity);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black text-sm ${stock <= 5 ? 'text-red-500' : 'text-slate-900'}`}>
              {stock} units
            </span>
            {stock <= 5 && (
              <Badge variant="destructive" className="h-5 px-1 bg-red-100 text-red-600 border-red-200 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
              </Badge>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Package className="h-3 w-3" />
              <span>Inventory Management</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Authorized Products</h1>
            <p className="text-slate-500 font-medium">Manage and monitor stock levels for specialized products in your subdivision.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name or SKU..." 
                className="pl-9 h-11 border-slate-200 rounded-xl font-medium shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Product List Card */}
        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-slate-900">Mapped Product Portfolio</CardTitle>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{products.length} Products Authorized</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
              columns={columns} 
              data={filteredProducts} 
              loading={loading}
              noDataMessage="No authorized products found in your subdivision."
            />
          </CardContent>
        </Card>

        {/* Info Legend */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory Guide:</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 h-2 w-2 p-0 rounded-full" />
              <span className="text-[10px] font-bold text-slate-600">Product Mapping</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 h-2 w-2 p-0 rounded-full" />
              <span className="text-[10px] font-bold text-slate-600">Category Inheritance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 h-2 w-2 p-0 rounded-full" />
              <span className="text-[10px] font-bold text-slate-600">Low Stock Alert ( &#60;5 )</span>
            </div>
          </div>
        </div>
    </div>
  );
}
