import React, { useState, useEffect } from 'react';
import { ProductInspectionRecord, ActiveTab, ScreenView } from './types';
import { getStoredRecords, resetToDefaults } from './utils/storage';
import { PhoneContainer, BottomNavBar, IndianEmblem } from './components/LayoutComponents';
import { ScreenSplash, ScreenHome, ScreenNewInspection, ScreenAnalyzing } from './components/InspectionScreens';
import { ScreenInspectionResult, ScreenDeclarationDetail, ScreenInspectionSaved } from './components/ResultScreens';
import { ScreenHistory, ScreenMore } from './components/AppViews';
import { ScreenHeatMap } from './components/HeatMapScreen';
import { InspectionReportModal } from './components/InspectionReportModal';
import { ActManualModal } from './components/ActManualModal';
import { Phone, X } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<ProductInspectionRecord[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('home');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Active record being analyzed or viewed
  const [activeRecord, setActiveRecord] = useState<ProductInspectionRecord | null>(null);
  const [selectedDeclarationParam, setSelectedDeclarationParam] = useState<string>('MRP Declaration');
  const [customUploadedImage, setCustomUploadedImage] = useState<string | undefined>(undefined);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActManualOpen, setIsActManualOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Load records on mount
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);
    // Default active record to Nutritech if available
    const nutritech = loaded.find((r) => r.id === 'rec-nutritech') || loaded[0];
    if (nutritech) {
      setActiveRecord(nutritech);
    }
  }, []);

  // Synchronize Tab with Screen
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'inspect') setCurrentScreen('inspect');
    if (tab === 'history') setCurrentScreen('history');
    if (tab === 'more') setCurrentScreen('more');
  };

  // Start scan workflow
  const handleSelectProductForScan = (recordId: string, customImage?: string) => {
    const target = records.find((r) => r.id === recordId) || records[0];
    if (target) {
      const updatedRecord = customImage ? { ...target, frontImageUrl: customImage } : target;
      setActiveRecord(updatedRecord);
      setCustomUploadedImage(customImage);
      setCurrentScreen('analyzing');
    }
  };

  // Open record from Home or History
  const handleOpenRecord = (record: ProductInspectionRecord) => {
    setActiveRecord(record);
    setCurrentScreen('result');
    setActiveTab('inspect');
  };

  // Open detailed declaration
  const handleSelectDeclaration = (paramName: string) => {
    setSelectedDeclarationParam(paramName);
    setCurrentScreen('declaration-detail');
  };

  // Reset demo data
  const handleResetData = () => {
    const fresh = resetToDefaults();
    setRecords(fresh);
    const nutritech = fresh.find((r) => r.id === 'rec-nutritech') || fresh[0];
    setActiveRecord(nutritech);
    alert('Demo records reset to default state.');
  };

  // Fallback active record
  const currentRecord = activeRecord || records[0];

  return (
    <PhoneContainer>
      {/* 1. Splash Screen */}
      {currentScreen === 'splash' && (
        <ScreenSplash onEnterApp={() => setCurrentScreen('home')} />
      )}

      {/* 2. Home Screen */}
      {currentScreen === 'home' && (
        <ScreenHome
          recentRecords={records}
          onStartScan={() => {
            setActiveTab('inspect');
            setCurrentScreen('inspect');
          }}
          onUploadImage={() => {
            setActiveTab('inspect');
            setCurrentScreen('inspect');
          }}
          onOpenHistory={() => {
            setActiveTab('history');
            setCurrentScreen('history');
          }}
          onOpenRecord={handleOpenRecord}
          onOpenMore={() => {
            setActiveTab('more');
            setCurrentScreen('more');
          }}
          onOpenNotifications={() => alert('All statutory notices and circulars are up to date.')}
        />
      )}

      {/* 3. New Inspection Screen */}
      {currentScreen === 'inspect' && (
        <ScreenNewInspection
          onBack={() => {
            setActiveTab('home');
            setCurrentScreen('home');
          }}
          onSelectProductForScan={handleSelectProductForScan}
          onBatchInspectClick={() => {
            handleSelectProductForScan('rec-nutritech');
          }}
        />
      )}

      {/* 4. Analyzing Product Label Screen */}
      {currentScreen === 'analyzing' && currentRecord && (
        <ScreenAnalyzing
          record={currentRecord}
          customImage={customUploadedImage}
          onBack={() => setCurrentScreen('inspect')}
          onAnalysisComplete={() => setCurrentScreen('result')}
        />
      )}

      {/* 5. Inspection Result Screen */}
      {currentScreen === 'result' && currentRecord && (
        <ScreenInspectionResult
          record={currentRecord}
          onBack={() => setCurrentScreen('inspect')}
          onViewDetailedAnalysis={() => {
            setSelectedDeclarationParam('MRP Declaration');
            setCurrentScreen('declaration-detail');
          }}
          onSelectDeclaration={handleSelectDeclaration}
        />
      )}

      {/* 6. Detailed Declaration (MRP Declaration) */}
      {currentScreen === 'declaration-detail' && currentRecord && (
        <ScreenDeclarationDetail
          record={currentRecord}
          declarationName={selectedDeclarationParam}
          onBack={() => setCurrentScreen('result')}
          onSaveInspection={() => setCurrentScreen('saved')}
        />
      )}

      {/* 7. Inspection History Screen */}
      {currentScreen === 'history' && (
        <ScreenHistory
          records={records}
          onBack={() => {
            setActiveTab('home');
            setCurrentScreen('home');
          }}
          onSelectRecord={handleOpenRecord}
        />
      )}

      {/* 8. More / Menu Screen */}
      {currentScreen === 'more' && (
        <ScreenMore
          onNavigateHome={() => {
            setActiveTab('home');
            setCurrentScreen('home');
          }}
          onNavigateInspect={() => {
            setActiveTab('inspect');
            setCurrentScreen('inspect');
          }}
          onNavigateHistory={() => {
            setActiveTab('history');
            setCurrentScreen('history');
          }}
          onOpenReports={() => {
            if (currentRecord) setIsReportModalOpen(true);
          }}
          onOpenActManual={() => setIsActManualOpen(true)}
          onOpenHeatMap={() => setCurrentScreen('heatmap')}
          onOpenHelpline={() => setIsHelplineOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onResetData={handleResetData}
        />
      )}

      {/* 9. Compliance Heat Map & Hotspot Intelligence Screen */}
      {currentScreen === 'heatmap' && (
        <ScreenHeatMap
          onBack={() => {
            setActiveTab('home');
            setCurrentScreen('home');
          }}
          onSelectTaskOrCreate={(zoneName) => {
            alert(`Task created for ${zoneName}. Assigned to Field Enforcement Unit.`);
            setActiveTab('home');
            setCurrentScreen('home');
          }}
        />
      )}

      {/* 10. Inspection Saved Screen */}
      {currentScreen === 'saved' && (
        <ScreenInspectionSaved
          onViewReport={() => {
            if (currentRecord) setIsReportModalOpen(true);
          }}
          onNewInspection={() => {
            setActiveTab('inspect');
            setCurrentScreen('inspect');
          }}
        />
      )}

      {/* Bottom Sticky Tab Navigation Bar */}
      {currentScreen !== 'splash' && currentScreen !== 'analyzing' && currentScreen !== 'heatmap' && (
        <BottomNavBar activeTab={activeTab} onChangeTab={handleTabChange} />
      )}

      {/* Official PDF Inspection Report Modal */}
      {isReportModalOpen && currentRecord && (
        <InspectionReportModal
          record={currentRecord}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Legal Metrology Act Manual & AI Assistant Modal */}
      {isActManualOpen && (
        <ActManualModal
          isOpen={isActManualOpen}
          onClose={() => setIsActManualOpen(false)}
        />
      )}

      {/* Helpline Modal Dialog */}
      {isHelplineOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0066cc] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-900">National Helpline</h3>
              </div>
              <button
                onClick={() => setIsHelplineOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-slate-600 flex flex-col gap-2.5">
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wider block">
                  National Consumer Helpline (NCH)
                </span>
                <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                  1800-11-4000 / 1915
                </p>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Toll-Free • 9:30 AM to 5:30 PM (Mon-Sat)
                </p>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider block">
                  Legal Metrology Division
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  dir-lm-ca@nic.in
                </p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Dept of Consumer Affairs, New Delhi
                </p>
              </div>

              <div className="bg-orange-50/80 p-3 rounded-xl border border-orange-200">
                <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider block">
                  Violation Reporting Desk
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  consumer-helpline@nic.in
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHelplineOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-semibold cursor-pointer mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal Dialog */}
      {isAboutOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <span className="w-1/3 bg-[#f97316]" />
              <span className="w-1/3 bg-[#0066cc]" />
              <span className="w-1/3 bg-[#10b981]" />
            </div>

            <IndianEmblem className="w-8 h-9 text-slate-800 mx-auto mt-2" />
            <h3 className="font-extrabold text-base text-slate-900 mt-2">
              <span className="text-[#0066cc]">Label</span>
              <span className="text-[#10b981]">Lens</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Legal Metrology Compliance System
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-left mt-3 leading-relaxed">
              Enforcing the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011 to ensure fair trade and consumer protection across packaged goods.
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0066cc]">
                Authority
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10b981]">
                Compliance
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#f97316]">
                Enforcement
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Version 2.4.0 (Official Build)
            </p>
            <button
              onClick={() => setIsAboutOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-semibold cursor-pointer mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PhoneContainer>
  );
}
