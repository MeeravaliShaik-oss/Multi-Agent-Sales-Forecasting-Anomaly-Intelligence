import React from 'react';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecastPeriods: number;
  setForecastPeriods: (val: number) => void;
  testDays: number;
  setTestDays: (val: number) => void;
  anomalyWindow: number;
  setAnomalyWindow: (val: number) => void;
  anomalyThreshold: number;
  setAnomalyThreshold: (val: number) => void;
  onApplyAndRerun: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  forecastPeriods,
  setForecastPeriods,
  testDays,
  setTestDays,
  anomalyWindow,
  setAnomalyWindow,
  anomalyThreshold,
  setAnomalyThreshold,
  onApplyAndRerun
}) => {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setForecastPeriods(30);
    setTestDays(30);
    setAnomalyWindow(30);
    setAnomalyThreshold(2.5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Agent Tuning &amp; Hyperparameters</h3>
              <p className="text-[11px] text-slate-400">Configure Prophet horizon and rolling Z-score parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Agent 2 Parameters */}
          <div className="space-y-3 pb-4 border-b border-slate-800/80">
            <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Agent 2: Forecasting Parameters</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                <span>Forecast Horizon:</span>
                <span className="font-mono text-indigo-400 font-bold">{forecastPeriods} days</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[14, 30, 60, 90].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForecastPeriods(val)}
                    className={`py-2 rounded-xl border font-mono font-medium transition-all cursor-pointer text-xs ${
                      forecastPeriods === val
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 font-semibold'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {val}d
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Future projection period beyond the latest historical sales record.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                <span>Holdout Validation Split (test_days):</span>
                <span className="font-mono text-purple-400 font-bold">{testDays} days</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[14, 30, 60].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTestDays(val)}
                    className={`py-2 rounded-xl border font-mono font-medium transition-all cursor-pointer text-xs ${
                      testDays === val
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 font-semibold'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {val}d holdout
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Recent days held out to compute out-of-sample MAE and RMSE metrics.
              </p>
            </div>
          </div>

          {/* Agent 3 Parameters */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Agent 3: Anomaly Detection Parameters</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                <span>Rolling Window Size:</span>
                <span className="font-mono text-amber-400 font-bold">{anomalyWindow} days</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 60].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAnomalyWindow(val)}
                    className={`py-2 rounded-xl border font-mono font-medium transition-all cursor-pointer text-xs ${
                      anomalyWindow === val
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30 font-semibold'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {val}d
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Moving lookback window for rolling mean (μ) and standard deviation (σ).
              </p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                <span>Z-Score Outlier Threshold (σ):</span>
                <span className="font-mono text-rose-400 font-bold">±{anomalyThreshold}σ</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1.5, 2.0, 2.5, 3.0, 3.5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAnomalyThreshold(val)}
                    className={`py-2 rounded-xl border font-mono font-medium transition-all cursor-pointer text-xs ${
                      anomalyThreshold === val
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 font-semibold'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {val}σ
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Higher thresholds flag only extreme shifts; lower thresholds flag subtle fluctuations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyAndRerun();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply &amp; Re-run Agents</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
