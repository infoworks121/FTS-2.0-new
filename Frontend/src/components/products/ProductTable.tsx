import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  MoreVertical 
} from "lucide-react";
import { Product, ProductStatus } from "@/types/product";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductTypeCell } from "./ProductTypeBadge";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "@/lib/api";

interface ProductTableProps {
  products: Product[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
  onStatusToggle?: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductTable({ 
  products, 
  onSelectionChange,
  onBulkAction,
  onStatusToggle,
  isLoading 
}: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(products.map(p => p.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-[300px]">Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Base Price</TableHead>
            <TableHead className="text-right">Margin %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow 
                key={product.id}
                className={cn(
                  "hover:bg-muted/50 transition-colors",
                  selectedIds.has(product.id) && "bg-blue-50/50 dark:bg-blue-950/20"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={(checked) => handleSelectOne(product.id, checked as boolean)}
                    aria-label="Select row"
                  />
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                      {product.thumbnail_url ? (
                        <img 
                          src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`} 
                          alt="" 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          {product.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{product.category_name}</span>
                </TableCell>
                <TableCell>
                  <ProductTypeCell type={product.product_type} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(product.base_price))}
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-medium",
                    Number(product.margin_percent) >= Number(product.min_margin_percent)
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                    {Number(product.margin_percent).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <button 
                    onClick={() => onStatusToggle?.(product)}
                    className="hover:opacity-80 transition-opacity active:scale-95 duration-100"
                    title="Click to toggle status"
                  >
                    <ProductStatusBadge status={product.status as ProductStatus} size="sm" />
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(product.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate(`/admin/products/new`, { state: { product } })}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Bulk Actions Bar
interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onActivate,
  onDeactivate,
  onDelete,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 border rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear selection
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {onActivate && (
          <Button variant="outline" size="sm" onClick={onActivate}>
            Activate
          </Button>
        )}
        {onDeactivate && (
          <Button variant="outline" size="sm" onClick={onDeactivate}>
            Deactivate
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
