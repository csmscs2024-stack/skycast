import { useEffect, useState } from 'react';
import { Droplets, CloudRain, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { getRainfallSummary } from '../services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart } from 'recharts';
import { getWeatherData } from '../services/weatherService';

interface RainfallSectionProps {
  district: string;
  latitude?: number;
  longitude?: number;
}

export function RainfallSection({ district, latitude, longitude }: RainfallSectionProps) {
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
  }, [district, latitude, longitude]);

  async function loadRainfall() {
    setLoading(true);
    try {
      const data = await getRainfallSummary(district);
      const weatherData = await getWeatherData(district, latitude, longitude);

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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <CloudRain className="w-16 h-16 text-blue-500 animate-pulse" />
            <Droplets className="w-12 h-12 text-cyan-400 absolute top-2 left-2 animate-bounce" />
          </div>
          <div className="text-lg text-muted-foreground animate-pulse">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!rainfall) return null;

  const getRainfallCategory = (amount: number) => {
    if (amount < 2.5) return { label: 'Light', color: 'text-blue-400', gradient: 'from-blue-400 to-blue-500' };
    if (amount < 10) return { label: 'Moderate', color: 'text-blue-600', gradient: 'from-blue-500 to-blue-700' };
    if (amount < 35) return { label: 'Heavy', color: 'text-orange-600', gradient: 'from-orange-500 to-orange-700' };
    return { label: 'Very Heavy', color: 'text-red-600', gradient: 'from-red-500 to-red-700' };
  };

  const todayCategory = getRainfallCategory(rainfall.todayRain);
  const next3DaysCategory = getRainfallCategory(rainfall.next3DaysRain);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-60"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}px`,
                  animation: `raindrop ${Math.random() * 2 + 1}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 animate-fade-in">
              {t('rainfall')} Forecast
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">{district}</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 my-8">
            <div className="relative">
              <div className="text-9xl md:text-[12rem] animate-float drop-shadow-2xl">
                💧
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-12 bg-white/60 rounded-full animate-ripple"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="text-7xl md:text-8xl font-bold text-white drop-shadow-lg mb-4 animate-scale-in">
                {Math.round(rainfall.todayRain * 10) / 10} mm
              </div>
              <div className="text-3xl md:text-4xl text-white/90 font-semibold mb-3 drop-shadow-md">
                Expected Today
              </div>
              <div className="flex items-center gap-4 text-lg md:text-xl text-white/80">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {Math.round(rainfall.rainProbability)}% Probability
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform duration-300">
                <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              {t('today')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 animate-scale-in">
                {Math.round(rainfall.todayRain * 10) / 10}
              </div>
              <div className="text-2xl md:text-3xl text-muted-foreground font-semibold">{t('mm')}</div>
              <div className={`text-xl font-bold mt-3 ${todayCategory.color} animate-pulse`}>
                {todayCategory.label} Rain
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-base font-medium">
                <span>Probability</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round(rainfall.rainProbability)}%</span>
              </div>
              <div className="relative">
                <Progress value={rainfall.rainProbability} className="h-4 bg-blue-200 dark:bg-blue-900" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 dark:from-teal-950 dark:via-emerald-950 dark:to-teal-900">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-emerald-400/0 group-hover:from-teal-400/20 group-hover:to-emerald-400/20 transition-all duration-500"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-400/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
              <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              Next 3 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3 animate-scale-in">
                {Math.round(rainfall.next3DaysRain * 10) / 10}
              </div>
              <div className="text-2xl md:text-3xl text-muted-foreground font-semibold">{t('mm')}</div>
              <div className={`text-xl font-bold mt-3 ${next3DaysCategory.color} animate-pulse`}>
                {next3DaysCategory.label} Rain
              </div>
            </div>

            {rainfall.next3DaysRain > 30 && (
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border-2 border-amber-300 dark:border-amber-700 animate-pulse-slow">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 animate-bounce" />
                <div className="text-sm">
                  <div className="font-bold text-amber-900 dark:text-amber-100 text-base mb-1">Heavy Rain Alert</div>
                  <div className="text-amber-800 dark:text-amber-200">Plan farm activities accordingly</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            <BarChart className="w-7 h-7 text-blue-600" />
            7-Day Rainfall Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] md:h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                <XAxis
                  dataKey="date"
                  className="text-sm md:text-base font-medium"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-sm md:text-base font-medium"
                  tick={{ fill: 'currentColor' }}
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fontWeight: 600 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--primary))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
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
                  strokeWidth={4}
                  fill="url(#colorRainfall)"
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            <LineChart className="w-7 h-7 text-emerald-600" />
            Rain Probability Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                <XAxis
                  dataKey="date"
                  className="text-sm md:text-base font-medium"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-sm md:text-base font-medium"
                  tick={{ fill: 'currentColor' }}
                  label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', style: { fontWeight: 600 } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--primary))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 3 }}
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group text-center p-8 bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-200 dark:from-blue-900 dark:via-blue-800 dark:to-cyan-900 border-2 border-blue-300 dark:border-blue-700 hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/30 group-hover:to-cyan-400/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <Droplets className="w-14 h-14 mx-auto mb-4 text-blue-700 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent mb-2">
              {Math.round(rainfall.next5DaysRain)}
            </div>
            <div className="text-base font-semibold text-blue-900 dark:text-blue-100">Total 5-day rainfall (mm)</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group text-center p-8 bg-gradient-to-br from-cyan-100 via-teal-200 to-emerald-200 dark:from-cyan-900 dark:via-teal-800 dark:to-emerald-900 border-2 border-cyan-300 dark:border-cyan-700 hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-emerald-400/0 group-hover:from-cyan-400/30 group-hover:to-emerald-400/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <CloudRain className="w-14 h-14 mx-auto mb-4 text-cyan-700 dark:text-cyan-300 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-700 to-emerald-700 dark:from-cyan-300 dark:to-emerald-300 bg-clip-text text-transparent mb-2">
              {Math.round(rainfall.next3DaysRain / 3 * 10) / 10}
            </div>
            <div className="text-base font-semibold text-cyan-900 dark:text-cyan-100">Avg daily rainfall (mm)</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group text-center p-8 bg-gradient-to-br from-teal-100 via-emerald-200 to-green-200 dark:from-teal-900 dark:via-emerald-800 dark:to-green-900 border-2 border-teal-300 dark:border-teal-700 hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/0 to-green-400/0 group-hover:from-teal-400/30 group-hover:to-green-400/30 transition-all duration-500"></div>
          <div className="relative z-10">
            <TrendingUp className="w-14 h-14 mx-auto mb-4 text-teal-700 dark:text-teal-300 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-700 to-green-700 dark:from-teal-300 dark:to-green-300 bg-clip-text text-transparent mb-2">
              {Math.round(rainfall.rainProbability)}%
            </div>
            <div className="text-base font-semibold text-teal-900 dark:text-teal-100">Today's probability</div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes raindrop {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
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
        @keyframes ripple {
          0%, 100% { transform: scaleY(0.3); opacity: 0.3; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
        .animate-ripple {
          animation: ripple 1s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
