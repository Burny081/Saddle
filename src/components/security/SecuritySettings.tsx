import { useState } from 'react';
import { Shield, Key, Smartphone, Lock, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function SecuritySettings() {
  const { } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: { met: false, label: 'Au moins 8 caractères' },
    hasUppercase: { met: false, label: 'Au moins une majuscule' },
    hasLowercase: { met: false, label: 'Au moins une minuscule' },
    hasNumber: { met: false, label: 'Au moins un chiffre' },
    hasSpecial: { met: false, label: 'Au moins un caractère spécial (!@#$%^&*)' }
  });

  const handleEnable2FA = () => {
    setShowQRCode(true);
    // In production, this would call an API to generate a secret and QR code
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      // In production, verify the code with the server
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      generateBackupCodes();
      alert('Authentification à deux facteurs activée avec succès !');
    } else {
      alert('Code de vérification invalide');
    }
  };

  const handleDisable2FA = () => {
    if (confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ? Cela réduira la sécurité de votre compte.')) {
      setTwoFactorEnabled(false);
      setBackupCodes([]);
      alert('Authentification à deux facteurs désactivée');
    }
  };

  const generateBackupCodes = () => {
    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, () => {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${part1}-${part2}`;
    });
    setBackupCodes(codes);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    alert('Codes de secours copiés dans le presse-papiers');
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordRequirements({
      minLength: { met: requirements.minLength, label: 'Au moins 8 caractères' },
      hasUppercase: { met: requirements.hasUppercase, label: 'Au moins une majuscule' },
      hasLowercase: { met: requirements.hasLowercase, label: 'Au moins une minuscule' },
      hasNumber: { met: requirements.hasNumber, label: 'Au moins un chiffre' },
      hasSpecial: { met: requirements.hasSpecial, label: 'Au moins un caractère spécial (!@#$%^&*)' }
    });

    // Calculate score
    Object.values(requirements).forEach(met => {
      if (met) score++;
    });

    // Determine strength label and color
    let label = '';
    let color = '';
    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Faible';
      color = 'bg-red-500';
    } else if (score === 3) {
      label = 'Moyen';
      color = 'bg-yellow-500';
    } else if (score === 4) {
      label = 'Bon';
      color = 'bg-blue-500';
    } else {
      label = 'Excellent';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, label, color });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Paramètres de Sécurité
        </h2>
        <p className="text-gray-600 mt-1">
          Gérez la sécurité de votre compte et protégez vos données
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Authentification à Deux Facteurs (2FA)
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de sécurité supplémentaire à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {twoFactorEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {twoFactorEnabled ? 'Activée' : 'Désactivée'}
                </p>
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled 
                    ? 'Votre compte est protégé par 2FA'
                    : 'Activez la 2FA pour sécuriser votre compte'
                  }
                </p>
              </div>
            </div>
            {!twoFactorEnabled ? (
              <Button onClick={handleEnable2FA} className="bg-blue-600 hover:bg-blue-700">
                Activer 2FA
              </Button>
            ) : (
              <Button onClick={handleDisable2FA} variant="destructive">
                Désactiver 2FA
              </Button>
            )}
          </div>

          {/* QR Code Setup */}
          {showQRCode && !twoFactorEnabled && (
            <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div>
                <h4 className="font-semibold mb-2">Étape 1: Scannez le QR Code</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Utilisez une application d'authentification (Google Authenticator, Authy, Microsoft Authenticator) pour scanner ce QR code
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {/* Placeholder QR Code - In production, use a real QR code library */}
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded border-2 border-gray-300">
                    <p className="text-gray-500 text-center px-4">
                      QR Code<br/>
                      <span className="text-xs">Scannez avec votre app d'authentification</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Ou entrez manuellement ce code: <span className="font-mono font-bold">ABCD EFGH IJKL MNOP</span>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Étape 2: Entrez le code de vérification</h4>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Code à 6 chiffres"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="font-mono text-lg text-center tracking-widest"
                    maxLength={6}
                  />
                  <Button onClick={handleVerify2FA} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Vérifier
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {twoFactorEnabled && backupCodes.length > 0 && (
            <div className="space-y-4 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Codes de Secours</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Sauvegardez ces codes en lieu sûr. Vous pouvez les utiliser si vous perdez l'accès à votre appareil d'authentification.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm bg-white p-2 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyBackupCodes} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copier les codes
                    </Button>
                    <Button onClick={generateBackupCodes} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Générer de nouveaux codes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Sécurité du Mot de Passe
          </CardTitle>
          <CardDescription>
            Assurez-vous que votre mot de passe est fort et sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nouveau mot de passe
            </label>
            <Input
              type="password"
              placeholder="Entrez un nouveau mot de passe"
              onChange={(e) => checkPasswordStrength(e.target.value)}
            />
          </div>

          {passwordStrength.label && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Force du mot de passe:</span>
                <Badge className={`${passwordStrength.color} text-white`}>
                  {passwordStrength.label}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Exigences du mot de passe:</p>
            <div className="space-y-1">
              {Object.entries(passwordRequirements).map(([key, req]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={req.met ? 'text-green-600' : 'text-gray-600'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              placeholder="Confirmez le nouveau mot de passe"
            />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Lock className="h-4 w-4 mr-2" />
            Changer le Mot de Passe
          </Button>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Conseils de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Activez l'authentification à deux facteurs pour une protection maximale</p>
          <p>✓ Utilisez un mot de passe unique et complexe</p>
          <p>✓ Changez votre mot de passe régulièrement (tous les 3-6 mois)</p>
          <p>✓ Ne partagez jamais votre mot de passe avec qui que ce soit</p>
          <p>✓ Utilisez un gestionnaire de mots de passe pour stocker vos identifiants</p>
          <p>✓ Vérifiez régulièrement vos sessions actives</p>
          <p>✓ Consultez le journal d'audit pour détecter toute activité suspecte</p>
        </CardContent>
      </Card>
    </div>
  );
}
