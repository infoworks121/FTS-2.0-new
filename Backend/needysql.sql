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
