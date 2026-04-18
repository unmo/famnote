import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/types/user';

// 認証状態の管理
interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,

  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  reset: () =>
    set({
      firebaseUser: null,
      userProfile: null,
      isLoading: false,
      isInitialized: true,
    }),
}));
