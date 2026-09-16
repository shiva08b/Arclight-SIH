import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Lightbulb,
  Check,
  Layers,
  Sparkles,
  Loader2,
  Circle,
  X,
  Zap,
  Sliders,
  Focus,
  Maximize2,
} from 'lucide-react';
import { IndianEmblem, LabelLensLogo } from './LayoutComponents';
import { ProductInspectionRecord } from '../types';

/* ==========================================================================
   1. SPLASH SCREEN
   ========================================================================== */
export function ScreenSplash({ onEnterApp }: { onEnterApp: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnterApp();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onEnterApp]);

  return (
    <div
      onClick={onEnterApp}
      className="relative flex-1 flex flex-col items-center justify-between px-6 pt-10 pb-12 bg-white text-slate-900 cursor-pointer select-none overflow-hidden"
    >
      <div className="flex flex-col items-center text-center">
        <IndianEmblem className="w-8 h-9 text-slate-800" />
        <span className="text-[11.5px] font-bold text-slate-800 mt-1 tracking-tight">
          Government of India
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          Department of Consumer Affairs
        </span>
      </div>

      <div className="flex flex-col items-center my-auto">
        <LabelLensLogo size="large" />
        <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-7 overflow-hidden flex">
          <div className="h-1.5 w-1/3 bg-[#f97316]" />
          <div className="h-1.5 w-1/3 bg-[#0066cc] animate-pulse" />
          <div className="h-1.5 w-1/3 bg-[#10b981]" />
        </div>
      </div>

      <div className="flex flex-col items-center z-10">
        <p className="text-[13px] font-bold text-slate-800 text-center tracking-wide leading-tight">
          Ensuring Fair Trade
        </p>
        <p className="text-[12px] text-slate-500 text-center mt-0.5 tracking-wide">
          Empowering Consumers
        </p>
        <span className="text-[10.5px] text-[#0066cc] font-semibold mt-3">
          Tap anywhere to continue
        </span>
      </div>

      <div className="absolute -bottom-6 left-0 right-0 h-28 pointer-events-none opacity-50">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,50 C150,120 350,-10 500,70 L500,150 L0,150 Z" fill="#10b981" opacity="0.3" />
          <path d="M0,75 C180,20 320,110 500,45 L500,150 L0,150 Z" fill="#f97316" opacity="0.35" />
          <path d="M0,90 C120,40 380,100 500,80 L500,150 L0,150 Z" fill="#0066cc" opacity="0.2" />
        </svg>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. HOME SCREEN DASHBOARD
   ========================================================================== */
interface ScreenHomeProps {
  onStartScan: () => void;
  onUploadImage: () => void;
  onOpenHistory: () => void;
  onOpenRecord: (record: ProductInspectionRecord) => void;
  onOpenMore: () => void;
  onOpenNotifications?: () => void;
  recentRecords: ProductInspectionRecord[];
}

export function ScreenHome({
  onStartScan,
  onUploadImage,
  onOpenHistory,
  onOpenRecord,
  onOpenMore,
  onOpenNotifications,
  recentRecords,
}: ScreenHomeProps) {
  const amulRecord = recentRecords.find((r) => r.id === 'rec-amul') || recentRecords[0];
  const violationRecord = recentRecords.find((r) => r.overallStatus !== 'COMPLIANT') || recentRecords[1];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <button
          id="btn-home-menu"
          onClick={onOpenMore}
          aria-label="Open menu"
          className="p-1.5 -ml-1.5 text-slate-700 hover:text-[#0066cc] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-700" strokeWidth={2.2} />
        </button>

        <div className="flex items-center gap-2">
          <IndianEmblem className="w-4 h-5 text-slate-800" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">
              Government of India
            </span>
            <span className="text-[9.5px] text-slate-500 font-medium">
              Department of Consumer Affairs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-home-bell"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#f97316] rounded-full ring-2 ring-white" />
          </button>

          <button
            id="btn-home-profile"
            onClick={onOpenMore}
            className="w-7 h-7 rounded-full bg-[#0066cc] hover:bg-[#0052a3] text-white flex items-center justify-center text-[10.5px] font-bold tracking-tight shadow-xs cursor-pointer transition-colors"
          >
            AK
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Good morning, Officer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Verify packaged commodity labels quickly and accurately.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <span className="w-1/3 bg-[#f97316]" />
            <span className="w-1/3 bg-[#0066cc]" />
            <span className="w-1/3 bg-[#10b981]" />
          </div>

          <div className="flex items-start justify-between mt-1">
            <div className="max-w-[210px]">
              <h2 className="text-[15px] font-bold text-slate-900">
                Start New Inspection
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Scan or upload a product label to begin compliance verification.
              </p>
            </div>

            <div className="w-16 h-16 relative flex-shrink-0 -mt-1">
              <div className="w-12 h-14 bg-white border border-blue-200 rounded-lg flex flex-col items-center justify-center p-1 relative shadow-xs">
                <div className="w-8 h-4 bg-slate-50 rounded flex items-center justify-around px-0.5">
                  <span className="w-0.5 h-3 bg-[#f97316]" />
                  <span className="w-0.5 h-3 bg-[#0066cc]" />
                  <span className="w-1 h-3 bg-[#10b981]" />
                  <span className="w-0.5 h-3 bg-[#f97316]" />
                  <span className="w-0.5 h-3 bg-[#0066cc]" />
                </div>
                <div className="w-7 h-1 bg-blue-100 rounded mt-1.5" />
              </div>

              <div className="absolute top-2 -right-1 w-9 h-9">
                <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
                  <circle cx="18" cy="18" r="12" stroke="#0066cc" strokeWidth="3.5" fill="#e0f2fe" fillOpacity="0.4" />
                  <path d="M27 27 L36 36" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              id="btn-home-scan-label"
              onClick={onStartScan}
              className="bg-[#0066cc] hover:bg-[#0052a3] text-white py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
              <span>Scan Label</span>
            </button>

            <button
              id="btn-home-upload-image"
              onClick={onUploadImage}
              className="bg-white hover:bg-emerald-50 text-[#10b981] border-1.5 border-[#10b981] py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#10b981]" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066cc] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">128</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Total Inspections</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#10b981] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">94</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Compliant</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f97316] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">34</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Violations</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0066cc] flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">6</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Recent Inspections</h3>
            <button
              id="btn-home-view-all"
              onClick={onOpenHistory}
              className="text-[#0066cc] hover:text-[#0052a3] text-xs font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {amulRecord && (
            <div
              id="recent-item-amul"
              onClick={() => onOpenRecord(amulRecord)}
              className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:border-[#10b981] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={amulRecord.frontImageUrl}
                    alt={amulRecord.productName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{amulRecord.productName}</h4>
                  <p className="text-[11px] text-slate-500">{amulRecord.brand}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{amulRecord.generatedOn}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#10b981] border border-emerald-200/80">
                  Compliant
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {violationRecord && (
            <div
              id="recent-item-violation"
              onClick={() => onOpenRecord(violationRecord)}
              className="bg-white rounded-xl p-3 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:border-[#f97316] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={violationRecord.frontImageUrl}
                    alt={violationRecord.productName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{violationRecord.productName}</h4>
                  <p className="text-[11px] text-slate-500">{violationRecord.brand}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{violationRecord.generatedOn}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#f97316] border border-orange-200/80">
                  Violation
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. NEW INSPECTION / CAMERA SCANNER SCREEN (REPLICATED EXACTLY FROM UI IMAGE)
   ========================================================================== */
interface ScreenNewInspectionProps {
  onBack: () => void;
  onSelectProductForScan: (recordId: string, customImage?: string) => void;
  onBatchInspectClick: () => void;
}

export function ScreenNewInspection({
  onBack,
  onSelectProductForScan,
  onBatchInspectClick,
}: ScreenNewInspectionProps) {
  const [flashMode, setFlashMode] = useState<'Auto' | 'On' | 'Off'>('Auto');
  const [filterMode, setFilterMode] = useState<'Standard' | 'Contrast' | 'Doc'>('Standard');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  useEffect(() => {
    let isSubscribed = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraActive(false);
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (isSubscribed && videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraActive(true);
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.warn('Live WebRTC camera stream unavailable (fallback to native camera):', err);
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      isSubscribed = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCapturing(true);
      setTimeout(() => {
        onSelectProductForScan('rec-captured', dataUrl);
      }, 300);
    };
    reader.readAsDataURL(file);
  };

  const handleShutterCapture = () => {
    setIsCapturing(true);

    // If live WebRTC video stream is active, capture from video canvas
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setTimeout(() => {
          onSelectProductForScan('rec-captured', capturedDataUrl);
        }, 400);
        return;
      }
    }

    // If live WebRTC not available (e.g. non-HTTPS mobile browser), trigger native device camera
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsCapturing(false);
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === 'Auto' ? 'On' : prev === 'On' ? 'Off' : 'Auto'));
  };

  const toggleFilter = () => {
    setFilterMode((prev) => (prev === 'Standard' ? 'Contrast' : prev === 'Contrast' ? 'Doc' : 'Standard'));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#2b2b2b] text-white select-none relative overflow-hidden h-full">
      {/* Offscreen Canvas for Real Photo Snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Direct Native Mobile Camera Trigger */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Gallery File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Left Close X Button */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={() => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            onBack();
          }}
          aria-label="Close Scanner"
          className="w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Top Center Camera Mode Badge */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-20 pointer-events-none">
        <span className="bg-neutral-900/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-neutral-700/60 shadow-md">
          {cameraActive ? '● LIVE SCANNER' : '📷 CAMERA SCANNER'}
        </span>
      </div>

      {/* Main Viewfinder Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div
          onClick={handleShutterCapture}
          className={`w-[82%] aspect-[3/4] max-w-[290px] bg-[#1e293b] rounded-xl shadow-2xl relative cursor-pointer transition-all duration-300 overflow-hidden flex flex-col items-center justify-center border-2 ${
            cameraActive ? 'border-sky-400' : 'border-dashed border-sky-400/80'
          } ${isCapturing ? 'brightness-125 scale-98 ring-4 ring-white' : 'hover:brightness-105'}`}
        >
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? 'opacity-100' : 'opacity-0 absolute'
            } ${filterMode === 'Contrast' ? 'contrast-150 grayscale' : filterMode === 'Doc' ? 'brightness-110 contrast-125' : ''}`}
          />

          {/* Interactive Native Camera Launch Card when WebRTC is inactive */}
          {!cameraActive && (
            <div className="flex flex-col items-center justify-center text-center p-5 z-10">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-sky-400 animate-pulse" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                Tap to Open Camera
              </span>
              <p className="text-[11px] text-slate-300 mt-1 leading-tight max-w-[200px]">
                Take a clear photo of the product label, MRP, and manufacturing panel.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="mt-3 bg-[#0066cc] hover:bg-[#0052a3] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Device Camera</span>
              </button>
            </div>
          )}

          {/* Hairline Scanner Overlay Corners */}
          <div className="absolute inset-2 pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-400" />
          </div>
          
          {/* Preset indicator tag */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-black/70 text-white/95 text-[10px] font-medium px-3 py-0.5 rounded-full backdrop-blur-xs border border-white/10">
              {cameraActive ? 'Center Product Label Inside Frame' : 'Position Label & Tap Shutter'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Camera Action Controls Panel */}
      <div className="pb-8 pt-2 px-6 flex flex-col items-center gap-4 z-30 bg-[#2b2b2b]">
        {/* Row of 3 Circle Option Buttons: Flash, Filters, Upload */}
        <div className="flex items-center justify-center gap-6">
          {/* 1. Flash Control */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleFlash}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                flashMode !== 'Off'
                  ? 'bg-neutral-800 text-amber-400 ring-1 ring-neutral-700'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
              title="Toggle Flash"
            >
              <div className="relative flex items-center justify-center">
                <Zap className="w-5 h-5 fill-current" />
                {flashMode === 'Auto' && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black text-amber-400">
                    A
                  </span>
                )}
              </div>
            </button>
            <span className="text-[11px] text-neutral-300 font-medium">Flash</span>
          </div>

          {/* 2. Filters Control */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleFilter}
              className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-all cursor-pointer ring-1 ring-neutral-700"
              title="Filters"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8">
                <circle cx="9" cy="10" r="4.5" />
                <circle cx="15" cy="10" r="4.5" />
                <circle cx="12" cy="15" r="4.5" />
              </svg>
            </button>
            <span className="text-[11px] text-neutral-300 font-medium">Filters</span>
          </div>

          {/* 3. Upload from Gallery / Files */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition-all cursor-pointer ring-1 ring-neutral-700"
              title="Upload Label Photo"
            >
              <Upload className="w-5 h-5 text-neutral-200" />
            </button>
            <span className="text-[11px] text-neutral-300 font-medium">Gallery</span>
          </div>
        </div>

        {/* Big White Capture Shutter Button */}
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <button
            onClick={handleShutterCapture}
            className="w-16 h-16 rounded-full bg-white border-4 border-neutral-700 shadow-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform hover:scale-105"
            aria-label="Capture Photo"
          >
            <div className="w-12 h-12 rounded-full border-2 border-neutral-400 bg-slate-50 flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-800" />
            </div>
          </button>
          <span className="text-[10px] text-slate-300 font-medium">Tap to Capture & Analyze</span>
        </div>

        {/* Quick Test Sample Commodities Carousel */}
        <div className="w-full mt-2 pt-2 border-t border-neutral-700/60 flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-between w-full text-[10px] text-neutral-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300">Quick Test Samples:</span>
            <span className="text-slate-400">1-Tap AI Audit</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 no-scrollbar">
            <button
              onClick={() => onSelectProductForScan('rec-amul')}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-left transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-white block">Amul Milk (1L)</span>
                <span className="text-[9px] text-slate-300">₹ 54.00 • Compliant</span>
              </div>
            </button>

            <button
              onClick={() => onSelectProductForScan('rec-tata')}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-left transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-white block">Tata Salt (1kg)</span>
                <span className="text-[9px] text-slate-300">₹ 28.00 • Compliant</span>
              </div>
            </button>

            <button
              onClick={() => onSelectProductForScan('rec-britannia')}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-left transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <span className="text-[10px] font-bold text-white block">Good Day (100g)</span>
                <span className="text-[9px] text-amber-300">₹ 30.00 • Non-Compliant</span>
              </div>
            </button>

            <button
              onClick={() => onSelectProductForScan('rec-fortune')}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-left transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-white block">Fortune Oil (1L)</span>
                <span className="text-[9px] text-slate-300">₹ 165.00 • Compliant</span>
              </div>
            </button>

            <button
              onClick={() => onSelectProductForScan('rec-dettol')}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-left transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-white block">Dettol (250ml)</span>
                <span className="text-[9px] text-slate-300">₹ 178.00 • Compliant</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. ANALYZING SCREEN
   ========================================================================== */
interface ScreenAnalyzingProps {
  record: ProductInspectionRecord;
  customImage?: string;
  onBack: () => void;
  onAnalysisComplete: () => void;
}

export function ScreenAnalyzing({
  record,
  customImage,
  onBack,
  onAnalysisComplete,
}: ScreenAnalyzingProps) {
  const [progress, setProgress] = useState(67);
  const [currentStep, setCurrentStep] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onAnalysisComplete();
          }, 600);
          return 100;
        }
        const next = prev + 5;
        if (next > 75) setCurrentStep(5);
        if (next > 90) setCurrentStep(6);
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onAnalysisComplete]);

  const steps = [
    { title: 'Image quality checked', id: 1 },
    { title: 'Text detected', id: 2 },
    { title: 'Mandatory declarations extracted', id: 3 },
    { title: 'Checking Legal Metrology rules', id: 4 },
    { title: 'Font size verification', id: 5 },
    { title: 'Generating compliance result', id: 6 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 flex-shrink-0 shadow-2xs">
        <button
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 -ml-1 text-slate-700 hover:text-[#0066cc] rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900">Analyzing Product Label</h1>
      </header>

      <div className="flex-1 p-4 flex flex-col items-center max-w-lg mx-auto w-full gap-4">
        <div className="w-full bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col items-center text-center relative overflow-hidden">
            {customImage ? (
              <div className="w-full max-w-[280px] h-48 rounded-lg overflow-hidden relative border border-slate-300 shadow-inner group">
                <img src={customImage} alt="Captured Product Label" className="w-full h-full object-cover" />
                {/* Laser OCR scanning line overlay */}
                <div className="absolute inset-x-0 h-1 bg-[#0066cc] shadow-[0_0_12px_#0066cc] animate-pulse top-1/2 -translate-y-1/2" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                  LIVE OCR SNAPSHOT
                </div>
              </div>
            ) : (
              <>
                <div className="w-full flex flex-col items-center">
                  <span className="text-white text-[10px] font-black tracking-widest uppercase bg-[#10b981] px-2.5 py-0.5 rounded-full shadow-2xs">
                    {record.brand || 'NUTRITECH'}
                  </span>
                  <span className="text-slate-800 text-sm font-extrabold mt-1">
                    {record.productName || 'Mixed Nuts'}
                  </span>
                </div>

                <div className="w-full max-w-[260px] bg-slate-50/80 rounded-lg border border-slate-200 p-2.5 mt-3 text-left font-sans text-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Net Quantity :</span>
                    <span className="font-bold text-slate-900">{record.netQuantity || '200 g'}</span>
                  </div>
                  <div className="flex justify-between bg-orange-50/90 p-1 rounded border border-[#f97316]/50">
                    <span className="font-semibold text-[#c2410c]">MRP :</span>
                    <span className="font-bold text-slate-900">{record.mrp || '₹ 299.00'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic text-right">
                    (inclusive of all taxes)
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Mfg. Date :</span>
                    <span className="font-bold text-slate-900">{record.mfgDate || '08/2025'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Best Before :</span>
                    <span className="font-bold text-slate-900">{record.expDate || '08/2026'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center mt-2.5">
                  <div className="h-6 w-36 flex items-center justify-between px-1">
                    <span className="w-0.5 h-full bg-[#f97316]" />
                    <span className="w-0.5 h-full bg-[#0066cc]" />
                    <span className="w-1 h-full bg-[#10b981]" />
                    <span className="w-0.5 h-full bg-slate-800" />
                    <span className="w-1.5 h-full bg-[#0066cc]" />
                    <span className="w-0.5 h-full bg-[#f97316]" />
                    <span className="w-1 h-full bg-[#10b981]" />
                    <span className="w-0.5 h-full bg-slate-800" />
                    <span className="w-0.5 h-full bg-[#0066cc]" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-slate-600 mt-0.5">
                    {record.barcode || '8 906125 456789'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0066cc] transition-all duration-300 ease-out"
                strokeDasharray={`${progress}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
              {progress}%
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Analyzing Label...</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">
              Please wait while we verify the details.
            </p>
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <ul className="flex flex-col gap-3 text-xs">
            {steps.map((step) => {
              const isDone = step.id < currentStep || progress === 100;
              const isCurrent = step.id === currentStep && progress < 100;

              return (
                <li key={step.id} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#0066cc] animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      isDone
                        ? 'text-slate-800 font-semibold'
                        : isCurrent
                        ? 'text-[#0066cc] font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          onClick={onAnalysisComplete}
          className="text-xs font-semibold text-[#0066cc] hover:text-[#0052a3] underline mt-1 cursor-pointer"
        >
          Skip to Results
        </button>
      </div>
    </div>
  );
}
