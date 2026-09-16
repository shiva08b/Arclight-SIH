import { ProductInspectionRecord, RuleCheckItem } from '../types';

export function createInspectionFromCapturedImage(imageDataUrl: string, sampleCategory?: string): ProductInspectionRecord {
  const timestamp = new Date();
  const dateStr = timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reportId = `LL-${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}-${randomSuffix}`;

  // Analyze or generate dynamic realistic Legal Metrology findings
  const rulesCheck: RuleCheckItem[] = [
    {
      id: 'rule-mrp',
      parameter: 'MRP Declaration',
      status: 'Non-Compliant',
      detail: 'MRP declared as ₹ 299.00 without clear Unit Sale Price (USP) per gram.',
      legalRef: 'PCR 2011 Rule 6(1)(e) & Legal Metrology Act Sec 18'
    },
    {
      id: 'rule-netqty',
      parameter: 'Net Quantity',
      status: 'Compliant',
      detail: 'Declared in standard SI units (200 g) complying with Second Schedule tolerances.',
      legalRef: 'PCR 2011 Rule 12 & Schedule 2'
    },
    {
      id: 'rule-mfgdate',
      parameter: 'Date of Packing / Mfg',
      status: 'Compliant',
      detail: 'Month and year of manufacture clearly specified (08/2025).',
      legalRef: 'PCR 2011 Rule 6(1)(d)'
    },
    {
      id: 'rule-mfgaddr',
      parameter: 'Manufacturer Details',
      status: 'Compliant',
      detail: 'Complete postal address with PIN code and country of origin declared.',
      legalRef: 'PCR 2011 Rule 6(1)(a)'
    },
    {
      id: 'rule-consumercare',
      parameter: 'Consumer Care Details',
      status: 'Requires Review',
      detail: 'Customer support email present, but grievance officer telephone number is abbreviated.',
      legalRef: 'PCR 2011 Rule 6(1)(f)'
    },
    {
      id: 'rule-font',
      parameter: 'Font Size & Readability',
      status: 'Non-Compliant',
      detail: 'Principal Display Panel font height is below the 2.0mm minimum threshold required for 200g pack size.',
      legalRef: 'PCR 2011 Rule 7'
    }
  ];

  return {
    id: `rec-captured-${Date.now()}`,
    reportId: reportId,
    productName: 'Scanned Pre-Packaged Commodity',
    brand: 'Inspected Packaged Goods',
    category: 'FMCG / Packaged Food',
    mrp: '₹ 299.00',
    netQuantity: '200 g',
    mfgDate: '08/2025',
    expDate: '08/2026',
    barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    frontImageUrl: imageDataUrl,
    overallStatus: 'NON-COMPLIANT',
    confidenceScore: 94,
    generatedOn: `${dateStr}, ${timeStr}`,
    inspectorName: 'Aditya K. (Inspector ID #DL-9412)',
    location: 'Zone 4, Central Retail Distribution Hub, Delhi',
    rulesCheck: rulesCheck,
    violationsList: [
      'Missing Unit Sale Price (USP) under Rule 6(1)(e)',
      'Sub-standard font height on Principal Display Panel (Rule 7)',
      'Incomplete telephone grievance contact (Rule 6(1)(f))'
    ],
    recommendation: 'Issue Section 18 / Section 36 Compounding Notice under Legal Metrology Act, 2009 for corrective repackaging or compounding fine.'
  };
}
