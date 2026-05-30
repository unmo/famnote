import { useQuery } from '@tanstack/react-query';
import { fetchAllStats } from '@/lib/firebase/statsService';
import type { StatsData } from '@/types/stats';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * TanStack Query を使って fetchAllStats を呼び出すフック。
 * staleTime: 5分
 * queryKey: ['stats', userId]
 */
export function useStats(userId: string | undefined): UseQueryResult<StatsData> {
  return useQuery({
    queryKey: ['stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error('userId is required');
      return fetchAllStats(userId);
    },
    staleTime: 5 * 60 * 1000,
  });
}
