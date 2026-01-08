const DISTRICTS = ['Bankura', 'Bardhaman', 'Purulia', 'Paschim Medinipur', 'Jhargram'];

const DISTRICT_COORDS = {
  'Bankura': { lat: 23.2324, lon: 87.0697 },
  'Bardhaman': { lat: 23.2550, lon: 87.8550 },
  'Purulia': { lat: 23.3322, lon: 86.3644 },
  'Paschim Medinipur': { lat: 22.4292, lon: 87.3200 },
  'Jhargram': { lat: 22.4525, lon: 86.9880 },
};

async function seedAllDistricts() {
  for (const district of DISTRICTS) {
    console.log(`\nSeeding ${district}...`);

    const coords = DISTRICT_COORDS[district];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia/Kolkata`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(`  Weather API response for ${district}:`, {
        current_temp: data.current.temperature_2m,
        daily_temps: data.daily.temperature_2m_max.slice(0, 3),
      });
    } catch (error) {
      console.error(`  Error for ${district}:`, error.message);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

seedAllDistricts();
