import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    Settings,
    Building,
    Phone,
    Mail,
    MapPin,
    Globe,
    Save,
    ArrowLeft,
    Palette,
    Bell,
    Shield,
    CreditCard,
    Percent,
    Clock,
    Languages,
    Moon,
    Sun,
    Monitor,
    Database,
    Download,
    Upload,
    Trash2,
    Key,
    Lock,
    Users,
    FileText,
    Printer,
    Package,
    AlertTriangle,
    RefreshCw,
    Loader2,
    ShoppingCart,
    Plug,
    MapPinned,
    Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany, useCompanyInfo } from '@/contexts/CompanyContext';
import { COMPANY, APP_SETTINGS } from '@/config/constants';
import { useTheme } from 'next-themes';
import * as SettingsAPI from '@/utils/apiSettings';

interface SettingsViewProps {
    onBack?: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
    const { user } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { refreshCompanyInfo } = useCompany();
    const companyInfo = useCompanyInfo();
    const { theme, setTheme } = useTheme();
    
    // Loading and saving states
    const [isLoading, setIsLoading] = useState(true);
    const [, setIsSaving] = useState(false);

    // Company settings state (in a real app, these would be stored in a database)
    const [companySettings, setCompanySettings] = useState<{
        name: string;
        shortName: string;
        address: string;
        phone: string;
        email: string;
        website: string;
    }>({
        name: COMPANY.name,
        shortName: COMPANY.shortName,
        address: COMPANY.address,
        phone: COMPANY.phone,
        email: COMPANY.email,
        website: COMPANY.website,
    });

    // App settings state
    const [appSettings, setAppSettings] = useState<{
        taxRate: number;
        currency: string;
        locale: string;
    }>({
        taxRate: APP_SETTINGS.taxRate * 100, // Display as percentage
        currency: APP_SETTINGS.defaultCurrency,
        locale: APP_SETTINGS.defaultLocale,
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        lowStock: true,
        newSale: true,
        newClient: false,
        dailyReport: true,
        emailNotifications: true,
        smsNotifications: false,
    });

    // Email settings (for sending emails)
    const [emailSettings, setEmailSettings] = useState<{
        smtpServer: string;
        smtpPort: string;
        senderEmail: string;
        senderName: string;
        enableSSL: boolean;
        autoSendOrderConfirmation?: boolean;
        autoSendInvoice?: boolean;
        autoSendStockAlert?: boolean;
        autoSendWelcome?: boolean;
        stockAlertRecipients?: string;
    }>({
        smtpServer: 'smtp.gmail.com',
        smtpPort: '587',
        senderEmail: COMPANY.email,
        senderName: COMPANY.name,
        enableSSL: true,
        autoSendOrderConfirmation: true,
        autoSendInvoice: true,
        autoSendStockAlert: true,
        autoSendWelcome: true,
        stockAlertRecipients: '',
    });

    // Invoice/Document settings
    const [documentSettings, setDocumentSettings] = useState({
        invoicePrefix: 'FAC-',
        quotePrefix: 'DEV-',
        autoNumbering: true,
        showLogo: true,
        showBankDetails: true,
        footerText: 'Merci pour votre confiance.',
        paymentTerms: '30 jours',
    });

    // Stock settings
    const [stockSettings, setStockSettings] = useState({
        lowStockThreshold: 10,
        enableAutoReorder: false,
        defaultCategory: 'electrical',
    });

    // Security settings (superadmin only)
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: 30,
        requireStrongPassword: true,
        twoFactorAuth: false,
        maxLoginAttempts: 5,
    });

    // Sales & POS settings
    const [salesSettings, setSalesSettings] = useState({
        enablePOS: true,
        printReceipt: true,
        receiptSize: '80mm',
        enableDiscounts: true,
        maxDiscountPercent: 20,
        requireManagerApproval: true,
        approvalThreshold: 15,
        enableLayaway: true,
        layawayMinDeposit: 30,
        defaultPaymentMethod: 'cash',
        enableMultiPayment: true,
        enableTips: false,
        showPriceWithTax: true,
    });

    // Regional settings
    const [regionalSettings, setRegionalSettings] = useState({
        timezone: 'Africa/Douala',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: 'fr-FR',
        weekStartsOn: 'monday',
        fiscalYearStart: '01-01',
    });

    // Integration settings
    const [integrationSettings, setIntegrationSettings] = useState({
        enableAPI: false,
        apiKey: '',
        webhookUrl: '',
        enableWhatsApp: true,
        whatsAppNumber: '',
        enableSMS: false,
        smsProvider: 'twilio',
        enablePaymentGateway: false,
        paymentGateway: 'stripe',
    });

    // Load settings from Supabase on mount
    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const allSettings = await SettingsAPI.getAllSettings();
            
            if (allSettings.company) {
                setCompanySettings({
                    name: allSettings.company.name || COMPANY.name,
                    shortName: allSettings.company.short_name || COMPANY.shortName,
                    address: allSettings.company.address || COMPANY.address,
                    phone: allSettings.company.phone || COMPANY.phone,
                    email: allSettings.company.email || COMPANY.email,
                    website: allSettings.company.website || COMPANY.website,
                });
            }
            
            // App settings - these are stored in company_settings or stock_settings
            // Keep defaults from constants as these may not be in DB
            
            if (allSettings.notification) {
                setNotifications({
                    lowStock: allSettings.notification.low_stock ?? true,
                    newSale: allSettings.notification.new_sale ?? true,
                    newClient: allSettings.notification.new_client ?? false,
                    dailyReport: allSettings.notification.daily_report ?? true,
                    emailNotifications: allSettings.notification.email_notifications ?? true,
                    smsNotifications: allSettings.notification.sms_notifications ?? false,
                });
            }
            
            if (allSettings.email) {
                setEmailSettings({
                    smtpServer: allSettings.email.smtp_server || 'smtp.gmail.com',
                    smtpPort: String(allSettings.email.smtp_port || 587),
                    senderEmail: allSettings.email.sender_email || COMPANY.email,
                    senderName: allSettings.email.sender_name || COMPANY.name,
                    enableSSL: allSettings.email.enable_ssl ?? true,
                });
            }
            
            if (allSettings.document) {
                setDocumentSettings({
                    invoicePrefix: allSettings.document.invoice_prefix || 'FAC-',
                    quotePrefix: allSettings.document.quote_prefix || 'DEV-',
                    autoNumbering: allSettings.document.auto_numbering ?? true,
                    showLogo: allSettings.document.show_logo ?? true,
                    showBankDetails: allSettings.document.show_bank_details ?? true,
                    footerText: allSettings.document.footer_text || 'Merci pour votre confiance.',
                    paymentTerms: allSettings.document.payment_terms || '30 jours',
                });
            }
            
            if (allSettings.stock) {
                setStockSettings({
                    lowStockThreshold: allSettings.stock.low_stock_threshold || 10,
                    enableAutoReorder: allSettings.stock.enable_auto_reorder ?? false,
                    defaultCategory: allSettings.stock.default_category || 'electrical',
                });
            }
            
            if (allSettings.security) {
                setSecuritySettings({
                    sessionTimeout: allSettings.security.session_timeout || 30,
                    requireStrongPassword: allSettings.security.require_strong_password ?? true,
                    twoFactorAuth: allSettings.security.two_factor_auth ?? false,
                    maxLoginAttempts: allSettings.security.max_login_attempts || 5,
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Fallback to localStorage if Supabase fails
            const localCompany = localStorage.getItem('sps_company_settings');
            if (localCompany) setCompanySettings(JSON.parse(localCompany));
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSaveCompany = async () => {
        setIsSaving(true);
        try {
            console.log('Saving company settings:', companySettings);
            const result = await SettingsAPI.updateCompanySettings({
                name: companySettings.name,
                short_name: companySettings.shortName,
                address: companySettings.address,
                phone: companySettings.phone,
                email: companySettings.email,
                website: companySettings.website,
            });
            console.log('Company settings save result:', result);
            
            // Also keep localStorage as fallback
            console.log('Saving to localStorage:', companySettings);
            localStorage.setItem('sps_company_settings', JSON.stringify(companySettings));
            
            // Refresh the company context to propagate changes throughout the app
            console.log('Refreshing company context...');
            await refreshCompanyInfo();
            
            alert(t('success.companySettings'));
        } catch (error) {
            console.error('Error saving company settings:', error);
            alert('Erreur lors de la sauvegarde. Données sauvegardées localement.');
            localStorage.setItem('sps_company_settings', JSON.stringify(companySettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveApp = async () => {
        setIsSaving(true);
        try {
            // App settings like tax_rate are stored via localStorage for now
            // as they may be store-specific
            localStorage.setItem('sps_app_settings', JSON.stringify(appSettings));
            alert(t('success.appSettings'));
        } catch (error) {
            console.error('Error saving app settings:', error);
            localStorage.setItem('sps_app_settings', JSON.stringify(appSettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEmail = async () => {
        setIsSaving(true);
        try {
            await SettingsAPI.updateEmailSettings({
                smtp_server: emailSettings.smtpServer,
                smtp_port: emailSettings.smtpPort,
                sender_email: emailSettings.senderEmail,
                sender_name: emailSettings.senderName,
                enable_ssl: emailSettings.enableSSL,
            });
            localStorage.setItem('sps_email_settings', JSON.stringify(emailSettings));
            alert(t('success.emailSettings'));
        } catch (error) {
            console.error('Error saving email settings:', error);
            localStorage.setItem('sps_email_settings', JSON.stringify(emailSettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDocuments = async () => {
        setIsSaving(true);
        try {
            await SettingsAPI.updateDocumentSettings({
                invoice_prefix: documentSettings.invoicePrefix,
                quote_prefix: documentSettings.quotePrefix,
                auto_numbering: documentSettings.autoNumbering,
                show_logo: documentSettings.showLogo,
                show_bank_details: documentSettings.showBankDetails,
                footer_text: documentSettings.footerText,
                payment_terms: documentSettings.paymentTerms,
            });
            localStorage.setItem('sps_document_settings', JSON.stringify(documentSettings));
            alert(t('success.docSettings'));
        } catch (error) {
            console.error('Error saving document settings:', error);
            localStorage.setItem('sps_document_settings', JSON.stringify(documentSettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStock = async () => {
        setIsSaving(true);
        try {
            await SettingsAPI.updateStockSettings({
                low_stock_threshold: stockSettings.lowStockThreshold,
                enable_auto_reorder: stockSettings.enableAutoReorder,
                default_category: stockSettings.defaultCategory,
            });
            localStorage.setItem('sps_stock_settings', JSON.stringify(stockSettings));
            alert(t('success.stockSettings'));
        } catch (error) {
            console.error('Error saving stock settings:', error);
            localStorage.setItem('sps_stock_settings', JSON.stringify(stockSettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSecurity = async () => {
        setIsSaving(true);
        try {
            await SettingsAPI.updateSecuritySettings({
                session_timeout: securitySettings.sessionTimeout,
                require_strong_password: securitySettings.requireStrongPassword,
                two_factor_auth: securitySettings.twoFactorAuth,
                max_login_attempts: securitySettings.maxLoginAttempts,
            });
            localStorage.setItem('sps_security_settings', JSON.stringify(securitySettings));
            alert(t('success.securitySettings'));
        } catch (error) {
            console.error('Error saving security settings:', error);
            localStorage.setItem('sps_security_settings', JSON.stringify(securitySettings));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSales = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('sps_sales_settings', JSON.stringify(salesSettings));
            alert(t('success.settingsSaved'));
        } catch (error) {
            console.error('Error saving sales settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveRegional = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('sps_regional_settings', JSON.stringify(regionalSettings));
            alert(t('success.settingsSaved'));
        } catch (error) {
            console.error('Error saving regional settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveIntegrations = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('sps_integration_settings', JSON.stringify(integrationSettings));
            alert(t('success.settingsSaved'));
        } catch (error) {
            console.error('Error saving integration settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportData = () => {
        const data = {
            company: companySettings,
            app: appSettings,
            notifications,
            email: emailSettings,
            documents: documentSettings,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sps-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleClearCache = () => {
        // Clear non-essential localStorage items
        const keysToKeep = ['sps_users_db', 'sps_auth'];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('sps_') && !keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        alert(t('success.cacheCleared'));
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        if (data.company) setCompanySettings(data.company);
                        if (data.app) setAppSettings(data.app);
                        if (data.notifications) setNotifications(data.notifications);
                        if (data.email) setEmailSettings(data.email);
                        if (data.documents) setDocumentSettings(data.documents);
                        alert(t('success.dataImported'));
                    } catch {
                        alert(t('error.invalidFile'));
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const canEditSettings = user && ['superadmin', 'admin'].includes(user.role);
    const isSuperAdmin = user?.role === 'superadmin';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{t('action.loading')}...</span>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {t('settings.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                    <TabsTrigger value="company" className="gap-2 text-xs sm:text-sm">
                        <Building className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.company')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="application" className="gap-2 text-xs sm:text-sm">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.application')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="gap-2 text-xs sm:text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.documents')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-2 text-xs sm:text-sm">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.email')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="stock" className="gap-2 text-xs sm:text-sm">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.stock')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="gap-2 text-xs sm:text-sm">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.sales')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="regional" className="gap-2 text-xs sm:text-sm">
                        <MapPinned className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.regional')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="gap-2 text-xs sm:text-sm">
                        <Plug className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.integrations')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2 text-xs sm:text-sm">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.appearance')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('settings.alerts')}</span>
                    </TabsTrigger>
                    {isSuperAdmin && (
                        <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('settings.security')}</span>
                        </TabsTrigger>
                    )}
                    {isSuperAdmin && (
                        <TabsTrigger value="backup" className="gap-2 text-xs sm:text-sm">
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('settings.backup')}</span>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Company Settings Tab */}
                <TabsContent value="company">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-blue-500" />
                                    {t('settings.companyInfo')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.companyInfoDesc')} - <span className="company-name">{companyInfo.name}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">{t('settings.companyName')}</Label>
                                        <Input
                                            id="company-name"
                                            value={companySettings.name}
                                            onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company-short">{t('settings.shortName')}</Label>
                                        <Input
                                            id="company-short"
                                            value={companySettings.shortName}
                                            onChange={(e) => setCompanySettings({ ...companySettings, shortName: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company-address" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {t('label.address')}
                                    </Label>
                                    <Input
                                        id="company-address"
                                        value={companySettings.address}
                                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                        disabled={!canEditSettings}
                                    />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {t('label.phone')}
                                        </Label>
                                        <Input
                                            id="company-phone"
                                            value={companySettings.phone}
                                            onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company-email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {t('label.email')}
                                        </Label>
                                        <Input
                                            id="company-email"
                                            type="email"
                                            value={companySettings.email}
                                            onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company-website" className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        {t('settings.website')}
                                    </Label>
                                    <Input
                                        id="company-website"
                                        type="url"
                                        value={companySettings.website}
                                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                                        disabled={!canEditSettings}
                                    />
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveCompany} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Application Settings Tab */}
                <TabsContent value="application">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-500" />
                                    {t('settings.appSettings')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.appSettingsDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tax-rate" className="flex items-center gap-2">
                                            <Percent className="h-4 w-4" />
                                            {t('settings.taxRate')}
                                        </Label>
                                        <Input
                                            id="tax-rate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={appSettings.taxRate}
                                            onChange={(e) => setAppSettings({ ...appSettings, taxRate: parseFloat(e.target.value) || 0 })}
                                            disabled={!canEditSettings}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('settings.taxRateDesc', { rate: appSettings.taxRate })}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currency" className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {t('settings.currency')}
                                        </Label>
                                        <Select
                                            value={appSettings.currency}
                                            onValueChange={(val) => setAppSettings({ ...appSettings, currency: val })}
                                            disabled={!canEditSettings}
                                        >
                                            <SelectTrigger id="currency">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="XAF">Franc CFA (XAF)</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                <SelectItem value="USD">Dollar US (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="locale" className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {t('settings.regionalFormat')}
                                        </Label>
                                        <Select
                                            value={appSettings.locale}
                                            onValueChange={(val) => setAppSettings({ ...appSettings, locale: val })}
                                            disabled={!canEditSettings}
                                        >
                                            <SelectTrigger id="locale">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fr-CM">Cameroun (fr-CM)</SelectItem>
                                                <SelectItem value="fr-FR">France (fr-FR)</SelectItem>
                                                <SelectItem value="en-US">États-Unis (en-US)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language" className="flex items-center gap-2">
                                            <Languages className="h-4 w-4" />
                                            {t('settings.interfaceLanguage')}
                                        </Label>
                                        <Select
                                            value={language}
                                            onValueChange={setLanguage}
                                        >
                                            <SelectTrigger id="language">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fr">{t('language.french')}</SelectItem>
                                                <SelectItem value="en">{t('language.english')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveApp} className="bg-purple-600 hover:bg-purple-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Sales & POS Settings Tab */}
                <TabsContent value="sales">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-green-500" />
                                    {t('settings.salesPOS')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.salesPOSDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* POS Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.posSettings')}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enablePOS')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.enablePOSDesc')}</p>
                                            </div>
                                            <Switch
                                                checked={salesSettings.enablePOS}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, enablePOS: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.printReceipt')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.printReceiptDesc')}</p>
                                            </div>
                                            <Switch
                                                checked={salesSettings.printReceipt}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, printReceipt: checked })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>{t('settings.receiptSize')}</Label>
                                            <Select value={salesSettings.receiptSize} onValueChange={(value) => setSalesSettings({ ...salesSettings, receiptSize: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="58mm">58mm ({t('settings.small')})</SelectItem>
                                                    <SelectItem value="80mm">80mm ({t('settings.standard')})</SelectItem>
                                                    <SelectItem value="A4">A4 ({t('settings.fullPage')})</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('settings.defaultPayment')}</Label>
                                            <Select value={salesSettings.defaultPaymentMethod} onValueChange={(value) => setSalesSettings({ ...salesSettings, defaultPaymentMethod: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">{t('payment.cash')}</SelectItem>
                                                    <SelectItem value="card">{t('payment.card')}</SelectItem>
                                                    <SelectItem value="mobile">{t('payment.mobile')}</SelectItem>
                                                    <SelectItem value="transfer">{t('payment.transfer')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Discount Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.discountSettings')}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enableDiscounts')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.enableDiscountsDesc')}</p>
                                            </div>
                                            <Switch
                                                checked={salesSettings.enableDiscounts}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, enableDiscounts: checked })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('settings.maxDiscount')} (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={salesSettings.maxDiscountPercent}
                                                onChange={(e) => setSalesSettings({ ...salesSettings, maxDiscountPercent: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.requireApproval')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.requireApprovalDesc')}</p>
                                            </div>
                                            <Switch
                                                checked={salesSettings.requireManagerApproval}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, requireManagerApproval: checked })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('settings.approvalThreshold')} (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={salesSettings.approvalThreshold}
                                                onChange={(e) => setSalesSettings({ ...salesSettings, approvalThreshold: parseInt(e.target.value) || 0 })}
                                                disabled={!salesSettings.requireManagerApproval}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Layaway Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.layawaySettings')}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enableLayaway')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.enableLayawayDesc')}</p>
                                            </div>
                                            <Switch
                                                checked={salesSettings.enableLayaway}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, enableLayaway: checked })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('settings.minDeposit')} (%)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={salesSettings.layawayMinDeposit}
                                                onChange={(e) => setSalesSettings({ ...salesSettings, layawayMinDeposit: parseInt(e.target.value) || 0 })}
                                                disabled={!salesSettings.enableLayaway}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Other Options */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.otherOptions')}
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.multiPayment')}</Label>
                                            </div>
                                            <Switch
                                                checked={salesSettings.enableMultiPayment}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, enableMultiPayment: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enableTips')}</Label>
                                            </div>
                                            <Switch
                                                checked={salesSettings.enableTips}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, enableTips: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.priceWithTax')}</Label>
                                            </div>
                                            <Switch
                                                checked={salesSettings.showPriceWithTax}
                                                onCheckedChange={(checked) => setSalesSettings({ ...salesSettings, showPriceWithTax: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveSales} className="w-full mt-4">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Regional Settings Tab */}
                <TabsContent value="regional">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPinned className="h-5 w-5 text-teal-500" />
                                    {t('settings.regional')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.regionalDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>{t('settings.timezone')}</Label>
                                        <Select value={regionalSettings.timezone} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, timezone: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Africa/Douala">Africa/Douala (UTC+1)</SelectItem>
                                                <SelectItem value="Africa/Lagos">Africa/Lagos (UTC+1)</SelectItem>
                                                <SelectItem value="Europe/Paris">Europe/Paris (UTC+1/+2)</SelectItem>
                                                <SelectItem value="Europe/Berlin">Europe/Berlin (UTC+1/+2)</SelectItem>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('settings.dateFormat')}</Label>
                                        <Select value={regionalSettings.dateFormat} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, dateFormat: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</SelectItem>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>{t('settings.timeFormat')}</Label>
                                        <Select value={regionalSettings.timeFormat} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, timeFormat: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="24h">24h (14:30)</SelectItem>
                                                <SelectItem value="12h">12h (2:30 PM)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('settings.numberFormat')}</Label>
                                        <Select value={regionalSettings.numberFormat} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, numberFormat: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fr-FR">1 234,56 (Français)</SelectItem>
                                                <SelectItem value="en-US">1,234.56 (English US)</SelectItem>
                                                <SelectItem value="de-DE">1.234,56 (Deutsch)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>{t('settings.weekStart')}</Label>
                                        <Select value={regionalSettings.weekStartsOn} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, weekStartsOn: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monday">{t('days.monday')}</SelectItem>
                                                <SelectItem value="sunday">{t('days.sunday')}</SelectItem>
                                                <SelectItem value="saturday">{t('days.saturday')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('settings.fiscalYearStart')}</Label>
                                        <Select value={regionalSettings.fiscalYearStart} onValueChange={(value) => setRegionalSettings({ ...regionalSettings, fiscalYearStart: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="01-01">{t('months.january')} 1</SelectItem>
                                                <SelectItem value="04-01">{t('months.april')} 1</SelectItem>
                                                <SelectItem value="07-01">{t('months.july')} 1</SelectItem>
                                                <SelectItem value="10-01">{t('months.october')} 1</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveRegional} className="w-full mt-4">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Integration Settings Tab */}
                <TabsContent value="integrations">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plug className="h-5 w-5 text-purple-500" />
                                    {t('settings.integrations')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.integrationsDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* API Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.apiSettings')}
                                    </h3>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label>{t('settings.enableAPI')}</Label>
                                            <p className="text-sm text-muted-foreground">{t('settings.enableAPIDesc')}</p>
                                        </div>
                                        <Switch
                                            checked={integrationSettings.enableAPI}
                                            onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, enableAPI: checked })}
                                        />
                                    </div>
                                    {integrationSettings.enableAPI && (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>{t('settings.apiKey')}</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="password"
                                                        value={integrationSettings.apiKey}
                                                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, apiKey: e.target.value })}
                                                        placeholder="sk_live_..."
                                                    />
                                                    <Button variant="outline" size="icon" onClick={() => {
                                                        const newKey = 'sk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 32);
                                                        setIntegrationSettings({ ...integrationSettings, apiKey: newKey });
                                                    }}>
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('settings.webhookUrl')}</Label>
                                                <Input
                                                    value={integrationSettings.webhookUrl}
                                                    onChange={(e) => setIntegrationSettings({ ...integrationSettings, webhookUrl: e.target.value })}
                                                    placeholder="https://your-server.com/webhook"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* WhatsApp Integration */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        WhatsApp
                                    </h3>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                                <Smartphone className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enableWhatsApp')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.enableWhatsAppDesc')}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={integrationSettings.enableWhatsApp}
                                            onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, enableWhatsApp: checked })}
                                        />
                                    </div>
                                    {integrationSettings.enableWhatsApp && (
                                        <div className="space-y-2">
                                            <Label>{t('settings.whatsAppNumber')}</Label>
                                            <Input
                                                value={integrationSettings.whatsAppNumber}
                                                onChange={(e) => setIntegrationSettings({ ...integrationSettings, whatsAppNumber: e.target.value })}
                                                placeholder="+237 6XX XXX XXX"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* SMS Integration */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        SMS
                                    </h3>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label>{t('settings.enableSMS')}</Label>
                                            <p className="text-sm text-muted-foreground">{t('settings.enableSMSDesc')}</p>
                                        </div>
                                        <Switch
                                            checked={integrationSettings.enableSMS}
                                            onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, enableSMS: checked })}
                                        />
                                    </div>
                                    {integrationSettings.enableSMS && (
                                        <div className="space-y-2">
                                            <Label>{t('settings.smsProvider')}</Label>
                                            <Select value={integrationSettings.smsProvider} onValueChange={(value) => setIntegrationSettings({ ...integrationSettings, smsProvider: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="twilio">Twilio</SelectItem>
                                                    <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                                                    <SelectItem value="africastalking">Africa's Talking</SelectItem>
                                                    <SelectItem value="orange">Orange SMS API</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Gateway */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t('settings.paymentGateway')}
                                    </h3>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label>{t('settings.enablePaymentGateway')}</Label>
                                                <p className="text-sm text-muted-foreground">{t('settings.enablePaymentGatewayDesc')}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={integrationSettings.enablePaymentGateway}
                                            onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, enablePaymentGateway: checked })}
                                        />
                                    </div>
                                    {integrationSettings.enablePaymentGateway && (
                                        <div className="space-y-2">
                                            <Label>{t('settings.selectGateway')}</Label>
                                            <Select value={integrationSettings.paymentGateway} onValueChange={(value) => setIntegrationSettings({ ...integrationSettings, paymentGateway: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="stripe">Stripe</SelectItem>
                                                    <SelectItem value="paypal">PayPal</SelectItem>
                                                    <SelectItem value="momo">MTN Mobile Money</SelectItem>
                                                    <SelectItem value="om">Orange Money</SelectItem>
                                                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveIntegrations} className="w-full mt-4">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Appearance Settings Tab */}
                <TabsContent value="appearance">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-pink-500" />
                                    {t('settings.appearance')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.appearanceDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>{t('settings.theme')}</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Button
                                            variant={theme === 'light' ? 'default' : 'outline'}
                                            className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === 'light' ? 'bg-blue-600 text-white' : ''}`}
                                            onClick={() => setTheme('light')}
                                        >
                                            <Sun className="h-6 w-6" />
                                            <span>{t('theme.light')}</span>
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'default' : 'outline'}
                                            className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === 'dark' ? 'bg-blue-600 text-white' : ''}`}
                                            onClick={() => setTheme('dark')}
                                        >
                                            <Moon className="h-6 w-6" />
                                            <span>{t('theme.dark')}</span>
                                        </Button>
                                        <Button
                                            variant={theme === 'system' ? 'default' : 'outline'}
                                            className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === 'system' ? 'bg-blue-600 text-white' : ''}`}
                                            onClick={() => setTheme('system')}
                                        >
                                            <Monitor className="h-6 w-6" />
                                            <span>{t('settings.themeSystem')}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Documents Settings Tab */}
                <TabsContent value="documents">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    {t('settings.docSettings')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.docSettingsDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoice-prefix">{t('settings.invoicePrefix')}</Label>
                                        <Input
                                            id="invoice-prefix"
                                            value={documentSettings.invoicePrefix}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, invoicePrefix: e.target.value })}
                                            disabled={!canEditSettings}
                                            placeholder="FAC-"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quote-prefix">{t('settings.quotePrefix')}</Label>
                                        <Input
                                            id="quote-prefix"
                                            value={documentSettings.quotePrefix}
                                            onChange={(e) => setDocumentSettings({ ...documentSettings, quotePrefix: e.target.value })}
                                            disabled={!canEditSettings}
                                            placeholder="DEV-"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment-terms">{t('settings.paymentTerms')}</Label>
                                        <Select
                                            value={documentSettings.paymentTerms}
                                            onValueChange={(val) => setDocumentSettings({ ...documentSettings, paymentTerms: val })}
                                            disabled={!canEditSettings}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="immediate">{t('settings.immediatePayment')}</SelectItem>
                                                <SelectItem value="15 jours">15 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                                                <SelectItem value="30 jours">30 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                                                <SelectItem value="45 jours">45 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                                                <SelectItem value="60 jours">60 {language === 'fr' ? 'jours' : 'days'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>{t('settings.autoNumbering')}</Label>
                                            <Switch
                                                checked={documentSettings.autoNumbering}
                                                onCheckedChange={(checked) => setDocumentSettings({ ...documentSettings, autoNumbering: checked })}
                                                disabled={!canEditSettings}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <Printer className="h-4 w-4" />
                                                {t('settings.showLogo')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.showLogoDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={documentSettings.showLogo}
                                            onCheckedChange={(checked) => setDocumentSettings({ ...documentSettings, showLogo: checked })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                {t('settings.showBankDetails')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.showBankDetailsDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={documentSettings.showBankDetails}
                                            onCheckedChange={(checked) => setDocumentSettings({ ...documentSettings, showBankDetails: checked })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="footer-text">{t('settings.footerText')}</Label>
                                    <Textarea
                                        id="footer-text"
                                        value={documentSettings.footerText}
                                        onChange={(e) => setDocumentSettings({ ...documentSettings, footerText: e.target.value })}
                                        disabled={!canEditSettings}
                                        rows={2}
                                        placeholder={language === 'fr' ? 'Merci pour votre confiance.' : 'Thank you for your trust.'}
                                    />
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveDocuments} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Email Settings Tab */}
                <TabsContent value="email">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-cyan-500" />
                                    {t('settings.emailConfig')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.emailConfigDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtp-server">{t('settings.smtpServer')}</Label>
                                        <Input
                                            id="smtp-server"
                                            value={emailSettings.smtpServer}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                                            disabled={!canEditSettings}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtp-port">{t('settings.smtpPort')}</Label>
                                        <Input
                                            id="smtp-port"
                                            value={emailSettings.smtpPort}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                                            disabled={!canEditSettings}
                                            placeholder="587"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="sender-email">{t('settings.senderEmail')}</Label>
                                        <Input
                                            id="sender-email"
                                            type="email"
                                            value={emailSettings.senderEmail}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sender-name">{t('settings.senderName')}</Label>
                                        <Input
                                            id="sender-name"
                                            value={emailSettings.senderName}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                                            disabled={!canEditSettings}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            {t('settings.secureConnection')}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t('settings.secureConnectionDesc')}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={emailSettings.enableSSL}
                                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableSSL: checked })}
                                        disabled={!canEditSettings}
                                    />
                                </div>

                                {/* Email automation settings */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="text-base">Emails automatiques</CardTitle>
                                        <CardDescription>Activez l'envoi automatique d'emails aux clients</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Confirmation de commande</Label>
                                            <Switch
                                                checked={emailSettings.autoSendOrderConfirmation !== false}
                                                onCheckedChange={(checked) => {
                                                    const config = JSON.parse(localStorage.getItem('emailConfig') || '{}');
                                                    config.enableOrderConfirmation = checked;
                                                    localStorage.setItem('emailConfig', JSON.stringify(config));
                                                    setEmailSettings({ ...emailSettings, autoSendOrderConfirmation: checked });
                                                }}
                                                disabled={!canEditSettings}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Envoi automatique des factures</Label>
                                            <Switch
                                                checked={emailSettings.autoSendInvoice !== false}
                                                onCheckedChange={(checked) => {
                                                    const config = JSON.parse(localStorage.getItem('emailConfig') || '{}');
                                                    config.enableInvoiceEmail = checked;
                                                    localStorage.setItem('emailConfig', JSON.stringify(config));
                                                    setEmailSettings({ ...emailSettings, autoSendInvoice: checked });
                                                }}
                                                disabled={!canEditSettings}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Alertes de stock bas</Label>
                                            <Switch
                                                checked={emailSettings.autoSendStockAlert !== false}
                                                onCheckedChange={(checked) => {
                                                    const config = JSON.parse(localStorage.getItem('emailConfig') || '{}');
                                                    config.enableStockAlerts = checked;
                                                    localStorage.setItem('emailConfig', JSON.stringify(config));
                                                    setEmailSettings({ ...emailSettings, autoSendStockAlert: checked });
                                                }}
                                                disabled={!canEditSettings}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Email de bienvenue nouveaux clients</Label>
                                            <Switch
                                                checked={emailSettings.autoSendWelcome !== false}
                                                onCheckedChange={(checked) => {
                                                    const config = JSON.parse(localStorage.getItem('emailConfig') || '{}');
                                                    config.enableWelcomeEmail = checked;
                                                    localStorage.setItem('emailConfig', JSON.stringify(config));
                                                    setEmailSettings({ ...emailSettings, autoSendWelcome: checked });
                                                }}
                                                disabled={!canEditSettings}
                                            />
                                        </div>
                                        {emailSettings.autoSendStockAlert !== false && (
                                            <div className="space-y-2">
                                                <Label htmlFor="stock-recipients">Destinataires des alertes de stock</Label>
                                                <Input
                                                    id="stock-recipients"
                                                    value={emailSettings.stockAlertRecipients || ''}
                                                    onChange={(e) => {
                                                        const config = JSON.parse(localStorage.getItem('emailConfig') || '{}');
                                                        config.stockAlertRecipients = e.target.value;
                                                        localStorage.setItem('emailConfig', JSON.stringify(config));
                                                        setEmailSettings({ ...emailSettings, stockAlertRecipients: e.target.value });
                                                    }}
                                                    disabled={!canEditSettings}
                                                    placeholder="admin@example.com, manager@example.com"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {canEditSettings && (
                                    <div className="flex gap-3">
                                        <Button onClick={handleSaveEmail} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                            <Save className="mr-2 h-4 w-4" />
                                            {t('action.save')}
                                        </Button>
                                        <Button variant="outline" onClick={() => alert(t('success.testEmailSent'))}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            {t('settings.testConnection')}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Stock Settings Tab */}
                <TabsContent value="stock">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-amber-500" />
                                    {t('settings.stockSettings')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.stockSettingsDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="low-stock">{t('settings.lowStockThreshold')}</Label>
                                        <Input
                                            id="low-stock"
                                            type="number"
                                            min="1"
                                            value={stockSettings.lowStockThreshold}
                                            onChange={(e) => setStockSettings({ ...stockSettings, lowStockThreshold: parseInt(e.target.value) || 10 })}
                                            disabled={!canEditSettings}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('settings.lowStockThresholdDesc')}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default-category">{t('settings.defaultCategory')}</Label>
                                        <Select
                                            value={stockSettings.defaultCategory}
                                            onValueChange={(val) => setStockSettings({ ...stockSettings, defaultCategory: val })}
                                            disabled={!canEditSettings}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="electrical">{t('supplier.category.electrical')}</SelectItem>
                                                <SelectItem value="automation">{t('supplier.category.automation')}</SelectItem>
                                                <SelectItem value="solar">{t('supplier.category.solar')}</SelectItem>
                                                <SelectItem value="cables">{t('supplier.category.cables')}</SelectItem>
                                                <SelectItem value="other">{language === 'fr' ? 'Autre' : 'Other'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            {t('settings.autoReorder')}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t('settings.autoReorderDesc')}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={stockSettings.enableAutoReorder}
                                        onCheckedChange={(checked) => setStockSettings({ ...stockSettings, enableAutoReorder: checked })}
                                        disabled={!canEditSettings}
                                    />
                                </div>

                                {canEditSettings && (
                                    <Button onClick={handleSaveStock} className="bg-amber-600 hover:bg-amber-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Notifications Settings Tab */}
                <TabsContent value="notifications">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-orange-500" />
                                    {t('settings.notifications')}
                                </CardTitle>
                                <CardDescription>
                                    {t('settings.notificationsDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                {t('settings.lowStockAlert')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.lowStockAlertDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.lowStock}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-green-500" />
                                                {t('settings.newSaleAlert')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.newSaleAlertDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.newSale}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, newSale: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-500" />
                                                {t('settings.newClientAlert')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.newClientAlertDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.newClient}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, newClient: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-purple-500" />
                                                {t('settings.dailyReportAlert')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.dailyReportAlertDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.dailyReport}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReport: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-cyan-500" />
                                                {t('settings.emailNotifications')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {t('settings.emailNotificationsDesc')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={notifications.emailNotifications}
                                            onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Security Settings Tab (Superadmin only) */}
                {isSuperAdmin && (
                    <TabsContent value="security">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-red-500" />
                                        {t('settings.securitySettings')}
                                    </CardTitle>
                                    <CardDescription>
                                        <Badge variant="destructive" className="mr-2">{t('settings.superAdminOnly')}</Badge>
                                        {t('settings.securitySettingsDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="session-timeout">{t('settings.sessionTimeout')}</Label>
                                            <Input
                                                id="session-timeout"
                                                type="number"
                                                min="5"
                                                max="480"
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max-attempts">{t('settings.maxLoginAttempts')}</Label>
                                            <Input
                                                id="max-attempts"
                                                type="number"
                                                min="3"
                                                max="10"
                                                value={securitySettings.maxLoginAttempts}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-base flex items-center gap-2">
                                                    <Key className="h-4 w-4" />
                                                    {t('settings.strongPassword')}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('settings.strongPasswordDesc')}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.requireStrongPassword}
                                                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireStrongPassword: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-base flex items-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    {t('settings.twoFactorAuth')}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('settings.twoFactorAuthDesc')}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={securitySettings.twoFactorAuth}
                                                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleSaveSecurity} className="bg-red-600 hover:bg-red-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t('action.save')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                )}

                {/* Backup Settings Tab (Superadmin only) */}
                {isSuperAdmin && (
                    <TabsContent value="backup">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-emerald-500" />
                                        {t('settings.backupAndMaintenance')}
                                    </CardTitle>
                                    <CardDescription>
                                        <Badge variant="destructive" className="mr-2">{t('settings.superAdminOnly')}</Badge>
                                        {t('settings.manageBackupsDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/50">
                                                        <Download className="h-6 w-6 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{t('settings.exportData')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t('settings.downloadFullBackup')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={handleExportData}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {t('action.export')}
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                                                        <Upload className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{t('settings.importData')}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t('settings.restoreFromBackup')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="w-full mt-4" onClick={handleImportData}>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {t('action.import')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/50">
                                                    <RefreshCw className="h-6 w-6 text-orange-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{t('settings.clearCache')}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('settings.clearCacheDesc')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                                                onClick={handleClearCache}
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                {t('settings.clearCache')}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                                                    <Trash2 className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-red-700">{t('settings.dangerZone')}</h4>
                                                    <p className="text-sm text-red-600">
                                                        {t('settings.dangerZoneDesc')}
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('settings.resetAllData')}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('confirm.areYouSure')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('confirm.resetAllDataDesc')}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                                            {t('confirm.yesDeleteAll')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                )}
            </Tabs>

            {/* Security Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="border-none shadow-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t('settings.securityInfo')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('settings.loggedInAs')}: <strong>{user?.name}</strong> ({user?.role})
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {canEditSettings
                                        ? t('settings.canEditSettings')
                                        : t('settings.cannotEditSettings')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
