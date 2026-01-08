import { useEffect, useState } from 'react';
import { Cloud, Thermometer, Wind, Droplets, Sun, CloudRain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { getWeatherData, WeatherInfo } from '../services/weatherService';

interface WeatherSectionProps {
  district: string;
  latitude?: number;
  longitude?: number;
}

export function WeatherSection({ district, latitude, longitude }: WeatherSectionProps) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, [district, latitude, longitude]);

  async function loadWeather() {
    setLoading(true);
    try {
      const data = await getWeatherData(district, latitude, longitude);
      setWeather(data);
    } catch (error) {
      console.error('Failed to load weather:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Sun className="w-16 h-16 text-yellow-500 animate-spin" />
            <Cloud className="w-12 h-12 text-blue-400 absolute top-2 left-2 animate-pulse" />
          </div>
          <div className="text-lg text-muted-foreground animate-pulse">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!weather || !weather.current) {
    return null;
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'partly cloudy':
        return '⛅';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'snowy':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  const getGradientForCondition = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'from-yellow-400 via-orange-300 to-pink-400';
      case 'partly cloudy':
        return 'from-blue-400 via-sky-300 to-gray-300';
      case 'cloudy':
        return 'from-gray-400 via-gray-300 to-slate-400';
      case 'rainy':
        return 'from-blue-600 via-blue-400 to-cyan-500';
      case 'thunderstorm':
        return 'from-gray-700 via-purple-600 to-blue-800';
      default:
        return 'from-blue-400 via-cyan-300 to-teal-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getGradientForCondition(weather.current.weather_condition)} p-8 md:p-12 shadow-2xl`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 animate-fade-in">
              {t('todayWeather')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">{district}</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 my-8">
            <div className="text-9xl md:text-[12rem] animate-float drop-shadow-2xl">
              {getWeatherIcon(weather.current.weather_condition)}
            </div>

            <div className="text-center md:text-left">
              <div className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg mb-4 animate-scale-in">
                {Math.round(weather.current.temperature_max)}°C
              </div>
              <div className="text-3xl md:text-4xl text-white/90 font-semibold mb-3 drop-shadow-md">
                {weather.current.weather_condition}
              </div>
              <div className="flex items-center gap-4 text-lg md:text-xl text-white/80">
                <span className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Low: {Math.round(weather.current.temperature_min)}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-red-400/0 group-hover:from-orange-400/20 group-hover:to-red-400/20 transition-all duration-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900 group-hover:scale-110 transition-transform duration-300">
                <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              {t('temperature')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {Math.round(weather.current.temperature_max)}°C
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Feels {Math.round((weather.current.temperature_max + weather.current.temperature_min) / 2)}°C
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform duration-300">
                <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:animate-spin" />
              </div>
              Wind Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {Math.round(weather.current.wind_speed)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">km/h</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-teal-300 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-emerald-400/0 group-hover:from-teal-400/20 group-hover:to-emerald-400/20 transition-all duration-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900 group-hover:scale-110 transition-transform duration-300">
                <Droplets className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              {t('humidity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {Math.round(weather.current.humidity)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">Relative</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/20 group-hover:to-pink-400/20 transition-all duration-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform duration-300">
                <CloudRain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Rain Chance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {Math.round(weather.current.rainfall_probability)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">Probability</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Sun className="w-6 h-6 text-yellow-500 animate-pulse" />
            7-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {weather.forecast.map((day, index) => (
              <div
                key={index}
                className="group relative overflow-hidden text-center p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300 rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">
                    {new Date(day.forecast_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-5xl md:text-6xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {getWeatherIcon(day.weather_condition)}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {Math.round(day.temperature_max)}°
                  </div>
                  <div className="text-base text-muted-foreground">
                    {Math.round(day.temperature_min)}°
                  </div>
                  {day.rainfall_mm > 0 && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Droplets className="w-3 h-3" />
                      {Math.round(day.rainfall_mm)}mm
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
