import { useEffect, useState } from 'react';
import { Cloud, Thermometer, Wind, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { getWeatherData, WeatherInfo } from '../services/weatherService';

interface WeatherSectionProps {
  district: string;
}

export function WeatherSection({ district }: WeatherSectionProps) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, [district]);

  async function loadWeather() {
    setLoading(true);
    try {
      const data = await getWeatherData(district);
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
        <div className="text-muted-foreground">{t('loading')}</div>
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
      default:
        return '🌤️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">{t('todayWeather')}</h1>
        <p className="text-lg text-muted-foreground">{district}</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="text-8xl md:text-9xl animate-bounce">
          {getWeatherIcon(weather.current.weather_condition)}
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl md:text-8xl font-bold mb-2">
          {Math.round(weather.current.temperature_max)}°
        </div>
        <div className="text-2xl md:text-3xl text-muted-foreground mb-4">
          {weather.current.weather_condition}
        </div>
        <div className="text-lg text-muted-foreground">
          Low: {Math.round(weather.current.temperature_min)}° {t('celsius')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Thermometer className="w-5 h-5 text-orange-500" />
              {t('temperature')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(weather.current.temperature_max)}°
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Feels like {Math.round((weather.current.temperature_max + weather.current.temperature_min) / 2)}°
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wind className="w-5 h-5 text-blue-500" />
              Wind Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(weather.current.wind_speed)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">km/h</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="w-5 h-5 text-teal-500" />
              {t('humidity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(weather.current.humidity)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Relative humidity</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="w-5 h-5 text-gray-500" />
              Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {weather.current.weather_condition}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Current</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-xl">7-Day Outlook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weather.forecast.map((day, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg transition-all hover:scale-110"
              >
                <div className="text-sm font-medium mb-2">
                  {new Date(day.forecast_date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-3xl mb-2">{getWeatherIcon(day.weather_condition)}</div>
                <div className="text-lg font-bold">
                  {Math.round(day.temperature_max)}°
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(day.temperature_min)}°
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
