import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCSVContent } from '../services/dataPresets';
import { RawSalesRow } from '../types';

interface UploadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: RawSalesRow[], name: string, dateCol: string, salesCol: string) => void;
}

export const UploadCSVModal: React.FC<UploadCSVModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<RawSalesRow[] | null>(null);
  const [availableCols, setAvailableCols] = useState<string[]>([]);
  const [dateCol, setDateCol] = useState('');
  const [salesCol, setSalesCol] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleProcessText = (rawContent: string, name: string = 'Uploaded CSV') => {
    try {
      setError(null);
      const res = parseCSVContent(rawContent);

      if (res.rows.length === 0) {
        throw new Error('No valid date and sales numeric rows found in the CSV.');
      }

      setFileName(name);
      setParsedData(res.rows);
      setAvailableCols(res.availableColumns);
      setDateCol(res.detectedDateCol);
      setSalesCol(res.detectedSalesCol);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
      setParsedData(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleProcessText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!parsedData || parsedData.length === 0) return;
    onDataLoaded(parsedData, fileName || 'Custom Dataset', dateCol, salesCol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Custom Sales CSV</h3>
              <p className="text-[11px] text-slate-400">Import your store POS, ERP, or Kaggle time-series CSV data</p>
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
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/80 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/60 hover:bg-slate-950 group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Click to select or drag &amp; drop a .csv file
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Superstore Sales, Kaggle datasets, store POS exports, or any 2-column time-series CSV.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Paste CSV Text Alternative */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-medium text-slate-300">Or paste raw CSV text:</span>
              <button
                type="button"
                onClick={() => {
                  const sample = `Order_Date,Sales,Category
2024-01-01,1250,Tech
2024-01-02,1100,Office
2024-01-03,1320,Furniture
2024-01-04,1400,Tech
2024-01-05,1900,Office
2024-01-06,2450,Tech
2024-01-07,1800,Furniture
2024-01-08,1290,Tech
2024-01-09,1340,Office
2024-01-10,1410,Tech
2024-01-11,1520,Furniture
2024-01-12,2100,Tech
2024-01-13,2600,Tech
2024-01-14,1950,Office`;
                  setCsvText(sample);
                  handleProcessText(sample, 'Quick Sample CSV');
                }}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] underline cursor-pointer font-mono"
              >
                Insert Sample Data
              </button>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={e => {
                setCsvText(e.target.value);
                if (e.target.value.trim()) {
                  handleProcessText(e.target.value, 'Pasted Data');
                }
              }}
              placeholder="Date,Sales&#10;2024-01-01,1500&#10;2024-01-02,1620..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Column Remapping and Parsed Preview */}
          {parsedData && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Successfully parsed {parsedData.length} records from "{fileName}"</span>
              </div>

              {/* Column selector */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                    Date Column:
                  </label>
                  <select
                    value={dateCol}
                    onChange={e => setDateCol(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {availableCols.map(col => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                    Sales Target Column:
                  </label>
                  <select
                    value={salesCol}
                    onChange={e => setSalesCol(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {availableCols.map(col => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table Preview */}
              <div>
                <span className="text-[11px] font-medium text-slate-400">First 4 Records Preview:</span>
                <div className="overflow-x-auto mt-1.5 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Sales Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {parsedData.slice(0, 4).map((row, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 text-slate-200">{row.date}</td>
                          <td className="py-2 px-3 font-bold text-white">{row.sales}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedData || parsedData.length === 0}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Load into 4-Agent Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
