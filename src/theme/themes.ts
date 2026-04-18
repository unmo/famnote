import { Theme } from '@/types/theme';
export type { Theme };

// 20種類のテーマカラー定義（Jリーグクラブカラーをモチーフ）
export const THEMES: Theme[] = [
  { id: 'shimizu', name: 'Shimizu', primary: '#E85513', secondary: '#00133F', isPremium: false },
  { id: 'kashima', name: 'Kashima', primary: '#B30024', secondary: '#002244', isPremium: true },
  { id: 'urawa', name: 'Urawa', primary: '#E60012', secondary: '#000000', isPremium: true },
  { id: 'kashiwa', name: 'Kashiwa', primary: '#FFE500', secondary: '#000000', isPremium: true },
  { id: 'verdy', name: 'Verdy', primary: '#006934', secondary: '#B2933D', isPremium: true },
  { id: 'kawasaki', name: 'Kawasaki', primary: '#23B7E5', secondary: '#000000', isPremium: true },
  { id: 'kyoto', name: 'Kyoto', primary: '#800080', secondary: '#CCA300', isPremium: true },
  { id: 'cerezo', name: 'Cerezo', primary: '#F06292', secondary: '#000080', isPremium: true },
  { id: 'okayama', name: 'Okayama', primary: '#B2003F', secondary: '#002244', isPremium: true },
  { id: 'fukuoka', name: 'Fukuoka', primary: '#002A5C', secondary: '#8A8D8F', isPremium: true },
  { id: 'mito', name: 'Mito', primary: '#0028A0', secondary: '#000000', isPremium: true },
  { id: 'chiba', name: 'Chiba', primary: '#FFE400', secondary: '#008638', isPremium: true },
  { id: 'fctokyo', name: 'FCTokyo', primary: '#0038A8', secondary: '#E60012', isPremium: true },
  { id: 'machida', name: 'Machida', primary: '#002366', secondary: '#D4AF37', isPremium: true },
  { id: 'marinos', name: 'Marinos', primary: '#003F80', secondary: '#E60012', isPremium: true },
  { id: 'nagoya', name: 'Nagoya', primary: '#E60012', secondary: '#000000', isPremium: true },
  { id: 'gamba', name: 'Gamba', primary: '#0021A5', secondary: '#000000', isPremium: true },
  { id: 'kobe', name: 'Kobe', primary: '#990000', secondary: '#000000', isPremium: true },
  { id: 'hiroshima', name: 'Hiroshima', primary: '#4B0082', secondary: '#D4AF37', isPremium: true },
  { id: 'nagasaki', name: 'Nagasaki', primary: '#F39800', secondary: '#00519A', isPremium: true },
];

// デフォルトテーマ（無料プラン）
export const DEFAULT_THEME = THEMES[0];
