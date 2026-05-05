import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';
import type { Notification, CreateNotificationInput } from '@/types/notification';
import { createNotificationSchema } from '@/types/notification';

const COLLECTION = 'notifications';

/**
 * グループ内の親プロフィール全員に通知ドキュメントを一括作成する。
 * writeBatch を使用して1回のトランザクションで完結させる。
 */
export async function createNotification(params: CreateNotificationInput): Promise<void> {
  // 入力バリデーション
  const parsed = createNotificationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(`通知作成バリデーションエラー: ${parsed.error.message}`);
  }

  const {
    groupId,
    senderProfileUid,
    senderDisplayName,
    senderAvatarUrl,
    recipientProfileUids,
    contentType,
    contentId,
    contentTitle,
    actionType,
  } = parsed.data;

  // 受信者がいない場合は何もしない
  if (recipientProfileUids.length === 0) return;

  const batch = writeBatch(db);
  const colRef = collection(db, COLLECTION);

  for (const recipientProfileUid of recipientProfileUids) {
    const newDocRef = doc(colRef);
    batch.set(newDocRef, {
      groupId,
      senderProfileUid,
      senderDisplayName,
      senderAvatarUrl,
      recipientProfileUid,
      contentType,
      contentId,
      contentTitle,
      actionType,
      isRead: false,
      createdAt: serverTimestamp(),
      readAt: null,
    });
  }

  await batch.commit();
}

/**
 * 未読通知一覧を取得する。
 */
export async function getUnreadNotifications(
  recipientProfileUid: string,
  limitCount = 20,
): Promise<Notification[]> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification);
}

/**
 * 未読件数を返す（getCountFromServer を使用してドキュメント読み込みコストを最小化）。
 */
export async function getUnreadCount(recipientProfileUid: string): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    where('isRead', '==', false),
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

/**
 * 未読件数をリアルタイム購読する。
 * @returns unsubscribe関数
 */
export function subscribeUnreadCount(
  recipientProfileUid: string,
  callback: (count: number) => void,
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    where('isRead', '==', false),
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.size),
    // エラー時はカウント0にフォールバック（バッジを消す）
    () => callback(0),
  );
}

/**
 * 指定した通知を既読にする。
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), {
    isRead: true,
    readAt: serverTimestamp(),
  });
}

/**
 * 指定プロフィールの全未読通知を既読にする。
 */
export async function markAllAsRead(recipientProfileUid: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    where('isRead', '==', false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { isRead: true, readAt: serverTimestamp() });
  });
  await batch.commit();
}

/**
 * 指定コンテンツIDに対応する未読通知を既読にする（詳細ページ表示時に呼ぶ）。
 */
export async function markContentAsRead(
  recipientProfileUid: string,
  contentId: string,
): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    where('contentId', '==', contentId),
    where('isRead', '==', false),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { isRead: true, readAt: serverTimestamp() });
  });
  await batch.commit();
}

/**
 * 全通知一覧を取得する（既読・未読混在、最新順）。
 */
export async function fetchNotifications(
  recipientProfileUid: string,
  limitCount = 20,
): Promise<Notification[]> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientProfileUid', '==', recipientProfileUid),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification);
}
