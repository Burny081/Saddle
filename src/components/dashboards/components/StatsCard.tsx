import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: any;
    gradient: string;
    delay?: number;
}

export function StatCard({ title, value, change, changeType, icon: Icon, gradient, delay = 0 }: StatCardProps) {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            whileHover={{ y: -2 }}
        >
            <Card className="relative overflow-hidden group">

                <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {title}
                    </CardTitle>
                    <div className={`rounded-md bg-gradient-to-br ${gradient} p-2.5 text-white shadow-sm`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </CardHeader>

                <CardContent className="relative">
                    <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                        <span
                            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 ${changeType === 'positive'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                        >
                            {changeType === 'positive' ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {change}
                        </span>
                        <span className="text-muted-foreground/60 text-xs">{t('dashboard.vsLastMonth')}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
