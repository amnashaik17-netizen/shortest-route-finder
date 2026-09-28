import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Navigation,
  MapPin,
  Compass,
  Layers,
  Plus,
  Link,
  Trash2,
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';
import { LocationItem, RoadItem, ShortestPathResult, StepLogItem } from '../types';

export type GraphInteractMode = 'navigate' | 'add-node' | 'add-edge';

interface GraphViewerProps {
  locations: LocationItem[];
  roads: RoadItem[];
  sourceId?: number | null;
  destinationId?: number | null;
  routeResult?: ShortestPathResult | null;
  onSelectSource?: (id: number) => void;
  onSelectDestination?: (id: number) => void;
  onAddLocationDirectly?: (data: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  }) => Promise<void>;
  onAddRoadDirectly?: (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name: string;
    bidirectional: boolean;
  }) => Promise<void>;
  onClearCanvas?: () => Promise<void>;
  height?: string | number;
  showControls?: boolean;
  isCompact?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({
  locations,
  roads,
  sourceId,
  destinationId,
  routeResult,
  onSelectSource,
  onSelectDestination,
  onAddLocationDirectly,
  onAddRoadDirectly,
  onClearCanvas,
  height = '580px',
  showControls = true,
  isCompact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Interaction Mode: 'navigate' (Select source/destination), 'add-node' (click canvas to place location), 'add-edge' (click 2 nodes to connect)
  const [interactMode, setInteractMode] = useState<GraphInteractMode>('navigate');

  // Layout mode: 'topological' or 'geographic' (lat/long GPS grid)
  const [layoutMode, setLayoutMode] = useState<'topological' | 'geographic'>('topological');

  // Node positions map: location_id -> { x, y }
  const [nodePositions, setNodePositions] = useState<Record<number, NodePosition>>({});

  // Viewport transform: Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);

  // Hover state
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<number | null>(null);

  // Selected node popup modal for setting source/dest
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Road connection interactive state
  const [connectFirstNodeId, setConnectFirstNodeId] = useState<number | null>(null);

  // Real-time Add Node Dialog State
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [newNodeCoords, setNewNodeCoords] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [isSubmittingNode, setIsSubmittingNode] = useState(false);

  // Real-time Add Road Dialog State
  const [isAddRoadDialogOpen, setIsAddRoadDialogOpen] = useState(false);
  const [newRoadSrc, setNewRoadSrc] = useState<LocationItem | null>(null);
  const [newRoadDst, setNewRoadDst] = useState<LocationItem | null>(null);
  const [newRoadDistance, setNewRoadDistance] = useState<string>('3.5');
  const [newRoadName, setNewRoadName] = useState<string>('');
  const [newRoadBidi, setNewRoadBidi] = useState<boolean>(true);
  const [isSubmittingRoad, setIsSubmittingRoad] = useState(false);

  // Algorithm Step-by-Step Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [animationSpeed, setAnimationSpeed] = useState<number>(600); // ms per step

  // Compute unique edges to avoid double rendering bidirectional roads
  const uniqueEdges = useMemo(() => {
    const seen = new Set<string>();
    const list: {
      id: number;
      u: number;
      v: number;
      distance: number;
      name: string;
      isBidirectional: boolean;
    }[] = [];

    for (const r of roads) {
      const u = r.source_location_id;
      const v = r.destination_location_id;
      const key1 = `${u}-${v}`;
      const key2 = `${v}-${u}`;

      if (!seen.has(key1) && !seen.has(key2)) {
        seen.add(key1);
        seen.add(key2);
        const hasReverse = roads.some(
          other => other.source_location_id === v && other.destination_location_id === u
        );
        list.push({
          id: r.id,
          u,
          v,
          distance: r.distance,
          name: r.road_name,
          isBidirectional: hasReverse
        });
      }
    }
    return list;
  }, [roads]);

  // Set of edge keys in the shortest path
  const shortestPathEdges = useMemo(() => {
    const set = new Set<string>();
    if (routeResult?.path && routeResult.path.length > 1) {
      for (let i = 0; i < routeResult.path.length - 1; i++) {
        const u = routeResult.path[i];
        const v = routeResult.path[i + 1];
        set.add(`${u}-${v}`);
        set.add(`${v}-${u}`);
      }
    }
    return set;
  }, [routeResult]);

  // Compute step-by-step visited nodes & relaxed edges up to currentStepIndex
  const animatedState = useMemo(() => {
    if (!routeResult?.steps_log || currentStepIndex < 0) {
      return {
        visitedSet: new Set<number>(),
        relaxedEdges: new Set<string>(),
        currentActiveNode: null as number | null,
        currentLogMessage: ''
      };
    }

    const visitedSet = new Set<number>();
    const relaxedEdges = new Set<string>();
    let currentActiveNode: number | null = null;
    let currentLogMessage = '';

    const logs = routeResult.steps_log.slice(0, currentStepIndex + 1);
    for (const step of logs) {
      if (step.type === 'visit' && step.current_node !== undefined) {
        visitedSet.add(step.current_node);
        currentActiveNode = step.current_node;
      }
      if (step.type === 'relax' && step.edge) {
        relaxedEdges.add(`${step.edge[0]}-${step.edge[1]}`);
        relaxedEdges.add(`${step.edge[1]}-${step.edge[0]}`);
      }
      currentLogMessage = step.message;
    }

    return {
      visitedSet,
      relaxedEdges,
      currentActiveNode,
      currentLogMessage
    };
  }, [routeResult, currentStepIndex]);

  // Layout calculation
  useEffect(() => {
    if (locations.length === 0) return;

    const width = 800;
    const height = 550;
    const padding = 70;

    const newPositions: Record<number, NodePosition> = {};

    if (layoutMode === 'geographic') {
      const lats = locations.map(l => l.latitude);
      const lons = locations.map(l => l.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      const latRange = maxLat - minLat || 0.01;
      const lonRange = maxLon - minLon || 0.01;

      for (const loc of locations) {
        // Higher latitude = higher on canvas (smaller y)
        const normX = (loc.longitude - minLon) / lonRange;
        const normY = 1 - (loc.latitude - minLat) / latRange;

        newPositions[loc.id] = {
          x: Math.round(padding + normX * (width - 2 * padding)),
          y: Math.round(padding + normY * (height - 2 * padding))
        };
      }
    } else {
      // Topological Circular Layout
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusX = (width - 2 * padding) / 2.2;
      const radiusY = (height - 2 * padding) / 2.2;

      locations.forEach((loc, idx) => {
        // Keep existing drag position if available
        if (nodePositions[loc.id]) {
          newPositions[loc.id] = nodePositions[loc.id];
          return;
        }
        const angle = (idx / locations.length) * 2 * Math.PI - Math.PI / 2;
        newPositions[loc.id] = {
          x: Math.round(centerX + radiusX * Math.cos(angle)),
          y: Math.round(centerY + radiusY * Math.sin(angle))
        };
      });
    }

    setNodePositions(newPositions);
  }, [locations, layoutMode]);

  // Algorithm Step Animation Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating && routeResult?.steps_log) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= routeResult.steps_log.length - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, animationSpeed);
    }
    return () => clearInterval(timer);
  }, [isAnimating, routeResult, animationSpeed]);

  // Pan and Click handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId !== null) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (e.clientX - rect.left - pan.x) / zoom;
      const svgY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: Math.round(svgX), y: Math.round(svgY) }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  // Canvas Click (Used for Add Node in real-time)
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning || draggedNodeId !== null) return;

    if (interactMode === 'add-node' && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = Math.round((e.clientX - rect.left - pan.x) / zoom);
      const clickY = Math.round((e.clientY - rect.top - pan.y) / zoom);

      // Estimate real GPS latitude and longitude based on canvas offset
      const lat = Number((28.62 + (275 - clickY) * 0.0004).toFixed(4));
      const lng = Number((77.21 + (clickX - 400) * 0.0004).toFixed(4));

      setNewNodeCoords({ x: clickX, y: clickY, lat, lng });
      setNewNodeName(`Location ${locations.length + 1}`);
      setNewNodeDesc('Real-time custom network vertex');
      setIsAddNodeDialogOpen(true);
    } else if (interactMode === 'add-edge') {
      // Cancel pending connection if user clicked empty space
      if (connectFirstNodeId !== null) {
        setConnectFirstNodeId(null);
      }
    }
  };

  // Handle Node Click depending on current interact mode
  const handleNodeClick = (loc: LocationItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (interactMode === 'add-edge') {
      if (connectFirstNodeId === null) {
        // Pick first node
        setConnectFirstNodeId(loc.id);
      } else if (connectFirstNodeId === loc.id) {
        // Deselect if clicked again
        setConnectFirstNodeId(null);
      } else {
        // Second node picked! Open connection dialog
        const src = locations.find(l => l.id === connectFirstNodeId);
        if (src) {
          setNewRoadSrc(src);
          setNewRoadDst(loc);

          // Auto-calculate distance based on coordinates if available
          const p1 = nodePositions[src.id];
          const p2 = nodePositions[loc.id];
          let dist = 3.5;
          if (p1 && p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const pixelDist = Math.sqrt(dx * dx + dy * dy);
            dist = Number(Math.max(1, Math.round((pixelDist / 50) * 10) / 10).toFixed(1));
          }
          setNewRoadDistance(dist.toString());
          setNewRoadName(`Route ${src.name.substring(0, 3)}-${loc.name.substring(0, 3)}`);
          setIsAddRoadDialogOpen(true);
        }
        setConnectFirstNodeId(null);
      }
      return;
    }

    if (interactMode === 'navigate') {
      // Smart routing assignment: if source is empty, set source. If source is filled and dest is empty, set dest.
      if (!sourceId || sourceId === loc.id) {
        if (onSelectSource) onSelectSource(loc.id);
      } else if (!destinationId || destinationId === loc.id) {
        if (onSelectDestination) onSelectDestination(loc.id);
      } else {
        // If both already set, open quick selector popover
        setSelectedNodeId(loc.id);
      }
    }
  };

  // Submit Real-time Location Creation
  const handleSaveNewNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeCoords || !onAddLocationDirectly) return;

    setIsSubmittingNode(true);
    try {
      await onAddLocationDirectly({
        name: newNodeName.trim(),
        latitude: newNodeCoords.lat,
        longitude: newNodeCoords.lng,
        description: newNodeDesc.trim()
      });
      setIsAddNodeDialogOpen(false);
      setNewNodeCoords(null);
    } finally {
      setIsSubmittingNode(false);
    }
  };

  // Submit Real-time Road Creation
  const handleSaveNewRoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadSrc || !newRoadDst || !onAddRoadDirectly) return;

    const dist = parseFloat(newRoadDistance);
    if (isNaN(dist) || dist <= 0) return;

    setIsSubmittingRoad(true);
    try {
      await onAddRoadDirectly({
        source_location_id: newRoadSrc.id,
        destination_location_id: newRoadDst.id,
        distance: dist,
        road_name: newRoadName.trim() || `${newRoadSrc.name} - ${newRoadDst.name}`,
        bidirectional: newRoadBidi
      });
      setIsAddRoadDialogOpen(false);
      setNewRoadSrc(null);
      setNewRoadDst(null);
    } finally {
      setIsSubmittingRoad(false);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setConnectFirstNodeId(null);
  };

  const startAnimation = () => {
    if (!routeResult?.steps_log || routeResult.steps_log.length === 0) return;
    setCurrentStepIndex(0);
    setIsAnimating(true);
  };

  const pauseAnimation = () => {
    setIsAnimating(false);
  };

  const stepForward = () => {
    if (!routeResult?.steps_log) return;
    setIsAnimating(false);
    setCurrentStepIndex(prev => Math.min(prev + 1, routeResult.steps_log.length - 1));
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStepIndex(-1);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden select-none shadow-xs"
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background GPS grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.35) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Floating Bar: Interactive Modes & Canvas Controls */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Real-time Interaction Mode Selector */}
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md text-xs">
            <button
              onClick={() => {
                setInteractMode('navigate');
                setConnectFirstNodeId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                interactMode === 'navigate'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Click nodes to select origin & destination for Dijkstra calculation"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route Select</span>
            </button>

            {onAddLocationDirectly && (
              <button
                onClick={() => {
                  setInteractMode('add-node');
                  setConnectFirstNodeId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  interactMode === 'add-node'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Click anywhere on canvas to place a new location pin in real-time"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Node</span>
              </button>
            )}

            {onAddRoadDirectly && (
              <button
                onClick={() => {
                  setInteractMode('add-edge');
                  setConnectFirstNodeId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  interactMode === 'add-edge'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Click two nodes in sequence to draw and weight a road between them"
              >
                <Link className="w-3.5 h-3.5" />
                <span>+ Connect Road</span>
              </button>
            )}
          </div>

          {/* Right: Layout Toggle & Zoom Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-md">
              <button
                onClick={() => setLayoutMode(layoutMode === 'topological' ? 'geographic' : 'topological')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition-colors"
                title="Toggle between Topological Drag layout and GPS coordinate grid"
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>{layoutMode === 'topological' ? 'Topological' : 'GPS Grid'}</span>
              </button>
              <span className="hidden sm:inline text-slate-500 text-[11px]">
                ({locations.length}V, {roads.length}E)
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
              <button
                onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.4))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Interaction Hint Banner */}
      {interactMode === 'add-node' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>Real-time Mode: Click anywhere on the map to drop a new location</span>
        </div>
      )}

      {interactMode === 'add-edge' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-amber-950/90 border border-amber-500/50 text-amber-200 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Link className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {connectFirstNodeId === null
              ? 'Click the FIRST location node to start road connection'
              : `Selected ${locations.find(l => l.id === connectFirstNodeId)?.name}. Now click the SECOND location node.`}
          </span>
        </div>
      )}

      {/* Bottom Floating Bar: Algorithm Animation Controls */}
      {routeResult?.steps_log && routeResult.steps_log.length > 0 && !isCompact && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              Algorithm Replay:
            </span>

            {isAnimating ? (
              <button
                onClick={pauseAnimation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-medium text-[11px]"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startAnimation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-medium text-[11px]"
              >
                <Play className="w-3 h-3" />
                <span>Play Steps</span>
              </button>
            )}

            <button
              onClick={stepForward}
              disabled={currentStepIndex >= routeResult.steps_log.length - 1}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetAnimation}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Replay"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] text-slate-400 border-l border-slate-800 pl-2">
              {currentStepIndex >= 0
                ? `Step ${currentStepIndex + 1} / ${routeResult.steps_log.length}`
                : 'Full Route'}
            </span>
          </div>

          {currentStepIndex >= 0 && animatedState.currentLogMessage && (
            <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-xl max-w-md animate-in fade-in">
              {animatedState.currentLogMessage}
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className={`w-full h-full ${
          interactMode === 'add-node'
            ? 'cursor-crosshair'
            : isPanning
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
        viewBox="0 0 800 550"
        onClick={handleCanvasClick}
      >
        <defs>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges / Roads */}
          {uniqueEdges.map(edge => {
            const p1 = nodePositions[edge.u];
            const p2 = nodePositions[edge.v];
            if (!p1 || !p2) return null;

            const isShortestPath =
              shortestPathEdges.has(`${edge.u}-${edge.v}`) &&
              (currentStepIndex < 0 || currentStepIndex >= (routeResult?.steps_log.length ?? 0) - 1);

            const isRelaxedInAnimation =
              currentStepIndex >= 0 && animatedState.relaxedEdges.has(`${edge.u}-${edge.v}`);

            const isHovered = hoveredEdgeId === edge.id;
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g
                key={`edge-${edge.id}`}
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                className="cursor-pointer"
              >
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={
                    isShortestPath
                      ? '#10b981'
                      : isRelaxedInAnimation
                      ? '#f59e0b'
                      : isHovered
                      ? '#60a5fa'
                      : '#334155'
                  }
                  strokeWidth={isShortestPath ? 4.5 : isRelaxedInAnimation ? 3.5 : isHovered ? 3 : 2}
                  strokeDasharray={isRelaxedInAnimation && !isShortestPath ? '6,3' : undefined}
                  filter={isShortestPath ? 'url(#routeGlow)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Road Weight Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="18"
                    rx="4"
                    fill={
                      isShortestPath
                        ? '#064e3b'
                        : isRelaxedInAnimation
                        ? '#78350f'
                        : isHovered
                        ? '#1e3a8a'
                        : '#0f172a'
                    }
                    stroke={
                      isShortestPath
                        ? '#34d399'
                        : isRelaxedInAnimation
                        ? '#f59e0b'
                        : isHovered
                        ? '#60a5fa'
                        : '#475569'
                    }
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isShortestPath ? '#34d399' : '#e2e8f0'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.distance}k
                  </text>
                </g>
              </g>
            );
          })}

          {/* Pending Road Preview line if connectFirstNodeId is selected */}
          {connectFirstNodeId !== null && nodePositions[connectFirstNodeId] && (
            <circle
              cx={nodePositions[connectFirstNodeId].x}
              cy={nodePositions[connectFirstNodeId].y}
              r="30"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="animate-spin-slow"
            />
          )}

          {/* Vertices / Locations */}
          {locations.map(loc => {
            const pos = nodePositions[loc.id];
            if (!pos) return null;

            const isSource = sourceId === loc.id;
            const isDestination = destinationId === loc.id;
            const isInShortestPath = routeResult?.path?.includes(loc.id) ?? false;
            const isHovered = hoveredNodeId === loc.id;
            const isSelected = selectedNodeId === loc.id || connectFirstNodeId === loc.id;

            const isVisitedInAnim = currentStepIndex >= 0 && animatedState.visitedSet.has(loc.id);
            const isCurrentInAnim = currentStepIndex >= 0 && animatedState.currentActiveNode === loc.id;

            let circleFill = '#1e293b';
            let circleStroke = '#475569';
            let strokeWidth = '2';
            let glowFilter = '';

            if (isSource) {
              circleFill = '#065f46';
              circleStroke = '#10b981';
              strokeWidth = '3.5';
              glowFilter = 'url(#nodeGlow)';
            } else if (isDestination) {
              circleFill = '#831843';
              circleStroke = '#f43f5e';
              strokeWidth = '3.5';
              glowFilter = 'url(#nodeGlow)';
            } else if (isCurrentInAnim) {
              circleFill = '#854d0e';
              circleStroke = '#facc15';
              strokeWidth = '3.5';
              glowFilter = 'url(#nodeGlow)';
            } else if (isVisitedInAnim) {
              circleFill = '#0c4a6e';
              circleStroke = '#38bdf8';
              strokeWidth = '2.5';
            } else if (isInShortestPath && (currentStepIndex < 0 || currentStepIndex >= (routeResult?.steps_log.length ?? 0) - 1)) {
              circleFill = '#064e3b';
              circleStroke = '#34d399';
              strokeWidth = '3';
            } else if (isHovered || isSelected) {
              circleStroke = connectFirstNodeId === loc.id ? '#f59e0b' : '#94a3b8';
              strokeWidth = '2.5';
            }

            return (
              <g
                key={`node-${loc.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNodeId(loc.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onMouseDown={e => {
                  e.stopPropagation();
                  setDraggedNodeId(loc.id);
                }}
                onClick={e => handleNodeClick(loc, e)}
                className="cursor-pointer"
              >
                {(isHovered || isSelected || isSource || isDestination) && (
                  <circle
                    r="25"
                    fill="transparent"
                    stroke={circleStroke}
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                    className="animate-spin-slow opacity-60"
                  />
                )}

                <circle
                  r="18"
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={strokeWidth}
                  filter={glowFilter || undefined}
                />

                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {loc.name.length <= 3 ? loc.name : loc.name.substring(0, 2).toUpperCase()}
                </text>

                {/* Location Name Label */}
                <g transform="translate(0, 32)">
                  <rect
                    x={-Math.max(loc.name.length * 3.8 + 8, 30)}
                    y="-11"
                    width={Math.max(loc.name.length * 7.6 + 16, 60)}
                    height="18"
                    rx="5"
                    fill="#0f172a"
                    stroke={isSource ? '#10b981' : isDestination ? '#f43f5e' : '#334155'}
                    strokeWidth="1"
                    opacity="0.92"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {loc.name}
                  </text>
                </g>

                {/* Source/Dest Badges */}
                {isSource && (
                  <g transform="translate(0, -26)">
                    <rect x="-24" y="-8" width="48" height="16" rx="4" fill="#10b981" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      START
                    </text>
                  </g>
                )}

                {isDestination && (
                  <g transform="translate(0, -26)">
                    <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#f43f5e" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      DEST
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Empty State Overlay */}
      {locations.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Clean Slate Network Canvas</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            No predefined locations. Click anywhere on the map grid or use the button below to add your first real-time location.
          </p>
          <button
            onClick={() => {
              setInteractMode('add-node');
              setNewNodeCoords({ x: 400, y: 275, lat: 28.62, lng: 77.21 });
              setNewNodeName('City Center');
              setNewNodeDesc('Initial custom origin point');
              setIsAddNodeDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Location Here</span>
          </button>
        </div>
      )}

      {/* Real-Time Add Node Mini Modal */}
      {isAddNodeDialogOpen && newNodeCoords && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl max-w-sm w-full text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Drop New Location Pin</span>
              </div>
              <button
                onClick={() => setIsAddNodeDialogOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewNode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  placeholder="e.g. Metro Station, Airport, Warehouse"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[10px]">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  Lat: {newNodeCoords.lat}
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  Lng: {newNodeCoords.lng}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newNodeDesc}
                  onChange={e => setNewNodeDesc(e.target.value)}
                  placeholder="e.g. Custom delivery waypoint"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddNodeDialogOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNode}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmittingNode ? 'Adding...' : 'Place Pin on Graph'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-Time Add Road Mini Modal */}
      {isAddRoadDialogOpen && newRoadSrc && newRoadDst && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl max-w-sm w-full text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <Link className="w-4 h-4 text-amber-400" />
                <span>Connect Road in Real-Time</span>
              </div>
              <button
                onClick={() => setIsAddRoadDialogOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between font-semibold text-slate-200">
              <span>{newRoadSrc.name}</span>
              <span className="text-amber-400 font-mono">⇄</span>
              <span>{newRoadDst.name}</span>
            </div>

            <form onSubmit={handleSaveNewRoad} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Road Distance (Weight in Kilometers)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  autoFocus
                  value={newRoadDistance}
                  onChange={e => setNewRoadDistance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Road / Highway Name (Optional)
                </label>
                <input
                  type="text"
                  value={newRoadName}
                  onChange={e => setNewRoadName(e.target.value)}
                  placeholder="e.g. Express Corridor, Main St"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRoadBidi}
                  onChange={e => setNewRoadBidi(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Bidirectional Road (two-way traffic)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddRoadDialogOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRoad}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmittingRoad ? 'Connecting...' : 'Connect Road'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Selection Quick Action Popover */}
      {selectedNodeId !== null && (
        (() => {
          const selectedLoc = locations.find(l => l.id === selectedNodeId);
          if (!selectedLoc) return null;
          return (
            <div className="absolute top-16 right-4 z-20 bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs w-64 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedLoc.name}</span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-slate-400 space-y-1 mb-3 text-[11px]">
                <div>Lat: {selectedLoc.latitude.toFixed(4)}, Lon: {selectedLoc.longitude.toFixed(4)}</div>
                {selectedLoc.description && (
                  <div className="line-clamp-2 italic text-slate-400">
                    "{selectedLoc.description}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onSelectSource && (
                  <button
                    onClick={() => {
                      onSelectSource(selectedLoc.id);
                      setSelectedNodeId(null);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                  >
                    Set Source
                  </button>
                )}
                {onSelectDestination && (
                  <button
                    onClick={() => {
                      onSelectDestination(selectedLoc.id);
                      setSelectedNodeId(null);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors"
                  >
                    Set Dest
                  </button>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
