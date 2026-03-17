-- Admin Products Table (for admin product management with full form fields)

CREATE TABLE IF NOT EXISTS admin_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER REFERENCES categories(id),
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('physical', 'digital', 'service')),
    base_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2) DEFAULT 0,
    margin_percent DECIMAL(8,4) DEFAULT 0,
    min_margin_percent DECIMAL(8,4) DEFAULT 15,
    stock_required BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    is_digital BOOLEAN DEFAULT false,
    is_service BOOLEAN DEFAULT false,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_products_category_id ON admin_products(category_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_status ON admin_products(status);
CREATE INDEX IF NOT EXISTS idx_admin_products_product_type ON admin_products(product_type);
