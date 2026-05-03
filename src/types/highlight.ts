import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

export type HighlightSourceType =
  // アクティブなsourceType（新規登録対象）
  | 'journal_insight'
  | 'note_insight'
  | 'practice_bullet'
  // 以下は過去データ互換のために残す（新規登録は行わない）
  | 'journal_pre_goal'
  | 'journal_pre_challenge'
  | 'journal_post_achievement'
  | 'journal_post_improvement'
  | 'journal_post_exploration';

export interface Highlight {
  id: string;
  userId: string;
  groupId: string | null;
  sport: Sport;
  sourceType: HighlightSourceType;
  sourceId: string;       // journalId または noteId
  bulletItemId: string;
  text: string;           // ピン時のテキストコピー
  sourceDate: Timestamp;
  createdAt: Timestamp;
}
