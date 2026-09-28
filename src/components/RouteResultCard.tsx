import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  CheckCircle2,
  Share2,
  Layers,
  ArrowRight,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Milestone
} from 'lucide-react';
import { LocationItem, ShortestPathResult } from '../types';

interface RouteResultCardProps {
  result: ShortestPathResult;
  locations: LocationItem[];
  onSelectNode?: (id: number) => void;
}

export const RouteResultCard: React.FC<RouteResultCardProps> = ({
  result,
  locations,
  onSelectNode
}) => {
  const [showAllDistances, setShowAllDistances] = useState(false);
  const [showStepsLog, setShowStepsLog] = useState(false);

  const locMap = React.useMemo(() => {
    const map = new Map<number, LocationItem>();
    for (const l of locations) {
      map.set(l.id, l);
    }
    return map;
  }, [locations]);

  const hasRoute = result.distance !== null && result.path && result.path.length > 0;

  if (!hasRoute) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
            ✕
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Route Exists
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          No traversable path exists between <span className="font-semibold text-slate-800 dark:text-slate-200">{result.source?.name}</span> and <span className="font-semibold text-slate-800 dark:text-slate-200">{result.destination?.name}</span> in the current weighted graph network.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
          <div>
            <div className="text-slate-400">Execution Time</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{result.execution_time_ms} ms</div>
          </div>
          <div>
            <div className="text-slate-400">Nodes Processed</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{result.nodes_processed}</div>
          </div>
          <div>
            <div className="text-slate-400">Edges Examined</div>
            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">{result.edges_examined}</div>
          </div>
          <div>
            <div className="text-slate-400">Status</div>
            <div className="font-semibold text-rose-500">Disconnected</div>
          </div>
        </div>
      </div>
    );
  }

  const pathStr = result.path_locations.map(l => l.name).join(' → ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Top Banner: Shortest Distance & Route Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Optimal Route Found
            </span>
            <span className="text-xs text-slate-400">via Dijkstra's Algorithm</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {result.source?.name} <span className="text-emerald-500">→</span> {result.destination?.name}
          </h2>
        </div>

        {/* Shortest Distance Hero Stat */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl px-5 py-3.5 text-center sm:text-right shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Shortest Distance
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
            {result.distance} <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">km</span>
          </div>
        </div>
      </div>

      {/* Path Breadcrumb View */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-2">
          <Milestone className="w-4 h-4 text-emerald-500" />
          <span>Shortest Path Nodes</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
          {result.path_locations.map((loc, idx) => (
            <React.Fragment key={loc.id}>
              <div
                onClick={() => onSelectNode?.(loc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  idx === 0
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : idx === result.path_locations.length - 1
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500'
                }`}
              >
                <span>{loc.name}</span>
                {idx === 0 && <span className="text-[10px] opacity-80">(Start)</span>}
                {idx === result.path_locations.length - 1 && <span className="text-[10px] opacity-80">(Finish)</span>}
              </div>
              {idx < result.path_locations.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step-by-Step Directions Breakdown */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-indigo-500" />
          <span>Step-by-Step GPS Navigation Directions</span>
        </div>
        <div className="space-y-2.5">
          {/* Step 1 Origin */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              S
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Start at {result.source?.name}
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                Initialize GPS trip origin. Distance: 0 km
              </div>
            </div>
          </div>

          {result.path_steps.map(step => (
            <div
              key={step.step}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {step.step}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>
                    Travel <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{step.distance} km</span> to {step.to_name}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    via {step.road_name}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Segment: {step.from_name} → {step.to_name}
                </div>
              </div>
            </div>
          ))}

          {/* Destination Arrival */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-100">
                Arrive at Destination: {result.destination?.name}
              </div>
              <div className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                Total Route Distance: <span className="font-mono font-bold">{result.distance} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAA Algorithm Execution Details (Academic Requirement) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Algorithm Execution & Performance Metrics</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Execution Time</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {result.execution_time_ms} ms
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Nodes Processed</div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {result.nodes_processed} / {result.vertices_count ?? locations.length}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Edges Examined</div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {result.edges_examined} / {result.edges_count ?? 0}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Priority Queue</div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Min-Heap O(log V)
            </div>
          </div>
        </div>
      </div>

      {/* Accordion: All Calculated Distances from Source (Single Source Shortest Path requirement) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAllDistances(!showAllDistances)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Single Source Shortest Distances to All Vertices ({Object.keys(result.all_distances || {}).length})</span>
          </span>
          {showAllDistances ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAllDistances && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Vertex / Location</th>
                  <th className="py-2.5 px-3 font-semibold">Shortest Distance from {result.source?.name}</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {locations.map(loc => {
                  const dist = result.all_distances?.[loc.id.toString()];
                  const isOrigin = loc.id === result.source?.id;
                  const isTarget = loc.id === result.destination?.id;

                  return (
                    <tr
                      key={loc.id}
                      className={isTarget ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold' : ''}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span>{loc.name}</span>
                        {isOrigin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            Source
                          </span>
                        )}
                        {isTarget && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                            Destination
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {dist !== null && dist !== undefined ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {dist} km
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">∞ (Unreachable)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {dist !== null && dist !== undefined ? (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            ✓ Reachable
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-500">
                            Disconnected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accordion: Relaxation Step Log */}
      <div>
        <button
          type="button"
          onClick={() => setShowStepsLog(!showStepsLog)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Algorithm Relaxation Log & Iteration Trace ({result.steps_log?.length ?? 0} events)</span>
          </span>
          {showStepsLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showStepsLog && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1.5 border border-slate-800 animate-in fade-in">
            {result.steps_log?.map((log, idx) => (
              <div
                key={idx}
                className={`py-1 border-b border-slate-900 ${
                  log.type === 'init'
                    ? 'text-amber-400'
                    : log.type === 'visit'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }`}
              >
                <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
