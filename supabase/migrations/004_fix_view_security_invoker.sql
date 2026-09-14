-- ============================================================
-- Migration 004: fix expense_category_summary view security
-- Project: expense-autopilot (qtjizqdvtgnardqmagqk)
--
-- Run in: Supabase Dashboard > SQL Editor > Run
--
-- Problem: Supabase Advisor flagged the view as SECURITY DEFINER.
-- Even though CREATE VIEW doesn't have an explicit SECURITY clause,
-- Supabase wraps views in a security definer context by default.
-- This means the view runs as the creator (postgres), bypassing RLS —
-- any authenticated user could read all users' expenses through it.
--
-- Fix: Recreate the view with security_invoker = true so it executes
-- in the context of the querying user. RLS on the expenses table
-- (auth.uid() = user_id) then correctly filters rows per user.
-- ============================================================

DROP VIEW IF EXISTS expense_category_summary;

CREATE VIEW expense_category_summary
  WITH (security_invoker = true)
AS
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

-- Grant SELECT to authenticated users (Supabase default role)
GRANT SELECT ON expense_category_summary TO authenticated;
