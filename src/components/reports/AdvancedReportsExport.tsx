import { useState } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  Download,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { useData } from '@/contexts/DataContext';
import * as XLSX from 'xlsx';

type ReportType = 'sales' | 'stock' | 'clients' | 'financial';
type ExportFormat = 'excel' | 'csv' | 'pdf';

export function AdvancedReportsExport() {
  const { sales, articles, clients } = useData();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [dateRange, setDateRange] = useState('30');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filterDataByDate = (data: any[]) => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter(item => {
      const itemDate = new Date(item.date || item.created_at || new Date());
      return itemDate >= cutoffDate;
    });
  };

  const generateSalesReport = () => {
    const filteredSales = filterDataByDate(sales);
    
    return filteredSales.map(sale => ({
      'Date': new Date(sale.date).toLocaleDateString('fr-FR'),
      'N° Facture': sale.invoiceNumber,
      'Client': sale.clientName,
      'Articles': sale.items.length,
      'Montant HT': sale.total / 1.1925,
      'TVA': sale.total - (sale.total / 1.1925),
      'Montant TTC': sale.total,
      'Statut': sale.status,
      'Payé': sale.paid ? 'Oui' : 'Non',
      'Créé par': sale.createdByName
    }));
  };

  const generateStockReport = () => {
    return articles.map(article => ({
      'Code': article.id.slice(0, 8),
      'Nom': article.name,
      'Catégorie': article.category,
      'Stock Actuel': article.stock,
      'Stock Minimum': article.minStock,
      'Unité': article.unit,
      'Prix Achat': article.purchasePrice,
      'Prix Vente': article.price,
      'Valeur Stock': article.stock * article.price,
      'Marge': ((article.price - article.purchasePrice) / article.purchasePrice * 100).toFixed(2) + '%',
      'Statut': article.stock < article.minStock ? 'Stock bas' : 
                article.stock === 0 ? 'Rupture' : 'Normal'
    }));
  };

  const generateClientsReport = () => {
    // Calculate client statistics
    const clientStats = clients.map(client => {
      const clientSales = sales.filter(s => s.clientName === client.name);
      const totalSpent = clientSales.reduce((sum, s) => sum + s.total, 0);
      const lastPurchase = clientSales.length > 0 
        ? new Date(Math.max(...clientSales.map(s => new Date(s.date).getTime())))
        : null;

      return {
        'Nom': client.name,
        'Email': client.email,
        'Téléphone': client.phone,
        'Adresse': client.address,
        'Nombre de Commandes': clientSales.length,
        'Montant Total': totalSpent,
        'Panier Moyen': clientSales.length > 0 ? totalSpent / clientSales.length : 0,
        'Dernière Commande': lastPurchase ? lastPurchase.toLocaleDateString('fr-FR') : 'Aucune'
      };
    });

    return clientStats.sort((a, b) => b['Montant Total'] - a['Montant Total']);
  };

  const generateFinancialReport = () => {
    const filteredSales = filterDataByDate(sales);
    
    // Group by month
    const monthlyData: Record<string, any> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          'Mois': date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
          'Nombre de Ventes': 0,
          'Chiffre d\'Affaires HT': 0,
          'TVA Collectée': 0,
          'Chiffre d\'Affaires TTC': 0,
          'Montant Payé': 0,
          'Montant Impayé': 0
        };
      }
      
      const ht = sale.total / 1.1925;
      const tva = sale.total - ht;
      
      monthlyData[monthKey]['Nombre de Ventes']++;
      monthlyData[monthKey]['Chiffre d\'Affaires HT'] += ht;
      monthlyData[monthKey]['TVA Collectée'] += tva;
      monthlyData[monthKey]['Chiffre d\'Affaires TTC'] += sale.total;
      if (sale.paid) {
        monthlyData[monthKey]['Montant Payé'] += sale.total;
      } else {
        monthlyData[monthKey]['Montant Impayé'] += sale.total;
      }
    });

    return Object.values(monthlyData);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      let data: any[] = [];
      let filename = '';

      // Generate data based on report type
      switch (reportType) {
        case 'sales':
          data = generateSalesReport();
          filename = `rapport_ventes_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'stock':
          data = generateStockReport();
          filename = `rapport_stock_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'clients':
          data = generateClientsReport();
          filename = `rapport_clients_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'financial':
          data = generateFinancialReport();
          filename = `rapport_financier_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      if (exportFormat === 'excel') {
        exportToExcel(data, filename);
      } else if (exportFormat === 'csv') {
        exportToCSV(data, filename);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport');
    
    // Set column widths
    const maxWidth = 30;
    const wscols = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToCSV = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const reportTypeOptions = [
    { value: 'sales', label: 'Rapport des Ventes', icon: FileText },
    { value: 'stock', label: 'Rapport de Stock', icon: FileSpreadsheet },
    { value: 'clients', label: 'Rapport Clients', icon: FileText },
    { value: 'financial', label: 'Rapport Financier', icon: FileSpreadsheet }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Exportation de Rapports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Type de rapport</Label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Période</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="180">6 derniers mois</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
              <SelectItem value="999999">Toutes les données</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <Label>Format d'exportation</Label>
          <div className="flex gap-2">
            <Button
              variant={exportFormat === 'excel' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('excel')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setExportFormat('csv')}
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Données à exporter:</span>
            <Badge variant="secondary">
              {reportType === 'sales' ? filterDataByDate(sales).length :
               reportType === 'stock' ? articles.length :
               reportType === 'clients' ? clients.length :
               'Multiples'} enregistrements
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Format:</span>
            <Badge>{exportFormat.toUpperCase()}</Badge>
          </div>
        </div>

        {/* Export Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Exportation en cours...
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Exporté avec succès !
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Exporter le rapport
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
