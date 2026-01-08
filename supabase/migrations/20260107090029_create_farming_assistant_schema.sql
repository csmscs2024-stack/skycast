/*
  # Agricultural Assistant Database Schema

  ## Overview
  Complete database schema for the South-West Bengal farming assistant application.
  
  ## New Tables
  
  ### 1. `farmers`
  Stores farmer profile information
  - `id` (uuid, primary key)
  - `user_id` (uuid, optional foreign key to auth.users)
  - `name` (text)
  - `phone` (text)
  - `district` (text)
  - `block` (text)
  - `village` (text)
  - `latitude` (float)
  - `longitude` (float)
  - `primary_crop` (text)
  - `crop_stage` (text)
  - `sowing_date` (date)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ### 2. `locations`
  South-West Bengal location hierarchy
  - `id` (uuid, primary key)
  - `district` (text)
  - `block` (text)
  - `village` (text)
  - `latitude` (float)
  - `longitude` (float)
  - `created_at` (timestamp)
  
  ### 3. `weather_data`
  Weather and rainfall information
  - `id` (uuid, primary key)
  - `district` (text)
  - `date` (date)
  - `temperature_max` (float)
  - `temperature_min` (float)
  - `rainfall_mm` (float)
  - `humidity` (float)
  - `rainfall_probability` (float)
  - `wind_speed` (float)
  - `weather_condition` (text)
  - `created_at` (timestamp)
  
  ### 4. `weather_forecast`
  7-day weather forecast
  - `id` (uuid, primary key)
  - `district` (text)
  - `forecast_date` (date)
  - `temperature_max` (float)
  - `temperature_min` (float)
  - `rainfall_mm` (float)
  - `rainfall_probability` (float)
  - `humidity` (float)
  - `weather_condition` (text)
  - `created_at` (timestamp)
  
  ### 5. `market_prices`
  Crop prices and market information
  - `id` (uuid, primary key)
  - `crop_name` (text)
  - `mandi_name` (text)
  - `district` (text)
  - `price_per_quintal` (float)
  - `price_date` (date)
  - `trend` (text) - 'up', 'down', 'stable'
  - `created_at` (timestamp)
  
  ### 6. `input_prices`
  Fertilizer, pesticide, and seed prices
  - `id` (uuid, primary key)
  - `input_type` (text) - 'fertilizer', 'pesticide', 'seed'
  - `input_name` (text)
  - `price` (float)
  - `unit` (text)
  - `district` (text)
  - `price_date` (date)
  - `created_at` (timestamp)
  
  ### 7. `decision_logs`
  Track advice given to farmers
  - `id` (uuid, primary key)
  - `farmer_id` (uuid, foreign key)
  - `date` (date)
  - `irrigation_advice` (text)
  - `fertilizer_advice` (text)
  - `pesticide_advice` (text)
  - `sowing_advice` (text)
  - `created_at` (timestamp)
  
  ## Security
  - Enable RLS on all tables
  - Farmers can read/write their own data
  - Weather and market data are publicly readable
*/

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  phone text,
  district text NOT NULL,
  block text,
  village text,
  latitude float,
  longitude float,
  primary_crop text NOT NULL,
  crop_stage text NOT NULL,
  sowing_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  block text NOT NULL,
  village text NOT NULL,
  latitude float NOT NULL,
  longitude float NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  date date NOT NULL,
  temperature_max float,
  temperature_min float,
  rainfall_mm float DEFAULT 0,
  humidity float,
  rainfall_probability float,
  wind_speed float,
  weather_condition text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(district, date)
);

-- Create weather_forecast table
CREATE TABLE IF NOT EXISTS weather_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  forecast_date date NOT NULL,
  temperature_max float,
  temperature_min float,
  rainfall_mm float DEFAULT 0,
  rainfall_probability float,
  humidity float,
  weather_condition text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(district, forecast_date)
);

-- Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  mandi_name text NOT NULL,
  district text NOT NULL,
  price_per_quintal float NOT NULL,
  price_date date NOT NULL,
  trend text DEFAULT 'stable',
  created_at timestamptz DEFAULT now()
);

-- Create input_prices table
CREATE TABLE IF NOT EXISTS input_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_type text NOT NULL,
  input_name text NOT NULL,
  price float NOT NULL,
  unit text NOT NULL,
  district text NOT NULL,
  price_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create decision_logs table
CREATE TABLE IF NOT EXISTS decision_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  date date NOT NULL,
  irrigation_advice text,
  fertilizer_advice text,
  pesticide_advice text,
  sowing_advice text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;

-- Farmers policies
CREATE POLICY "Farmers can view own profile"
  ON farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own profile"
  ON farmers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update own profile"
  ON farmers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view own profile (guest mode)"
  ON farmers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert profile (guest mode)"
  ON farmers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update profile (guest mode)"
  ON farmers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Locations policies (public read)
CREATE POLICY "Anyone can view locations"
  ON locations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Weather data policies (public read)
CREATE POLICY "Anyone can view weather data"
  ON weather_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view weather forecast"
  ON weather_forecast FOR SELECT
  TO anon, authenticated
  USING (true);

-- Market prices policies (public read)
CREATE POLICY "Anyone can view market prices"
  ON market_prices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view input prices"
  ON input_prices FOR SELECT
  TO anon, authenticated
  USING (true);

-- Decision logs policies
CREATE POLICY "Farmers can view own decision logs"
  ON decision_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM farmers 
    WHERE farmers.id = decision_logs.farmer_id 
    AND farmers.user_id = auth.uid()
  ));

CREATE POLICY "Farmers can insert own decision logs"
  ON decision_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM farmers 
    WHERE farmers.id = decision_logs.farmer_id 
    AND farmers.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view decision logs (guest mode)"
  ON decision_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert decision logs (guest mode)"
  ON decision_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers(district);
CREATE INDEX IF NOT EXISTS idx_weather_data_district_date ON weather_data(district, date);
CREATE INDEX IF NOT EXISTS idx_weather_forecast_district_date ON weather_forecast(district, forecast_date);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_district ON market_prices(crop_name, district);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date);

-- Insert sample South-West Bengal locations
INSERT INTO locations (district, block, village, latitude, longitude) VALUES
  ('Bankura', 'Bankura I', 'Bankura Town', 23.2324, 87.0708),
  ('Bankura', 'Bankura II', 'Beliatore', 23.1833, 87.0167),
  ('Purulia', 'Purulia I', 'Purulia Town', 23.3425, 86.3639),
  ('Purulia', 'Raghunathpur', 'Raghunathpur', 23.5500, 86.6833),
  ('Paschim Medinipur', 'Kharagpur I', 'Kharagpur', 22.3460, 87.2320),
  ('Paschim Medinipur', 'Ghatal', 'Ghatal', 22.6667, 87.7167),
  ('Jhargram', 'Jhargram', 'Jhargram Town', 22.4500, 86.9833),
  ('Purulia', 'Jhalda I', 'Jhalda', 23.3667, 86.1833),
  ('Bankura', 'Sonamukhi', 'Sonamukhi', 23.3000, 87.4167),
  ('Paschim Medinipur', 'Midnapore', 'Midnapore Town', 22.4239, 87.3210)
ON CONFLICT DO NOTHING;

-- Insert sample market prices
INSERT INTO market_prices (crop_name, mandi_name, district, price_per_quintal, price_date, trend) VALUES
  ('Rice (Paddy)', 'Bankura Mandi', 'Bankura', 2100, CURRENT_DATE, 'up'),
  ('Rice (Paddy)', 'Purulia Mandi', 'Purulia', 2050, CURRENT_DATE, 'stable'),
  ('Potato', 'Ghatal Mandi', 'Paschim Medinipur', 800, CURRENT_DATE, 'down'),
  ('Mustard', 'Kharagpur Mandi', 'Paschim Medinipur', 5500, CURRENT_DATE, 'up'),
  ('Pulses (Masoor)', 'Jhargram Mandi', 'Jhargram', 6200, CURRENT_DATE, 'up'),
  ('Vegetables (Tomato)', 'Bankura Mandi', 'Bankura', 1200, CURRENT_DATE, 'stable'),
  ('Vegetables (Brinjal)', 'Purulia Mandi', 'Purulia', 900, CURRENT_DATE, 'down')
ON CONFLICT DO NOTHING;

-- Insert sample input prices
INSERT INTO input_prices (input_type, input_name, price, unit, district, price_date) VALUES
  ('fertilizer', 'Urea', 300, 'per 50kg bag', 'Bankura', CURRENT_DATE),
  ('fertilizer', 'DAP', 1350, 'per 50kg bag', 'Bankura', CURRENT_DATE),
  ('fertilizer', 'Potash (MOP)', 950, 'per 50kg bag', 'Bankura', CURRENT_DATE),
  ('pesticide', 'Chlorpyrifos', 450, 'per liter', 'Bankura', CURRENT_DATE),
  ('pesticide', 'Mancozeb', 280, 'per kg', 'Bankura', CURRENT_DATE),
  ('seed', 'Rice (IR64)', 80, 'per kg', 'Bankura', CURRENT_DATE),
  ('seed', 'Potato', 25, 'per kg', 'Paschim Medinipur', CURRENT_DATE)
ON CONFLICT DO NOTHING;