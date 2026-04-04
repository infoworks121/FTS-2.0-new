import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Product } from "@/types/product";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductTypeBadgeDark } from "./ProductTypeBadge";
import { IMAGE_BASE_URL } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
}

export function ProductCard({ 
  product,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <button 
            className="flex items-center gap-3 flex-1 min-w-0 group"
            onClick={() => onView?.(product)}
            title="Click to view details"
          >
            {/* Thumbnail */}
            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center border overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`} 
                  alt="" 
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            {/* Title & SKU */}
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            </div>
          </button>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(product)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(product)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(product)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Type Badge */}
        <div className="mt-3">
          <ProductTypeBadgeDark type={product.product_type} size="sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Category */}
        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Category:</span>
          <span className="font-medium">{product.category_name}</span>
        </div>
        
        {/* Price & Margin */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="font-semibold">{formatCurrency(Number(product.base_price))}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={cn(
              "h-4 w-4",
              Number(product.margin_percent) >= Number(product.min_margin_percent)
                ? "text-green-500"
                : "text-red-500"
            )} />
            <span className={cn(
              "text-sm font-medium",
              Number(product.margin_percent) >= Number(product.min_margin_percent)
                ? "text-green-600"
                : "text-red-600"
            )}>
              {Number(product.margin_percent).toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Stock Info (if applicable) */}
        {product.stock_required && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Stock:</span>
            <span className="font-medium">{product.stock_quantity ?? "N/A"}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 pb-4 border-t flex items-center justify-between">
        <div>
          <ProductStatusBadge status={product.status} size="sm" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(product.created_at)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

// Grid wrapper
interface ProductCardGridProps {
  products: Product[];
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCardGrid({ 
  products,
  onView,
  onEdit,
  onDelete,
}: ProductCardGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mb-4 opacity-50" />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
