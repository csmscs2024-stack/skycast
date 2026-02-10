import { supabase, WeatherData, WeatherForecast } from '../lib/supabase';

export interface WeatherInfo {
  current: WeatherData | null;
  forecast: WeatherForecast[];
}

const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  'Bankura': { lat: 23.2324, lon: 87.0697 },
  'Bardhaman': { lat: 23.2550, lon: 87.8550 },
  'Purulia': { lat: 23.3322, lon: 86.3644 },
  'Paschim Medinipur': { lat: 22.4292, lon: 87.3200 },
  'Jhargram': { lat: 22.4525, lon: 86.9880 },
};

export async function getWeatherData(district: string, latitude?: number, longitude?: number): Promise<WeatherInfo> {
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

  if (!currentData || !forecastData || forecastData.length === 0) {
    await fetchRealWeatherData(district, latitude, longitude);
    return getWeatherData(district, latitude, longitude);
  }

  const isOldData = currentData && new Date(currentData.created_at).getTime() < Date.now() - 3600000;
  if (isOldData) {
    fetchRealWeatherData(district, latitude, longitude);
  }

  return {
    current: currentData,
    forecast: forecastData || [],
  };
}

async function fetchRealWeatherData(district: string, latitude?: number, longitude?: number): Promise<void> {
  const coords = (latitude && longitude)
    ? { lat: latitude, lon: longitude }
    : DISTRICT_COORDS[district];
  if (!coords) return;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/functions/v1/fetch_weather`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ district, latitude, longitude }),
    });

    const data = await response.json();

    const today = new Date().toISOString().split('T')[0];

    const currentWeather: Partial<WeatherData> = {
      district,
      date: today,
      temperature_max: data.daily.temperature_2m_max[0],
      temperature_min: data.daily.temperature_2m_min[0],
      rainfall_mm: data.daily.precipitation_sum[0] || 0,
      humidity: data.current.relative_humidity_2m,
      rainfall_probability: data.daily.precipitation_probability_max[0] || 0,
      wind_speed: data.current.wind_speed_10m,
      weather_condition: getWeatherCondition(data.current.weather_code),
    };

    await supabase
      .from('weather_data')
      .upsert(currentWeather, { onConflict: 'district,date' });

    const forecasts: Partial<WeatherForecast>[] = [];
    for (let i = 1; i < Math.min(7, data.daily.time.length); i++) {
      forecasts.push({
        district,
        forecast_date: data.daily.time[i],
        temperature_max: data.daily.temperature_2m_max[i],
        temperature_min: data.daily.temperature_2m_min[i],
        rainfall_mm: data.daily.precipitation_sum[i] || 0,
        rainfall_probability: data.daily.precipitation_probability_max[i] || 0,
        humidity: data.daily.relative_humidity_2m_mean[i],
        weather_condition: getWeatherCondition(data.daily.weather_code[i]),
      });
    }

    await supabase
      .from('weather_forecast')
      .upsert(forecasts, { onConflict: 'district,forecast_date' });
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Cloudy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
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
