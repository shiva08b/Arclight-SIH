export type ComplianceStatus = 'COMPLIANT' | 'NON-COMPLIANT' | 'REQUIRES_REVIEW';

export interface MetrologyRuleCheck {
  parameter: string;
  extractedInfo: string;
  requirement: string;
  status: 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Not Applicable';
  confidence: string;
  note?: string;
}

export interface ClaimDetected {
  claim: string;
  detected: boolean;
  status: string;
}

export interface TamperAnalysis {
  mrpStickerDetected: boolean;
  stickerOverOriginalPrint: 'High Probability' | 'Low' | 'None';
  fontConsistency: 'Mismatch Detected' | 'Consistent' | 'Marginal';
  printQualityConsistency: 'Inconsistent' | 'Consistent';
  overallTamperRiskScore: number; // 0 to 100
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export interface InspectorDetails {
  name: string;
  designation: string;
  department: string;
  location: string;
  coordinates: string;
  officerId: string;
}

export interface ProductInspectionRecord {
  id: string;
  reportId: string;
  generatedOn: string;
  capturedOn: string;
  productName: string;
  brand: string;
  category: string;
  netQuantity: string;
  mrp?: string;
  barcode?: string;
  packagingType: string;
  fssaiLicenseNo: string;
  batchNo: string;
  mfgDate: string;
  expDate: string;
  frontImageUrl: string;
  backImageUrl?: string;
  overallStatus: ComplianceStatus;
  complianceScore: number; // 0 to 100
  summaryCounts: {
    compliant: number;
    nonCompliant: number;
    requiresReview: number;
  };
  rulesCheck: MetrologyRuleCheck[];
  claimsDetected: ClaimDetected[];
  tamperAnalysis: TamperAnalysis;
  inspector: InspectorDetails;
  attachmentsCount: {
    originalImages: number;
    croppedLabels: number;
    ocrOutput: number;
  };
  remarks: string;
  signatureName: string;
  infractionSeverity?: 'High' | 'Medium' | 'Low';
  infractionTag?: string;
  penaltyEstimate?: number;
  storeContext?: {
    storeName: string;
    firNumber: string;
    aisleBay: string;
    shelfAnchor: string;
  };
  latitude?: number;
  longitude?: number;
  manufacturerId?: string;
  violationTypes?: string[];
}

export interface InspectionTask {
  id: string;
  taskNumber: string;
  title: string;
  storeName: string;
  location: string;
  category: string;
  dueDate: string;
  targetCount: number;
  completedCount: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  notes?: string;
}

export interface HotspotZone {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  totalInspections: number;
  nonCompliantInspections: number;
  violationDensity: number; // percentage 0 to 100
  priorityLevel: 'High Inspection Priority' | 'Moderate Inspection Priority' | 'Low Surveillance Zone';
  topFindingCategory: string;
  affectedManufacturersCount: number;
  dominantCategories: string[];
}

export type ActiveTab = 'home' | 'inspect' | 'history' | 'more';
export type ScreenView =
  | 'splash'
  | 'home'
  | 'inspect'
  | 'analyzing'
  | 'result'
  | 'declaration-detail'
  | 'history'
  | 'saved'
  | 'more'
  | 'heatmap';
