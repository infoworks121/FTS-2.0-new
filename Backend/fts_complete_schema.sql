-- =============================================================================
-- FTS (Farm & Tech Service) — COMPLETE DATABASE SCHEMA (HARDENED)
-- All 12 Modules | Loop-hole Free | Financial & Audit-Grade PostgreSQL
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- MODULE 1: IDENTITY & AUTHENTICATION
-- =============================================================================

CREATE TABLE user_roles (
    id            SERIAL PRIMARY KEY,
    role_code     VARCHAR(50) UNIQUE NOT NULL,  -- 'admin','core_body','businessman','customer'
    role_label    VARCHAR(100) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone               VARCHAR(15) UNIQUE NOT NULL,
    email               VARCHAR(150),           -- handled UNIQUE via partial index below
    full_name           VARCHAR(150) NOT NULL,
    role_id             INT NOT NULL REFERENCES user_roles(id) ON DELETE RESTRICT,
    password_hash       TEXT,
    is_active           BOOLEAN DEFAULT TRUE,   -- Soft deletion enforced
    is_email_verified   BOOLEAN DEFAULT FALSE,
    is_phone_verified   BOOLEAN DEFAULT FALSE,
    pan_number          VARCHAR(10) UNIQUE,
    aadhaar_hash        TEXT,                   -- hashed, not raw
    profile_photo_url   TEXT,
    referral_code       VARCHAR(20) UNIQUE NOT NULL,                  -- FK added after districts table
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index to ensure emails if provided are unique
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- safe to cascade sessions
    panel           VARCHAR(30) NOT NULL,       -- 'admin','core_body','businessman','customer'
    token_hash      TEXT NOT NULL,
    device_id       UUID,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_devices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint  TEXT NOT NULL,
    device_type         VARCHAR(50),
    os                  VARCHAR(50),
    browser             VARCHAR(50),
    first_seen_at       TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at        TIMESTAMPTZ DEFAULT NOW(),
    is_flagged          BOOLEAN DEFAULT FALSE,
    flag_reason         TEXT,
    UNIQUE (user_id, device_fingerprint)
);

CREATE TABLE otp_verifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target          VARCHAR(150) NOT NULL,
    target_type     VARCHAR(10) NOT NULL,       -- 'phone','email'
    otp_hash        TEXT NOT NULL,
    purpose         VARCHAR(50) NOT NULL,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    verified        BOOLEAN DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    attempts        SMALLINT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kyc_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- protect KYC record
    doc_type            VARCHAR(50) NOT NULL,
    doc_url             TEXT NOT NULL,
    doc_number_hash     TEXT,
    status              VARCHAR(30) DEFAULT 'pending',
    reviewed_by         UUID REFERENCES users(id),
    review_note         TEXT,
    reviewed_at         TIMESTAMPTZ,
    uploaded_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kyc_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    doc_id          UUID REFERENCES kyc_documents(id) ON DELETE RESTRICT,
    action          VARCHAR(50) NOT NULL,
    performed_by    UUID REFERENCES users(id),
    old_status      VARCHAR(30),
    new_status      VARCHAR(30),
    note            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE login_attempts (
    id              BIGSERIAL PRIMARY KEY,
    target          VARCHAR(150) NOT NULL,
    target_type     VARCHAR(10) NOT NULL,
    ip_address      INET,
    device_id       UUID,
    success         BOOLEAN NOT NULL,
    panel           VARCHAR(30),
    failure_reason  TEXT,
    attempted_at    TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 2: GEOGRAPHY & DISTRICT STRUCTURE
-- =============================================================================

CREATE TABLE countries (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    iso_code    VARCHAR(5) UNIQUE NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE states (
    id          SERIAL PRIMARY KEY,
    country_id  INT NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10),
    is_active   BOOLEAN DEFAULT TRUE,
    UNIQUE(country_id, name)
);

CREATE TABLE districts (
    id          SERIAL PRIMARY KEY,
    state_id    INT NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    name        VARCHAR(150) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    UNIQUE(state_id, name)
);

-- Associate users properly
ALTER TABLE users ADD CONSTRAINT fk_users_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT;

CREATE TABLE cities (
    id          SERIAL PRIMARY KEY,
    district_id INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    name        VARCHAR(150) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE pincodes (
    id          SERIAL PRIMARY KEY,
    city_id     INT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    pincode     VARCHAR(10) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    UNIQUE(city_id, pincode)
);

CREATE TABLE district_quota (
    id                  SERIAL PRIMARY KEY,
    district_id         INT UNIQUE NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    max_core_body       SMALLINT DEFAULT 20,    -- Only for Type A + B combined, Dealer unlimited
    current_count       SMALLINT DEFAULT 0 CHECK (current_count >= 0),  -- Count only Type A + B
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE district_coverage_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id     INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    entity_type     VARCHAR(30) NOT NULL,       -- 'core_body','stock_point'
    entity_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    coverage_area   TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    assigned_at     TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 3: ROLE-SPECIFIC PROFILES
-- =============================================================================

CREATE TABLE admin_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    permissions         JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_body_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type                VARCHAR(10) NOT NULL,   -- 'A','B','Dealer' (A+B limited to 20, Dealer unlimited)
    district_id         INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    investment_amount   NUMERIC(14,2) NOT NULL CHECK (investment_amount >= 0),
    installment_count   SMALLINT DEFAULT 1 CHECK (installment_count >= 1 AND installment_count <= 4),
    annual_cap          NUMERIC(14,2),
    monthly_cap         NUMERIC(14,2),
    ytd_earnings        NUMERIC(14,2) DEFAULT 0 CHECK (ytd_earnings >= 0),
    mtd_earnings        NUMERIC(14,2) DEFAULT 0 CHECK (mtd_earnings >= 0),
    cap_hit_flag        BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    activated_at        TIMESTAMPTZ,
    last_transaction_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_body_installments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    core_body_id        UUID NOT NULL REFERENCES core_body_profiles(id) ON DELETE RESTRICT,
    installment_no      SMALLINT NOT NULL CHECK (installment_no BETWEEN 1 AND 4),
    amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    due_date            DATE,
    paid_date           DATE,
    status              VARCHAR(20) DEFAULT 'pending',
    payment_ref         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to enforce district quota for Type A and B only
CREATE OR REPLACE FUNCTION check_core_body_district_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_current_count INT;
    v_max_allowed INT;
BEGIN
    -- Only check quota for Type A and B, skip for Dealer
    IF NEW.type IN ('A', 'B') THEN
        -- Get current count of Type A + B in the district
        SELECT COUNT(*) INTO v_current_count
        FROM core_body_profiles
        WHERE district_id = NEW.district_id
          AND type IN ('A', 'B')
          AND is_active = TRUE
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
        
        -- Get max allowed from district_quota
        SELECT COALESCE(max_core_body, 20) INTO v_max_allowed
        FROM district_quota
        WHERE district_id = NEW.district_id;
        
        -- If no quota record exists, use default 20
        IF v_max_allowed IS NULL THEN
            v_max_allowed := 20;
        END IF;
        
        -- Check if limit exceeded
        IF v_current_count >= v_max_allowed THEN
            -- Log the breach attempt
            INSERT INTO core_body_limit_breach_log (district_id, attempted_user_id, current_count, max_allowed)
            VALUES (NEW.district_id, NEW.user_id, v_current_count, v_max_allowed);
            
            RAISE EXCEPTION 'District quota exceeded: Maximum % Core Body (Type A+B) allowed, currently % active', v_max_allowed, v_current_count;
        END IF;
    END IF;
    -- Dealer type has no limit, so no check needed
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce quota before insert or update
CREATE TRIGGER enforce_core_body_quota
BEFORE INSERT OR UPDATE OF district_id, type, is_active ON core_body_profiles
FOR EACH ROW
EXECUTE FUNCTION check_core_body_district_quota();

-- Businessman: Sales & distribution layer with 4 types
-- retailer_b: Entry-level, no investment, referral-based income
-- retailer_a: Advance payment, better pricing, larger scale
-- businessman: Bulk distribution, B2B focused, negotiated pricing
-- stock_point: Inventory holder, B2C fulfillment, SLA-based (see stock_point_profiles)
CREATE TABLE businessman_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type                    VARCHAR(20) NOT NULL DEFAULT 'retailer_b', -- 'retailer_a','retailer_b','businessman','stock_point'
    district_id             INT REFERENCES districts(id) ON DELETE RESTRICT,
    advance_amount          NUMERIC(14,2) DEFAULT 0 CHECK (advance_amount >= 0), -- For retailer_a: advance payment amount
    assigned_core_body_id   UUID REFERENCES core_body_profiles(id) ON DELETE RESTRICT, -- Linked to Core Body for profit sharing
    is_active               BOOLEAN DEFAULT TRUE,
    last_transaction_at     TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE: Add missing columns to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_approved     BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at     TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS role_code       VARCHAR(50),
    ADD COLUMN IF NOT EXISTS district_id     INT REFERENCES districts(id) ON DELETE RESTRICT;

-- ALTER TABLE: Add missing columns to businessman_profiles
ALTER TABLE businessman_profiles
    ADD COLUMN IF NOT EXISTS mode                VARCHAR(20),
    ADD COLUMN IF NOT EXISTS business_name       VARCHAR(200),
    ADD COLUMN IF NOT EXISTS business_address    TEXT,
    ADD COLUMN IF NOT EXISTS gst_number          VARCHAR(15),
    ADD COLUMN IF NOT EXISTS pan_number          VARCHAR(10),
    ADD COLUMN IF NOT EXISTS bank_account        VARCHAR(30),
    ADD COLUMN IF NOT EXISTS ifsc_code           VARCHAR(11),
    ADD COLUMN IF NOT EXISTS monthly_target      NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ytd_sales           NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mtd_sales           NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission_earned   NUMERIC(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS activated_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_order_at       TIMESTAMPTZ;

-- CREATE TABLE: businessman_investments (advance payment installments for retailer_a)
CREATE TABLE IF NOT EXISTS businessman_investments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    businessman_id      UUID NOT NULL REFERENCES businessman_profiles(id) ON DELETE RESTRICT,
    installment_no      SMALLINT NOT NULL CHECK (installment_no BETWEEN 1 AND 4),
    amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    due_date            DATE,
    paid_date           DATE,
    status              VARCHAR(20) DEFAULT 'pending',
    payment_ref         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE: retailer_profiles (used in unifiedProfileController)
CREATE TABLE IF NOT EXISTS retailer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shop_name           VARCHAR(200),
    shop_address        TEXT,
    shop_type           VARCHAR(50),
    gst_number          VARCHAR(15),
    pan_number          VARCHAR(10),
    bank_account        VARCHAR(30),
    ifsc_code           VARCHAR(11),
    monthly_target      NUMERIC(14,2) DEFAULT 0,
    ytd_sales           NUMERIC(14,2) DEFAULT 0,
    mtd_sales           NUMERIC(14,2) DEFAULT 0,
    commission_earned   NUMERIC(14,2) DEFAULT 0,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Point: Sub-role of businessman (type='stock_point')
-- BUSINESS LOGIC:
-- 1. Maintains inventory (see inventory_balances where entity_type='stock_point')
-- 2. Fulfills B2C online orders (see fulfillment_assignments where fulfiller_type='stock_point')
-- 3. Nearest fulfillment partner selection: Query by district_id + inventory availability + sla_score
-- 4. SLA tracking: order_sla_log tracks deadlines, sla_breach_log records violations
-- 5. Inventory management: Check minimum_inventory_rules, auto-alert if below threshold
-- 6. Performance: sla_score decreases on breach, deactivate if score < threshold (e.g., 50)
CREATE TABLE stock_point_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    businessman_id          UUID UNIQUE NOT NULL REFERENCES businessman_profiles(id) ON DELETE RESTRICT,
    district_id             INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT, -- For nearest stock point selection
    min_inventory_value     NUMERIC(14,2) DEFAULT 0 CHECK (min_inventory_value >= 0), -- Minimum inventory value to maintain
    sla_score               NUMERIC(5,2) DEFAULT 100.00 CHECK (sla_score BETWEEN 0 AND 100), -- Performance score, deduct on SLA breach
    is_active               BOOLEAN DEFAULT TRUE, -- Deactivate if sla_score too low or inventory issues
    activated_by            UUID REFERENCES users(id),
    deactivated_by          UUID REFERENCES users(id),
    deactivation_reason     TEXT,
    activated_at            TIMESTAMPTZ,
    deactivated_at          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE: Add missing columns to stock_point_profiles
ALTER TABLE stock_point_profiles
    ADD COLUMN IF NOT EXISTS warehouse_address   TEXT,
    ADD COLUMN IF NOT EXISTS storage_capacity    NUMERIC(14,2) DEFAULT 0;

CREATE TABLE customer_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    delivery_addresses  JSONB,
    preferences         JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE upgrade_demotion_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type     VARCHAR(20) NOT NULL,
    from_role       VARCHAR(50),
    to_role         VARCHAR(50),
    from_mode       VARCHAR(30),
    to_mode         VARCHAR(30),
    reason          TEXT,
    performed_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 4: PRODUCT & SERVICE CATALOG
-- =============================================================================

CREATE TABLE commission_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    percentage      NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    type            VARCHAR(20) DEFAULT 'category', -- 'category', 'product', 'global'
    status          VARCHAR(20) DEFAULT 'active', -- 'active', 'scheduled', 'archived'
    effective_from  TIMESTAMPTZ DEFAULT NOW(),
    effective_to    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id                  SERIAL PRIMARY KEY,
    parent_id           INT REFERENCES categories(id) ON DELETE RESTRICT,
    name                VARCHAR(150) NOT NULL,
    slug                VARCHAR(150) UNIQUE NOT NULL,
    icon_url            TEXT,
    description         TEXT,
    commission_rule_id  UUID REFERENCES commission_rules(id) ON DELETE SET NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    sort_order          INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name                VARCHAR(255) NOT NULL,
    sku                 VARCHAR(100) UNIQUE NOT NULL,
    description         TEXT,
    type                VARCHAR(20) NOT NULL DEFAULT 'physical',
    unit                VARCHAR(30),
    is_subscription     BOOLEAN DEFAULT FALSE,
    thumbnail_url       TEXT,
    image_urls          JSONB,
    tags                TEXT[],
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name    VARCHAR(100) NOT NULL,
    sku_suffix      VARCHAR(50),
    attributes      JSONB,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_pricing (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    mrp                 NUMERIC(12,2) NOT NULL CHECK (mrp >= 0),
    base_price          NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    selling_price       NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    admin_margin_pct    NUMERIC(5,2),
    bulk_price          NUMERIC(12,2) CHECK (bulk_price >= 0),
    effective_from      TIMESTAMPTZ DEFAULT NOW(),
    effective_to        TIMESTAMPTZ,
    is_current          BOOLEAN DEFAULT TRUE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only ONE active price per variant/product combination
CREATE UNIQUE INDEX idx_product_pricing_singleton ON product_pricing(product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)) WHERE is_current = TRUE;

CREATE TABLE service_catalog (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    service_type        VARCHAR(50),
    delivery_mode       VARCHAR(30),
    duration_minutes    INT,
    requires_booking    BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- NOTE: Subscription plans are for FUTURE IMPLEMENTATION and NOT active in the current phase.
CREATE TABLE subscription_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    plan_name           VARCHAR(100) NOT NULL,
    billing_cycle       VARCHAR(20) NOT NULL,
    price               NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    trial_days          INT DEFAULT 0 CHECK (trial_days >= 0),
    features            JSONB,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_history (
    id              BIGSERIAL PRIMARY KEY,
    product_id      UUID NOT NULL REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    old_price       NUMERIC(12,2),
    new_price       NUMERIC(12,2),
    field_changed   VARCHAR(50),
    changed_by      UUID REFERENCES users(id),
    reason          TEXT,
    changed_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 5: INVENTORY & STOCK MANAGEMENT
-- =============================================================================

CREATE TABLE inventory_ledger (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    entity_type         VARCHAR(30) NOT NULL,
    entity_id           UUID NOT NULL,
    transaction_type    VARCHAR(30) NOT NULL,
    quantity            NUMERIC(12,3) NOT NULL,
    unit                VARCHAR(20),
    reference_type      VARCHAR(30),
    reference_id        UUID,
    note                TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_allocations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),
    from_entity_type    VARCHAR(30) NOT NULL,
    from_entity_id      UUID NOT NULL,
    to_entity_type      VARCHAR(30) NOT NULL,
    to_entity_id        UUID NOT NULL,
    quantity            NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit                VARCHAR(20),
    status              VARCHAR(20) DEFAULT 'pending',
    approved_by         UUID REFERENCES users(id),
    dispatched_at       TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    note                TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Point inventory tracking
-- BUSINESS LOGIC: Query by entity_type='stock_point' and entity_id to get stock point's inventory
-- quantity_reserved: Reserve on order placement, deduct on fulfillment
-- Check quantity_on_hand >= order quantity before assignment
CREATE TABLE inventory_balances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type         VARCHAR(30) NOT NULL,   -- 'admin','core_body','stock_point'
    entity_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity_on_hand    NUMERIC(12,3) DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved   NUMERIC(12,3) DEFAULT 0 CHECK (quantity_reserved >= 0),
    last_updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_inventory_balances_unique ON inventory_balances(entity_type, entity_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));


CREATE TABLE stock_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_point_id      UUID NOT NULL REFERENCES stock_point_profiles(id) ON DELETE RESTRICT,
    product_id          UUID NOT NULL REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),
    requested_qty       NUMERIC(12,3) NOT NULL CHECK (requested_qty > 0),
    status              VARCHAR(20) DEFAULT 'pending',
    request_note        TEXT,
    reviewed_by         UUID REFERENCES users(id),
    review_note         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_movement_log (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          UUID NOT NULL REFERENCES products(id),
    variant_id          UUID REFERENCES product_variants(id),
    entity_type         VARCHAR(30) NOT NULL,
    entity_id           UUID NOT NULL,
    direction           VARCHAR(10) NOT NULL,
    quantity            NUMERIC(12,3) NOT NULL,
    reason_code         VARCHAR(50) NOT NULL,
    reference_type      VARCHAR(30),
    reference_id        UUID,
    performed_by        UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Minimum inventory rules for stock points
-- BUSINESS LOGIC: Alert/auto-request when quantity_on_hand < min_quantity
-- Check this table periodically or on stock movement
CREATE TABLE minimum_inventory_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_point_id      UUID NOT NULL REFERENCES stock_point_profiles(id) ON DELETE RESTRICT,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    min_quantity        NUMERIC(12,3) NOT NULL CHECK (min_quantity >= 0),
    set_by              UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_min_inventory_rules_unique ON minimum_inventory_rules(stock_point_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));



-- =============================================================================
-- MODULE 6: ORDERS & FULFILLMENT
-- =============================================================================

CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number            VARCHAR(50) UNIQUE NOT NULL,
    customer_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_type              VARCHAR(10) NOT NULL,
    status                  VARCHAR(30) DEFAULT 'pending',
    subtotal                NUMERIC(14,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount         NUMERIC(14,2) DEFAULT 0 CHECK (discount_amount >= 0),
    delivery_charge         NUMERIC(10,2) DEFAULT 0 CHECK (delivery_charge >= 0),
    tax_amount              NUMERIC(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount            NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    total_profit            NUMERIC(14,2),
    payment_method          VARCHAR(30),
    payment_status          VARCHAR(20) DEFAULT 'pending',
    payment_reference       TEXT,
    delivery_address        JSONB,
    pincode_id              INT REFERENCES pincodes(id) ON DELETE RESTRICT,
    district_id             INT REFERENCES districts(id) ON DELETE RESTRICT,
    referral_code_used      VARCHAR(20),
    referral_user_id        UUID REFERENCES users(id) ON DELETE RESTRICT,
    return_window_days      SMALLINT DEFAULT 7,
    return_window_closed    BOOLEAN DEFAULT FALSE,
    return_window_closed_at TIMESTAMPTZ,
    notes                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- safe to cascade to item
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id          UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity            NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    mrp                 NUMERIC(12,2) CHECK (mrp >= 0),
    discount            NUMERIC(10,2) DEFAULT 0 CHECK (discount >= 0),
    total_price         NUMERIC(14,2) NOT NULL CHECK (total_price >= 0),
    unit_profit         NUMERIC(12,2),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_status_log (
    id              BIGSERIAL PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    old_status      VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    note            TEXT,
    performed_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Order fulfillment assignment to stock points
-- BUSINESS LOGIC:
-- 1. On B2C order: Find nearest stock point (same district_id + has inventory + is_active + best sla_score)
-- 2. Create assignment with fulfiller_type='stock_point', fulfiller_id=stock_point_profile.id
-- 3. Track timestamps: assigned_at → accepted_at → dispatched_at → delivered_at
-- 4. Calculate SLA: Compare actual times with sla_rules deadlines
CREATE TABLE fulfillment_assignments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    fulfiller_type      VARCHAR(30) NOT NULL,
    fulfiller_id        UUID NOT NULL,
    status              VARCHAR(30) DEFAULT 'assigned',
    assigned_at         TIMESTAMPTZ DEFAULT NOW(),
    accepted_at         TIMESTAMPTZ,
    dispatched_at       TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ
);

CREATE TABLE fulfillment_rule_log (
    id              BIGSERIAL PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    rule_applied    TEXT NOT NULL,
    candidates      JSONB,
    selected_id     UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_tracking (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    carrier             VARCHAR(100),
    tracking_number     VARCHAR(100),
    estimated_delivery  DATE,
    actual_delivery     TIMESTAMPTZ,
    current_status      VARCHAR(50),
    tracking_url        TEXT,
    last_updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE return_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_item_id       UUID REFERENCES order_items(id),
    requested_by        UUID NOT NULL REFERENCES users(id),
    reason              TEXT NOT NULL,
    return_type         VARCHAR(20) DEFAULT 'return',
    status              VARCHAR(20) DEFAULT 'pending',
    amount_to_refund    NUMERIC(12,2) CHECK (amount_to_refund >= 0),
    reviewed_by         UUID REFERENCES users(id),
    review_note         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE return_status_log (
    id              BIGSERIAL PRIMARY KEY,
    return_id       UUID NOT NULL REFERENCES return_requests(id) ON DELETE RESTRICT,
    old_status      VARCHAR(20),
    new_status      VARCHAR(20) NOT NULL,
    note            TEXT,
    performed_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE complaints (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID REFERENCES orders(id) ON DELETE RESTRICT,
    raised_by           UUID NOT NULL REFERENCES users(id),
    category            VARCHAR(50),
    description         TEXT NOT NULL,
    status              VARCHAR(20) DEFAULT 'open',
    resolved_by         UUID REFERENCES users(id),
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- SLA tracking for stock point performance
-- BUSINESS LOGIC:
-- 1. Create entry when order assigned with sla_deadline (from sla_rules table)
-- 2. Update actual_time when action completed
-- 3. If actual_time > sla_deadline: Set is_breached=true, log to sla_breach_log
-- 4. Deduct sla_score in stock_point_profiles on breach
CREATE TABLE order_sla_log (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    stock_point_id      UUID REFERENCES stock_point_profiles(id) ON DELETE RESTRICT,
    sla_type            VARCHAR(50) NOT NULL,
    sla_deadline        TIMESTAMPTZ NOT NULL,
    actual_time         TIMESTAMPTZ,
    is_breached         BOOLEAN DEFAULT FALSE,
    breach_duration_min INT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 7: PROFIT DISTRIBUTION ENGINE
-- =============================================================================

CREATE TABLE profit_rules (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel                 VARCHAR(10) NOT NULL,
    rule_name               VARCHAR(100) NOT NULL,
    fts_share_pct           NUMERIC(5,2) CHECK (fts_share_pct >= 0 AND fts_share_pct <= 100),
    referral_share_pct      NUMERIC(5,2) CHECK (referral_share_pct >= 0 AND referral_share_pct <= 100),
    trust_fund_pct          NUMERIC(5,2) CHECK (trust_fund_pct >= 0 AND trust_fund_pct <= 100),
    admin_pct               NUMERIC(5,2) CHECK (admin_pct >= 0 AND admin_pct <= 100),
    company_pct             NUMERIC(5,2) CHECK (company_pct >= 0 AND company_pct <= 100),
    core_body_pool_pct      NUMERIC(5,2) CHECK (core_body_pool_pct >= 0 AND core_body_pool_pct <= 100),
    company_reserve_pct     NUMERIC(5,2) CHECK (company_reserve_pct >= 0 AND company_reserve_pct <= 100),
    stock_point_pct         NUMERIC(5,2) CHECK (stock_point_pct >= 0 AND stock_point_pct <= 100),
    referral_pct            NUMERIC(5,2) CHECK (referral_pct >= 0 AND referral_pct <= 100),
    effective_from          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to            TIMESTAMPTZ,
    is_current              BOOLEAN DEFAULT TRUE,
    created_by              UUID REFERENCES users(id),
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one active rule per channel
CREATE UNIQUE INDEX idx_profit_rules_singleton ON profit_rules(channel) WHERE is_current = TRUE;

CREATE TABLE profit_rule_history (
    id              BIGSERIAL PRIMARY KEY,
    rule_id         UUID NOT NULL REFERENCES profit_rules(id) ON DELETE RESTRICT,
    snapshot        JSONB NOT NULL,
    archived_at     TIMESTAMPTZ DEFAULT NOW(),
    archived_by     UUID REFERENCES users(id)
);

CREATE TABLE profit_distribution_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_item_id       UUID REFERENCES order_items(id) ON DELETE RESTRICT,
    channel             VARCHAR(10) NOT NULL,
    total_profit        NUMERIC(14,2) NOT NULL,
    rule_id             UUID NOT NULL REFERENCES profit_rules(id) ON DELETE RESTRICT,
    status              VARCHAR(20) DEFAULT 'processed',
    processed_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE distribution_line_items (
    id                      BIGSERIAL PRIMARY KEY,
    distribution_id         UUID NOT NULL REFERENCES profit_distribution_log(id) ON DELETE RESTRICT,
    recipient_type          VARCHAR(50) NOT NULL,
    recipient_id            UUID,
    amount                  NUMERIC(14,2) NOT NULL,
    percentage_applied      NUMERIC(5,2),
    wallet_credited         BOOLEAN DEFAULT FALSE,
    wallet_credit_ref       UUID,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_pool_log (
    id                  BIGSERIAL PRIMARY KEY,
    distribution_id     UUID NOT NULL REFERENCES profit_distribution_log(id) ON DELETE RESTRICT,
    total_pool_amount   NUMERIC(14,2) NOT NULL,
    core_body_share     NUMERIC(14,2),
    reserve_share       NUMERIC(14,2),
    allocated           BOOLEAN DEFAULT FALSE,
    allocated_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reserve_fund_log (
    id                  BIGSERIAL PRIMARY KEY,
    source_type         VARCHAR(50) NOT NULL,
    source_ref_id       UUID,
    credit_amount       NUMERIC(14,2) DEFAULT 0 CHECK (credit_amount >= 0),
    debit_amount        NUMERIC(14,2) DEFAULT 0 CHECK (debit_amount >= 0),
    balance_after       NUMERIC(14,2) NOT NULL,
    note                TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trust_fund_log (
    id                  BIGSERIAL PRIMARY KEY,
    source_type         VARCHAR(50) NOT NULL,
    source_ref_id       UUID,
    credit_amount       NUMERIC(14,2) DEFAULT 0 CHECK (credit_amount >= 0),
    debit_amount        NUMERIC(14,2) DEFAULT 0 CHECK (debit_amount >= 0),
    balance_after       NUMERIC(14,2) NOT NULL,
    note                TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cap_enforcement_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    distribution_id     UUID REFERENCES profit_distribution_log(id) ON DELETE RESTRICT,
    cap_type            VARCHAR(20) NOT NULL,
    cap_amount          NUMERIC(14,2) NOT NULL,
    earned_before_cap   NUMERIC(14,2) NOT NULL,
    awarded_amount      NUMERIC(14,2) NOT NULL,
    excess_amount       NUMERIC(14,2) NOT NULL,
    period_label        VARCHAR(20),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 8: WALLET SYSTEM
-- =============================================================================

CREATE TABLE wallet_types (
    id          SERIAL PRIMARY KEY,
    type_code   VARCHAR(30) UNIQUE NOT NULL,
    label       VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE wallets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_type_id  INT NOT NULL REFERENCES wallet_types(id) ON DELETE RESTRICT,
    balance         NUMERIC(14,2) DEFAULT 0 CHECK (balance >= 0), -- negative strictly prohibited
    transaction_pin VARCHAR(255), -- hashed 6-digit PIN
    is_frozen       BOOLEAN DEFAULT FALSE,
    freeze_reason   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, wallet_type_id)
);

CREATE TABLE wallet_deposit_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_id           UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    amount              NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    payment_method      VARCHAR(50) NOT NULL, -- bKash, Bank, Cash, etc.
    transaction_ref     VARCHAR(100),
    slip_url            TEXT, -- Image of the bank slip
    status              VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    admin_note          TEXT,
    processed_by        UUID REFERENCES users(id),
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id           UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    transaction_type    VARCHAR(20) NOT NULL,
    amount              NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    balance_before      NUMERIC(14,2) NOT NULL CHECK (balance_before >= 0),
    balance_after       NUMERIC(14,2) NOT NULL CHECK (balance_after >= 0),
    source_type         VARCHAR(50) NOT NULL,
    source_ref_id       UUID,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawal_requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_id               UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    requested_amount        NUMERIC(14,2) NOT NULL CHECK (requested_amount > 0),
    tds_amount              NUMERIC(10,2) DEFAULT 0 CHECK (tds_amount >= 0),
    processing_fee          NUMERIC(10,2) DEFAULT 0 CHECK (processing_fee >= 0),
    net_payable             NUMERIC(14,2) NOT NULL CHECK (net_payable >= 0),
    bank_account_details    JSONB NOT NULL,
    status                  VARCHAR(20) DEFAULT 'pending',
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawal_approvals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_id       UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE RESTRICT,
    reviewed_by         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action              VARCHAR(20) NOT NULL,
    note                TEXT,
    payment_reference   TEXT,
    actioned_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawal_tds_log (
    id                  BIGSERIAL PRIMARY KEY,
    withdrawal_id       UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE RESTRICT,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    gross_amount        NUMERIC(14,2) NOT NULL,
    tds_rate_pct        NUMERIC(5,2) NOT NULL,
    tds_amount          NUMERIC(12,2) NOT NULL,
    financial_year      VARCHAR(10) NOT NULL,
    pan_number          VARCHAR(10),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE processing_fee_log (
    id                  BIGSERIAL PRIMARY KEY,
    withdrawal_id       UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE RESTRICT,
    fee_type            VARCHAR(50),
    fee_amount          NUMERIC(10,2) NOT NULL,
    fee_rate_pct        NUMERIC(5,2),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallet_balance_snapshot (
    id              BIGSERIAL PRIMARY KEY,
    wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    snapshot_date   DATE NOT NULL,
    balance         NUMERIC(14,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wallet_id, snapshot_date)
);


-- =============================================================================
-- MODULE 9: REFERRAL SYSTEM
-- =============================================================================

CREATE TABLE referral_links (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referral_code       VARCHAR(20) UNIQUE NOT NULL,
    total_referrals     INT DEFAULT 0 CHECK (total_referrals >= 0),
    total_earned        NUMERIC(14,2) DEFAULT 0 CHECK (total_earned >= 0),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_registrations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referred_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code_used  VARCHAR(20) NOT NULL,
    depth               SMALLINT DEFAULT 1 CHECK (depth = 1),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_earnings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    referred_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    gross_amount        NUMERIC(14,2) NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending',
    hold_until          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_payout_log (
    id                  BIGSERIAL PRIMARY KEY,
    referral_earning_id UUID NOT NULL REFERENCES referral_earnings(id) ON DELETE RESTRICT,
    referrer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount_paid         NUMERIC(14,2) NOT NULL CHECK (amount_paid >= 0),
    wallet_transaction  UUID REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
    paid_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_reversal_log (
    id                  BIGSERIAL PRIMARY KEY,
    referral_earning_id UUID NOT NULL REFERENCES referral_earnings(id) ON DELETE RESTRICT,
    return_request_id   UUID REFERENCES return_requests(id) ON DELETE RESTRICT,
    reversed_amount     NUMERIC(14,2) NOT NULL CHECK (reversed_amount >= 0),
    reason              TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suspicious_referral_log (
    id                  BIGSERIAL PRIMARY KEY,
    referrer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referred_id         UUID REFERENCES users(id),
    order_id            UUID REFERENCES orders(id),
    flag_type           VARCHAR(50) NOT NULL,
    detail              TEXT,
    reviewed            BOOLEAN DEFAULT FALSE,
    reviewed_by         UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 10: SYSTEM CONFIGURATION & RULE ENGINE
-- =============================================================================

CREATE TABLE system_config (
    id              SERIAL PRIMARY KEY,
    config_key      VARCHAR(100) UNIQUE NOT NULL,
    config_value    TEXT NOT NULL,
    value_type      VARCHAR(20) DEFAULT 'string',
    description     TEXT,
    is_sensitive    BOOLEAN DEFAULT FALSE,
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commission_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         INT REFERENCES categories(id) ON DELETE RESTRICT,
    role_id             INT REFERENCES user_roles(id) ON DELETE RESTRICT,
    commission_pct      NUMERIC(5,2) NOT NULL CHECK (commission_pct >= 0 AND commission_pct <= 100),
    override_type       VARCHAR(30),
    effective_from      TIMESTAMPTZ DEFAULT NOW(),
    effective_to        TIMESTAMPTZ,
    is_current          BOOLEAN DEFAULT TRUE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one active override rule per target
CREATE UNIQUE INDEX idx_comm_rules_singleton ON commission_rules(COALESCE(category_id, 0), COALESCE(role_id, 0)) WHERE is_current = TRUE;

CREATE TABLE cap_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         INT NOT NULL REFERENCES user_roles(id) ON DELETE RESTRICT,
    cap_type        VARCHAR(20) NOT NULL,
    cap_basis       VARCHAR(30) NOT NULL,
    fixed_amount    NUMERIC(14,2),
    is_current      BOOLEAN DEFAULT TRUE,
    effective_from  TIMESTAMPTZ DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
-- Ensure one active cap rule per role and type
CREATE UNIQUE INDEX idx_cap_rules_singleton ON cap_rules(role_id, cap_type) WHERE is_current = TRUE;

CREATE TABLE bulk_pricing_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    businessman_id      UUID NOT NULL REFERENCES businessman_profiles(id) ON DELETE CASCADE,
    negotiated_price    NUMERIC(12,2) NOT NULL CHECK (negotiated_price >= 0),
    min_order_qty       NUMERIC(10,3) CHECK (min_order_qty >= 0),
    approved_by         UUID REFERENCES users(id),
    status              VARCHAR(20) DEFAULT 'pending',
    valid_from          TIMESTAMPTZ,
    valid_to            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_bulk_pricing_singleton ON bulk_pricing_rules(product_id, businessman_id) WHERE status = 'approved';

CREATE TABLE district_quota_config (
    id              SERIAL PRIMARY KEY,
    district_id     INT UNIQUE NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    max_core_body   SMALLINT NOT NULL DEFAULT 20,  -- Only for Type A + B, Dealer unlimited
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_rules (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name               VARCHAR(100) NOT NULL,
    sla_type                VARCHAR(50) NOT NULL,
    max_duration_hours      INT NOT NULL,
    penalty_action          VARCHAR(50),
    score_deduction         NUMERIC(5,2),
    is_active               BOOLEAN DEFAULT TRUE,
    created_by              UUID REFERENCES users(id),
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE minimum_inventory_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_point_id  UUID NOT NULL REFERENCES stock_point_profiles(id) ON DELETE CASCADE,
    min_total_value NUMERIC(14,2) CHECK (min_total_value >= 0),
    review_cycle    VARCHAR(20),
    set_by          UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fee_config (
    id              SERIAL PRIMARY KEY,
    fee_type        VARCHAR(50) UNIQUE NOT NULL,
    fee_value       NUMERIC(10,4) NOT NULL,
    value_type      VARCHAR(20),
    currency        VARCHAR(5) DEFAULT 'INR',
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE config_change_log (
    id              BIGSERIAL PRIMARY KEY,
    config_table    VARCHAR(100) NOT NULL,
    config_id       TEXT NOT NULL,
    field_changed   VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT,
    changed_by      UUID REFERENCES users(id),
    effective_from  TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 11: RISK, FRAUD & COMPLIANCE
-- =============================================================================

CREATE TABLE duplicate_detection_log (
    id                  BIGSERIAL PRIMARY KEY,
    detection_type      VARCHAR(30) NOT NULL,
    value_hash          TEXT NOT NULL,
    first_user_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    duplicate_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_taken        VARCHAR(50),
    reviewed_by         UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE device_fingerprint_log (
    id                  BIGSERIAL PRIMARY KEY,
    device_fingerprint  TEXT NOT NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_multi_account    BOOLEAN DEFAULT FALSE,
    account_count       SMALLINT DEFAULT 1,
    flagged             BOOLEAN DEFAULT FALSE,
    flag_reason         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suspicious_transaction_log (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    flag_type           VARCHAR(50) NOT NULL,
    detail              JSONB,
    risk_score          NUMERIC(5,2),
    auto_flagged        BOOLEAN DEFAULT TRUE,
    reviewed            BOOLEAN DEFAULT FALSE,
    reviewed_by         UUID REFERENCES users(id),
    review_action       VARCHAR(30),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fraud_case_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number         VARCHAR(50) UNIQUE NOT NULL,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    case_type           VARCHAR(50) NOT NULL,
    evidence            JSONB,
    status              VARCHAR(20) DEFAULT 'open',
    opened_by           UUID REFERENCES users(id),
    assigned_to         UUID REFERENCES users(id),
    resolution          TEXT,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_id        UUID REFERENCES users(id) ON DELETE RESTRICT,
    actor_role      VARCHAR(50),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       TEXT,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inactive_user_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_transaction_at TIMESTAMPTZ,
    inactive_days       INT,
    auto_flagged_at     TIMESTAMPTZ DEFAULT NOW(),
    action_taken        VARCHAR(30),
    action_by           UUID REFERENCES users(id),
    action_at           TIMESTAMPTZ
);

CREATE TABLE reactivation_log (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by        UUID REFERENCES users(id),
    approved_by         UUID REFERENCES users(id),
    reactivation_fee    NUMERIC(10,2) DEFAULT 0,
    reason              TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ
);

CREATE TABLE sla_breach_log (
    id                  BIGSERIAL PRIMARY KEY,
    order_sla_log_id    BIGINT NOT NULL REFERENCES order_sla_log(id) ON DELETE RESTRICT,
    stock_point_id      UUID REFERENCES stock_point_profiles(id) ON DELETE RESTRICT,
    sla_type            VARCHAR(50) NOT NULL,
    breach_duration_min INT,
    penalty_applied     VARCHAR(50),
    score_before        NUMERIC(5,2),
    score_after         NUMERIC(5,2),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core_body_limit_breach_log (
    id                  BIGSERIAL PRIMARY KEY,
    district_id         INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    attempted_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_count       SMALLINT NOT NULL,
    max_allowed         SMALLINT NOT NULL,
    attempted_by        UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- MODULE 12: REPORTING & NOTIFICATIONS
-- =============================================================================

CREATE TABLE financial_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type         VARCHAR(50) NOT NULL,
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    total_orders        INT DEFAULT 0,
    total_revenue       NUMERIC(16,2) DEFAULT 0,
    total_profit        NUMERIC(16,2) DEFAULT 0,
    trust_fund_total    NUMERIC(16,2) DEFAULT 0,
    reserve_fund_total  NUMERIC(16,2) DEFAULT 0,
    admin_earnings      NUMERIC(16,2) DEFAULT 0,
    core_body_earnings  NUMERIC(16,2) DEFAULT 0,
    referral_payouts    NUMERIC(16,2) DEFAULT 0,
    generated_by        UUID REFERENCES users(id),
    generated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE earnings_summary (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    period_type         VARCHAR(20) NOT NULL,
    period_label        VARCHAR(20) NOT NULL,
    total_earned        NUMERIC(14,2) DEFAULT 0,
    referral_earned     NUMERIC(14,2) DEFAULT 0,
    profit_earned       NUMERIC(14,2) DEFAULT 0,
    cap_hit             BOOLEAN DEFAULT FALSE,
    excess_to_reserve   NUMERIC(14,2) DEFAULT 0,
    snapshot_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_label)
);

CREATE TABLE notification_templates (
    id              SERIAL PRIMARY KEY,
    template_code   VARCHAR(100) UNIQUE NOT NULL,
    channel         VARCHAR(20) NOT NULL,
    language        VARCHAR(10) DEFAULT 'en',
    subject         TEXT,
    body            TEXT NOT NULL,
    variables       TEXT[],
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_queue (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient           VARCHAR(150) NOT NULL,
    channel             VARCHAR(20) NOT NULL,
    template_id         INT REFERENCES notification_templates(id),
    template_data       JSONB,
    rendered_body       TEXT,
    priority            SMALLINT DEFAULT 5,
    status              VARCHAR(20) DEFAULT 'queued',
    retry_count         SMALLINT DEFAULT 0,
    max_retries         SMALLINT DEFAULT 3,
    scheduled_at        TIMESTAMPTZ DEFAULT NOW(),
    sent_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_log (
    id                  BIGSERIAL PRIMARY KEY,
    queue_id            UUID NOT NULL REFERENCES notification_queue(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id),
    channel             VARCHAR(20) NOT NULL,
    recipient           VARCHAR(150) NOT NULL,
    status              VARCHAR(20) NOT NULL,
    provider_response   JSONB,
    sent_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_log (
    id                  BIGSERIAL PRIMARY KEY,
    queue_id            UUID REFERENCES notification_queue(id) ON DELETE CASCADE,
    to_email            VARCHAR(150) NOT NULL,
    subject             TEXT,
    body_preview        TEXT,
    provider            VARCHAR(50),
    message_id          TEXT,
    status              VARCHAR(20),
    opened_at           TIMESTAMPTZ,
    clicked_at          TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sms_log (
    id              BIGSERIAL PRIMARY KEY,
    queue_id        UUID REFERENCES notification_queue(id) ON DELETE CASCADE,
    to_phone        VARCHAR(15) NOT NULL,
    message_body    TEXT,
    provider        VARCHAR(50),
    message_id      TEXT,
    status          VARCHAR(20),
    delivered_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE push_notification_log (
    id              BIGSERIAL PRIMARY KEY,
    queue_id        UUID REFERENCES notification_queue(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    device_token    TEXT,
    title           TEXT,
    body            TEXT,
    data_payload    JSONB,
    provider        VARCHAR(50),
    status          VARCHAR(20),
    opened_at       TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_type   VARCHAR(50) NOT NULL,
    period_label    VARCHAR(30),
    data            JSONB NOT NULL,
    checksum        TEXT,
    generated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- INDEXES (Critical performance indexes)
-- =============================================================================

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_user_sessions_user_panel ON user_sessions(user_id, panel);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_otp_target ON otp_verifications(target, target_type, purpose);

CREATE INDEX idx_districts_state ON districts(state_id);

CREATE INDEX idx_core_body_district ON core_body_profiles(district_id);
CREATE INDEX idx_businessman_district ON businessman_profiles(district_id);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);

CREATE INDEX idx_inventory_ledger_entity ON inventory_ledger(entity_type, entity_id);
CREATE INDEX idx_inventory_ledger_product ON inventory_ledger(product_id);
CREATE INDEX idx_inventory_balances_entity ON inventory_balances(entity_type, entity_id);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_district ON orders(district_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_fulfillment_order ON fulfillment_assignments(order_id);

CREATE INDEX idx_distribution_log_order ON profit_distribution_log(order_id);
CREATE INDEX idx_distribution_line_items ON distribution_line_items(distribution_id);
CREATE INDEX idx_cap_log_user_period ON cap_enforcement_log(user_id, period_label);

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallet_txn_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_txn_created ON wallet_transactions(created_at DESC);
CREATE INDEX idx_withdrawal_user ON withdrawal_requests(user_id, status);

CREATE INDEX idx_referral_registrations_referrer ON referral_registrations(referrer_id);
CREATE INDEX idx_referral_earnings_referrer ON referral_earnings(referrer_id, status);
CREATE INDEX idx_referral_earnings_order ON referral_earnings(order_id);

CREATE INDEX idx_system_config_key ON system_config(config_key);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_suspicious_txn_user ON suspicious_transaction_log(user_id);
CREATE INDEX idx_suspicious_txn_order ON suspicious_transaction_log(order_id);

CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_at);
CREATE INDEX idx_notification_log_queue ON notification_log(queue_id);
CREATE INDEX idx_earnings_summary_user ON earnings_summary(user_id, period_type, period_label);


-- =============================================================================
-- IMMUTABILITY TRIGGERS (FINANCIAL SAFEGUARDS)
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Modification [UPDATE/DELETE] is strictly prohibited for financial and audit ledgers.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_inv_ledger_mod BEFORE UPDATE OR DELETE ON inventory_ledger FOR EACH ROW EXECUTE FUNCTION prevent_modification();
CREATE TRIGGER prevent_wallet_txn_mod BEFORE UPDATE OR DELETE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION prevent_modification();
CREATE TRIGGER prevent_profit_dist_mod BEFORE UPDATE OR DELETE ON profit_distribution_log FOR EACH ROW EXECUTE FUNCTION prevent_modification();
CREATE TRIGGER prevent_audit_log_mod BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION prevent_modification();
CREATE TRIGGER prevent_price_history_mod BEFORE UPDATE OR DELETE ON price_history FOR EACH ROW EXECUTE FUNCTION prevent_modification();


-- =============================================================================
-- SEED: Essential Reference Data
-- =============================================================================

INSERT INTO user_roles (role_code, role_label, description) VALUES
('admin',           'Admin / Company',         'Central control authority'),
('core_body_a',     'Core Body Type A',        'Senior district-level authority, ₹1L investment'),
('core_body_b',     'Core Body Type B',        'District-level authority, ₹50K–₹2.5L investment'),
('dealer',          'Dealer',                  'Sub-role under Core Body, category specialist'),
('businessman',     'Businessman',             'Retail, advance, bulk seller'),
('customer',        'Customer',                'End marketplace buyer');

INSERT INTO wallet_types (type_code, label, description) VALUES
('main',      'Main Wallet',        'Primary earnings and spending wallet'),
('referral',  'Referral Wallet',    'Holds referral commission earnings'),
('trust',     'Trust Fund Wallet',  'Platform trust fund (Admin-managed)'),
('reserve',   'Reserve Fund Wallet','Company reserve fund (Admin-managed)');

INSERT INTO countries (name, iso_code) VALUES ('India', 'IN');

INSERT INTO system_config (config_key, config_value, value_type, description) VALUES
('min_withdrawal_amount',       '500',      'number',  'Minimum withdrawal threshold in INR'),
('withdrawal_processing_fee',   '2.5',      'number',  'Withdrawal processing fee in %'),
('tds_rate_pct',                '10',       'number',  'TDS rate on wallet withdrawal in %'),
('core_body_max_per_district',  '20',       'number',  'Maximum Core Body Type A+B per district (Dealer unlimited)'),
('return_window_days',          '7',        'number',  'Default order return window in days'),
('inactive_threshold_days',     '90',       'number',  'Days of no transaction before flagged inactive');

INSERT INTO profit_rules (channel, rule_name, fts_share_pct, referral_share_pct, trust_fund_pct, admin_pct,
    company_pct, core_body_pool_pct, company_reserve_pct, stock_point_pct, referral_pct) VALUES
('B2B', 'Default B2B Rule',  55, 45, 10, 1,  NULL, 70, 30, NULL, NULL),
('B2C', 'Default B2C Rule',  NULL, NULL, 10, 1, 10, NULL, NULL, 40, 60);

-- =============================================================================
-- END OF FTS COMPLETE SCHEMA (HARDENED)
-- =============================================================================
