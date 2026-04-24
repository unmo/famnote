import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { JournalComment } from '@/types/matchJournal';

/** コメント投稿パラメータ（idとcreatedAt以外） */
interface AddCommentParams {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'parent' | 'child' | 'member';
  text: string;
}

/**
 * コメントを追加し、ジャーナルのcommentCount/unreadCommentCountをインクリメントする
 */
export async function addJournalComment(
  journalId: string,
  comment: AddCommentParams
): Promise<void> {
  if (comment.text.trim().length === 0) {
    throw new Error('EMPTY_TEXT');
  }
  if (comment.text.length > 200) {
    throw new Error('TEXT_TOO_LONG');
  }

  const commentsRef = collection(db, 'matchJournals', journalId, 'comments');
  await addDoc(commentsRef, {
    journalId,
    userId: comment.userId,
    displayName: comment.displayName,
    avatarUrl: comment.avatarUrl,
    role: comment.role,
    text: comment.text,
    parentCommentId: null,
    replyCount: 0,
    createdAt: serverTimestamp(),
  });

  // コメント数・未読数をアトミックにインクリメント
  const journalRef = doc(db, 'matchJournals', journalId);
  await updateDoc(journalRef, {
    commentCount: increment(1),
    unreadCommentCount: increment(1),
  });
}

/**
 * コメントを削除し、ジャーナルのcommentCountをデクリメントする
 * 投稿者以外が削除しようとした場合は UNAUTHORIZED エラーをスローする
 */
export async function deleteJournalComment(
  journalId: string,
  commentId: string,
  userId: string
): Promise<void> {
  const commentRef = doc(db, 'matchJournals', journalId, 'comments', commentId);
  const snap = await getDoc(commentRef);

  if (!snap.exists()) {
    throw new Error('NOT_FOUND');
  }
  if (snap.data().userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  await deleteDoc(commentRef);

  // commentCountを0未満にならないよう保護しつつデクリメント
  const journalRef = doc(db, 'matchJournals', journalId);
  const journalSnap = await getDoc(journalRef);
  if (journalSnap.exists()) {
    const current = (journalSnap.data().commentCount as number) ?? 0;
    await updateDoc(journalRef, {
      commentCount: Math.max(0, current - 1),
    });
  }
}

/**
 * コメントをリアルタイム購読する（createdAt昇順）
 */
export function subscribeJournalComments(
  journalId: string,
  callback: (comments: JournalComment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'matchJournals', journalId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: JournalComment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<JournalComment, 'id'>),
      }));
      callback(comments);
    },
    (_error) => {
      // permission denied などのエラー時は空配列を返してUIをブロックしない
      callback([]);
    }
  );
}

/**
 * ジャーナルオーナーが詳細ページを開いたときに未読コメント数をリセットする
 */
export async function markCommentsAsRead(journalId: string): Promise<void> {
  const journalRef = doc(db, 'matchJournals', journalId);
  await updateDoc(journalRef, {
    unreadCommentCount: 0,
  });
}
