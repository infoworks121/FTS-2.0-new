import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Upload,
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ProductTable,
  BulkActionsBar,
  ProductFilters,
  ProductCardGrid,
  ProductFilterState,
  BulkImportModal,
} from "@/components/products";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { productApi } from "@/lib/productApi";

const PAGE_SIZE = 20;

export default function AllProducts() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<ProductFilterState>({
    search: "",
    categoryId: "all",
    type: "all",
    status: "all",
    minPrice: "",
    maxPrice: "",
    minMargin: "",
  });
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Load categories once
  useEffect(() => {
    productApi.getCategories().then((data) => {
      setCategories(
        (data.categories || []).map((c: { id: number; name: string }) => ({
          id: String(c.id),
          name: c.name,
        }))
      );
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (currentFilters: ProductFilterState, currentPage: number) => {
    setIsLoading(true);
    try {
      const data = await productApi.getAll({
        search: currentFilters.search,
        category_id: currentFilters.categoryId !== "all" ? currentFilters.categoryId : undefined,
        type: currentFilters.type !== "all" ? currentFilters.type : undefined,
        status: currentFilters.status !== "all" ? currentFilters.status : undefined,
        min_price: currentFilters.minPrice || undefined,
        max_price: currentFilters.maxPrice || undefined,
        min_margin: currentFilters.minMargin || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters, page);
  }, [filters, page, fetchProducts]);

  // Stats derived from current page data
  const activeProducts = products.filter((p) => p.status === "active").length;
  const avgMargin = products.length
    ? products.reduce((acc, p) => acc + Number(p.margin_percent), 0) / products.length
    : 0;
  const lowMarginProducts = products.filter(
    (p) => Number(p.margin_percent) < Number(p.min_margin_percent)
  ).length;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleBulkActivate = async () => {
    await Promise.all(selectedIds.map((id) => productApi.update(id, { status: "active" })));
    setSelectedIds([]);
    fetchProducts(filters, page);
  };

  const handleBulkDeactivate = async () => {
    await Promise.all(selectedIds.map((id) => productApi.update(id, { status: "inactive" })));
    setSelectedIds([]);
    fetchProducts(filters, page);
  };

  const handleStatusToggle = (product: Product) => {
    setProductToToggle(product);
  };

  const confirmStatusToggle = async () => {
    if (!productToToggle) return;
    
    const product = productToToggle;
    setProductToToggle(null);
    setIsToggling(true);

    // Optimistic update
    const newStatus = product.status === "active" ? "draft" : "active";
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, status: newStatus } : p
    ));

    try {
      await productApi.toggleStatus(product.id);
    } catch (error) {
      // Revert on error
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, status: product.status } : p
      ));
      console.error("Failed to toggle status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsBulkImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/admin/products/new")}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {products.length > 0 ? ((activeProducts / products.length) * 100).toFixed(0) : 0}% of this page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Margin
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Margin Products
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowMarginProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Below minimum threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "table" | "card")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="card">Cards</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {total} products
        </p>
      </div>

      {/* Filters */}
      <ProductFilters onFilterChange={handleFilterChange} categories={categories} />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
      />

      {/* Product List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Loading products...
        </div>
      ) : viewMode === "table" ? (
        <ProductTable
          products={products}
          onSelectionChange={setSelectedIds}
          onStatusToggle={handleStatusToggle}
          isLoading={isLoading}
        />
      ) : (
        <ProductCardGrid 
          products={products} 
          onView={(p) => navigate(`/admin/products/${p.id}`)}
          onEdit={(p) => navigate(`/admin/products/new`, { state: { product: p } })}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => { e.preventDefault(); setPage(p); }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!productToToggle} onOpenChange={(open) => !open && setProductToToggle(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {productToToggle?.status === 'active' ? 'deactivate' : 'activate'} <strong>{productToToggle?.name}</strong>?
              {productToToggle?.status === 'active' && (
                <p className="mt-2 text-amber-600 text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  This will hide the product from the marketplace.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProductToToggle(null)}>
              Cancel
            </Button>
            <Button 
              variant={productToToggle?.status === 'active' ? 'destructive' : 'default'}
              onClick={confirmStatusToggle}
              disabled={isToggling}
            >
              {isToggling ? "Updating..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <BulkImportModal 
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          fetchProducts(filters, page);
        }}
      />
    </div>
  );
}
