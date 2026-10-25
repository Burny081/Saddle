import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const tones: Record<StatusTone, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200',
};

export function StatusBadge({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  return <span className={cn('inline-flex items-center gap-1 border px-2 py-0.5 text-xs font-bold', tones[tone])}>{children}</span>;
}
