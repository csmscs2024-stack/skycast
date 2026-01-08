import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  bn: {
    appName: 'কৃষি সহায়ক',
    welcome: 'স্বাগতম',
    dashboard: 'ড্যাশবোর্ড',
    profile: 'প্রোফাইল',
    location: 'অবস্থান',
    weather: 'আবহাওয়া',
    decisions: 'পরামর্শ',
    marketplace: 'বাজার',
    settings: 'সেটিংস',

    selectLocation: 'অবস্থান নির্বাচন করুন',
    autoDetect: 'স্বয়ংক্রিয় সনাক্ত করুন',
    manualSelect: 'ম্যানুয়াল নির্বাচন',
    district: 'জেলা',
    block: 'ব্লক',
    village: 'গ্রাম',
    selectDistrict: 'জেলা নির্বাচন করুন',
    selectBlock: 'ব্লক নির্বাচন করুন',
    selectVillage: 'গ্রাম নির্বাচন করুন',

    farmerProfile: 'কৃষক প্রোফাইল',
    name: 'নাম',
    phone: 'ফোন নম্বর',
    primaryCrop: 'প্রধান ফসল',
    cropStage: 'ফসলের পর্যায়',
    sowingDate: 'বপনের তারিখ',

    crops: {
      rice: 'ধান',
      potato: 'আলু',
      mustard: 'সরিষা',
      pulses: 'ডাল',
      vegetables: 'সবজি',
    },

    stages: {
      sowing: 'বপন',
      vegetative: 'পাতা বৃদ্ধি',
      flowering: 'ফুল',
      fruiting: 'ফল ধরা',
      harvesting: 'ফসল তোলা',
    },

    todayWeather: 'আজকের আবহাওয়া',
    temperature: 'তাপমাত্রা',
    rainfall: 'বৃষ্টিপাত',
    humidity: 'আর্দ্রতা',
    rainfallProbability: 'বৃষ্টির সম্ভাবনা',
    forecast7Days: '৭ দিনের পূর্বাভাস',
    rainExpected: 'আজ বৃষ্টি হতে পারে',
    heavyRainNext3Days: 'আগামী ৩ দিনে ভারী বৃষ্টি',
    noRainExpected: 'বৃষ্টির সম্ভাবনা নেই',

    irrigationAdvice: 'সেচ পরামর্শ',
    fertilizerAdvice: 'সার পরামর্শ',
    pesticideAdvice: 'কীটনাশক পরামর্শ',
    sowingAdvice: 'বপন পরামর্শ',

    irrigate: 'সেচ দিন',
    doNotIrrigate: 'সেচ দেবেন না',
    waitForRain: 'বৃষ্টির জন্য অপেক্ষা করুন',
    irrigationNotNeeded: 'সেচের প্রয়োজন নেই',

    applyFertilizer: 'সার প্রয়োগ করুন',
    avoidFertilizer: 'সার প্রয়োগ করবেন না - বৃষ্টি আসছে',
    fertilizerSafe: 'সার দেওয়া নিরাপদ',

    safeToSpray: 'স্প্রে করা নিরাপদ',
    doNotSpray: 'স্প্রে করবেন না - বৃষ্টি আসছে',
    highPestRisk: 'কীটপতঙ্গের ঝুঁকি বেশি - ফসল পর্যবেক্ষণ করুন',
    fungalRisk: 'ছত্রাকের ঝুঁকি - স্প্রে করুন',

    goodForSowing: 'বপনের জন্য উপযুক্ত',
    waitForBetterConditions: 'ভাল অবস্থার জন্য অপেক্ষা করুন',

    marketPrices: 'বাজার মূল্য',
    cropPrices: 'ফসলের দাম',
    inputPrices: 'কৃষি উপকরণের দাম',
    mandi: 'মান্ডি',
    pricePerQuintal: 'প্রতি কুইন্টাল দাম',
    trend: 'প্রবণতা',
    trendUp: 'দাম বৃদ্ধি',
    trendDown: 'দাম হ্রাস',
    trendStable: 'দাম স্থিতিশীল',

    bestMarketToday: 'আজ বিক্রির সেরা বাজার',
    priceRising: 'দাম বাড়ছে',
    priceFalling: 'দাম পড়ছে',

    fertilizers: 'সার',
    pesticides: 'কীটনাশক',
    seeds: 'বীজ',

    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    edit: 'সম্পাদনা',
    update: 'আপডেট করুন',
    submit: 'জমা দিন',

    language: 'ভাষা',
    bengali: 'বাংলা',
    english: 'English',

    theme: 'থিম',
    lightMode: 'হালকা মোড',
    darkMode: 'গাঢ় মোড',

    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',

    mm: 'মিমি',
    celsius: '°সে',
    percent: '%',
    perQuintal: '/কুইন্টাল',
    perKg: '/কেজি',
    perLiter: '/লিটার',
    perBag: '/ব্যাগ',

    today: 'আজ',
    tomorrow: 'আগামীকাল',
    yesterday: 'গতকাল',

    yes: 'হ্যাঁ',
    no: 'না',

    detectingLocation: 'অবস্থান সনাক্ত করা হচ্ছে...',
    locationDetected: 'অবস্থান সনাক্ত হয়েছে',
    locationError: 'অবস্থান সনাক্ত করতে ব্যর্থ',

    profileSaved: 'প্রোফাইল সংরক্ষিত হয়েছে',
    profileError: 'প্রোফাইল সংরক্ষণ করতে ব্যর্থ',

    enterName: 'নাম লিখুন',
    enterPhone: 'ফোন নম্বর লিখুন',
    selectCrop: 'ফসল নির্বাচন করুন',
    selectStage: 'পর্যায় নির্বাচন করুন',
    selectDate: 'তারিখ নির্বাচন করুন',
  },
  en: {
    appName: 'Farming Assistant',
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    profile: 'Profile',
    location: 'Location',
    weather: 'Weather',
    decisions: 'Decisions',
    marketplace: 'Marketplace',
    settings: 'Settings',

    selectLocation: 'Select Location',
    autoDetect: 'Auto Detect',
    manualSelect: 'Manual Select',
    district: 'District',
    block: 'Block',
    village: 'Village',
    selectDistrict: 'Select District',
    selectBlock: 'Select Block',
    selectVillage: 'Select Village',

    farmerProfile: 'Farmer Profile',
    name: 'Name',
    phone: 'Phone Number',
    primaryCrop: 'Primary Crop',
    cropStage: 'Crop Stage',
    sowingDate: 'Sowing Date',

    crops: {
      rice: 'Rice',
      potato: 'Potato',
      mustard: 'Mustard',
      pulses: 'Pulses',
      vegetables: 'Vegetables',
    },

    stages: {
      sowing: 'Sowing',
      vegetative: 'Vegetative',
      flowering: 'Flowering',
      fruiting: 'Fruiting',
      harvesting: 'Harvesting',
    },

    todayWeather: "Today's Weather",
    temperature: 'Temperature',
    rainfall: 'Rainfall',
    humidity: 'Humidity',
    rainfallProbability: 'Rain Probability',
    forecast7Days: '7-Day Forecast',
    rainExpected: 'Rain expected today',
    heavyRainNext3Days: 'Heavy rain in next 3 days',
    noRainExpected: 'No rain expected',

    irrigationAdvice: 'Irrigation Advice',
    fertilizerAdvice: 'Fertilizer Advice',
    pesticideAdvice: 'Pesticide Advice',
    sowingAdvice: 'Sowing Advice',

    irrigate: 'Irrigate',
    doNotIrrigate: 'Do Not Irrigate',
    waitForRain: 'Wait for Rain',
    irrigationNotNeeded: 'Irrigation Not Needed',

    applyFertilizer: 'Apply Fertilizer',
    avoidFertilizer: 'Avoid Fertilizer - Rain Coming',
    fertilizerSafe: 'Safe to Apply Fertilizer',

    safeToSpray: 'Safe to Spray',
    doNotSpray: 'Do Not Spray - Rain Coming',
    highPestRisk: 'High Pest Risk - Monitor Crop',
    fungalRisk: 'Fungal Risk - Apply Fungicide',

    goodForSowing: 'Good for Sowing',
    waitForBetterConditions: 'Wait for Better Conditions',

    marketPrices: 'Market Prices',
    cropPrices: 'Crop Prices',
    inputPrices: 'Input Prices',
    mandi: 'Mandi',
    pricePerQuintal: 'Price per Quintal',
    trend: 'Trend',
    trendUp: 'Price Rising',
    trendDown: 'Price Falling',
    trendStable: 'Price Stable',

    bestMarketToday: 'Best Market to Sell Today',
    priceRising: 'Price Rising',
    priceFalling: 'Price Falling',

    fertilizers: 'Fertilizers',
    pesticides: 'Pesticides',
    seeds: 'Seeds',

    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    update: 'Update',
    submit: 'Submit',

    language: 'Language',
    bengali: 'বাংলা',
    english: 'English',

    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',

    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    mm: 'mm',
    celsius: '°C',
    percent: '%',
    perQuintal: '/quintal',
    perKg: '/kg',
    perLiter: '/liter',
    perBag: '/bag',

    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',

    yes: 'Yes',
    no: 'No',

    detectingLocation: 'Detecting location...',
    locationDetected: 'Location detected',
    locationError: 'Failed to detect location',

    profileSaved: 'Profile saved successfully',
    profileError: 'Failed to save profile',

    enterName: 'Enter name',
    enterPhone: 'Enter phone number',
    selectCrop: 'Select crop',
    selectStage: 'Select stage',
    selectDate: 'Select date',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
