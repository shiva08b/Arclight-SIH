import React, { useState } from 'react';
import { Wifi, Battery, Smartphone, Tablet, Home, Camera, Clock, Menu } from 'lucide-react';
import { ActiveTab } from '../types';

/**
 * Official Indian National Emblem (State Emblem of India / Ashoka Lion Capital)
 */
export function IndianEmblem({ className = 'w-6 h-6', textColor = 'text-slate-800' }: { className?: string; textColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 120"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Emblem of India"
      >
        <g fill="currentColor">
          <path d="M50 8 C44 8 40 12 39 17 C36 17 33 20 33 24 C33 28 35 31 38 33 C37 36 37 41 38 46 C41 47 43 45 44 43 C45 40 47 38 50 38 C53 38 55 40 56 43 C57 45 59 47 62 46 C63 41 63 36 62 33 C65 31 67 28 67 24 C67 20 64 17 61 17 C60 12 56 8 50 8 Z" />
          <path d="M28 25 C23 27 20 32 20 38 C20 44 24 49 29 51 C29 55 31 59 34 62 C37 59 38 54 37 50 C33 48 31 44 32 40 C32 36 34 33 37 31 C35 28 32 26 28 25 Z" />
          <path d="M72 25 C76 27 80 32 80 38 C80 44 76 49 71 51 C71 55 69 59 66 62 C63 59 62 54 63 50 C67 48 69 44 68 40 C68 36 66 33 63 31 C65 28 68 26 72 25 Z" />
          <rect x="22" y="66" width="56" height="7" rx="2" />
          <circle cx="50" cy="81" r="7" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <circle cx="50" cy="81" r="1.8" />
          <path d="M50 74 L50 88 M43 81 L57 81 M45 76 L55 86 M45 86 L55 76" stroke="currentColor" strokeWidth="1" />
          <rect x="26" y="91" width="48" height="4" rx="1" />
          <rect x="20" y="97" width="60" height="5" rx="1.5" />
          <rect x="28" y="105" width="44" height="2" rx="1" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Top Government of India Header Brand Block
 */
export function GovtBrandHeader() {
  return (
    <div className="flex items-center gap-2 select-none">
      <IndianEmblem className="w-5 h-6 text-slate-800" />
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[11px] font-bold text-slate-900 tracking-tight">
          Government of India
        </span>
        <span className="text-[9.5px] text-slate-500 font-medium">
          Department of Consumer Affairs
        </span>
      </div>
    </div>
  );
}

/**
 * LabelLens Logo with magnifying glass and barcode
 */
export function LabelLensLogo({ size = 'large' }: { size?: 'small' | 'large' }) {
  if (size === 'small') {
    return (
      <div className="flex items-center gap-1.5 select-none">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
            <rect x="14" y="12" width="2" height="12" fill="#f97316" rx="0.5" />
            <rect x="17.5" y="12" width="1.5" height="12" fill="#0066cc" rx="0.5" />
            <rect x="20.5" y="12" width="2.5" height="12" fill="#10b981" rx="0.5" />
            <rect x="24.5" y="12" width="1.5" height="12" fill="#f97316" rx="0.5" />
            <rect x="27.5" y="12" width="2" height="12" fill="#0066cc" rx="0.5" />
            <circle cx="20" cy="18" r="10" stroke="#0066cc" strokeWidth="2.5" />
            <path d="M28 25 L34 31" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight">
          <span className="text-[#0066cc]">Label</span>
          <span className="text-[#10b981]">Lens</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-28 h-28 flex items-center justify-center mb-1">
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
          <rect x="42" y="36" width="4" height="34" fill="#f97316" rx="1.5" />
          <rect x="49" y="36" width="3" height="34" fill="#0066cc" rx="1" />
          <rect x="55" y="36" width="5.5" height="34" fill="#10b981" rx="1.5" />
          <rect x="64" y="36" width="3" height="34" fill="#f97316" rx="1" />
          <rect x="70" y="36" width="4" height="34" fill="#0066cc" rx="1" />
          <rect x="77" y="36" width="3" height="34" fill="#10b981" rx="1" />
          <circle cx="60" cy="53" r="32" stroke="#0066cc" strokeWidth="7" strokeLinecap="round" />
          <path d="M37 76 L18 95" stroke="#f97316" strokeWidth="7.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="text-3xl font-extrabold tracking-tight">
        <span className="text-[#0066cc]">Label</span>
        <span className="text-[#10b981]">Lens</span>
      </div>

      <p className="text-[12px] text-slate-500 font-medium text-center mt-1 max-w-[240px] leading-snug">
        AI-Powered Legal Metrology Compliance Verification
      </p>
    </div>
  );
}

/**
 * Clean Tricolor Decorative Strip: Orange, White, Green with Blue accent
 */
export function TricolorStripe({ className = 'h-1 w-full' }: { className?: string }) {
  return (
    <div className={`flex overflow-hidden rounded-full ${className}`}>
      <span className="flex-1 bg-[#f97316]" />
      <span className="flex-1 bg-white border-y border-slate-200 relative flex items-center justify-center">
        <span className="w-1 h-1 rounded-full bg-[#0066cc]" />
      </span>
      <span className="flex-1 bg-[#10b981]" />
    </div>
  );
}

/**
 * Main Mobile Container Wrapper for the App
 */
export function PhoneContainer({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<'phone' | 'wide'>('phone');

  return (
    <div className="min-h-screen bg-slate-100/90 sm:bg-gradient-to-b sm:from-slate-100 sm:via-blue-50/20 sm:to-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-900 font-sans select-none antialiased">
      <div className="hidden sm:block fixed top-0 left-0 right-0 z-50">
        <TricolorStripe className="h-1.5 w-full shadow-xs" />
      </div>

      <aside aria-label="Desktop Controls" className="hidden sm:flex items-center justify-between w-full max-w-xl mb-2.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/90 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" title="Orange (Attention / Violations)" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066cc]" title="Blue (Authority / Legal Metrology)" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" title="Green (Compliance / Fair Trade)" />
          </div>
          <span className="font-bold text-slate-700 tracking-tight">
            LabelLens <span className="font-normal text-slate-400">| Mobile-Oriented</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === 'phone'
                ? 'bg-white text-[#0066cc] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Mobile Phone View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => setViewMode('wide')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === 'wide'
                ? 'bg-white text-[#0066cc] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Wider Laptop/Tablet Mobile View"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Laptop-Fit</span>
          </button>
        </div>
      </aside>

      <div
        className={`w-full bg-white flex flex-col transition-all duration-200 overflow-hidden relative shadow-none sm:shadow-xl sm:border sm:border-slate-200 sm:rounded-2xl ${
          viewMode === 'phone'
            ? 'sm:max-w-[410px] h-screen sm:h-[88vh] sm:max-h-[860px]'
            : 'sm:max-w-[490px] h-screen sm:h-[88vh] sm:max-h-[860px]'
        }`}
      >
        <TricolorStripe className="h-1 w-full flex-shrink-0" />

        <div className="bg-white px-5 pt-2 pb-1.5 flex items-center justify-between text-slate-800 text-xs font-bold select-none z-30 flex-shrink-0 border-b border-slate-100">
          <span className="font-semibold text-slate-800">9:41</span>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
              Dept. Consumer Affairs
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Wifi className="w-3.5 h-3.5 text-slate-700" />
            <Battery className="w-4 h-4 text-slate-700" />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {children}
        </div>

        <div className="bg-white py-1 flex items-center justify-center select-none flex-shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Bottom Sticky Navigation Bar Component
 */
export function BottomNavBar({ activeTab, onChangeTab }: { activeTab: ActiveTab; onChangeTab: (tab: ActiveTab) => void }) {
  return (
    <nav
      id="bottom-nav-bar"
      aria-label="Main Navigation"
      className="bg-white border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around z-30 select-none shadow-xs flex-shrink-0"
    >
      <button
        id="nav-tab-home"
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center gap-0.5 min-w-[58px] py-1 transition-all cursor-pointer relative ${
          activeTab === 'home' ? 'text-[#0066cc] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <div className={`p-1 rounded-full transition-colors ${activeTab === 'home' ? 'bg-blue-50 text-[#0066cc]' : ''}`}>
          <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
        </div>
        <span className="text-[10px] tracking-tight">Home</span>
        {activeTab === 'home' && <span className="w-1.5 h-1 bg-[#0066cc] rounded-full mt-0.5" />}
      </button>

      <button
        id="nav-tab-inspect"
        onClick={() => onChangeTab('inspect')}
        className={`flex flex-col items-center gap-0.5 min-w-[58px] py-1 transition-all cursor-pointer relative ${
          activeTab === 'inspect' ? 'text-[#0066cc] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <div className={`p-1 rounded-full transition-colors ${activeTab === 'inspect' ? 'bg-blue-50 text-[#0066cc]' : ''}`}>
          <Camera className="w-5 h-5" strokeWidth={activeTab === 'inspect' ? 2.4 : 1.8} />
        </div>
        <span className="text-[10px] tracking-tight">Inspect</span>
        {activeTab === 'inspect' && <span className="w-1.5 h-1 bg-[#10b981] rounded-full mt-0.5" />}
      </button>

      <button
        id="nav-tab-history"
        onClick={() => onChangeTab('history')}
        className={`flex flex-col items-center gap-0.5 min-w-[58px] py-1 transition-all cursor-pointer relative ${
          activeTab === 'history' ? 'text-[#0066cc] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <div className={`p-1 rounded-full transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-[#0066cc]' : ''}`}>
          <Clock className="w-5 h-5" strokeWidth={activeTab === 'history' ? 2.4 : 1.8} />
        </div>
        <span className="text-[10px] tracking-tight">History</span>
        {activeTab === 'history' && <span className="w-1.5 h-1 bg-[#f97316] rounded-full mt-0.5" />}
      </button>

      <button
        id="nav-tab-more"
        onClick={() => onChangeTab('more')}
        className={`flex flex-col items-center gap-0.5 min-w-[58px] py-1 transition-all cursor-pointer relative ${
          activeTab === 'more' ? 'text-[#0066cc] font-bold' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <div className={`p-1 rounded-full transition-colors ${activeTab === 'more' ? 'bg-blue-50 text-[#0066cc]' : ''}`}>
          <Menu className="w-5 h-5" strokeWidth={activeTab === 'more' ? 2.4 : 1.8} />
        </div>
        <span className="text-[10px] tracking-tight">More</span>
        {activeTab === 'more' && <span className="w-1.5 h-1 bg-[#0066cc] rounded-full mt-0.5" />}
      </button>
    </nav>
  );
}
