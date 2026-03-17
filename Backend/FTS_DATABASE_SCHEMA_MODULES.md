# FTS Platform — Database Schema Module Groups

> **Platform:** Farm & Tech Service (FTS)
> **Purpose:** Backend PostgreSQL schema — module grouping plan before table-level design
> **Total Module Groups:** 12

---

## Overview

The FTS database schema is divided into **12 logical grouping modules**. Each module is a self-contained namespace of tables that can be developed, scaled, and maintained independently. Together they form the complete data layer of the platform.

---

## Module 1 — 🔐 Identity & Authentication

> Covers all user identity, login, session, device tracking, and multi-panel access control.

**Belongs to:** All panels (Admin, Core Body, Businessman, Customer)

**Key Entities:**
- `users` — Unified identity table (role-tagged)
- `user_roles` — Role definitions (admin, core_body_a, core_body_b, dealer, businessman, customer)
- `user_sessions` — Active sessions, panel identifier, token, expiry
- `user_devices` — Device fingerprint tracking for fraud prevention
- `otp_verifications` — Phone / email OTP log
- `kyc_documents` — PAN, Aadhaar, photo links and verification status
- `kyc_audit_log` — Immutable KYC change history
- `login_attempts` — Brute-force and anomaly detection log

---

## Module 2 — 🌍 Geography & District Structure

> Manages the district-level hierarchical expansion model.

**Belongs to:** Admin Panel, Core Body Panel

**Key Entities:**
- `countries`
- `states`
- `districts`
- `cities` / `pincodes`
- `district_quota` — Max Core Body limit per district (default: 20)
- `district_coverage_map` — Which Core Body / Stock Point covers which area

---

## Module 3 — 👥 Role-Specific Profiles

> Extended profile data for each business role beyond base user identity.

**Belongs to:** Core Body Panel, Businessman Panel

**Key Entities:**
- `core_body_profiles` — Investment amount, type (A/B), district assignment, installment plan, activation status
- `core_body_installments` — Installment schedule & payment records
- `businessman_profiles` — Mode (Entry / Advance / Bulk), stock point flag, assigned district
- `stock_point_profiles` — Minimum inventory requirement, SLA status, performance score
- `dealer_profiles` — Category specialization, parent Core Body reference
- `upgrade_demotion_log` — Immutable record of all role changes

---

## Module 4 — 🛒 Product & Service Catalog

> Complete product/service catalog with multi-category support and pricing rules.

**Belongs to:** Admin Panel (management), All panels (read)

**Key Entities:**
- `categories` — Multi-level (Agriculture, FMCG, Digital, Services, etc.)
- `sub_categories`
- `products` — Name, SKU, description, images, unit, type (physical/digital/service)
- `product_variants` — Size, weight, pack type
- `product_pricing` — Base price, MRP, admin margin
- `service_catalog` — Service type products with subscription flags
- `subscription_plans` — Duration, billing cycle, pricing
- `price_history` — Audit of price changes (immutable)

---

## Module 5 — 📦 Inventory & Stock Management

> Tracks physical stock movement across Admin warehouse, Core Body, and Stock Points.

**Belongs to:** Admin Panel, Core Body Panel, Businessman Panel

**Key Entities:**
- `inventory_ledger` — Master stock ledger (immutable, append-only)
- `stock_allocations` — Admin → Core Body → Stock Point stock issuance
- `stock_point_inventory` — Current live stock at each Stock Point
- `stock_requests` — Restock requests raised by Stock Points
- `stock_movement_log` — Every inward/outward movement with reason code
- `minimum_inventory_rules` — Admin-defined minimum stock thresholds per Stock Point

---

## Module 6 — 🛍️ Orders & Fulfillment

> Handles B2B and B2C order lifecycle from placement to delivery.

**Belongs to:** Customer Panel, Businessman Panel, Admin Panel

**Key Entities:**
- `orders` — Master order record (B2B / B2C tagged)
- `order_items` — Line items per order
- `order_status_log` — Immutable status timeline
- `fulfillment_assignments` — Which Stock Point / Businessman fulfils the order
- `fulfillment_rule_log` — Why a particular fulfiller was selected (rule trace)
- `delivery_tracking` — Logistics status
- `return_requests` — Return/refund initiation
- `return_status_log` — Return lifecycle tracking
- `complaints` — Customer complaints & resolution status
- `order_sla_log` — SLA breach detection for Stock Points

---

## Module 7 — 💸 Profit Distribution Engine

> The financial core. Handles all automated profit splits based on dynamic rules.

**Belongs to:** Admin Panel (config), Backend Engine (execution)

**Key Entities:**
- `profit_rules` — Master rule table (B2B / B2C, dynamic percentages, effective date)
- `profit_rule_history` — Immutable archive of past rules
- `profit_distribution_log` — Per-order distribution record (immutable ledger)
- `distribution_line_items` — Breakdown: Trust Fund %, Admin %, Company %, Core Body %, Referral %
- `company_pool_log` — Core Body pool allocation records
- `reserve_fund_log` — Company Reserve Fund credits/debits
- `trust_fund_log` — Trust Fund credits/debits
- `cap_enforcement_log` — Earning cap hits and excess routed to Company Reserve

**Rule Configuration Fields (in `profit_rules`):**
| Channel | Field | Default |
|---------|-------|---------|
| B2B | `fts_share_pct` | 55% |
| B2B | `referral_share_pct` | 45% |
| B2B | `trust_fund_pct` | 10% |
| B2B | `admin_pct` | 1% |
| B2B | `core_body_pool_pct` | 70% |
| B2B | `company_reserve_pct` | 30% |
| B2C | `trust_fund_pct` | 10% |
| B2C | `admin_pct` | 1% |
| B2C | `company_pct` | 10% |
| B2C | `stock_point_pct` | 40% |
| B2C | `referral_pct` | 60% |

---

## Module 8 — 👛 Wallet System

> Multi-wallet architecture for every user role with immutable ledger entries.

**Belongs to:** All Panels

**Key Entities:**
- `wallets` — One per user per wallet type
- `wallet_types` — (Main, Referral, Trust, Reserve Fund)
- `wallet_transactions` — Immutable double-entry ledger (credit/debit, source reference)
- `withdrawal_requests` — User-initiated withdrawal
- `withdrawal_approvals` — Admin approval workflow
- `withdrawal_tds_log` — TDS deduction records as per law
- `processing_fee_log` — Platform fee on withdrawals
- `wallet_balance_snapshot` — Periodic snapshots for audit reconciliation

**Wallet Rules:**
- Minimum withdrawal threshold — dynamic (stored in `system_config`)
- Manual Admin approval required
- TDS auto-calculated and logged
- All entries immutable (no UPDATE/DELETE on transaction rows)

---

## Module 9 — 🔗 Referral System

> Single-level referral tracking with anti-fraud logic.

**Belongs to:** All Panels

**Key Entities:**
- `referral_links` — Unique referral code per user
- `referral_registrations` — Who referred whom (single-level enforced by DB constraint)
- `referral_earnings` — Pending / confirmed referral payouts
- `referral_payout_log` — Final settled payouts (triggered after return window closure)
- `referral_reversal_log` — Reversals due to returns/refunds
- `suspicious_referral_log` — Flagged referral activities

**Constraints:**
- No self-referral chain beyond 1 level (enforced by `referral_registrations.depth = 1` constraint)
- Self-purchase allowed (referral still credited to own code)
- Payout locked until `order.return_window_closed = true`

---

## Module 10 — ⚙️ System Configuration & Rule Engine

> Central configuration store for all dynamic platform rules and thresholds.

**Belongs to:** Admin Panel

**Key Entities:**
- `system_config` — Key-value store for all dynamic settings
- `commission_rules` — Per-category, per-role commission overrides
- `cap_rules` — Earning cap per role (Core Body A: ₹25L/year, Core Body B: Investment amount/month)
- `bulk_pricing_rules` — Negotiated pricing rules (requires Admin approval)
- `district_quota_config` — Max Core Body per district (default 20)
- `sla_rules` — SLA thresholds for Stock Points
- `minimum_inventory_config` — Per Stock Point minimum inventory settings
- `fee_config` — Withdrawal fees, processing fees
- `config_change_log` — Immutable log of all config changes with effective date

---

## Module 11 — 🚨 Risk, Fraud & Compliance

> Fraud detection, duplicate prevention, audit trails, and compliance records.

**Belongs to:** Admin Panel

**Key Entities:**
- `duplicate_detection_log` — Aadhaar/PAN duplication flags
- `device_fingerprint_log` — Multi-account detection via device
- `suspicious_transaction_log` — Auto-flagged suspicious orders
- `fraud_case_log` — Manual fraud investigations
- `audit_log` — Immutable system-wide audit trail (all critical actions)
- `inactive_user_log` — Users inactive beyond threshold (90 days for Core Body)
- `reactivation_log` — Reactivation history
- `sla_breach_log` — Stock Point SLA breach records
- `core_body_limit_breach_log` — Attempt to exceed 20 Core Body per district

---

## Module 12 — 📊 Reporting & Notifications

> Reporting aggregation, notifications, and communication logs.

**Belongs to:** Admin Panel, All Panels (read)

**Key Entities:**
- `financial_reports` — Pre-aggregated ledger summaries per period
- `earnings_summary` — Per-user earning summary snapshots
- `notification_queue` — Outbound SMS / Email / Push notifications
- `notification_log` — Delivery status log
- `notification_templates` — Dynamic message templates (multi-language ready)
- `email_log`
- `sms_log`
- `push_notification_log`
- `report_snapshots` — Frozen point-in-time reports for compliance

---

## Summary Table

| # | Module Name | Primary Panel | Approx. Tables |
|---|-------------|--------------|---------------|
| 1 | Identity & Authentication | All | ~8 |
| 2 | Geography & District Structure | Admin, Core Body | ~6 |
| 3 | Role-Specific Profiles | Core Body, Businessman | ~6 |
| 4 | Product & Service Catalog | Admin + All (read) | ~8 |
| 5 | Inventory & Stock Management | Admin, Core Body, Businessman | ~6 |
| 6 | Orders & Fulfillment | Customer, Businessman, Admin | ~10 |
| 7 | Profit Distribution Engine | Backend Engine | ~9 |
| 8 | Wallet System | All | ~8 |
| 9 | Referral System | All | ~6 |
| 10 | System Configuration & Rule Engine | Admin | ~9 |
| 11 | Risk, Fraud & Compliance | Admin | ~9 |
| 12 | Reporting & Notifications | Admin + All (read) | ~9 |
| | **TOTAL** | | **~94 tables** |

---

## Design Principles

1. **Immutability** — Financial ledgers (`wallet_transactions`, `profit_distribution_log`, `audit_log`) are append-only. No UPDATE or DELETE.
2. **Dynamic Rules** — All percentages live in `profit_rules` and `system_config`. Only new transactions pick up new rules.
3. **Cap Enforcement** — Done at application layer, logged in `cap_enforcement_log`.
4. **District Limit** — Max 20 Core Body per district enforced via `district_quota` + application-level check.
5. **Single-Level Referral** — Enforced by DB constraint on `referral_registrations`.
6. **Role Separation** — One `users` table. Role-specific details in separate profile tables.
7. **Scalability** — Modular design allows adding new categories, states, product types without schema restructuring.
8. **Audit-First** — Every critical action (config change, role change, fraud flag, withdrawal) has a dedicated log table.

---

*Next Step: Define individual table schemas (columns, types, constraints, indexes) for each module.*
