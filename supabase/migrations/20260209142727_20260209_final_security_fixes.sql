/*
  # Final Security Fixes

  ## Overview
  Addresses remaining RLS policy optimizations and removes duplicate policies.

  ## Changes

  1. **RLS Policy Optimization**
     - Update `Farmers can view own profile` to use `(select auth.uid())` for better performance

  2. **Duplicate Policy Removal**
     - Remove redundant guest mode policy `Anyone can view own profile (guest mode)`
     - Keep consolidated `Guest can view profiles` policy

  ## Notes
  - All auth function calls now use subquery format for optimal performance
  - Single, clear policy for each access pattern
*/

-- Drop redundant guest mode policy
DROP POLICY IF EXISTS "Anyone can view own profile (guest mode)" ON farmers;

-- Update farmers view policy to use optimized auth check
DROP POLICY IF EXISTS "Farmers can view own profile" ON farmers;

CREATE POLICY "Farmers can view own profile"
  ON farmers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
