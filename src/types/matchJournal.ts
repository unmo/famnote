import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';
import { ReactionType } from './reaction';

export type JournalStatus = 'pre' | 'completed' | 'post_only';
export type GoalAchievement = 'achieved' | 'partial' | 'not_achieved';

// 箇条書きの1アイテム
export interface BulletItem {
  id: string;
  text: string;       // 最大100文字
  isPinned: boolean;  // ハイライトピン状態
}

// 試合前目標の振り返り
export interface GoalReview {
  goalItemId: string;
  achievement: GoalAchievement;
  comment: string | null; // 最大50文字
}

// 試合ジャーナル本体
export interface MatchJournal {
  id: string;
  userId: string;
  groupId: string | null;
  sport: Sport;
  date: Timestamp;
  opponent: string;
  venue: string | null;
  status: JournalStatus;
  isDraft: boolean;
  isPublic: boolean;

  // 試合前ノート
  preNote: {
    goals: BulletItem[];       // 今日の目標（必須、最大10項目）
    challenges: BulletItem[];  // チャレンジしたいこと（任意、最大5項目）
    recordedAt: Timestamp;
  } | null;

  // 試合後ノート
  postNote: {
    result: 'win' | 'draw' | 'loss' | null;
    myScore: number | null;
    opponentScore: number | null;
    goalReviews: GoalReview[];
    achievements: BulletItem[];  // できたこと（最大10項目）
    improvements: BulletItem[];  // できなかったこと/課題（最大10項目）
    explorations: BulletItem[];  // もっと探求したいこと（最大5項目）
    insights: BulletItem[];      // 気づき（最大10項目）
    performance: 1 | 2 | 3 | 4 | 5 | null;
    imageUrls: string[];
    recordedAt: Timestamp;
  } | null;

  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  pinnedCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ジャーナルコメント（スレッド対応）
export interface JournalComment {
  id: string;
  journalId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'parent' | 'child' | 'member';
  text: string;
  parentCommentId: string | null;
  replyCount: number;
  createdAt: Timestamp;
}

// フォームデータ型（試合前）
export interface PreMatchFormData {
  sport: Sport;
  date: string;
  opponent: string;
  venue: string | null;
  goals: string[];
  challenges: string[];
  isPublic: boolean;
}

// フォームデータ型（試合後）
export interface PostMatchFormData {
  result: 'win' | 'draw' | 'loss' | null;
  myScore: number | null;
  opponentScore: number | null;
  goalReviews: { goalItemId: string; achievement: GoalAchievement; comment: string | null }[];
  achievements: string[];
  improvements: string[];
  explorations: string[];
  insights: string[];
  performance: 1 | 2 | 3 | 4 | 5 | null;
  isPublic: boolean;
}
