import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { getWeatherData, WeatherInfo } from '../services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeatherDashboardProps {
  district: string;
}

export function WeatherDashboard({ district }: WeatherDashboardProps) {
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
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">{t('loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !weather.current) {
    return null;
  }

  const chartData = weather.forecast.map(day => ({
    date: new Date(day.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rainfall: Math.round(day.rainfall_mm * 10) / 10,
    probability: Math.round(day.rainfall_probability),
    tempMax: Math.round(day.temperature_max),
  }));

  const heavyRainNext3Days = weather.forecast.slice(0, 3).reduce((sum, day) => sum + day.rainfall_mm, 0) > 30;
  const rainToday = weather.current.rainfall_probability > 60;

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Cloud className="w-5 h-5 md:w-6 md:h-6" />
            {t('todayWeather')}
          </CardTitle>
          <CardDescription className="text-base">{district}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Cloud className="w-4 h-4" />
                <span className="text-sm">{t('temperature')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {Math.round(weather.current.temperature_max)}°
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {Math.round(weather.current.temperature_min)}° {t('celsius')}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Droplets className="w-4 h-4" />
                <span className="text-sm">{t('rainfall')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {Math.round(weather.current.rainfall_mm)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{t('mm')}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Droplets className="w-4 h-4" />
                <span className="text-sm">{t('humidity')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {Math.round(weather.current.humidity)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{t('percent')}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wind className="w-4 h-4" />
                <span className="text-sm">{t('rainfallProbability')}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {Math.round(weather.current.rainfall_probability)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{t('percent')}</div>
            </div>
          </div>

          {(rainToday || heavyRainNext3Days) && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    {rainToday ? t('rainExpected') : t('heavyRainNext3Days')}
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    {weather.current.weather_condition}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{t('forecast7Days')}</CardTitle>
          <CardDescription className="text-base">{t('rainfall')} & {t('temperature')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  yAxisId="left"
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name={`${t('rainfall')} (${t('mm')})`}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tempMax"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name={`${t('temperature')} (${t('celsius')})`}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
