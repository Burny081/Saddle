import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface AppPanelProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AppPanel({ children, title, description, action, className }: AppPanelProps) {
  return (
    <section className={cn('border border-border bg-card shadow-[0_14px_34px_-28px_rgba(15,23,42,.42)]', className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title && <h2 className="font-[var(--font-display)] text-base font-bold tracking-[-0.02em] text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
