// ノート残数カウント機能の型定義・定数

/** 無料プランのノート上限件数（グループ合計） */
export const FREE_NOTE_LIMIT = 20;

/** 追加パック1つあたりのノート数 */
export const PACK_NOTE_COUNT = 100;

/** 残数警告を表示する閾値 */
export const LOW_COUNT_THRESHOLD = 5;

/** ノート残数情報 */
export interface NoteCountInfo {
  /** グループ現在の総ノート数（notes / matchJournals / matches を Firestore count() 集計で都度カウントした合計） */
  totalCount: number;
  /** グループの上限（FREE_NOTE_LIMIT + purchasedCount * PACK_NOTE_COUNT） */
  limit: number;
  /** 残り件数（Math.max(0, limit - totalCount)） */
  remaining: number;
  /** totalCount >= limit のとき true（上限到達・超過） */
  isOverLimit: boolean;
  /** remaining <= LOW_COUNT_THRESHOLD */
  isLow: boolean;
  /** ユーザーのプラン */
  plan: 'free' | 'paid';
}

/** ノート上限超過エラー */
export class NoteCountExceededError extends Error {
  constructor() {
    super('NOTE_COUNT_EXCEEDED');
    this.name = 'NoteCountExceededError';
  }
}
