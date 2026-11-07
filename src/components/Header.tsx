import React from 'react';
import {
  Play,
  Sliders,
  UploadCloud,
  RefreshCw,
  Layers,
  Database,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { PRESET_DATASETS } from '../services/dataPresets';
import { AgentStep } from '../types';
import { useAuth } from '../context/AuthContext';

export type ActiveTabType = 'dashboard' | 'decomposition' | 'anomalies' | 'report';

interface HeaderProps {
  currentDatasetId: string;
  onSelectDataset: (id: string) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
  agentStep: AgentStep;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenConfig: () => void;
  onOpenUpload: () => void;
  onOpenSavedForecasts: () => void;
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDatasetId,
  onSelectDataset,
  onRunPipeline,
  isRunning,
  activeTab,
  setActiveTab,
  onOpenConfig,
  onOpenUpload,
  onOpenSavedForecasts,
  recordCount,
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-md shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  Multi-Agent Sales Forecasting
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 rounded px-1.5 py-0.2">
                  Prophet + Z-Score
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Autonomous Time-Series Pipeline</span>
                <span aria-hidden="true">·</span>
                <span>4 Cooperating Agents</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Dataset Picker */}
            <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner">
              <span className="text-slate-500 text-[11px] font-medium mr-1.5">Dataset:</span>
              <select
                value={currentDatasetId}
                onChange={(e) => onSelectDataset(e.target.value)}
                disabled={isRunning}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-4 appearance-none text-xs"
              >
                {PRESET_DATASETS.map((ds) => (
                  <option key={ds.id} value={ds.id} className="bg-slate-900 text-white">
                    {ds.name}
                  </option>
                ))}
                <option value="custom" className="bg-slate-900 text-white">
                  Custom CSV Upload
                </option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 pointer-events-none absolute right-2" />
              <span className="text-[10px] text-slate-500 font-mono ml-2 pl-2 border-l border-slate-800">
                {recordCount}d
              </span>
            </div>

            {/* Custom CSV Upload */}
            <button
              onClick={onOpenUpload}
              disabled={isRunning}
              title="Upload your own custom sales CSV"
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload CSV</span>
            </button>

            {/* Hyperparameters Config */}
            <button
              onClick={onOpenConfig}
              disabled={isRunning}
              title="Configure forecast horizon, holdout test split, and anomaly threshold"
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Tuning</span>
            </button>

            {/* Firestore Saved Forecast Runs */}
            <button
              onClick={onOpenSavedForecasts}
              title="View and restore saved forecast runs from Cloud Firestore"
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-700 active:scale-95"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Runs</span>
            </button>

            {/* Primary Run Pipeline CTA */}
            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRunning
                  ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-500/25 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Pipeline</span>
                </>
              )}
            </button>

            {/* Authenticated User Badge & Sign Out */}
            {user && (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl pl-2 pr-2.5 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-500/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {user.displayName?.charAt(0).toUpperCase() || 'M'}
                  </div>
                )}
                <span className="text-xs text-slate-200 font-medium max-w-[110px] truncate">
                  {user.displayName}
                </span>
                <button
                  onClick={signOut}
                  title="Sign out and return to Sign-In screen"
                  className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-0.5 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 mt-2 border-t border-slate-800/60 text-xs">
          {[
            { id: 'dashboard', label: 'Forecast & Visualizer' },
            { id: 'decomposition', label: 'Prophet Decomposition (Trend & Seasonality)' },
            { id: 'anomalies', label: 'Anomaly Audit Log' },
            { id: 'report', label: 'Agent 4 Executive Briefing & Chat' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTabType)}
                className={`px-3.5 py-1.5 font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer text-xs ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
