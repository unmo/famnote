import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pinHighlight,
  unpinHighlightByBulletId,
  fetchUserHighlights,
} from '@/lib/firebase/highlightService';
import type { BulletItem } from '@/types/matchJournal';
import type { Highlight, HighlightSourceType } from '@/types/highlight';
import type { Sport } from '@/types/sport';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

// ハイライト一覧取得
export function useHighlights(
  userId: string | undefined,
  options?: { sport?: Sport; sourceType?: HighlightSourceType }
) {
  return useQuery({
    queryKey: ['highlights', userId, options?.sport, options?.sourceType],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { highlights: [] as Highlight[], lastDoc: null };
      return fetchUserHighlights(userId, { sport: options?.sport, pageSize: 50 });
    },
  });
}

// ピン操作（追加・解除）
export function usePinToggle() {
  const qc = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: ({
      userId,
      groupId,
      sport,
      sourceType,
      sourceId,
      bulletItem,
      sourceDate,
    }: {
      userId: string;
      groupId: string;
      sport: Sport;
      sourceType: HighlightSourceType;
      sourceId: string;
      bulletItem: BulletItem;
      sourceDate: Timestamp;
    }) => pinHighlight(userId, groupId, sport, sourceType, sourceId, bulletItem, sourceDate),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['highlights', userId] });
    },
    onError: () => {
      toast.error('ピンの追加に失敗しました');
    },
  });

  const unpinMutation = useMutation({
    mutationFn: ({ userId, bulletItemId }: { userId: string; bulletItemId: string }) =>
      unpinHighlightByBulletId(userId, bulletItemId),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['highlights', userId] });
    },
    onError: () => {
      toast.error('ピンの解除に失敗しました');
    },
  });

  return { pinMutation, unpinMutation };
}
