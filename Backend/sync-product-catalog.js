const sequelize = require('./src/config/db');
const {
  Category,
  SubCategory,
  Product,
  ProductVariant,
  ProductPricing,
  ServiceCatalog,
  SubscriptionPlan,
  PriceHistory
} = require('./src/models/productCatalog');

async function syncProductCatalog() {
  try {
    console.log('🔄 Syncing Product Catalog models...');
    
    await sequelize.sync({ alter: true });
    
    console.log('✅ Product Catalog models synced successfully!');
    console.log('📋 Tables created:');
    console.log('   - Categories');
    console.log('   - SubCategories');
    console.log('   - Products');
    console.log('   - ProductVariants');
    console.log('   - ProductPricings');
    console.log('   - ServiceCatalogs');
    console.log('   - SubscriptionPlans');
    console.log('   - PriceHistories');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing models:', error);
    process.exit(1);
  }
}

syncProductCatalog();