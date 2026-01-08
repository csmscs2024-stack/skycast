import { supabase, WeatherData, WeatherForecast } from '../lib/supabase';

export interface WeatherInfo {
  current: WeatherData | null;
  forecast: WeatherForecast[];
}

export async function getWeatherData(district: string): Promise<WeatherInfo> {
  const today = new Date().toISOString().split('T')[0];

  const { data: currentData } = await supabase
    .from('weather_data')
    .select('*')
    .eq('district', district)
    .eq('date', today)
    .maybeSingle();

  const { data: forecastData } = await supabase
    .from('weather_forecast')
    .select('*')
    .eq('district', district)
    .gte('forecast_date', today)
    .order('forecast_date', { ascending: true })
    .limit(7);

  if (!currentData) {
    await generateMockWeatherData(district);
    return getWeatherData(district);
  }

  return {
    current: currentData,
    forecast: forecastData || [],
  };
}

async function generateMockWeatherData(district: string): Promise<void> {
  const today = new Date();

  const weatherConditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm'];

  const currentWeather: Partial<WeatherData> = {
    district,
    date: today.toISOString().split('T')[0],
    temperature_max: 28 + Math.random() * 8,
    temperature_min: 18 + Math.random() * 8,
    rainfall_mm: Math.random() > 0.7 ? Math.random() * 20 : 0,
    humidity: 60 + Math.random() * 30,
    rainfall_probability: Math.random() * 100,
    wind_speed: 5 + Math.random() * 10,
    weather_condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
  };

  await supabase
    .from('weather_data')
    .upsert(currentWeather, { onConflict: 'district,date' });

  const forecasts: Partial<WeatherForecast>[] = [];
  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);

    forecasts.push({
      district,
      forecast_date: forecastDate.toISOString().split('T')[0],
      temperature_max: 28 + Math.random() * 8,
      temperature_min: 18 + Math.random() * 8,
      rainfall_mm: Math.random() > 0.6 ? Math.random() * 25 : 0,
      rainfall_probability: Math.random() * 100,
      humidity: 60 + Math.random() * 30,
      weather_condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
    });
  }

  await supabase
    .from('weather_forecast')
    .upsert(forecasts, { onConflict: 'district,forecast_date' });
}

export async function getRainfallSummary(district: string): Promise<{
  todayRain: number;
  rainProbability: number;
  next3DaysRain: number;
  next5DaysRain: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  const { data: currentData } = await supabase
    .from('weather_data')
    .select('rainfall_mm, rainfall_probability')
    .eq('district', district)
    .eq('date', today)
    .maybeSingle();

  const { data: forecastData } = await supabase
    .from('weather_forecast')
    .select('rainfall_mm, forecast_date')
    .eq('district', district)
    .gte('forecast_date', today)
    .order('forecast_date', { ascending: true })
    .limit(5);

  const next3DaysRain = forecastData?.slice(0, 3).reduce((sum, day) => sum + day.rainfall_mm, 0) || 0;
  const next5DaysRain = forecastData?.reduce((sum, day) => sum + day.rainfall_mm, 0) || 0;

  return {
    todayRain: currentData?.rainfall_mm || 0,
    rainProbability: currentData?.rainfall_probability || 0,
    next3DaysRain,
    next5DaysRain,
  };
}
