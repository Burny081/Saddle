import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Package,
    ShoppingCart,
    Calendar,
    FileDown,
    ArrowLeft,
    Briefcase,
    PieChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompanyInfo } from '@/contexts/CompanyContext';
import { formatCurrency } from '@/config/constants';
import { generateBusinessReport } from '@/utils/pdfGenerator';

interface ReportsViewProps {
    onBack?: () => void;
}

export function ReportsView({ onBack }: ReportsViewProps) {
    const { sales, articles, services, clients } = useData();
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const companyInfo = useCompanyInfo();

    // Calculate key metrics
    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Filter sales by month
        const currentMonthSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });

        const lastMonthSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
        });

        // Revenue calculations
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const currentMonthRevenue = currentMonthSales.reduce((sum, s) => sum + s.total, 0);
        const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + s.total, 0);
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : currentMonthRevenue > 0 ? 100 : 0;

        // Paid vs Pending
        const paidAmount = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
        const pendingAmount = totalRevenue - paidAmount;

        // Stock value
        const stockValue = articles.reduce((sum, a) => sum + a.price * a.stock, 0);
        const lowStockItems = articles.filter(a => a.stock < a.minStock).length;

        // Average sale value
        const averageSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;

        // Top selling categories
        const categoryRevenue: Record<string, number> = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const article = articles.find(a => a.id === item.id);
                if (article) {
                    categoryRevenue[article.category] = (categoryRevenue[article.category] || 0) + (item.price * item.quantity);
                }
            });
        });

        const topCategories = Object.entries(categoryRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, revenue]) => ({ category, revenue }));

        // Monthly breakdown
        const monthlyData: { month: string; revenue: number; sales: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentYear, currentMonth - i, 1);
            const monthSales = sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate.getMonth() === month.getMonth() && saleDate.getFullYear() === month.getFullYear();
            });
            monthlyData.push({
                month: month.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
                revenue: monthSales.reduce((sum, s) => sum + s.total, 0),
                sales: monthSales.length
            });
        }

        return {
            totalRevenue,
            currentMonthRevenue,
            revenueGrowth,
            paidAmount,
            pendingAmount,
            stockValue,
            lowStockItems,
            averageSaleValue,
            topCategories,
            monthlyData,
            totalSales: sales.length,
            totalClients: clients.length,
            totalArticles: articles.length,
            totalServices: services.length,
        };
    }, [sales, articles, services, clients, language]);

    const maxMonthlyRevenue = Math.max(...metrics.monthlyData.map(m => m.revenue), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                            aria-label={t('action.backToDashboard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {t('reports.subtitle')} {companyInfo.name}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => generateBusinessReport({
                        totalRevenue: metrics.totalRevenue,
                        currentMonthRevenue: metrics.currentMonthRevenue,
                        revenueGrowth: metrics.revenueGrowth,
                        paidAmount: metrics.paidAmount,
                        pendingAmount: metrics.pendingAmount,
                        stockValue: metrics.stockValue,
                        lowStockItems: metrics.lowStockItems,
                        averageSaleValue: metrics.averageSaleValue,
                        totalSales: sales.length,
                        totalClients: clients.length,
                        totalArticles: articles.length,
                        totalServices: services.length,
                        topCategories: metrics.topCategories,
                        monthlyData: metrics.monthlyData
                    }, companyInfo.name)}
                    className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white"
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    {t('action.exportPdf')}
                </Button>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card className="border-none shadow-lg border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.totalRevenue')}</p>
                                    <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                        {metrics.revenueGrowth >= 0 ? (
                                            <span className="flex items-center text-green-600">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                +{metrics.revenueGrowth.toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600">
                                                <TrendingDown className="h-3 w-3 mr-1" />
                                                {metrics.revenueGrowth.toFixed(1)}%
                                            </span>
                                        )}
                                        <span className="text-slate-500">{t('reports.vsPreviousMonth')}</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-none shadow-lg border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.paidAmount')}</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(metrics.paidAmount)}</p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {((metrics.paidAmount / metrics.totalRevenue) * 100 || 0).toFixed(1)}% {t('reports.ofTotal')}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 text-white">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-none shadow-lg border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.pendingPayments')}</p>
                                    <p className="mt-1 text-2xl font-bold text-orange-600">{formatCurrency(metrics.pendingAmount)}</p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {((metrics.pendingAmount / metrics.totalRevenue) * 100 || 0).toFixed(1)}% {t('reports.toCollect')}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 text-white">
                                    <Calendar className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-none shadow-lg border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.stockValue')}</p>
                                    <p className="mt-1 text-2xl font-bold">{formatCurrency(metrics.stockValue)}</p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {metrics.lowStockItems > 0 && (
                                            <span className="text-red-500">{metrics.lowStockItems} {t('reports.lowStockItems')}</span>
                                        )}
                                        {metrics.lowStockItems === 0 && (language === 'fr' ? 'Stock optimal' : 'Optimal stock')}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white">
                                    <Package className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                                {t('reports.monthlyTrend')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end justify-between gap-2">
                                {metrics.monthlyData.map((month, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex items-end justify-center reports-bar-container">
                                            <div
                                                className={
                                                    `w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 cursor-pointer relative group reports-bar` +
                                                    (month.revenue > 0 ? ' reports-bar-min' : '')
                                                }
                                                title={`${month.month}: ${formatCurrency(month.revenue)}`}
                                                data-barheight={(month.revenue / maxMonthlyRevenue) * 100}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatCurrency(month.revenue)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{month.month}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-500" />
                                {t('reports.topCategories')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics.topCategories.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.topCategories.map((cat, index) => {
                                        const percentage = (cat.revenue / metrics.totalRevenue) * 100;
                                        const colors = [
                                            'from-blue-500 to-blue-600',
                                            'from-green-500 to-green-600',
                                            'from-purple-500 to-purple-600',
                                            'from-orange-500 to-orange-600',
                                            'from-red-500 to-red-600',
                                        ];
                                        return (
                                            <div key={cat.category} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{index + 1}. {cat.category}</span>
                                                    <span className="text-muted-foreground">
                                                        {formatCurrency(cat.revenue)} ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500 reports-bar-progress`}
                                                        data-barwidth={percentage}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                    <PieChart className="h-12 w-12 mb-2 opacity-50" />
                                    <p>{t('empty.noData')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="border-none shadow-lg text-center p-6">
                        <ShoppingCart className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-3xl font-bold">{metrics.totalSales}</p>
                        <p className="text-sm text-muted-foreground">{t('reports.totalSales')}</p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="border-none shadow-lg text-center p-6">
                        <Users className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <p className="text-3xl font-bold">{metrics.totalClients}</p>
                        <p className="text-sm text-muted-foreground">{t('clients.title')}</p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Card className="border-none shadow-lg text-center p-6">
                        <Package className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <p className="text-3xl font-bold">{metrics.totalArticles}</p>
                        <p className="text-sm text-muted-foreground">{t('articles.title')}</p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <Card className="border-none shadow-lg text-center p-6">
                        <Briefcase className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                        <p className="text-3xl font-bold">{metrics.totalServices}</p>
                        <p className="text-sm text-muted-foreground">{t('services.title')}</p>
                    </Card>
                </motion.div>
            </div>

            {/* Company Info Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <Card className="border-none shadow-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold company-name">{companyInfo.name}</h3>
                                <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <p>{language === 'fr' ? 'Rapport généré le' : 'Report generated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                                <p>{language === 'fr' ? 'Par' : 'By'}: {user?.name || (language === 'fr' ? 'Utilisateur' : 'User')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
