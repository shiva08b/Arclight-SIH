import React from 'react';
import { X, Building2, BarChart2, ShieldAlert, History, ArrowRight, Tag, Layers, CheckCircle2, AlertTriangle, AlertCircle, FileText } from 'lucide-react';
import { ProductInspectionRecord } from '../types';
import { getCompanyComplianceStats } from '../utils/companyCompliance';
import { IndianEmblem, TricolorStripe } from './LayoutComponents';

interface CompanyHistoryModalProps {
  record: ProductInspectionRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyHistoryModal({ record, isOpen, onClose }: CompanyHistoryModalProps) {
  if (!isOpen) return null;

  const stats = getCompanyComplianceStats(record);

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <header className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                Manufacturer Compliance History
              </h2>
              <p className="text-[10px] text-slate-300 font-mono">
                Company ID: <span className="text-blue-300 font-bold">{stats.companyId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Statutory Enforcement Banner */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">
                Previous compliance findings associated with this manufacturer
              </h3>
              <p className="text-[10.5px] text-amber-800/90 mt-0.5 leading-relaxed">
                Automated historical surveillance log for enforcement officer background reference. Findings reflect past audit records across product lines.
              </p>
            </div>
          </div>

          {/* Company Profile Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Manufacturer / Packer</span>
                <h3 className="text-sm font-black text-slate-900">{stats.companyName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scanned SKU: <span className="font-semibold text-slate-800">{record.productName}</span></p>
              </div>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full font-mono">
                {stats.companyId}
              </div>
            </div>

            {/* 3 Metric Summary Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Inspections</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{stats.totalInspections}</span>
              </div>
              <div className="bg-orange-50 border border-orange-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-orange-700 font-semibold block">Potential Issues</span>
                <span className="text-base font-black text-[#c2410c] mt-0.5 block">{stats.potentialIssuesCount}</span>
              </div>
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-blue-700 font-semibold block">Products Affected</span>
                <span className="text-base font-black text-[#0066cc] mt-0.5 block">{stats.productsWithFindingsCount}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0066cc]" />
                Previous Findings by Category
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Historical Total</span>
            </h4>

            <div className="space-y-2">
              {stats.findingsByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl">
                  <span className="text-xs font-semibold text-slate-800">{item.category}</span>
                  <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900">
                    {item.count} {item.count === 1 ? 'finding' : 'findings'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Most Frequent Finding:</span>
              <span className="font-bold text-[#c2410c] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-[11px]">
                {stats.mostFrequentFinding}
              </span>
            </div>
          </div>

          {/* Cross-Product Family Portfolio Findings */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Related Manufacturer Products
              </span>
              <span className="text-[10px] text-slate-500">Cross-SKU Audit History</span>
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {stats.relatedProducts.map((prod) => (
                <div key={prod.productId} className="p-2.5 flex items-center justify-between hover:bg-white transition-colors">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{prod.productName}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">GTIN: {prod.productId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">{prod.inspectionsCount} audits</span>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                      prod.issuesCount > 0 
                        ? 'bg-orange-50 text-[#c2410c] border-orange-200' 
                        : 'bg-emerald-50 text-[#059669] border-emerald-200'
                    }`}>
                      {prod.issuesCount} {prod.issuesCount === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Inspection Audits Timeline */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              Past Inspection Audit Logs
            </h4>

            <div className="space-y-2">
              {stats.recentAudits.map((audit) => (
                <div key={audit.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono text-slate-500 font-semibold">{audit.reportId}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{audit.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{audit.productName}</span>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                      audit.status === 'COMPLIANT'
                        ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                        : audit.status === 'REQUIRES_REVIEW'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-orange-50 text-[#c2410c] border-orange-200'
                    }`}>
                      {audit.status}
                    </span>
                  </div>
                  {audit.issuesFound.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {audit.issuesFound.map((iss, idx) => (
                        <span key={idx} className="text-[9.5px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          {iss}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TricolorStripe className="h-0.5 w-12" />
            <span className="text-[10px] text-slate-400">Legal Metrology Portal</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </footer>
      </div>
    </div>
  );
}
