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
  increment,
  onSnapshot,
  writeBatch,
  runTransaction,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Group, GroupMember, InviteCode } from '@/types/group';
import type { Note, NoteComment } from '@/types/note';
import type { Match, MatchComment } from '@/types/match';
import type { Goal } from '@/types/goal';
import type { Reaction, ReactionType } from '@/types/reaction';
import { generateInviteCode } from '@/lib/utils/inviteCode';
import { replaceInsightHighlights } from './highlightService';

// ===================== グループ関連 =====================

// グループ作成
// ownerDisplayName と ownerAvatarUrl を渡すことで、オーナーの member ドキュメントに名前が正しく保存される
export async function createGroup(
  ownerUid: string,
  groupName: string,
  iconUrl: string | null,
  ownerDisplayName: string,
  ownerAvatarUrl: string | null
): Promise<{ groupId: string; inviteCode: string }> {
  // 招待コードを生成（重複チェック付き）
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 10) {
    const codeSnap = await getDoc(doc(db, 'inviteCodes', inviteCode));
    if (!codeSnap.exists()) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const batch = writeBatch(db);

  const groupRef = doc(collection(db, 'groups'));
  const groupData: Omit<Group, 'id'> = {
    name: groupName,
    iconUrl,
    inviteCode,
    ownerUid,
    memberCount: 1,
    maxMembers: 10,
    createdAt: serverTimestamp() as Group['createdAt'],
    updatedAt: serverTimestamp() as Group['updatedAt'],
  };
  batch.set(groupRef, { ...groupData, id: groupRef.id });

  // オーナーをメンバーとして追加（displayName・avatarUrl を引数から設定）
  const memberRef = doc(db, 'groups', groupRef.id, 'members', ownerUid);
  const memberData: Omit<GroupMember, 'uid'> & { uid: string } = {
    uid: ownerUid,
    displayName: ownerDisplayName,
    avatarUrl: ownerAvatarUrl,
    sports: [],
    joinedAt: serverTimestamp() as GroupMember['joinedAt'],
    role: 'owner',
    lastActiveAt: serverTimestamp() as GroupMember['lastActiveAt'],
  };
  batch.set(memberRef, memberData);

  // 招待コードドキュメント作成
  const codeRef = doc(db, 'inviteCodes', inviteCode);
  const codeData: InviteCode = {
    code: inviteCode,
    groupId: groupRef.id,
    createdAt: serverTimestamp() as InviteCode['createdAt'],
    expiresAt: null,
  };
  batch.set(codeRef, codeData);

  // ユーザーのgroupIdを更新
  const userRef = doc(db, 'users', ownerUid);
  batch.update(userRef, { groupId: groupRef.id, updatedAt: serverTimestamp() });

  await batch.commit();

  return { groupId: groupRef.id, inviteCode };
}

// グループ参加
// displayName と avatarUrl を渡すことで、参加時から名前が正しく保存される
export async function joinGroup(
  uid: string,
  inviteCode: string,
  displayName: string,
  avatarUrl: string | null
): Promise<{ groupId: string; groupName: string }> {
  const codeSnap = await getDoc(doc(db, 'inviteCodes', inviteCode.toUpperCase()));
  if (!codeSnap.exists()) {
    throw new Error('INVALID_CODE');
  }

  const codeData = codeSnap.data() as InviteCode;
  const groupSnap = await getDoc(doc(db, 'groups', codeData.groupId));
  if (!groupSnap.exists()) {
    throw new Error('GROUP_NOT_FOUND');
  }

  const group = groupSnap.data() as Group;
  if (group.memberCount >= group.maxMembers) {
    throw new Error('GROUP_FULL');
  }

  // トランザクションで安全に参加処理
  await runTransaction(db, async (tx) => {
    const groupRef = doc(db, 'groups', codeData.groupId);
    const memberRef = doc(db, 'groups', codeData.groupId, 'members', uid);
    const userRef = doc(db, 'users', uid);

    const memberData: Omit<GroupMember, 'uid'> & { uid: string } = {
      uid,
      displayName,
      avatarUrl,
      sports: [],
      joinedAt: serverTimestamp() as GroupMember['joinedAt'],
      role: 'member',
      lastActiveAt: serverTimestamp() as GroupMember['lastActiveAt'],
    };

    tx.set(memberRef, memberData);
    tx.update(groupRef, {
      memberCount: group.memberCount + 1,
      updatedAt: serverTimestamp(),
    });
    tx.update(userRef, { groupId: codeData.groupId, updatedAt: serverTimestamp() });
  });

  return { groupId: codeData.groupId, groupName: group.name };
}

// グループメンバー一覧取得
export function subscribeGroupMembers(
  groupId: string,
  callback: (members: GroupMember[]) => void
): Unsubscribe {
  const q = collection(db, 'groups', groupId, 'members');
  return onSnapshot(q, (snap) => {
    const members = snap.docs.map((d) => d.data() as GroupMember);
    callback(members);
  });
}

// ===================== ノート関連 =====================

// ノート作成
export async function createNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'reactionCounts' | 'commentCount'>
): Promise<{ noteId: string }> {
  const ref = await addDoc(collection(db, 'notes'), {
    ...data,
    insights: data.insights ?? [],
    reactionCounts: { applause: 0, fire: 0, star: 0, muscle: 0 },
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if ((data.insights ?? []).length > 0) {
    await replaceInsightHighlights(
      data.userId, data.groupId ?? '', data.sport,
      'note_insight', ref.id, data.insights ?? [], data.date
    );
  }

  return { noteId: ref.id };
}

// ノート更新
export async function updateNote(
  noteId: string,
  userId: string,
  data: Partial<Omit<Note, 'id' | 'userId' | 'groupId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, 'notes', noteId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ノート削除
export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const ref = doc(db, 'notes', noteId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  await deleteDoc(ref);
}

// ノート一覧（自分のノート）
export async function fetchUserNotes(
  userId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ notes: Note[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('isDraft', '==', false),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const notes = snap.docs.map((d) => ({ ...(d.data() as Note), id: d.id }));
  const lastDocResult = snap.docs[snap.docs.length - 1] ?? null;
  return { notes, lastDoc: lastDocResult };
}

// グループタイムライン（公開ノート・試合記録）
export async function fetchGroupTimeline(
  groupId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 15
): Promise<{ notes: Note[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    collection(db, 'notes'),
    where('groupId', '==', groupId),
    where('isPublic', '==', true),
    where('isDraft', '==', false),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const notes = snap.docs.map((d) => ({ ...(d.data() as Note), id: d.id }));
  const lastDocResult = snap.docs[snap.docs.length - 1] ?? null;
  return { notes, lastDoc: lastDocResult };
}

// コメント追加
export async function addComment(
  targetType: 'notes' | 'matches',
  targetId: string,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  text: string
): Promise<void> {
  // XSS対策: テキストは最大200文字に制限
  const sanitizedText = text.trim().slice(0, 200);
  if (!sanitizedText) throw new Error('EMPTY_COMMENT');

  const commentData: Omit<NoteComment | MatchComment, 'id'> = {
    [`${targetType === 'notes' ? 'note' : 'match'}Id`]: targetId,
    userId,
    displayName,
    avatarUrl,
    text: sanitizedText,
    createdAt: serverTimestamp() as NoteComment['createdAt'],
  } as Omit<NoteComment, 'id'>;

  const commentRef = collection(db, targetType, targetId, 'comments');
  await addDoc(commentRef, commentData);

  // commentCountをインクリメント
  await updateDoc(doc(db, targetType, targetId), {
    commentCount: ((await getDoc(doc(db, targetType, targetId))).data()?.commentCount ?? 0) + 1,
  });
}

// コメント購読
export function subscribeComments(
  targetType: 'notes' | 'matches',
  targetId: string,
  callback: (comments: (NoteComment | MatchComment)[]) => void
): Unsubscribe {
  const q = query(
    collection(db, targetType, targetId, 'comments'),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({
      ...(d.data() as NoteComment | MatchComment),
      id: d.id,
    }));
    callback(comments);
  });
}

// ===================== 試合記録関連 =====================

// 試合記録作成
export async function createMatch(
  data: Omit<Match, 'id' | 'createdAt' | 'updatedAt' | 'reactionCounts' | 'commentCount'>
): Promise<{ matchId: string }> {
  const ref = await addDoc(collection(db, 'matches'), {
    ...data,
    reactionCounts: { applause: 0, fire: 0, star: 0, muscle: 0 },
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { matchId: ref.id };
}

// 試合記録更新
export async function updateMatch(
  matchId: string,
  userId: string,
  data: Partial<Omit<Match, 'id' | 'userId' | 'groupId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, 'matches', matchId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// 試合記録削除
export async function deleteMatch(matchId: string, userId: string): Promise<void> {
  const ref = doc(db, 'matches', matchId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  await deleteDoc(ref);
}

// ===================== リアクション関連 =====================

// リアクション追加/削除（トグル）
export async function toggleReaction(
  targetType: 'note' | 'match',
  targetId: string,
  userId: string,
  groupId: string,
  reactionType: ReactionType
): Promise<{ added: boolean }> {
  const reactionsQuery = query(
    collection(db, 'reactions'),
    where('targetId', '==', targetId),
    where('userId', '==', userId),
    where('reactionType', '==', reactionType)
  );
  const existing = await getDocs(reactionsQuery);

  const collectionPath = targetType === 'note' ? 'notes' : 'matches';
  const targetRef = doc(db, collectionPath, targetId);

  if (!existing.empty) {
    // リアクション削除
    await deleteDoc(existing.docs[0].ref);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      const counts = targetSnap.data().reactionCounts as Record<ReactionType, number>;
      await updateDoc(targetRef, {
        [`reactionCounts.${reactionType}`]: Math.max(0, (counts[reactionType] ?? 1) - 1),
      });
    }
    return { added: false };
  } else {
    // リアクション追加
    const reactionData: Omit<Reaction, 'id'> = {
      targetType,
      targetId,
      userId,
      groupId,
      reactionType,
      createdAt: serverTimestamp() as Reaction['createdAt'],
    };
    await addDoc(collection(db, 'reactions'), reactionData);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      const counts = targetSnap.data().reactionCounts as Record<ReactionType, number>;
      await updateDoc(targetRef, {
        [`reactionCounts.${reactionType}`]: (counts[reactionType] ?? 0) + 1,
      });
    }
    return { added: true };
  }
}

// ユーザーのリアクション一覧取得
export async function getUserReactions(
  targetId: string,
  userId: string
): Promise<ReactionType[]> {
  const q = query(
    collection(db, 'reactions'),
    where('targetId', '==', targetId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().reactionType as ReactionType);
}

// ===================== 目標関連 =====================

// 目標作成
export async function createGoal(
  data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue' | 'status' | 'completedAt'>
): Promise<{ goalId: string }> {
  const ref = await addDoc(collection(db, 'goals'), {
    ...data,
    currentValue: 0,
    status: 'active',
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { goalId: ref.id };
}

// 目標更新
export async function updateGoal(
  goalId: string,
  userId: string,
  data: Partial<Omit<Goal, 'id' | 'userId' | 'groupId' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, 'goals', goalId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// 目標一覧取得
export async function fetchUserGoals(userId: string): Promise<Goal[]> {
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId),
    orderBy('deadline', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Goal), id: d.id }));
}

// ===================== プロフィール管理関連 =====================

// メンバーの表示名を更新する
// isChildProfile が false の場合は users/{memberUid} も同時に更新する（オーナー・通常メンバー）
export async function updateMemberDisplayName(
  groupId: string,
  memberUid: string,
  displayName: string,
  isChildProfile: boolean
): Promise<void> {
  const memberRef = doc(db, 'groups', groupId, 'members', memberUid);
  await updateDoc(memberRef, { displayName });

  // 子プロフィールは users ドキュメントを持たないため更新しない
  if (!isChildProfile) {
    const userRef = doc(db, 'users', memberUid);
    await updateDoc(userRef, { displayName });
  }
}

// 子プロフィールを追加する（Firebase Auth アカウントなしの仮想プロフィール）
// uid は 'child_' + ランダム文字列で生成し、通常の Auth UID と区別できるようにする
export async function addChildProfile(
  groupId: string,
  displayName: string
): Promise<string> {
  // crypto.randomUUID() を使って一意な ID を生成し、child_ プレフィックスを付ける
  const childUid = `child_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;

  const memberRef = doc(db, 'groups', groupId, 'members', childUid);
  const memberData: GroupMember & { isChildProfile: true } = {
    uid: childUid,
    displayName,
    avatarUrl: null,
    sports: [],
    joinedAt: serverTimestamp() as GroupMember['joinedAt'],
    role: 'member',
    lastActiveAt: null,
    isChildProfile: true,
  };

  const groupRef = doc(db, 'groups', groupId);

  const batch = writeBatch(db);
  batch.set(memberRef, memberData);
  // memberCount をインクリメント
  batch.update(groupRef, { memberCount: increment(1) });
  await batch.commit();

  return childUid;
}

// 子プロフィールを削除する
// グループの memberCount もデクリメントする
export async function deleteChildProfile(
  groupId: string,
  memberUid: string
): Promise<void> {
  const memberRef = doc(db, 'groups', groupId, 'members', memberUid);
  const groupRef = doc(db, 'groups', groupId);

  const batch = writeBatch(db);
  batch.delete(memberRef);
  // memberCount をデクリメント（最小値は 1 を保証するためクライアント側でも確認する）
  batch.update(groupRef, { memberCount: increment(-1) });
  await batch.commit();
}
