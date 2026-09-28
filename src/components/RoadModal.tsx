import React, { useState, useEffect } from 'react';
import { X, GitFork, Check } from 'lucide-react';
import { LocationItem, RoadItem } from '../types';

interface RoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name: string;
    bidirectional?: boolean;
  }) => Promise<void>;
  locations: LocationItem[];
  initialData?: RoadItem | null;
  isLoading?: boolean;
}

export const RoadModal: React.FC<RoadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  locations,
  initialData,
  isLoading = false
}) => {
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [destId, setDestId] = useState<number | ''>('');
  const [distance, setDistance] = useState('');
  const [roadName, setRoadName] = useState('');
  const [bidirectional, setBidirectional] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setSourceId(initialData.source_location_id);
      setDestId(initialData.destination_location_id);
      setDistance(initialData.distance.toString());
      setRoadName(initialData.road_name || '');
      setBidirectional(false); // When editing single edge, don't auto double-create
    } else {
      if (locations.length >= 2) {
        setSourceId(locations[0].id);
        setDestId(locations[1].id);
      } else {
        setSourceId('');
        setDestId('');
      }
      setDistance('3.5');
      setRoadName('');
      setBidirectional(true);
    }
    setErrors({});
  }, [initialData, isOpen, locations]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!sourceId) {
      newErrors.source = 'Source location is required';
    }
    if (!destId) {
      newErrors.destination = 'Destination location is required';
    }
    if (sourceId && destId && sourceId === destId) {
      newErrors.destination = 'Source and destination cannot be the same location';
    }
    const dist = parseFloat(distance);
    if (isNaN(dist) || dist <= 0) {
      newErrors.distance = 'Distance must be a positive number greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      source_location_id: Number(sourceId),
      destination_location_id: Number(destId),
      distance: parseFloat(distance),
      road_name: roadName.trim() || 'Connected Road',
      bidirectional
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Road Connection (Edge)' : 'Add New Road (Edge & Weight)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Source Location *
              </label>
              <select
                value={sourceId}
                onChange={e => setSourceId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.source && <p className="text-xs text-rose-500 mt-1">{errors.source}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Destination Location *
              </label>
              <select
                value={destId}
                onChange={e => setDestId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.destination && <p className="text-xs text-rose-500 mt-1">{errors.destination}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Distance / Weight (km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 4.5"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.distance
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.distance && <p className="text-xs text-rose-500 mt-1">{errors.distance}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Road / Highway Name
              </label>
              <input
                type="text"
                value={roadName}
                onChange={e => setRoadName(e.target.value)}
                placeholder="e.g. Grand Avenue, Highway 101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {!initialData && (
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={bidirectional}
                  onChange={e => setBidirectional(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Bidirectional Road (create both directions simultaneously)</span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : initialData ? 'Update Road' : 'Create Road'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
