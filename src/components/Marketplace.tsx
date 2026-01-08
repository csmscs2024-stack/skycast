import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Sprout, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, MarketPrice, InputPrice } from '../lib/supabase';

interface MarketplaceProps {
  district: string;
}

export function Marketplace({ district }: MarketplaceProps) {
  const { t, language } = useLanguage();
  const [cropPrices, setCropPrices] = useState<MarketPrice[]>([]);
  const [inputPrices, setInputPrices] = useState<InputPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [district]);

  async function loadMarketData() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: crops } = await supabase
        .from('market_prices')
        .select('*')
        .eq('district', district)
        .eq('price_date', today)
        .order('crop_name');

      const { data: inputs } = await supabase
        .from('input_prices')
        .select('*')
        .eq('district', district)
        .eq('price_date', today)
        .order('input_type')
        .order('input_name');

      setCropPrices(crops || []);
      setInputPrices(inputs || []);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    const trendColors: Record<string, string> = {
      up: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      stable: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };

    return trendColors[trend] || trendColors.stable;
  };

  const getTrendText = (trend: string) => {
    const trendMap: Record<string, string> = {
      up: t('trendUp'),
      down: t('trendDown'),
      stable: t('trendStable'),
    };

    return trendMap[trend] || trend;
  };

  const getCropNameTranslation = (cropName: string) => {
    const cropMap: Record<string, string> = {
      'Rice (Paddy)': language === 'bn' ? 'ধান' : 'Rice (Paddy)',
      'Potato': language === 'bn' ? 'আলু' : 'Potato',
      'Mustard': language === 'bn' ? 'সরিষা' : 'Mustard',
      'Pulses (Masoor)': language === 'bn' ? 'মসুর ডাল' : 'Pulses (Masoor)',
      'Vegetables (Tomato)': language === 'bn' ? 'টমেটো' : 'Vegetables (Tomato)',
      'Vegetables (Brinjal)': language === 'bn' ? 'বেগুন' : 'Vegetables (Brinjal)',
    };

    return cropMap[cropName] || cropName;
  };

  const getInputNameTranslation = (inputName: string) => {
    const inputMap: Record<string, string> = {
      'Urea': language === 'bn' ? 'ইউরিয়া' : 'Urea',
      'DAP': language === 'bn' ? 'ডিএপি' : 'DAP',
      'Potash (MOP)': language === 'bn' ? 'পটাশ' : 'Potash (MOP)',
      'Chlorpyrifos': language === 'bn' ? 'ক্লোরপাইরিফস' : 'Chlorpyrifos',
      'Mancozeb': language === 'bn' ? 'ম্যানকোজেব' : 'Mancozeb',
      'Rice (IR64)': language === 'bn' ? 'ধান (আইআর৬৪)' : 'Rice (IR64)',
      'Potato': language === 'bn' ? 'আলু' : 'Potato',
    };

    return inputMap[inputName] || inputName;
  };

  const getUnitTranslation = (unit: string) => {
    const unitMap: Record<string, string> = {
      'per 50kg bag': language === 'bn' ? '৫০ কেজি ব্যাগ' : 'per 50kg bag',
      'per liter': language === 'bn' ? 'প্রতি লিটার' : 'per liter',
      'per kg': language === 'bn' ? 'প্রতি কেজি' : 'per kg',
    };

    return unitMap[unit] || unit;
  };

  const bestMarket = cropPrices.reduce((best, current) => {
    return current.price_per_quintal > (best?.price_per_quintal || 0) ? current : best;
  }, cropPrices[0]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center text-muted-foreground">
            {t('loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold">{t('marketplace')}</h2>

      {bestMarket && (
        <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-green-900 dark:text-green-100">
              <Store className="w-6 h-6" />
              {t('bestMarketToday')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
                {bestMarket.mandi_name}
              </div>
              <div className="text-lg md:text-xl text-green-800 dark:text-green-200">
                {getCropNameTranslation(bestMarket.crop_name)}: ₹{bestMarket.price_per_quintal}{t('perQuintal')}
              </div>
              <Badge className={`text-sm ${getTrendBadge(bestMarket.trend)}`}>
                {getTrendIcon(bestMarket.trend)}
                <span className="ml-1">{getTrendText(bestMarket.trend)}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="crops" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crops" className="text-base md:text-lg">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('cropPrices')}
          </TabsTrigger>
          <TabsTrigger value="inputs" className="text-base md:text-lg">
            <Sprout className="w-4 h-4 mr-2" />
            {t('inputPrices')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crops" className="space-y-3 mt-4">
          {cropPrices.map((price) => (
            <Card key={price.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-lg md:text-xl">
                      {getCropNameTranslation(price.crop_name)}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground">
                      {price.mandi_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold">
                      ₹{price.price_per_quintal}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      {t('perQuintal')}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge className={`${getTrendBadge(price.trend)}`}>
                      {getTrendIcon(price.trend)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cropPrices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No crop prices available
            </div>
          )}
        </TabsContent>

        <TabsContent value="inputs" className="space-y-3 mt-4">
          <div className="space-y-4">
            {['fertilizer', 'pesticide', 'seed'].map((type) => {
              const items = inputPrices.filter((i) => i.input_type === type);
              if (items.length === 0) return null;

              return (
                <div key={type}>
                  <h3 className="text-lg md:text-xl font-semibold mb-3 capitalize">
                    {type === 'fertilizer' ? t('fertilizers') : type === 'pesticide' ? t('pesticides') : t('seeds')}
                  </h3>
                  {items.map((input) => (
                    <Card key={input.id} className="mb-3 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold text-base md:text-lg">
                              {getInputNameTranslation(input.input_name)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getUnitTranslation(input.unit)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl md:text-2xl font-bold">
                              ₹{input.price}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
          {inputPrices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No input prices available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
