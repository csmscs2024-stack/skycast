import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Location } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

interface LocationSelectorProps {
  onLocationSelect: (location: { district: string; block?: string; village?: string; latitude?: number; longitude?: number }) => void;
  selectedDistrict?: string;
}

const DISTRICTS = ['Bankura', 'Purulia', 'Paschim Medinipur', 'Jhargram'];

export function LocationSelector({ onLocationSelect, selectedDistrict }: LocationSelectorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [detecting, setDetecting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState({
    district: selectedDistrict || '',
    block: '',
    village: '',
  });

  const blocks = [...new Set(locations.filter(l => l.district === selectedLocation.district).map(l => l.block))];
  const villages = [...new Set(locations.filter(l => l.district === selectedLocation.district && l.block === selectedLocation.block).map(l => l.village))];

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('district')
      .order('block')
      .order('village');

    if (data) {
      setLocations(data);
    }
  }

  async function handleAutoDetect() {
    setDetecting(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      const nearestLocation = findNearestLocation(latitude, longitude);

      if (nearestLocation) {
        setSelectedLocation({
          district: nearestLocation.district,
          block: nearestLocation.block,
          village: nearestLocation.village,
        });

        onLocationSelect({
          district: nearestLocation.district,
          block: nearestLocation.block,
          village: nearestLocation.village,
          latitude,
          longitude,
        });

        toast({
          title: t('locationDetected'),
          description: `${nearestLocation.district}, ${nearestLocation.block}`,
        });
      }
    } catch (error) {
      toast({
        title: t('locationError'),
        description: 'Please select location manually',
        variant: 'destructive',
      });
    } finally {
      setDetecting(false);
    }
  }

  function findNearestLocation(lat: number, lon: number): Location | null {
    if (locations.length === 0) return null;

    let nearest = locations[0];
    let minDistance = getDistance(lat, lon, nearest.latitude, nearest.longitude);

    for (const location of locations) {
      const distance = getDistance(lat, lon, location.latitude, location.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }

    return nearest;
  }

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function handleManualSelect() {
    if (!selectedLocation.district) return;

    const location = locations.find(
      l => l.district === selectedLocation.district &&
        l.block === selectedLocation.block &&
        l.village === selectedLocation.village
    );

    onLocationSelect({
      district: selectedLocation.district,
      block: selectedLocation.block || undefined,
      village: selectedLocation.village || undefined,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });

    toast({
      title: t('success'),
      description: `${selectedLocation.district} selected`,
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <MapPin className="w-5 h-5 md:w-6 md:h-6" />
          {t('selectLocation')}
        </CardTitle>
        <CardDescription className="text-base">{t('location')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleAutoDetect}
          disabled={detecting}
          className="w-full text-base py-6"
          size="lg"
        >
          {detecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('detectingLocation')}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-5 w-5" />
              {t('autoDetect')}
            </>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('manualSelect')}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('district')}</label>
            <Select
              value={selectedLocation.district}
              onValueChange={(value) => setSelectedLocation({ ...selectedLocation, district: value, block: '', village: '' })}
            >
              <SelectTrigger className="w-full text-base py-6">
                <SelectValue placeholder={t('selectDistrict')} />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map(district => (
                  <SelectItem key={district} value={district} className="text-base py-3">
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLocation.district && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('block')}</label>
              <Select
                value={selectedLocation.block}
                onValueChange={(value) => setSelectedLocation({ ...selectedLocation, block: value, village: '' })}
              >
                <SelectTrigger className="w-full text-base py-6">
                  <SelectValue placeholder={t('selectBlock')} />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map(block => (
                    <SelectItem key={block} value={block} className="text-base py-3">
                      {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedLocation.block && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('village')}</label>
              <Select
                value={selectedLocation.village}
                onValueChange={(value) => setSelectedLocation({ ...selectedLocation, village: value })}
              >
                <SelectTrigger className="w-full text-base py-6">
                  <SelectValue placeholder={t('selectVillage')} />
                </SelectTrigger>
                <SelectContent>
                  {villages.map(village => (
                    <SelectItem key={village} value={village} className="text-base py-3">
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedLocation.district && (
            <Button onClick={handleManualSelect} className="w-full text-base py-6" size="lg">
              {t('save')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
