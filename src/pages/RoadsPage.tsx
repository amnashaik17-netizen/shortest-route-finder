import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { LocationItem, RoadItem } from '../types';
import { RoadModal } from '../components/RoadModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface RoadsPageProps {
  roads: RoadItem[];
  locations: LocationItem[];
  onCreateRoad: (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name: string;
    bidirectional?: boolean;
  }) => Promise<void>;
  onUpdateRoad: (
    id: number,
    data: {
      source_location_id: number;
      destination_location_id: number;
      distance: number;
      road_name: string;
    }
  ) => Promise<void>;
  onDeleteRoad: (id: number) => Promise<void>;
}

export const RoadsPage: React.FC<RoadsPageProps> = ({
  roads,
  locations,
  onCreateRoad,
  onUpdateRoad,
  onDeleteRoad
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterLoc, setSelectedFilterLoc] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoad, setEditingRoad] = useState<RoadItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const l of locations) {
      map.set(l.id, l.name);
    }
    return map;
  }, [locations]);

  const filtered = roads.filter(road => {
    const term = searchTerm.toLowerCase();
    const sourceName = road.source_name || locMap.get(road.source_location_id) || '';
    const destName = road.destination_name || locMap.get(road.destination_location_id) || '';
    const roadName = road.road_name || '';

    const matchesTerm =
      sourceName.toLowerCase().includes(term) ||
      destName.toLowerCase().includes(term) ||
      roadName.toLowerCase().includes(term) ||
      road.id.toString().includes(term);

    const matchesFilter =
      selectedFilterLoc === 'all' ||
      road.source_location_id.toString() === selectedFilterLoc ||
      road.destination_location_id.toString() === selectedFilterLoc;

    return matchesTerm && matchesFilter;
  });

  const handleOpenCreate = () => {
    setEditingRoad(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (road: RoadItem) => {
    setEditingRoad(road);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name: string;
    bidirectional?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingRoad) {
        await onUpdateRoad(editingRoad.id, {
          source_location_id: data.source_location_id,
          destination_location_id: data.destination_location_id,
          distance: data.distance,
          road_name: data.road_name
        });
      } else {
        await onCreateRoad(data);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    setIsSubmitting(true);
    try {
      await onDeleteRoad(deleteId);
      setDeleteId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roadToDelete = roads.find(r => r.id === deleteId);

  // Real-time quick inline road form state
  const [quickSrcId, setQuickSrcId] = useState<number | ''>('');
  const [quickDstId, setQuickDstId] = useState<number | ''>('');
  const [quickDist, setQuickDist] = useState<string>('3.5');
  const [quickRoadName, setQuickRoadName] = useState<string>('');
  const [quickBidi, setQuickBidi] = useState<boolean>(true);
  const [isQuickConnecting, setIsQuickConnecting] = useState<boolean>(false);

  const handleQuickRoadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSrcId || !quickDstId || quickSrcId === quickDstId) return;
    const dist = parseFloat(quickDist);
    if (isNaN(dist) || dist <= 0) return;

    setIsQuickConnecting(true);
    try {
      const src = locations.find(l => l.id === Number(quickSrcId));
      const dst = locations.find(l => l.id === Number(quickDstId));
      await onCreateRoad({
        source_location_id: Number(quickSrcId),
        destination_location_id: Number(quickDstId),
        distance: dist,
        road_name: quickRoadName.trim() || `${src?.name} - ${dst?.name}`,
        bidirectional: quickBidi
      });
      setQuickRoadName('');
      setQuickDist((Math.round((Math.random() * 5 + 2) * 10) / 10).toString());
    } finally {
      setIsQuickConnecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Graph Edges (E)
            </span>
            <span className="text-xs text-slate-400">Total: {roads.length} Directed Roads</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Roads (Edges & Weights)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure road segments, highway corridors, and non-negative distance weights used by Dijkstra's algorithm.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={locations.length < 2}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Full Modal Form</span>
        </button>
      </div>

      {/* Real-Time Quick Connect Card */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ⚡ Real-Time Quick Connect Road
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Creates edges directly in SQLite database</span>
        </div>

        {locations.length < 2 ? (
          <p className="text-xs text-amber-500">
            Please add at least 2 locations first before creating roads.
          </p>
        ) : (
          <form onSubmit={handleQuickRoadSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
            <div className="sm:col-span-3">
              <select
                required
                value={quickSrcId}
                onChange={e => setQuickSrcId(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Origin...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                required
                value={quickDstId}
                onChange={e => setQuickDstId(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Destination...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id} disabled={l.id === Number(quickSrcId)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quickDist}
                  onChange={e => setQuickDist(e.target.value)}
                  placeholder="Distance"
                  className="w-full pl-2.5 pr-7 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">
                  km
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <input
                type="text"
                value={quickRoadName}
                onChange={e => setQuickRoadName(e.target.value)}
                placeholder="Road Name (opt)"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isQuickConnecting || !quickSrcId || !quickDstId || quickSrcId === quickDstId}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isQuickConnecting ? 'Connecting...' : 'Connect'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Table & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by road name or connected locations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter by Location */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFilterLoc}
              onChange={e => setSelectedFilterLoc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Locations (Filter)</option>
              {locations.map(l => (
                <option key={l.id} value={l.id.toString()}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roads Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Road / Highway Name</th>
                <th className="py-3 px-4">Source Vertex</th>
                <th className="py-3 px-4">Destination Vertex</th>
                <th className="py-3 px-4">Weight / Distance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No roads match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map(road => (
                  <tr
                    key={road.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{road.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {road.road_name || 'Road Segment'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {road.source_name || locMap.get(road.source_location_id) || `ID ${road.source_location_id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {road.destination_name || locMap.get(road.destination_location_id) || `ID ${road.destination_location_id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {road.distance} km
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(road)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit road"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(road.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete road"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Road Modal */}
      <RoadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        locations={locations}
        initialData={editingRoad}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title="Delete Road Connection?"
        message={`Are you sure you want to delete this road segment (${roadToDelete?.source_name} → ${roadToDelete?.destination_name})?`}
        confirmText="Delete Road"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
