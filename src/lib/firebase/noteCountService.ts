import {
  collection,
  doc,
  getDoc,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import {
  FREE_NOTE_LIMIT,
  PACK_NOTE_COUNT,
  LOW_COUNT_THRESHOLD,
  type NoteCountInfo,
} from '@/types/noteCount';

/**
 * グループのノート上限を計算する
 * 有料プランは FREE_NOTE_LIMIT + purchasedCount * PACK_NOTE_COUNT
 */
export function getNoteLimit(plan: 'free' | 'paid', purchasedCount: number): number {
  if (plan === 'paid') {
    return FREE_NOTE_LIMIT + purchasedCount * PACK_NOTE_COUNT;
  }
  return FREE_NOTE_LIMIT;
}

/**
 * 残り件数を計算する（最小値0）
 */
export function getRemainingCount(totalCount: number, limit: number): number {
  return Math.max(0, limit - totalCount);
}

/**
 * グループに紐づくノート総数を Firestore の count() 集計で取得する。
 * 対象コレクション: notes / matchJournals / matches
 * 各コレクションを `where('groupId', '==', groupId)` で絞り込み、
 * getCountFromServer() の結果（サーバー側集計）を合計して返す。
 */
export async function fetchTotalNoteCount(groupId: string): Promise<number> {
  const targets = ['notes', 'matchJournals', 'matches'] as const;

  const counts = await Promise.all(
    targets.map(async (col) => {
      const q = query(collection(db, col), where('groupId', '==', groupId));
      const snap = await getCountFromServer(q);
      return snap.data().count;
    })
  );

  return counts.reduce((sum, n) => sum + n, 0);
}

/**
 * グループのノート残数情報を取得する。
 * - 総数は fetchTotalNoteCount() で都度集計（保存フィールド非依存）
 * - 上限は ownerUserId のプランと purchasedCount から算出
 */
export async function fetchNoteCountInfo(
  groupId: string,
  ownerUserId: string
): Promise<NoteCountInfo> {
  const [totalCount, userSnap] = await Promise.all([
    fetchTotalNoteCount(groupId),
    getDoc(doc(db, 'users', ownerUserId)),
  ]);

  const plan = (userSnap.data()?.plan ?? 'free') as 'free' | 'paid';
  const purchasedCount = (userSnap.data()?.purchasedCount ?? 0) as number;

  const limit = getNoteLimit(plan, purchasedCount);
  const remaining = getRemainingCount(totalCount, limit);

  return {
    totalCount,
    limit,
    remaining,
    isOverLimit: totalCount >= limit,
    isLow: remaining <= LOW_COUNT_THRESHOLD,
    plan,
  };
}
