import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  Layers,
  Search,
  Plus,
  Link,
  Trash2,
  Check,
  ChevronDown,
  Zap,
  Info
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { RouteResultCard } from '../components/RouteResultCard';
import { LocationItem, RoadItem, ShortestPathResult } from '../types';

interface RouteFinderPageProps {
  locations: LocationItem[];
  roads: RoadItem[];
  routeResult: ShortestPathResult | null;
  onCalculateRoute: (sourceId: number, destId: number) => Promise<void>;
  onResetRoute: () => void;
  isCalculating: boolean;
  onAddLocation?: (data: { name: string; latitude: number; longitude: number; description: string }) => Promise<void>;
  onAddRoad?: (data: { source_location_id: number; destination_location_id: number; distance: number; road_name: string; bidirectional: boolean }) => Promise<void>;
  onClearCanvas?: () => Promise<void>;
  onResetCityData?: () => Promise<void>;
  onResetAcademicData?: () => Promise<void>;
}

export const RouteFinderPage: React.FC<RouteFinderPageProps> = ({
  locations,
  roads,
  routeResult,
  onCalculateRoute,
  onResetRoute,
  isCalculating,
  onAddLocation,
  onAddRoad,
  onClearCanvas,
  onResetCityData,
  onResetAcademicData
}) => {
  const [sourceId, setSourceId] = useState<number | null>(locations[0]?.id ?? null);
  const [destId, setDestId] = useState<number | null>(
    locations.length > 1 ? locations[locations.length - 1]?.id : null
  );

  // Auto-calculation toggle (Real-time recalculation)
  const [isAutoCalculate, setIsAutoCalculate] = useState<boolean>(true);

  // Combobox input states
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [destSearch, setDestSearch] = useState<string>('');
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState<boolean>(false);
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState<boolean>(false);

  // Quick Inline Add Location State
  const [isQuickAddLocOpen, setIsQuickAddLocOpen] = useState<boolean>(false);
  const [quickLocName, setQuickLocName] = useState<string>('');
  const [isCreatingLoc, setIsCreatingLoc] = useState<boolean>(false);

  // Quick Inline Add Road State
  const [isQuickAddRoadOpen, setIsQuickAddRoadOpen] = useState<boolean>(false);
  const [quickRoadSrcId, setQuickRoadSrcId] = useState<number | ''>('');
  const [quickRoadDstId, setQuickRoadDstId] = useState<number | ''>('');
  const [quickRoadDistance, setQuickRoadDistance] = useState<string>('4.0');
  const [quickRoadName, setQuickRoadName] = useState<string>('');
  const [isCreatingRoad, setIsCreatingRoad] = useState<boolean>(false);

  // Sync display search input with current selected source/dest
  useEffect(() => {
    const src = locations.find(l => l.id === sourceId);
    if (src) setSourceSearch(src.name);
    else if (!sourceId) setSourceSearch('');
  }, [sourceId, locations]);

  useEffect(() => {
    const dst = locations.find(l => l.id === destId);
    if (dst) setDestSearch(dst.name);
    else if (!destId) setDestSearch('');
  }, [destId, locations]);

  // Real-time calculation effect when source or dest changes
  useEffect(() => {
    if (isAutoCalculate && sourceId !== null && destId !== null && sourceId !== destId) {
      onCalculateRoute(sourceId, destId);
    }
  }, [sourceId, destId, isAutoCalculate]);

  // Swap source & destination
  const handleSwap = () => {
    const temp = sourceId;
    setSourceId(destId);
    setDestId(temp);
  };

  const handleManualCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destId) return;
    await onCalculateRoute(sourceId, destId);
  };

  // Quick Inline Create Location and immediately select as Source or Dest
  const handleCreateAndSelectLocation = async (name: string, role: 'source' | 'dest') => {
    if (!name.trim() || !onAddLocation) return;
    setIsCreatingLoc(true);
    try {
      // Estimate lat/lng around central cluster
      const baseLat = 28.61 + (Math.random() - 0.5) * 0.08;
      const baseLng = 77.21 + (Math.random() - 0.5) * 0.08;

      await onAddLocation({
        name: name.trim(),
        latitude: Number(baseLat.toFixed(4)),
        longitude: Number(baseLng.toFixed(4)),
        description: 'User-created real-time location'
      });

      // The new location will be the newest in list; handle in next tick
      setTimeout(() => {
        const found = locations.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
        if (found) {
          if (role === 'source') {
            setSourceId(found.id);
            setSourceSearch(found.name);
            setIsSourceDropdownOpen(false);
          } else {
            setDestId(found.id);
            setDestSearch(found.name);
            setIsDestDropdownOpen(false);
          }
        }
      }, 100);
    } finally {
      setIsCreatingLoc(false);
    }
  };

  // Quick Inline Create Road
  const handleQuickAddRoadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoadSrcId || !quickRoadDstId || !onAddRoad) return;

    const dist = parseFloat(quickRoadDistance);
    if (isNaN(dist) || dist <= 0) return;

    setIsCreatingRoad(true);
    try {
      const srcLoc = locations.find(l => l.id === Number(quickRoadSrcId));
      const dstLoc = locations.find(l => l.id === Number(quickRoadDstId));

      await onAddRoad({
        source_location_id: Number(quickRoadSrcId),
        destination_location_id: Number(quickRoadDstId),
        distance: dist,
        road_name: quickRoadName.trim() || `${srcLoc?.name} - ${dstLoc?.name}`,
        bidirectional: true
      });

      setQuickRoadName('');
      setIsQuickAddRoadOpen(false);

      // Re-trigger calculation if connected to active path
      if (isAutoCalculate && sourceId && destId) {
        onCalculateRoute(sourceId, destId);
      }
    } finally {
      setIsCreatingRoad(false);
    }
  };

  const filteredSourceLocations = locations.filter(l =>
    l.name.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredDestLocations = locations.filter(l =>
    l.name.toLowerCase().includes(destSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Real-Time Input Mode & Dataset Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <Zap className="w-3 h-3 text-emerald-500" />
              Real-Time Dynamic Input Mode
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({locations.length} Locations, {roads.length} Roads)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            GPS Shortest Route Finder (Dijkstra)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select or type custom locations in real-time, or build your own road network from a clean slate.
          </p>
        </div>

        {/* Quick Dataset Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          {onClearCanvas && (
            <button
              type="button"
              onClick={onClearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
              title="Clear all predefined data to build your own custom graph from scratch"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clean Slate</span>
            </button>
          )}

          {onResetAcademicData && (
            <button
              type="button"
              onClick={onResetAcademicData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition-colors"
              title="Load Academic 4-Node Test Graph (A-B-C-D)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4-Node Demo</span>
            </button>
          )}

          {onResetCityData && (
            <button
              type="button"
              onClick={onResetCityData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold transition-colors"
              title="Load Metropolitan 12-Node Road Network"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>12-Node City</span>
            </button>
          )}
        </div>
      </div>

      {/* Route Finder Query Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Origin & Destination Selection
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoCalculate}
              onChange={e => setIsAutoCalculate(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
            <span>Instant Auto-Route (Real-Time)</span>
          </label>
        </div>

        <form onSubmit={handleManualCalculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Source Combobox */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                1. Source Location (Origin)
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={sourceSearch}
                  onChange={e => {
                    setSourceSearch(e.target.value);
                    setIsSourceDropdownOpen(true);
                  }}
                  onFocus={() => setIsSourceDropdownOpen(true)}
                  placeholder="Type or select origin..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <button
                  type="button"
                  onClick={() => setIsSourceDropdownOpen(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Source Autocomplete Dropdown */}
              {isSourceDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsSourceDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 text-xs">
                    {filteredSourceLocations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSourceId(loc.id);
                          setSourceSearch(loc.name);
                          setIsSourceDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          sourceId === loc.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {sourceId === loc.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}

                    {sourceSearch.trim() && !locations.some(l => l.name.toLowerCase() === sourceSearch.trim().toLowerCase()) && onAddLocation && (
                      <button
                        type="button"
                        onClick={() => handleCreateAndSelectLocation(sourceSearch, 'source')}
                        disabled={isCreatingLoc}
                        className="w-full flex items-center gap-2 p-2.5 mt-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Create "{sourceSearch.trim()}" in Real-Time</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center pt-2 md:pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Swap Origin and Destination"
              >
                <ArrowRight className="w-4 h-4 md:rotate-0 rotate-90 text-emerald-500" />
              </button>
            </div>

            {/* Destination Combobox */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                2. Destination Location (Target)
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={destSearch}
                  onChange={e => {
                    setDestSearch(e.target.value);
                    setIsDestDropdownOpen(true);
                  }}
                  onFocus={() => setIsDestDropdownOpen(true)}
                  placeholder="Type or select destination..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-rose-500" />
                <button
                  type="button"
                  onClick={() => setIsDestDropdownOpen(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Destination Autocomplete Dropdown */}
              {isDestDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDestDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 text-xs">
                    {filteredDestLocations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setDestId(loc.id);
                          setDestSearch(loc.name);
                          setIsDestDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          destId === loc.id
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {destId === loc.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </button>
                    ))}

                    {destSearch.trim() && !locations.some(l => l.name.toLowerCase() === destSearch.trim().toLowerCase()) && onAddLocation && (
                      <button
                        type="button"
                        onClick={() => handleCreateAndSelectLocation(destSearch, 'dest')}
                        disabled={isCreatingLoc}
                        className="w-full flex items-center gap-2 p-2.5 mt-1 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Create "{destSearch.trim()}" in Real-Time</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons & Quick Add Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              {onAddLocation && (
                <button
                  type="button"
                  onClick={() => setIsQuickAddLocOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isQuickAddLocOpen
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add Node</span>
                </button>
              )}

              {onAddRoad && (
                <button
                  type="button"
                  onClick={() => setIsQuickAddRoadOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isQuickAddRoadOpen
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-700 dark:text-amber-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Quick Connect Road</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {routeResult && (
                <button
                  type="button"
                  onClick={onResetRoute}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isCalculating || !sourceId || !destId || sourceId === destId}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md"
              >
                <Navigation className="w-4 h-4" />
                <span>{isCalculating ? 'Computing Dijkstra...' : 'Find Shortest Route'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Expandable Quick Add Location Bar */}
        {isQuickAddLocOpen && onAddLocation && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Real-Time Node:</span>
            </span>
            <input
              type="text"
              value={quickLocName}
              onChange={e => setQuickLocName(e.target.value)}
              placeholder="New Location Name (e.g. Science Park)"
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              disabled={!quickLocName.trim() || isCreatingLoc}
              onClick={async () => {
                if (!quickLocName.trim()) return;
                await handleCreateAndSelectLocation(quickLocName, 'dest');
                setQuickLocName('');
                setIsQuickAddLocOpen(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {isCreatingLoc ? 'Adding...' : 'Add Node to Graph'}
            </button>
          </div>
        )}

        {/* Expandable Quick Add Road Bar */}
        {isQuickAddRoadOpen && onAddRoad && (
          <form
            onSubmit={handleQuickAddRoadSubmit}
            className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs animate-in fade-in"
          >
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Link className="w-3.5 h-3.5" />
              <span>Real-Time Road:</span>
            </span>

            <select
              value={quickRoadSrcId}
              onChange={e => setQuickRoadSrcId(Number(e.target.value))}
              required
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">From...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <span>⇄</span>

            <select
              value={quickRoadDstId}
              onChange={e => setQuickRoadDstId(Number(e.target.value))}
              required
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">To...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={quickRoadDistance}
                onChange={e => setQuickRoadDistance(e.target.value)}
                placeholder="Dist"
                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center"
              />
              <span className="text-slate-400 text-[11px]">km</span>
            </div>

            <button
              type="submit"
              disabled={isCreatingRoad || !quickRoadSrcId || !quickRoadDstId}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {isCreatingRoad ? 'Connecting...' : 'Connect Edge'}
            </button>
          </form>
        )}
      </div>

      {/* Interactive Graph Visualizer Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span>Interactive GPS Network Map</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tip: Switch to "+ Add Node" or "+ Connect Road" to edit the network in real-time.
          </span>
        </div>

        <GraphViewer
          locations={locations}
          roads={roads}
          sourceId={sourceId}
          destinationId={destId}
          routeResult={routeResult}
          onSelectSource={id => setSourceId(id)}
          onSelectDestination={id => setDestId(id)}
          onAddLocationDirectly={onAddLocation}
          onAddRoadDirectly={onAddRoad}
          onClearCanvas={onClearCanvas}
          height="540px"
          showControls={true}
        />
      </div>

      {/* Shortest Route Breakdown Card */}
      {routeResult && (
        <RouteResultCard
          result={routeResult}
          locations={locations}
          roads={roads}
        />
      )}
    </div>
  );
};
