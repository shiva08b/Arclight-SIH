import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ProductInspectionRecord } from '../types';

export async function exportReportToPdf(
  elementId: string,
  record: ProductInspectionRecord,
  onProgress?: (msg: string) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report element not found for PDF export');
  }

  try {
    if (onProgress) onProgress('Preparing high-resolution render...');

    // Wait slightly to ensure all images and fonts have settled
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2, // Crisp high-definition resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    if (onProgress) onProgress('Compiling official PDF...');

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    if (contentHeight <= pageHeight - margin * 2) {
      // Single page document
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
    } else {
      // Multi-page document
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pageHeight - margin * 2);
      }
    }

    const reportIdentifier = record.reportId || `LL-${Date.now()}`;
    const cleanFilename = `Inspection_Report_${reportIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    pdf.save(cleanFilename);

    if (onProgress) onProgress('Download initiated!');
  } catch (err) {
    console.error('PDF export error, falling back to browser print:', err);
    window.print();
  }
}

export function printReport(): void {
  window.print();
}
