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

    const canvas = await html2canvas(element, {
      scale: 2, // Crisp retina resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    if (onProgress) onProgress('Compiling PDF pages...');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Center content within page
    const yPos = margin;

    pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, Math.min(contentHeight, pageHeight - margin * 2));

    const cleanFilename = `Inspection_Report_${record.reportId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    pdf.save(cleanFilename);

    if (onProgress) onProgress('Download initiated!');
  } catch (err) {
    console.error('PDF export failed, falling back to browser print:', err);
    // Graceful fallback
    window.print();
  }
}

export function printReport(): void {
  window.print();
}
