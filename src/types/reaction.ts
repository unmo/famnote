import { Timestamp } from 'firebase/firestore';

// 使用可能なリアクション種別
export const REACTION_TYPES = ['applause', 'fire', 'star', 'muscle'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

// リアクション絵文字マッピング
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  applause: '👏',
  fire: '🔥',
  star: '⭐',
  muscle: '💪',
};

// リアクションラベル（アクセシビリティ用）
export const REACTION_LABELS: Record<ReactionType, string> = {
  applause: '拍手',
  fire: '熱い！',
  star: 'すごい！',
  muscle: 'がんばれ！',
};

// Firestoreのreactionsコレクション型
export interface Reaction {
  id: string;
  targetType: 'note' | 'match';
  targetId: string;
  userId: string;
  groupId: string;
  reactionType: ReactionType;
  createdAt: Timestamp;
}
