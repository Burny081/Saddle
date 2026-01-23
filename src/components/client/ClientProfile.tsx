import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

export default function ClientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  useEffect(() => {
    fetchLocationInfo();
  }, [user]);

  const fetchLocationInfo = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('last_login_ip, last_login_location, last_login_country, timezone, last_login')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setLocationInfo(data);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state would require context update
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos informations personnelles</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" className="dark:border-slate-600 dark:text-gray-300">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations Personnelles */}
        <Card className="lg:col-span-2 dark:bg-slate-800 border-0 shadow-lg">
          <CardHeader className="border-b dark:border-slate-700">
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nom Complet
              </label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                L'email ne peut pas être modifié pour des raisons de sécurité
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Téléphone
              </label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+237 XXX XXX XXX"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              ) : (
                <p className="text-lg text-gray-900 dark:text-white">{user.phone || 'Non renseigné'}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Adresse
              </label>
              {isEditing ? (
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Votre adresse complète"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              ) : (
                <p className="text-lg text-gray-900 dark:text-white">{user.address || 'Non renseignée'}</p>
              )}
            </div>

            {/* Date de création */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Membre depuis
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de Connexion */}
        <div className="space-y-6">
          {/* Statut */}
          <Card className="dark:bg-slate-800 border-0 shadow-lg">
            <CardHeader className="border-b dark:border-slate-700">
              <CardTitle className="text-base dark:text-white">Statut du Compte</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rôle</span>
                <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                  Client
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Actif
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          {locationInfo && (
            <Card className="dark:bg-slate-800 border-0 shadow-lg">
              <CardHeader className="border-b dark:border-slate-700">
                <CardTitle className="text-base flex items-center gap-2 dark:text-white">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Dernière Connexion
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {locationInfo.last_login_location && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Localisation</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {locationInfo.last_login_location}
                    </p>
                  </div>
                )}
                {locationInfo.last_login_ip && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Adresse IP</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {locationInfo.last_login_ip}
                    </p>
                  </div>
                )}
                {locationInfo.timezone && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fuseau horaire</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {locationInfo.timezone}
                    </p>
                  </div>
                )}
                {locationInfo.last_login && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(locationInfo.last_login).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
