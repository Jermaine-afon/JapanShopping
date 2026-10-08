import React from 'react';
import { CurrencyCode } from '../types';
import { formatCurrency, CURRENCIES } from '../utils/currency';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  consolidatedCount: number;
  totalUnits: number;
  totalEstJpy: number;
  purchasedCount: number;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (curr: CurrencyCode) => void;
  onResetDemoData: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  consolidatedCount,
  totalUnits,
  totalEstJpy,
  purchasedCount,
  selectedCurrency,
  setSelectedCurrency,
  onResetDemoData,
}) => {
  const percentComplete = consolidatedCount > 0 ? Math.round((purchasedCount / consolidatedCount) * 100) : 0;
  const estTaxSaved = Math.round(totalEstJpy * 0.1);

  return (
    <section className="bg-white border-b border-slate-200/90 py-5 px-4 sm:px-6 lg:px-8 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Title & Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-rose-600">Japan Trip 2026</span>
              <span aria-hidden="true">·</span>
              <span>Buyer Shopping Concierge</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Auto-merged duplicates
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Consolidated Japan Shopping List
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              All friends & family requests merged into a single consolidated checklist. Identical items are automatically aggregated with individual quantity breakdowns.
            </p>
          </div>

          {/* Right Metrics & Currency Toggle */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code}>
                    {code} ({CURRENCIES[code as CurrencyCode].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Demo Data button */}
            <button
              onClick={onResetDemoData}
              title="Reset with sample Japan shopping data"
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Merged Products
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {consolidatedCount}
              </span>
              <span className="text-xs text-slate-500">unique items</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Units to Buy
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {totalUnits}
              </span>
              <span className="text-xs text-slate-500">units total</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Est. Total Cost
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalEstJpy, selectedCurrency)}
              </span>
              {selectedCurrency !== 'JPY' && (
                <span className="text-xs text-slate-500 tabular-nums">
                  (¥{totalEstJpy.toLocaleString()})
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <span>Shopping Progress</span>
              <span className="text-slate-700 font-semibold tabular-nums">{percentComplete}%</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{purchasedCount} of {consolidatedCount} bought</span>
              <span className="text-emerald-700 font-medium">10% Tax-Free eligible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
