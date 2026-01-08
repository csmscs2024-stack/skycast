import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Sprout, Store, Package, Beaker, Leaf } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { getMarketPrices } from '../services/marketService';
import { MarketPrice, InputPrice } from '../lib/supabase';

interface MarketplaceProps {
  district: string;
}

export function Marketplace({ district }: MarketplaceProps) {
  const { t } = useLanguage();
  const [cropPrices, setCropPrices] = useState<MarketPrice[]>([]);
  const [inputPrices, setInputPrices] = useState<InputPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [district]);

  async function loadMarketData() {
    setLoading(true);
    try {
      const data = await getMarketPrices(district);
      const uniqueCrops = Array.from(
        new Map(data.commodities.map(item => [item.crop_name, item])).values()
      );
      setCropPrices(uniqueCrops);
      setInputPrices(data.inputs);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTrendIconComponent = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
      case 'down':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0';
    }
  };

  const getTrendText = (trend: string) => {
    const trendMap: Record<string, string> = {
      up: 'Rising',
      down: 'Falling',
      stable: 'Stable',
    };
    return trendMap[trend] || trend;
  };

  const bestMarket = cropPrices.reduce((best, current) => {
    return current.price_per_quintal > (best?.price_per_quintal || 0) ? current : best;
  }, cropPrices[0]);

  const fertilizers = inputPrices.filter(i => i.input_type === 'fertilizer');
  const seeds = inputPrices.filter(i => i.input_type === 'seed');
  const pesticides = inputPrices.filter(i => i.input_type === 'pesticide');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Store className="w-16 h-16 text-green-500 animate-pulse" />
            <ShoppingCart className="w-12 h-12 text-emerald-400 absolute top-2 left-2 animate-bounce" />
          </div>
          <div className="text-lg text-muted-foreground animate-pulse">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
              {t('marketplace')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">{district}</p>
          </div>

          {bestMarket && (
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/30 rounded-full">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Best Market Today</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {bestMarket.mandi_name}
                  </div>
                  <div className="text-xl text-white/90">
                    {bestMarket.crop_name}
                  </div>
                </div>
                <div className="text-right md:text-left">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    ₹{bestMarket.price_per_quintal}
                  </div>
                  <div className="flex items-center gap-2 justify-end md:justify-start">
                    <Badge className={`text-base px-3 py-1 ${getTrendBadge(bestMarket.trend)}`}>
                      {getTrendIconComponent(bestMarket.trend)}
                      <span className="ml-1">{getTrendText(bestMarket.trend)}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="crops" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
          <TabsTrigger value="crops" className="text-base md:text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Crop Prices
          </TabsTrigger>
          <TabsTrigger value="inputs" className="text-base md:text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <Sprout className="w-5 h-5 mr-2" />
            Input Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropPrices.map((price, index) => (
              <Card
                key={price.id}
                className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-green-300 dark:hover:border-green-700 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/20 group-hover:to-emerald-400/20 transition-all duration-500"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Badge className={`${getTrendBadge(price.trend)} px-3 py-1`}>
                      {getTrendIconComponent(price.trend)}
                      <span className="ml-1">{getTrendText(price.trend)}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                      {price.crop_name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      {price.mandi_name}
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent pt-2">
                      ₹{price.price_per_quintal}
                    </div>
                    <div className="text-sm text-muted-foreground">per quintal</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {cropPrices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No crop prices available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inputs" className="space-y-6 mt-6">
          {fertilizers.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
                  <Beaker className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Fertilizers</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fertilizers.map((input, index) => (
                  <Card
                    key={input.id}
                    className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-blue-300 dark:hover:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/20 group-hover:to-cyan-400/20 transition-all duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="space-y-3">
                        <div className="font-bold text-lg md:text-xl text-gray-900 dark:text-gray-100">
                          {input.input_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{input.unit}</div>
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹{input.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {seeds.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900">
                  <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold">Seeds</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seeds.map((input, index) => (
                  <Card
                    key={input.id}
                    className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-emerald-300 dark:hover:border-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-green-400/0 group-hover:from-emerald-400/20 group-hover:to-green-400/20 transition-all duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="space-y-3">
                        <div className="font-bold text-lg md:text-xl text-gray-900 dark:text-gray-100">
                          {input.input_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{input.unit}</div>
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          ₹{input.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pesticides.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                  <Sprout className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Pesticides</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pesticides.map((input, index) => (
                  <Card
                    key={input.id}
                    className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 hover:border-purple-300 dark:hover:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/20 group-hover:to-pink-400/20 transition-all duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="space-y-3">
                        <div className="font-bold text-lg md:text-xl text-gray-900 dark:text-gray-100">
                          {input.input_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{input.unit}</div>
                        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{input.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {inputPrices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No input prices available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
