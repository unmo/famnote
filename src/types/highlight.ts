import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

export type HighlightSourceType =
  | 'journal_pre_goal'
  | 'journal_pre_challenge'
  | 'journal_post_achievement'
  | 'journal_post_improvement'
  | 'journal_post_exploration'
  | 'journal_insight'
  | 'note_insight'
  | 'practice_bullet';

export interface Highlight {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  sourceType: HighlightSourceType;
  sourceId: string;       // journalId または noteId
  bulletItemId: string;
  text: string;           // ピン時のテキストコピー
  sourceDate: Timestamp;
  createdAt: Timestamp;
}
