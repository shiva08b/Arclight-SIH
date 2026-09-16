import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileEdit,
  CheckCircle,
  Save,
  Check,
  FileText,
  Camera,
  Building2,
  BarChart2,
  ShieldAlert,
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { IndianEmblem, TricolorStripe } from './LayoutComponents';
import { ProductInspectionRecord } from '../types';
import { getCompanyComplianceStats } from '../utils/companyCompliance';
import { CompanyHistoryModal } from './CompanyHistoryModal';

/* ==========================================================================
   1. INSPECTION RESULT SCREEN
   ========================================================================== */
interface ScreenInspectionResultProps {
  record: ProductInspectionRecord;
  onBack: () => void;
  onViewDetailedAnalysis: () => void;
  onSelectDeclaration: (paramName: string) => void;
}

export function ScreenInspectionResult({
  record,
  onBack,
  onViewDetailedAnalysis,
  onSelectDeclaration,
}: ScreenInspectionResultProps) {
  const isCompliant = record.overallStatus === 'COMPLIANT';
  const [isCompanyHistoryOpen, setIsCompanyHistoryOpen] = useState(false);

  const stats = getCompanyComplianceStats(record);

  // Dynamically map from Gemini AI / scanner rule checks
  const declarations = (record.rulesCheck && record.rulesCheck.length > 0)
    ? record.rulesCheck.map((rule) => {
        const isViolation = rule.status === 'Non-Compliant';
        const isBorderline = rule.status === 'Requires Review';
        return {
          name: rule.parameter,
          status: rule.status === 'Compliant' ? 'Compliant' : isViolation ? 'Violation' : 'Borderline',
          score: isViolation ? '74%' : isBorderline ? '86%' : '98%',
          isViolation,
          isBorderline,
        };
      })
    : [
        {
          name: 'Manufacturer / Packer Details',
          status: 'Compliant',
          score: '98%',
          isViolation: false,
          isBorderline: false,
        },
        {
          name: 'Net Quantity',
          status: 'Compliant',
          score: '96%',
          isViolation: false,
          isBorderline: false,
        },
        {
          name: 'Maximum Retail Price (MRP)',
          status: isCompliant ? 'Compliant' : 'Violation',
          score: isCompliant ? '99%' : '92%',
          isViolation: !isCompliant,
          isBorderline: false,
        },
        {
          name: 'Date of Manufacture',
          status: 'Compliant',
          score: '95%',
          isViolation: false,
          isBorderline: false,
        },
        {
          name: 'Consumer Care Information',
          status: isCompliant ? 'Compliant' : 'Violation',
          score: isCompliant ? '97%' : '89%',
          isViolation: !isCompliant,
          isBorderline: false,
        },
        {
          name: 'Font Size / Readability',
          status: isCompliant ? 'Compliant' : 'Borderline',
          score: isCompliant ? '95%' : '78%',
          isViolation: false,
          isBorderline: !isCompliant,
        },
      ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <button
          id="btn-inspection-result-back"
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 -ml-1 text-slate-700 hover:text-[#0066cc] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Inspection Result</h1>
      </header>

      <div className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-4">
        {/* Compliance Status Banner */}
        <div
          className={`rounded-2xl p-4 flex flex-col items-center text-center shadow-2xs border ${
            isCompliant
              ? 'bg-emerald-50/80 border-emerald-200/90'
              : 'bg-orange-50/80 border-orange-200/90'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-xs ${
              isCompliant ? 'bg-emerald-100 text-[#10b981]' : 'bg-orange-100 text-[#f97316]'
            }`}
          >
            {isCompliant ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>

          <h2
            className={`text-base font-black tracking-wider ${
              isCompliant ? 'text-[#059669]' : 'text-[#c2410c]'
            }`}
          >
            {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {isCompliant
              ? 'All statutory declarations verified'
              : '3 potential violations detected'}
          </p>

          <div
            className={`mt-3 pt-2.5 border-t w-full flex flex-col items-center ${
              isCompliant ? 'border-emerald-200/60' : 'border-orange-200/60'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-medium">Overall confidence</span>
            <span
              className={`text-2xl font-black mt-0.5 ${
                isCompliant ? 'text-[#059669]' : 'text-[#c2410c]'
              }`}
            >
              {isCompliant ? '98%' : '94%'}
            </span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* PRODUCT IDENTIFICATION & MANUFACTURER COMPLIANCE HISTORY SECTION  */}
        {/* ================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0066cc]" />
              Product Identification & Company History
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              GTIN-{stats.productId}
            </span>
          </div>

          {/* Product Identification Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Product ID</span>
              <span className="font-mono font-bold text-slate-900">{stats.productId}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Company ID</span>
              <span className="font-mono font-bold text-blue-700">{stats.companyId}</span>
            </div>
            <div className="col-span-2 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Manufacturer / Packer</span>
              <span className="font-bold text-slate-900 text-xs">{stats.companyName}</span>
            </div>
          </div>

          {/* 3 Metric Counts */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-center">
              <span className="text-[9.5px] text-slate-500 font-semibold block leading-tight">Previous Inspection Records</span>
              <span className="text-sm font-black text-slate-900 mt-1 block">{stats.totalInspections}</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-2 rounded-xl text-center">
              <span className="text-[9.5px] text-orange-800 font-semibold block leading-tight">Previous Potential Issues</span>
              <span className="text-sm font-black text-[#c2410c] mt-1 block">{stats.potentialIssuesCount}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-center">
              <span className="text-[9.5px] text-blue-800 font-semibold block leading-tight">Products with Findings</span>
              <span className="text-sm font-black text-[#0066cc] mt-1 block">{stats.productsWithFindingsCount}</span>
            </div>
          </div>

          {/* Neutral Statutory Phrasing Banner */}
          <div className="bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-snug">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Previous compliance findings associated with this manufacturer</span>
              <span className="text-[10px] text-amber-800/90 block mt-0.5">Historical data compiled from Legal Metrology enforcement registry.</span>
            </div>
          </div>

          {/* Previous Findings Breakdown */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span>Previous Findings by Category</span>
              <span className="text-[10px] text-[#c2410c] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                Top issue: {stats.mostFrequentFinding}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {stats.findingsByCategory.map((f) => (
                <div key={f.category} className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-700 text-[11px] font-medium">{f.category}</span>
                  <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10.5px]">
                    {f.count} {f.count === 1 ? 'finding' : 'findings'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products Portfolio */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                Related Manufacturer Products
              </span>
              <span className="text-[10px] font-normal text-slate-500">Cross-SKU Trends</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {stats.relatedProducts.slice(0, 4).map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[10.5px] flex flex-col justify-between">
                  <span className="font-semibold text-slate-800 truncate">{p.productName}</span>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-500">{p.inspectionsCount} audits</span>
                    <span className={`font-bold ${p.issuesCount > 0 ? 'text-[#c2410c]' : 'text-[#059669]'}`}>
                      {p.issuesCount} {p.issuesCount === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Company History Action Button */}
          <button
            id="btn-view-company-history"
            onClick={() => setIsCompanyHistoryOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer mt-2"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>View Company History</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Declaration Verification */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-900">Declaration Verification</h3>

          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {declarations.map((item) => (
              <div
                key={item.name}
                onClick={() => onSelectDeclaration(item.name)}
                className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {item.isViolation ? (
                    <AlertTriangle className="w-4 h-4 text-[#f97316] flex-shrink-0" />
                  ) : item.isBorderline ? (
                    <AlertCircle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isViolation
                        ? 'bg-orange-50 text-[#c2410c] border border-orange-200'
                        : item.isBorderline
                        ? 'bg-amber-50 text-[#b45309] border border-amber-200'
                        : 'bg-emerald-50 text-[#059669] border border-emerald-200'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-slate-700 w-8 text-right">
                    {item.score}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          id="btn-view-detailed-analysis"
          onClick={onViewDetailedAnalysis}
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer mt-1"
        >
          <span>View Detailed Analysis</span>
          <span>→</span>
        </button>
      </div>

      {/* Detailed Company Compliance Modal */}
      <CompanyHistoryModal
        record={record}
        isOpen={isCompanyHistoryOpen}
        onClose={() => setIsCompanyHistoryOpen(false)}
      />
    </div>
  );
}

/* ==========================================================================
   2. SCREEN DECLARATION DETAIL
   ========================================================================== */
interface ScreenDeclarationDetailProps {
  record: ProductInspectionRecord;
  declarationName?: string;
  onBack: () => void;
  onSaveInspection: () => void;
}

export function ScreenDeclarationDetail({
  record,
  declarationName = 'MRP Declaration',
  onBack,
  onSaveInspection,
}: ScreenDeclarationDetailProps) {
  const [isReviewed, setIsReviewed] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [isRemarkOpen, setIsRemarkOpen] = useState(false);

  // Find matching rule from Gemini AI inspection
  const matchedRule = record.rulesCheck?.find(
    (r) => r.parameter.toLowerCase() === declarationName.toLowerCase() ||
           declarationName.toLowerCase().includes(r.parameter.toLowerCase()) ||
           r.parameter.toLowerCase().includes(declarationName.toLowerCase().split(' ')[0])
  ) || record.rulesCheck?.[0];

  const isRuleViolation = matchedRule ? matchedRule.status === 'Non-Compliant' : true;
  const isRuleReview = matchedRule ? matchedRule.status === 'Requires Review' : false;
  const isRuleCompliant = matchedRule ? matchedRule.status === 'Compliant' : false;

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <button
          id="btn-declaration-detail-back"
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 -ml-1 text-slate-700 hover:text-[#0066cc] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900">{declarationName}</h1>
      </header>

      <div className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-4">
        {/* Scanned Label Evidence Image / Crop Preview */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center">
            {record.frontImageUrl ? (
              <div className="w-full max-w-[280px] h-40 rounded-lg overflow-hidden relative border border-slate-300 shadow-xs">
                <img
                  src={record.frontImageUrl}
                  alt={record.productName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                  {record.brand} • {declarationName}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[280px] bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-2.5">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Net Quantity :</span>{' '}
                  <span className="font-bold text-slate-900">{record.netQuantity || '200 g'}</span>
                </div>

                <div className="border-2 border-[#f97316] bg-orange-50/50 rounded-md p-2.5 relative shadow-xs">
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    MRP : <span className="font-black text-[#c2410c]">{record.mrp || '₹ 299.00'}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 italic">(inclusive of all taxes)</div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Mfg. Date :</span>{' '}
                  <span className="font-bold text-slate-900">{record.mfgDate || '08/2025'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Compliance Finding Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isRuleCompliant
                  ? 'bg-emerald-100 text-[#10b981]'
                  : isRuleReview
                  ? 'bg-amber-100 text-[#f59e0b]'
                  : 'bg-orange-100 text-[#f97316]'
              }`}
            >
              {isRuleCompliant ? (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              ) : isRuleReview ? (
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {isRuleCompliant ? 'Statutory Declaration Compliant' : isRuleReview ? 'Requires Officer Review' : 'Potential Non-Compliance'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Confidence:{' '}
                <span className={`font-bold ${isRuleCompliant ? 'text-[#059669]' : 'text-[#c2410c]'}`}>
                  {record.confidenceScore || 94}%
                </span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-900 mb-1">Detected Parameter Details</p>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Product / Brand:</span>
                <span className="font-bold text-slate-900">{record.productName} ({record.brand})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Declared MRP:</span>
                <span className="font-bold text-slate-900">{record.mrp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Declared Net Qty:</span>
                <span className="font-bold text-slate-900">{record.netQuantity}</span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-xs font-bold text-slate-900 mb-1">Statutory Observation</p>
            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70">
              {matchedRule?.detail || 'Declaration checked against Legal Metrology (Packaged Commodities) Rules, 2011.'}
            </p>
          </div>

          {matchedRule?.legalRef && (
            <div className="pt-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Legal Citation:</span>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                {matchedRule.legalRef}
              </span>
            </div>
          )}

          {remarkText && (
            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-xs">
              <span className="font-bold text-[#0066cc] block text-[11px]">Officer Remark:</span>
              <span className="text-slate-800">{remarkText}</span>
            </div>
          )}

          {isRemarkOpen && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Enter statutory observation or memo reference..."
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0066cc]"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRemarkOpen(false)}
                  className="text-xs text-slate-500 px-2 py-1 hover:text-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-add-remark"
            onClick={() => setIsRemarkOpen(!isRemarkOpen)}
            className="bg-white hover:bg-slate-50 text-[#0066cc] border border-[#0066cc] py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Add Remark</span>
          </button>

          <button
            id="btn-mark-as-reviewed"
            onClick={() => setIsReviewed(!isReviewed)}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isReviewed
                ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-2xs'
                : 'bg-white hover:bg-emerald-50 text-[#10b981] border border-[#10b981]'
            }`}
          >
            {isReviewed ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Reviewed</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Reviewed</span>
              </>
            )}
          </button>
        </div>

        <button
          id="btn-save-inspection"
          onClick={onSaveInspection}
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer mt-1"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Inspection & Finalize</span>
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. SCREEN INSPECTION SAVED
   ========================================================================== */
interface ScreenInspectionSavedProps {
  onViewReport: () => void;
  onNewInspection: () => void;
}

export function ScreenInspectionSaved({
  onViewReport,
  onNewInspection,
}: ScreenInspectionSavedProps) {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto select-none">
      <div className="flex-1 p-6 flex flex-col items-center justify-between max-w-lg mx-auto w-full gap-5">
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative w-20 h-20 flex items-center justify-center mb-3">
            <span className="absolute -top-1 left-2 w-2 h-2 bg-[#f97316] rounded-full" />
            <span className="absolute top-2 -right-1 w-2 h-2 bg-[#10b981] rounded-full" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#0066cc] rounded-full" />
            <span className="absolute bottom-2 right-1 w-2.5 h-2.5 bg-[#f97316] rounded-full" />

            <div className="w-18 h-18 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-lg">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">Inspection Saved</h2>
          <p className="text-xs text-slate-500 mt-1">The inspection has been saved successfully.</p>

          <div className="flex flex-col gap-2.5 w-full mt-6">
            <button
              id="btn-saved-view-report"
              onClick={onViewReport}
              className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>View PDF Report</span>
            </button>

            <button
              id="btn-saved-new-inspection"
              onClick={onNewInspection}
              className="w-full bg-white hover:bg-emerald-50 text-[#10b981] border-1.5 border-[#10b981] py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#10b981]" />
              <span>New Inspection</span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-[280px] bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col items-center text-center shadow-2xs relative overflow-hidden">
          <div className="w-full h-24 relative flex items-center justify-center">
            <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
              <rect x="10" y="70" width="180" height="4" fill="#cbd5e1" rx="2" />
              <rect x="20" y="45" width="16" height="25" fill="#93c5fd" rx="2" />
              <rect x="42" y="38" width="14" height="32" fill="#a7f3d0" rx="2" />
              <rect x="62" y="46" width="18" height="24" fill="#fed7aa" rx="2" />
              <circle cx="130" cy="35" r="10" fill="#0066cc" />
              <circle cx="134" cy="37" r="2.5" fill="#f97316" />
              <path d="M120 50 C120 45 140 45 140 50 L145 70 L115 70 Z" fill="#0066cc" />
              <path d="M140 52 L155 40 L160 45 L145 60 Z" fill="#10b981" />
            </svg>
          </div>

          <div className="bg-[#0066cc] border border-[#f97316]/40 text-white px-3 py-1 rounded-md text-[10px] font-black tracking-wider uppercase shadow-2xs mt-1">
            FAIR TRADE • STRONGER INDIA
          </div>
        </div>

        <div className="flex flex-col items-center text-center pb-2">
          <TricolorStripe className="h-1 w-24 mb-2" />
          <IndianEmblem className="w-6 h-7 text-slate-800" />
          <span className="text-[11px] font-bold text-slate-900 mt-1">Government of India</span>
          <span className="text-[9.5px] text-slate-500 font-medium">Department of Consumer Affairs</span>
          <span className="text-[9px] text-slate-400 italic mt-0.5">Fair Trade. Stronger India.</span>
        </div>
      </div>
    </div>
  );
}
