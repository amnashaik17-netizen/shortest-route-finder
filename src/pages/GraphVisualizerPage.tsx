import React, { useState, useEffect } from 'react';
import {
  Share2,
  Table,
  List,
  Compass,
  Info,
  Maximize2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { LocationItem, RoadItem, GraphData, ShortestPathResult } from '../types';
import { api } from '../services/api';

interface GraphVisualizerPageProps {
  locations: LocationItem[];
  roads: RoadItem[];
  routeResult: ShortestPathResult | null;
  onCalculateRoute: (sourceId: number, destId: number) => Promise<void>;
  onAddLocation?: (data: { name: string; latitude: number; longitude: number; description: string }) => Promise<void>;
  onAddRoad?: (data: { source_location_id: number; destination_location_id: number; distance: number; road_name: string; bidirectional: boolean }) => Promise<void>;
  onClearCanvas?: () => Promise<void>;
}

export const GraphVisualizerPage: React.FC<GraphVisualizerPageProps> = ({
  locations,
  roads,
  routeResult,
  onCalculateRoute,
  onAddLocation,
  onAddRoad,
  onClearCanvas
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'adj_list' | 'adj_matrix'>('canvas');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  useEffect(() => {
    const fetchGraph = async () => {
      setIsLoadingGraph(true);
      try {
        const data = await api.getGraph();
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load graph data:', err);
      } finally {
        setIsLoadingGraph(false);
      }
    };
    fetchGraph();
  }, [locations, roads]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              DAA Graph Theory
            </span>
            <span className="text-xs text-slate-400">
              |V| = {locations.length}, |E| = {roads.length}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Graph Visualizer & Structural Representation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explore interactive node drag-and-drop, zoom/pan navigation, and inspect real-time Adjacency List & Matrix data structures.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canvas'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Visual Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('adj_list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'adj_list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Adjacency List O(V+E)</span>
          </button>

          <button
            onClick={() => setActiveTab('adj_matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'adj_matrix'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Adjacency Matrix O(V²)</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'canvas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>Full Interactive Network Canvas</span>
            </h3>
            <span className="text-xs text-slate-400">
              Drag nodes • Scroll to Zoom • Drag background to Pan • Click node to set route
            </span>
          </div>

          <GraphViewer
            locations={locations}
            roads={roads}
            sourceId={routeResult?.source?.id}
            destinationId={routeResult?.destination?.id}
            routeResult={routeResult}
            onSelectSource={id => {
              if (routeResult?.destination?.id && routeResult.destination.id !== id) {
                onCalculateRoute(id, routeResult.destination.id);
              }
            }}
            onSelectDestination={id => {
              if (routeResult?.source?.id && routeResult.source.id !== id) {
                onCalculateRoute(routeResult.source.id, id);
              }
            }}
            onAddLocationDirectly={onAddLocation}
            onAddRoadDirectly={onAddRoad}
            onClearCanvas={onClearCanvas}
            height="620px"
            showControls={true}
          />
        </div>
      )}

      {/* Adjacency List Representation Tab */}
      {activeTab === 'adj_list' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-500" />
                  <span>Adjacency List Representation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Optimal representation for sparse graphs: Stores vertices mapped to linked lists of adjacent outgoing edges and weights.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono text-xs font-bold">
                Space Complexity: O(V + E)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {graphData?.adjacency_list ? (
              (Object.entries(graphData.adjacency_list) as [string, { node: number; weight: number; road_name: string }[]][]).map(([vertexId, edges]) => {
                const loc = locations.find(l => l.id.toString() === vertexId);
                return (
                  <div
                    key={vertexId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center gap-3 text-xs"
                  >
                    {/* Head Vertex */}
                    <div className="flex items-center gap-2 md:w-64 shrink-0">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-[11px]">
                        #{vertexId}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {loc?.name || `Location ${vertexId}`}
                      </span>
                    </div>

                    <ArrowRight className="hidden md:block w-4 h-4 text-slate-400 shrink-0" />

                    {/* Linked List Nodes */}
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {edges.length === 0 ? (
                        <span className="text-slate-400 italic font-mono">
                          NULL (No outgoing edges)
                        </span>
                      ) : (
                        edges.map((edge, idx) => {
                          const targetLoc = locations.find(l => l.id === edge.node);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs"
                            >
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {targetLoc?.name || `Location ${edge.node}`}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                {edge.weight} km
                              </span>
                              {edge.road_name && (
                                <span className="text-[10px] text-slate-400 italic">
                                  ({edge.road_name})
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Loading graph data...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjacency Matrix Representation Tab */}
      {activeTab === 'adj_matrix' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Table className="w-5 h-5 text-emerald-500" />
                  <span>Adjacency Matrix Representation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  2D table representation: Matrix entry <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">M[u][v] = weight</code>, or <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">0</code> along diagonal, or <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">∞</code> when no direct edge connects them.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold">
                Space Complexity: O(V²)
              </div>
            </div>
          </div>

          {graphData?.adjacency_matrix ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold">
                    <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-left">
                      Origin \ Target
                    </th>
                    {graphData.adjacency_matrix.headers.map((h, i) => (
                      <th
                        key={i}
                        className="py-2.5 px-3 min-w-[70px] border-r border-slate-200 dark:border-slate-700 truncate"
                        title={h}
                      >
                        {h.length > 8 ? h.substring(0, 7) + '…' : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {graphData.adjacency_matrix.matrix.map((row, rIdx) => {
                    const headerName = graphData.adjacency_matrix.headers[rIdx];
                    return (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-sans font-bold text-left bg-slate-50 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                          {headerName}
                        </td>
                        {row.map((val, cIdx) => {
                          const isSelf = rIdx === cIdx;
                          const hasEdge = val !== null && !isSelf;
                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-3 border-r border-slate-100 dark:border-slate-800/60 ${
                                isSelf
                                  ? 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400'
                                  : hasEdge
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            >
                              {isSelf ? '0' : val !== null ? `${val}` : '∞'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Loading matrix data...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
