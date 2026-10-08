import React from 'react';
import { Download, Plus, ShoppingBag, Share2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'consolidated' | 'requests' | 'settlement';
  setActiveTab: (tab: 'consolidated' | 'requests' | 'settlement') => void;
  onOpenAddModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenShareModal: () => void;
  consolidatedCount: number;
  totalUnitsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenDownloadModal,
  onOpenShareModal,
  consolidatedCount,
  totalUnitsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('consolidated')}
              className="text-left group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-rose-700 transition-colors">
                JP
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  Japan Haul
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-600 border-l border-slate-200 pl-2">
                  日本買い物代行
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('consolidated')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'consolidated'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Consolidated</span>
              <span
                className={`ml-1 text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'consolidated'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {consolidatedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Submissions</span>
            </button>

            <button
              onClick={() => setActiveTab('settlement')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'settlement'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Split & Settle</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShareModal}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Share shopping list with colleagues via link or WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Share Link</span>
              <span className="sm:hidden">Share</span>
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download consolidated shopping list as PDF, CSV, or WhatsApp text"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Download</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs shadow-rose-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
