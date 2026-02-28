-- ─── Business Config Table ────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- This creates the missing business_config table used by Settings → Business tab.

CREATE TABLE IF NOT EXISTS business_config (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'multi_store'
               CHECK (type IN ('single_store', 'multi_store', 'warehouse_model', 'enterprise')),
  email      TEXT NOT NULL DEFAULT '',
  timezone   TEXT NOT NULL DEFAULT 'ist',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)   -- one config row per user
);

-- Updated_at trigger
CREATE TRIGGER trg_business_config_updated
  BEFORE UPDATE ON business_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_config_user ON business_config(user_id);

-- Row Level Security
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_business_config"
  ON business_config
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
