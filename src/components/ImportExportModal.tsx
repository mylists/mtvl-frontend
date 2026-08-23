import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Upload, X } from 'lucide-react';
import { servicesApi, toImportPayload } from '../api/client';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [overwrite, setOverwrite] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const data = await servicesApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mtvl-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Export downloaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Export failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setMessage({ type: 'error', text: 'Please paste valid JSON data to import.' });
      return;
    }

    try {
      setIsProcessing(true);
      const parsed = JSON.parse(jsonText.trim());
      const result = await servicesApi.importData(toImportPayload(parsed, overwrite));
      const imported = result.imported;
      setMessage({
        type: 'success',
        text: `Imported ${imported.movies} movies, ${imported.tv_shows} TV shows, ${imported.books} books.`,
      });
      onRefreshData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || 'Invalid JSON payload',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white mb-1">Import & Export Library</h2>
        <p className="text-xs text-slate-400 mb-6">
          Backup the shared catalog and your personal lists, or restore items onto your list.
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Catalog & Lists</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Download the shared catalog plus your list links as a portable `.json` file.
            </p>
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Export JSON File
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Import Collection</span>
            </h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="radio"
                  name="mode"
                  value="merge"
                  checked={!overwrite}
                  onChange={() => setOverwrite(false)}
                  className="accent-indigo-500"
                />
                <span>Merge (Keep existing list)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-rose-300">
                <input
                  type="radio"
                  name="mode"
                  value="replace"
                  checked={overwrite}
                  onChange={() => setOverwrite(true)}
                  className="accent-rose-500"
                />
                <span>Overwrite (Replace your list)</span>
              </label>
            </div>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <textarea
              rows={4}
              placeholder="Or paste JSON payload here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full glass-input p-3 rounded-xl text-xs font-mono"
            />

            <button
              onClick={handleImport}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              {isProcessing ? 'Processing...' : 'Run Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
