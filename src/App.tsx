import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastProvider, useToast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { RouteFinderPage } from './pages/RouteFinderPage';
import { LocationsPage } from './pages/LocationsPage';
import { RoadsPage } from './pages/RoadsPage';
import { GraphVisualizerPage } from './pages/GraphVisualizerPage';
import { RouteHistoryPage } from './pages/RouteHistoryPage';
import { AlgorithmPage } from './pages/AlgorithmPage';
import { ComplexityPage } from './pages/ComplexityPage';
import { AboutPage } from './pages/AboutPage';
import {
  ActiveTab,
  LocationItem,
  RoadItem,
  RouteHistoryItem,
  ShortestPathResult,
  StatisticsData
} from './types';
import { api } from './services/api';

function MainApp() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smartroute_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core database state
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [roads, setRoads] = useState<RoadItem[]>([]);
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);
  const [stats, setStats] = useState<StatisticsData | null>(null);

  // Shortest path active calculation state
  const [routeResult, setRouteResult] = useState<ShortestPathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isResettingDemo, setIsResettingDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smartroute_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smartroute_theme', 'light');
    }
  }, [isDarkMode]);

  // Load all initial data from SQLite backend
  const loadData = useCallback(async () => {
    try {
      const [locsData, roadsData, historyData, statsData] = await Promise.all([
        api.getLocations(),
        api.getRoads(),
        api.getRouteHistory(),
        api.getStatistics()
      ]);
      setLocations(locsData);
      setRoads(roadsData);
      setHistory(historyData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      showToast('error', err.message || 'Failed to connect to SQLite database backend');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Route calculation handler
  const handleCalculateRoute = async (sourceId: number, destId: number) => {
    setIsCalculating(true);
    try {
      const result = await api.calculateShortestPath(sourceId, destId);
      setRouteResult(result);

      if (result.distance !== null) {
        showToast(
          'success',
          `Optimal path: ${result.path_locations.map(l => l.name).join(' → ')} (${result.distance} km in ${result.execution_time_ms} ms)`,
          'Route Computed Successfully'
        );
      } else {
        showToast('warning', 'No connected path exists between selected vertices in the network graph');
      }

      // Refresh stats & history
      const [historyData, statsData] = await Promise.all([
        api.getRouteHistory(),
        api.getStatistics()
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Error executing Dijkstra calculation');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleResetRoute = () => {
    setRouteResult(null);
    showToast('info', 'Shortest route selection cleared');
  };

  // Location Handlers
  const handleCreateLocation = async (data: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  }) => {
    try {
      const newLoc = await api.createLocation(data);
      setLocations(prev => [...prev, newLoc]);
      setRouteResult(null);
      showToast('success', `Vertex "${newLoc.name}" added to SQLite graph network`);
      const statsData = await api.getStatistics();
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create location');
      throw err;
    }
  };

  const handleUpdateLocation = async (
    id: number,
    data: { name: string; latitude: number; longitude: number; description: string }
  ) => {
    try {
      const updated = await api.updateLocation(id, data);
      setLocations(prev => prev.map(l => (l.id === id ? updated : l)));
      showToast('success', `Location "${updated.name}" updated`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update location');
      throw err;
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      await api.deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
      setRoads(prev =>
        prev.filter(r => r.source_location_id !== id && r.destination_location_id !== id)
      );
      setRouteResult(null);
      showToast('info', 'Location and connected edges removed from database');
      const statsData = await api.getStatistics();
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete location');
      throw err;
    }
  };

  // Road Handlers
  const handleCreateRoad = async (data: {
    source_location_id: number;
    destination_location_id: number;
    distance: number;
    road_name: string;
    bidirectional?: boolean;
  }) => {
    try {
      await api.createRoad(data);
      const [roadsData, statsData] = await Promise.all([api.getRoads(), api.getStatistics()]);
      setRoads(roadsData);
      setStats(statsData);
      setRouteResult(null);
      showToast('success', `Road connection created (${data.distance} km)`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create road');
      throw err;
    }
  };

  const handleUpdateRoad = async (
    id: number,
    data: {
      source_location_id: number;
      destination_location_id: number;
      distance: number;
      road_name: string;
    }
  ) => {
    try {
      const updated = await api.updateRoad(id, data);
      setRoads(prev => prev.map(r => (r.id === id ? updated : r)));
      setRouteResult(null);
      showToast('success', 'Road connection weight updated');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update road');
      throw err;
    }
  };

  const handleDeleteRoad = async (id: number) => {
    try {
      await api.deleteRoad(id);
      setRoads(prev => prev.filter(r => r.id !== id));
      setRouteResult(null);
      showToast('info', 'Road connection removed');
      const statsData = await api.getStatistics();
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete road');
      throw err;
    }
  };

  // History Handlers
  const handleDeleteHistoryItem = async (id: number) => {
    try {
      await api.deleteRouteHistoryItem(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      showToast('info', 'Calculation log record deleted');
      const statsData = await api.getStatistics();
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete history record');
      throw err;
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearRouteHistory();
      setHistory([]);
      showToast('info', 'Entire calculation history cleared');
      const statsData = await api.getStatistics();
      setStats(statsData);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to clear history');
      throw err;
    }
  };

  // Demo Data Reset Handlers
  const handleResetCityData = async () => {
    setIsResettingDemo(true);
    try {
      await api.resetDemoCity();
      setRouteResult(null);
      await loadData();
      showToast(
        'success',
        'Metropolitan 12-node road network loaded into SQLite database',
        'Demo Dataset Reset'
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reset city dataset');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleResetAcademicData = async () => {
    setIsResettingDemo(true);
    try {
      await api.resetDemoAcademic();
      setRouteResult(null);
      await loadData();
      showToast(
        'success',
        'Academic 4-Node Test Graph (A-B-C-D) loaded into SQLite database',
        'Academic Test Graph Loaded'
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reset academic dataset');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleClearAllData = async () => {
    setIsResettingDemo(true);
    try {
      await api.clearAllData();
      setRouteResult(null);
      await loadData();
      showToast(
        'info',
        'All locations, roads, and history cleared. Ready for custom real-time input.',
        'Clean Slate'
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to clear graph data');
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        locationsCount={locations.length}
        roadsCount={roads.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onResetCityData={handleResetCityData}
          onResetAcademicData={handleResetAcademicData}
          onClearAllData={handleClearAllData}
          isResetting={isResettingDemo}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Connecting to SQLite database and loading graph data...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  locations={locations}
                  roads={roads}
                  history={history}
                  onCalculateRoute={handleCalculateRoute}
                  routeResult={routeResult}
                  isCalculating={isCalculating}
                  setActiveTab={setActiveTab}
                  onSelectNode={id => {
                    setActiveTab('route-finder');
                  }}
                />
              )}

              {activeTab === 'route-finder' && (
                <RouteFinderPage
                  locations={locations}
                  roads={roads}
                  routeResult={routeResult}
                  onCalculateRoute={handleCalculateRoute}
                  onResetRoute={handleResetRoute}
                  isCalculating={isCalculating}
                  onAddLocation={handleCreateLocation}
                  onAddRoad={handleCreateRoad}
                  onClearCanvas={handleClearAllData}
                  onResetCityData={handleResetCityData}
                  onResetAcademicData={handleResetAcademicData}
                />
              )}

              {activeTab === 'locations' && (
                <LocationsPage
                  locations={locations}
                  roads={roads}
                  onCreateLocation={handleCreateLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onDeleteLocation={handleDeleteLocation}
                />
              )}

              {activeTab === 'roads' && (
                <RoadsPage
                  roads={roads}
                  locations={locations}
                  onCreateRoad={handleCreateRoad}
                  onUpdateRoad={handleUpdateRoad}
                  onDeleteRoad={handleDeleteRoad}
                />
              )}

              {activeTab === 'visualizer' && (
                <GraphVisualizerPage
                  locations={locations}
                  roads={roads}
                  routeResult={routeResult}
                  onCalculateRoute={handleCalculateRoute}
                  onAddLocation={handleCreateLocation}
                  onAddRoad={handleCreateRoad}
                  onClearCanvas={handleClearAllData}
                />
              )}

              {activeTab === 'history' && (
                <RouteHistoryPage
                  history={history}
                  onDeleteHistoryItem={handleDeleteHistoryItem}
                  onClearHistory={handleClearHistory}
                  onReplayRoute={handleCalculateRoute}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'algorithm' && <AlgorithmPage />}

              {activeTab === 'complexity' && (
                <ComplexityPage locations={locations} roads={roads} />
              )}

              {activeTab === 'about' && <AboutPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
