import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';
import { ReactionType } from './reaction';

export type MatchResult = 'win' | 'draw' | 'loss' | null;

// Firestoreのmatchesコレクション型
export interface Match {
  id: string;
  userId: string;
  groupId: string;
  sport: Sport;
  date: Timestamp;
  opponent: string;
  venue: string | null;
  myScore: number | null;
  opponentScore: number | null;
  result: MatchResult;
  position: string | null;
  playingTimeMinutes: number | null;
  performance: 1 | 2 | 3 | 4 | 5 | null;
  highlight: string | null;
  improvements: string | null;
  imageUrls: string[];
  isDraft: boolean;
  isPublic: boolean;
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 試合コメント型
export interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: Timestamp;
}

// 試合記録フォームデータ型
export interface MatchFormData {
  sport: Sport;
  date: string; // ISO文字列
  opponent: string;
  venue: string | null;
  myScore: number | null;
  opponentScore: number | null;
  result: MatchResult;
  position: string | null;
  playingTimeMinutes: number | null;
  performance: 1 | 2 | 3 | 4 | 5 | null;
  highlight: string | null;
  improvements: string | null;
  isPublic: boolean;
}
