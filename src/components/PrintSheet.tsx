import React from 'react';
import { ConsolidatedItem, CurrencyCode, StoreCategory } from '../types';
import { STORE_CATEGORIES } from '../data/storeCategories';
import { formatCurrency } from '../utils/currency';

interface PrintSheetProps {
  items: ConsolidatedItem[];
  selectedCurrency: CurrencyCode;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ items, selectedCurrency }) => {
  const totalUnits = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalCost = items.reduce(
    (sum, item) => sum + item.estimatedPriceJpy * item.totalQuantity,
    0
  );

  // Group by store
  const byStore = React.useMemo(() => {
    const groups: Record<string, ConsolidatedItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  return (
    <div className="print-only p-4 max-w-4xl mx-auto text-black font-sans bg-white">
      {/* Print Document Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              JAPAN SHOPPING LIST · 日本買い物リスト
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Consolidated Buyer Checklist · Auto-merged Identical Items
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-neutral-600">Total Unique Items: {items.length}</p>
            <p className="text-neutral-600">Total Units: {totalUnits} pcs</p>
            {totalCost > 0 && (
              <p className="font-bold mt-1 text-sm">
                Est. Total: ¥{totalCost.toLocaleString()} ({formatCurrency(totalCost, selectedCurrency)})
              </p>
            )}
          </div>
        </div>

        {/* In-store polite reminder for buyer */}
        <div className="mt-3 p-2 bg-neutral-100 rounded text-[11px] flex justify-between">
          <span>
            💡 Tax-Free Notice: Spend &ge; ¥5,500 at Don Quijote / Drugstores for 10% tax exemption. Keep passport ready.
          </span>
          <span className="font-mono">
            店員さんへの声掛け: 「すみません、これありますか？」
          </span>
        </div>
      </div>

      {/* Store Groups */}
      <div className="space-y-6">
        {Object.entries(byStore).map(([categoryKey, storeItems]) => {
          const storeInfo = STORE_CATEGORIES[categoryKey as StoreCategory];
          const storeSubtotal = storeItems.reduce(
            (sum, item) => sum + item.estimatedPriceJpy * item.totalQuantity,
            0
          );

          return (
            <div key={categoryKey} className="page-break-inside-avoid">
              {/* Store Header */}
              <div className="bg-neutral-900 text-white px-3 py-1.5 flex justify-between items-center rounded-sm text-xs font-bold uppercase mb-2">
                <span>
                  📍 {storeInfo?.name || categoryKey} ({storeInfo?.japaneseName || ''})
                </span>
                <span className="font-normal font-mono text-[11px]">
                  Subtotal: ¥{storeSubtotal.toLocaleString()} · {storeItems.length} items
                </span>
              </div>

              {/* Items Table for this store */}
              <table className="w-full text-left text-xs border border-neutral-300 border-collapse mb-4">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-300 text-[11px] font-bold text-neutral-700">
                    <th className="p-2 w-10 text-center">Buy</th>
                    <th className="p-2 w-14">Photo</th>
                    <th className="p-2">Product Name & Japanese (日本語)</th>
                    <th className="p-2 text-center w-20">Total Qty</th>
                    <th className="p-2">Requesters & Notes</th>
                    <th className="p-2 text-right w-24">Est. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {storeItems.map((item, idx) => (
                    <tr key={item.id} className="page-break-inside-avoid">
                      {/* Checkbox */}
                      <td className="p-2 text-center align-middle">
                        <div className="w-4 h-4 border-2 border-black rounded mx-auto" />
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="p-2 align-middle">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded border border-neutral-300"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-100 border border-neutral-300 rounded flex items-center justify-center text-[9px] text-neutral-400">
                            No Pic
                          </div>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="p-2 align-middle">
                        <div className="font-bold text-xs leading-tight">
                          {item.productName}
                        </div>
                        {item.japaneseName && (
                          <div className="text-[11px] text-neutral-600 font-medium">
                            {item.japaneseName}
                          </div>
                        )}
                      </td>

                      {/* Total Quantity */}
                      <td className="p-2 text-center align-middle">
                        <span className="font-black text-sm px-2 py-0.5 bg-neutral-200 rounded font-mono">
                          {item.totalQuantity}x
                        </span>
                      </td>

                      {/* Requesters Breakdown */}
                      <td className="p-2 align-middle text-[11px]">
                        <div className="font-medium text-neutral-900">
                          {item.requesters
                            .map((r) => `${r.requesterName} (×${r.quantity})`)
                            .join(', ')}
                        </div>
                        {item.notesSummary && (
                          <div className="text-neutral-500 italic mt-0.5">
                            Note: {item.notesSummary}
                          </div>
                        )}
                      </td>

                      {/* Est. Total */}
                      <td className="p-2 text-right align-middle font-mono font-bold text-xs whitespace-nowrap">
                        {item.estimatedPriceJpy > 0
                          ? `¥${(item.estimatedPriceJpy * item.totalQuantity).toLocaleString()}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-neutral-400 text-center text-[10px] text-neutral-500">
        Printed via Japan Haul — Consolidated Shopping List Concierge
      </div>
    </div>
  );
};
