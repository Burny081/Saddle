import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Visitor } from '@/types/compatibility';
import { CityData, HourData, DeviceData } from './visitorAnalytics';
import { addStandardHeaderSync, addStandardFooterSync } from './pdfGenerator';

// Extend jsPDF type to include lastAutoTable from jspdf-autotable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number };
}

/**
 * Generate PDF report for visitor analytics with standardized letterhead
 */
export function generateVisitorAnalyticsPDF(
    visitors: Visitor[],
    cityData: CityData[],
    hourData: HourData[],
    deviceData: DeviceData[],
    peakHour: { hour: number; count: number },
    growthRate: number,
    language: 'fr' | 'en' = 'fr'
) {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Translations
    const t = (key: string) => {
        const translations: { [key: string]: { fr: string; en: string } } = {
            title: { fr: 'RAPPORT D\'ANALYSE DES VISITEURS', en: 'VISITOR ANALYTICS REPORT' },
            date: { fr: 'Date du rapport', en: 'Report Date' },
            summary: { fr: 'RÉSUMÉ EXÉCUTIF', en: 'EXECUTIVE SUMMARY' },
            totalVisitors: { fr: 'Total Visiteurs', en: 'Total Visitors' },
            growth: { fr: 'Croissance', en: 'Growth' },
            topCity: { fr: 'Ville Principale', en: 'Top City' },
            peakHour: { fr: 'Heure de Pointe', en: 'Peak Hour' },
            mobileUsers: { fr: 'Utilisateurs Mobile', en: 'Mobile Users' },
            desktopUsers: { fr: 'Utilisateurs Desktop', en: 'Desktop Users' },
            cityDistribution: { fr: 'DISTRIBUTION PAR VILLE', en: 'DISTRIBUTION BY CITY' },
            city: { fr: 'Ville', en: 'City' },
            visitors: { fr: 'Visiteurs', en: 'Visitors' },
            percentage: { fr: 'Pourcentage', en: 'Percentage' },
            deviceDistribution: { fr: 'RÉPARTITION PAR APPAREIL', en: 'DEVICE DISTRIBUTION' },
            device: { fr: 'Appareil', en: 'Device' },
            hourlyActivity: { fr: 'ACTIVITÉ PAR HEURE', en: 'HOURLY ACTIVITY' },
            hour: { fr: 'Heure', en: 'Hour' },
            count: { fr: 'Nombre', en: 'Count' },
        };
        return translations[key]?.[language] || key;
    };

    // Page 1: Summary
    const reportDate = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
    let yPos = addStandardHeaderSync(doc, 'report', `VIS-${Date.now().toString().slice(-6)}`, reportDate);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(t('title'), pageWidth / 2, yPos, { align: 'center' });

    // Executive Summary
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(t('summary'), 14, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const mobileCount = visitors.filter(v => v.device === 'Mobile').length;
    const desktopCount = visitors.filter(v => v.device === 'Desktop').length;

    const summaryData = [
        [t('totalVisitors'), visitors.length.toString()],
        [t('growth'), `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`],
        [t('topCity'), cityData[0]?.city || 'N/A'],
        [t('peakHour'), `${peakHour.hour}h00 (${peakHour.count} ${t('visitors').toLowerCase()})`],
        [t('mobileUsers'), `${mobileCount} (${visitors.length > 0 ? ((mobileCount / visitors.length) * 100).toFixed(1) : 0}%)`],
        [t('desktopUsers'), `${desktopCount} (${visitors.length > 0 ? ((desktopCount / visitors.length) * 100).toFixed(1) : 0}%)`],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 'auto' }
        }
    });

    // City Distribution Table
    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(t('cityDistribution'), 14, yPos);

    yPos += 5;
    autoTable(doc, {
        startY: yPos,
        head: [[t('city'), t('visitors'), t('percentage')]],
        body: cityData.slice(0, 10).map(city => [
            city.city,
            city.count.toString(),
            `${city.percentage.toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    addStandardFooterSync(doc, 1, 2);

    // Page 2: Device Distribution and Hourly Activity
    doc.addPage();
    yPos = addStandardHeaderSync(doc, 'report', `VIS-${Date.now().toString().slice(-6)}`, reportDate);

    // Device Distribution
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(t('deviceDistribution'), 14, yPos);

    yPos += 5;
    autoTable(doc, {
        startY: yPos,
        head: [[t('device'), t('visitors'), t('percentage')]],
        body: deviceData.map(device => [
            device.device,
            device.count.toString(),
            `${device.percentage.toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Hourly Activity
    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text(t('hourlyActivity'), 14, yPos);

    yPos += 5;

    // Format hourly data in a more compact table
    const hourlyBody = [];
    for (let i = 0; i < hourData.length; i += 4) {
        const row = [];
        for (let j = 0; j < 4 && i + j < hourData.length; j++) {
            const hour = hourData[i + j];
            row.push(`${hour.hour}h00`, hour.count.toString());
        }
        hourlyBody.push(row);
    }

    autoTable(doc, {
        startY: yPos,
        head: [[t('hour'), t('count'), t('hour'), t('count'), t('hour'), t('count'), t('hour'), t('count')]],
        body: hourlyBody,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, halign: 'center' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    addStandardFooterSync(doc, 2, 2);

    // Save PDF
    const fileName = `Rapport_Visiteurs_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}
