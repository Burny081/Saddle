import { useMemo } from 'react';
import { useVisitor } from '@/contexts/VisitorContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
    TrendingUp,
    TrendingDown,
    Users,
    MapPin,
    Clock,
    Smartphone,
    Monitor,
    Globe,
    FileDown,
    ArrowLeft
} from 'lucide-react';
import {
    getVisitorsByHour,
    getVisitorsByDate,
    getDeviceDistribution,
    getTopCities,
    getPeakHour,
    getGrowthRate
} from '@/utils/visitorAnalytics';
import { generateVisitorAnalyticsPDF } from '@/utils/visitorAnalyticsPDF';

interface VisitorAnalyticsViewProps {
    onBack?: () => void;
}

export function VisitorAnalyticsView({ onBack }: VisitorAnalyticsViewProps) {
    const { visitors } = useVisitor();
    const { t, language } = useLanguage();

    // Process data
    const cityData = useMemo(() => getTopCities(visitors, 10), [visitors]);
    const hourData = useMemo(() => getVisitorsByHour(visitors), [visitors]);
    const dateData = useMemo(() => getVisitorsByDate(visitors), [visitors]);
    const deviceData = useMemo(() => getDeviceDistribution(visitors), [visitors]);
    const peakHour = useMemo(() => getPeakHour(visitors), [visitors]);
    const growthRate = useMemo(() => getGrowthRate(visitors), [visitors]);

    const mobileCount = visitors.filter(v => v.device === 'Mobile').length;
    const desktopCount = visitors.filter(v => v.device === 'Desktop').length;

    const handleExportPDF = () => {
        generateVisitorAnalyticsPDF(
            visitors,
            cityData,
            hourData,
            deviceData,
            peakHour,
            growthRate,
            language
        );
    };

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
                            aria-label="Retour au tableau de bord"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {t('analytics.visitors.title')}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {t('analytics.visitors.subtitle')}
                        </p>
                    </div>
                </div>
                <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90">
                    <FileDown className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Exporter PDF' : 'Export PDF'}
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.total')}</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{visitors.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {growthRate >= 0 ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +{growthRate.toFixed(1)}% {t('analytics.growth')}
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3" />
                                    {growthRate.toFixed(1)}% {t('analytics.growth')}
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.topCity')}</CardTitle>
                        <MapPin className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cityData[0]?.city || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {cityData[0]?.count || 0} {t('analytics.visitors.count')} ({cityData[0]?.percentage.toFixed(1) || 0}%)
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.peakHour')}</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{peakHour.hour}h00</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {peakHour.count} {t('analytics.visitors.count')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.mobileVsDesktop')}</CardTitle>
                        <Smartphone className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((mobileCount / visitors.length) * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {mobileCount} {t('analytics.mobile')} / {desktopCount} {t('analytics.desktop')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* City Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-purple-500" />
                            {t('analytics.cityDistribution')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {cityData.map((city, index) => (
                                <div key={city.city} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{index + 1}. {city.city}</span>
                                        <span className="text-muted-foreground">{city.count} ({city.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${city.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Device Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-green-500" />
                            {t('analytics.deviceDistribution')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {deviceData.map((device) => (
                                <div key={device.device} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {device.device === 'Mobile' ? (
                                                <Smartphone className="h-4 w-4 text-green-500" />
                                            ) : device.device === 'Desktop' ? (
                                                <Monitor className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <Globe className="h-4 w-4 text-gray-500" />
                                            )}
                                            <span className="font-medium">{device.device}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {device.count} ({device.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${device.device === 'Mobile'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : device.device === 'Desktop'
                                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                }`}
                                            style={{ width: `${device.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Activity Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            {t('analytics.hourlyActivity')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1">
                            {hourData.map((hour) => {
                                const maxCount = Math.max(...hourData.map(h => h.count));
                                const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;

                                return (
                                    <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                                            <div
                                                className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 cursor-pointer relative group"
                                                style={{ height: `${height}%` }}
                                                title={`${hour.hour}h: ${hour.count} visiteurs`}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {hour.count}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{hour.hour}h</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Date Timeline */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            {t('analytics.dateTrend')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {dateData.slice(-14).map((date, index) => {
                                const maxCount = Math.max(...dateData.map(d => d.count));
                                const height = maxCount > 0 ? (date.count / maxCount) * 100 : 0;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex items-end justify-center" style={{ height: '150px' }}>
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 cursor-pointer relative group"
                                                style={{ height: `${height}%` }}
                                                title={`${date.date}: ${date.count} visiteurs`}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {date.count}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                                            {date.date.split('/').slice(0, 2).join('/')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
