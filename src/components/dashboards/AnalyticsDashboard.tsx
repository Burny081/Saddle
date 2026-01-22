import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    DollarSign,
    Calendar,
    Activity,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useData } from '@/contexts/DataContext';
import {
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    totalClients: number;
    clientsGrowth: number;
    lowStock: number;
    stockGrowth: number;
}

interface SalesData {
    name: string;
    ventes: number;
    benefice: number;
}

interface CategoryData {
    name: string;
    value: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard() {
    const { sales, clients, articles } = useData();
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalOrders: 0,
        ordersGrowth: 0,
        totalClients: 0,
        clientsGrowth: 0,
        lowStock: 0,
        stockGrowth: 0
    });
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);

    useEffect(() => {
        calculateStats();
        prepareSalesData();
        prepareCategoryData();
        prepareTopProducts();
    }, [sales, clients, articles]);

    const calculateStats = () => {
        // Calculate total revenue
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        
        // Calculate this month vs last month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const thisMonthSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });
        
        const lastMonthSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
        });
        
        const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.total, 0);
        const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.total, 0);
        const revenueGrowth = lastMonthRevenue === 0 ? 0 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        
        // Calculate orders growth
        const ordersGrowth = lastMonthSales.length === 0 ? 0 : ((thisMonthSales.length - lastMonthSales.length) / lastMonthSales.length) * 100;
        
        // Calculate clients growth (last 30 days)
        const clientsGrowth = 12; // Placeholder
        
        // Calculate low stock items
        const lowStockItems = articles.filter(article => article.stock <= article.minStock).length;
        
        setStats({
            totalRevenue,
            revenueGrowth,
            totalOrders: sales.length,
            ordersGrowth,
            totalClients: clients.length,
            clientsGrowth,
            lowStock: lowStockItems,
            stockGrowth: -5 // Negative because low stock is bad
        });
    };

    const prepareSalesData = () => {
        // Get last 7 days of sales
        const last7Days: SalesData[] = [];
        const now = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            
            const daySales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.toDateString() === date.toDateString();
            });
            
            const totalSales = daySales.reduce((sum, sale) => sum + sale.total, 0);
            const totalProfit = daySales.reduce((sum, sale) => {
                // Calculate profit (assuming 30% margin)
                return sum + (sale.total * 0.3);
            }, 0);
            
            last7Days.push({
                name: dayName,
                ventes: Math.round(totalSales),
                benefice: Math.round(totalProfit)
            });
        }
        
        setSalesData(last7Days);
    };

    const prepareCategoryData = () => {
        const categoryMap = new Map<string, number>();
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (item.type === 'article') {
                    const article = articles.find(a => a.id === item.id);
                    if (article) {
                        const category = article.category || 'Autre';
                        categoryMap.set(category, (categoryMap.get(category) || 0) + item.price * item.quantity);
                    }
                }
            });
        });
        
        const data = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
        
        setCategoryData(data);
    };

    const prepareTopProducts = () => {
        const productMap = new Map<string, { name: string; quantity: number }>();
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = productMap.get(item.id);
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    productMap.set(item.id, { name: item.name, quantity: item.quantity });
                }
            });
        });
        
        const top = Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(item => ({ name: item.name, sales: item.quantity }));
        
        setTopProducts(top);
    };

    const StatCard = ({ 
        title, 
        value, 
        growth, 
        icon: Icon, 
        color 
    }: { 
        title: string; 
        value: string; 
        growth: number; 
        icon: any; 
        color: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <h3 className="text-2xl font-bold mt-2">{value}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                {growth >= 0 ? (
                                    <>
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">
                                            +{growth.toFixed(1)}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-600">
                                            {growth.toFixed(1)}%
                                        </span>
                                    </>
                                )}
                                <span className="text-sm text-muted-foreground ml-1">vs mois dernier</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-full ${color}`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tableau de Bord Analytique</h1>
                    <p className="text-muted-foreground mt-1">
                        Vue d'ensemble des performances de votre entreprise
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Cette semaine
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Chiffre d'affaires"
                    value={formatCurrency(stats.totalRevenue)}
                    growth={stats.revenueGrowth}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Commandes"
                    value={stats.totalOrders.toString()}
                    growth={stats.ordersGrowth}
                    icon={ShoppingCart}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Clients"
                    value={stats.totalClients.toString()}
                    growth={stats.clientsGrowth}
                    icon={Users}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Stock bas"
                    value={stats.lowStock.toString()}
                    growth={stats.stockGrowth}
                    icon={Package}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Ventes des 7 derniers jours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="ventes" 
                                    stroke="#3b82f6" 
                                    fillOpacity={1} 
                                    fill="url(#colorVentes)" 
                                    name="Ventes"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="benefice" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorBenefice)" 
                                    name="Bénéfice"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ventes par catégorie
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top 5 Produits les plus vendus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => {
                            const maxSales = topProducts[0]?.sales || 1;
                            const percentage = (product.sales / maxSales) * 100;
                            
                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{product.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {product.sales} unités
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
