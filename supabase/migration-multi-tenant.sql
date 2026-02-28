-- ═══════════════════════════════════════════════════════════════════════════════
-- OptiStock AI - Multi-Tenant Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This replaces the old "Allow all for now" policies with per-user isolation.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Drop old permissive policies ────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all for now" ON locations;
DROP POLICY IF EXISTS "Allow all for now" ON categories;
DROP POLICY IF EXISTS "Allow all for now" ON products;
DROP POLICY IF EXISTS "Allow all for now" ON inventory;
DROP POLICY IF EXISTS "Allow all for now" ON transfers;
DROP POLICY IF EXISTS "Allow all for now" ON alerts;
DROP POLICY IF EXISTS "Allow all for now" ON demand_forecasts;
DROP POLICY IF EXISTS "Allow all for now" ON sales;

-- ─── 2. Add user_id to all data tables ──────────────────────────────────────
ALTER TABLE locations       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE categories      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE products        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE inventory       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transfers       ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE alerts          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE demand_forecasts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE sales            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── 3. Create strict per-user RLS policies ──────────────────────────────────
CREATE POLICY "Users see own locations"       ON locations        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own categories"      ON categories       FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own products"        ON products         FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own inventory"       ON inventory        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own transfers"       ON transfers        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own alerts"          ON alerts           FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own demand forecasts" ON demand_forecasts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own sales"           ON sales            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── 4. Auto-seed function: runs when a new user signs up ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  loc_downtown    UUID := uuid_generate_v4();
  loc_mall        UUID := uuid_generate_v4();
  loc_airport     UUID := uuid_generate_v4();
  loc_suburb      UUID := uuid_generate_v4();
  loc_warehouse   UUID := uuid_generate_v4();

  cat_electronics UUID := uuid_generate_v4();
  cat_clothing    UUID := uuid_generate_v4();
  cat_food        UUID := uuid_generate_v4();
  cat_home        UUID := uuid_generate_v4();
  cat_sports      UUID := uuid_generate_v4();
  cat_beauty      UUID := uuid_generate_v4();
  cat_accessories UUID := uuid_generate_v4();

  prod_macbook    UUID := uuid_generate_v4();
  prod_airpods    UUID := uuid_generate_v4();
  prod_usbhub     UUID := uuid_generate_v4();
  prod_milk       UUID := uuid_generate_v4();
  prod_shoes      UUID := uuid_generate_v4();
  prod_tv         UUID := uuid_generate_v4();
  prod_cases      UUID := uuid_generate_v4();
  prod_mouse      UUID := uuid_generate_v4();

  uid UUID := NEW.id;
BEGIN

  -- Locations
  INSERT INTO locations (id, name, type, city, user_id) VALUES
    (loc_downtown,  'Downtown',     'store',     'New York',    uid),
    (loc_mall,      'Mall Central', 'store',     'Los Angeles', uid),
    (loc_airport,   'Airport',      'store',     'Chicago',     uid),
    (loc_suburb,    'Suburb East',  'store',     'Houston',     uid),
    (loc_warehouse, 'Warehouse A',  'warehouse', 'Dallas',      uid);

  -- Categories
  INSERT INTO categories (id, name, user_id) VALUES
    (cat_electronics, 'Electronics',  uid),
    (cat_clothing,    'Clothing',     uid),
    (cat_food,        'Food',         uid),
    (cat_home,        'Home',         uid),
    (cat_sports,      'Sports',       uid),
    (cat_beauty,      'Beauty',       uid),
    (cat_accessories, 'Accessories',  uid);

  -- Products
  INSERT INTO products (id, name, sku, category_id, cost_price, selling_price, lead_time_days, perishable, user_id) VALUES
    (prod_macbook, 'MacBook Pro 14"',      CONCAT('ELEC-001-', LEFT(uid::TEXT,8)), cat_electronics, 1499.00, 1999.00, 7,  FALSE, uid),
    (prod_airpods, 'AirPods Pro',          CONCAT('ELEC-002-', LEFT(uid::TEXT,8)), cat_electronics,  189.00,  249.00, 5,  FALSE, uid),
    (prod_usbhub,  'USB-C Hub',            CONCAT('ELEC-003-', LEFT(uid::TEXT,8)), cat_electronics,   29.00,   49.00, 3,  FALSE, uid),
    (prod_milk,    'Organic Milk 1L',      CONCAT('FOOD-001-', LEFT(uid::TEXT,8)), cat_food,           3.50,    5.99, 2,  TRUE,  uid),
    (prod_shoes,   'Nike Air Max',         CONCAT('SPRT-001-', LEFT(uid::TEXT,8)), cat_sports,        89.00,  149.00, 14, FALSE, uid),
    (prod_tv,      'Samsung TV 65"',       CONCAT('ELEC-004-', LEFT(uid::TEXT,8)), cat_electronics,  799.00, 1299.00, 10, FALSE, uid),
    (prod_cases,   'Phone Cases Assorted', CONCAT('ACCS-001-', LEFT(uid::TEXT,8)), cat_accessories,    5.00,   19.99, 7,  FALSE, uid),
    (prod_mouse,   'Wireless Mouse',       CONCAT('ELEC-005-', LEFT(uid::TEXT,8)), cat_electronics,   19.00,   39.99, 4,  FALSE, uid);

  -- Inventory
  INSERT INTO inventory (product_id, location_id, current_stock, reserved_stock, reorder_point, status, expiry_date, user_id) VALUES
    (prod_macbook, loc_downtown,  5,   2,  15, 'critical',  NULL,         uid),
    (prod_airpods, loc_mall,      12,  3,  20, 'warning',   NULL,         uid),
    (prod_usbhub,  loc_airport,   45,  5,  30, 'good',      NULL,         uid),
    (prod_milk,    loc_suburb,    120, 0,  50, 'expiring',  (NOW() + INTERVAL '3 days')::DATE, uid),
    (prod_shoes,   loc_downtown,  85, 10,  25, 'good',      NULL,         uid),
    (prod_tv,      loc_warehouse, 200,15,  30, 'overstock', NULL,         uid),
    (prod_cases,   loc_warehouse, 540,20, 100, 'overstock', NULL,         uid),
    (prod_mouse,   loc_airport,   8,  1,  15, 'warning',   NULL,         uid);

  -- Transfers
  INSERT INTO transfers (product_id, from_location_id, to_location_id, quantity, status, user_id) VALUES
    (prod_airpods, loc_warehouse, loc_mall,     80,  'in_transit', uid),
    (prod_usbhub,  loc_warehouse, loc_airport,  50,  'completed',  uid),
    (prod_cases,   loc_warehouse, loc_downtown, 100, 'pending',    uid),
    (prod_shoes,   loc_downtown,  loc_suburb,   20,  'completed',  uid),
    (prod_mouse,   loc_warehouse, loc_airport,  30,  'in_transit', uid);

  -- Alerts
  INSERT INTO alerts (type, severity, product_id, location_id, message, user_id) VALUES
    ('reorder',        'high',   prod_macbook, loc_downtown,  'Stock below reorder point. Current: 5, ROP: 15. Suggested order: 50 units.', uid),
    ('transfer',       'medium', prod_airpods, loc_mall,      'Surplus at Warehouse A (200 units). Transfer 80 to Mall Central recommended.', uid),
    ('expiry',         'high',   prod_milk,    loc_suburb,    '48 units expiring in 3 days. Suggest 25% discount for clearance.',           uid),
    ('stockout',       'high',   prod_usbhub,  loc_airport,   'Predicted stockout in 2 days. Lead time is 5 days. Expedite order.',         uid),
    ('overstock',      'low',    prod_cases,   loc_warehouse, '180 days of inventory on hand. Consider redistribution or promotion.',       uid),
    ('supplier_delay', 'medium', prod_tv,      loc_downtown,  'Supplier delivery delayed by 7 days. New ETA: Mar 15. Adjust ROP.',          uid);

  -- Demand Forecasts
  INSERT INTO demand_forecasts (category, date, actual_demand, predicted_demand, lower_bound, upper_bound, user_id) VALUES
    ('all', '2026-01-01', 4200, 4050, 3700, 4400, uid),
    ('all', '2026-02-01', 3800, 3900, 3500, 4300, uid),
    ('all', '2026-03-01', 5100, 4850, 4400, 5300, uid),
    ('all', '2026-04-01', 4700, 4800, 4300, 5300, uid),
    ('all', '2026-05-01', 5500, 5350, 4900, 5800, uid),
    ('all', '2026-06-01', 6200, 5900, 5400, 6400, uid),
    ('all', '2026-07-01', NULL, 6300, 5700, 6900, uid),
    ('all', '2026-08-01', NULL, 6800, 6100, 7500, uid),
    ('all', '2026-09-01', NULL, 5900, 5200, 6600, uid);

  -- Sales (last 2 months)
  INSERT INTO sales (product_id, location_id, quantity, revenue, date, user_id) VALUES
    (prod_macbook, loc_downtown,  25,  49975.00, '2026-01-15', uid),
    (prod_macbook, loc_downtown,  30,  59970.00, '2026-02-15', uid),
    (prod_shoes,   loc_downtown,  40,   5960.00, '2026-01-15', uid),
    (prod_shoes,   loc_downtown,  55,   8195.00, '2026-02-15', uid),
    (prod_airpods, loc_mall,     150,  37350.00, '2026-01-15', uid),
    (prod_airpods, loc_mall,     180,  44820.00, '2026-02-15', uid),
    (prod_usbhub,  loc_airport,  200,   9800.00, '2026-01-15', uid),
    (prod_mouse,   loc_airport,   80,   3199.20, '2026-02-15', uid),
    (prod_milk,    loc_suburb,   500,   2995.00, '2026-01-15', uid),
    (prod_milk,    loc_suburb,   450,   2695.50, '2026-02-15', uid),
    (prod_tv,      loc_warehouse, 50,  64950.00, '2026-01-15', uid),
    (prod_cases,   loc_warehouse,200,   3998.00, '2026-02-15', uid);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 5. Attach trigger to auth.users ─────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
