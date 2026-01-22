import { useState, useEffect } from 'react';
import { Shield, Monitor, Smartphone, Globe, Clock, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActivity: Date;
  isCurrent: boolean;
  createdAt: Date;
}

export default function SessionManagement() {
  const { } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);

  useEffect(() => {
    // Sample data - in production, fetch from API
    const sampleSessions: UserSession[] = [
      {
        id: '1',
        deviceName: 'Windows PC',
        deviceType: 'desktop',
        browser: 'Chrome 120',
        os: 'Windows 11',
        ipAddress: '192.168.1.100',
        location: 'Yaoundé, Cameroun',
        lastActivity: new Date(),
        isCurrent: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        deviceName: 'iPhone 14',
        deviceType: 'mobile',
        browser: 'Safari 17',
        os: 'iOS 17',
        ipAddress: '192.168.1.105',
        location: 'Douala, Cameroun',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        isCurrent: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        deviceName: 'MacBook Pro',
        deviceType: 'desktop',
        browser: 'Firefox 121',
        os: 'macOS Sonoma',
        ipAddress: '192.168.1.110',
        location: 'Yaoundé, Cameroun',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isCurrent: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];
    setSessions(sampleSessions);
  }, []);

  const getDeviceIcon = (type: UserSession['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    return `Il y a ${Math.floor(seconds / 86400)} jour${Math.floor(seconds / 86400) > 1 ? 's' : ''}`;
  };

  const handleRevokeSession = (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer cette session ?')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      alert('Session révoquée avec succès');
    }
  };

  const handleRevokeAll = () => {
    if (confirm('Êtes-vous sûr de vouloir révoquer toutes les autres sessions ? Vous devrez vous reconnecter sur ces appareils.')) {
      setSessions(prev => prev.filter(s => s.isCurrent));
      alert('Toutes les autres sessions ont été révoquées');
    }
  };

  const activeCount = sessions.filter(s => {
    const minutesSinceActivity = (Date.now() - s.lastActivity.getTime()) / (1000 * 60);
    return minutesSinceActivity < 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Gestion des Sessions
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos sessions actives sur différents appareils
          </p>
        </div>
        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <Button variant="destructive" onClick={handleRevokeAll}>
            Révoquer toutes les autres sessions
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions totales</p>
                <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
              </div>
              <Monitor className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions actives</p>
                <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Appareils</p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(sessions.map(s => s.deviceName)).size}
                </p>
              </div>
              <Smartphone className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map(session => (
          <Card key={session.id} className={session.isCurrent ? 'border-2 border-blue-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                {/* Left side */}
                <div className="flex gap-4 flex-1">
                  {/* Device Icon */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${session.isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {getDeviceIcon(session.deviceType)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{session.deviceName}</h3>
                      {session.isCurrent && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Session actuelle
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>{session.browser} sur {session.os}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Dernière activité: {formatTimeAgo(session.lastActivity)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">IP: {session.ipAddress}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Connecté depuis: {session.createdAt.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Right side */}
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Révoquer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Conseils de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Si vous voyez une session que vous ne reconnaissez pas, révoquez-la immédiatement</p>
          <p>• Révoquez régulièrement les sessions inactives</p>
          <p>• Activez la vérification en deux étapes pour plus de sécurité</p>
          <p>• Ne vous connectez jamais depuis un ordinateur public sans vous déconnecter</p>
          <p>• Surveillez régulièrement vos sessions actives</p>
        </CardContent>
      </Card>
    </div>
  );
}
