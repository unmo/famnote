import { Timestamp } from 'firebase/firestore';
import { Sport } from './sport';

export type GoalType = 'practice_count' | 'match_appearance' | 'skill_acquisition';
export type GoalStatus = 'active' | 'completed' | 'expired';

// Firestoreのgoalsコレクション型
export interface Goal {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  description: string | null;
  sport: Sport;
  goalType: GoalType;
  targetValue: number | null;
  currentValue: number;
  deadline: Timestamp;
  status: GoalStatus;
  isPublic: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 目標タイプのラベル
export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  practice_count: '練習回数',
  match_appearance: '試合出場',
  skill_acquisition: 'スキル習得',
};
