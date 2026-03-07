/*
  # Add Write Policies for Input Prices Table

  1. Changes
    - Add INSERT and UPDATE policies for input_prices table
    - Allow anonymous and authenticated users to insert and update price data

  2. Security
    - Maintains existing SELECT policies
    - Adds permissive policies for data seeding and updates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'input_prices' AND policyname = 'Anyone can insert input prices'
  ) THEN
    CREATE POLICY "Anyone can insert input prices"
      ON input_prices
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'input_prices' AND policyname = 'Anyone can update input prices'
  ) THEN
    CREATE POLICY "Anyone can update input prices"
      ON input_prices
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;