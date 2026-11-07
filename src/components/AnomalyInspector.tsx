import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Sliders,
  CheckCircle,
  HelpCircle,
  Calendar,
  Activity,
  Flame,
  TrendingDown
} from 'lucide-react';
import { AnomalyRecord } from '../types';

interface AnomalyInspectorProps {
  anomalies: AnomalyRecord[];
  totalDataPoints: number;
  anomalyWindow: number;
  anomalyThreshold: number;
  onOpenConfig: () => void;
}

export const AnomalyInspector: React.FC<AnomalyInspectorProps> = ({
  anomalies,
  totalDataPoints,
  anomalyWindow,
  anomalyThreshold,
  onOpenConfig
}) => {
  const [filterType, setFilterType] = useState<'all' | 'spike' | 'drop'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter anomalies
  const filtered = useMemo(() => {
    return anomalies.filter(item => {
      const matchesType = filterType === 'all' || item.anomaly_type === filterType;
      const matchesSearch =
        item.date.includes(searchQuery) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [anomalies, filterType, searchQuery]);

  const spikes = anomalies.filter(a => a.anomaly_type === 'spike');
  const drops = anomalies.filter(a => a.anomaly_type === 'drop');

  const highestSpike = spikes.length
    ? spikes.reduce((prev, curr) => (curr.sales > prev.sales ? curr : prev), spikes[0])
    : null;

  const deepestDrop = drops.length
    ? drops.reduce((prev, curr) => (curr.sales < prev.sales ? curr : prev), drops[0])
    : null;

  return (
    <div className="space-y-5">
      {/* Overview Stat Cards with Obsidian Glass & Top Hairline Gradients */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total Anomalies */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/80 via-indigo-500/80 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Flagged Anomalies</span>
            <Activity className="w-3.5 h-3.5 text-amber-400/80" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono tabular-nums">
            {anomalies.length}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {totalDataPoints}d ({((anomalies.length / Math.max(1, totalDataPoints)) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
            <span>Window: <strong className="text-slate-300 font-semibold">{anomalyWindow}d</strong></span>
            <span>·</span>
            <span>Threshold: <strong className="text-slate-300 font-semibold">±{anomalyThreshold}σ</strong></span>
          </div>
        </div>

        {/* Card 2: Demand Spikes */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-rose-400 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Demand Spikes</span>
            <span className="flex items-center text-rose-400 text-xs">
              <Flame className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1.5 tracking-tight font-mono tabular-nums flex items-baseline gap-2">
            <span>{spikes.length}</span>
            <span className="text-xs font-normal text-rose-300/70">events</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 truncate font-mono">
            {highestSpike ? (
              <span>Peak: <strong className="text-rose-300 font-semibold">{highestSpike.sales.toLocaleString()}</strong> on {highestSpike.date}</span>
            ) : (
              'No demand spikes'
            )}
          </div>
        </div>

        {/* Card 3: Demand Drops */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-sky-400 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Drops &amp; Stockouts</span>
            <span className="flex items-center text-cyan-400 text-xs">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1.5 tracking-tight font-mono tabular-nums flex items-baseline gap-2">
            <span>{drops.length}</span>
            <span className="text-xs font-normal text-cyan-300/70">events</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 truncate font-mono">
            {deepestDrop ? (
              <span>Trough: <strong className="text-cyan-300 font-semibold">{deepestDrop.sales.toLocaleString()}</strong> on {deepestDrop.date}</span>
            ) : (
              'No slumps detected'
            )}
          </div>
        </div>

        {/* Card 4: Detection Principle */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent" />
          <div>
            <div className="text-[11px] font-medium text-slate-400">Detection Formula</div>
            <div className="text-sm font-bold text-slate-200 mt-1 font-mono flex items-center gap-1.5">
              <span>Z = (x - μ) / σ</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Rolling {anomalyWindow}d arithmetic (0 black-box)
            </div>
          </div>
          <button
            onClick={onOpenConfig}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer pt-2 group-hover:translate-x-0.5 transition-transform"
          >
            <Sliders className="w-3 h-3 text-indigo-400" />
            <span>Configure Thresholds</span>
          </button>
        </div>
      </div>

      {/* Main Table and Filter Area */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              All Anomalies ({anomalies.length})
            </button>
            <button
              onClick={() => setFilterType('spike')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                filterType === 'spike'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900/60'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-rose-400" />
              <span>Spikes ({spikes.length})</span>
            </button>
            <button
              onClick={() => setFilterType('drop')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                filterType === 'drop'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60'
              }`}
            >
              <ArrowDownRight className="w-3 h-3 text-cyan-400" />
              <span>Drops ({drops.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date (YYYY-MM-DD) or diagnosis..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 w-full sm:w-72 font-mono transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Classification</th>
                <th className="py-3 px-3.5 text-right">Actual Sales</th>
                <th className="py-3 px-3.5 text-right">{anomalyWindow}d Rolling Mean</th>
                <th className="py-3 px-3.5 text-right">Std Dev (σ)</th>
                <th className="py-3 px-3.5 text-right">Z-Score</th>
                <th className="py-3 px-3.5">Business Diagnosis / Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic font-sans text-xs">
                    No anomalies match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const isSpike = item.anomaly_type === 'spike';
                  return (
                    <tr
                      key={item.date}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-slate-200 font-semibold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        <span>{item.date}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
                            isSpike
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {isSpike ? (
                            <ArrowUpRight className="w-3 h-3 text-rose-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-cyan-400" />
                          )}
                          {item.anomaly_type.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-extrabold text-white tabular-nums">
                        {item.sales.toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-400 tabular-nums">
                        {item.rolling_mean.toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-400 tabular-nums">
                        ±{item.rolling_std}
                      </td>

                      <td className="py-3 px-3.5 text-right tabular-nums">
                        <span
                          className={`font-extrabold px-1.5 py-0.5 rounded ${
                            Math.abs(item.z_score) > 3.0
                              ? isSpike
                                ? 'text-rose-400 bg-rose-500/10'
                                : 'text-cyan-400 bg-cyan-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-slate-300 font-sans text-xs">
                        {item.notes || 'Unusual operational variance'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footnote on statistical thresholding */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300 font-semibold">Mathematical Basis:</strong> The Z-score measures how many standard deviations
            a day's sales volume departs from its {anomalyWindow}-day rolling window average. Setting a higher threshold (e.g. ±3.0σ)
            restricts flags to severe outliers, while lower thresholds (e.g. ±2.0σ) surface subtle consumer shifts.
          </p>
        </div>
      </div>
    </div>
  );
};
