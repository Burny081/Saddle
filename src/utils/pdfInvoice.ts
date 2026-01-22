// Générateur de PDF pour factures
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './apiComptable';
import { addStandardHeader, addStandardFooter, DocumentType } from './pdfGenerator';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  total: number;
}

interface InvoiceData extends Invoice {
  items: InvoiceItem[];
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête standard avec logo
  await addStandardHeader(doc, 'invoice' as DocumentType, invoice.invoice_number, new Date(invoice.issue_date).toLocaleDateString('fr-FR'));
  
  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth / 2, 55, { align: 'center' });
  
  // Informations facture
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Facture: ${invoice.invoice_number}`, 14, 65);
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`, 14, 70);
  doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 14, 75);
  
  // Statut
  const statusColors: Record<string, [number, number, number]> = {
    draft: [150, 150, 150],
    sent: [59, 130, 246],
    paid: [34, 197, 94],
    partial: [249, 115, 22],
    overdue: [239, 68, 68],
    cancelled: [107, 114, 128]
  };
  const statusLabels: Record<string, string> = {
    draft: 'BROUILLON',
    sent: 'ENVOYÉE',
    paid: 'PAYÉE',
    partial: 'PARTIEL',
    overdue: 'EN RETARD',
    cancelled: 'ANNULÉE'
  };
  
  doc.setFillColor(...(statusColors[invoice.status] || [150, 150, 150]));
  doc.roundedRect(pageWidth - 50, 62, 36, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(statusLabels[invoice.status] || invoice.status.toUpperCase(), pageWidth - 32, 68, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Informations client
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURER À:', pageWidth - 80, 65);
  doc.setFont('helvetica', 'normal');
  if (invoice.client_name) doc.text(invoice.client_name, pageWidth - 80, 72);
  if (invoice.client_address) doc.text(invoice.client_address, pageWidth - 80, 77);
  if (invoice.client_phone) doc.text(`Tél: ${invoice.client_phone}`, pageWidth - 80, 82);
  if (invoice.client_email) doc.text(invoice.client_email, pageWidth - 80, 87);
  
  // Tableau des articles
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price.toLocaleString()} FCFA`,
    item.discount_percent ? `${item.discount_percent}%` : '-',
    `${item.total.toLocaleString()} FCFA`
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Remise', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  });
  
  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Cadre des totaux
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - 80, finalY, 66, 45);
  
  doc.setFontSize(10);
  doc.text('Sous-total:', pageWidth - 76, finalY + 10);
  doc.text(`${invoice.subtotal.toLocaleString()} FCFA`, pageWidth - 18, finalY + 10, { align: 'right' });
  
  doc.text('TVA (19.25%):', pageWidth - 76, finalY + 20);
  doc.text(`${invoice.tax_amount.toLocaleString()} FCFA`, pageWidth - 18, finalY + 20, { align: 'right' });
  
  doc.setDrawColor(0, 51, 102);
  doc.line(pageWidth - 76, finalY + 25, pageWidth - 18, finalY + 25);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 76, finalY + 35);
  doc.text(`${invoice.total.toLocaleString()} FCFA`, pageWidth - 18, finalY + 35, { align: 'right' });
  
  // Montant payé et reste à payer
  if (invoice.paid_amount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Déjà payé: ${invoice.paid_amount.toLocaleString()} FCFA`, pageWidth - 76, finalY + 50);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text(`Reste à payer: ${(invoice.total - invoice.paid_amount).toLocaleString()} FCFA`, pageWidth - 76, finalY + 58);
    doc.setTextColor(0, 0, 0);
  }
  
  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notes:', 14, finalY + 10);
    doc.text(invoice.notes, 14, finalY + 16);
  }
  
  // Conditions de paiement
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Conditions de paiement: Paiement à réception de facture.', 14, finalY + 50);
  doc.text('Modes de paiement acceptés: Espèces, Virement bancaire, Mobile Money (OM, MoMo)', 14, finalY + 55);
  doc.setTextColor(0, 0, 0);
  
  // Pied de page
  await addStandardFooter(doc, 1, 1);
  
  return doc;
}

export async function downloadInvoicePDF(invoice: InvoiceData) {
  const doc = await generateInvoicePDF(invoice);
  doc.save(`Facture_${invoice.invoice_number}.pdf`);
}
