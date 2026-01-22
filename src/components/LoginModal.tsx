import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, AlertCircle, UserPlus, User, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
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
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginSuccess = await login(email, password);
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
      const result = await register({ name, email, password, phone, address });
      if (result.success) {
        setSuccess(t('auth.signupSuccess'));
        resetForm();
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-red-600 to-blue-600 p-8 text-white">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-white hover:bg-white/20"
                    onClick={onClose}
                    aria-label={t('auth.closeModal')}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-4 shadow-xl">
                    <img src="/logo.png" alt="SPS" className="h-full w-full object-contain" />
                  </div>

                  <h2 className="text-3xl font-bold">
                    {isLoginMode ? t('auth.login') : t('auth.registration')}
                  </h2>
                  <p className="mt-2 text-blue-100">
                    {isLoginMode ? t('auth.welcome') : t('auth.createAccount')}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="p-8">
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
                        <Label htmlFor="name" className="text-base">
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
                      <Label htmlFor="email" className="text-base">
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
                          <Label htmlFor="phone" className="text-base">
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
                          <Label htmlFor="address" className="text-base">
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
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="password" className="text-base">
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
                        <Label htmlFor="confirmPassword" className="text-base">
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

                    <Button
                      type="submit"
                      className="h-12 w-full bg-gradient-to-r from-red-600 to-blue-600 text-base font-semibold hover:from-red-700 hover:to-blue-700"
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

                  {/* Switch mode */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {isLoginMode ? t('auth.noAccount') : t('auth.alreadyHaveAccount')}
                    </button>
                  </div>

                  {/* Help text */}
                  {isLoginMode && (
                    <div className="mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
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
