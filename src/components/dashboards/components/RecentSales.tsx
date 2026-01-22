import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { ShoppingCart } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/config/constants';

export function RecentSales() {
    const { sales } = useData();
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
        >
            <Card className="border-none shadow-xl glass-card h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        {t('dashboard.recentTransactions')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {sales.slice(0, 5).map((sale, i) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border border-border group-hover:border-primary/50 transition-colors">
                                        <AvatarFallback className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {sale.clientName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{sale.clientName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{sale.invoiceNumber}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                        <div className="text-right font-medium">{formatCurrency(sale.total)}</div>
                                    </span>
                                    <Badge
                                        variant={sale.status === 'completed' ? 'default' : 'outline'}
                                        className={`text-xs ${sale.status === 'completed'
                                            ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20'
                                            : sale.status === 'partial'
                                                ? 'bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-yellow-500/20'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {sale.status === 'completed' ? t('sales.paid') : sale.status === 'partial' ? t('status.partial') : t('sales.pending')}
                                    </Badge>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
