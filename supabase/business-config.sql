-- Run this in your Supabase SQL Editor to add the business_config table.
-- It stores one config row per user and is protected by RLS.

CREATE TABLE IF NOT EXISTS business_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL DEFAULT 'multi_store',
  email       TEXT NOT NULL DEFAULT '',
  timezone    TEXT NOT NULL DEFAULT 'ist',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_business_config" ON business_config;
CREATE POLICY "own_business_config"
  ON business_config FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
