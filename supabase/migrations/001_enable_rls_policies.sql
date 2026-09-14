-- ============================================================
-- Migration 001: Supabase Auth-compatible schema + RLS policies
-- Project: expense-autopilot (qtjizqdvtgnardqmagqk)
--
-- Run this in: Supabase Dashboard > SQL Editor > Run
--
-- SCHEMA DECISION: The old `users` table (serial int id) is replaced
-- by a `profiles` table whose primary key is a UUID that matches
-- auth.users.id exactly. This is the Supabase-native pattern and
-- makes auth.uid() = id work without any casting.
--
-- The user_id columns on categories, expenses, budgets are changed
-- from INTEGER to UUID so RLS USING (auth.uid() = user_id) works.
-- ============================================================


-- ============================================================
-- STEP 1: Create profiles table
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL DEFAULT '',
  telegram_chat_id      TEXT,
  link_code             TEXT,
  link_code_expires_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS
  'App-level user data. id is a 1:1 FK to auth.users.id (UUID). '
  'Auth (email/password) is handled entirely by Supabase Auth — never store passwords here.';


-- ============================================================
-- STEP 2: Migrate user_id columns from INTEGER to UUID
--
-- IMPORTANT: If you have real data in categories/expenses/budgets
-- that you want to keep, you must manually map old integer user_ids
-- to the new UUID auth.users.id before running these ALTER statements.
-- For a fresh Supabase Auth setup with no existing authenticated users,
-- it is safe to truncate first:
--
--   TRUNCATE categories, expenses CASCADE;
--
-- Then run the ALTER statements below.
-- ============================================================

-- Drop the old FK constraints that reference the serial-int users.id
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE expenses   DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE budgets    DROP CONSTRAINT IF EXISTS budgets_user_id_fkey;

-- Change column type from integer to uuid
ALTER TABLE categories ALTER COLUMN user_id TYPE UUID USING NULL;
ALTER TABLE expenses   ALTER COLUMN user_id TYPE UUID USING NULL;
ALTER TABLE budgets    ALTER COLUMN user_id TYPE UUID USING NULL;

-- Add new FK constraints pointing to auth.users instead of the old users table
ALTER TABLE categories
  ADD CONSTRAINT categories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ============================================================
-- STEP 3: Enable RLS on all user-data tables
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets     ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 4: RLS policies for profiles
-- Each user can only read and write their own profile row.
-- ============================================================

CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- No DELETE policy — profiles are cascade-deleted when auth.users row is removed.


-- ============================================================
-- STEP 5: RLS policies for categories
-- ============================================================

CREATE POLICY "categories: select own"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "categories: insert own"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories: update own"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "categories: delete own"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- STEP 6: RLS policies for expenses
-- ============================================================

CREATE POLICY "expenses: select own"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "expenses: insert own"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses: update own"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "expenses: delete own"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- STEP 7: RLS policies for budgets
-- ============================================================

CREATE POLICY "budgets: select own"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "budgets: insert own"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets: update own"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "budgets: delete own"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- STEP 8: Auto-create profile row when a new user signs up
-- This trigger fires after Supabase Auth creates the auth.users row,
-- so the profiles table always stays in sync automatically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
