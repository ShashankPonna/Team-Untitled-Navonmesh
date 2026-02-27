-- ═══════════════════════════════════════════════════════════════════════════════
-- OptiStock AI - Users Table (Add-on)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'store_manager', 'viewer')),
  location   TEXT DEFAULT 'All Locations',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
DROP TRIGGER IF EXISTS trg_app_users_updated ON app_users;
CREATE TRIGGER trg_app_users_updated BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for now" ON app_users;
CREATE POLICY "Allow all for now" ON app_users FOR ALL USING (true) WITH CHECK (true);

-- Seed default users
INSERT INTO app_users (name, email, role, location) VALUES
  ('John Admin',     'john@acmecorp.com',  'admin',         'All Locations'),
  ('Sarah Manager',  'sarah@acmecorp.com', 'store_manager', 'Downtown Store'),
  ('Mike Inventory', 'mike@acmecorp.com',  'store_manager', 'Mall Central'),
  ('Lisa Warehouse', 'lisa@acmecorp.com',  'store_manager', 'Warehouse A')
ON CONFLICT (email) DO NOTHING;
