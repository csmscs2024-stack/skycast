/*
  # Add Unique Constraints to Market and Input Prices
  
  1. Changes
    - Add unique constraint on market_prices (district, crop_name, price_date)
    - Add unique constraint on input_prices (district, input_name, price_date)
    - Add policies for inserting data
  
  2. Security
    - Allow anyone to insert market and input price data
    - Maintain existing read policies
*/

-- Drop existing constraints if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'market_prices_district_crop_date_key'
  ) THEN
    ALTER TABLE market_prices DROP CONSTRAINT market_prices_district_crop_date_key;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'input_prices_district_input_date_key'
  ) THEN
    ALTER TABLE input_prices DROP CONSTRAINT input_prices_district_input_date_key;
  END IF;
END $$;

-- Add unique constraints
ALTER TABLE market_prices 
ADD CONSTRAINT market_prices_district_crop_date_key 
UNIQUE (district, crop_name, price_date);

ALTER TABLE input_prices 
ADD CONSTRAINT input_prices_district_input_date_key 
UNIQUE (district, input_name, price_date);

-- Add insert policies for market_prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'market_prices' AND policyname = 'Anyone can insert market prices'
  ) THEN
    CREATE POLICY "Anyone can insert market prices"
      ON market_prices FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Add insert policies for input_prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'input_prices' AND policyname = 'Anyone can insert input prices'
  ) THEN
    CREATE POLICY "Anyone can insert input prices"
      ON input_prices FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Add insert policies for weather_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weather_data' AND policyname = 'Anyone can insert weather data'
  ) THEN
    CREATE POLICY "Anyone can insert weather data"
      ON weather_data FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Add insert policies for weather_forecast
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weather_forecast' AND policyname = 'Anyone can insert weather forecast'
  ) THEN
    CREATE POLICY "Anyone can insert weather forecast"
      ON weather_forecast FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;
