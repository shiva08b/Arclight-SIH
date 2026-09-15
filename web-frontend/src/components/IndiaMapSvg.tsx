import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin } from 'lucide-react';
import { HotspotZone } from '../types';

interface IndiaMapSvgProps {
  hotspots: HotspotZone[];
  selectedZoneId?: string;
  onSelectZone: (zone: HotspotZone) => void;
}

export function IndiaMapSvg({ hotspots, selectedZoneId, onSelectZone }: IndiaMapSvgProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.9));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // State coordinate positions mapped onto 600x650 SVG viewBox
  const MAP_HOTSPOTS = [
    {
      id: 'zone-delhi',
      name: 'Delhi NCR (Okhla & Karol Bagh)',
      region: 'North Zone',
      cx: 255,
      cy: 220,
      totalInspections: 226,
      nonCompliantInspections: 83,
      violationDensity: 36.7,
      priorityLevel: 'High Inspection Priority' as const,
      topFindingCategory: 'MRP Overprint & Font Size',
      affectedManufacturersCount: 14,
      dominantCategories: ['Food & Spices', 'Electrical']
    },
    {
      id: 'zone-mumbai',
      name: 'Mumbai & Thane FMCG Corridor',
      region: 'West Zone',
      cx: 175,
      cy: 420,
      totalInspections: 310,
      nonCompliantInspections: 118,
      violationDensity: 38.0,
      priorityLevel: 'High Inspection Priority' as const,
      topFindingCategory: 'Dual Pricing & Sticker Overlay',
      affectedManufacturersCount: 19,
      dominantCategories: ['Dairy & Edible Oils', 'Cosmetics']
    },
    {
      id: 'zone-bengaluru',
      name: 'Bengaluru Tech & Retail Hub',
      region: 'South Zone',
      cx: 245,
      cy: 530,
      totalInspections: 190,
      nonCompliantInspections: 34,
      violationDensity: 17.8,
      priorityLevel: 'Moderate Inspection Priority' as const,
      topFindingCategory: 'Consumer Care Address Omission',
      affectedManufacturersCount: 6,
      dominantCategories: ['Household', 'Packaged Snacks']
    },
    {
      id: 'zone-[#ahmedabad]',
      name: 'Gujarat GIDC Packaging Estate',
      region: 'West Zone',
      cx: 135,
      cy: 330,
      totalInspections: 140,
      nonCompliantInspections: 17,
      violationDensity: 12.1,
      priorityLevel: 'Low Surveillance Zone' as const,
      topFindingCategory: 'Net Quantity Font Height',
      affectedManufacturersCount: 4,
      dominantCategories: ['Dairy & Staples']
    },
    {
      id: 'zone-kolkata',
      name: 'Kolkata Wholesale & Port Depot',
      region: 'East Zone',
      cx: 445,
      cy: 340,
      totalInspections: 215,
      nonCompliantInspections: 69,
      violationDensity: 32.0,
      priorityLevel: 'High Inspection Priority' as const,
      topFindingCategory: 'Importer Registration Defect',
      affectedManufacturersCount: 11,
      dominantCategories: ['Imported Confectionery', 'Spices']
    },
    {
      id: 'zone-hyderabad',
      name: 'Hyderabad Cherlapally Hub',
      region: 'South-Central Zone',
      cx: 275,
      cy: 440,
      totalInspections: 165,
      nonCompliantInspections: 36,
      violationDensity: 21.8,
      priorityLevel: 'Moderate Inspection Priority' as const,
      topFindingCategory: 'Date of Packing Legibility',
      affectedManufacturersCount: 7,
      dominantCategories: ['Pharma & Health Supplement']
    },
    {
      id: 'zone-guwahati',
      name: 'Guwahati North-East Logistics',
      region: 'North-East Zone',
      cx: 515,
      cy: 260,
      totalInspections: 95,
      nonCompliantInspections: 8,
      violationDensity: 8.4,
      priorityLevel: 'Low Surveillance Zone' as const,
      topFindingCategory: 'Address Alignment',
      affectedManufacturersCount: 2,
      dominantCategories: ['Staples & Tea']
    }
  ];

  return (
    <div className="relative w-full h-[320px] sm:h-[360px] bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl select-none">
      {/* Map Control Buttons: Zoom In, Zoom Out, Reset */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-xs">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg cursor-pointer transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg cursor-pointer transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset View"
          className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg cursor-pointer transition-colors border-t border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/85 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-xs">
        <MapPin className="w-4 h-4 text-orange-400" />
        <div>
          <h4 className="text-xs font-black text-white tracking-wide">Republic of India</h4>
          <span className="text-[9.5px] text-slate-400 block font-mono">Geographic Surveillance Matrix</span>
        </div>
      </div>

      {/* Zoom Indicator Tag */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded text-[9.5px] font-mono text-slate-300">
        Scale: {(zoomLevel * 100).toFixed(0)}%
      </div>

      {/* Scalable Vector SVG Map of India Container */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          viewBox="0 0 600 650"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ocean Layer */}
          <rect width="600" height="650" fill="url(#oceanGrad)" />

          {/* Latitude & Longitude Coordinate Lines */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.6">
            <line x1="0" y1="150" x2="600" y2="150" />
            <line x1="0" y1="300" x2="600" y2="300" />
            <line x1="0" y1="450" x2="600" y2="450" />
            <line x1="150" y1="0" x2="150" y2="650" />
            <line x1="300" y1="0" x2="300" y2="650" />
            <line x1="450" y1="0" x2="450" y2="650" />
          </g>

          {/* Official Stylized Scalable Path Boundary Map of India */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="1.8" strokeLinejoin="round">
            {/* Jammu & Kashmir / Ladakh */}
            <path d="M210 50 L250 40 L280 60 L290 100 L260 120 L220 110 L190 80 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Himachal & Uttarakhand */}
            <path d="M260 120 L290 100 L310 130 L290 150 L260 140 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Punjab & Haryana & Delhi */}
            <path d="M220 110 L260 120 L260 140 L240 170 L200 150 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Rajasthan */}
            <path d="M120 190 L200 150 L240 170 L230 250 L140 270 L110 230 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Uttar Pradesh */}
            <path d="M260 140 L290 150 L370 180 L350 240 L260 220 L240 170 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Gujarat */}
            <path d="M70 290 L140 270 L170 310 L150 360 L100 370 L60 330 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Madhya Pradesh */}
            <path d="M200 250 L260 220 L330 260 L310 330 L220 340 L170 310 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Maharashtra */}
            <path d="M150 360 L220 340 L280 370 L260 450 L170 440 L140 390 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Bihar & Jharkhand */}
            <path d="M370 180 L420 200 L430 260 L380 270 L350 240 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* West Bengal */}
            <path d="M420 200 L440 220 L450 350 L410 340 L430 260 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Chhattisgarh & Odisha */}
            <path d="M310 330 L380 270 L410 340 L360 410 L300 380 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Telangana & Andhra Pradesh */}
            <path d="M260 410 L300 380 L360 410 L310 510 L250 480 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Karnataka & Goa */}
            <path d="M170 440 L260 450 L250 480 L220 550 L190 510 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Tamil Nadu & Kerala */}
            <path d="M220 550 L250 480 L310 510 L270 610 L220 600 Z" className="hover:fill-slate-700 transition-colors" />
            
            {/* Assam & North East States */}
            <path d="M450 220 L510 190 L560 220 L540 280 L470 270 Z" className="hover:fill-slate-700 transition-colors" />

            {/* Andaman & Nicobar / Lakshadweep Islands */}
            <circle cx="120" cy="560" r="3" />
            <circle cx="125" cy="575" r="2.5" />
            <circle cx="510" cy="510" r="3" />
            <circle cx="515" cy="530" r="3.5" />
          </g>

          {/* Major National Highway Routes (Connecting Metro Enforcement Hubs) */}
          <g stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" opacity="0.4">
            {/* Golden Quadrilateral Expressway */}
            <path d="M 255 220 L 175 420 L 245 530 L 445 340 L 255 220" fill="none" />
          </g>

          {/* Plotted Hotspot Violation Density Circles over India Map */}
          {MAP_HOTSPOTS.map((spot) => {
            const isSelected = selectedZoneId === spot.id || selectedZoneId === spot.name;
            const isHighDensity = spot.violationDensity >= 30;
            const isMediumDensity = spot.violationDensity >= 15 && spot.violationDensity < 30;

            const fillColor = isHighDensity ? '#ef4444' : isMediumDensity ? '#f59e0b' : '#10b981';
            const strokeColor = isHighDensity ? '#fca5a5' : isMediumDensity ? '#fde68a' : '#a7f3d0';

            return (
              <g
                key={spot.id}
                transform={`translate(${spot.cx}, ${spot.cy})`}
                onClick={() => {
                  onSelectZone({
                    id: spot.id,
                    name: spot.name,
                    region: spot.region,
                    latitude: 28.6139,
                    longitude: 77.2090,
                    totalInspections: spot.totalInspections,
                    nonCompliantInspections: spot.nonCompliantInspections,
                    violationDensity: spot.violationDensity,
                    priorityLevel: spot.priorityLevel,
                    topFindingCategory: spot.topFindingCategory,
                    affectedManufacturersCount: spot.affectedManufacturersCount,
                    dominantCategories: spot.dominantCategories
                  });
                }}
                className="cursor-pointer group"
              >
                {/* Pulsing ring for high violation hotspots */}
                {isHighDensity && (
                  <circle r="22" fill={fillColor} opacity="0.25" className="animate-ping" />
                )}

                {/* Outer halo circle */}
                <circle
                  r={isSelected ? '18' : '15'}
                  fill={fillColor}
                  fillOpacity="0.4"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="url(#glow)"
                  className="transition-all duration-300 group-hover:r-20"
                />

                {/* Inner Core Circle */}
                <circle r={isSelected ? '9' : '7'} fill={fillColor} />

                {/* Percentage Text Tag */}
                <text
                  y="3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="900"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {spot.violationDensity.toFixed(0)}%
                </text>

                {/* City Name Label */}
                <text
                  y="26"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-md"
                >
                  {spot.region}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Footer Legend */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[9.5px] z-10 backdrop-blur-xs">
        <span className="text-slate-400">Pan & Zoom Map of India</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500" /> High Priority (&gt;30%)
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (15-30%)
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low (&lt;10%)
          </span>
        </div>
      </div>
    </div>
  );
}
