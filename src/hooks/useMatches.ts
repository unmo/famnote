import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { createMatch, updateMatch, deleteMatch } from '@/lib/firebase/firestore';
import type { Match } from '@/types/match';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// 試合記録一覧取得フック
export function useMatches(userId: string | undefined) {
  return useQuery({
    queryKey: ['matches', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, 'matches'),
        where('userId', '==', userId),
        where('isDraft', '==', false),
        orderBy('date', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ ...(d.data() as Match), id: d.id }));
    },
  });
}

// 試合記録詳細取得フック
export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      if (!matchId) return null;
      const snap = await getDoc(doc(db, 'matches', matchId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as Match), id: snap.id };
    },
  });
}

// 試合記録作成ミューテーション
export function useCreateMatch() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createMatch,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['matches', variables.userId] });
      qc.invalidateQueries({ queryKey: ['streak', variables.userId] });
      toast.success(t('matches.savedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// 試合記録削除ミューテーション
export function useDeleteMatch() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string; userId: string }) =>
      deleteMatch(matchId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] });
      toast.success('試合記録を削除しました');
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// 試合記録更新ミューテーション
export function useUpdateMatch() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      matchId,
      userId,
      data,
    }: {
      matchId: string;
      userId: string;
      data: Partial<Omit<Match, 'id' | 'userId' | 'groupId' | 'createdAt'>>;
    }) => updateMatch(matchId, userId, data),
    onSuccess: (_, { matchId }) => {
      qc.invalidateQueries({ queryKey: ['match', matchId] });
      qc.invalidateQueries({ queryKey: ['matches'] });
      toast.success(t('matches.savedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}
