/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingItemRequest, ConsolidatedItem, CurrencyCode } from './types';
import { INITIAL_REQUESTS } from './data/initialData';
import { consolidateRequests } from './utils/consolidation';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { ConsolidatedListView } from './components/ConsolidatedListView';
import { AllRequestsView } from './components/AllRequestsView';
import { SettlementView } from './components/SettlementView';
import { AddRequestModal } from './components/AddRequestModal';
import { DownloadModal } from './components/DownloadModal';
import { ClerkHelperModal } from './components/ClerkHelperModal';
import { PrintSheet } from './components/PrintSheet';
import { ShareModal, parseSharedDataFromUrl } from './components/ShareModal';
import { Check } from 'lucide-react';

const STORAGE_KEY_REQUESTS = 'japan_haul_requests_v4';
const STORAGE_KEY_PURCHASED = 'japan_haul_purchased_v4';
const STORAGE_KEY_CURRENCY = 'japan_haul_currency_v4';

export default function App() {
  const [requests, setRequests] = useState<ShoppingItemRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [purchasedMap, setPurchasedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PURCHASED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [sharedImportNotice, setSharedImportNotice] = useState<string | null>(null);

  // Selected currency
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY) as CurrencyCode;
      if (saved) return saved;
    } catch {}
    return 'JPY';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'consolidated' | 'requests' | 'settlement'>(
    'consolidated'
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [clerkItem, setClerkItem] = useState<ConsolidatedItem | null>(null);

  // 1. Check if opened via a Share Link from a colleague!
  useEffect(() => {
    const sharedData = parseSharedDataFromUrl();
    if (sharedData && sharedData.length > 0) {
      setRequests((prev) => {
        // Merge without exact duplicates
        const existingNames = new Set(prev.map((p) => `${p.productName}__${p.requesterName}`));
        const newOnes = sharedData.filter(
          (s) => !existingNames.has(`${s.productName}__${s.requesterName}`)
        );
        const merged = [...newOnes, ...prev];
        return merged;
      });

      setSharedImportNotice(`🎉 Successfully loaded ${sharedData.length} items from your colleague's link!`);
      // Clean up URL hash cleanly without reload
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setTimeout(() => setSharedImportNotice(null), 5000);
    }
  }, []);

  // 2. Fetch from shared backend server if running
  const fetchSharedData = useCallback(async () => {
    try {
      const [reqRes, purRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/purchased'),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setRequests(data);
        }
      }
      if (purRes.ok) {
        const purData = await purRes.json();
        setPurchasedMap(purData);
      }
    } catch {
      // Local fallback
    }
  }, []);

  // Sync with server if available
  useEffect(() => {
    fetchSharedData();
    const interval = setInterval(fetchSharedData, 4000);
    return () => clearInterval(interval);
  }, [fetchSharedData]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch {}
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PURCHASED, JSON.stringify(purchasedMap));
    } catch {}
  }, [purchasedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, selectedCurrency);
    } catch {}
  }, [selectedCurrency]);

  // Consolidate requests (automatic merging of same items)
  const consolidatedItems = useMemo(() => {
    return consolidateRequests(requests, purchasedMap);
  }, [requests, purchasedMap]);

  // Calculations for stats
  const totalUnits = useMemo(() => {
    return requests.reduce((sum, r) => sum + r.quantity, 0);
  }, [requests]);

  const totalEstJpy = useMemo(() => {
    return requests.reduce((sum, r) => sum + (r.estimatedPriceJpy || 0) * r.quantity, 0);
  }, [requests]);

  const purchasedCount = useMemo(() => {
    return consolidatedItems.filter((i) => i.isPurchased).length;
  }, [consolidatedItems]);

  const existingRequesters = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.requesterName))).sort();
  }, [requests]);

  // Handlers
  const handleTogglePurchased = async (itemId: string) => {
    const nextVal = !purchasedMap[itemId];
    setPurchasedMap((prev) => ({
      ...prev,
      [itemId]: nextVal,
    }));

    try {
      await fetch(`/api/purchased/${encodeURIComponent(itemId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPurchased: nextVal }),
      });
    } catch {}
  };

  const handleAddRequest = async (newReqData: Omit<ShoppingItemRequest, 'id' | 'createdAt'>) => {
    const tempId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRequest: ShoppingItemRequest = {
      ...newReqData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (res.ok) {
        const saved = await res.json();
        setRequests((prev) => prev.map((item) => (item.id === tempId ? saved : item)));
      }
    } catch {}
  };

  const handleDeleteRequest = async (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await fetch(`/api/requests/${encodeURIComponent(requestId)}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all items from the list?')) {
      setRequests([]);
      setPurchasedMap({});
      try {
        await fetch('/api/requests', { method: 'DELETE' });
      } catch {}
    }
  };

  const handleLoadSampleData = async () => {
    setRequests(INITIAL_REQUESTS);
    try {
      for (const item of INITIAL_REQUESTS) {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
    } catch {}
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        consolidatedCount={consolidatedItems.length}
        totalUnitsCount={totalUnits}
      />

      {/* Shared import notification toast */}
      {sharedImportNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{sharedImportNotice}</span>
        </div>
      )}

      {/* Hero Overview & Tabular Metrics Bar */}
      <StatsBanner
        consolidatedCount={consolidatedItems.length}
        totalUnits={totalUnits}
        totalEstJpy={totalEstJpy}
        purchasedCount={purchasedCount}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        onClearAll={handleClearAll}
        onLoadSampleData={handleLoadSampleData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {activeTab === 'consolidated' && (
          <ConsolidatedListView
            items={consolidatedItems}
            selectedCurrency={selectedCurrency}
            onTogglePurchased={handleTogglePurchased}
            onOpenClerkHelper={(item) => setClerkItem(item)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'requests' && (
          <AllRequestsView
            requests={requests}
            selectedCurrency={selectedCurrency}
            onDeleteRequest={handleDeleteRequest}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementView
            requests={requests}
            selectedCurrency={selectedCurrency}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 no-print mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Japan Haul</span>
            <span>·</span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              Share with Colleagues
            </button>
          </div>
          <div className="flex items-center gap-4">
            {consolidatedItems.length > 0 && (
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                Export / Download List
              </button>
            )}
            {consolidatedItems.length > 0 ? (
              <button
                onClick={handleClearAll}
                className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            ) : (
              <button
                onClick={handleLoadSampleData}
                className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                Load Sample Data
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddRequestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRequest}
        existingRequesters={existingRequesters}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        items={consolidatedItems}
        selectedCurrency={selectedCurrency}
        onTriggerPrint={handleTriggerPrint}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        requests={requests}
        consolidatedItems={consolidatedItems}
      />

      <ClerkHelperModal
        item={clerkItem}
        onClose={() => setClerkItem(null)}
      />

      {/* Print-Only View for PDF & Print output */}
      <PrintSheet
        items={consolidatedItems}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
}
