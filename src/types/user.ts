import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

// Firestoreのusersコレクション型
export interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  sports: Sport[];
  groupId: string | null;
  themeId: string; // テーマID（デフォルト: 'shimizu'）
  subscriptionStatus: 'free' | 'family' | 'premium';
  stripeCustomerId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  totalNotes: number;
  totalMatches: number;
  currentStreak: number;
  longestStreak: number;
  lastRecordedAt: Timestamp | null;
}

// バッジ型
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  acquiredAt: Timestamp;
}

// ユーザーバッジ型
export interface UserBadge extends Badge {
  userId: string;
}

// バッジ定義一覧
export const BADGE_DEFINITIONS: Omit<Badge, 'acquiredAt'>[] = [
  { id: 'first_record', name: 'はじめの一歩', emoji: '👟', description: '最初の記録' },
  { id: 'streak_3', name: '3日坊主脱出', emoji: '🔥', description: '3日連続記録' },
  { id: 'streak_7', name: '1週間の戦士', emoji: '⚔️', description: '7日連続記録' },
  { id: 'streak_30', name: '月間チャンピオン', emoji: '🏆', description: '30日連続記録' },
  { id: 'streak_100', name: '100日達人', emoji: '💎', description: '100日連続記録' },
  { id: 'notes_50', name: '記録魔', emoji: '📝', description: '合計50件記録' },
  { id: 'reaction_10', name: 'チームプレイヤー', emoji: '🤝', description: '10回リアクション' },
];
