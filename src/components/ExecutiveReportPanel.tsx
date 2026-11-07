import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  FileText,
  Copy,
  Check,
  Download,
  Send,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { PipelineExecutionResult } from '../types';
import { PrintReportModal } from './PrintReportModal';

interface ExecutiveReportPanelProps {
  result: PipelineExecutionResult | null;
  datasetName: string;
  onRegenerateAiExplanation: () => Promise<void>;
  isGeneratingAi: boolean;
}

export const ExecutiveReportPanel: React.FC<ExecutiveReportPanelProps> = ({
  result,
  datasetName,
  onRegenerateAiExplanation,
  isGeneratingAi
}) => {
  const [reportMode, setReportMode] = useState<'ai' | 'template'>('ai');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: "Hello! I am Agent 4 (Explanation & Business Intelligence Agent). I have analyzed the Facebook Prophet seasonal curves and rolling Z-score anomaly logs. What specific inventory, scheduling, or risk guidance can I provide?",
      time: 'Ready'
    }
  ]);
  const [isAskingChat, setIsAskingChat] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!result) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
        <Bot className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Agent 4 Pending Execution</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Execute the 4-agent pipeline to generate the Prophet forecast, anomaly audit logs, and the executive memorandum.
        </p>
      </div>
    );
  }

  const currentReportText =
    reportMode === 'ai' && result.aiExplanation
      ? result.aiExplanation
      : result.templateExplanation;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentReportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive_forecast_memorandum_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAskingChat) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setIsAskingChat(true);

    try {
      const avgForecast = Math.round(
        result.forecastFuture.reduce((s, p) => s + p.yhat, 0) / Math.max(1, result.forecastFuture.length)
      );

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          context: {
            datasetName,
            periods: result.forecastFuture.length,
            metrics: result.metrics,
            anomaliesCount: result.anomalies.length,
            avgForecast
          }
        })
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'No response generated.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      // Fallback rule-based answering
      const avgVal = Math.round(
        result.forecastFuture.reduce((s, p) => s + p.yhat, 0) / result.forecastFuture.length
      );
      const fallback = `Based on the latest Prophet analysis for ${datasetName}: The model indicates an average daily demand of ~${avgVal.toLocaleString()} units. With an MAE of ±${result.metrics.MAE}, maintain a safety stock buffer of at least ${(result.metrics.MAE * 1.5).toFixed(0)} units to absorb unexpected demand shifts during peak seasonality days.`;

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: fallback, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } finally {
      setIsAskingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner with Obsidian Glass */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Agent 4: Executive Explanation &amp; Decision Support
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grounded Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Translates Facebook Prophet curves and statistical outlier Z-scores into clear operational actions for managers.
              </p>
            </div>
          </div>

          {/* Toggle between AI LLM vs Section 7.1 Template & Document Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setReportMode('ai')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer text-xs ${
                  reportMode === 'ai'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Gemini 3.8 Flash AI</span>
              </button>
              <button
                onClick={() => setReportMode('template')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer text-xs ${
                  reportMode === 'template'
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Deterministic Template</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-600"
              title="Copy markdown text to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:border-slate-600"
              title="Download executive briefing as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export .md</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/20 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Open print preview and export high-contrast PDF document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Formatted Executive Memorandum (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/80 via-cyan-500/80 to-transparent" />
            
            {/* Memo Header Banner */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                  {reportMode === 'ai' ? 'CONFIDENTIAL EXECUTIVE MEMO (GEMINI 3.8 FLASH)' : 'OFFICIAL DETERMINISTIC BRIEFING (SECTION 7.1)'}
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5 tracking-tight">
                  Demand Forecast &amp; Operational Risk Advisory
                </h3>
              </div>

              {reportMode === 'ai' && (
                <button
                  onClick={onRegenerateAiExplanation}
                  disabled={isGeneratingAi}
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            {/* Document Metadata Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-5 font-mono text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Target Entity</span>
                <span className="text-slate-200 font-semibold">{datasetName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Projection Horizon</span>
                <span className="text-cyan-400 font-semibold">{result.forecastFuture.length} Days</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Model Error</span>
                <span className="text-indigo-400 font-semibold">MAE: ±{result.metrics.MAE}</span>
              </div>
            </div>

            {/* Rendered Memo Body */}
            <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed space-y-3.5 font-sans">
              {currentReportText.split('\n\n').map((paragraph, idx) => {
                // Section Headers
                if (paragraph.startsWith('###') || paragraph.startsWith('##') || paragraph.startsWith('**')) {
                  return (
                    <div
                      key={idx}
                      className="font-bold text-white text-sm pt-2 pb-1 border-b border-slate-800/60 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-3.5 bg-cyan-500 rounded-sm inline-block" />
                      <span>{paragraph.replace(/^[#*\s]+|[#*\s]+$/g, '')}</span>
                    </div>
                  );
                }
                // Bullet points
                if (paragraph.startsWith('- ') || paragraph.startsWith(' - ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1 font-mono text-xs text-slate-300">
                      {paragraph.split('\n').map((line, lIdx) => (
                        <li key={lIdx} className="leading-relaxed">
                          {line.replace(/^[\s-]+/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-300">{paragraph}</p>;
              })}
            </div>

            {/* Manager Sign-Off Placeholder */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div>
                <span>Audited By: <strong className="text-slate-300">Agent 4 Intelligence System</strong></span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="block border-b border-slate-700 w-28 mb-1" />
                  <span className="text-[10px] text-slate-500">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive "Ask Agent 4" Chat Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[560px] glass-panel rounded-2xl p-5 shadow-sm justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/80 via-indigo-500/80 to-transparent" />
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Ask Agent 4 · Store Q&amp;A
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block">Context-Aware Conversational Advisory</span>
                </div>
              </div>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {[
                'How to handle weekend spikes?',
                'Why is MAE important?',
                'Explain largest anomaly',
                'Recommended safety stock'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setChatInput(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer font-mono"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Scrollable Conversation */}
            <div className="space-y-3 overflow-y-auto max-h-[330px] pr-1.5 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-800/90 rounded-bl-none font-sans shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                    {msg.role === 'user' ? 'Store Manager' : 'Agent 4'} · {msg.time}
                  </span>
                </div>
              ))}
              {isAskingChat && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 py-1.5 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Agent 4 consulting Prophet curves &amp; Z-scores...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800/80 mt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask inventory, staffing, or error metrics question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isAskingChat}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={isAskingChat || !chatInput.trim()}
                className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Print-Friendly PDF Preview & Browser Print Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={result}
        datasetName={datasetName}
        reportText={currentReportText}
        isAiReport={reportMode === 'ai' && Boolean(result.aiExplanation)}
      />
    </div>
  );
};
