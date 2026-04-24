import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useProfileStore } from '@/store/profileStore';
import type { User } from '@/types/user';
import type { Group, GroupMember } from '@/types/group';

interface AuthContextValue {
  isAuthenticated: boolean;
  hasGroup: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, userProfile, setFirebaseUser, setUserProfile, setLoading, setInitialized, reset } = useAuthStore();
  const { setGroup, setMembers, reset: resetGroup } = useGroupStore();
  const { restoreFromSession, clearActiveProfile } = useProfileStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
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

    return unsubscribeAuth;
  }, [setFirebaseUser, setUserProfile, setLoading, setInitialized, reset, setGroup, setMembers, resetGroup, restoreFromSession, clearActiveProfile]);

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
