import { motion } from 'motion/react';

export function SplashScreen() {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <main className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#fcfcfb] px-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#b7212d]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#124a93]/10" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-48 w-48 rounded-full border border-[#124a93]/10" />

      <motion.section
        className="w-full max-w-sm"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: 'easeOut' }}
        aria-label="Chargement de SaddlePoint"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_-20px_rgba(15,23,42,.55)] dark:border-slate-700 dark:bg-slate-900">
            <img src="/logo.png" alt="Saddle Point Service" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="company-name text-sm text-slate-950 dark:text-white">SaddlePoint</p>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b7212d]">Electrical solutions</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Préparation de votre espace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Chargement sécurisé des outils SaddlePoint.</p>
          <div
            className="mt-5 h-1.5 w-full overflow-hidden bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-label="Préparation de votre espace"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext="Chargement en cours"
          >
            <motion.div
              className="h-full bg-[#124a93]"
              initial={{ width: '10%' }}
              animate={prefersReducedMotion ? { width: '68%' } : { width: ['10%', '72%', '92%'] }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
            <span>Cameroon</span>
            <span>Secure start</span>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
