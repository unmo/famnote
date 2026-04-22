import { create } from 'zustand';
import type { GroupMember } from '@/types/group';

const SESSION_KEY = 'famnote_active_profile_uid';

interface ProfileState {
  activeProfile: GroupMember | null;
  setActiveProfile: (member: GroupMember) => void;
  clearActiveProfile: () => void;
  restoreFromSession: (members: GroupMember[]) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: null,

  setActiveProfile: (member) => {
    try {
      sessionStorage.setItem(SESSION_KEY, member.uid);
    } catch {
      // sessionStorage が使えない環境では無視
    }
    set({ activeProfile: member });
  },

  clearActiveProfile: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    set({ activeProfile: null });
  },

  restoreFromSession: (members) => {
    try {
      const uid = sessionStorage.getItem(SESSION_KEY);
      if (uid) {
        const found = members.find((m) => m.uid === uid);
        if (found) {
          set({ activeProfile: found });
          return;
        }
      }
    } catch {
      // ignore
    }
    set({ activeProfile: null });
  },
}));
