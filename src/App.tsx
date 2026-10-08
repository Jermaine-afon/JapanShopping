/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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

const STORAGE_KEY_REQUESTS = 'japan_haul_requests_v1';
const STORAGE_KEY_PURCHASED = 'japan_haul_purchased_v1';
const STORAGE_KEY_CURRENCY = 'japan_haul_currency_v1';

export default function App() {
  // Load initial requests from localStorage or sample data
  const [requests, setRequests] = useState<ShoppingItemRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved requests:', e);
    }
    return INITIAL_REQUESTS;
  });

  // Track purchased status per merged product id
  const [purchasedMap, setPurchasedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PURCHASED);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse purchased state:', e);
    }
    return {};
  });

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
  const [clerkItem, setClerkItem] = useState<ConsolidatedItem | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save requests:', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PURCHASED, JSON.stringify(purchasedMap));
    } catch (e) {
      console.error('Failed to save purchased states:', e);
    }
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
    return requests.reduce((sum, r) => sum + r.estimatedPriceJpy * r.quantity, 0);
  }, [requests]);

  const purchasedCount = useMemo(() => {
    return consolidatedItems.filter((i) => i.isPurchased).length;
  }, [consolidatedItems]);

  const existingRequesters = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.requesterName))).sort();
  }, [requests]);

  // Handlers
  const handleTogglePurchased = (itemId: string) => {
    setPurchasedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleAddRequest = (newReqData: Omit<ShoppingItemRequest, 'id' | 'createdAt'>) => {
    const newRequest: ShoppingItemRequest = {
      ...newReqData,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newRequest, ...prev]);
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset the list with initial sample Japan requests?')) {
      setRequests(INITIAL_REQUESTS);
      setPurchasedMap({});
    }
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
        consolidatedCount={consolidatedItems.length}
        totalUnitsCount={totalUnits}
      />

      {/* Hero Overview & Tabular Metrics Bar */}
      <StatsBanner
        consolidatedCount={consolidatedItems.length}
        totalUnits={totalUnits}
        totalEstJpy={totalEstJpy}
        purchasedCount={purchasedCount}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        onResetDemoData={handleResetDemoData}
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
            <span>Consolidated Travel Shopping Concierge</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Export / Download List
            </button>
            <span>·</span>
            <button
              onClick={handleResetDemoData}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Reset Sample Data
            </button>
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
