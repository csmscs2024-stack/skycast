import { useState, useEffect } from 'react';
import { User, Plus, ChevronRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Farmer } from '../lib/supabase';
import { LocationSelector } from './LocationSelector';
import { FarmerProfile } from './FarmerProfile';

interface FarmerProfileSelectorProps {
  onProfileSelect: (farmer: Farmer) => void;
}

export function FarmerProfileSelector({ onProfileSelect }: FarmerProfileSelectorProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newLocation, setNewLocation] = useState<{
    district: string;
    block?: string;
    village?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  useEffect(() => {
    loadProfiles();
  }, [user]);

  async function loadProfiles() {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setProfiles(data);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNewProfile = () => {
    setCreatingNew(true);
    setNewLocation(null);
  };

  const handleLocationSelect = (location: any) => {
    setNewLocation(location);
  };

  const handleProfileSave = (farmer: Farmer) => {
    setCreatingNew(false);
    setNewLocation(null);
    onProfileSelect(farmer);
  };

  if (loading) {
    return null;
  }

  if (creatingNew && !newLocation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setCreatingNew(false)}
              className="mb-4"
            >
              ← {t('back')}
            </Button>
            <LocationSelector onLocationSelect={handleLocationSelect} />
          </div>
        </div>
      </div>
    );
  }

  if (creatingNew && newLocation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setNewLocation(null)}
              className="mb-4"
            >
              ← {t('back')}
            </Button>
            <FarmerProfile
              district={newLocation.district}
              block={newLocation.block}
              village={newLocation.village}
              latitude={newLocation.latitude}
              longitude={newLocation.longitude}
              onProfileSave={handleProfileSave}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
                <User className="w-6 h-6 md:w-8 md:h-8" />
                {t('selectFarmerProfile')}
              </CardTitle>
              <CardDescription className="text-base">
                {profiles.length > 0
                  ? t('chooseProfileOrCreateNew')
                  : t('createFirstProfile')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onProfileSelect(profile)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold mb-1">{profile.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {profile.village ? `${profile.village}, ` : ''}
                            {profile.block ? `${profile.block}, ` : ''}
                            {profile.district}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {profile.primary_crop} • {profile.crop_stage}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={handleNewProfile}
                variant="outline"
                className="w-full text-base py-6"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('createNewProfile')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
