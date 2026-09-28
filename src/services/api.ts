/**
 * API Client service for SmartRoute
 */

import {
  LocationItem,
  RoadItem,
  GraphData,
  ShortestPathResult,
  RouteHistoryItem,
  StatisticsData
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Statistics
  getStatistics: async (): Promise<StatisticsData> => {
    const res = await fetch(`${BASE_URL}/statistics`);
    return handleResponse<StatisticsData>(res);
  },

  // Locations
  getLocations: async (): Promise<LocationItem[]> => {
    const res = await fetch(`${BASE_URL}/locations`);
    return handleResponse<LocationItem[]>(res);
  },

  createLocation: async (data: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  }): Promise<LocationItem> => {
    const res = await fetch(`${BASE_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LocationItem>(res);
  },

  updateLocation: async (
    id: number,
    data: { name: string; latitude: number; longitude: number; description: string }
  ): Promise<LocationItem> => {
    const res = await fetch(`${BASE_URL}/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<LocationItem>(res);
  },

  deleteLocation: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/locations/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Roads
  getRoads: async (): Promise<RoadItem[]> => {
    const res = await fetch(`${BASE_URL}/roads`);
    return handleResponse<RoadItem[]>(res);
  },

  createRoad: async (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name?: string;
    bidirectional?: boolean;
  }): Promise<RoadItem> => {
    const res = await fetch(`${BASE_URL}/roads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RoadItem>(res);
  },

  updateRoad: async (
    id: number,
    data: {
      source_location_id: number;
      destination_location_id: number;
      distance: number;
      road_name?: string;
    }
  ): Promise<RoadItem> => {
    const res = await fetch(`${BASE_URL}/roads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RoadItem>(res);
  },

  deleteRoad: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/roads/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Graph Data (Adjacency List + Matrix)
  getGraph: async (): Promise<GraphData> => {
    const res = await fetch(`${BASE_URL}/graph`);
    return handleResponse<GraphData>(res);
  },

  // Shortest Path (Dijkstra)
  calculateShortestPath: async (
    sourceId: number,
    destinationId: number
  ): Promise<ShortestPathResult> => {
    const res = await fetch(`${BASE_URL}/shortest-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_location_id: sourceId,
        destination_location_id: destinationId
      })
    });
    return handleResponse<ShortestPathResult>(res);
  },

  // Route History
  getRouteHistory: async (): Promise<RouteHistoryItem[]> => {
    const res = await fetch(`${BASE_URL}/route-history`);
    return handleResponse<RouteHistoryItem[]>(res);
  },

  deleteRouteHistoryItem: async (id: number): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/route-history/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  clearRouteHistory: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/route-history`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Demo Data Reset
  resetDemoCity: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/demo-data/reset-city`, { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  },

  resetDemoAcademic: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/demo-data/reset-academic`, { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  },

  clearAllData: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/demo-data/clear`, { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  }
};
