// スポーツ種別の定義
export const SPORTS = [
  'soccer',
  'baseball',
  'basketball',
  'tennis',
  'volleyball',
  'swimming',
  'athletics',
  'other',
] as const;

export type Sport = (typeof SPORTS)[number];

// 日本語ラベル
export const SPORT_LABELS: Record<Sport, string> = {
  soccer: 'サッカー',
  baseball: '野球',
  basketball: 'バスケットボール',
  tennis: 'テニス',
  volleyball: 'バレーボール',
  swimming: '水泳',
  athletics: '陸上',
  other: 'その他',
};

// スポーツアイコン（絵文字）
export const SPORT_EMOJIS: Record<Sport, string> = {
  soccer: '⚽',
  baseball: '⚾',
  basketball: '🏀',
  tennis: '🎾',
  volleyball: '🏐',
  swimming: '🏊',
  athletics: '🏃',
  other: '🏅',
};

// スポーツバッジカラー（テーマとは独立して管理）
export const SPORT_COLORS: Record<Sport, { bg: string; text: string; border: string }> = {
  soccer: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500' },
  baseball: { bg: 'bg-indigo-700', text: 'text-indigo-700', border: 'border-indigo-700' },
  basketball: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500' },
  tennis: { bg: 'bg-yellow-400', text: 'text-yellow-600', border: 'border-yellow-400' },
  volleyball: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-500' },
  swimming: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-500' },
  athletics: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-500' },
  other: { bg: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-600' },
};
