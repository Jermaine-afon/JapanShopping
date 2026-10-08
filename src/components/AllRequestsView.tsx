import React, { useState } from 'react';
import { ShoppingItemRequest, CurrencyCode } from '../types';
import { STORE_CATEGORIES } from '../data/storeCategories';
import { formatCurrency } from '../utils/currency';
import { Trash2, User, ShoppingBag, Plus } from 'lucide-react';

interface AllRequestsViewProps {
  requests: ShoppingItemRequest[];
  selectedCurrency: CurrencyCode;
  onDeleteRequest: (id: string) => void;
  onOpenAddModal: () => void;
}

export const AllRequestsView: React.FC<AllRequestsViewProps> = ({
  requests,
  selectedCurrency,
  onDeleteRequest,
  onOpenAddModal,
}) => {
  const [selectedRequester, setSelectedRequester] = useState<string>('all');

  const requesters = Array.from(new Set(requests.map((r) => r.requesterName))).sort();

  const filteredRequests = requests.filter((r) => {
    if (selectedRequester !== 'all' && r.requesterName !== selectedRequester) {
      return false;
    }
    return true;
  });

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No requests submitted yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          When people submit what they want, all individual submissions will appear here.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Item</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Individual Request Submissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Raw requests submitted by friends and family before consolidation
          </p>
        </div>

        {/* Requester Filter */}
        <div className="flex items-center gap-2">
          {requesters.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <select
                value={selectedRequester}
                onChange={(e) => setSelectedRequester(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">Everyone ({requests.length})</option>
                {requesters.map((name) => {
                  const count = requests.filter((r) => r.requesterName === name).length;
                  return (
                    <option key={name} value={name}>
                      {name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* List of submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((req) => {
          const storeInfo = STORE_CATEGORIES[req.category];
          const hasPrice = (req.estimatedPriceJpy || 0) > 0;
          const totalCost = (req.estimatedPriceJpy || 0) * req.quantity;

          return (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Requester Tag & Timestamp */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                    <User className="w-3.5 h-3.5" />
                    <span>{req.requesterName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(req.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Product Info */}
                <div className="pt-3 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {req.imageUrl ? (
                      <img
                        src={req.imageUrl}
                        alt={req.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {req.japaneseName && (
                      <p className="text-[11px] text-rose-600 font-medium truncate">
                        {req.japaneseName}
                      </p>
                    )}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {req.productName}
                    </h4>
                    {req.category !== 'other' && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {storeInfo?.name || req.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                {req.notes && (
                  <p className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Remarks: </span>
                    {req.notes}
                  </p>
                )}
              </div>

              {/* Bottom Qty & Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Quantity: {req.quantity}x
                  </span>
                  {hasPrice && (
                    <span className="text-[11px] text-slate-500 ml-1.5 tabular-nums">
                      · ¥{totalCost.toLocaleString()} ({formatCurrency(totalCost, selectedCurrency)})
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onDeleteRequest(req.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete this request"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
