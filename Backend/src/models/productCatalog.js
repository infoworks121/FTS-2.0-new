const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Categories
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  image_url: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Sub-categories
const SubCategory = sequelize.define('SubCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  image_url: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Products
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sub_category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  sku: { type: DataTypes.STRING, unique: true },
  brand: DataTypes.STRING,
  unit: DataTypes.STRING,
  weight: DataTypes.DECIMAL(10, 2),
  dimensions: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Product Variants
const ProductVariant = sequelize.define('ProductVariant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  variant_name: DataTypes.STRING,
  sku: { type: DataTypes.STRING, unique: true },
  attributes: DataTypes.JSON,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Product Pricing
const ProductPricing = sequelize.define('ProductPricing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: DataTypes.INTEGER,
  variant_id: DataTypes.INTEGER,
  price_type: { type: DataTypes.ENUM('base', 'wholesale', 'retail', 'dealer'), defaultValue: 'base' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  min_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  max_quantity: DataTypes.INTEGER,
  effective_from: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  effective_to: DataTypes.DATE,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Service Catalog
const ServiceCatalog = sequelize.define('ServiceCatalog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  service_type: DataTypes.STRING,
  duration: DataTypes.STRING,
  price: DataTypes.DECIMAL(10, 2),
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Subscription Plans
const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  duration_months: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  features: DataTypes.JSON,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Price History
const PriceHistory = sequelize.define('PriceHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: DataTypes.INTEGER,
  variant_id: DataTypes.INTEGER,
  old_price: DataTypes.DECIMAL(10, 2),
  new_price: DataTypes.DECIMAL(10, 2),
  price_type: DataTypes.STRING,
  changed_by: DataTypes.INTEGER,
  change_reason: DataTypes.STRING
});

// Associations
Category.hasMany(SubCategory, { foreignKey: 'category_id' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id' });

SubCategory.hasMany(Product, { foreignKey: 'sub_category_id' });
Product.belongsTo(SubCategory, { foreignKey: 'sub_category_id' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductPricing, { foreignKey: 'product_id' });
ProductVariant.hasMany(ProductPricing, { foreignKey: 'variant_id' });

module.exports = {
  Category,
  SubCategory,
  Product,
  ProductVariant,
  ProductPricing,
  ServiceCatalog,
  SubscriptionPlan,
  PriceHistory
};