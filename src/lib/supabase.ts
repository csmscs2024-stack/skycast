import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Farmer {
  id: string;
  user_id?: string;
  name: string;
  phone?: string;
  district: string;
  block?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  primary_crop: string;
  crop_stage: string;
  sowing_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: string;
  district: string;
  block: string;
  village: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  id: string;
  district: string;
  date: string;
  temperature_max: number;
  temperature_min: number;
  rainfall_mm: number;
  humidity: number;
  rainfall_probability: number;
  wind_speed: number;
  weather_condition: string;
}

export interface WeatherForecast {
  id: string;
  district: string;
  forecast_date: string;
  temperature_max: number;
  temperature_min: number;
  rainfall_mm: number;
  rainfall_probability: number;
  humidity: number;
  weather_condition: string;
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  mandi_name: string;
  district: string;
  price_per_quintal: number;
  price_date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface InputPrice {
  id: string;
  input_type: 'fertilizer' | 'pesticide' | 'seed';
  input_name: string;
  price: number;
  unit: string;
  district: string;
  price_date: string;
}

export interface DecisionLog {
  id: string;
  farmer_id: string;
  date: string;
  irrigation_advice: string;
  fertilizer_advice: string;
  pesticide_advice: string;
  sowing_advice: string;
}
