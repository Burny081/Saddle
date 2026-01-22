import { useState, useEffect } from 'react';
import { MapPin, Globe, Wifi, Clock, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { getUserLocation, formatLocation, type IPLocationData } from '@/utils/ipLocation';

interface UserLocationInfo {
  last_login_ip?: string;
  last_login_location?: string;
  last_login_country?: string;
  timezone?: string;
  last_login?: string;
}

export default function UserLocationCard() {
  const { user } = useAuth();
  const [locationInfo, setLocationInfo] = useState<UserLocationInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<IPLocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLocationInfo();
    detectCurrentLocation();
  }, [user]);

  const loadUserLocationInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_login_ip, last_login_location, last_login_country, timezone, last_login')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setLocationInfo(data);
      }
    } catch (error) {
      console.error('Erreur chargement localisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectCurrentLocation = async () => {
    const location = await getUserLocation();
    setCurrentLocation(location);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasLocationData = locationInfo?.last_login_location || currentLocation;

  return (
    <div className="space-y-4">
      {/* Localisation actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-green-600" />
            Localisation Actuelle
            <span className="ml-auto text-xs font-normal text-gray-500 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Détection automatique
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <Globe className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Vous êtes à</p>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {formatLocation(currentLocation)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Détectée via votre connexion Internet
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 truncate">IP:</span>
                  <span className="font-mono font-medium text-gray-900 truncate">{currentLocation.ip}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 truncate">Fuseau:</span>
                  <span className="font-medium text-gray-900 truncate">{currentLocation.timezone}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <AlertCircle className="h-4 w-4" />
              Localisation indisponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dernière connexion */}
      {locationInfo?.last_login_location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-blue-600" />
              Dernière Connexion Enregistrée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">Localisation</p>
                  <p className="text-base font-semibold text-gray-900 break-words">
                    {locationInfo.last_login_location}
                  </p>
                  {locationInfo.last_login && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(locationInfo.last_login).toLocaleString('fr-FR', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {locationInfo.last_login_ip && (
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Adresse IP:</span>
                  <span className="font-mono font-medium text-gray-900">
                    {locationInfo.last_login_ip}
                  </span>
                </div>
              )}

              {locationInfo.timezone && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Fuseau horaire:</span>
                  <span className="font-medium text-gray-900">{locationInfo.timezone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note de sécurité */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-2">
          <Shield className="h-4 w-4 text-yellow-700 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-yellow-800">Protection de Sécurité</p>
            <p className="text-xs text-yellow-700 mt-1">
              Ces informations sont détectées automatiquement pour protéger votre compte.
              Elles ne peuvent pas être modifiées manuellement et sont utilisées pour détecter 
              les connexions suspectes depuis des localisations inhabituelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
