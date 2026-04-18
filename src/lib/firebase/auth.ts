import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { Sport } from '@/types/sport';
import type { User } from '@/types/user';

const googleProvider = new GoogleAuthProvider();

// Googleログイン
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(result.user);
  return result.user;
}

// メール/パスワードログイン
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// 新規アカウント作成
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(result.user.uid, displayName, email, null);
  return result.user;
}

// ログアウト
export async function logout(): Promise<void> {
  await signOut(auth);
}

// パスワードリセットメール送信
export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ユーザープロフィール作成（初回ログイン時）
export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string,
  avatarUrl: string | null
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData: Omit<User, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid,
    displayName,
    email,
    avatarUrl,
    sports: [],
    groupId: null,
    themeId: 'shimizu',
    subscriptionStatus: 'free',
    stripeCustomerId: null,
    totalNotes: 0,
    totalMatches: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastRecordedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(userRef, userData);
}

// Google認証後にユーザードキュメントが存在しなければ作成する
async function ensureUserDocument(firebaseUser: FirebaseUser): Promise<void> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await createUserProfile(
      firebaseUser.uid,
      firebaseUser.displayName ?? 'ユーザー',
      firebaseUser.email ?? '',
      firebaseUser.photoURL
    );
  }
}

// プロフィール更新
export async function updateUserProfile(
  uid: string,
  data: {
    displayName?: string;
    avatarUrl?: string | null;
    sports?: Sport[];
    themeId?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
}

// ユーザードキュメント取得
export async function getUserProfile(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as User;
}
