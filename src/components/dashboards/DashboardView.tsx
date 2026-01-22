import { motion } from 'motion/react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from './components/StatsCard';
import { SalesChart } from './components/SalesChart';
import { RecentSales } from './components/RecentSales';
import { QuickActions } from './components/QuickActions';
import { formatCurrency } from '@/config/constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { articles, sales } = useData();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockCount = articles.filter((a) => (a.stock || 0) < (a.minStock || 0)).length;

  const stats = [
    {
      title: 'Monthly Sales',
      value: `${sales.length}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      roles: ['superadmin', 'admin', 'commercial', 'secretaire', 'comptable'],
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      roles: ['superadmin', 'admin', 'commercial', 'comptable'],
    },
    {
      title: 'Stock Items',
      value: `${articles.length}`,
      change: '-3.1%',
      changeType: 'negative' as const,
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      roles: ['superadmin', 'admin', 'manager'],
    },
    {
      title: 'Alerts',
      value: `${lowStockCount}`,
      change: '+2',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      gradient: 'from-orange-500 to-red-600',
      roles: ['superadmin', 'admin', 'manager'],
    },
  ];

  const filteredStats = stats.filter((stat) => user && stat.roles.includes(user.role));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={{ hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } }}>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {t('dashboard.welcome')}, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Here is what's happening with your business today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7 h-[500px]">
        {/* Main Chart - Takes 4/7 columns */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <SalesChart />
        </div>

        {/* Sidebar Widgets - Takes 3/7 columns */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-[200px]">
            <RecentSales />
          </div>
          <div className="h-auto">
            <QuickActions onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
