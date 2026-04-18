import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoal, updateGoal, fetchUserGoals } from '@/lib/firebase/firestore';
import type { Goal } from '@/types/goal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// 目標一覧取得フック
export function useGoals(userId: string | undefined) {
  return useQuery({
    queryKey: ['goals', userId],
    enabled: !!userId,
    queryFn: () => (userId ? fetchUserGoals(userId) : []),
  });
}

// 目標作成ミューテーション
export function useCreateGoal() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['goals', variables.userId] });
      toast.success(t('goals.savedSuccess'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}

// 目標更新ミューテーション（進捗・達成状態変更）
export function useUpdateGoal() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      goalId,
      userId,
      data,
    }: {
      goalId: string;
      userId: string;
      data: Partial<Omit<Goal, 'id' | 'userId' | 'groupId' | 'createdAt'>>;
    }) => updateGoal(goalId, userId, data),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['goals', userId] });
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });
}
