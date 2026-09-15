import React, { useState } from 'react';
import { ProductInspectionRecord } from '../types';
import { exportReportToPdf, printReport } from '../utils/pdfExport';
import {
  Download,
  Printer,
  X,
  Check,
  Loader2,
  Share2,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Crop,
} from 'lucide-react';

interface PdfReportDocumentProps {
  record: ProductInspectionRecord;
  id?: string;
}

export const PdfReportDocument: React.FC<PdfReportDocumentProps> = ({
  record,
  id = 'printable-inspection-report',
}) => {
  const isCompliant = record.overallStatus === 'COMPLIANT';
  const isReview = record.overallStatus === 'REQUIRES_REVIEW';

  return (
    <div
      id={id}
      className="w-full max-w-4xl mx-auto bg-white text-slate-900 font-sans p-3 sm:p-5 border border-slate-300 shadow-xl print:border-none print:shadow-none print:p-4 print:max-w-none text-[10.5px] leading-tight select-text overflow-hidden"
      style={{ fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Official Government Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2.5 mb-2.5 gap-2">
        <div className="flex items-center gap-2 max-w-[200px]">
          <div className="w-9 h-11 flex flex-col items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 125" className="w-8 h-10 text-amber-950 fill-current" aria-label="State Emblem of India">
              <path d="M50 5 C45 5 42 10 42 15 C42 22 45 28 47 33 C41 33 35 37 34 43 C33 48 37 54 42 56 C39 60 38 67 40 73 C42 78 46 82 50 82 C54 82 58 78 60 73 C62 67 61 60 58 56 C63 54 67 48 66 43 C65 37 59 33 53 33 C55 28 58 22 58 15 C58 10 55 5 50 5 Z" opacity="0.85"/>
              <circle cx="50" cy="92" r="6" fill="#000080"/>
              <path d="M47 91 L53 93 M50 88 L50 96 M48 95 L52 89" stroke="#fff" strokeWidth="0.8"/>
              <rect x="26" y="98" width="48" height="4" rx="1" fill="#334155"/>
            </svg>
            <span className="text-[6.5px] font-bold tracking-widest text-slate-700 uppercase -mt-0.5">सत्यमेव जयते</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[9px] uppercase text-slate-800 tracking-tight">Department of Legal Metrology</span>
            <span className="text-[8.5px] text-slate-600 font-medium">Government of India</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center flex-1 px-1">
          <div className="flex items-center gap-1">
            <span className="font-black text-[17px] sm:text-[19px] tracking-tight text-blue-950">LABEL</span>
            <span className="font-black text-[17px] sm:text-[19px] tracking-tight text-sky-600">LENS</span>
          </div>
          <span className="text-[8px] text-slate-600 font-medium tracking-wide">
            Legal Metrology Compliance System
          </span>
          <div className="mt-1 bg-[#0f2942] text-white px-3 py-0.5 rounded-xs font-bold text-[10.5px] uppercase tracking-wider shadow-xs">
            INSPECTION REPORT
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <div className="flex flex-col items-end text-[8.5px]">
            <span className="font-semibold text-slate-800">
              Report ID: <span className="font-mono font-bold text-slate-900">{record.reportId}</span>
            </span>
            <span className="text-slate-600">
              Generated: <span className="font-medium text-slate-800">{record.generatedOn}</span>
            </span>
          </div>
          <div className="w-10 h-10 bg-white border border-slate-400 p-0.5 flex flex-col justify-between flex-shrink-0">
            <div className="flex justify-between">
              <div className="w-3 h-3 border-2 border-slate-900 flex items-center justify-center"><div className="w-1 h-1 bg-slate-900"></div></div>
              <div className="w-3 h-3 border-2 border-slate-900 flex items-center justify-center"><div className="w-1 h-1 bg-slate-900"></div></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-900"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-3 h-3 border-2 border-slate-900 flex items-center justify-center"><div className="w-1 h-1 bg-slate-900"></div></div>
              <div className="w-1 h-1 bg-slate-900 self-end"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3-Box Grid */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-4 border border-slate-300 rounded-xs flex flex-col bg-slate-50/50 p-1.5">
          <div className="text-[9px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
            1. PRODUCT IMAGE
          </div>
          <div className="grid grid-cols-2 gap-1 flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className="w-full h-24 bg-white border border-slate-200 rounded-xs overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                <img
                  src={record.frontImageUrl}
                  alt="Product Front"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[7.5px] text-slate-500 font-medium mt-0.5">Front Pack</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-24 bg-white border border-slate-200 rounded-xs overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                <img
                  src={record.backImageUrl || record.frontImageUrl}
                  alt="Product Back Label"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[7.5px] text-slate-500 font-medium mt-0.5">Back / MRP</span>
            </div>
          </div>
          <div className="text-[7.5px] text-slate-500 text-center mt-1 font-medium border-t border-slate-200 pt-0.5">
            Captured: <span className="text-slate-700 font-semibold">{record.capturedOn}</span>
          </div>
        </div>

        <div className="col-span-4 border border-slate-300 rounded-xs p-1.5 flex flex-col bg-slate-50/50">
          <div className="text-[9px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
            2. PRODUCT DETAILS
          </div>
          <table className="w-full text-[8px] border-collapse flex-1">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600 w-[45%]">Product Name</td>
                <td className="py-0.5 font-bold text-slate-900 truncate max-w-[100px]">{record.productName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Brand</td>
                <td className="py-0.5 text-slate-800">{record.brand}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Category</td>
                <td className="py-0.5 text-slate-800">{record.category}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Net Quantity</td>
                <td className="py-0.5 font-bold text-slate-900">{record.netQuantity}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Packaging Type</td>
                <td className="py-0.5 text-slate-800">{record.packagingType}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">FSSAI License</td>
                <td className="py-0.5 font-mono text-slate-800">{record.fssaiLicenseNo}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Batch No.</td>
                <td className="py-0.5 font-mono font-medium text-slate-800">{record.batchNo}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-0.5 font-semibold text-slate-600">Mfg. Date</td>
                <td className="py-0.5 text-slate-800">{record.mfgDate}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Exp. / Best Before</td>
                <td className="py-0.5 font-semibold text-slate-900">{record.expDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-span-4 border border-slate-300 rounded-xs p-1.5 flex flex-col justify-between bg-slate-50/50">
          <div>
            <div className="text-[9px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
              3. OVERALL COMPLIANCE STATUS
            </div>
            <div className={`p-1.5 rounded-xs border text-center my-0.5 ${
              isCompliant
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : isReview
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {isCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isReview ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-[11px] font-black tracking-wide">
                  {record.overallStatus}
                </span>
              </div>
              <div className="text-[10px] font-extrabold">
                Compliance Score: <span className="underline">{record.complianceScore}%</span>
              </div>
            </div>
            <p className="text-[7.5px] text-slate-600 leading-tight my-0.5 text-center font-medium">
              {isCompliant
                ? 'This product complies with statutory mandates under Legal Metrology Rules, 2011.'
                : 'This product breaches Legal Metrology (Packaged Commodities) Rules, 2011.'}
            </p>
          </div>

          <div className="border border-slate-200 rounded-xs p-1 bg-white">
            <div className="text-[8px] font-bold text-slate-700 uppercase mb-0.5">Summary</div>
            <div className="space-y-0.5 text-[8px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Compliant
                </span>
                <span className="font-bold text-slate-900">{record.summaryCounts.compliant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-rose-800 font-medium">
                  <XCircle className="w-2.5 h-2.5 text-rose-600" /> Non-Compliant
                </span>
                <span className="font-bold text-slate-900">{record.summaryCounts.nonCompliant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-800 font-medium">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Requires Review
                </span>
                <span className="font-bold text-slate-900">{record.summaryCounts.requiresReview}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Legal Metrology Compliance Check */}
      <div className="border border-slate-300 rounded-xs mb-2 overflow-x-auto">
        <div className="bg-slate-100 text-slate-900 font-bold text-[8.5px] px-2 py-0.5 border-b border-slate-300 uppercase tracking-wider flex items-center justify-between min-w-[500px]">
          <span>4. LEGAL METROLOGY COMPLIANCE CHECK</span>
          <span className="text-[7.5px] font-semibold text-slate-500">Legal Metrology Rules, 2011</span>
        </div>
        <table className="w-full min-w-[500px] text-[7.5px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-left font-bold">
              <th className="p-1 border-r border-slate-200 w-[20%]">Parameter</th>
              <th className="p-1 border-r border-slate-200 w-[30%]">Extracted Information</th>
              <th className="p-1 border-r border-slate-200 w-[26%]">Requirement (Rule 2011)</th>
              <th className="p-1 border-r border-slate-200 w-[12%] text-center">Status</th>
              <th className="p-1 w-[12%] text-center">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {record.rulesCheck.map((row, idx) => {
              const isRowNonCompliant = row.status === 'Non-Compliant';
              const isRowCompliant = row.status === 'Compliant';
              const isRowNA = row.status === 'Not Applicable';
              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isRowNonCompliant ? 'bg-rose-50/30' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                  }`}
                >
                  <td className={`p-1 border-r border-slate-200 font-medium ${isRowNonCompliant ? 'text-rose-900 font-bold' : 'text-slate-800'}`}>
                    {row.parameter}
                  </td>
                  <td className="p-1 border-r border-slate-200 text-slate-700 whitespace-pre-line leading-tight">
                    {row.extractedInfo}
                  </td>
                  <td className="p-1 border-r border-slate-200 text-slate-600 text-[7px] leading-tight">
                    {row.requirement}
                  </td>
                  <td className="p-1 border-r border-slate-200 text-center">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded-2xs font-bold text-[7.5px] ${
                        isRowCompliant
                          ? 'text-emerald-700 bg-emerald-100/60'
                          : isRowNonCompliant
                          ? 'text-rose-700 bg-rose-100/70'
                          : isRowNA
                          ? 'text-slate-500 bg-slate-100'
                          : 'text-amber-700 bg-amber-100/60'
                      }`}
                    >
                      {isRowCompliant && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 inline" />}
                      {isRowNonCompliant && <XCircle className="w-2.5 h-2.5 text-rose-600 inline" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="p-1 text-center font-mono text-[7.5px] text-slate-600">
                    <div>{row.confidence}</div>
                    {row.note && (
                      <div className="text-[6.5px] text-rose-600 leading-tight font-sans font-medium mt-0.5">
                        {row.note}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3-Section Middle Grid */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-4 border border-slate-300 rounded-xs p-1.5 flex flex-col justify-between bg-slate-50/50">
          <div>
            <div className="text-[8.5px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
              5. CLAIMS DETECTED (AI)
            </div>
            <table className="w-full text-[7.5px] border-collapse mb-1">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-left font-semibold">
                  <th className="py-0.5">Claim on Package</th>
                  <th className="py-0.5 text-center">Detected</th>
                  <th className="py-0.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {record.claimsDetected.length > 0 ? (
                  record.claimsDetected.map((claim, i) => (
                    <tr key={i} className="py-0.5">
                      <td className="py-0.5 font-medium text-slate-800">{claim.claim}</td>
                      <td className="py-0.5 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-0.5 text-right text-amber-700 font-semibold text-[7.5px]">{claim.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-0.5 text-center text-slate-400 italic">No marketing claims declared</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[7px] text-slate-500 italic leading-tight border-t border-slate-200 pt-0.5">
            Note: Claims supporting evidence to be checked during inspection.
          </p>
        </div>

        <div className="col-span-4 border border-slate-300 rounded-xs p-1.5 flex flex-col justify-between bg-slate-50/50">
          <div>
            <div className="text-[8.5px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
              6. TAMPER / AUTHENTICITY ANALYSIS
            </div>
            <table className="w-full text-[7.5px] border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-0.5 text-slate-600 font-medium">MRP Sticker Detected</td>
                  <td className="py-0.5 font-bold text-slate-900 text-right">
                    {record.tamperAnalysis.mrpStickerDetected ? 'Yes' : 'No'}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-0.5 text-slate-600 font-medium">Sticker Over Print</td>
                  <td className={`py-0.5 font-bold text-right ${
                    record.tamperAnalysis.stickerOverOriginalPrint === 'High Probability' ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {record.tamperAnalysis.stickerOverOriginalPrint}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-0.5 text-slate-600 font-medium">Font Consistency</td>
                  <td className={`py-0.5 font-semibold text-right ${
                    record.tamperAnalysis.fontConsistency === 'Mismatch Detected' ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {record.tamperAnalysis.fontConsistency}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-0.5 text-slate-600 font-medium">Print Quality</td>
                  <td className="py-0.5 text-slate-800 text-right font-medium">
                    {record.tamperAnalysis.printQualityConsistency}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 text-slate-800 font-bold">Tamper Risk Score</td>
                  <td className="py-0.5 font-black text-rose-600 text-right">
                    {record.tamperAnalysis.overallTamperRiskScore}% ({record.tamperAnalysis.riskLevel})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-0.5 pt-0.5 border-t border-slate-200">
            <div className="relative h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 shadow-inner">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 border-2 border-white rounded-full shadow-sm"
                style={{ left: `calc(${record.tamperAnalysis.overallTamperRiskScore}% - 5px)` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-span-4 border border-slate-300 rounded-xs p-1.5 flex flex-col justify-between bg-slate-50/50">
          <div>
            <div className="text-[8.5px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
              7. INSPECTOR &amp; LOCATION
            </div>
            <div className="space-y-0.5 text-[7.5px] border-b border-slate-200 pb-1 mb-1">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Inspector Name</span>
                <span className="font-bold text-slate-900">{record.inspector.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Designation</span>
                <span className="text-slate-800 font-medium">{record.inspector.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Department</span>
                <span className="text-slate-800">{record.inspector.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Location</span>
                <span className="text-slate-800 truncate max-w-[100px]">{record.inspector.location}</span>
              </div>
            </div>

            <div className="text-[8.5px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
              8. ATTACHMENTS
            </div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="border border-slate-200 bg-white p-0.5 rounded-2xs flex flex-col items-center">
                <ImageIcon className="w-3 h-3 text-slate-600" />
                <span className="text-[7px] font-medium text-slate-700">Original</span>
                <span className="text-[6.5px] text-slate-500 font-bold">{record.attachmentsCount.originalImages} files</span>
              </div>
              <div className="border border-slate-200 bg-white p-0.5 rounded-2xs flex flex-col items-center">
                <Crop className="w-3 h-3 text-slate-600" />
                <span className="text-[7px] font-medium text-slate-700">Cropped</span>
                <span className="text-[6.5px] text-slate-500 font-bold">{record.attachmentsCount.croppedLabels} files</span>
              </div>
              <div className="border border-slate-200 bg-white p-0.5 rounded-2xs flex flex-col items-center">
                <FileText className="w-3 h-3 text-slate-600" />
                <span className="text-[7px] font-medium text-slate-700">OCR Output</span>
                <span className="text-[6.5px] text-slate-500 font-bold">{record.attachmentsCount.ocrOutput} file</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 border-t border-slate-300 pt-1.5 mb-1">
        <div className="col-span-8 pr-1">
          <div className="text-[8.5px] font-bold text-slate-900 mb-0.5 uppercase tracking-wide">
            9. REMARKS
          </div>
          <p className="text-[7.5px] text-slate-700 leading-tight font-normal">
            {record.remarks}
          </p>
        </div>

        <div className="col-span-4 pl-1 border-l border-slate-200 flex flex-col justify-end items-end text-right">
          <div className="text-[8.5px] font-bold text-slate-900 mb-0.5 uppercase tracking-wide self-start">
            10. INSPECTOR SIGNATURE
          </div>
          <div className="h-8 flex items-center justify-end">
            <span
              className="text-[18px] text-blue-900 font-serif italic tracking-wide select-none transform -rotate-3"
              style={{ fontFamily: "'Playfair Display', cursive, serif" }}
            >
              {record.signatureName || 'R. Sharma'}
            </span>
          </div>
          <div className="text-[7.5px] font-semibold text-slate-800 border-t border-slate-400 pt-0.5 w-full text-right">
            {record.inspector.name}
          </div>
          <div className="text-[7px] text-slate-500 text-right">
            ({record.inspector.designation})
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[7px] text-slate-500 border-t border-slate-200 pt-1 font-medium">
        <span>This is a system generated report. Final decision by authority.</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. INSPECTION REPORT MODAL CONTAINER (STRICTLY SCOPED TO MOBILE CONTAINER)
   ========================================================================== */
interface InspectionReportModalProps {
  record: ProductInspectionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onIssueMemo?: (record: ProductInspectionRecord) => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  record,
  isOpen,
  onClose,
  onIssueMemo,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await exportReportToPdf('printable-inspection-report', record, (msg) => setStatusMsg(msg));
      setStatusMsg('Downloaded!');
      setTimeout(() => {
        setDownloading(false);
        setStatusMsg(null);
      }, 1500);
    } catch (e) {
      console.error(e);
      setDownloading(false);
      setStatusMsg('Export failed.');
      setTimeout(() => setStatusMsg(null), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 animate-in fade-in duration-150">
      <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden">
        {/* Top Mobile App Header Bar */}
        <div className="no-print bg-[#0a2240] text-white px-3 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs tracking-wide truncate">
                Inspection Report
              </span>
              <span className="text-[9.5px] text-slate-300 font-mono truncate">
                {record.reportId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-2 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Download official PDF report file"
            >
              {downloading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              <span>{downloading ? 'PDF...' : 'PDF'}</span>
            </button>

            <button
              onClick={printReport}
              className="p-1 rounded-md bg-slate-800 text-slate-200 text-[11px] cursor-pointer"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyId}
              className="p-1 rounded-md bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
              title="Copy Report ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Infraction Warning Strip */}
        {record.overallStatus === 'NON-COMPLIANT' && (
          <div className="no-print bg-rose-50 border-b border-rose-200 px-3 py-1.5 flex items-center justify-between flex-shrink-0 text-[11px] text-rose-900">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold truncate">
                Violations: {record.summaryCounts.nonCompliant} Rule(s) breached
              </span>
            </div>
            {onIssueMemo && (
              <button
                onClick={() => {
                  onClose();
                  onIssueMemo(record);
                }}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex-shrink-0 cursor-pointer"
              >
                Memo
              </button>
            )}
          </div>
        )}

        {/* Scrollable Document Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-200/80 flex justify-center items-start">
          <PdfReportDocument record={record} id="printable-inspection-report" />
        </div>

        {/* Mobile App Footer Bar */}
        <div className="no-print bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10.5px]">Legal Metrology GovNet Node</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-[11px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
