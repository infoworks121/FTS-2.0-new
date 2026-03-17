import { useState } from "react";
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

// Mock categories with hierarchy
const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Electronics",
    description: "All electronic devices and accessories",
    productCount: 156,
    commissionRuleId: "rule-1",
    commissionRuleName: "Standard Commission",
    status: "active",
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    children: [
      {
        id: "cat-1-1",
        name: "Mobile Phones",
        parentId: "cat-1",
        parentName: "Electronics",
        productCount: 45,
        commissionRuleId: "rule-1",
        commissionRuleName: "Standard Commission",
        status: "active",
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "cat-1-2",
        name: "Laptops",
        parentId: "cat-1",
        parentName: "Electronics",
        productCount: 32,
        commissionRuleId: "rule-1",
        commissionRuleName: "Standard Commission",
        status: "active",
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "cat-1-3",
        name: "Accessories",
        parentId: "cat-1",
        parentName: "Electronics",
        productCount: 79,
        status: "active",
        sortOrder: 3,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
    ],
  },
  {
    id: "cat-2",
    name: "Digital Products",
    description: "E-books, courses, and digital downloads",
    productCount: 48,
    commissionRuleId: "rule-2",
    commissionRuleName: "Digital Products Commission",
    status: "active",
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    children: [
      {
        id: "cat-2-1",
        name: "E-Books",
        parentId: "cat-2",
        parentName: "Digital Products",
        productCount: 23,
        commissionRuleId: "rule-2",
        commissionRuleName: "Digital Products Commission",
        status: "active",
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "cat-2-2",
        name: "Online Courses",
        parentId: "cat-2",
        parentName: "Digital Products",
        productCount: 25,
        commissionRuleId: "rule-2",
        commissionRuleName: "Digital Products Commission",
        status: "active",
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
    ],
  },
  {
    id: "cat-3",
    name: "Services",
    description: "Professional and home services",
    productCount: 34,
    commissionRuleId: "rule-3",
    commissionRuleName: "Service Commission",
    status: "active",
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "cat-4",
    name: "Fashion",
    description: "Clothing and fashion accessories",
    productCount: 89,
    status: "inactive",
    sortOrder: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

export default function CategoryList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Calculate stats
  const totalCategories = mockCategories.reduce((acc, cat) => {
    return acc + 1 + (cat.children?.length || 0);
  }, 0);
  const activeCategories = mockCategories.filter(c => c.status === "active").length;
  const totalProducts = mockCategories.reduce((acc, cat) => acc + cat.productCount, 0);
  const categoriesWithRules = mockCategories.filter(c => c.commissionRuleId).length;

  // Flatten categories for search
  const flattenCategories = (cats: Category[]): Category[] => {
    return cats.reduce((acc: Category[], cat) => {
      acc.push(cat);
      if (cat.children) {
        acc.push(...flattenCategories(cat.children));
      }
      return acc;
    }, []);
  };

  const allCategories = flattenCategories(mockCategories);
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

  const handleDeleteCategory = (category: Category) => {
    if (category.productCount > 0) {
      alert(`Cannot delete category "${category.name}" as it contains ${category.productCount} products.`);
      return;
    }
    // Would handle deletion here
  };

  const handleViewProducts = (category: Category) => {
    navigate(`/admin/products?category=${category.id}`);
  };

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
              categories={mockCategories}
              onSelect={handleCategorySelect}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onViewProducts={handleViewProducts}
              selectedId={selectedCategory?.id}
            />
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
    </div>
  );
}
