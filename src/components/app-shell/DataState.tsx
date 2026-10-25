import type { ReactNode } from 'react';
import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

type DataStateKind = 'loading' | 'empty' | 'error';

interface DataStateProps {
  kind: DataStateKind;
  title: string;
  description?: string;
  action?: ReactNode;
}

const icons = { loading: LoaderCircle, empty: Inbox, error: AlertCircle };

export function DataState({ kind, title, description, action }: DataStateProps) {
  const Icon = icons[kind];
  return (
    <div role="status" className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${kind === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        <Icon className={`h-5 w-5 ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
      </span>
      <h2 className="mt-4 font-[var(--font-display)] text-base font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
