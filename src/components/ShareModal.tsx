import React, { useState } from 'react';
import { ShoppingItemRequest, ConsolidatedItem } from '../types';
import { generateTextSummary } from '../utils/consolidation';
import { X, Copy, Check, Share2, Link as LinkIcon, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ShoppingItemRequest[];
  consolidatedItems: ConsolidatedItem[];
}

export function generateShareUrl(requests: ShoppingItemRequest[]): string {
  try {
    // Compress requests to minimal representation for URL
    const compact = requests.map((r) => ({
      n: r.productName,
      q: r.quantity,
      u: r.requesterName,
      img: r.imageUrl?.startsWith('data:') ? undefined : r.imageUrl, // keep URL short
      m: r.notes,
      c: r.category,
      p: r.estimatedPriceJpy,
    }));
    const jsonStr = JSON.stringify(compact);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = new URL(window.location.href);
    url.hash = `share=${b64}`;
    return url.toString();
  } catch (e) {
    console.error('Error generating share URL:', e);
    return window.location.href;
  }
}

export function parseSharedDataFromUrl(): ShoppingItemRequest[] | null {
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('share=')) {
      const match = hash.match(/share=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(escape(atob(match[1])));
        const compact = JSON.parse(decoded);
        if (Array.isArray(compact)) {
          return compact.map((c: any, index: number) => ({
            id: `shared-${Date.now()}-${index}`,
            productName: c.n,
            quantity: c.q || 1,
            requesterName: c.u || 'Friend',
            imageUrl: c.img,
            notes: c.m,
            category: c.c || 'other',
            estimatedPriceJpy: c.p || 0,
            priority: 'must_buy' as const,
            createdAt: new Date().toISOString(),
          }));
        }
      }
    }
  } catch (e) {
    console.error('Error parsing shared data from URL:', e);
  }
  return null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  requests,
  consolidatedItems,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(requests);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleCopyWhatsAppText = async () => {
    const text = generateTextSummary(consolidatedItems);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Share Shopping List with Colleagues
              </h3>
              <p className="text-xs text-slate-500">
                Zero database setup required — works on Vercel, WhatsApp, or anywhere
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Option 1: 1-Click Share Link */}
          <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-rose-600" />
                1-Click Direct Share Link
              </span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                Easiest on Vercel
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send this link to your colleague. When they open it on their phone or laptop, all your items are instantly loaded!
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: WhatsApp / Slack Message */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Copy WhatsApp / Slack Text Summary
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy a formatted text list of all consolidated items to paste directly into your team group chat.
            </p>
            <button
              onClick={handleCopyWhatsAppText}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer ${
                copiedText
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy WhatsApp Message</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
