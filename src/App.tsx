import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Auth } from './components/Auth';
import { LocationSelector } from './components/LocationSelector';
import { FarmerProfile } from './components/FarmerProfile';
import { WeatherSection } from './components/WeatherSection';
import { RainfallSection } from './components/RainfallSection';
import { DecisionCards } from './components/DecisionCards';
import { Marketplace } from './components/Marketplace';
import { Farmer, supabase } from './lib/supabase';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [location, setLocation] = useState<{
    district: string;
    block?: string;
    village?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user]);

  async function loadUserProfile() {
    if (!user) return;

    try {
      const { data: farmerData } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (farmerData) {
        setFarmer(farmerData);
        setLocation({
          district: farmerData.district,
          block: farmerData.block,
          village: farmerData.village,
          latitude: farmerData.latitude,
          longitude: farmerData.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(selectedLocation);
  };

  const handleProfileSave = async (farmerData: Farmer) => {
    if (user && !farmerData.user_id) {
      const { data } = await supabase
        .from('farmers')
        .update({ user_id: user.id })
        .eq('id', farmerData.id)
        .select()
        .single();

      if (data) {
        setFarmer(data);
      } else {
        setFarmer(farmerData);
      }
    } else {
      setFarmer(farmerData);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t('welcome')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">{t('appName')}</p>
            </div>
            <LocationSelector onLocationSelect={handleLocationSelect} />
          </div>
        </main>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <FarmerProfile district={location.district} onProfileSave={handleProfileSave} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} onNavigate={setActiveSection} />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {activeSection === 'dashboard' && (
          <div className="space-y-6 md:space-y-8">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
              <h1 className="text-2xl md:text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
                {t('welcome')}, {farmer.name}
              </h1>
              <p className="text-base md:text-lg text-green-800 dark:text-green-200">
                {location.village ? `${location.village}, ` : ''}
                {location.block ? `${location.block}, ` : ''}
                {location.district}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <DecisionCards farmer={farmer} />
              </div>

              <div className="space-y-6 md:space-y-8">
                <FarmerProfile
                  farmerId={farmer.id}
                  district={location.district}
                  onProfileSave={handleProfileSave}
                />
                <Marketplace district={location.district} />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'weather' && (
          <WeatherSection district={location.district} />
        )}

        {activeSection === 'rainfall' && (
          <RainfallSection district={location.district} />
        )}

        {activeSection === 'decisions' && (
          <div className="max-w-6xl mx-auto">
            <DecisionCards farmer={farmer} />
          </div>
        )}

        {activeSection === 'marketplace' && (
          <div className="max-w-4xl mx-auto">
            <Marketplace district={location.district} />
          </div>
        )}
      </main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          {t('appName')} - {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default App;
