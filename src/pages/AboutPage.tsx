import React from 'react';
import {
  Compass,
  BookOpen,
  Cpu,
  Layers,
  CheckCircle2,
  Database,
  Navigation,
  Globe,
  Code2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>DAA Academic Capstone Project</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          SmartRoute – GPS Shortest Route Finder
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Developed as an academic DAA (Design and Analysis of Algorithms) project demonstrating practical application of Dijkstra's Algorithm on weighted graph networks.
        </p>
      </div>

      {/* Academic Specification Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Project Academic Specifications (Section 29)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Project Name</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              SmartRoute – GPS Shortest Route Finder
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Academic Subject</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Design and Analysis of Algorithms (DAA)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Core Algorithm</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Dijkstra's Algorithm (from scratch)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Theoretical Concept</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Single Source Shortest Path (SSSP) & Graph Theory
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Programming Stack</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              TypeScript, Node.js, Express, React, Tailwind CSS
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Database Storage</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Persistent SQLite (smartroute.db)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Time Complexity</span>
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
              O((V + E) log V) via Binary Min-Heap
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block mb-0.5">Space Complexity</span>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
              O(V + E) via Adjacency List
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">
          <strong>Project Purpose:</strong> Developed as an academic DAA project to bridge theoretical algorithm design and practical software engineering. The application provides an end-to-end simulation of satellite GPS navigation engines, showing how shortest path algorithms drive Google Maps, Uber dispatching, and telecommunication packet routing.
        </div>
      </div>

      {/* Real-World Relevance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Real-World Engineering Applications</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-500" />
              <span>GPS Turn-by-Turn Navigation</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Google Maps, Apple Maps, and in-car navigation systems model continental road networks as graphs and compute optimal routing with Dijkstra variants.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>Internet Routing (OSPF / IS-IS)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Link-state network routing protocols utilize Dijkstra's algorithm inside backbone IP routers to find minimal latency packet forwarding paths.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Supply Chain & Logistics</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Autonomous delivery drones, freight logistics dispatching, and public transit scheduling optimize fuel and time costs with weighted shortest paths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
