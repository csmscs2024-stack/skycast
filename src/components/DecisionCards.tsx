import { useEffect, useState } from 'react';
import { Droplets, Sprout, Sparkles, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { Farmer } from '../lib/supabase';
import { getDecisionAdvice, DecisionAdvice } from '../services/decisionService';

interface DecisionCardsProps {
  farmer: Farmer;
}

export function DecisionCards({ farmer }: DecisionCardsProps) {
  const { t } = useLanguage();
  const [advice, setAdvice] = useState<DecisionAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvice();
  }, [farmer]);

  async function loadAdvice() {
    setLoading(true);
    try {
      const data = await getDecisionAdvice(farmer);
      setAdvice(data);
    } catch (error) {
      console.error('Failed to load advice:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="w-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-center text-muted-foreground">
                {t('loading')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!advice) return null;

  const getIrrigationIcon = (action: string) => {
    switch (action) {
      case 'irrigate':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'not_needed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'wait':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Droplets className="w-6 h-6" />;
    }
  };

  const getFertilizerIcon = (action: string) => {
    switch (action) {
      case 'apply':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'avoid':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'wait':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Sprout className="w-6 h-6" />;
    }
  };

  const getPesticideIcon = (action: string) => {
    switch (action) {
      case 'spray':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'avoid':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'monitor':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getSowingIcon = (action: string) => {
    switch (action) {
      case 'suitable':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'wait':
        return <Clock className="w-6 h-6 text-amber-600" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      irrigate: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      not_needed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      wait: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      apply: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      avoid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      spray: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      monitor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      suitable: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    return actionColors[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionText = (type: string, action: string) => {
    const actionMap: Record<string, Record<string, string>> = {
      irrigation: {
        irrigate: t('irrigate'),
        not_needed: t('irrigationNotNeeded'),
        wait: t('waitForRain'),
      },
      fertilizer: {
        apply: t('applyFertilizer'),
        avoid: t('avoidFertilizer'),
        wait: t('waitForRain'),
      },
      pesticide: {
        spray: t('safeToSpray'),
        avoid: t('doNotSpray'),
        monitor: t('highPestRisk'),
      },
      sowing: {
        suitable: t('goodForSowing'),
        wait: t('waitForBetterConditions'),
      },
    };

    return actionMap[type]?.[action] || action;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold">{t('decisions')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="w-full border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Droplets className="w-5 h-5" />
                {t('irrigationAdvice')}
              </CardTitle>
              {getIrrigationIcon(advice.irrigation.action)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-3 text-sm md:text-base px-3 py-1 ${getActionBadge(advice.irrigation.action)}`}>
              {getActionText('irrigation', advice.irrigation.action)}
            </Badge>
            <CardDescription className="text-base md:text-lg leading-relaxed">
              {advice.irrigation.reason}
            </CardDescription>
            {advice.irrigation.recommendedAmount && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm md:text-base">
                <strong>Amount:</strong> {advice.irrigation.recommendedAmount}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Sprout className="w-5 h-5" />
                {t('fertilizerAdvice')}
              </CardTitle>
              {getFertilizerIcon(advice.fertilizer.action)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-3 text-sm md:text-base px-3 py-1 ${getActionBadge(advice.fertilizer.action)}`}>
              {getActionText('fertilizer', advice.fertilizer.action)}
            </Badge>
            <CardDescription className="text-base md:text-lg leading-relaxed">
              {advice.fertilizer.reason}
            </CardDescription>
            {advice.fertilizer.type && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm md:text-base">
                <div><strong>Type:</strong> {advice.fertilizer.type}</div>
                {advice.fertilizer.amount && <div><strong>Amount:</strong> {advice.fertilizer.amount}</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Sparkles className="w-5 h-5" />
                {t('pesticideAdvice')}
              </CardTitle>
              {getPesticideIcon(advice.pesticide.action)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-3 text-sm md:text-base px-3 py-1 ${getActionBadge(advice.pesticide.action)}`}>
              {getActionText('pesticide', advice.pesticide.action)}
            </Badge>
            <CardDescription className="text-base md:text-lg leading-relaxed">
              {advice.pesticide.reason}
            </CardDescription>
            {advice.pesticide.risk && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm md:text-base">
                <strong>Risk Type:</strong> {advice.pesticide.risk}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Calendar className="w-5 h-5" />
                {t('sowingAdvice')}
              </CardTitle>
              {getSowingIcon(advice.sowing.action)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-3 text-sm md:text-base px-3 py-1 ${getActionBadge(advice.sowing.action)}`}>
              {getActionText('sowing', advice.sowing.action)}
            </Badge>
            <CardDescription className="text-base md:text-lg leading-relaxed">
              {advice.sowing.reason}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
