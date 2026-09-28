import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Compass,
  ArrowUpDown
} from 'lucide-react';
import { LocationItem, RoadItem } from '../types';
import { LocationModal } from '../components/LocationModal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface LocationsPageProps {
  locations: LocationItem[];
  roads: RoadItem[];
  onCreateLocation: (data: { name: string; latitude: number; longitude: number; description: string }) => Promise<void>;
  onUpdateLocation: (id: number, data: { name: string; latitude: number; longitude: number; description: string }) => Promise<void>;
  onDeleteLocation: (id: number) => Promise<void>;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  locations,
  roads,
  onCreateLocation,
  onUpdateLocation,
  onDeleteLocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute connected road counts per location
  const roadCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const r of roads) {
      counts[r.source_location_id] = (counts[r.source_location_id] || 0) + 1;
      counts[r.destination_location_id] = (counts[r.destination_location_id] || 0) + 1;
    }
    return counts;
  }, [roads]);

  const filtered = locations.filter(loc => {
    const term = searchTerm.toLowerCase();
    return (
      loc.name.toLowerCase().includes(term) ||
      loc.description?.toLowerCase().includes(term) ||
      loc.id.toString().includes(term)
    );
  });

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: LocationItem) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        await onUpdateLocation(editingLocation.id, data);
      } else {
        await onCreateLocation(data);
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
      await onDeleteLocation(deleteId);
      setDeleteId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const locToDelete = locations.find(l => l.id === deleteId);
  const connectedRoadsCount = deleteId ? roadCounts[deleteId] || 0 : 0;

  // Real-time quick inline form state
  const [quickName, setQuickName] = useState('');
  const [quickLat, setQuickLat] = useState('28.6200');
  const [quickLon, setQuickLon] = useState('77.2100');
  const [quickDesc, setQuickDesc] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    setIsQuickAdding(true);
    try {
      await onCreateLocation({
        name: quickName.trim(),
        latitude: parseFloat(quickLat) || 28.62,
        longitude: parseFloat(quickLon) || 77.21,
        description: quickDesc.trim() || 'Custom real-time vertex'
      });
      setQuickName('');
      // randomize slightly for subsequent additions so coordinates don't collide
      setQuickLat((28.62 + (Math.random() - 0.5) * 0.05).toFixed(4));
      setQuickLon((77.21 + (Math.random() - 0.5) * 0.05).toFixed(4));
      setQuickDesc('');
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Graph Vertices (V)
            </span>
            <span className="text-xs text-slate-400">Total: {locations.length} Locations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Locations (Vertices)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add, update, or remove physical points of interest or topological vertices in the SQLite database.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Full Modal Form</span>
        </button>
      </div>

      {/* Real-Time Quick Add Card */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ⚡ Real-Time Quick Add Location
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Saves directly to SQLite database</span>
        </div>

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              value={quickName}
              onChange={e => setQuickName(e.target.value)}
              placeholder="Location Name (e.g. Science Park)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              step="0.0001"
              required
              value={quickLat}
              onChange={e => setQuickLat(e.target.value)}
              placeholder="Latitude"
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              step="0.0001"
              required
              value={quickLon}
              onChange={e => setQuickLon(e.target.value)}
              placeholder="Longitude"
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              value={quickDesc}
              onChange={e => setQuickDesc(e.target.value)}
              placeholder="Notes / Tags"
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isQuickAdding || !quickName.trim()}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isQuickAdding ? 'Saving...' : 'Add Vertex'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table & Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by location name or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Locations Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Coordinates (Lat / Lon)</th>
                <th className="py-3 px-4">Degree (Roads)</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No locations match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map(loc => (
                  <tr
                    key={loc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{loc.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{loc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {roadCounts[loc.id] || 0} links
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400 text-[11px]">
                      {loc.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(loc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit location"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(loc.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete location"
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

      {/* Add / Edit Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingLocation}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        title="Delete Location (Vertex)?"
        message={
          connectedRoadsCount > 0
            ? `Warning: "${locToDelete?.name}" is currently connected to ${connectedRoadsCount} road(s). Deleting this location will also permanently remove all connected roads in the database.`
            : `Are you sure you want to delete "${locToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Delete Location"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
