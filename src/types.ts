/**
 * Type definitions for SmartRoute – GPS Shortest Route Finder
 */

export interface LocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  created_at?: string;
  // Visual layout coordinates for graph view
  x?: number;
  y?: number;
}

export interface RoadItem {
  id: number;
  source_location_id: number;
  destination_location_id: number;
  distance: number;
  road_name: string;
  created_at?: string;
  source_name?: string;
  destination_name?: string;
}

export interface RouteStep {
  step: number;
  from_node_id: number;
  to_node_id: number;
  distance: number;
  road_name: string;
  from_name?: string;
  to_name?: string;
}

export interface StepLogItem {
  type: 'init' | 'visit' | 'relax';
  message: string;
  current_node?: number;
  edge?: [number, number];
  weight?: number;
  new_distance?: number;
  visited_count?: number;
  distances?: Record<string, number | null>;
}

export interface ShortestPathResult {
  distance: number | null;
  path: number[];
  path_locations: LocationItem[];
  path_steps: RouteStep[];
  visited_nodes: number[];
  execution_time_ms: number;
  all_distances: Record<string, number | null>;
  nodes_processed: number;
  edges_examined: number;
  steps_log: StepLogItem[];
  source?: LocationItem;
  destination?: LocationItem;
  vertices_count?: number;
  edges_count?: number;
  history_id?: number;
  error?: string;
}

export interface AdjacencyNeighbor {
  node: number;
  weight: number;
  road_name: string;
  road_id?: number;
}

export interface AdjacencyMatrixData {
  headers: string[];
  node_ids: number[];
  matrix: (number | null)[][];
}

export interface GraphData {
  vertices_count: number;
  edges_count: number;
  locations: LocationItem[];
  roads: RoadItem[];
  adjacency_list: Record<string, AdjacencyNeighbor[]>;
  adjacency_matrix: AdjacencyMatrixData;
  complexity_info: {
    adjacency_list: {
      space_complexity: string;
      v: number;
      e: number;
      theoretical_units: number;
    };
    adjacency_matrix: {
      space_complexity: string;
      v: number;
      theoretical_units: number;
    };
  };
}

export interface StatisticsData {
  total_locations: number;
  total_roads: number;
  routes_calculated: number;
  average_route_distance: number;
}

export interface RouteHistoryItem {
  id: number;
  source_location_id: number;
  destination_location_id: number;
  shortest_distance: number;
  shortest_path: string;
  calculated_at: string;
  source_name?: string;
  destination_name?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'route-finder'
  | 'locations'
  | 'roads'
  | 'visualizer'
  | 'history'
  | 'algorithm'
  | 'complexity'
  | 'about';
