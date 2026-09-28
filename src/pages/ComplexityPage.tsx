import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Clock,
  Calculator,
  BarChart3,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { LocationItem, RoadItem } from '../types';

interface ComplexityPageProps {
  locations: LocationItem[];
  roads: RoadItem[];
}

export const ComplexityPage: React.FC<ComplexityPageProps> = ({
  locations,
  roads
}) => {
  // Interactive Simulator inputs
  const [simV, setSimV] = useState<number>(Math.max(locations.length, 12));
  const [simE, setSimE] = useState<number>(Math.max(roads.length, 34));

  // Calculations for simulator
  const adjMatrixSpace = simV * simV; // V² cells
  const adjListSpace = simV + 2 * simE; // V headers + 2E edge elements (undirected)

  const linearArrayTimeOps = simV * simV + simE; // V² + E
  const minHeapTimeOps = Math.round((simV + simE) * (Math.log2(simV) || 1)); // (V + E) log2 V
  const fibonacciHeapTimeOps = Math.round(simE + simV * (Math.log2(simV) || 1)); // E + V log2 V

  const timeRatio = (linearArrayTimeOps / (minHeapTimeOps || 1)).toFixed(1);
  const spaceRatio = (adjMatrixSpace / (adjListSpace || 1)).toFixed(1);

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            DAA Asymptotic Analysis
          </span>
          <span className="text-xs text-slate-400">Design & Analysis of Algorithms</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Time & Space Complexity Analysis
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Comprehensive asymptotic complexity comparison between priority queue representations, graph storage structures, and interactive algorithmic operation calculator.
        </p>

        {/* Current Database Metrics Badge */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Current Graph Size:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">|V| = {locations.length} Vertices</span>
            <span>,</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">|E| = {roads.length} Edges</span>
          </div>
          <div className="text-slate-400">
            Density: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {locations.length > 1
                ? ((2 * roads.length) / (locations.length * (locations.length - 1))).toFixed(2)
                : '0.00'} (Sparse Graph)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Complexity Calculator Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              <span>Interactive Complexity Simulator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust graph parameters |V| and |E| to simulate asymptotic performance differences between implementation strategies.
            </p>
          </div>
          <button
            onClick={() => {
              setSimV(locations.length);
              setSimE(roads.length);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Reset to Current DB
          </button>
        </div>

        {/* Sliders & Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Number of Vertices |V|:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">{simV}</span>
            </div>
            <input
              type="range"
              min="4"
              max="2000"
              value={simV}
              onChange={e => setSimV(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>4</span>
              <span>500</span>
              <span>1000</span>
              <span>2000</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Number of Edges |E|:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-bold">{simE}</span>
            </div>
            <input
              type="range"
              min="4"
              max="10000"
              value={simE}
              onChange={e => setSimE(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>4</span>
              <span>2500</span>
              <span>5000</span>
              <span>10000</span>
            </div>
          </div>
        </div>

        {/* Comparative Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Comparison */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Estimated Time Operations</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Binary Min-Heap</span>
                  <div className="text-[10px] text-slate-400 font-mono">O((V + E) log V)</div>
                </div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {minHeapTimeOps.toLocaleString()} ops
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Linear Array</span>
                  <div className="text-[10px] text-slate-400 font-mono">O(V² + E)</div>
                </div>
                <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {linearArrayTimeOps.toLocaleString()} ops
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
              Min-Heap is approx <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{timeRatio}x</strong> faster than standard linear array search for this graph size!
            </div>
          </div>

          {/* Space Comparison */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Memory Storage Requirements</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Adjacency List</span>
                  <div className="text-[10px] text-slate-400 font-mono">O(V + E)</div>
                </div>
                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {adjListSpace.toLocaleString()} units
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Adjacency Matrix</span>
                  <div className="text-[10px] text-slate-400 font-mono">O(V²)</div>
                </div>
                <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {adjMatrixSpace.toLocaleString()} units
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
              Adjacency List saves <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{spaceRatio}x</strong> memory compared to full 2D matrix allocation!
            </div>
          </div>
        </div>
      </div>

      {/* Asymptotic Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span>Priority Queue Implementation Trade-offs</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Priority Queue Type</th>
                <th className="py-3 px-4">Extract-Min Time</th>
                <th className="py-3 px-4">Decrease-Key Time</th>
                <th className="py-3 px-4">Total Dijkstra Time</th>
                <th className="py-3 px-4">Best Graph Archetype</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Unsorted Array (Linear Search)
                </td>
                <td className="py-3 px-4 text-rose-600 dark:text-rose-400">O(V)</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">O(1)</td>
                <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">O(V² + E) = O(V²)</td>
                <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">Dense Graphs (E ≈ V²)</td>
              </tr>
              <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30">
                <td className="py-3 px-4 font-sans font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                  <span>Binary Min-Heap (SmartRoute)</span>
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-600 text-white">Implemented</span>
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">O(log V)</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">O(log V)</td>
                <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-300">O((V + E) log V)</td>
                <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">Sparse Graphs & GPS Networks (E &lt;&lt; V²)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-slate-100">
                  Fibonacci Heap (Theoretical)
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">O(log V) amortized</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">O(1) amortized</td>
                <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">O(E + V log V)</td>
                <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">Massive Scale Sparse Graphs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Space Breakdown Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Adjacency List: O(V + E)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            An array of size <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">|V|</code> where each cell contains a linked list of directed edges originating from that vertex. Total pointers stored across all linked lists is <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">|E|</code> (or <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">2|E|</code> for bidirectional roads).
          </p>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-slate-800 dark:text-slate-200">Auxiliary Dijkstra Space:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code className="font-mono">dist[]</code> array: O(V)</li>
              <li><code className="font-mono">parent[]</code> array: O(V)</li>
              <li><code className="font-mono">visited[]</code> boolean array: O(V)</li>
              <li><code className="font-mono">MinHeap Q</code> elements: O(V)</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>Adjacency Matrix: O(V²)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A 2D array of dimensions <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">|V| × |V|</code>. Every possible pair of vertices has a dedicated entry storing edge weight, zero, or infinity.
          </p>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-slate-800 dark:text-slate-200">Key Trade-offs:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Immediate O(1) edge lookup between any two vertices.</li>
              <li>Consumes massive memory when V is large (e.g., V = 10,000 vertices requires 100,000,000 cells).</li>
              <li>Inefficient for sparse road graphs where most entries are ∞.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
