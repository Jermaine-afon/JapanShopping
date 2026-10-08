import React, { useState, useMemo } from 'react';
import { ConsolidatedItem, CurrencyCode, StoreCategory } from '../types';
import { STORE_CATEGORIES } from '../data/storeCategories';
import { formatCurrency } from '../utils/currency';
import {
  Check,
  Eye,
  Search,
  Store,
  LayoutGrid,
  List,
  Plus,
  ShoppingBag,
} from 'lucide-react';

interface ConsolidatedListViewProps {
  items: ConsolidatedItem[];
  selectedCurrency: CurrencyCode;
  onTogglePurchased: (itemId: string) => void;
  onOpenClerkHelper: (item: ConsolidatedItem) => void;
  onOpenAddModal: () => void;
}

export const ConsolidatedListView: React.FC<ConsolidatedListViewProps> = ({
  items,
  selectedCurrency,
  onTogglePurchased,
  onOpenClerkHelper,
  onOpenAddModal,
}) => {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'bought'>('all');

  // Check unique stores present in items
  const uniqueStores = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category))).filter((cat) => cat !== 'other');
  }, [items]);

  // Check if any items have price specified
  const hasAnyPrices = useMemo(() => {
    return items.some((i) => i.estimatedPriceJpy > 0);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Store filter
      if (selectedStore !== 'all' && item.category !== selectedStore) {
        return false;
      }
      // Status filter
      if (statusFilter === 'pending' && item.isPurchased) return false;
      if (statusFilter === 'bought' && !item.isPurchased) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.productName.toLowerCase().includes(q);
        const matchesJp = item.japaneseName?.toLowerCase().includes(q) ?? false;
        const matchesRequester = item.requesters.some((r) =>
          r.requesterName.toLowerCase().includes(q)
        );
        const matchesNotes = item.notesSummary?.toLowerCase().includes(q) ?? false;
        return matchesName || matchesJp || matchesRequester || matchesNotes;
      }
      return true;
    });
  }, [items, selectedStore, statusFilter, searchQuery]);

  // If entire list is empty, show dedicated clean empty state
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-16 text-center shadow-xs">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Your Japan Shopping List is Empty
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
          Start adding requests from friends and family! When different people submit the same product, it will automatically combine their quantities together.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onOpenAddModal}
            className="px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm shadow-rose-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Item</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products, requesters, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Segmented Control & View Mode Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Status Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                To Buy ({items.filter((i) => !i.isPurchased).length})
              </button>
              <button
                onClick={() => setStatusFilter('bought')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'bought'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bought ({items.filter((i) => i.isPurchased).length})
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Store Category Filter Tabs (only if multiple stores exist) */}
        {uniqueStores.length > 1 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Store:
            </span>
            <button
              onClick={() => setSelectedStore('all')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
                selectedStore === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stores
            </button>
            {uniqueStores.map((catKey) => {
              const cat = STORE_CATEGORIES[catKey];
              const count = items.filter((i) => i.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedStore(catKey)}
                  className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap font-medium flex items-center gap-1.5 ${
                    selectedStore === catKey
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat?.name || catKey}</span>
                  <span className="font-mono text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State after search filtering */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No matching shopping items</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No items found matching your current filter.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            Add an Item
          </button>
        </div>
      )}

      {/* Grid Cards View */}
      {viewMode === 'cards' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const storeInfo = STORE_CATEGORIES[item.category];
            const hasPrice = item.estimatedPriceJpy > 0;
            const totalItemCostJpy = item.estimatedPriceJpy * item.totalQuantity;

            return (
              <div
                key={item.id}
                className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  item.isPurchased
                    ? 'border-emerald-200/80 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Card Top: Image & Quantity Badge */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden border-b border-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${
                        item.isPurchased ? 'grayscale-25 opacity-80' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5] mb-1" />
                      <span className="text-[11px]">No photo</span>
                    </div>
                  )}

                  {/* Top Bar overlays */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {/* Merged Total Quantity Pill */}
                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                      <span>Total:</span>
                      <span className="text-amber-300 font-mono text-sm">
                        {item.totalQuantity}
                      </span>
                      <span>pcs</span>
                    </div>

                    {/* Bought check toggle */}
                    <button
                      type="button"
                      onClick={() => onTogglePurchased(item.id)}
                      className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-colors shadow-md ${
                        item.isPurchased
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/90 text-slate-400 hover:text-slate-900 hover:bg-white'
                      }`}
                      title={item.isPurchased ? 'Mark as Pending' : 'Mark as Bought'}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Store badge if not "other" */}
                  {item.category !== 'other' && (
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                        {storeInfo?.name || item.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {/* Japanese text if provided */}
                    {item.japaneseName && (
                      <p className="text-xs text-rose-700 font-medium line-clamp-1">
                        {item.japaneseName}
                      </p>
                    )}

                    {/* Product Name */}
                    <h3
                      className={`text-sm font-bold leading-tight ${
                        item.isPurchased
                          ? 'text-slate-500 line-through'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.productName}
                    </h3>

                    {/* Price if set */}
                    {hasPrice && (
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          ¥{item.estimatedPriceJpy.toLocaleString()} each
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums">
                          · Total: ¥{totalItemCostJpy.toLocaleString()} (
                          {formatCurrency(totalItemCostJpy, selectedCurrency)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Consolidated Requester Breakdown */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Requesters Breakdown:</span>
                      <span className="text-slate-400 font-normal">
                        {item.requesters.length} {item.requesters.length === 1 ? 'person' : 'people'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {item.requesters.map((r, idx) => (
                        <div
                          key={`${r.requestId}-${idx}`}
                          className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border bg-slate-50 border-slate-200 text-slate-800"
                          title={r.notes ? `Remarks: ${r.notes}` : undefined}
                        >
                          <span className="font-semibold">{r.requesterName}</span>
                          <span className="font-mono font-bold text-rose-600">×{r.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Remarks if present */}
                    {item.notesSummary && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                        <span className="font-medium text-slate-700">Remarks: </span>
                        {item.notesSummary}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: In-store Clerk Helper CTA & Check-off status */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenClerkHelper(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Show large product card to Japanese store staff"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Show Clerk</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onTogglePurchased(item.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                        item.isPurchased
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.isPurchased ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Purchased</span>
                        </>
                      ) : (
                        <span>Mark Bought</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compact Table View */}
      {viewMode === 'table' && filteredItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4 w-16">Photo</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Total Qty</th>
                  <th className="py-3 px-4">Requesters Breakdown</th>
                  {hasAnyPrices && <th className="py-3 px-4 text-right">Price (JPY)</th>}
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        item.isPurchased ? 'bg-emerald-50/20 text-slate-500' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onTogglePurchased(item.id)}
                          className={`p-1 rounded-md transition-colors ${
                            item.isPurchased
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-300 hover:text-slate-900 border border-slate-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 max-w-xs">
                        <div
                          className={`font-semibold text-slate-900 ${
                            item.isPurchased ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {item.productName}
                        </div>
                        {item.notesSummary && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            Remarks: {item.notesSummary}
                          </div>
                        )}
                      </td>

                      {/* Total Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold font-mono text-sm">
                          {item.totalQuantity}
                        </span>
                      </td>

                      {/* Requesters Breakdown */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.requesters.map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium"
                            >
                              {r.requesterName} <strong className="text-rose-600">x{r.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Price if available */}
                      {hasAnyPrices && (
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                          {item.estimatedPriceJpy > 0 ? `¥${item.estimatedPriceJpy.toLocaleString()}` : '-'}
                        </td>
                      )}

                      {/* Show Clerk Action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenClerkHelper(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Clerk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
