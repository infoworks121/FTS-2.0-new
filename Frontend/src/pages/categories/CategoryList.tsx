import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Folder,
  FolderOpen,
  Tag,
  Package,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { CategoryTree, CategoryListItem } from "@/components/categories";
import { Category } from "@/types/product";
import { productApi } from "@/lib/productApi";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderPlus, Loader2 } from "lucide-react";

export default function CategoryList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sub-category creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await productApi.getCategories();
      const rawCats = data.categories || [];
      
      // Build tree
      const map = new Map();
      rawCats.forEach((c: any) => {
        map.set(c.id.toString(), {
          id: c.id.toString(),
          name: c.name,
          parentId: c.parent_id ? c.parent_id.toString() : undefined,
          description: c.description || "",
          productCount: 0, 
          commissionRuleId: c.commission_rule_id,
          commissionRuleName: c.commission_rule_name,
          status: c.is_active ? "active" : "inactive",
          sortOrder: c.sort_order,
          createdAt: c.created_at,
          updatedAt: c.updated_at || c.created_at,
          children: []
        });
      });

      const tree: Category[] = [];
      rawCats.forEach((c: any) => {
        const cat = map.get(c.id.toString());
        if (cat.parentId) {
          const parent = map.get(cat.parentId);
          if (parent) {
            cat.parentName = parent.name;
            parent.children.push(cat);
          } else {
            tree.push(cat);
          }
        } else {
          tree.push(cat);
        }
      });
      
      // Sort tree by sortOrder
      const sortTree = (nodes: Category[]) => {
        nodes.sort((a, b) => a.sortOrder - b.sortOrder);
        nodes.forEach(n => {
          if (n.children && n.children.length > 0) sortTree(n.children);
        });
      };
      sortTree(tree);

      setCategories(tree);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Calculate stats
  // Flatten categories
  const flattenCategories = (cats: Category[]): Category[] => {
    return cats.reduce((acc: Category[], cat) => {
      acc.push(cat);
      if (cat.children && cat.children.length > 0) {
        acc.push(...flattenCategories(cat.children));
      }
      return acc;
    }, []);
  };

  const allCategories = flattenCategories(categories);
  const totalCategories = allCategories.length;
  const activeCategories = allCategories.filter(c => c.status === "active").length;
  // TODO: Add real product count from backend once aggregation is added
  const totalProducts = allCategories.reduce((acc, cat) => acc + (cat.productCount || 0), 0);
  const categoriesWithRules = allCategories.filter(c => c.commissionRuleId).length;

  const filteredCategories = searchQuery
    ? allCategories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCategories;

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleEditCategory = (category: Category) => {
    navigate(`/admin/categories/manage?id=${category.id}`);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Are you sure you want to deactivate category "${category.name}"?`)) {
      try {
        await productApi.deleteCategory(category.id);
        toast({ title: "Success", description: "Category deactivated successfully" });
        fetchCategories(); // Refresh list
        if (selectedCategory?.id === category.id) {
          setSelectedCategory(null);
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
      }
    }
  };

  const handleViewProducts = (category: Category) => {
    navigate(`/admin/products?category=${category.id}`);
  };

  const handleCreateSubCategory = (parent: Category) => {
    setParentCategory(parent);
    setNewCategoryName("");
    setIsCreateDialogOpen(true);
  };

  const submitCreateSubCategory = async () => {
    if (!newCategoryName.trim() || !parentCategory) return;
    
    setIsSubmitting(true);
    try {
      await productApi.createCategory({
        name: newCategoryName.trim(),
        parent_id: parentCategory.id,
        is_active: true,
        sort_order: 0
      });
      
      toast({ 
        title: "Success", 
        description: `Sub-category "${newCategoryName}" created under "${parentCategory.name}"` 
      });
      
      setIsCreateDialogOpen(false);
      fetchCategories(); // Refresh tree
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.response?.data?.error || "Failed to create sub-category", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category List</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product categories and hierarchy
          </p>
        </div>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/admin/categories/manage")}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Categories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Categories
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              {activeCategories}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Commission Rules
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesWithRules}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "tree" | "list")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:w-[300px]"
        />
      </div>

      {/* Category Tree or List */}
      {viewMode === "tree" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Hierarchy</CardTitle>
            <CardDescription>
              Expand and collapse to view subcategories
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <CategoryTree
              categories={categories}
              onSelect={handleCategorySelect}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onViewProducts={handleViewProducts}
              onCreateSubCategory={handleCreateSubCategory}
              selectedId={selectedCategory?.id}
            />
            {categories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Folder className="h-12 w-12 mb-4 opacity-50" />
                <p>No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredCategories.map((category) => (
              <CategoryListItem
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
            {filteredCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Folder className="h-12 w-12 mb-4 opacity-50" />
                <p>No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Category Details */}
      {selectedCategory && viewMode === "tree" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent</p>
                <p className="font-medium">{selectedCategory.parentName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="font-medium">{selectedCategory.productCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Rule</p>
                {selectedCategory.commissionRuleName ? (
                  <Badge variant="secondary">{selectedCategory.commissionRuleName}</Badge>
                ) : (
                  <Badge variant="outline">No rule</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditCategory(selectedCategory)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewProducts(selectedCategory)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Create Sub-category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-blue-600" />
              New Sub Folder
            </DialogTitle>
            <DialogDescription>
              Create a new sub-category inside <strong>{parentCategory?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Enter sub-folder name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitCreateSubCategory();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitCreateSubCategory} 
              disabled={!newCategoryName.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
