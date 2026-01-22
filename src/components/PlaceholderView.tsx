import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderView({ title, description, icon: Icon }: PlaceholderViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="flex min-h-[400px] flex-col items-center justify-center border-none p-12 text-center shadow-lg">
          <div className="mb-6 rounded-full bg-gradient-to-br from-red-500 to-blue-600 p-8 text-white shadow-xl">
            <Icon className="h-16 w-16" />
          </div>
          <h2 className="mb-3 text-2xl font-bold">Section en développement</h2>
          <p className="max-w-md text-slate-600 dark:text-slate-400">
            Cette fonctionnalité sera bientôt disponible avec toutes les capacités de gestion avancées.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
