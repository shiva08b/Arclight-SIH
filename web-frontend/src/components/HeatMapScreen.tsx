import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  AlertTriangle,
  Flame,
  BarChart3,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  ShieldAlert,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Target
} from 'lucide-react';
import { IndianEmblem, TricolorStripe } from './LayoutComponents';
import { HotspotZone } from '../types';
import { IndiaMapSvg } from './IndiaMapSvg';

interface ScreenHeatMapProps {
  onBack: () => void;
  onSelectTaskOrCreate?: (zoneName: string) => void;
}

// Initial realistic enforcement hotspot zones
const SEED_HOTSPOT_ZONES: HotspotZone[] = [
  {
    id: 'zone-001',
    name: 'Okhla Industrial Zone Phase-III',
    region: 'South Delhi Hub',
    latitude: 28.5355,
    longitude: 77.2639,
    totalInspections: 100,
    nonCompliantInspections: 45,
    violationDensity: 45.0,
    priorityLevel: 'High Inspection Priority',
    topFindingCategory: 'MRP Declaration Overprint',
    affectedManufacturersCount: 6,
    dominantCategories: ['Food & Spices', 'Confectionery']
  },
  {
    id: 'zone-002',
    name: 'Sector 18 Commercial Complex',
    region: 'Noida Central',
    latitude: 28.5708,
    longitude: 77.3271,
    totalInspections: 128,
    nonCompliantInspections: 31,
    violationDensity: 24.2,
    priorityLevel: 'Moderate Inspection Priority',
    topFindingCategory: 'Consumer Care Toll-Free Omission',
    affectedManufacturersCount: 4,
    dominantCategories: ['Dairy & Edible Oils', 'Household']
  },
  {
    id: 'zone-003',
    name: 'Connaught Circle Commercial Area',
    region: 'Central Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    totalInspections: 200,
    nonCompliantInspections: 20,
    violationDensity: 10.0,
    priorityLevel: 'Low Surveillance Zone',
    topFindingCategory: 'Importer Address Alignment',
    affectedManufacturersCount: 3,
    dominantCategories: ['Imported Confectionery']
  },
  {
    id: 'zone-004',
    name: 'Karol Bagh Wholesale Market',
    region: 'Central-West District',
    latitude: 28.6514,
    longitude: 77.1907,
    totalInspections: 96,
    nonCompliantInspections: 38,
    violationDensity: 39.5,
    priorityLevel: 'High Inspection Priority',
    topFindingCategory: 'Font Size Below Rule 6(2) Minimum',
    affectedManufacturersCount: 8,
    dominantCategories: ['Electrical & Hardware', 'Cosmetics']
  },
  {
    id: 'zone-005',
    name: 'Chandni Chowk Grain Depot',
    region: 'North Delhi Old City',
    latitude: 28.6506,
    longitude: 77.2303,
    totalInspections: 150,
    nonCompliantInspections: 8,
    violationDensity: 5.3,
    priorityLevel: 'Low Surveillance Zone',
    topFindingCategory: 'Date of Packing Legibility',
    affectedManufacturersCount: 2,
    dominantCategories: ['Staples & Pulses']
  },
  {
    id: 'zone-006',
    name: 'Cyber City FMCG Retail Hub',
    region: 'Gurugram Sector 24',
    latitude: 28.4952,
    longitude: 77.0890,
    totalInspections: 180,
    nonCompliantInspections: 52,
    violationDensity: 28.8,
    priorityLevel: 'Moderate Inspection Priority',
    topFindingCategory: 'Dual Pricing Over-Stickers',
    affectedManufacturersCount: 5,
    dominantCategories: ['Dairy & Edible Oils', 'Imported Snacks']
  }
];

export function ScreenHeatMap({ onBack, onSelectTaskOrCreate }: ScreenHeatMapProps) {
  // Filter States
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [findingTypeFilter, setFindingTypeFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Hotspot Zone for Drawer Details
  const [selectedZone, setSelectedZone] = useState<HotspotZone>(SEED_HOTSPOT_ZONES[0]);
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Filtered Hotspot Zones
  const filteredZones = useMemo(() => {
    return SEED_HOTSPOT_ZONES.filter((zone) => {
      // Location search
      if (
        searchQuery &&
        !zone.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !zone.region.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category filter
      if (
        categoryFilter !== 'All' &&
        !zone.dominantCategories.some((c) => c.toLowerCase().includes(categoryFilter.toLowerCase()))
      ) {
        return false;
      }
      // Finding Type filter
      if (
        findingTypeFilter !== 'All' &&
        !zone.topFindingCategory.toLowerCase().includes(findingTypeFilter.toLowerCase())
      ) {
        return false;
      }
      // Severity filter
      if (severityFilter === 'High' && zone.violationDensity < 30) return false;
      if (severityFilter === 'Medium' && (zone.violationDensity < 15 || zone.violationDensity >= 30)) return false;
      if (severityFilter === 'Low' && zone.violationDensity >= 15) return false;

      return true;
    });
  }, [searchQuery, categoryFilter, findingTypeFilter, severityFilter]);

  // Aggregate Totals
  const totalInspectionsSum = useMemo(() => {
    return filteredZones.reduce((acc, z) => acc + z.totalInspections, 0);
  }, [filteredZones]);

  const potentialFindingsSum = useMemo(() => {
    return filteredZones.reduce((acc, z) => acc + z.nonCompliantInspections, 0);
  }, [filteredZones]);

  const highPriorityHotspotsCount = useMemo(() => {
    return filteredZones.filter((z) => z.violationDensity >= 30).length;
  }, [filteredZones]);

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white select-none overflow-y-auto">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            id="btn-heatmap-back"
            onClick={onBack}
            aria-label="Back"
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              Compliance Heat Map
            </h1>
            <p className="text-[10px] text-slate-400">Supervisor Hotspot Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>Filter</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 flex flex-col max-w-lg mx-auto w-full gap-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, industrial zone or market..."
            className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {/* Date Chips */}
          <button
            onClick={() => setDateFilter('30d')}
            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              dateFilter === '30d'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setDateFilter('7d')}
            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              dateFilter === '7d'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setCategoryFilter(categoryFilter === 'Food & Spices' ? 'All' : 'Food & Spices')}
            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              categoryFilter === 'Food & Spices'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Food & Spices
          </button>
          <button
            onClick={() => setFindingTypeFilter(findingTypeFilter === 'MRP' ? 'All' : 'MRP')}
            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              findingTypeFilter === 'MRP'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            MRP Issues
          </button>
        </div>

        {/* Top Metric Summary Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-md">
          <div className="text-center border-r border-slate-800 pr-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Total Audits</span>
            <span className="text-base font-black text-white mt-0.5 block">{totalInspectionsSum.toLocaleString()}</span>
          </div>
          <div className="text-center border-r border-slate-800 px-1">
            <span className="text-[10px] text-orange-400 font-semibold block">Potential Findings</span>
            <span className="text-base font-black text-orange-400 mt-0.5 block">{potentialFindingsSum.toLocaleString()}</span>
          </div>
          <div className="text-center pl-1">
            <span className="text-[10px] text-red-400 font-semibold block">Hotspots</span>
            <span className="text-base font-black text-red-500 mt-0.5 block">{highPriorityHotspotsCount} Zones</span>
          </div>
        </div>

        {/* Neutral Enforcement Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2 text-[10.5px] text-slate-300">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Violation Density Map Interpretation</span>
            <span>Map represents non-compliance finding density per total audits. High priority nodes indicate target areas for officer inspection deployment.</span>
          </div>
        </div>

        {/* Interactive Scalable Vector Map of India */}
        <IndiaMapSvg
          hotspots={filteredZones}
          selectedZoneId={selectedZone.id}
          onSelectZone={(zone) => setSelectedZone(zone)}
        />

        {/* ================================================================== */}
        {/* HOTSPOT ZONE INTELLIGENCE CARD (ACTIVE SELECTION)                  */}
        {/* ================================================================== */}
        {selectedZone && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Selected Surveillance Hotspot</span>
                <h3 className="text-sm font-black text-white mt-0.5">{selectedZone.name}</h3>
                <p className="text-[11px] text-slate-400">{selectedZone.region} • {selectedZone.latitude}° N, {selectedZone.longitude}° E</p>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  selectedZone.violationDensity >= 30
                    ? 'bg-red-950/90 text-red-400 border-red-700/80'
                    : selectedZone.violationDensity >= 15
                    ? 'bg-amber-950/90 text-amber-400 border-amber-700/80'
                    : 'bg-emerald-950/90 text-emerald-400 border-emerald-700/80'
                }`}
              >
                {selectedZone.priorityLevel}
              </span>
            </div>

            {/* Violation Density Calculation Formula Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Violation Density Score
                </span>
                <span className="text-sm font-black font-mono text-orange-400">
                  {selectedZone.violationDensity.toFixed(1)}%
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <div>
                  <div className="text-red-400 font-bold">{selectedZone.nonCompliantInspections} Non-Compliant Audits</div>
                  <div className="text-slate-500 border-t border-slate-700 mt-0.5 pt-0.5">÷ {selectedZone.totalInspections} Total Inspections</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Calculated Ratio</span>
                  <span className="text-xs font-bold text-white font-mono">{(selectedZone.nonCompliantInspections / selectedZone.totalInspections).toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Zone Analysis Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Top Finding Category</span>
                <span className="font-semibold text-amber-300 text-xs mt-0.5 block">{selectedZone.topFindingCategory}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Affected Manufacturers</span>
                <span className="font-semibold text-blue-300 text-xs mt-0.5 block">{selectedZone.affectedManufacturersCount} Companies Logged</span>
              </div>
            </div>

            {/* Actionable Supervisor Button */}
            <button
              id="btn-schedule-surveillance"
              onClick={() => {
                if (onSelectTaskOrCreate) onSelectTaskOrCreate(selectedZone.name);
                else alert(`Surveillance audit task created for ${selectedZone.name}. Field officers notified.`);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4 text-white" />
              <span>Deploy Targeted Inspection Audit Task</span>
            </button>
          </div>
        )}

        {/* Hotspot Priority Ranking List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Priority Hotspot Ranking
            </span>
            <span className="text-[10px] text-slate-400">Sorted by Density Score</span>
          </h3>

          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            {filteredZones
              .slice()
              .sort((a, b) => b.violationDensity - a.violationDensity)
              .map((zone, idx) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    selectedZone.id === zone.id ? 'bg-slate-800/90 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-xs font-black text-slate-500 text-center">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{zone.name}</h4>
                      <p className="text-[10px] text-slate-400">{zone.topFindingCategory}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{zone.nonCompliantInspections}/{zone.totalInspections}</span>
                    <span
                      className={`text-[10.5px] font-black px-2 py-0.5 rounded font-mono ${
                        zone.violationDensity >= 30
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : zone.violationDensity >= 15
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {zone.violationDensity.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
