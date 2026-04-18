import { create } from 'zustand';
import type { Group, GroupMember } from '@/types/group';

// グループ状態の管理
interface GroupState {
  group: Group | null;
  members: GroupMember[];

  setGroup: (group: Group | null) => void;
  setMembers: (members: GroupMember[]) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  group: null,
  members: [],

  setGroup: (group) => set({ group }),
  setMembers: (members) => set({ members }),
  reset: () => set({ group: null, members: [] }),
}));
