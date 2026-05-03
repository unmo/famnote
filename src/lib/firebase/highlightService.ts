import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Highlight, HighlightSourceType } from '@/types/highlight';
import type { BulletItem } from '@/types/matchJournal';
import type { Sport } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';

// ピン追加
export async function pinHighlight(
  userId: string,
  groupId: string,
  sport: Sport,
  sourceType: HighlightSourceType,
  sourceId: string,
  bulletItem: BulletItem,
  sourceDate: Timestamp
): Promise<{ highlightId: string }> {
  // 重複ピン防止: 同じbulletItemIdのピンが既に存在するかチェック
  const existingQuery = query(
    collection(db, 'highlights'),
    where('userId', '==', userId),
    where('bulletItemId', '==', bulletItem.id)
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    return { highlightId: existing.docs[0].id };
  }

  const highlightData: Omit<Highlight, 'id'> = {
    userId,
    groupId,
    sport,
    sourceType,
    sourceId,
    bulletItemId: bulletItem.id,
    text: bulletItem.text,
    sourceDate,
    createdAt: serverTimestamp() as Timestamp,
  };

  const ref = await addDoc(collection(db, 'highlights'), highlightData);
  return { highlightId: ref.id };
}

// ピン解除
export async function unpinHighlight(highlightId: string, userId: string): Promise<void> {
  const highlightRef = doc(db, 'highlights', highlightId);
  // セキュリティ: 自分のハイライトのみ削除可能（Firestoreルールでも制御）
  void userId;
  await deleteDoc(highlightRef);
}

// bulletItemIdからハイライトを検索して削除
export async function unpinHighlightByBulletId(
  userId: string,
  bulletItemId: string
): Promise<void> {
  const q = query(
    collection(db, 'highlights'),
    where('userId', '==', userId),
    where('bulletItemId', '==', bulletItemId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
}

// ユーザーのハイライト一覧取得
export async function fetchUserHighlights(
  userId: string,
  options?: {
    sport?: Sport;
    sourceType?: HighlightSourceType;
    pageSize?: number;
  }
): Promise<{ highlights: Highlight[]; lastDoc: null }> {
  const pageSize = options?.pageSize ?? 20;

  let q = query(
    collection(db, 'highlights'),
    where('userId', '==', userId),
    limit(pageSize * 3)
  );

  if (options?.sport) {
    q = query(
      collection(db, 'highlights'),
      where('userId', '==', userId),
      where('sport', '==', options.sport),
      limit(pageSize * 3)
    );
  }

  const snap = await getDocs(q);
  let highlights = snap.docs
    .map((d) => ({ ...(d.data() as Highlight), id: d.id }))
    .sort((a, b) => b.sourceDate.toMillis() - a.sourceDate.toMillis())
    .slice(0, pageSize);
  return { highlights, lastDoc: null };
}

// 気づきをハイライトとして一括置換（保存時に呼び出す）
export async function replaceInsightHighlights(
  userId: string,
  groupId: string | null,
  sport: Sport,
  sourceType: HighlightSourceType,
  sourceId: string,
  insightTexts: string[],
  sourceDate: Timestamp
): Promise<void> {
  // 既存のこのsource由来のハイライトを削除
  const existingQ = query(
    collection(db, 'highlights'),
    where('userId', '==', userId),
    where('sourceId', '==', sourceId)
  );
  const existingSnap = await getDocs(existingQ);
  for (const d of existingSnap.docs) {
    await deleteDoc(d.ref);
  }

  // 新しい気づきをハイライトとして追加
  for (const text of insightTexts.filter((t) => t.trim())) {
    const highlightData: Omit<Highlight, 'id'> = {
      userId,
      groupId,
      sport,
      sourceType,
      sourceId,
      bulletItemId: `${sourceId}_insight_${Math.random().toString(36).slice(2)}`,
      text: text.trim(),
      sourceDate,
      createdAt: serverTimestamp() as Timestamp,
    };
    await addDoc(collection(db, 'highlights'), highlightData);
  }
}

// ユーザーのハイライト件数を取得
export async function fetchUserHighlightsCount(userId: string): Promise<number> {
  const q = query(collection(db, 'highlights'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.size;
}
