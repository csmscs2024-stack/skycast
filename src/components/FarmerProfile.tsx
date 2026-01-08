import { useState, useEffect } from 'react';
import { User, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Farmer } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface FarmerProfileProps {
  farmerId?: string;
  district: string;
  onProfileSave: (farmer: Farmer) => void;
}

const CROPS = ['Rice (Paddy)', 'Potato', 'Mustard', 'Pulses', 'Vegetables'];
const STAGES = ['Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'];

export function FarmerProfile({ farmerId, district, onProfileSave }: FarmerProfileProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState(!farmerId);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<Farmer>>({
    name: '',
    phone: '',
    district,
    primary_crop: '',
    crop_stage: '',
    sowing_date: '',
  });

  useEffect(() => {
    if (farmerId) {
      loadProfile();
    }
  }, [farmerId]);

  async function loadProfile() {
    if (!farmerId) return;

    const { data } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmerId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  }

  async function handleSave() {
    if (!profile.name || !profile.primary_crop || !profile.crop_stage || !profile.sowing_date) {
      toast({
        title: t('error'),
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (farmerId) {
        const { data, error } = await supabase
          .from('farmers')
          .update({
            ...profile,
            updated_at: new Date().toISOString(),
          })
          .eq('id', farmerId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          onProfileSave(data);
          setEditing(false);
          toast({
            title: t('success'),
            description: t('profileSaved'),
          });
        }
      } else {
        const { data, error } = await supabase
          .from('farmers')
          .insert({
            ...profile,
            district,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          onProfileSave(data);
          setEditing(false);
          toast({
            title: t('success'),
            description: t('profileSaved'),
          });
        }
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('profileError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const getCropTranslation = (crop: string) => {
    const cropMap: Record<string, string> = {
      'Rice (Paddy)': t('crops.rice'),
      'Potato': t('crops.potato'),
      'Mustard': t('crops.mustard'),
      'Pulses': t('crops.pulses'),
      'Vegetables': t('crops.vegetables'),
    };
    return cropMap[crop] || crop;
  };

  const getStageTranslation = (stage: string) => {
    const stageMap: Record<string, string> = {
      'Sowing': t('stages.sowing'),
      'Vegetative': t('stages.vegetative'),
      'Flowering': t('stages.flowering'),
      'Fruiting': t('stages.fruiting'),
      'Harvesting': t('stages.harvesting'),
    };
    return stageMap[stage] || stage;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <User className="w-5 h-5 md:w-6 md:h-6" />
              {t('farmerProfile')}
            </CardTitle>
            <CardDescription className="text-base">{district}</CardDescription>
          </div>
          {farmerId && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('edit')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('name')} *</label>
              <Input
                placeholder={t('enterName')}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="text-base py-6"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('phone')}</label>
              <Input
                type="tel"
                placeholder={t('enterPhone')}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="text-base py-6"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('primaryCrop')} *</label>
              <Select
                value={profile.primary_crop}
                onValueChange={(value) => setProfile({ ...profile, primary_crop: value })}
              >
                <SelectTrigger className="w-full text-base py-6">
                  <SelectValue placeholder={t('selectCrop')} />
                </SelectTrigger>
                <SelectContent>
                  {CROPS.map(crop => (
                    <SelectItem key={crop} value={crop} className="text-base py-3">
                      {getCropTranslation(crop)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('cropStage')} *</label>
              <Select
                value={profile.crop_stage}
                onValueChange={(value) => setProfile({ ...profile, crop_stage: value })}
              >
                <SelectTrigger className="w-full text-base py-6">
                  <SelectValue placeholder={t('selectStage')} />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(stage => (
                    <SelectItem key={stage} value={stage} className="text-base py-3">
                      {getStageTranslation(stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('sowingDate')} *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-base py-6"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {profile.sowing_date ? format(new Date(profile.sowing_date), 'PPP') : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={profile.sowing_date ? new Date(profile.sowing_date) : undefined}
                    onSelect={(date) => setProfile({ ...profile, sowing_date: date?.toISOString().split('T')[0] || '' })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1 text-base py-6">
                {loading ? t('loading') : t('save')}
              </Button>
              {farmerId && (
                <Button variant="outline" onClick={() => setEditing(false)} className="text-base py-6">
                  {t('cancel')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('name')}:</span>
              <span className="font-medium text-lg">{profile.name}</span>
            </div>
            {profile.phone && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">{t('phone')}:</span>
                <span className="font-medium text-lg">{profile.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('primaryCrop')}:</span>
              <span className="font-medium text-lg">{getCropTranslation(profile.primary_crop || '')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('cropStage')}:</span>
              <span className="font-medium text-lg">{getStageTranslation(profile.crop_stage || '')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t('sowingDate')}:</span>
              <span className="font-medium text-lg">
                {profile.sowing_date ? format(new Date(profile.sowing_date), 'PPP') : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
