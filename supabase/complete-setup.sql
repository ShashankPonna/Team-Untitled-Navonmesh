-- ═══════════════════════════════════════════════════════════════════════════════
-- OptiStock AI — Complete Setup (Multi-Tenant, Fresh Start)
-- Use this if you are setting up a BRAND NEW Supabase project.
-- Replaces: schema.sql + migration-multi-tenant.sql + patch-app-users.sql
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Drop existing tables (clean slate) ──────────────────────────────────────
DROP TABLE IF EXISTS sales             CASCADE;
DROP TABLE IF EXISTS demand_forecasts  CASCADE;
DROP TABLE IF EXISTS alerts            CASCADE;
DROP TABLE IF EXISTS transfers         CASCADE;
DROP TABLE IF EXISTS inventory         CASCADE;
DROP TABLE IF EXISTS products          CASCADE;
DROP TABLE IF EXISTS categories        CASCADE;
DROP TABLE IF EXISTS locations         CASCADE;
DROP TABLE IF EXISTS business_config   CASCADE;
DROP TABLE IF EXISTS app_users         CASCADE;

-- ─── Locations ───────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('store', 'warehouse')),
  city       TEXT NOT NULL,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ──────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, name)  -- unique per user, not globally
);

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sku            TEXT NOT NULL,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  cost_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  perishable     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, sku)   -- unique per user, not globally
);

-- ─── Inventory ───────────────────────────────────────────────────────────────
CREATE TABLE inventory (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  current_stock  INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  reorder_point  INTEGER NOT NULL DEFAULT 10,
  status         TEXT NOT NULL DEFAULT 'good' CHECK (status IN ('critical', 'warning', 'good', 'overstock', 'expiring')),
  expiry_date    DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id, location_id)
);

-- ─── Transfers ───────────────────────────────────────────────────────────────
CREATE TABLE transfers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity         INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Alerts ──────────────────────────────────────────────────────────────────
CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('reorder', 'transfer', 'expiry', 'stockout', 'overstock', 'supplier_delay')),
  severity     TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id  UUID REFERENCES locations(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Demand Forecasts ────────────────────────────────────────────────────────
CREATE TABLE demand_forecasts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,
  date             DATE NOT NULL,
  actual_demand    INTEGER,
  predicted_demand INTEGER NOT NULL,
  lower_bound      INTEGER NOT NULL,
  upper_bound      INTEGER NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Sales ───────────────────────────────────────────────────────────────────
CREATE TABLE sales (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL,
  revenue     NUMERIC(12,2) NOT NULL DEFAULT 0,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── App Users (team members per account) ────────────────────────────────────
CREATE TABLE app_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'store_manager', 'viewer')),
  location   TEXT DEFAULT 'All Locations',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_id, email)
);

-- ─── Business Config (one row per user) ──────────────────────────────────────
CREATE TABLE business_config (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'multi_store'
               CHECK (type IN ('single_store', 'multi_store', 'warehouse_model', 'enterprise')),
  email      TEXT NOT NULL DEFAULT '',
  timezone   TEXT NOT NULL DEFAULT 'ist',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─── Updated_at trigger function ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_locations_updated      BEFORE UPDATE ON locations       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated       BEFORE UPDATE ON products        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated      BEFORE UPDATE ON inventory       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transfers_updated      BEFORE UPDATE ON transfers       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_app_users_updated      BEFORE UPDATE ON app_users       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_business_config_updated BEFORE UPDATE ON business_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_inventory_user     ON inventory(user_id);
CREATE INDEX idx_inventory_product  ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_status   ON inventory(status);
CREATE INDEX idx_transfers_user     ON transfers(user_id);
CREATE INDEX idx_transfers_status   ON transfers(status);
CREATE INDEX idx_alerts_user        ON alerts(user_id);
CREATE INDEX idx_alerts_severity    ON alerts(severity);
CREATE INDEX idx_sales_user         ON sales(user_id);
CREATE INDEX idx_sales_date         ON sales(date);
CREATE INDEX idx_demand_user        ON demand_forecasts(user_id);
CREATE INDEX idx_demand_date        ON demand_forecasts(date);
CREATE INDEX idx_business_config_user ON business_config(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_locations"        ON locations        FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_categories"       ON categories       FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_products"         ON products         FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_inventory"        ON inventory        FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_transfers"        ON transfers        FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_alerts"           ON alerts           FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_demand_forecasts"  ON demand_forecasts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_sales"            ON sales            FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_app_users"        ON app_users        FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own_business_config"  ON business_config  FOR ALL USING (auth.uid() = user_id)  WITH CHECK (auth.uid() = user_id);

-- ─── Trigger: no auto-seed — users add their own real data ───────────────────
-- New users start with an empty workspace and fill it themselves.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
