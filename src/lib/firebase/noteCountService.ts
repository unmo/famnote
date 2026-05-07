import {
  doc,
  getDoc,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import {
  FREE_NOTE_LIMIT,
  PACK_NOTE_COUNT,
  LOW_COUNT_THRESHOLD,
  NoteCountExceededError,
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
export function getRemainingCount(totalNoteCount: number, limit: number): number {
  return Math.max(0, limit - totalNoteCount);
}

/**
 * グループのノートカウンターをインクリメントする。
 * Firestoreトランザクションで原子的に実行し、上限を超える場合は NoteCountExceededError をスローする。
 * ownerUserId のプランと purchasedCount を参照して実際の上限を算出する。
 */
export async function incrementNoteCount(
  groupId: string,
  memberId: string,
  ownerUserId: string
): Promise<void> {
  const groupRef = doc(db, 'groups', groupId);
  const memberRef = doc(db, 'groups', groupId, 'members', memberId);
  const ownerRef = doc(db, 'users', ownerUserId);

  await runTransaction(db, async (tx) => {
    const [groupSnap, memberSnap, ownerSnap] = await Promise.all([
      tx.get(groupRef),
      tx.get(memberRef),
      tx.get(ownerRef),
    ]);

    if (!groupSnap.exists()) {
      throw new Error('GROUP_NOT_FOUND');
    }
    if (!memberSnap.exists()) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    const plan = (ownerSnap.data()?.plan ?? 'free') as 'free' | 'paid';
    const purchasedCount = (ownerSnap.data()?.purchasedCount ?? 0) as number;
    const limit = getNoteLimit(plan, purchasedCount);

    const currentTotal = (groupSnap.data().totalNoteCount ?? 0) as number;
    if (currentTotal >= limit) {
      throw new NoteCountExceededError();
    }

    tx.update(groupRef, { totalNoteCount: increment(1) });
    tx.update(memberRef, { noteCount: increment(1) });
  });
}

/**
 * グループのノートカウンターをデクリメントする。
 * 最小値は0（0未満にならない）。
 */
export async function decrementNoteCount(
  groupId: string,
  memberId: string
): Promise<void> {
  const groupRef = doc(db, 'groups', groupId);
  const memberRef = doc(db, 'groups', groupId, 'members', memberId);

  await runTransaction(db, async (tx) => {
    const groupSnap = await tx.get(groupRef);
    const memberSnap = await tx.get(memberRef);

    if (!groupSnap.exists() || !memberSnap.exists()) {
      // ドキュメントが存在しない場合はスキップ
      return;
    }

    const currentGroupTotal = groupSnap.data().totalNoteCount ?? 0;
    const currentMemberCount = memberSnap.data().noteCount ?? 0;

    // 0未満にならないようクランプ
    if (currentGroupTotal > 0) {
      tx.update(groupRef, { totalNoteCount: increment(-1) });
    }
    if (currentMemberCount > 0) {
      tx.update(memberRef, { noteCount: increment(-1) });
    }
  });
}

/**
 * グループのノート残数情報を取得する。
 * ownerUserId のプランと purchasedCount を参照して上限を計算する。
 */
export async function fetchNoteCountInfo(
  groupId: string,
  ownerUserId: string
): Promise<NoteCountInfo> {
  const [groupSnap, userSnap] = await Promise.all([
    getDoc(doc(db, 'groups', groupId)),
    getDoc(doc(db, 'users', ownerUserId)),
  ]);

  const totalNoteCount = (groupSnap.data()?.totalNoteCount ?? 0) as number;
  const plan = (userSnap.data()?.plan ?? 'free') as 'free' | 'paid';
  const purchasedCount = (userSnap.data()?.purchasedCount ?? 0) as number;

  const limit = getNoteLimit(plan, purchasedCount);
  const remaining = getRemainingCount(totalNoteCount, limit);

  return {
    totalNoteCount,
    limit,
    remaining,
    isLow: remaining <= LOW_COUNT_THRESHOLD,
    isExceeded: remaining === 0,
    plan,
  };
}
