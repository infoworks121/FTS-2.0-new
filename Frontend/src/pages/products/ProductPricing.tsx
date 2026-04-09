import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  History,
  Tag,
  Loader2,
} from "lucide-react";
import { productApi } from "@/lib/productApi";
import { Product } from "@/types/product";
import { toast } from "sonner";

export default function ProductPricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mrp: 0,
    basePrice: 0,
    sellingPrice: 0,
    minMarginPercent: 15,
  });

  // Queries
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['product-price-history', selectedProductId],
    queryFn: () => productApi.getPriceHistory(selectedProductId),
    enabled: !!selectedProductId,
  });

  const products = productsData?.products || [];
  const selectedProduct = products.find((p: Product) => p.id === selectedProductId);

  // Auto-populate form when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        mrp: selectedProduct.mrp || 0,
        basePrice: selectedProduct.base_price || 0,
        sellingPrice: selectedProduct.selling_price || 0,
        minMarginPercent: selectedProduct.min_margin_percent || 15,
      });
      setHasChanges(false);
    }
  }, [selectedProduct]);

  // Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => productApi.update(selectedProductId, data),
    onSuccess: () => {
      toast.success("Pricing updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
      queryClient.invalidateQueries({ queryKey: ['product-price-history', selectedProductId] });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update pricing");
    }
  });

  // Derived calculations
  const marginPercent = formData.sellingPrice > 0 && formData.basePrice > 0
    ? ((formData.sellingPrice - formData.basePrice) / formData.sellingPrice) * 100
    : 0;
  const marginWarning = marginPercent < formData.minMarginPercent;
  const profitAmount = formData.sellingPrice - formData.basePrice;

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedProductId) return;
    
    updateMutation.mutate({
      mrp: formData.mrp,
      basePrice: formData.basePrice,
      sellingPrice: formData.sellingPrice,
      minMarginPercent: formData.minMarginPercent,
    });
  };

  const handleReset = () => {
    if (selectedProduct) {
      setFormData({
        mrp: selectedProduct.mrp || 0,
        basePrice: selectedProduct.base_price || 0,
        sellingPrice: selectedProduct.selling_price || 0,
        minMarginPercent: selectedProduct.min_margin_percent || 15,
      });
    }
    setHasChanges(false);
  };

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

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/products")}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Product Pricing & Margin</h1>
          <p className="text-muted-foreground mt-1">
            Control product profitability with safe margin settings
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
        <AlertTriangle className="h-4 w-4 text-blue-500" />
        <p className="text-sm text-blue-600">
          Price changes affect new orders only. Existing orders are not affected.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Product</CardTitle>
              <CardDescription>
                Choose a product to manage its pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedProductId}
                onValueChange={handleProductSelect}
                disabled={isLoadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: Product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.sku}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {products.length === 0 && !isLoadingProducts && (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      No products found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProduct && (
            <>
              {/* Pricing Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>
                    Set base price, cost price, and margin thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* MRP */}
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => handleInputChange("mrp", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Base Price */}
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price / Cost (₹)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)}
                    />
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
                  </div>
                </CardContent>
              </Card>

              {/* Price History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Price History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Previous Price</TableHead>
                        <TableHead>New Price</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingHistory ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                            <span className="text-sm text-muted-foreground mt-2 block">Loading history...</span>
                          </TableCell>
                        </TableRow>
                      ) : historyData?.history?.length > 0 ? (
                        historyData.history.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="capitalize">
                                {log.field_changed?.replace('_', ' ') || "Price"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(log.old_price)}
                            </TableCell>
                            <TableCell className="text-blue-600 font-semibold">
                              {formatCurrency(log.new_price)}
                            </TableCell>
                            <TableCell>{log.changed_by_name || "System"}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={log.reason}>
                              {log.reason || "Price update"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(log.changed_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No price history available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Product Info */}
          {selectedProduct && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProduct.category_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Profit Channel:</span>
                  <Badge variant="secondary">{selectedProduct.profit_channel || "B2C"}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Margin Preview */}
          {selectedProduct && (
            <Card className={cn(
              marginWarning 
                ? "border-amber-500/30 bg-amber-500/5" 
                : "border-green-500/30 bg-green-500/5"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Margin Impact Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profit */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profit Amount</span>
                  <span className={cn(
                    "font-semibold",
                    profitAmount > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(profitAmount)}
                  </span>
                </div>

                {/* Margin */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Margin %</span>
                  <span className={cn(
                    "font-semibold text-lg",
                    marginWarning ? "text-amber-600" : "text-green-600"
                  )}>
                    {marginPercent.toFixed(1)}%
                  </span>
                </div>

                {/* Warning */}
                {marginWarning && (
                  <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600">
                      Margin is below minimum threshold of {formData.minMarginPercent}%
                    </p>
                  </div>
                )}

                {/* Minimum threshold indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Minimum</span>
                    <span>{formData.minMarginPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        marginWarning ? "bg-amber-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(marginPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Applies to</span>
              </div>
              <Badge variant="outline">New Orders Only</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Price changes will only affect new orders. Existing orders remain unchanged.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                You have unsaved changes
              </span>
            ) : (
              "No unsaved changes"
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || updateMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending || !selectedProductId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
