import { Farmer } from '../lib/supabase';
import { getRainfallSummary } from './weatherService';

export interface DecisionAdvice {
  irrigation: {
    action: 'irrigate' | 'wait' | 'not_needed';
    reason: string;
    recommendedAmount?: string;
  };
  fertilizer: {
    action: 'apply' | 'avoid' | 'wait';
    reason: string;
    type?: string;
    amount?: string;
  };
  pesticide: {
    action: 'spray' | 'avoid' | 'monitor';
    reason: string;
    risk?: string;
  };
  sowing: {
    action: 'suitable' | 'wait';
    reason: string;
  };
}

export async function getDecisionAdvice(farmer: Farmer): Promise<DecisionAdvice> {
  const rainfall = await getRainfallSummary(farmer.district);

  const irrigationAdvice = getIrrigationAdvice(
    rainfall,
    farmer.crop_stage,
    farmer.primary_crop
  );

  const fertilizerAdvice = getFertilizerAdvice(
    rainfall,
    farmer.crop_stage,
    farmer.primary_crop
  );

  const pesticideAdvice = getPesticideAdvice(
    rainfall,
    farmer.crop_stage
  );

  const sowingAdvice = getSowingAdvice(
    rainfall,
    farmer.primary_crop
  );

  return {
    irrigation: irrigationAdvice,
    fertilizer: fertilizerAdvice,
    pesticide: pesticideAdvice,
    sowing: sowingAdvice,
  };
}

function getIrrigationAdvice(
  rainfall: { next3DaysRain: number; next5DaysRain: number; todayRain: number; rainProbability: number },
  cropStage: string,
  crop: string
): DecisionAdvice['irrigation'] {
  if (rainfall.next3DaysRain > 15) {
    return {
      action: 'not_needed',
      reason: 'Heavy rain expected in next 3 days. No irrigation needed.',
    };
  }

  if (rainfall.rainProbability > 60) {
    return {
      action: 'wait',
      reason: 'Rain likely today. Wait 24 hours before irrigating.',
    };
  }

  const criticalStages = ['flowering', 'fruiting'];
  if (criticalStages.includes(cropStage) && rainfall.next5DaysRain < 10) {
    return {
      action: 'irrigate',
      reason: 'Critical growth stage requires water. Irrigate immediately.',
      recommendedAmount: crop === 'Rice (Paddy)' ? '5-7 cm' : '3-4 cm',
    };
  }

  if (rainfall.next5DaysRain < 5) {
    return {
      action: 'irrigate',
      reason: 'No significant rain expected. Light irrigation recommended.',
      recommendedAmount: '2-3 cm',
    };
  }

  return {
    action: 'wait',
    reason: 'Adequate soil moisture. Monitor for next 2 days.',
  };
}

function getFertilizerAdvice(
  rainfall: { next3DaysRain: number; rainProbability: number },
  cropStage: string,
  _crop: string
): DecisionAdvice['fertilizer'] {
  if (rainfall.rainProbability > 70 || rainfall.next3DaysRain > 20) {
    return {
      action: 'avoid',
      reason: 'Heavy rain expected. Fertilizer will wash away.',
    };
  }

  const fertilizerStages: Record<string, { type: string; amount: string }> = {
    vegetative: { type: 'Urea', amount: '50 kg/acre' },
    flowering: { type: 'DAP', amount: '40 kg/acre' },
    fruiting: { type: 'Potash', amount: '30 kg/acre' },
  };

  const stageAdvice = fertilizerStages[cropStage];

  if (stageAdvice) {
    if (rainfall.next3DaysRain < 5) {
      return {
        action: 'apply',
        reason: `Good conditions for fertilizer application. ${cropStage} stage requires nutrition.`,
        type: stageAdvice.type,
        amount: stageAdvice.amount,
      };
    } else {
      return {
        action: 'wait',
        reason: 'Light rain expected. Wait 48 hours before applying.',
        type: stageAdvice.type,
        amount: stageAdvice.amount,
      };
    }
  }

  return {
    action: 'wait',
    reason: 'Not the right stage for fertilizer application.',
  };
}

function getPesticideAdvice(
  rainfall: { next3DaysRain: number; rainProbability: number },
  cropStage: string
): DecisionAdvice['pesticide'] {
  if (rainfall.rainProbability > 60) {
    return {
      action: 'avoid',
      reason: 'Rain expected. Pesticide will wash off. Wait for clear weather.',
    };
  }

  if (rainfall.next3DaysRain > 10) {
    return {
      action: 'monitor',
      reason: 'High humidity after rain increases fungal disease risk. Monitor crop closely.',
      risk: 'fungal',
    };
  }

  if (['flowering', 'fruiting'].includes(cropStage)) {
    return {
      action: 'spray',
      reason: 'Critical stage. Safe to apply pesticide. Check for pest infestation.',
      risk: 'pest',
    };
  }

  return {
    action: 'monitor',
    reason: 'No immediate action needed. Regular monitoring recommended.',
  };
}

function getSowingAdvice(
  rainfall: { next5DaysRain: number; next3DaysRain: number },
  _crop: string
): DecisionAdvice['sowing'] {
  if (rainfall.next3DaysRain > 20) {
    return {
      action: 'wait',
      reason: 'Heavy rain expected. Seeds may wash away. Wait 3-4 days.',
    };
  }

  if (rainfall.next5DaysRain > 10 && rainfall.next5DaysRain < 40) {
    return {
      action: 'suitable',
      reason: 'Good soil moisture expected. Ideal conditions for sowing.',
    };
  }

  if (rainfall.next5DaysRain < 5) {
    return {
      action: 'wait',
      reason: 'Insufficient rain expected. Wait for better conditions or ensure irrigation.',
    };
  }

  return {
    action: 'suitable',
    reason: 'Weather conditions are favorable for sowing.',
  };
}
