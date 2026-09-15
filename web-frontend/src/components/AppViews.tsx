import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  X,
  Home,
  Camera,
  ClipboardList,
  FileText,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  Sparkles,
  BookOpen,
  Bot,
  Flame,
  MapPin,
} from 'lucide-react';
import { IndianEmblem, TricolorStripe } from './LayoutComponents';
import { ProductInspectionRecord } from '../types';

/* ==========================================================================
   1. HISTORY SCREEN VIEW
   ========================================================================== */
interface ScreenHistoryProps {
  records: ProductInspectionRecord[];
  onBack: () => void;
  onSelectRecord: (record: ProductInspectionRecord) => void;
}

export function ScreenHistory({
  records,
  onBack,
  onSelectRecord,
}: ScreenHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Compliant' | 'Violations'>('All');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reportId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Compliant') {
      return rec.overallStatus === 'COMPLIANT';
    }
    if (activeFilter === 'Violations') {
      return rec.overallStatus === 'NON-COMPLIANT' || rec.overallStatus === 'REQUIRES_REVIEW';
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <button
          id="btn-history-back"
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 -ml-1 text-slate-700 hover:text-[#0066cc] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Inspection History</h1>
      </header>

      <div className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-3.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-history-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, brand, or report ID"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0066cc] shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="filter-pill-all"
            onClick={() => setActiveFilter('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'All'
                ? 'bg-[#0066cc] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>

          <button
            id="filter-pill-compliant"
            onClick={() => setActiveFilter('Compliant')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'Compliant'
                ? 'bg-[#10b981] text-white shadow-xs'
                : 'bg-white text-[#059669] border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            Compliant
          </button>

          <button
            id="filter-pill-violations"
            onClick={() => setActiveFilter('Violations')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'Violations'
                ? 'bg-[#f97316] text-white shadow-xs'
                : 'bg-white text-[#c2410c] border border-orange-300 hover:bg-orange-50'
            }`}
          >
            Violations
          </button>
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-400 shadow-2xs">
              No inspection records found.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isCompliant = rec.overallStatus === 'COMPLIANT';

              return (
                <div
                  key={rec.id}
                  id={`history-item-${rec.id}`}
                  onClick={() => onSelectRecord(rec)}
                  className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                    isCompliant
                      ? 'border-slate-200/80 hover:border-[#10b981]'
                      : 'border-slate-200/80 hover:border-[#f97316]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={rec.frontImageUrl}
                        alt={rec.productName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.productName}</h4>
                      <p className="text-[11px] text-slate-500">{rec.brand}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{rec.generatedOn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompliant
                          ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                          : 'bg-orange-50 text-[#c2410c] border border-orange-200'
                      }`}
                    >
                      {isCompliant ? 'Compliant' : 'Violation'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. MORE / MENU SCREEN VIEW
   ========================================================================== */
interface ScreenMoreProps {
  onNavigateHome: () => void;
  onNavigateInspect: () => void;
  onNavigateHistory: () => void;
  onOpenReports: () => void;
  onOpenActManual: () => void;
  onOpenHeatMap?: () => void;
  onOpenHelpline: () => void;
  onOpenAbout: () => void;
  onResetData?: () => void;
}

export function ScreenMore({
  onNavigateHome,
  onNavigateInspect,
  onNavigateHistory,
  onOpenReports,
  onOpenActManual,
  onOpenHeatMap,
  onOpenHelpline,
  onOpenAbout,
  onResetData,
}: ScreenMoreProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <IndianEmblem className="w-6 h-7 text-slate-800" />
          <div className="flex flex-col text-left leading-tight">
            <div className="text-base font-extrabold tracking-tight">
              <span className="text-[#0066cc]">Label</span>
              <span className="text-[#10b981]">Lens</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Legal Metrology Compliance
            </span>
          </div>
        </div>

        <TricolorStripe className="w-16 h-1 rounded-full" />
      </header>

      <div className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                AK
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Aditya Kumar</h3>
              <p className="text-xs text-slate-500">Enforcement Officer</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Feature Banner: Geographic Heat Map & Hotspot Intelligence */}
        {onOpenHeatMap && (
          <div
            onClick={onOpenHeatMap}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wide">Compliance Heat Map</h4>
                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                    SUPERVISOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Hotspot Intelligence & Violation Density Map
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        )}

        {/* Feature Navigation Banner for Act Manual & AI Assistant */}
        <div
          onClick={onOpenActManual}
          className="bg-gradient-to-r from-[#0066cc] to-sky-700 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black tracking-wide">Act Manual 2011 & AI Bot</h4>
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Read official rulebook & ask AI any legal question
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
          <button
            id="more-menu-home"
            onClick={onNavigateHome}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066cc] flex items-center justify-center flex-shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Home</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="more-menu-new-inspection"
            onClick={onNavigateInspect}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10b981] flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">New Inspection</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {onOpenHeatMap && (
            <button
              id="more-menu-heatmap"
              onClick={onOpenHeatMap}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 fill-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">Compliance Heat Map & Hotspots</span>
                  <span className="text-[10px] text-slate-400">Supervisor Density & Targeted Audit Matrix</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          <button
            id="more-menu-act-manual"
            onClick={onOpenActManual}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Legal Metrology Act Manual</span>
                <span className="text-[10px] text-slate-400">Packaged Commodities Rules, 2011</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="more-menu-history"
            onClick={onNavigateHistory}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066cc] flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Inspection History</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="more-menu-reports"
            onClick={onOpenReports}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10b981] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">PDF Reports</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
          <button
            id="more-menu-settings"
            onClick={() => alert('Legal Metrology Rulebase v2.4 up to date.')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="more-menu-help"
            onClick={onOpenHelpline}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066cc] flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Help & Support (NCH)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="more-menu-about"
            onClick={onOpenAbout}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10b981] flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">About LabelLens</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <button
            id="more-menu-logout"
            onClick={() => alert('Officer session active. Ready for next shift.')}
            className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-orange-50 text-[#f97316] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#f97316]" />
            <span className="text-xs font-bold text-[#f97316]">Log Out</span>
          </button>
        </div>

        {onResetData && (
          <div className="text-center mt-2">
            <button
              onClick={onResetData}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#0066cc]" />
              <span>Reset Demo Seed Records</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
