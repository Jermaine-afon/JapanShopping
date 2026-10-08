import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  JPY: { code: 'JPY', symbol: '¥', ratePerJpy: 1, formatDecimals: 0 },
  USD: { code: 'USD', symbol: '$', ratePerJpy: 0.0066, formatDecimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', ratePerJpy: 0.0089, formatDecimals: 2 },
  EUR: { code: 'EUR', symbol: '€', ratePerJpy: 0.0061, formatDecimals: 2 },
  GBP: { code: 'GBP', symbol: '£', ratePerJpy: 0.0052, formatDecimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', ratePerJpy: 0.0101, formatDecimals: 2 },
  MYR: { code: 'MYR', symbol: 'RM', ratePerJpy: 0.031, formatDecimals: 2 },
  TWD: { code: 'TWD', symbol: 'NT$', ratePerJpy: 0.21, formatDecimals: 0 },
};

export function formatCurrency(amountJpy: number, targetCurrency: CurrencyCode = 'JPY'): string {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.JPY;
  const converted = amountJpy * config.ratePerJpy;
  
  if (config.code === 'JPY') {
    return `¥${Math.round(amountJpy).toLocaleString()}`;
  }
  
  return `${config.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: config.formatDecimals,
    maximumFractionDigits: config.formatDecimals,
  })}`;
}
