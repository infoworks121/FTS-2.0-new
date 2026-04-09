import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Tag,
  Package,
} from "lucide-react";
import { Category } from "@/types/product";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { FolderPlus } from "lucide-react";

interface CategoryTreeProps {
  categories: Category[];
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onViewProducts?: (category: Category) => void;
  onCreateSubCategory?: (category: Category) => void;
  selectedId?: string;
}

export function CategoryTree({ 
  categories, 
  onSelect,
  onEdit,
  onDelete,
  onViewProducts,
  onCreateSubCategory,
  selectedId,
}: CategoryTreeProps) {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProducts={onViewProducts}
          onCreateSubCategory={onCreateSubCategory}
          selectedId={selectedId}
          level={0}
        />
      ))}
    </div>
  );
}

interface CategoryTreeNodeProps {
  category: Category;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onViewProducts?: (category: Category) => void;
  onCreateSubCategory?: (category: Category) => void;
  selectedId?: string;
  level: number;
}

function CategoryTreeNode({ 
  category, 
  onSelect, 
  onEdit, 
  onDelete, 
  onViewProducts,
  onCreateSubCategory,
  selectedId,
  level,
}: CategoryTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  return (
    <div>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div 
              className={cn(
                "flex items-center gap-1 py-2 px-2 rounded-md transition-colors group cursor-context-menu",
                isSelected 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted",
                level > 0 && "ml-4"
              )}
            >
              {/* Expand/Collapse Toggle */}
              {hasChildren ? (
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              ) : (
                <div className="w-6" />
              )}
              
              {/* Folder Icon */}
              {isOpen && hasChildren ? (
                <FolderOpen className="h-4 w-4 text-amber-500" />
              ) : (
                <Folder className="h-4 w-4 text-amber-500" />
              )}
              
              {/* Category Name */}
              <button
                onClick={() => onSelect?.(category)}
                className="flex-1 text-left text-sm font-medium hover:text-foreground transition-colors truncate"
              >
                {category.name}
              </button>
              
              {/* Product Count Badge */}
              <Badge variant="secondary" className="text-xs mr-1">
                {category.productCount}
              </Badge>
              
              {/* Status Indicator */}
              <div className={cn(
                "h-2 w-2 rounded-full",
                category.status === "active" ? "bg-green-500" : "bg-red-500"
              )} />
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProducts?.(category)}>
                    <Package className="h-4 w-4 mr-2" />
                    View Products
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(category)}
                    className="text-red-600 focus:text-red-600"
                    disabled={category.productCount > 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                    {category.productCount > 0 && (
                      <span className="ml-2 text-xs">(Has products)</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
             <ContextMenuItem onClick={() => onCreateSubCategory?.(category)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Sub Folder
             </ContextMenuItem>
             <ContextMenuSeparator />
             <ContextMenuItem onClick={() => onViewProducts?.(category)}>
                <Package className="h-4 w-4 mr-2" />
                View Products
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onEdit?.(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        
        {/* Children */}
        {hasChildren && (
          <CollapsibleContent>
            {category.children!.map((child) => (
              <CategoryTreeNode
                key={child.id}
                category={child}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewProducts={onViewProducts}
                onCreateSubCategory={onCreateSubCategory}
                selectedId={selectedId}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

// Simple flat list view for tables
interface CategoryListItemProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoryListItem({ 
  category, 
  onEdit, 
  onDelete 
}: CategoryListItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b hover:bg-muted/50 transition-colors">
      {/* Folder Icon */}
      <Folder className="h-5 w-5 text-amber-500 shrink-0" />
      
      {/* Category Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{category.name}</span>
          {category.parentName && (
            <span className="text-xs text-muted-foreground">
              → {category.parentName}
            </span>
          )}
        </div>
        {category.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {category.description}
          </p>
        )}
      </div>
      
      {/* Product Count */}
      <Badge variant="outline" className="shrink-0">
        {category.productCount} products
      </Badge>
      
      {/* Commission Rule */}
      {category.commissionRuleName ? (
        <Badge variant="secondary" className="shrink-0">
          <Tag className="h-3 w-3 mr-1" />
          {category.commissionRuleName}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground shrink-0">
          No rule
        </Badge>
      )}
      
      {/* Status */}
      <div className={cn(
        "h-2.5 w-2.5 rounded-full shrink-0",
        category.status === "active" ? "bg-green-500" : "bg-red-500"
      )} title={category.status === "active" ? "Active" : "Inactive"} />
      
      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(category)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete?.(category)}
            className="text-red-600 focus:text-red-600"
            disabled={category.productCount > 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
