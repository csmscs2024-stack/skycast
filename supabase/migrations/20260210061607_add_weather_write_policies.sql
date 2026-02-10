/*
  # Add INSERT and UPDATE policies for weather tables
  
  Allow service role to write weather data via edge functions
*/

CREATE POLICY "Service role can insert weather data"
  ON weather_data FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update weather data"
  ON weather_data FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert weather forecast"
  ON weather_forecast FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update weather forecast"
  ON weather_forecast FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);