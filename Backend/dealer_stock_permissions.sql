-- Dealer Stock Issue Permission Table
-- Admin grants/revokes permission for a Dealer to issue stock (B2B only, to Businessman)

CREATE TABLE IF NOT EXISTS dealer_stock_permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id   UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    granted_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_active   BOOLEAN DEFAULT TRUE,
    granted_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dealer_stock_permissions_dealer ON dealer_stock_permissions(dealer_id, is_active);
