-- ═══════════════════════════════════════════════════════════════════════════════
-- OptiStock AI - Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Locations ──────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('store', 'warehouse')),
  city       TEXT NOT NULL,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ─────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ───────────────────────────────────────────────────────────────
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  sku            TEXT NOT NULL UNIQUE,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  cost_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  perishable     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Inventory (stock per product per location) ─────────────────────────────
CREATE TABLE inventory (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id    UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  current_stock  INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  reorder_point  INTEGER NOT NULL DEFAULT 10,
  status         TEXT NOT NULL DEFAULT 'good' CHECK (status IN ('critical', 'warning', 'good', 'overstock', 'expiring')),
  expiry_date    DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- ─── Transfers ──────────────────────────────────────────────────────────────
CREATE TABLE transfers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity         INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Alerts ─────────────────────────────────────────────────────────────────
CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT NOT NULL CHECK (type IN ('reorder', 'transfer', 'expiry', 'stockout', 'overstock', 'supplier_delay')),
  severity     TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id  UUID REFERENCES locations(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Demand Forecasts ───────────────────────────────────────────────────────
CREATE TABLE demand_forecasts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category         TEXT NOT NULL,
  date             DATE NOT NULL,
  actual_demand    INTEGER,
  predicted_demand INTEGER NOT NULL,
  lower_bound      INTEGER NOT NULL,
  upper_bound      INTEGER NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Sales ──────────────────────────────────────────────────────────────────
CREATE TABLE sales (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL,
  revenue     NUMERIC(12,2) NOT NULL DEFAULT 0,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes for performance ────────────────────────────────────────────────
CREATE INDEX idx_inventory_product   ON inventory(product_id);
CREATE INDEX idx_inventory_location  ON inventory(location_id);
CREATE INDEX idx_inventory_status    ON inventory(status);
CREATE INDEX idx_transfers_status    ON transfers(status);
CREATE INDEX idx_transfers_from      ON transfers(from_location_id);
CREATE INDEX idx_transfers_to        ON transfers(to_location_id);
CREATE INDEX idx_alerts_type         ON alerts(type);
CREATE INDEX idx_alerts_severity     ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_sales_date          ON sales(date);
CREATE INDEX idx_sales_product       ON sales(product_id);
CREATE INDEX idx_demand_date         ON demand_forecasts(date);

-- ─── Updated_at trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_locations_updated  BEFORE UPDATE ON locations  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated  BEFORE UPDATE ON inventory  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transfers_updated  BEFORE UPDATE ON transfers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security (prepare for auth later) ───────────────────────────
ALTER TABLE locations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales           ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (will restrict with NextAuth later)
CREATE POLICY "Allow all for now" ON locations       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON categories      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON products        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON inventory       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON transfers       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON alerts          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON demand_forecasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON sales           FOR ALL USING (true) WITH CHECK (true);
