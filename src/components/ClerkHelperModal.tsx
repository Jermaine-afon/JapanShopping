import React from 'react';
import { ConsolidatedItem } from '../types';
import { X, Volume2, Store } from 'lucide-react';
import { STORE_CATEGORIES } from '../data/storeCategories';

interface ClerkHelperModalProps {
  item: ConsolidatedItem | null;
  onClose: () => void;
}

export const ClerkHelperModal: React.FC<ClerkHelperModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const storeInfo = STORE_CATEGORIES[item.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-200">
              Show to Store Clerk · 店員さんに見せる画面
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Japanese In-Store Card Body */}
        <div className="p-6 space-y-5 text-center">
          {/* Key phrase */}
          <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 text-center">
            <p className="text-xs text-rose-700 font-medium tracking-wide">
              すみません、この商品を探しています。在庫はありますか？
            </p>
            <p className="text-[11px] text-rose-500 mt-0.5">
              (Excuse me, I am looking for this product. Is it in stock?)
            </p>
          </div>

          {/* Product Image */}
          <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-inner">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-4">
                <Store className="w-12 h-12 stroke-[1.5] mb-2" />
                <span className="text-xs">No image provided</span>
              </div>
            )}
          </div>

          {/* Japanese Product Name */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {item.japaneseName || item.productName}
            </h2>
            {item.japaneseName && (
              <p className="text-sm text-slate-500 font-medium">{item.productName}</p>
            )}
          </div>

          {/* Quantity Callout for Staff */}
          <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-xl text-amber-950">
            <span className="text-xs font-semibold uppercase text-amber-700">希望数量 (Quantity):</span>
            <span className="text-2xl font-bold tabular-nums text-amber-900">
              {item.totalQuantity} 個
            </span>
            <span className="text-xs text-amber-600">({item.totalQuantity} units)</span>
          </div>

          {/* Notes if any */}
          {item.notesSummary && (
            <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 text-left border border-slate-200">
              <span className="font-semibold text-slate-700">Buyer Notes: </span>
              {item.notesSummary}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 px-6 flex items-center justify-between text-xs text-slate-500">
          <span>Target Store: {storeInfo?.name || 'Any'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
