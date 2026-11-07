import React, { useState } from 'react';
import {
  Database,
  TrendingUp,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AgentStep, AgentLog, PipelineExecutionResult } from '../types';

interface AgentPipelineTrackerProps {
  currentStep: AgentStep;
  result: PipelineExecutionResult | null;
  logs: AgentLog[];
  isRunning: boolean;
  onSelectAgentInspector?: (agentIndex: number) => void;
}

export const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  currentStep,
  result,
  logs,
  isRunning,
  onSelectAgentInspector
}) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [copied, setCopied] = useState(false);

  const agents = [
    {
      num: 1,
      id: 'preprocessing',
      name: 'Agent 1: Preprocessing',
      role: 'Time-Series Aggregation & Features',
      icon: Database,
      summary: result
        ? `${result.cleanedData.length} daily points · lag_7 engineered`
        : 'Awaiting raw transaction rows...',
      accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
    },
    {
      num: 2,
      id: 'forecasting',
      name: 'Agent 2: Forecasting',
      role: 'Prophet Additive Modeling',
      icon: TrendingUp,
      summary: result
        ? `MAE: ±${result.metrics.MAE} · RMSE: ${result.metrics.RMSE}`
        : 'Trend & Seasonality fitting...',
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    },
    {
      num: 3,
      id: 'anomaly',
      name: 'Agent 3: Anomaly Detection',
      role: 'Rolling Z-Score Sweeping (±2.5σ)',
      icon: AlertTriangle,
      summary: result
        ? `${result.anomalies.length} outliers detected`
        : 'Rolling 30-day sigma sweep...',
      accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      num: 4,
      id: 'explanation',
      name: 'Agent 4: Explanation',
      role: 'Executive Briefing & AI Synthesis',
      icon: Bot,
      summary: result
        ? 'Executive report & advisory ready'
        : 'Managerial synthesis...',
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    }
  ];

  const getStepStatus = (agentId: string) => {
    if (result) return 'completed';
    if (!isRunning) return 'idle';

    const order = ['preprocessing', 'forecasting', 'anomaly', 'explanation'];
    const currentIdx = order.indexOf(currentStep);
    const thisIdx = order.indexOf(agentId);

    if (currentIdx === thisIdx) return 'running';
    if (currentIdx > thisIdx) return 'completed';
    return 'idle';
  };

  const handleCopyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.agent}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 relative transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Autonomous Multi-Agent Pipeline
          </h2>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-slate-400">
            {isRunning ? (
              <span className="text-cyan-400 inline-flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Pipeline Active
              </span>
            ) : result ? (
              <span className="text-emerald-400 font-medium">Completed in {result.executionTimeMs}ms</span>
            ) : (
              'Standing by'
            )}
          </span>
        </div>

        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 transition-colors cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Execution Log</span>
          {showTerminal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 4 Agent Pipeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5">
        {agents.map((agent, index) => {
          const status = getStepStatus(agent.id);
          const Icon = agent.icon;
          const isRunningThis = status === 'running';
          const isCompletedThis = status === 'completed';

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgentInspector?.(index + 1)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isRunningThis
                  ? 'bg-slate-900/90 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                  : isCompletedThis
                  ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
                  : 'bg-slate-950/40 border-slate-900/80 opacity-60'
              }`}
            >
              {/* Active Agent Glowing Top Sheen */}
              {isRunningThis && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isRunningThis
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse'
                        : isCompletedThis
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-slate-950 border-slate-900 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">
                      {agent.name}
                    </div>
                    <div className="text-[10.5px] text-slate-400 truncate max-w-[150px]">
                      {agent.role}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {isCompletedThis && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {isRunningThis && (
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  )}
                  {!isCompletedThis && !isRunningThis && (
                    <div className="w-2 h-2 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 truncate">{agent.summary}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Execution Terminal */}
      {showTerminal && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 animate-in fade-in duration-200">
          <div className="bg-[#05080f] border border-slate-800/90 rounded-xl p-3.5 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-900 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>stdout stream (sequential execution traces)</span>
              </div>
              <button
                onClick={handleCopyLogs}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="font-mono text-[11px] max-h-48 overflow-y-auto space-y-1 pr-2">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-2">No execution logs in buffer. Click "Execute Pipeline" to run.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0 text-[10px] select-none">[{log.timestamp}]</span>
                    <span
                      className={`shrink-0 font-semibold text-[10px] ${
                        log.level === 'error'
                          ? 'text-rose-400'
                          : log.level === 'success'
                          ? 'text-emerald-400'
                          : 'text-indigo-400'
                      }`}
                    >
                      [{log.agent}]
                    </span>
                    <span className="text-slate-300 break-words">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
