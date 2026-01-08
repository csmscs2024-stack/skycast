import { supabase, MarketPrice, InputPrice } from '../lib/supabase';

export interface MarketData {
  commodities: MarketPrice[];
  inputs: InputPrice[];
}

export async function getMarketPrices(district: string): Promise<MarketData> {
  const { data: commodities } = await supabase
    .from('market_prices')
    .select('*')
    .eq('district', district)
    .gte('price_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('price_date', { ascending: false });

  const { data: inputs } = await supabase
    .from('input_prices')
    .select('*')
    .eq('district', district)
    .gte('price_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('price_date', { ascending: false });

  if (!commodities || commodities.length === 0 || !inputs || inputs.length === 0) {
    await generateMarketData(district);
    return getMarketPrices(district);
  }

  return {
    commodities: commodities || [],
    inputs: inputs || [],
  };
}

async function generateMarketData(district: string): Promise<void> {
  const today = new Date();
  const priceDate = today.toISOString().split('T')[0];

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

  const commodities: Partial<MarketPrice>[] = cropPrices.map(crop => {
    const variation = (Math.random() - 0.5) * 0.2;
    const price = Math.round(crop.basePrice * (1 + variation));

    return {
      crop_name: crop.crop,
      mandi_name: crop.mandi,
      district,
      price_per_quintal: price,
      price_date: priceDate,
      trend: variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable',
    };
  });

  await supabase
    .from('market_prices')
    .upsert(commodities, { onConflict: 'id' });

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

  const inputs: Array<{ input_type: 'fertilizer' | 'seed' | 'pesticide'; input_name: string; price: number; unit: string; district: string; price_date: string }> = inputTypes.map(input => {
    const variation = (Math.random() - 0.5) * 0.15;
    const price = Math.round(input.basePrice * (1 + variation));

    return {
      input_type: input.type,
      input_name: input.name,
      price,
      unit: input.unit,
      district,
      price_date: priceDate,
    };
  });

  await supabase
    .from('input_prices')
    .upsert(inputs, { onConflict: 'id' });
}

export function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up':
      return '📈';
    case 'down':
      return '📉';
    default:
      return '➡️';
  }
}

export function getTrendColor(trend: string): string {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
