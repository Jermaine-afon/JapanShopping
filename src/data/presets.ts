import { StoreCategory } from '../types';
import tokyoBananaImg from '../assets/images/japan_tokyo_banana_1791426016442.jpg';
import melanoCcImg from '../assets/images/japan_melano_cc_1791426029607.jpg';
import shiroiKoibitoImg from '../assets/images/japan_shiroi_koibito_1791426043100.jpg';
import matchaKitkatImg from '../assets/images/japan_matcha_kitkat_1791426057379.jpg';

export interface JapanProductPreset {
  id: string;
  name: string;
  japaneseName: string;
  category: StoreCategory;
  estimatedPriceJpy: number;
  imageUrl: string;
  description: string;
  popularNote?: string;
}

export const POPULAR_JAPAN_PRESETS: JapanProductPreset[] = [
  {
    id: 'melano-cc',
    name: 'Melano CC Vitamin C Essence (20ml)',
    japaneseName: 'メラノCC 薬用しみ集中対策 プレミアム美容液',
    category: 'drugstore',
    estimatedPriceJpy: 1200,
    imageUrl: melanoCcImg,
    description: 'Iconic spot treatment essence with active Vitamin C and Vitamin E.',
    popularNote: 'Get the regular 20ml tube, yellow packaging.',
  },
  {
    id: 'tokyo-banana',
    name: 'Tokyo Banana Classic Castella Cake (8pcs)',
    japaneseName: '東京ばな奈 見ぃつけたっ 8個入',
    category: 'airport_dutyfree',
    estimatedPriceJpy: 1180,
    imageUrl: tokyoBananaImg,
    description: 'Steamed sponge cake filled with banana custard cream.',
    popularNote: 'Available at airport duty free gates before boarding.',
  },
  {
    id: 'shiroi-koibito',
    name: 'Shiroi Koibito Cookies (18pcs White)',
    japaneseName: '白い恋人 18枚入 (ホワイト)',
    category: 'airport_dutyfree',
    estimatedPriceJpy: 1400,
    imageUrl: shiroiKoibitoImg,
    description: 'Hokkaido langue de chat cookies with velvety white chocolate.',
    popularNote: 'Blue tin or box, buy tax-free at airport or department store.',
  },
  {
    id: 'matcha-kitkat',
    name: 'KitKat Japanese Uji Matcha Green Tea (10pcs)',
    japaneseName: 'キットカット ミニ 宇治抹茶 10枚入',
    category: 'donki',
    estimatedPriceJpy: 398,
    imageUrl: matchaKitkatImg,
    description: 'Crispy wafer bars coated with fragrant authentic Kyoto Uji matcha.',
    popularNote: 'Huge discount bags usually found on floor 1 of Donki.',
  },
  {
    id: 'biore-uv',
    name: 'Biore UV Aqua Rich Watery Essence (70g)',
    japaneseName: 'ビオレUV アクアリッチ ウォータリーエッセンス SPF50+',
    category: 'drugstore',
    estimatedPriceJpy: 880,
    imageUrl: melanoCcImg, // reuse beauty shot fallback
    description: 'Water-light broad spectrum sunscreen essence, beloved Japanese holy grail.',
    popularNote: 'SPF50+ PA++++ in blue tube.',
  },
  {
    id: 'dhc-lip',
    name: 'DHC Extra Moisture Lip Cream',
    japaneseName: 'DHC 薬用リップクリーム',
    category: 'drugstore',
    estimatedPriceJpy: 650,
    imageUrl: melanoCcImg, // beauty shot fallback
    description: 'Virgin olive oil infused moisturizing Japanese lip balm.',
    popularNote: 'Pink slim tube, very compact to pack.',
  },
];
