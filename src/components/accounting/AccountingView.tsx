import { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import {
    Calculator,
    Upload,
    Download,
    Send,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    Receipt,
    PiggyBank,
    FileText,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    Building2,
    ChevronDown,
    Filter,
    Trash2,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompanyInfo } from '@/contexts/CompanyContext';
import { formatCurrency, generateId, getFromStorage, setToStorage, APP_SETTINGS } from '@/config/constants';

// Types for accounting entries
interface AccountingEntry {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    reference: string;
    status: 'pending' | 'validated' | 'rejected';
    createdBy: string;
    createdAt: string;
    notes?: string;
}

interface AccountingReport {
    id: string;
    title: string;
    period: string;
    createdAt: string;
    createdBy: string;
    status: 'draft' | 'sent' | 'approved';
    sentTo: string[];
    data: {
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        entries: AccountingEntry[];
    };
}

const STORAGE_KEY_ENTRIES = 'sps_accounting_entries';
const STORAGE_KEY_REPORTS = 'sps_accounting_reports';

const INCOME_CATEGORIES = [
    'Ventes Produits',
    'Ventes Services',
    'Revenus Divers',
    'Remboursements Reçus',
    'Subventions',
];

const EXPENSE_CATEGORIES = [
    'Achats Marchandises',
    'Salaires et Charges',
    'Loyer et Charges',
    'Électricité et Eau',
    'Transport et Déplacement',
    'Fournitures Bureau',
    'Marketing et Publicité',
    'Maintenance et Réparations',
    'Impôts et Taxes',
    'Assurances',
    'Frais Bancaires',
    'Divers',
];

interface AccountingViewProps {
    onBack?: () => void;
}

export function AccountingView({ onBack }: AccountingViewProps) {
    const { sales, articles } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const companyInfo = useCompanyInfo();

    // State
    const [entries, setEntries] = useState<AccountingEntry[]>(() =>
        getFromStorage<AccountingEntry[]>(STORAGE_KEY_ENTRIES, [])
    );
    const [reports, setReports] = useState<AccountingReport[]>(() =>
        getFromStorage<AccountingReport[]>(STORAGE_KEY_REPORTS, [])
    );
    const [activeTab, setActiveTab] = useState('overview');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSendReportDialogOpen, setIsSendReportDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [newEntry, setNewEntry] = useState<Partial<AccountingEntry>>({
        type: 'expense',
        category: '',
        description: '',
        amount: 0,
        reference: '',
        notes: '',
    });
    const [reportTitle, setReportTitle] = useState('');
    const [importData, setImportData] = useState<AccountingEntry[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate metrics based on period
    const metrics = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (selectedPeriod) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Filter entries by period
        const periodEntries = entries.filter(e => new Date(e.date) >= startDate);

        // Calculate from entries
        const entryIncome = periodEntries
            .filter(e => e.type === 'income' && e.status !== 'rejected')
            .reduce((sum, e) => sum + e.amount, 0);
        const entryExpenses = periodEntries
            .filter(e => e.type === 'expense' && e.status !== 'rejected')
            .reduce((sum, e) => sum + e.amount, 0);

        // Calculate from sales data
        const periodSales = sales.filter(s => new Date(s.date) >= startDate);
        // Calculate paid amounts based on status and paid flag
        const salesIncome = periodSales.reduce((sum, s) => sum + (s.paid ? s.total : 0), 0);
        const pendingPayments = periodSales.reduce((sum, s) => sum + (s.paid ? 0 : s.total), 0);

        // Stock value
        const stockValue = articles.reduce((sum, a) => sum + a.purchasePrice * a.stock, 0);

        // TVA calculation (19.25%)
        const tvaCollected = salesIncome * APP_SETTINGS.taxRate;
        const tvaDeductible = entryExpenses * APP_SETTINGS.taxRate;
        const tvaToPay = tvaCollected - tvaDeductible;

        // Totals
        const totalIncome = entryIncome + salesIncome;
        const totalExpenses = entryExpenses;
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Category breakdown
        const expensesByCategory: Record<string, number> = {};
        periodEntries
            .filter(e => e.type === 'expense' && e.status !== 'rejected')
            .forEach(e => {
                expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
            });

        const incomeByCategory: Record<string, number> = {};
        periodEntries
            .filter(e => e.type === 'income' && e.status !== 'rejected')
            .forEach(e => {
                incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + e.amount;
            });
        // Add sales income
        incomeByCategory['Ventes Produits'] = (incomeByCategory['Ventes Produits'] || 0) + salesIncome;

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin,
            salesIncome,
            pendingPayments,
            stockValue,
            tvaCollected,
            tvaDeductible,
            tvaToPay,
            expensesByCategory,
            incomeByCategory,
            periodEntries,
            entryCount: periodEntries.length,
            pendingEntries: periodEntries.filter(e => e.status === 'pending').length,
        };
    }, [entries, sales, articles, selectedPeriod]);

    // Save entries to localStorage
    const saveEntries = useCallback((newEntries: AccountingEntry[]) => {
        setEntries(newEntries);
        setToStorage(STORAGE_KEY_ENTRIES, newEntries);
    }, []);

    // Save reports to localStorage
    const saveReports = useCallback((newReports: AccountingReport[]) => {
        setReports(newReports);
        setToStorage(STORAGE_KEY_REPORTS, newReports);
    }, []);

    // Add new entry
    const handleAddEntry = useCallback(() => {
        if (!newEntry.category || !newEntry.description || !newEntry.amount) return;

        const entry: AccountingEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            type: newEntry.type as 'income' | 'expense',
            category: newEntry.category,
            description: newEntry.description,
            amount: Number(newEntry.amount),
            reference: newEntry.reference || `REF-${Date.now()}`,
            status: 'pending',
            createdBy: user?.name || 'Comptable',
            createdAt: new Date().toISOString(),
            notes: newEntry.notes,
        };

        saveEntries([...entries, entry]);
        setNewEntry({
            type: 'expense',
            category: '',
            description: '',
            amount: 0,
            reference: '',
            notes: '',
        });
        setIsAddDialogOpen(false);
    }, [newEntry, entries, saveEntries, user]);

    // Delete entry
    const handleDeleteEntry = useCallback((id: string) => {
        saveEntries(entries.filter(e => e.id !== id));
    }, [entries, saveEntries]);

    // Validate entry
    const handleValidateEntry = useCallback((id: string) => {
        saveEntries(entries.map(e => e.id === id ? { ...e, status: 'validated' } : e));
    }, [entries, saveEntries]);

    // Export to Excel
    const handleExportExcel = useCallback(() => {
        const exportData = metrics.periodEntries.map(e => ({
            'Date': new Date(e.date).toLocaleDateString('fr-FR'),
            'Type': e.type === 'income' ? 'Recette' : 'Dépense',
            'Catégorie': e.category,
            'Description': e.description,
            'Montant': e.amount,
            'Référence': e.reference,
            'Statut': e.status === 'pending' ? 'En attente' : e.status === 'validated' ? 'Validé' : 'Rejeté',
            'Créé par': e.createdBy,
            'Notes': e.notes || '',
        }));

        // Add summary row
        exportData.push({
            'Date': '',
            'Type': '',
            'Catégorie': 'TOTAL',
            'Description': '',
            'Montant': metrics.netProfit,
            'Référence': '',
            'Statut': '',
            'Créé par': '',
            'Notes': `Recettes: ${metrics.totalIncome} | Dépenses: ${metrics.totalExpenses}`,
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 }, // Date
            { wch: 10 }, // Type
            { wch: 25 }, // Catégorie
            { wch: 40 }, // Description
            { wch: 15 }, // Montant
            { wch: 15 }, // Référence
            { wch: 12 }, // Statut
            { wch: 20 }, // Créé par
            { wch: 30 }, // Notes
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Comptabilité');

        // Create summary sheet
        const summaryData = [
            { 'Métrique': 'Période', 'Valeur': selectedPeriod === 'month' ? 'Ce mois' : selectedPeriod === 'week' ? 'Cette semaine' : selectedPeriod === 'quarter' ? 'Ce trimestre' : 'Cette année' },
            { 'Métrique': 'Total Recettes', 'Valeur': metrics.totalIncome },
            { 'Métrique': 'Total Dépenses', 'Valeur': metrics.totalExpenses },
            { 'Métrique': 'Bénéfice Net', 'Valeur': metrics.netProfit },
            { 'Métrique': 'Marge Bénéficiaire', 'Valeur': `${metrics.profitMargin.toFixed(2)}%` },
            { 'Métrique': 'TVA Collectée', 'Valeur': metrics.tvaCollected },
            { 'Métrique': 'TVA Déductible', 'Valeur': metrics.tvaDeductible },
            { 'Métrique': 'TVA à Payer', 'Valeur': metrics.tvaToPay },
            { 'Métrique': 'Valeur Stock', 'Valeur': metrics.stockValue },
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

        // Download
        const fileName = `Comptabilite_${companyInfo.shortName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, [metrics, selectedPeriod]);

    // Import from Excel
    const handleImportExcel = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const wb = XLSX.read(data, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

            const importedEntries: AccountingEntry[] = jsonData
                .filter((row) => row['Type'] && row['Montant'])
                .map((row) => ({
                    id: generateId(),
                    date: row['Date'] ? new Date(row['Date'] as string).toISOString() : new Date().toISOString(),
                    type: (row['Type'] as string)?.toLowerCase().includes('recette') ? 'income' : 'expense',
                    category: (row['Catégorie'] as string) || 'Divers',
                    description: (row['Description'] as string) || '',
                    amount: Number(row['Montant']) || 0,
                    reference: (row['Référence'] as string) || `IMP-${Date.now()}`,
                    status: 'pending' as const,
                    createdBy: user?.name || 'Import',
                    createdAt: new Date().toISOString(),
                    notes: (row['Notes'] as string) || 'Importé depuis Excel',
                }));

            setImportData(importedEntries);
            setIsImportDialogOpen(true);
        };
        reader.readAsArrayBuffer(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [user]);

    // Confirm import
    const handleConfirmImport = useCallback(() => {
        saveEntries([...entries, ...importData]);
        setImportData([]);
        setIsImportDialogOpen(false);
    }, [entries, importData, saveEntries]);

    // Send report
    const handleSendReport = useCallback(() => {
        if (!reportTitle) return;

        const report: AccountingReport = {
            id: generateId(),
            title: reportTitle,
            period: selectedPeriod,
            createdAt: new Date().toISOString(),
            createdBy: user?.name || 'Comptable',
            status: 'sent',
            sentTo: ['superadmin', 'admin', 'manager'],
            data: {
                totalIncome: metrics.totalIncome,
                totalExpenses: metrics.totalExpenses,
                netProfit: metrics.netProfit,
                entries: metrics.periodEntries,
            },
        };

        saveReports([...reports, report]);
        setReportTitle('');
        setIsSendReportDialogOpen(false);

        // Create notification in localStorage for admin/manager to see
        const notifications = getFromStorage<unknown[]>('sps_accounting_notifications', []);
        notifications.push({
            id: generateId(),
            type: 'accounting_report',
            title: `Nouveau rapport comptable: ${reportTitle}`,
            message: `${user?.name} a soumis un rapport comptable pour la période ${selectedPeriod}. Bénéfice net: ${formatCurrency(metrics.netProfit)}`,
            createdAt: new Date().toISOString(),
            read: false,
            reportId: report.id,
        });
        setToStorage('sps_accounting_notifications', notifications);
    }, [reportTitle, selectedPeriod, user, metrics, reports, saveReports]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Calculator className="h-8 w-8 text-yellow-600" />
                            {t('accounting.title')}
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {t('accounting.subtitle')} - <span className="company-name">{companyInfo.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period Filter */}
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">{t('period.thisWeek')}</SelectItem>
                            <SelectItem value="month">{t('period.thisMonth')}</SelectItem>
                            <SelectItem value="quarter">{t('period.thisQuarter')}</SelectItem>
                            <SelectItem value="year">{t('period.thisYear')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                {t('label.actions')}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsAddDialogOpen(true); }}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('accounting.newEntry')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleExportExcel(); }}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('action.exportExcel')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                                <Upload className="mr-2 h-4 w-4" />
                                {t('action.importExcel')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsSendReportDialogOpen(true); }}>
                                <Send className="mr-2 h-4 w-4" />
                                {t('accounting.sendReport')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleImportExcel}
                        placeholder={t('action.importExcel')}
                        title={t('action.importExcel')}
                    />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('accounting.income')}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                                        {formatCurrency(metrics.totalIncome)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3 text-green-600">
                                    <TrendingUp className="h-5 w-5" />
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
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('accounting.expenses')}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-red-600">
                                        {formatCurrency(metrics.totalExpenses)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-red-100 dark:bg-red-900/30 p-3 text-red-600">
                                    <TrendingDown className="h-5 w-5" />
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
                    <Card className={`border-l-4 ${metrics.netProfit >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('accounting.netProfit')}</p>
                                    <p className={`text-lg sm:text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {formatCurrency(metrics.netProfit)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('accounting.margin')}: {metrics.profitMargin.toFixed(1)}%
                                    </p>
                                </div>
                                <div className={`rounded-xl p-3 ${metrics.netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'}`}>
                                    <DollarSign className="h-5 w-5" />
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
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('accounting.vatToPay')}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-purple-600">
                                        {formatCurrency(metrics.tvaToPay)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        19.25%
                                    </p>
                                </div>
                                <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-3 text-purple-600">
                                    <Receipt className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">{t('accounting.overview')}</TabsTrigger>
                    <TabsTrigger value="entries">{t('accounting.entries')} ({metrics.entryCount})</TabsTrigger>
                    <TabsTrigger value="reports">{t('accounting.reports')} ({reports.length})</TabsTrigger>
                    <TabsTrigger value="analysis">{t('accounting.analysis')}</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Additional Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-blue-500" />
                                    {t('accounting.treasury')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">{t('accounting.salesReceived')}</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(metrics.salesIncome)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">{t('accounting.pendingPayments')}</span>
                                    <span className="font-semibold text-orange-600">{formatCurrency(metrics.pendingPayments)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">{t('accounting.stockValue')}</span>
                                    <span className="font-semibold">{formatCurrency(metrics.stockValue)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-muted-foreground">{t('accounting.pendingEntries')}</span>
                                    <span className="font-semibold text-blue-600">{metrics.pendingEntries}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* TVA Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-purple-500" />
                                    {t('label.tax')} ({(APP_SETTINGS.taxRate * 100).toFixed(2)}%)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">{t('accounting.vatCollected')}</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(metrics.tvaCollected)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">{t('accounting.vatDeductible')}</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(metrics.tvaDeductible)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3">
                                    <span className="font-medium">{t('accounting.netVatToPay')}</span>
                                    <span className={`font-bold text-lg ${metrics.tvaToPay >= 0 ? 'text-purple-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.abs(metrics.tvaToPay))}
                                        {metrics.tvaToPay < 0 && ` (${t('accounting.vatCredit')})`}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Expenses by Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                    {t('accounting.expensesByCategory')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.entries(metrics.expensesByCategory).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(metrics.expensesByCategory)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([category, amount]) => {
                                                const percentage = (amount / metrics.totalExpenses) * 100;
                                                return (
                                                    <div key={category}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>{category}</span>
                                                            <span className="text-muted-foreground">
                                                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full accounting-bar-progress"
                                                                data-barwidth={percentage}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">{t('accounting.noExpensesRecorded')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Income by Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    {t('accounting.incomeByCategory')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.entries(metrics.incomeByCategory).length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(metrics.incomeByCategory)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([category, amount]) => {
                                                const percentage = (amount / metrics.totalIncome) * 100;
                                                return (
                                                    <div key={category}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>{category}</span>
                                                            <span className="text-muted-foreground">
                                                                {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full accounting-bar-progress"
                                                                data-barwidth={percentage}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">{t('accounting.noIncomeRecorded')}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Entries Tab */}
                <TabsContent value="entries">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('accounting.accountingEntries')}</CardTitle>
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('accounting.newEntry')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2">{t('accounting.date')}</th>
                                            <th className="text-left py-3 px-2">{t('accounting.type')}</th>
                                            <th className="text-left py-3 px-2">{t('accounting.category')}</th>
                                            <th className="text-left py-3 px-2 hidden md:table-cell">{t('accounting.description')}</th>
                                            <th className="text-right py-3 px-2">{t('accounting.amount')}</th>
                                            <th className="text-center py-3 px-2">{t('accounting.status')}</th>
                                            <th className="text-center py-3 px-2">{t('label.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.periodEntries.length > 0 ? (
                                            metrics.periodEntries
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((entry) => (
                                                    <tr key={entry.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                                                        <td className="py-3 px-2">
                                                            {new Date(entry.date).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                entry.type === 'income'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                                {entry.type === 'income' ? t('accounting.receipt') : t('accounting.expense')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2">{entry.category}</td>
                                                        <td className="py-3 px-2 hidden md:table-cell max-w-[200px] truncate">
                                                            {entry.description}
                                                        </td>
                                                        <td className={`py-3 px-2 text-right font-medium ${
                                                            entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            {entry.status === 'pending' && (
                                                                <span className="flex items-center justify-center gap-1 text-orange-600">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">{t('accounting.pending')}</span>
                                                                </span>
                                                            )}
                                                            {entry.status === 'validated' && (
                                                                <span className="flex items-center justify-center gap-1 text-green-600">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">{t('accounting.validated')}</span>
                                                                </span>
                                                            )}
                                                            {entry.status === 'rejected' && (
                                                                <span className="flex items-center justify-center gap-1 text-red-600">
                                                                    <AlertCircle className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">{t('accounting.rejected')}</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {entry.status === 'pending' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-green-600"
                                                                        onClick={() => handleValidateEntry(entry.id)}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600"
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    {t('accounting.noEntriesForPeriod')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('accounting.sentReports')}</CardTitle>
                            <Button onClick={() => setIsSendReportDialogOpen(true)}>
                                <Send className="mr-2 h-4 w-4" />
                                {t('accounting.sendAReport')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {reports.length > 0 ? (
                                <div className="space-y-4">
                                    {reports
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((report) => (
                                            <div
                                                key={report.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{report.title}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(report.createdAt).toLocaleDateString('fr-FR')} - {report.period}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Envoyé à: {report.sentTo.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${report.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(report.data.netProfit)}
                                                    </p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        report.status === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : report.status === 'sent'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {report.status === 'approved' ? t('accounting.approved') : report.status === 'sent' ? t('accounting.sent') : t('accounting.draft')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('accounting.noReportsSent')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analysis Tab - Professional Accounting Analysis */}
                <TabsContent value="analysis" className="space-y-4">
                    {/* Compte de Résultat Simplifié */}
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-yellow-600" />
                                Compte de Résultat Simplifié
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Analyse de la performance économique de l'entreprise
                            </p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Produits d'exploitation */}
                                <div className="border-l-4 border-l-green-500 pl-4">
                                    <h4 className="font-semibold text-green-700 dark:text-green-400">I. PRODUITS D'EXPLOITATION</h4>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Chiffre d'affaires (ventes de marchandises)</span>
                                            <span className="font-medium">{formatCurrency(metrics.salesIncome)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Autres produits d'exploitation</span>
                                            <span className="font-medium">{formatCurrency(metrics.totalIncome - metrics.salesIncome)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t pt-2">
                                            <span>Total Produits</span>
                                            <span className="text-green-600">{formatCurrency(metrics.totalIncome)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Charges d'exploitation */}
                                <div className="border-l-4 border-l-red-500 pl-4">
                                    <h4 className="font-semibold text-red-700 dark:text-red-400">II. CHARGES D'EXPLOITATION</h4>
                                    <div className="mt-2 space-y-2 text-sm">
                                        {Object.entries(metrics.expensesByCategory)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 5)
                                            .map(([category, amount]) => (
                                                <div key={category} className="flex justify-between">
                                                    <span>{category}</span>
                                                    <span className="font-medium">{formatCurrency(amount)}</span>
                                                </div>
                                            ))}
                                        {Object.keys(metrics.expensesByCategory).length > 5 && (
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Autres charges...</span>
                                                <span>{formatCurrency(
                                                    Object.entries(metrics.expensesByCategory)
                                                        .sort((a, b) => b[1] - a[1])
                                                        .slice(5)
                                                        .reduce((sum, [, amount]) => sum + amount, 0)
                                                )}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold border-t pt-2">
                                            <span>Total Charges</span>
                                            <span className="text-red-600">{formatCurrency(metrics.totalExpenses)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Résultat */}
                                <div className={`border-l-4 ${metrics.netProfit >= 0 ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'} pl-4 py-3 rounded-r-lg`}>
                                    <h4 className={`font-semibold ${metrics.netProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                        III. RÉSULTAT D'EXPLOITATION
                                    </h4>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-sm">Produits - Charges = Résultat Net</span>
                                        <span className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {formatCurrency(metrics.netProfit)}
                                        </span>
                                    </div>
                                    <p className="text-xs mt-2 text-muted-foreground">
                                        {metrics.netProfit >= 0
                                            ? `✅ L'entreprise dégage un bénéfice de ${formatCurrency(metrics.netProfit)}, ce qui représente une marge bénéficiaire de ${metrics.profitMargin.toFixed(2)}% sur le chiffre d'affaires.`
                                            : `⚠️ L'entreprise enregistre une perte de ${formatCurrency(Math.abs(metrics.netProfit))}. Il est conseillé de réduire les charges ou d'augmenter le chiffre d'affaires.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Ratios Financiers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PiggyBank className="h-5 w-5 text-yellow-500" />
                                    Ratios Financiers et Interprétation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Marge bénéficiaire */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium">Marge Bénéficiaire Nette</p>
                                            <p className="text-xs text-muted-foreground">Résultat Net / Chiffre d'Affaires × 100</p>
                                        </div>
                                        <p className="text-2xl font-bold">{metrics.profitMargin.toFixed(2)}%</p>
                                    </div>
                                    <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${metrics.profitMargin >= 20 ? 'bg-green-500' : metrics.profitMargin >= 10 ? 'bg-yellow-500' : metrics.profitMargin >= 0 ? 'bg-orange-500' : 'bg-red-500'} accounting-bar-progress`}
                                            data-barwidth={Math.min(Math.max(metrics.profitMargin, 0), 100)}
                                        />
                                    </div>
                                    <p className="text-xs mt-2 text-muted-foreground italic">
                                        {metrics.profitMargin >= 20
                                            ? '📈 Excellente rentabilité. L\'entreprise génère un profit confortable sur chaque vente.'
                                            : metrics.profitMargin >= 10
                                            ? '📊 Rentabilité acceptable. La marge permet de couvrir les imprévus et d\'investir.'
                                            : metrics.profitMargin >= 0
                                            ? '⚠️ Marge faible. Optimisez les coûts ou augmentez les prix de vente.'
                                            : '🔴 Marge négative. L\'entreprise perd de l\'argent sur son activité.'}
                                    </p>
                                </div>

                                {/* Ratio de couverture */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium">Ratio de Couverture des Charges</p>
                                            <p className="text-xs text-muted-foreground">Produits / Charges</p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            {metrics.totalExpenses > 0 ? (metrics.totalIncome / metrics.totalExpenses).toFixed(2) : '∞'}
                                        </p>
                                    </div>
                                    <p className="text-xs mt-2 text-muted-foreground italic">
                                        {metrics.totalExpenses === 0
                                            ? '✅ Aucune charge enregistrée cette période.'
                                            : metrics.totalIncome / metrics.totalExpenses >= 1.5
                                            ? `📈 Excellent! Pour chaque ${formatCurrency(1)} de charges, l'entreprise génère ${formatCurrency(metrics.totalIncome / metrics.totalExpenses)} de produits.`
                                            : metrics.totalIncome / metrics.totalExpenses >= 1
                                            ? `📊 Les recettes couvrent les charges avec une marge de ${((metrics.totalIncome / metrics.totalExpenses - 1) * 100).toFixed(1)}%.`
                                            : `🔴 Les charges dépassent les recettes de ${formatCurrency(metrics.totalExpenses - metrics.totalIncome)}. Action corrective nécessaire.`}
                                    </p>
                                </div>

                                {/* Taux de recouvrement */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium">Taux de Recouvrement</p>
                                            <p className="text-xs text-muted-foreground">Montant Encaissé / Total Facturé × 100</p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            {((metrics.salesIncome / (metrics.salesIncome + metrics.pendingPayments)) * 100 || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                    <p className="text-xs mt-2 text-muted-foreground italic">
                                        {metrics.pendingPayments === 0
                                            ? '✅ Tous les paiements sont encaissés. Excellente gestion des créances.'
                                            : metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments) <= 0.2
                                            ? `📊 ${formatCurrency(metrics.pendingPayments)} en attente de paiement. Niveau acceptable (< 20% des ventes).`
                                            : `⚠️ ${formatCurrency(metrics.pendingPayments)} impayés (${((metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments)) * 100).toFixed(1)}%). Intensifiez le suivi des créances clients.`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analyse TVA */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-purple-500" />
                                    Analyse de la TVA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-3">
                                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Mécanisme de la TVA</h4>
                                    <p className="text-xs text-muted-foreground">
                                        La TVA (Taxe sur la Valeur Ajoutée) au Cameroun est de <strong>{(APP_SETTINGS.taxRate * 100).toFixed(2)}%</strong>.
                                        L'entreprise collecte la TVA sur ses ventes et récupère la TVA sur ses achats.
                                        La différence est versée à l'État.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <span className="font-medium">TVA Collectée</span>
                                            <p className="text-xs text-muted-foreground">Sur ventes: {formatCurrency(metrics.salesIncome)} × {(APP_SETTINGS.taxRate * 100).toFixed(2)}%</p>
                                        </div>
                                        <span className="font-semibold text-green-600">+ {formatCurrency(metrics.tvaCollected)}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <span className="font-medium">TVA Déductible</span>
                                            <p className="text-xs text-muted-foreground">Sur achats: {formatCurrency(metrics.totalExpenses)} × {(APP_SETTINGS.taxRate * 100).toFixed(2)}%</p>
                                        </div>
                                        <span className="font-semibold text-red-600">- {formatCurrency(metrics.tvaDeductible)}</span>
                                    </div>

                                    <div className={`flex justify-between items-center py-3 px-3 rounded-lg ${metrics.tvaToPay >= 0 ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                        <div>
                                            <span className="font-bold">{metrics.tvaToPay >= 0 ? 'TVA à Reverser' : 'Crédit de TVA'}</span>
                                            <p className="text-xs text-muted-foreground">
                                                {metrics.tvaToPay >= 0 ? 'Montant dû au Trésor Public' : 'Montant à reporter ou à demander en remboursement'}
                                            </p>
                                        </div>
                                        <span className={`text-xl font-bold ${metrics.tvaToPay >= 0 ? 'text-purple-600' : 'text-green-600'}`}>
                                            {formatCurrency(Math.abs(metrics.tvaToPay))}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-muted-foreground italic">
                                        {metrics.tvaToPay >= 0
                                            ? `💡 Conseil: Provisionnez ${formatCurrency(metrics.tvaToPay)} pour le règlement de la TVA. Échéance: 15 du mois suivant.`
                                            : `💡 Vous disposez d'un crédit de TVA de ${formatCurrency(Math.abs(metrics.tvaToPay))}. Ce crédit peut être reporté sur les déclarations suivantes ou faire l'objet d'une demande de remboursement.`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommandations */}
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                Recommandations du Comptable
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Situation financière */}
                                <div className={`p-4 rounded-lg border-2 ${
                                    metrics.netProfit >= 0 && metrics.profitMargin >= 10
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                        : metrics.netProfit >= 0
                                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                }`}>
                                    <h4 className="font-semibold mb-2">📊 Situation Financière Globale</h4>
                                    <p className="text-sm">
                                        {metrics.netProfit >= 0 && metrics.profitMargin >= 10
                                            ? `L'entreprise est en bonne santé financière avec un résultat positif de ${formatCurrency(metrics.netProfit)} et une marge de ${metrics.profitMargin.toFixed(1)}%. Continuez à maintenir cette performance.`
                                            : metrics.netProfit >= 0
                                            ? `L'entreprise dégage un bénéfice de ${formatCurrency(metrics.netProfit)}, mais la marge de ${metrics.profitMargin.toFixed(1)}% reste faible. Envisagez d'optimiser les coûts.`
                                            : `Attention: L'entreprise enregistre une perte de ${formatCurrency(Math.abs(metrics.netProfit))}. Une analyse approfondie des charges est nécessaire.`}
                                    </p>
                                </div>

                                {/* Trésorerie */}
                                <div className={`p-4 rounded-lg border-2 ${
                                    metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments) <= 0.1
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                        : metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments) <= 0.3
                                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                }`}>
                                    <h4 className="font-semibold mb-2">💰 Gestion de la Trésorerie</h4>
                                    <p className="text-sm">
                                        {metrics.pendingPayments === 0
                                            ? 'Excellente gestion! Tous les paiements clients sont encaissés.'
                                            : metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments) <= 0.1
                                            ? `Bonne gestion des créances. Seulement ${formatCurrency(metrics.pendingPayments)} en attente.`
                                            : metrics.pendingPayments / (metrics.salesIncome + metrics.pendingPayments) <= 0.3
                                            ? `${formatCurrency(metrics.pendingPayments)} de créances. Mettez en place un suivi rigoureux des relances.`
                                            : `Alerte: ${formatCurrency(metrics.pendingPayments)} impayés. Risque de tension sur la trésorerie. Priorisez le recouvrement.`}
                                    </p>
                                </div>

                                {/* Stock */}
                                <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                    <h4 className="font-semibold mb-2">📦 Valeur du Stock</h4>
                                    <p className="text-sm">
                                        Le stock représente un actif de <strong>{formatCurrency(metrics.stockValue)}</strong> valorisé au coût d'achat.
                                        {metrics.stockValue > metrics.totalIncome
                                            ? ' Ce montant est supérieur au chiffre d\'affaires de la période. Vérifiez la rotation des stocks.'
                                            : ' La valeur est cohérente avec le niveau d\'activité.'}
                                    </p>
                                </div>

                                {/* TVA */}
                                <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                                    <h4 className="font-semibold mb-2">🏛️ Obligations Fiscales</h4>
                                    <p className="text-sm">
                                        {metrics.tvaToPay >= 0
                                            ? `N'oubliez pas de provisionner ${formatCurrency(metrics.tvaToPay)} pour la TVA. Déclaration à déposer avant le 15 du mois suivant.`
                                            : `Vous bénéficiez d'un crédit de TVA de ${formatCurrency(Math.abs(metrics.tvaToPay))}. Conservez tous les justificatifs d'achat.`}
                                    </p>
                                </div>
                            </div>

                            {/* Actions prioritaires */}
                            {(metrics.netProfit < 0 || metrics.pendingPayments > metrics.salesIncome * 0.3) && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Actions Prioritaires</h4>
                                    <ul className="text-sm space-y-1 list-disc list-inside">
                                        {metrics.netProfit < 0 && (
                                            <li>Analyser les postes de charges les plus importants pour identifier des économies possibles</li>
                                        )}
                                        {metrics.pendingPayments > metrics.salesIncome * 0.3 && (
                                            <li>Intensifier les relances clients et envisager des pénalités de retard</li>
                                        )}
                                        {metrics.profitMargin < 5 && metrics.netProfit >= 0 && (
                                            <li>Réviser la politique tarifaire ou négocier les prix d'achat avec les fournisseurs</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Résumé de la Période */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Synthèse de la Période: {selectedPeriod === 'week' ? 'Cette semaine' : selectedPeriod === 'month' ? 'Ce mois' : selectedPeriod === 'quarter' ? 'Ce trimestre' : 'Cette année'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Écritures</p>
                                    <p className="text-xl font-bold">{metrics.entryCount}</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Recettes</p>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.totalIncome)}</p>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Dépenses</p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${metrics.netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                    <p className="text-xs text-muted-foreground">Résultat</p>
                                    <p className={`text-xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {formatCurrency(metrics.netProfit)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Entry Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('accounting.newAccountingEntry')}</DialogTitle>
                        <DialogDescription>
                            {t('accounting.addIncomeOrExpense')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('accounting.type')}</Label>
                            <Select
                                value={newEntry.type}
                                onValueChange={(v) => setNewEntry({ ...newEntry, type: v as 'income' | 'expense', category: '' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">{t('accounting.expense')}</SelectItem>
                                    <SelectItem value="income">{t('accounting.receipt')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('accounting.category')}</Label>
                            <Select
                                value={newEntry.category}
                                onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('accounting.selectCategory')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(newEntry.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('accounting.description')}</Label>
                            <Input
                                value={newEntry.description}
                                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                                placeholder={t('accounting.operationDescription')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('accounting.amount')}</Label>
                            <Input
                                type="number"
                                value={newEntry.amount || ''}
                                onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('accounting.referenceOptional')}</Label>
                            <Input
                                value={newEntry.reference}
                                onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                                placeholder={t('accounting.invoiceNumber')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('accounting.notesOptional')}</Label>
                            <Input
                                value={newEntry.notes}
                                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                                placeholder={t('accounting.additionalNotes')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleAddEntry} disabled={!newEntry.category || !newEntry.description || !newEntry.amount}>
                            {t('action.add')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Report Dialog */}
            <Dialog open={isSendReportDialogOpen} onOpenChange={setIsSendReportDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('accounting.sendTheReport')}</DialogTitle>
                        <DialogDescription>
                            {t('accounting.reportWillBeSent')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('accounting.reportTitle')}</Label>
                            <Input
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                placeholder={t('accounting.reportTitlePlaceholder')}
                            />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                            <h4 className="font-medium">{t('accounting.reportSummary')}</h4>
                            <div className="text-sm space-y-1">
                                <p>{t('accounting.period')}: {selectedPeriod === 'week' ? t('period.thisWeek') : selectedPeriod === 'month' ? t('period.thisMonth') : selectedPeriod === 'quarter' ? t('period.thisQuarter') : t('period.thisYear')}</p>
                                <p>{t('accounting.income')}: <span className="text-green-600">{formatCurrency(metrics.totalIncome)}</span></p>
                                <p>{t('accounting.expenses')}: <span className="text-red-600">{formatCurrency(metrics.totalExpenses)}</span></p>
                                <p>{t('accounting.netProfit')}: <span className={metrics.netProfit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{formatCurrency(metrics.netProfit)}</span></p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Send className="h-4 w-4" />
                            <span>{t('accounting.willBeSentTo')}: Superadmin, Admin, Manager</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSendReportDialogOpen(false)}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleSendReport} disabled={!reportTitle}>
                            <Send className="mr-2 h-4 w-4" />
                            {t('action.send')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('accounting.importData')}</DialogTitle>
                        <DialogDescription>
                            {importData.length} {t('accounting.entriesDetected')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-background">
                                <tr className="border-b">
                                    <th className="text-left py-2">Type</th>
                                    <th className="text-left py-2">Catégorie</th>
                                    <th className="text-left py-2">Description</th>
                                    <th className="text-right py-2">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importData.map((entry, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                entry.type === 'income'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {entry.type === 'income' ? 'Recette' : 'Dépense'}
                                            </span>
                                        </td>
                                        <td className="py-2">{entry.category}</td>
                                        <td className="py-2 max-w-[200px] truncate">{entry.description}</td>
                                        <td className={`py-2 text-right ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(entry.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setImportData([]); setIsImportDialogOpen(false); }}>
                            {t('action.cancel')}
                        </Button>
                        <Button onClick={handleConfirmImport}>
                            <Upload className="mr-2 h-4 w-4" />
                            {t('accounting.importEntries', { count: importData.length })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
