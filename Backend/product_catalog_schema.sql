-- Product Catalog Module (Module 2) - Database Schema

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub-categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sub_category_id INTEGER NOT NULL REFERENCES sub_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    brand VARCHAR(255),
    unit VARCHAR(50),
    weight DECIMAL(10,2),
    dimensions VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    variant_name VARCHAR(255),
    sku VARCHAR(100) UNIQUE,
    attributes JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product pricing table
CREATE TABLE IF NOT EXISTS product_pricing (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    price_type VARCHAR(50) DEFAULT 'base' CHECK (price_type IN ('base', 'wholesale', 'retail', 'dealer')),
    price DECIMAL(10,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service catalog table
CREATE TABLE IF NOT EXISTS service_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100),
    duration VARCHAR(100),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    price_type VARCHAR(50),
    changed_by INTEGER,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON products(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_product_id ON product_pricing(product_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_variant_id ON product_pricing(variant_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);

-- Insert sample data
INSERT INTO categories (name, description, sort_order) VALUES 
('Electronics', 'Electronic products and gadgets', 1),
('Clothing', 'Apparel and fashion items', 2),
('Home & Garden', 'Home improvement and garden supplies', 3)
ON CONFLICT DO NOTHING;

INSERT INTO sub_categories (category_id, name, description, sort_order) VALUES 
(1, 'Mobile Phones', 'Smartphones and accessories', 1),
(1, 'Laptops', 'Laptops and computer accessories', 2),
(2, 'Men''s Clothing', 'Clothing for men', 1),
(2, 'Women''s Clothing', 'Clothing for women', 2)
ON CONFLICT DO NOTHING;

INSERT INTO service_catalog (name, description, service_type, duration, price) VALUES 
('Installation Service', 'Professional installation service', 'installation', '2 hours', 500.00),
('Maintenance Service', 'Regular maintenance service', 'maintenance', '1 hour', 300.00),
('Repair Service', 'Product repair service', 'repair', '3 hours', 800.00)
ON CONFLICT DO NOTHING;

INSERT INTO subscription_plans (name, description, duration_months, price, features) VALUES 
('Basic Plan', 'Basic subscription with essential features', 6, 2999.00, '["Basic Support", "Standard Features"]'),
('Premium Plan', 'Premium subscription with all features', 12, 9999.00, '["Priority Support", "All Features", "Advanced Analytics"]'),
('Enterprise Plan', 'Enterprise subscription for large businesses', 24, 19999.00, '["24/7 Support", "Custom Features", "Dedicated Manager"]')
ON CONFLICT DO NOTHING;