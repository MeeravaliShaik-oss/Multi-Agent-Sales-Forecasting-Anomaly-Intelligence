import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { PipelineExecutionResult } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PipelineExecutionResult;
  datasetName: string;
  reportText: string;
  isAiReport: boolean;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  result,
  datasetName,
  reportText,
  isAiReport
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const futurePoints = result.forecastFuture;
  const futureSum = futurePoints.reduce((acc, p) => acc + p.yhat, 0);
  const futureAvg = futurePoints.length ? Math.round(futureSum / futurePoints.length) : 0;
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-transparent" />
        
        {/* Modal Top Control Bar (Hidden when printing via no-print) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Print-Friendly Executive Report Preview</h3>
              <p className="text-[11px] text-slate-400">
                Optimized for clean A4/Letter paper or saving as PDF via your browser's print dialog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Trigger Browser Print (Save as PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Document Preview Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950/70 flex justify-center custom-scrollbar">
          {/* Printable White Sheet Document */}
          <div className="print-container bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200">
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 font-mono">
                    Multi-Agent Sales Forecasting System · Official Briefing
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5 tracking-tight">
                    Executive Forecast &amp; Anomaly Report
                  </h1>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-slate-600">
                  <div><strong>Date:</strong> {currentDateStr}</div>
                  <div><strong>Dataset:</strong> {datasetName}</div>
                  <div><strong>Engine:</strong> {isAiReport ? 'Gemini 3.8 Flash AI' : 'Deterministic Template'}</div>
                </div>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print-avoid-break">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Projected Demand</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {Math.round(futureSum).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-600">units</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  ~{futureAvg.toLocaleString()} / day
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Forecast Horizon</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {futurePoints.length} <span className="text-xs font-normal text-slate-600">days</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {futurePoints[0]?.date} to {futurePoints[futurePoints.length - 1]?.date}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Evaluation MAE</div>
                <div className="text-lg font-bold text-indigo-700 mt-0.5">
                  ±{result.metrics.MAE.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-600">units</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  RMSE: {result.metrics.RMSE}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Historical Anomalies</div>
                <div className="text-lg font-bold text-amber-700 mt-0.5">
                  {result.anomalies.length} <span className="text-xs font-normal text-slate-600">flagged</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Threshold: ±2.5σ
                </div>
              </div>
            </div>

            {/* Executive Prose Section */}
            <div className="mb-6 space-y-3.5 print-avoid-break">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Summary &amp; Managerial Analysis</span>
              </h2>

              <div className="text-xs text-slate-800 leading-relaxed space-y-2.5 font-sans">
                {reportText.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###') || paragraph.startsWith('##') || paragraph.startsWith('**')) {
                    return (
                      <div key={idx} className="font-bold text-slate-950 text-xs pt-1 uppercase">
                        {paragraph.replace(/^[#*\s]+|[#*\s]+$/g, '')}
                      </div>
                    );
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith(' - ')) {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-0.5 font-mono text-[11px] text-slate-800">
                        {paragraph.split('\n').map((line, lIdx) => (
                          <li key={lIdx}>{line.replace(/^[\s-]+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Flagged Anomalies Table Snapshot */}
            {result.anomalies.length > 0 && (
              <div className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Outlier Events for Store Review</span>
                </h2>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left font-mono text-[10.5px]">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3">Date</th>
                        <th className="py-1.5 px-3">Type</th>
                        <th className="py-1.5 px-3 text-right">Actual Sales</th>
                        <th className="py-1.5 px-3 text-right">30d Mean</th>
                        <th className="py-1.5 px-3 text-right">Z-Score</th>
                        <th className="py-1.5 px-3">Context / Diagnosis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {result.anomalies.slice(0, 8).map(anom => (
                        <tr key={anom.date}>
                          <td className="py-1.5 px-3 font-semibold">{anom.date}</td>
                          <td className="py-1.5 px-3">
                            <span
                              className={`font-bold ${
                                anom.anomaly_type === 'spike' ? 'text-rose-700' : 'text-sky-700'
                              }`}
                            >
                              {anom.anomaly_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-right font-bold">{anom.sales.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right text-slate-600">{anom.rolling_mean.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                            {anom.z_score > 0 ? `+${anom.z_score}` : anom.z_score}σ
                          </td>
                          <td className="py-1.5 px-3 font-sans text-slate-700 text-[10px]">
                            {anom.notes || 'Unusual operational variance'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.anomalies.length > 8 && (
                  <p className="text-[10px] text-slate-500 mt-1 italic font-mono">
                    Showing top 8 of {result.anomalies.length} flagged anomalies. Full audit log available in application.
                  </p>
                )}
              </div>
            )}

            {/* Prophet Seasonality Summary */}
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg print-avoid-break">
              <div className="flex items-center justify-between text-[11px] text-slate-700">
                <span>
                  <strong>Peak Day:</strong>{' '}
                  {result.seasonality.dayOfWeek.reduce((prev, curr) =>
                    curr.impact > prev.impact ? curr : prev
                  ).day}{' '}
                  (+{Math.max(...result.seasonality.dayOfWeek.map(d => d.impact))} units)
                </span>
                <span>
                  <strong>Annual Growth Rate:</strong>{' '}
                  {result.seasonality.annualGrowthRate > 0
                    ? `+${result.seasonality.annualGrowthRate}%`
                    : `${result.seasonality.annualGrowthRate}%`}
                </span>
              </div>
            </div>

            {/* Manager Sign-Off Stamp / Footer */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono print-avoid-break">
              <div>
                <span>Prepared by: Agent 4 (Explanation Agent)</span>
                <span className="mx-2">·</span>
                <span>Confidential Retail Report</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="block border-b border-slate-400 w-32 mb-1" />
                  <span>Store Manager Signature</span>
                </div>
                <div>
                  <span className="block border-b border-slate-400 w-24 mb-1" />
                  <span>Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar (Hidden when printing via no-print) */}
        <div className="no-print p-4 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Tip: In the print dialog, select <strong className="text-slate-200">"Save as PDF"</strong> as the destination printer.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
