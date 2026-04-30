import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useProfileStore } from '@/store/profileStore';
import type { User } from '@/types/user';
import type { Group, GroupMember } from '@/types/group';

const ALLOWED_EMAILS = import.meta.env.VITE_ALLOWED_EMAILS
  ? import.meta.env.VITE_ALLOWED_EMAILS.split(',').map((e: string) => e.trim().toLowerCase())
  : [];

function isAllowedUser(email: string | null): boolean {
  if (ALLOWED_EMAILS.length === 0) return true;
  return !!email && ALLOWED_EMAILS.includes(email.toLowerCase());
}

interface AuthContextValue {
  isAuthenticated: boolean;
  hasGroup: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile, setFirebaseUser, setUserProfile, setLoading, setInitialized, reset } = useAuthStore();
  const { setGroup, setMembers, reset: resetGroup } = useGroupStore();
  const { restoreFromSession, clearActiveProfile } = useProfileStore();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Firebase初期化タイムアウト: onAuthStateChangedが一定時間内に呼ばれない場合（CI環境等）
    // 未認証として扱いフォールバックする
    const initTimeoutId = setTimeout(() => {
      reset();
      resetGroup();
      clearActiveProfile();
    }, 8000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(initTimeoutId);

      if (fbUser && !isAllowedUser(fbUser.email)) {
        await signOut(auth);
        setAccessDenied(true);
        reset();
        resetGroup();
        clearActiveProfile();
        return;
      }

      setAccessDenied(false);
      setFirebaseUser(fbUser);

      if (!fbUser) {
        reset();
        resetGroup();
        clearActiveProfile();
        return;
      }

      setLoading(true);

      const userRef = doc(db, 'users', fbUser.uid);
      let unsubscribeMembers: (() => void) | null = null;

      const unsubscribeProfile = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const profile = snap.data() as User;
            setUserProfile(profile);

            if (profile.groupId) {
              const groupRef = doc(db, 'groups', profile.groupId);
              const unsubscribeGroup = onSnapshot(groupRef, (groupSnap) => {
                if (groupSnap.exists()) {
                  setGroup({ id: groupSnap.id, ...groupSnap.data() } as Group);
                }
              });

              // メンバーサブコレクションのリアルタイムリスナー
              if (unsubscribeMembers) unsubscribeMembers();
              const membersRef = collection(db, 'groups', profile.groupId, 'members');
              unsubscribeMembers = onSnapshot(membersRef, (membersSnap) => {
                const members = membersSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as GroupMember));
                setMembers(members);
                restoreFromSession(members);

                // 既存オーナーの displayName 空文字マイグレーション処理
                // onSnapshot 受信時に自分の member ドキュメントの displayName が空の場合、
                // userProfile.displayName で自動補完する（バックグラウンドで実行・エラーは握りつぶす）
                const selfMember = members.find((m) => m.uid === fbUser.uid);
                if (selfMember && selfMember.displayName === '' && profile.displayName) {
                  updateDoc(
                    doc(db, 'groups', profile.groupId!, 'members', fbUser.uid),
                    { displayName: profile.displayName }
                  ).catch((err) => {
                    console.warn('[AuthContext] displayName マイグレーション失敗:', err);
                  });
                }
              });

              // グループリスナーのクリーンアップをメンバーリスナーに統合
              const prevUnsubscribeMembers = unsubscribeMembers;
              unsubscribeMembers = () => {
                prevUnsubscribeMembers();
                unsubscribeGroup();
              };
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
          setInitialized(true);
        },
        () => {
          setUserProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      );

      return () => {
        unsubscribeProfile();
        if (unsubscribeMembers) unsubscribeMembers();
      };
    });

    return () => {
      clearTimeout(initTimeoutId);
      unsubscribeAuth();
    };
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, reset, setGroup, setMembers, resetGroup, restoreFromSession, clearActiveProfile]);

  const value: AuthContextValue = {
    isAuthenticated: !!firebaseUser,
    hasGroup: !!userProfile?.groupId,
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-2xl font-bold text-white mb-2">アクセス権限がありません</p>
          <p className="text-zinc-400">このアカウントはアクセスが許可されていません。</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
