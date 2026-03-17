import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  AlertTriangle,
  Calendar,
  Eye,
  Edit,
} from "lucide-react";
import { ProductStatusBadge } from "@/components/products";
import { Product, ProductStatus as ProductStatusType } from "@/types/product";

// Mock products
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    categoryId: "cat-1",
    categoryName: "Electronics",
    type: "physical",
    basePrice: 2499,
    costPrice: 1500,
    marginPercent: 39.96,
    minMarginPercent: 15,
    stockRequired: true,
    stockQuantity: 150,
    isDigital: false,
    isService: false,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    createdBy: "Admin",
  },
  {
    id: "2",
    name: "E-Book: Complete React Guide",
    sku: "EBOOK-001",
    categoryId: "cat-2",
    categoryName: "Digital Products",
    type: "digital",
    basePrice: 499,
    costPrice: 50,
    marginPercent: 89.98,
    minMarginPercent: 30,
    stockRequired: false,
    isDigital: true,
    isService: false,
    status: "active",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-01T09:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "3",
    name: "Home Cleaning Service",
    sku: "HCS-001",
    categoryId: "cat-3",
    categoryName: "Services",
    type: "service",
    basePrice: 999,
    costPrice: 400,
    marginPercent: 59.96,
    minMarginPercent: 20,
    stockRequired: false,
    isDigital: false,
    isService: true,
    status: "inactive",
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-01-25T16:30:00Z",
    createdBy: "Admin",
  },
  {
    id: "4",
    name: "Online Course: Python Basics",
    sku: "COURSE-001",
    categoryId: "cat-2",
    categoryName: "Digital Products",
    type: "digital",
    basePrice: 1999,
    costPrice: 100,
    marginPercent: 94.99,
    minMarginPercent: 50,
    stockRequired: false,
    isDigital: true,
    isService: false,
    status: "draft",
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-05T10:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "5",
    name: "Plumbing Repair Service",
    sku: "PRS-001",
    categoryId: "cat-3",
    categoryName: "Services",
    type: "service",
    basePrice: 499,
    costPrice: 200,
    marginPercent: 59.92,
    minMarginPercent: 20,
    stockRequired: false,
    isDigital: false,
    isService: true,
    status: "archived",
    createdAt: "2024-01-05T14:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
    createdBy: "Admin",
  },
];

const statusConfig: Record<ProductStatusType, { icon: any; color: string; label: string; description: string }> = {
  active: { icon: CheckCircle, color: "text-green-500", label: "Active", description: "Product is visible and available for purchase" },
  inactive: { icon: XCircle, color: "text-red-500", label: "Inactive", description: "Product is hidden and not available for purchase" },
  draft: { icon: Clock, color: "text-yellow-500", label: "Draft", description: "Product is being prepared and not yet published" },
  archived: { icon: Archive, color: "text-gray-500", label: "Archived", description: "Product is archived and kept for historical records" },
};

export default function ProductStatus() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [statusFilter, setStatusFilter] = useState<ProductStatusType | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ProductStatusType>("active");
  const [statusReason, setStatusReason] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredProducts = statusFilter === "all" 
    ? mockProducts 
    : mockProducts.filter(p => p.status === statusFilter);

  const statusCounts = {
    all: mockProducts.length,
    active: mockProducts.filter(p => p.status === "active").length,
    inactive: mockProducts.filter(p => p.status === "inactive").length,
    draft: mockProducts.filter(p => p.status === "draft").length,
    archived: mockProducts.filter(p => p.status === "archived").length,
  };

  const handleStatusChange = (product: Product, newStatusValue: ProductStatusType) => {
    setSelectedProduct(product);
    setNewStatus(newStatusValue);
    setStatusReason("");
    setScheduledDate("");
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowStatusDialog(false);
      setSelectedProduct(null);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight">Product Status</h1>
          <p className="text-muted-foreground mt-1">
            Manage product lifecycle - Active, Inactive, Draft, and Archived
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "p-4 rounded-lg border-2 transition-all text-left",
            statusFilter === "all" 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
        >
          <p className="text-sm text-muted-foreground">All Products</p>
          <p className="text-2xl font-bold mt-1">{statusCounts.all}</p>
        </button>
        {(["active", "inactive", "draft", "archived"] as ProductStatusType[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                statusFilter === status 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts[status]}</p>
            </button>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            Card View
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} products
        </p>
      </div>

      {/* Products List */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell className="capitalize">{product.type}</TableCell>
                    <TableCell>₹{product.basePrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(product.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={product.status}
                        onValueChange={(value) => handleStatusChange(product, value as ProductStatus)}
                      >
                        <SelectTrigger className="w-[140px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Inactive
                            </div>
                          </SelectItem>
                          <SelectItem value="draft">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-500" />
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="archived">
                            <div className="flex items-center gap-2">
                              <Archive className="h-4 w-4 text-gray-500" />
                              Archived
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const config = statusConfig[product.status];
            const Icon = config.icon;
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                    </div>
                    <ProductStatusBadge status={product.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span>{product.categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">₹{product.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="capitalize">{product.type}</Badge>
                  </div>
                  
                  <Select
                    value={product.status}
                    onValueChange={(value) => handleStatusChange(product, value as ProductStatus)}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Product Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ProductStatusType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason (for deactivation) */}
            {newStatus === "inactive" && (
              <div className="space-y-2">
                <Label>Reason for Deactivation</Label>
                <Input
                  placeholder="Enter reason..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>
            )}

            {/* Scheduled Activation */}
            {newStatus === "active" && selectedProduct?.status === "draft" && (
              <div className="space-y-2">
                <Label>Schedule Activation (Optional)</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            )}

            {/* Warning for Inactive */}
            {newStatus === "inactive" && (
              <div className="flex items-start gap-2 p-3 rounded bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600">Warning</p>
                  <p className="text-amber-600/80">
                    This product will no longer be visible to customers. Active orders will continue to be fulfilled.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmStatusChange}
              disabled={isSaving || (newStatus === "inactive" && !statusReason)}
            >
              {isSaving ? "Saving..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
