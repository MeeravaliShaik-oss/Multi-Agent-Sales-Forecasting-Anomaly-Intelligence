import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Bookmark,
  Trash2,
  Clock,
  Printer,
  LogIn,
  Check,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  SavedForecastItem,
  getUserSavedForecasts,
  deleteSavedForecast,
  saveForecastToFirestore
} from '../services/firebase';
import { PipelineExecutionResult } from '../types';

interface SavedForecastsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResult: PipelineExecutionResult | null;
  datasetName: string;
  forecastPeriods: number;
  onOpenPrintForForecast?: (forecast: SavedForecastItem) => void;
}

const LOCAL_STORAGE_KEY = 'saved_forecasts_local_cache';

export const SavedForecastsModal: React.FC<SavedForecastsModalProps> = ({
  isOpen,
  onClose,
  currentResult,
  datasetName,
  forecastPeriods,
  onOpenPrintForForecast
}) => {
  const { user, signInWithGoogleAccount } = useAuth();
  const [savedList, setSavedList] = useState<SavedForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingCurrent, setSavingCurrent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSavedItems();
    }
  }, [isOpen, user]);

  const loadSavedItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.isFirebaseUser) {
        const items = await getUserSavedForecasts(user.uid);
        setSavedList(items);
      } else {
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
        setSavedList(raw ? JSON.parse(raw) : []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrent = async () => {
    if (!user || !currentResult || savingCurrent) return;
    setSavingCurrent(true);
    try {
      const payload = {
        datasetName,
        forecastPeriods,
        mae: currentResult.metrics.MAE,
        rmse: currentResult.metrics.RMSE,
        mape: currentResult.metrics.MAPE,
        anomaliesCount: currentResult.anomalies.length,
        executiveSummary: currentResult.aiExplanation || currentResult.templateExplanation,
        isAi: Boolean(currentResult.aiExplanation)
      };

      if (user.isFirebaseUser) {
        await saveForecastToFirestore(user.uid, payload);
      } else {
        const newItem: SavedForecastItem = {
          ...payload,
          id: `fc_${Date.now()}`,
          userId: user.uid,
          createdAt: new Date().toISOString()
        };
        const next = [newItem, ...savedList];
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(next));
      }

      setSavedSuccess(true);
      await loadSavedItems();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('Save notice:', err);
    } finally {
      setSavingCurrent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      if (user.isFirebaseUser) {
        await deleteSavedForecast(id);
      } else {
        const next = savedList.filter(item => item.id !== id);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(next));
      }
      setSavedList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn('Delete notice:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Persistent Forecast Database</h3>
              <p className="text-[11px] text-slate-400">
                Store, review, and compare historical forecast runs and error metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {!user ? (
            <div className="text-center py-8 bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
              <LogIn className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-white">Sign in to Store Historical Forecasts</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Connect your account via Firebase Auth to persist forecast runs, error statistics, and executive memos across browser sessions.
              </p>
              <button
                onClick={signInWithGoogleAccount}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 mx-auto cursor-pointer transition-all shadow-md shadow-indigo-600/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            </div>
          ) : (
            <>
              {/* Save Current Run CTA Card */}
              {currentResult && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500" />
                  <div className="pl-2">
                    <div className="font-semibold text-white text-xs flex items-center gap-2">
                      <span>Save Current Run: {datasetName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {forecastPeriods}d Horizon
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-2">
                      <span>MAE: ±{currentResult.metrics.MAE}</span>
                      <span>·</span>
                      <span>RMSE: {currentResult.metrics.RMSE}</span>
                      <span>·</span>
                      <span>{currentResult.anomalies.length} anomalies</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCurrent}
                    disabled={savingCurrent}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Saved!</span>
                      </>
                    ) : savingCurrent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Run</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Saved Forecasts List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-slate-300 text-xs uppercase tracking-wider font-mono">
                    Saved Forecast Runs ({savedList.length})
                  </span>
                  <button
                    onClick={loadSavedItems}
                    disabled={loading}
                    className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-500 italic">
                    Retrieving stored records...
                  </div>
                ) : savedList.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 italic bg-slate-950/40 rounded-2xl border border-slate-800">
                    No forecasts saved yet. Click "Save Run" above to persist your current forecast!
                  </div>
                ) : (
                  savedList.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{item.datasetName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                            {item.forecastPeriods}d Horizon
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                          <span>MAE: ±{item.mae}</span>
                          <span>·</span>
                          <span>RMSE: {item.rmse}</span>
                          <span>·</span>
                          <span>Anomalies: {item.anomaliesCount}</span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Saved on {new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onOpenPrintForForecast && (
                          <button
                            onClick={() => onOpenPrintForForecast(item)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer hover:text-white"
                            title="Print / Export this saved run"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all cursor-pointer"
                          title="Delete saved run"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
            Signed in as: <strong className="text-slate-300">{user?.email || 'Guest'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
