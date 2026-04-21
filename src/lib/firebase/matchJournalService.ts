import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import type { MatchJournal, PreMatchFormData, PostMatchFormData } from '@/types/matchJournal';
import type { Sport } from '@/types/sport';
import { v4 as uuidv4 } from 'uuid';

// テキスト配列をBulletItem配列に変換
function textsToBullets(texts: string[]) {
  return texts
    .filter((t) => t.trim().length > 0)
    .map((text) => ({ id: uuidv4(), text: text.trim(), isPinned: false }));
}

// 試合前ノート作成
export async function createPreMatchNote(
  userId: string,
  groupId: string | null,
  data: PreMatchFormData
): Promise<{ journalId: string }> {
  const ref = await addDoc(collection(db, 'matchJournals'), {
    userId,
    groupId,
    sport: data.sport,
    date: Timestamp.fromDate(new Date(data.date)),
    opponent: data.opponent,
    venue: data.venue,
    status: 'pre',
    isDraft: false,
    isPublic: data.isPublic,
    preNote: {
      goals: textsToBullets(data.goals),
      challenges: textsToBullets(data.challenges),
      recordedAt: serverTimestamp(),
    },
    postNote: null,
    reactionCounts: { applause: 0, fire: 0, star: 0, muscle: 0 },
    commentCount: 0,
    pinnedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { journalId: ref.id };
}

// 試合後ノート追加（既存ジャーナルに追記）
export async function addPostMatchNote(
  journalId: string,
  userId: string,
  data: PostMatchFormData,
  imageUrls: string[] = []
): Promise<void> {
  const journalRef = doc(db, 'matchJournals', journalId);
  const snap = await getDoc(journalRef);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  await updateDoc(journalRef, {
    status: 'completed',
    isPublic: data.isPublic,
    postNote: {
      result: data.result,
      myScore: data.myScore,
      opponentScore: data.opponentScore,
      goalReviews: data.goalReviews,
      achievements: textsToBullets(data.achievements),
      improvements: textsToBullets(data.improvements),
      explorations: textsToBullets(data.explorations),
      performance: data.performance,
      imageUrls,
      recordedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

// 試合後ノートのみ作成（試合前なし）
export async function createPostMatchOnly(
  userId: string,
  groupId: string | null,
  baseData: { sport: Sport; date: string; opponent: string; venue: string | null },
  postData: PostMatchFormData,
  imageUrls: string[] = []
): Promise<{ journalId: string }> {
  const ref = await addDoc(collection(db, 'matchJournals'), {
    userId,
    groupId,
    sport: baseData.sport,
    date: Timestamp.fromDate(new Date(baseData.date)),
    opponent: baseData.opponent,
    venue: baseData.venue,
    status: 'post_only',
    isDraft: false,
    isPublic: postData.isPublic,
    preNote: null,
    postNote: {
      result: postData.result,
      myScore: postData.myScore,
      opponentScore: postData.opponentScore,
      goalReviews: [],
      achievements: textsToBullets(postData.achievements),
      improvements: textsToBullets(postData.improvements),
      explorations: textsToBullets(postData.explorations),
      performance: postData.performance,
      imageUrls,
      recordedAt: serverTimestamp(),
    },
    reactionCounts: { applause: 0, fire: 0, star: 0, muscle: 0 },
    commentCount: 0,
    pinnedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { journalId: ref.id };
}

// ジャーナル削除（Storage画像も削除）
export async function deleteMatchJournal(journalId: string, userId: string): Promise<void> {
  const journalRef = doc(db, 'matchJournals', journalId);
  const snap = await getDoc(journalRef);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  const data = snap.data() as MatchJournal;
  // Storage画像を削除
  if (data.postNote?.imageUrls) {
    for (const url of data.postNote.imageUrls) {
      try {
        // Firebase StorageのURLからパスを抽出して削除
        const storageRef = ref(storage, `matchJournals/${journalId}/${url.split('/').pop()?.split('?')[0]}`);
        await deleteObject(storageRef);
      } catch {
        // 画像削除失敗は無視（既に削除済みの場合など）
      }
    }
  }

  await deleteDoc(journalRef);
}

// ユーザーのジャーナル一覧（月別フィルター・クライアントソート）
export async function fetchUserJournals(
  userId: string,
  year: number,
  month: number
): Promise<MatchJournal[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  const q = query(
    collection(db, 'matchJournals'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...(d.data() as MatchJournal), id: d.id }))
    .filter((j) => j.date.toMillis() >= startTs.toMillis() && j.date.toMillis() <= endTs.toMillis())
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

// ユーザーのジャーナル全件取得（クライアントソート）
export async function fetchUserJournalsPaged(
  userId: string,
  pageSize = 20,
  _lastDoc?: DocumentSnapshot
): Promise<{ journals: MatchJournal[]; lastDoc: DocumentSnapshot | null }> {
  const q = query(
    collection(db, 'matchJournals'),
    where('userId', '==', userId),
    limit(pageSize)
  );

  const snap = await getDocs(q);
  const journals = snap.docs
    .map((d) => ({ ...(d.data() as MatchJournal), id: d.id }))
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
  return { journals, lastDoc: null };
}

// グループのジャーナル一覧取得
export async function fetchGroupJournals(
  groupId: string,
  pageSize = 15,
  lastDoc?: DocumentSnapshot
): Promise<{ journals: MatchJournal[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, 'matchJournals'),
    where('groupId', '==', groupId),
    where('isPublic', '==', true),
    where('isDraft', '==', false),
    orderBy('date', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const journals = snap.docs.map((d) => ({ ...(d.data() as MatchJournal), id: d.id }));
  return { journals, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

// ジャーナル単件取得
export async function fetchJournal(journalId: string): Promise<MatchJournal | null> {
  const snap = await getDoc(doc(db, 'matchJournals', journalId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as MatchJournal), id: snap.id };
}

// pinnedCountを更新（ピン操作時に呼ぶ）
export async function updateJournalPinnedCount(
  journalId: string,
  delta: number
): Promise<void> {
  const journalRef = doc(db, 'matchJournals', journalId);
  const snap = await getDoc(journalRef);
  if (!snap.exists()) return;
  const current = (snap.data() as MatchJournal).pinnedCount ?? 0;
  await updateDoc(journalRef, {
    pinnedCount: Math.max(0, current + delta),
    updatedAt: serverTimestamp(),
  });
}
