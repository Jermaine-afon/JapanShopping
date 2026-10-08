import { ShoppingItemRequest, ConsolidatedItem, StoreCategory } from '../types';
import { STORE_CATEGORIES } from '../data/storeCategories';

/**
 * Normalizes a product title to create a consistent merging key.
 * Example: "Melano CC Vitamin C Essence (20ml)" -> "melano cc vitamin c essence 20ml"
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Consolidates individual user requests into a single merged product list.
 */
export function consolidateRequests(
  requests: ShoppingItemRequest[],
  purchasedMap: Record<string, boolean> = {},
  purchasedQtyMap: Record<string, number> = {}
): ConsolidatedItem[] {
  const map = new Map<string, ConsolidatedItem>();

  for (const req of requests) {
    const key = normalizeProductName(req.productName);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        productName: req.productName,
        japaneseName: req.japaneseName,
        category: req.category,
        imageUrl: req.imageUrl,
        estimatedPriceJpy: req.estimatedPriceJpy || 0,
        totalQuantity: req.quantity,
        requesters: [
          {
            requestId: req.id,
            requesterName: req.requesterName,
            quantity: req.quantity,
            notes: req.notes,
            priority: req.priority,
          },
        ],
        isPurchased: !!purchasedMap[key],
        purchasedQty: purchasedQtyMap[key] ?? (purchasedMap[key] ? req.quantity : 0),
        notesSummary: req.notes ? `${req.requesterName}: ${req.notes}` : undefined,
      });
    } else {
      const existing = map.get(key)!;
      existing.totalQuantity += req.quantity;
      
      // Keep best Japanese name if existing didn't have one
      if (!existing.japaneseName && req.japaneseName) {
        existing.japaneseName = req.japaneseName;
      }
      // Keep best image if existing didn't have one
      if (!existing.imageUrl && req.imageUrl) {
        existing.imageUrl = req.imageUrl;
      }

      // Add requester
      existing.requesters.push({
        requestId: req.id,
        requesterName: req.requesterName,
        quantity: req.quantity,
        notes: req.notes,
        priority: req.priority,
      });

      // Append notes summary
      if (req.notes) {
        existing.notesSummary = existing.notesSummary
          ? `${existing.notesSummary} | ${req.requesterName}: ${req.notes}`
          : `${req.requesterName}: ${req.notes}`;
      }

      existing.isPurchased = !!purchasedMap[key];
      existing.purchasedQty = purchasedQtyMap[key] ?? (purchasedMap[key] ? existing.totalQuantity : 0);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    // Unpurchased items first, then by category, then by name
    if (a.isPurchased !== b.isPurchased) {
      return a.isPurchased ? 1 : -1;
    }
    return a.productName.localeCompare(b.productName);
  });
}

/**
 * Generates an Excel-friendly CSV with UTF-8 BOM.
 */
export function generateConsolidatedCsv(items: ConsolidatedItem[]): string {
  const headers = [
    'Status',
    'Product Name',
    'Japanese Name (日本語)',
    'Target Store',
    'Total Quantity',
    'Requesters Breakdown',
    'Est. Unit Price (JPY)',
    'Total Est. Price (JPY)',
    'Notes / Details',
  ];

  const rows = items.map((item) => {
    const store = STORE_CATEGORIES[item.category]?.name || item.category;
    const requestersStr = item.requesters
      .map((r) => `${r.requesterName} (x${r.quantity})`)
      .join(', ');
    const totalJpy = item.estimatedPriceJpy * item.totalQuantity;
    const status = item.isPurchased ? 'PURCHASED' : 'PENDING';

    return [
      status,
      item.productName,
      item.japaneseName || '-',
      store,
      item.totalQuantity,
      requestersStr,
      item.estimatedPriceJpy,
      totalJpy,
      item.notesSummary || '-',
    ];
  });

  const escapeCsvField = (field: string | number | undefined): string => {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');

  // Prefix with UTF-8 BOM so Microsoft Excel correctly displays Japanese characters
  return '\uFEFF' + csvContent;
}

/**
 * Triggers CSV file download in browser
 */
export function downloadCsvFile(content: string, filename = 'japan_consolidated_shopping_list.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a clean text list for messaging (LINE, WhatsApp, Notes)
 */
export function generateTextSummary(items: ConsolidatedItem[]): string {
  const totalUnits = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalCost = items.reduce((sum, item) => sum + item.estimatedPriceJpy * item.totalQuantity, 0);

  let text = `🇯🇵 JAPAN SHOPPING CONSOLIDATED LIST\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Total Unique Products: ${items.length}\n`;
  text += `Total Units to Buy: ${totalUnits} pcs\n`;
  if (totalCost > 0) {
    text += `Est. Total Spend: ¥${totalCost.toLocaleString()} JPY\n`;
  }
  text += `\n`;

  // Group by store
  const byStore: Record<StoreCategory, ConsolidatedItem[]> = {} as any;
  items.forEach((item) => {
    const cat = item.category || 'other';
    if (!byStore[cat]) byStore[cat] = [];
    byStore[cat].push(item);
  });

  const hasMultipleStores = Object.keys(byStore).length > 1;

  Object.entries(byStore).forEach(([catKey, storeItems]) => {
    const storeInfo = STORE_CATEGORIES[catKey as StoreCategory];
    if (hasMultipleStores && catKey !== 'other') {
      text += `📍 ${storeInfo?.name || catKey}\n`;
    }
    
    storeItems.forEach((item, idx) => {
      const checkbox = item.isPurchased ? '✅' : '⬜';
      const breakdown = item.requesters.map((r) => `${r.requesterName}: ${r.quantity}`).join(', ');
      text += `${checkbox} ${idx + 1}. ${item.productName}\n`;
      if (item.japaneseName) {
        text += `    JP: ${item.japaneseName}\n`;
      }
      text += `    Qty: ${item.totalQuantity}x [${breakdown}]`;
      if (item.estimatedPriceJpy > 0) {
        text += ` | ¥${item.estimatedPriceJpy.toLocaleString()} each`;
      }
      text += `\n`;
      if (item.notesSummary) {
        text += `    Remarks: ${item.notesSummary}\n`;
      }
      text += `\n`;
    });
  });

  text += `Generated by Japan Haul Shopping Concierge\n`;
  return text;
}
