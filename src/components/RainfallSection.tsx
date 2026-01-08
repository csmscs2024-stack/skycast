import { useEffect, useState } from 'react';
import { Droplets, CloudRain, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { getRainfallSummary } from '../services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getWeatherData } from '../services/weatherService';

interface RainfallSectionProps {
  district: string;
}

export function RainfallSection({ district }: RainfallSectionProps) {
  const { t } = useLanguage();
  const [rainfall, setRainfall] = useState<{
    todayRain: number;
    rainProbability: number;
    next3DaysRain: number;
    next5DaysRain: number;
  } | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRainfall();
  }, [district]);

  async function loadRainfall() {
    setLoading(true);
    try {
      const data = await getRainfallSummary(district);
      const weatherData = await getWeatherData(district);

      const chartData = weatherData.forecast.map(day => ({
        date: new Date(day.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rainfall: Math.round(day.rainfall_mm * 10) / 10,
        probability: Math.round(day.rainfall_probability),
      }));

      setRainfall(data);
      setForecast(chartData);
    } catch (error) {
      console.error('Failed to load rainfall:', error);
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

  if (!rainfall) return null;

  const getRainfallCategory = (amount: number) => {
    if (amount < 2.5) return { label: 'Light', color: 'text-blue-400' };
    if (amount < 10) return { label: 'Moderate', color: 'text-blue-600' };
    if (amount < 35) return { label: 'Heavy', color: 'text-orange-600' };
    return { label: 'Very Heavy', color: 'text-red-600' };
  };

  const todayCategory = getRainfallCategory(rainfall.todayRain);
  const next3DaysCategory = getRainfallCategory(rainfall.next3DaysRain);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">{t('rainfall')} {t('forecast7Days')}</h1>
        <p className="text-lg text-muted-foreground">{district}</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="text-8xl md:text-9xl animate-bounce">
            💧
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.3 + (i * 0.15),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CloudRain className="w-6 h-6 text-blue-600" />
              {t('today')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {Math.round(rainfall.todayRain * 10) / 10}
              </div>
              <div className="text-2xl text-muted-foreground">{t('mm')}</div>
              <div className={`text-lg font-semibold mt-2 ${todayCategory.color}`}>
                {todayCategory.label} Rain
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Probability</span>
                <span className="font-bold">{Math.round(rainfall.rainProbability)}%</span>
              </div>
              <Progress value={rainfall.rainProbability} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full -mr-16 -mt-16" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Next 3 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {Math.round(rainfall.next3DaysRain * 10) / 10}
              </div>
              <div className="text-2xl text-muted-foreground">{t('mm')}</div>
              <div className={`text-lg font-semibold mt-2 ${next3DaysCategory.color}`}>
                {next3DaysCategory.label} Rain
              </div>
            </div>

            {rainfall.next3DaysRain > 30 && (
              <div className="flex items-start gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-amber-900 dark:text-amber-100">Heavy Rain Alert</div>
                  <div className="text-amber-800 dark:text-amber-200">Plan farm activities accordingly</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">7-Day Rainfall Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                  label={{ value: 'mm', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'rainfall' ? `${value} mm` : `${value}%`,
                    name === 'rainfall' ? 'Rainfall' : 'Probability'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRainfall)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Rain Probability Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs md:text-sm"
                  tick={{ fill: 'currentColor' }}
                  label={{ value: '%', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 8 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <Droplets className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {Math.round(rainfall.next5DaysRain)}
          </div>
          <div className="text-sm text-muted-foreground">Total 5-day rainfall (mm)</div>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
          <CloudRain className="w-12 h-12 mx-auto mb-3 text-cyan-600" />
          <div className="text-3xl font-bold text-cyan-600 mb-1">
            {Math.round(rainfall.next3DaysRain / 3 * 10) / 10}
          </div>
          <div className="text-sm text-muted-foreground">Avg daily rainfall (mm)</div>
        </Card>

        <Card className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-teal-600" />
          <div className="text-3xl font-bold text-teal-600 mb-1">
            {Math.round(rainfall.rainProbability)}%
          </div>
          <div className="text-sm text-muted-foreground">Today's probability</div>
        </Card>
      </div>
    </div>
  );
}
