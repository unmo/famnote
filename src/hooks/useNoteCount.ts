import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { fetchNoteCountInfo } from '@/lib/firebase/noteCountService';
import type { NoteCountInfo } from '@/types/noteCount';

/**
 * グループのノート残数情報を取得するフック。
 * グループ未参加の場合は enabled: false として undefined を返す。
 */
export function useNoteCount(): {
  data: NoteCountInfo | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const userProfile = useAuthStore((s) => s.userProfile);
  const group = useGroupStore((s) => s.group);

  const groupId = group?.id ?? userProfile?.groupId ?? null;
  const ownerUserId = userProfile?.uid ?? null;

  return useQuery({
    queryKey: ['noteCount', groupId],
    enabled: !!groupId && !!ownerUserId,
    staleTime: 60 * 1000,
    queryFn: async () => {
      if (!groupId || !ownerUserId) return undefined;
      return fetchNoteCountInfo(groupId, ownerUserId);
    },
  });
}
