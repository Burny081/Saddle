import { useState } from 'react';
import { MapPin, Wifi, Globe, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getUserLocation, formatLocation, type IPLocationData } from '@/utils/ipLocation';

export default function LocationDashboard() {
  const [location, setLocation] = useState<IPLocationData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLocation = async () => {
    setLoading(true);
    try {
      const data = await getUserLocation();
      setLocation(data);
    } catch (error) {
      console.error('Erreur chargement localisation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Votre Localisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Détection en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Localisation non demandée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Demandez votre localisation approximative uniquement si vous souhaitez la consulter.</p>
          <Button type="button" className="mt-4" onClick={loadLocation}>
            <MapPin className="mr-2 h-4 w-4" />
            Afficher ma localisation approximative
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Votre Localisation
          <span className="ml-auto text-xs font-normal text-gray-500">
            Demandée par vous
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Localisation principale */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Localisation</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatLocation(location)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Détectée via votre connexion Internet après votre demande
              </p>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Ville</p>
              <p className="font-medium text-gray-900">{location.city}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Région</p>
              <p className="font-medium text-gray-900">{location.region}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Pays</p>
              <p className="font-medium text-gray-900">
                {location.country} ({location.country_code})
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Fuseau horaire</p>
              <p className="font-medium text-gray-900">{location.timezone}</p>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Adresse IP:</span>
              <span className="font-mono font-medium text-gray-900">{location.ip}</span>
            </div>

            {location.isp && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Fournisseur:</span>
                <span className="font-medium text-gray-900">{location.isp}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Coordonnées:</span>
              <span className="font-mono text-xs text-gray-900">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Note de sécurité */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note de sécurité:</strong> Ces informations sont détectées automatiquement 
              pour des raisons de sécurité et de conformité. Elles ne peuvent pas être modifiées 
              manuellement et sont utilisées pour protéger votre compte.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
