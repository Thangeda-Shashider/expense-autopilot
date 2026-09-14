-- Migration 002: Add link_code + expiry to profiles for Telegram linking
-- Run in: Supabase Dashboard > SQL Editor

-- link_code: random token shown in dashboard, user sends to bot via /connect <code>
-- link_code_expires_at: code becomes invalid after ~10 minutes
-- telegram_chat_id: populated by Edge Function once /connect succeeds

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS link_code             TEXT,
  ADD COLUMN IF NOT EXISTS link_code_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS telegram_chat_id      TEXT;

-- Unique index so two users cannot accidentally get the same active code
CREATE UNIQUE INDEX IF NOT EXISTS profiles_link_code_idx
  ON profiles (link_code)
  WHERE link_code IS NOT NULL;

-- Unique index so one Telegram account can only be linked to one dashboard
CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_chat_id_idx
  ON profiles (telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;
