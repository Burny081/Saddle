import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setEmail('');
        setPassword('');
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

                  <h2 className="text-3xl font-bold">{t('auth.login')}</h2>
                  <p className="mt-2 text-blue-100">{t('auth.welcome')}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="text-base">
                        {t('auth.email')}
                      </Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-11 text-base"
                          placeholder="exemple@sps.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-base">
                        {t('auth.password')}
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
                        />
                      </div>
                    </div>

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
                          {t('auth.signin')}
                          <LogIn className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help text */}
                  <div className="mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      {t('auth.contactAdmin')}
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
