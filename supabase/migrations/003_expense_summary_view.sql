-- ============================================================
-- Migration 003: expense_category_summary view
-- Project: expense-autopilot (qtjizqdvtgnardqmagqk)
--
-- Run in: Supabase Dashboard > SQL Editor > Run
--
-- Fixes: /summary returning Rs.0.00 and empty category breakdown.
-- Root cause: old Express SUM query had a broken JOIN — expenses with
-- no category_id returned NULL for category name and the amount was
-- never aggregated correctly.
--
-- Fix: LEFT JOIN + COALESCE so uncategorized expenses are counted,
-- and SUM is done in Postgres (not in JS) for accuracy.
-- The view is SECURITY INVOKER (default), so the RLS policy on the
-- expenses table (auth.uid() = user_id) is enforced automatically —
-- each user only sees their own rows.
-- ============================================================

CREATE OR REPLACE VIEW expense_category_summary AS
SELECT
  e.user_id,
  COALESCE(c.name, 'Uncategorized')  AS name,
  COALESCE(c.icon, '🏷️')            AS icon,
  ROUND(SUM(e.amount)::numeric, 2)   AS total,
  COUNT(*)                           AS count
FROM expenses e
LEFT JOIN categories c
  ON c.id = e.category_id
  AND c.user_id = e.user_id
GROUP BY e.user_id, c.name, c.icon
ORDER BY total DESC;
