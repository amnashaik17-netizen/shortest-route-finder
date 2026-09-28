import React, { useState } from 'react';
import {
  MapPin,
  GitFork,
  Navigation,
  Activity,
  ArrowRight,
  BookOpen,
  Cpu,
  Sparkles,
  Layers,
  History,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { GraphViewer } from '../components/GraphViewer';
import {
  LocationItem,
  RoadItem,
  StatisticsData,
  RouteHistoryItem,
  ShortestPathResult,
  ActiveTab
} from '../types';

interface DashboardPageProps {
  stats: StatisticsData | null;
  locations: LocationItem[];
  roads: RoadItem[];
  history: RouteHistoryItem[];
  onCalculateRoute: (sourceId: number, destId: number) => Promise<void>;
  routeResult: ShortestPathResult | null;
  isCalculating: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectNode: (id: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  locations,
  roads,
  history,
  onCalculateRoute,
  routeResult,
  isCalculating,
  setActiveTab,
  onSelectNode
}) => {
  const [sourceId, setSourceId] = useState<number | ''>(locations[0]?.id ?? '');
  const [destId, setDestId] = useState<number | ''>(locations[locations.length - 1]?.id ?? '');

  // Keep defaults valid when locations change
  React.useEffect(() => {
    if (locations.length >= 2) {
      if (!sourceId || !locations.some(l => l.id === sourceId)) {
        setSourceId(locations[0].id);
      }
      if (!destId || !locations.some(l => l.id === destId)) {
        setDestId(locations[locations.length - 1].id);
      }
    }
  }, [locations]);

  const handleQuickFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId && destId) {
      await onCalculateRoute(Number(sourceId), Number(destId));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 4 KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Locations"
          value={stats?.total_locations ?? locations.length}
          subtitle="Graph vertices (V) in SQLite"
          icon={MapPin}
          color="emerald"
          onClick={() => setActiveTab('locations')}
        />
        <StatCard
          title="Total Roads"
          value={stats?.total_roads ?? roads.length}
          subtitle="Graph edges (E) with distances"
          icon={GitFork}
          color="indigo"
          onClick={() => setActiveTab('roads')}
        />
        <StatCard
          title="Routes Calculated"
          value={stats?.routes_calculated ?? history.length}
          subtitle="Persistent calculations logged"
          icon={Navigation}
          color="blue"
          onClick={() => setActiveTab('history')}
        />
        <StatCard
          title="Average Distance"
          value={`${stats?.average_route_distance ?? 0} km`}
          subtitle="Across all historical searches"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Grid: Interactive Network Overview (Left 2/3) + Quick Finder & Info (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Network Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Network Overview</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag vertices to reposition. Click any node to set as origin or destination.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('visualizer')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Visualizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <GraphViewer
              locations={locations}
              roads={roads}
              sourceId={typeof sourceId === 'number' ? sourceId : undefined}
              destinationId={typeof destId === 'number' ? destId : undefined}
              routeResult={routeResult}
              onSelectSource={id => setSourceId(id)}
              onSelectDestination={id => setDestId(id)}
              height="460px"
              showControls={true}
            />
          </div>
        </div>

        {/* Right 1 Col: Quick Route Finder & Algorithm Summary */}
        <div className="space-y-6">
          {/* Quick Route Finder Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Quick Route Finder
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select start & end locations
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickFind} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Source Location
                </label>
                <select
                  value={sourceId}
                  onChange={e => setSourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Destination Location
                </label>
                <select
                  value={destId}
                  onChange={e => setDestId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isCalculating || !sourceId || !destId}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isCalculating ? 'Computing Shortest Path...' : 'Find Shortest Route'}</span>
              </button>
            </form>

            {/* Quick Result Preview */}
            {routeResult && routeResult.distance !== null && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                  <span>Distance: {routeResult.distance} km</span>
                  <span className="font-mono">{routeResult.execution_time_ms} ms</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {routeResult.path_locations.map(l => l.name).join(' → ')}
                </div>
                <button
                  onClick={() => setActiveTab('route-finder')}
                  className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>View Step-by-Step Directions</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* DAA Algorithm Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>DAA Algorithm Information</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Algorithm:</strong> Dijkstra's Algorithm from scratch.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Category:</strong> Single Source Shortest Path on non-negative weighted graphs.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Data Structure:</strong> Adjacency List + Min-Heap Priority Queue.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('algorithm')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition-colors text-center"
                >
                  View Viva Pseudocode
                </button>
                <button
                  onClick={() => setActiveTab('complexity')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition-colors text-center"
                >
                  Complexity O((V+E)log V)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Route Searches Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
            <History className="w-4 h-4 text-emerald-500" />
            <span>Recent Route Calculations (Saved in SQLite)</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All History ({history.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No route searches logged yet. Use the Quick Route Finder above to compute a route!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 3).map(h => (
              <div
                key={h.id}
                onClick={() => {
                  onCalculateRoute(h.source_location_id, h.destination_location_id);
                  setActiveTab('route-finder');
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  <span>{h.source_name} → {h.destination_name}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{h.shortest_distance} km</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                  {h.shortest_path}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(h.calculated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
