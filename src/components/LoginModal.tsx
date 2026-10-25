import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, AlertCircle, UserPlus, User, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setError('');
    setSuccess('');
    setLocationConsent(false);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const getLocationFromBrowser = async () => {
    setGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || '';
          const country = data.address.country || '';
          const locationString = [city, country].filter(Boolean).join(', ');
          setAddress(locationString || data.display_name);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginSuccess = await login(email, password, locationConsent);
      if (loginSuccess) {
        resetForm();
        onClose();
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch {
      setError(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMin'));
      setLoading(false);
      return;
    }

    try {
      const result = await register({ name, email, password, phone, address, locationConsent });
      if (result.success) {
        resetForm();
        setSuccess(t('auth.signupSuccess'));
        // Switch to login mode after 2 seconds
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
        }, 2000);
      } else {
        setError(result.error || t('auth.signupError'));
      }
    } catch {
      setError(t('auth.signupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative my-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_28px_80px_-30px_rgba(15,23,42,.55)]">
                <div className="relative border-b border-white/10 bg-slate-950 px-6 py-6 text-white sm:px-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-white hover:bg-white/15"
                    onClick={onClose}
                    aria-label={t('auth.closeModal')}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center border border-white/15 bg-white p-2.5 shadow-lg">
                    <img src="/logo.png" alt="SPS" className="h-full w-full object-contain" />
                  </div>

                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-200">Espace client SaddlePoint</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
                    {isLoginMode ? t('auth.login') : t('auth.registration')}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    {isLoginMode ? t('auth.welcome') : t('auth.createAccount')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1 border-b border-border bg-muted/40 p-2" role="tablist" aria-label="Mode d'authentification">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isLoginMode}
                    onClick={() => !isLoginMode && switchMode()}
                    className={`h-10 px-3 text-sm font-bold transition-colors ${isLoginMode ? 'bg-white text-[#124a93] shadow-sm dark:bg-slate-900 dark:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Se connecter
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isLoginMode}
                    onClick={() => isLoginMode && switchMode()}
                    className={`h-10 px-3 text-sm font-bold transition-colors ${!isLoginMode ? 'bg-white text-[#124a93] shadow-sm dark:bg-slate-900 dark:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Créer un compte
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="flex-1 overflow-y-auto p-6 sm:p-8">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{success}</span>
                    </motion.div>
                  )}

                  <div className="space-y-5">
                    {/* Registration Fields */}
                    {!isLoginMode && (
                      <div>
                          <Label htmlFor="name" className="text-sm font-bold">
                          {t('auth.name')} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 pl-11 text-base"
                            placeholder="Jean Dupont"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                          <Label htmlFor="email" className="text-sm font-bold">
                        {t('auth.email')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-11 text-base"
                          placeholder="exemple@email.com"
                          required
                        />
                      </div>
                    </div>

                    {!isLoginMode && (
                      <>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-bold">
                            {t('auth.phone')}
                          </Label>
                          <div className="relative mt-2">
                            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="h-12 pl-11 text-base"
                              placeholder="+237 6XX XX XX XX"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address" className="text-sm font-bold">
                            {t('auth.address')}
                          </Label>
                          <div className="relative mt-2">
                            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              id="address"
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="h-12 pl-11 text-base"
                              placeholder="Yaoundé, Cameroun"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={getLocationFromBrowser}
                            disabled={gettingLocation}
                          >
                            {gettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                            Utiliser ma position actuelle
                          </Button>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Cette action demande la position de votre appareil pour préremplir l'adresse.
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                          <Label htmlFor="password" className="text-sm font-bold">
                        {t('auth.password')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pl-11 text-base"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    {!isLoginMode && (
                      <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-bold">
                          {t('auth.confirmPassword')} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 pl-11 text-base"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="location-consent"
                          checked={locationConsent}
                          onCheckedChange={(checked) => setLocationConsent(checked === true)}
                          className="mt-0.5"
                        />
                        <div className="space-y-1.5">
                          <Label htmlFor="location-consent" className="cursor-pointer text-sm font-medium">
                            Partager mon IP et ma localisation approximative pour la sécurité du compte
                          </Label>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Optionnel. Avec votre accord, nous interrogeons des services tiers pour enregistrer la ville, le pays et l'adresse IP de cette connexion. Sans accord, vous pouvez toujours vous connecter ou créer un compte.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full bg-[#124a93] text-base font-bold text-white transition-colors hover:bg-[#0b3978]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {t('loading')}
                        </div>
                      ) : (
                        <>
                          {isLoginMode ? t('auth.signin') : t('auth.register')}
                          {isLoginMode ? <LogIn className="ml-2 h-5 w-5" /> : <UserPlus className="ml-2 h-5 w-5" />}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help text */}
                  {isLoginMode && (
                    <div className="mt-6 border-l-2 border-[#b7212d] bg-muted/55 p-4">
                      <p className="text-center text-sm text-muted-foreground">
                        {t('auth.contactAdmin')}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
