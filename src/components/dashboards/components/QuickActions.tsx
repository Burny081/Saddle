import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Plus, Users, FileText, Send } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

interface QuickActionsProps {
    onNavigate: (view: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const { t } = useLanguage();

    const actions = [
        { label: t('dashboard.newInvoice'), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', action: () => onNavigate('sales-new') },
        { label: t('dashboard.addClient'), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', action: () => onNavigate('clients-new') },
        { label: t('dashboard.newProduct'), icon: Plus, color: 'text-green-500', bg: 'bg-green-500/10', action: () => onNavigate('articles-new') },
        { label: t('dashboard.sendEmail'), icon: Send, color: 'text-orange-500', bg: 'bg-orange-500/10', action: () => setIsEmailOpen(true) },
    ];

    return (
        <>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {actions.map((action) => (
                            <motion.div
                                key={action.label}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    className="h-auto w-full flex-col gap-3 border-border py-5 hover:border-primary/40 hover:bg-primary/[0.035] transition-colors"
                                    onClick={action.action}
                                >
                                    <div className={`rounded-md p-3 ${action.bg} ${action.color}`}>
                                        <action.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-xs">{action.label}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('dashboard.emailSimulation')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('dashboard.recipient')}</Label>
                            <Input placeholder="client@exemple.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('dashboard.subject')}</Label>
                            <Input placeholder={t('dashboard.subject')} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('dashboard.message')}</Label>
                            <Textarea placeholder={t('dashboard.yourMessage')} rows={4} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmailOpen(false)}>{t('action.cancel')}</Button>
                        <Button onClick={() => {
                            alert(t('dashboard.emailSent'));
                            setIsEmailOpen(false);
                        }}>{t('action.send')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
