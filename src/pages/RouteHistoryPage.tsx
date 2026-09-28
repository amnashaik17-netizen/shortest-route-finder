import React, { useState } from 'react';
import {
  History,
  Trash2,
  Navigation,
  Search,
  Clock,
  ArrowRight,
  Filter,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { RouteHistoryItem, ActiveTab } from '../types';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface RouteHistoryPageProps {
  history: RouteHistoryItem[];
  onDeleteHistoryItem: (id: number) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onReplayRoute: (sourceId: number, destId: number) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
}

export const RouteHistoryPage: React.FC<RouteHistoryPageProps> = ({
  history,
  onDeleteHistoryItem,
  onClearHistory,
  onReplayRoute,
  setActiveTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.source_name.toLowerCase().includes(term) ||
      item.destination_name.toLowerCase().includes(term) ||
      item.shortest_path.toLowerCase().includes(term) ||
      item.id.toString().includes(term)
    );
  });

  const handleDeleteItem = async () => {
    if (deleteId === null) return;
    setIsProcessing(true);
    try {
      await onDeleteHistoryItem(deleteId);
      setDeleteId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    setIsProcessing(true);
    try {
      await onClearHistory();
      setShowClearConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Persistent SQLite Storage
            </span>
            <span className="text-xs text-slate-400">
              Total Logged Searches: {history.length}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Route Calculation History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit log of previously executed Dijkstra shortest-path calculations, execution times, and routes.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search history by location name or path..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {history.length === 0
              ? 'No route calculations recorded yet. Go to Route Finder to compute your first route!'
              : 'No history records match your search criteria.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.source_name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.destination_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {item.shortest_distance} km
                    </div>
                    <button
                      onClick={() => {
                        onReplayRoute(item.source_location_id, item.destination_location_id);
                        setActiveTab('route-finder');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                      title="Load on map"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>View Route</span>
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 mb-2.5">
                  Path: {item.shortest_path}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.calculated_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Exec: {item.execution_time_ms} ms</span>
                  </div>
                  <div>Vertices: {item.vertices_count}</div>
                  <div>Edges: {item.edges_count}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Item Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title="Delete History Record?"
        message="Are you sure you want to remove this route calculation log from the database?"
        confirmText="Delete"
        isDestructive={true}
        isLoading={isProcessing}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteId(null)}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear All Route History?"
        message="This will delete all saved shortest route calculation records from the SQLite database. This action cannot be undone."
        confirmText="Clear All History"
        isDestructive={true}
        isLoading={isProcessing}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
