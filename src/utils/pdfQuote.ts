// Générateur de PDF pour devis
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, QuoteItem } from './apiCommercial';
import { addStandardHeader, addStandardFooter, DocumentType } from './pdfGenerator';

interface QuoteData extends Quote {
  items: QuoteItem[];
}

export async function generateQuotePDF(quote: QuoteData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête standard avec logo
  await addStandardHeader(doc, 'quote' as DocumentType, quote.quote_number, new Date(quote.created_at).toLocaleDateString('fr-FR'));
  
  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth / 2, 55, { align: 'center' });
  
  // Informations devis
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Devis: ${quote.quote_number}`, 14, 65);
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString('fr-FR')}`, 14, 70);
  doc.text(`Valide jusqu'au: ${new Date(quote.validity_date).toLocaleDateString('fr-FR')}`, 14, 75);
  
  // Statut
  const statusColors: Record<string, [number, number, number]> = {
    draft: [150, 150, 150],
    sent: [59, 130, 246],
    pending: [249, 115, 22],
    accepted: [34, 197, 94],
    rejected: [239, 68, 68],
    expired: [107, 114, 128],
    converted: [147, 51, 234]
  };
  const statusLabels: Record<string, string> = {
    draft: 'BROUILLON',
    sent: 'ENVOYÉ',
    pending: 'EN ATTENTE',
    accepted: 'ACCEPTÉ',
    rejected: 'REFUSÉ',
    expired: 'EXPIRÉ',
    converted: 'CONVERTI'
  };
  
  doc.setFillColor(...(statusColors[quote.status] || [150, 150, 150]));
  doc.roundedRect(pageWidth - 50, 62, 36, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(statusLabels[quote.status] || quote.status.toUpperCase(), pageWidth - 32, 68, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Informations client
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAIRE:', pageWidth - 80, 65);
  doc.setFont('helvetica', 'normal');
  if (quote.client_name) doc.text(quote.client_name, pageWidth - 80, 72);
  if (quote.client_phone) doc.text(`Tél: ${quote.client_phone}`, pageWidth - 80, 77);
  if (quote.client_email) doc.text(quote.client_email, pageWidth - 80, 82);
  
  // Tableau des articles
  const tableData = quote.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price.toLocaleString()} FCFA`,
    item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
    `${item.total.toLocaleString()} FCFA`
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Remise', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 51],
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
  doc.rect(pageWidth - 80, finalY, 66, 55);
  
  doc.setFontSize(10);
  doc.text('Sous-total HT:', pageWidth - 76, finalY + 10);
  doc.text(`${(quote.subtotal + quote.discount_amount).toLocaleString()} FCFA`, pageWidth - 18, finalY + 10, { align: 'right' });
  
  if (quote.discount_amount > 0) {
    doc.setTextColor(34, 197, 94);
    doc.text('Remise:', pageWidth - 76, finalY + 18);
    doc.text(`-${quote.discount_amount.toLocaleString()} FCFA`, pageWidth - 18, finalY + 18, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  doc.text('Net HT:', pageWidth - 76, finalY + 26);
  doc.text(`${quote.subtotal.toLocaleString()} FCFA`, pageWidth - 18, finalY + 26, { align: 'right' });
  
  doc.text('TVA (19.25%):', pageWidth - 76, finalY + 34);
  doc.text(`${quote.tax_amount.toLocaleString()} FCFA`, pageWidth - 18, finalY + 34, { align: 'right' });
  
  doc.setDrawColor(0, 102, 51);
  doc.line(pageWidth - 76, finalY + 40, pageWidth - 18, finalY + 40);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL TTC:', pageWidth - 76, finalY + 50);
  doc.text(`${quote.total.toLocaleString()} FCFA`, pageWidth - 18, finalY + 50, { align: 'right' });
  
  // Notes
  if (quote.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Notes et conditions:', 14, finalY + 10);
    const notesLines = doc.splitTextToSize(quote.notes, pageWidth - 100);
    doc.text(notesLines, 14, finalY + 16);
  }
  
  // Conditions générales
  const conditionsY = finalY + 65;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('CONDITIONS GÉNÉRALES:', 14, conditionsY);
  doc.text('• Ce devis est valable jusqu\'à la date indiquée ci-dessus.', 14, conditionsY + 5);
  doc.text('• Toute commande implique l\'acceptation des présentes conditions.', 14, conditionsY + 10);
  doc.text('• Les prix sont indiqués en FCFA et incluent la TVA au taux en vigueur.', 14, conditionsY + 15);
  doc.text('• Délai de livraison: à convenir selon disponibilité.', 14, conditionsY + 20);
  doc.setTextColor(0, 0, 0);
  
  // Zone de signature
  doc.setFontSize(9);
  doc.text('Bon pour accord:', 14, conditionsY + 35);
  doc.text('Date:', 14, conditionsY + 45);
  doc.text('Signature:', 14, conditionsY + 55);
  
  doc.setDrawColor(150, 150, 150);
  doc.line(35, conditionsY + 45, 80, conditionsY + 45);
  doc.line(35, conditionsY + 55, 80, conditionsY + 55);
  
  // Pied de page
  await addStandardFooter(doc, 1, 1);
  
  return doc;
}

export async function downloadQuotePDF(quote: QuoteData) {
  const doc = await generateQuotePDF(quote);
  doc.save(`Devis_${quote.quote_number}.pdf`);
}
