import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale, Client } from '@/types/compatibility';
import { COMPANY, formatCurrency } from '@/config/constants';
import { getCompanySettings, getStores } from '@/utils/api';

// Extend jsPDF type to include lastAutoTable from jspdf-autotable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number };
}

// Color constants for consistent styling
const COLORS = {
    PRIMARY: [15, 23, 42] as [number, number, number],      // Slate 900
    ACCENT: [37, 99, 235] as [number, number, number],      // Blue 600
    RED: [220, 38, 38] as [number, number, number],         // Red 600
    GREEN: [22, 163, 74] as [number, number, number],       // Green 600
    GRAY: [100, 116, 139] as [number, number, number],      // Slate 500
    LIGHT_GRAY: [241, 245, 249] as [number, number, number] // Slate 100
};

// Document Types
export type DocumentType = 'invoice' | 'quote' | 'payment' | 'report' | 'delivery';

// Standardized PDF Header (synchronous version with optional company data)
export function addStandardHeaderSync(doc: jsPDF, _documentType: DocumentType, documentNumber: string, date?: string, companyData?: any): number {
    const pageWidth = doc.internal.pageSize.width;
    const company = companyData || COMPANY;
    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 80, 'F');
    // Ligne bleue sous le header
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.line(0, 60, pageWidth, 60);
    // Nom société (Ethnocentric, rouge, très grand, centré)
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(32);
    try {
        doc.setFont('Ethnocentric', 'normal');
    } catch {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(company.name, pageWidth / 2, 35, { align: 'center' });
    // Slogan (bleu, centré)
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'normal');
    doc.text(company.slogan || '', pageWidth / 2, 48, { align: 'center' });
    doc.text(company.address || '', pageWidth / 2, 56, { align: 'center' });
    // Numéro et date (droite)
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${documentNumber}`, pageWidth - 18, 20, { align: 'right' });
    doc.text(date || new Date().toLocaleDateString('fr-FR'), pageWidth - 18, 28, { align: 'right' });
    return 70; // Y position après le header
}

// Standardized PDF Header (async version with dynamic company data)
export async function addStandardHeader(doc: jsPDF, _documentType: DocumentType, documentNumber: string, date?: string): Promise<number> {
    const pageWidth = doc.internal.pageSize.width;
    const company = await getCompanySettings();
    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 80, 'F');
    // Ligne bleue sous le header
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.line(0, 60, pageWidth, 60);
    // Nom société (Ethnocentric, rouge, très grand, centré)
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(32);
    try {
        doc.setFont('Ethnocentric', 'normal');
    } catch {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(company.name, pageWidth / 2, 35, { align: 'center' });
    // Slogan (bleu, centré)
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'normal');
    doc.text(company.slogan || '', pageWidth / 2, 48, { align: 'center' });
    doc.text(company.address || '', pageWidth / 2, 56, { align: 'center' });
    // Numéro et date (droite)
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${documentNumber}`, pageWidth - 18, 20, { align: 'right' });
    doc.text(date || new Date().toLocaleDateString('fr-FR'), pageWidth - 18, 28, { align: 'right' });
    return 70; // Y position après le header
}

// Standardized PDF Footer (synchronous version with optional company data)
export function addStandardFooterSync(doc: jsPDF, pageNumber?: number, totalPages?: number, companyData?: any): void {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 60;
    const company = companyData || COMPANY;
    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY, pageWidth, 60, 'F');
    // Ligne bleue au-dessus du footer
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.line(0, footerY, pageWidth, footerY);
    // Nom société (Ethnocentric, rouge, centré, taille 20)
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(20);
    try {
        doc.setFont('Ethnocentric', 'normal');
    } catch {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(company.name, pageWidth / 2, footerY + 18, { align: 'center' });
    // Coordonnées (bleu, centré)
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'normal');
    doc.text(company.address, pageWidth / 2, footerY + 32, { align: 'center' });
    doc.text(`Tél: ${company.phone} | Email: ${company.email}`, pageWidth / 2, footerY + 42, { align: 'center' });
    // Page Number (droite)
    if (pageNumber && totalPages) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${pageNumber}/${totalPages}`, pageWidth - 18, footerY + 42, { align: 'right' });
    }
}

// Standardized PDF Footer (async version with dynamic company data)
export async function addStandardFooter(doc: jsPDF, pageNumber?: number, totalPages?: number): Promise<void> {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 60;
    const company = await getCompanySettings();
    const stores = await getStores();
    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, footerY, pageWidth, 60, 'F');
    // Ligne bleue au-dessus du footer
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.line(0, footerY, pageWidth, footerY);
    // Nom société (Ethnocentric, rouge, centré, taille 20)
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(20);
    try {
        doc.setFont('Ethnocentric', 'normal');
    } catch {
        doc.setFont('helvetica', 'bold');
    }
    doc.text(company.name, pageWidth / 2, footerY + 18, { align: 'center' });
    // Coordonnées (bleu, centré)
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'normal');
    const storeInfo = stores.map(s => `${s.address}, ${s.city}`).join(' | ');
    doc.text(storeInfo, pageWidth / 2, footerY + 32, { align: 'center' });
    doc.text(`Tél: ${company.phone} | Email: ${company.email} | Site: ${company.website}`, pageWidth / 2, footerY + 42, { align: 'center' });
    // Page Number (droite)
    if (pageNumber && totalPages) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${pageNumber}/${totalPages}`, pageWidth - 18, footerY + 42, { align: 'right' });
    }
}

// Add Client Info Section
export function addClientSection(doc: jsPDF, client: { name: string; address?: string; phone?: string; email?: string }, startY: number, companyData?: any): number {
    const pageWidth = doc.internal.pageSize.width;
    const clientBoxX = pageWidth / 2 + 5;
    const company = companyData || COMPANY;

    // Company "From" box
    doc.setFillColor(...COLORS.LIGHT_GRAY);
    doc.roundedRect(14, startY, (pageWidth - 38) / 2, 35, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.GRAY);
    doc.setFont('helvetica', 'bold');
    doc.text('DE:', 18, startY + 8);

    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFontSize(10);
    doc.text(company.name, 18, startY + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(company.address, 18, startY + 21);
    doc.text(`Tél: ${company.phone}`, 18, startY + 27);
    doc.text(company.email, 18, startY + 32);

    // Client "To" box
    doc.setDrawColor(...COLORS.ACCENT);
    doc.setLineWidth(0.5);
    doc.roundedRect(clientBoxX, startY, (pageWidth - 38) / 2, 35, 3, 3, 'S');

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.GRAY);
    doc.setFont('helvetica', 'bold');
    doc.text('À:', clientBoxX + 4, startY + 8);

    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFontSize(10);
    doc.text(client.name, clientBoxX + 4, startY + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    if (client.address) doc.text(client.address, clientBoxX + 4, startY + 21);
    if (client.phone) doc.text(`Tél: ${client.phone}`, clientBoxX + 4, startY + 27);
    if (client.email) doc.text(client.email, clientBoxX + 4, startY + 32);

    return startY + 42;
}

// Generate Payment Receipt
export function generatePaymentReceipt(
    paymentNumber: string,
    amount: number,
    clientName: string,
    invoiceRef?: string,
    paymentMethod?: string,
    notes?: string
): void {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    let y = addStandardHeaderSync(doc, 'payment', paymentNumber);

    // Payment Details
    doc.setFillColor(...COLORS.LIGHT_GRAY);
    doc.roundedRect(14, y, 182, 50, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.text('REÇU DE PAIEMENT', 105, y + 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${clientName}`, 20, y + 25);
    doc.text(`Montant reçu: ${formatCurrency(amount)}`, 20, y + 33);
    if (invoiceRef) doc.text(`Référence facture: ${invoiceRef}`, 20, y + 41);
    if (paymentMethod) doc.text(`Mode de paiement: ${paymentMethod}`, 120, y + 33);

    y += 60;

    // Amount in words (simplified)
    doc.setFillColor(239, 246, 255); // Light blue
    doc.roundedRect(14, y, 182, 20, 3, 3, 'F');
    doc.setTextColor(...COLORS.ACCENT);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(amount)}`, 105, y + 13, { align: 'center' });

    y += 30;

    if (notes) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.GRAY);
        doc.setFont('helvetica', 'italic');
        doc.text(`Note: ${notes}`, 14, y);
    }

    // Signature area
    y += 20;
    doc.setDrawColor(...COLORS.GRAY);
    doc.setLineWidth(0.3);
    doc.line(120, y + 20, 190, y + 20);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.GRAY);
    doc.text('Signature et cachet', 155, y + 26, { align: 'center' });

    addStandardFooterSync(doc, 1, 1);
    doc.save(`Recu-${paymentNumber}.pdf`);
}

export const generateInvoice = (sale: Sale, client?: Client) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Add standardized header
    let y = addStandardHeaderSync(doc, 'invoice', sale.invoiceNumber || '', new Date(sale.date).toLocaleDateString('fr-FR'));

    // Add client section
    y = addClientSection(doc, {
        name: client?.name || sale.clientName,
        address: client?.address,
        phone: client?.phone,
        email: client?.email
    }, y);

    // Status badge
    const statusLabels: Record<string, { label: string; color: [number, number, number] }> = {
        completed: { label: 'PAYÉE', color: COLORS.GREEN },
        partial: { label: 'PARTIEL', color: [217, 119, 6] },
        pending: { label: 'EN ATTENTE', color: COLORS.RED }
    };
    const status = statusLabels[sale.status] || statusLabels.pending;
    doc.setFillColor(...status.color);
    doc.roundedRect(150, y - 35, 35, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(status.label, 167.5, y - 29, { align: 'center' });

    // Items Table
    const tableColumn = ["#", "Description", "Type", "Qté", "Prix Unit.", "Total"];
    const tableRows = sale.items.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.type === 'service' ? 'Service' : 'Article',
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: y,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.PRIMARY,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 30 },
            5: { halign: 'right', cellWidth: 35 }
        },
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        }
    });

    // Totals
    const finalY = (doc.lastAutoTable?.finalY ?? 100) + 10;
    const pageWidth = doc.internal.pageSize.width;

    // Totals box
    doc.setFillColor(...COLORS.LIGHT_GRAY);
    doc.roundedRect(pageWidth - 80, finalY, 66, 40, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text("Sous-total HT:", pageWidth - 76, finalY + 10);
    doc.text(formatCurrency(sale.total / 1.1925), pageWidth - 18, finalY + 10, { align: 'right' });

    doc.text("TVA (19.25%):", pageWidth - 76, finalY + 18);
    doc.text(formatCurrency(sale.total - (sale.total / 1.1925)), pageWidth - 18, finalY + 18, { align: 'right' });

    doc.setDrawColor(...COLORS.ACCENT);
    doc.line(pageWidth - 76, finalY + 23, pageWidth - 18, finalY + 23);

    doc.setFontSize(11);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.text("Total TTC:", pageWidth - 76, finalY + 32);
    doc.setTextColor(...COLORS.RED);
    doc.text(formatCurrency(sale.total), pageWidth - 18, finalY + 32, { align: 'right' });

    // Payment Info
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, finalY, 90, 40, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ACCENT);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS BANCAIRES', 18, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.PRIMARY);
    doc.text(`Banque: ${COMPANY.bank}`, 18, finalY + 16);
    doc.text(`IBAN: ${COMPANY.iban}`, 18, finalY + 23);
    doc.text('Paiement à réception de facture', 18, finalY + 30);

    // Add standardized footer
    addStandardFooterSync(doc, 1, 1);

    // Save
    doc.save(`Facture-${sale.invoiceNumber}.pdf`);
};

// Generate Quote PDF
export const generateQuote = (items: Array<{ name: string; quantity: number; price: number; type: string }>, clientName: string, quoteNumber: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    let y = addStandardHeaderSync(doc, 'quote', quoteNumber);

    y = addClientSection(doc, { name: clientName }, y);

    // Validity info
    doc.setFillColor(254, 252, 232); // Light yellow
    doc.roundedRect(14, y - 5, 182, 12, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(133, 77, 14);
    doc.text(`Ce devis est valable 30 jours à compter de la date d'émission.`, 20, y + 3);
    y += 15;

    // Items Table
    const tableColumn = ["#", "Description", "Type", "Qté", "Prix Unit.", "Total"];
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tableRows = items.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.type === 'service' ? 'Service' : 'Article',
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
        startY: y,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.ACCENT,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4
        }
    });

    const finalY = (doc.lastAutoTable?.finalY ?? 100) + 10;
    const pageWidth = doc.internal.pageSize.width;

    // Total
    doc.setFillColor(...COLORS.ACCENT);
    doc.roundedRect(pageWidth - 80, finalY, 66, 20, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("Total TTC:", pageWidth - 76, finalY + 8);
    doc.text(formatCurrency(total), pageWidth - 18, finalY + 14, { align: 'right' });

    addStandardFooterSync(doc, 1, 1);
    doc.save(`Devis-${quoteNumber}.pdf`);
};

// Report Metrics Interface
export interface ReportMetrics {
    totalRevenue: number;
    currentMonthRevenue: number;
    revenueGrowth: number;
    paidAmount: number;
    pendingAmount: number;
    stockValue: number;
    lowStockItems: number;
    averageSaleValue: number;
    totalSales: number;
    totalClients: number;
    totalArticles: number;
    totalServices: number;
    topCategories: Array<{ category: string; revenue: number }>;
    monthlyData: Array<{ month: string; revenue: number; sales: number }>;
}

// Generate Business Report PDF
export const generateBusinessReport = (metrics: ReportMetrics, companyName: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width;
    const reportDate = new Date().toLocaleDateString('fr-FR');
    const reportNumber = `RPT-${Date.now().toString().slice(-6)}`;

    // Page 1: Executive Summary
    let y = addStandardHeaderSync(doc, 'report', reportNumber, reportDate);

    // Report Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.text('RAPPORT DE PERFORMANCE', pageWidth / 2, y, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.GRAY);
    doc.text(`Vue d'ensemble des performances de ${companyName}`, pageWidth / 2, y + 7, { align: 'center' });

    y += 20;

    // Key Performance Indicators Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ACCENT);
    doc.text('INDICATEURS CLÉS DE PERFORMANCE', 14, y);

    y += 8;

    // KPI Grid
    const kpiData = [
        ['Chiffre d\'Affaires Total', formatCurrency(metrics.totalRevenue)],
        ['Chiffre d\'Affaires du Mois', formatCurrency(metrics.currentMonthRevenue)],
        ['Croissance', `${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}%`],
        ['Montant Encaissé', formatCurrency(metrics.paidAmount)],
        ['En Attente de Paiement', formatCurrency(metrics.pendingAmount)],
        ['Valeur du Stock', formatCurrency(metrics.stockValue)],
        ['Articles en Rupture', `${metrics.lowStockItems} article(s)`],
        ['Valeur Moyenne par Vente', formatCurrency(metrics.averageSaleValue)],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Indicateur', 'Valeur']],
        body: kpiData,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.PRIMARY,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 90 },
            1: { halign: 'right', cellWidth: 80 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    y = (doc.lastAutoTable?.finalY ?? y) + 15;

    // Statistics Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ACCENT);
    doc.text('RÉSUMÉ STATISTIQUE', 14, y);

    y += 8;

    const statsData = [
        ['Nombre Total de Ventes', metrics.totalSales.toString()],
        ['Nombre de Clients', metrics.totalClients.toString()],
        ['Nombre d\'Articles', metrics.totalArticles.toString()],
        ['Nombre de Services', metrics.totalServices.toString()],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Statistique', 'Valeur']],
        body: statsData,
        theme: 'striped',
        headStyles: {
            fillColor: COLORS.PRIMARY,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 4
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 90 },
            1: { halign: 'right', cellWidth: 80 }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    addStandardFooterSync(doc, 1, 2);

    // Page 2: Categories and Monthly Breakdown
    doc.addPage();
    y = addStandardHeaderSync(doc, 'report', reportNumber, reportDate);

    // Top Categories
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ACCENT);
    doc.text('CATÉGORIES LES PLUS PERFORMANTES', 14, y);

    y += 8;

    if (metrics.topCategories.length > 0) {
        const categoryData = metrics.topCategories.map((cat, index) => [
            (index + 1).toString(),
            cat.category,
            formatCurrency(cat.revenue),
            `${((cat.revenue / metrics.totalRevenue) * 100).toFixed(1)}%`
        ]);

        autoTable(doc, {
            startY: y,
            head: [['#', 'Catégorie', 'Revenu', 'Part']],
            body: categoryData,
            theme: 'striped',
            headStyles: {
                fillColor: COLORS.PRIMARY,
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 4
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 80 },
                2: { halign: 'right', cellWidth: 45 },
                3: { halign: 'right', cellWidth: 30 }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        y = (doc.lastAutoTable?.finalY ?? y) + 15;
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.GRAY);
        doc.text('Aucune donnée de catégorie disponible', 14, y + 5);
        y += 20;
    }

    // Monthly Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ACCENT);
    doc.text('ÉVOLUTION MENSUELLE', 14, y);

    y += 8;

    if (metrics.monthlyData.length > 0) {
        const monthlyTableData = metrics.monthlyData.map(month => [
            month.month,
            month.sales.toString(),
            formatCurrency(month.revenue)
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Mois', 'Ventes', 'Chiffre d\'Affaires']],
            body: monthlyTableData,
            theme: 'striped',
            headStyles: {
                fillColor: COLORS.PRIMARY,
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 4
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { halign: 'center', cellWidth: 40 },
                2: { halign: 'right', cellWidth: 80 }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
    }

    // Summary Box
    y = (doc.lastAutoTable?.finalY ?? y) + 15;

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.ACCENT);
    doc.text('SYNTHÈSE', 20, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.PRIMARY);

    const summaryText = metrics.revenueGrowth >= 0
        ? `Performance positive avec une croissance de ${metrics.revenueGrowth.toFixed(1)}%. Le chiffre d'affaires total s'élève à ${formatCurrency(metrics.totalRevenue)}.`
        : `Performance en baisse de ${Math.abs(metrics.revenueGrowth).toFixed(1)}%. Des actions correctives sont recommandées pour améliorer le chiffre d'affaires.`;

    doc.text(summaryText, 20, y + 20, { maxWidth: pageWidth - 48 });

    addStandardFooterSync(doc, 2, 2);

    // Save
    doc.save(`Rapport-Performance-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Wrapper functions with dynamic company data for better integration
export async function addStandardHeaderWithCompanyData(doc: jsPDF, documentType: DocumentType, documentNumber: string, date?: string): Promise<number> {
    const companyData = await getCompanySettings();
    return addStandardHeaderSync(doc, documentType, documentNumber, date, companyData);
}

export async function addStandardFooterWithCompanyData(doc: jsPDF, pageNumber?: number, totalPages?: number): Promise<void> {
    const companyData = await getCompanySettings();
    return addStandardFooterSync(doc, pageNumber, totalPages, companyData);
}

export async function addClientSectionWithCompanyData(doc: jsPDF, client: { name: string; address?: string; phone?: string; email?: string }, startY: number): Promise<number> {
    const companyData = await getCompanySettings();
    return addClientSection(doc, client, startY, companyData);
}
