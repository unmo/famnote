import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';
import { ReactionType } from './reaction';

// Firestoreのnotesコレクション型
export interface Note {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  durationMinutes: number | null;
  location: string | null;
  todayGoal: string | null;
  content: string;
  reflection: string | null;
  condition: 1 | 2 | 3 | 4 | 5 | null;
  imageUrls: string[];
  isDraft: boolean;
  isPublic: boolean;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ノートコメント型
export interface NoteComment {
  id: string;
  noteId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
}

// ノート作成・更新フォームデータ型
export interface NoteFormData {
  sport: Sport;
  date: string; // ISO文字列
  durationMinutes: number | null;
  location: string | null;
  todayGoal: string | null;
  content: string;
  reflection: string | null;
  condition: 1 | 2 | 3 | 4 | 5 | null;
  isPublic: boolean;
}
