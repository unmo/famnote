import { useProfileStore } from '@/store/profileStore';
import { useGroupStore } from '@/store/groupStore';
import type { GroupMember } from '@/types/group';

interface UseActiveProfileResult {
  activeProfile: GroupMember | null;
  members: GroupMember[];
  setActiveProfile: (member: GroupMember) => void;
  clearActiveProfile: () => void;
  isManager: boolean; // role === 'owner' のプロフィールを選択中かどうか
}

// 現在選択中のプロフィールを返すフック
export function useActiveProfile(): UseActiveProfileResult {
  const { activeProfile, setActiveProfile, clearActiveProfile } = useProfileStore();
  const members = useGroupStore((s) => s.members);

  return {
    activeProfile,
    members,
    setActiveProfile,
    clearActiveProfile,
    isManager: activeProfile?.role === 'owner',
  };
}
