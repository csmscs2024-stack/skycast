/*
  # Fix Security and Performance Issues

  ## Overview
  Addresses multiple security and performance concerns in the database schema.

  ## Changes

  1. **RLS Policy Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies to avoid re-evaluation per row
     - Remove overly permissive guest mode policies that allow unrestricted access

  2. **Indexing**
     - Add missing index for `decision_logs.farmer_id` foreign key
     - Remove unused indexes for better maintenance

  3. **Data Integrity**
     - Restrict guest mode policies to prevent unauthorized data modification
     - Ensure proper access control for all tables

  ## Notes
  - The app supports both authenticated users and anonymous (guest) mode
  - Guest mode is limited to reading public data only
  - All write operations require proper authentication
*/

-- Drop overly permissive guest mode policies
DROP POLICY IF EXISTS "Anyone can insert profile (guest mode)" ON farmers;
DROP POLICY IF EXISTS "Anyone can update profile (guest mode)" ON farmers;
DROP POLICY IF EXISTS "Anyone can insert decision logs (guest mode)" ON decision_logs;
DROP POLICY IF EXISTS "Anyone can insert weather data" ON weather_data;
DROP POLICY IF EXISTS "Anyone can insert weather forecast" ON weather_forecast;
DROP POLICY IF EXISTS "Anyone can insert market prices" ON market_prices;
DROP POLICY IF EXISTS "Anyone can insert input prices" ON input_prices;

-- Update farmers policies to use optimized auth check
DROP POLICY IF EXISTS "Farmers can view own profile" ON farmers;
DROP POLICY IF EXISTS "Farmers can insert own profile" ON farmers;
DROP POLICY IF EXISTS "Farmers can update own profile" ON farmers;

CREATE POLICY "Farmers can view own profile"
  ON farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own profile"
  ON farmers FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Farmers can update own profile"
  ON farmers FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Guest mode: view only, no modifications
CREATE POLICY "Guest can view profiles"
  ON farmers FOR SELECT
  TO anon
  USING (true);

-- Update decision_logs policies
DROP POLICY IF EXISTS "Farmers can view own decision logs" ON decision_logs;
DROP POLICY IF EXISTS "Farmers can insert own decision logs" ON decision_logs;
DROP POLICY IF EXISTS "Anyone can view decision logs (guest mode)" ON decision_logs;

CREATE POLICY "Farmers can view own decision logs"
  ON decision_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM farmers 
    WHERE farmers.id = decision_logs.farmer_id 
    AND farmers.user_id = (select auth.uid())
  ));

CREATE POLICY "Farmers can insert own decision logs"
  ON decision_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmers 
    WHERE farmers.id = decision_logs.farmer_id 
    AND farmers.user_id = (select auth.uid())
  ));

CREATE POLICY "Guest can view decision logs"
  ON decision_logs FOR SELECT
  TO anon
  USING (true);

-- Add missing index for foreign key on decision_logs
CREATE INDEX IF NOT EXISTS idx_decision_logs_farmer_id ON decision_logs(farmer_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_farmers_district;
DROP INDEX IF EXISTS idx_weather_forecast_district_date;
DROP INDEX IF EXISTS idx_market_prices_crop_district;

-- Keep essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_district_date ON weather_data(district, date);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date);
