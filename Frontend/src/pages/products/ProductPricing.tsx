import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
} from "lucide-react";
import { ProductsLayout } from "@/components/products";
import { Product } from "@/types/product";

// Mock products for selection
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category_id: "cat-1",
    category_name: "Electronics",
    product_type: "physical",
    mrp: 2999,
    base_price: 1500,
    selling_price: 2499,
    bulk_price: 2000,
    admin_margin_pct: 5,
    profit_channel: "B2C",
    margin_percent: 39.96,
    min_margin_percent: 15,
    stock_required: true,
    stock_quantity: 150,
    is_digital: false,
    is_service: false,
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    created_by: 1,
    description: null,
    thumbnail_url: null,
    image_urls: null,
  },
  {
    id: "2",
    name: "Premium Watch",
    sku: "PW-001",
    category_id: "cat-1",
    category_name: "Electronics",
    product_type: "physical",
    mrp: 19999,
    base_price: 12000,
    selling_price: 15999,
    bulk_price: 14000,
    admin_margin_pct: 5,
    profit_channel: "B2C",
    margin_percent: 24.99,
    min_margin_percent: 15,
    stock_required: true,
    stock_quantity: 25,
    is_digital: false,
    is_service: false,
    status: "active",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-18T12:00:00Z",
    created_by: 1,
    description: null,
    thumbnail_url: null,
    image_urls: null,
  },
];

// Mock price history
const mockPriceHistory = [
  {
    id: "1",
    mrp: 2999,
    basePrice: 1500,
    sellingPrice: 2499,
    marginPercent: 39.96,
    changedBy: "Admin",
    changedAt: "2024-01-20T14:45:00Z",
    reason: "Regular price update",
  },
  {
    id: "2",
    mrp: 2999,
    basePrice: 1500,
    sellingPrice: 2299,
    marginPercent: 34.75,
    changedBy: "Admin",
    changedAt: "2024-01-18T10:30:00Z",
    reason: "Promotional pricing",
  },
  {
    id: "3",
    mrp: 2999,
    basePrice: 1400,
    sellingPrice: 2499,
    marginPercent: 43.98,
    changedBy: "Admin",
    changedAt: "2024-01-15T09:00:00Z",
    reason: "Initial pricing",
  },
];

export default function ProductPricing() {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mrp: 0,
    basePrice: 0,
    sellingPrice: 0,
    minMarginPercent: 15,
  });

  const selectedProduct = mockProducts.find(p => p.id === selectedProductId);

  // Derived calculations
  const marginPercent = formData.sellingPrice > 0 && formData.basePrice > 0
    ? ((formData.sellingPrice - formData.basePrice) / formData.sellingPrice) * 100
    : 0;
  const marginWarning = marginPercent < formData.minMarginPercent;
  const profitAmount = formData.sellingPrice - formData.basePrice;

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setFormData({
        mrp: product.mrp || 0,
        basePrice: product.base_price,
        sellingPrice: product.selling_price || 0,
        minMarginPercent: product.min_margin_percent,
      });
    }
    setHasChanges(false);
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    if (selectedProduct) {
      setFormData({
        mrp: selectedProduct.mrp || 0,
        basePrice: selectedProduct.base_price,
        sellingPrice: selectedProduct.selling_price || 0,
        minMarginPercent: selectedProduct.min_margin_percent,
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.sku}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
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
                        <TableHead>Base Price</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPriceHistory.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell className="font-medium">
                            {formatCurrency(history.basePrice)}
                          </TableCell>
                          <TableCell>{formatCurrency(history.sellingPrice)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {history.marginPercent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{history.changedBy}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(history.changedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
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
                  <span className="text-sm text-muted-foreground">Commission Rule:</span>
                  <Badge variant="secondary">{(selectedProduct as any).commissionRuleName || "Standard"}</Badge>
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
              disabled={!hasChanges || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !selectedProductId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
