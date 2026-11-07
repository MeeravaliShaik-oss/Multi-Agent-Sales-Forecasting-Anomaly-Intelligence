import React from 'react';
import { Calendar, TrendingUp, BarChart2, Info, Layers, Sparkles } from 'lucide-react';
import { SeasonalityBreakdown, ForecastPoint } from '../types';

interface SeasonalityDecompositionProps {
  seasonality: SeasonalityBreakdown;
  forecastData: ForecastPoint[];
}

export const SeasonalityDecomposition: React.FC<SeasonalityDecompositionProps> = ({
  seasonality,
  forecastData
}) => {
  // Find max weekly impact for scaling
  const maxWeekly = Math.max(...seasonality.dayOfWeek.map(d => Math.abs(d.impact)), 10);
  const maxMonthly = Math.max(...seasonality.monthly.map(m => Math.abs(m.impact)), 10);

  // Compute trend points for miniature sparkline
  const trendSamples = forecastData.filter((_, idx) => idx % 8 === 0);
  const minTrend = Math.min(...trendSamples.map(p => p.trend));
  const maxTrend = Math.max(...trendSamples.map(p => p.trend));

  return (
    <div className="space-y-5">
      {/* Educational Header Banner */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Prophet Component Decomposition
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Additive Modeling Formula</span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1 tracking-tight">
              Deconstructing Sales into Baseline Trend, Seasonality &amp; Cycles
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Unlike ordinary regression that lumps variations into random noise, Facebook Prophet isolates daily
              sales into structural sub-components: <code className="text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800">y(t) = Trend(t) + Weekly(t) + Yearly(t) + Noise</code>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Annual Growth Rate</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                {seasonality.annualGrowthRate > 0 ? `+${seasonality.annualGrowthRate}%` : `${seasonality.annualGrowthRate}%`}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Weekly Cycle Variance</div>
              <div className="text-lg font-extrabold text-cyan-300 font-mono mt-0.5">
                ±{Math.round(maxWeekly)}{' '}
                <span className="text-xs font-normal text-slate-400">units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Component 1: Weekly Seasonality */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Weekly Seasonality (7-Day Fourier Cycle)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Deviation from Trend</span>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
              Reveals persistent day-of-week demand surges and quiet periods across normal store schedules.
            </p>

            {/* Day of Week Visual Bars */}
            <div className="space-y-3">
              {seasonality.dayOfWeek.map(item => {
                const isPositive = item.impact >= 0;
                const widthPct = Math.min(100, Math.round((Math.abs(item.impact) / maxWeekly) * 100));

                return (
                  <div key={item.day} className="flex items-center gap-3 text-xs">
                    <span className="w-20 font-medium text-slate-300 shrink-0 truncate">
                      {item.day}
                    </span>

                    {/* Centered zero-axis bar */}
                    <div className="flex-1 flex items-center h-5 bg-slate-950/80 rounded-lg px-1 relative overflow-hidden border border-slate-800/80">
                      {/* Zero center line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/80" />

                      {isPositive ? (
                        <div
                          className="h-2.5 rounded-r bg-gradient-to-r from-emerald-500/70 to-emerald-400 transition-all absolute left-1/2"
                          style={{ width: `${widthPct / 2}%` }}
                        />
                      ) : (
                        <div
                          className="h-2.5 rounded-l bg-gradient-to-l from-rose-500/70 to-rose-400 transition-all absolute right-1/2"
                          style={{ width: `${widthPct / 2}%` }}
                        />
                      )}
                    </div>

                    <span
                      className={`w-16 text-right font-mono font-bold shrink-0 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${item.impact}` : `${item.impact}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Demand: <strong className="text-white">Saturday (+{seasonality.dayOfWeek[6]?.impact} units)</strong></span>
            <span>Lowest: <strong className="text-slate-300">Monday ({seasonality.dayOfWeek[1]?.impact} units)</strong></span>
          </div>
        </div>

        {/* Component 2: Monthly / Yearly Seasonality */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Yearly Seasonality (12-Month Calendar Rhythms)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Annual Rhythm</span>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
              Captures annual consumer purchasing cycles, back-to-school surges, and Q4 holiday spending waves.
            </p>

            {/* Monthly Bar Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
              {seasonality.monthly.map(m => {
                const isPositive = m.impact >= 0;
                const barHeight = Math.max(12, Math.round((Math.abs(m.impact) / maxMonthly) * 80));

                return (
                  <div key={m.month} className="flex flex-col items-center justify-end h-32 group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {isPositive ? `+${m.impact}` : m.impact}
                    </span>
                    <div
                      className={`w-full max-w-[20px] rounded-t transition-all ${
                        isPositive ? 'bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:brightness-110' : 'bg-slate-800 group-hover:bg-slate-700'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-[11px] font-medium text-slate-300 mt-2">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Holiday Surge: <strong className="text-cyan-300">December (+{seasonality.monthly[11]?.impact} units)</strong></span>
            <span>Slump: <strong className="text-slate-300">January ({seasonality.monthly[0]?.impact} units)</strong></span>
          </div>
        </div>
      </div>

      {/* Component 3: Overall Long-Term Trend Progression */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Underlying Baseline Trend Component g(t)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {Math.round(minTrend)} → {Math.round(maxTrend)} units/day
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          The smooth underlying trajectory free of day-to-day noise and cyclical holiday spikes.
          Shows sustained organic business expansion over the entire operational timeline.
        </p>

        {/* Trend line SVG Sparkline */}
        <div className="h-28 w-full bg-slate-950/80 rounded-xl p-2 border border-slate-800/80 relative overflow-hidden">
          <svg viewBox="0 0 800 90" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {trendSamples.length > 1 && (
              <path
                d={`M 0,${90 - ((trendSamples[0].trend - minTrend) / Math.max(1, maxTrend - minTrend)) * 70} ${trendSamples
                  .map((p, i) => {
                    const x = (i / (trendSamples.length - 1)) * 800;
                    const y = 90 - ((p.trend - minTrend) / Math.max(1, maxTrend - minTrend)) * 70;
                    return `L ${x},${y}`;
                  })
                  .join(' ')} L 800,90 L 0,90 Z`}
                fill="url(#trendGrad)"
              />
            )}

            {/* Line */}
            {trendSamples.length > 1 && (
              <path
                d={`M 0,${90 - ((trendSamples[0].trend - minTrend) / Math.max(1, maxTrend - minTrend)) * 70} ${trendSamples
                  .map((p, i) => {
                    const x = (i / (trendSamples.length - 1)) * 800;
                    const y = 90 - ((p.trend - minTrend) / Math.max(1, maxTrend - minTrend)) * 70;
                    return `L ${x},${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
