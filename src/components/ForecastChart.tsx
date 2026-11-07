import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  ZoomIn,
  ShieldCheck,
  Info,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ForecastPoint, AnomalyRecord, ModelMetrics, CleanedDailyRecord } from '../types';

interface ForecastChartProps {
  forecastData: ForecastPoint[];
  cleanedData: CleanedDailyRecord[];
  anomalies: AnomalyRecord[];
  metrics: ModelMetrics;
  forecastPeriods: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastData,
  cleanedData,
  anomalies,
  metrics,
  forecastPeriods
}) => {
  const [zoomRange, setZoomRange] = useState<'all' | '1y' | '90d' | 'future'>('all');
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);
  const [showActuals, setShowActuals] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showTestSplit, setShowTestSplit] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: ForecastPoint;
    anomaly?: AnomalyRecord;
    x: number;
    y: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Anomaly lookup map by date
  const anomalyMap = useMemo(() => {
    const map = new Map<string, AnomalyRecord>();
    anomalies.forEach(a => map.set(a.date, a));
    return map;
  }, [anomalies]);

  // Filter data based on zoom range
  const filteredData = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return [];

    const total = forecastData.length;
    if (zoomRange === 'future') {
      return forecastData.slice(-forecastPeriods);
    }
    if (zoomRange === '90d') {
      return forecastData.slice(- (90 + forecastPeriods));
    }
    if (zoomRange === '1y') {
      return forecastData.slice(- (365 + forecastPeriods));
    }
    return forecastData;
  }, [forecastData, zoomRange, forecastPeriods]);

  // Compute chart bounds
  const { minVal, maxVal, width, height, padding } = useMemo(() => {
    const w = 1100;
    const h = 420;
    const pad = { top: 30, right: 40, bottom: 45, left: 65 };

    if (filteredData.length === 0) {
      return { minVal: 0, maxVal: 100, width: w, height: h, padding: pad };
    }

    let min = Infinity;
    let max = -Infinity;

    for (const p of filteredData) {
      if (p.actual != null) {
        min = Math.min(min, p.actual);
        max = Math.max(max, p.actual);
      }
      min = Math.min(min, p.yhat_lower, p.yhat);
      max = Math.max(max, p.yhat_upper, p.yhat);
    }

    // Add 10% breathing room
    min = Math.max(0, Math.floor(min * 0.9));
    max = Math.ceil(max * 1.1);

    return { minVal: min, maxVal: max, width: w, height: h, padding: pad };
  }, [filteredData]);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scale functions
  const getX = (index: number) => {
    if (filteredData.length <= 1) return padding.left;
    return padding.left + (index / (filteredData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + innerHeight / 2;
    const norm = (val - minVal) / (maxVal - minVal);
    return padding.top + innerHeight - norm * innerHeight;
  };

  // Generate SVG path for Confidence Interval area polygon
  const confidenceAreaPath = useMemo(() => {
    if (filteredData.length === 0) return '';
    const upperPoints = filteredData.map((p, i) => `${getX(i)},${getY(p.yhat_upper)}`);
    const lowerPoints = filteredData.slice().reverse().map((p, i) => {
      const origIdx = filteredData.length - 1 - i;
      return `${getX(origIdx)},${getY(p.yhat_lower)}`;
    });
    return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  }, [filteredData, minVal, maxVal]);

  // Actual sales polyline
  const actualLinePath = useMemo(() => {
    const points: string[] = [];
    filteredData.forEach((p, i) => {
      if (p.actual != null) {
        points.push(`${getX(i)},${getY(p.actual)}`);
      }
    });
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  }, [filteredData, minVal, maxVal]);

  // Forecast yhat polyline (both test period and future)
  const forecastLinePath = useMemo(() => {
    const points: string[] = [];
    filteredData.forEach((p, i) => {
      points.push(`${getX(i)},${getY(p.yhat)}`);
    });
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  }, [filteredData, minVal, maxVal]);

  // Find index of test split & future start in filteredData
  const testSplitIndex = useMemo(() => {
    return filteredData.findIndex(p => p.is_test_period);
  }, [filteredData]);

  const futureStartIndex = useMemo(() => {
    return filteredData.findIndex(p => p.actual == null);
  }, [filteredData]);

  // Mouse move handler for interactive scrubber crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || filteredData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    // Convert clientX to SVG coordinate
    const svgX = (clientX / rect.width) * width;

    if (svgX < padding.left || svgX > width - padding.right) {
      setHoveredPoint(null);
      return;
    }

    const relX = svgX - padding.left;
    const fraction = relX / innerWidth;
    const index = Math.min(
      filteredData.length - 1,
      Math.max(0, Math.round(fraction * (filteredData.length - 1)))
    );

    const point = filteredData[index];
    const anom = anomalyMap.get(point.date);

    setHoveredPoint({
      point,
      anomaly: anom,
      x: getX(index),
      y: getY(point.actual ?? point.yhat)
    });
  };

  // High-level statistics calculation
  const stats = useMemo(() => {
    const futurePoints = forecastData.slice(-forecastPeriods);
    const futureSum = futurePoints.reduce((acc, p) => acc + p.yhat, 0);
    const futureAvg = futurePoints.length ? Math.round(futureSum / futurePoints.length) : 0;
    const spikeCount = anomalies.filter(a => a.anomaly_type === 'spike').length;
    const dropCount = anomalies.filter(a => a.anomaly_type === 'drop').length;

    return {
      futureTotal: Math.round(futureSum),
      futureDailyAvg: futureAvg,
      spikeCount,
      dropCount
    };
  }, [forecastData, forecastPeriods, anomalies]);

  return (
    <div className="space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400">Next {forecastPeriods}-Day Demand Projection</div>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono tabular-nums">
            {stats.futureTotal.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg {stats.futureDailyAvg.toLocaleString()} units / day</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400">Validation Error (MAE)</div>
          <div className="text-2xl font-extrabold text-indigo-300 mt-1.5 tracking-tight font-mono tabular-nums">
            ±{metrics.MAE.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
            <span>RMSE: {metrics.RMSE}</span>
            <span className="text-slate-600">·</span>
            <span>MAPE: {metrics.MAPE}%</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-500 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400">Flagged Anomalies (|z| &gt; 2.5σ)</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1.5 tracking-tight font-mono tabular-nums">
            {anomalies.length}{' '}
            <span className="text-xs font-normal text-slate-400">outliers</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2.5 font-mono">
            <span className="text-rose-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {stats.spikeCount} Spikes
            </span>
            <span className="text-cyan-400 flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> {stats.dropCount} Drops
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent" />
          <div className="text-[11px] font-medium text-slate-400">Prophet Training Split</div>
          <div className="text-2xl font-extrabold text-slate-200 mt-1.5 tracking-tight font-mono tabular-nums">
            {metrics.trainingDays}{' '}
            <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-indigo-400 mt-2 font-mono">
            {metrics.testDays} days out-of-sample holdout
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm">
        {/* Chart Header & Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Time-Series Forecast &amp; Anomaly Detection</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Facebook Prophet additive curve with 90% confidence envelope and statistical Z-score outliers.
            </p>
          </div>

          {/* Timeline Range Presets */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All History' },
              { id: '1y', label: '1 Year' },
              { id: '90d', label: '90 Days' },
              { id: 'future', label: `Next ${forecastPeriods}d Horizon` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setZoomRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-xs ${
                  zoomRange === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles Bar */}
        <div className="flex flex-wrap items-center gap-3 py-2 text-xs border-b border-slate-800/60 text-slate-300">
          <span className="text-slate-400 text-[11px]">Display Layers:</span>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showActuals}
              onChange={e => setShowActuals(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-slate-300 inline-block" />
              Historical Sales (Actual)
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showConfidenceBand}
              onChange={e => setShowConfidenceBand(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2 bg-indigo-500/30 border border-indigo-400/40 inline-block rounded-sm" />
              Confidence Interval Band (yhat_lower/upper)
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAnomalies}
              onChange={e => setShowAnomalies(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Anomalies (Spikes & Drops)
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTestSplit}
              onChange={e => setShowTestSplit(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
            />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-purple-400 inline-block" />
              Holdout Test Period Cutoff
            </span>
          </label>
        </div>

        {/* SVG Time Series Chart */}
        <div className="relative mt-2 select-none overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto cursor-crosshair block"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* Gradient for confidence band */}
              <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
              </linearGradient>
              {/* Future forecast area subtle glow */}
              <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid Lines - Horizontal */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const yVal = minVal + pct * (maxVal - minVal);
              const yPos = getY(yVal);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={width - padding.right}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeDasharray={pct === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {Math.round(yVal).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Background shading for Future Forecast Horizon */}
            {futureStartIndex !== -1 && (
              <g>
                <rect
                  x={getX(futureStartIndex)}
                  y={padding.top}
                  width={width - padding.right - getX(futureStartIndex)}
                  height={innerHeight}
                  fill="url(#futureGrad)"
                />
                <line
                  x1={getX(futureStartIndex)}
                  y1={padding.top}
                  x2={getX(futureStartIndex)}
                  y2={padding.top + innerHeight}
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={getX(futureStartIndex) + 6}
                  y={padding.top + 16}
                  fill="#06b6d4"
                  fontSize="11"
                  fontWeight="600"
                >
                  Future Forecast Horizon ({forecastPeriods}d)
                </text>
              </g>
            )}

            {/* Holdout Test Split Marker Line */}
            {showTestSplit && testSplitIndex !== -1 && futureStartIndex !== -1 && (
              <g>
                <line
                  x1={getX(testSplitIndex)}
                  y1={padding.top}
                  x2={getX(testSplitIndex)}
                  y2={padding.top + innerHeight}
                  stroke="#a855f7"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={getX(testSplitIndex) - 6}
                  y={padding.top + 16}
                  fill="#c084fc"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="500"
                >
                  Holdout Test Split ({metrics.testDays}d)
                </text>
              </g>
            )}

            {/* Confidence Interval Band */}
            {showConfidenceBand && confidenceAreaPath && (
              <path
                d={confidenceAreaPath}
                fill="url(#confidenceGrad)"
                stroke="#6366f1"
                strokeWidth="0.75"
                strokeOpacity="0.4"
              />
            )}

            {/* Forecast Model Yhat Curve */}
            <path
              d={forecastLinePath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Actual Sales Curve */}
            {showActuals && actualLinePath && (
              <path
                d={actualLinePath}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1.75"
                strokeOpacity="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Anomaly Points Overlay */}
            {showAnomalies &&
              filteredData.map((p, i) => {
                const anom = anomalyMap.get(p.date);
                if (!anom || p.actual == null) return null;

                const cx = getX(i);
                const cy = getY(p.actual);
                const isSpike = anom.anomaly_type === 'spike';

                return (
                  <g key={p.date} className="cursor-pointer">
                    {/* Pulsing halo for extreme anomalies */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSpike ? 8 : 7}
                      fill={isSpike ? '#f43f5e' : '#0ea5e9'}
                      fillOpacity="0.25"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4.5}
                      fill={isSpike ? '#e11d48' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

            {/* Date X-Axis Tick Labels */}
            {filteredData.length > 0 &&
              [0, 0.2, 0.4, 0.6, 0.8, 1].map((pct, idx) => {
                const ptIdx = Math.min(
                  filteredData.length - 1,
                  Math.round(pct * (filteredData.length - 1))
                );
                const pt = filteredData[ptIdx];
                const xPos = getX(ptIdx);
                return (
                  <g key={idx}>
                    <line
                      x1={xPos}
                      y1={padding.top + innerHeight}
                      x2={xPos}
                      y2={padding.top + innerHeight + 6}
                      stroke="#475569"
                    />
                    <text
                      x={xPos}
                      y={padding.top + innerHeight + 18}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}

            {/* Interactive Scrubber Crosshair */}
            {hoveredPoint && (
              <g>
                {/* Vertical cursor guide */}
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={padding.top + innerHeight}
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
                {/* Active point indicator */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r={5}
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl backdrop-blur-md transition-all"
              style={{
                left: Math.min(Math.max(10, hoveredPoint.x - 120), width - 240),
                top: Math.max(10, hoveredPoint.y - 140)
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-2">
                <span className="font-semibold text-white flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {hoveredPoint.point.date}
                </span>
                {hoveredPoint.point.actual == null ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                    Future Forecast
                  </span>
                ) : hoveredPoint.point.is_test_period ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-medium">
                    Holdout Test
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Historical</span>
                )}
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                {hoveredPoint.point.actual != null && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Actual Sales:</span>
                    <span className="text-white font-bold">
                      {Math.round(hoveredPoint.point.actual).toLocaleString()} units
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-indigo-300">Predicted (yhat):</span>
                  <span className="text-indigo-200 font-semibold">
                    {Math.round(hoveredPoint.point.yhat).toLocaleString()} units
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-400">
                  <span>Confidence (90% CI):</span>
                  <span>
                    [{Math.round(hoveredPoint.point.yhat_lower)} – {Math.round(hoveredPoint.point.yhat_upper)}]
                  </span>
                </div>
              </div>

              {/* Anomaly Callout Banner in Tooltip */}
              {hoveredPoint.anomaly && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {hoveredPoint.anomaly.anomaly_type.toUpperCase()} (z = {hoveredPoint.anomaly.z_score})
                    </span>
                  </div>
                  {hoveredPoint.anomaly.notes && (
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                      {hoveredPoint.anomaly.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-100" />
              <span>Actual Sales</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400" />
              <span>Prophet Forecast (yhat)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 bg-indigo-500/25 border border-indigo-400/40 rounded-sm" />
              <span>Confidence Interval (yhat_lower/upper)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Flagged Spike</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Flagged Drop</span>
            </span>
          </div>
          <div className="text-slate-400">
            Hover along timeline to inspect daily decomposition & anomalies.
          </div>
        </div>
      </div>
    </div>
  );
};
