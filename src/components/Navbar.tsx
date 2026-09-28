import React, { useState } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Database,
  RefreshCw,
  Navigation,
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenMobileMenu: () => void;
  onResetCityData: () => void;
  onResetAcademicData: () => void;
  onClearAllData?: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenMobileMenu,
  onResetCityData,
  onResetAcademicData,
  onClearAllData,
  isResetting = false
}) => {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard & Network Overview';
      case 'route-finder': return 'GPS Route Finder (Dijkstra Engine)';
      case 'locations': return 'Locations Management (Vertices)';
      case 'roads': return 'Roads Management (Edges & Weights)';
      case 'visualizer': return 'Interactive Graph Visualizer';
      case 'history': return 'Route Calculation History';
      case 'algorithm': return "Dijkstra's Algorithm Guide & Viva";
      case 'complexity': return 'Time & Space Complexity Analysis';
      case 'about': return 'About Project';
      default: return 'SmartRoute';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                DAA Project
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>SQLite Connected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Route button */}
          <button
            onClick={() => setActiveTab('route-finder')}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'route-finder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Finder</span>
          </button>

          {/* Demo Data Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(prev => !prev)}
              disabled={isResetting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Demo Datasets</span>
            </button>

            {showDemoMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDemoMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Select Demo Graph
                  </div>
                  <button
                    onClick={() => {
                      setShowDemoMenu(false);
                      onResetCityData();
                    }}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Metropolitan Network (12 Nodes)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Central Station, Airport, Tech Park, City Hospital with realistic road distances.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowDemoMenu(false);
                      onResetAcademicData();
                    }}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors mt-1"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Academic 4-Node Test Graph
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        A-B-C-D graph from project prompt: A→C=2, A→B=4, A→C→D=5 km.
                      </div>
                    </div>
                  </button>

                  {onClearAllData && (
                    <button
                      onClick={() => {
                        setShowDemoMenu(false);
                        onClearAllData();
                      }}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors mt-1 border-t border-slate-100 dark:border-slate-800"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-600 dark:text-rose-400">
                          Clean Slate (Empty Graph)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Clear all predefined locations & roads to input your own data in real-time.
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
