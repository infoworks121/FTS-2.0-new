// Product Types
export type ProductType = "physical" | "digital" | "service";

export type ProductStatus = "active" | "inactive" | "draft" | "archived";

// Matches DB columns from admin_products table (snake_case from API response)
export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category_name: string;
  product_type: ProductType;
  base_price: number;
  cost_price: number;
  margin_percent: number;
  min_margin_percent: number;
  stock_required: boolean;
  stock_quantity: number;
  is_digital: boolean;
  is_service: boolean;
  description: string | null;
  status: ProductStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

// Frontend form state (camelCase)
export interface ProductFormData {
  name: string;
  sku: string;
  categoryId: string;
  type: ProductType;
  basePrice: number;
  costPrice: number;
  minMarginPercent: number;
  stockRequired: boolean;
  stockQuantity: number;
  isDigital: boolean;
  isService: boolean;
  description: string;
  status?: string;
}

export interface ProductPricingUpdate {
  productId: string;
  basePrice: number;
  costPrice: number;
  minMarginPercent: number;
}

export interface PriceHistory {
  id: string;
  productId: string;
  basePrice: number;
  costPrice: number;
  marginPercent: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  description?: string;
  productCount: number;
  commissionRuleId?: string;
  commissionRuleName?: string;
  status: "active" | "inactive";
  sortOrder: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  parentId?: string;
  description?: string;
  commissionRuleId?: string;
  status: "active" | "inactive";
}

export interface CategoryCommissionMapping {
  categoryId: string;
  categoryName: string;
  commissionRuleId: string;
  commissionRuleName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isDefault: boolean;
}

// Commission Rule Types
export interface CommissionRule {
  id: string;
  name: string;
  description?: string;
  percentage: number;
  type: "category" | "product" | "global";
  status: "active" | "scheduled" | "archived";
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Status Badge Colors
export const statusColors: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-600", label: "Active" },
  inactive: { bg: "bg-red-500/10", text: "text-red-600", label: "Inactive" },
  draft: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Draft" },
  archived: { bg: "bg-gray-500/10", text: "text-gray-600", label: "Archived" },
};

// Product Type Icons and Labels
export const productTypeConfig: Record<ProductType, { icon: string; label: string; color: string }> = {
  physical: { icon: "Package", label: "Physical", color: "text-blue-500" },
  digital: { icon: "Download", label: "Digital", color: "text-purple-500" },
  service: { icon: "Wrench", label: "Service", color: "text-orange-500" },
};
