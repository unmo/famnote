import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/user';

interface AuthContextValue {
  isAuthenticated: boolean;
  hasGroup: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile, setFirebaseUser, setUserProfile, setLoading, setInitialized, reset } = useAuthStore();

  useEffect(() => {
    // Firebase Auth状態の監視
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        // 未認証の場合はリセット
        reset();
        return;
      }

      setLoading(true);

      // Firestoreのユーザープロフィールをリアルタイム監視
      const userRef = doc(db, 'users', fbUser.uid);
      const unsubscribeProfile = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as User);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
          setInitialized(true);
        },
        () => {
          // エラー時はプロフィールなしとして処理
          setUserProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      );

      return unsubscribeProfile;
    });

    return unsubscribeAuth;
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, reset]);

  const value: AuthContextValue = {
    isAuthenticated: !!firebaseUser,
    hasGroup: !!userProfile?.groupId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
