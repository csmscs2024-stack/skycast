import { supabase } from '../lib/supabase';

const DISTRICTS = ['Bankura', 'Bardhaman', 'Purulia', 'Paschim Medinipur', 'Jhargram'];

const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  'Bankura': { lat: 23.2324, lon: 87.0697 },
  'Bardhaman': { lat: 23.2550, lon: 87.8550 },
  'Purulia': { lat: 23.3322, lon: 86.3644 },
  'Paschim Medinipur': { lat: 22.4292, lon: 87.3200 },
  'Jhargram': { lat: 22.4525, lon: 86.9880 },
};

export async function seedAllData() {
  console.log('Starting data seeding...');

  for (const district of DISTRICTS) {
    await seedWeatherData(district);
    await seedMarketData(district);
  }

  console.log('Data seeding complete!');
}

async function seedWeatherData(district: string) {
  const coords = DISTRICT_COORDS[district];
  if (!coords) return;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia/Kolkata`;

    const response = await fetch(url);
    const data = await response.json();

    const today = new Date().toISOString().split('T')[0];

    const currentWeather = {
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

    const forecasts = [];
    for (let i = 1; i <= 7 && i < data.daily.time.length; i++) {
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

    console.log(`Weather data seeded for ${district}`);
  } catch (error) {
    console.error(`Error seeding weather data for ${district}:`, error);
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

async function seedMarketData(district: string) {
  const today = new Date().toISOString().split('T')[0];

  const cropPrices = [
    { crop: 'Rice (Paddy)', basePrice: 2100, mandi: 'Main Mandi' },
    { crop: 'Potato', basePrice: 1200, mandi: 'Vegetable Market' },
    { crop: 'Mustard', basePrice: 5500, mandi: 'Main Mandi' },
    { crop: 'Pulses', basePrice: 6000, mandi: 'Main Mandi' },
    { crop: 'Vegetables', basePrice: 800, mandi: 'Vegetable Market' },
    { crop: 'Wheat', basePrice: 2200, mandi: 'Main Mandi' },
    { crop: 'Maize', basePrice: 1800, mandi: 'Main Mandi' },
    { crop: 'Tomato', basePrice: 1500, mandi: 'Vegetable Market' },
    { crop: 'Onion', basePrice: 2000, mandi: 'Vegetable Market' },
    { crop: 'Cauliflower', basePrice: 1000, mandi: 'Vegetable Market' },
  ];

  const commodities = cropPrices.map(crop => {
    const variation = (Math.random() - 0.5) * 0.2;
    const price = Math.round(crop.basePrice * (1 + variation));

    return {
      crop_name: crop.crop,
      mandi_name: crop.mandi,
      district,
      price_per_quintal: price,
      price_date: today,
      trend: variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable',
    };
  });

  await supabase
    .from('market_prices')
    .upsert(commodities, { onConflict: 'district,crop_name,price_date' });

  const inputTypes: Array<{ type: 'fertilizer' | 'seed' | 'pesticide'; name: string; basePrice: number; unit: string }> = [
    { type: 'fertilizer', name: 'Urea', basePrice: 300, unit: 'per kg' },
    { type: 'fertilizer', name: 'DAP', basePrice: 1350, unit: 'per 50kg bag' },
    { type: 'fertilizer', name: 'NPK', basePrice: 1200, unit: 'per 50kg bag' },
    { type: 'fertilizer', name: 'Potash', basePrice: 850, unit: 'per 50kg bag' },
    { type: 'fertilizer', name: 'Zinc Sulphate', basePrice: 80, unit: 'per kg' },
    { type: 'seed', name: 'Rice Seeds (HYV)', basePrice: 60, unit: 'per kg' },
    { type: 'seed', name: 'Potato Seeds', basePrice: 25, unit: 'per kg' },
    { type: 'seed', name: 'Mustard Seeds', basePrice: 150, unit: 'per kg' },
    { type: 'pesticide', name: 'Insecticide', basePrice: 450, unit: 'per liter' },
    { type: 'pesticide', name: 'Fungicide', basePrice: 550, unit: 'per liter' },
    { type: 'pesticide', name: 'Herbicide', basePrice: 380, unit: 'per liter' },
  ];

  const inputs = inputTypes.map(input => {
    const variation = (Math.random() - 0.5) * 0.15;
    const price = Math.round(input.basePrice * (1 + variation));

    return {
      input_type: input.type,
      input_name: input.name,
      price,
      unit: input.unit,
      district,
      price_date: today,
    };
  });

  await supabase
    .from('input_prices')
    .upsert(inputs, { onConflict: 'district,input_name,price_date' });

  console.log(`Market data seeded for ${district}`);
}
