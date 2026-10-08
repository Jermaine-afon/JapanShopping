import React, { useState } from 'react';
import { ConsolidatedItem, CurrencyCode } from '../types';
import {
  generateConsolidatedCsv,
  downloadCsvFile,
  generateTextSummary,
} from '../utils/consolidation';
import { formatCurrency } from '../utils/currency';
import {
  X,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  FileText,
  Download,
  Share2,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ConsolidatedItem[];
  selectedCurrency: CurrencyCode;
  onTriggerPrint: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedCurrency,
  onTriggerPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalUnits = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalCost = items.reduce(
    (sum, item) => sum + item.estimatedPriceJpy * item.totalQuantity,
    0
  );

  const handleDownloadCsv = () => {
    const csvData = generateConsolidatedCsv(items);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(csvData, `Japan_Consolidated_Shopping_List_${dateStr}.csv`);
    setDownloadSuccess('CSV Spreadsheet downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCopyText = async () => {
    const text = generateTextSummary(items);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `japan_shopping_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess('JSON Backup downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Download Consolidated Shopping List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your preferred format to take with you while traveling in Japan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick summary stats */}
        <div className="bg-rose-50/60 border-b border-rose-100/80 px-6 py-3 flex items-center justify-between text-xs text-rose-950">
          <div>
            <span className="font-semibold">{items.length}</span> merged items ·{' '}
            <span className="font-semibold">{totalUnits}</span> total units
          </div>
          <div className="font-bold tabular-nums">
            {totalCost > 0
              ? `Est. ¥${totalCost.toLocaleString()} (${formatCurrency(totalCost, selectedCurrency)})`
              : `${totalUnits} total units`}
          </div>
        </div>

        {/* Options Grid */}
        <div className="p-6 space-y-4">
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Option 1: CSV / Excel Download */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  CSV / Excel Spreadsheet (.csv)
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Most Popular
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Includes total merged quantities, individual requester breakdowns, Japanese names, estimated unit/total prices, and store locations. UTF-8 BOM encoded for Excel & Google Sheets.
              </p>
              <button
                onClick={handleDownloadCsv}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .CSV File</span>
              </button>
            </div>
          </div>

          {/* Option 2: Print or Save as PDF Checklist */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Print or Save as PDF Shopping Checklist
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Generates a clean paper checklist formatted with checkboxes, product photos, Japanese store headings, and requester allocations.
              </p>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onTriggerPrint(), 100);
                }}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Printable / Save as PDF</span>
              </button>
            </div>
          </div>

          {/* Option 3: Copy Text for LINE / WhatsApp */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Copy Formatted Text for Messaging
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Clean text format grouped by store with checkbox emojis. Ideal for sharing directly in WhatsApp, LINE groups, or pasting into Apple Notes.
              </p>
              <button
                onClick={handleCopyText}
                className={`mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs ${
                  copied
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 4: Raw JSON Backup */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Need raw data backup?</span>
            <button
              onClick={handleDownloadJson}
              className="text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Raw JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
