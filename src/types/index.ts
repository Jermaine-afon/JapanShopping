export type StoreCategory = 
  | 'donki'
  | 'drugstore'
  | 'conbini'
  | 'airport_dutyfree'
  | 'character_anime'
  | 'supermarket'
  | 'department_store'
  | 'other';

export interface StoreCategoryInfo {
  id: StoreCategory;
  name: string;
  japaneseName: string;
  iconName: string;
  color: string;
  taxFreeEligible: boolean;
}

export interface ShoppingItemRequest {
  id: string;
  productName: string;
  japaneseName?: string;
  category: StoreCategory;
  quantity: number;
  requesterName: string;
  imageUrl?: string;
  estimatedPriceJpy: number;
  notes?: string;
  priority: 'must_buy' | 'nice_to_have';
  createdAt: string;
}

export interface RequesterContribution {
  requestId: string;
  requesterName: string;
  quantity: number;
  notes?: string;
  priority: 'must_buy' | 'nice_to_have';
}

export interface ConsolidatedItem {
  id: string; // Canonical key
  productName: string;
  japaneseName?: string;
  category: StoreCategory;
  imageUrl?: string;
  estimatedPriceJpy: number;
  totalQuantity: number;
  requesters: RequesterContribution[];
  isPurchased: boolean;
  purchasedQty?: number;
  actualPriceJpy?: number;
  notesSummary?: string;
}

export type CurrencyCode = 'JPY' | 'USD' | 'SGD' | 'EUR' | 'GBP' | 'AUD' | 'MYR' | 'TWD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  ratePerJpy: number; // e.g. 1 JPY = 0.0066 USD
  formatDecimals: number;
}
