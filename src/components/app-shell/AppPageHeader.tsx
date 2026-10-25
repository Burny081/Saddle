import type { ReactNode } from 'react';

interface AppPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function AppPageHeader({ title, description, eyebrow, actions }: AppPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#b7212d]">{eyebrow}</p>}
        <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
